import { create } from 'zustand';
import { PokemonData, PokemonStats } from '@/types/pokemon';

export interface BattlePokemon {
  id: number;
  name: string;
  level: number;
  types: string[];
  stats: PokemonStats;
  sprite: string;
  backSprite?: string;
  currentHp: number;
  maxHp: number;
  experience?: number;
}

export interface BattleMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
}

export interface BattleEvent {
  turn: number;
  attacker: string;
  defender: string;
  move: string;
  damage: number;
  effectiveness: number;
  critical: boolean;
  commentary?: string;
}

export type BattlePhase = 'selecting' | 'animating' | 'commentary' | 'ended';

interface BattleState {
  // Battle participants
  playerPokemon: BattlePokemon | null;
  opponentPokemon: BattlePokemon | null;
  
  // Battle state
  turn: number;
  phase: BattlePhase;
  events: BattleEvent[];
  commentary: string[];
  winner: 'player' | 'opponent' | null;
  
  // UI state
  isLoading: boolean;
  selectedMove: BattleMove | null;
  
  // Actions
  initBattle: (player: BattlePokemon, opponent: BattlePokemon) => void;
  selectMove: (move: BattleMove) => void;
  executeTurn: (playerMove: BattleMove, opponentMove: BattleMove) => Promise<void>;
  updateHp: (target: 'player' | 'opponent', newHp: number) => void;
  addEvent: (event: BattleEvent) => void;
  addCommentary: (text: string) => void;
  setPhase: (phase: BattlePhase) => void;
  endBattle: (winner: 'player' | 'opponent') => void;
  reset: () => void;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  // Initial state
  playerPokemon: null,
  opponentPokemon: null,
  turn: 1,
  phase: 'selecting',
  events: [],
  commentary: [],
  winner: null,
  isLoading: false,
  selectedMove: null,
  
  // Initialize battle
  initBattle: (player, opponent) => {
    set({
      playerPokemon: player,
      opponentPokemon: opponent,
      turn: 1,
      phase: 'selecting',
      events: [],
      commentary: [],
      winner: null,
      isLoading: false,
      selectedMove: null,
    });
  },
  
  // Select move
  selectMove: (move) => {
    set({ selectedMove: move });
  },
  
  // Execute turn
  executeTurn: async (playerMove, opponentMove) => {
    const state = get();
    if (!state.playerPokemon || !state.opponentPokemon) return;
    
    set({ isLoading: true, phase: 'animating' });
    
    // Determine turn order based on speed
    const playerSpeed = state.playerPokemon.stats.speed;
    const opponentSpeed = state.opponentPokemon.stats.speed;
    
    const playerFirst = playerSpeed >= opponentSpeed;
    
    // This will be handled by the battle page component
    // which will call the backend API and update state
    
    set({ isLoading: false });
  },
  
  // Update HP
  updateHp: (target, newHp) => {
    set((state) => {
      if (target === 'player' && state.playerPokemon) {
        return {
          playerPokemon: {
            ...state.playerPokemon,
            currentHp: Math.max(0, newHp),
          },
        };
      } else if (target === 'opponent' && state.opponentPokemon) {
        return {
          opponentPokemon: {
            ...state.opponentPokemon,
            currentHp: Math.max(0, newHp),
          },
        };
      }
      return state;
    });
  },
  
  // Add battle event
  addEvent: (event) => {
    set((state) => ({
      events: [...state.events, event],
    }));
  },
  
  // Add commentary
  addCommentary: (text) => {
    set((state) => ({
      commentary: [...state.commentary, text],
    }));
  },
  
  // Set phase
  setPhase: (phase) => {
    set({ phase });
  },
  
  // End battle
  endBattle: (winner) => {
    set({ winner, phase: 'ended' });
  },
  
  // Reset battle
  reset: () => {
    set({
      playerPokemon: null,
      opponentPokemon: null,
      turn: 1,
      phase: 'selecting',
      events: [],
      commentary: [],
      winner: null,
      isLoading: false,
      selectedMove: null,
    });
  },
}));
