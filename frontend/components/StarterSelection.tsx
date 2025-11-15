'use client';

import { useState } from 'react';
import { PokemonData } from '@/lib/api';
import Image from 'next/image';

interface StarterSelectionProps {
  starters: PokemonData[];
  onSelect: (pokemon: PokemonData) => void;
  isLoading?: boolean;
}

export function StarterSelection({ starters, onSelect, isLoading }: StarterSelectionProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);

  const handleSelect = (pokemon: PokemonData) => {
    setSelectedPokemon(pokemon);
  };

  const handleConfirm = () => {
    if (selectedPokemon) {
      onSelect(selectedPokemon);
    }
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      fire: 'bg-orange-500',
      water: 'bg-blue-500',
      grass: 'bg-green-500',
      electric: 'bg-yellow-500',
      normal: 'bg-gray-400',
      psychic: 'bg-pink-500',
      fairy: 'bg-pink-300',
      flying: 'bg-indigo-400',
      poison: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Choose Your Starter Pokémon
        </h2>
        <p className="text-gray-300">
          Select one of these Pokémon to begin your adventure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {starters.map((pokemon) => (
          <div
            key={pokemon.id}
            onClick={() => handleSelect(pokemon)}
            className={`
              relative cursor-pointer rounded-lg p-6 transition-all duration-200
              ${
                selectedPokemon?.id === pokemon.id
                  ? 'bg-blue-600 ring-4 ring-blue-400 scale-105'
                  : 'bg-gray-800 hover:bg-gray-700 hover:scale-102'
              }
            `}
          >
            {/* Selection indicator */}
            {selectedPokemon?.id === pokemon.id && (
              <div className="absolute top-2 right-2 bg-blue-400 rounded-full p-1">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Pokémon Image */}
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32">
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  fill
                  className="object-contain pixelated"
                  unoptimized
                />
              </div>
            </div>

            {/* Pokémon Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2 capitalize">
                {pokemon.name}
              </h3>

              {/* Types */}
              <div className="flex justify-center gap-2 mb-3">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className={`
                      px-3 py-1 rounded-full text-xs font-semibold text-white uppercase
                      ${getTypeColor(type)}
                    `}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-900 bg-opacity-50 rounded p-2">
                  <div className="text-gray-400">HP</div>
                  <div className="text-white font-bold">{pokemon.stats.hp}</div>
                </div>
                <div className="bg-gray-900 bg-opacity-50 rounded p-2">
                  <div className="text-gray-400">ATK</div>
                  <div className="text-white font-bold">{pokemon.stats.attack}</div>
                </div>
                <div className="bg-gray-900 bg-opacity-50 rounded p-2">
                  <div className="text-gray-400">DEF</div>
                  <div className="text-white font-bold">{pokemon.stats.defense}</div>
                </div>
                <div className="bg-gray-900 bg-opacity-50 rounded p-2">
                  <div className="text-gray-400">SPD</div>
                  <div className="text-white font-bold">{pokemon.stats.speed}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center">
        <button
          onClick={handleConfirm}
          disabled={!selectedPokemon || isLoading}
          className={`
            px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200
            ${
              selectedPokemon && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Minting...
            </span>
          ) : (
            `Choose ${selectedPokemon ? selectedPokemon.name : 'a Pokémon'}`
          )}
        </button>
      </div>
    </div>
  );
}
