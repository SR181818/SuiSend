
import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { useWallet } from '@/context/WalletContext';

export default function useNfcPayment() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletInfo, processNfcTransaction, isOnlineMode } = useWallet();

  const isNfcSupported = Platform.OS !== 'web';

  const authenticateUser = async () => {
    if (Platform.OS === 'web') return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate to ${walletInfo.cardType === 'sender' ? 'send payment' : 'receive payment'}`,
        fallbackLabel: 'Use passcode',
      });
      
      return result.success;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const processSenderCardTap = async (amount: number, receiverAddress?: string) => {
    // Sender card acts like a debit/credit card - sends money when tapped
    if (!receiverAddress) {
      // In real implementation, this would come from the receiver device/card
      receiverAddress = '0x' + Math.random().toString(16).substring(2, 42);
    }

    const transactionData = {
      id: `tx_${Date.now()}`,
      type: 'send' as const,
      amount,
      from: walletInfo.address,
      to: receiverAddress,
      timestamp: Date.now(),
      status: isOnlineMode && walletInfo.isOnline ? 'completed' : 'pending'
    };

    if (isOnlineMode && walletInfo.isOnline) {
      console.log('🟢 ONLINE: Processing sender card transaction immediately');
      // Process transaction immediately using Sui client
      await processNfcTransaction(transactionData, amount);
      
      Alert.alert(
        '✅ Payment Sent',
        `Successfully sent ${amount} SUI to ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)}`
      );
    } else {
      console.log('🔴 OFFLINE: Queuing sender card transaction');
      // Queue transaction for later processing
      await processNfcTransaction(transactionData, amount);
      
      Alert.alert(
        '⏳ Payment Queued',
        `Payment of ${amount} SUI will be sent when device comes online`
      );
    }
  };

  const processReceiverCardTap = async (amount: number, senderAddress?: string) => {
    // Receiver card acts like a POS terminal - pulls money when tapped
    if (!senderAddress) {
      // In real implementation, this would come from the sender device/card
      senderAddress = '0x' + Math.random().toString(16).substring(2, 42);
    }

    const transactionData = {
      id: `tx_${Date.now()}`,
      type: 'receive' as const,
      amount,
      from: senderAddress,
      to: walletInfo.address,
      timestamp: Date.now(),
      status: isOnlineMode && walletInfo.isOnline ? 'completed' : 'pending'
    };

    if (isOnlineMode && walletInfo.isOnline) {
      console.log('🟢 ONLINE: Processing receiver card transaction immediately');
      // Process transaction immediately using Sui client
      await processNfcTransaction(transactionData, amount);
      
      Alert.alert(
        '✅ Payment Received',
        `Successfully received ${amount} SUI from ${senderAddress.slice(0, 6)}...${senderAddress.slice(-4)}`
      );
    } else {
      console.log('🔴 OFFLINE: Queuing receiver card transaction');
      // Queue transaction for later processing
      await processNfcTransaction(transactionData, amount);
      
      Alert.alert(
        '⏳ Payment Queued',
        `Payment request of ${amount} SUI will be processed when device comes online`
      );
    }
  };

  const startNfcPayment = async (amount: number = 10) => {
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

      // Process based on card type
      if (walletInfo.cardType === 'sender') {
        await processSenderCardTap(amount);
      } else {
        await processReceiverCardTap(amount);
      }

      // Success feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

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

  return {
    isNfcSupported,
    isScanning,
    error,
    startNfcPayment,
    processSenderCardTap,
    processReceiverCardTap,
  };
}
