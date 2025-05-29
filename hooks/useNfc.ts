import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import NfcService from '@/services/NfcService';

export function useNfc() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanCard = useCallback(async () => {
    if (Platform.OS === 'web') {
      setError('NFC not supported on web');
      return null;
    }

    setIsScanning(true);
    setError(null);
    
    try {
      const cardData = await NfcService.readCard();
      return cardData;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const writeWalletToCard = useCallback(async (userId: string, walletData: any) => {
    if (Platform.OS === 'web') {
      setError('NFC not supported on web');
      return;
    }

    setError(null);
    try {
      await NfcService.writeWalletToCard(userId, walletData);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  const updateCardBalance = useCallback(async (cardId: string, newBalance: number) => {
    if (Platform.OS === 'web') {
      setError('NFC not supported on web');
      return;
    }

    setError(null);
    try {
      await NfcService.updateCardBalance(cardId, newBalance);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  return {
    isScanning,
    error,
    scanCard,
    writeWalletToCard,
    updateCardBalance,
  };
}