'use client';

interface Pokemon {
  id: string;
  name: string;
  sprite: string;
  level: number;
  types?: string[];
  stats?: any;
}

interface PokemonSelectionModalProps {
  wildPokemon: Pokemon;
  playerPokemonList: Pokemon[];
  onSelectPokemon: (pokemon: Pokemon) => void;
  onCatch: () => void;
  onFlee: () => void;
}

export function PokemonSelectionModal({
  wildPokemon,
  playerPokemonList,
  onSelectPokemon,
  onCatch,
  onFlee,
}: PokemonSelectionModalProps) {
  return (
    <>
      <style jsx>{`
        .selection-modal-overlay {
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

        .selection-container {
          width: 90%;
          max-width: 900px;
          max-height: 85vh;
          background: linear-gradient(to bottom, #dc2626 0%, #991b1b 100%);
          border-radius: 20px;
          border: 4px solid #fbbf24;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          padding: 30px;
          overflow-y: auto;
        }

        .title {
          font-size: 32px;
          font-weight: bold;
          color: white;
          text-align: center;
          margin: 0 0 30px 0;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }

        .wild-pokemon-display {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
        }

        .wild-sprite {
          width: 160px;
          height: 160px;
          image-rendering: pixelated;
          animation: shake 0.5s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .wild-info {
          margin-left: 30px;
          color: white;
        }

        .wild-name {
          font-size: 28px;
          font-weight: bold;
          margin: 0 0 10px 0;
        }

        .wild-level {
          font-size: 18px;
          background: rgba(0, 0, 0, 0.3);
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
        }

        .section-title {
          font-size: 22px;
          font-weight: bold;
          color: white;
          margin: 0 0 20px 0;
        }

        .pokemon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .pokemon-card {
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .pokemon-card:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: #fbbf24;
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .pokemon-card-sprite {
          width: 80px;
          height: 80px;
          image-rendering: pixelated;
          margin: 0 auto 10px;
        }

        .pokemon-card-name {
          font-size: 16px;
          font-weight: bold;
          color: white;
          margin: 0 0 5px 0;
        }

        .pokemon-card-level {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
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

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .action-button:active {
          transform: translateY(0);
        }

        .catch-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .flee-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .empty-message {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          padding: 40px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .selection-container {
            width: 95%;
            padding: 20px;
          }

          .title {
            font-size: 24px;
          }

          .wild-pokemon-display {
            flex-direction: column;
            text-align: center;
          }

          .wild-info {
            margin-left: 0;
            margin-top: 15px;
          }

          .wild-sprite {
            width: 120px;
            height: 120px;
          }

          .pokemon-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
            gap: 12px;
          }

          .action-button {
            padding: 15px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="selection-modal-overlay">
        <div className="selection-container">
          <h2 className="title">
            野生宝可梦出现了！
          </h2>

          <div className="wild-pokemon-display">
            <img 
              src={wildPokemon.sprite} 
              alt={wildPokemon.name}
              className="wild-sprite"
            />
            <div className="wild-info">
              <p className="wild-name">{wildPokemon.name}</p>
              <p className="wild-level">等级 {wildPokemon.level}</p>
            </div>
          </div>

          <h3 className="section-title">选择你的宝可梦：</h3>

          {playerPokemonList.length === 0 ? (
            <div className="empty-message">
              你还没有宝可梦！<br />
              尝试直接捕捉这只野生宝可梦吧！
            </div>
          ) : (
            <div className="pokemon-grid">
              {playerPokemonList.slice(0, 6).map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="pokemon-card"
                  onClick={() => onSelectPokemon(pokemon)}
                >
                  <img 
                    src={pokemon.sprite} 
                    alt={pokemon.name}
                    className="pokemon-card-sprite"
                  />
                  <p className="pokemon-card-name">{pokemon.name}</p>
                  <p className="pokemon-card-level">Lv. {pokemon.level}</p>
                </div>
              ))}
            </div>
          )}

          <div className="action-buttons">
            <button
              className="action-button catch-button"
              onClick={onCatch}
            >
              🎯 直接捕捉
            </button>
            <button
              className="action-button flee-button"
              onClick={onFlee}
            >
              🏃 逃跑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
