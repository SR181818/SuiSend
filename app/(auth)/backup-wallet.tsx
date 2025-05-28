import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, CloudOff, AArrowDown as NFC, Save, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import LinearGradientButton from '@/components/common/LinearGradientButton';
import Animated, { FadeInRight } from 'react-native-reanimated';

const backupMethods = [
  {
    id: 'paper',
    title: 'Paper Backup',
    description: 'Write down your recovery phrase on paper and store it in a secure location.',
    icon: 'paper',
    recommended: true,
  },
  {
    id: 'nfc',
    title: 'NFC Card',
    description: 'Store your wallet on a secure NFC card for cold storage.',
    icon: 'nfc',
    recommended: false,
  },
  {
    id: 'offline',
    title: 'Offline Device',
    description: 'Save your recovery phrase on a secure offline device.',
    icon: 'offline',
    recommended: true,
  },
];

export default function BackupWalletScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setOnboardingComplete } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackupComplete = () => {
    if (!selectedMethod) {
      Alert.alert('Selection Required', 'Please select a backup method to continue.');
      return;
    }

    // In a real app, handle the backup process based on selected method
    if (selectedMethod === 'nfc') {
      // This would be where you'd handle NFC card writing
      Alert.alert(
        'NFC Backup',
        'In a real app, this would launch the NFC card writing process.',
        [{ text: 'OK', onPress: () => completeBackup() }]
      );
    } else {
      completeBackup();
    }
  };

  const completeBackup = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setOnboardingComplete(true);
    router.replace('/(tabs)');
  };

  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'paper':
        return <Save color={theme.colors.primary} size={24} />;
      case 'nfc':
        return <NFC color={theme.colors.primary} size={24} />;
      case 'offline':
        return <CloudOff color={theme.colors.primary} size={24} />;
      default:
        return <Save color={theme.colors.primary} size={24} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/5466785/pexels-photo-5466785.jpeg' }}
            style={styles.illustration}
          />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Backup Your Wallet
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Protect your crypto assets by creating a secure backup of your wallet.
          </Text>
        </View>

        <View style={styles.methodsContainer}>
          {backupMethods.map((method, index) => (
            <Animated.View 
              key={method.id}
              entering={FadeInRight.delay(index * 200).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.selectedMethodCard,
                  { 
                    backgroundColor: theme.colors.backgroundLight,
                    borderColor: selectedMethod === method.id ? theme.colors.primary : theme.colors.border
                  }
                ]}
                onPress={() => handleMethodSelect(method.id)}
              >
                <View style={styles.methodIconContainer}>
                  {getMethodIcon(method.icon)}
                </View>
                <View style={styles.methodTextContainer}>
                  <View style={styles.methodTitleRow}>
                    <Text style={[styles.methodTitle, { color: theme.colors.text }]}>
                      {method.title}
                    </Text>
                    {method.recommended && (
                      <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.success + '20' }]}>
                        <Text style={[styles.recommendedText, { color: theme.colors.success }]}>
                          Recommended
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.methodDescription, { color: theme.colors.textSecondary }]}>
                    {method.description}
                  </Text>
                </View>
                {selectedMethod === method.id && (
                  <CheckCircle color={theme.colors.primary} size={20} style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.securityNote}>
          <Text style={[styles.securityNoteText, { color: theme.colors.textSecondary }]}>
            Remember to keep your recovery phrase in a secure location. Anyone with access to your recovery phrase has full access to your wallet.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <LinearGradientButton
          onPress={handleBackupComplete}
          disabled={!selectedMethod}
          colors={selectedMethod ? [theme.colors.primary, theme.colors.primaryDark] : [theme.colors.gray, theme.colors.grayDark]}
          icon={<ArrowRight color={theme.colors.white} size={20} />}
          label="Continue"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectedMethodCard: {
    borderWidth: 2,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  recommendedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  methodDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIcon: {
    marginLeft: 12,
  },
  securityNote: {
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  securityNoteText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
});