/**
 * React hooks for quest management
 */
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { useWalletStore } from '@/store/walletStore';
import { questApi } from '@/lib/api';

export interface QuestObjective {
  type: 'battle' | 'capture' | 'hatch' | 'trade';
  target: number;
  current: number;
  description: string;
}

export interface QuestReward {
  type: 'tokens' | 'pokemon' | 'egg';
  amount?: number;
  pokemon_id?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  expires_at: string;
  completed?: boolean;
  playerId?: string;
}

export interface DailyChallenge {
  id: string;
  description: string;
  progress: number;
  target: number;
  reward: QuestReward;
  completed?: boolean;
}

/**
 * Hook for fetching active quests
 */
export function useActiveQuests() {
  const walletAddress = useWalletStore((state) => state.address);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!walletAddress) return;
    
    const fetchQuests = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'quests'),
          where('playerId', '==', walletAddress),
          where('completed', '==', false)
        );
        
        const snapshot = await getDocs(q);
        const questData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            objectives: data.objectives,
            rewards: data.rewards,
            expires_at: data.expires_at,
            completed: data.completed,
            playerId: data.playerId,
          } as Quest;
        });
        
        setQuests(questData);
      } catch (error) {
        console.error('Failed to fetch quests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuests();
  }, [walletAddress]);
  
  return { quests, isLoading };
}

/**
 * Hook for updating quest progress
 */
