
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { Copy, Eye, EyeOff, Download, Share } from 'lucide-react-native';
import LinearGradientButton from '@/components/common/LinearGradientButton';
import { getItemAsync } from '@/utils/storage';

export default function BackupWalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { wallet } = useWallet();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    loadMnemonic();
  }, []);

  const loadMnemonic = async () => {
    try {
      const storedMnemonic = await getItemAsync('mnemonic');
      if (storedMnemonic) {
        setMnemonic(storedMnemonic);
      }
    } catch (error) {
      console.error('Error loading mnemonic:', error);
      Alert.alert('Error', 'Failed to load wallet backup phrase');
    }
  };

  const copyToClipboard = () => {
    if (mnemonic) {
      // Web clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(mnemonic);
        Alert.alert('Copied', 'Backup phrase copied to clipboard');
      } else {
        Alert.alert('Copy', 'Please manually copy the backup phrase');
      }
    }
  };

  const shareBackup = () => {
    Alert.alert(
      'Share Backup',
      'Are you sure you want to share your backup phrase? This gives full access to your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', style: 'destructive', onPress: () => copyToClipboard() }
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    warningBox: {
      backgroundColor: '#fef3c7',
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b',
      padding: 16,
      borderRadius: 8,
      marginBottom: 24,
    },
    warningText: {
      color: '#92400e',
      fontSize: 14,
      fontWeight: '500',
    },
    mnemonicContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    mnemonicTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    mnemonicGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    wordContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      minWidth: '30%',
      alignItems: 'center',
    },
    wordNumber: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    word: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    hiddenText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      flex: 1,
      marginHorizontal: 4,
      justifyContent: 'center',
    },
    actionButtonText: {
      color: theme.colors.text,
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    instructionsContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    instructionsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    instruction: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    instructionNumber: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      width: 24,
      height: 24,
      borderRadius: 12,
      textAlign: 'center',
      lineHeight: 24,
      fontSize: 12,
      fontWeight: 'bold',
      marginRight: 12,
    },
    instructionText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

  const mnemonicWords = mnemonic.split(' ').filter(word => word.length > 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Backup Your Wallet</Text>
          <Text style={styles.subtitle}>
            Write down these 12 words in the exact order shown. This is the only way to recover your wallet.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Keep this backup phrase safe and private. Anyone with access to it can access your wallet and funds.
          </Text>
        </View>

        <View style={styles.mnemonicContainer}>
          <Text style={styles.mnemonicTitle}>Your Recovery Phrase</Text>
          
          <View style={styles.mnemonicGrid}>
            {mnemonicWords.map((word, index) => (
              <View key={index} style={styles.wordContainer}>
                <Text style={styles.wordNumber}>{index + 1}</Text>
                <Text style={showMnemonic ? styles.word : styles.hiddenText}>
                  {showMnemonic ? word : '••••••'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowMnemonic(!showMnemonic)}
            >
              {showMnemonic ? <EyeOff size={16} color={theme.colors.text} /> : <Eye size={16} color={theme.colors.text} />}
              <Text style={styles.actionButtonText}>
                {showMnemonic ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={copyToClipboard}
            >
              <Copy size={16} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={shareBackup}
            >
              <Share size={16} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Store Your Backup</Text>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Write down these words on paper in the exact order shown
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Store the paper in a safe, secure location (like a safe or bank deposit box)
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Never store this phrase digitally (screenshots, notes app, cloud storage)
            </Text>
          </View>
          
          <View style={styles.instruction}>
            <Text style={styles.instructionNumber}>4</Text>
            <Text style={styles.instructionText}>
              Consider making multiple copies stored in different secure locations
            </Text>
          </View>
        </View>

        <LinearGradientButton
          title="I've Backed Up My Wallet"
          onPress={() => router.back()}
          colors={[theme.colors.primary, theme.colors.primaryDark]}
        />
      </ScrollView>
    </View>
  );
}
