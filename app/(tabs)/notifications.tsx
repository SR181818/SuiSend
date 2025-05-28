import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Bell, ArrowUpRight, ArrowDownLeft, ShieldAlert, BellOff, Plus } from 'lucide-react-native';
import NotificationItem from '@/components/notifications/NotificationItem';
import { mockNotifications } from '@/utils/mockData';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

type NotificationFilter = 'all' | 'price' | 'security' | 'transactions';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Filter notifications based on selected category
  const filteredNotifications = mockNotifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'price') return notification.type === 'price-alert';
    if (filter === 'security') return notification.type === 'security';
    if (filter === 'transactions') return ['transaction-sent', 'transaction-received'].includes(notification.type);
    return true;
  });

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const getFilterIcon = (filterType: NotificationFilter) => {
    switch (filterType) {
      case 'all':
        return <Bell size={16} />;
      case 'price':
        return <ArrowUpRight size={16} />;
      case 'security':
        return <ShieldAlert size={16} />;
      case 'transactions':
        return <ArrowDownLeft size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
        
        <View style={styles.notificationToggle}>
          <Text style={[styles.toggleLabel, { color: theme.colors.textSecondary }]}>
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
            thumbColor={theme.colors.white}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { borderBottomColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {(['all', 'price', 'security', 'transactions'] as NotificationFilter[]).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => setFilter(filterType)}
            >
              {React.cloneElement(getFilterIcon(filterType), { 
                color: filter === filterType ? theme.colors.primary : theme.colors.textSecondary 
              })}
              <Text
                style={[
                  styles.filterText,
                  { color: filter === filterType ? theme.colors.primary : theme.colors.textSecondary }
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notification List */}
      {notificationsEnabled ? (
        <>
          <ScrollView style={styles.notificationsList}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <Animated.View 
                  key={notification.id}
                  entering={SlideInRight.delay(index * 50).springify()}
                >
                  <NotificationItem
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    time={notification.time}
                    isRead={notification.isRead}
                  />
                </Animated.View>
              ))
            ) : (
              <Animated.View 
                entering={FadeIn.delay(100)}
                style={styles.emptyContainer}
              >
                <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.backgroundLight }]}>
                  <BellOff color={theme.colors.textSecondary} size={32} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No notifications
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.colors.textSecondary }]}>
                  You don't have any {filter !== 'all' ? filter : ''} notifications at this time.
                </Text>
              </Animated.View>
            )}
          </ScrollView>

          {/* Create Alert Button */}
          <TouchableOpacity
            style={[styles.createAlertButton, { backgroundColor: theme.colors.primary }]}
          >
            <Plus color={theme.colors.white} size={24} />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.disabledContainer}>
          <View style={[styles.disabledIconContainer, { backgroundColor: theme.colors.backgroundLight }]}>
            <BellOff color={theme.colors.textSecondary} size={40} />
          </View>
          <Text style={[styles.disabledTitle, { color: theme.colors.text }]}>
            Notifications Disabled
          </Text>
          <Text style={[styles.disabledDescription, { color: theme.colors.textSecondary }]}>
            Enable notifications to stay updated on price alerts, security events, and transactions.
          </Text>
          <TouchableOpacity
            style={[styles.enableButton, { backgroundColor: theme.colors.primary }]}
            onPress={toggleNotifications}
          >
            <Text style={styles.enableButtonText}>Enable Notifications</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 8,
  },
  filterContainer: {
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 6,
  },
  notificationsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  disabledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  disabledIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 8,
  },
  disabledDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  enableButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  enableButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  createAlertButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});