export function useUpdateQuestProgress() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateProgress = async (
    questId: string,
    objectiveIndex: number,
    increment: number = 1
  ): Promise<void> => {
    setIsUpdating(true);
    
    try {
      const questRef = doc(db, 'quests', questId);
      
      // Fetch current quest data
      const questDoc = await getDocs(query(collection(db, 'quests'), where('__name__', '==', questId)));
      
      if (questDoc.empty) {
        throw new Error('Quest not found');
      }
      
      const questData = questDoc.docs[0].data();
      const objectives = questData.objectives || [];
      
      if (objectiveIndex >= objectives.length) {
        throw new Error('Invalid objective index');
      }
      
      // Update objective progress
      objectives[objectiveIndex].current = Math.min(
        objectives[objectiveIndex].current + increment,
        objectives[objectiveIndex].target
      );
      
      // Check if quest is completed
      const allCompleted = objectives.every(
        (obj: QuestObjective) => obj.current >= obj.target
      );
      
      // Update Firestore
      await updateDoc(questRef, {
        objectives,
        completed: allCompleted,
      });
      
      console.log(`Quest ${questId} progress updated`);
    } catch (error) {
      console.error('Failed to update quest progress:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateProgress, isUpdating };
}

/**
 * Hook for generating a new quest
 */
export function useGenerateQuest() {
  const walletAddress = useWalletStore((state) => state.address);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateQuest = async (playerTeam: any[], playerLevel: number = 1): Promise<Quest | null> => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return null;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Generate quest via API
      const quest = await questApi.generateQuest(playerTeam, playerLevel);
      
      // Save to Firestore
      const questRef = doc(db, 'quests', quest.id);
      await setDoc(questRef, {
        ...quest,
        playerId: walletAddress,
        completed: false,
        createdAt: serverTimestamp(),
      });
      
      console.log('Quest generated and saved:', quest.id);
      return quest;
    } catch (err: any) {
      console.error('Failed to generate quest:', err);
      setError(err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  return { generateQuest, isGenerating, error };
}

/**
 * Hook for fetching daily challenges
 */
export function useDailyChallenges() {
  const walletAddress = useWalletStore((state) => state.address);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastReset, setLastReset] = useState<Date | null>(null);
  
  const fetchChallenges = async (playerLevel: number = 1) => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    
    try {
      // Check if we need to generate new challenges (24 hour reset)
      const gameStateRef = doc(db, 'gameState', walletAddress);
      const gameStateSnap = await getDocs(
        query(collection(db, 'gameState'), where('__name__', '==', walletAddress))
      );
      
      let shouldGenerate = true;
      let existingChallenges: DailyChallenge[] = [];
      
      if (!gameStateSnap.empty) {
        const gameState = gameStateSnap.docs[0].data();
        const lastDaily = gameState.lastDailyReset?.toDate();
        
        if (lastDaily) {
          const hoursSinceReset = (Date.now() - lastDaily.getTime()) / (1000 * 60 * 60);
          shouldGenerate = hoursSinceReset >= 24;
          setLastReset(lastDaily);
          
          if (!shouldGenerate && gameState.dailyChallenges) {
            existingChallenges = gameState.dailyChallenges;
          }
        }
      }
      
      if (shouldGenerate) {
        // Generate new challenges
        const newChallenges = await questApi.getDailyChallenges(playerLevel);
        
        // Save to Firestore
        await setDoc(gameStateRef, {
          playerId: walletAddress,
          dailyChallenges: newChallenges,
          lastDailyReset: serverTimestamp(),
        }, { merge: true });
        
        setChallenges(newChallenges);
        setLastReset(new Date());
      } else {
        setChallenges(existingChallenges);
      }
    } catch (error) {
      console.error('Failed to fetch daily challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { challenges, isLoading, lastReset, fetchChallenges };
}

/**
 * Hook for updating challenge progress
 */
export function useUpdateChallengeProgress() {
  const walletAddress = useWalletStore((state) => state.address);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateProgress = async (
    challengeId: string,
    increment: number = 1
  ): Promise<boolean> => {
    if (!walletAddress) return false;
    
    setIsUpdating(true);
    
    try {
      // Fetch current game state
      const gameStateRef = doc(db, 'gameState', walletAddress);
      const gameStateSnap = await getDocs(
        query(collection(db, 'gameState'), where('__name__', '==', walletAddress))
      );
      
      if (gameStateSnap.empty) {
        throw new Error('Game state not found');
      }
      
      const gameState = gameStateSnap.docs[0].data();
      const challenges = gameState.dailyChallenges || [];
      
      // Find and update the challenge
      const challengeIndex = challenges.findIndex((c: DailyChallenge) => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Update progress via API
      const result = await questApi.updateChallengeProgress(challenge, increment);
      
      // Update in Firestore
      challenges[challengeIndex] = result.challenge;
      
      await updateDoc(gameStateRef, {
        dailyChallenges: challenges,
      });
      
      console.log(`Challenge ${challengeId} progress updated`);
      return result.completed;
    } catch (error) {
      console.error('Failed to update challenge progress:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateProgress, isUpdating };
}

/**
 * Award quest progress for battle wins
 */
export async function awardBattleQuestProgress(walletAddress: string): Promise<void> {
  try {
    // Fetch active battle quests
    const q = query(
      collection(db, 'quests'),
      where('playerId', '==', walletAddress),
      where('completed', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    for (const questDoc of snapshot.docs) {
      const questData = questDoc.data();
      const objectives = questData.objectives || [];
      
      // Find battle objectives
      objectives.forEach(async (objective: QuestObjective, index: number) => {
        if (objective.type === 'battle' && objective.current < objective.target) {
          // Increment progress
          objective.current = Math.min(objective.current + 1, objective.target);
          
          // Check if all objectives completed
          const allCompleted = objectives.every(
            (obj: QuestObjective) => obj.current >= obj.target
          );
          
          // Update Firestore
          await updateDoc(doc(db, 'quests', questDoc.id), {
            objectives,
            completed: allCompleted,
          });
          
          console.log(`Battle quest progress updated: ${questDoc.id}`);
        }
      });
    }
    
    // Also update daily challenges for battles
    const gameStateRef = doc(db, 'gameState', walletAddress);
    const gameStateSnap = await getDocs(
      query(collection(db, 'gameState'), where('__name__', '==', walletAddress))
    );
    
    if (!gameStateSnap.empty) {
      const gameState = gameStateSnap.docs[0].data();
      const challenges = gameState.dailyChallenges || [];
      
      // Update battle challenges
      for (let i = 0; i < challenges.length; i++) {
        const challenge = challenges[i];
        if (challenge.description.toLowerCase().includes('battle') && 
            challenge.progress < challenge.target) {
          challenge.progress = Math.min(challenge.progress + 1, challenge.target);
          challenge.completed = challenge.progress >= challenge.target;
        }
      }
      
      await updateDoc(gameStateRef, {
        dailyChallenges: challenges,
      });
    }
  } catch (error) {
    console.error('Failed to award battle quest progress:', error);
  }
}

/**
 * Award quest progress for captures
 */
export async function awardCaptureQuestProgress(walletAddress: string): Promise<void> {
  try {
    // Update quests
    const q = query(
      collection(db, 'quests'),
      where('playerId', '==', walletAddress),
      where('completed', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    for (const questDoc of snapshot.docs) {
      const questData = questDoc.data();
      const objectives = questData.objectives || [];
      
      objectives.forEach(async (objective: QuestObjective) => {
        if (objective.type === 'capture' && objective.current < objective.target) {
          objective.current = Math.min(objective.current + 1, objective.target);
          
          const allCompleted = objectives.every(
            (obj: QuestObjective) => obj.current >= obj.target
          );
          
          await updateDoc(doc(db, 'quests', questDoc.id), {
            objectives,
            completed: allCompleted,
          });
        }
      });
    }
    
    // Update daily challenges
    const gameStateRef = doc(db, 'gameState', walletAddress);
    const gameStateSnap = await getDocs(
      query(collection(db, 'gameState'), where('__name__', '==', walletAddress))
    );
    
    if (!gameStateSnap.empty) {
      const gameState = gameStateSnap.docs[0].data();
      const challenges = gameState.dailyChallenges || [];
      
      for (let i = 0; i < challenges.length; i++) {
        const challenge = challenges[i];
        if (challenge.description.toLowerCase().includes('capture') && 
            challenge.progress < challenge.target) {
          challenge.progress = Math.min(challenge.progress + 1, challenge.target);
          challenge.completed = challenge.progress >= challenge.target;
        }
      }
      
      await updateDoc(gameStateRef, {
        dailyChallenges: challenges,
      });
    }
  } catch (error) {
    console.error('Failed to award capture quest progress:', error);
  }
}

/**
 * Award quest progress for hatching eggs
 */
export async function awardHatchQuestProgress(walletAddress: string): Promise<void> {
  try {
    // Update quests
    const q = query(
      collection(db, 'quests'),
      where('playerId', '==', walletAddress),
      where('completed', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    for (const questDoc of snapshot.docs) {
      const questData = questDoc.data();
      const objectives = questData.objectives || [];
      
      objectives.forEach(async (objective: QuestObjective) => {
        if (objective.type === 'hatch' && objective.current < objective.target) {
          objective.current = Math.min(objective.current + 1, objective.target);
          
          const allCompleted = objectives.every(
            (obj: QuestObjective) => obj.current >= obj.target
          );
          
          await updateDoc(doc(db, 'quests', questDoc.id), {
            objectives,
            completed: allCompleted,
          });
        }
      });
    }
    
    // Update daily challenges
    const gameStateRef = doc(db, 'gameState', walletAddress);
    const gameStateSnap = await getDocs(
      query(collection(db, 'gameState'), where('__name__', '==', walletAddress))
    );
    
    if (!gameStateSnap.empty) {
      const gameState = gameStateSnap.docs[0].data();
      const challenges = gameState.dailyChallenges || [];
      
      for (let i = 0; i < challenges.length; i++) {
        const challenge = challenges[i];
        if (challenge.description.toLowerCase().includes('hatch') && 
            challenge.progress < challenge.target) {
          challenge.progress = Math.min(challenge.progress + 1, challenge.target);
          challenge.completed = challenge.progress >= challenge.target;
        }
      }
      
      await updateDoc(gameStateRef, {
        dailyChallenges: challenges,
      });
    }
  } catch (error) {
    console.error('Failed to award hatch quest progress:', error);
  }
}
