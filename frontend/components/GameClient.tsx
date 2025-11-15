'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { usePlayerPokemon } from '@/hooks/usePlayerPokemon';
import { toast } from 'sonner';

// 游戏场景类型
export type GameScene = 
  | 'main-menu'
  | 'explore'
  | 'battle'
  | 'pokemon'
  | 'trainer'
  | 'starter';

interface GameClientProps {
  initialScene?: GameScene;
}

export function GameClient({ initialScene = 'main-menu' }: GameClientProps) {
  const account = useCurrentAccount();
  const { pokemon, loading } = usePlayerPokemon(account?.address);
  const [currentScene, setCurrentScene] = useState<GameScene>(initialScene);
  const [showMenu, setShowMenu] = useState(false);

  // 检查是否需要获取 starter
  useEffect(() => {
    if (!loading && pokemon.length === 0 && currentScene === 'main-menu') {
      toast.info('欢迎！让我们开始你的冒险吧！');
      setTimeout(() => setCurrentScene('starter'), 2000);
    }
  }, [loading, pokemon.length, currentScene]);

  // ESC 键打开菜单
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentScene !== 'main-menu') {
        setShowMenu(!showMenu);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMenu, currentScene]);

  // 场景切换
  const changeScene = (scene: GameScene) => {
    setCurrentScene(scene);
    setShowMenu(false);
  };

  return (
    <div className="game-client">
      {/* 游戏菜单栏 */}
      {currentScene !== 'main-menu' && currentScene !== 'starter' && (
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
                {account?.address ? 
                  `${account.address.slice(0, 6)}...${account.address.slice(-4)}` 
                  : '未连接'
                }
              </div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="game-button text-sm px-4 py-2"
              >
                ☰ 菜单
              </button>
            </div>
          </div>

          {/* 快速菜单 */}
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
      )}

      {/* 场景内容 */}
      <div className={currentScene !== 'main-menu' && currentScene !== 'starter' ? 'pt-20' : ''}>
        {/* 这里会渲染不同的场景 */}
        <div className="scene-content">
          {/* 场景组件会在这里渲染 */}
        </div>
      </div>

      {/* 快捷键提示 */}
      {currentScene !== 'main-menu' && currentScene !== 'starter' && !showMenu && (
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 text-white text-sm animate-pulse">
          按 ESC 打开菜单
        </div>
      )}
    </div>
  );
}
