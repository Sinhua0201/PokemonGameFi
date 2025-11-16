'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { WalletGuard } from '@/components/WalletGuard';
import { usePlayerPokemon } from '@/hooks/usePlayerPokemon';
import { toast } from 'sonner';
import '../game-styles.css';

// 导入场景组件
import dynamic from 'next/dynamic';

// 动态导入避免 SSR 问题
const ExploreScene = dynamic(() => import('@/components/scenes/ExploreScene'), { ssr: false });
const BattleScene = dynamic(() => import('@/components/scenes/BattleScene'), { ssr: false });
const PokemonScene = dynamic(() => import('@/components/scenes/PokemonScene'), { ssr: false });
const TrainerScene = dynamic(() => import('@/components/scenes/TrainerScene'), { ssr: false });

type GameScene = 'main-menu' | 'explore' | 'battle' | 'pokemon' | 'trainer' | 'starter';

export default function GamePage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { pokemon, loading } = usePlayerPokemon(account?.address);
  const [currentScene, setCurrentScene] = useState<GameScene>('main-menu');
  const [showMenu, setShowMenu] = useState(false);

  // 检查是否需要 starter
  useEffect(() => {
    if (!loading && pokemon.length === 0 && currentScene === 'main-menu') {
      toast.info('欢迎！让我们开始你的冒险吧！', { duration: 3000 });
      setTimeout(() => router.push('/start-game'), 2000);
    }
  }, [loading, pokemon.length, currentScene, router]);

  // ESC 键控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentScene === 'main-menu') return;
        if (showMenu) {
          setShowMenu(false);
        } else {
          setShowMenu(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, currentScene]);

  const changeScene = (scene: GameScene) => {
    if (scene === 'starter') {
      router.push('/start-game');
      return;
    }
    setCurrentScene(scene);
    setShowMenu(false);
  };

  // 生成背景粒子
  const particles = [...Array(20)].map((_, i) => (
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
  ));

  if (loading) {
    return (
      <WalletGuard>
        <div className="game-container flex items-center justify-center">
          <div className="pokeball-loader" />
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="game-container fixed inset-0 overflow-hidden">
        <div className="game-bg-particles">{particles}</div>

        {/* 主菜单 */}
        {currentScene === 'main-menu' && (
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div className="text-center">
              <div className="mb-12">
                <h1 
                  className="text-8xl font-bold text-white mb-4 animate-pulse"
                  style={{
                    textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(99,179,237,0.6)',
                    fontFamily: 'Impact, sans-serif',
                  }}
                >
                  ⚡ POKÉCHAIN ⚡
                </h1>
                <p className="text-3xl text-white/90 font-bold">Web3 Pokemon 冒险</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <button
                  onClick={() => changeScene('explore')}
                  className="game-button game-button-success w-full text-2xl py-6"
                >
                  🗺️ 探索世界
                </button>
                
                <button
                  onClick={() => changeScene('battle')}
                  className="game-button game-button-attack w-full text-2xl py-6"
                >
                  ⚔️ 快速对战
                </button>
                
                <button
                  onClick={() => changeScene('pokemon')}
                  className="game-button w-full text-2xl py-6"
                >
                  📱 Pokemon 图鉴
                </button>
                
                <button
                  onClick={() => changeScene('trainer')}
                  className="game-button w-full text-2xl py-6"
                >
                  👤 训练师信息
                </button>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={() => router.push('/breeding')}
                    className="game-button text-xl py-4"
                  >
                    🥚 繁殖
                  </button>
                  
                  <button
                    onClick={() => router.push('/marketplace')}
                    className="game-button text-xl py-4"
                  >
                    🏪 市场
                  </button>
                </div>
              </div>

              <div className="mt-12 bg-black/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 max-w-md mx-auto">
                <div className="text-white">
                  <div className="text-sm text-gray-300 mb-2">训练师</div>
                  <div className="font-mono text-lg">
                    {account?.address ? 
                      `${account.address.slice(0, 6)}...${account.address.slice(-4)}` 
                      : '未连接'
                    }
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Pokemon: {pokemon.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 游戏内场景 */}
        {currentScene !== 'main-menu' && (
          <div className="relative z-10">
            {/* 顶部菜单栏 */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b-2 border-white/20">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <button
                  onClick={() => changeScene('main-menu')}
                  className="game-button text-sm px-4 py-2"
                >
                  🏠 主菜单
                </button>

                <div className="flex items-center gap-3">
                  <div className="text-white text-sm hidden md:block">
                    Pokemon: {pokemon.length}
                  </div>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="game-button text-sm px-4 py-2"
                  >
                    ☰ 菜单
                  </button>
                </div>
              </div>

              {showMenu && (
                <div className="bg-black/95 border-t border-white/10 p-4">
                  <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => changeScene('explore')} className="game-button text-sm py-3">
                      🗺️ 探索
                    </button>
                    <button onClick={() => changeScene('battle')} className="game-button text-sm py-3">
                      ⚔️ 对战
                    </button>
                    <button onClick={() => changeScene('pokemon')} className="game-button text-sm py-3">
                      📱 图鉴
                    </button>
                    <button onClick={() => changeScene('trainer')} className="game-button text-sm py-3">
                      👤 训练师
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 场景内容 */}
            <div className="pt-20">
              {currentScene === 'explore' && <ExploreScene onBack={() => changeScene('main-menu')} />}
              {currentScene === 'battle' && <BattleScene onBack={() => changeScene('main-menu')} />}
              {currentScene === 'pokemon' && <PokemonScene onBack={() => changeScene('main-menu')} />}
              {currentScene === 'trainer' && <TrainerScene onBack={() => changeScene('main-menu')} />}
            </div>

            {/* 快捷键提示 */}
            {!showMenu && (
              <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 text-white text-sm animate-pulse">
                按 ESC 打开菜单
              </div>
            )}
          </div>
        )}
      </div>
    </WalletGuard>
  );
}
