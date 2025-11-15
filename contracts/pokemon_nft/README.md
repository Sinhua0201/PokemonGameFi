# PokéChain Battles - Smart Contracts

This directory contains the Move smart contracts for the PokéChain Battles game on OneChain (Sui-based blockchain).

## 📁 Contract Structure

```
pokemon_nft/
├── sources/
│   ├── pokemon.move       # Pokémon NFT contract
│   ├── egg.move          # Egg NFT breeding contract
│   └── marketplace.move  # NFT marketplace contract
├── tests/
│   ├── pokemon_tests.move
│   ├── egg_tests.move
│   └── marketplace_tests.move
├── Move.toml             # Package configuration
└── README.md
```

## 🎮 Contracts Overview

### 1. Pokémon NFT Contract (`pokemon.move`)

**Purpose:** Manages Pokémon NFT lifecycle and attributes

**Key Features:**
- Mint starter Pokémon for new players (9 options)
- Mint captured wild Pokémon with level scaling
- Update stats after battles and leveling up
- Query Pokémon attributes

**Main Functions:**
- `mint_starter()` - Mint a level 1 starter Pokémon
- `mint_captured()` - Mint a wild Pokémon at any level
- `update_stats()` - Update Pokémon stats after leveling up

**Data Structure:**
```move
public struct Pokemon has key, store {
    id: UID,
    species_id: u64,        // 1-151 for Gen 1
    name: String,
    level: u64,
    experience: u64,
    stats: Stats,           // hp, attack, defense, speed
    types: vector<String>,  // e.g., ["fire"], ["water", "flying"]
    owner: address,
    mint_timestamp: u64,
}
```

### 2. Egg NFT Contract (`egg.move`)

**Purpose:** Implements breeding and incubation system

**Key Features:**
- Breed two Pokémon to create an Egg NFT
- Incubation progress tracking (1000 steps required)
- Battle wins add 10 steps per victory
- Hatch eggs into new Pokémon NFTs

**Main Functions:**
- `breed_pokemon()` - Create an egg from two parent Pokémon
- `increment_incubation()` - Add incubation steps
- `add_battle_steps()` - Add 10 steps after battle win
- `hatch_egg()` - Convert egg to Pokémon NFT

**Data Structure:**
```move
public struct Egg has key, store {
    id: UID,
    parent1_species: u64,
    parent2_species: u64,
    incubation_steps: u64,
    required_steps: u64,    // Always 1000
    genetics: vector<u8>,   // Hidden until hatch
    owner: address,
    created_timestamp: u64,
}
```

### 3. Marketplace Contract (`marketplace.move`)

**Purpose:** Facilitates NFT trading with escrow

**Key Features:**
- List Pokémon and Egg NFTs for sale
- Secure escrow mechanism
- Automatic fee calculation (2.5%)
- Cancel listings and return NFTs

**Main Functions:**
- `list_pokemon()` / `list_egg()` - Create marketplace listing
- `buy_pokemon()` / `buy_egg()` - Purchase listed NFT
- `cancel_listing()` - Remove listing and return NFT
- `update_fee()` - Admin function to adjust marketplace fee

**Data Structure:**
```move
public struct Marketplace has key {
    id: UID,
    listings: Table<ID, Listing>,
    fee_percentage: u64,        // 250 = 2.5%
    collected_fees: Balance<SUI>,
}
```

## 🧪 Testing

The contracts include comprehensive unit tests covering:

### Pokémon Tests (`pokemon_tests.move`)
- ✅ Mint starter Pokémon (Bulbasaur, Charmander, Squirtle, etc.)
- ✅ Mint captured Pokémon with level scaling
- ✅ Update stats after leveling up
- ✅ Verify all 9 starter options

### Egg Tests (`egg_tests.move`)
- ✅ Breed Pokémon to create eggs
- ✅ Increment incubation progress
- ✅ Add battle steps (10 per win)
- ✅ Cap incubation at 1000 steps
- ✅ Hatch eggs into Pokémon
- ✅ Prevent hatching before completion

### Marketplace Tests (`marketplace_tests.move`)
- ✅ Initialize marketplace with admin cap
- ✅ List Pokémon and Egg NFTs
- ✅ Validate price requirements
- ✅ Update marketplace fee
- ✅ Calculate fees correctly (2.5%)
- ✅ Handle multiple listings

