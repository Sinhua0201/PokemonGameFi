# 🏗️ Smart Contract Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Wallet UI    │  │ Battle UI    │  │ Marketplace  │      │
│  │ (OneWallet)  │  │ (Game)       │  │ (Trading)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              OneChain Blockchain (Sui-based)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pokémon NFT  │  │ Egg NFT      │  │ Marketplace  │      │
│  │ Contract     │  │ Contract     │  │ Contract     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Contract Relationships

```
pokemon_nft::pokemon
    │
    ├─► Used by: egg::hatch_egg()
    │   (Creates new Pokémon from egg)
    │
    └─► Used by: marketplace::list_pokemon()
        (Lists Pokémon for sale)

pokemon_nft::egg
    │
    ├─► Uses: pokemon (for hatching)
    │
    └─► Used by: marketplace::list_egg()
        (Lists eggs for sale)

pokemon_nft::marketplace
    │
    ├─► Manages: Pokemon NFTs
    │
    └─► Manages: Egg NFTs
```

## Data Flow Diagrams

### 1. Starter Pokémon Flow

```
Player Connects Wallet
        │
        ▼
Frontend: Select Starter
        │
        ▼
Create Transaction
        │
        ▼
pokemon::mint_starter()
        │
        ├─► Create Pokemon struct
        │   - species_id: 1-175
        │   - level: 1
        │   - experience: 0
        │   - stats: base stats
        │   - types: ["fire"], etc.
        │
        ▼
Transfer to Player
        │
        ▼
Player Owns NFT
```

### 2. Wild Capture Flow

```
Player Encounters Wild Pokémon
        │
        ▼
Backend: Generate Random Pokémon
        │
        ▼
Player Attempts Capture
        │
        ▼
Backend: Calculate Success Rate
        │
        ├─► Success?
        │   │
        │   ▼ Yes
        │   pokemon::mint_captured()
        │   - species_id: random
        │   - level: scaled
        │   - experience: level³
        │   - stats: scaled by level
        │   │
        │   ▼
        │   Transfer to Player
        │
        └─► No: Try again
```

### 3. Battle and Level Up Flow

```
Player Wins Battle
        │
        ▼
Backend: Calculate XP Gained
        │
        ▼
Check Level Up
        │
        ├─► Level Up?
        │   │
        │   ▼ Yes
        │   Backend: Calculate New Stats
        │   │
        │   ▼
        │   pokemon::update_stats()
        │   - new_experience
        │   - new_level
        │   - new_stats
        │   │
        │   ▼
        │   NFT Updated On-Chain
        │
        └─► No: Just add XP
```

### 4. Egg Breeding Flow

```
Player Selects 2 Pokémon
        │
        ▼
Frontend: Verify Compatibility
        │
        ▼
Backend: Generate Genetics
        │
        ▼
egg::breed_pokemon()
        │
        ├─► Create Egg struct
        │   - parent1_species
        │   - parent2_species
        │   - incubation_steps: 0
        │   - required_steps: 1000
        │   - genetics: hidden
        │
        ▼
Transfer Egg to Player
        │
        ▼
Player Incubates Egg
        │
        ├─► Win Battle
        │   │
        │   ▼
        │   egg::add_battle_steps()
        │   (adds 10 steps)
        │   │
        │   ▼
        │   Check if ready (1000 steps)
        │   │
        │   ▼ Ready
        │   egg::hatch_egg()
        │   │
        │   ├─► Destroy Egg
        │   │
        │   └─► pokemon::mint_captured()
        │       (creates new Pokémon)
        │
        └─► Repeat until 1000 steps
```

### 5. Marketplace Flow

```
Seller Lists NFT
        │
        ▼
marketplace::list_pokemon() or list_egg()
        │
        ├─► Create Listing
        │   - nft_id
        │   - nft_type (1=Pokemon, 2=Egg)
        │   - seller
        │   - price
        │   - timestamp
        │
        ├─► Transfer NFT to Escrow
        │
        └─► Add to Listings Table
        │
        ▼
Buyer Browses Marketplace
        │
        ▼
Buyer Purchases NFT
        │
        ▼
marketplace::buy_pokemon() or buy_egg()
        │
        ├─► Verify Payment
        │
        ├─► Calculate Fee (2.5%)
        │   - fee_amount = price * 250 / 10000
        │   - seller_amount = price - fee_amount
        │
        ├─► Split Payment
        │   - Fee → Marketplace
        │   - Seller Amount → Seller
        │
        ├─► Transfer NFT to Buyer
        │
        └─► Remove Listing
```

## Object Ownership Model

### Owned Objects (Transferable)

```
Pokemon NFT
    owner: address
    ├─► Can be transferred
    ├─► Can be listed on marketplace
    └─► Can be used in breeding

Egg NFT
    owner: address
    ├─► Can be transferred
    ├─► Can be listed on marketplace
    └─► Can be hatched

MarketplaceAdminCap
    owner: address (admin)
    ├─► Cannot be transferred (unless explicitly)
    └─► Grants admin privileges
```

### Shared Objects (Accessible by All)

```
Marketplace
    ├─► Shared object
    ├─► Anyone can list NFTs
    ├─► Anyone can buy NFTs
    └─► Only admin can update fees
```

## State Transitions

### Pokémon NFT States

