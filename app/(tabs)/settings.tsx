import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { KeyRound, Shield, FileKey, ChevronRight, Moon, LogOut, Smartphone, Bell, CreditCard, Fingerprint, CircleHelp as HelpCircle, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { logout } = useAuth();
  const { walletInfo } = useWallet();
  
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleBackupWallet = () => {
    router.push('/(auth)/backup-wallet');
  };
  
  const handleViewRecoveryPhrase = () => {
    // In a real app, this would require authentication before showing the phrase
    Alert.alert(
      'Authentication Required',
      'For security reasons, please authenticate to view your recovery phrase.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Authenticate', onPress: () => console.log('Authentication required') }
      ]
    );
  };
  
  const handleDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'Warning: This action will permanently delete your wallet from this device. Make sure you have backed up your recovery phrase before proceeding.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would delete the wallet and logout
            logout();
          }
        }
      ]
    );
  };
  
  const toggleBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
  };
  
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() }
      ]
    );
  };

  const settingSections = [
    {
      title: 'Wallet',
      items: [
        {
          icon: <KeyRound color={theme.colors.primary} size={20} />,
          title: 'View Recovery Phrase',
          onPress: handleViewRecoveryPhrase,
          showChevron: true,
        },
        {
          icon: <FileKey color={theme.colors.primary} size={20} />,
          title: 'Backup Wallet',
          onPress: handleBackupWallet,
          showChevron: true,
        },
        {
          icon: <Shield color={theme.colors.primary} size={20} />,
          title: 'Security Settings',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Moon color={theme.colors.primary} size={20} />,
          title: 'Dark Mode',
          customComponent: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          ),
        },
        {
          icon: <Bell color={theme.colors.primary} size={20} />,
          title: 'Notifications',
          customComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          ),
        },
        {
          icon: <Fingerprint color={theme.colors.primary} size={20} />,
          title: 'Biometric Authentication',
          customComponent: (
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: theme.colors.gray, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          ),
        },
      ],
    },
    {
      title: 'Payment Methods',
      items: [
        {
          icon: <CreditCard color={theme.colors.primary} size={20} />,
          title: 'Add Payment Method',
          onPress: () => {},
          showChevron: true,
        },
        {
          icon: <Smartphone color={theme.colors.primary} size={20} />,
          title: 'Connected Devices',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle color={theme.colors.primary} size={20} />,
          title: 'Help & Support',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: <Trash2 color={theme.colors.error} size={20} />,
          title: 'Delete Wallet',
          onPress: handleDeleteWallet,
          showChevron: true,
          danger: true,
        },
        {
          icon: <LogOut color={theme.colors.error} size={20} />,
          title: 'Logout',
          onPress: handleLogout,
          showChevron: true,
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.walletInfoContainer}>
          <View style={[styles.walletIcon, { backgroundColor: theme.colors.backgroundLight || theme.colors.surface }]}>
            <KeyRound color={theme.colors.primary} size={24} />
          </View>
          <View style={styles.walletTextContainer}>
            <Text style={[styles.walletName, { color: theme.colors.text }]}>
              {walletInfo.name || 'My Wallet'}
            </Text>
            <Text style={[styles.walletAddress, { color: theme.colors.textSecondary }]}>
              {walletInfo.address ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : ''}
            </Text>
          </View>
        </View>

        {settingSections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.title}
            entering={FadeInDown.delay(sectionIndex * 100).springify()}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.colors.backgroundLight || theme.colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && { 
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border
                    }
                  ]}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <View style={styles.settingIconAndTitle}>
                    {item.icon}
                    <Text style={[
                      styles.settingTitle, 
                      { 
                        color: item.danger ? theme.colors.error : theme.colors.text,
                        marginLeft: 12
                      }
                    ]}>
                      {item.title}
                    </Text>
                  </View>
                  
                  {item.customComponent ? (
                    item.customComponent
                  ) : item.showChevron ? (
                    <ChevronRight color={theme.colors.textTertiary} size={20} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  walletInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 24,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletTextContainer: {
    flex: 1,
  },
  walletName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 4,
  },
  walletAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingIconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});