import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { CreditCard, Smartphone, CircleAlert as AlertCircle } from 'lucide-react-native';
import NfcService from '@/services/NfcService';
import LinearGradientButton from '@/components/common/LinearGradientButton';

export default function CreateCardScreen() {
  const { theme } = useTheme();
  const { wallet } = useWallet();
  const [isNfcSupported, setIsNfcSupported] = useState(false);
  const [selectedType, setSelectedType] = useState<'sender' | 'receiver' | null>(null);
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    checkNfcSupport();
  }, []);

  const checkNfcSupport = async () => {
    const supported = await NfcService.initialize();
    setIsNfcSupported(supported);
  };

  const handleCreateCard = async () => {
    if (!selectedType || !wallet?.address) {
      Alert.alert('Error', 'Please select a card type first');
      return;
    }

    setIsWriting(true);
    try {
      const success = await NfcService.writeWalletCard(
        wallet.address,
        selectedType,
        wallet.balance || 0
      );

      if (success) {
        Alert.alert(
          'Success',
          'Card created successfully! You can now use it for NFC payments.'
        );
      } else {
        Alert.alert('Error', 'Failed to write to NFC card. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create card. Please try again.');
    } finally {
      setIsWriting(false);
    }
  };

  if (!isNfcSupported) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <AlertCircle color={theme.colors.error} size={48} />
          <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
            NFC Not Supported
          </Text>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            Your device does not support NFC or NFC is disabled. Please enable NFC in your device settings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Create NFC Card
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Select the type of card you want to create
        </Text>

        <View style={styles.cardTypes}>
          <TouchableOpacity
            style={[
              styles.cardOption,
              { backgroundColor: theme.colors.backgroundLight },
              selectedType === 'sender' && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedType('sender')}
          >
            <CreditCard 
              color={selectedType === 'sender' ? theme.colors.primary : theme.colors.textSecondary}
              size={32}
            />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Sender Card
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Acts like a payment card. Tap to send money to others.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardOption,
              { backgroundColor: theme.colors.backgroundLight },
              selectedType === 'receiver' && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={() => setSelectedType('receiver')}
          >
            <Smartphone
              color={selectedType === 'receiver' ? theme.colors.primary : theme.colors.textSecondary}
              size={32}
            />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Receiver Card
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              Acts like a POS terminal. Tap to receive payments.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
            How to Create Your Card
          </Text>
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>1</Text>
            <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
              Select the type of card you want to create above
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>2</Text>
            <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
              Press "Create Card" and hold an NFC tag near your device
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>3</Text>
            <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
              Keep the tag still until the process completes
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradientButton
          title={isWriting ? 'Writing to Card...' : 'Create Card'}
          onPress={handleCreateCard}
          disabled={!selectedType || isWriting}
          colors={[theme.colors.primary, theme.colors.primaryDark]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  cardTypes: {
    gap: 16,
    marginBottom: 32,
  },
  cardOption: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructions: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});