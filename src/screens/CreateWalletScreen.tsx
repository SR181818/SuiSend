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

const CreateWalletScreen = () => {
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigation = useNavigation();
  const { createWallet } = useWallet();
  const { isDark } = useTheme();
  
  // Navigate to import wallet screen
  const goToImportWallet = () => {
    navigation.navigate('ImportWallet' as never);
  };
  
  // Handle wallet creation
  const handleCreateWallet = async () => {
    // Validate inputs
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
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
      
      // Create wallet
      await createWallet(walletName);
      
      // Navigate to main app
      // In a real app, we might show a screen with recovery phrase
      // Note: PIN/Password would be managed in a real implementation
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Create New Wallet</Text>
        
        <Text style={[styles.description, isDark && styles.descriptionDark]}>
          Create a new wallet to securely store and manage your cryptocurrency.
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
          <Text style={[styles.securityTitle, isDark && styles.securityTitleDark]}>Security Tips</Text>
          
          <View style={styles.securityTipContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={[styles.securityTip, isDark && styles.securityTipDark]}>
              Use a strong, unique password that you don't use elsewhere
            </Text>
          </View>
          
          <View style={styles.securityTipContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={[styles.securityTip, isDark && styles.securityTipDark]}>
              Never share your recovery phrase or password with anyone
            </Text>
          </View>
          
          <View style={styles.securityTipContainer}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={[styles.securityTip, isDark && styles.securityTipDark]}>
              Back up your recovery phrase in a secure location
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.createButton, isDark && styles.createButtonDark]} 
          onPress={handleCreateWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Wallet</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.importContainer}>
          <Text style={[styles.importText, isDark && styles.importTextDark]}>
            Already have a wallet?
          </Text>
          <TouchableOpacity onPress={goToImportWallet}>
            <Text style={styles.importLink}>Import Instead</Text>
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
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonDark: {
    backgroundColor: '#2563EB',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  importContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  importText: {
    color: '#6B7280',
    marginRight: 4,
  },
  importTextDark: {
    color: '#9CA3AF',
  },
  importLink: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});

export default CreateWalletScreen;