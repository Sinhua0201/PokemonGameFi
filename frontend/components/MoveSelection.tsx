'use client';

import { BattleMove } from '@/store/battleStore';

interface MoveSelectionProps {
  moves: BattleMove[];
  onSelectMove: (move: BattleMove) => void;
  disabled?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  fire: 'bg-orange-500 hover:bg-orange-600',
  water: 'bg-blue-500 hover:bg-blue-600',
  grass: 'bg-green-500 hover:bg-green-600',
  electric: 'bg-yellow-500 hover:bg-yellow-600',
  normal: 'bg-gray-500 hover:bg-gray-600',
  fighting: 'bg-red-700 hover:bg-red-800',
  flying: 'bg-indigo-400 hover:bg-indigo-500',
  poison: 'bg-purple-600 hover:bg-purple-700',
  ground: 'bg-yellow-700 hover:bg-yellow-800',
  rock: 'bg-yellow-800 hover:bg-yellow-900',
  bug: 'bg-lime-600 hover:bg-lime-700',
  ghost: 'bg-purple-800 hover:bg-purple-900',
  steel: 'bg-gray-400 hover:bg-gray-500',
  psychic: 'bg-pink-500 hover:bg-pink-600',
  ice: 'bg-cyan-400 hover:bg-cyan-500',
  dragon: 'bg-indigo-700 hover:bg-indigo-800',
  dark: 'bg-gray-800 hover:bg-gray-900',
  fairy: 'bg-pink-300 hover:bg-pink-400',
};

export function MoveSelection({ moves, onSelectMove, disabled = false }: MoveSelectionProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Choose Your Move</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {moves.map((move, index) => (
          <button
            key={index}
            onClick={() => onSelectMove(move)}
            disabled={disabled}
            className={`
              ${TYPE_COLORS[move.type.toLowerCase()] || TYPE_COLORS.normal}
              text-white font-bold py-3 px-4 rounded-lg
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 active:scale-95
              shadow-md
            `}
          >
            <div className="text-left">
              <div className="text-sm font-bold">{move.name}</div>
              <div className="text-xs opacity-90 mt-1">
                {move.type.toUpperCase()} • PWR: {move.power}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {disabled && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Processing turn...
        </div>
      )}
    </div>
  );
}
