import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { LineChart } from '@/components/wallet/LineChart';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface MarketItemProps {
  symbol: string;
  name: string;
  price: number;
  priceChangePercentage: number;
  volume: number;
  marketCap: number;
  chartData: number[];
}

const MarketItem: React.FC<MarketItemProps> = ({
  symbol,
  name,
  price,
  priceChangePercentage,
  volume,
  marketCap,
  chartData,
}) => {
  const { theme } = useTheme();
  const isPositive = priceChangePercentage >= 0;

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: theme.colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.backgroundLight }]}>
          <Text style={styles.symbolText}>{symbol.charAt(0)}</Text>
        </View>

        <View style={styles.nameContainer}>
          <Text style={[styles.nameText, { color: theme.colors.text }]}>{name}</Text>
          <Text style={[styles.symbolText, { color: theme.colors.textSecondary }]}>{symbol}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart 
          data={chartData}
          width={80}
          height={40}
          color={isPositive ? theme.colors.success : theme.colors.error}
        />
      </View>

      <View style={styles.rightContent}>
        <Text style={[styles.priceText, { color: theme.colors.text }]}>
          {formatCurrency(price)}
        </Text>
        <Text style={[
          styles.changeText, 
          { color: isPositive ? theme.colors.success : theme.colors.error }
        ]}>
          {isPositive ? '+' : ''}{formatPercentage(priceChangePercentage)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  symbolText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  priceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  changeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});

export default MarketItem;