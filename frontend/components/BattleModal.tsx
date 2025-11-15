'use client';

import { useState } from 'react';

interface Move {
  name: string;
  power: number;
  type: string;
}

interface Pokemon {
  id: string;
  name: string;
  sprite: string;
  level: number;
  types?: string[];
  stats?: any;
}

interface BattleModalProps {
  wildPokemon: Pokemon;
  playerPokemon: Pokemon;
  wildHP: number;
  wildMaxHP: number;
  playerHP: number;
  playerMaxHP: number;
  battleLog: string[];
  moves: Move[];
  isAttacking: boolean;
  onAttack: (move: Move) => void;
  onCatch: () => void;
  onFlee: () => void;
}

export function BattleModal({
  wildPokemon,
  playerPokemon,
  wildHP,
  wildMaxHP,
  playerHP,
  playerMaxHP,
  battleLog,
  moves,
  isAttacking,
  onAttack,
  onCatch,
  onFlee,
}: BattleModalProps) {
  const [showMoves, setShowMoves] = useState(false);

  const wildHPPercent = (wildHP / wildMaxHP) * 100;
  const playerHPPercent = (playerHP / playerMaxHP) * 100;

  const getHPColor = (percent: number) => {
    if (percent > 50) return '#10b981';
    if (percent > 20) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <>
      <style jsx>{`
        .battle-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .battle-container {
          width: 90%;
          max-width: 1000px;
          height: 85vh;
          background: linear-gradient(to bottom, #1e293b 0%, #0f172a 100%);
          border-radius: 20px;
          border: 3px solid #fbbf24;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .battle-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .pokemon-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20px;
        }

        .wild-area {
          background: linear-gradient(to bottom, #60a5fa 0%, #3b82f6 100%);
        }

        .player-area {
          background: linear-gradient(to bottom, #22c55e 0%, #16a34a 100%);
        }

        .pokemon-sprite {
          width: 180px;
          height: 180px;
          image-rendering: pixelated;
          animation: bounce 2s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .pokemon-sprite.attacking {
          animation: attack 0.5s ease-in-out;
        }

        @keyframes attack {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(20px) scale(1.1); }
        }

        .pokemon-info {
          position: absolute;
          background: white;
          border-radius: 15px;
          padding: 15px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          min-width: 280px;
        }

        .wild-info {
          top: 20px;
          left: 20px;
        }

        .player-info {
          bottom: 20px;
          right: 20px;
        }

        .pokemon-name {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .level-badge {
          background: #ef4444;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }

        .hp-text {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 6px 0;
        }

        .hp-bar-container {
          width: 100%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
        }

        .hp-bar {
          height: 100%;
          transition: width 0.5s ease, background-color 0.3s ease;
          border-radius: 6px;
        }

        .battle-log {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.85);
          border-radius: 12px;
          padding: 15px;
          width: 280px;
          max-height: 120px;
          overflow-y: auto;
        }

        .battle-log h4 {
          color: #fbbf24;
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }

        .log-entry {
          color: white;
          font-size: 13px;
          margin: 0 0 6px 0;
          line-height: 1.4;
        }

        .action-panel {
          background: #1e293b;
          border-top: 3px solid #fbbf24;
          padding: 20px;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .action-button {
          padding: 18px;
          font-size: 18px;
          font-weight: bold;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .action-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .attack-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          grid-column: 1 / -1;
        }

        .catch-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .flee-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .moves-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .move-button {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 20px 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .move-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        .move-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .move-name {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 4px 0;
        }

        .move-details {
          font-size: 13px;
          opacity: 0.9;
        }

        .back-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 15px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .battle-container {
            width: 95%;
            height: 90vh;
          }

          .pokemon-sprite {
            width: 140px;
            height: 140px;
          }

          .pokemon-info {
            min-width: 220px;
            padding: 12px 15px;
          }

          .battle-log {
            width: 220px;
          }

          .action-button {
            padding: 15px;
            font-size: 16px;
          }

          .moves-panel {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="battle-modal-overlay">
        <div className="battle-container">
          <div className="battle-field">
            {/* Wild Pokemon Area */}
            <div className="pokemon-area wild-area">
              <img 
                src={wildPokemon.sprite} 
                alt={wildPokemon.name}
                className="pokemon-sprite"
              />
              
              <div className="pokemon-info wild-info">
                <p className="pokemon-name">
                  {wildPokemon.name}
                  <span className="level-badge">Lv.{wildPokemon.level}</span>
                </p>
                <p className="hp-text">
                  HP: {Math.floor(wildHP)} / {wildMaxHP}
                </p>
                <div className="hp-bar-container">
                  <div 
                    className="hp-bar"
                    style={{ 
                      width: `${wildHPPercent}%`,
                      backgroundColor: getHPColor(wildHPPercent)
                    }}
                  />
                </div>
              </div>

              <div className="battle-log">
                <h4>⚔️ 战斗日志</h4>
                {battleLog.slice(-4).map((log, i) => (
                  <p key={i} className="log-entry">{log}</p>
                ))}
              </div>
            </div>

            {/* Player Pokemon Area */}
            <div className="pokemon-area player-area">
              <img 
                src={playerPokemon.sprite} 
                alt={playerPokemon.name}
                className="pokemon-sprite"
              />
              
              <div className="pokemon-info player-info">
                <p className="pokemon-name">
                  {playerPokemon.name}
                  <span className="level-badge" style={{ background: '#3b82f6' }}>
                    Lv.{playerPokemon.level}
                  </span>
                </p>
                <p className="hp-text">
                  HP: {Math.floor(playerHP)} / {playerMaxHP}
                </p>
                <div className="hp-bar-container">
                  <div 
                    className="hp-bar"
                    style={{ 
                      width: `${playerHPPercent}%`,
                      backgroundColor: getHPColor(playerHPPercent)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="action-panel">
            {showMoves ? (
              <>
                <div className="moves-panel">
                  {moves.map((move, index) => (
                    <button
                      key={index}
                      className="move-button"
                      onClick={() => {
                        onAttack(move);
                        setShowMoves(false);
                      }}
                      disabled={isAttacking || wildHP === 0 || playerHP === 0}
                    >
                      <p className="move-name">{move.name}</p>
                      <p className="move-details">
                        {move.type} • ⚡ {move.power}
                      </p>
                    </button>
                  ))}
                </div>
                <button 
                  className="back-button"
                  onClick={() => setShowMoves(false)}
                >
                  ← 返回
                </button>
              </>
            ) : (
              <>
                <button
                  className="action-button attack-button"
                  onClick={() => setShowMoves(true)}
                  disabled={isAttacking || wildHP === 0 || playerHP === 0}
                >
                  ⚔️ 攻击
                </button>
                <div className="action-buttons">
                  <button
                    className="action-button catch-button"
                    onClick={onCatch}
                    disabled={isAttacking || wildHP === 0 || playerHP === 0}
                  >
                    🎯 捕捉
                  </button>
                  <button
                    className="action-button flee-button"
                    onClick={onFlee}
                    disabled={isAttacking}
                  >
                    🏃 逃跑
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
