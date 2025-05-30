import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createWalletFromMnemonic, createWalletFromPrivateKey } from '@/utils/cryptoUtils';
import NfcManager from '@/services/NfcManager';
import { createUser, createTransaction, getTransactions } from '@/utils/api';

interface WalletInfo {
  address: string;
  name: string;
  cardType: 'sender' | 'receiver' | null;
  isOnline: boolean;
}

interface PendingTransaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  to?: string;
  from?: string;
  timestamp: number;
  cardId?: string;
}

interface WalletContextType {
  walletInfo: WalletInfo;
  pendingTransactions: PendingTransaction[];
  isOnlineMode: boolean;
  createWallet: (mnemonic: string) => Promise<void>;
  importWallet: (value: string, type: 'mnemonic' | 'privateKey') => Promise<void>;
  setCardType: (type: 'sender' | 'receiver') => Promise<void>;
  toggleOnlineMode: () => void;
  processNfcTransaction: (cardData: any, amount: number) => Promise<void>;
  syncPendingTransactions: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  walletInfo: { address: '', name: '', cardType: null, isOnline: false },
  pendingTransactions: [],
  isOnlineMode: true,
  createWallet: async () => {},
  importWallet: async () => {},
  setCardType: async () => {},
  toggleOnlineMode: () => {},
  processNfcTransaction: async () => {},
  syncPendingTransactions: async () => {},
  refreshWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

const storage = Platform.OS === 'web' ? AsyncStorage : SecureStore;

const storeData = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error('Error storing data:', error);
  }
};

