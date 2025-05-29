import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { CreditCard } from 'lucide-react-native';
import { formatShortCardNumber } from '@/utils/formatters';

interface PaymentCardProps {
  card: {
    id: string;
    type: string;
    last4: string;
    expiryDate: string;
    cardholderName: string;
    brand: string;
  };
}

const PaymentCard: React.FC<PaymentCardProps> = ({ card }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <View style={styles.header}>
        <Text style={styles.cardType}>{card.type}</Text>
        <CreditCard color={theme.colors.white} size={24} />
      </View>

      <Text style={styles.cardNumber}>
        •••• •••• •••• {card.last4}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Card Holder</Text>
          <Text style={styles.value}>{card.cardholderName}</Text>
        </View>
        <View>
          <Text style={styles.label}>Expires</Text>
          <Text style={styles.value}>{card.expiryDate}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 160,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  cardNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 20,
    color: 'white',
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
});

export default PaymentCard;