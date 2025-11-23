'use client';

import { useState, useEffect } from 'react';
import { MarketplaceListing, PokemonData } from '@/types/pokemon';
import { pokemonApi } from '@/lib/api';
import { toast } from 'sonner';
import { useCurrentAccount } from '@mysten/dapp-kit';

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-400',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

interface MarketplaceGridProps {
  listings: MarketplaceListing[];
  onBuy: (listing: MarketplaceListing) => void;
  onCancel: (listing: MarketplaceListing) => void;
  isLoading?: boolean;
}

export function MarketplaceGrid({ 
  listings, 
  onBuy, 
  onCancel,
  isLoading = false 
}: MarketplaceGridProps) {
  const account = useCurrentAccount();
  const [pokemonDataCache, setPokemonDataCache] = useState<Record<number, PokemonData>>({});

  // Fetch Pokémon data for listings
  useEffect(() => {
    const fetchPokemonData = async () => {
      const speciesIds = new Set<number>();
      
      listings.forEach(listing => {
        if (listing.nftType === 'pokemon' && listing.nftMetadata.species) {
          const speciesId = parseInt(listing.nftMetadata.species);
          if (!isNaN(speciesId)) {
            speciesIds.add(speciesId);
          }
        }
        if (listing.nftType === 'egg') {
          if (listing.nftMetadata.parentSpecies) {
            listing.nftMetadata.parentSpecies.forEach((id: string) => {
              const speciesId = parseInt(id);
              if (!isNaN(speciesId)) {
                speciesIds.add(speciesId);
              }
            });
          }
        }
      });

      const cache: Record<number, PokemonData> = { ...pokemonDataCache };
      
      for (const id of speciesIds) {
        if (!cache[id]) {
          try {
            const data = await pokemonApi.getPokemon(id);
            cache[id] = data;
          } catch (error) {
            console.error(`Failed to fetch Pokémon ${id}:`, error);
          }
        }
      }

      setPokemonDataCache(cache);
    };

    if (listings.length > 0) {
      fetchPokemonData();
    }
  }, [listings]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-lg p-6 animate-pulse border-2 border-gray-200 shadow-md">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No listings available</h3>
        <p className="text-gray-700 font-medium">Check back later or list your own NFTs!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map(listing => {
        const isOwnListing = account?.address === listing.sellerAddress;
        const pokemonData = listing.nftMetadata.species 
          ? pokemonDataCache[parseInt(listing.nftMetadata.species)]
          : null;

        return (
          <div 
            key={listing.id}
            className="bg-white rounded-lg p-6 border-2 border-gray-300 hover:border-purple-500 transition-all shadow-md hover:shadow-xl"
          >
            {/* NFT Image */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center h-48 border border-gray-200">
              {listing.nftType === 'pokemon' && pokemonData ? (
                <img
                  src={pokemonData.sprite}
                  alt={pokemonData.name}
                  className="pixelated w-32 h-32"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : listing.nftType === 'egg' ? (
                <div className="text-8xl">🥚</div>
              ) : (
                <div className="text-gray-600 font-semibold">Loading...</div>
              )}
            </div>

            {/* NFT Details */}
            <div className="mb-4">
              {listing.nftType === 'pokemon' && pokemonData ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                    {pokemonData.name}
                  </h3>
                  <div className="flex gap-2 mb-2 justify-center">
                    {pokemonData.types.map(type => (
                      <span
                        key={type}
                        className={`px-3 py-1 text-white rounded-full text-xs uppercase font-bold shadow-sm ${typeColors[type.toLowerCase()] || 'bg-gray-400'}`}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  {listing.nftMetadata.level && (
                    <p className="text-gray-600 text-sm font-semibold">
                      Level {listing.nftMetadata.level}
                    </p>
                  )}
                  {listing.nftMetadata.stats && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="text-gray-600 font-semibold">
                        HP: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.hp}</span>
                      </div>
                      <div className="text-gray-600 font-semibold">
                        ATK: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.attack}</span>
                      </div>
                      <div className="text-gray-600 font-semibold">
                        DEF: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.defense}</span>
                      </div>
                      <div className="text-gray-600 font-semibold">
                        SPD: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.speed}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : listing.nftType === 'egg' ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Pokémon Egg
                  </h3>
                  {listing.nftMetadata.incubationProgress !== undefined && (
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-700 font-semibold mb-1">
                        <span>Incubation</span>
                        <span>{listing.nftMetadata.incubationProgress}/1000</span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-2 border border-gray-400">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(listing.nftMetadata.incubationProgress / 1000) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {listing.nftMetadata.parentSpecies && (
                    <p className="text-gray-600 text-sm font-semibold">
                      Parents: {listing.nftMetadata.parentSpecies.map((id: string) => {
                        const parent = pokemonDataCache[parseInt(id)];
                        return parent ? parent.name : `#${id}`;
                      }).join(' + ')}
                    </p>
                  )}
                </>
              ) : null}
            </div>

            {/* Price and Actions */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {listing.price} <span className="text-lg text-gray-600">SUI</span>
                  </p>
                </div>
                {isOwnListing && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded font-bold">
                    Your Listing
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-600 font-semibold mb-3">
                Seller: {listing.sellerAddress.slice(0, 6)}...{listing.sellerAddress.slice(-4)}
              </div>

              {isOwnListing ? (
                <button
                  onClick={() => onCancel(listing)}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel Listing
                </button>
              ) : (
                <button
                  onClick={() => onBuy(listing)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
