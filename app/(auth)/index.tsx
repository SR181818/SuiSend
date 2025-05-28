import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { CirclePlus as PlusCircle, Import } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { isAuthenticated, hasWallet } = useAuth();

  useEffect(() => {
    // If user is authenticated and has a wallet, redirect to the main app
    if (isAuthenticated && hasWallet) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, hasWallet]);

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.backgroundDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/843700/pexels-photo-843700.jpeg' }}
              style={styles.logo}
            />
            <Text style={[styles.appName, { color: theme.colors.text }]}>
              CryptoVault
            </Text>
            <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
              Secure. Private. Yours.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/(auth)/create-wallet')}
            >
              <PlusCircle color={theme.colors.white} size={24} />
              <Text style={styles.buttonText}>Create New Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.backgroundLight }]}
              onPress={() => router.push('/(auth)/import-wallet')}
            >
              <Import color={theme.colors.primary} size={24} />
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
                Import Existing Wallet
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text 
            entering={FadeInUp.delay(900).springify()}
            style={[styles.securityNote, { color: theme.colors.textSecondary }]}
          >
            Your keys, your crypto. We never store your private keys.
          </Animated.Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    borderRadius: 60,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  securityNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});