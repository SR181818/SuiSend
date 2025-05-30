import { Platform } from 'react-native';
import NfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager';

class NFCService {
  private static instance: NFCService;
  private isInitialized = false;
  private isTechRequested = false;

  private constructor() {}

  static getInstance(): NFCService {
    if (!NFCService.instance) {
      NFCService.instance = new NFCService();
    }
    return NFCService.instance;
  }

  async initialize(): Promise<void> {
    if (Platform.OS === 'web' || this.isInitialized) return;

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        console.warn('NFC is not supported on this device.');
        return;
      }

      await NfcManager.start();
      this.isInitialized = true;
      console.log('NFC initialized');
    } catch (error) {
      console.error('Failed to initialize NFC:', error);
      throw error;
    }
  }

  async isSupported(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    return await NfcManager.isSupported();
  }

  async writeCardType(address: string, type: 'sender' | 'receiver'): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef);
      this.isTechRequested = true;

      const data = {
        address,
        type,
        timestamp: Date.now()
      };

      await NfcManager.writeNdefMessage([{
        recordType: "text",
        data: JSON.stringify(data)
      }]);

      console.log('Successfully wrote card type to NFC tag');
    } catch (error) {
      console.error('Error writing to NFC tag:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async processTransaction(senderAddress: string, receiverAddress: string, amount: number, isOnline: boolean): Promise<{ success: boolean; error?: string; pendingTx?: any }> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'NFC not supported on web' };
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await NfcManager.requestTechnology(NfcTech.Ndef);
      this.isTechRequested = true;

      const tag: TagEvent | null = await NfcManager.getTag();
      if (!tag) {
        return { success: false, error: 'No NFC tag detected' };
      }

      // Read card type and validate
      const cardData = await this.readCardData(tag);
      if (!cardData) {
        return { success: false, error: 'Invalid card data' };
      }

      if (isOnline) {
        // Process immediate transaction
        const result = await this.processOnlineTransaction(senderAddress, receiverAddress, amount);
        return { success: true, ...result };
      } else {
        // Create pending transaction
        const pendingTx = await this.createPendingTransaction(senderAddress, receiverAddress, amount);
        return { 
          success: true, 
          pendingTx
        };
      }
    } catch (error: any) {
      console.error('NFC transaction processing error:', error);
      return { success: false, error: error.message || 'Unknown NFC error' };
    } finally {
      await this.cleanup();
    }
  }

  private async readCardData(tag: TagEvent): Promise<any> {
    // Implementation for reading card data from NFC tag
    return null;
  }

  private async processOnlineTransaction(sender: string, receiver: string, amount: number): Promise<any> {
    // Implementation for processing online transaction
    return null;
  }

  private async createPendingTransaction(sender: string, receiver: string, amount: number): Promise<any> {
    // Implementation for creating pending transaction
    return null;
  }

  async cleanup(): Promise<void> {
    if (Platform.OS === 'web' || !this.isInitialized) return;

    try {
      if (this.isTechRequested) {
        await NfcManager.cancelTechnologyRequest();
        this.isTechRequested = false;
      }
    } catch (error) {
      console.warn('Failed to cleanup NFC:', error);
    }
  }
}

export default NFCService.getInstance();