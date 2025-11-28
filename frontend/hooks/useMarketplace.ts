'use client';

import { useState, useEffect } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID, MARKETPLACE_ID, RPC_URL } from '@/config/constants';
import { 
  getActiveListings, 
  createMarketplaceListing, 
  updateListingStatus 
} from '@/lib/firestore';
import { MarketplaceListing } from '@/types/pokemon';

/**
 * Hook to fetch active marketplace listings from Firestore
 */
export function useMarketplaceListings(filters?: {
  nftType?: 'pokemon' | 'egg';
  maxPrice?: number;
}) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveListings(filters);
      setListings(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters?.nftType, filters?.maxPrice]);

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
  };
}

/**
 * Hook to list a Pokémon NFT on the marketplace
 */
export function useListPokemon() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const listPokemon = async (
    pokemonId: string,
    price: number,
    pokemonMetadata: any
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      if (!account?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('🔧 Building list Pokémon transaction...');
      console.log('Pokemon ID:', pokemonId);
      console.log('Price:', price);

      const tx = new Transaction();

      // Convert price to MIST (1 SUI = 1,000,000,000 MIST)
      const priceInMist = Math.floor(price * 1_000_000_000);

      // Call the list_pokemon function from the marketplace contract
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list_pokemon`,
        arguments: [
          tx.object(MARKETPLACE_ID), // Marketplace shared object
          tx.object(pokemonId),
          tx.pure.u64(priceInMist),
        ],
      });

      console.log('📝 Transaction built, requesting signature...');

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async (result) => {
              console.log('✅ Pokémon listed successfully:', result);

              // Save listing to Firestore
              try {
                await createMarketplaceListing({
                  listingId: result.digest, // Use transaction digest as listing ID
                  nftId: pokemonId,
                  nftType: 'pokemon',
                  sellerAddress: account.address,
                  price: price,
                  nftMetadata: pokemonMetadata,
                });
              } catch (firestoreError) {
                console.error('Failed to save listing to Firestore:', firestoreError);
              }

              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to list Pokémon:', err);
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
      console.error('❌ Error preparing list transaction:', error);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    listPokemon,
    isLoading,
    error,
  };
}

/**
 * Hook to list an Egg NFT on the marketplace
 */
export function useListEgg() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const listEgg = async (
    eggId: string,
    price: number,
    eggMetadata: any
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      if (!account?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('🔧 Building list Egg transaction...');
      console.log('Egg ID:', eggId);
      console.log('Price:', price);

      const tx = new Transaction();

      // Convert price to MIST
      const priceInMist = Math.floor(price * 1_000_000_000);

      // Call the list_egg function from the marketplace contract
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::list_egg`,
        arguments: [
          tx.object(MARKETPLACE_ID), // Marketplace shared object
          tx.object(eggId),
          tx.pure.u64(priceInMist),
        ],
      });

      console.log('📝 Transaction built, requesting signature...');

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async (result) => {
              console.log('✅ Egg listed successfully:', result);

              // Save listing to Firestore
              try {
                await createMarketplaceListing({
                  listingId: result.digest,
                  nftId: eggId,
                  nftType: 'egg',
                  sellerAddress: account.address,
                  price: price,
                  nftMetadata: eggMetadata,
                });
              } catch (firestoreError) {
                console.error('Failed to save listing to Firestore:', firestoreError);
              }

              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to list Egg:', err);
              setError(err as Error);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error preparing list transaction:', error);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    listEgg,
    isLoading,
    error,
  };
}

/**
 * Hook to purchase a listed NFT
 */
