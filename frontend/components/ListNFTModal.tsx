'use client';

import { useState, useEffect } from 'react';
import { PokemonData } from '@/types/pokemon';
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

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: any;
  nftType: 'pokemon' | 'egg';
  onList: (nftId: string, price: number, metadata: any) => Promise<void>;
  isLoading?: boolean;
}

export function ListNFTModal({
  isOpen,
  onClose,
  nft,
  nftType,
  onList,
  isLoading = false,
}: ListNFTModalProps) {
  const [price, setPrice] = useState('');
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && nft && nftType === 'pokemon') {
      const fetchPokemonData = async () => {
        setLoadingData(true);
        try {
          const content = nft.data?.content?.fields || {};
          const speciesId = parseInt(content.species_id || '0');
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
  }, [isOpen, nft, nftType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return;
    }

    let metadata: any = {};
    
    if (nftType === 'pokemon') {
      const content = nft.data?.content?.fields || {};
      metadata = {
        species: content.species_id,
        level: parseInt(content.level || '1'),
        stats: {
          hp: parseInt(content.stats?.fields?.hp || '0'),
          attack: parseInt(content.stats?.fields?.attack || '0'),
          defense: parseInt(content.stats?.fields?.defense || '0'),
          speed: parseInt(content.stats?.fields?.speed || '0'),
        },
      };
    } else {
      // For eggs, use the already-parsed structure from usePlayerEggs
      metadata = {
        incubationProgress: nft.incubationSteps || 0,
        requiredSteps: nft.requiredSteps || 1000,
        parentSpecies: [
          nft.parent1Species || 0,
          nft.parent2Species || 0,
        ],
      };
    }

    // Extract NFT ID based on type
    const nftId = nftType === 'egg' ? nft.id : nft.data?.objectId;
    
    if (!nftId) {
      console.error('NFT ID not found:', nft);
      return;
    }
    
    await onList(nftId, priceNum, metadata);
    setPrice('');
    onClose();
  };

  const content = nft?.data?.content?.fields || {};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          List {nftType === 'pokemon' ? 'Pokémon' : 'Egg'} for Sale
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
                {nftType === 'pokemon' && pokemonData ? (
                  <img
                    src={pokemonData.sprite}
                    alt={pokemonData.name}
                    className="pixelated w-32 h-32"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : nftType === 'egg' ? (
                  <div className="text-8xl">🥚</div>
                ) : null}
              </div>

              {nftType === 'pokemon' && pokemonData ? (
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
                  <p className="text-gray-600 text-sm text-center font-semibold">
                    Level {content.level || '1'}
                  </p>
                </>
              ) : nftType === 'egg' ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Pokémon Egg
                  </h3>
                  <div className="text-sm text-gray-700 text-center font-semibold">
                    <p>Incubation: {nft.incubationSteps || 0}/{nft.requiredSteps || 1000}</p>
                    <p className="mt-1">
                      Progress: {Math.round(((nft.incubationSteps || 0) / (nft.requiredSteps || 1000)) * 100)}%
                    </p>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>

        {/* Price Input Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-900 font-bold mb-2">
              Price (POKE)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in POKE"
              className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none font-medium"
              required
              disabled={isLoading}
            />
            <p className="text-gray-600 text-xs mt-2 font-semibold">
              Marketplace fee: 2.5% • You'll receive: {price ? (parseFloat(price) * 0.975).toFixed(3) : '0.000'} OCT
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !price || parseFloat(price) <= 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Listing...
                </span>
              ) : (
                'List for Sale'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
