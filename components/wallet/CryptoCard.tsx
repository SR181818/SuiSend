import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { formatCurrency, formatPercentage, formatCryptoAmount } from '@/utils/formatters';

interface CryptoCardProps {
  symbol: string;
  name: string;
  balance: number;
  balanceUsd: number;
  priceChangePercentage: number;
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  symbol,
  name,
  balance,
  balanceUsd,
  priceChangePercentage,
}) => {
  const { theme } = useTheme();
  const isPositive = priceChangePercentage >= 0;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.background + '80' }]}>
          <Text style={[styles.iconText, { color: theme.colors.primary }]}>
            {symbol.charAt(0)}
          </Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {name}
          </Text>
          <Text style={[styles.symbol, { color: theme.colors.textSecondary }]}>
            {symbol}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={[styles.balance, { color: theme.colors.text }]}>
          {formatCryptoAmount(balance)} {symbol}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.colors.textSecondary }]}>
            {formatCurrency(balanceUsd)}
          </Text>
          <View style={[
            styles.changeContainer, 
            { backgroundColor: isPositive ? theme.colors.success + '20' : theme.colors.error + '20' }
          ]}>
            <Text style={[
              styles.changeText, 
              { color: isPositive ? theme.colors.success : theme.colors.error }
            ]}>
              {isPositive ? '+' : ''}{formatPercentage(priceChangePercentage)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  detailsContainer: {
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  symbol: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  balance: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 4,
  },
  changeContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});

export default CryptoCard;