export function useBuyNFT() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const buyNFT = async (
    listing: MarketplaceListing
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      if (!account?.address) {
        throw new Error('Wallet not connected');
      }

      console.log('🔧 Building buy NFT transaction...');
      console.log('Listing:', listing);
      console.log('NFT ID:', listing.nftId);
      console.log('Price:', listing.price);
      console.log('NFT Type:', listing.nftType);

      const tx = new Transaction();

      // Convert price to MIST (9 decimals for OCT token)
      const priceInMist = Math.floor(listing.price * 1_000_000_000);

      // Get user's OCT coins
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: RPC_URL });
      
      const octCoins = await client.getCoins({
        owner: account.address,
        coinType: '0x2::oct::OCT',
      });

      if (!octCoins.data || octCoins.data.length === 0) {
        throw new Error('You don\'t have any OCT tokens. Please get some OCT from the faucet first.');
      }

      // Calculate total balance
      const totalBalance = octCoins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        BigInt(0)
      );

      if (totalBalance < BigInt(priceInMist)) {
        const balanceInOct = Number(totalBalance) / 1_000_000_000;
        throw new Error(
          `Insufficient OCT. You have ${balanceInOct.toFixed(3)} OCT but need ${listing.price.toFixed(3)} OCT`
        );
      }

      // IMPORTANT: We need to use tx.gas to avoid using the same coin for both payment and gas
      // Split the payment amount from the gas coin
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);

      // Call the appropriate buy function based on NFT type
      const buyFunction = listing.nftType === 'pokemon' ? 'buy_pokemon' : 'buy_egg';
      
      console.log('💰 Payment details:');
      console.log('  - Price in MIST:', priceInMist);
      console.log('  - Total OCT balance:', Number(totalBalance) / 1_000_000_000);
      console.log('  - Buy function:', buyFunction);
      
      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::${buyFunction}`,
        typeArguments: ['0x2::oct::OCT'], // Specify OCT as the payment token type
        arguments: [
          tx.object(MARKETPLACE_ID), // Marketplace shared object
          tx.pure.id(listing.nftId),
          paymentCoin,
        ],
      });

      console.log('📝 Transaction built, requesting signature...');
      console.log('Transaction preview:', JSON.stringify(tx, null, 2));

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async (result) => {
              console.log('✅ NFT purchased successfully:', result);

              // Update listing status in Firestore
              try {
                await updateListingStatus(listing.listingId, 'sold', account.address);
              } catch (firestoreError) {
                console.error('Failed to update listing in Firestore:', firestoreError);
              }

              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to purchase NFT:', err);
              console.error('Error type:', typeof err);
              console.error('Error details:', JSON.stringify(err, null, 2));
              
              // Try to extract more error information
              if (err && typeof err === 'object') {
                const errorObj = err as any;
                if (errorObj.message) {
                  console.error('Error message:', errorObj.message);
                }
                if (errorObj.cause) {
                  console.error('Error cause:', errorObj.cause);
                }
                if (errorObj.digest) {
                  console.error('Transaction digest:', errorObj.digest);
                }
              }
              
              setError(err as Error);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error preparing buy transaction:', error);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    buyNFT,
    isLoading,
    error,
  };
}

/**
 * Hook to cancel a listing
 */
export function useCancelListing() {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cancelListing = async (
    listing: MarketplaceListing
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!PACKAGE_ID || PACKAGE_ID === '') {
        throw new Error('Package ID not configured. Please check your .env.local file.');
      }

      if (!account?.address) {
        throw new Error('Wallet not connected');
      }

      if (listing.sellerAddress !== account.address) {
        throw new Error('You can only cancel your own listings');
      }

      console.log('🔧 Building cancel listing transaction...');
      console.log('Listing:', listing);
      console.log('NFT Type:', listing.nftType);

      const tx = new Transaction();

      // Call the appropriate cancel function based on NFT type
      const cancelFunction = listing.nftType === 'pokemon' 
        ? 'cancel_listing_pokemon' 
        : 'cancel_listing_egg';

      tx.moveCall({
        target: `${PACKAGE_ID}::marketplace::${cancelFunction}`,
        arguments: [
          tx.object(MARKETPLACE_ID), // Marketplace shared object
          tx.pure.id(listing.nftId),
        ],
      });

      console.log('📝 Transaction built, requesting signature...');
      console.log('Cancel function:', cancelFunction);

      return new Promise((resolve, reject) => {
        signAndExecute(
          { transaction: tx },
          {
            onSuccess: async (result) => {
              console.log('✅ Listing cancelled successfully:', result);

              // Update listing status in Firestore
              try {
                await updateListingStatus(listing.listingId, 'cancelled');
              } catch (firestoreError) {
                console.error('Failed to update listing in Firestore:', firestoreError);
              }

              setIsLoading(false);
              resolve(result);
            },
            onError: (err) => {
              console.error('❌ Failed to cancel listing:', err);
              setError(err as Error);
              setIsLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (err) {
      const error = err as Error;
      console.error('❌ Error preparing cancel transaction:', error);
      setError(error);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    cancelListing,
    isLoading,
    error,
  };
}
