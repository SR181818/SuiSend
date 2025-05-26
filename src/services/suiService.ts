import { Connection, JsonRpcProvider, Ed25519Keypair, RawSigner, TransactionBlock, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import * as SecureStore from 'expo-secure-store';

// Network endpoints
const NETWORKS = {
  devnet: 'https://fullnode.devnet.sui.io',
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io'
};

// Default network
const DEFAULT_NETWORK = 'testnet';

class SuiService {
  private provider: JsonRpcProvider;
  private network: string;

  constructor(network = DEFAULT_NETWORK) {
    this.network = network;
    this.provider = new JsonRpcProvider(new Connection({ fullnode: NETWORKS[network] }));
  }

  /**
   * Set the network to use (devnet, testnet, mainnet)
   */
  public setNetwork(network: string): void {
    if (!NETWORKS[network]) {
      throw new Error(`Unsupported network: ${network}`);
    }
    this.network = network;
    this.provider = new JsonRpcProvider(new Connection({ fullnode: NETWORKS[network] }));
  }

  /**
   * Get the current balance for an address
   */
  public async getBalance(address: string): Promise<number> {
    try {
      const { totalBalance } = await this.provider.getBalance({ owner: address });
      return Number(totalBalance) / 1_000_000_000; // Convert from MIST to SUI
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Get objects owned by an address
   */
  public async getOwnedObjects(address: string) {
    try {
      const objects = await this.provider.getOwnedObjects({ owner: address });
      return objects.data;
    } catch (error) {
      console.error('Error getting owned objects:', error);
      throw error;
    }
  }

  /**
   * Derive a keypair from a mnemonic
   */
  public deriveKeypair(mnemonic: string): Ed25519Keypair {
    return Ed25519Keypair.deriveKeypair(mnemonic);
  }

  /**
   * Create a new keypair
   */
  public createKeypair(): Ed25519Keypair {
    return new Ed25519Keypair();
  }

  /**
   * Store a keypair securely
   */
  public async storeKeypair(keypair: Ed25519Keypair, walletName: string): Promise<void> {
    try {
      const exportedKeypair = keypair.export();
      await SecureStore.setItemAsync(`wallet_${walletName}_keypair`, exportedKeypair);
    } catch (error) {
      console.error('Error storing keypair:', error);
      throw error;
    }
  }

  /**
   * Retrieve a stored keypair
   */
  public async retrieveKeypair(walletName: string): Promise<Ed25519Keypair | null> {
    try {
      const exportedKeypair = await SecureStore.getItemAsync(`wallet_${walletName}_keypair`);
      if (!exportedKeypair) return null;
      
      return Ed25519Keypair.fromSecretKey(Buffer.from(exportedKeypair, 'base64'));
    } catch (error) {
      console.error('Error retrieving keypair:', error);
      return null;
    }
  }

  /**
   * Create a transaction block for sending SUI
   */
  public createTransferTransaction(
    amount: number,
    recipient: string,
    coinObjectIds?: string[]
  ): TransactionBlock {
    const tx = new TransactionBlock();
    
    if (coinObjectIds && coinObjectIds.length > 0) {
      // Use specific coin objects
      tx.transferObjects(
        coinObjectIds.map(id => tx.object(id)),
        tx.pure(recipient)
      );
    } else {
      // Split coin from gas and send to recipient
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount * 1_000_000_000)]); // Convert SUI to MIST
      tx.transferObjects([coin], tx.pure(recipient));
    }
    
    return tx;
  }

  /**
   * Sign a transaction offline
   */
  public async signTransactionBlock(
    signer: RawSigner,
    transactionBlock: TransactionBlock
  ): Promise<Uint8Array> {
    try {
      const { bytes } = await signer.signTransactionBlock({ transactionBlock });
      return bytes;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  /**
   * Perform a dry run of a transaction to check for errors
   */
  public async dryRunTransaction(transactionBlock: TransactionBlock): Promise<boolean> {
    try {
      const dryRunResult = await this.provider.dryRunTransactionBlock({
        transactionBlock: await transactionBlock.build(),
      });
      
      return dryRunResult.effects.status.status === 'success';
    } catch (error) {
      console.error('Error in dry run:', error);
      return false;
    }
  }

  /**
   * Execute a signed transaction
   */
  public async executeTransaction(
    transactionBlock: TransactionBlock,
    signer: RawSigner
  ): Promise<SuiTransactionBlockResponse> {
    try {
      return await signer.signAndExecuteTransactionBlock({
        transactionBlock,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  }

  /**
   * Submit a pre-signed transaction
   */
  public async submitTransaction(signedTxBytes: Uint8Array): Promise<SuiTransactionBlockResponse> {
    try {
      return await this.provider.executeTransactionBlock({
        transactionBlock: signedTxBytes,
        signature: [], // This would be populated with the actual signature in a real implementation
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  public async getTransactionStatus(txDigest: string): Promise<string> {
    try {
      const result = await this.provider.getTransactionBlock({
        digest: txDigest,
        options: {
          showEffects: true,
        },
      });
      
      return result.effects?.status?.status || 'unknown';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const suiService = new SuiService();