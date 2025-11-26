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
  const wildHPPercent = Math.max(0, Math.min(100, (wildHP / wildMaxHP) * 100));
  const playerHPPercent = Math.max(0, Math.min(100, (playerHP / playerMaxHP) * 100));

  // Debug log
  console.log('🩺 HP Status:', {
    wild: { hp: wildHP, max: wildMaxHP, percent: wildHPPercent },
    player: { hp: playerHP, max: playerMaxHP, percent: playerHPPercent }
  });

  return (
    <>
      <style jsx>{`
        .battle-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 9999;
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
          background: white;
          border-radius: 24px;
          border: 4px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3), 0 10px 40px rgba(59, 130, 246, 0.2);
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
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        }

        .player-area {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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
          font-size: 14px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
        }

        .hp-bar-container {
          width: 100%;
          height: 18px;
          background: linear-gradient(to bottom, #dc2626, #b91c1c);
          border-radius: 9px;
          overflow: visible;
          border: 2px solid rgba(0, 0, 0, 0.5);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
          position: relative;
        }

        .hp-bar {
          height: 100%;
          background: linear-gradient(to bottom, #22d3ee, #06b6d4);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 7px;
          box-shadow: 
            0 0 12px rgba(34, 211, 238, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
        }

        .battle-log {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 15px;
          width: 280px;
          max-height: 120px;
          overflow-y: auto;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .battle-log h4 {
          color: #3b82f6;
          font-size: 14px;
          font-weight: 900;
          margin: 0 0 10px 0;
        }

        .log-entry {
          color: #4b5563;
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 6px 0;
          line-height: 1.4;
        }

        .action-panel {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
          border-top: 3px solid rgba(59, 130, 246, 0.3);
          padding: 20px;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .action-button {
          padding: 20px;
          font-size: 18px;
          font-weight: 900;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .action-button:active:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .attack-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .catch-button {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .flee-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .moves-section {
          margin-bottom: 20px;
        }

        .section-header {
          color: #1f2937;
          font-size: 18px;
          font-weight: 900;
          margin: 0 0 15px 0;
        }

        .moves-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .move-button {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 18px 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .move-button:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.5);
        }

        .move-button:active:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
        }

        .move-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .move-name {
          font-size: 16px;
          font-weight: 900;
          margin: 0 0 6px 0;
        }

        .move-details {
          font-size: 13px;
          font-weight: 600;
          opacity: 0.9;
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
            padding: 18px;
            font-size: 16px;
          }

          .action-buttons {
            grid-template-columns: 1fr;
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
                      width: `${wildHPPercent}%`
                    }}
                  />
                </div>
              </div>

              <div className="battle-log">
                <h4>⚔️ Battle Log</h4>
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
                      width: `${playerHPPercent}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="action-panel">
            <div className="moves-section">
              <h3 className="section-header">⚔️ Choose Your Move:</h3>
              <div className="moves-panel">
                {moves.map((move, index) => (
                  <button
                    key={index}
                    className="move-button"
                    onClick={() => onAttack(move)}
                    disabled={isAttacking || wildHP === 0 || playerHP === 0}
                  >
                    <p className="move-name">{move.name}</p>
                    <p className="move-details">
                      {move.type} • ⚡ {move.power}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="action-buttons">
              <button
                className="action-button catch-button"
                onClick={onCatch}
                disabled={isAttacking || wildHP === 0 || playerHP === 0}
              >
                🎯 Catch
              </button>
              <button
                className="action-button flee-button"
                onClick={onFlee}
                disabled={isAttacking}
              >
                🏃 Flee
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
