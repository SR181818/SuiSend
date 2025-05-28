import * as bip39 from 'bip39';
import * as crypto from 'expo-crypto';
import { Platform } from 'react-native';

/**
 * Generate a random mnemonic phrase
 */
export const generateMnemonic = async (): Promise<string> => {
  try {
    // Generate entropy
    const entropy = await crypto.getRandomBytesAsync(16);
    
    // Convert to hex string
    const entropyHex = Buffer.from(entropy).toString('hex');
    
    // Generate mnemonic from entropy
    const mnemonic = bip39.entropyToMnemonic(entropyHex);
    
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
  return bip39.validateMnemonic(mnemonic);
};

/**
 * Validate a private key
 */
export const validatePrivateKey = (privateKey: string): boolean => {
  // Basic validation: should be a valid hex string of correct length
  // In a real app, you would do more comprehensive validation
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
    const seed = await bip39.mnemonicToSeed(mnemonic);
    
    // Use the first 32 bytes of the seed as private key
    const privateKeyBytes = seed.slice(0, 32);
    const privateKey = Buffer.from(privateKeyBytes).toString('hex');
    
    // Generate an address (in a real app, this would derive the public key and then the address)
    const addressBytes = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      privateKey
    );
    const address = '0x' + Buffer.from(addressBytes).toString('hex').slice(0, 40);
    
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
    // For this example, we'll simulate address generation
    
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Generate an address (in a real app, this would derive the public key and then the address)
    const addressBytes = await crypto.digestStringAsync(
      crypto.CryptoDigestAlgorithm.SHA256,
      cleanPrivateKey
    );
    const address = '0x' + Buffer.from(addressBytes).toString('hex').slice(0, 40);
    
    return {
      address,
    };
  } catch (error) {
    console.error('Error creating wallet from private key:', error);
    throw new Error('Failed to create wallet from private key');
  }
};