# Battle System User Guide

## Quick Start

### Starting a Battle

Navigate to the battle page with query parameters:
```
/battle?player=25&opponent=4
```

- `player`: Pokémon ID for your Pokémon (1-151)
- `opponent`: Pokémon ID for opponent (1-151)
- Optional: `nftId`: Your Pokémon NFT ID for on-chain updates

### Example URLs

**Pikachu vs Charmander:**
```
/battle?player=25&opponent=4
```

**Bulbasaur vs Squirtle:**
```
/battle?player=1&opponent=7
```

**With NFT ID for stat updates:**
```
/battle?player=25&opponent=4&nftId=0x123abc...
```

## Battle Interface

### Main Components

1. **Battle Field** (Top)
   - Opponent Pokémon (top right)
   - Player Pokémon (bottom left)
   - Health bars with HP display
   - Damage animations

2. **Move Selection** (Bottom Left)
   - 4 moves available
   - Type-colored buttons
   - Power and type displayed
   - Click to select move

3. **Battle Log** (Right)
   - Turn-by-turn actions
   - Damage dealt
   - Type effectiveness
   - Critical hits
   - AI commentary

### Battle Flow

1. **Select Your Move**
   - Choose from 4 available moves
   - Consider type effectiveness
   - Higher power = more damage

2. **Turn Execution**
   - Faster Pokémon attacks first
   - Damage calculated by backend
   - Animations play
   - Commentary generated

3. **Battle Continues**
   - Repeat until one Pokémon faints
   - HP reaches 0 = battle ends

4. **Victory/Defeat**
   - Rewards displayed
   - Experience gained
   - Level-up notification
   - Quest progress updated

## Move System

### Default Moves by Type

**Fire Types:**
- Ember (Power: 40)
- Flame Wheel (Power: 60, Level 10+)

**Water Types:**
- Water Gun (Power: 40)
- Bubble Beam (Power: 65, Level 10+)

**Grass Types:**
- Vine Whip (Power: 45)
- Razor Leaf (Power: 55, Level 10+)

**Electric Types:**
- Thunder Shock (Power: 40)
- Spark (Power: 65, Level 10+)

**All Types:**
- Tackle (Power: 40, Normal)
- Quick Attack (Power: 40, Level 5+)

### Type Effectiveness

**Super Effective (2x damage):**
- Fire → Grass
- Water → Fire
- Grass → Water
- Electric → Water

**Not Very Effective (0.5x damage):**
- Fire → Water
- Water → Grass
- Grass → Fire
- Electric → Grass

## Rewards System

### Victory Rewards

1. **Experience Points**
   - Based on opponent level
   - Higher level opponents = more XP
   - Formula: `(opponent_level * 50) * level_diff_bonus`

2. **Level Up**
   - Occurs when XP threshold reached
   - XP required: `level^3`
   - Stats increase by 10%

3. **Egg Incubation**
   - +10 steps per battle win
   - Applies to all active eggs
   - 1000 steps required to hatch

4. **Quest Progress**
   - Battle quests auto-update
   - +1 progress per win
   - Rewards when quest completed

### On-Chain Updates

If NFT ID provided:
- Pokémon stats updated on blockchain
- Experience saved permanently
- Level changes recorded
- Verifiable on OneChain explorer

## AI Features

### Battle Commentary

Gemini AI generates:
- Turn-by-turn commentary
- Move descriptions
- Strategic observations
- Victory/defeat summaries

### AI Opponent Strategy

AI considers:
- Type effectiveness
- Move power
- Current HP situation
- Strategic advantage

## Tips & Strategies

### Type Advantage
- Always check opponent's type
- Use super effective moves
- Avoid not very effective moves

### Speed Matters
- Higher speed = attack first
- Can KO before opponent attacks
- Electric types usually fast

### Critical Hits
- 6.25% chance per move
- Deals 2x damage
- Can turn the tide

### STAB Bonus
- Same Type Attack Bonus
- 1.5x damage multiplier
- Use moves matching your type

## Troubleshooting

### Battle Won't Start
- Check Pokémon IDs are valid (1-151)
- Ensure wallet is connected
- Verify backend is running

### Moves Not Working
- Wait for turn to complete
- Check if battle ended
- Refresh page if stuck

### Rewards Not Showing
- Check wallet connection
- Verify Firestore access
- NFT updates require valid NFT ID

### Commentary Not Loading
- Gemini API may be rate limited
- Fallback text will display
- Battle continues normally

## Advanced Features

### Custom Battles

Create custom battle scenarios:
```typescript
// In your code
router.push(`/battle?player=${myPokemonId}&opponent=${wildPokemonId}&nftId=${myNftId}`);
```

### Battle History

View past battles in Firestore:
```
Collection: battleHistory
Filter: playerId == walletAddress
Order: createdAt desc
```

### Quest Integration

Battle wins automatically update:
- Battle-type quest objectives
- Progress tracked in Firestore
- Rewards awarded on completion

## API Endpoints Used

### Battle Calculations
- `POST /api/battle/calculate-damage`
- `POST /api/battle/award-xp`

### AI Features
- `POST /api/ai/move` - AI move selection
- `POST /api/ai/commentary` - Battle commentary

### Data
- `GET /api/pokemon/{id}` - Pokémon data

## Future Enhancements

Planned features:
- [ ] PvP battles
- [ ] Battle replays
- [ ] Tournament mode
- [ ] Custom move sets
- [ ] Battle items
- [ ] Status effects
- [ ] Weather effects
- [ ] Sound effects
- [ ] Mobile optimization

## Support

For issues or questions:
1. Check console for errors
2. Verify backend is running
3. Check Firestore rules
4. Review task completion summary
5. Test with sample Pokémon IDs

## Example Battle Session

```
1. Navigate to /battle?player=25&opponent=4
2. Battle loads: Pikachu vs Charmander
3. Select "Thunder Shock" (Electric move)
4. AI selects "Ember" (Fire move)
5. Pikachu attacks first (higher speed)
6. Super effective! Charmander takes heavy damage
7. Charmander attacks back
8. Not very effective on Pikachu
9. Continue until one faints
10. Victory! Rewards displayed
11. XP gained, quest updated, eggs progress
```

Enjoy battling! ⚔️
