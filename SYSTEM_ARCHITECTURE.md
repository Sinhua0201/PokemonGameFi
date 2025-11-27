# PokéChain Battles - System Architecture

## Overview

PokéChain Battles is a Web3 GameFi application that combines Pokémon-style gameplay with blockchain technology. Players can collect, battle, breed, and trade Pokémon as NFTs on the OneChain blockchain.

---

## How to Play

### 1. Getting Started
1. Connect your OneWallet browser extension
2. Choose your trainer character (6 options)
3. Enter your trainer name
4. Select your starter Pokémon (9 options: Bulbasaur, Charmander, Squirtle, Pikachu, Eevee, Chikorita, Cyndaquil, Totodile, Togepi)
5. Your starter Pokémon is minted as an NFT on OneChain

### 2. Core Gameplay
- **Explore**: Navigate the game world and encounter wild Pokémon
- **Battle**: Fight wild Pokémon or AI trainers using turn-based combat
- **Capture**: Weaken wild Pokémon and capture them as NFTs
- **Breed**: Combine two Pokémon to create Eggs, hatch them by winning battles
- **Evolve**: Level up Pokémon to evolve them (Level 12 for 1st evolution, Level 20 for 2nd)
- **Trade**: Buy and sell Pokémon/Eggs on the NFT Marketplace
- **Quests**: Complete daily challenges and AI-generated quests for rewards
- **AI Trainer Dialogue**: Chat with Professor Oak (powered by DeepSeek AI) for tips and guidance

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND                                       │
│                            (Next.js 14 + React)                                  │
│                         Deployed on: Vercel                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Pages      │  │ Components  │  │   Hooks     │  │      State Management   │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────────────────┤ │
│  │ /           │  │ WalletConnect│ │usePokemonNFT│  │ Zustand (battleStore)   │ │
│  │ /start-game │  │ BattleModal │  │useBreeding  │  │                         │ │
│  │ /explore    │  │ MarketplaceGrid│useEncounter │  │                         │ │
│  │ /encounter  │  │ EggDashboard│  │useMintPokemon│ │                         │ │
│  │ /breeding   │  │ AITrainerDialogue│useQuests │  │                         │ │
│  │ /marketplace│  │ EvolutionAnimation│useCapture│ │                         │ │
│  │ /quests     │  │ CharacterPreview│           │  │                         │ │
│  │ /trainer-dialogue│           │  │             │  │                         │ │
│  │ /profile    │  │             │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         External Integrations                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐│  │
│  │  │ @mysten/dapp-kit│  │ Firebase SDK    │  │ Three.js / React Three Fiber││  │
│  │  │ (Wallet + Chain)│  │ (Firestore)     │  │ (3D Models & Scenes)        ││  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ HTTPS API Calls
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND                                        │
│                            (FastAPI + Python)                                    │
│                         Deployed on: Railway                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                              API Routes                                  │    │
│  │  /api/pokemon     - Pokémon data from PokéAPI                           │    │
│  │  /api/battle      - Damage calculation, capture rate, XP awards         │    │
│  │  /api/ai          - AI-generated content (encounters, commentary)       │    │
│  │  /api/quests      - Quest generation and progress tracking              │    │
│  │  /api/trainer     - AI Trainer Dialogue (DeepSeek Chat)                 │    │
│  │  /api/auth        - Authentication                                      │    │
│  │  /api/blockchain  - Blockchain utilities                                │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                              Services                                    │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │    │
│  │  │ pokemon_service │  │ battle_engine   │  │ quest_service           │  │    │
│  │  │ - PokéAPI fetch │  │ - Damage calc   │  │ - Quest generation      │  │    │
│  │  │ - Caching       │  │ - Type effects  │  │ - Daily challenges      │  │    │
│  │  │ - Rarity system │  │ - Capture rate  │  │ - Progress tracking     │  │    │
│  │  └─────────────────┘  │ - XP awards     │  └─────────────────────────┘  │    │
│  │                       └─────────────────┘                                │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────────────────────┐   │    │
│  │  │ redis_service   │  │ DeepSeek AI Integration                     │   │    │
│  │  │ - Caching       │  │ - Model: deepseek-chat                      │   │    │
│  │  │ - Rate limiting │  │ - Endpoint: /api/trainer/chat               │   │    │
│  │  └─────────────────┘  │ - Professor Oak personality                 │   │    │
│  │                       └─────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌───────────────────┐    ┌───────────────────────┐    ┌───────────────────────────┐
│   ONECHAIN        │    │      FIREBASE         │    │     EXTERNAL APIs         │
│   BLOCKCHAIN      │    │      (Google)         │    │                           │
├───────────────────┤    ├───────────────────────┤    ├───────────────────────────┤
│                   │    │                       │    │                           │
│ Smart Contracts:  │    │ Firestore Database:   │    │ PokéAPI                   │
│                   │    │                       │    │ - Pokémon data            │
│ pokemon.move      │    │ Collections:          │    │ - Sprites                 │
│ - mint_starter    │    │ - trainers            │    │ - Stats                   │
│ - mint_captured   │    │ - players             │    │                           │
│ - evolve_pokemon  │    │ - gameState           │    │ DeepSeek API              │
│ - add_experience  │    │ - battleHistory       │    │ - AI Chat (deepseek-chat) │
│ - update_stats    │    │ - marketplaceListings │    │ - Professor Oak dialogue  │
│                   │    │ - pokemonCache        │    │                           │
│ egg.move          │    │                       │    │                           │
│ - breed_pokemon   │    │ Stored Data:          │    │                           │
│ - increment_incubation│ │ - Trainer profiles   │    │                           │
│ - add_battle_steps│    │ - Game progress       │    │                           │
│ - hatch_egg       │    │ - Quest states        │    │                           │
│                   │    │ - Battle history      │    │                           │
│ marketplace.move  │    │ - Encounter cooldowns │    │                           │
│ - list_pokemon    │    │                       │    │                           │
│ - list_egg        │    │                       │    │                           │
│ - buy_pokemon     │    │                       │    │                           │
│ - buy_egg         │    │                       │    │                           │
│ - cancel_listing  │    │                       │    │                           │
│                   │    │                       │    │                           │
│ Network: Testnet  │    │                       │    │                           │
│ RPC: rpc-testnet  │    │                       │    │                           │
│   .onelabs.cc:443 │    │                       │    │                           │
└───────────────────┘    └───────────────────────┘    └───────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| @mysten/dapp-kit | OneChain wallet integration |
| @mysten/sui | Blockchain transactions |
| Firebase SDK | Firestore database client |
| React Three Fiber | 3D scene rendering |
| Zustand | State management |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework |
| Pydantic | Data validation |
| OpenAI SDK | DeepSeek API client (OpenAI-compatible) |
| Redis | Caching (optional) |
| Uvicorn | ASGI server |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Move Language | Smart contract development |
| OneChain (Sui-based) | NFT blockchain network |
| OneWallet | Browser wallet extension |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting |
| Railway | Backend hosting |
| Firebase | Database (Firestore) |
| Redis | Caching layer |

