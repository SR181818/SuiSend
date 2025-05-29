import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { Scan, Send, QrCode, Plus, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatCurrency } from '@/utils/formatters';
import PaymentCard from '@/components/cards/PaymentCard';
import TransactionItem from '@/components/transactions/TransactionItem';
import ActionButton from '@/components/common/ActionButton';
import useNfcPayment from '@/hooks/useNfcPayment';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { balance, cards, recentTransactions } = useWallet();
  const { isNfcSupported, isScanning, startNfcPayment } = useNfcPayment();
  
  const handleScan = async () => {
    if (Platform.OS === 'web') {
      // Show web alternative
      alert('NFC payments are only available on mobile devices');
      return;
    }
    
    if (!isNfcSupported) {
      alert('NFC is not supported on this device');
      return;
    }
    
    await startNfcPayment();
  };

  const handleSend = () => {
    router.push('/send');
  };

  const handleReceive = () => {
    router.push('/receive');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.balanceLabel, { color: theme.colors.text }]}>
              Total Balance
            </Text>
            <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <ActionButton
            icon={<Scan color={theme.colors.white} size={24} />}
            label="Pay"
            onPress={handleScan}
            backgroundColor={theme.colors.primary}
            isLoading={isScanning}
          />
          <ActionButton
            icon={<Send color={theme.colors.white} size={24} />}
            label="Send"
            onPress={handleSend}
            backgroundColor={theme.colors.secondary}
          />
          <ActionButton
            icon={<QrCode color={theme.colors.white} size={24} />}
            label="Receive"
            onPress={handleReceive}
            backgroundColor={theme.colors.accent}
          />
        </View>

        {/* Cards Section */}
        <View style={styles.cardsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Your Cards
            </Text>
            <TouchableOpacity onPress={() => router.push('/cards')}>
              <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {cards.map((card, index) => (
              <Animated.View 
                key={card.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <PaymentCard card={card} />
              </Animated.View>
            ))}
            
            <TouchableOpacity
              style={[
                styles.addCardButton,
                { backgroundColor: theme.colors.backgroundLight }
              ]}
              onPress={() => router.push('/cards/add')}
            >
              <Plus color={theme.colors.primary} size={24} />
              <Text style={[styles.addCardText, { color: theme.colors.primary }]}>
                Add Card
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction, index) => (
              <Animated.View 
                key={transaction.id}
                entering={FadeInDown.delay(200 + index * 100)}
              >
                <TransactionItem transaction={transaction} />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 4,
  },
  balanceAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cardsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  seeAllButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  cardsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  addCardButton: {
    width: 100,
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginTop: 8,
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionsList: {
    paddingHorizontal: 24,
    gap: 12,
  },
});