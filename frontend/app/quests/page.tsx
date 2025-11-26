'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  useActiveQuests, 
  useDailyChallenges, 
  useGenerateQuest,
  Quest,
  DailyChallenge 
} from '@/hooks/useQuests';
import { usePlayerPokemon } from '@/hooks/usePlayerPokemon';
import { toast } from 'sonner';

export default function QuestsPage() {
  const account = useCurrentAccount();
  const { quests, isLoading: questsLoading } = useActiveQuests();
  const { challenges, isLoading: challengesLoading, lastReset, fetchChallenges } = useDailyChallenges();
  const { generateQuest, isGenerating } = useGenerateQuest();
  const { pokemon } = usePlayerPokemon(account?.address);
  const [selectedTab, setSelectedTab] = useState<'quests' | 'challenges'>('quests');

  useEffect(() => {
    if (account?.address) {
      fetchChallenges(1); // TODO: Get actual player level
    }
  }, [account]);

  const handleGenerateQuest = async () => {
    if (!pokemon || pokemon.length === 0) {
      toast.error('You need at least one Pokémon to generate a quest');
      return;
    }

    const playerTeam = pokemon.map((p: any) => ({
      name: p.name,
      types: p.types,
      level: p.level || 1,
    }));

    const quest = await generateQuest(playerTeam, 1);
    
    if (quest) {
      toast.success('New quest generated!');
    } else {
      toast.error('Failed to generate quest');
    }
  };

  const getRewardDisplay = (reward: any) => {
    if (reward.type === 'tokens') {
      return `${reward.amount} Tokens`;
    } else if (reward.type === 'pokemon') {
      return `Rare Pokémon (ID: ${reward.pokemon_id})`;
    } else if (reward.type === 'egg') {
      return 'Egg NFT';
    }
    return 'Unknown Reward';
  };

  const getTimeUntilReset = () => {
    if (!lastReset) return '24:00:00';
    
    const now = new Date();
    const resetTime = new Date(lastReset);
    resetTime.setHours(resetTime.getHours() + 24);
    
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!account) {
    return (
      <div className="pokemon-page">
        <div className="pokemon-container flex items-center justify-center min-h-[80vh]">
          <div className="pokemon-card text-center p-12 max-w-md">
            <div className="text-8xl mb-6">🔒</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 text-lg">Please connect your wallet to view quests and challenges</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pokemon-page">
      <div className="pokemon-container">
        {/* Header */}
        <div className="pokemon-card fade-in mb-8">
          <div className="text-center">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-3">
              🎯 Quests & Challenges
            </h1>
            <p className="text-gray-600 text-lg">Complete quests and daily challenges to earn amazing rewards!</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('quests')}
            className={`px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
              selectedTab === 'quests'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
            }`}
          >
            🗺️ Active Quests ({quests.length})
          </button>
          <button
            onClick={() => setSelectedTab('challenges')}
            className={`px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
              selectedTab === 'challenges'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
            }`}
          >
            ⚡ Daily Challenges ({challenges.length})
          </button>
        </div>

        {/* Quests Tab */}
        {selectedTab === 'quests' && (
          <div>
            {/* Generate Quest Button */}
            <div className="mb-6">
              <button
                onClick={handleGenerateQuest}
                disabled={isGenerating || questsLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-black shadow-xl hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
              >
                {isGenerating ? '⏳ Generating...' : '✨ Generate New Quest'}
              </button>
            </div>

            {/* Quests List */}
            {questsLoading ? (
              <div className="pokemon-card text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-semibold">Loading quests...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="pokemon-card p-12 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-600 mb-4 text-xl font-bold">No active quests</p>
                <p className="text-gray-500">Generate a new quest to get started!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {quests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} getRewardDisplay={getRewardDisplay} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Daily Challenges Tab */}
        {selectedTab === 'challenges' && (
          <div>
            {/* Reset Timer */}
            <div className="pokemon-card p-6 mb-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
              <div>
                <h3 className="font-black text-gray-800 text-lg flex items-center gap-2">
                  <span>⏰</span>
                  <span>Daily Reset</span>
                </h3>
                <p className="text-sm text-gray-600 font-semibold">New challenges available in:</p>
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {getTimeUntilReset()}
              </div>
            </div>

            {/* Challenges List */}
            {challengesLoading ? (
              <div className="pokemon-card text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-semibold">Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="pokemon-card p-12 text-center">
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-gray-600 text-xl font-bold">No daily challenges available</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge} 
                    getRewardDisplay={getRewardDisplay} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestCard({ quest, getRewardDisplay }: { quest: Quest; getRewardDisplay: (reward: any) => string }) {
  const expiresAt = new Date(quest.expires_at);
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="pokemon-card p-6 hover:shadow-2xl transition-all transform hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-gray-800 mb-2 flex items-center gap-2">
            <span>🎯</span>
            <span>{quest.title}</span>
          </h3>
          <p className="text-gray-600 font-medium">{quest.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-sm text-gray-500 font-semibold">Expires in</div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
            {daysLeft} days
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
        <h4 className="font-black text-gray-700 mb-3 flex items-center gap-2">
          <span>📋</span>
          <span>Objectives:</span>
        </h4>
        {quest.objectives.map((objective, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 capitalize font-bold">✓ {objective.type}</span>
              <span className="text-sm font-black text-blue-600">
                {objective.current} / {objective.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-gray-300">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                style={{ width: `${(objective.current / objective.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Rewards */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-semibold">🎁 Reward:</span>
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 text-lg">
            {getRewardDisplay(quest.rewards)}
          </span>
        </div>
        {quest.completed && (
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg">
            ✓ Completed
          </span>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, getRewardDisplay }: { challenge: DailyChallenge; getRewardDisplay: (reward: any) => string }) {
  const isCompleted = challenge.progress >= challenge.target;

  return (
    <div className={`pokemon-card p-5 transition-all transform hover:scale-105 ${
      isCompleted ? 'border-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-800 font-bold text-lg flex-1">{challenge.description}</p>
        {isCompleted && (
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg ml-4">
            ✓ Complete
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 font-bold">📊 Progress</span>
          <span className="text-sm font-black text-purple-600">
            {challenge.progress} / {challenge.target}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-gray-300">
          <div
            className={`h-full rounded-full transition-all ${
              isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
          />
        </div>
      </div>

      {/* Reward */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
        <span className="text-gray-500 font-semibold">🎁 Reward:</span>
        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-lg">
          {getRewardDisplay(challenge.reward)}
        </span>
      </div>
    </div>
  );
}
