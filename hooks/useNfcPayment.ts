import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import NfcManager from '@/services/NfcManager';

export default function useNfcPayment() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNfcSupported = Platform.OS !== 'web' && NfcManager.isSupported();

  const authenticateUser = async () => {
    if (Platform.OS === 'web') return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to make payment',
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

      // Start NFC payment process
      const result = await NfcManager.processPayment();
      
      if (result.success) {
        // Handle successful payment
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setError(result.error || 'Payment failed');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('NFC payment error:', error);
      setError('Payment failed. Please try again.');
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
  };
}