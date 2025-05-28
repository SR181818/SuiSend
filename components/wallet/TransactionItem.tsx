import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { formatCryptoAmount, formatShortAddress } from '@/utils/formatters';

type TransactionType = 'sent' | 'received';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface TransactionItemProps {
  type: TransactionType;
  amount: number;
  symbol: string;
  date: string;
  status: TransactionStatus;
  address: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  type,
  amount,
  symbol,
  date,
  status,
  address,
}) => {
  const { theme } = useTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return type === 'received' ? theme.colors.success : theme.colors.text;
      case 'pending':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getIcon = () => {
    if (status === 'pending') {
      return <Clock color={theme.colors.warning} size={20} />;
    }
    
    return type === 'sent' 
      ? <ArrowUpRight color={theme.colors.error} size={20} />
      : <ArrowDownLeft color={theme.colors.success} size={20} />;
  };

  const getIconBackgroundColor = () => {
    if (status === 'pending') {
      return theme.colors.warning + '20';
    }
    
    return type === 'sent' 
      ? theme.colors.error + '20'
      : theme.colors.success + '20';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconBackgroundColor() }
        ]}
      >
        {getIcon()}
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={[styles.typeText, { color: theme.colors.text }]}>
          {type === 'sent' ? 'Sent' : 'Received'}
        </Text>
        <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
          {formatShortAddress(address)}
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={[styles.amountText, { color: getStatusColor() }]}>
          {type === 'sent' ? '-' : '+'}{formatCryptoAmount(amount)} {symbol}
        </Text>
        <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
          {date}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  typeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  addressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});

export default TransactionItem;