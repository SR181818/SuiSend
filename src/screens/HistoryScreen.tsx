import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { Transaction } from '../types/wallet';

const HistoryScreen = () => {
  const { transactions, cards } = useWallet();
  const { isDark } = useTheme();
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Show transaction details
  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };
  
  // Close transaction details
  const closeTransactionDetails = () => {
    setSelectedTransaction(null);
  };

  // Copy transaction hash
  const copyTransactionHash = (hash: string) => {
    // In a real implementation, this would use Clipboard.setString(hash)
    Alert.alert('Copied!', 'Transaction hash copied to clipboard');
  };
  
  // Get card name by ID
  const getCardName = (cardId?: string) => {
    if (!cardId) return 'Unknown Card';
    const card = cards.find(c => c.id === cardId);
    return card ? card.name : 'Unknown Card';
  };
  
  // Render transaction item
  const renderTransaction = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity 
        style={[styles.transactionItem, isDark && styles.transactionItemDark]} 
        onPress={() => showTransactionDetails(item)}
      >
        <View style={[styles.transactionIcon, 
          item.type === 'received' ? styles.receivedIcon : 
          item.type === 'sent' ? styles.sentIcon : 
          styles.pendingIcon
        ]}>
          <Text style={styles.transactionIconText}>
            {item.type === 'received' ? '↓' : 
             item.type === 'sent' ? '↑' : '⏱'}
          </Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, isDark && styles.transactionTitleDark]}>
            {item.type === 'received' ? 'Received' : 
             item.type === 'sent' ? 'Sent' : 'Pending'} 
            {item.type === 'received' && item.from && item.from !== 'Top Up' ? ` from ${item.from.substring(0, 8)}...` : ''}
            {(item.type === 'sent' || item.type === 'pending') && item.to ? ` to ${item.to.substring(0, 8)}...` : ''}
          </Text>
          
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionCard, isDark && styles.transactionCardDark]}>
              {getCardName(item.cardId)}
            </Text>
            <Text style={[styles.transactionTimestamp, isDark && styles.transactionTimestampDark]}>
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          </View>
          
          <View style={styles.transactionStatusRow}>
            <View style={[
              styles.statusBadge,
              item.status === 'confirmed' ? styles.confirmedBadge :
              item.status === 'pending' ? styles.pendingBadge :
              styles.failedBadge
            ]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
            
            {item.note && (
              <Text style={[styles.transactionNote, isDark && styles.transactionNoteDark]} numberOfLines={1}>
                {item.note}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.transactionAmountText, 
            item.type === 'received' ? styles.receivedAmount : styles.sentAmount,
            isDark && styles.transactionAmountTextDark
          ]}>
            {item.type === 'received' ? '+' : '-'}{item.amount} SUI
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Transaction History</Text>
      </View>
      
      {transactions.length === 0 ? (
        <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
          <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
            No transactions yet
          </Text>
          <Text style={[styles.emptyStateSubtext, isDark && styles.emptyStateSubtextDark]}>
            Your transaction history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.transactionList}
        />
      )}
      
      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Modal
          visible={!!selectedTransaction}
          transparent={true}
          animationType="slide"
          onRequestClose={closeTransactionDetails}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Transaction Details</Text>
                <TouchableOpacity onPress={closeTransactionDetails}>
                  <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={[
                  styles.transactionTypeHeader,
                  selectedTransaction.type === 'received' ? styles.receivedHeader :
                  selectedTransaction.type === 'sent' ? styles.sentHeader :
                  styles.pendingHeader
                ]}>
                  <View style={styles.transactionTypeIcon}>
                    <Text style={styles.transactionTypeIconText}>
                      {selectedTransaction.type === 'received' ? '↓' : 
                       selectedTransaction.type === 'sent' ? '↑' : '⏱'}
                    </Text>
                  </View>
                  
                  <View>
                    <Text style={styles.transactionTypeTitle}>
                      {selectedTransaction.type === 'received' ? 'Received SUI' : 
                       selectedTransaction.type === 'sent' ? 'Sent SUI' : 'Pending Transaction'}
                    </Text>
                    <Text style={styles.transactionTypeAmount}>
                      {selectedTransaction.type === 'received' ? '+' : '-'}{selectedTransaction.amount} SUI
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>Transaction Information</Text>
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Status</Text>
                    <View style={[
                      styles.statusBadge,
                      selectedTransaction.status === 'confirmed' ? styles.confirmedBadge :
                      selectedTransaction.status === 'pending' ? styles.pendingBadge :
                      styles.failedBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Date & Time</Text>
                    <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>
                      {new Date(selectedTransaction.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  
                  {selectedTransaction.from && (
                    <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                      <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>From</Text>
                      <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>
                        {selectedTransaction.from}
                      </Text>
                    </View>
                  )}
                  
                  {selectedTransaction.to && (
                    <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                      <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>To</Text>
                      <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>
                        {selectedTransaction.to}
                      </Text>
                    </View>
                  )}
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Card</Text>
                    <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>
                      {getCardName(selectedTransaction.cardId)}
                    </Text>
                  </View>
                  
                  {selectedTransaction.note && (
                    <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                      <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Note</Text>
                      <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>
                        {selectedTransaction.note}
                      </Text>
                    </View>
                  )}
                  
                  {selectedTransaction.transactionHash && (
                    <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                      <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Transaction Hash</Text>
                      <TouchableOpacity onPress={() => copyTransactionHash(selectedTransaction.transactionHash!)}>
                        <Text style={[styles.detailItemHash, isDark && styles.detailItemHashDark]}>
                          {selectedTransaction.transactionHash.substring(0, 10)}...
                          {selectedTransaction.transactionHash.substring(selectedTransaction.transactionHash.length - 6)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                {selectedTransaction.status === 'confirmed' && selectedTransaction.transactionHash && (
                  <TouchableOpacity style={styles.viewOnExplorerButton}>
                    <Text style={styles.viewOnExplorerText}>View on Sui Explorer</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateDark: {
    backgroundColor: '#1F2937',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  emptyStateTextDark: {
    color: '#D1D5DB',
  },
  emptyStateSubtext: {
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyStateSubtextDark: {
    color: '#9CA3AF',
  },
  transactionList: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  receivedIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  sentIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pendingIcon: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#1F2937',
  },
  transactionTitleDark: {
    color: '#F9FAFB',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  transactionCard: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionCardDark: {
    color: '#9CA3AF',
  },
  transactionTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionTimestampDark: {
    color: '#9CA3AF',
  },
  transactionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  confirmedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  failedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontWeight: '500',
    fontSize: 10,
  },
  transactionNote: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  transactionNoteDark: {
    color: '#9CA3AF',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontWeight: '600',
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContainerDark: {
    backgroundColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalTitleDark: {
    color: '#F9FAFB',
  },
  closeButton: {
    fontSize: 20,
    color: '#6B7280',
  },
  closeButtonDark: {
    color: '#D1D5DB',
  },
  modalContent: {
    padding: 16,
  },
  transactionTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  receivedHeader: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  sentHeader: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pendingHeader: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  transactionTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionTypeIconText: {
    fontSize: 24,
  },
  transactionTypeTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionTypeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalSectionTitleDark: {
    color: '#F9FAFB',
  },
  detailItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItemDark: {
    backgroundColor: '#1F2937',
  },
  detailItemLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  detailItemLabelDark: {
    color: '#D1D5DB',
  },
  detailItemValue: {
    color: '#1F2937',
    fontWeight: '500',
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailItemValueDark: {
    color: '#F9FAFB',
  },
  detailItemHash: {
    color: '#3B82F6',
    fontWeight: '500',
    fontSize: 14,
  },
  detailItemHashDark: {
    color: '#60A5FA',
  },
  viewOnExplorerButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  viewOnExplorerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HistoryScreen;