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
  sprite: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface PokemonNFT {
  id: string;
  speciesId: number;
  name: string;
  level: number;
  experience: number;
  stats: PokemonStats;
  types: string[];
  owner: string;
  mintTimestamp: number;
}

export interface EggNFT {
  id: string;
  parent1Species: number;
  parent2Species: number;
  incubationSteps: number;
  requiredSteps: number;
  genetics: number[];
  owner: string;
  createdTimestamp: number;
}

export interface BattleEvent {
  turn: number;
  attacker: string;
  defender: string;
  move: string;
  damage: number;
  effectiveness: number;
  commentary: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  expiresAt: Date;
}

export interface QuestObjective {
  type: 'battle' | 'capture' | 'hatch' | 'trade';
  target: number;
  current: number;
  description: string;
}

export interface QuestReward {
  type: 'tokens' | 'pokemon' | 'egg';
  amount?: number;
  pokemonId?: number;
}

export interface MarketplaceListing {
  id: string;
  listingId: string;
  nftId: string;
  nftType: 'pokemon' | 'egg';
  sellerAddress: string;
  price: number;
  nftMetadata: {
    species?: string;
    level?: number;
    stats?: PokemonStats;
    incubationProgress?: number;
    parentSpecies?: string[];
  };
  listedAt: Date;
  status: 'active' | 'sold' | 'cancelled';
  soldAt?: Date;
  buyerAddress?: string;
}
