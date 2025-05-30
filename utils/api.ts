import axios from 'axios';
import { Platform } from 'react-native';

// Determine the API URL based on the platform and environment
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    // For web, use the current origin to avoid mixed content issues
    const origin = window.location.origin;
    return `${origin}/api`;
  }
  
  // For native platforms, use the configured API URL
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// User endpoints
export const createUser = async (walletAddress: string) => {
  const response = await api.post('/users', { wallet_address: walletAddress });
  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// NFC Card endpoints
export const getCardData = async (cardId: string) => {
  const response = await api.get(`/nfc/cards/${cardId}`);
  return response.data;
};

export const createCard = async (userId: string, cardData: any) => {
  const response = await api.post('/nfc/cards', {
    user_id: userId,
    card_data: cardData,
  });
  return response.data;
};

export const updateCard = async (cardId: string, cardData: any) => {
  const response = await api.put(`/nfc/cards/${cardId}`, { card_data: cardData });
  return response.data;
};

// Transaction endpoints
export const getTransactions = async (userId: string) => {
  const response = await api.get(`/transactions/${userId}`);
  return response.data;
};

export const createTransaction = async (userId: string, transactionData: any) => {
  const response = await api.post('/transactions', {
    user_id: userId,
    transaction_data: transactionData,
  });
  return response.data;
};