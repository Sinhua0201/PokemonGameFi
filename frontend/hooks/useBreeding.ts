'use client';

import { useSignAndExecuteTransaction, useSuiClientQuery } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/config/constants';
import { useState } from 'react';
import { EggNFT } from '@/types/pokemon';

/**
 * Hook to breed two Pokémon and create an Egg NFT
 */
export function useBreedPokemon() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const breedPokemon = async (
    parent1Id: string,
    parent2Id: string,
    parent1Species: number,
    parent2Species: number
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate Package ID
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      console.log('🔧 Building breeding transaction...');
      console.log('Package ID:', PACKAGE_ID);
      console.log('Parent 1 Species:', parent1Species);
      console.log('Parent 2 Species:', parent2Species);

      const tx = new Transaction();

      // Generate genetics data (simple random for now)
      const genetics = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));
      console.log('Generated genetics:', genetics);

      // Call the breed_pokemon function from the smart contract
      tx.moveCall({
        target: `${PACKAGE_ID}::egg::breed_pokemon`,
        arguments: [
          tx.pure.u64(parent1Species),
          tx.pure.u64(parent2Species),
          tx.pure.vector('u8', genetics),
          tx.object('0x6'), // Clock object
        ],
      });

      console.log('📝 Transaction built, requesting signature...');

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log('✅ Egg created successfully:', result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to breed Pokémon:', err);
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
      console.error('❌ Error preparing breeding transaction:', error);
      console.error('Error stack:', error.stack);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    breedPokemon,
    isLoading,
    error,
  };
}

/**
 * Hook to hatch an Egg NFT into a Pokémon
 */
export function useHatchEgg() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const hatchEgg = async (
    eggId: string,
    offspringSpecies: number,
    offspringName: string,
    offspringTypes: string[]
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate Package ID
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      // Validate egg ID
      if (!eggId || eggId === '') {
        throw new Error('Invalid egg ID');
      }

      console.log('🔧 Building hatching transaction...');
      console.log('Package ID:', PACKAGE_ID);
      console.log('Egg ID:', eggId);
      console.log('Offspring Species:', offspringSpecies);
      console.log('Offspring Name:', offspringName);
      console.log('Offspring Types:', offspringTypes);

      const tx = new Transaction();

      // Convert types to vector of vectors
      const typesBytes = offspringTypes.map(type => 
        Array.from(new TextEncoder().encode(type))
      );

      // Call the hatch_egg function from the smart contract
      tx.moveCall({
        target: `${PACKAGE_ID}::egg::hatch_egg`,
        arguments: [
          tx.object(eggId),
          tx.pure.u64(offspringSpecies),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(offspringName))),
          tx.pure.vector('vector<u8>', typesBytes),
          tx.object('0x6'), // Clock object
        ],
      });

      console.log('📝 Transaction built, requesting signature...');

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log('✅ Egg hatched successfully:', result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to hatch egg:', err);
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
      console.error('❌ Error preparing hatching transaction:', error);
      console.error('Error stack:', error.stack);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    hatchEgg,
    isLoading,
    error,
  };
}

/**
 * Hook to add battle steps to an egg after winning a battle
 */
export function useAddBattleSteps() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addBattleSteps = async (eggId: string): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate Package ID
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      // Validate egg ID
      if (!eggId || eggId === '') {
        throw new Error('Invalid egg ID');
      }

      console.log('🔧 Building add battle steps transaction...');
      console.log('Package ID:', PACKAGE_ID);
      console.log('Egg ID:', eggId);

      const tx = new Transaction();

      // Call the add_battle_steps function from the smart contract
      tx.moveCall({
        target: `${PACKAGE_ID}::egg::add_battle_steps`,
        arguments: [
          tx.object(eggId),
        ],
      });

      console.log('📝 Transaction built, requesting signature...');

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: (result) => {
              console.log('✅ Battle steps added successfully:', result);
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to add battle steps:', err);
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
      console.error('❌ Error preparing add battle steps transaction:', error);
      console.error('Error stack:', error.stack);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    addBattleSteps,
    isLoading,
    error,
  };
}

/**
 * Hook to query player's Egg NFTs from the blockchain
 */
export function usePlayerEggs() {
  const account = useCurrentAccount();
  const isPackageIdSet = !!PACKAGE_ID && PACKAGE_ID !== '';

  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address!,
      filter: {
        StructType: `${PACKAGE_ID}::egg::Egg`,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    },
    {
      enabled: !!account?.address && isPackageIdSet,
      retry: 2,
    }
  );

  // Parse egg data from blockchain response
  const eggs: EggNFT[] = (data?.data || []).map((obj: any) => {
    const content = obj.data?.content?.fields || {};
    return {
      id: obj.data?.objectId || '',
      parent1Species: parseInt(content.parent1_species || '0'),
      parent2Species: parseInt(content.parent2_species || '0'),
      incubationSteps: parseInt(content.incubation_steps || '0'),
      requiredSteps: parseInt(content.required_steps || '1000'),
      genetics: content.genetics || [],
      owner: content.owner || '',
      createdTimestamp: parseInt(content.created_timestamp || '0'),
    };
  });

  return {
    eggs,
    hasEggs: eggs.length > 0,
    isLoading: isPackageIdSet ? isLoading : false,
    error: isPackageIdSet ? error : null,
    refetch,
    isPackageIdSet,
  };
}
