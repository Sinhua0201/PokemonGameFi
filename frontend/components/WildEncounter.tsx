'use client';

import { useState, useEffect } from 'react';
import { PokemonData } from '@/lib/api';
import { PokemonCard } from './PokemonCard';
import { aiApi } from '@/lib/api';

interface WildEncounterProps {
  pokemon: PokemonData;
  level: number;
  captureRate: number;
  onCapture: () => void;
  onFlee: () => void;
  isCapturing: boolean;
}

export function WildEncounter({
  pokemon,
  level,
  captureRate,
  onCapture,
  onFlee,
  isCapturing,
}: WildEncounterProps) {
  const [encounterText, setEncounterText] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState(true);

  useEffect(() => {
    generateEncounterText();
  }, [pokemon.id]);

  const generateEncounterText = async () => {
    setIsLoadingText(true);
    try {
      const result = await aiApi.generateEncounterText(
        pokemon.name,
        pokemon.types,
        level
      );
      setEncounterText(result.text);
    } catch (error) {
      console.error('Failed to generate encounter text:', error);
      setEncounterText(
        `A wild ${pokemon.name} appears! It looks ready for a challenge!`
      );
    } finally {
      setIsLoadingText(false);
    }
  };

  const captureRatePercent = Math.round(captureRate * 100);
  const captureRateColor =
    captureRatePercent >= 70
      ? 'text-green-500'
      : captureRatePercent >= 40
      ? 'text-yellow-500'
      : 'text-red-500';

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Encounter Header */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-t-2xl p-6 text-center border-4 border-purple-300 border-b-0">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ⚔️ Wild Encounter!
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-yellow-500 text-xl">⚡</span>
          <p className="text-gray-700 text-lg font-bold">
            A wild Pokémon has appeared!
          </p>
          <span className="text-yellow-500 text-xl">⚡</span>
        </div>
      </div>

      {/* Encounter Content */}
      <div className="bg-white rounded-b-2xl p-8 border-4 border-purple-300 border-t-0 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Pokémon Card */}
          <div className="flex flex-col items-center">
            <div className="mb-4 w-full">
              <PokemonCard pokemon={pokemon} showStats={true} />
            </div>
            
            {/* Level Badge */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
              ⭐ Level {level}
            </div>
          </div>

          {/* Right: Encounter Info */}
          <div className="flex flex-col justify-between">
            {/* AI-Generated Encounter Text */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-purple-200 shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📖</div>
                <div className="flex-1">
                  {isLoadingText ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-purple-200 rounded animate-pulse" />
                      <div className="h-4 bg-purple-200 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-purple-200 rounded animate-pulse w-4/6" />
                    </div>
                  ) : (
                    <p className="text-gray-800 text-lg leading-relaxed font-medium">
                      {encounterText}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Capture Rate Display */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-200 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-800 font-bold flex items-center gap-2">
                  <span className="text-xl">🎯</span> Capture Rate:
                </span>
                <span className={`text-2xl font-bold ${captureRateColor.replace('text-', 'text-')}`}>
                  {captureRatePercent}%
                </span>
              </div>
              
              {/* Capture Rate Bar */}
              <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden border-2 border-gray-400">
                <div
                  className={`h-full transition-all duration-500 ${
                    captureRatePercent >= 70
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : captureRatePercent >= 40
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${captureRatePercent}%` }}
                />
              </div>

              {/* Capture Tip */}
              <p className="text-gray-700 text-sm mt-3 text-center font-bold bg-white/70 rounded-full py-2">
                {captureRatePercent >= 70
                  ? '✨ High chance of success!'
                  : captureRatePercent >= 40
                  ? '⚠️ Moderate chance - good luck!'
                  : '💀 Low chance - this will be tough!'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onCapture}
                disabled={isCapturing}
                className={`
                  py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg
                  ${
                    isCapturing
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:scale-105 active:scale-95 shadow-red-300'
                  }
                `}
              >
                {isCapturing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Capturing...
                  </span>
                ) : (
                  <>🎯 Attempt Capture</>
                )}
              </button>

              <button
                onClick={onFlee}
                disabled={isCapturing}
                className={`
                  py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg
                  ${
                    isCapturing
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white hover:scale-105 active:scale-95'
                  }
                `}
              >
                🏃 Flee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
