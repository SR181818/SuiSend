
import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useWallet } from '@/context/WalletContext';

export default function useNfcPayment() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletInfo, processNfcTransaction } = useWallet();

  const isNfcSupported = Platform.OS !== 'web';

  const authenticateUser = async () => {
    if (Platform.OS === 'web') return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate to ${walletInfo.cardType === 'sender' ? 'send' : 'receive'} payment`,
        fallbackLabel: 'Use passcode',
      });
      
      return result.success;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const startNfcPayment = async () => {
    if (Platform.OS === 'web' || !isNfcSupported) {
      setError('NFC not supported on this device');
      return;
    }

    if (!walletInfo.cardType) {
      setError('Please set card type first (sender or receiver)');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Authenticate user before proceeding
      const isAuthenticated = await authenticateUser();
      if (!isAuthenticated) {
        setError('Authentication failed');
        return;
      }

      // Trigger haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // In a real implementation, this would scan the actual NFC card
      // For now, we'll simulate the NFC interaction
      const mockNfcCardData = {
        id: `nfc_card_${Date.now()}`,
        address: '0x' + Math.random().toString(16).substring(2, 42),
        type: walletInfo.cardType === 'sender' ? 'receiver' : 'sender',
        balance: 100
      };

      const amount = 10; // In real app, this would be user input or predefined

      // Process the transaction through wallet context
      await processNfcTransaction(mockNfcCardData, amount);

      // Success feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      console.log(`${walletInfo.cardType} card transaction processed successfully`);
      
    } catch (error) {
      console.error('NFC payment error:', error);
      setError(`${walletInfo.cardType} transaction failed. Please try again.`);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const mockNfcScan = useCallback(async (cardType: 'sender' | 'receiver', amount: number) => {
    // This simulates scanning an NFC card
    const mockCardData = {
      id: `card_${Date.now()}`,
      address: '0x' + Math.random().toString(16).substring(2, 42),
      type: cardType,
      balance: cardType === 'sender' ? amount + 50 : 100
    };

    return mockCardData;
  }, []);

  return {
    isNfcSupported,
    isScanning,
    error,
    startNfcPayment,
    mockNfcScan,
  };
}
