# Testing Guide

This document provides comprehensive testing instructions for PokéChain Battles.

## Test Structure

```
frontend/
├── __tests__/
│   ├── integration/
│   │   ├── wallet-connection.test.ts
│   │   ├── battle-system.test.ts
│   │   ├── marketplace.test.ts
│   │   └── breeding-system.test.ts
│   └── e2e/
│       └── (future Playwright tests)
backend/
├── test_pokemon_service.py
├── test_battle_engine.py
├── test_gemini_service.py
├── test_ai_endpoints.py
└── test_quest_service.py
```

## Running Tests

### Backend Tests (Python/pytest)

```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest test_battle_engine.py

# Run with coverage
pytest --cov=services --cov-report=html

# Run with verbose output
pytest -v

# Run specific test
pytest test_battle_engine.py::test_calculate_damage
```

### Frontend Tests (Vitest)

First, install testing dependencies:

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest --run",
    "test:watch": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

Run tests:

```bash
# Run all tests once
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Integration Tests

### 1. Wallet Connection Tests

**File:** `__tests__/integration/wallet-connection.test.ts`

Tests:
- ✅ Detect OneWallet installation
- ✅ Connect wallet and retrieve address
- ✅ Retrieve wallet balance
- ✅ Handle wallet disconnection
- ✅ Prepare transaction for signing
- ✅ Handle transaction success/failure

**Run:**
```bash
npm test wallet-connection
```

### 2. Battle System Tests

**File:** `__tests__/integration/battle-system.test.ts`

Tests:
- ✅ Calculate damage correctly
- ✅ Apply type effectiveness
- ✅ Calculate critical hits
- ✅ Award experience points
- ✅ Detect level up
- ✅ Calculate stat increases
- ✅ Determine turn order
- ✅ Detect battle end
- ✅ Increment egg incubation

**Run:**
```bash
npm test battle-system
```

### 3. Marketplace Tests

**File:** `__tests__/integration/marketplace.test.ts`

Tests:
- ✅ Create valid Pokémon NFT listing
- ✅ Create valid Egg NFT listing
- ✅ Validate listing price
- ✅ Calculate marketplace fee
- ✅ Validate buyer balance
- ✅ Update listing status after purchase
- ✅ Allow seller to cancel listing
- ✅ Prevent non-seller cancellation
- ✅ Filter by NFT type
- ✅ Filter by price range
- ✅ Filter by rarity

**Run:**
```bash
npm test marketplace
```

### 4. Breeding System Tests

**File:** `__tests__/integration/breeding-system.test.ts`

Tests:
- ✅ Allow breeding with shared egg group
- ✅ Prevent breeding without shared egg group
- ✅ Verify same owner
- ✅ Create egg with parent genetics
- ✅ Initialize egg with zero steps
- ✅ Increment incubation on battle win
- ✅ Increment incubation on capture
- ✅ Calculate incubation progress
- ✅ Detect when ready to hatch
- ✅ Prevent premature hatching
- ✅ Generate Pokémon from genetics
- ✅ Inherit stats from parents
- ✅ Create new NFT on hatch
- ✅ Enforce 3 egg limit

**Run:**
```bash
npm test breeding-system
```

## Manual Testing Checklist

### Wallet Integration
- [ ] Install OneWallet extension
- [ ] Connect wallet to application
- [ ] Verify wallet address displayed
- [ ] Check balance display
- [ ] Disconnect and reconnect
- [ ] Switch networks (testnet/mainnet)
- [ ] Test with multiple wallets

### Starter Pokémon
- [ ] New user receives starter selection
- [ ] 9 starter options displayed
- [ ] Select starter Pokémon
- [ ] Sign minting transaction
- [ ] Verify NFT in wallet
- [ ] Check Firestore player record
- [ ] Returning user skips starter

### Wild Encounters
- [ ] Click "Explore" button
- [ ] Verify 5-minute cooldown
- [ ] View wild Pokémon details
- [ ] Read AI-generated description
- [ ] Attempt capture
- [ ] View success rate
- [ ] Successful capture mints NFT
- [ ] Failed capture shows retry

### Battle System
- [ ] Start battle with AI trainer
- [ ] View both Pokémon stats
- [ ] Select move from list
- [ ] AI selects move
- [ ] Damage calculated correctly
- [ ] Type effectiveness shown
- [ ] Health bars update
- [ ] Battle log displays actions
- [ ] AI commentary appears
- [ ] Battle ends when HP = 0
- [ ] XP awarded to winner
- [ ] Level up notification
- [ ] Stats updated on-chain
- [ ] Egg incubation incremented

### Breeding System
- [ ] View Pokémon collection
- [ ] Select two compatible Pokémon
- [ ] Verify egg group compatibility
- [ ] Sign breeding transaction
- [ ] Egg NFT created
- [ ] View incubation dashboard
- [ ] Progress bar shows steps
- [ ] Win battles to increment
- [ ] Reach 1000 steps
- [ ] Hatch button enabled
- [ ] Sign hatching transaction
- [ ] View hatching animation
- [ ] New Pokémon NFT created
- [ ] Inherited traits visible

### Marketplace
- [ ] View marketplace listings
- [ ] Filter by type (Pokémon/Egg)
- [ ] Filter by rarity
- [ ] Filter by price range
- [ ] Sort by price
- [ ] View NFT details
- [ ] List own NFT for sale
- [ ] Set listing price
- [ ] Sign listing transaction
- [ ] NFT moved to escrow
- [ ] Purchase listed NFT
- [ ] Verify sufficient balance
- [ ] Sign purchase transaction
- [ ] NFT transferred to buyer
- [ ] Payment sent to seller
- [ ] Marketplace fee deducted
- [ ] Cancel own listing
- [ ] NFT returned to wallet

### Quest System
- [ ] View active quests
- [ ] Read quest objectives
- [ ] Track quest progress
- [ ] Complete quest objectives
- [ ] Receive quest rewards
- [ ] View daily challenges
- [ ] Complete daily challenges
- [ ] Challenges reset after 24h
- [ ] Generate new quest
- [ ] AI-generated quest narrative

### Profile
- [ ] View player stats
- [ ] See total battles
- [ ] See win count
- [ ] See Pokémon caught
- [ ] See eggs hatched
- [ ] View Pokémon collection
- [ ] View Egg NFTs
- [ ] Click Pokémon for details
- [ ] View battle history
- [ ] Edit username

## OneChain Testnet Testing

### Setup
1. Get testnet tokens from faucet
2. Configure wallet for testnet
3. Deploy contracts to testnet
4. Update frontend with contract addresses

### Test Transactions
- [ ] Mint starter Pokémon NFT
- [ ] Mint captured Pokémon NFT
- [ ] Update Pokémon stats
- [ ] Breed Pokémon (create Egg NFT)
- [ ] Increment egg incubation
- [ ] Hatch egg (burn Egg, mint Pokémon)
- [ ] List NFT on marketplace
- [ ] Purchase NFT from marketplace
- [ ] Cancel marketplace listing

### Verify On-Chain
- [ ] Check NFT ownership
- [ ] Verify NFT metadata
- [ ] Confirm stat updates
- [ ] Check marketplace escrow
- [ ] Verify payment transfers
- [ ] Check gas costs

## Performance Testing

### Lighthouse Audit

```bash
# Build production version
npm run build

