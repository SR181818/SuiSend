-- NFC Crypto Wallet Database Schema
-- This schema supports users, NFC cards, unspent objects, and transactions

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFC Cards table
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    external_id VARCHAR(255) UNIQUE NOT NULL, -- NFC card unique identifier
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'Personal', -- Personal, Business, etc.
    color VARCHAR(50) NOT NULL DEFAULT 'blue', -- UI color theme
    balance DECIMAL(20, 9) NOT NULL DEFAULT 0, -- SUI balance with 9 decimal places
    address VARCHAR(255) NOT NULL, -- Sui blockchain address
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unspent Objects table (Sui blockchain coins/objects)
CREATE TABLE IF NOT EXISTS unspent_objects (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    object_id VARCHAR(255) UNIQUE NOT NULL, -- Sui object ID
    amount DECIMAL(20, 9) NOT NULL, -- Amount in SUI
    version INTEGER, -- Object version on Sui blockchain
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending Transactions table (for offline mode)
CREATE TABLE IF NOT EXISTS pending_transactions (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20, 9) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES cards(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'sent', 'received', 'pending'
    amount DECIMAL(20, 9) NOT NULL,
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    transaction_hash VARCHAR(255) UNIQUE, -- Sui blockchain transaction hash
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    note TEXT,
    gas_fee DECIMAL(20, 9) DEFAULT 0,
    block_number BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    offline_mode BOOLEAN DEFAULT false,
    network VARCHAR(50) DEFAULT 'testnet', -- 'mainnet', 'testnet', 'devnet'
    notification_enabled BOOLEAN DEFAULT true,
    biometric_enabled BOOLEAN DEFAULT false,
    auto_sync BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table (for external service integrations)
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- 'sui_rpc', 'price_feed', etc.
    api_key_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_external_id ON cards(external_id);
CREATE INDEX IF NOT EXISTS idx_cards_address ON cards(address);
CREATE INDEX IF NOT EXISTS idx_unspent_objects_card_id ON unspent_objects(card_id);
CREATE INDEX IF NOT EXISTS idx_unspent_objects_object_id ON unspent_objects(object_id);
CREATE INDEX IF NOT EXISTS idx_pending_transactions_card_id ON pending_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unspent_objects_updated_at BEFORE UPDATE ON unspent_objects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (username, email, password_hash, wallet_address) VALUES 
('demo_user', 'demo@nfcwallet.com', '$2a$10$sample_hash_here', '0x75b18d217a6c72d4c6da00737ee38da3abc2d7ab623f34850e80491a3731f0b1')
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_settings (user_id, offline_mode, network) VALUES 
(1, false, 'testnet')
ON CONFLICT (user_id) DO NOTHING;