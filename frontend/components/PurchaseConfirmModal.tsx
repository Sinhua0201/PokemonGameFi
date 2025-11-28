'use client';

import { useState, useEffect } from 'react';
import { MarketplaceListing, PokemonData } from '@/types/pokemon';
import { pokemonApi } from '@/lib/api';

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

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: MarketplaceListing | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function PurchaseConfirmModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
  isLoading = false,
}: PurchaseConfirmModalProps) {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && listing && listing.nftType === 'pokemon') {
      const fetchPokemonData = async () => {
        setLoadingData(true);
        try {
          const speciesId = parseInt(listing.nftMetadata.species || '0');
          if (speciesId > 0) {
            const data = await pokemonApi.getPokemon(speciesId);
            setPokemonData(data);
          }
        } catch (error) {
          console.error('Failed to fetch Pokémon data:', error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchPokemonData();
    }
  }, [isOpen, listing]);

  if (!isOpen || !listing) return null;

  const marketplaceFee = listing.price * 0.025;
  const totalCost = listing.price;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Confirm Purchase
        </h2>

        {/* NFT Preview */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-4">
                {listing.nftType === 'pokemon' && pokemonData ? (
                  <img
                    src={pokemonData.sprite}
                    alt={pokemonData.name}
                    className="pixelated w-32 h-32"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : listing.nftType === 'egg' ? (
                  <div className="text-8xl">🥚</div>
                ) : null}
              </div>

              {listing.nftType === 'pokemon' && pokemonData ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2 capitalize">
                    {pokemonData.name}
                  </h3>
                  <div className="flex justify-center gap-2 mb-2">
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
                    <p className="text-gray-600 text-sm text-center font-semibold">
                      Level {listing.nftMetadata.level}
                    </p>
                  )}
                  {listing.nftMetadata.stats && (
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="text-gray-600 text-center font-semibold">
                        HP: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.hp}</span>
                      </div>
                      <div className="text-gray-600 text-center font-semibold">
                        ATK: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.attack}</span>
                      </div>
                      <div className="text-gray-600 text-center font-semibold">
                        DEF: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.defense}</span>
                      </div>
                      <div className="text-gray-600 text-center font-semibold">
                        SPD: <span className="text-gray-900 font-bold">{listing.nftMetadata.stats.speed}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : listing.nftType === 'egg' ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
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
                </>
              ) : null}
            </>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 border-2 border-gray-200">
          <div className="flex justify-between text-gray-900 font-semibold">
            <span>Price</span>
            <span className="font-bold">{listing.price.toFixed(3)} OCT</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm font-medium">
            <span>Marketplace Fee (2.5%)</span>
            <span>{marketplaceFee.toFixed(3)} OCT</span>
          </div>
          <div className="border-t-2 border-gray-300 pt-2 flex justify-between text-gray-900 font-bold">
            <span>Total</span>
            <span>{totalCost.toFixed(3)} OCT</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-6 border-2 border-blue-300">
          <p className="text-blue-700 text-xs font-semibold">
            <span className="font-bold">Seller:</span>{' '}
            {listing.sellerAddress.slice(0, 8)}...{listing.sellerAddress.slice(-6)}
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 rounded-lg p-3 mb-6 border-2 border-yellow-400">
          <p className="text-yellow-800 text-xs font-semibold">
            ⚠️ This transaction cannot be reversed. Make sure you want to purchase this NFT.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Processing...
              </span>
            ) : (
              'Confirm Purchase'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
