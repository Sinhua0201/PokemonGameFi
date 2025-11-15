'use client';

import { useState } from 'react';
import { BattleModal } from '@/components/BattleModal';
import { PokemonSelectionModal } from '@/components/PokemonSelectionModal';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';

export default function TestBattleModalPage() {
  const { pokemon: playerPokemonList, loading } = usePlayerPokemonNFT();
  const [showBattle, setShowBattle] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [wildHP, setWildHP] = useState(100);
  const [playerHP, setPlayerHP] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([
    '战斗开始！',
    '皮卡丘 vs 野生妙蛙种子！',
  ]);

  const wildPokemon = {
    id: '1',
    name: '妙蛙种子',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    level: 5,
    types: ['grass', 'poison'],
  };

  const playerPokemon = playerPokemonList[0] || {
    id: '25',
    name: '皮卡丘',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    level: 10,
    types: ['electric'],
  };

  const moves = [
    { name: '电击', power: 40, type: 'Electric' },
    { name: '十万伏特', power: 90, type: 'Electric' },
    { name: '电光一闪', power: 40, type: 'Normal' },
    { name: '铁尾', power: 100, type: 'Steel' },
  ];

  const handleAttack = (move: any) => {
    const damage = Math.floor(Math.random() * 30) + 10;
    setWildHP(prev => Math.max(0, prev - damage));
    setBattleLog(prev => [...prev, `${playerPokemon.name} 使用了 ${move.name}！`, `造成了 ${damage} 点伤害！`]);
    
    // Wild Pokemon counter-attack
    setTimeout(() => {
      const counterDamage = Math.floor(Math.random() * 20) + 5;
      setPlayerHP(prev => Math.max(0, prev - counterDamage));
      setBattleLog(prev => [...prev, `野生 ${wildPokemon.name} 反击！`, `造成了 ${counterDamage} 点伤害！`]);
    }, 1000);
  };

  const handleCatch = () => {
    const success = Math.random() > 0.5;
    if (success) {
      setBattleLog(prev => [...prev, `成功捕获了 ${wildPokemon.name}！`]);
      setTimeout(() => setShowBattle(false), 2000);
    } else {
      setBattleLog(prev => [...prev, `${wildPokemon.name} 挣脱了！`]);
    }
  };

  const handleFlee = () => {
    setBattleLog(prev => [...prev, '逃跑成功！']);
    setTimeout(() => setShowBattle(false), 1000);
  };

  return (
    <>
      <style jsx>{`
        .test-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #1e293b 0%, #0f172a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .title {
          font-size: 32px;
          font-weight: bold;
          color: white;
          margin-bottom: 40px;
          text-align: center;
        }

        .button-group {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .test-button {
          padding: 15px 30px;
          font-size: 18px;
          font-weight: bold;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .test-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .battle-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .selection-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .reset-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .info {
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
        }
      `}</style>

      <div className="test-page">
        <h1 className="title">
          🎮 战斗 Modal 测试页面
        </h1>

        <div className="button-group">
          <button
            className="test-button battle-button"
            onClick={() => setShowBattle(true)}
          >
            ⚔️ 测试战斗界面
          </button>

          <button
            className="test-button selection-button"
            onClick={() => setShowSelection(true)}
          >
            🎯 测试选择界面
          </button>

          <button
            className="test-button reset-button"
            onClick={() => {
              setWildHP(100);
              setPlayerHP(100);
              setBattleLog(['战斗开始！', '皮卡丘 vs 野生妙蛙种子！']);
            }}
          >
            🔄 重置状态
          </button>
        </div>

        <p className="info">
          点击按钮测试新的战斗和选择 Modal<br />
          使用纯 CSS，无 Tailwind 依赖
        </p>
      </div>

      {showBattle && (
        <BattleModal
          wildPokemon={wildPokemon}
          playerPokemon={playerPokemon}
          wildHP={wildHP}
          wildMaxHP={100}
          playerHP={playerHP}
          playerMaxHP={100}
          battleLog={battleLog}
          moves={moves}
          isAttacking={false}
          onAttack={handleAttack}
          onCatch={handleCatch}
          onFlee={handleFlee}
        />
      )}

      {showSelection && (
        <PokemonSelectionModal
          wildPokemon={wildPokemon}
          playerPokemonList={playerPokemonList}
          onSelectPokemon={(pokemon) => {
            console.log('Selected:', pokemon);
            setShowSelection(false);
            setShowBattle(true);
          }}
          onCatch={() => {
            console.log('Direct catch');
            setShowSelection(false);
          }}
          onFlee={() => {
            console.log('Fled');
            setShowSelection(false);
          }}
        />
      )}
    </>
  );
}