## 🚀 Deployment

### Prerequisites

1. **Install Rust**
   ```powershell
   # Download from https://rustup.rs/
   # Or use installer: https://win.rustup.rs/x86_64
   ```

2. **Install Sui CLI**
   ```powershell
   cargo install --locked sui
   ```
   ⏱️ This takes 10-30 minutes

3. **Create Wallet**
   ```powershell
   sui client
   # Select testnet (option 0)
   # Select ed25519 (option 0)
   ```

4. **Get Test Tokens**
   ```powershell
   sui client faucet
   ```

### Deploy to Testnet

```powershell
# Navigate to contracts directory
cd contracts/pokemon_nft

# Run tests
sui move test

# Build the package
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000
```

### After Deployment

1. **Save Package ID**
   - Copy the package ID from deployment output
   - Update `.env` files with the package ID

2. **Save Object IDs**
   - Marketplace shared object ID
   - Admin capability object ID

3. **Update Frontend Configuration**
   ```typescript
   // frontend/config/constants.ts
   export const PACKAGE_ID = "0x..."; // Your deployed package ID
   export const MARKETPLACE_ID = "0x..."; // Marketplace object ID
   ```

## 📝 Contract Addresses

After deployment, update these addresses:

```
Package ID: 0x________________
Marketplace ID: 0x________________
Admin Cap ID: 0x________________
```

## 🔧 Development

### Build Contract
```powershell
sui move build
```

### Run Tests
```powershell
sui move test
```

### Run Specific Test
```powershell
sui move test test_mint_starter_bulbasaur
```

### Check for Errors
```powershell
sui move build --lint
```

## 📊 Gas Estimates

Approximate gas costs on testnet:

| Operation | Gas Cost (MIST) |
|-----------|----------------|
| Mint Starter | ~1,000,000 |
| Mint Captured | ~1,200,000 |
| Update Stats | ~500,000 |
| Breed Pokémon | ~1,500,000 |
| Hatch Egg | ~2,000,000 |
| List NFT | ~800,000 |
| Buy NFT | ~1,000,000 |

*Note: 1 SUI = 1,000,000,000 MIST*

## 🔐 Security Considerations

### Access Control
- Only NFT owner can update stats
- Only marketplace contract can handle escrowed NFTs
- Admin functions protected by capability pattern

### Validation
- All inputs validated (level caps, stat ranges)
- Integer overflow/underflow prevention
- NFT ownership verification before operations

### Best Practices
- Use shared objects for marketplace
- Implement proper escrow mechanism
- Validate all transaction parameters
- Test edge cases thoroughly

## 🐛 Troubleshooting

### Build Errors

**Error:** "Package not found"
```powershell
# Solution: Check Move.toml configuration
sui move build --lint
```

**Error:** "Type mismatch"
```powershell
# Solution: Verify function signatures match
# Check that all types are properly imported
```

### Test Failures

**Error:** "Test timeout"
```powershell
# Solution: Increase timeout
sui move test --gas-limit 100000000
```

### Deployment Issues

**Error:** "Insufficient gas"
```powershell
# Solution: Get more test tokens
sui client faucet

# Or increase gas budget
sui client publish --gas-budget 200000000
```

## 📚 Resources

- [Sui Documentation](https://docs.sui.io/)
- [Move Language Book](https://move-language.github.io/move/)
- [Sui Move Examples](https://github.com/MystenLabs/sui/tree/main/examples)
- [OneChain Documentation](https://onechain.io/docs)

## 🎯 Next Steps

After deploying contracts:

1. ✅ Update frontend with package ID
2. ✅ Configure backend blockchain service
3. ✅ Test wallet integration
4. ✅ Test NFT minting flow
5. ✅ Test marketplace functionality
6. ✅ Deploy to mainnet (after audit)

## 📞 Support

For issues or questions:
- Check [DEPLOYMENT_GUIDE_CN.md](../DEPLOYMENT_GUIDE_CN.md)
- Review [MOVE_LANGUAGE_GUIDE_CN.md](../MOVE_LANGUAGE_GUIDE_CN.md)
- Visit Sui Discord: https://discord.gg/sui

---

**Contract Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Network:** OneChain Testnet (Sui-based)
