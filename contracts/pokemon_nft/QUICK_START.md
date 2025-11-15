# 🚀 Quick Start Guide - Smart Contracts

Get your PokéChain Battles smart contracts deployed in under 1 hour!

## ⚡ Fast Track (For Experienced Developers)

```powershell
# 1. Install prerequisites (if not already installed)
cargo install --locked sui

# 2. Create wallet
sui client
# Select: testnet (0), ed25519 (0)

# 3. Get test tokens
sui client faucet

# 4. Navigate to contracts
cd contracts/pokemon_nft

# 5. Run tests
sui move test

# 6. Deploy
sui client publish --gas-budget 100000000

# 7. Save the Package ID, Marketplace ID, and Admin Cap ID from output

# 8. Update configs
# frontend/.env.local: NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x...
# backend/.env: ONECHAIN_PACKAGE_ID=0x...
```

## 📋 Detailed Steps

### Step 1: Install Sui CLI (10-30 minutes)

**Prerequisites:** Rust must be installed first
- Download: https://rustup.rs/

**Install Sui CLI:**
```powershell
cargo install --locked sui
```

**Verify:**
```powershell
sui --version
```

### Step 2: Setup Wallet (2 minutes)

```powershell
# Create wallet
sui client

# Get test tokens
sui client faucet

# Check balance
sui client gas
```

### Step 3: Deploy Contracts (2 minutes)

```powershell
cd contracts/pokemon_nft

# Run tests (optional but recommended)
sui move test

# Deploy
sui client publish --gas-budget 100000000
```

### Step 4: Save IDs (1 minute)

From the deployment output, copy:

1. **Package ID** (Immutable object)
2. **Marketplace ID** (Shared object with type `marketplace::Marketplace`)
3. **Admin Cap ID** (Your account object with type `MarketplaceAdminCap`)

### Step 5: Update Configuration (1 minute)

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x________________
NEXT_PUBLIC_MARKETPLACE_ID=0x________________
```

**Backend** (`backend/.env`):
```env
ONECHAIN_PACKAGE_ID=0x________________
MARKETPLACE_ID=0x________________
ADMIN_CAP_ID=0x________________
```

## 🎮 Test Your Deployment

### Test 1: Mint a Starter Pokémon

```powershell
sui client call \
  --package YOUR_PACKAGE_ID \
  --module pokemon \
  --function mint_starter \
  --args 1 "Bulbasaur" '["grass","poison"]' 0x6 \
  --gas-budget 10000000
```

### Test 2: Check Your NFTs

```powershell
sui client objects
```

You should see your new Pokémon NFT!

## 📚 Contract Functions Reference

### Pokémon Contract

```move
// Mint starter (level 1)
mint_starter(species_id, name, types, clock, ctx)

// Mint captured (any level)
mint_captured(species_id, name, level, types, clock, ctx)

// Update stats after leveling
update_stats(pokemon, new_xp, new_level, hp, attack, defense, speed)
```

### Egg Contract

```move
// Create egg from breeding
breed_pokemon(parent1_species, parent2_species, genetics, clock, ctx)

// Add incubation steps
increment_incubation(egg, steps)

// Add steps after battle win (+10)
add_battle_steps(egg)

// Hatch egg (requires 1000 steps)
hatch_egg(egg, offspring_species, name, types, clock, ctx)
```

### Marketplace Contract

```move
// List Pokémon for sale
list_pokemon(marketplace, pokemon, price, clock, ctx)

// List Egg for sale
list_egg(marketplace, egg, price, clock, ctx)

// Purchase Pokémon
buy_pokemon(marketplace, nft_id, payment, ctx)

// Purchase Egg
buy_egg(marketplace, nft_id, payment, ctx)

// Cancel listing
cancel_listing(marketplace, nft_id, ctx)
```

## 🔍 Verify on Explorer

After deployment, check your contracts on Sui Explorer:

```
https://suiexplorer.com/object/YOUR_PACKAGE_ID?network=testnet
```

## 🐛 Common Issues

### "Sui command not found"
**Solution:** Restart PowerShell after installing Sui CLI

### "Insufficient gas"
**Solution:** Get more test tokens with `sui client faucet`

### "Build failed"
**Solution:** Make sure you're in `contracts/pokemon_nft` directory

### "Test failed"
**Solution:** Check that all dependencies are up to date:
```powershell
sui move build --lint
```

## 📊 What You Get

After deployment, you'll have:

- ✅ **3 Smart Contracts** deployed on testnet
- ✅ **Pokémon NFT System** - Mint and manage Pokémon
- ✅ **Egg Breeding System** - Breed and hatch new Pokémon
- ✅ **NFT Marketplace** - Trade Pokémon and Eggs
- ✅ **18 Unit Tests** - All passing
- ✅ **Complete Documentation** - Ready to integrate

## 🎯 Next Steps

1. **Integrate with Frontend**
   - Update wallet provider with package ID
   - Test minting flow
   - Test marketplace

2. **Integrate with Backend**
   - Update blockchain service
   - Test NFT queries
   - Test transaction preparation

3. **Test End-to-End**
   - Connect wallet
   - Mint starter
   - Capture Pokémon
   - Breed eggs
   - List on marketplace

## 📞 Need Help?

- **Full Documentation:** See `README.md`
- **Deployment Guide:** See `DEPLOYMENT_INSTRUCTIONS.md`
- **Installation Help:** See `../INSTALL_GUIDE_CN.md`
- **Sui Docs:** https://docs.sui.io/
- **Discord:** https://discord.gg/sui

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Install Sui CLI | 10-30 min |
| Setup Wallet | 2 min |
| Deploy Contracts | 2 min |
| Update Configs | 1 min |
| Test Integration | 5 min |
| **Total** | **20-40 min** |

---

**Ready to deploy?** Start with Step 1! 🚀

**Already deployed?** Jump to integration testing! 🎮
