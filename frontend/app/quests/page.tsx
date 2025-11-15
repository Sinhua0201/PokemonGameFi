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
  const { pokemon } = usePlayerPokemon();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view quests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quests & Challenges</h1>
          <p className="text-gray-600">Complete quests and daily challenges to earn rewards</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTab('quests')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedTab === 'quests'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Active Quests ({quests.length})
          </button>
          <button
            onClick={() => setSelectedTab('challenges')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              selectedTab === 'challenges'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Daily Challenges ({challenges.length})
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
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate New Quest'}
              </button>
            </div>

            {/* Quests List */}
            {questsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading quests...</p>
              </div>
            ) : quests.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No active quests</p>
                <p className="text-sm text-gray-500">Generate a new quest to get started!</p>
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
            <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Daily Reset</h3>
                <p className="text-sm text-gray-600">New challenges available in:</p>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {getTimeUntilReset()}
              </div>
            </div>

            {/* Challenges List */}
            {challengesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600">No daily challenges available</p>
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
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{quest.title}</h3>
          <p className="text-gray-600">{quest.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Expires in</div>
          <div className="text-lg font-semibold text-orange-600">{daysLeft} days</div>
        </div>
      </div>

      {/* Objectives */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Objectives:</h4>
        {quest.objectives.map((objective, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 capitalize">{objective.type}</span>
              <span className="text-sm font-semibold">
                {objective.current} / {objective.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(objective.current / objective.target) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Rewards */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <span className="text-sm text-gray-500">Reward:</span>
          <span className="ml-2 font-semibold text-green-600">
            {getRewardDisplay(quest.rewards)}
          </span>
        </div>
        {quest.completed && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, getRewardDisplay }: { challenge: DailyChallenge; getRewardDisplay: (reward: any) => string }) {
  const isCompleted = challenge.progress >= challenge.target;

  return (
    <div className={`bg-white rounded-lg p-4 shadow-md ${isCompleted ? 'border-2 border-green-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-800 font-medium">{challenge.description}</p>
        {isCompleted && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            ✓ Complete
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold">
            {challenge.progress} / {challenge.target}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCompleted ? 'bg-green-600' : 'bg-purple-600'
            }`}
            style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
          />
        </div>
      </div>

      {/* Reward */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Reward:</span>
        <span className="font-semibold text-purple-600">
          {getRewardDisplay(challenge.reward)}
        </span>
      </div>
    </div>
  );
}