```
[Not Exists]
    │
    ├─► mint_starter() → [Level 1 Starter]
    │
    └─► mint_captured() → [Wild Pokémon]
        │
        ▼
[Owned by Player]
    │
    ├─► update_stats() → [Leveled Up]
    │   (can repeat)
    │
    ├─► list_pokemon() → [Listed on Marketplace]
    │   │
    │   ├─► buy_pokemon() → [Owned by New Player]
    │   │
    │   └─► cancel_listing() → [Owned by Original Player]
    │
    └─► breed_pokemon() → [Used as Parent]
        (Pokémon remains owned, creates Egg)
```

### Egg NFT States

```
[Not Exists]
    │
    ▼
breed_pokemon()
    │
    ▼
[Egg: 0/1000 steps]
    │
    ├─► increment_incubation()
    │   │
    │   ▼
    │   [Egg: X/1000 steps]
    │   (repeat until 1000)
    │
    └─► add_battle_steps()
        (adds 10 per battle)
        │
        ▼
[Egg: 1000/1000 steps - Ready]
    │
    ▼
hatch_egg()
    │
    ├─► Destroy Egg
    │
    └─► Create Pokémon NFT
```

### Marketplace Listing States

```
[NFT Owned by Player]
    │
    ▼
list_pokemon() or list_egg()
    │
    ├─► NFT → Escrow
    │
    └─► Create Listing
        │
        ▼
[Listed on Marketplace]
    │
    ├─► buy_pokemon() or buy_egg()
    │   │
    │   ├─► Payment → Seller (97.5%)
    │   ├─► Fee → Marketplace (2.5%)
    │   ├─► NFT → Buyer
    │   └─► Remove Listing
    │       │
    │       ▼
    │   [NFT Owned by Buyer]
    │
    └─► cancel_listing()
        │
        ├─► NFT → Original Owner
        └─► Remove Listing
            │
            ▼
        [NFT Owned by Original Owner]
```

## Security Model

### Access Control Matrix

| Function | Who Can Call | Validation |
|----------|-------------|------------|
| `mint_starter()` | Anyone | First-time only (enforced in frontend) |
| `mint_captured()` | Anyone | Backend validates capture success |
| `update_stats()` | Anyone | Backend calculates correct stats |
| `breed_pokemon()` | Anyone | Frontend validates compatibility |
| `increment_incubation()` | Anyone | Capped at 1000 steps |
| `hatch_egg()` | Egg Owner | Must have 1000 steps |
| `list_pokemon()` | NFT Owner | Must own the NFT |
| `buy_pokemon()` | Anyone | Must pay correct amount |
| `cancel_listing()` | Seller Only | Verified on-chain |
| `update_fee()` | Admin Only | Requires MarketplaceAdminCap |
| `withdraw_fees()` | Admin Only | Requires MarketplaceAdminCap |

### Capability Pattern

```
MarketplaceAdminCap
    │
    ├─► Grants: update_fee()
    │
    └─► Grants: withdraw_fees()

Without Cap:
    ├─► Can: list_pokemon()
    ├─► Can: buy_pokemon()
    └─► Can: cancel_listing() (if seller)
```

## Gas Optimization Strategies

### 1. Struct Design
- Use `u64` instead of `u256` where possible
- Group related fields together
- Use `copy` and `drop` abilities when appropriate

### 2. Function Design
- Pass references (`&Pokemon`) instead of values when reading
- Use `entry` functions for external calls
- Minimize vector operations

### 3. Storage Optimization
- Store only essential data on-chain
- Use off-chain storage (Firestore) for metadata
- Cache frequently accessed data

## Integration Points

### Frontend → Contracts

```typescript
// Mint Starter
tx.moveCall({
  target: `${PACKAGE_ID}::pokemon::mint_starter`,
  arguments: [species_id, name, types, clock],
});

// Update Stats
tx.moveCall({
  target: `${PACKAGE_ID}::pokemon::update_stats`,
  arguments: [pokemon_ref, xp, level, hp, atk, def, spd],
});

// List on Marketplace
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::list_pokemon`,
  arguments: [marketplace_ref, pokemon, price, clock],
});
```

### Backend → Contracts

```python
# Prepare transaction data
tx_data = {
    "target": f"{PACKAGE_ID}::pokemon::mint_captured",
    "arguments": [species_id, name, level, types]
}

# Frontend signs and executes
```

## Testing Strategy

### Unit Tests
- Test each function independently
- Test edge cases (level 1, level 100, etc.)
- Test failure cases (insufficient steps, wrong owner, etc.)

### Integration Tests
- Test contract interactions (breed → hatch)
- Test marketplace flow (list → buy)
- Test stat updates after battles

### End-to-End Tests
- Test complete user flows
- Test with real wallet
- Test on testnet before mainnet

## Deployment Architecture

```
Development
    │
    ├─► Local Testing
    │   - sui move test
    │   - Unit tests
    │
    ▼
Testnet Deployment
    │
    ├─► Integration Testing
    │   - Frontend integration
    │   - Backend integration
    │   - User acceptance testing
    │
    ├─► Security Audit
    │   - Code review
    │   - Vulnerability scan
    │   - Gas optimization
    │
    ▼
Mainnet Deployment
    │
    └─► Production Monitoring
        - Transaction monitoring
        - Error tracking
        - Gas usage analysis
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Network:** OneChain (Sui-based)
