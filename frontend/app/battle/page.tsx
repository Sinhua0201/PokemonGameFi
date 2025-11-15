'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { WalletGuard } from '@/components/WalletGuard';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';
import { useAddExperience } from '@/hooks/usePokemonNFT';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { toast } from 'sonner';
import { doc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import '../game-styles.css';

// Pokemon 池
const OPPONENT_POOL = [
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'] },
  { id: 4, name: 'Charmander', types: ['fire'] },
  { id: 7, name: 'Squirtle', types: ['water'] },
  { id: 25, name: 'Pikachu', types: ['electric'] },
  { id: 39, name: 'Jigglypuff', types: ['normal'] },
  { id: 133, name: 'Eevee', types: ['normal'] },
  { id: 147, name: 'Dratini', types: ['dragon'] },
  { id: 143, name: 'Snorlax', types: ['normal'] },
  { id: 6, name: 'Charizard', types: ['fire', 'flying'] },
  { id: 9, name: 'Blastoise', types: ['water'] },
  { id: 3, name: 'Venusaur', types: ['grass', 'poison'] },
  { id: 94, name: 'Gengar', types: ['ghost', 'poison'] },
];

// 进化数据 (一进化和二进化)
const EVOLUTIONS: Record<number, { evolvesTo: number; level: number; name: string }> = {
  // 第一代御三家
  1: { evolvesTo: 2, level: 16, name: 'Ivysaur' },      // 妙蛙种子 → 妙蛙草
  2: { evolvesTo: 3, level: 32, name: 'Venusaur' },     // 妙蛙草 → 妙蛙花
  4: { evolvesTo: 5, level: 16, name: 'Charmeleon' },   // 小火龙 → 火恐龙
  5: { evolvesTo: 6, level: 36, name: 'Charizard' },    // 火恐龙 → 喷火龙
  7: { evolvesTo: 8, level: 16, name: 'Wartortle' },    // 杰尼龟 → 卡咪龟
  8: { evolvesTo: 9, level: 36, name: 'Blastoise' },    // 卡咪龟 → 水箭龟

  // 常见Pokemon
  10: { evolvesTo: 11, level: 7, name: 'Metapod' },     // 绿毛虫 → 铁甲蛹
  11: { evolvesTo: 12, level: 10, name: 'Butterfree' }, // 铁甲蛹 → 巴大蝶
  16: { evolvesTo: 17, level: 18, name: 'Pidgeotto' },  // 波波 → 比比鸟
  17: { evolvesTo: 18, level: 36, name: 'Pidgeot' },    // 比比鸟 → 大比鸟
  19: { evolvesTo: 20, level: 20, name: 'Raticate' },   // 小拉达 → 拉达

  // 皮卡丘系列
  25: { evolvesTo: 26, level: 22, name: 'Raichu' },     // 皮卡丘 → 雷丘

  // 伊布系列
  133: { evolvesTo: 134, level: 20, name: 'Vaporeon' }, // 伊布 → 水伊布

  // 第二代御三家
  152: { evolvesTo: 153, level: 16, name: 'Bayleef' },  // 菊草叶 → 月桂叶
  153: { evolvesTo: 154, level: 32, name: 'Meganium' }, // 月桂叶 → 大竺葵
  155: { evolvesTo: 156, level: 14, name: 'Quilava' },  // 火球鼠 → 火岩鼠
  156: { evolvesTo: 157, level: 36, name: 'Typhlosion' }, // 火岩鼠 → 火爆兽
  158: { evolvesTo: 159, level: 18, name: 'Croconaw' }, // 小锯鳄 → 蓝鳄
  159: { evolvesTo: 160, level: 30, name: 'Feraligatr' }, // 蓝鳄 → 大力鳄

  // 第三代御三家
  252: { evolvesTo: 253, level: 16, name: 'Grovyle' },  // 木守宫 → 森林蜥蜴
  253: { evolvesTo: 254, level: 36, name: 'Sceptile' }, // 森林蜥蜴 → 蜥蜴王
  255: { evolvesTo: 256, level: 16, name: 'Combusken' }, // 火稚鸡 → 力壮鸡
  256: { evolvesTo: 257, level: 36, name: 'Blaziken' }, // 力壮鸡 → 火焰鸡
  258: { evolvesTo: 259, level: 16, name: 'Marshtomp' }, // 水跃鱼 → 沼跃鱼
  259: { evolvesTo: 260, level: 36, name: 'Swampert' }, // 沼跃鱼 → 巨沼怪

  // 准神系列
  147: { evolvesTo: 148, level: 30, name: 'Dragonair' }, // 迷你龙 → 哈克龙
  148: { evolvesTo: 149, level: 55, name: 'Dragonite' }, // 哈克龙 → 快龙
  246: { evolvesTo: 247, level: 30, name: 'Pupitar' },   // 幼基拉斯 → 沙基拉斯
  247: { evolvesTo: 248, level: 55, name: 'Tyranitar' }, // 沙基拉斯 → 班基拉斯
  371: { evolvesTo: 372, level: 30, name: 'Shelgon' },   // 宝贝龙 → 甲壳龙
  372: { evolvesTo: 373, level: 50, name: 'Salamence' }, // 甲壳龙 → 暴飞龙
};

export default function BattlePage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { pokemon: playerPokemonList, loading } = usePlayerPokemonNFT();
  const { addExperience } = useAddExperience();
  const { isPlaying, isMuted, togglePlay, toggleMute } = useBackgroundMusic('/music/Battle.mp3', {
    volume: 0.3,
    loop: true,
    autoPlay: true,
  });

  const [phase, setPhase] = useState<'select' | 'battle' | 'victory' | 'defeat'>('select');
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [playerHurt, setPlayerHurt] = useState(false);
  const [opponentHurt, setOpponentHurt] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number, damage: number, x: number, y: number }>>([]);
  const [experienceGained, setExperienceGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [evolved, setEvolved] = useState<any>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showEvolutionChoice, setShowEvolutionChoice] = useState(false);
  const [pendingEvolution, setPendingEvolution] = useState<any>(null);
  const battleLogRef = useRef<HTMLDivElement>(null);

  // 自动滚动战斗日志
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [battleLog]);

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  // 生成背景粒子
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push(
        <div
          key={i}
          className="particle"
          style={{
            width: Math.random() * 10 + 5 + 'px',
            height: Math.random() * 10 + 5 + 'px',
            left: Math.random() * 100 + '%',
            animationDelay: Math.random() * 20 + 's',
            animationDuration: (Math.random() * 10 + 15) + 's',
          }}
        />
      );
    }
    return particles;
  };

  // 生成对手
  const generateOpponent = (playerLevel: number) => {
    const opponentData = OPPONENT_POOL[Math.floor(Math.random() * OPPONENT_POOL.length)];
    const level = Math.max(1, playerLevel + Math.floor(Math.random() * 5) - 2);
    const maxHp = 30 + level * 3;

    return {
      ...opponentData,
      level,
      maxHp,
      currentHp: maxHp,
      attack: 40 + level * 2,
      defense: 40 + level * 2,
      speed: 40 + level * 2,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${opponentData.id}.png`,
    };
  };

  // 选择 Pokemon
  const handleSelectPokemon = (pokemon: any) => {
    const selectedWithHp = {
      ...pokemon,
      currentHp: pokemon.maxHp || pokemon.stats?.hp,
      maxHp: pokemon.maxHp || pokemon.stats?.hp,
      attack: pokemon.attack || pokemon.stats?.attack,
      defense: pokemon.defense || pokemon.stats?.defense,
      speed: pokemon.speed || pokemon.stats?.speed,
    };

    setSelectedPokemon(selectedWithHp);
    const generatedOpponent = generateOpponent(pokemon.level);
    setOpponent(generatedOpponent);
    setPhase('battle');
    setBattleLog([]);

    setTimeout(() => {
      addLog(`⚔️ 战斗开始！`);
      addLog(`派出了 ${pokemon.name}！`);
      addLog(`野生的 ${generatedOpponent.name} 出现了！`);
    }, 500);
  };

  // 显示伤害数字
  const showDamage = (damage: number, isPlayer: boolean) => {
    const id = Date.now();
    const x = isPlayer ? 30 : 70;
    const y = isPlayer ? 60 : 30;

    setDamageNumbers(prev => [...prev, { id, damage, x, y }]);

    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1000);
  };

  // 根据Pokemon类型获取技能
  const getMoves = (pokemon: any) => {
    const types = pokemon.types || ['normal'];
    const primaryType = types[0].toLowerCase();

    const movesByType: Record<string, any[]> = {
      fire: [
        { name: '火花', power: 40 },
        { name: '火焰轮', power: 60 },
        { name: '喷射火焰', power: 90 },
        { name: '大字爆炎', power: 110 },
      ],
      water: [
        { name: '水枪', power: 40 },
        { name: '泡沫光线', power: 65 },
        { name: '冲浪', power: 90 },
        { name: '水炮', power: 110 },
      ],
      grass: [
        { name: '藤鞭', power: 45 },
        { name: '飞叶快刀', power: 55 },
        { name: '能量球', power: 90 },
        { name: '日光束', power: 120 },
      ],
      electric: [
        { name: '电击', power: 40 },
        { name: '电光', power: 65 },
        { name: '十万伏特', power: 90 },
        { name: '打雷', power: 110 },
      ],
      normal: [
        { name: '撞击', power: 40 },
        { name: '抓', power: 40 },
        { name: '泰山压顶', power: 85 },
        { name: '破坏光线', power: 150 },
      ],
    };

    return movesByType[primaryType] || movesByType.normal;
  };

  // 计算伤害
  const calculateDamage = (attacker: any, defender: any, movePower: number = 50) => {
    const level = attacker.level;
    const attack = attacker.attack;
    const defense = defender.defense;
    const power = movePower;

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

  // 玩家使用技能攻击
  const playerAttackWithMove = async (move: { name: string; power: number }) => {
    if (isAttacking || !selectedPokemon || !opponent) return;

    setIsAttacking(true);
    setPlayerAttacking(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const { damage, isCritical } = calculateDamage(selectedPokemon, opponent, move.power);
    const newHp = Math.max(0, opponent.currentHp - damage);

    setOpponentHurt(true);
    showDamage(damage, false);

    addLog(`${selectedPokemon.name} 使用了 ${move.name}！`);
    if (isCritical) addLog('💥 会心一击！');
    addLog(`造成了 ${damage} 点伤害！`);

    await new Promise(resolve => setTimeout(resolve, 500));

    setOpponent({ ...opponent, currentHp: newHp });
    setPlayerAttacking(false);
    setOpponentHurt(false);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (newHp === 0) {
      await handleVictory();
    } else {
      await opponentAttack();
    }

    setIsAttacking(false);
  };

  // 对手攻击
  const opponentAttack = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));

    setOpponentAttacking(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const { damage, isCritical } = calculateDamage(opponent, selectedPokemon);
    const newHp = Math.max(0, selectedPokemon.currentHp - damage);

    setPlayerHurt(true);
    showDamage(damage, true);

    addLog(`野生的 ${opponent.name} 发动攻击！`);
    if (isCritical) addLog('💥 会心一击！');
    addLog(`造成了 ${damage} 点伤害！`);

    await new Promise(resolve => setTimeout(resolve, 500));

    setSelectedPokemon({ ...selectedPokemon, currentHp: newHp });
    setOpponentAttacking(false);
    setPlayerHurt(false);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (newHp === 0) {
      setPhase('defeat');
      addLog(`${selectedPokemon.name} 失去战斗能力！`);
      addLog('💔 战斗失败...');
      await saveBattleResult('defeat', 0);
    }
  };

  // 处理胜利
  const handleVictory = async () => {
    addLog(`野生的 ${opponent.name} 失去战斗能力！`);
    addLog('🎉 胜利！');

    const expGained = Math.floor(opponent.level * 50);
    setExperienceGained(expGained);
    addLog(`${selectedPokemon.name} 获得了 ${expGained} 经验值！`);

    await checkLevelUp(expGained);

    setPhase('victory');
    await saveBattleResult('victory', expGained);
  };

  // 检查升级和进化
  const checkLevelUp = async (expGained: number) => {
    if (!account?.address) return;

    const currentExp = selectedPokemon.experience || 0;
    const newExp = currentExp + expGained;
    const expNeeded = Math.pow(selectedPokemon.level + 1, 3);

    if (newExp >= expNeeded) {
      const oldLevel = selectedPokemon.level;
      const newLvl = oldLevel + 1;
      setNewLevel(newLvl);
      setLeveledUp(true);

      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog(`✨ ${selectedPokemon.name} 升级了！`);
      addLog(`📈 Lv.${oldLevel} → Lv.${newLvl}！`);

      const newMaxHp = Math.floor(selectedPokemon.maxHp * 1.1);
      const newAttack = Math.floor(selectedPokemon.attack * 1.1);
      const newDefense = Math.floor(selectedPokemon.defense * 1.1);
      const newSpeed = Math.floor(selectedPokemon.speed * 1.1);

      setSelectedPokemon({
        ...selectedPokemon,
        level: newLvl,
        experience: newExp,
        maxHp: newMaxHp,
        attack: newAttack,
        defense: newDefense,
        speed: newSpeed,
      });

      const evolution = EVOLUTIONS[selectedPokemon.species_id || selectedPokemon.speciesId];
      if (evolution && newLvl >= evolution.level) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        addLog(`🌟 什么？${selectedPokemon.name} 想要进化了！`);

        // Show evolution choice dialog
        setPendingEvolution(evolution);
        setShowEvolutionChoice(true);

        // Wait for user choice (handled by buttons)
        return;
      }

      // If no evolution, save stats
      await saveStatsAfterLevelUp(newLvl, newExp, newMaxHp, newAttack, newDefense, newSpeed, expGained);
    } else {
      // Just save experience
      try {
        await updateDoc(doc(db, 'pokemon', selectedPokemon.id), {
          experience: newExp,
        });
        await addExperience(selectedPokemon.id, expGained);
      } catch (error) {
        console.error('Failed to save experience:', error);
      }
    }
  };

  // 保存升级后的属性
  const saveStatsAfterLevelUp = async (newLvl: number, newExp: number, newMaxHp: number, newAttack: number, newDefense: number, newSpeed: number, expGain: number) => {
    // Save to Firebase
    try {
      await updateDoc(doc(db, 'pokemon', selectedPokemon.id), {
        level: newLvl,
        experience: newExp,
        stats: {
          hp: newMaxHp,
          attack: newAttack,
          defense: newDefense,
          speed: newSpeed,
        },
      });
    } catch (error) {
      console.error('Failed to save level up to Firebase:', error);
    }

    // Save to blockchain
    try {
      const expGained = newExp - (selectedPokemon.experience || 0);
      await addExperience(selectedPokemon.id, expGained);
      console.log(`✅ Added ${expGained} EXP to blockchain for Pokemon ${selectedPokemon.id}`);
    } catch (error) {
      console.error('Failed to save experience to blockchain:', error);
    }
  };

  // 确认进化
  const confirmEvolution = async () => {
    if (!pendingEvolution) return;

    setShowEvolutionChoice(false);
    setShowEvolution(true);

    await new Promise(resolve => setTimeout(resolve, 2000));
    addLog(`🦋 ${selectedPokemon.name} 进化成了 ${pendingEvolution.name}！`);

    setEvolved({
      from: selectedPokemon.name,
      to: pendingEvolution.name,
      newSpeciesId: pendingEvolution.evolvesTo
    });

    setSelectedPokemon({
      ...selectedPokemon,
      name: pendingEvolution.name,
      species_id: pendingEvolution.evolvesTo,
      speciesId: pendingEvolution.evolvesTo,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pendingEvolution.evolvesTo}.png`,
    });

    setShowEvolution(false);

    try {
      await updateDoc(doc(db, 'pokemon', selectedPokemon.id), {
        name: pendingEvolution.name,
        species_id: pendingEvolution.evolvesTo,
        speciesId: pendingEvolution.evolvesTo,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pendingEvolution.evolvesTo}.png`,
      });
    } catch (error) {
      console.error('Failed to save evolution:', error);
    }

    setPendingEvolution(null);
  };

  // 取消进化
  const cancelEvolution = async () => {
    setShowEvolutionChoice(false);
    addLog(`❌ ${selectedPokemon.name} 的进化被取消了！`);
    setPendingEvolution(null);

    // Save stats without evolution
    const newLvl = newLevel;
    const newExp = selectedPokemon.experience;
    const newMaxHp = selectedPokemon.maxHp;
    const newAttack = selectedPokemon.attack;
    const newDefense = selectedPokemon.defense;
    const newSpeed = selectedPokemon.speed;
    const expGain = newExp - (selectedPokemon.experience || 0);

    await saveStatsAfterLevelUp(newLvl, newExp, newMaxHp, newAttack, newDefense, newSpeed, expGain);
  };

  // 保存战斗结果
  const saveBattleResult = async (result: 'victory' | 'defeat', expGained: number) => {
    if (!account?.address) return;

    try {
      await setDoc(doc(db, 'battleHistory', `${account.address}_${Date.now()}`), {
        playerId: account.address,
        opponentType: 'wild',
        playerPokemon: {
          name: selectedPokemon.name,
          level: selectedPokemon.level,
          species_id: selectedPokemon.species_id || selectedPokemon.speciesId
        },
        opponent: {
          name: opponent.name,
          level: opponent.level,
          species_id: opponent.id
        },
        winner: result === 'victory' ? 'player' : 'opponent',
        experienceGained: expGained,
        leveledUp,
        newLevel: leveledUp ? newLevel : selectedPokemon.level,
        evolved: evolved,
        battleLog,
        createdAt: serverTimestamp(),
      });

      if (result === 'victory') {
        await updateDoc(doc(db, 'players', account.address), {
          'stats.totalBattles': increment(1),
          'stats.wins': increment(1),
          lastActive: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'players', account.address), {
          'stats.totalBattles': increment(1),
          lastActive: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Failed to save battle result:', error);
    }
  };

  // 重新开始
  const handleRestart = () => {
    setPhase('select');
    setSelectedPokemon(null);
    setOpponent(null);
    setBattleLog([]);
    setExperienceGained(0);
    setLeveledUp(false);
    setNewLevel(0);
    setEvolved(null);
    setDamageNumbers([]);
  };

  // 获取 HP 百分比和颜色
  const getHpPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getHpClass = (percentage: number) => {
    if (percentage > 50) return 'hp-high';
    if (percentage > 20) return 'hp-medium';
    return 'hp-low';
  };

  if (loading) {
    return (
      <WalletGuard>
        <div className="game-container flex items-center justify-center">
          <div className="text-center">
            <div className="pokeball-loader mx-auto mb-6" />
            <p className="text-white text-2xl font-bold">加载中...</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="game-container">
        {/* 背景粒子 */}
        <div className="game-bg-particles">
          {generateParticles()}
        </div>

        {/* Music Controls */}
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={togglePlay}
            className="bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
            title={isPlaying ? 'Pause Music' : 'Play Music'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={toggleMute}
            className="bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        <div className="relative z-10 py-8 px-4 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* 选择 Pokemon 阶段 */}
            {phase === 'select' && (
              <div>
                <div className="text-center mb-12">
                  <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                    ⚔️ 快速对战
                  </h1>
                  <p className="text-2xl text-white/90">选择你的 Pokemon 开始训练！</p>
                </div>

                {playerPokemonList.length === 0 ? (
                  <div className="max-w-md mx-auto pokemon-card text-center">
                    <div className="text-6xl mb-6">🎮</div>
                    <p className="text-xl text-white mb-6">你还没有 Pokemon！</p>
                    <button
                      onClick={() => router.push('/starter')}
                      className="game-button game-button-success w-full"
                    >
                      获取 Starter Pokemon
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playerPokemonList.map((pokemon) => (
                      <div
                        key={pokemon.id}
                        onClick={() => handleSelectPokemon(pokemon)}
                        className="pokemon-card"
                      >
                        <div className="text-center">
                          <div className="pokemon-sprite-container mb-4">
                            <img
                              src={pokemon.sprite}
                              alt={pokemon.name}
                              className="pokemon-sprite w-40 h-40 mx-auto pixelated"
                            />
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-2">{pokemon.name}</h3>
                          <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-4">
                            <span className="text-lg font-bold text-gray-900">Lv. {pokemon.level}</span>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">❤️ HP:</span>
                              <span className="text-red-400 font-bold text-lg">{pokemon.maxHp || (pokemon as any).stats?.hp}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">⚔️ 攻击:</span>
                              <span className="text-orange-400 font-bold text-lg">{pokemon.attack || (pokemon as any).stats?.attack}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">🛡️ 防御:</span>
                              <span className="text-blue-400 font-bold text-lg">{pokemon.defense || (pokemon as any).stats?.defense}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300 font-semibold">✨ 经验:</span>
                              <span className="text-purple-400 font-bold text-lg">{pokemon.experience || 0}</span>
                            </div>
                          </div>

                          <button className="game-button game-button-attack w-full">
                            选择战斗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-12 text-center">
                  <button
                    onClick={() => router.push('/')}
                    className="game-button"
                  >
                    ← 返回首页
                  </button>
                </div>
              </div>
            )}

            {/* 战斗阶段 */}
            {phase === 'battle' && selectedPokemon && opponent && (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">⚔️ 战斗中</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 战斗场景 */}
                  <div className="lg:col-span-2">
                    <div className="battle-arena relative">
                      {/* 伤害数字 */}
                      {damageNumbers.map(({ id, damage, x, y }) => (
                        <div
                          key={id}
                          className="damage-number"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          -{damage}
                        </div>
                      ))}

                      {/* 对手 Pokemon */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4 px-6">
                          <div>
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{opponent.name}</h3>
                            <div className="inline-block px-3 py-1 bg-red-500/80 rounded-full mt-1">
                              <span className="text-white font-bold">Lv. {opponent.level}</span>
                            </div>
                          </div>
                          <div className="text-right flex-1 ml-6">
                            <div className="text-sm text-white/90 mb-2 font-semibold">
                              HP: {opponent.currentHp}/{opponent.maxHp}
                            </div>
                            <div className="hp-bar-container">
                              <div className="hp-bar">
                                <div
                                  className={`hp-bar-fill ${getHpClass(getHpPercentage(opponent.currentHp, opponent.maxHp))}`}
                                  style={{ width: `${getHpPercentage(opponent.currentHp, opponent.maxHp)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end pr-12">
                          <div className={`pokemon-battle-position ${opponentAttacking ? 'pokemon-attacking' : ''} ${opponentHurt ? 'pokemon-hurt' : ''}`}>
                            <img
                              src={opponent.sprite}
                              alt={opponent.name}
                              className="pokemon-sprite w-56 h-56 pixelated"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 玩家 Pokemon */}
                      <div className="mt-12">
                        <div className="flex justify-start pl-12">
                          <div className={`pokemon-battle-position ${playerAttacking ? 'pokemon-attacking' : ''} ${playerHurt ? 'pokemon-hurt' : ''} ${showEvolution ? 'evolution-effect' : ''}`}>
                            <img
                              src={selectedPokemon.sprite}
                              alt={selectedPokemon.name}
                              className="pokemon-sprite w-56 h-56 pixelated"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 px-6">
                          <div className="flex-1 mr-6">
                            <div className="text-sm text-white/90 mb-2 font-semibold">
                              HP: {selectedPokemon.currentHp}/{selectedPokemon.maxHp}
                            </div>
                            <div className="hp-bar-container">
                              <div className="hp-bar">
                                <div
                                  className={`hp-bar-fill ${getHpClass(getHpPercentage(selectedPokemon.currentHp, selectedPokemon.maxHp))}`}
                                  style={{ width: `${getHpPercentage(selectedPokemon.currentHp, selectedPokemon.maxHp)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg">{selectedPokemon.name}</h3>
                            <div className="inline-block px-3 py-1 bg-blue-500/80 rounded-full mt-1">
                              <span className="text-white font-bold">Lv. {selectedPokemon.level}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 技能选择 */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      {getMoves(selectedPokemon).map((move, index) => (
                        <button
                          key={index}
                          onClick={() => playerAttackWithMove(move)}
                          disabled={isAttacking}
                          className={`game-button game-button-attack text-xl py-4 ${isAttacking ? 'game-button-disabled' : ''}`}
                        >
                          <div className="font-bold">{move.name}</div>
                          <div className="text-sm opacity-80">威力: {move.power}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 战斗日志 */}
                  <div className="lg:col-span-1">
                    <div className="battle-log" ref={battleLogRef}>
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                        <span className="mr-2">📜</span>
                        战斗日志
                      </h3>
                      <div className="space-y-2">
                        {battleLog.map((log, index) => (
                          <div key={index} className="battle-log-entry text-white">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 胜利/失败阶段 */}
            {(phase === 'victory' || phase === 'defeat') && (
              <div className="max-w-3xl mx-auto">
                <div className={`result-screen ${phase === 'victory' ? 'result-screen-victory' : 'result-screen-defeat'}`}>
                  {/* 星星效果 */}
                  {phase === 'victory' && (
                    <div className="stars">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="star"
                          style={{
                            width: Math.random() * 4 + 2 + 'px',
                            height: Math.random() * 4 + 2 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDelay: Math.random() * 3 + 's',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <div className="text-8xl mb-4">
                        {phase === 'victory' ? '🎉' : '😔'}
                      </div>
                      <h2 className="text-6xl font-bold mb-4" style={{
                        color: phase === 'victory' ? '#48bb78' : '#f56565',
                        textShadow: '0 0 20px currentColor'
                      }}>
                        {phase === 'victory' ? '胜利！' : '失败'}
                      </h2>
                      <p className="text-2xl text-white">
                        {phase === 'victory'
                          ? `${selectedPokemon.name} 击败了 ${opponent.name}！`
                          : `${selectedPokemon.name} 失去了战斗能力...`
                        }
                      </p>
                    </div>

                    {phase === 'victory' && (
                      <div className="space-y-6 mb-8">
                        {/* 经验值奖励 */}
                        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border-2 border-purple-500/50">
                          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                            <span className="mr-2">🎁</span>
                            战斗奖励
                          </h3>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl text-white">经验值:</span>
                            <span className="text-3xl font-bold text-blue-400">+{experienceGained} EXP</span>
                          </div>
                          <div className="exp-bar">
                            <div
                              className="exp-bar-fill"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>

                        {/* 升级提示 */}
                        {leveledUp && (
                          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-2xl p-6 border-2 border-yellow-500 level-up-animation">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <span className="text-4xl mr-3">✨</span>
                                <span className="text-2xl font-bold text-yellow-300">升级！</span>
                              </div>
                              <span className="text-3xl font-bold text-yellow-400">
                                Lv.{selectedPokemon.level - 1} → Lv.{newLevel}
                              </span>
                            </div>
                            <p className="text-yellow-200 text-lg">所有属性提升 10%！</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="text-center">
                                <div className="text-red-400 font-bold">❤️ HP</div>
                                <div className="text-white text-xl">+10%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-orange-400 font-bold">⚔️ 攻击</div>
                                <div className="text-white text-xl">+10%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-blue-400 font-bold">🛡️ 防御</div>
                                <div className="text-white text-xl">+10%</div>
                              </div>
                              <div className="text-center">
                                <div className="text-green-400 font-bold">⚡ 速度</div>
                                <div className="text-white text-xl">+10%</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 进化提示 */}
                        {evolved && (
                          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border-2 border-purple-500">
                            <div className="text-center">
                              <div className="text-4xl mb-3">🦋</div>
                              <div className="text-2xl font-bold text-purple-300 mb-4">进化！</div>
                              <div className="flex items-center justify-center gap-4 text-2xl">
                                <span className="text-white font-bold">{evolved.from}</span>
                                <span className="text-purple-400">→</span>
                                <span className="text-purple-300 font-bold">{evolved.to}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 战斗记录 */}
                    <div className="bg-black/30 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto border-2 border-white/20">
                      <h4 className="text-xl font-bold text-white mb-3 flex items-center">
                        <span className="mr-2">📜</span>
                        战斗记录
                      </h4>
                      <div className="space-y-1">
                        {battleLog.map((log, index) => (
                          <div key={index} className="text-gray-300 text-sm">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleRestart}
                        className="game-button game-button-success flex-1 text-xl"
                      >
                        🔄 继续训练
                      </button>
                      <button
                        onClick={() => router.push('/')}
                        className="game-button flex-1 text-xl"
                      >
                        🏠 返回首页
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 进化选择对话框 */}
      {showEvolutionChoice && pendingEvolution && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '600px',
            width: '90%',
            border: '3px solid #fbbf24',
            boxShadow: '0 0 50px rgba(251, 191, 36, 0.5)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌟</div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#fbbf24',
                marginBottom: '20px',
                textShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
              }}>
                进化确认
              </h2>
              <p style={{ fontSize: '24px', color: 'white', marginBottom: '10px' }}>
                {selectedPokemon.name} 想要进化成 {pendingEvolution.name}！
              </p>
              <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.7)' }}>
                是否允许进化？
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              marginTop: '30px',
            }}>
              <button
                onClick={confirmEvolution}
                className="game-button game-button-success"
                style={{ flex: 1, fontSize: '20px', padding: '15px' }}
              >
                ✅ 进化！
              </button>
              <button
                onClick={cancelEvolution}
                className="game-button game-button-danger"
                style={{ flex: 1, fontSize: '20px', padding: '15px' }}
              >
                ❌ 取消
              </button>
            </div>

            <p style={{
              marginTop: '20px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'center',
            }}>
              💡 提示：取消进化后，下次升级还可以再次进化
            </p>
          </div>
        </div>
      )}
    </WalletGuard>
  );
}
