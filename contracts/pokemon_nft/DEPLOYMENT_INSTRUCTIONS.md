# 🚀 Smart Contract Deployment Instructions

This guide walks you through deploying the PokéChain Battles smart contracts to OneChain testnet.

## ✅ Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Rust installed (`rustc --version`)
- [ ] Sui CLI installed (`sui --version`)
- [ ] Wallet created (`sui client active-address`)
- [ ] Test tokens (at least 0.5 SUI)

If you haven't completed these steps, see [INSTALL_GUIDE_CN.md](../INSTALL_GUIDE_CN.md).

## 📋 Pre-Deployment Steps

### 1. Verify Environment

```powershell
# Check Rust
rustc --version
# Expected: rustc 1.xx.x

# Check Sui CLI
sui --version
# Expected: sui x.x.x

# Check wallet
sui client active-address
# Expected: 0x... (your wallet address)

# Check balance
sui client gas
# Expected: At least 0.5 SUI
```

### 2. Get Test Tokens (if needed)

```powershell
sui client faucet
```

Wait 30-60 seconds, then verify:

```powershell
sui client gas
```

## 🧪 Step 1: Run Tests

Navigate to the contract directory and run tests:

```powershell
cd contracts/pokemon_nft
sui move test
```

**Expected Output:**
```
Running Move unit tests
[ PASS    ] pokemon_nft::pokemon_tests::test_mint_starter_bulbasaur
[ PASS    ] pokemon_nft::pokemon_tests::test_mint_starter_charmander
[ PASS    ] pokemon_nft::pokemon_tests::test_mint_captured_pokemon
[ PASS    ] pokemon_nft::pokemon_tests::test_update_stats
[ PASS    ] pokemon_nft::pokemon_tests::test_multiple_starters
[ PASS    ] pokemon_nft::egg_tests::test_breed_pokemon
[ PASS    ] pokemon_nft::egg_tests::test_increment_incubation
[ PASS    ] pokemon_nft::egg_tests::test_add_battle_steps
[ PASS    ] pokemon_nft::egg_tests::test_incubation_cap
[ PASS    ] pokemon_nft::egg_tests::test_hatch_egg
[ PASS    ] pokemon_nft::egg_tests::test_hatch_egg_not_ready
[ PASS    ] pokemon_nft::marketplace_tests::test_marketplace_initialization
[ PASS    ] pokemon_nft::marketplace_tests::test_list_pokemon
[ PASS    ] pokemon_nft::marketplace_tests::test_list_egg
[ PASS    ] pokemon_nft::marketplace_tests::test_list_with_zero_price
[ PASS    ] pokemon_nft::marketplace_tests::test_update_fee
[ PASS    ] pokemon_nft::marketplace_tests::test_fee_calculation
[ PASS    ] pokemon_nft::marketplace_tests::test_multiple_listings
Test result: OK. Total tests: 18; passed: 18; failed: 0
```

✅ All tests should pass before deployment.

## 🔨 Step 2: Build Contract

```powershell
sui move build
```

**Expected Output:**
```
UPDATING GIT DEPENDENCY https://github.com/MystenLabs/sui.git
INCLUDING DEPENDENCY Sui
INCLUDING DEPENDENCY MoveStdlib
BUILDING pokemon_nft
```

✅ Build should complete without errors.

## 🚀 Step 3: Deploy to Testnet

```powershell
sui client publish --gas-budget 100000000
```

⏱️ **This takes 10-30 seconds**

**Expected Output:**
```
----- Transaction Digest ----
<transaction_hash>

----- Transaction Data ----
...

----- Transaction Effects ----
Status : Success
Created Objects:
  - ID: 0x... , Owner: Immutable
  - ID: 0x... , Owner: Shared
  - ID: 0x... , Owner: Account Address ( 0x... )

----- Events ----
...

----- Object changes ----
Created Objects:
  - ObjectID: 0x...
    Sender: 0x...
    Owner: Immutable
    ObjectType: 0x2::package::UpgradeCap
    Version: 1
    Digest: ...

  - ObjectID: 0x...
    Sender: 0x...
    Owner: Shared
    ObjectType: 0x...::marketplace::Marketplace
    Version: 1
    Digest: ...

  - ObjectID: 0x...
    Sender: 0x...
    Owner: Account Address ( 0x... )
    ObjectType: 0x...::marketplace::MarketplaceAdminCap
    Version: 1
    Digest: ...
```

## 📝 Step 4: Save Important IDs

From the deployment output, save these IDs:

### Package ID
Look for the **Immutable** object (this is your package):
```
ObjectID: 0x1234567890abcdef...
Owner: Immutable
```

### Marketplace ID
Look for the **Shared** object with type `marketplace::Marketplace`:
```
ObjectID: 0xabcdef1234567890...
Owner: Shared
ObjectType: 0x...::marketplace::Marketplace
```

### Admin Capability ID
Look for the object owned by your account with type `MarketplaceAdminCap`:
```
ObjectID: 0xfedcba0987654321...
Owner: Account Address ( 0x... )
ObjectType: 0x...::marketplace::MarketplaceAdminCap
```

**Create a file to save these:**

