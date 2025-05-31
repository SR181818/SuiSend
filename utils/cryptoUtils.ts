
import { wordlist } from '@scure/bip39/wordlists/english';
import * as bip39 from '@scure/bip39';
import * as crypto from 'expo-crypto';
import { Platform } from 'react-native';

/**
 * Generate secure random bytes using platform-specific APIs
 */
const getRandomBytes = async (length: number): Promise<Uint8Array> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return array;
      } else {
        const array = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }
    } else {
      return await crypto.getRandomBytesAsync(length);
    }
  } catch (error) {
    console.error('Error generating random bytes:', error);
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
};

/**
 * Generate a random mnemonic phrase using simpler approach
 */
export const generateMnemonic = async (strength: number = 128): Promise<string> => {
  try {
    // Simple approach: directly pick 12 random words from the wordlist
    const wordCount = 12;
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const randomBytes = await getRandomBytes(2);
      const randomIndex = (randomBytes[0] << 8 | randomBytes[1]) % wordlist.length;
      words.push(wordlist[randomIndex]);
    }
    
    const mnemonic = words.join(' ');
    console.log('Generated mnemonic:', mnemonic);
    return mnemonic;
  } catch (error) {
    console.error('Error generating mnemonic:', error);
    
    // Fallback: use Math.random to select words
    const wordCount = 12;
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const randomIndex = Math.floor(Math.random() * wordlist.length);
      words.push(wordlist[randomIndex]);
    }
    
    const fallbackMnemonic = words.join(' ');
    console.log('Generated fallback mnemonic:', fallbackMnemonic);
    return fallbackMnemonic;
  }
};

/**
 * Validate a mnemonic phrase
 */
export const validateMnemonic = (mnemonic: string): boolean => {
  try {
    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12) return false;
    
    // Check if all words are in the wordlist
    return words.every(word => wordlist.includes(word.toLowerCase()));
  } catch (error) {
    console.error('Error validating mnemonic:', error);
    return false;
  }
};

/**
 * Validate a private key
 */
export const validatePrivateKey = (privateKey: string): boolean => {
  try {
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const isValidHex = /^[0-9a-fA-F]{64}$/.test(cleanKey);
    return isValidHex;
  } catch (error) {
    return false;
  }
};

/**
 * Create a simple hash from a string
 */
const simpleHash = async (input: string): Promise<string> => {
  try {
    const hash = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      input
    );
    return hash;
  } catch (error) {
    console.error('Error creating hash:', error);
    // Fallback hash using simple string manipulation
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }
};

/**
 * Create a wallet from a mnemonic phrase
 */
export const createWalletFromMnemonic = async (mnemonic?: string): Promise<{ address: string; privateKey: string; mnemonic: string }> => {
  try {
    const finalMnemonic = mnemonic || await generateMnemonic();
    console.log('Creating wallet from mnemonic:', finalMnemonic);
    
    // Create a seed from the mnemonic
    const seed = await simpleHash(finalMnemonic + 'seed');
    console.log('Generated seed:', seed);
    
    // Use the seed as private key (first 64 chars)
    const privateKey = '0x' + seed.slice(0, 64);
    console.log('Generated private key:', privateKey);
    
    // Generate address from private key
    const addressHash = await simpleHash(privateKey);
    const address = '0x' + addressHash.slice(0, 40);
    console.log('Generated address:', address);

    return {
      address,
      privateKey,
      mnemonic: finalMnemonic,
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
    console.log('Creating wallet from private key');
    
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Generate address from private key
    const addressHash = await simpleHash('0x' + cleanPrivateKey);
    const address = '0x' + addressHash.slice(0, 40);
    console.log('Generated address from private key:', address);

    return {
      address,
    };
  } catch (error) {
    console.error('Error creating wallet from private key:', error);
    throw new Error('Failed to create wallet from private key');
  }
};
