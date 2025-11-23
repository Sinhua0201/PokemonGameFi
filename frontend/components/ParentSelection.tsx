'use client';

import { useState, useEffect } from 'react';
import { PokemonData } from '@/lib/api';
import { pokemonApi } from '@/lib/api';

interface ParentSelectionProps {
  pokemonNFTs: any[];
  onParentsSelected: (parent1: any, parent2: any, parent1Data: PokemonData, parent2Data: PokemonData) => void;
  isLoading?: boolean;
}

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

export function ParentSelection({ pokemonNFTs, onParentsSelected, isLoading }: ParentSelectionProps) {
  const [selectedParent1, setSelectedParent1] = useState<any | null>(null);
  const [selectedParent2, setSelectedParent2] = useState<any | null>(null);
  const [pokemonData, setPokemonData] = useState<Map<number, PokemonData>>(new Map());
  const [loadingData, setLoadingData] = useState(false);

  // Load Pokémon data for all NFTs
  useEffect(() => {
    const loadPokemonData = async () => {
      if (pokemonNFTs.length === 0) return;
      
      setLoadingData(true);
      const dataMap = new Map<number, PokemonData>();
      
      try {
        for (const nft of pokemonNFTs) {
          const content = nft.data?.content?.fields || {};
          const speciesId = parseInt(content.species_id || '0');
          
          if (speciesId && !dataMap.has(speciesId)) {
            const data = await pokemonApi.getPokemon(speciesId);
            dataMap.set(speciesId, data);
          }
        }
        setPokemonData(dataMap);
      } catch (error) {
        console.error('Failed to load Pokémon data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadPokemonData();
  }, [pokemonNFTs]);

  const handleSelectPokemon = (nft: any) => {
    if (isLoading) return;

    if (!selectedParent1) {
      setSelectedParent1(nft);
    } else if (!selectedParent2 && nft.data?.objectId !== selectedParent1.data?.objectId) {
      setSelectedParent2(nft);
      
      // Get Pokémon data for both parents
      const parent1Content = selectedParent1.data?.content?.fields || {};
      const parent2Content = nft.data?.content?.fields || {};
      const parent1SpeciesId = parseInt(parent1Content.species_id || '0');
      const parent2SpeciesId = parseInt(parent2Content.species_id || '0');
      
      const parent1Data = pokemonData.get(parent1SpeciesId);
      const parent2Data = pokemonData.get(parent2SpeciesId);
      
      if (parent1Data && parent2Data) {
        onParentsSelected(selectedParent1, nft, parent1Data, parent2Data);
      }
    }
  };

  const handleReset = () => {
    setSelectedParent1(null);
    setSelectedParent2(null);
  };

  if (loadingData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-800 font-semibold">Loading Pokémon data...</p>
      </div>
    );
  }

  if (pokemonNFTs.length < 2) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-800 text-lg font-bold">
          You need at least 2 Pokémon to breed.
        </p>
        <p className="text-gray-600 text-sm mt-2 font-medium">
          Catch more Pokémon to start breeding!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Select Two Pokémon to Breed
        </h3>
        <p className="text-gray-700 font-medium">
          {!selectedParent1 && 'Choose the first parent'}
          {selectedParent1 && !selectedParent2 && 'Choose the second parent'}
          {selectedParent1 && selectedParent2 && 'Parents selected! Click Breed to continue.'}
        </p>
        {selectedParent1 && (
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold"
          >
            Reset Selection
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pokemonNFTs.map((nft) => {
          const content = nft.data?.content?.fields || {};
          const speciesId = parseInt(content.species_id || '0');
          const level = parseInt(content.level || '1');
          const data = pokemonData.get(speciesId);
          const isSelected = 
            nft.data?.objectId === selectedParent1?.data?.objectId ||
            nft.data?.objectId === selectedParent2?.data?.objectId;

          if (!data) return null;

          return (
            <div
              key={nft.data?.objectId}
              onClick={() => handleSelectPokemon(nft)}
              className={`
                relative rounded-lg border-2 p-4 transition-all cursor-pointer bg-white
                ${isSelected 
                  ? 'border-blue-500 ring-4 ring-blue-300 scale-105 shadow-xl' 
                  : 'border-gray-300 hover:border-blue-400 hover:scale-105 shadow-md'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {nft.data?.objectId === selectedParent1?.data?.objectId ? 'Parent 1' : 'Parent 2'}
                </div>
              )}

              <div className="flex justify-center mb-3">
                <img
                  src={data.sprite}
                  alt={data.name}
                  className="pixelated w-24 h-24 object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <h4 className="text-lg font-bold text-center text-gray-900 mb-1">
                {data.name}
              </h4>

              <p className="text-center text-sm text-gray-600 font-semibold mb-2">
                Level {level}
              </p>

              <div className="flex justify-center gap-1 flex-wrap">
                {data.types.map((type) => (
                  <span
                    key={type}
                    className={`
                      px-2 py-1 rounded-full text-xs font-semibold text-white uppercase
                      ${typeColors[type] || 'bg-gray-400'}
                    `}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
