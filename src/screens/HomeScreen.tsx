import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../contexts/WalletContext';
import { useNetwork } from '../contexts/NetworkContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

const HomeScreen = () => {
  const { 
    cards, 
    transactions, 
    balance, 
    fiatValue, 
    scanNfcCard, 
    isLoading,
    setSelectedCard,
    sendTransaction,
    profile
  } = useWallet();
  
  const { isOfflineMode, toggleOfflineMode } = useNetwork();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  
  // Get only 3 most recent transactions
  const recentTransactions = transactions.slice(0, 3);

  // Handle NFC scanning
  const handleScanNfc = async () => {
    setSelectedCard(null);
    await scanNfcCard();
  };
  
  // Handle send function
  const handleSend = () => {
    Alert.alert(
      'Send SUI',
      'Enter transaction details',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Continue',
          onPress: () => {
            // In a real app, you would show a form for amount, recipient, etc.
            // For demo purposes, we'll simulate a transaction
            sendTransaction(0.1, '0xdemo_recipient', 'Test transaction', true)
              .then(tx => {
                if (tx) {
                  Alert.alert(
                    'Success',
                    `Transaction sent: ${tx.amount} SUI`
                  );
                }
              })
              .catch(error => {
                Alert.alert('Error', error.message);
              });
          }
        }
      ]
    );
  };
  
  // Handle receive function
  const handleReceive = () => {
    if (profile) {
      Alert.alert(
        'Receive Funds',
        `Your wallet address:\n${profile.walletAddress}`,
        [
          { text: 'Copy Address', onPress: () => Alert.alert('Copied!', 'Address copied to clipboard') },
          { text: 'Close', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert('Error', 'Wallet profile not found');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'A'}</Text>
              </View>
              <View>
                <Text style={[styles.welcomeText, isDark && styles.welcomeTextDark]}>Welcome back</Text>
                <Text style={[styles.username, isDark && styles.usernameDark]}>{profile?.name || 'User'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellIcon}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, isDark && styles.balanceLabelDark]}>Your Balance</Text>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceAmount, isDark && styles.balanceAmountDark]}>{balance} SUI</Text>
              <Text style={[styles.fiatValue, isDark && styles.fiatValueDark]}>≈ ${fiatValue}</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, styles.activeDot]} />
                <Text style={[styles.statusText, isDark && styles.statusTextDark]}>Active</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, isOfflineMode ? styles.offlineDot : styles.onlineDot]} />
                <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
                  {isOfflineMode ? 'Offline' : 'Online'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Network Toggle */}
        <View style={[styles.networkCard, isDark && styles.networkCardDark]}>
          <View>
            <Text style={[styles.networkCardTitle, isDark && styles.networkCardTitleDark]}>Network Status</Text>
            <Text style={[styles.networkCardSubtitle, isDark && styles.networkCardSubtitleDark]}>
              {isOfflineMode ? 'Offline Mode' : 'Online Mode'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.networkToggle, isOfflineMode ? styles.networkToggleOff : styles.networkToggleOn]} 
            onPress={toggleOfflineMode}
          >
            <Text style={styles.networkToggleText}>{isOfflineMode ? 'Go Online' : 'Go Offline'}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
            <View style={[styles.actionIcon, styles.sendIcon, isDark && styles.actionIconDark]}>
              <Text style={styles.actionIconText}>↗️</Text>
            </View>
            <Text style={[styles.actionText, isDark && styles.actionTextDark]}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
            <View style={[styles.actionIcon, styles.receiveIcon, isDark && styles.actionIconDark]}>
              <Text style={styles.actionIconText}>↘️</Text>
            </View>
            <Text style={[styles.actionText, isDark && styles.actionTextDark]}>Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleScanNfc}>
            <View style={[styles.actionIcon, styles.scanIcon, isDark && styles.actionIconDark]}>
              <Text style={styles.actionIconText}>📱</Text>
            </View>
            <Text style={[styles.actionText, isDark && styles.actionTextDark]}>Scan NFC</Text>
          </TouchableOpacity>
        </View>
        
        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History' as never)}>
            <Text style={[styles.sectionAction, isDark && styles.sectionActionDark]}>View all</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length === 0 ? (
          <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
            <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
              No recent transactions
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {recentTransactions.map((tx) => (
              <View key={tx.id} style={[styles.transactionItem, isDark && styles.transactionItemDark]}>
                <View style={[styles.transactionIcon, 
                  tx.type === 'received' ? styles.receivedIcon : 
                  tx.type === 'sent' ? styles.sentIcon : 
                  styles.pendingIcon
                ]}>
                  <Text style={styles.transactionIconText}>
                    {tx.type === 'received' ? '↓' : 
                     tx.type === 'sent' ? '↑' : '⏱'}
                  </Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionTitle, isDark && styles.transactionTitleDark]}>
                    {tx.type === 'received' ? 'Received' : 
                     tx.type === 'sent' ? 'Sent' : 'Pending'}
                  </Text>
                  <Text style={[styles.transactionSubtitle, isDark && styles.transactionSubtitleDark]}>
                    {tx.type === 'received' && tx.from ? `From: ${tx.from}` :
                     (tx.to ? `To: ${tx.to}` : 'Unknown')}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText, 
                    tx.type === 'received' ? styles.receivedAmount : styles.sentAmount,
                    isDark && styles.transactionAmountTextDark
                  ]}>
                    {tx.type === 'received' ? '+' : '-'}{tx.amount} SUI
                  </Text>
                  <Text style={[styles.transactionDate, isDark && styles.transactionDateDark]}>
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        {/* My Cards */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>My NFC Cards</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cards' as never)}>
            <Text style={[styles.sectionAction, isDark && styles.sectionActionDark]}>View all</Text>
          </TouchableOpacity>
        </View>
        
        {cards.length === 0 ? (
          <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
            <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
              No NFC cards added yet
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton} 
              onPress={handleScanNfc}
            >
              <Text style={styles.emptyStateButtonText}>Scan a card to add it</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
          >
            {cards.map((card) => (
              <TouchableOpacity 
                key={card.id} 
                style={[styles.cardItem, { backgroundColor: card.color === 'blue' ? '#3B82F6' : '#8B5CF6' }]}
                onPress={() => {
                  setSelectedCard(card);
                  navigation.navigate('Cards' as never);
                }}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardType}>{card.type} Card</Text>
                    <Text style={styles.cardName}>{card.name}</Text>
                  </View>
                  <View style={styles.nfcIcon}>
                    <Text style={styles.nfcIconText}>📶</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardBalanceLabel}>Balance</Text>
                    <Text style={styles.cardBalance}>{card.balance} SUI</Text>
                  </View>
                  <View style={styles.cardStatus}>
                    <View style={styles.cardStatusDot} />
                    <Text style={styles.cardStatusText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.cardAddress}>{card.address.substring(0, 10)}...</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.addCardItem, isDark && styles.addCardItemDark]} 
              onPress={handleScanNfc}
            >
              <View style={[styles.addCardIcon, isDark && styles.addCardIconDark]}>
                <Text style={[styles.addCardIconText, isDark && styles.addCardIconTextDark]}>+</Text>
              </View>
              <Text style={[styles.addCardText, isDark && styles.addCardTextDark]}>Add new card</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </ScrollView>
      
      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Processing...</Text>
          </View>
        </View>
      )}
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
  header: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerDark: {
    backgroundColor: '#2563EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  welcomeTextDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  usernameDark: {
    color: 'white',
  },
  bellIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceLabelDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    marginRight: 8,
  },
  balanceAmountDark: {
    color: 'white',
  },
  fiatValue: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 3,
  },
  fiatValueDark: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  activeDot: {
    backgroundColor: '#10B981',
  },
  onlineDot: {
    backgroundColor: '#10B981',
  },
  offlineDot: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  statusTextDark: {
    color: 'white',
  },
  networkCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  networkCardDark: {
    backgroundColor: '#374151',
  },
  networkCardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#1F2937',
  },
  networkCardTitleDark: {
    color: '#F9FAFB',
  },
  networkCardSubtitle: {
    color: '#6B7280',
    fontSize: 14,
  },
  networkCardSubtitleDark: {
    color: '#D1D5DB',
  },
  networkToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  networkToggleOn: {
    backgroundColor: '#3B82F6',
  },
  networkToggleOff: {
    backgroundColor: '#EF4444',
  },
  networkToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIconDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sendIcon: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  receiveIcon: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  scanIcon: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  actionIconText: {
    fontSize: 20,
  },
  actionText: {
    fontWeight: '500',
    fontSize: 12,
    color: '#1F2937',
  },
  actionTextDark: {
    color: '#F9FAFB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1F2937',
  },
  sectionTitleDark: {
    color: '#F9FAFB',
  },
  sectionAction: {
    color: '#3B82F6',
    fontSize: 14,
  },
  sectionActionDark: {
    color: '#60A5FA',
  },
  emptyState: {
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
  emptyStateDark: {
    backgroundColor: '#374151',
  },
  emptyStateText: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateTextDark: {
    color: '#D1D5DB',
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  transactionList: {
    marginBottom: 24,
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionItemDark: {
    backgroundColor: '#374151',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
    color: '#1F2937',
  },
  transactionTitleDark: {
    color: '#F9FAFB',
  },
  transactionSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  transactionSubtitleDark: {
    color: '#D1D5DB',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  transactionAmountTextDark: {
    opacity: 0.9,
  },
  receivedAmount: {
    color: '#10B981',
  },
  sentAmount: {
    color: '#EF4444',
  },
  transactionDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  transactionDateDark: {
    color: '#D1D5DB',
  },
  cardList: {
    paddingRight: 16,
    paddingBottom: 8,
  },
  cardItem: {
    width: 250,
    height: 150,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 'auto',
  },
  cardType: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  cardName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nfcIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcIconText: {
    transform: [{ rotate: '90deg' }],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBalanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  cardBalance: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  cardStatusText: {
    color: 'white',
    fontSize: 12,
  },
  cardAddress: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 8,
  },
  addCardItem: {
    width: 250,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardItemDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addCardIconDark: {
    backgroundColor: '#4B5563',
  },
  addCardIconText: {
    fontSize: 20,
    color: '#6B7280',
  },
  addCardIconTextDark: {
    color: '#D1D5DB',
  },
  addCardText: {
    color: '#6B7280',
    fontSize: 14,
  },
  addCardTextDark: {
    color: '#D1D5DB',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  loadingContainerDark: {
    backgroundColor: '#374151',
  },
  loadingText: {
    marginTop: 16,
    fontWeight: '500',
    fontSize: 16,
    color: '#1F2937',
  },
  loadingTextDark: {
    color: '#F9FAFB',
  },
});

export default HomeScreen;