# Quest System Documentation

## Overview
The Quest System provides AI-powered quest generation and daily challenges for the PokéChain Battles game.

## Features
- AI-generated personalized quests using Gemini API
- Daily challenges with 24-hour reset
- Automatic progress tracking for battles, captures, and hatches
- Quest completion detection and reward distribution
- Multiple concurrent quests support

## API Endpoints

### Generate Quest
```
POST /api/quests/generate
Content-Type: application/json

{
  "player_team": [
    {"name": "Pikachu", "types": ["electric"], "level": 10}
  ],
  "player_level": 5
}

Response:
{
  "id": "uuid",
  "title": "Electric Training",
  "description": "Train your electric Pokémon...",
  "objectives": [
    {
      "type": "battle",
      "target": 3,
      "current": 0,
      "description": "Win 3 battles"
    }
  ],
  "rewards": {
    "type": "tokens",
    "amount": 500
  },
  "expires_at": "2024-01-15T00:00:00Z"
}
```

### Get Daily Challenges
```
GET /api/quests/daily-challenges?player_level=5

Response:
[
  {
    "id": "uuid",
    "description": "Win 1 battle",
    "progress": 0,
    "target": 1,
    "reward": {
      "type": "tokens",
      "amount": 100
    }
  },
  ...
]
```

### Update Quest Progress
```
POST /api/quests/update-progress
Content-Type: application/json

{
  "quest_data": { /* quest object */ },
  "action_type": "battle",
  "increment": 1
}

Response:
{
  "quest": { /* updated quest */ },
  "completed": false
}
```

### Complete Quest
```
POST /api/quests/complete
Content-Type: application/json

{
  "quest_id": "uuid"
}

Response:
{
  "success": true,
  "message": "Quest completed successfully",
  "quest_id": "uuid"
}
```

## Quest Types

### Objective Types
- `battle` - Win battles
- `capture` - Capture Pokémon
- `hatch` - Hatch eggs
- `trade` - Trade NFTs (future)

### Reward Types
- `tokens` - In-game currency
- `pokemon` - Rare Pokémon encounter (by ID)
- `egg` - Egg NFT

## Usage Example

```python
from services.quest_service import quest_service

# Generate a quest
player_team = [
    {"name": "Charizard", "types": ["fire", "flying"], "level": 15}
]
quest = await quest_service.generate_quest(player_team, player_level=10)

# Generate daily challenges
challenges = await quest_service.generate_daily_challenges(player_level=10)

# Update quest progress
from models.quest import ObjectiveType
updated_quest = quest_service.update_quest_progress(
    quest=quest,
    action_type=ObjectiveType.BATTLE,
    increment=1
)

# Check completion
is_complete = quest_service.check_quest_completion(updated_quest)
```

## Integration

### Battle System
Automatically awards quest progress when player wins a battle:
```python
from hooks.useQuests import awardBattleQuestProgress
await awardBattleQuestProgress(wallet_address)
```

### Capture System
Automatically awards quest progress when player captures a Pokémon:
```python
from hooks.useQuests import awardCaptureQuestProgress
await awardCaptureQuestProgress(wallet_address)
```

### Breeding System
Automatically awards quest progress when player hatches an egg:
```python
from hooks.useQuests import awardHatchQuestProgress
await awardHatchQuestProgress(wallet_address)
```

## Configuration

### Environment Variables
- `GEMINI_API_KEY` - Required for AI quest generation
- `GEMINI_MODEL` - Model to use (default: gemini-2.0-flash-exp)

### Quest Settings
- Quest expiration: 7 days
- Daily challenge reset: 24 hours
- Max concurrent quests: Unlimited
- Daily challenges per day: 3 (easy, medium, hard)

## Error Handling

The quest service includes comprehensive error handling:
- Fallback quest generation if AI fails
- Rate limiting for Gemini API
- Graceful degradation for network issues
- Detailed error logging

## Testing

Run the test suite:
```bash
python backend/test_quest_service.py
```

Tests include:
- Quest generation
- Daily challenge generation
- Quest progress tracking
- Quest completion detection

## Future Enhancements
- Quest chains (multi-part quests)
- Seasonal/event quests
- Quest difficulty levels
- Leaderboards
- Quest history
- Trade-based quests
