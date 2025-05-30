
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createWalletFromMnemonic, createWalletFromPrivateKey } from '@/utils/cryptoUtils';
import NfcManager from '@/services/NfcManager';

interface WalletInfo {
  address: string;
  name: string;
<<<<<<< HEAD
  cardType: 'sender' | 'receiver' | null;
=======
  type: 'sender' | 'receiver' | null;
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
  isOnline: boolean;
}

interface PendingTransaction {
  id: string;
<<<<<<< HEAD
  type: 'send' | 'receive';
  amount: number;
  to?: string;
  from?: string;
  timestamp: number;
  cardId?: string;
=======
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature: string;
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
}

interface WalletContextType {
  walletInfo: WalletInfo;
  pendingTransactions: PendingTransaction[];
<<<<<<< HEAD
  isOnlineMode: boolean;
=======
  isOnline: boolean;
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
  createWallet: (mnemonic: string) => Promise<void>;
  importWallet: (value: string, type: 'mnemonic' | 'privateKey') => Promise<void>;
  setCardType: (type: 'sender' | 'receiver') => Promise<void>;
  toggleOnlineMode: () => void;
<<<<<<< HEAD
  processNfcTransaction: (cardData: any, amount: number) => Promise<void>;
  syncPendingTransactions: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  walletInfo: { address: '', name: '', cardType: null, isOnline: false },
  pendingTransactions: [],
  isOnlineMode: true,
=======
  processPendingTransactions: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  walletInfo: { address: '', name: '', type: null, isOnline: true },
  pendingTransactions: [],
  isOnline: true,
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
  createWallet: async () => {},
  importWallet: async () => {},
  setCardType: async () => {},
  toggleOnlineMode: () => {},
<<<<<<< HEAD
  processNfcTransaction: async () => {},
  syncPendingTransactions: async () => {},
  refreshWallet: async () => {},
=======
  processPendingTransactions: async () => {},
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
});

export const useWallet = () => useContext(WalletContext);

const storage = Platform.OS === 'web' ? AsyncStorage : SecureStore;

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ 
    address: '', 
    name: '', 
<<<<<<< HEAD
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
=======
    type: null,
    isOnline: true 
  });
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const walletData = await storage.getItem('wallet_data');
      if (walletData) {
        const parsed = JSON.parse(walletData);
        setWalletInfo({
          address: parsed.address || '',
          name: parsed.name || 'My Wallet',
          type: parsed.type || null,
          isOnline: true
        });
      }

      const pendingTxs = await storage.getItem('pending_transactions');
      if (pendingTxs) {
        setPendingTransactions(JSON.parse(pendingTxs));
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
    }
  };

  const createWallet = async (mnemonic: string) => {
    try {
      const { address, privateKey } = await createWalletFromMnemonic(mnemonic);
<<<<<<< HEAD
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
=======
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      
      const newWalletInfo = {
        address,
        name: 'My Wallet',
<<<<<<< HEAD
        cardType: null,
        isOnline: false
=======
        type: null,
        isOnline: true
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      };

      const walletData = {
        address,
        privateKey,
        mnemonic,
        name: 'My Wallet',
<<<<<<< HEAD
        cardType: null
=======
        type: null
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      };

      await storage.setItem('wallet_data', JSON.stringify(walletData));
      setWalletInfo(newWalletInfo);
<<<<<<< HEAD
      console.log('Wallet data stored successfully');
      
      await checkOnlineStatus();
=======
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  };

  const importWallet = async (value: string, type: 'mnemonic' | 'privateKey') => {
    try {
<<<<<<< HEAD
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
      
      const user = await createUser(address);
      await storeData('user_id', user.id.toString());
      setUserId(user.id.toString());
      
      const newWalletInfo = {
        address,
        name: 'My Wallet',
        cardType: null,
        isOnline: false
=======
      const { address, privateKey } = type === 'mnemonic' 
        ? await createWalletFromMnemonic(value)
        : await createWalletFromPrivateKey(value);

      const newWalletInfo = {
        address,
        name: 'My Wallet',
        type: null,
        isOnline: true
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      };

      const walletData = {
        address,
        privateKey: type === 'mnemonic' ? privateKey : value,
        mnemonic: type === 'mnemonic' ? value : '',
        name: 'My Wallet',
<<<<<<< HEAD
        cardType: null
=======
        type: null
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      };

      await storage.setItem('wallet_data', JSON.stringify(walletData));
      setWalletInfo(newWalletInfo);
<<<<<<< HEAD
      
      await checkOnlineStatus();
=======
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };

  const setCardType = async (type: 'sender' | 'receiver') => {
<<<<<<< HEAD
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
=======
    try {
      const walletData = await storage.getItem('wallet_data');
      if (!walletData) throw new Error('No wallet found');

      const parsed = JSON.parse(walletData);
      parsed.type = type;

      await storage.setItem('wallet_data', JSON.stringify(parsed));
      setWalletInfo(prev => ({ ...prev, type }));

      // Write card type to NFC tag
      if (Platform.OS !== 'web') {
        await NfcManager.writeCardType(parsed.address, type);
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      }
    } catch (error) {
      console.error('Error setting card type:', error);
      throw error;
    }
  };

  const toggleOnlineMode = () => {
    setIsOnline(prev => !prev);
    setWalletInfo(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const processPendingTransactions = async () => {
    if (!isOnline || pendingTransactions.length === 0) return;

    try {
      // Process each pending transaction
      for (const tx of pendingTransactions) {
        try {
          // Submit transaction to blockchain
          // await submitTransaction(tx);
          
          // Remove from pending list
          setPendingTransactions(prev => 
            prev.filter(pending => pending.id !== tx.id)
          );
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }

      // Update storage
      await storage.setItem('pending_transactions', 
        JSON.stringify(pendingTransactions)
      );
    } catch (error) {
      console.error('Error processing pending transactions:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletInfo,
        pendingTransactions,
<<<<<<< HEAD
        isOnlineMode,
=======
        isOnline,
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
        createWallet,
        importWallet,
        setCardType,
        toggleOnlineMode,
<<<<<<< HEAD
        processNfcTransaction,
        syncPendingTransactions,
        refreshWallet,
=======
        processPendingTransactions,
>>>>>>> e5f946a3225289ba112c30ae24e8200cd78344a1
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
