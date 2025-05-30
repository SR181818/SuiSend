
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useWallet } from '@/context/WalletContext';
import { PortfolioChart } from '@/components/wallet/PortfolioChart';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const { walletInfo, pendingTransactions } = useWallet();

  const mockChartData = [
    { value: 100, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { value: 120, timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000 },
    { value: 110, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { value: 140, timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000 },
    { value: 135, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { value: 150, timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { value: 160, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { value: 155, timestamp: Date.now() },
  ];

  const totalSent = pendingTransactions
    .filter(tx => tx.type === 'sent')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReceived = pendingTransactions
    .filter(tx => tx.type === 'received')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    chartSection: {
      margin: 20,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginHorizontal: 8,
      alignItems: 'center',
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    transactionStats: {
      margin: 20,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
    },
    transactionType: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    transactionLabel: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 8,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>
            Track your wallet performance and transaction history
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={theme.colors.success} style={styles.statIcon} />
            <Text style={styles.statValue}>{walletInfo.balance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Current Balance</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingDown size={24} color={theme.colors.primary} style={styles.statIcon} />
            <Text style={styles.statValue}>{pendingTransactions.length}</Text>
            <Text style={styles.statLabel}>Pending Transactions</Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Portfolio Performance</Text>
          <PortfolioChart 
            data={mockChartData}
            width={280}
            height={150}
            lineColor={theme.colors.primary}
          />
        </View>

        <View style={styles.transactionStats}>
          <Text style={styles.sectionTitle}>Transaction Summary</Text>
          
          <View style={styles.transactionRow}>
            <View style={styles.transactionType}>
              <ArrowUpRight size={20} color={theme.colors.error} />
              <Text style={styles.transactionLabel}>Total Sent</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: theme.colors.error }]}>
              {totalSent.toFixed(2)} SUI
            </Text>
          </View>

          <View style={styles.transactionRow}>
            <View style={styles.transactionType}>
              <ArrowDownLeft size={20} color={theme.colors.success} />
              <Text style={styles.transactionLabel}>Total Received</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: theme.colors.success }]}>
              {totalReceived.toFixed(2)} SUI
            </Text>
          </View>

          <View style={styles.transactionRow}>
            <View style={styles.transactionType}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={styles.transactionLabel}>Net Flow</Text>
            </View>
            <Text style={[
              styles.transactionAmount, 
              { color: (totalReceived - totalSent) >= 0 ? theme.colors.success : theme.colors.error }
            ]}>
              {(totalReceived - totalSent).toFixed(2)} SUI
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