# Start production server
npm run start

# Run Lighthouse (in another terminal)
npx lighthouse http://localhost:3000 --view

# Or use Chrome DevTools
# 1. Open Chrome DevTools
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Test homepage
artillery quick --count 100 --num 10 http://localhost:3000

# Test API endpoints
artillery quick --count 50 --num 5 http://localhost:8000/api/pokemon/1
```

### Bundle Size Analysis

```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
```

**Target Sizes:**
- Initial load: < 500KB
- Total JavaScript: < 1MB
- Largest chunk: < 200KB

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
```bash
# Install dependencies
npm install
# or
pip install -r requirements.txt
```

**Wallet connection fails in tests**
- Mock wallet provider in test setup
- Use test wallet addresses

**Firestore permission denied**
- Use Firebase emulator for tests
- Configure test security rules

**Transaction simulation fails**
- Ensure testnet is running
- Check gas budget
- Verify contract addresses

## Best Practices

1. **Write tests first** (TDD approach)
2. **Test critical paths** thoroughly
3. **Mock external dependencies** (APIs, blockchain)
4. **Use descriptive test names**
5. **Keep tests isolated** (no shared state)
6. **Test edge cases** (empty data, errors)
7. **Maintain test coverage** (> 80%)
8. **Run tests before commits**
9. **Update tests with code changes**
10. **Document test scenarios**

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Pytest Documentation](https://docs.pytest.org/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Artillery Load Testing](https://www.artillery.io/)
