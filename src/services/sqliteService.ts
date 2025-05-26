import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Card, Transaction, UnspentObject, PendingTransaction } from '../types/wallet';

// Helper function to open the database correctly for all platforms
const openDatabase = (dbName: string): SQLite.WebSQLDatabase => {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
      exec: () => {},
    } as SQLite.WebSQLDatabase;
  }

  return SQLite.openDatabase(dbName);
};

// Main SQLite service class
class SQLiteService {
  private db: SQLite.WebSQLDatabase;

  constructor() {
    this.db = openDatabase('crypto_wallet.db');
    this.initDatabase();
  }

  // Initialize the database
  private initDatabase(): void {
    this.db.transaction(tx => {
      // Cards table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS cards (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          color TEXT NOT NULL,
          balance REAL NOT NULL,
          address TEXT NOT NULL,
          lastSynced TEXT NOT NULL
        );`
      );
      
      // Unspent Objects table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS unspent_objects (
          id TEXT PRIMARY KEY,
          cardId TEXT NOT NULL,
          amount REAL NOT NULL,
          version INTEGER,
          locked INTEGER DEFAULT 0,
          FOREIGN KEY (cardId) REFERENCES cards (id) ON DELETE CASCADE
        );`
      );
      
      // Pending Transactions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS pending_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cardId TEXT NOT NULL,
          to_address TEXT NOT NULL,
          amount REAL NOT NULL,
          timestamp INTEGER NOT NULL,
          FOREIGN KEY (cardId) REFERENCES cards (id) ON DELETE CASCADE
        );`
      );
      
      // Transactions table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          from_address TEXT,
          to_address TEXT,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL,
          note TEXT,
          cardId TEXT,
          transactionHash TEXT,
          FOREIGN KEY (cardId) REFERENCES cards (id) ON DELETE SET NULL
        );`
      );
      
      // Profile table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          name TEXT NOT NULL,
          walletAddress TEXT NOT NULL,
          avatar TEXT
        );`
      );
      
      // Settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          offlineMode INTEGER DEFAULT 0,
          network TEXT DEFAULT 'testnet'
        );`
      );
    }, 
    error => {
      console.error('Error creating tables', error);
    });
  }

  // Export the database for backup
  public async exportDatabase(): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/crypto_wallet.db`;
      const exists = await FileSystem.getInfoAsync(dbPath);
      
      if (exists.exists) {
        const destPath = `${FileSystem.documentDirectory}crypto_wallet_backup.db`;
        await FileSystem.copyAsync({
          from: dbPath,
          to: destPath
        });
        return destPath;
      }
      return null;
    } catch (error) {
      console.error('Error exporting database:', error);
      return null;
    }
  }

  // Import a database backup
  public async importDatabase(backupPath: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      const dbPath = `${FileSystem.documentDirectory}SQLite/crypto_wallet.db`;
      await FileSystem.copyAsync({
        from: backupPath,
        to: dbPath
      });
      return true;
    } catch (error) {
      console.error('Error importing database:', error);
      return false;
    }
  }

  // =================== Card Operations ===================
  
  // Get all cards
  public getCards(): Promise<Card[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards',
          [],
          async (_, { rows }) => {
            const loadedCards: Card[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const card = rows.item(i);
              
              // Load unspent objects for this card
              const unspentObjects = await this.getUnspentObjects(card.id);
              
              // Load pending transactions for this card
              const pendingTransactions = await this.getPendingTransactions(card.id);
              
              loadedCards.push({
                id: card.id,
                name: card.name,
                type: card.type,
                color: card.color,
                balance: card.balance,
                address: card.address,
                lastSynced: card.lastSynced,
                unspentObjects,
                pendingTransactions
              });
            }
            
            resolve(loadedCards);
          },
          (_, error) => {
            console.error('Error loading cards:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Get a card by ID
  public getCardById(id: string): Promise<Card | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards WHERE id = ?',
          [id],
          async (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }
            
            const card = rows.item(0);
            
            // Load unspent objects and pending transactions
            const unspentObjects = await this.getUnspentObjects(card.id);
            const pendingTransactions = await this.getPendingTransactions(card.id);
            
            resolve({
              id: card.id,
              name: card.name,
              type: card.type,
              color: card.color,
              balance: card.balance,
              address: card.address,
              lastSynced: card.lastSynced,
              unspentObjects,
              pendingTransactions
            });
          },
          (_, error) => {
            console.error('Error getting card:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Get a card by address
  public getCardByAddress(address: string): Promise<Card | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards WHERE address = ?',
          [address],
          async (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }
            
            const card = rows.item(0);
            
            // Load unspent objects and pending transactions
            const unspentObjects = await this.getUnspentObjects(card.id);
            const pendingTransactions = await this.getPendingTransactions(card.id);
            
            resolve({
              id: card.id,
              name: card.name,
              type: card.type,
              color: card.color,
              balance: card.balance,
              address: card.address,
              lastSynced: card.lastSynced,
              unspentObjects,
              pendingTransactions
            });
          },
          (_, error) => {
            console.error('Error getting card by address:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Add a new card
  public addCard(card: Card): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO cards (id, name, type, color, balance, address, lastSynced) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            card.id,
            card.name,
            card.type,
            card.color,
            card.balance,
            card.address,
            card.lastSynced
          ],
          async (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              // Add unspent objects
              for (const obj of card.unspentObjects) {
                await this.addUnspentObject(obj.id, card.id, obj.amount, obj.version, obj.locked);
              }
              
              // Add pending transactions
              for (const tx of card.pendingTransactions) {
                await this.addPendingTransaction(card.id, tx.to, tx.amount, tx.timestamp);
              }
              
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (_, error) => {
            console.error('Error adding card:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Update a card
  public updateCard(card: Card): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `UPDATE cards SET name = ?, type = ?, color = ?, balance = ?, address = ?, lastSynced = ? 
           WHERE id = ?`,
          [
            card.name,
            card.type,
            card.color,
            card.balance,
            card.address,
            card.lastSynced,
            card.id
          ],
          async (_, { rowsAffected }) => {
            if (rowsAffected > 0) {
              // Update unspent objects (delete and re-add)
              await this.deleteUnspentObjects(card.id);
              for (const obj of card.unspentObjects) {
                await this.addUnspentObject(obj.id, card.id, obj.amount, obj.version, obj.locked);
              }
              
              // Update pending transactions (delete and re-add)
              await this.deletePendingTransactions(card.id);
              for (const tx of card.pendingTransactions) {
                await this.addPendingTransaction(card.id, tx.to, tx.amount, tx.timestamp);
              }
              
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (_, error) => {
            console.error('Error updating card:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Delete a card
  public deleteCard(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM cards WHERE id = ?',
          [id],
          (_, { rowsAffected }) => {
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error deleting card:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // =================== Unspent Object Operations ===================
  
  // Get unspent objects for a card
  public getUnspentObjects(cardId: string): Promise<UnspentObject[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM unspent_objects WHERE cardId = ?',
          [cardId],
          (_, { rows }) => {
            const objects: UnspentObject[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const obj = rows.item(i);
              objects.push({
                id: obj.id,
                amount: obj.amount,
                version: obj.version,
                locked: obj.locked === 1
              });
            }
            
            resolve(objects);
          },
          (_, error) => {
            console.error('Error getting unspent objects:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Add an unspent object
  private addUnspentObject(
    id: string, 
    cardId: string, 
    amount: number, 
    version?: number, 
    locked: boolean = false
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO unspent_objects (id, cardId, amount, version, locked) 
           VALUES (?, ?, ?, ?, ?)`,
          [id, cardId, amount, version, locked ? 1 : 0],
          (_, { rowsAffected }) => {
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error adding unspent object:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Delete all unspent objects for a card
  private deleteUnspentObjects(cardId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM unspent_objects WHERE cardId = ?',
          [cardId],
          (_, { rowsAffected }) => {
            resolve(true);
          },
          (_, error) => {
            console.error('Error deleting unspent objects:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // =================== Pending Transaction Operations ===================
  
  // Get pending transactions for a card
  public getPendingTransactions(cardId: string): Promise<PendingTransaction[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM pending_transactions WHERE cardId = ?',
          [cardId],
          (_, { rows }) => {
            const pendingTxs: PendingTransaction[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const tx = rows.item(i);
              pendingTxs.push({
                to: tx.to_address,
                amount: tx.amount,
                timestamp: tx.timestamp
              });
            }
            
            resolve(pendingTxs);
          },
          (_, error) => {
            console.error('Error getting pending transactions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Add a pending transaction
  private addPendingTransaction(
    cardId: string, 
    to: string, 
    amount: number, 
    timestamp: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO pending_transactions (cardId, to_address, amount, timestamp) 
           VALUES (?, ?, ?, ?)`,
          [cardId, to, amount, timestamp],
          (_, { rowsAffected }) => {
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error adding pending transaction:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Delete all pending transactions for a card
  private deletePendingTransactions(cardId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM pending_transactions WHERE cardId = ?',
          [cardId],
          (_, { rowsAffected }) => {
            resolve(true);
          },
          (_, error) => {
            console.error('Error deleting pending transactions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // =================== Transaction Operations ===================
  
  // Get all transactions
  public getTransactions(limit?: number): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        const query = limit 
          ? 'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?'
          : 'SELECT * FROM transactions ORDER BY timestamp DESC';
        
        const params = limit ? [limit] : [];
        
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const transactions: Transaction[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const tx = rows.item(i);
              transactions.push({
                id: tx.id,
                type: tx.type as 'sent' | 'received' | 'pending',
                amount: tx.amount,
                from: tx.from_address,
                to: tx.to_address,
                timestamp: tx.timestamp,
                status: tx.status as 'pending' | 'confirmed' | 'failed',
                note: tx.note,
                cardId: tx.cardId,
                transactionHash: tx.transactionHash
              });
            }
            
            resolve(transactions);
          },
          (_, error) => {
            console.error('Error getting transactions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Get transactions for a card
  public getCardTransactions(cardId: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM transactions WHERE cardId = ? ORDER BY timestamp DESC',
          [cardId],
          (_, { rows }) => {
            const transactions: Transaction[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const tx = rows.item(i);
              transactions.push({
                id: tx.id,
                type: tx.type as 'sent' | 'received' | 'pending',
                amount: tx.amount,
                from: tx.from_address,
                to: tx.to_address,
                timestamp: tx.timestamp,
                status: tx.status as 'pending' | 'confirmed' | 'failed',
                note: tx.note,
                cardId: tx.cardId,
                transactionHash: tx.transactionHash
              });
            }
            
            resolve(transactions);
          },
          (_, error) => {
            console.error('Error getting card transactions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Add a transaction
  public addTransaction(transaction: Transaction): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO transactions (
            id, type, amount, from_address, to_address, timestamp, status, note, cardId, transactionHash
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transaction.id,
            transaction.type,
            transaction.amount,
            transaction.from,
            transaction.to,
            transaction.timestamp,
            transaction.status,
            transaction.note,
            transaction.cardId,
            transaction.transactionHash
          ],
          (_, { rowsAffected }) => {
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error adding transaction:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Update transaction status
  public updateTransactionStatus(id: string, status: string, transactionHash?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        const query = transactionHash
          ? 'UPDATE transactions SET status = ?, transactionHash = ? WHERE id = ?'
          : 'UPDATE transactions SET status = ? WHERE id = ?';
        
        const params = transactionHash
          ? [status, transactionHash, id]
          : [status, id];
        
        tx.executeSql(
          query,
          params,
          (_, { rowsAffected }) => {
            resolve(rowsAffected > 0);
          },
          (_, error) => {
            console.error('Error updating transaction status:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // =================== Profile Operations ===================
  
  // Get profile
  public getProfile(): Promise<{ name: string; walletAddress: string; avatar?: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM profile LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }
            
            const profile = rows.item(0);
            resolve({
              name: profile.name,
              walletAddress: profile.walletAddress,
              avatar: profile.avatar
            });
          },
          (_, error) => {
            console.error('Error getting profile:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Save profile
  public saveProfile(name: string, walletAddress: string, avatar?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM profile', // Clear existing profile
          [],
          (_, __) => {
            tx.executeSql(
              'INSERT INTO profile (id, name, walletAddress, avatar) VALUES (1, ?, ?, ?)',
              [name, walletAddress, avatar],
              (_, { rowsAffected }) => {
                resolve(rowsAffected > 0);
              },
              (_, error) => {
                console.error('Error saving profile:', error);
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            console.error('Error clearing profile:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // =================== Settings Operations ===================
  
  // Get settings
  public getSettings(): Promise<{ offlineMode: boolean; network: string }> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM settings LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              // Return defaults if no settings found
              resolve({ offlineMode: false, network: 'testnet' });
              return;
            }
            
            const settings = rows.item(0);
            resolve({
              offlineMode: settings.offlineMode === 1,
              network: settings.network
            });
          },
          (_, error) => {
            console.error('Error getting settings:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
  
  // Save settings
  public saveSettings(offlineMode: boolean, network: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM settings LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              // Insert new settings
              tx.executeSql(
                'INSERT INTO settings (id, offlineMode, network) VALUES (1, ?, ?)',
                [offlineMode ? 1 : 0, network],
                (_, { rowsAffected }) => {
                  resolve(rowsAffected > 0);
                },
                (_, error) => {
                  console.error('Error inserting settings:', error);
                  reject(error);
                  return false;
                }
              );
            } else {
              // Update existing settings
              tx.executeSql(
                'UPDATE settings SET offlineMode = ?, network = ? WHERE id = 1',
                [offlineMode ? 1 : 0, network],
                (_, { rowsAffected }) => {
                  resolve(rowsAffected > 0);
                },
                (_, error) => {
                  console.error('Error updating settings:', error);
                  reject(error);
                  return false;
                }
              );
            }
          },
          (_, error) => {
            console.error('Error checking settings:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

// Export a singleton instance
export const sqliteService = new SQLiteService();