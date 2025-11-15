# Implementation Plan

## Overview
This implementation plan breaks down the PokéChain Battles game into discrete, actionable coding tasks. Each task builds incrementally on previous work, starting with project setup, then core infrastructure, followed by game features, and finally polish and deployment.

## Task List

- [x] 1. Project Setup and Infrastructure



  - Initialize Next.js 14 project with TypeScript, TailwindCSS, and App Router
  - Set up project structure (app/, components/, lib/, hooks/, services/)
  - Configure environment variables (.env.local)
  - Install core dependencies (@mysten/dapp-kit, @mysten/sui.js, zustand, @tanstack/react-query)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Configure Firebase



  - Create Firebase project and obtain configuration
  - Initialize Firebase in Next.js (lib/firebase.ts)
  - Set up Firestore database with collections (players, gameState, battleHistory, marketplaceListings, pokemonCache)
  - Configure Firebase Security Rules for each collection
  - Set up Firebase Authentication

  - _Requirements: 1.1, 1.2_

- [x] 1.2 Set up FastAPI backend

  - Initialize FastAPI project with Python 3.11+
  - Create project structure (services/, models/, routes/, config/)
  - Install dependencies (fastapi, uvicorn, google-generativeai, httpx, redis, firebase-admin, pysui)
  - Configure CORS for Next.js frontend
  - Set up environment variables and configuration
  - Create health check endpoint
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 4.4, 4.5_


- [x] 1.3 Set up Redis caching

  - Install and configure Redis locally or use cloud service
  - Create Redis client connection in FastAPI
  - Implement cache utility functions (get, set, delete with TTL)
  - _Requirements: 2.1, 2.2_

- [x] 2. OneWallet Integration and Authentication





  - Create wallet provider component (app/providers.tsx)
  - Implement WalletConnect component with ConnectButton
  - Create wallet state management with Zustand (store/walletStore.ts)
  - Implement WalletGuard component for protected routes
  - Create Firebase custom token authentication endpoint in FastAPI
  - Implement linkWalletToFirebase function to connect wallet to Firebase Auth
  - Test wallet connection flow end-to-end
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. Pokémon Data Integration



  - Create PokéAPI service in FastAPI (services/pokemon_service.py)
  - Implement fetch functions for Pokémon data from https://pokeapi.co
  - Create Pydantic models for Pokémon data (PokemonData, PokemonStats)
  - Implement Redis caching for Pokémon data (24-hour TTL)
  - Create API endpoints: GET /api/pokemon/{id}, GET /api/pokemon/random, GET /api/pokemon/starter
  - Implement rarity weighting system (Common 60%, Uncommon 25%, Rare 12%, Legendary 3%)
  - Pre-fetch and cache Generation 1 Pokémon (1-151) on startup
  - Create Next.js API route to proxy FastAPI endpoints
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Smart Contract Development (Move)





  - Set up Sui CLI and OneChain development environment
  - Create Move project structure
  - Implement Pokémon NFT contract (pokemon_nft.move)
  - Define Pokemon struct with species_id, name, level, experience, stats, types, owner
  - Implement mint_starter function for initial Pokémon
  - Implement mint_captured function for wild Pokémon
  - Implement update_stats function for leveling up
  - Write Move unit tests for Pokémon NFT contract
  - Deploy contract to OneChain testnet
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4.1 Implement Egg NFT contract

  - Create Egg NFT contract (egg_nft.move)
  - Define Egg struct with parent species, incubation_steps, required_steps, genetics, owner
  - Implement breed_pokemon function to create eggs from two parent Pokémon
  - Implement increment_incubation function to add steps
  - Implement hatch_egg function to convert egg to Pokémon NFT
  - Write Move unit tests for Egg NFT contract
  - Deploy contract to OneChain testnet
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 4.2 Implement Marketplace contract

  - Create Marketplace contract (marketplace.move)
  - Define Listing struct with nft_id, nft_type, seller, price, timestamp
  - Implement list_nft function with escrow mechanism
  - Implement buy_nft function with payment transfer
  - Implement cancel_listing function to return NFT to seller
  - Add marketplace fee calculation (2.5%)
  - Write Move unit tests for Marketplace contract
  - Deploy contract to OneChain testnet
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 5. Starter Pokémon System





  - Create starter selection page (app/starter/page.tsx)
  - Implement usePlayerPokemon hook to check if player has NFTs
  - Create StarterSelection component displaying 9 starter options
  - Fetch starter Pokémon data from FastAPI
  - Implement useMintPokemon hook for minting transactions
  - Create transaction signing flow with OneWallet
  - Save starter selection to Firestore players collection
  - Display minting success/error states with toast notifications
  - Redirect to game page after successful mint
  - _Requirements: 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Battle Engine Backend





  - Create BattleEngine class in FastAPI (services/battle_engine.py)
  - Implement type effectiveness chart (fire, water, grass, electric, etc.)
  - Implement calculate_damage function with Pokémon damage formula
  - Implement get_type_effectiveness function
  - Implement calculate_capture_rate function based on health and rarity
  - Implement award_experience function
  - Implement check_level_up function (XP = Level^3)
  - Create API endpoints: POST /api/battle/calculate-damage, POST /api/battle/capture-rate
  - Write unit tests for battle calculations
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Gemini AI Integration





  - Create GeminiService class in FastAPI (services/gemini_service.py)
  - Configure Gemini 2.0 Flash model with API key
  - Implement generate_encounter_text function with prompt engineering
  - Implement generate_battle_commentary function
  - Implement select_ai_move function for AI trainer strategy
  - Implement generate_quest function for personalized quests
  - Implement generate_hatching_text function
  - Create API endpoints: POST /api/ai/encounter, POST /api/ai/commentary, POST /api/ai/move
  - Implement rate limiting and error handling for Gemini API
  - _Requirements: 3.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5, 10.6_

