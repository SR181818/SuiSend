import * as NFC from 'expo-nfc';
import { Platform } from 'react-native';
import { getCardData, updateCard, createCard } from '@/utils/api';

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
    return await NFC.isSupported();
  }

  async startScan(): Promise<void> {
    if (this.isScanning || Platform.OS === 'web') return;
    
    this.isScanning = true;
    try {
      await NFC.scanTag();
    } catch (error) {
      console.error('Error scanning NFC:', error);
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  async writeWalletToCard(userId: string, walletData: any): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      // Create card record in database
      const card = await createCard(userId, walletData);
      
      // Write card ID to NFC tag
      await NFC.writeTag({
        id: card.id,
        type: 'wallet',
        data: walletData
      });
    } catch (error) {
      console.error('Error writing to NFC card:', error);
      throw error;
    }
  }

  async readCard(): Promise<any> {
    if (Platform.OS === 'web') return null;
    
    try {
      const tag = await NFC.readTag();
      if (!tag || !tag.id) throw new Error('Invalid NFC tag');
      
      // Get card data from database
      const cardData = await getCardData(tag.id);
      return cardData;
    } catch (error) {
      console.error('Error reading NFC card:', error);
      throw error;
    }
  }

  async updateCardBalance(cardId: string, newBalance: number): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const cardData = await getCardData(cardId);
      cardData.balance = newBalance;
      await updateCard(cardId, cardData);
      
      // Update NFC tag
      await NFC.writeTag({
        id: cardId,
        type: 'wallet',
        data: cardData
      });
    } catch (error) {
      console.error('Error updating card balance:', error);
      throw error;
    }
  }
}

export default NfcService.getInstance();