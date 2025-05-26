const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// JWT verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ===========================================
// AUTHENTICATION ENDPOINTS
// ===========================================

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, walletAddress } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, wallet_address) VALUES ($1, $2, $3, $4) RETURNING id, username, email, wallet_address',
      [username, email, passwordHash, walletAddress]
    );

    const user = result.rows[0];

    // Create default user settings
    await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, username, email, password_hash, wallet_address FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet_address: user.wallet_address
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// USER ENDPOINTS
// ===========================================

// Get current user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.wallet_address, u.created_at,
              us.offline_mode, us.network, us.notification_enabled, us.biometric_enabled, us.auto_sync
       FROM users u
       LEFT JOIN user_settings us ON u.id = us.user_id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
app.put('/api/users/settings', authenticateToken, async (req, res) => {
  try {
    const { offline_mode, network, notification_enabled, biometric_enabled, auto_sync } = req.body;

    const result = await pool.query(
      `UPDATE user_settings 
       SET offline_mode = COALESCE($1, offline_mode),
           network = COALESCE($2, network),
           notification_enabled = COALESCE($3, notification_enabled),
           biometric_enabled = COALESCE($4, biometric_enabled),
           auto_sync = COALESCE($5, auto_sync),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING *`,
      [offline_mode, network, notification_enabled, biometric_enabled, auto_sync, req.user.userId]
    );

    res.json({
      message: 'Settings updated successfully',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// CARD ENDPOINTS
// ===========================================

// Get all cards for authenticated user
app.get('/api/cards', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, 
              COUNT(uo.id) as unspent_count,
              COUNT(pt.id) as pending_count
       FROM cards c
       LEFT JOIN unspent_objects uo ON c.id = uo.card_id AND uo.is_locked = false
       LEFT JOIN pending_transactions pt ON c.id = pt.card_id
       WHERE c.user_id = $1 AND c.is_active = true
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific card with details
app.get('/api/cards/:id', authenticateToken, async (req, res) => {
  try {
    const cardId = req.params.id;

    // Get card info
    const cardResult = await pool.query(
      'SELECT * FROM cards WHERE id = $1 AND user_id = $2 AND is_active = true',
      [cardId, req.user.userId]
    );

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const card = cardResult.rows[0];

    // Get unspent objects
    const unspentResult = await pool.query(
      'SELECT * FROM unspent_objects WHERE card_id = $1 ORDER BY created_at DESC',
      [cardId]
    );

    // Get pending transactions
    const pendingResult = await pool.query(
      'SELECT * FROM pending_transactions WHERE card_id = $1 ORDER BY created_at DESC',
      [cardId]
    );

    res.json({
      ...card,
      unspent_objects: unspentResult.rows,
      pending_transactions: pendingResult.rows
    });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or sync card
app.post('/api/cards', authenticateToken, async (req, res) => {
  try {
    const {
      external_id,
      name,
      type = 'Personal',
      color = 'blue',
      balance = 0,
      address,
      unspent_objects = [],
      pending_transactions = []
    } = req.body;

    if (!external_id || !name || !address) {
      return res.status(400).json({ error: 'Missing required fields: external_id, name, address' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if card already exists
      const existingCard = await client.query(
        'SELECT id FROM cards WHERE external_id = $1 AND user_id = $2',
        [external_id, req.user.userId]
      );

      let cardId;

      if (existingCard.rows.length > 0) {
        // Update existing card
        cardId = existingCard.rows[0].id;
        await client.query(
          `UPDATE cards 
           SET name = $1, type = $2, color = $3, balance = $4, address = $5, last_synced = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [name, type, color, balance, address, cardId]
        );
      } else {
        // Create new card
        const cardResult = await client.query(
          `INSERT INTO cards (user_id, external_id, name, type, color, balance, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [req.user.userId, external_id, name, type, color, balance, address]
        );
        cardId = cardResult.rows[0].id;
      }

      // Clear existing unspent objects and pending transactions
      await client.query('DELETE FROM unspent_objects WHERE card_id = $1', [cardId]);
      await client.query('DELETE FROM pending_transactions WHERE card_id = $1', [cardId]);

      // Insert new unspent objects
      for (const obj of unspent_objects) {
        await client.query(
          `INSERT INTO unspent_objects (card_id, object_id, amount, version, is_locked)
           VALUES ($1, $2, $3, $4, $5)`,
          [cardId, obj.object_id, obj.amount, obj.version, obj.is_locked || false]
        );
      }

      // Insert new pending transactions
      for (const tx of pending_transactions) {
        await client.query(
          `INSERT INTO pending_transactions (card_id, to_address, amount, note)
           VALUES ($1, $2, $3, $4)`,
          [cardId, tx.to_address, tx.amount, tx.note]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Card synced successfully',
        card_id: cardId
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Sync card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// TRANSACTION ENDPOINTS
// ===========================================

// Get transactions for user
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, card_id } = req.query;

    let query = `
      SELECT t.*, c.name as card_name
      FROM transactions t
      LEFT JOIN cards c ON t.card_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [req.user.userId];

    if (card_id) {
      query += ' AND t.card_id = $2';
      params.push(card_id);
    }

    query += ' ORDER BY t.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      card_id,
      transaction_type,
      amount,
      from_address,
      to_address,
      transaction_hash,
      status = 'pending',
      note,
      gas_fee = 0
    } = req.body;

    if (!transaction_type || !amount) {
      return res.status(400).json({ error: 'Missing required fields: transaction_type, amount' });
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, card_id, transaction_type, amount, from_address, to_address, transaction_hash, status, note, gas_fee)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user.userId, card_id, transaction_type, amount, from_address, to_address, transaction_hash, status, note, gas_fee]
    );

    res.status(201).json({
      message: 'Transaction recorded successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction status
app.put('/api/transactions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transaction_hash, block_number } = req.body;

    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1, 
           transaction_hash = COALESCE($2, transaction_hash),
           block_number = COALESCE($3, block_number),
           confirmed_at = CASE WHEN $1 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [status, transaction_hash, block_number, id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction status updated successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================
// UTILITY ENDPOINTS
// ===========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'Database connection healthy' });
  } catch (error) {
    res.status(500).json({ status: 'Database connection failed', error: error.message });
  }
});

// Get wallet stats
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
         COUNT(DISTINCT c.id) as total_cards,
         COUNT(DISTINCT t.id) as total_transactions,
         COALESCE(SUM(c.balance), 0) as total_balance,
         COUNT(DISTINCT CASE WHEN t.transaction_type = 'pending' THEN t.id END) as pending_transactions
       FROM cards c
       LEFT JOIN transactions t ON c.user_id = t.user_id
       WHERE c.user_id = $1 AND c.is_active = true`,
      [req.user.userId]
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 NFC Crypto Wallet Backend server is listening on port ${port}`);
  console.log(`📊 Health endpoint: http://localhost:${port}/api/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});