---

## Smart Contract Architecture

### pokemon.move
Core NFT contract for Pokémon:
- `mint_starter()` - Mint starter Pokémon for new players
- `mint_captured()` - Mint wild Pokémon after capture
- `evolve_pokemon()` - Evolve Pokémon (requires level 12/20)
- `add_experience()` - Add XP after battles
- `update_stats()` - Update Pokémon stats

### egg.move
Breeding system contract:
- `breed_pokemon()` - Create egg from two parents
- `increment_incubation()` - Add incubation steps
- `add_battle_steps()` - +1 step per battle win
- `hatch_egg()` - Hatch egg into new Pokémon (requires 10 steps)

### marketplace.move
NFT trading contract:
- `list_pokemon()` / `list_egg()` - List NFT for sale
- `buy_pokemon()` / `buy_egg()` - Purchase listed NFT
- `cancel_listing_pokemon()` / `cancel_listing_egg()` - Cancel listing
- 2.5% marketplace fee on all sales

---

## Data Flow

### 1. New Player Registration
```
User → Connect Wallet → Select Character → Enter Name → Select Starter
                                                              │
                                                              ▼
                                          ┌─────────────────────────────────┐
                                          │ 1. Save trainer to Firestore    │
                                          │ 2. Call mint_starter() on-chain │
                                          │ 3. Save player stats to Firestore│
                                          └─────────────────────────────────┘
```

### 2. Battle Flow
```
Player → Encounter Wild Pokémon → Battle (Turn-based)
                                        │
              ┌─────────────────────────┴─────────────────────────┐
              │                                                    │
              ▼                                                    ▼
        Win Battle                                           Lose Battle
              │                                                    │
              ▼                                                    ▼
   ┌──────────────────────┐                              Return to Explore
   │ 1. Calculate XP      │
   │ 2. add_experience()  │
   │ 3. Update egg steps  │
   │ 4. Option to capture │
   └──────────────────────┘
```

