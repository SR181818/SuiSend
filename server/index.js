const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Create PostgreSQL pool connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

app.use(cors());
app.use(express.json());

// --- User Endpoints ---

// GET /api/users/:id - Retrieve user details
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { wallet_address } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO users (wallet_address) VALUES ($1) RETURNING *',
      [wallet_address]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Wallet address already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// --- NFC Card Endpoints ---

// GET /api/nfc/cards/:cardId - Retrieve card data
app.get('/api/nfc/cards/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const result = await pool.query('SELECT * FROM cards WHERE id = $1', [cardId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/nfc/cards - Create new card
app.post('/api/nfc/cards', async (req, res) => {
  try {
    const { user_id, card_data } = req.body;
    
    if (!user_id || !card_data) {
      return res.status(400).json({ error: 'User ID and card data are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO cards (user_id, card_data) VALUES ($1, $2) RETURNING *',
      [user_id, card_data]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/nfc/cards/:cardId - Update card data
app.put('/api/nfc/cards/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    const { card_data } = req.body;
    
    if (!card_data) {
      return res.status(400).json({ error: 'Card data is required' });
    }
    
    const result = await pool.query(
      'UPDATE cards SET card_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [card_data, cardId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Transaction Endpoints ---

// GET /api/transactions/:userId - Get user transactions
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/transactions - Create new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { user_id, transaction_data } = req.body;
    
    if (!user_id || !transaction_data) {
      return res.status(400).json({ error: 'User ID and transaction data are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO transactions (user_id, transaction_data) VALUES ($1, $2) RETURNING *',
      [user_id, transaction_data]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Health Check ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});