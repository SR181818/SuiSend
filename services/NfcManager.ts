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

  async processPayment(): Promise<{ success: boolean; error?: string }> {
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

      const paymentData = await this.processEmvPayment(tag);
      const result = await this.sendPaymentToBackend(paymentData);

      return { success: true };
    } catch (error: any) {
      console.error('NFC payment processing error:', error);
      return { success: false, error: error.message || 'Unknown NFC error' };
    } finally {
      await this.cleanup();
    }
  }

  private async processEmvPayment(tag: TagEvent): Promise<any> {
    // Placeholder: Replace this with real EMV tag parsing logic
    return {
      tagId: tag.id,
      data: tag,
      message: 'Simulated EMV processing complete',
    };
  }

  private async sendPaymentToBackend(paymentData: any): Promise<any> {
    // Placeholder: Replace with real backend API call
    console.log('Sending payment data to backend:', paymentData);
    return { status: 'ok' };
  }

  async cleanup(): Promise<void> {
    if (Platform.OS === 'web' || !this.isInitialized) return;

    try {
      if (this.isTechRequested) {
        await NfcManager.cancelTechnologyRequest();
        this.isTechRequested = false;
        console.log('NFC tech request cancelled');
      }
    } catch (error) {
      console.warn('Failed to cleanup NFC technology request:', error);
    }
  }
}

export default NFCService.getInstance();
