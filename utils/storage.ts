
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Web-compatible storage fallback
const webStorage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },

  async getItemAsync(key: string): Promise<string | null> {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },

  async deleteItemAsync(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// Use SecureStore for native platforms, localStorage for web
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export const setItemAsync = storage.setItemAsync;
export const getItemAsync = storage.getItemAsync;
export const deleteItemAsync = storage.deleteItemAsync;
