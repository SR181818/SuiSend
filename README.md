# SuiSend

# 🔒 SuiSend – Offline-First NFC Crypto Wallet (Powered by Sui)

SuiSend is an **offline-first crypto wallet system** for Android and iOS, built using **React Native** and **NTAG215 NFC cards**. It allows users to store Sui blockchain keypairs and coin objects directly on NFC cards, enabling secure, offline transaction signing and deferred syncing with the blockchain.

> Think “Touch 'n Go” meets Web3.

---

## 🚀 Features

- 📲 **NFC Card Wallets**: Sui private key, coin object IDs, balances, and pending transactions are stored directly on NFC cards.
- 🔐 **Offline Signing**: Tap-to-sign transactions offline, with TTL, reservation, and locking enforcement.
- 🌐 **Deferred Sync**: Transactions dry-run validated and submitted when back online.
- 📛 **Alias System**: Register human-readable aliases for NFC wallets via the on-chain `CardRegistry` Move contract.
- 📉 **Pyth Price Feed**: Optional integration to display real-time SUI/USD price.
- 🌉 **Wormhole Integration**: Optional bridge to import EVM assets to fund wallet balances.

---

## 📦 Tech Stack

### 📱 Mobile App (React Native)
- `react-native-nfc-manager`: NFC read/write support
- `react-native-sqlite-storage`: Local ledger + version tracking
- `@mysten/sui.js`: Interact with Sui blockchain
- `react-native-keychain`, `expo-secure-store`: Secure local storage
- `luxon` / `dayjs`: Time & TTL tracking
- `tailwindcss-react-native`: UI styling
- `jest`, `mocha`: Testing frameworks

### 🧠 Backend (Offline Ledger & Tx Manager)
- **Local SQLite Ledger**:
  - Coin object cache
  - Version tracking
  - Pending transaction store
- **Transaction Manager**:
  - Marks coin objects as reserved
  - Applies TTL and sequence tags
  - Validates and locks coin objects offline

### 📄 Smart Contract (Move on Sui)
- Module: `nfc::card_registry`
  - `register_card`: Registers card by wallet address
  - `is_registered`: Checks if card is whitelisted
  - `require_registered`: Validates before syncing

### 🔗 Blockchain
- **Chain**: Sui Testnet
- **Tools**: Sui CLI, Faucet, Fullnode
- **SDK**: `@mysten/sui.js`
- **Oracles**: `@pythnetwork/client`
- **Bridge**: `@wormhole-foundation/sdk`

---

## 🧱 System Architecture

<details>
<summary>Click to expand the architecture diagram</summary>

```mermaid
graph TD
  A[NFC Card (NTAG215)]
  B[React Native App]
  C[Local SQLite Ledger]
  D[Sui Testnet]
  E[CardRegistry Contract]
  F[Pyth / Wormhole]

  A -->|Tap| B
  B --> C
  B -->|Sign Tx| A
  B -->|When Online| D
  D -->|dryRun, Submit| B
  D --> E
  B --> F

---

## 🔐 Card Format (JSON Blob)

```json
{
  "wallet_address": "0xabc...",
  "last_balance": 3.4,
  "unspent_objects": [
    "0xcoin1",
    "0xcoin2"
  ],
  "pending_spend": [
    {
      "to": "0xdef",
      "amount": 1,
      "timestamp": 1680000000
    }
  ]
}

