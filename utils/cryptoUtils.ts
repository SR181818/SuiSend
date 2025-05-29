import { wordlist } from '@scure/bip39/wordlists/english';
import { generateMnemonic as genMnemonic, validateMnemonic as validateMnem } from '@scure/bip39';
import * as crypto from 'expo-crypto';
import { Platform } from 'react-native';

/**
 * Platform-specific secure random bytes generation
 */
const getRandomBytesAsync = async (length: number): Promise<Uint8Array> => {
  if (Platform.OS === 'web') {
    // Use Web Crypto API for web platform
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array;
  } else {
    // Use expo-crypto for native platforms
    return await crypto.getRandomBytesAsync(length);
  }
};

/**
 * Generate a random mnemonic phrase
 */
export const generateMnemonic = async (): Promise<string> => {
  try {
    // Get 16 bytes (128 bits) of secure entropy using platform-specific method
    const entropy = await getRandomBytesAsync(16);
    
    // Generate mnemonic using @scure/bip39
    const mnemonic = genMnemonic(wordlist);
    
    return mnemonic;
  } catch (error) {
    console.error('Error generating mnemonic:', error);
    throw new Error('Failed to generate mnemonic');
  }
};

/**
 * Validate a mnemonic phrase
 */
export const validateMnemonic = (mnemonic: string): boolean => {
  return validateMnem(mnemonic, wordlist);
};

/**
 * Validate a private key
 */
export const validatePrivateKey = (privateKey: string): boolean => {
  // Basic validation: should be a valid hex string of correct length
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const isValidHex = /^[0-9a-fA-F]{64}$/.test(cleanKey);
  return isValidHex;
};

/**
 * Create a wallet from a mnemonic phrase
 */
export const createWalletFromMnemonic = async (mnemonic: string): Promise<{ address: string; privateKey: string }> => {
  try {
    // In a real app, this would use HD wallet derivation
    // For this example, we'll simulate wallet creation using the mnemonic to generate entropy
    
    // Generate seed from mnemonic
    const seed = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      mnemonic
    );
    
    // Use the first 32 bytes as private key
    const privateKey = seed.slice(0, 64);
    
    // Generate an address (in a real app, this would derive the public key and then the address)
    const addressBytes = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      privateKey
    );
    
    const address = '0x' + addressBytes.slice(0, 40);
    
    return {
      address,
      privateKey: '0x' + privateKey,
    };
  } catch (error) {
    console.error('Error creating wallet from mnemonic:', error);
    throw new Error('Failed to create wallet from mnemonic');
  }
};

/**
 * Create a wallet from a private key
 */
export const createWalletFromPrivateKey = async (privateKey: string): Promise<{ address: string }> => {
  try {
    // In a real app, this would derive the public key and then the address from the private key
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Generate an address (in a real app, this would derive the public key and then the address)
    const addressBytes = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      cleanPrivateKey
    );
    
    const address = '0x' + addressBytes.slice(0, 40);
    
    return {
      address,
    };
  } catch (error) {
    console.error('Error creating wallet from private key:', error);
    throw new Error('Failed to create wallet from private key');
  }
};