'use client';

import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '@/config/constants';
import { useState } from 'react';

export interface MintPokemonParams {
  speciesId: number;
  name: string;
  types: string[]; // e.g., ["fire"], ["water", "flying"]
}

/**
 * Hook to mint a Pokémon NFT
 */
export function useMintPokemon() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mintPokemon = async ({ speciesId, name, types }: MintPokemonParams): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate Package ID
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      console.log('🔧 Building mint transaction...');
      console.log('Package ID:', PACKAGE_ID);
      console.log('Species ID:', speciesId);
      console.log('Name:', name);
      console.log('Types:', types);

      const tx = new Transaction();

      // Convert types to vector of vectors (bytes)
      const typesBytes = types.map(type => 
        Array.from(new TextEncoder().encode(type))
      );

      // Call the mint_starter function from the smart contract
      tx.moveCall({
        target: `${PACKAGE_ID}::pokemon::mint_starter`,
        arguments: [
          tx.pure.u64(speciesId),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(name))),
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
              console.log('✅ Pokémon minted successfully:', result);
              console.log('Transaction digest:', result.digest);
              
              // Wait a bit for the transaction to be indexed
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Query the blockchain to get the created Pokemon object
              let pokemonObjectId = null;
              let walletAddress = null;
              
              try {
                const { SuiClient } = await import('@mysten/sui/client');
                const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
                
                // Get transaction details
                const txDetails = await client.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showObjectChanges: true,
                  },
                });
                
                console.log('📦 Transaction details:', txDetails);
                
                // Find the created Pokemon object
                if (txDetails.objectChanges) {
                  for (const change of txDetails.objectChanges) {
                    if (change.type === 'created' && 
                        change.objectType?.includes('::pokemon::Pokemon')) {
                      pokemonObjectId = change.objectId;
                      walletAddress = change.owner?.AddressOwner || 
                                    (change.owner as any)?.AddressOwner;
                      console.log('🎯 Found Pokemon object:', pokemonObjectId);
                      console.log('👤 Owner:', walletAddress);
                      break;
                    }
                  }
                }
              } catch (queryError) {
                console.error('⚠️ Failed to query transaction:', queryError);
              }
              
              // Save to Firestore with the real blockchain object ID
              if (pokemonObjectId && walletAddress) {
                try {
                  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                  const { db } = await import('@/lib/firebase');
                  
                  await setDoc(
                    doc(db, 'pokemon', pokemonObjectId),
                    {
                      id: pokemonObjectId,
                      objectId: pokemonObjectId,
                      owner: walletAddress,
                      species_id: speciesId,
                      speciesId: speciesId,
                      name: name,
                      level: 5,
                      experience: 0,
                      stats: {
                        hp: 45,
                        attack: 50,
                        defense: 50,
                        speed: 50,
                      },
                      types: types,
                      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
                      createdAt: serverTimestamp(),
                      isStarter: true,
                      transactionDigest: result.digest,
                    }
                  );
                  console.log('✅ Starter Pokemon saved to Firestore with blockchain ID:', pokemonObjectId);
                } catch (firestoreError) {
                  console.error('⚠️ Failed to save to Firestore:', firestoreError);
                }
              } else {
                console.error('❌ Could not extract Pokemon object ID or wallet address');
              }
              
              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to mint Pokémon:', err);
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
      console.error('❌ Error preparing transaction:', error);
      console.error('Error stack:', error.stack);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    mintPokemon,
    isLoading,
    error,
  };
}