### 3. Breeding Flow
```
Select 2 Pokémon → breed_pokemon() → Egg NFT Created
                                           │
                                           ▼
                                    Win Battles (+1 step each)
                                           │
                                           ▼
                                    10 Steps Reached
                                           │
                                           ▼
                                    hatch_egg() → New Pokémon NFT
```

### 4. AI Trainer Dialogue Flow
```
User Message → Backend /api/trainer/chat → DeepSeek API (deepseek-chat model)
                                                    │
                                                    ▼
                                          Professor Oak Response
                                          (Pokémon tips, strategies)
```

---

## API Endpoints

### Pokémon API (`/api/pokemon`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{id}` | GET | Get Pokémon by ID |
| `/random` | GET | Get random Pokémon |
| `/starter/random` | GET | Get random starter |
| `/starters/all` | GET | Get all 9 starters |

### Battle API (`/api/battle`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/capture-rate` | POST | Calculate capture probability |
| `/calculate-damage` | POST | Calculate battle damage |
| `/award-xp` | POST | Calculate XP rewards |

### Quest API (`/api/quests`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate` | POST | Generate AI quest |
| `/daily-challenges` | GET | Get 3 daily challenges |
| `/update-progress` | POST | Update quest progress |
| `/complete` | POST | Complete quest |

### Trainer Dialogue API (`/api/trainer`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Chat with Professor Oak (DeepSeek AI) |
| `/health` | GET | Check DeepSeek API status |

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=<deployed_contract_address>
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet
NEXT_PUBLIC_MARKETPLACE_ID=<marketplace_object_id>
NEXT_PUBLIC_API_URL=<railway_backend_url>
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<firebase_project>
```

### Backend (.env)
```
DEEPSEEK_API_KEY=<deepseek_api_key>
DEEPSEEK_MODEL=deepseek-chat
CORS_ORIGINS=<vercel_frontend_url>
ONECHAIN_PACKAGE_ID=<deployed_contract_address>
ONECHAIN_NETWORK=testnet
ONECHAIN_RPC_URL=https://rpc-testnet.onelabs.cc:443
```

---

## Game Mechanics

### Rarity System
| Rarity | Encounter Rate | Base Capture Rate |
|--------|----------------|-------------------|
| Common | 60% | 80% |
| Uncommon | 25% | 60% |
| Rare | 12% | 40% |
| Legendary | 3% | 10% |

### Evolution Requirements
| Stage | Level Required | Stat Boost |
|-------|----------------|------------|
| 1st Evolution | Level 12 | +20% all stats |
| 2nd Evolution | Level 20 | +20% all stats |

### Egg Incubation
- Required steps: 10
- Steps per battle win: 1
- Offspring inherits traits from parents via genetics system

### Battle Damage Formula
```
Damage = ((2 * Level / 5 + 2) * Power * Attack / Defense / 50 + 2) * Modifiers

Modifiers:
- Type effectiveness (0.5x, 1x, 2x)
- STAB bonus (1.5x if move type matches Pokémon type)
- Critical hit (2x, 6.25% chance)
- Random factor (0.85 - 1.0)
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐         ┌─────────────┐         ┌──────────┐  │
│   │   Vercel    │ ──────▶ │   Railway   │ ──────▶ │ OneChain │  │
│   │  (Frontend) │         │  (Backend)  │         │ Testnet  │  │
│   └─────────────┘         └─────────────┘         └──────────┘  │
│         │                       │                               │
│         │                       │                               │
│         ▼                       ▼                               │
│   ┌─────────────┐         ┌─────────────┐                       │
│   │  Firebase   │         │   Redis     │                       │
│   │ (Firestore) │         │  (Cache)    │                       │
│   └─────────────┘         └─────────────┘                       │
│                                 │                               │
│                                 ▼                               │
│                           ┌─────────────┐                       │
│                           │  DeepSeek   │                       │
│                           │    API      │                       │
│                           └─────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

PokéChain Battles is a full-stack Web3 game featuring:
- **Frontend**: Next.js 14 on Vercel with 3D graphics
- **Backend**: FastAPI on Railway with DeepSeek AI integration
- **Blockchain**: Move smart contracts on OneChain for NFT ownership
- **Database**: Firebase Firestore for game state persistence
- **AI**: DeepSeek Chat model for Professor Oak trainer dialogue

The game combines classic Pokémon mechanics (battle, capture, breed, evolve) with blockchain ownership (NFTs) and AI-powered interactions.
