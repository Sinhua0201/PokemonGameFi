'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/config/constants';

/**
 * Hook to fetch player's Pokémon NFTs from blockchain
 */
export function usePlayerPokemonNFT() {
  const account = useCurrentAccount();
  const isPackageIdSet = !!PACKAGE_ID && PACKAGE_ID !== '';

  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address!,
      filter: {
        StructType: `${PACKAGE_ID}::pokemon::Pokemon`,
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

  // Parse Pokemon data from blockchain response
  const pokemon = (data?.data || []).map((obj: any) => {
    const content = obj.data?.content?.fields || {};
    const stats = content.stats?.fields || {};
    
    // Decode name from bytes
    let name = 'Unknown';
    if (content.name && Array.isArray(content.name)) {
      try {
        name = new TextDecoder().decode(new Uint8Array(content.name));
      } catch (e) {
        console.error('Failed to decode name:', e);
      }
    }
    
    // Decode types from bytes
    let types: string[] = ['normal'];
    if (content.types && Array.isArray(content.types)) {
      try {
        types = content.types.map((typeBytes: number[]) => {
          return new TextDecoder().decode(new Uint8Array(typeBytes));
        });
      } catch (e) {
        console.error('Failed to decode types:', e);
      }
    }
    
    const speciesId = parseInt(content.species_id || '0');
    
    return {
      id: obj.data?.objectId || '',
      species_id: speciesId,
      speciesId: speciesId,
      name: name,
      level: parseInt(content.level || '1'),
      experience: parseInt(content.experience || '0'),
      maxHp: parseInt(stats.hp || '35'),
      currentHp: parseInt(stats.hp || '35'),
      attack: parseInt(stats.attack || '50'),
      defense: parseInt(stats.defense || '50'),
      speed: parseInt(stats.speed || '50'),
      stats: {
        hp: parseInt(stats.hp || '35'),
        attack: parseInt(stats.attack || '50'),
        defense: parseInt(stats.defense || '50'),
        speed: parseInt(stats.speed || '50'),
      },
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      owner: content.owner || account?.address || '',
      types: types,
      mintTimestamp: parseInt(content.mint_timestamp || '0'),
    };
  });

  return {
    pokemon,
    loading: isPackageIdSet ? isLoading : false,
    error: isPackageIdSet ? error : null,
    refetch,
    isPackageIdSet,
  };
}
