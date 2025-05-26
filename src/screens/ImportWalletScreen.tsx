import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';

const ImportWalletScreen = () => {
  const [walletName, setWalletName] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigation = useNavigation();
  const { importWallet } = useWallet();
  const { isDark } = useTheme();
  
  // Navigate back to create wallet screen
  const goToCreateWallet = () => {
    navigation.navigate('CreateWallet' as never);
  };
  
  // Handle wallet import
  const handleImportWallet = async () => {
    // Validate inputs
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }
    
    if (!mnemonic.trim()) {
      Alert.alert('Error', 'Please enter your recovery phrase');
      return;
    }
    
    // Simple check for mnemonic format (12 or 24 words)
    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) {
      Alert.alert('Error', 'Recovery phrase must be 12 or 24 words');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Import wallet
      await importWallet(mnemonic, walletName);
      
      // Navigate to main app
      // Note: PIN/Password would be managed in a real implementation
    } catch (error) {
      Alert.alert('Error', 'Failed to import wallet. Please check your recovery phrase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Import Wallet</Text>
        
        <Text style={[styles.description, isDark && styles.descriptionDark]}>
          Enter your recovery phrase to restore an existing wallet.
        </Text>
        
        <View style={styles.formContainer}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Wallet Name</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={walletName}
            onChangeText={setWalletName}
            placeholder="Enter a name for your wallet"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
          
          <Text style={[styles.label, isDark && styles.labelDark]}>Recovery Phrase</Text>
          <TextInput
            style={[styles.mnemonicInput, isDark && styles.inputDark]}
            value={mnemonic}
            onChangeText={setMnemonic}
            placeholder="Enter your 12 or 24 word recovery phrase"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            multiline
            numberOfLines={4}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
          
          <Text style={[styles.label, isDark && styles.labelDark]}>PIN / Password</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a secure password"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            secureTextEntry
          />
          
          <Text style={[styles.label, isDark && styles.labelDark]}>Confirm PIN / Password</Text>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            secureTextEntry
          />
        </View>
        
        <View style={styles.securityContainer}>
          <Text style={[styles.securityTitle, isDark && styles.securityTitleDark]}>Important Notes</Text>
          
          <View style={styles.securityTipContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={[styles.securityTip, isDark && styles.securityTipDark]}>
              Recovery phrases are extremely sensitive and should never be shared
            </Text>
          </View>
          
          <View style={styles.securityTipContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={[styles.securityTip, isDark && styles.securityTipDark]}>
              Be careful when typing - misspelled words may result in a different wallet
            </Text>
          </View>
          
          <View style={styles.securityTipContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={[styles.securityTip, isDark && styles.securityTipDark]}>
              For maximum security, enter your phrase on a device that's not connected to the internet
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.importButton, isDark && styles.importButtonDark]} 
          onPress={handleImportWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.importButtonText}>Import Wallet</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.createContainer}>
          <Text style={[styles.createText, isDark && styles.createTextDark]}>
            Don't have a wallet?
          </Text>
          <TouchableOpacity onPress={goToCreateWallet}>
            <Text style={styles.createLink}>Create New Wallet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDark: {
    color: '#F9FAFB',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  descriptionDark: {
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  labelDark: {
    color: '#D1D5DB',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
  },
  mnemonicInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  securityContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  securityTitleDark: {
    color: '#F9FAFB',
  },
  securityTipContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    color: '#6B7280',
  },
  securityTip: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  securityTipDark: {
    color: '#9CA3AF',
  },
  importButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  importButtonDark: {
    backgroundColor: '#2563EB',
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    color: '#6B7280',
    marginRight: 4,
  },
  createTextDark: {
    color: '#9CA3AF',
  },
  createLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});

export default ImportWalletScreen;