- [x] 8. Wild Encounter and Capture System





  - Create encounter page (app/encounter/page.tsx)
  - Implement encounter cooldown check (5 minutes) in Firestore
  - Create WildEncounter component displaying Pokémon and AI description
  - Fetch random Pokémon with rarity weighting from FastAPI
  - Display Gemini-generated encounter text
  - Implement capture attempt UI with success rate display
  - Create capture flow: calculate rate → attempt capture → mint NFT if successful
  - Update Firestore gameState with last encounter time
  - Display capture success/failure with animations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 9. Battle System Frontend





  - Create battle page (app/battle/page.tsx)
  - Implement BattleField component showing player and opponent Pokémon
  - Create MoveSelection component for choosing attacks
  - Implement health bar component with animations
  - Create battle log component displaying turn-by-turn actions
  - Implement AI commentary feed with Gemini-generated text
  - Create battle state management with Zustand
  - Implement turn-based battle flow (player move → AI move → damage calculation)
  - Call FastAPI battle engine for damage calculations
  - Display type effectiveness indicators
  - Show critical hit and effectiveness messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9.1 Implement battle completion and rewards


  - Detect battle end condition (Pokémon HP reaches 0)
  - Calculate experience points for winner
  - Update Pokémon NFT stats on-chain (call update_stats)
  - Check for level up and display notification
  - Increment egg incubation steps (+10 per battle win)
  - Save battle history to Firestore battleHistory collection
  - Display victory/defeat screen with Gemini-generated summary
  - Award quest progress if applicable
  - _Requirements: 4.5, 6.1, 6.2, 6.3, 6.4, 6.5, 10.4_

