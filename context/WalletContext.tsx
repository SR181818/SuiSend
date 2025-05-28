import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createWalletFromMnemonic, createWalletFromPrivateKey } from '@/utils/cryptoUtils';
import { mockBalances } from '@/utils/mockData';

interface WalletInfo {
  address: string;
  name: string;
}

interface Balance {
  name: string;
  symbol: string;
  balance: number;
  balanceUsd: number;
  priceChangePercentage: number;
}

interface Balances {
  [symbol: string]: Balance;
}

interface WalletContextType {
  walletInfo: WalletInfo;
  balances: Balances;
  createWallet: (mnemonic: string) => Promise<void>;
  importWallet: (value: string, type: 'mnemonic' | 'privateKey') => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  walletInfo: { address: '', name: '' },
  balances: {},
  createWallet: async () => {},
  importWallet: async () => {},
  refreshWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ address: '', name: '' });
  const [balances, setBalances] = useState<Balances>({});

  useEffect(() => {
    const loadWallet = async () => {
      try {
        // In a real app, we would decrypt the wallet from secure storage
        const encryptedWallet = await SecureStore.getItemAsync('wallet_data');
        
        if (encryptedWallet) {
          // Simulating decryption and loading of wallet data
          const walletData = JSON.parse(encryptedWallet);
          setWalletInfo({
            address: walletData.address || '',
            name: walletData.name || 'My Wallet',
          });
          
          // Load balances (in a real app, this would be from an API)
          setBalances(mockBalances);
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };
    
    loadWallet();
  }, []);

  const createWallet = async (mnemonic: string) => {
    try {
      // Generate wallet from mnemonic
      const { address, privateKey } = await createWalletFromMnemonic(mnemonic);
      
      // Create wallet info
      const newWalletInfo = {
        address,
        name: 'My Wallet',
      };
      
      // In a real app, we would encrypt the private key and mnemonic
      const walletData = {
        address,
        privateKey,
        mnemonic,
        name: 'My Wallet',
      };
      
      // Save wallet data
      await SecureStore.setItemAsync('wallet_data', JSON.stringify(walletData));
      
      // Update state
      setWalletInfo(newWalletInfo);
      setBalances(mockBalances);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  };

  const importWallet = async (value: string, type: 'mnemonic' | 'privateKey') => {
    try {
      let address = '';
      let privateKey = '';
      
      if (type === 'mnemonic') {
        const wallet = await createWalletFromMnemonic(value);
        address = wallet.address;
        privateKey = wallet.privateKey;
      } else {
        const wallet = await createWalletFromPrivateKey(value);
        address = wallet.address;
        privateKey = value;
      }
      
      // Create wallet info
      const newWalletInfo = {
        address,
        name: 'My Wallet',
      };
      
      // In a real app, we would encrypt the private key and mnemonic
      const walletData = {
        address,
        privateKey,
        mnemonic: type === 'mnemonic' ? value : '',
        name: 'My Wallet',
      };
      
      // Save wallet data
      await SecureStore.setItemAsync('wallet_data', JSON.stringify(walletData));
      
      // Update state
      setWalletInfo(newWalletInfo);
      setBalances(mockBalances);
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };

  const refreshWallet = async () => {
    try {
      // In a real app, this would fetch balances from an API
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update balances with mock data
      setBalances(mockBalances);
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletInfo,
        balances,
        createWallet,
        importWallet,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};