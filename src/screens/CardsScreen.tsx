import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '../types/wallet';

const CardsScreen = () => {
  const { 
    cards, 
    selectedCard, 
    setSelectedCard, 
    writeToNfcCard, 
    syncCard, 
    topUpCard,
    updateCardName,
    isLoading
  } = useWallet();
  
  const { isDark } = useTheme();
  
  // Local state for editing card name
  const [isEditingName, setIsEditingName] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  
  // Start editing card name
  const startEditName = (card: Card) => {
    setNewCardName(card.name);
    setIsEditingName(true);
  };
  
  // Save edited card name
  const saveCardName = async () => {
    if (selectedCard) {
      await updateCardName(selectedCard.id, newCardName);
      setIsEditingName(false);
    }
  };
  
  // Handle synchronization with blockchain
  const handleSyncCard = async (card: Card) => {
    setSelectedCard(card);
    await syncCard(card);
  };
  
  // Handle topping up a card with SUI
  const handleTopUp = async (card: Card) => {
    setSelectedCard(card);
    await topUpCard(card);
  };
  
  // Handle writing the card data to an NFC card
  const handleWriteToCard = async (card: Card) => {
    setSelectedCard(card);
    const success = await writeToNfcCard(card);
    
    if (success) {
      Alert.alert(
        'Success',
        'NFC card has been successfully written. You can now use this card for offline transactions.'
      );
    }
  };
  
  // Show card details
  const showCardDetails = (card: Card) => {
    setSelectedCard(card);
  };
  
  // Close card details
  const closeCardDetails = () => {
    setSelectedCard(null);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>My NFC Cards</Text>
      </View>
      
      {cards.length === 0 ? (
        <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
          <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
            No NFC cards added yet
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
          >
            <Text style={styles.emptyStateButtonText}>Scan a card to add it</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cards.map((card) => (
            <TouchableOpacity 
              key={card.id} 
              style={[styles.cardItem, isDark && styles.cardItemDark]}
              onPress={() => showCardDetails(card)}
            >
              <View style={[styles.cardBanner, { backgroundColor: card.color === 'blue' ? '#3B82F6' : '#8B5CF6' }]}>
                <Text style={styles.cardType}>{card.type} Card</Text>
                <View style={styles.nfcIcon}>
                  <Text style={styles.nfcIconText}>📶</Text>
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardName, isDark && styles.cardNameDark]}>{card.name}</Text>
                  <View style={styles.cardStatus}>
                    <View style={styles.cardStatusDot} />
                    <Text style={[styles.cardStatusText, isDark && styles.cardStatusTextDark]}>Active</Text>
                  </View>
                </View>
                
                <View style={styles.cardDetails}>
                  <View style={styles.cardDetail}>
                    <Text style={[styles.cardDetailLabel, isDark && styles.cardDetailLabelDark]}>Balance</Text>
                    <Text style={[styles.cardDetailValue, isDark && styles.cardDetailValueDark]}>{card.balance} SUI</Text>
                  </View>
                  
                  <View style={styles.cardDetail}>
                    <Text style={[styles.cardDetailLabel, isDark && styles.cardDetailLabelDark]}>Address</Text>
                    <Text style={[styles.cardDetailValue, isDark && styles.cardDetailValueDark]}>
                      {card.address.substring(0, 10)}...{card.address.substring(card.address.length - 6)}
                    </Text>
                  </View>
                  
                  <View style={styles.cardDetail}>
                    <Text style={[styles.cardDetailLabel, isDark && styles.cardDetailLabelDark]}>Last Synced</Text>
                    <Text style={[styles.cardDetailValue, isDark && styles.cardDetailValueDark]}>
                      {formatDistanceToNow(new Date(card.lastSynced), { addSuffix: true })}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={[styles.cardActionButton, styles.syncButton]} 
                    onPress={() => handleSyncCard(card)}
                  >
                    <Text style={styles.cardActionButtonText}>Sync</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.cardActionButton, styles.topUpButton]} 
                    onPress={() => handleTopUp(card)}
                  >
                    <Text style={styles.cardActionButtonText}>Top Up</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.cardActionButton, styles.writeButton]} 
                    onPress={() => handleWriteToCard(card)}
                  >
                    <Text style={styles.cardActionButtonText}>Write to NFC</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {/* Card Detail Modal */}
      {selectedCard && (
        <Modal
          visible={!!selectedCard}
          transparent={true}
          animationType="slide"
          onRequestClose={closeCardDetails}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Card Details</Text>
                <TouchableOpacity onPress={closeCardDetails}>
                  <Text style={[styles.closeButton, isDark && styles.closeButtonDark]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={[styles.modalCard, { backgroundColor: selectedCard.color === 'blue' ? '#3B82F6' : '#8B5CF6' }]}>
                  <View style={styles.modalCardHeader}>
                    <View>
                      <Text style={styles.modalCardType}>{selectedCard.type} Card</Text>
                      <Text style={styles.modalCardName}>{selectedCard.name}</Text>
                    </View>
                    <View style={styles.modalNfcIcon}>
                      <Text style={styles.modalNfcIconText}>📶</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalCardBalance}>
                    <Text style={styles.modalCardBalanceLabel}>Balance</Text>
                    <Text style={styles.modalCardBalanceValue}>{selectedCard.balance} SUI</Text>
                  </View>
                  
                  <Text style={styles.modalCardAddress}>{selectedCard.address}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>Card Information</Text>
                    <TouchableOpacity onPress={() => startEditName(selectedCard)}>
                      <Text style={styles.modalSectionAction}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Name</Text>
                    <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>{selectedCard.name}</Text>
                  </View>
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Type</Text>
                    <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>{selectedCard.type}</Text>
                  </View>
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Address</Text>
                    <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>{selectedCard.address}</Text>
                  </View>
                  
                  <View style={[styles.detailItem, isDark && styles.detailItemDark]}>
                    <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]}>Last Synced</Text>
                    <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>
                      {formatDistanceToNow(new Date(selectedCard.lastSynced), { addSuffix: true })}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>Unspent Objects</Text>
                  
                  {selectedCard.unspentObjects.length === 0 ? (
                    <Text style={[styles.emptyListText, isDark && styles.emptyListTextDark]}>No unspent objects</Text>
                  ) : (
                    selectedCard.unspentObjects.map((obj) => (
                      <View key={obj.id} style={[styles.detailItem, isDark && styles.detailItemDark]}>
                        <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]} numberOfLines={1} ellipsizeMode="middle">
                          {obj.id}
                        </Text>
                        <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>{obj.amount} SUI</Text>
                      </View>
                    ))
                  )}
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, isDark && styles.modalSectionTitleDark]}>Pending Transactions</Text>
                  
                  {selectedCard.pendingTransactions.length === 0 ? (
                    <Text style={[styles.emptyListText, isDark && styles.emptyListTextDark]}>No pending transactions</Text>
                  ) : (
                    selectedCard.pendingTransactions.map((tx, index) => (
                      <View key={index} style={[styles.detailItem, isDark && styles.detailItemDark]}>
                        <View>
                          <Text style={[styles.detailItemLabel, isDark && styles.detailItemLabelDark]} numberOfLines={1} ellipsizeMode="middle">
                            To: {tx.to}
                          </Text>
                          <Text style={[styles.detailItemSubtitle, isDark && styles.detailItemSubtitleDark]}>
                            {new Date(tx.timestamp).toLocaleString()}
                          </Text>
                        </View>
                        <Text style={[styles.detailItemValue, isDark && styles.detailItemValueDark]}>{tx.amount} SUI</Text>
                      </View>
                    ))
                  )}
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.syncButton]} 
                    onPress={() => handleSyncCard(selectedCard)}
                  >
                    <Text style={styles.modalActionButtonText}>Sync with Blockchain</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.topUpButton]} 
                    onPress={() => handleTopUp(selectedCard)}
                  >
                    <Text style={styles.modalActionButtonText}>Top Up</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.writeButton]} 
                    onPress={() => handleWriteToCard(selectedCard)}
                  >
                    <Text style={styles.modalActionButtonText}>Write to NFC Card</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Edit Name Modal */}
      <Modal
        visible={isEditingName}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditingName(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContainer, isDark && styles.modalContainerDark]}>
            <Text style={[styles.editModalTitle, isDark && styles.modalTitleDark]}>Edit Card Name</Text>
            
            <TextInput
              style={[styles.editNameInput, isDark && styles.editNameInputDark]}
              value={newCardName}
              onChangeText={setNewCardName}
              placeholder="Enter new card name"
              placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              autoFocus
            />
            
            <View style={styles.editModalActions}>
              <TouchableOpacity 
                style={[styles.editModalButton, styles.cancelButton]} 
                onPress={() => setIsEditingName(false)}
              >
                <Text style={styles.editModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editModalButton, styles.saveButton]} 
                onPress={saveCardName}
              >
                <Text style={styles.editModalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardItemDark: {
    backgroundColor: '#374151',
  },
  cardBanner: {
    height: 60,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: 'white',
    fontWeight: 'bold',
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
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardNameDark: {
    color: '#F9FAFB',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  cardStatusTextDark: {
    color: '#34D399',
  },
  cardDetails: {
    marginBottom: 16,
  },
  cardDetail: {
    marginBottom: 8,
  },
  cardDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  cardDetailLabelDark: {
    color: '#9CA3AF',
  },
  cardDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  cardDetailValueDark: {
    color: '#F9FAFB',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardActionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cardActionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#10B981',
  },
  topUpButton: {
    backgroundColor: '#3B82F6',
  },
  writeButton: {
    backgroundColor: '#8B5CF6',
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
  modalCard: {
    height: 150,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 'auto',
  },
  modalCardType: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  modalCardName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalNfcIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNfcIconText: {
    transform: [{ rotate: '90deg' }],
  },
  modalCardBalance: {
    marginBottom: 8,
  },
  modalCardBalanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  modalCardBalanceValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalCardAddress: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSectionTitleDark: {
    color: '#F9FAFB',
  },
  modalSectionAction: {
    color: '#3B82F6',
    fontSize: 14,
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
    flex: 1,
    marginRight: 8,
  },
  detailItemLabelDark: {
    color: '#D1D5DB',
  },
  detailItemSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  detailItemSubtitleDark: {
    color: '#9CA3AF',
  },
  detailItemValue: {
    color: '#1F2937',
    fontWeight: '500',
  },
  detailItemValueDark: {
    color: '#F9FAFB',
  },
  emptyListText: {
    color: '#6B7280',
    textAlign: 'center',
    padding: 12,
  },
  emptyListTextDark: {
    color: '#9CA3AF',
  },
  modalActions: {
    marginTop: 8,
  },
  modalActionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalActionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  editModalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  editNameInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    color: '#1F2937',
    marginBottom: 16,
  },
  editNameInputDark: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editModalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  editModalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
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

export default CardsScreen;