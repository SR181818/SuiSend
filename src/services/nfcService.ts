import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

// The NFC data structure we expect to read from and write to NTAG215 cards
export interface NfcCardData {
  wallet_address: string;
  last_balance: number;
  unspent_objects: string[];
  pending_spend: {
    to: string;
    amount: number;
    timestamp: number;
  }[];
}

class NfcService {
  // Initialize NFC
  public async init(): Promise<boolean> {
    try {
      const isSupported = await NfcManager.isSupported();
      if (isSupported) {
        await NfcManager.start();
      }
      return isSupported;
    } catch (error) {
      console.error('Error initializing NFC:', error);
      return false;
    }
  }

  // Clean up NFC resources
  public async cleanup(): Promise<void> {
    try {
      await NfcManager.cancelTechnologyRequest();
      NfcManager.unregisterTagEvent();
    } catch (error) {
      console.error('Error cleaning up NFC:', error);
    }
  }

  // Read data from NFC card
  public async readNfcCard(): Promise<NfcCardData | null> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      const tag = await NfcManager.getTag();
      const ndef = tag?.ndefMessage;
      
      if (!ndef || ndef.length === 0) {
        return null;
      }
      
      // Decode the NDEF message (first record)
      const payload = ndef[0].payload;
      const textDecoder = new TextDecoder();
      // Skip first 3 bytes (NDEF encoding bytes) to get pure JSON content
      const data = textDecoder.decode(payload.slice(3));
      
      // Parse and validate the data
      try {
        const cardData = JSON.parse(data) as NfcCardData;
        if (!this.validateCardData(cardData)) {
          throw new Error('Invalid card data format');
        }
        return cardData;
      } catch (parseError) {
        console.error('Error parsing NFC data:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error reading NFC card:', error);
      return null;
    } finally {
      this.cleanup();
    }
  }

  // Write data to NFC card
  public async writeNfcCard(data: NfcCardData): Promise<boolean> {
    try {
      // Validate data before writing
      if (!this.validateCardData(data)) {
        throw new Error('Invalid card data format');
      }
      
      await NfcManager.requestTechnology(NfcTech.Ndef);
      
      // Convert data to JSON string
      const jsonStr = JSON.stringify(data);
      
      // Create NDEF text record
      const bytes = Ndef.encodeMessage([Ndef.textRecord(jsonStr)]);
      
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error writing to NFC card:', error);
      return false;
    } finally {
      this.cleanup();
    }
  }
  
  // Validate the NFC card data structure
  private validateCardData(data: any): data is NfcCardData {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.wallet_address !== 'string') return false;
    if (typeof data.last_balance !== 'number') return false;
    
    // Check unspent_objects is an array of strings
    if (!Array.isArray(data.unspent_objects)) return false;
    if (data.unspent_objects.some(obj => typeof obj !== 'string')) return false;
    
    // Check pending_spend is an array of valid transaction objects
    if (!Array.isArray(data.pending_spend)) return false;
    for (const tx of data.pending_spend) {
      if (typeof tx !== 'object') return false;
      if (typeof tx.to !== 'string') return false;
      if (typeof tx.amount !== 'number') return false;
      if (typeof tx.timestamp !== 'number') return false;
    }
    
    return true;
  }
}

// Export a singleton instance
export const nfcService = new NfcService();