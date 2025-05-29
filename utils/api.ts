import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
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