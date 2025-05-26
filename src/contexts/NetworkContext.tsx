import React, { createContext, useState, useContext, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';

interface NetworkContextType {
  isConnected: boolean;
  isOfflineMode: boolean;
  toggleOfflineMode: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected !== null ? state.isConnected : false);
    });

    // Load offline mode preference
    const loadOfflineMode = async () => {
      try {
        const value = await SecureStore.getItemAsync('offlineMode');
        setIsOfflineMode(value === 'true');
      } catch (error) {
        console.error('Error loading offline mode preference:', error);
      }
    };

    loadOfflineMode();

    return () => {
      unsubscribe();
    };
  }, []);

  // Toggle offline mode
  const toggleOfflineMode = async () => {
    try {
      const newValue = !isOfflineMode;
      await SecureStore.setItemAsync('offlineMode', newValue ? 'true' : 'false');
      setIsOfflineMode(newValue);
    } catch (error) {
      console.error('Error saving offline mode preference:', error);
      // Update state even if saving to storage fails
      setIsOfflineMode(!isOfflineMode);
    }
  };

  return (
    <NetworkContext.Provider value={{ isConnected, isOfflineMode, toggleOfflineMode }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};