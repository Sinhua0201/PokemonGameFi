/**
 * React hooks for Pokémon NFT operations
 */
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0x0';

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

/**
 * Hook for updating Pokémon NFT stats on-chain
 */
export function useUpdatePokemonStats() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateStats = async (
    nftId: string,
    newExperience: number,
    newLevel: number,
    newStats: PokemonStats
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::pokemon_nft::update_stats`,
        arguments: [
          tx.object(nftId),
          tx.pure.u32(newExperience),
          tx.pure.u8(newLevel),
          tx.pure.vector('u16', [newStats.hp, newStats.attack, newStats.defense, newStats.speed]),
        ],
      });
      
      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('Stats updated on-chain:', result);
              setIsLoading(false);
              resolve();
            },
            onError: (error: any) => {
              console.error('Failed to update stats:', error);
              setError(error as Error);
              setIsLoading(false);
              reject(error);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };
  
  return { updateStats, isLoading, error };
}

/**
 * Hook for incrementing egg incubation steps
 */
export function useIncrementEggSteps() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const incrementSteps = async (eggId: string, steps: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::egg_nft::increment_incubation`,
        arguments: [
          tx.object(eggId),
          tx.pure.u32(steps),
        ],
      });
      
      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('Egg incubation incremented:', result);
              setIsLoading(false);
              resolve();
            },
            onError: (error: any) => {
              console.error('Failed to increment egg steps:', error);
              setError(error as Error);
              setIsLoading(false);
              reject(error);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };
  
  return { incrementSteps, isLoading, error };
}

/**
 * Hook for adding experience to a Pokemon after battle
 */
export function useAddExperience() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const addExperience = async (pokemonId: string, expGained: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!PACKAGE_ID || PACKAGE_ID === '0x0') {
        throw new Error('Package ID not configured');
      }

      console.log('🔧 Adding experience to Pokemon...');
      console.log('Pokemon ID:', pokemonId);
      console.log('EXP Gained:', expGained);
      
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::pokemon::add_experience`,
        arguments: [
          tx.object(pokemonId),
          tx.pure.u64(expGained),
        ],
      });
      
      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result: any) => {
              console.log('✅ Experience added on-chain:', result);
              setIsLoading(false);
              resolve();
            },
            onError: (error: any) => {
              console.error('❌ Failed to add experience:', error);
              setError(error as Error);
              setIsLoading(false);
              reject(error);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error preparing add experience transaction:', error);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };
  
  return { addExperience, isLoading, error };
}

/**
 * Hook for querying player's egg NFTs
 */
export function usePlayerEggs() {
  // This would use useSuiClientQuery to fetch eggs
  // For now, return empty array as placeholder
  return {
    eggs: [],
    isLoading: false,
    refetch: async () => {},
  };
}
