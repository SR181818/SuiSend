// Core types for our wallet application

export interface Card {
  id: string;
  name: string;
  type: string; // 'Personal', 'Business', etc.
  color: string; // For UI display
  balance: number;
  address: string; // Sui address
  lastSynced: string; // ISO timestamp
  unspentObjects: UnspentObject[];
  pendingTransactions: PendingTransaction[];
}

export interface UnspentObject {
  id: string; // Sui object ID
  amount: number;
  version?: number;
  locked?: boolean;
}

export interface PendingTransaction {
  to: string; // Recipient address
  amount: number;
  timestamp: number; // Unix timestamp
}

export type TransactionType = 'sent' | 'received' | 'pending';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  from?: string;
  to?: string;
  timestamp: string; // ISO timestamp
  status: TransactionStatus;
  note?: string;
  cardId?: string;
  transactionHash?: string; // Sui transaction digest
}

export interface WalletProfile {
  name: string;
  walletAddress: string;
  mnemonic?: string; // Should only be in memory, never stored
  avatar?: string; // Optional avatar image
}