'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WalletGuard } from '@/components/WalletGuard';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';
import { usePlayerEggs } from '@/hooks/useBreeding';
import { getPlayer, getPlayerBattleHistory, updatePlayerStats } from '@/lib/firestore';
import { PokemonDetailModal } from '@/components/PokemonDetailModal';
import { EggDetailModal } from '@/components/EggDetailModal';
import { PokemonNFT, EggNFT } from '@/types/pokemon';
import { toast } from 'sonner';

interface PlayerStats {
  totalBattles: number;
  wins: number;
  pokemonCaught: number;
  eggsHatched: number;
}

interface BattleHistoryEntry {
  id: string;
  opponentType: 'ai' | 'player';
  winner: 'player' | 'opponent';
  experienceGained: number;
  createdAt: any;
  playerPokemonNftId: string;
  opponentPokemonData: any;
}

export default function ProfilePage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { pokemon, loading: loadingPokemon, refetch: refetchPokemon } = usePlayerPokemonNFT();
  const { eggs, isLoading: loadingEggs, refetch: refetchEggs } = usePlayerEggs();

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalBattles: 0,
    wins: 0,
    pokemonCaught: 0,
    eggsHatched: 0,
  });
  const [username, setUsername] = useState<string>('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [battleHistory, setBattleHistory] = useState<BattleHistoryEntry[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonNFT | null>(null);
  const [selectedEgg, setSelectedEgg] = useState<EggNFT | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<'pokemon' | 'eggs' | 'history'>('pokemon');

  useEffect(() => {
    if (account?.address) {
      loadPlayerData();
    }
  }, [account?.address]);

  const loadPlayerData = async () => {
    if (!account?.address) return;

    try {
      setLoadingProfile(true);

      // Load player data from Firestore
      const playerData = await getPlayer(account.address);

      if (playerData) {
        setPlayerStats(playerData.stats || {
          totalBattles: 0,
          wins: 0,
          pokemonCaught: 0,
          eggsHatched: 0,
        });
        setUsername(playerData.username || '');
        setNewUsername(playerData.username || '');
      }

      // Load battle history
      const history = await getPlayerBattleHistory(account.address, 10);
      setBattleHistory(history as BattleHistoryEntry[]);
    } catch (error) {
      console.error('Error loading player data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!account?.address || !newUsername.trim()) {
      toast.error('Please enter a valid username');
      return;
    }

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      await updateDoc(doc(db, 'players', account.address), {
        username: newUsername.trim(),
      });

      setUsername(newUsername.trim());
      setIsEditingUsername(false);
      toast.success('Username updated successfully');
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to update username');
    }
  };

  // Parse Pokémon data from Firestore
  const parsedPokemon: PokemonNFT[] = pokemon.map((poke: any) => {
    return {
      id: poke.id || '',
      speciesId: poke.species_id || poke.speciesId || 0,
      name: poke.name || 'Unknown',
      level: poke.level || 1,
      experience: poke.experience || 0,
      stats: {
        hp: poke.maxHp || poke.stats?.hp || 35,
        attack: poke.attack || poke.stats?.attack || 50,
        defense: poke.defense || poke.stats?.defense || 50,
        speed: poke.speed || poke.stats?.speed || 50,
      },
      types: poke.types || ['normal'],
      owner: poke.owner || '',
      mintTimestamp: 0,
    };
  });

  const winRate = playerStats.totalBattles > 0
    ? ((playerStats.wins / playerStats.totalBattles) * 100).toFixed(1)
    : '0.0';

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {username ? username[0].toUpperCase() : '?'}
                </div>
                <div>
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                        maxLength={20}
                      />
                      <button
                        onClick={handleUsernameUpdate}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setNewUsername(username);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-gray-800">
                        {username || 'Trainer'}
                      </h1>
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit username"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-gray-500 text-sm font-mono">
                    {account?.address.slice(0, 8)}...{account?.address.slice(-6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{playerStats.totalBattles}</div>
                <div className="text-sm text-gray-600 mt-1">Total Battles</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{playerStats.wins}</div>
                <div className="text-sm text-gray-600 mt-1">Wins ({winRate}%)</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{playerStats.pokemonCaught}</div>
                <div className="text-sm text-gray-600 mt-1">Pokémon Caught</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-pink-600">{playerStats.eggsHatched}</div>
                <div className="text-sm text-gray-600 mt-1">Eggs Hatched</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('pokemon')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'pokemon'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Pokémon Collection ({parsedPokemon.length})
              </button>
              <button
                onClick={() => setActiveTab('eggs')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'eggs'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Eggs ({eggs.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${activeTab === 'history'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Battle History
              </button>
            </div>

            <div className="p-6">
              {/* Pokémon Collection Tab */}
              {activeTab === 'pokemon' && (
                <div>
                  {loadingPokemon ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading Pokémon...</p>
                    </div>
                  ) : parsedPokemon.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎮</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pokémon Yet</h3>
                      <p className="text-gray-500 mb-6">Start your adventure by getting a starter Pokémon!</p>
                      <button
                        onClick={() => router.push('/start-game')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Get Starter Pokémon
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {parsedPokemon.map((poke) => (
                        <div
                          key={poke.id}
                          onClick={() => setSelectedPokemon(poke)}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                        >
                          {/* Pokemon Image */}
                          <div className="flex justify-center mb-3">
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${poke.speciesId}.gif`}
                              alt={poke.name}
                              className="w-24 h-24 object-contain"
                              onError={(e) => {
                                // Fallback to static sprite if GIF fails
                                e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.speciesId}.png`;
                              }}
                            />
                          </div>

                          {/* Pokemon Name and Level */}
                          <div className="text-center mb-3">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{poke.name}</h3>
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              Lv. {poke.level}
                            </span>
                          </div>

                          {/* Types */}
                          <div className="flex gap-2 justify-center mb-3">
                            {poke.types.map((type: string, index: number) => (
                              <span
                                key={`${type}-${index}`}
                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium uppercase"
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">❤️ HP:</span>
                              <span className="font-semibold text-red-600">{poke.stats.hp}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">⚔️ Attack:</span>
                              <span className="font-semibold text-orange-600">{poke.stats.attack}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">🛡️ Defense:</span>
                              <span className="font-semibold text-blue-600">{poke.stats.defense}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">⚡ Speed:</span>
                              <span className="font-semibold text-green-600">{poke.stats.speed}</span>
                            </div>
                          </div>

                          {/* Experience Bar */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 text-center mb-1">
                              XP: {poke.experience} / {Math.pow(poke.level + 1, 3)}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, (poke.experience / Math.pow(poke.level + 1, 3)) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Eggs Tab */}
              {activeTab === 'eggs' && (
                <div>
                  {loadingEggs ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading eggs...</p>
                    </div>
                  ) : eggs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🥚</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Eggs Yet</h3>
                      <p className="text-gray-500 mb-6">Breed your Pokémon to create eggs!</p>
                      <button
                        onClick={() => router.push('/breeding')}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Go to Breeding
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eggs.map((egg) => {
                        const progress = (egg.incubationSteps / egg.requiredSteps) * 100;
                        const isReady = egg.incubationSteps >= egg.requiredSteps;

                        return (
                          <div
                            key={egg.id}
                            onClick={() => setSelectedEgg(egg)}
                            className={`bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${isReady ? 'border-green-500 hover:border-green-600' : 'border-gray-200 hover:border-purple-500'
                              }`}
                          >
                            <div className="text-center mb-4">
                              <div className="text-6xl mb-2">🥚</div>
                              {isReady && (
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                  Ready to Hatch!
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm text-gray-600">
                                Parent Species: #{egg.parent1Species} × #{egg.parent2Species}
                              </div>
                              <div className="text-sm text-gray-600">
                                Progress: {egg.incubationSteps} / {egg.requiredSteps} steps
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${isReady ? 'bg-green-500' : 'bg-purple-500'
                                    }`}
                                  style={{ width: `${Math.min(100, progress)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Battle History Tab */}
              {activeTab === 'history' && (
                <div>
                  {loadingProfile ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-4">Loading battle history...</p>
                    </div>
                  ) : battleHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⚔️</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Battles Yet</h3>
                      <p className="text-gray-500 mb-6">Start battling to build your history!</p>
                      <button
                        onClick={() => router.push('/battle')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Start Battle
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {battleHistory.map((battle) => {
                        const isWin = battle.winner === 'player';
                        const date = battle.createdAt?.toDate?.() || new Date();

                        return (
                          <div
                            key={battle.id}
                            className={`bg-gradient-to-r ${isWin ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'
                              } rounded-lg p-4 border-2 ${isWin ? 'border-green-300' : 'border-red-300'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`text-3xl ${isWin ? '🏆' : '💔'}`}>
                                  {isWin ? '🏆' : '💔'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">
                                    {isWin ? 'Victory' : 'Defeat'} vs {battle.opponentType === 'ai' ? 'AI Trainer' : 'Player'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {battle.opponentPokemonData?.species || 'Unknown Pokémon'} (Lv. {battle.opponentPokemonData?.level || '?'})
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {date.toLocaleDateString()} {date.toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                              {isWin && (
                                <div className="text-right">
                                  <div className="text-sm text-gray-600">XP Gained</div>
                                  <div className="text-2xl font-bold text-green-600">+{battle.experienceGained}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedPokemon && (
        <PokemonDetailModal
          pokemon={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      {selectedEgg && (
        <EggDetailModal
          egg={selectedEgg}
          onClose={() => setSelectedEgg(null)}
          onHatchSuccess={() => {
            setSelectedEgg(null);
            refetchEggs();
            refetchPokemon();
            loadPlayerData();
          }}
        />
      )}
    </WalletGuard>
  );
}
