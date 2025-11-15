'use client';

import { PokemonNFT } from '@/types/pokemon';
import { useEffect, useState } from 'react';
import { getPokemonData } from '@/lib/api';
import { PokemonData } from '@/types/pokemon';

interface PokemonDetailModalProps {
  pokemon: PokemonNFT;
  onClose: () => void;
}

export function PokemonDetailModal({ pokemon, onClose }: PokemonDetailModalProps) {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPokemonData();
  }, [pokemon.speciesId]);

  const loadPokemonData = async () => {
    try {
      setLoading(true);
      const data = await getPokemonData(pokemon.speciesId);
      setPokemonData(data);
    } catch (error) {
      console.error('Error loading Pokémon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const xpForNextLevel = Math.pow(pokemon.level + 1, 3);
  const xpProgress = (pokemon.experience / xpForNextLevel) * 100;

  // Type colors for visual styling
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

  // Sample moves (in a real implementation, these would come from the API or contract)
  const moves = [
    { name: 'Tackle', type: 'normal', power: 40 },
    { name: 'Quick Attack', type: 'normal', power: 40 },
    { name: 'Ember', type: 'fire', power: 40 },
    { name: 'Water Gun', type: 'water', power: 40 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{pokemon.name}</h2>
              <p className="text-blue-100 text-sm font-mono mt-1">
                #{pokemon.speciesId.toString().padStart(3, '0')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {pokemon.types.map((type: string) => (
              <span
                key={type}
                className={`px-3 py-1 ${typeColors[type.toLowerCase()] || 'bg-gray-400'} text-white rounded-full text-sm font-semibold capitalize`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Sprite */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : pokemonData?.sprite ? (
            <div className="flex justify-center mb-6">
              <img
                src={pokemonData.sprite}
                alt={pokemon.name}
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center text-6xl">
                🎮
              </div>
            </div>
          )}

          {/* Level and XP */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-gray-700">Level {pokemon.level}</span>
              <span className="text-sm text-gray-600">
                {pokemon.experience} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, xpProgress)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {Math.max(0, xpForNextLevel - pokemon.experience)} XP to next level
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">HP</span>
                  <span className="text-sm font-bold text-red-600">{pokemon.stats.hp}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (pokemon.stats.hp / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Attack</span>
                  <span className="text-sm font-bold text-orange-600">{pokemon.stats.attack}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (pokemon.stats.attack / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Defense</span>
                  <span className="text-sm font-bold text-blue-600">{pokemon.stats.defense}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (pokemon.stats.defense / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Speed</span>
                  <span className="text-sm font-bold text-green-600">{pokemon.stats.speed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (pokemon.stats.speed / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Moves */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Moves</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moves.map((move, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{move.name}</span>
                    <span className="text-sm text-gray-600">PWR: {move.power}</span>
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 ${
                      typeColors[move.type] || 'bg-gray-400'
                    } text-white rounded text-xs font-medium capitalize`}
                  >
                    {move.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* NFT Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">NFT Information</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Token ID:</span>
                <span className="font-mono">{pokemon.id.slice(0, 8)}...{pokemon.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="font-mono">{pokemon.owner.slice(0, 8)}...{pokemon.owner.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Minted:</span>
                <span>{new Date(pokemon.mintTimestamp * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
