import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowUpRight, ArrowDownLeft, Bell, ShieldAlert } from 'lucide-react-native';

type NotificationType = 'price-alert' | 'transaction-sent' | 'transaction-received' | 'security';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  message,
  time,
  isRead,
}) => {
  const { theme } = useTheme();
  
  const getIcon = () => {
    switch (type) {
      case 'price-alert':
        return <ArrowUpRight color={theme.colors.primary} size={20} />;
      case 'transaction-sent':
        return <ArrowUpRight color={theme.colors.error} size={20} />;
      case 'transaction-received':
        return <ArrowDownLeft color={theme.colors.success} size={20} />;
      case 'security':
        return <ShieldAlert color={theme.colors.warning} size={20} />;
      default:
        return <Bell color={theme.colors.primary} size={20} />;
    }
  };

  const getIconBackgroundColor = () => {
    switch (type) {
      case 'price-alert':
        return theme.colors.primary + '20';
      case 'transaction-sent':
        return theme.colors.error + '20';
      case 'transaction-received':
        return theme.colors.success + '20';
      case 'security':
        return theme.colors.warning + '20';
      default:
        return theme.colors.primary + '20';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isRead ? theme.colors.background : theme.colors.backgroundLight,
          borderLeftColor: isRead ? 'transparent' : theme.colors.primary,
          borderLeftWidth: isRead ? 0 : 3,
        }
      ]}
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
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
            {time}
          </Text>
        </View>
        
        <Text 
          style={[styles.message, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  time: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  message: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationItem;