/**
 * API Client for backend communication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  stats: PokemonStats;
  sprite: string;  // Front sprite (animated GIF if available)
  back_sprite?: string;  // Back sprite for battles
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface CaptureAttempt {
  pokemon_id: number;
  health_percent: number;
  rarity: string;
}

export interface CaptureResult {
  success: boolean;
  capture_rate: number;
  message: string;
}

/**
 * Pokémon API
 */
export const pokemonApi = {
  /**
   * Get Pokémon by ID
   */
  async getPokemon(id: number): Promise<PokemonData> {
    const response = await fetch(`${API_URL}/api/pokemon/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Pokémon');
    }
    return response.json();
  },

  /**
   * Get random Pokémon with optional rarity filter
   */
  async getRandomPokemon(rarity?: string): Promise<PokemonData> {
    const url = rarity 
      ? `${API_URL}/api/pokemon/random?rarity=${rarity}`
      : `${API_URL}/api/pokemon/random`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch random Pokémon');
    }
    return response.json();
  },

  /**
   * Get random starter Pokémon
   */
  async getRandomStarter(): Promise<PokemonData> {
    const response = await fetch(`${API_URL}/api/pokemon/starter/random`);
    if (!response.ok) {
      throw new Error('Failed to fetch starter Pokémon');
    }
    return response.json();
  },

  /**
   * Get all available starter Pokémon
   */
  async getAllStarters(): Promise<{ starters: PokemonData[] }> {
    const response = await fetch(`${API_URL}/api/pokemon/starters/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch starters');
    }
    return response.json();
  },
};

/**
 * Battle API
 */
export const battleApi = {
  /**
   * Calculate capture rate
   */
  async calculateCaptureRate(
    pokemonId: number,
    healthPercent: number
  ): Promise<{ capture_rate: number }> {
    const response = await fetch(`${API_URL}/api/battle/capture-rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pokemon_id: pokemonId,
        health_percent: healthPercent,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate capture rate');
    }
    return response.json();
  },

  /**
   * Calculate damage for a move
   */
  async calculateDamage(
    attacker: any,
    defender: any,
    move: { name: string; type: string; power: number; accuracy: number }
  ): Promise<{
    damage: number;
    effectiveness: number;
    critical: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_URL}/api/battle/calculate-damage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attacker,
        defender,
        move,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to calculate damage');
    }
    return response.json();
  },

  /**
   * Award experience points
   */
  async awardExperience(
    winnerLevel: number,
    loserLevel: number
  ): Promise<{
    experience_gained: number;
    level_up: boolean;
    new_level: number;
  }> {
    const response = await fetch(`${API_URL}/api/battle/award-xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winner_level: winnerLevel,
        loser_level: loserLevel,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to award experience');
    }
    return response.json();
  },
};

/**
 * AI API
 */
export const aiApi = {
  /**
   * Generate encounter text
   */
  async generateEncounterText(
    pokemonName: string,
    pokemonTypes: string[],
    pokemonLevel: number
  ): Promise<{ text: string }> {
    const response = await fetch(`${API_URL}/api/ai/encounter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pokemon_name: pokemonName,
        pokemon_types: pokemonTypes,
        pokemon_level: pokemonLevel,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate encounter text');
    }
    return response.json();
  },

  /**
   * Generate battle commentary
   */
  async generateCommentary(prompt: string): Promise<{ commentary: string }> {
    const response = await fetch(`${API_URL}/api/ai/commentary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate commentary');
    }
    return response.json();
  },

  /**
   * Generate quest
   */
  async generateQuest(playerLevel: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/ai/quest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_level: playerLevel }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate quest');
    }
    return response.json();
  },

  /**
   * Select AI move for battle
   */
  async selectAIMove(
    aiPokemon: any,
    playerPokemon: any,
    availableMoves: any[]
  ): Promise<{ move: any; reasoning: string }> {
    const response = await fetch(`${API_URL}/api/ai/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ai_pokemon: aiPokemon,
        player_pokemon: playerPokemon,
        available_moves: availableMoves,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to select AI move');
    }
    return response.json();
  },

  /**
   * Generate hatching reveal text
   */
  async generateHatchingText(
    pokemonName: string,
    pokemonTypes: string[]
  ): Promise<{ text: string }> {
    const response = await fetch(`${API_URL}/api/ai/hatching`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pokemon_name: pokemonName,
        pokemon_types: pokemonTypes,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate hatching text');
    }
    return response.json();
  },
};

/**
 * Quest API
 */
export const questApi = {
  /**
   * Generate a personalized quest
   */
  async generateQuest(
    playerTeam: any[],
    playerLevel: number = 1
  ): Promise<any> {
    const response = await fetch(`${API_URL}/api/quests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_team: playerTeam,
        player_level: playerLevel,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate quest');
    }
    return response.json();
  },

  /**
   * Get daily challenges
   */
  async getDailyChallenges(playerLevel: number = 1): Promise<any[]> {
    const response = await fetch(
      `${API_URL}/api/quests/daily-challenges?player_level=${playerLevel}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch daily challenges');
    }
    return response.json();
  },

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    questData: any,
    actionType: string,
    increment: number = 1
  ): Promise<{ quest: any; completed: boolean }> {
    const response = await fetch(`${API_URL}/api/quests/update-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quest_data: questData,
        action_type: actionType,
        increment,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update quest progress');
    }
    return response.json();
  },

  /**
   * Complete a quest
   */
  async completeQuest(questId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/quests/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quest_id: questId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete quest');
    }
    return response.json();
  },

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(
    challengeData: any,
    increment: number = 1
  ): Promise<{ challenge: any; completed: boolean }> {
    const response = await fetch(`${API_URL}/api/quests/challenge/update-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge_data: challengeData,
        increment,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update challenge progress');
    }
    return response.json();
  },
};

// Helper function exports for convenience
export const getPokemonData = pokemonApi.getPokemon;
export const getRandomPokemon = pokemonApi.getRandomPokemon;
export const getRandomStarter = pokemonApi.getRandomStarter;
export const getAllStarters = pokemonApi.getAllStarters;

export default {
  pokemon: pokemonApi,
  battle: battleApi,
  ai: aiApi,
  quest: questApi,
};
