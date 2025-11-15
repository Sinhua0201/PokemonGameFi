import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { PokemonData, Quest } from '@/types/pokemon';

// Collection references
export const playersCollection = collection(db, 'players');
export const gameStateCollection = collection(db, 'gameState');
export const battleHistoryCollection = collection(db, 'battleHistory');
export const marketplaceListingsCollection = collection(db, 'marketplaceListings');
export const pokemonCacheCollection = collection(db, 'pokemonCache');

// Player operations
export async function getPlayer(walletAddress: string) {
  const playerDoc = await getDoc(doc(playersCollection, walletAddress));
  return playerDoc.exists() ? playerDoc.data() : null;
}

export async function createPlayer(walletAddress: string, starterPokemonId?: number) {
  const playerData = {
    walletAddress,
    username: null,
    starterPokemonId: starterPokemonId || null,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
    stats: {
      totalBattles: 0,
      wins: 0,
      pokemonCaught: 0,
      eggsHatched: 0,
    },
  };
  
  await setDoc(doc(playersCollection, walletAddress), playerData);
  return playerData;
}

export async function updatePlayerStats(
  walletAddress: string, 
  stats: Partial<{
    totalBattles: number;
    wins: number;
    pokemonCaught: number;
    eggsHatched: number;
  }>
) {
  const playerRef = doc(playersCollection, walletAddress);
  await updateDoc(playerRef, {
    'stats': stats,
    lastActive: serverTimestamp(),
  });
}

export async function updatePlayerUsername(walletAddress: string, username: string) {
  const playerRef = doc(playersCollection, walletAddress);
  await updateDoc(playerRef, {
    username,
    lastActive: serverTimestamp(),
  });
}

// Game state operations
export async function getGameState(walletAddress: string) {
  const gameStateDoc = await getDoc(doc(gameStateCollection, walletAddress));
  return gameStateDoc.exists() ? gameStateDoc.data() : null;
}

export async function initializeGameState(walletAddress: string) {
  const gameStateData = {
    playerId: walletAddress,
    lastEncounterTime: null,
    activeQuests: [],
    dailyChallenges: [],
    lastDailyReset: serverTimestamp(),
    encounterCooldownUntil: null,
  };
  
  await setDoc(doc(gameStateCollection, walletAddress), gameStateData);
  return gameStateData;
}

export async function updateEncounterCooldown(walletAddress: string) {
  const cooldownUntil = new Date();
  cooldownUntil.setMinutes(cooldownUntil.getMinutes() + 5); // 5 minute cooldown
  
  await updateDoc(doc(gameStateCollection, walletAddress), {
    lastEncounterTime: serverTimestamp(),
    encounterCooldownUntil: Timestamp.fromDate(cooldownUntil),
  });
}

export async function checkEncounterCooldown(walletAddress: string): Promise<boolean> {
  const gameState = await getGameState(walletAddress);
  if (!gameState || !gameState.encounterCooldownUntil) {
    return true; // No cooldown, can encounter
  }
  
  const now = new Date();
  const cooldownEnd = gameState.encounterCooldownUntil.toDate();
  return now >= cooldownEnd;
}

// Battle history operations
export async function saveBattleHistory(battleData: {
  playerId: string;
  opponentType: 'ai' | 'player';
  opponentId: string | null;
  playerPokemonNftId: string;
  opponentPokemonData: any;
  winner: 'player' | 'opponent';
  experienceGained: number;
  battleLog: any[];
}) {
  const battleRef = doc(battleHistoryCollection);
  await setDoc(battleRef, {
    ...battleData,
    createdAt: serverTimestamp(),
  });
}

export async function getPlayerBattleHistory(walletAddress: string, limitCount: number = 20) {
  const q = query(
    battleHistoryCollection,
    where('playerId', '==', walletAddress),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Marketplace operations
export async function getActiveListings(filters?: {
  nftType?: 'pokemon' | 'egg';
  maxPrice?: number;
}) {
  let q = query(
    marketplaceListingsCollection,
    where('status', '==', 'active'),
    orderBy('listedAt', 'desc')
  );
  
  if (filters?.nftType) {
    q = query(q, where('nftType', '==', filters.nftType));
  }
  
  const snapshot = await getDocs(q);
  let listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
  
  if (filters?.maxPrice) {
    listings = listings.filter((listing: any) => listing.price <= filters.maxPrice!);
  }
  
  return listings;
}

export async function createMarketplaceListing(listingData: {
  listingId: string;
  nftId: string;
  nftType: 'pokemon' | 'egg';
  sellerAddress: string;
  price: number;
  nftMetadata: any;
}) {
  await setDoc(doc(marketplaceListingsCollection, listingData.listingId), {
    ...listingData,
    listedAt: serverTimestamp(),
    status: 'active',
  });
}

export async function updateListingStatus(
  listingId: string, 
  status: 'sold' | 'cancelled',
  buyerAddress?: string
) {
  const updates: any = {
    status,
  };
  
  if (status === 'sold') {
    updates.soldAt = serverTimestamp();
    if (buyerAddress) {
      updates.buyerAddress = buyerAddress;
    }
  }
  
  await updateDoc(doc(marketplaceListingsCollection, listingId), updates);
}

// Pokémon cache operations
export async function getCachedPokemon(pokemonId: number): Promise<PokemonData | null> {
  const cacheDoc = await getDoc(doc(pokemonCacheCollection, pokemonId.toString()));
  
  if (!cacheDoc.exists()) {
    return null;
  }
  
  const data = cacheDoc.data();
  const cachedAt = data.cachedAt?.toDate();
  
  // Check if cache is still valid (24 hours)
  if (cachedAt) {
    const now = new Date();
    const hoursSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCached < 24) {
      return data as PokemonData;
    }
  }
  
  return null;
}

export async function cachePokemon(pokemonData: PokemonData) {
  await setDoc(doc(pokemonCacheCollection, pokemonData.id.toString()), {
    ...pokemonData,
    cachedAt: serverTimestamp(),
  });
}

// Quest operations
export async function updateQuestProgress(
  walletAddress: string,
  questId: string,
  objectiveIndex: number,
  progress: number
) {
  const gameState = await getGameState(walletAddress);
  if (!gameState) return;
  
  const quests = gameState.activeQuests || [];
  const questIndex = quests.findIndex((q: Quest) => q.id === questId);
  
  if (questIndex !== -1) {
    quests[questIndex].objectives[objectiveIndex].current = progress;
    
    await updateDoc(doc(gameStateCollection, walletAddress), {
      activeQuests: quests,
    });
  }
}

export async function addQuest(walletAddress: string, quest: Quest) {
  const gameState = await getGameState(walletAddress);
  const quests = gameState?.activeQuests || [];
  
  quests.push(quest);
  
  await updateDoc(doc(gameStateCollection, walletAddress), {
    activeQuests: quests,
  });
}

export async function removeQuest(walletAddress: string, questId: string) {
  const gameState = await getGameState(walletAddress);
  if (!gameState) return;
  
  const quests = (gameState.activeQuests || []).filter((q: Quest) => q.id !== questId);
  
  await updateDoc(doc(gameStateCollection, walletAddress), {
    activeQuests: quests,
  });
}
