import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface User {
  id: string;
  email?: string;
  isAuthenticated: boolean;
  hasWallet: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthRequired: boolean;
  setAuthRequired: (required: boolean) => void;
  login: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  checkBiometricAvailability: () => Promise<boolean>;
  hasWallet: boolean;
  setHasWallet: (hasWallet: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthRequired, setIsAuthRequiredState] = useState(false);
  const [hasWallet, setHasWalletState] = useState<boolean>(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authRequired = await SecureStore.getItemAsync('auth_required');
      setIsAuthRequiredState(authRequired === 'true');

      const hasWalletStored = await SecureStore.getItemAsync('hasWallet');
      setHasWalletState(hasWalletStored === 'true');

      if (authRequired === 'true') {
        const userId = await SecureStore.getItemAsync('user_id');
        if (userId) {
          setUser({
            id: userId,
            isAuthenticated: true,
            hasWallet: hasWalletStored === 'true',
          });
        }
      } else {
        // If auth is not required, create a default user
        setUser({
          id: 'default_user',
          isAuthenticated: true,
          hasWallet: hasWalletStored === 'true',
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthRequired = async (required: boolean) => {
    try {
      await SecureStore.setItemAsync('auth_required', required.toString());
      setIsAuthRequiredState(required);

      if (!required) {
        setUser({
          id: 'default_user',
          isAuthenticated: true,
          hasWallet: hasWallet,
        });
      }
    } catch (error) {
      console.error('Error setting auth requirement:', error);
    }
  };

  const login = async (email?: string) => {
    setIsLoading(true);
    try {
      const userId = email || `user_${Date.now()}`;
      await SecureStore.setItemAsync('user_id', userId);

      setUser({
        id: userId,
        email,
        isAuthenticated: true,
        hasWallet: hasWallet,
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('user_id');
      setUser(null);
      setHasWalletState(false);
      await SecureStore.deleteItemAsync('hasWallet');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const checkBiometricAvailability = async (): Promise<boolean> => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return isAvailable && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your wallet',
        fallbackLabel: 'Use passcode',
      });
      return result.success;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return false;
    }
  };

  const setHasWallet = async (hasWallet: boolean) => {
    setHasWalletState(hasWallet);
    await SecureStore.setItemAsync('hasWallet', hasWallet.toString());
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthRequired,
    setAuthRequired,
    login,
    logout,
    authenticateWithBiometrics,
    checkBiometricAvailability,
    hasWallet,
    setHasWallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};