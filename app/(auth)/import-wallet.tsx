import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Key, FileKey, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import SecureCheckbox from '@/components/common/SecureCheckbox';
import LinearGradientButton from '@/components/common/LinearGradientButton';
import { validateMnemonic, validatePrivateKey } from '@/utils/cryptoUtils';

type ImportMethod = 'mnemonic' | 'privateKey';

export default function ImportWalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { importWallet } = useWallet();
  const { setHasWallet } = useAuth();
  
  const [importMethod, setImportMethod] = useState<ImportMethod>('mnemonic');
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);
  
  const [confirmations, setConfirmations] = useState({
    understand: false,
    responsibleForFunds: false,
  });

  const allConfirmed = Object.values(confirmations).every(Boolean);

  const handleImport = async () => {
    if (!allConfirmed) {
      Alert.alert('Confirmation Required', 'Please confirm all statements before continuing.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      let isValid = false;
      
      if (importMethod === 'mnemonic') {
        isValid = validateMnemonic(input.trim());
        if (!isValid) {
          setInputError('Invalid recovery phrase. Please check your words and try again.');
          return;
        }
      } else {
        isValid = validatePrivateKey(input.trim());
        if (!isValid) {
          setInputError('Invalid private key. Please check and try again.');
          return;
        }
      }
      
      await importWallet(input.trim(), importMethod);
      setHasWallet(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error importing wallet:', error);
      Alert.alert('Import Failed', 'Unable to import wallet. Please verify your input and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleImportMethod = () => {
    setImportMethod(prev => prev === 'mnemonic' ? 'privateKey' : 'mnemonic');
    setInput('');
    setInputError(null);
  };

  const toggleConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    setInputError(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Import Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                importMethod === 'mnemonic' && styles.activeMethodButton,
                { backgroundColor: importMethod === 'mnemonic' ? theme.colors.primary : theme.colors.backgroundLight }
              ]}
              onPress={() => setImportMethod('mnemonic')}
            >
              <FileKey color={importMethod === 'mnemonic' ? theme.colors.white : theme.colors.textSecondary} size={20} />
              <Text
                style={[
                  styles.methodButtonText,
                  { color: importMethod === 'mnemonic' ? theme.colors.white : theme.colors.textSecondary }
                ]}
              >
                Recovery Phrase
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodButton,
                importMethod === 'privateKey' && styles.activeMethodButton,
                { backgroundColor: importMethod === 'privateKey' ? theme.colors.primary : theme.colors.backgroundLight }
              ]}
              onPress={() => setImportMethod('privateKey')}
            >
              <Key color={importMethod === 'privateKey' ? theme.colors.white : theme.colors.textSecondary} size={20} />
              <Text
                style={[
                  styles.methodButtonText,
                  { color: importMethod === 'privateKey' ? theme.colors.white : theme.colors.textSecondary }
                ]}
              >
                Private Key
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
              {importMethod === 'mnemonic' ? 'Recovery Phrase' : 'Private Key'}
            </Text>
            
            <Text style={[styles.inputDescription, { color: theme.colors.textSecondary }]}>
              {importMethod === 'mnemonic' 
                ? 'Enter your 12-word recovery phrase, with spaces between each word.'
                : 'Enter your private key (hex format).'
              }
            </Text>
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.backgroundLight,
                  borderColor: inputError ? theme.colors.error : theme.colors.border,
                  color: theme.colors.text,
                  height: importMethod === 'mnemonic' ? 120 : 80,
                }
              ]}
              placeholder={importMethod === 'mnemonic' 
                ? 'word1 word2 word3 word4 ...' 
                : '0x...'
              }
              placeholderTextColor={theme.colors.textTertiary}
              value={input}
              onChangeText={handleInputChange}
              multiline={importMethod === 'mnemonic'}
              numberOfLines={importMethod === 'mnemonic' ? 4 : 1}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={importMethod === 'privateKey'}
            />
            
            {inputError && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {inputError}
              </Text>
            )}
          </View>

          <View style={styles.confirmationSection}>
            <Text style={[styles.confirmationTitle, { color: theme.colors.text }]}>
              Security Confirmation
            </Text>

            <SecureCheckbox
              isChecked={confirmations.understand}
              onToggle={() => toggleConfirmation('understand')}
              label={importMethod === 'mnemonic' 
                ? "I understand that my recovery phrase provides full access to my wallet."
                : "I understand that my private key provides full access to my wallet."
              }
              theme={theme}
            />

            <SecureCheckbox
              isChecked={confirmations.responsibleForFunds}
              onToggle={() => toggleConfirmation('responsibleForFunds')}
              label="I understand that I am responsible for my funds and security."
              theme={theme}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <LinearGradientButton
            onPress={handleImport}
            disabled={!input || !allConfirmed || isLoading}
            colors={input && allConfirmed ? [theme.colors.primary, theme.colors.primaryDark] : [theme.colors.gray, theme.colors.grayDark]}
            icon={<Lock color={theme.colors.white} size={20} />}
            label={isLoading ? 'Importing Wallet...' : 'Import Wallet'}
            isLoading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
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
  },
  methodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeMethodButton: {
    borderWidth: 0,
  },
  methodButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  inputDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
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
    padding: 16,
    paddingBottom: 32,
  },
});