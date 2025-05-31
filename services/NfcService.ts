import { Platform } from 'react-native';
import NfcManager, { NfcTech, Ndef, TagEvent } from 'react-native-nfc-manager';

class NfcService {
  private static instance: NfcService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NfcService {
    if (!NfcService.instance) {
      NfcService.instance = new NfcService();
    }
    return NfcService.instance;
  }

  async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('NFC not supported on web');
      return false;
    }

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        console.warn('NFC not supported on this device');
        return false;
      }

      await NfcManager.start();
      this.isInitialized = true;
      console.log('NFC initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing NFC:', error);
      return false;
    }
  }

  async writeWalletCard(address: string, mode: 'sender' | 'receiver', balance: number): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const bytes = Ndef.encodeMessage([
        Ndef.textRecord(JSON.stringify({
          address,
          mode,
          balance,
          timestamp: Date.now()
        }))
      ]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        console.log('Successfully wrote to NFC card');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error writing to NFC card:', error);
      return false;
    } finally {
      this.cleanUp();
    }
  }

  async readWalletCard(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      if (!tag) throw new Error('No tag found');

      const ndef = await NfcManager.ndefHandler.getNdefMessage();
      if (!ndef) throw new Error('No NDEF message found');

      const decoded = Ndef.text.decodePayload(ndef.records[0].payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error reading NFC card:', error);
      throw error;
    } finally {
      this.cleanUp();
    }
  }

  private async cleanUp(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }

  async stop(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
      await NfcManager.unregisterTagEvent();
      if (this.isInitialized) {
        await NfcManager.stop();
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Error stopping NFC:', error);
    }
  }
}

export default NfcService.getInstance();