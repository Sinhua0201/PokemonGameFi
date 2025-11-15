# Design Document: PokéChain Battles

## Overview

PokéChain Battles is a full-stack GameFi application built on OneChain (Sui-based Layer-1 blockchain). The architecture consists of:
- **Frontend**: React-based web application with OneWallet integration
- **Smart Contracts**: Move language contracts on OneChain for NFT management
- **Backend API**: Node.js service for game logic and external API integration
- **External Services**: Pokémon API for creature data, Gemini API for AI features

The design prioritizes a beginner-friendly Web3 experience with clear wallet integration patterns and minimal blockchain complexity for players.

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Wallet UI    │  │ Battle UI    │  │ Marketplace  │      │
│  │ (OneWallet)  │  │ (Gemini AI)  │  │ (NFT Trade)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                    Server Components + API Routes            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (FastAPI)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Game Logic   │  │ Pokémon API  │  │ Gemini API   │      │
│  │ Service      │  │ Integration  │  │ Integration  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase (Database)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Firestore    │  │ Auth         │  │ Storage      │      │
│  │ (Game Data)  │  │ (Wallets)    │  │ (Cache)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              OneChain Blockchain (Sui-based)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pokémon NFT  │  │ Egg NFT      │  │ Marketplace  │      │
│  │ Contract     │  │ Contract     │  │ Contract     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14+ (App Router) with TypeScript
- @mysten/dapp-kit for Sui/OneChain wallet integration
- @mysten/sui.js for blockchain interactions
- TailwindCSS for styling
- Zustand for state management
- React Query for data fetching and caching

**Smart Contracts:**
- Move language (Sui framework)
- Sui CLI for contract deployment
- OneChain testnet/mainnet

**Backend:**
- FastAPI (Python 3.11+)
- Pydantic for data validation
- httpx for async HTTP requests
- google-generativeai for Gemini API
- Redis for caching Pokémon data

**Database:**
- Firebase Firestore (NoSQL database)
- Firebase Authentication (wallet address linking)
- Firebase Storage (for cached assets)

