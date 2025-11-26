'use client';

import { PokemonNFT } from '@/types/pokemon';
import { useEffect, useState } from 'react';
import { getPokemonData } from '@/lib/api';
import { PokemonData } from '@/types/pokemon';
import { useEvolvePokemon } from '@/hooks/usePokemonNFT';
import { toast } from '@/lib/toast';
import { EvolutionAnimation } from './EvolutionAnimation';
import { getEvolutionData, inferEvolutionStage } from '@/lib/evolutionData';

interface PokemonDetailModalProps {
  pokemon: PokemonNFT;
  onClose: () => void;
  onEvolved?: () => void;
}

export function PokemonDetailModal({ pokemon, onClose, onEvolved }: PokemonDetailModalProps) {
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);
  const { evolvePokemon, isLoading: isEvolving } = useEvolvePokemon();
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [evolutionTarget, setEvolutionTarget] = useState<{ id: number; name: string } | null>(null);
  
  // Evolution logic - infer correct stage based on species ID
  const reportedStage = pokemon.evolutionStage || 0;
  const evolutionStage = inferEvolutionStage(pokemon.speciesId, reportedStage);
  const canEvolve = evolutionStage < 2;
  const requiredLevel = evolutionStage === 0 ? 12 : 20;
  const meetsLevelRequirement = pokemon.level >= requiredLevel;

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

  // Get evolution data from the complete evolution map
  const evolutionData = getEvolutionData(pokemon.speciesId, evolutionStage);
  
  // Check if Pokemon can actually evolve (has evolution data available)
  const hasEvolutionAvailable = evolutionData !== null;
  
  console.log('Evolution Debug:', {
    speciesId: pokemon.speciesId,
    evolutionStage,
    hasEvolutionAvailable,
    requiredLevel,
    currentLevel: pokemon.level,
    meetsLevelRequirement,
    evolutionData
  });

  const handleEvolve = async () => {
    if (!evolutionData) return;
    
    try {
      // Show animation first
      setEvolutionTarget(evolutionData);
      setShowEvolutionAnimation(true);
      
      // Execute evolution on blockchain
      await evolvePokemon(pokemon.id, evolutionData.id, evolutionData.name);
    } catch (error) {
      console.error('Evolution failed:', error);
      toast.error('Failed to evolve Pokemon');
      setShowEvolutionAnimation(false);
    }
  };

  const handleEvolutionComplete = async () => {
    setShowEvolutionAnimation(false);
    toast.success(`${pokemon.name} evolved into ${evolutionTarget?.name}!`);
    
    // Wait a bit for blockchain to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Trigger refresh and close
    onEvolved?.();
    onClose();
  };

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
    <>
      {/* Evolution Animation */}
      {showEvolutionAnimation && evolutionTarget && (
        <EvolutionAnimation
          oldSpeciesId={pokemon.speciesId}
          oldName={pokemon.name}
          newSpeciesId={evolutionTarget.id}
          newName={evolutionTarget.name}
          onComplete={handleEvolutionComplete}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-500 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-t-2xl border-b-4 border-purple-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{pokemon.name}</h2>
              <p className="text-gray-600 text-sm font-mono mt-1 font-bold">
                #{pokemon.speciesId.toString().padStart(3, '0')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 transition-colors bg-white rounded-full p-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            {pokemon.types.map((type: string) => (
              <span
                key={type}
                className={`px-3 py-1 ${typeColors[type.toLowerCase()] || 'bg-gray-400'} text-white rounded-full text-sm font-bold capitalize shadow-sm`}
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
          ) : pokemonData?.sprite ? (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <img
                  src={pokemonData.sprite}
                  alt={pokemon.name}
                  className="relative w-48 h-48 object-contain pixelated drop-shadow-2xl"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-6xl border-2 border-gray-300">
                🎮
              </div>
            </div>
          )}

          {/* Level and XP */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-5 mb-6 border-2 border-purple-300 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold text-gray-900">Level {pokemon.level}</span>
              </div>
              <span className="text-sm text-gray-700 font-bold bg-white px-3 py-1 rounded-full shadow-sm">
                {pokemon.experience} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-4 border-2 border-purple-300 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${Math.min(100, xpProgress)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs text-gray-700 font-bold mt-2 text-center bg-white/50 rounded-full py-1">
              {Math.max(0, xpForNextLevel - pokemon.experience)} XP to next level
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Stats
            </h3>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-lg">❤️</span> HP
                  </span>
                  <span className="text-sm font-bold text-red-600 bg-white px-2 py-1 rounded-full">{pokemon.stats.hp}</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-3 border border-red-300 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, (pokemon.stats.hp / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 border-2 border-orange-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-lg">⚔️</span> Attack
                  </span>
                  <span className="text-sm font-bold text-orange-600 bg-white px-2 py-1 rounded-full">{pokemon.stats.attack}</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3 border border-orange-300 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, (pokemon.stats.attack / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-lg">🛡️</span> Defense
                  </span>
                  <span className="text-sm font-bold text-blue-600 bg-white px-2 py-1 rounded-full">{pokemon.stats.defense}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3 border border-blue-300 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, (pokemon.stats.defense / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span className="text-lg">⚡</span> Speed
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-white px-2 py-1 rounded-full">{pokemon.stats.speed}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3 border border-green-300 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, (pokemon.stats.speed / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Moves */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span> Moves
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {moves.map((move, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 border-gray-300 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-base">{move.name}</span>
                    <span className="text-xs text-white font-bold bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded-full shadow-sm">
                      PWR {move.power}
                    </span>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 ${
                      typeColors[move.type] || 'bg-gray-400'
                    } text-white rounded-full text-xs font-bold capitalize shadow-sm`}
                  >
                    {move.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* NFT Info */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-300 shadow-md">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-xl">🔗</span> NFT Information
            </h3>
            <div className="space-y-2 text-sm text-gray-700 font-semibold">
              <div className="flex justify-between items-center bg-white/70 rounded-lg px-3 py-2">
                <span className="flex items-center gap-1">
                  <span className="text-base">🆔</span> Token ID:
                </span>
                <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">{pokemon.id.slice(0, 8)}...{pokemon.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/70 rounded-lg px-3 py-2">
                <span className="flex items-center gap-1">
                  <span className="text-base">👤</span> Owner:
                </span>
                <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">{pokemon.owner.slice(0, 8)}...{pokemon.owner.slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center bg-white/70 rounded-lg px-3 py-2">
                <span className="flex items-center gap-1">
                  <span className="text-base">📅</span> Minted:
                </span>
                <span className="bg-blue-100 px-2 py-1 rounded">{new Date(pokemon.mintTimestamp * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 rounded-b-2xl flex justify-between items-center border-t-4 border-purple-300">
          {/* Evolution Button */}
          <div className="flex items-center gap-3">
            {hasEvolutionAvailable ? (
              <>
                <button
                  onClick={handleEvolve}
                  disabled={!meetsLevelRequirement || isEvolving}
                  className={`px-6 py-3 rounded-lg font-bold transition-all shadow-md flex items-center gap-2 ${
                    meetsLevelRequirement && !isEvolving
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xl">✨</span>
                  {isEvolving ? 'Evolving...' : `Evolve to ${evolutionData!.name}`}
                </button>
                {!meetsLevelRequirement && (
                  <span className="text-sm text-gray-600 font-semibold bg-yellow-100 px-3 py-2 rounded-lg border border-yellow-300">
                    ⚠️ Requires Level {requiredLevel}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-600 font-semibold bg-blue-100 px-3 py-2 rounded-lg border border-blue-300">
                🌟 Fully Evolved
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
