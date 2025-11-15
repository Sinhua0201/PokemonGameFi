'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WalletGuard } from '@/components/WalletGuard';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';
import { usePlayerEggs, useBreedPokemon } from '@/hooks/useBreeding';
import { ParentSelection } from '@/components/ParentSelection';
import { EggIncubationDashboard } from '@/components/EggIncubationDashboard';
import { PokemonData } from '@/lib/api';
import { toast } from 'sonner';
import { MAX_INCUBATING_EGGS } from '@/config/constants';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { awardHatchQuestProgress } from '@/hooks/useQuests';

export default function BreedingPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { pokemon, loading: loadingPokemon } = usePlayerPokemonNFT();
  const { eggs, isLoading: loadingEggs, refetch: refetchEggs } = usePlayerEggs();
  const { breedPokemon, isLoading: breeding } = useBreedPokemon();
  
  const [selectedParent1, setSelectedParent1] = useState<any | null>(null);
  const [selectedParent2, setSelectedParent2] = useState<any | null>(null);
  const [parent1Data, setParent1Data] = useState<PokemonData | null>(null);
  const [parent2Data, setParent2Data] = useState<PokemonData | null>(null);
  const [showBreedConfirm, setShowBreedConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'breed' | 'incubate'>('breed');

  // Convert blockchain Pokemon to NFT format for ParentSelection component
  const pokemonNFTs = pokemon.map((poke: any) => ({
    data: {
      objectId: poke.id,
      content: {
        fields: {
          species_id: poke.speciesId || poke.species_id,
          name: poke.name,
          level: poke.level,
          experience: poke.experience,
          stats: {
            fields: {
              hp: poke.stats?.hp || poke.maxHp,
              attack: poke.stats?.attack || poke.attack,
              defense: poke.stats?.defense || poke.defense,
              speed: poke.stats?.speed || poke.speed,
            }
          },
          types: poke.types,
          owner: poke.owner,
          mint_timestamp: poke.mintTimestamp,
        }
      }
    }
  }));

  const handleParentsSelected = (
    parent1: any,
    parent2: any,
    parent1PokemonData: PokemonData,
    parent2PokemonData: PokemonData
  ) => {
    setSelectedParent1(parent1);
    setSelectedParent2(parent2);
    setParent1Data(parent1PokemonData);
    setParent2Data(parent2PokemonData);
    setShowBreedConfirm(true);
  };

  const handleBreed = async () => {
    if (!selectedParent1 || !selectedParent2 || !parent1Data || !parent2Data) {
      toast.error('Please select two Pokémon');
      return;
    }

    if (eggs.length >= MAX_INCUBATING_EGGS) {
      toast.error(`You can only incubate ${MAX_INCUBATING_EGGS} eggs at a time`);
      return;
    }

    try {
      toast.loading('Creating egg on blockchain...', { id: 'breed' });

      const parent1Content = selectedParent1.data?.content?.fields || {};
      const parent2Content = selectedParent2.data?.content?.fields || {};
      const parent1SpeciesId = parseInt(parent1Content.species_id || '0');
      const parent2SpeciesId = parseInt(parent2Content.species_id || '0');

      await breedPokemon(
        selectedParent1.data?.objectId,
        selectedParent2.data?.objectId,
        parent1SpeciesId,
        parent2SpeciesId
      );

      toast.success('Egg NFT created successfully!', { id: 'breed' });

      // Update Firestore stats
      if (account?.address) {
        try {
          await updateDoc(doc(db, 'players', account.address), {
            lastActive: serverTimestamp(),
          });
        } catch (error) {
          console.error('Failed to update Firestore:', error);
        }
      }

      // Reset selection
      setSelectedParent1(null);
      setSelectedParent2(null);
      setParent1Data(null);
      setParent2Data(null);
      setShowBreedConfirm(false);

      // Refresh eggs
      setTimeout(() => {
        refetchEggs();
        setActiveTab('incubate');
      }, 2000);

    } catch (error) {
      console.error('Failed to breed Pokémon:', error);
      toast.error('Failed to create egg. Please try again.', { id: 'breed' });
    }
  };

  const handleEggHatched = async () => {
    // Update Firestore stats
    if (account?.address) {
      try {
        await updateDoc(doc(db, 'players', account.address), {
          'stats.eggsHatched': increment(1),
          'stats.pokemonCaught': increment(1),
          lastActive: serverTimestamp(),
        });
        
        // Award quest progress for hatching
        await awardHatchQuestProgress(account.address);
      } catch (error) {
        console.error('Failed to update Firestore:', error);
      }
    }

    // Refresh eggs
    setTimeout(() => {
      refetchEggs();
      // Pokemon will auto-refresh on next page load
    }, 2000);
  };

  if (loadingPokemon || loadingEggs) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-white text-lg">Loading breeding system...</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🥚 Breeding & Incubation
            </h1>
            <p className="text-gray-300">
              Breed your Pokémon to create eggs and hatch new creatures
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              ← Back to Home
            </button>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('breed')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${activeTab === 'breed'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              Breed Pokémon
            </button>
            <button
              onClick={() => setActiveTab('incubate')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all relative
                ${activeTab === 'incubate'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              Incubating Eggs
              {eggs.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {eggs.length}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
            {activeTab === 'breed' ? (
              <>
                <ParentSelection
                  pokemonNFTs={pokemonNFTs}
                  onParentsSelected={handleParentsSelected}
                  isLoading={breeding}
                />

                {/* Breed Confirmation */}
                {showBreedConfirm && parent1Data && parent2Data && (
                  <div className="mt-8 p-6 bg-purple-900/30 rounded-lg border-2 border-purple-500">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      Ready to Breed?
                    </h3>
                    <div className="flex justify-center items-center gap-4 mb-6">
                      <div className="text-center">
                        <img
                          src={parent1Data.sprite}
                          alt={parent1Data.name}
                          className="pixelated w-24 h-24 mx-auto mb-2"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="text-white font-semibold">{parent1Data.name}</p>
                      </div>
                      <div className="text-4xl text-purple-400">+</div>
                      <div className="text-center">
                        <img
                          src={parent2Data.sprite}
                          alt={parent2Data.name}
                          className="pixelated w-24 h-24 mx-auto mb-2"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="text-white font-semibold">{parent2Data.name}</p>
                      </div>
                      <div className="text-4xl text-purple-400">=</div>
                      <div className="text-6xl">🥚</div>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setShowBreedConfirm(false);
                          setSelectedParent1(null);
                          setSelectedParent2(null);
                          setParent1Data(null);
                          setParent2Data(null);
                        }}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                        disabled={breeding}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBreed}
                        disabled={breeding || eggs.length >= MAX_INCUBATING_EGGS}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {breeding ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Creating Egg...
                          </span>
                        ) : eggs.length >= MAX_INCUBATING_EGGS ? (
                          'Max Eggs Reached'
                        ) : (
                          'Breed Pokémon'
                        )}
                      </button>
                    </div>
                    {eggs.length >= MAX_INCUBATING_EGGS && (
                      <p className="text-center text-red-400 text-sm mt-4">
                        You can only incubate {MAX_INCUBATING_EGGS} eggs at a time. Hatch an egg first!
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <EggIncubationDashboard
                eggs={eggs}
                onEggHatched={handleEggHatched}
              />
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-900/30 rounded-lg p-6 border border-blue-500">
            <h3 className="text-lg font-bold text-white mb-2">ℹ️ How Breeding Works</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Select any two Pokémon from your collection to breed</li>
              <li>• Breeding creates an Egg NFT with genetics from both parents</li>
              <li>• Breeding creates an Egg NFT on the blockchain</li>
              <li>• Eggs require only 10 incubation steps to hatch (very easy!)</li>
              <li>• Win 1 battle to gain +10 steps and hatch immediately!</li>
              <li>• Hatched Pokémon are minted as NFTs on the blockchain</li>
              <li>• You can incubate up to {MAX_INCUBATING_EGGS} eggs simultaneously</li>
              <li>• Hatched Pokémon inherit traits from their parents</li>
            </ul>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
