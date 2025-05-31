
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { Copy, Download, Shield, AlertTriangle } from 'lucide-react-native';
import MnemonicDisplay from '@/components/wallet/MnemonicDisplay';
import ActionButton from '@/components/common/ActionButton';

export default function BackupWalletScreen() {
  const { theme } = useTheme();
  const { wallet } = useWallet();
  const router = useRouter();
  const [isBackedUp, setIsBackedUp] = useState(false);

  const handleCopyMnemonic = () => {
    if (wallet?.mnemonic) {
      // Copy to clipboard functionality would go here
      Alert.alert('Copied', 'Seed phrase copied to clipboard');
    }
  };

  const handleDownloadBackup = () => {
    Alert.alert('Download', 'Backup file would be downloaded');
  };

  const handleConfirmBackup = () => {
    setIsBackedUp(true);
    Alert.alert('Success', 'Wallet backup confirmed', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Shield color={theme.colors.primary} size={48} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Backup Your Wallet
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Save your seed phrase to restore your wallet if needed
          </Text>
        </View>

        <View style={[styles.warningBox, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
          <AlertTriangle color={theme.colors.warning} size={24} />
          <Text style={[styles.warningText, { color: theme.colors.warning }]}>
            Never share your seed phrase with anyone. Store it securely offline.
          </Text>
        </View>

        {wallet?.mnemonic && (
          <View style={styles.mnemonicSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Your Seed Phrase
            </Text>
            <MnemonicDisplay mnemonic={wallet.mnemonic} />
          </View>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundLight }]}
            onPress={handleCopyMnemonic}
          >
            <Copy color={theme.colors.primary} size={20} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Copy to Clipboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.backgroundLight }]}
            onPress={handleDownloadBackup}
          >
            <Download color={theme.colors.primary} size={20} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              Download Backup
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="I've Backed Up My Wallet"
          onPress={handleConfirmBackup}
          disabled={!wallet?.mnemonic}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  warningText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  mnemonicSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    padding: 16,
  },
});
