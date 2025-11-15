'use client';

import { PokemonData } from '@/lib/api';
import Image from 'next/image';

interface PokemonCardProps {
  pokemon: PokemonData;
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-50',
  uncommon: 'border-green-400 bg-green-50',
  rare: 'border-blue-400 bg-blue-50',
  legendary: 'border-purple-400 bg-purple-50',
};

const rarityGlow = {
  common: '',
  uncommon: 'shadow-lg shadow-green-500/20',
  rare: 'shadow-lg shadow-blue-500/30',
  legendary: 'shadow-xl shadow-purple-500/50 animate-pulse',
};

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

export function PokemonCard({ pokemon, onClick, selected, showStats = true }: PokemonCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg border-2 p-4 transition-all cursor-pointer
        ${rarityColors[pokemon.rarity]}
        ${rarityGlow[pokemon.rarity]}
        ${selected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Rarity Badge */}
      <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold uppercase bg-white/80 backdrop-blur-sm">
        {pokemon.rarity}
      </div>

      {/* Pokemon Image - Animated GIF */}
      <div className="flex justify-center mb-3">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="pixelated max-w-full max-h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Pokemon Name */}
      <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
        {pokemon.name}
      </h3>

      {/* Pokemon ID */}
      <p className="text-center text-sm text-gray-600 mb-2">
        #{pokemon.id.toString().padStart(3, '0')}
      </p>

      {/* Types */}
      <div className="flex justify-center gap-2 mb-3">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className={`
              px-3 py-1 rounded-full text-xs font-semibold text-white uppercase
              ${typeColors[type] || 'bg-gray-400'}
            `}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Stats */}
      {showStats && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">HP:</span>
            <span className="font-semibold text-red-600">{pokemon.stats.hp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Attack:</span>
            <span className="font-semibold text-orange-600">{pokemon.stats.attack}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Defense:</span>
            <span className="font-semibold text-blue-600">{pokemon.stats.defense}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Speed:</span>
            <span className="font-semibold text-yellow-600">{pokemon.stats.speed}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Pokemon Sprite Component - For displaying just the animated sprite
 */
interface PokemonSpriteProps {
  sprite: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
};

export function PokemonSprite({ sprite, name, size = 'md', animate = true }: PokemonSpriteProps) {
  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <img
        src={sprite}
        alt={name}
        className={`
          pixelated max-w-full max-h-full object-contain
          ${animate ? 'animate-bounce-slow' : ''}
        `}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
