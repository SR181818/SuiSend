
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { Shield, Copy, Download, Eye, EyeOff, AlertTriangle } from 'lucide-react-native';
import MnemonicDisplay from '@/components/wallet/MnemonicDisplay';
import LinearGradientButton from '@/components/common/LinearGradientButton';

export default function BackupWalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { walletInfo } = useWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  
  // Mock mnemonic for demonstration
  const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const handleCopyMnemonic = () => {
    // In a real app, you'd copy to clipboard
    Alert.alert('Copied', 'Recovery phrase copied to clipboard');
  };

  const handleDownloadBackup = () => {
    Alert.alert('Download', 'Backup file would be downloaded');
  };

  const handleContinue = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
            <AlertTriangle color={theme.colors.warning} size={32} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Backup Your Wallet
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Save your recovery phrase to restore your wallet if needed
          </Text>
        </View>

        <View style={[styles.warningBox, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error }]}>
          <Shield color={theme.colors.error} size={20} />
          <Text style={[styles.warningText, { color: theme.colors.error }]}>
            Never share your recovery phrase. Anyone with access can control your wallet.
          </Text>
        </View>

        <View style={styles.mnemonicSection}>
          <View style={styles.mnemonicHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recovery Phrase
            </Text>
            <TouchableOpacity
              onPress={() => setShowMnemonic(!showMnemonic)}
              style={styles.toggleButton}
            >
              {showMnemonic ? (
                <EyeOff color={theme.colors.textSecondary} size={20} />
              ) : (
                <Eye color={theme.colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </View>

          {showMnemonic && (
            <MnemonicDisplay 
              mnemonic={mnemonic}
              onCopy={handleCopyMnemonic}
            />
          )}
        </View>

        <View style={styles.actionButtons}>
          <LinearGradientButton
            onPress={handleCopyMnemonic}
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            label="Copy to Clipboard"
            icon={<Copy size={20} color="white" />}
          />

          <LinearGradientButton
            onPress={handleDownloadBackup}
            colors={[theme.colors.secondary, theme.colors.secondaryDark]}
            label="Download Backup"
            icon={<Download size={20} color="white" />}
          />
        </View>

        <LinearGradientButton
          onPress={handleContinue}
          colors={[theme.colors.success, theme.colors.successDark]}
          label="I've Saved My Recovery Phrase"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  mnemonicSection: {
    marginBottom: 30,
  },
  mnemonicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 30,
  },
});
