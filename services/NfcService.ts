
import { Platform } from 'react-native';

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
  private isInitialized: boolean = false;
  private NfcManager: any = null;
  private tagEventListener: ((tag: any) => void) | null = null;

  private constructor() {}

  static getInstance(): NfcService {
    if (!NfcService.instance) {
      NfcService.instance = new NfcService();
    }
    return NfcService.instance;
  }

  private async initializeNfcManager(): Promise<void> {
    if (Platform.OS === 'web' || this.isInitialized) {
      return;
    }

    try {
      // Dynamically import NFC Manager
      const NfcManagerModule = require('react-native-nfc-manager');
      this.NfcManager = NfcManagerModule.default;
      
      // Initialize NFC Manager
      await this.NfcManager.start();
      this.isInitialized = true;
      console.log('NFC Manager initialized successfully');
    } catch (error) {
      console.log('NFC Manager not available or failed to initialize:', error);
      this.NfcManager = null;
      throw new Error('NFC not supported or failed to initialize');
    }
  }

  async isSupported(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      await this.initializeNfcManager();
      if (!this.NfcManager) return false;
      return await this.NfcManager.isSupported();
    } catch (error) {
      console.log('NFC not supported:', error);
      return false;
    }
  }

  async start(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('NFC started (Web simulation)');
      return;
    }

    try {
      await this.initializeNfcManager();
      if (!this.NfcManager) {
        throw new Error('NFC Manager not available');
      }
      console.log('NFC service started successfully');
    } catch (error) {
      console.error('Error starting NFC service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (Platform.OS === 'web' || !this.isInitialized || !this.NfcManager) {
      return;
    }

    try {
      await this.NfcManager.cancelTechnologyRequest();
      this.unregisterTagEvent();
    } catch (error) {
      console.warn('Error stopping NFC service:', error);
    }
  }

  registerTagEvent(callback: (tag: any) => void): void {
    if (Platform.OS === 'web') {
      console.log('Tag event registered (Web simulation)');
      this.tagEventListener = callback;
      return;
    }

    if (!this.NfcManager) {
      console.warn('NFC Manager not initialized');
      return;
    }

    this.tagEventListener = callback;
    
    // Register for tag discovery events
    this.NfcManager.setEventListener('NfcManagerDiscoverTag', (tag: any) => {
      if (this.tagEventListener) {
        this.tagEventListener(tag);
      }
    });

    // Start tag discovery
    this.NfcManager.registerTagEvent().catch((error: any) => {
      console.error('Failed to register tag event:', error);
    });
  }

  unregisterTagEvent(): void {
    if (Platform.OS === 'web') {
      console.log('Tag event unregistered (Web simulation)');
      this.tagEventListener = null;
      return;
    }

    if (!this.NfcManager) return;

    try {
      this.NfcManager.setEventListener('NfcManagerDiscoverTag', null);
      this.NfcManager.unregisterTagEvent();
      this.tagEventListener = null;
    } catch (error) {
      console.warn('Error unregistering tag event:', error);
    }
  }

  async startScan(): Promise<any> {
    if (this.isScanning || Platform.OS === 'web') {
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
      throw new Error('Already scanning or NFC not supported');
    }
    
    this.isScanning = true;
    try {
      await this.initializeNfcManager();
      if (!this.NfcManager) {
        throw new Error('NFC Manager not available');
      }

      await this.NfcManager.requestTechnology([this.NfcManager.NfcTech.Ndef]);
      const tag = await this.NfcManager.getTag();
      
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        const text = this.NfcManager.Ndef.text.decodePayload(record.payload);
        return JSON.parse(text);
      }
      
      return tag;
    } catch (error) {
      console.error('Error scanning NFC:', error);
      throw error;
    } finally {
      this.isScanning = false;
      try {
        if (Platform.OS !== 'web' && this.NfcManager) {
          await this.NfcManager.cancelTechnologyRequest();
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
      await this.initializeNfcManager();
      if (!this.NfcManager) {
        throw new Error('NFC Manager not available');
      }

      await this.NfcManager.requestTechnology([this.NfcManager.NfcTech.Ndef]);
      
      const bytes = this.NfcManager.Ndef.encodeMessage([
        this.NfcManager.Ndef.textRecord(JSON.stringify(cardData))
      ]);
      
      await this.NfcManager.writeNdefMessage(bytes);
      console.log('✅ Successfully wrote wallet data to NFC card');
    } catch (error) {
      console.error('Error writing to NFC card:', error);
      throw error;
    } finally {
      this.isWriting = false;
      try {
        if (this.NfcManager) {
          await this.NfcManager.cancelTechnologyRequest();
        }
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
      await this.initializeNfcManager();
      if (!this.NfcManager) {
        throw new Error('NFC Manager not available');
      }

      await this.NfcManager.requestTechnology([this.NfcManager.NfcTech.Ndef]);
      const tag = await this.NfcManager.getTag();
      
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        const text = this.NfcManager.Ndef.text.decodePayload(record.payload);
        return JSON.parse(text);
      }
      
      throw new Error('No wallet data found on NFC tag');
    } catch (error) {
      console.error('Error reading NFC card:', error);
      throw error;
    } finally {
      try {
        if (this.NfcManager) {
          await this.NfcManager.cancelTechnologyRequest();
        }
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

  async cleanup(): Promise<void> {
    if (Platform.OS === 'web' || !this.isInitialized || !this.NfcManager) return;

    try {
      await this.NfcManager.cancelTechnologyRequest();
      this.unregisterTagEvent();
    } catch (error) {
      console.warn('Failed to cleanup NFC:', error);
    }
  }
}

export default NfcService.getInstance();
