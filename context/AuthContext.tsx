import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

interface AuthContextType {
  isAuthenticated: boolean;
  hasWallet: boolean;
  onboardingComplete: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
  setHasWallet: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  hasWallet: false,
  onboardingComplete: false,
  login: async () => false,
  logout: () => {},
  setHasWallet: () => {},
  setOnboardingComplete: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to handle storage operations based on platform
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has wallet
        const walletExists = await storage.getItem('wallet_exists');
        setHasWallet(walletExists === 'true');

        // Check if onboarding is complete
        const onboarding = await storage.getItem('onboarding_complete');
        setOnboardingComplete(onboarding === 'true');

        // For web, skip biometric auth
        if (Platform.OS === 'web') {
          setIsAuthenticated(true);
          return;
        }

        // If user has wallet, require authentication
        if (walletExists === 'true') {
          const result = await authenticateUser();
          setIsAuthenticated(result);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    checkAuth();
  }, []);

  const authenticateUser = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        return true; // Skip biometric auth on web
      }

      const hasBiometrics = await LocalAuthentication.hasHardwareAsync();

      if (!hasBiometrics) {
        return true; // No biometrics available, allow access
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use passcode',
      });

      return result.success;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const login = async (): Promise<boolean> => {
    const result = await authenticateUser();
    setIsAuthenticated(result);
    return result;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateHasWallet = async (value: boolean) => {
    setHasWallet(value);
    await storage.setItem('wallet_exists', value ? 'true' : 'false');
  };

  const updateOnboardingComplete = async (value: boolean) => {
    setOnboardingComplete(value);
    await storage.setItem('onboarding_complete', value ? 'true' : 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasWallet,
        onboardingComplete,
        login,
        logout,
        setHasWallet: updateHasWallet,
        setOnboardingComplete: updateOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };