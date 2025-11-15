'use client';

import { useState, useEffect } from 'react';
import { pokemonApi, aiApi } from '@/lib/api';
import { PokemonData } from '@/lib/api';
import { toast } from 'sonner';
import { useSimpleBreeding } from '@/hooks/useSimpleBreeding';

interface SimpleEgg {
  id: string;
  parent1Species: number;
  parent2Species: number;
  parent1Name: string;
  parent2Name: string;
  incubationSteps: number;
  requiredSteps: number;
  owner: string;
  createdAt: any;
}

interface SimpleEggDashboardProps {
  walletAddress?: string;
  onEggHatched: () => void;
}

export function SimpleEggDashboard({ walletAddress, onEggHatched }: SimpleEggDashboardProps) {
  const { hatchEgg, getPlayerEggs, isLoading } = useSimpleBreeding(walletAddress);
  const [eggs, setEggs] = useState<SimpleEgg[]>([]);
  const [hatchingEggId, setHatchingEggId] = useState<string | null>(null);
  const [showHatchAnimation, setShowHatchAnimation] = useState(false);
  const [hatchedPokemon, setHatchedPokemon] = useState<PokemonData | null>(null);
  const [hatchingText, setHatchingText] = useState<string>('');
  const [parentData, setParentData] = useState<Map<number, PokemonData>>(new Map());
  const [loadingEggs, setLoadingEggs] = useState(true);

  // 加载蛋列表
  useEffect(() => {
    loadEggs();
  }, [walletAddress]);

  const loadEggs = async () => {
    if (!walletAddress) return;
    
    setLoadingEggs(true);
    try {
      const playerEggs = await getPlayerEggs();
      setEggs(playerEggs);
      
      // 加载父母宝可梦数据
      const dataMap = new Map<number, PokemonData>();
      const speciesIds = new Set<number>();
      
      playerEggs.forEach(egg => {
        speciesIds.add(egg.parent1Species);
        speciesIds.add(egg.parent2Species);
      });

      for (const speciesId of speciesIds) {
        try {
          const data = await pokemonApi.getPokemon(speciesId);
          dataMap.set(speciesId, data);
        } catch (error) {
          console.error(`加载宝可梦 ${speciesId} 失败:`, error);
        }
      }

      setParentData(dataMap);
    } catch (error) {
      console.error('加载蛋列表失败:', error);
      toast.error('加载蛋列表失败');
    } finally {
      setLoadingEggs(false);
    }
  };

  const handleHatchEgg = async (egg: SimpleEgg) => {
    setHatchingEggId(egg.id);

    try {
      // 确定后代物种（随机选择一个父母的物种）
      const offspringSpecies = Math.random() < 0.5 ? egg.parent1Species : egg.parent2Species;
      const offspringData = await pokemonApi.getPokemon(offspringSpecies);

      // 生成孵化文本
      toast.loading('生成孵化动画...', { id: 'hatch' });
      try {
        const { text } = await aiApi.generateHatchingText(
          offspringData.name,
          offspringData.types
        );
        setHatchingText(text);
      } catch (error) {
        console.error('生成孵化文本失败:', error);
        setHatchingText(`一只可爱的 ${offspringData.name} 从蛋中孵化出来了！`);
      }

      // 显示动画
      setShowHatchAnimation(true);
      setHatchedPokemon(offspringData);

      // 等待动画
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 孵化蛋
      toast.loading('孵化中...', { id: 'hatch' });
      await hatchEgg(
        egg.id,
        offspringSpecies,
        offspringData.name,
        offspringData.types
      );

      toast.success(`${offspringData.name} 孵化成功！`, { id: 'hatch' });

      // 等待一会儿然后关闭动画
      setTimeout(() => {
        setShowHatchAnimation(false);
        setHatchedPokemon(null);
        setHatchingText('');
        setHatchingEggId(null);
        onEggHatched();
        loadEggs(); // 重新加载蛋列表
      }, 3000);

    } catch (error) {
      console.error('孵化失败:', error);
      toast.error('孵化失败，请重试', { id: 'hatch' });
      setShowHatchAnimation(false);
      setHatchedPokemon(null);
      setHatchingText('');
      setHatchingEggId(null);
    }
  };

  if (loadingEggs) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
        <p className="text-gray-300">加载中...</p>
      </div>
    );
  }

  if (eggs.length === 0) {
    return (
      <>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 40px 20px;
          }
          
          .egg-icon {
            font-size: 60px;
            margin-bottom: 20px;
          }
          
          .empty-title {
            color: #d1d5db;
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .empty-subtitle {
            color: #9ca3af;
            font-size: 14px;
          }
        `}</style>
        
        <div className="empty-state">
          <div className="egg-icon">🥚</div>
          <p className="empty-title">没有正在孵化的蛋</p>
          <p className="empty-subtitle">繁殖两只宝可梦来创建蛋！</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        .dashboard {
          padding: 20px 0;
        }
        
        .dashboard-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .dashboard-title {
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin-bottom: 10px;
        }
        
        .dashboard-subtitle {
          color: #d1d5db;
          font-size: 14px;
        }
        
        .eggs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .egg-card {
          background: rgba(139, 92, 246, 0.2);
          border: 2px solid #a78bfa;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .egg-card.ready {
          background: rgba(34, 197, 94, 0.2);
          border-color: #22c55e;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .egg-icon-container {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .egg-icon {
          font-size: 60px;
        }
        
        .egg-icon.ready {
          animation: bounce 1s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .parents-section {
          margin-bottom: 20px;
        }
        
        .parents-label {
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
          margin-bottom: 10px;
        }
        
        .parents-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }
        
        .parent-item {
          text-align: center;
        }
        
        .parent-sprite {
          width: 48px;
          height: 48px;
          image-rendering: pixelated;
          margin: 0 auto;
        }
        
        .parent-name {
          font-size: 12px;
          color: #d1d5db;
          margin-top: 5px;
        }
        
        .plus-sign {
          color: #9ca3af;
          font-size: 20px;
        }
        
        .progress-section {
          margin-bottom: 20px;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .progress-label {
          color: #d1d5db;
        }
        
        .progress-value {
          color: white;
          font-weight: bold;
        }
        
        .progress-bar-container {
          width: 100%;
          height: 16px;
          background: #374151;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          transition: width 0.5s ease;
          background: linear-gradient(to right, #a78bfa, #ec4899);
        }
        
        .progress-bar.ready {
          background: linear-gradient(to right, #22c55e, #10b981);
        }
        
        .progress-percent {
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
          margin-top: 5px;
        }
        
        .hatch-button {
          width: 100%;
          padding: 12px;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
          background: linear-gradient(to right, #22c55e, #16a34a);
        }
        
        .hatch-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
        }
        
        .hatch-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .hatch-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .info-text {
          text-align: center;
          font-size: 14px;
          color: #9ca3af;
        }
        
        /* 孵化动画 Modal */
        .hatch-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .hatch-modal {
          background: linear-gradient(to bottom, #581c87, #1f2937);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          border: 2px solid #a78bfa;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        
        .hatch-modal-content {
          text-align: center;
        }
        
        .hatch-title {
          font-size: 28px;
          font-weight: bold;
          color: white;
          margin-bottom: 30px;
        }
        
        .hatched-sprite-container {
          position: relative;
          margin-bottom: 30px;
        }
        
        .hatched-sprite {
          width: 192px;
          height: 192px;
          image-rendering: pixelated;
          margin: 0 auto;
          animation: bounce 1s ease-in-out infinite;
        }
        
        .hatched-name {
          font-size: 24px;
          font-weight: bold;
          color: white;
          margin-bottom: 10px;
        }
        
        .hatched-types {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .type-badge {
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
          background: #a78bfa;
        }
        
        .hatch-text {
          color: #d1d5db;
          font-style: italic;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        
        .adding-text {
          color: #fbbf24;
          font-size: 14px;
          animation: pulse 1s ease-in-out infinite;
        }
      `}</style>

      <div className="dashboard">
        <div className="dashboard-header">
          <h3 className="dashboard-title">
            孵化中的蛋 ({eggs.length}/3)
          </h3>
          <p className="dashboard-subtitle">
            点击"立即孵化"按钮快速孵化蛋！
          </p>
        </div>

        <div className="eggs-grid">
          {eggs.map((egg) => {
            const progress = (egg.incubationSteps / egg.requiredSteps) * 100;
            const isReady = egg.incubationSteps >= egg.requiredSteps;
            const parent1 = parentData.get(egg.parent1Species);
            const parent2 = parentData.get(egg.parent2Species);

            return (
              <div key={egg.id} className={`egg-card ${isReady ? 'ready' : ''}`}>
                <div className="egg-icon-container">
                  <div className={`egg-icon ${isReady ? 'ready' : ''}`}>🥚</div>
                </div>

                <div className="parents-section">
                  <p className="parents-label">父母:</p>
                  <div className="parents-container">
                    {parent1 && (
                      <div className="parent-item">
                        <img
                          src={parent1.sprite}
                          alt={parent1.name}
                          className="parent-sprite"
                        />
                        <p className="parent-name">{parent1.name}</p>
                      </div>
                    )}
                    <div className="plus-sign">+</div>
                    {parent2 && (
                      <div className="parent-item">
                        <img
                          src={parent2.sprite}
                          alt={parent2.name}
                          className="parent-sprite"
                        />
                        <p className="parent-name">{parent2.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-label">孵化进度</span>
                    <span className="progress-value">
                      {egg.incubationSteps}/{egg.requiredSteps}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${isReady ? 'ready' : ''}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="progress-percent">{progress.toFixed(1)}% 完成</p>
                </div>

                <button
                  onClick={() => handleHatchEgg(egg)}
                  disabled={isLoading && hatchingEggId === egg.id}
                  className="hatch-button"
                >
                  {isLoading && hatchingEggId === egg.id ? (
                    <span className="hatch-button-content">
                      <div className="spinner" />
                      孵化中...
                    </span>
                  ) : (
                    '🐣 立即孵化'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 孵化动画 Modal */}
      {showHatchAnimation && hatchedPokemon && (
        <div className="hatch-modal-overlay">
          <div className="hatch-modal">
            <div className="hatch-modal-content">
              <h2 className="hatch-title">🎉 蛋正在孵化！🎉</h2>

              <div className="hatched-sprite-container">
                <img
                  src={hatchedPokemon.sprite}
                  alt={hatchedPokemon.name}
                  className="hatched-sprite"
                />
              </div>

              <h3 className="hatched-name">{hatchedPokemon.name}</h3>
              
              <div className="hatched-types">
                {hatchedPokemon.types.map((type) => (
                  <span key={type} className="type-badge">
                    {type}
                  </span>
                ))}
              </div>

              <p className="hatch-text">"{hatchingText}"</p>

              <div className="adding-text">添加到你的收藏中...</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