- [x] 10. Egg Breeding and Incubation System




  - Create breeding page (app/breeding/page.tsx)
  - Display player's Pokémon collection for breeding
  - Implement parent selection UI (select 2 Pokémon)
  - Check breeding compatibility (shared egg group)
  - Create breed transaction calling smart contract
  - Mint Egg NFT with parent genetics
  - Create incubation dashboard showing active eggs (max 3)
  - Display incubation progress bars (X/1000 steps)
  - Implement hatch button when steps reach 1000
  - Create hatching animation with Gemini-generated reveal text
  - Call hatch_egg smart contract function
  - Mint new Pokémon NFT with inherited traits
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 11. Marketplace Frontend





  - Create marketplace page (app/marketplace/page.tsx)
  - Fetch active listings from Firestore marketplaceListings collection
  - Display NFT grid with Pokémon/Egg details and prices
  - Implement filter UI (type, rarity, price range)
  - Create ListNFT modal for sellers to set price
  - Implement list transaction calling marketplace smart contract
  - Create purchase confirmation modal
  - Implement buy transaction with payment transfer
  - Update Firestore listing status after purchase
  - Display user's active listings with cancel option
  - Implement cancel listing transaction
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 12. Quest and Daily Challenge System





  - Create quest service in FastAPI (services/quest_service.py)
  - Implement quest generation using Gemini API based on player team
  - Create quest data models (Quest, Objective, Reward)
  - Implement daily challenge generation (3 challenges every 24 hours)
  - Create API endpoints: GET /api/quests, POST /api/quests/generate, POST /api/quests/complete
  - Create quests page (app/quests/page.tsx)
  - Display active quests and daily challenges
  - Implement quest progress tracking in Firestore
  - Update quest progress based on player actions (battles, captures, hatches)
  - Implement quest completion detection and reward distribution
  - Display quest rewards (tokens, rare encounters, Egg NFTs)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 13. AI Trainer Dialogue System




  - Create dialogue component (components/AITrainerDialogue.tsx)
  - Implement chat interface for player-trainer conversations
  - Create trainer personality profiles (friendly, competitive, mysterious)
  - Send player messages to Gemini API with trainer context
  - Display AI-generated responses within 3 seconds
  - Maintain conversation history for context continuity
  - Implement dialogue triggers (before battle, after victory, random encounters)
  - Add trainer avatar and speech bubble UI
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Player Profile and Collection




  - Create profile page (app/profile/page.tsx)
  - Display player stats (total battles, wins, Pokémon caught, eggs hatched)
  - Fetch player's Pokémon NFTs from blockchain
  - Display Pokémon collection grid with details
  - Show Egg NFTs with incubation progress
  - Implement Pokémon detail modal (stats, level, XP, moves)
  - Display battle history from Firestore
  - Add username edit functionality
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.4, 3.5_

- [x] 15. UI/UX Polish and Animations





  - Implement loading states for all async operations
  - Add skeleton loaders for data fetching
  - Create smooth page transitions
  - Implement toast notifications for user actions
  - Add battle animations (attack effects, damage numbers)
  - Create Pokémon sprite animations
  - Implement responsive design for mobile devices
  - Add sound effects for battles and captures (optional)
  - Create error boundary components
  - Implement dark mode toggle (optional)
  - _Requirements: All_

- [x] 16. Testing and Optimization





  - Write integration tests for critical user flows
  - Test wallet connection and transaction signing
  - Test battle calculations and XP awards
  - Test marketplace listing and purchasing
  - Test egg breeding and hatching
  - Optimize Firestore queries with indexes
  - Implement Next.js ISR for static Pokémon pages
  - Optimize images with Next.js Image component
  - Test on OneChain testnet with real transactions
  - Performance audit with Lighthouse
  - _Requirements: All_

- [ ] 17. Deployment Preparation
  - Set up Vercel project for Next.js frontend
  - Configure environment variables in Vercel
  - Deploy FastAPI backend to Railway or Render
  - Set up Redis instance (Upstash or Redis Cloud)
  - Configure Firebase production project
  - Update Firestore security rules for production
  - Deploy smart contracts to OneChain mainnet
  - Update frontend with mainnet contract addresses
  - Set up monitoring and error tracking (Sentry)
  - Create deployment documentation
  - _Requirements: All_

- [ ] 18. Documentation and User Guide
  - Write README with project overview and setup instructions
  - Create user guide for connecting OneWallet
  - Document game mechanics (battles, breeding, marketplace)
  - Create developer documentation for smart contracts
  - Document API endpoints and data models
  - Create troubleshooting guide
  - Add inline code comments
  - _Requirements: All_