const getData = async (key: string) => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ 
    address: '', 
    name: '', 
    cardType: null, 
    isOnline: false 
  });
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isOnlineMode, setIsOnlineMode] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const walletData = await getData('wallet_data');
        const storedUserId = await getData('user_id');
        const pendingTxData = await getData('pending_transactions');
        const onlineMode = await getData('online_mode');

        if (walletData) {
          const parsedWallet = JSON.parse(walletData);
          setWalletInfo({
            address: parsedWallet.address || '',
            name: parsedWallet.name || 'My Wallet',
            cardType: parsedWallet.cardType || null,
            isOnline: false
          });

          if (storedUserId) {
            setUserId(storedUserId);
            await refreshWallet();
          }
        }

        if (pendingTxData) {
          setPendingTransactions(JSON.parse(pendingTxData));
        }

        if (onlineMode) {
          setIsOnlineMode(JSON.parse(onlineMode));
        }

        // Check online status
        await checkOnlineStatus();
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };

    loadWallet();
  }, []);

  const checkOnlineStatus = async () => {
    try {
      // Simple connectivity check
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      setWalletInfo(prev => ({ ...prev, isOnline: true }));

      // Auto-sync pending transactions when online
      if (pendingTransactions.length > 0) {
        await syncPendingTransactions();
      }
    } catch (error) {
      setWalletInfo(prev => ({ ...prev, isOnline: false }));
    }
  };

  const createWallet = async (mnemonic: string) => {
    try {
      const { address, privateKey } = await createWalletFromMnemonic(mnemonic);
      console.log('Wallet created successfully:', { address });

      // Create user in backend
      try {
        const user = await createUser(address);
        await storeData('user_id', user.id.toString());
        setUserId(user.id.toString());
        console.log('User created in backend:', user.id);
      } catch (backendError) {
        console.warn('Backend user creation failed, continuing without backend:', backendError);
      }

      const newWalletInfo = {
        address,
        name: 'My Wallet',
        cardType: null,
        isOnline: false
      };

      const walletData = {
        address,
        privateKey,
        mnemonic,
        name: 'My Wallet',
        cardType: null
      };

      await storeData('wallet_data', JSON.stringify(walletData));
      setWalletInfo(newWalletInfo);
      console.log('Wallet data stored successfully');

      await checkOnlineStatus();
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

      try {
        const user = await createUser(address);
        await storeData('user_id', user.id.toString());
        setUserId(user.id.toString());
      } catch (backendError) {
        console.warn('Backend user creation failed, continuing without backend:', backendError);
      }

      const newWalletInfo = {
        address,
        name: 'My Wallet',
        cardType: null,
        isOnline: false
      };

      const walletData = {
        address,
        privateKey: type === 'mnemonic' ? privateKey : value,
        mnemonic: type === 'mnemonic' ? value : '',
        name: 'My Wallet',
        cardType: null
      };

      await storeData('wallet_data', JSON.stringify(walletData));
      setWalletInfo(newWalletInfo);

      await checkOnlineStatus();
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };

  const setCardType = async (type: 'sender' | 'receiver') => {
    try {
      const walletData = await getData('wallet_data');
      if (walletData) {
        const parsedWallet = JSON.parse(walletData);
        parsedWallet.cardType = type;
        await storeData('wallet_data', JSON.stringify(parsedWallet));

        setWalletInfo(prev => ({ ...prev, cardType: type }));
      }
    } catch (error) {
      console.error('Error setting card type:', error);
      throw error;
    }
  };

  const toggleOnlineMode = () => {
    const newMode = !isOnlineMode;
    setIsOnlineMode(newMode);
    storeData('online_mode', JSON.stringify(newMode));
  };

  const processNfcTransaction = async (cardData: any, amount: number) => {
    try {
      const transaction: PendingTransaction = {
        id: Date.now().toString(),
        type: walletInfo.cardType === 'sender' ? 'send' : 'receive',
        amount,
        to: walletInfo.cardType === 'sender' ? cardData.address : walletInfo.address,
        from: walletInfo.cardType === 'sender' ? walletInfo.address : cardData.address,
        timestamp: Date.now(),
        cardId: cardData.id
      };

      if (isOnlineMode && walletInfo.isOnline) {
        // Process immediately
        console.log('Processing transaction immediately:', transaction);

        if (userId) {
          await createTransaction(userId, {
            symbol: 'SUI',
            amount: transaction.amount,
            type: transaction.type === 'send' ? 'sent' : 'received',
            to_address: transaction.to,
            from_address: transaction.from
          });
        }

        console.log('Transaction completed successfully');
      } else {
        // Queue for later processing
        console.log('Queueing transaction for offline processing:', transaction);
        const newPendingTransactions = [...pendingTransactions, transaction];
        setPendingTransactions(newPendingTransactions);
        await storeData('pending_transactions', JSON.stringify(newPendingTransactions));
        console.log('Transaction queued successfully');
      }
    } catch (error) {
      console.error('Error processing NFC transaction:', error);
      throw error;
    }
  };

  const syncPendingTransactions = async () => {
    if (!walletInfo.isOnline || !userId || pendingTransactions.length === 0) return;

    try {
      console.log('Syncing pending transactions:', pendingTransactions.length);

      for (const transaction of pendingTransactions) {
        await createTransaction(userId, {
          symbol: 'SUI',
          amount: transaction.amount,
          type: transaction.type === 'send' ? 'sent' : 'received',
          to_address: transaction.to,
          from_address: transaction.from
        });
      }

      // Clear pending transactions after successful sync
      setPendingTransactions([]);
      await storeData('pending_transactions', JSON.stringify([]));
      console.log('All pending transactions synced successfully');
    } catch (error) {
      console.error('Error syncing pending transactions:', error);
      throw error;
    }
  };

  const refreshWallet = async () => {
    if (!userId) return;

    try {
      await checkOnlineStatus();

      if (walletInfo.isOnline) {
        const transactions = await getTransactions(userId);
        console.log('Wallet refreshed with', transactions.length, 'transactions');
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletInfo,
        pendingTransactions,
        isOnlineMode,
        createWallet,
        importWallet,
        setCardType,
        toggleOnlineMode,
        processNfcTransaction,
        syncPendingTransactions,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};