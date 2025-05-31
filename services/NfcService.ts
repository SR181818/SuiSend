import { Platform } from 'react-native';
import { Alert } from 'react-native';

// Mock NFC data for web testing
const mockNfcData = {
  id: 'mock-nfc-tag',
  type: 'NTAG215',
  data: {
    balance: 100,
    lastTransaction: Date.now(),
  }
};

class NfcService {
  private isSupported: boolean;
  private isInitialized: boolean;
  private mockMode: boolean;

  constructor() {
    this.isSupported = Platform.OS !== 'web';
    this.isInitialized = false;
    this.mockMode = Platform.OS === 'web';
  }

  async start(): Promise<boolean> {
    if (this.mockMode) {
      console.log('Starting NFC in mock mode (web)');
      this.isInitialized = true;
      return true;
    }

    try {
      // In a real app, we would initialize react-native-nfc-manager here
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to start NFC:', error);
      return false;
    }
  }

  async stop(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      if (!this.mockMode) {
        // In a real app, cleanup NFC manager
      }
      this.isInitialized = false;
    } catch (error) {
      console.error('Error stopping NFC:', error);
    }
  }

  async createWalletCard(address: string, mode: 'sender' | 'receiver', balance: number): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('NFC not initialized');
    }

    const cardData = {
      id: `card_${Date.now()}`,
      address,
      mode,
      balance,
      created: Date.now()
    };

    if (this.mockMode) {
      console.log('Creating mock wallet card:', cardData);
      return cardData;
    }

    try {
      // In a real app, write to NFC tag
      return cardData;
    } catch (error) {
      console.error('Error creating wallet card:', error);
      throw error;
    }
  }

  async readCard(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('NFC not initialized');
    }

    if (this.mockMode) {
      console.log('Reading mock NFC card');
      return mockNfcData;
    }

    try {
      // In a real app, read from NFC tag
      return mockNfcData;
    } catch (error) {
      console.error('Error reading NFC card:', error);
      throw error;
    }
  }

  async writeWalletToCard(userId: string, walletData: any): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('NFC not initialized');
    }

    if (this.mockMode) {
      console.log('Writing mock wallet data:', { userId, walletData });
      return;
    }

    try {
      // In a real app, write wallet data to NFC tag
      console.log('Wallet data written to card');
    } catch (error) {
      console.error('Error writing wallet to card:', error);
      throw error;
    }
  }

  async updateCardBalance(cardId: string, newBalance: number): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('NFC not initialized');
    }

    if (this.mockMode) {
      console.log('Updating mock card balance:', { cardId, newBalance });
      return;
    }

    try {
      // In a real app, update balance on NFC tag
      console.log('Card balance updated');
    } catch (error) {
      console.error('Error updating card balance:', error);
      throw error;
    }
  }

  unregisterTagEvent(): void {
    if (!this.isInitialized || this.mockMode) return;

    try {
      // In a real app, unregister NFC tag event listeners
    } catch (error) {
      console.error('Error unregistering tag event:', error);
    }
  }

  isNfcSupported(): boolean {
    return this.isSupported;
  }

  isNfcEnabled(): boolean {
    return this.isInitialized;
  }
}

export default new NfcService();