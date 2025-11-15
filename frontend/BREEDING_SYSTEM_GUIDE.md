# 🥚 Breeding System Guide

## Overview

The Breeding System allows players to create Egg NFTs by breeding two Pokémon, incubate them through battles, and hatch new Pokémon with inherited traits.

## How to Access

Navigate to the Breeding page from the home screen or visit `/breeding` directly.

## Features

### 1. Breed Pokémon Tab

**Select Parents**
- View your entire Pokémon collection in a grid
- Click on two different Pokémon to select them as parents
- Selected Pokémon are highlighted with a blue ring
- Parent 1 and Parent 2 badges appear on selected Pokémon

**Breed Confirmation**
- After selecting two parents, a confirmation modal appears
- Shows both parent Pokémon and an egg icon
- Click "Breed Pokémon" to create the egg
- Transaction is signed with your OneWallet
- New Egg NFT is minted on the blockchain

**Limitations**
- Need at least 2 Pokémon to breed
- Can only incubate 3 eggs at a time
- Must hatch an egg before breeding more if at max capacity

### 2. Incubating Eggs Tab

**Egg Display**
- Shows all active eggs (max 3)
- Each egg card displays:
  - Parent Pokémon sprites and names
  - Incubation progress bar (X/1000 steps)
  - Percentage completion
  - Estimated battles remaining
  - Hatch button (when ready)

**Incubation Progress**
- Eggs gain +10 steps per battle victory
- Progress bars update automatically
- All active eggs gain steps simultaneously
- Visual indicator when egg is ready (green pulsing animation)

**Hatching**
- Click "Hatch Egg" when progress reaches 1000 steps
- AI generates unique reveal text for your new Pokémon
- Full-screen animation shows the hatched Pokémon
- New Pokémon NFT is minted on the blockchain
- Egg NFT is burned (destroyed)
- New Pokémon appears in your collection

## Step-by-Step Guide

### Breeding Your First Egg

1. **Navigate to Breeding Page**
   - Click the "Breeding" card on the home page
   - Or visit `/breeding` directly

2. **Select Parents**
   - Make sure you have at least 2 Pokémon
   - Click on the first Pokémon (becomes Parent 1)
   - Click on a different Pokémon (becomes Parent 2)
   - A confirmation modal will appear

3. **Confirm Breeding**
   - Review the selected parents
   - Click "Breed Pokémon" button
   - Sign the transaction in OneWallet
   - Wait for blockchain confirmation

4. **View Your Egg**
   - Switch to "Incubating Eggs" tab
   - Your new egg appears with 0/1000 steps
   - Shows both parent Pokémon

### Incubating Your Egg

1. **Win Battles**
   - Go to the Battle page
   - Win battles against AI trainers
   - Each victory adds +10 steps to ALL your eggs

2. **Track Progress**
   - Return to Breeding page
   - Check "Incubating Eggs" tab
   - Progress bars show current steps
   - Percentage and estimated battles displayed

3. **Wait for Completion**
   - Need 1000 total steps
   - Requires 100 battle victories
   - Egg will pulse green when ready

### Hatching Your Egg

1. **Check Readiness**
   - Egg shows 1000/1000 steps
   - Green pulsing animation
   - "Hatch Egg" button is enabled

2. **Initiate Hatching**
   - Click "Hatch Egg" button
   - AI generates reveal text
   - Hatching animation begins

3. **Reveal Animation**
   - Full-screen modal appears
   - Shows the new Pokémon sprite
   - Displays AI-generated reveal message
   - Shows Pokémon name and types

4. **Complete Hatching**
   - Transaction mints new Pokémon NFT
   - Egg NFT is burned
   - New Pokémon added to collection
   - Stats updated in Firebase

## Tips & Tricks

### Breeding Strategy
- Breed Pokémon with complementary types
- Consider parent levels (inherited traits coming soon)
- Keep 1-2 egg slots open for flexibility

### Incubation Efficiency
- Battle frequently to speed up incubation
- All eggs gain steps simultaneously
- Focus on winning battles (losses don't count)

### Hatching Timing
- Hatch eggs when you have time to enjoy the animation
- AI generates unique text each time
- Consider hatching before breeding more

## Technical Details

### Smart Contract Functions

**Breeding**
```move
breed_pokemon(
  parent1_species: u64,
  parent2_species: u64,
  genetics: vector<u8>,
  clock: &Clock
)
```

**Hatching**
```move
hatch_egg(
  egg: Egg,
  offspring_species: u64,
  offspring_name: vector<u8>,
  offspring_types: vector<vector<u8>>,
  clock: &Clock
)
```

### Genetics System

Currently, offspring species is randomly selected from one of the two parents. Future updates will include:
- Stat inheritance from parents
- Move inheritance
- Shiny chance
- IV/EV system

### Incubation Mechanics

- **Steps per Battle Win**: 10
- **Total Steps Required**: 1000
- **Battles Needed**: 100 victories
- **Max Simultaneous Eggs**: 3
- **Step Increment**: Applies to all active eggs

## Troubleshooting

### "You need at least 2 Pokémon to breed"
- Catch more Pokémon from wild encounters
- Battle and capture to expand your collection

### "Max Eggs Reached"
- You have 3 eggs already incubating
- Hatch an egg before breeding more
- Check "Incubating Eggs" tab

### "Failed to create egg"
- Check your wallet connection
- Ensure you have enough gas
- Verify smart contracts are deployed
- Try again after a moment

### "Failed to hatch egg"
- Ensure egg has 1000 steps
- Check wallet connection
- Verify sufficient gas
- Contact support if issue persists

## Future Features

Coming soon:
- [ ] Egg group compatibility checks
- [ ] Genetics inheritance system
- [ ] Breeding calculator
- [ ] Shiny Pokémon chance
- [ ] IV/EV system
- [ ] Breeding history
- [ ] Breeding achievements
- [ ] Egg trading on marketplace

## FAQ

**Q: Can I breed any two Pokémon?**
A: Yes! Currently all Pokémon can breed together. Egg groups will be added in a future update.

**Q: What determines the offspring species?**
A: Currently random from one of the two parents. Genetics system coming soon.

**Q: Can I speed up incubation?**
A: Win more battles! Each victory adds +10 steps to all eggs.

**Q: What happens to the egg after hatching?**
A: The Egg NFT is burned (destroyed) and a new Pokémon NFT is minted.

**Q: Can I trade eggs?**
A: Not yet, but egg trading will be added to the marketplace soon.

**Q: Do eggs expire?**
A: No, eggs never expire. Take your time incubating them.

**Q: Can I cancel breeding?**
A: Once the transaction is confirmed, the egg is created. You can't cancel after that.

**Q: What if I disconnect my wallet?**
A: Your eggs are NFTs on the blockchain. They'll be there when you reconnect.

## Support

Need help? Check out:
- [Main README](../README.md)
- [Smart Contract Documentation](../../contracts/pokemon_nft/README.md)
- [Task Completion Summary](../../.kiro/specs/pokechain-game/TASK_10_COMPLETION_SUMMARY.md)

---

Happy Breeding! 🥚✨
