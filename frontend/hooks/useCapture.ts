'use client';

import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, GAME_STATE_ID } from '@/config/constants';
import { useState } from 'react';
import { battleApi } from '@/lib/api';

export interface CaptureParams {
  speciesId: number;
  name: string;
  level: number;
  types: string[]; // e.g., ["fire"], ["water", "flying"]
}

/**
 * Hook to handle Pokémon capture attempts and minting
 */
export function useCapture() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Calculate capture rate for a Pokémon
   */
  const calculateCaptureRate = async (
    pokemonId: number,
    healthPercent: number
  ): Promise<number> => {
    try {
      const result = await battleApi.calculateCaptureRate(pokemonId, healthPercent);
      return result.capture_rate;
    } catch (err) {
      console.error('Failed to calculate capture rate:', err);
      throw err;
    }
  };

  /**
   * Attempt to capture a Pokémon and mint NFT if successful
   */
  const attemptCapture = async (
    { speciesId, name, level, types }: CaptureParams,
    captureRate: number
  ): Promise<{ success: boolean; result?: any }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate Package ID
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      console.log('🎯 Attempting capture...');
      console.log('Species ID:', speciesId);
      console.log('Name:', name);
      console.log('Level:', level);
      console.log('Types:', types);
      console.log('Capture Rate:', captureRate);

      // Simulate capture attempt based on capture rate
      const success = Math.random() < captureRate;

      if (!success) {
        console.log('❌ Capture failed (RNG)');
        setIsLoading(false);
        return { success: false };
      }

      console.log('✅ Capture successful! Minting NFT...');
      console.log('Package ID:', PACKAGE_ID);

      // If successful, mint the Pokémon NFT
      const tx = new Transaction();

      // Convert types to vector of vectors (bytes)
      const typesBytes = types.map(type => 
        Array.from(new TextEncoder().encode(type))
      );

      tx.moveCall({
        target: `${PACKAGE_ID}::pokemon::mint_captured`,
        arguments: [
          tx.pure.u64(speciesId),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(name))),
          tx.pure.u64(level),
          tx.pure.vector('vector<u8>', typesBytes),
          tx.object('0x6'), // Clock object
        ],
      });

      console.log('📝 Transaction built, requesting signature...');

      return new Promise((resolve, reject) => {
        signAndExecute(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              console.log('✅ Pokémon captured and minted:', result);
              console.log('Transaction result:', JSON.stringify(result, null, 2));
              
              // Extract the created Pokemon NFT object ID from transaction result
              let pokemonObjectId = null;
              
              if (result.effects && typeof result.effects === 'object' && 'created' in result.effects) {
                const effects = result.effects as any;
                if (effects.created && Array.isArray(effects.created) && effects.created.length > 0) {
                  // Find the Pokemon object (not the UID)
                  const createdObjects = effects.created;
                  console.log('Created objects:', createdObjects);
                  
                  // The Pokemon NFT should be the first created object
                  pokemonObjectId = createdObjects[0]?.reference?.objectId;
                  console.log('Extracted Pokemon Object ID:', pokemonObjectId);
                }
              }
              
              // Pokemon is now minted as NFT on blockchain
              // No need to save to Firestore - we query directly from blockchain
              console.log('✅ Pokemon NFT minted on blockchain with ID:', pokemonObjectId);
              
              setIsLoading(false);
              resolve({ success: true, result });
            },
            onError: (err) => {
              console.error('❌ Failed to mint captured Pokémon:', err);
              console.error('Error details:', JSON.stringify(err, null, 2));
              setError(err as Error);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error during capture attempt:', error);
      console.error('Error stack:', error.stack);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    calculateCaptureRate,
    attemptCapture,
    isLoading,
    error,
  };
}
