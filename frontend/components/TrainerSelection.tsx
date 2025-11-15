'use client';

import { useState, useEffect } from 'react';

interface TrainerSelectionProps {
  playerTeam: any[];
  onTrainerSelected: (trainer: any) => void;
  onBack: () => void;
}

// 训练师数据
const TRAINERS = [
  { id: 1, name: '新手训练师 小明', difficulty: 'easy', sprite: '🧒', minLevel: 1, maxLevel: 10 },
  { id: 2, name: '虫捕少年 阿强', difficulty: 'easy', sprite: '👦', minLevel: 5, maxLevel: 12 },
  { id: 3, name: '短裤小子 大雄', difficulty: 'easy', sprite: '🧑', minLevel: 8, maxLevel: 15 },
  { id: 4, name: '迷你裙 小美', difficulty: 'medium', sprite: '👧', minLevel: 12, maxLevel: 20 },
  { id: 5, name: '空手道王 阿龙', difficulty: 'medium', sprite: '🥋', minLevel: 15, maxLevel: 25 },
  { id: 6, name: '精英训练师 杰克', difficulty: 'medium', sprite: '🕴️', minLevel: 20, maxLevel: 30 },
  { id: 7, name: '道馆馆主 岩石', difficulty: 'hard', sprite: '💪', minLevel: 25, maxLevel: 35 },
  { id: 8, name: '四天王 冰霜', difficulty: 'hard', sprite: '❄️', minLevel: 30, maxLevel: 40 },
  { id: 9, name: '冠军 龙王', difficulty: 'expert', sprite: '👑', minLevel: 35, maxLevel: 50 },
];

// Pokemon 池
const POKEMON_POOL = [
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'] },
  { id: 4, name: 'Charmander', types: ['fire'] },
  { id: 7, name: 'Squirtle', types: ['water'] },
  { id: 25, name: 'Pikachu', types: ['electric'] },
  { id: 39, name: 'Jigglypuff', types: ['normal', 'fairy'] },
  { id: 133, name: 'Eevee', types: ['normal'] },
  { id: 147, name: 'Dratini', types: ['dragon'] },
  { id: 143, name: 'Snorlax', types: ['normal'] },
  { id: 6, name: 'Charizard', types: ['fire', 'flying'] },
  { id: 9, name: 'Blastoise', types: ['water'] },
  { id: 3, name: 'Venusaur', types: ['grass', 'poison'] },
  { id: 94, name: 'Gengar', types: ['ghost', 'poison'] },
];

function generateTrainerTeam(trainer: any, playerAvgLevel: number) {
  const teamSize = trainer.difficulty === 'easy' ? 1 : 
                   trainer.difficulty === 'medium' ? 2 : 3;
  
  const team = [];
  const usedPokemon = new Set();
  
  for (let i = 0; i < teamSize; i++) {
    let pokemon;
    do {
      pokemon = POKEMON_POOL[Math.floor(Math.random() * POKEMON_POOL.length)];
    } while (usedPokemon.has(pokemon.id));
    
    usedPokemon.add(pokemon.id);
    
    // 根据玩家等级和训练师难度调整等级
    const levelRange = trainer.maxLevel - trainer.minLevel;
    const baseLevel = trainer.minLevel + Math.floor(Math.random() * levelRange);
    const level = Math.max(1, Math.min(50, baseLevel + Math.floor((playerAvgLevel - 10) / 2)));
    
    const maxHp = 30 + level * 3;
    team.push({
      ...pokemon,
      level,
      maxHp,
      currentHp: maxHp,
      attack: 40 + level * 2,
      defense: 40 + level * 2,
      speed: 40 + level * 2,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
    });
  }
  
  return team;
}

export function TrainerSelection({ playerTeam, onTrainerSelected, onBack }: TrainerSelectionProps) {
  const [trainers, setTrainers] = useState<any[]>([]);
  
  useEffect(() => {
    // 计算玩家队伍平均等级
    const avgLevel = Math.floor(
      playerTeam.reduce((sum, p) => sum + p.level, 0) / playerTeam.length
    );
    
    // 为每个训练师生成队伍
    const trainersWithTeams = TRAINERS.map(trainer => ({
      ...trainer,
      team: generateTrainerTeam(trainer, avgLevel),
    }));
    
    setTrainers(trainersWithTeams);
  }, [playerTeam]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      case 'expert': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      case 'expert': return '专家';
      default: return '未知';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🎯 选择对手</h1>
        <p className="text-gray-300">选择一位训练师进行对战</p>
        <p className="text-blue-400 mt-2">你的队伍: {playerTeam.length} 只 Pokemon</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {trainers.map((trainer) => (
          <div
            key={trainer.id}
            onClick={() => onTrainerSelected(trainer)}
            className="bg-gray-800 rounded-lg p-6 cursor-pointer border-2 border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg"
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{trainer.sprite}</div>
              <h3 className="text-xl font-bold text-white">{trainer.name}</h3>
              <p className={`text-sm font-semibold ${getDifficultyColor(trainer.difficulty)}`}>
                难度: {getDifficultyLabel(trainer.difficulty)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm text-center mb-3">
                队伍: {trainer.team.length} 只 Pokemon
              </p>
              
              <div className="flex justify-center gap-2">
                {trainer.team.map((pokemon: any, index: number) => (
                  <div key={index} className="text-center">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-16 h-16 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <p className="text-xs text-gray-400">Lv.{pokemon.level}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              挑战！
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-lg"
        >
          返回选择队伍
        </button>
      </div>
    </div>
  );
}
