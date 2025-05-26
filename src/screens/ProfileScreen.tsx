import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNetwork } from '../contexts/NetworkContext';

const ProfileScreen = () => {
  const { profile, createWallet, importWallet } = useWallet();
  const { theme, isDark, setTheme } = useTheme();
  const { isOfflineMode, toggleOfflineMode } = useNetwork();
  
  // States for wallet creation/import modals
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  
  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };
  
  // Handle wallet creation
  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }
    
    try {
      await createWallet(walletName);
      setIsCreateModalVisible(false);
      setWalletName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet');
    }
  };
  
  // Handle wallet import
  const handleImportWallet = async () => {
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }
    
    if (!mnemonic.trim()) {
      Alert.alert('Error', 'Please enter a valid mnemonic phrase');
      return;
    }
    
    try {
      await importWallet(mnemonic, walletName);
      setIsImportModalVisible(false);
      setWalletName('');
      setMnemonic('');
    } catch (error) {
      Alert.alert('Error', 'Failed to import wallet');
    }
  };
  
  // Copy wallet address
  const copyWalletAddress = () => {
    if (profile?.walletAddress) {
      // In a real implementation, this would use Clipboard.setString(profile.walletAddress)
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, isDark && styles.profileHeaderDark]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0) || '?'}</Text>
          </View>
          
          <Text style={[styles.username, isDark && styles.usernameDark]}>{profile?.name || 'No Profile'}</Text>
          
          {profile ? (
            <TouchableOpacity 
              style={styles.addressContainer} 
              onPress={copyWalletAddress}
            >
              <Text style={[styles.address, isDark && styles.addressDark]} numberOfLines={1} ellipsizeMode="middle">
                {profile.walletAddress}
              </Text>
              <Text style={styles.copyIcon}>📋</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.noProfileActions}>
              <TouchableOpacity 
                style={styles.createButton} 
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Text style={styles.createButtonText}>Create Wallet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.importButton} 
                onPress={() => setIsImportModalVisible(true)}
              >
                <Text style={styles.importButtonText}>Import Wallet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Appearance</Text>
          
          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Dark Mode</Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  theme === 'light' && styles.activeThemeOption
                ]} 
                onPress={() => handleThemeChange('light')}
              >
                <Text style={[
                  styles.themeOptionText,
                  theme === 'light' && styles.activeThemeOptionText
                ]}>Light</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  theme === 'dark' && styles.activeThemeOption
                ]} 
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={[
                  styles.themeOptionText,
                  theme === 'dark' && styles.activeThemeOptionText
                ]}>Dark</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  theme === 'system' && styles.activeThemeOption
                ]} 
                onPress={() => handleThemeChange('system')}
              >
                <Text style={[
                  styles.themeOptionText,
                  theme === 'system' && styles.activeThemeOptionText
                ]}>System</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Network</Text>
          
          <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Offline Mode</Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                Enable to use app without internet
              </Text>
            </View>
            
            <Switch
              value={isOfflineMode}
              onValueChange={toggleOfflineMode}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Security</Text>
          
          <TouchableOpacity style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Backup Wallet</Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                Export your mnemonic phrase
              </Text>
            </View>
            
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Change PIN</Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                Update your security PIN
              </Text>
            </View>
            
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>About</Text>
          
          <TouchableOpacity style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Version</Text>
              <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                1.0.0
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Terms of Service</Text>
            </View>
            
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, isDark && styles.settingItemDark]}>
            <View>
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Privacy Policy</Text>
            </View>
            
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        {profile && (
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Create Wallet Modal */}
      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Create New Wallet</Text>
            
            <Text style={[styles.modalDescription, isDark && styles.modalDescriptionDark]}>
              Create a new wallet to store and manage your cryptocurrency.
            </Text>
            
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Wallet Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={walletName}
              onChangeText={setWalletName}
              placeholder="Enter wallet name"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setIsCreateModalVisible(false);
                  setWalletName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleCreateWallet}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Import Wallet Modal */}
      <Modal
        visible={isImportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Import Wallet</Text>
            
            <Text style={[styles.modalDescription, isDark && styles.modalDescriptionDark]}>
              Enter your mnemonic phrase to import an existing wallet.
            </Text>
            
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Wallet Name</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={walletName}
              onChangeText={setWalletName}
              placeholder="Enter wallet name"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            />
            
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Mnemonic Phrase</Text>
            <TextInput
              style={[styles.mnemonicInput, isDark && styles.inputDark]}
              value={mnemonic}
              onChangeText={setMnemonic}
              placeholder="Enter 12-word mnemonic phrase"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              multiline
              numberOfLines={3}
              secureTextEntry
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setIsImportModalVisible(false);
                  setWalletName('');
                  setMnemonic('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleImportWallet}
              >
                <Text style={styles.confirmButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeaderDark: {
    backgroundColor: '#374151',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  usernameDark: {
    color: '#F9FAFB',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: '100%',
  },
  address: {
    color: '#4B5563',
    flex: 1,
    marginRight: 8,
  },
  addressDark: {
    color: '#D1D5DB',
  },
  copyIcon: {
    fontSize: 16,
  },
  noProfileActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  importButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  importButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItemDark: {
    backgroundColor: '#374151',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingLabelDark: {
    color: '#F9FAFB',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  settingDescriptionDark: {
    color: '#9CA3AF',
  },
  settingArrow: {
    fontSize: 24,
    color: '#6B7280',
  },
  themeOptions: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 2,
  },
  themeOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeThemeOption: {
    backgroundColor: '#3B82F6',
  },
  themeOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeThemeOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalContainerDark: {
    backgroundColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalTitleDark: {
    color: '#F9FAFB',
  },
  modalDescription: {
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescriptionDark: {
    color: '#9CA3AF',
  },
  inputLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  inputLabelDark: {
    color: '#D1D5DB',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#1F2937',
    marginBottom: 16,
  },
  inputDark: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
  },
  mnemonicInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#1F2937',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;