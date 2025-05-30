
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { Scan, Send, QrCode, Plus, Wifi, WifiOff, CreditCard, Smartphone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ActionButton from '@/components/common/ActionButton';
import useNfcPayment from '@/hooks/useNfcPayment';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    walletInfo, 
    pendingTransactions, 
    isOnlineMode, 
    setCardType, 
    toggleOnlineMode, 
    processNfcTransaction, 
    syncPendingTransactions 
  } = useWallet();
  const { isNfcSupported, isScanning, startNfcPayment } = useNfcPayment();

  const handleCardTypeSelection = async (type: 'sender' | 'receiver') => {
    try {
      await setCardType(type);
      Alert.alert(
        'Card Type Set', 
        `Your device is now configured as a ${type} card. You can now tap NFC cards to ${type === 'sender' ? 'send payments' : 'receive payments'}.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to set card type');
    }
  };

  const handleNfcTap = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('NFC Not Available', 'NFC payments are only available on mobile devices');
      return;
    }
    
    if (!isNfcSupported) {
      Alert.alert('NFC Not Supported', 'NFC is not supported on this device');
      return;
    }

    if (!walletInfo.cardType) {
      Alert.alert('Card Type Not Set', 'Please select whether this device should act as a sender or receiver card first.');
      return;
    }

    try {
      // Mock NFC card data - in real implementation this would come from NFC scan
      const mockCardData = {
        id: 'card_123',
        address: '0x1234567890abcdef',
        type: walletInfo.cardType === 'sender' ? 'receiver' : 'sender'
      };

      const amount = 10; // Mock amount - in real app this would be input by user
      await processNfcTransaction(mockCardData, amount);
      
      const statusMessage = isOnlineMode && walletInfo.isOnline 
        ? 'Transaction completed successfully!' 
        : 'Transaction queued for when device goes online';
        
      Alert.alert('Transaction Processed', statusMessage);
    } catch (error) {
      Alert.alert('Transaction Failed', 'Failed to process NFC transaction');
    }
  };

  const handleSyncPending = async () => {
    try {
      await syncPendingTransactions();
      Alert.alert('Sync Complete', 'All pending transactions have been synced');
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync pending transactions');
    }
  };

  const getConnectionStatusColor = () => {
    if (!isOnlineMode) return theme.colors.warning;
    return walletInfo.isOnline ? theme.colors.success : theme.colors.error;
  };

  const getConnectionStatusText = () => {
    if (!isOnlineMode) return 'Offline Mode';
    return walletInfo.isOnline ? 'Online' : 'No Internet';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            SuiSend NFC Wallet
          </Text>
          <Text style={[styles.walletAddress, { color: theme.colors.textSecondary }]}>
            {walletInfo.address ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : 'No Wallet'}
          </Text>
        </View>

        {/* Connection Status */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statusContainer}>
          <LinearGradient
            colors={[getConnectionStatusColor() + '20', getConnectionStatusColor() + '10']}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              {isOnlineMode && walletInfo.isOnline ? (
                <Wifi size={24} color={getConnectionStatusColor()} />
              ) : (
                <WifiOff size={24} color={getConnectionStatusColor()} />
              )}
              <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
                {getConnectionStatusText()}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleOnlineMode} style={styles.modeToggle}>
              <Text style={[styles.modeToggleText, { color: theme.colors.primary }]}>
                Switch to {isOnlineMode ? 'Offline' : 'Online'} Mode
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Card Type Selection */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Card Type
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Current: {walletInfo.cardType ? walletInfo.cardType.charAt(0).toUpperCase() + walletInfo.cardType.slice(1) : 'Not Set'}
          </Text>
          
          <View style={styles.cardTypeContainer}>
            <TouchableOpacity 
              style={[
                styles.cardTypeButton, 
                { 
                  backgroundColor: walletInfo.cardType === 'sender' ? theme.colors.primary + '20' : theme.colors.surface,
                  borderColor: walletInfo.cardType === 'sender' ? theme.colors.primary : theme.colors.border
                }
              ]}
              onPress={() => handleCardTypeSelection('sender')}
            >
              <CreditCard size={32} color={walletInfo.cardType === 'sender' ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.cardTypeTitle, { color: theme.colors.text }]}>Sender Card</Text>
              <Text style={[styles.cardTypeDescription, { color: theme.colors.textSecondary }]}>
                Like Mastercard/Visa - tap to send payments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.cardTypeButton, 
                { 
                  backgroundColor: walletInfo.cardType === 'receiver' ? theme.colors.primary + '20' : theme.colors.surface,
                  borderColor: walletInfo.cardType === 'receiver' ? theme.colors.primary : theme.colors.border
                }
              ]}
              onPress={() => handleCardTypeSelection('receiver')}
            >
              <Smartphone size={32} color={walletInfo.cardType === 'receiver' ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.cardTypeTitle, { color: theme.colors.text }]}>Receiver Card</Text>
              <Text style={[styles.cardTypeDescription, { color: theme.colors.textSecondary }]}>
                Tap to receive payments into your wallet
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* NFC Actions */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            NFC Actions
          </Text>
          
          <View style={styles.actionsContainer}>
            <ActionButton
              title="Tap NFC Card"
              subtitle={`${walletInfo.cardType === 'sender' ? 'Send' : 'Receive'} Payment`}
              icon={<Scan size={24} color={theme.colors.primary} />}
              onPress={handleNfcTap}
              disabled={!walletInfo.cardType || isScanning}
            />
          </View>
        </Animated.View>

        {/* Pending Transactions */}
        {pendingTransactions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <View style={styles.pendingHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Pending Transactions ({pendingTransactions.length})
              </Text>
              {walletInfo.isOnline && (
                <TouchableOpacity onPress={handleSyncPending} style={styles.syncButton}>
                  <Text style={[styles.syncButtonText, { color: theme.colors.primary }]}>
                    Sync Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            {pendingTransactions.map((tx) => (
              <View key={tx.id} style={[styles.pendingTransaction, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.pendingTxType, { color: theme.colors.text }]}>
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </Text>
                <Text style={[styles.pendingTxAmount, { color: theme.colors.textSecondary }]}>
                  {tx.amount} SUI
                </Text>
                <Text style={[styles.pendingTxDate, { color: theme.colors.textSecondary }]}>
                  {new Date(tx.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}
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
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  walletAddress: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  modeToggle: {
    alignSelf: 'flex-start',
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  cardTypeContainer: {
    gap: 15,
  },
  cardTypeButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  cardTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  cardTypeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: 15,
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  syncButton: {
    padding: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pendingTransaction: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  pendingTxType: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingTxAmount: {
    fontSize: 14,
    marginTop: 2,
  },
  pendingTxDate: {
    fontSize: 12,
    marginTop: 2,
  },
});
