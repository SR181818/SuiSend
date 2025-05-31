
import { Platform } from 'react-native';

// Mock NFC for development/web platform
const mockNFC = {
  isSupported: () => Promise.resolve(false),
  scanTag: () => Promise.reject(new Error('NFC not supported on this platform')),
  writeTag: () => Promise.reject(new Error('NFC not supported on this platform')),
  readTag: () => Promise.reject(new Error('NFC not supported on this platform')),
};

class NfcService {
  private static instance: NfcService;
  private isScanning: boolean = false;

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

  async startScan(): Promise<void> {
    if (this.isScanning || Platform.OS === 'web') return;
    
    this.isScanning = true;
    try {
      if (Platform.OS === 'web') {
        throw new Error('NFC not supported on web platform');
      }
      
      const NfcManager = require('react-native-nfc-manager');
      await NfcManager.requestTechnology([NfcManager.NfcTech.Ndef]);
      const tag = await NfcManager.getTag();
      return tag;
    } catch (error) {
      console.error('Error scanning NFC:', error);
      throw error;
    } finally {
      this.isScanning = false;
      try {
        const NfcManager = require('react-native-nfc-manager');
        await NfcManager.cancelTechnologyRequest();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async writeWalletToCard(userId: string, walletData: any): Promise<void> {
    if (Platform.OS === 'web') {
      throw new Error('NFC not supported on web platform');
    }
    
    try {
      const NfcManager = require('react-native-nfc-manager');
      await NfcManager.requestTechnology([NfcManager.NfcTech.Ndef]);
      
      const bytes = NfcManager.Ndef.encodeMessage([
        NfcManager.Ndef.textRecord(JSON.stringify({
          id: userId,
          type: 'wallet',
          data: walletData
        }))
      ]);
      
      await NfcManager.writeNdefMessage(bytes);
    } catch (error) {
      console.error('Error writing to NFC card:', error);
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

  async readCard(): Promise<any> {
    if (Platform.OS === 'web') {
      throw new Error('NFC not supported on web platform');
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
      
      throw new Error('No data found on NFC tag');
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
      throw new Error('NFC not supported on web platform');
    }
    
    try {
      const cardData = await this.readCard();
      cardData.balance = newBalance;
      await this.writeWalletToCard(cardId, cardData);
    } catch (error) {
      console.error('Error updating card balance:', error);
      throw error;
    }
  }
}

export default NfcService.getInstance();
