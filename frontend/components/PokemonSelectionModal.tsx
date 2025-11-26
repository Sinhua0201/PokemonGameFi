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

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .selection-container {
          width: 90%;
          max-width: 900px;
          max-height: 85vh;
          background: white;
          border-radius: 24px;
          border: 4px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3), 0 10px 40px rgba(59, 130, 246, 0.2);
          padding: 40px;
          overflow-y: auto;
          animation: slideUp 0.4s ease-out;
        }

        .title {
          font-size: 36px;
          font-weight: 900;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-align: center;
          margin: 0 0 40px 0;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
        }

        .wild-pokemon-display {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          border-radius: 20px;
          padding: 30px;
          border: 3px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
        }

        .wild-sprite {
          width: 180px;
          height: 180px;
          image-rendering: pixelated;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 8px 16px rgba(59, 130, 246, 0.3));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .wild-info {
          margin-left: 30px;
          color: #1f2937;
        }

        .wild-name {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 15px 0;
          color: #1f2937;
        }

        .wild-level {
          font-size: 20px;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          display: inline-block;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .section-title {
          font-size: 24px;
          font-weight: 900;
          color: #1f2937;
          margin: 0 0 25px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title::before {
          content: '⚔️';
          font-size: 28px;
        }

        .pokemon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .pokemon-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
          border: 3px solid rgba(59, 130, 246, 0.2);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .pokemon-card:hover {
          background: linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%);
          border-color: #3b82f6;
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
        }

        .pokemon-card-sprite {
          width: 96px;
          height: 96px;
          image-rendering: pixelated;
          margin: 0 auto 15px;
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2));
          transition: transform 0.3s ease;
        }

        .pokemon-card:hover .pokemon-card-sprite {
          transform: scale(1.1);
        }

        .pokemon-card-name {
          font-size: 18px;
          font-weight: 900;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .pokemon-card-level {
          font-size: 15px;
          font-weight: 700;
          color: #3b82f6;
          margin: 0;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .action-button {
          padding: 20px;
          font-size: 20px;
          font-weight: 900;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .action-button:hover {
          transform: translateY(-4px) scale(1.05);
        }

        .action-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .catch-button {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        }

        .catch-button:hover {
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }

        .flee-button {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }

        .flee-button:hover {
          box-shadow: 0 10px 30px rgba(107, 114, 128, 0.4);
        }

        .empty-message {
          text-align: center;
          color: #4b5563;
          font-size: 18px;
          font-weight: 600;
          padding: 50px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
          border-radius: 16px;
          margin-bottom: 30px;
          border: 2px solid rgba(59, 130, 246, 0.2);
          line-height: 1.8;
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
            ⚡ A Wild Pokémon Appeared! ⚡
          </h2>

          <div className="wild-pokemon-display">
            <img 
              src={wildPokemon.sprite} 
              alt={wildPokemon.name}
              className="wild-sprite"
            />
            <div className="wild-info">
              <p className="wild-name">{wildPokemon.name}</p>
              <p className="wild-level">Level {wildPokemon.level}</p>
            </div>
          </div>

          <h3 className="section-title">Choose Your Pokémon:</h3>

          {playerPokemonList.length === 0 ? (
            <div className="empty-message">
              You don&apos;t have any Pokémon yet!<br />
              Try catching this wild Pokémon directly!
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
              🎯 Catch
            </button>
            <button
              className="action-button flee-button"
              onClick={onFlee}
            >
              🏃 Flee
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
