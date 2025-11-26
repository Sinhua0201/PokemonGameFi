'use client';

import { useEffect, useState } from 'react';
import { getPokemonData } from '@/lib/api';

interface EvolutionAnimationProps {
  oldSpeciesId: number;
  oldName: string;
  newSpeciesId: number;
  newName: string;
  onComplete: () => void;
}

export function EvolutionAnimation({
  oldSpeciesId,
  oldName,
  newSpeciesId,
  newName,
  onComplete,
}: EvolutionAnimationProps) {
  const [stage, setStage] = useState<'glowing' | 'transforming' | 'reveal' | 'complete'>('glowing');
  const [oldSprite, setOldSprite] = useState<string>('');
  const [newSprite, setNewSprite] = useState<string>('');

  useEffect(() => {
    loadSprites();
    startAnimation();
  }, []);

  const loadSprites = async () => {
    try {
      const [oldData, newData] = await Promise.all([
        getPokemonData(oldSpeciesId),
        getPokemonData(newSpeciesId),
      ]);
      setOldSprite(oldData.sprite);
      setNewSprite(newData.sprite);
    } catch (error) {
      console.error('Failed to load sprites:', error);
    }
  };

  const startAnimation = () => {
    // Stage 1: Glowing (2s)
    setTimeout(() => setStage('transforming'), 2000);
    
    // Stage 2: Transforming (2s)
    setTimeout(() => setStage('reveal'), 4000);
    
    // Stage 3: Reveal (2s)
    setTimeout(() => setStage('complete'), 6000);
    
    // Complete (after 8s total)
    setTimeout(() => onComplete(), 8000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {stage !== 'complete' && (
          <>
            <div className="evolution-rays"></div>
            <div className="evolution-particles"></div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pokemon sprite container */}
        <div className="relative w-64 h-64 mb-8">
          {/* Old Pokemon (fading out) */}
          {(stage === 'glowing' || stage === 'transforming') && oldSprite && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                stage === 'glowing' ? 'opacity-100 scale-100' : 'opacity-0 scale-150'
              }`}
            >
              <img
                src={oldSprite}
                alt={oldName}
                className="w-48 h-48 pixelated"
                style={{
                  imageRendering: 'pixelated',
                  filter: stage === 'glowing' ? 'brightness(2) drop-shadow(0 0 30px #fff)' : 'brightness(3)',
                }}
              />
            </div>
          )}

          {/* Transformation effect */}
          {stage === 'transforming' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-white animate-pulse"></div>
            </div>
          )}

          {/* New Pokemon (fading in) */}
          {(stage === 'reveal' || stage === 'complete') && newSprite && (
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                stage === 'reveal' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}
              style={{
                animation: stage === 'reveal' ? 'fadeInScale 2s forwards' : 'none',
              }}
            >
              <img
                src={newSprite}
                alt={newName}
                className="w-48 h-48 pixelated"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                }}
              />
            </div>
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          {stage === 'glowing' && (
            <p className="text-2xl text-white font-bold animate-pulse">
              What? {oldName} is evolving!
            </p>
          )}

          {stage === 'transforming' && (
            <p className="text-2xl text-white font-bold animate-pulse">
              {oldName} is evolving...
            </p>
          )}

          {(stage === 'reveal' || stage === 'complete') && (
            <div className="space-y-4">
              <p className="text-3xl text-yellow-400 font-bold animate-bounce">
                Congratulations!
              </p>
              <p className="text-2xl text-white font-bold">
                {oldName} evolved into {newName}!
              </p>
            </div>
          )}
        </div>

        {/* Skip button */}
        {stage !== 'complete' && (
          <button
            onClick={onComplete}
            className="absolute bottom-8 right-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity"
          >
            Skip
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .evolution-rays {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            transparent 0%,
            rgba(255, 215, 0, 0.1) 50%,
            transparent 100%
          );
          animation: rotate 4s linear infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .evolution-particles {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(2px 2px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 90% 60%, white, transparent),
            radial-gradient(2px 2px at 30% 80%, white, transparent),
            radial-gradient(1px 1px at 70% 40%, white, transparent);
          background-size: 200% 200%;
          animation: sparkle 3s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            background-position: 0% 0%;
          }
          50% {
            opacity: 1;
            background-position: 100% 100%;
          }
        }

        .pixelated {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
      `}</style>
    </div>
  );
}
