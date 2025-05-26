import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { 
  Connection, 
  JsonRpcProvider, 
  Ed25519Keypair, 
  RawSigner, 
  TransactionBlock 
} from '@mysten/sui.js';
import { nfcService, NfcCardData } from '../services/nfcService';
import { 
  Card, 
  Transaction, 
  UnspentObject, 
  PendingTransaction, 
  WalletProfile 
} from '../types/wallet';
import { useNetwork } from './NetworkContext';
import { formatISO } from 'date-fns';

// Create a SQLite database
const db = SQLite.openDatabase('crypto_wallet.db');

// Initialize the database tables
const initDatabase = () => {
  db.transaction(tx => {
    // Create tables for cards, transactions, etc.
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
    
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL,
        walletAddress TEXT NOT NULL,
        avatar TEXT
      );`
    );
  });
};

// Sui blockchain configuration
const SUI_RPC_URL = 'https://fullnode.testnet.sui.io';
const provider = new JsonRpcProvider(new Connection({ fullnode: SUI_RPC_URL }));

// Define the context type
interface WalletContextType {
  // State
  isLoading: boolean;
  cards: Card[];
  transactions: Transaction[];
  balance: number;
  fiatValue: string;
  nfcStatus: 'ready' | 'scanning' | 'detected' | 'writing' | 'error';
  selectedCard: Card | null;
  profile: WalletProfile | null;
  
  // Actions
  setIsLoading: (isLoading: boolean) => void;
  setSelectedCard: (card: Card | null) => void;
  scanNfcCard: () => Promise<boolean>;
  writeToNfcCard: (card: Card) => Promise<boolean>;
  sendTransaction: (amount: number, recipient: string, note?: string, allowOffline?: boolean) => Promise<Transaction | null>;
  syncCard: (card: Card) => Promise<void>;
  topUpCard: (card: Card) => Promise<void>;
  updateCardName: (cardId: string, name: string) => Promise<void>;
  createWallet: (name: string) => Promise<void>;
  importWallet: (mnemonic: string, name: string) => Promise<void>;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [nfcStatus, setNfcStatus] = useState<'ready' | 'scanning' | 'detected' | 'writing' | 'error'>('ready');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  
  const { isConnected, isOfflineMode } = useNetwork();
  
  // Calculate fiat value
  const fiatValue = (balance * 8.42).toFixed(2); // Mock price: 1 SUI = $8.42 USD
  
  // Initialize wallet
  useEffect(() => {
    const initWallet = async () => {
      try {
        setIsLoading(true);
        
        // Initialize NFC
        await nfcService.init();
        
        // Initialize database
        initDatabase();
        
        // Load data from the database
        await loadCards();
        await loadTransactions();
        await loadProfile();
        
        // Sync pending transactions if online
        if (isConnected && !isOfflineMode) {
          await syncPendingTransactions();
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
        Alert.alert('Error', 'Failed to initialize wallet');
      } finally {
        setIsLoading(false);
      }
    };
    
    initWallet();
    
    // Cleanup
    return () => {
      nfcService.cleanup();
    };
  }, [isConnected, isOfflineMode]);
  
  // Load cards from the database
  const loadCards = async () => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM cards',
          [],
          async (_, { rows }) => {
            const loadedCards: Card[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const card = rows.item(i);
              
              // Load unspent objects for this card
              const unspentObjects = await loadUnspentObjects(card.id);
              
              // Load pending transactions for this card
              const pendingTransactions = await loadPendingTransactions(card.id);
              
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
            
            setCards(loadedCards);
            updateTotalBalance(loadedCards);
            resolve();
          },
          (_, error) => {
            console.error('Error loading cards:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Load unspent objects for a card
  const loadUnspentObjects = async (cardId: string): Promise<UnspentObject[]> => {
    return new Promise<UnspentObject[]>((resolve, reject) => {
      db.transaction(tx => {
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
            console.error('Error loading unspent objects:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Load pending transactions for a card
  const loadPendingTransactions = async (cardId: string): Promise<PendingTransaction[]> => {
    return new Promise<PendingTransaction[]>((resolve, reject) => {
      db.transaction(tx => {
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
            console.error('Error loading pending transactions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Load transactions from the database
  const loadTransactions = async () => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM transactions ORDER BY timestamp DESC',
          [],
          (_, { rows }) => {
            const loadedTransactions: Transaction[] = [];
            
            for (let i = 0; i < rows.length; i++) {
              const tx = rows.item(i);
              loadedTransactions.push({
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
            
            setTransactions(loadedTransactions);
            resolve();
          },
          (_, error) => {
            console.error('Error loading transactions:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Load user profile from the database
  const loadProfile = async () => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM profile LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const userProfile = rows.item(0);
              setProfile({
                name: userProfile.name,
                walletAddress: userProfile.walletAddress,
                avatar: userProfile.avatar
              });
            }
            resolve();
          },
          (_, error) => {
            console.error('Error loading profile:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Update the total balance based on all cards
  const updateTotalBalance = (cardList: Card[] = cards) => {
    const total = cardList.reduce((sum, card) => sum + card.balance, 0);
    setBalance(total);
  };
  
  // Sync pending transactions with the blockchain
  const syncPendingTransactions = async () => {
    if (isOfflineMode || !isConnected) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      for (const card of cards) {
        if (card.pendingTransactions.length === 0) continue;
        
        for (const pendingTx of card.pendingTransactions) {
          // In a real implementation, this would submit the transaction to the blockchain
          // using the Sui SDK
          console.log(`Syncing transaction to ${pendingTx.to} for ${pendingTx.amount} SUI`);
          
          // For demonstration, we'll simulate a successful transaction
          const txId = `tx_${Date.now().toString()}`;
          const txTimestamp = formatISO(new Date());
          
          // Update the transaction status in the database
          await new Promise<void>((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(
                `UPDATE transactions 
                 SET status = ?, type = ?, transactionHash = ? 
                 WHERE to_address = ? AND amount = ? AND cardId = ? AND status = 'pending'`,
                ['confirmed', 'sent', txId, pendingTx.to, pendingTx.amount, card.id],
                () => resolve(),
                (_, error) => {
                  console.error('Error updating transaction:', error);
                  reject(error);
                  return false;
                }
              );
            });
          });
          
          // Remove the pending transaction from the database
          await new Promise<void>((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM pending_transactions WHERE cardId = ? AND to_address = ? AND amount = ?',
                [card.id, pendingTx.to, pendingTx.amount],
                () => resolve(),
                (_, error) => {
                  console.error('Error removing pending transaction:', error);
                  reject(error);
                  return false;
                }
              );
            });
          });
        }
        
        // Update the card's last synced timestamp
        await new Promise<void>((resolve, reject) => {
          const now = formatISO(new Date());
          db.transaction(tx => {
            tx.executeSql(
              'UPDATE cards SET lastSynced = ? WHERE id = ?',
              [now, card.id],
              () => resolve(),
              (_, error) => {
                console.error('Error updating card last synced:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      }
      
      // Reload cards and transactions to reflect the changes
      await loadCards();
      await loadTransactions();
    } catch (error) {
      console.error('Error syncing pending transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Scan an NFC card
  const scanNfcCard = async (): Promise<boolean> => {
    try {
      setNfcStatus('scanning');
      setIsLoading(true);
      
      // Read the NFC card
      const cardData = await nfcService.readNfcCard();
      
      if (!cardData) {
        setNfcStatus('error');
        Alert.alert('Error', 'Failed to read NFC card');
        return false;
      }
      
      setNfcStatus('detected');
      
      // Check if this card already exists in our database
      const existingCard = cards.find(c => c.address === cardData.wallet_address);
      
      if (existingCard) {
        // Update the existing card
        await updateExistingCard(existingCard, cardData);
      } else {
        // Add a new card
        await addNewCard(cardData);
      }
      
      // Reload cards and transactions
      await loadCards();
      
      setNfcStatus('ready');
      return true;
    } catch (error) {
      console.error('Error scanning NFC card:', error);
      setNfcStatus('error');
      Alert.alert('Error', 'An error occurred while scanning the NFC card');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update an existing card with data from an NFC card
  const updateExistingCard = async (card: Card, cardData: NfcCardData) => {
    return new Promise<void>((resolve, reject) => {
      const now = formatISO(new Date());
      
      db.transaction(tx => {
        // Update the card
        tx.executeSql(
          'UPDATE cards SET balance = ?, lastSynced = ? WHERE id = ?',
          [cardData.last_balance, now, card.id],
          async () => {
            // Clear existing unspent objects
            tx.executeSql(
              'DELETE FROM unspent_objects WHERE cardId = ?',
              [card.id]
            );
            
            // Add new unspent objects
            for (const objectId of cardData.unspent_objects) {
              tx.executeSql(
                'INSERT INTO unspent_objects (id, cardId, amount, version, locked) VALUES (?, ?, ?, ?, ?)',
                [objectId, card.id, 1, null, 0]
              );
            }
            
            // Clear existing pending transactions
            tx.executeSql(
              'DELETE FROM pending_transactions WHERE cardId = ?',
              [card.id]
            );
            
            // Add new pending transactions
            for (const pendingTx of cardData.pending_spend) {
              tx.executeSql(
                'INSERT INTO pending_transactions (cardId, to_address, amount, timestamp) VALUES (?, ?, ?, ?)',
                [card.id, pendingTx.to, pendingTx.amount, pendingTx.timestamp]
              );
            }
            
            resolve();
          },
          (_, error) => {
            console.error('Error updating card:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Add a new card from NFC card data
  const addNewCard = async (cardData: NfcCardData) => {
    return new Promise<void>((resolve, reject) => {
      const cardId = `card_${Date.now()}`;
      const now = formatISO(new Date());
      const cardName = 'NFC Card';
      const cardType = 'Personal';
      const cardColor = Math.random() > 0.5 ? 'blue' : 'purple';
      
      db.transaction(tx => {
        // Add the card
        tx.executeSql(
          'INSERT INTO cards (id, name, type, color, balance, address, lastSynced) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [cardId, cardName, cardType, cardColor, cardData.last_balance, cardData.wallet_address, now],
          async () => {
            // Add unspent objects
            for (const objectId of cardData.unspent_objects) {
              tx.executeSql(
                'INSERT INTO unspent_objects (id, cardId, amount, version, locked) VALUES (?, ?, ?, ?, ?)',
                [objectId, cardId, 1, null, 0]
              );
            }
            
            // Add pending transactions
            for (const pendingTx of cardData.pending_spend) {
              tx.executeSql(
                'INSERT INTO pending_transactions (cardId, to_address, amount, timestamp) VALUES (?, ?, ?, ?)',
                [cardId, pendingTx.to, pendingTx.amount, pendingTx.timestamp]
              );
            }
            
            resolve();
          },
          (_, error) => {
            console.error('Error adding card:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  };
  
  // Write data to an NFC card
  const writeToNfcCard = async (card: Card): Promise<boolean> => {
    try {
      setNfcStatus('writing');
      setIsLoading(true);
      
      // Prepare the data to write
      const cardData: NfcCardData = {
        wallet_address: card.address,
        last_balance: card.balance,
        unspent_objects: card.unspentObjects.map(obj => obj.id),
        pending_spend: card.pendingTransactions
      };
      
      // Write to the NFC card
      const success = await nfcService.writeNfcCard(cardData);
      
      if (!success) {
        setNfcStatus('error');
        Alert.alert('Error', 'Failed to write to NFC card');
        return false;
      }
      
      setNfcStatus('ready');
      return true;
    } catch (error) {
      console.error('Error writing to NFC card:', error);
      setNfcStatus('error');
      Alert.alert('Error', 'An error occurred while writing to the NFC card');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send a transaction
  const sendTransaction = async (
    amount: number, 
    recipient: string, 
    note?: string,
    allowOffline: boolean = false
  ): Promise<Transaction | null> => {
    if (!selectedCard) {
      Alert.alert('Error', 'No card selected');
      return null;
    }
    
    if (amount <= 0) {
      Alert.alert('Error', 'Amount must be greater than zero');
      return null;
    }
    
    if (amount > selectedCard.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return null;
    }
    
    try {
      setIsLoading(true);
      
      const isOffline = isOfflineMode || !isConnected;
      
      // Check if transaction is allowed in current mode
      if (isOffline && !allowOffline) {
        Alert.alert('Error', 'Cannot send transaction while offline. Enable offline transactions to continue.');
        return null;
      }
      
      // Create a unique transaction ID
      const txId = `tx_${Date.now()}`;
      const now = formatISO(new Date());
      
      // Set transaction type and status based on network state
      const txType = isOffline ? 'pending' : 'sent';
      const txStatus = isOffline ? 'pending' : 'confirmed';
      
      // Create transaction record
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO transactions (
              id, type, amount, to_address, timestamp, status, note, cardId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [txId, txType, amount, recipient, now, txStatus, note || null, selectedCard.id],
            () => resolve(),
            (_, error) => {
              console.error('Error creating transaction:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // If offline, add to pending transactions
      if (isOffline) {
        await new Promise<void>((resolve, reject) => {
          const timestamp = Date.now();
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO pending_transactions (cardId, to_address, amount, timestamp) VALUES (?, ?, ?, ?)',
              [selectedCard.id, recipient, amount, timestamp],
              () => resolve(),
              (_, error) => {
                console.error('Error adding pending transaction:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      } else {
        // In a real implementation, this would submit the transaction to the blockchain
        // using the Sui SDK
        // const keypair = await getCardKeypair(selectedCard);
        // const signer = new RawSigner(keypair, provider);
        // const tx = new TransactionBlock();
        // tx.transferObjects([tx.object(objectId)], tx.pure(recipient));
        // const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
        
        // Mock a transaction hash for demo purposes
        const txHash = `0x${Math.random().toString(16).substring(2, 34)}`;
        
        // Update transaction with hash
        await new Promise<void>((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'UPDATE transactions SET transactionHash = ? WHERE id = ?',
              [txHash, txId],
              () => resolve(),
              (_, error) => {
                console.error('Error updating transaction hash:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      }
      
      // Update card balance
      await new Promise<void>((resolve, reject) => {
        const newBalance = selectedCard.balance - amount;
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE cards SET balance = ? WHERE id = ?',
            [newBalance, selectedCard.id],
            () => resolve(),
            (_, error) => {
              console.error('Error updating card balance:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Reload cards and transactions
      await loadCards();
      await loadTransactions();
      
      // Find the newly created transaction
      const newTransaction = transactions.find(t => t.id === txId);
      
      return newTransaction || null;
    } catch (error) {
      console.error('Error sending transaction:', error);
      Alert.alert('Error', 'Failed to send transaction');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sync a card with the blockchain
  const syncCard = async (card: Card): Promise<void> => {
    if (isOfflineMode || !isConnected) {
      Alert.alert('Error', 'Cannot sync card while offline');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch updated data from the blockchain
      // using the Sui SDK
      // For demo purposes, we'll just update the last synced timestamp and process pending transactions
      
      // Process pending transactions
      for (const pendingTx of card.pendingTransactions) {
        // Update transaction status in the database
        await new Promise<void>((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              `UPDATE transactions 
               SET status = ?, type = ? 
               WHERE to_address = ? AND amount = ? AND cardId = ? AND status = 'pending'`,
              ['confirmed', 'sent', pendingTx.to, pendingTx.amount, card.id],
              () => resolve(),
              (_, error) => {
                console.error('Error updating transaction:', error);
                reject(error);
                return false;
              }
            );
          });
        });
        
        // Remove the pending transaction
        await new Promise<void>((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              'DELETE FROM pending_transactions WHERE cardId = ? AND to_address = ? AND amount = ?',
              [card.id, pendingTx.to, pendingTx.amount],
              () => resolve(),
              (_, error) => {
                console.error('Error removing pending transaction:', error);
                reject(error);
                return false;
              }
            );
          });
        });
      }
      
      // Update the card's last synced timestamp
      const now = formatISO(new Date());
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE cards SET lastSynced = ? WHERE id = ?',
            [now, card.id],
            () => resolve(),
            (_, error) => {
              console.error('Error updating card last synced:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Reload cards and transactions
      await loadCards();
      await loadTransactions();
      
      Alert.alert('Success', 'Card synced with blockchain');
    } catch (error) {
      console.error('Error syncing card:', error);
      Alert.alert('Error', 'Failed to sync card with blockchain');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Top up a card with SUI
  const topUpCard = async (card: Card): Promise<void> => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll simulate adding funds
      const amount = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
      const objectId = `0x${Math.random().toString(16).substr(2, 10)}`;
      const txId = `tx_${Date.now()}`;
      const now = formatISO(new Date());
      
      // Add unspent object
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT INTO unspent_objects (id, cardId, amount, version, locked) VALUES (?, ?, ?, ?, ?)',
            [objectId, card.id, amount, 1, 0],
            () => resolve(),
            (_, error) => {
              console.error('Error adding unspent object:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Update card balance
      await new Promise<void>((resolve, reject) => {
        const newBalance = card.balance + amount;
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE cards SET balance = ? WHERE id = ?',
            [newBalance, card.id],
            () => resolve(),
            (_, error) => {
              console.error('Error updating card balance:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Add transaction
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            `INSERT INTO transactions (
              id, type, amount, from_address, timestamp, status, cardId
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [txId, 'received', amount, 'Top Up', now, 'confirmed', card.id],
            () => resolve(),
            (_, error) => {
              console.error('Error creating transaction:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Reload cards and transactions
      await loadCards();
      await loadTransactions();
      
      Alert.alert('Success', `Added ${amount} SUI to your card`);
    } catch (error) {
      console.error('Error topping up card:', error);
      Alert.alert('Error', 'Failed to add funds to your card');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update a card's name
  const updateCardName = async (cardId: string, name: string): Promise<void> => {
    if (!name.trim()) {
      Alert.alert('Error', 'Card name cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'UPDATE cards SET name = ? WHERE id = ?',
            [name.trim(), cardId],
            () => resolve(),
            (_, error) => {
              console.error('Error updating card name:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Reload cards
      await loadCards();
      
      // Update selected card if it's the one being renamed
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard({
          ...selectedCard,
          name: name.trim()
        });
      }
    } catch (error) {
      console.error('Error updating card name:', error);
      Alert.alert('Error', 'Failed to update card name');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new wallet
  const createWallet = async (name: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would generate a new Sui keypair
      // For demo purposes, we'll use a fixed address
      const walletAddress = '0x7c4f9d72e3d51b4a9822c52c38017683eb245a3d';
      
      // Save the profile to the database
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT OR REPLACE INTO profile (id, name, walletAddress) VALUES (1, ?, ?)',
            [name, walletAddress],
            () => resolve(),
            (_, error) => {
              console.error('Error creating wallet:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Load the profile
      await loadProfile();
      
      Alert.alert('Success', 'Wallet created successfully');
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Import an existing wallet
  const importWallet = async (mnemonic: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would derive a Sui keypair from the mnemonic
      // For demo purposes, we'll use a fixed address
      const walletAddress = '0x7c4f9d72e3d51b4a9822c52c38017683eb245a3d';
      
      // Save the profile to the database
      await new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(
            'INSERT OR REPLACE INTO profile (id, name, walletAddress) VALUES (1, ?, ?)',
            [name, walletAddress],
            () => resolve(),
            (_, error) => {
              console.error('Error importing wallet:', error);
              reject(error);
              return false;
            }
          );
        });
      });
      
      // Load the profile
      await loadProfile();
      
      Alert.alert('Success', 'Wallet imported successfully');
    } catch (error) {
      console.error('Error importing wallet:', error);
      Alert.alert('Error', 'Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isLoading,
        cards,
        transactions,
        balance,
        fiatValue,
        nfcStatus,
        selectedCard,
        profile,
        setIsLoading,
        setSelectedCard,
        scanNfcCard,
        writeToNfcCard,
        sendTransaction,
        syncCard,
        topUpCard,
        updateCardName,
        createWallet,
        importWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};