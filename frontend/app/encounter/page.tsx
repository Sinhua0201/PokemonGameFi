'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletGuard } from '@/components/WalletGuard';
import { SetupGuard } from '@/components/SetupGuard';
import { PageGuide } from '@/components/PageGuide';
import { FriendlyError } from '@/components/FriendlyError';
import { WildEncounter } from '@/components/WildEncounter';
import { useEncounter } from '@/hooks/useEncounter';
import { useCapture } from '@/hooks/useCapture';
import { useRandomPokemon } from '@/hooks/usePokemon';
import { PokemonData } from '@/lib/api';
import { toast } from 'sonner';
import { updatePlayerStats, getPlayer, createPlayer } from '@/lib/firestore';
import { awardCaptureQuestProgress } from '@/hooks/useQuests';

export default function EncounterPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { canEncounter, cooldownRemaining, isChecking, startEncounter, formatCooldown } = useEncounter();
  const { calculateCaptureRate, attemptCapture, isLoading: isCapturing } = useCapture();
  const { mutate: fetchRandomPokemon, isPending: isFetchingPokemon } = useRandomPokemon();
  
  const [encounterPokemon, setEncounterPokemon] = useState<PokemonData | null>(null);
  const [pokemonLevel, setPokemonLevel] = useState(1);
  const [captureRate, setCaptureRate] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  // Initialize encounter on mount if cooldown allows
  useEffect(() => {
    if (!isChecking && canEncounter && !encounterPokemon) {
      initiateEncounter();
    }
  }, [isChecking, canEncounter]);

  const initiateEncounter = async () => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      // Start cooldown
      const started = await startEncounter();
      if (!started) {
        toast.error('Failed to start encounter');
        return;
      }

      // Fetch random Pokémon with rarity weighting
      fetchRandomPokemon(undefined, {
        onSuccess: async (pokemon) => {
          setEncounterPokemon(pokemon);
          
          // Generate random level (1-20 for wild encounters)
          const level = Math.floor(Math.random() * 20) + 1;
          setPokemonLevel(level);

          // Calculate capture rate (assuming full health for wild encounter)
          try {
            const rate = await calculateCaptureRate(pokemon.id, 1.0);
            setCaptureRate(rate);
          } catch (error) {
            console.error('Failed to calculate capture rate:', error);
            // Use default rate based on rarity
            const defaultRates = {
              common: 0.7,
              uncommon: 0.5,
              rare: 0.3,
              legendary: 0.1,
            };
            setCaptureRate(defaultRates[pokemon.rarity]);
          }
        },
        onError: (error) => {
          console.error('Failed to fetch Pokémon:', error);
          toast.error('Failed to generate encounter');
          router.push('/');
        },
      });
    } catch (error) {
      console.error('Error initiating encounter:', error);
      toast.error('Failed to start encounter');
    }
  };

  const handleCapture = async () => {
    if (!encounterPokemon || !account?.address) return;

    try {
      // Store wallet address in window for useCapture hook
      (window as any).__WALLET_ADDRESS__ = account.address;
      
      toast.loading('Attempting to capture...', { id: 'capture' });

      const result = await attemptCapture(
        {
          speciesId: encounterPokemon.id,
          name: encounterPokemon.name,
          level: pokemonLevel,
          types: encounterPokemon.types || ['normal'],
        },
        captureRate
      );

      if (result.success) {
        setCaptureSuccess(true);
        toast.success(`${encounterPokemon.name} was captured!`, { id: 'capture' });

        // Update player stats in Firestore
        try {
          let player = await getPlayer(account.address);
          if (!player) {
            player = await createPlayer(account.address);
          }

          const newStats = {
            ...player.stats,
            pokemonCaught: (player.stats?.pokemonCaught || 0) + 1,
          };

          await updatePlayerStats(account.address, newStats);
          
          // Award quest progress for capture
          await awardCaptureQuestProgress(account.address);
        } catch (firestoreError) {
          console.error('Failed to update player stats:', firestoreError);
        }
      } else {
        setCaptureSuccess(false);
        toast.error(`${encounterPokemon.name} broke free!`, { id: 'capture' });
      }

      setShowResult(true);
    } catch (error) {
      console.error('Capture failed:', error);
      toast.error('Failed to capture Pokémon', { id: 'capture' });
    }
  };

  const handleFlee = () => {
    toast.info('You fled from the encounter');
    router.push('/');
  };

  const handleContinue = () => {
    if (captureSuccess) {
      router.push('/');
    } else {
      // Failed capture - can try again or flee
      setShowResult(false);
    }
  };

  // Loading state
  if (isChecking || isFetchingPokemon) {
    return (
      <WalletGuard>
        <SetupGuard>
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
              <p className="text-white text-lg">
                {isFetchingPokemon ? 'Searching for Pokémon...' : 'Loading...'}
              </p>
            </div>
          </div>
        </SetupGuard>
      </WalletGuard>
    );
  }

  // Cooldown state
  if (!canEncounter && !encounterPokemon) {
    return (
      <WalletGuard>
        <SetupGuard>
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="text-center max-w-md">
              <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Encounter Cooldown
                </h2>
                <p className="text-gray-300 mb-6">
                  You need to wait before encountering another wild Pokémon.
                </p>
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <div className="text-4xl font-bold text-purple-400">
                    {formatCooldown(cooldownRemaining)}
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    Time remaining
                  </div>
                </div>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </SetupGuard>
      </WalletGuard>
    );
  }

  // Result modal
  if (showResult && encounterPokemon) {
    return (
      <WalletGuard>
        <SetupGuard>
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
            {captureSuccess ? (
              <>
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-4">
                  Success!
                </h2>
                <p className="text-gray-200 text-lg mb-6">
                  You successfully captured <span className="font-bold text-white">{encounterPokemon.name}</span>!
                </p>
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <img
                    src={encounterPokemon.sprite}
                    alt={encounterPokemon.name}
                    className="w-32 h-32 mx-auto pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <button
                  onClick={handleContinue}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-3xl font-bold text-red-400 mb-4">
                  Oh no!
                </h2>
                <p className="text-gray-200 text-lg mb-6">
                  <span className="font-bold text-white">{encounterPokemon.name}</span> broke free from the capture!
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleContinue}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleFlee}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Flee
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </SetupGuard>
      </WalletGuard>
    );
  }

  // Main encounter view
  return (
    <WalletGuard>
      <SetupGuard>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <PageGuide
              title="野外遭遇"
              description="在这里你可以遇到随机的野生宝可梦并尝试捕捉它们"
              tips={[
                '每次遭遇有 5 分钟冷却时间',
                '宝可梦血量越低，捕捉率越高',
                '捕捉成功后会获得经验和奖励'
              ]}
              storageKey="encounter-guide"
            />
          </div>
        {encounterPokemon ? (
          <WildEncounter
            pokemon={encounterPokemon}
            level={pokemonLevel}
            captureRate={captureRate}
            onCapture={handleCapture}
            onFlee={handleFlee}
            isCapturing={isCapturing}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
              <p className="text-white text-lg">Generating encounter...</p>
            </div>
          </div>
        )}
      </div>
      </SetupGuard>
    </WalletGuard>
  );
}
