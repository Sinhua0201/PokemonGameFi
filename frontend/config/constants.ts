// OneChain Configuration
export const PACKAGE_ID = process.env.NEXT_PUBLIC_ONECHAIN_PACKAGE_ID || '';
export const NETWORK = process.env.NEXT_PUBLIC_ONECHAIN_NETWORK || 'testnet';
export const MARKETPLACE_ID = process.env.NEXT_PUBLIC_MARKETPLACE_ID || '';

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Game Constants
export const STARTER_POKEMON_IDS = [1, 4, 7, 25, 133, 152, 155, 158, 175]; // Bulbasaur, Charmander, Squirtle, Pikachu, Eevee, Chikorita, Cyndaquil, Totodile, Togepi
export const ENCOUNTER_COOLDOWN_MINUTES = 5;
export const MAX_INCUBATING_EGGS = 3;
export const REQUIRED_INCUBATION_STEPS = 10; // Reduced from 1000 for easier gameplay - only 1 battle needed!
export const BATTLE_WIN_INCUBATION_STEPS = 10; // Each battle win adds 10 steps

// Rarity Weights
export const RARITY_WEIGHTS = {
  common: 0.6,
  uncommon: 0.25,
  rare: 0.12,
  legendary: 0.03,
};
