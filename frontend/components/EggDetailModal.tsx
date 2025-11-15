'use client';

import { EggNFT } from '@/types/pokemon';
import { useState, useEffect } from 'react';
import { useHatchEgg } from '@/hooks/useBreeding';
import { getPokemonData } from '@/lib/api';
import { toast } from 'sonner';

interface EggDetailModalProps {
  egg: EggNFT;
  onClose: () => void;
  onHatchSuccess: () => void;
}

export function EggDetailModal({ egg, onClose, onHatchSuccess }: EggDetailModalProps) {
  const { hatchEgg, isLoading: hatching } = useHatchEgg();
  const [parent1Data, setParent1Data] = useState<any>(null);
  const [parent2Data, setParent2Data] = useState<any>(null);
  const [loadingParents, setLoadingParents] = useState(true);
  const [hatchingText, setHatchingText] = useState('');

  const progress = (egg.incubationSteps / egg.requiredSteps) * 100;
  const isReady = egg.incubationSteps >= egg.requiredSteps;

  useEffect(() => {
    loadParentData();
  }, [egg.parent1Species, egg.parent2Species]);

  const loadParentData = async () => {
    try {
      setLoadingParents(true);
      const [p1, p2] = await Promise.all([
        getPokemonData(egg.parent1Species),
        getPokemonData(egg.parent2Species),
      ]);
      setParent1Data(p1);
      setParent2Data(p2);
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoadingParents(false);
    }
  };

  const handleHatch = async () => {
    if (!isReady) {
      toast.error('Egg is not ready to hatch yet!');
      return;
    }

    try {
      // Determine offspring species (randomly choose one parent's species for now)
      const offspringSpecies = Math.random() > 0.5 ? egg.parent1Species : egg.parent2Species;
      const offspringData = offspringSpecies === egg.parent1Species ? parent1Data : parent2Data;
      
      if (!offspringData) {
        toast.error('Failed to load offspring data');
        return;
      }

      // Generate hatching text
      setHatchingText(`The egg is cracking open! A ${offspringData.name} is emerging!`);

      // Call smart contract to hatch
      await hatchEgg(
        egg.id,
        offspringSpecies,
        offspringData.name,
        offspringData.types
      );

      toast.success(`Congratulations! Your egg hatched into a ${offspringData.name}!`);
      
      // Update player stats
      const { updatePlayerStats } = await import('@/lib/firestore');
      const { useCurrentAccount } = await import('@mysten/dapp-kit');
      
      // Note: In a real implementation, we'd get the current account here
      // For now, we'll just call the success callback
      
      onHatchSuccess();
    } catch (error: any) {
      console.error('Error hatching egg:', error);
      toast.error(error.message || 'Failed to hatch egg');
      setHatchingText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Pokémon Egg</h2>
              <p className="text-purple-100 text-sm mt-1">
                {isReady ? '✨ Ready to Hatch!' : 'Incubating...'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={hatching}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Egg Visual */}
          <div className="flex justify-center mb-6">
            <div className={`text-9xl ${isReady ? 'animate-bounce' : ''}`}>
              🥚
            </div>
          </div>

          {/* Hatching Text */}
          {hatchingText && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 text-center">
              <p className="text-lg font-semibold text-gray-800">{hatchingText}</p>
            </div>
          )}

          {/* Progress */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-gray-700">Incubation Progress</span>
              <span className="text-sm text-gray-600">
                {egg.incubationSteps} / {egg.requiredSteps} steps
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  isReady ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-purple-400 to-pink-500'
                }`}
                style={{ width: `${Math.min(100, progress)}%` }}
              ></div>
            </div>
            {!isReady && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {egg.requiredSteps - egg.incubationSteps} more steps needed
              </p>
            )}
          </div>

          {/* Parent Information */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Parent Pokémon</h3>
            {loadingParents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading parent data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parent 1 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-center mb-3">
                    {parent1Data?.sprite ? (
                      <img
                        src={parent1Data.sprite}
                        alt={parent1Data.name}
                        className="w-24 h-24 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                        🎮
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-center text-gray-800 mb-2">
                    {parent1Data?.name || `#${egg.parent1Species}`}
                  </h4>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {parent1Data?.types?.map((type: string) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Parent 2 */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border-2 border-pink-200">
                  <div className="text-center mb-3">
                    {parent2Data?.sprite ? (
                      <img
                        src={parent2Data.sprite}
                        alt={parent2Data.name}
                        className="w-24 h-24 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                        🎮
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-center text-gray-800 mb-2">
                    {parent2Data?.name || `#${egg.parent2Species}`}
                  </h4>
                  <div className="flex gap-1 justify-center flex-wrap">
                    {parent2Data?.types?.map((type: string) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-pink-200 text-pink-800 rounded text-xs font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Genetics Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Genetic Information</h3>
            <p className="text-xs text-gray-600 mb-2">
              This egg contains unique genetic traits from both parents. The offspring will inherit characteristics that make it special!
            </p>
            <div className="flex gap-1 flex-wrap">
              {egg.genetics.slice(0, 8).map((gene, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono"
                >
                  {gene.toString(16).padStart(2, '0').toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* NFT Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">NFT Information</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Token ID:</span>
                <span className="font-mono">{egg.id.slice(0, 8)}...{egg.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="font-mono">{egg.owner.slice(0, 8)}...{egg.owner.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(egg.createdTimestamp * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            disabled={hatching}
          >
            Close
          </button>
          {isReady && (
            <button
              onClick={handleHatch}
              disabled={hatching}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {hatching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Hatching...
                </>
              ) : (
                <>
                  <span>🐣</span>
                  Hatch Egg
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
