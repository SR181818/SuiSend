
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getItemAsync, setItemAsync } from '@/utils/storage';

interface AuthContextType {
  isOnboardingComplete: boolean;
  hasWallet: boolean;
  setOnboardingComplete: (value: boolean) => void;
  setHasWallet: (value: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isOnboardingComplete, setIsOnboardingCompleteState] = useState(false);
  const [hasWallet, setHasWalletState] = useState(false);

  const setOnboardingComplete = async (value: boolean) => {
    setIsOnboardingCompleteState(value);
    try {
      await setItemAsync('onboarding_complete', value.toString());
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const setHasWallet = (value: boolean) => {
    setHasWalletState(value);
  };

  const checkAuthStatus = async () => {
    try {
      const onboardingStatus = await getItemAsync('onboarding_complete');
      const walletData = await getItemAsync('wallet_data');

      setIsOnboardingCompleteState(onboardingStatus === 'true');
      setHasWalletState(!!walletData);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    isOnboardingComplete,
    hasWallet,
    setOnboardingComplete,
    setHasWallet,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
