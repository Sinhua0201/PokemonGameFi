'use client';

import { useState, useEffect } from 'react';
import { EggNFT, PokemonData } from '@/types/pokemon';
import { pokemonApi, aiApi } from '@/lib/api';
import { useHatchEgg } from '@/hooks/useBreeding';
import { toast } from 'sonner';
import { MAX_INCUBATING_EGGS, REQUIRED_INCUBATION_STEPS } from '@/config/constants';

interface EggIncubationDashboardProps {
  eggs: EggNFT[];
  onEggHatched: () => void;
}

export function EggIncubationDashboard({ eggs, onEggHatched }: EggIncubationDashboardProps) {
  const { hatchEgg, isLoading: hatching } = useHatchEgg();
  const [hatchingEggId, setHatchingEggId] = useState<string | null>(null);
  const [showHatchAnimation, setShowHatchAnimation] = useState(false);
  const [hatchedPokemon, setHatchedPokemon] = useState<PokemonData | null>(null);
  const [hatchingText, setHatchingText] = useState<string>('');
  const [parentData, setParentData] = useState<Map<number, PokemonData>>(new Map());

  // Load parent Pokémon data
  useEffect(() => {
    const loadParentData = async () => {
      const dataMap = new Map<number, PokemonData>();
      const speciesIds = new Set<number>();

      eggs.forEach(egg => {
        speciesIds.add(egg.parent1Species);
        speciesIds.add(egg.parent2Species);
      });

      for (const speciesId of speciesIds) {
        try {
          const data = await pokemonApi.getPokemon(speciesId);
          dataMap.set(speciesId, data);
        } catch (error) {
          console.error(`Failed to load Pokémon ${speciesId}:`, error);
        }
      }

      setParentData(dataMap);
    };

    if (eggs.length > 0) {
      loadParentData();
    }
  }, [eggs]);

  const handleHatchEgg = async (egg: EggNFT) => {
    setHatchingEggId(egg.id);

    try {
      // Determine offspring species (randomly choose one parent's species for simplicity)
      const offspringSpecies = Math.random() < 0.5 ? egg.parent1Species : egg.parent2Species;
      const offspringData = await pokemonApi.getPokemon(offspringSpecies);

      // Generate hatching text
      toast.loading('Generating hatching animation...', { id: 'hatch' });
      const { text } = await aiApi.generateHatchingText(
        offspringData.name,
        offspringData.types
      );
      setHatchingText(text);

      // Show animation
      setShowHatchAnimation(true);
      setHatchedPokemon(offspringData);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Hatch the egg on-chain
      toast.loading('Hatching egg on blockchain...', { id: 'hatch' });
      await hatchEgg(
        egg.id,
        offspringSpecies,
        offspringData.name,
        offspringData.types
      );

      toast.success(`${offspringData.name} hatched successfully!`, { id: 'hatch' });

      // Wait a moment then close animation
      setTimeout(() => {
        setShowHatchAnimation(false);
        setHatchedPokemon(null);
        setHatchingText('');
        setHatchingEggId(null);
        onEggHatched();
      }, 3000);

    } catch (error) {
      console.error('Failed to hatch egg:', error);
      toast.error('Failed to hatch egg. Please try again.', { id: 'hatch' });
      setShowHatchAnimation(false);
      setHatchedPokemon(null);
      setHatchingText('');
      setHatchingEggId(null);
    }
  };

  if (eggs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🥚</div>
        <p className="text-gray-800 text-lg font-semibold">No eggs incubating</p>
        <p className="text-gray-600 text-sm mt-2 font-medium">
          Breed two Pokémon to create an egg!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Incubating Eggs ({eggs.length}/{MAX_INCUBATING_EGGS})
          </h3>
          <p className="text-gray-700 text-sm font-medium">
            Win 10 battles to hatch your egg! (+1 step per win)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eggs.map((egg) => {
            const progress = (egg.incubationSteps / egg.requiredSteps) * 100;
            const isReady = egg.incubationSteps >= egg.requiredSteps;
            const parent1 = parentData.get(egg.parent1Species);
            const parent2 = parentData.get(egg.parent2Species);

            return (
              <div
                key={egg.id}
                className={`
                  relative rounded-lg border-2 p-6 transition-all bg-white
                  ${isReady
                    ? 'border-green-500 shadow-lg shadow-green-500/30 animate-pulse'
                    : 'border-purple-500 shadow-md'
                  }
                `}
              >
                {/* Egg Icon */}
                <div className="text-center mb-4">
                  <div className={`text-6xl ${isReady ? 'animate-bounce' : ''}`}>
                    🥚
                  </div>
                </div>

                {/* Parent Info */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 font-semibold text-center mb-2">Parents:</p>
                  <div className="flex justify-center gap-2">
                    {parent1 && (
                      <div className="text-center">
                        <img
                          src={parent1.sprite}
                          alt={parent1.name}
                          className="pixelated w-12 h-12 mx-auto"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="text-xs text-gray-800 font-semibold">{parent1.name}</p>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 font-bold">+</div>
                    {parent2 && (
                      <div className="text-center">
                        <img
                          src={parent2.sprite}
                          alt={parent2.name}
                          className="pixelated w-12 h-12 mx-auto"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="text-xs text-gray-800 font-semibold">{parent2.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-semibold">Incubation Progress</span>
                    <span className="text-gray-900 font-bold">
                      {egg.incubationSteps}/{egg.requiredSteps}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden border-2 border-gray-400">
                    <div
                      className={`h-full transition-all duration-500 ${isReady
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-700 font-semibold mt-1 text-center">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>

                {/* Hatch Button */}
                {isReady ? (
                  <button
                    onClick={() => handleHatchEgg(egg)}
                    disabled={hatching && hatchingEggId === egg.id}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {hatching && hatchingEggId === egg.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        孵化中...
                      </span>
                    ) : (
                      '🐣 立即孵化'
                    )}
                  </button>
                ) : (
                  <div className="text-center py-3 px-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                    <p className="text-gray-900 text-sm font-bold">
                      还需赢 {egg.requiredSteps - egg.incubationSteps} 场战斗
                    </p>
                    <p className="text-gray-700 text-xs mt-1 font-semibold">
                      去Island Explorer战斗来孵化蛋！
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hatching Animation Modal */}
      {showHatchAnimation && hatchedPokemon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-purple-900 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-2xl">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎉 Egg Hatching! 🎉
              </h2>

              <div className="relative">
                <div className="animate-bounce">
                  <img
                    src={hatchedPokemon.sprite}
                    alt={hatchedPokemon.name}
                    className="pixelated w-48 h-48 mx-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {hatchedPokemon.name}
                </h3>
                <div className="flex justify-center gap-2">
                  {hatchedPokemon.types.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 rounded-full text-sm font-semibold text-white uppercase bg-purple-600"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-gray-300 italic">
                "{hatchingText}"
              </p>

              <div className="animate-pulse text-yellow-400 text-sm">
                Adding to your collection...
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
