import { Platform } from 'react-native';

let NfcManager: any = null;
let NfcTech: any = null;

// Dynamically import NFC Manager only on native platforms
if (Platform.OS !== 'web') {
  try {
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default;
    NfcTech = nfcModule.NfcTech;
  } catch (error) {
    console.log('NFC Manager not available:', error);
  }
}

class NfcService {
  private static instance: NfcService;
  private isScanning: boolean = false;
  private isWriting: boolean = false;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): NfcService {
    if (!NfcService.instance) {
      NfcService.instance = new NfcService();
    }
    return NfcService.instance;
  }

  async start(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('NFC not supported on web platform');
      return;
    }

    if (!NfcManager) {
      throw new Error('NFC Manager not available');
    }

    try {
      if (!this.isInitialized) {
        await NfcManager.start();
        this.isInitialized = true;
        console.log('NFC Manager started successfully');
      }
    } catch (error) {
      console.error('Failed to start NFC Manager:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (Platform.OS === 'web' || !NfcManager) return;

    try {
      await NfcManager.stop();
      this.isInitialized = false;
      console.log('NFC Manager stopped');
    } catch (error) {
      console.error('Failed to stop NFC Manager:', error);
    }
  }

  async isSupported(): Promise<boolean> {
    if (Platform.OS === 'web' || !NfcManager) return false;

    try {
      return await NfcManager.isSupported();
    } catch (error) {
      console.log('NFC not supported:', error);
      return false;
    }
  }

  async scanTag(): Promise<any> {
    if (Platform.OS === 'web' || !NfcManager) {
      throw new Error('NFC not supported');
    }

    try {
      if (!this.isInitialized) {
        await this.start();
      }

      this.isScanning = true;
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      return tag;
    } catch (error) {
      console.error('Error scanning NFC tag:', error);
      throw error;
    } finally {
      this.isScanning = false;
      await this.cleanup();
    }
  }

  async writeTag(data: any): Promise<void> {
    if (Platform.OS === 'web' || !NfcManager) {
      throw new Error('NFC not supported');
    }

    try {
      if (!this.isInitialized) {
        await this.start();
      }

      this.isWriting = true;
      await NfcManager.requestTechnology(NfcTech.Ndef);

      await NfcManager.writeNdefMessage([{
        recordType: "text",
        data: JSON.stringify(data)
      }]);

      console.log('Successfully wrote data to NFC tag');
    } catch (error) {
      console.error('Error writing to NFC tag:', error);
      throw error;
    } finally {
      this.isWriting = false;
      await this.cleanup();
    }
  }

  private async cleanup(): Promise<void> {
    if (Platform.OS === 'web' || !NfcManager) return;

    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  isCurrentlyWriting(): boolean {
    return this.isWriting;
  }
}

// Export the singleton instance
const nfcService = NfcService.getInstance();
export default nfcService;