import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Copy, RefreshCw, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import MnemonicDisplay from '@/components/wallet/MnemonicDisplay';
import SecureCheckbox from '@/components/common/SecureCheckbox';
import LinearGradientButton from '@/components/common/LinearGradientButton';
import { generateMnemonic } from '@/utils/cryptoUtils';

export default function CreateWalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { createWallet } = useWallet();
  const { setHasWallet } = useAuth();

  const [mnemonic, setMnemonic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [confirmations, setConfirmations] = useState({
    understand: false,
    backedUp: false,
    responsibleForFunds: false,
  });

  const allConfirmed = Object.values(confirmations).every(Boolean);

  useEffect(() => {
    generateNewMnemonic();
  }, []);

  const generateNewMnemonic = async () => {
    setIsLoading(true);
    try {
      const newMnemonic = await generateMnemonic();
      setMnemonic(newMnemonic);
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      Alert.alert('Error', 'Failed to generate wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(mnemonic);
      }
      setHasCopied(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setTimeout(() => setHasCopied(false), 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleCreateWallet = async () => {
    if (!allConfirmed) {
      Alert.alert('Confirmation Required', 'Please confirm all statements before continuing.');
      return;
    }

    setIsLoading(true);
    try {
      await createWallet(mnemonic);
      setHasWallet(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', 'Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isLoading && !mnemonic) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Generating your secure wallet...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create Wallet</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mnemonicSection}>
          <View style={styles.mnemonicHeader}>
            <Text style={[styles.mnemonicTitle, { color: theme.colors.text }]}>
              Your Recovery Phrase
            </Text>
            <TouchableOpacity 
              onPress={generateNewMnemonic}
              style={[styles.refreshButton, { backgroundColor: theme.colors.backgroundLight }]}
            >
              <RefreshCw color={theme.colors.primary} size={16} />
              <Text style={[styles.refreshText, { color: theme.colors.primary }]}>
                Generate New
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.mnemonicDescription, { color: theme.colors.textSecondary }]}>
            Write down these 12 words in order and keep them in a secure place. Anyone with access to this phrase can recover your wallet.
          </Text>

          <MnemonicDisplay mnemonic={mnemonic} />

          <TouchableOpacity 
            style={[styles.copyButton, { borderColor: theme.colors.border }]}
            onPress={copyToClipboard}
          >
            <Copy color={hasCopied ? theme.colors.success : theme.colors.primary} size={16} />
            <Text 
              style={[
                styles.copyText, 
                { color: hasCopied ? theme.colors.success : theme.colors.primary }
              ]}
            >
              {hasCopied ? 'Copied!' : 'Copy to Clipboard'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.confirmationSection}>
          <Text style={[styles.confirmationTitle, { color: theme.colors.text }]}>
            Security Confirmation
          </Text>

          <SecureCheckbox
            isChecked={confirmations.understand}
            onToggle={() => toggleConfirmation('understand')}
            label="I understand that my recovery phrase is the only way to access my wallet."
            theme={theme}
          />

          <SecureCheckbox
            isChecked={confirmations.backedUp}
            onToggle={() => toggleConfirmation('backedUp')}
            label="I have written down my recovery phrase and stored it securely."
            theme={theme}
          />

          <SecureCheckbox
            isChecked={confirmations.responsibleForFunds}
            onToggle={() => toggleConfirmation('responsibleForFunds')}
            label="I understand that I am responsible for my funds and recovery phrase."
            theme={theme}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <LinearGradientButton
          onPress={handleCreateWallet}
          disabled={!allConfirmed || isLoading}
          colors={allConfirmed ? [theme.colors.primary, theme.colors.primaryDark] : [theme.colors.gray, theme.colors.grayDark]}
          icon={<Lock color={theme.colors.white} size={20} />}
          label={isLoading ? 'Creating Wallet...' : 'Create My Wallet'}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120, // Increased bottom padding for button space
  },
  mnemonicSection: {
    marginBottom: 24,
  },
  mnemonicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mnemonicTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  refreshText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  mnemonicDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  copyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  confirmationSection: {
    marginBottom: 24,
  },
  confirmationTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
});