```powershell
# Create deployment info file
echo "# Deployment Information" > DEPLOYMENT_INFO.txt
echo "" >> DEPLOYMENT_INFO.txt
echo "Package ID: 0x________________" >> DEPLOYMENT_INFO.txt
echo "Marketplace ID: 0x________________" >> DEPLOYMENT_INFO.txt
echo "Admin Cap ID: 0x________________" >> DEPLOYMENT_INFO.txt
echo "" >> DEPLOYMENT_INFO.txt
echo "Deployed on: $(Get-Date)" >> DEPLOYMENT_INFO.txt
echo "Network: Testnet" >> DEPLOYMENT_INFO.txt
```

## 🔧 Step 5: Update Configuration Files

### Frontend Configuration

Edit `frontend/.env.local`:

```env
# Add or update these lines
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=0x________________
NEXT_PUBLIC_MARKETPLACE_ID=0x________________
```

### Backend Configuration

Edit `backend/.env`:

```env
# Add or update these lines
ONECHAIN_PACKAGE_ID=0x________________
MARKETPLACE_ID=0x________________
ADMIN_CAP_ID=0x________________
```

## ✅ Step 6: Verify Deployment

### Check Package on Explorer

Visit the Sui Explorer:
```
https://suiexplorer.com/object/YOUR_PACKAGE_ID?network=testnet
```

### Test Contract Functions

```powershell
# Test minting a starter Pokémon
sui client call \
  --package YOUR_PACKAGE_ID \
  --module pokemon \
  --function mint_starter \
  --args 1 "Bulbasaur" '["grass","poison"]' \
  --gas-budget 10000000
```

## 🎯 Step 7: Integration Testing

### Test from Frontend

1. Start the frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

2. Open http://localhost:3000

3. Connect OneWallet

4. Try minting a starter Pokémon

### Test from Backend

1. Start the backend:
   ```powershell
   cd backend
   python main.py
   ```

2. Test blockchain service:
   ```powershell
   curl http://localhost:8000/api/blockchain/nfts/YOUR_WALLET_ADDRESS
   ```

## 📊 Gas Cost Summary

Actual gas costs from deployment:

| Operation | Estimated Gas (MIST) |
|-----------|---------------------|
| Package Deployment | ~50,000,000 |
| Mint Starter | ~1,000,000 |
| Mint Captured | ~1,200,000 |
| Update Stats | ~500,000 |
| Breed Pokémon | ~1,500,000 |
| Hatch Egg | ~2,000,000 |
| List NFT | ~800,000 |
| Buy NFT | ~1,000,000 |

*1 SUI = 1,000,000,000 MIST*

## 🐛 Troubleshooting

### Error: "Insufficient gas"

**Solution:**
```powershell
# Get more test tokens
sui client faucet

# Or increase gas budget
sui client publish --gas-budget 200000000
```

### Error: "Package not found"

**Solution:**
```powershell
# Verify you're in the correct directory
cd contracts/pokemon_nft

# Check Move.toml exists
ls Move.toml
```

### Error: "Build failed"

**Solution:**
```powershell
# Clean and rebuild
sui move clean
sui move build --lint
```

### Error: "Test failed"

**Solution:**
```powershell
# Run tests with verbose output
sui move test --verbose

# Run specific test
sui move test test_mint_starter_bulbasaur
```

## 🔄 Redeployment

If you need to redeploy (e.g., after code changes):

```powershell
# Clean previous build
sui move clean

# Run tests
sui move test

# Build
sui move build

# Deploy with new gas budget
sui client publish --gas-budget 100000000
```

**Important:** Each deployment creates a NEW package ID. You must update all configuration files with the new ID.

## 📚 Next Steps

After successful deployment:

1. ✅ Update frontend and backend configs
2. ✅ Test wallet connection
3. ✅ Test NFT minting
4. ✅ Test marketplace listing
5. ✅ Test egg breeding
6. ✅ Deploy to mainnet (after thorough testing)

## 🔐 Security Checklist

Before mainnet deployment:

- [ ] All tests passing
- [ ] Code reviewed by team
- [ ] Security audit completed
- [ ] Gas costs optimized
- [ ] Error handling tested
- [ ] Access controls verified
- [ ] Upgrade mechanism tested
- [ ] Documentation complete

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review [README.md](./README.md)
3. Check Sui documentation: https://docs.sui.io/
4. Join Sui Discord: https://discord.gg/sui

## 📝 Deployment Checklist

Print this checklist and check off each step:

```
Pre-Deployment:
□ Rust installed
□ Sui CLI installed
□ Wallet created
□ Test tokens obtained (0.5+ SUI)

Deployment:
□ Tests passed (sui move test)
□ Build successful (sui move build)
□ Deployed to testnet
□ Package ID saved
□ Marketplace ID saved
□ Admin Cap ID saved

Configuration:
□ Frontend .env.local updated
□ Backend .env updated
□ Configuration verified

Testing:
□ Contract verified on explorer
□ Frontend integration tested
□ Backend integration tested
□ NFT minting tested
□ Marketplace tested

Documentation:
□ DEPLOYMENT_INFO.txt created
□ Team notified of new IDs
□ README updated
```

---

**Deployment Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Network:** OneChain Testnet (Sui-based)

🎉 **Congratulations on deploying your smart contracts!**
