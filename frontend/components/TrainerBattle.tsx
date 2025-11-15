'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TrainerBattleProps {
  playerTeam: any[];
  trainer: any;
  onBattleEnd: () => void;
}

// 进化数据
const EVOLUTIONS: Record<number, { evolvesTo: number; level: number; name: string }> = {
  1: { evolvesTo: 2, level: 16, name: 'Ivysaur' },
  2: { evolvesTo: 3, level: 32, name: 'Venusaur' },
  4: { evolvesTo: 5, level: 16, name: 'Charmeleon' },
  5: { evolvesTo: 6, level: 36, name: 'Charizard' },
  7: { evolvesTo: 8, level: 16, name: 'Wartortle' },
  8: { evolvesTo: 9, level: 36, name: 'Blastoise' },
  25: { evolvesTo: 26, level: 22, name: 'Raichu' },
  133: { evolvesTo: 134, level: 20, name: 'Vaporeon' }, // 简化，实际需要道具
};

export function TrainerBattle({ playerTeam: initialPlayerTeam, trainer, onBattleEnd }: TrainerBattleProps) {
  const account = useCurrentAccount();
  
  // 战斗状态
  const [playerTeam, setPlayerTeam] = useState(initialPlayerTeam.map(p => ({ ...p, currentHp: p.maxHp || p.stats?.hp })));
  const [trainerTeam, setTrainerTeam] = useState(trainer.team.map((p: any) => ({ ...p, currentHp: p.maxHp })));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentTrainerIndex, setCurrentTrainerIndex] = useState(0);
  const [phase, setPhase] = useState<'selecting' | 'animating' | 'switching' | 'victory' | 'defeat'>('selecting');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turn, setTurn] = useState(1);
  const [experienceGained, setExperienceGained] = useState<Record<string, number>>({});
  const [levelUps, setLevelUps] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);

  const currentPlayer = playerTeam[currentPlayerIndex];
  const currentTrainer = trainerTeam[currentTrainerIndex];

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  useEffect(() => {
    addLog(`${trainer.name} 向你发起了挑战！`);
    addLog(`派出了 ${currentPlayer.name}！`);
    addLog(`对手派出了 ${currentTrainer.name}！`);
  }, []);

  // 计算伤害
  const calculateDamage = (attacker: any, defender: any) => {
    const level = attacker.level;
    const attack = attacker.attack || attacker.stats?.attack || 50;
    const defense = defender.defense || defender.stats?.defense || 50;
    const power = 50;
    
    const baseDamage = Math.floor(
      ((2 * level / 5 + 2) * power * attack / defense / 50 + 2)
    );
    
    const randomFactor = 0.85 + Math.random() * 0.15;
    const damage = Math.floor(baseDamage * randomFactor);
    
    const isCritical = Math.random() < 0.0625;
    return {
      damage: isCritical ? damage * 2 : damage,
      isCritical
    };
  };

  // 玩家攻击
  const playerAttack = async () => {
    if (phase !== 'selecting') return;
    
    setPhase('animating');
    
    const { damage, isCritical } = calculateDamage(currentPlayer, currentTrainer);
    const newHp = Math.max(0, currentTrainer.currentHp - damage);
    
    addLog(`${currentPlayer.name} 发动攻击！`);
    if (isCritical) addLog('会心一击！');
    addLog(`造成了 ${damage} 点伤害！`);
    
    // 更新 HP
    const newTrainerTeam = [...trainerTeam];
    newTrainerTeam[currentTrainerIndex].currentHp = newHp;
    setTrainerTeam(newTrainerTeam);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (newHp === 0) {
      addLog(`对手的 ${currentTrainer.name} 失去战斗能力！`);
      await handleTrainerPokemonFainted();
    } else {
      await trainerAttack();
    }
  };

  // 训练师攻击
  const trainerAttack = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { damage, isCritical } = calculateDamage(currentTrainer, currentPlayer);
    const newHp = Math.max(0, currentPlayer.currentHp - damage);
    
    addLog(`对手的 ${currentTrainer.name} 发动攻击！`);
    if (isCritical) addLog('会心一击！');
    addLog(`造成了 ${damage} 点伤害！`);
    
    // 更新 HP
    const newPlayerTeam = [...playerTeam];
    newPlayerTeam[currentPlayerIndex].currentHp = newHp;
    setPlayerTeam(newPlayerTeam);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (newHp === 0) {
      addLog(`${currentPlayer.name} 失去战斗能力！`);
      await handlePlayerPokemonFainted();
    } else {
      setTurn(prev => prev + 1);
      setPhase('selecting');
    }
  };

  // 处理玩家 Pokemon 失去战斗能力
  const handlePlayerPokemonFainted = async () => {
    const nextAlive = playerTeam.findIndex((p, i) => i > currentPlayerIndex && p.currentHp > 0);
    
    if (nextAlive === -1) {
      // 玩家失败
      setPhase('defeat');
      addLog('你的所有 Pokemon 都失去了战斗能力...');
      addLog('战斗失败！');
      await saveBattleResult('defeat');
    } else {
      setPhase('switching');
      addLog('请选择下一只 Pokemon！');
    }
  };

  // 处理训练师 Pokemon 失去战斗能力
  const handleTrainerPokemonFainted = async () => {
    // 奖励经验值
    const expGained = Math.floor(currentTrainer.level * 50 * 1.5);
    setExperienceGained(prev => ({
      ...prev,
      [currentPlayer.id]: (prev[currentPlayer.id] || 0) + expGained
    }));
    addLog(`${currentPlayer.name} 获得了 ${expGained} 经验值！`);
    
    // 检查升级
    const newLevel = await checkLevelUp(currentPlayer, expGained);
    
    const nextAlive = trainerTeam.findIndex((p: any, i: number) => i > currentTrainerIndex && p.currentHp > 0);
    
    if (nextAlive === -1) {
      // 玩家胜利
      setPhase('victory');
      addLog(`你击败了 ${trainer.name}！`);
      await saveBattleResult('victory');
    } else {
      setCurrentTrainerIndex(nextAlive);
      addLog(`对手派出了 ${trainerTeam[nextAlive].name}！`);
      setTurn(prev => prev + 1);
      setPhase('selecting');
    }
  };

  // 检查升级和进化
  const checkLevelUp = async (pokemon: any, expGained: number) => {
    const currentExp = pokemon.experience || 0;
    const newExp = currentExp + expGained;
    const expNeeded = Math.pow(pokemon.level + 1, 3);
    
    if (newExp >= expNeeded) {
      const newLevel = pokemon.level + 1;
      addLog(`${pokemon.name} 升级了！现在是 Lv.${newLevel}！`);
      
      // 更新队伍中的等级
      const newPlayerTeam = [...playerTeam];
      const index = newPlayerTeam.findIndex(p => p.id === pokemon.id);
      if (index !== -1) {
        newPlayerTeam[index].level = newLevel;
        newPlayerTeam[index].experience = newExp;
        // 提升属性
        newPlayerTeam[index].maxHp = Math.floor(newPlayerTeam[index].maxHp * 1.1);
        newPlayerTeam[index].attack = Math.floor(newPlayerTeam[index].attack * 1.1);
        newPlayerTeam[index].defense = Math.floor(newPlayerTeam[index].defense * 1.1);
        newPlayerTeam[index].speed = Math.floor(newPlayerTeam[index].speed * 1.1);
        setPlayerTeam(newPlayerTeam);
      }
      
      setLevelUps(prev => [...prev, { pokemon: pokemon.name, oldLevel: pokemon.level, newLevel }]);
      
      // 检查进化
      const evolution = EVOLUTIONS[pokemon.species_id || pokemon.speciesId];
      if (evolution && newLevel >= evolution.level) {
        addLog(`什么？${pokemon.name} 开始进化了！`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        addLog(`${pokemon.name} 进化成了 ${evolution.name}！`);
        
        setEvolutions(prev => [...prev, {
          from: pokemon.name,
          to: evolution.name,
          pokemonId: pokemon.id
        }]);
        
        // 更新 Pokemon 名称和 species_id
        if (index !== -1) {
          newPlayerTeam[index].name = evolution.name;
          newPlayerTeam[index].species_id = evolution.evolvesTo;
          newPlayerTeam[index].speciesId = evolution.evolvesTo;
          newPlayerTeam[index].sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.evolvesTo}.png`;
          setPlayerTeam(newPlayerTeam);
        }
      }
      
      return newLevel;
    }
    
    return pokemon.level;
  };

  // 切换 Pokemon
  const switchPokemon = (index: number) => {
    if (playerTeam[index].currentHp <= 0) {
      toast.error('这只 Pokemon 已经失去战斗能力！');
      return;
    }
    
    setCurrentPlayerIndex(index);
    addLog(`派出了 ${playerTeam[index].name}！`);
    setPhase('selecting');
  };

  // 保存战斗结果
  const saveBattleResult = async (result: 'victory' | 'defeat') => {
    if (!account?.address) return;
    
    try {
      // 保存战斗历史
      await setDoc(doc(db, 'battleHistory', `${account.address}_${Date.now()}`), {
        playerId: account.address,
        opponentType: 'trainer',
        opponentName: trainer.name,
        opponentDifficulty: trainer.difficulty,
        playerTeam: playerTeam.map(p => ({
          name: p.name,
          level: p.level,
          species_id: p.species_id || p.speciesId
        })),
        trainerTeam: trainerTeam.map((p: any) => ({
          name: p.name,
          level: p.level,
          species_id: p.id
        })),
        winner: result === 'victory' ? 'player' : 'trainer',
        experienceGained,
        levelUps,
        evolutions,
        battleLog,
        createdAt: serverTimestamp(),
      });
      
      if (result === 'victory') {
        // 更新玩家统计
        await updateDoc(doc(db, 'players', account.address), {
          'stats.totalBattles': increment(1),
          'stats.wins': increment(1),
          lastActive: serverTimestamp(),
        });
        
        // 更新每只 Pokemon 的数据
        for (const pokemon of playerTeam) {
          const expGained = experienceGained[pokemon.id] || 0;
          if (expGained > 0) {
            const pokemonRef = doc(db, 'pokemon', pokemon.id);
            await updateDoc(pokemonRef, {
              experience: increment(expGained),
              level: pokemon.level,
              stats: {
                hp: pokemon.maxHp,
                attack: pokemon.attack,
                defense: pokemon.defense,
                speed: pokemon.speed,
              },
            });
          }
        }
        
        // 处理进化
        for (const evo of evolutions) {
          const pokemonRef = doc(db, 'pokemon', evo.pokemonId);
          const evolvedPokemon = playerTeam.find(p => p.id === evo.pokemonId);
          if (evolvedPokemon) {
            await updateDoc(pokemonRef, {
              name: evo.to,
              species_id: evolvedPokemon.species_id,
              speciesId: evolvedPokemon.speciesId,
              sprite: evolvedPokemon.sprite,
            });
          }
        }
      } else {
        // 失败也更新统计
        await updateDoc(doc(db, 'players', account.address), {
          'stats.totalBattles': increment(1),
          lastActive: serverTimestamp(),
        });
      }
      
      toast.success('战斗数据已保存！');
    } catch (error) {
      console.error('保存战斗结果失败:', error);
      toast.error('保存战斗数据失败');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          ⚔️ VS {trainer.name}
        </h1>
        <p className="text-gray-400">回合 {turn}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：战斗场景 */}
        <div className="lg:col-span-2">
          {/* 训练师 Pokemon */}
          <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-t-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{currentTrainer.name}</h3>
                <p className="text-gray-300">Lv. {currentTrainer.level}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300 mb-1">
                  HP: {currentTrainer.currentHp}/{currentTrainer.maxHp}
                </div>
                <div className="w-48 bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${(currentTrainer.currentHp / currentTrainer.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={currentTrainer.sprite}
                alt={currentTrainer.name}
                className="w-48 h-48 pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* 玩家 Pokemon */}
          <div className="bg-gradient-to-b from-green-900 to-green-800 rounded-b-lg p-6">
            <div className="flex justify-center mb-4">
              <img
                src={currentPlayer.sprite}
                alt={currentPlayer.name}
                className="w-48 h-48 pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{currentPlayer.name}</h3>
                <p className="text-gray-300">Lv. {currentPlayer.level}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-300 mb-1">
                  HP: {currentPlayer.currentHp}/{currentPlayer.maxHp || currentPlayer.stats?.hp}
                </div>
                <div className="w-48 bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ 
                      width: `${(currentPlayer.currentHp / (currentPlayer.maxHp || currentPlayer.stats?.hp)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 操作区 */}
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            {phase === 'selecting' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={playerAttack}
                  className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors"
                >
                  ⚔️ 攻击
                </button>
                <button
                  onClick={() => setPhase('switching')}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
                >
                  🔄 切换
                </button>
              </div>
            )}

            {phase === 'animating' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                <p className="text-white">战斗中...</p>
              </div>
            )}

            {phase === 'switching' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">选择 Pokemon</h3>
                <div className="grid grid-cols-3 gap-4">
                  {playerTeam.map((pokemon, index) => (
                    <button
                      key={pokemon.id}
                      onClick={() => switchPokemon(index)}
                      disabled={index === currentPlayerIndex || pokemon.currentHp <= 0}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${index === currentPlayerIndex 
                          ? 'border-green-500 bg-green-900/50' 
                          : pokemon.currentHp <= 0
                          ? 'border-gray-600 bg-gray-900/50 opacity-50 cursor-not-allowed'
                          : 'border-gray-600 hover:border-blue-500 bg-gray-900/50'
                        }
                      `}
                    >
                      <img
                        src={pokemon.sprite}
                        alt={pokemon.name}
                        className="w-16 h-16 mx-auto pixelated"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <p className="text-white text-sm mt-2">{pokemon.name}</p>
                      <p className="text-gray-400 text-xs">Lv.{pokemon.level}</p>
                      <p className="text-xs text-gray-300">
                        HP: {pokemon.currentHp}/{pokemon.maxHp || pokemon.stats?.hp}
                      </p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPhase('selecting')}
                  className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  取消
                </button>
              </div>
            )}

            {(phase === 'victory' || phase === 'defeat') && (
              <div className="text-center py-8">
                <h2 className="text-4xl font-bold mb-4">
                  {phase === 'victory' ? '🎉 胜利！' : '😔 失败'}
                </h2>
                <p className="text-xl text-white mb-6">
                  {phase === 'victory' 
                    ? `你击败了 ${trainer.name}！` 
                    : '你的所有 Pokemon 都失去了战斗能力...'
                  }
                </p>

                {phase === 'victory' && (
                  <div className="bg-gray-900 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-bold text-white mb-4">战斗奖励</h3>
                    <div className="space-y-3 text-left">
                      {Object.entries(experienceGained).map(([pokemonId, exp]: [string, number]) => {
                        const pokemon = playerTeam.find((p: any) => p.id === pokemonId);
                        return (
                          <div key={pokemonId} className="flex justify-between items-center">
                            <span className="text-gray-300">{pokemon?.name}</span>
                            <span className="text-blue-400 font-bold">+{exp} EXP</span>
                          </div>
                        );
                      })}
                      
                      {levelUps.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h4 className="text-lg font-bold text-yellow-400 mb-2">升级！</h4>
                          {levelUps.map((lu, i) => (
                            <div key={i} className="text-gray-300">
                              {lu.pokemon}: Lv.{lu.oldLevel} → Lv.{lu.newLevel}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {evolutions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h4 className="text-lg font-bold text-purple-400 mb-2">进化！</h4>
                          {evolutions.map((evo, i) => (
                            <div key={i} className="text-gray-300">
                              {evo.from} → {evo.to}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={onBattleEnd}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg"
                >
                  返回
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：战斗日志和队伍状态 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 队伍状态 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-4">你的队伍</h3>
            <div className="space-y-2">
              {playerTeam.map((pokemon, index) => (
                <div
                  key={pokemon.id}
                  className={`
                    p-3 rounded-lg border-2
                    ${index === currentPlayerIndex 
                      ? 'border-green-500 bg-green-900/30' 
                      : 'border-gray-700 bg-gray-900/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-12 h-12 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{pokemon.name}</p>
                      <p className="text-gray-400 text-sm">Lv.{pokemon.level}</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            pokemon.currentHp > (pokemon.maxHp || pokemon.stats?.hp) * 0.5
                              ? 'bg-green-500'
                              : pokemon.currentHp > 0
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${(pokemon.currentHp / (pokemon.maxHp || pokemon.stats?.hp)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-white mb-4 mt-6">对手队伍</h3>
            <div className="space-y-2">
              {trainerTeam.map((pokemon: any, index: number) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg border-2
                    ${index === currentTrainerIndex 
                      ? 'border-red-500 bg-red-900/30' 
                      : 'border-gray-700 bg-gray-900/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-12 h-12 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">{pokemon.name}</p>
                      <p className="text-gray-400 text-sm">Lv.{pokemon.level}</p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            pokemon.currentHp > pokemon.maxHp * 0.5
                              ? 'bg-green-500'
                              : pokemon.currentHp > 0
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${(pokemon.currentHp / pokemon.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 战斗日志 */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-4">战斗日志</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {battleLog.map((log, index) => (
                <div key={index} className="text-gray-300 text-sm border-b border-gray-700 pb-2">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