**External APIs:**
- PokéAPI (https://pokeapi.co) - Pokémon data
- Google Gemini API - AI features

## Components and Interfaces

### 1. Frontend Components

#### 1.1 Wallet Connection Component

**Purpose**: Handle OneWallet authentication and display wallet status

**Key Features:**
- Detect OneWallet installation
- Connect/disconnect wallet
- Display wallet address and balance
- Handle network switching (OneChain testnet/mainnet)
- Link wallet to Firebase Auth

**Implementation Details:**
```typescript
// app/providers/WalletProvider.tsx (Next.js Client Component)
'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Wallet provider configuration
const walletConfig = {
  chains: ['onechain:testnet'], // OneChain testnet
  wallets: ['OneWallet'], // Sui-compatible wallet
};

export function WalletConnect() {
  const account = useCurrentAccount();
  
  useEffect(() => {
    if (account?.address) {
      // Link wallet to Firebase Auth
      linkWalletToFirebase(account.address);
    }
  }, [account]);
  
  return <ConnectButton />;
}
```

**State Management (Zustand):**
```typescript
// store/walletStore.ts
import { create } from 'zustand';

interface WalletState {
  address: string | null;
  balance: string;
  connected: boolean;
  setWallet: (address: string, balance: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  balance: '0',
  connected: false,
  setWallet: (address, balance) => set({ address, balance, connected: true }),
  disconnect: () => set({ address: null, balance: '0', connected: false }),
}));
```

#### 1.2 Starter Pokémon Component

**Purpose**: Display and mint random starter Pokémon for new players

**Flow:**
1. Check if player has any Pokémon NFTs
2. If new player, randomly select from 9 starters
3. Display selection with animation
4. Call smart contract to mint starter NFT
5. Wait for transaction confirmation
6. Display success message

**API Calls:**
- `GET /api/pokemon/:id` - Fetch Pokémon data
- `POST /api/player/starter` - Record starter selection
- Smart Contract: `mint_starter_pokemon()`

#### 1.3 Wild Encounter Component

**Purpose**: Handle wild Pokémon encounters and capture attempts

**Flow:**
1. Player clicks "Explore" button
2. Check cooldown timer (5 minutes)
3. Backend generates random encounter with rarity weighting
4. Display Pokémon with Gemini-generated description
5. Player attempts capture or battle
6. Calculate capture success
7. If successful, mint Pokémon NFT

**State:**
- Current encounter (Pokémon data)
- Capture attempt count
- Pokémon health percentage
- Cooldown timer

#### 1.4 Battle Interface Component

**Purpose**: Turn-based battle system with AI commentary

**Sub-components:**
- Battle field display (player vs opponent)
- Move selection panel
- Health bars and status
- AI commentary feed
- Battle log

**Real-time Updates:**
- WebSocket connection for live battle events
- Gemini API streaming for commentary
- Animated damage calculations

#### 1.5 Egg Incubation Component

**Purpose**: Display and manage egg hatching progress

**Features:**
- List of player's Egg NFTs (max 3)
- Progress bars showing incubation steps
- Hatch button when ready (1000 steps)
- Hatching animation with Gemini-generated reveal

**Data Display:**
- Incubation progress (X/1000 steps)
- Estimated hatch time based on activity
- Parent Pokémon info (if available)

#### 1.6 Marketplace Component

**Purpose**: NFT trading interface for Pokémon and Eggs

**Features:**
- Grid view of listed NFTs
- Filters (type, rarity, price)
- List NFT modal (set price)
- Purchase confirmation
- Transaction history

**Smart Contract Interactions:**
- `list_nft(nft_id, price)` - Create listing
- `buy_nft(listing_id)` - Purchase NFT
- `cancel_listing(listing_id)` - Remove listing

### 2. Backend API Services (FastAPI)

#### 2.1 Pokémon Data Service

**Purpose**: Fetch and cache Pokémon data from PokéAPI

**Endpoints:**
```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import redis.asyncio as redis

app = FastAPI()
redis_client = redis.from_url("redis://localhost:6379")

@app.get("/api/pokemon/{pokemon_id}")
async def get_pokemon(pokemon_id: int):
    # Check Redis cache first
    cached = await redis_client.get(f"pokemon:{pokemon_id}")
    if cached:
        return json.loads(cached)
    
    # Fetch from PokéAPI
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://pokeapi.co/api/v2/pokemon/{pokemon_id}")
        data = response.json()
    
    # Transform and cache
    pokemon = transform_pokemon_data(data)
    await redis_client.setex(f"pokemon:{pokemon_id}", 86400, json.dumps(pokemon))
    return pokemon

@app.get("/api/pokemon/random")
async def get_random_pokemon(rarity: str = "common"):
    # Weighted random selection based on rarity
    pass

@app.get("/api/pokemon/starter")
async def get_random_starter():
    # Return random from 9 starters
    pass
```

**Caching Strategy:**
- Redis cache for 24 hours
- Pre-fetch Generation 1 Pokémon on startup
- Lazy load other generations

**Data Models (Pydantic):**
```python
from pydantic import BaseModel
from typing import List

class PokemonStats(BaseModel):
    hp: int
    attack: int
    defense: int
    speed: int

class PokemonData(BaseModel):
    id: int
    name: str
    types: List[str]
    stats: PokemonStats
    sprite: str
    rarity: str  # 'common' | 'uncommon' | 'rare' | 'legendary'
```

#### 2.2 Gemini AI Service

**Purpose**: Generate AI content for battles, encounters, and quests

**Implementation (FastAPI):**
```python
# services/gemini_service.py
import google.generativeai as genai
from typing import Dict, Any
import os

# Configure with your API key
genai.configure(api_key="AIzaSyDAL621Fd02tvoKCJ9apijDp0h6BRuJ_cE")
model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Using Gemini 2.0 Flash

class GeminiService:
    async def generate_encounter_text(self, pokemon: PokemonData) -> str:
        prompt = f"""You are a Pokémon game narrator. A wild {pokemon.name} appears! 
        It is a {'/'.join(pokemon.types)} type Pokémon. 
        Generate an exciting 2-sentence encounter description that captures the moment."""
        
        response = await model.generate_content_async(prompt)
        return response.text
    
    async def generate_battle_commentary(self, battle_event: Dict[str, Any]) -> str:
        prompt = f"""You are a Pokémon battle commentator. 
        {battle_event['attacker']} used {battle_event['move']}! 
        It dealt {battle_event['damage']} damage to {battle_event['defender']}.
        {'It\'s super effective!' if battle_event['effectiveness'] > 1 else ''}
        Generate an exciting 1-sentence commentary."""
        
        response = await model.generate_content_async(prompt)
        return response.text
    
    async def select_ai_move(self, battle_state: Dict[str, Any]) -> str:
        # AI trainer move selection logic
        pass
    
    async def generate_quest(self, player_team: List[Dict]) -> Dict[str, Any]:
        # Quest generation logic
        pass
    
    async def generate_hatching_text(self, pokemon: PokemonData) -> str:
        # Hatching reveal text
        pass
```

**Endpoints:**
```python
@app.post("/api/ai/encounter")
async def generate_encounter(pokemon_data: PokemonData):
    service = GeminiService()
    text = await service.generate_encounter_text(pokemon_data)
    return {"text": text}

@app.post("/api/ai/commentary")
async def generate_commentary(battle_event: Dict[str, Any]):
    service = GeminiService()
    text = await service.generate_battle_commentary(battle_event)
    return {"text": text}
```

**Prompt Engineering:**
- Context-aware prompts with game state
- Character personality for AI trainers
- Consistent tone and style
- Rate limiting and error handling

#### 2.3 Battle Engine Service

**Purpose**: Process battle logic and calculate outcomes

**Implementation (FastAPI):**
```python
# services/battle_engine.py
from typing import Dict, Any
import random

class BattleEngine:
    TYPE_CHART = {
        'fire': {'grass': 2.0, 'water': 0.5, 'fire': 0.5},
        'water': {'fire': 2.0, 'grass': 0.5, 'water': 0.5},
        'grass': {'water': 2.0, 'fire': 0.5, 'grass': 0.5},
        # ... complete type chart
    }
    
    def calculate_damage(
        self, 
        attacker: Dict[str, Any], 
        defender: Dict[str, Any], 
        move: Dict[str, Any]
    ) -> int:
        # Damage formula: ((2 * Level / 5 + 2) * Power * Atk / Def / 50 + 2) * Modifier
        base_damage = (
            ((2 * attacker['level'] / 5 + 2) * move['power'] * 
             attacker['stats']['attack'] / defender['stats']['defense'] / 50 + 2)
        )
        
        # Type effectiveness
        effectiveness = self.get_type_effectiveness(
            move['type'], 
            defender['types']
        )
        
        # Critical hit (6.25% chance)
        critical = 2.0 if random.random() < 0.0625 else 1.0
        
        # Random factor (0.85 - 1.0)
        random_factor = random.uniform(0.85, 1.0)
        
        damage = int(base_damage * effectiveness * critical * random_factor)
        return max(1, damage)
    
    def get_type_effectiveness(
        self, 
        attack_type: str, 
        defender_types: List[str]
    ) -> float:
        effectiveness = 1.0
        for def_type in defender_types:
            effectiveness *= self.TYPE_CHART.get(attack_type, {}).get(def_type, 1.0)
        return effectiveness
    
    def calculate_capture_rate(
        self, 
        pokemon: Dict[str, Any], 
        health_percent: float
    ) -> float:
        # Capture formula: (1 - 2/3 * HP%) * CatchRate * RarityModifier
        base_rate = pokemon.get('catch_rate', 100)
        rarity_modifier = {
            'common': 1.0,
            'uncommon': 0.7,
            'rare': 0.4,
            'legendary': 0.1
        }[pokemon['rarity']]
        
        rate = (1 - 2/3 * health_percent) * base_rate * rarity_modifier / 255
        return min(1.0, max(0.0, rate))
    
    def award_experience(
        self, 
        winner_level: int, 
        loser_level: int
    ) -> int:
        # XP formula: (BaseXP * LoserLevel / 7)
        base_xp = 50
        xp = int(base_xp * loser_level / 7)
        return xp
    
    def check_level_up(self, current_xp: int, current_level: int) -> bool:
        # XP required: Level^3
        required_xp = current_level ** 3
        return current_xp >= required_xp
```

**Endpoints:**
```python
@app.post("/api/battle/calculate-damage")
async def calculate_damage(
    attacker: Dict[str, Any],
    defender: Dict[str, Any],
    move: Dict[str, Any]
):
    engine = BattleEngine()
    damage = engine.calculate_damage(attacker, defender, move)
    effectiveness = engine.get_type_effectiveness(move['type'], defender['types'])
    return {"damage": damage, "effectiveness": effectiveness}

@app.post("/api/battle/capture-rate")
async def get_capture_rate(pokemon: Dict[str, Any], health_percent: float):
    engine = BattleEngine()
    rate = engine.calculate_capture_rate(pokemon, health_percent)
    success = random.random() < rate
    return {"rate": rate, "success": success}
```

**Battle Flow:**
1. Initialize battle state
2. Player selects move
3. AI selects move (via Gemini)
4. Calculate turn order (speed stat)
5. Execute moves and calculate damage
6. Generate commentary
7. Check for battle end
8. Award XP and update NFTs

#### 2.4 Blockchain Service

**Purpose**: Interface with OneChain smart contracts

**Implementation (FastAPI):**
```python
# services/blockchain_service.py
from pysui import SuiClient, SuiConfig
from pysui.sui.sui_types import ObjectID
from typing import List, Dict, Any

class BlockchainService:
    def __init__(self):
        self.config = SuiConfig.default_config()
        self.client = SuiClient(self.config)
        self.package_id = os.getenv("ONECHAIN_PACKAGE_ID")
    
    async def get_player_nfts(self, address: str) -> List[Dict[str, Any]]:
        """Query NFTs owned by address"""
        result = await self.client.get_objects_owned_by_address(address)
        
        # Filter for Pokemon and Egg NFTs
        nfts = []
        for obj in result.data:
            if self.package_id in obj.type:
                nfts.append(obj)
        
        return nfts
    
    async def mint_pokemon(
        self, 
        owner: str, 
        pokemon_data: PokemonData
    ) -> str:
        """Mint new Pokémon NFT"""
        # This would be called from frontend via wallet signing
        # Backend just prepares the transaction data
        return {
            "target": f"{self.package_id}::pokemon_nft::mint_captured",
            "arguments": [
                pokemon_data.id,
                pokemon_data.name,
                1,  # level
            ]
        }
    
    async def mint_egg(
        self, 
        owner: str, 
        parent1_id: str, 
        parent2_id: str
    ) -> Dict[str, Any]:
        """Prepare Egg NFT minting transaction"""
        return {
            "target": f"{self.package_id}::egg_nft::breed_pokemon",
            "arguments": [parent1_id, parent2_id]
        }
    
    async def update_pokemon_stats(
        self, 
        nft_id: str, 
        new_xp: int,
        new_level: int,
        new_stats: Dict[str, int]
    ) -> Dict[str, Any]:
        """Prepare stats update transaction"""
        return {
            "target": f"{self.package_id}::pokemon_nft::update_stats",
            "arguments": [nft_id, new_xp, new_level, new_stats]
        }
```

**Endpoints:**
```python
@app.get("/api/blockchain/nfts/{address}")
async def get_nfts(address: str):
    service = BlockchainService()
    nfts = await service.get_player_nfts(address)
    return {"nfts": nfts}

@app.post("/api/blockchain/prepare-mint")
async def prepare_mint(pokemon_data: PokemonData, owner: str):
    service = BlockchainService()
    tx_data = await service.mint_pokemon(owner, pokemon_data)
    return tx_data
```

### 3. Smart Contracts (Move Language)

#### 3.1 Pokémon NFT Contract

**Purpose**: Manage Pokémon NFT lifecycle and attributes

**Struct Definition:**
```move
module pokechain::pokemon_nft {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    struct Pokemon has key, store {
        id: UID,
        species_id: u16,
        name: String,
        level: u8,
        experience: u32,
        stats: Stats,
        types: vector<String>,
        owner: address,
        mint_timestamp: u64,
    }
    
    struct Stats has store, copy, drop {
        hp: u16,
        attack: u16,
        defense: u16,
        speed: u16,
    }
    
    // Mint starter Pokémon
    public entry fun mint_starter(
        species_id: u16,
        name: String,
        ctx: &mut TxContext
    ) {
        // Implementation
    }
    
    // Mint captured Pokémon
    public entry fun mint_captured(
        species_id: u16,
        level: u8,
        ctx: &mut TxContext
    ) {
        // Implementation
    }
    
    // Update stats after battle
    public entry fun update_stats(
        pokemon: &mut Pokemon,
        new_experience: u32,
        new_level: u8,
        new_stats: Stats,
    ) {
        // Implementation
    }
}
```

#### 3.2 Egg NFT Contract

**Purpose**: Manage egg breeding and incubation

**Struct Definition:**
```move
module pokechain::egg_nft {
    use sui::object::{Self, UID};
    
    struct Egg has key, store {
        id: UID,
        parent1_species: u16,
        parent2_species: u16,
        incubation_steps: u32,
        required_steps: u32,
        genetics: vector<u8>, // Hidden until hatch
        owner: address,
        created_timestamp: u64,
    }
    
    // Create egg from breeding
    public entry fun breed_pokemon(
        parent1: &Pokemon,
        parent2: &Pokemon,
        ctx: &mut TxContext
    ) {
        // Verify compatibility
        // Generate genetics
        // Mint egg
    }
    
    // Increment incubation progress
    public entry fun increment_incubation(
        egg: &mut Egg,
        steps: u32,
    ) {
        egg.incubation_steps = egg.incubation_steps + steps;
    }
    
    // Hatch egg into Pokémon
    public entry fun hatch_egg(
        egg: Egg,
        ctx: &mut TxContext
    ): Pokemon {
        // Verify incubation complete
        // Generate Pokémon from genetics
        // Burn egg, mint Pokémon
    }
}
```

#### 3.3 Marketplace Contract

**Purpose**: Facilitate NFT trading with escrow

**Struct Definition:**
```move
module pokechain::marketplace {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, UID};
    
    struct Listing has key, store {
        id: UID,
        nft_id: address,
        nft_type: u8, // 1 = Pokemon, 2 = Egg
        seller: address,
        price: u64,
        listed_timestamp: u64,
    }
    
    struct MarketplaceData has key {
        id: UID,
        listings: vector<Listing>,
        fee_percentage: u64, // e.g., 250 = 2.5%
    }
    
    // List NFT for sale
    public entry fun list_nft<T: key + store>(
        nft: T,
        price: u64,
        marketplace: &mut MarketplaceData,
        ctx: &mut TxContext
    ) {
        // Transfer NFT to escrow
        // Create listing
    }
    
    // Purchase listed NFT
    public entry fun buy_nft<T: key + store>(
        listing_id: address,
        payment: Coin<SUI>,
        marketplace: &mut MarketplaceData,
        ctx: &mut TxContext
    ): T {
        // Verify payment amount
        // Calculate and deduct fee
        // Transfer payment to seller
        // Transfer NFT to buyer
        // Remove listing
    }
    
    // Cancel listing
    public entry fun cancel_listing<T: key + store>(
        listing_id: address,
        marketplace: &mut MarketplaceData,
        ctx: &mut TxContext
    ): T {
        // Verify caller is seller
        // Return NFT to seller
        // Remove listing
    }
}
```

## Data Models

### Firebase Firestore Schema

#### Players Collection
```typescript
// Collection: players
// Document ID: wallet_address
{
  walletAddress: string;        // Document ID
  username: string | null;
  starterPokemonId: number | null;
  createdAt: Timestamp;
  lastActive: Timestamp;
  stats: {
    totalBattles: number;
    wins: number;
    pokemonCaught: number;
    eggsHatched: number;
  }
}
```

**Firestore Rules:**
```javascript
match /players/{walletAddress} {
  allow read: if true;
  allow write: if request.auth.uid == walletAddress;
}
```

#### Game State Collection
```typescript
// Collection: gameState
// Document ID: wallet_address
{
  playerId: string;              // wallet_address
  lastEncounterTime: Timestamp | null;
  activeQuests: Array<{
    id: string;
    title: string;
    description: string;
    objectives: Array<{
      type: string;
      target: number;
      current: number;
    }>;
    rewards: object;
    expiresAt: Timestamp;
  }>;
  dailyChallenges: Array<{
    id: string;
    description: string;
    progress: number;
    target: number;
    reward: object;
  }>;
  lastDailyReset: Timestamp;
  encounterCooldownUntil: Timestamp | null;
}
```

#### Battle History Collection
```typescript
// Collection: battleHistory
// Auto-generated Document ID
{
  playerId: string;              // wallet_address
  opponentType: 'ai' | 'player';
  opponentId: string | null;
  playerPokemonNftId: string;
  opponentPokemonData: {
    species: string;
    level: number;
    stats: object;
  };
  winner: 'player' | 'opponent';
  experienceGained: number;
  battleLog: Array<{
    turn: number;
    action: string;
    damage: number;
    commentary: string;
  }>;
  createdAt: Timestamp;
}
```

**Firestore Query:**
```typescript
// Get player's battle history
const battles = await db
  .collection('battleHistory')
  .where('playerId', '==', walletAddress)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

#### Marketplace Listings Collection
```typescript
// Collection: marketplaceListings
// Document ID: listing_id (from smart contract)
{
  listingId: string;             // Document ID
  nftId: string;
  nftType: 'pokemon' | 'egg';
  sellerAddress: string;
  price: number;                 // in SUI tokens
  nftMetadata: {
    species?: string;
    level?: number;
    stats?: object;
    incubationProgress?: number;
    parentSpecies?: string[];
  };
  listedAt: Timestamp;
  status: 'active' | 'sold' | 'cancelled';
  soldAt?: Timestamp;
  buyerAddress?: string;
}
```

**Firestore Indexes:**
```javascript
// Composite indexes needed:
// 1. status + nftType + price
// 2. sellerAddress + status
// 3. status + listedAt (desc)
```

#### Cached Pokémon Data Collection
```typescript
// Collection: pokemonCache
// Document ID: pokemon_id (e.g., "1", "25")
{
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  sprite: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cachedAt: Timestamp;
}
```

**Cache Strategy:**
```typescript
// Check cache first, fallback to PokéAPI
async function getPokemonData(id: number): Promise<PokemonData> {
  const cached = await db.collection('pokemonCache').doc(id.toString()).get();
  
  if (cached.exists && isCacheValid(cached.data().cachedAt)) {
    return cached.data() as PokemonData;
  }
  
  // Fetch from PokéAPI and update cache
  const data = await fetchFromPokeAPI(id);
  await db.collection('pokemonCache').doc(id.toString()).set({
    ...data,
    cachedAt: FieldValue.serverTimestamp()
  });
  
  return data;
}
```

### Frontend State Management

**React Context Structure:**
```typescript
interface GameState {
  // Wallet
  wallet: {
    address: string | null;
    balance: string;
    connected: boolean;
  };
  
  // Player data
  player: {
    id: string;
    username: string;
    nfts: {
      pokemon: PokemonNFT[];
      eggs: EggNFT[];
    };
  };
  
  // Active game session
  session: {
    currentBattle: Battle | null;
    activeQuests: Quest[];
    dailyChallenges: Challenge[];
    encounterCooldown: number;
  };
  
  // UI state
  ui: {
    loading: boolean;
    modal: ModalType | null;
    notifications: Notification[];
  };
}
```

## Error Handling

### Frontend Error Handling

**Wallet Errors:**
- OneWallet not installed → Show installation guide
- Connection rejected → Display user-friendly message
- Network mismatch → Prompt network switch
- Transaction failed → Show error details and retry option

**API Errors:**
- Network timeout → Retry with exponential backoff
- Rate limiting → Queue requests
- Invalid response → Fallback to cached data

**Smart Contract Errors:**
- Insufficient gas → Display gas estimate
- Transaction reverted → Parse error message
- NFT not found → Refresh NFT list

### Backend Error Handling

**External API Failures:**
```typescript
class APIErrorHandler {
  async handlePokemonAPIError(error: Error): Promise<PokemonData> {
    // Try cache first
    // If cache miss, return default data
    // Log error for monitoring
  }
  
  async handleGeminiAPIError(error: Error): Promise<string> {
    // Return fallback generic text
    // Log error
    // Implement rate limit backoff
  }
}
```

**Blockchain Errors:**
- RPC node unavailable → Switch to backup node
- Transaction timeout → Implement retry logic
- Nonce conflicts → Queue transactions

## Testing Strategy

### Unit Tests

**Frontend:**
- Component rendering tests (React Testing Library)
- Wallet connection logic
- State management (Context/Redux)
- Utility functions (damage calculation, type effectiveness)

**Backend:**
- API endpoint tests (Jest + Supertest)
- Battle engine calculations
- Pokémon data transformation
- Gemini prompt generation

**Smart Contracts:**
- Move unit tests for each contract function
- NFT minting and transfer
- Marketplace escrow logic
- Edge cases (overflow, unauthorized access)

### Integration Tests

**End-to-End Flows:**
1. New player onboarding (wallet connect → starter mint)
2. Wild encounter (explore → capture → NFT mint)
3. Battle flow (select Pokémon → battle → XP award)
4. Egg breeding (select parents → mint egg → incubate → hatch)
5. Marketplace (list NFT → purchase → transfer)

**Tools:**
- Playwright for E2E browser tests
- OneChain testnet for blockchain integration
- Mock Gemini API for consistent AI responses

### Performance Testing

**Metrics to Monitor:**
- Wallet connection time (< 2 seconds)
- NFT query time (< 1 second)
- Battle turn processing (< 500ms)
- Gemini API response time (< 3 seconds)
- Smart contract gas costs

**Load Testing:**
- Concurrent users (target: 100+)
- Marketplace listing queries
- Battle matchmaking

## Security Considerations

### Smart Contract Security

**Access Control:**
- Only NFT owner can update stats
- Only marketplace contract can transfer escrowed NFTs
- Admin functions protected by capability pattern

**Validation:**
- Verify all inputs (level caps, stat ranges)
- Prevent integer overflow/underflow
- Check NFT ownership before operations

**Audit:**
- Code review by Move experts
- Automated security scanning
- Testnet deployment before mainnet

### Frontend Security

**Wallet Security:**
- Never request private keys
- Use OneWallet's secure signing
- Validate all transaction parameters
- Display clear transaction previews

**API Security:**
- HTTPS only
- API key rotation for Gemini
- Rate limiting per wallet address
- Input sanitization

### Backend Security

**Authentication:**
- Verify wallet signatures for sensitive operations
- Session management with JWT
- CORS configuration

**Data Protection:**
- Encrypt sensitive data at rest
- Secure API key storage (environment variables)
- Database connection pooling with SSL

## Deployment Strategy

### Development Environment

**Local Setup:**
1. Install Sui CLI and OneChain tools
2. Run local Sui node or connect to testnet
3. Deploy contracts to testnet
4. Configure environment variables
5. Start backend API (localhost:3000)
6. Start frontend dev server (localhost:5173)

### Testnet Deployment

**OneChain Testnet:**
1. Deploy smart contracts to OneChain testnet
2. Verify contracts on explorer
3. Deploy backend to cloud (Railway/Render)
4. Deploy frontend to Vercel/Netlify
5. Configure testnet RPC endpoints
6. Test with OneWallet on testnet

### Mainnet Deployment

**Production Checklist:**
- [ ] Smart contract audit complete
- [ ] Security testing passed
- [ ] Performance benchmarks met
- [ ] Backup RPC nodes configured
- [ ] Monitoring and alerting setup
- [ ] User documentation complete
- [ ] Deploy contracts to OneChain mainnet
- [ ] Update frontend to mainnet config
- [ ] Gradual rollout with feature flags

## OneWallet Integration Guide (Next.js)

### Setup for Beginners

**Step 1: Install OneWallet**
```typescript
// No installation code needed - users install browser extension
// Guide users to: https://onewallet.io or Chrome Web Store
```

**Step 2: Configure Wallet Provider (Next.js App Router)**
```typescript
// app/providers.tsx
'use client';

import { WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

const queryClient = new QueryClient();

// OneChain network configuration
const networks = {
  testnet: { url: getFullnodeUrl('testnet') }, // Replace with OneChain RPC
  mainnet: { url: getFullnodeUrl('mainnet') },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider networks={networks} defaultNetwork="testnet">
        {children}
      </WalletProvider>
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 3: Connect Button Component**
```typescript
// components/WalletConnect.tsx
'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect } from 'react';
import { linkWalletToFirebase } from '@/lib/auth';

export function WalletConnect() {
  const account = useCurrentAccount();
  
  useEffect(() => {
    if (account?.address) {
      // Link wallet to Firebase Auth
      linkWalletToFirebase(account.address);
    }
  }, [account]);
  
  return (
    <div className="flex items-center gap-4">
      {!account ? (
        <ConnectButton className="btn-primary">
          Connect OneWallet
        </ConnectButton>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <button className="btn-secondary">Disconnect</button>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Sign Transactions**
```typescript
// hooks/useMintPokemon.ts
'use client';

import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { PACKAGE_ID } from '@/config/constants';

export function useMintPokemon() {
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
  
  const mintPokemon = async (speciesId: number, name: string) => {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::pokemon_nft::mint_starter`,
      arguments: [
        tx.pure(speciesId),
        tx.pure(name),
      ],
    });
    
    return new Promise((resolve, reject) => {
      signAndExecute(
        { transactionBlock: tx },
        {
          onSuccess: (result) => {
            console.log('Minted!', result);
            resolve(result);
          },
          onError: (error) => {
            console.error('Error:', error);
            reject(error);
          },
        }
      );
    });
  };
  
  return { mintPokemon };
}
```

### Common Patterns for Web3 Beginners

**Pattern 1: Check Wallet Connection (Server Component)**
```typescript
// app/game/page.tsx
import { WalletGuard } from '@/components/WalletGuard';

export default function GamePage() {
  return (
    <WalletGuard>
      <GameContent />
    </WalletGuard>
  );
}
```

```typescript
// components/WalletGuard.tsx
'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletConnect } from './WalletConnect';

export function WalletGuard({ children }) {
  const account = useCurrentAccount();
  
  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2>Connect your wallet to play</h2>
        <WalletConnect />
      </div>
    );
  }
  
  return <>{children}</>;
}
```

**Pattern 2: Query NFTs with React Query**
```typescript
// hooks/usePlayerPokemon.ts
'use client';

import { useSuiClientQuery } from '@mysten/dapp-kit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/config/constants';

export function usePlayerPokemon() {
  const account = useCurrentAccount();
  
  const { data, isLoading, refetch } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address!,
      filter: {
        StructType: `${PACKAGE_ID}::pokemon_nft::Pokemon`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    },
    { enabled: !!account }
  );
  
  return { 
    pokemon: data?.data || [], 
    isLoading,
    refetch 
  };
}
```

**Pattern 3: Handle Transaction States with Toast**
```typescript
// components/MintButton.tsx
'use client';

import { useState } from 'react';
import { useMintPokemon } from '@/hooks/useMintPokemon';
import { toast } from 'sonner';

export function MintButton({ speciesId, name }) {
  const [isLoading, setIsLoading] = useState(false);
  const { mintPokemon } = useMintPokemon();
  
  const handleMint = async () => {
    setIsLoading(true);
    try {
      await mintPokemon(speciesId, name);
      toast.success('Pokémon minted successfully!');
    } catch (error) {
      toast.error('Failed to mint Pokémon');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleMint} 
      disabled={isLoading}
      className="btn-primary"
    >
      {isLoading ? 'Minting...' : 'Mint Pokémon'}
    </button>
  );
}
```

## Firebase Integration

### Configuration

```typescript
// lib/firebase.ts (Next.js)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Backend Configuration (FastAPI)

```python
# config/firebase.py
import firebase_admin
from firebase_admin import credentials, firestore, auth

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
```

### Wallet Authentication with Firebase

```typescript
// lib/auth.ts (Next.js)
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase';

export async function linkWalletToFirebase(walletAddress: string) {
  // Call backend to generate custom token
  const response = await fetch('/api/auth/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress }),
  });
  
  const { token } = await response.json();
  
  // Sign in with custom token
  await signInWithCustomToken(auth, token);
}
```

```python
# Backend endpoint to generate custom token
@app.post("/api/auth/wallet")
async def authenticate_wallet(wallet_data: Dict[str, str]):
    wallet_address = wallet_data['walletAddress']
    
    # Create or get user
    try:
        user = auth.get_user(wallet_address)
    except:
        user = auth.create_user(uid=wallet_address)
    
    # Generate custom token
    custom_token = auth.create_custom_token(wallet_address)
    
    return {"token": custom_token.decode()}
```

## Development Roadmap

### Phase 1: MVP (4-6 weeks)
- [ ] Next.js project setup with TypeScript and TailwindCSS
- [ ] Firebase configuration (Firestore, Auth, Storage)
- [ ] FastAPI backend setup with Python
- [ ] OneWallet integration and authentication
- [ ] Basic Pokémon NFT contract (Move)
- [ ] Starter Pokémon minting
- [ ] Pokémon API integration with Redis caching
- [ ] Simple battle system (PvE only)
- [ ] Basic UI with wallet connection

### Phase 2: Core Features (4-6 weeks)
- [ ] Wild encounter and capture system
- [ ] Gemini AI battle commentary
- [ ] Egg NFT contract and breeding
- [ ] Incubation system
- [ ] Marketplace contract
- [ ] Quest system with Firestore
- [ ] Firebase real-time updates for battles

### Phase 3: Polish and Launch (2-4 weeks)
- [ ] AI trainer dialogue
- [ ] Daily challenges
- [ ] PvP battles
- [ ] Advanced marketplace features
- [ ] Performance optimization (Next.js ISR, caching)
- [ ] Security audit (smart contracts + Firebase rules)
- [ ] Testnet beta launch

### Phase 4: Post-Launch (Ongoing)
- [ ] Additional Pokémon generations
- [ ] Seasonal events
- [ ] Tournament system
- [ ] Mobile responsive design
- [ ] Community features
- [ ] Analytics dashboard (Firebase Analytics)
