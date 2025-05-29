import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { formatCurrency, formatShortAddress } from '@/utils/formatters';

interface TransactionItemProps {
  transaction: {
    id: string;
    type: 'sent' | 'received' | 'pending';
    amount: number;
    currency: string;
    recipient: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
  };
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { theme } = useTheme();

  const getIcon = () => {
    if (transaction.status === 'pending') {
      return <Clock color={theme.colors.warning} size={20} />;
    }
    return transaction.type === 'sent' 
      ? <ArrowUpRight color={theme.colors.error} size={20} />
      : <ArrowDownLeft color={theme.colors.success} size={20} />;
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return transaction.type === 'received' ? theme.colors.success : theme.colors.text;
      case 'pending':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.backgroundLight }]}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: transaction.status === 'pending' 
          ? theme.colors.warning + '20'
          : transaction.type === 'sent'
            ? theme.colors.error + '20'
            : theme.colors.success + '20'
        }
      ]}>
        {getIcon()}
      </View>
      
      <View style={styles.details}>
        <Text style={[styles.type, { color: theme.colors.text }]}>
          {transaction.type === 'sent' ? 'Sent' : 'Received'}
        </Text>
        <Text style={[styles.recipient, { color: theme.colors.textSecondary }]}>
          {formatShortAddress(transaction.recipient)}
        </Text>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={[styles.amount, { color: getStatusColor() }]}>
          {transaction.type === 'sent' ? '-' : '+'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={[styles.timestamp, { color: theme.colors.textTertiary }]}>
          {transaction.timestamp}
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
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  type: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  recipient: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
});

export default TransactionItem;