'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface TeamSelectionProps {
  playerPokemon: any[];
  onTeamSelected: (team: any[]) => void;
  onBack: () => void;
}

export function TeamSelection({ playerPokemon, onTeamSelected, onBack }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<any[]>([]);

  const togglePokemon = (pokemon: any) => {
    if (selectedTeam.find(p => p.id === pokemon.id)) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== pokemon.id));
    } else {
      if (selectedTeam.length >= 3) {
        toast.warning('最多只能选择 3 只 Pokemon！');
        return;
      }
      setSelectedTeam([...selectedTeam, pokemon]);
    }
  };

  const handleConfirm = () => {
    if (selectedTeam.length === 0) {
      toast.error('请至少选择 1 只 Pokemon！');
      return;
    }
    onTeamSelected(selectedTeam);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">⚔️ 选择你的队伍</h1>
        <p className="text-gray-300">选择最多 3 只 Pokemon 参加训练师对战</p>
        <p className="text-yellow-400 mt-2">已选择: {selectedTeam.length}/3</p>
      </div>

      {playerPokemon.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-300 mb-4">你还没有 Pokemon！</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {playerPokemon.map((pokemon) => {
              const isSelected = selectedTeam.find(p => p.id === pokemon.id);
              return (
                <div
                  key={pokemon.id}
                  onClick={() => togglePokemon(pokemon)}
                  className={`
                    bg-gray-800 rounded-lg p-4 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-4 border-green-500 shadow-lg shadow-green-500/50' 
                      : 'border-2 border-gray-700 hover:border-blue-500'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="text-right mb-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
                        ✓ 已选择
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-24 h-24 mx-auto pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <h3 className="text-xl font-bold text-white mt-2">{pokemon.name}</h3>
                    <p className="text-gray-400">Lv. {pokemon.level}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>HP:</span>
                        <span className="font-bold text-red-400">{pokemon.maxHp || pokemon.stats?.hp}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>攻击:</span>
                        <span className="font-bold text-orange-400">{pokemon.attack || pokemon.stats?.attack}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>防御:</span>
                        <span className="font-bold text-blue-400">{pokemon.defense || pokemon.stats?.defense}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-lg"
            >
              返回
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedTeam.length === 0}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg"
            >
              确认队伍 ({selectedTeam.length}/3)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
