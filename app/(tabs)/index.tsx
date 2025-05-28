import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { ArrowUpRight, ArrowDownLeft, Plus, QrCode, Send, Scan } from 'lucide-react-native';
import CryptoCard from '@/components/wallet/CryptoCard';
import PortfolioChart from '@/components/wallet/PortfolioChart';
import TransactionItem from '@/components/wallet/TransactionItem';
import ActionButton from '@/components/common/ActionButton';
import { mockTransactions } from '@/utils/mockData';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { formatCurrency } from '@/utils/formatters';

export default function WalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { walletInfo, balances, refreshWallet } = useWallet();
  
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1w');
  
  // Calculate total balance
  const totalBalance = Object.values(balances).reduce(
    (sum, { balanceUsd }) => sum + balanceUsd, 
    0
  );
  
  // Filter transactions to show only the most recent
  const recentTransactions = mockTransactions.slice(0, 5);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWallet();
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = () => {
    // Navigate to send screen (to be implemented)
    console.log('Navigate to send screen');
  };

  const handleReceive = () => {
    // Navigate to receive screen (to be implemented)
    console.log('Navigate to receive screen');
  };

  const handleBuy = () => {
    // Navigate to buy screen (to be implemented)
    console.log('Navigate to buy screen');
  };

  const handleScan = () => {
    // Navigate to scan screen (to be implemented)
    console.log('Navigate to scan screen');
  };

  const timeRangeOptions: Array<'1d' | '1w' | '1m' | '1y'> = ['1d', '1w', '1m', '1y'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.walletName, { color: theme.colors.text }]}>
              {walletInfo.name || 'My Wallet'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: theme.colors.backgroundLight }]}
            onPress={handleScan}
          >
            <Scan color={theme.colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Portfolio Value */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.portfolioContainer}
        >
          <Text style={[styles.portfolioLabel, { color: theme.colors.textSecondary }]}>
            Portfolio Value
          </Text>
          <Text style={[styles.portfolioValue, { color: theme.colors.text }]}>
            {formatCurrency(totalBalance)}
          </Text>
          <Text style={[styles.portfolioChange, { 
            color: totalBalance > 0 ? theme.colors.success : theme.colors.error 
          }]}>
            {totalBalance > 0 ? '+' : ''}{formatCurrency(totalBalance * 0.03)} (3.0%)
          </Text>
          
          {/* Chart Time Range Selector */}
          <View style={styles.timeRangeSelector}>
            {timeRangeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.timeRangeButton,
                  timeRange === option && { backgroundColor: theme.colors.primary + '20' }
                ]}
                onPress={() => setTimeRange(option)}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    { color: timeRange === option ? theme.colors.primary : theme.colors.textSecondary }
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Portfolio Chart */}
          <PortfolioChart timeRange={timeRange} />
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ActionButton
            icon={<Send color={theme.colors.white} size={20} />}
            label="Send"
            onPress={handleSend}
            backgroundColor={theme.colors.primary}
          />
          <ActionButton
            icon={<QrCode color={theme.colors.white} size={20} />}
            label="Receive"
            onPress={handleReceive}
            backgroundColor={theme.colors.secondary}
          />
          <ActionButton
            icon={<Plus color={theme.colors.white} size={20} />}
            label="Buy"
            onPress={handleBuy}
            backgroundColor={theme.colors.accent}
          />
        </View>

        {/* Assets List */}
        <View style={styles.assetsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Assets</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cryptoCards}>
            {Object.entries(balances).map(([symbol, data], index) => (
              <Animated.View 
                key={symbol}
                entering={FadeInDown.delay(200 + index * 100).springify()}
              >
                <CryptoCard
                  symbol={symbol}
                  name={data.name}
                  balance={data.balance}
                  balanceUsd={data.balanceUsd}
                  priceChangePercentage={data.priceChangePercentage}
                />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllButton, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction, index) => (
              <Animated.View 
                key={transaction.id}
                entering={FadeInDown.delay(400 + index * 100).springify()}
              >
                <TransactionItem
                  type={transaction.type}
                  amount={transaction.amount}
                  symbol={transaction.symbol}
                  date={transaction.date}
                  status={transaction.status}
                  address={transaction.address}
                />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  walletName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  portfolioLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 4,
  },
  portfolioValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 4,
  },
  portfolioChange: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  timeRangeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  assetsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  seeAllButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  cryptoCards: {
    paddingHorizontal: 16,
    gap: 12,
  },
  transactionsContainer: {
    marginBottom: 24,
  },
  transactionsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
});