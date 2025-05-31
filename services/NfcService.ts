
import { Platform } from 'react-native';

// Mock NFC for development/web platform
const mockNFC = {
  isSupported: () => Promise.resolve(false),
  scanTag: () => Promise.reject(new Error('NFC not supported on this platform')),
  writeTag: () => Promise.reject(new Error('NFC not supported on this platform')),
  readTag: () => Promise.reject(new Error('NFC not supported on this platform')),
};

export interface NFCCardData {
  id: string;
  type: 'wallet_card';
  walletAddress: string;
  cardMode: 'sender' | 'receiver';
  balance: number;
  lastUpdated: number;
  version: string;
}

class NfcService {
  private static instance: NfcService;
  private isScanning: boolean = false;
  private isWriting: boolean = false;

  private constructor() {}

  static getInstance(): NfcService {
    if (!NfcService.instance) {
      NfcService.instance = new NfcService();
    }
    return NfcService.instance;
  }

  async isSupported(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      // Try to import react-native-nfc-manager
      const NfcManager = require('react-native-nfc-manager');
      return await NfcManager.isSupported();
    } catch (error) {
      console.log('NFC Manager not available:', error);
      return false;
    }
  }

  async startScan(): Promise<any> {
    if (this.isScanning || Platform.OS === 'web') {
      throw new Error('Already scanning or NFC not supported');
    }
    
    this.isScanning = true;
    try {
      if (Platform.OS === 'web') {
        // Simulate NFC scan for web
        return {
          id: 'web_demo_card',
          type: 'wallet_card',
          walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
          cardMode: 'sender',
          balance: 0,
          lastUpdated: Date.now(),
          version: '1.0'
        };
      }
      
      const NfcManager = require('react-native-nfc-manager');
      await NfcManager.requestTechnology([NfcManager.NfcTech.Ndef]);
      const tag = await NfcManager.getTag();
      
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        const text = NfcManager.Ndef.text.decodePayload(record.payload);
        return JSON.parse(text);
      }
      
      return tag;
    } catch (error) {
      console.error('Error scanning NFC:', error);
      throw error;
    } finally {
      this.isScanning = false;
      try {
        if (Platform.OS !== 'web') {
          const NfcManager = require('react-native-nfc-manager');
          await NfcManager.cancelTechnologyRequest();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async createWalletCard(walletAddress: string, cardMode: 'sender' | 'receiver', balance: number = 0): Promise<NFCCardData> {
    const cardData: NFCCardData = {
      id: `card_${Date.now()}`,
      type: 'wallet_card',
      walletAddress,
      cardMode,
      balance,
      lastUpdated: Date.now(),
      version: '1.0'
    };

    if (Platform.OS === 'web') {
      // Simulate card creation for web
      console.log('🎴 Created NFC Card (Web Simulation):', cardData);
      return cardData;
    }

    try {
      await this.writeCardData(cardData);
      return cardData;
    } catch (error) {
      console.error('Error creating wallet card:', error);
      throw error;
    }
  }

  async writeCardData(cardData: NFCCardData): Promise<void> {
    if (this.isWriting) {
      throw new Error('Already writing to card');
    }

    this.isWriting = true;

    if (Platform.OS === 'web') {
      // Simulate writing for web
      console.log('✍️ Writing to NFC Card (Web Simulation):', cardData);
      this.isWriting = false;
      return;
    }
    
    try {
      const NfcManager = require('react-native-nfc-manager');
      await NfcManager.requestTechnology([NfcManager.NfcTech.Ndef]);
      
      const bytes = NfcManager.Ndef.encodeMessage([
        NfcManager.Ndef.textRecord(JSON.stringify(cardData))
      ]);
      
      await NfcManager.writeNdefMessage(bytes);
      console.log('✅ Successfully wrote wallet data to NFC card');
    } catch (error) {
      console.error('Error writing to NFC card:', error);
      throw error;
    } finally {
      this.isWriting = false;
      try {
        const NfcManager = require('react-native-nfc-manager');
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async readCard(): Promise<NFCCardData> {
    if (Platform.OS === 'web') {
      // Return mock data for web
      return {
        id: 'web_demo_card',
        type: 'wallet_card',
        walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
        cardMode: 'sender',
        balance: 0,
        lastUpdated: Date.now(),
        version: '1.0'
      };
    }
    
    try {
      const NfcManager = require('react-native-nfc-manager');
      await NfcManager.requestTechnology([NfcManager.NfcTech.Ndef]);
      const tag = await NfcManager.getTag();
      
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        const text = NfcManager.Ndef.text.decodePayload(record.payload);
        return JSON.parse(text);
      }
      
      throw new Error('No wallet data found on NFC tag');
    } catch (error) {
      console.error('Error reading NFC card:', error);
      throw error;
    } finally {
      try {
        const NfcManager = require('react-native-nfc-manager');
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async updateCardBalance(cardId: string, newBalance: number): Promise<void> {
    if (Platform.OS === 'web') {
      console.log(`💰 Updated card ${cardId} balance to ${newBalance} (Web Simulation)`);
      return;
    }
    
    try {
      const cardData = await this.readCard();
      cardData.balance = newBalance;
      cardData.lastUpdated = Date.now();
      await this.writeCardData(cardData);
    } catch (error) {
      console.error('Error updating card balance:', error);
      throw error;
    }
  }
}

export default NfcService.getInstance();
