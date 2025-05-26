import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const ScanScreen = () => {
  const { 
    scanNfcCard, 
    nfcStatus, 
    isLoading,
    cards
  } = useWallet();
  
  const { isDark } = useTheme();
  const navigation = useNavigation();
  
  // Automatically start scanning when the screen is focused
  useEffect(() => {
    const startScan = async () => {
      const success = await scanNfcCard();
      if (success) {
        // If scan was successful, navigate to the Cards screen
        navigation.navigate('Cards' as never);
      }
    };
    
    startScan();
  }, []);
  
  // Handle manual scan initiation
  const handleScan = async () => {
    const success = await scanNfcCard();
    if (success) {
      // If scan was successful, navigate to the Cards screen
      navigation.navigate('Cards' as never);
    }
  };
  
  // Cancel scanning and go back
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <View style={[styles.scanArea, nfcStatus === 'scanning' && styles.activeScanArea]}>
          {nfcStatus === 'scanning' ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : (
            <View style={styles.nfcIcon}>
              <Text style={styles.nfcIconText}>📶</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
          {nfcStatus === 'scanning' ? 'Scanning for NFC cards...' : 
           nfcStatus === 'detected' ? 'Card detected!' : 
           nfcStatus === 'writing' ? 'Writing to card...' : 
           nfcStatus === 'error' ? 'Error reading card' : 
           'Tap an NFC card to scan'}
        </Text>
        
        <Text style={[styles.instructionText, isDark && styles.instructionTextDark]}>
          Hold your NFC card close to the back of your device
        </Text>
        
        <View style={styles.buttonContainer}>
          {nfcStatus === 'scanning' ? (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.scanButton} 
                onPress={handleScan}
              >
                <Text style={styles.scanButtonText}>Scan Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {cards.length > 0 && (
          <TouchableOpacity 
            style={styles.cardsButton} 
            onPress={() => navigation.navigate('Cards' as never)}
          >
            <Text style={styles.cardsButtonText}>View My Cards</Text>
          </TouchableOpacity>
        )}
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanArea: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  activeScanArea: {
    borderColor: '#3B82F6',
    borderWidth: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nfcIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcIconText: {
    fontSize: 48,
    transform: [{ rotate: '90deg' }]
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusTextDark: {
    color: '#F9FAFB',
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  instructionTextDark: {
    color: '#9CA3AF',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardsButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cardsButtonText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});

export default ScanScreen;