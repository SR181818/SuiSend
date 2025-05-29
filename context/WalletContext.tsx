import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createWalletFromMnemonic, createWalletFromPrivateKey } from '@/utils/cryptoUtils';
import { createUser, getTransactions, createTransaction } from '@/utils/api';

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

// Platform-specific storage helper functions
const storeData = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getData = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ address: '', name: '' });
  const [balances, setBalances] = useState<Balances>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const walletData = await getData('wallet_data');
        const storedUserId = await getData('user_id');
        
        if (walletData) {
          const parsedWallet = JSON.parse(walletData);
          setWalletInfo({
            address: parsedWallet.address || '',
            name: parsedWallet.name || 'My Wallet',
          });
          
          if (storedUserId) {
            setUserId(storedUserId);
            await refreshWallet();
          }
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };
    
    loadWallet();
  }, []);

  const createWallet = async (mnemonic: string) => {
    try {
      const { address, privateKey } = await createWalletFromMnemonic(mnemonic);
      
      // Create user in backend
      const user = await createUser(address);
      await storeData('user_id', user.id.toString());
      setUserId(user.id.toString());
      
      const newWalletInfo = {
        address,
        name: 'My Wallet',
      };
      
      const walletData = {
        address,
        privateKey,
        mnemonic,
        name: 'My Wallet',
      };
      
      await storeData('wallet_data', JSON.stringify(walletData));
      setWalletInfo(newWalletInfo);
      
      await refreshWallet();
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
      
      // Create user in backend
      const user = await createUser(address);
      await storeData('user_id', user.id.toString());
      setUserId(user.id.toString());
      
      const newWalletInfo = {
        address,
        name: 'My Wallet',
      };
      
      const walletData = {
        address,
        privateKey,
        mnemonic: type === 'mnemonic' ? value : '',
        name: 'My Wallet',
      };
      
      await storeData('wallet_data', JSON.stringify(walletData));
      setWalletInfo(newWalletInfo);
      
      await refreshWallet();
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };

  const refreshWallet = async () => {
    if (!userId) return;
    
    try {
      // Fetch real transactions from backend
      const transactions = await getTransactions(userId);
      
      // Calculate balances from transactions
      const newBalances: Balances = {};
      transactions.forEach((tx: any) => {
        const { symbol, amount, type } = tx.transaction_data;
        if (!newBalances[symbol]) {
          newBalances[symbol] = {
            name: symbol,
            symbol,
            balance: 0,
            balanceUsd: 0,
            priceChangePercentage: 0,
          };
        }
        
        if (type === 'received') {
          newBalances[symbol].balance += amount;
        } else if (type === 'sent') {
          newBalances[symbol].balance -= amount;
        }
      });
      
      setBalances(newBalances);
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