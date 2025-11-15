# Gemini AI Integration Documentation

## Overview

The Gemini AI Integration provides intelligent, dynamic content generation for the PokéChain Battles game. It uses Google's Gemini 2.0 Flash model to create immersive encounter descriptions, battle commentary, strategic AI opponents, personalized quests, and egg hatching reveals.

## Features

### 1. Encounter Text Generation
Generates exciting, contextual descriptions when players encounter wild Pokémon.

**Endpoint:** `POST /api/ai/encounter`

**Request:**
```json
{
  "pokemon_name": "Pikachu",
  "pokemon_types": ["electric"],
  "pokemon_level": 5
}
```

**Response:**
```json
{
  "text": "A wild Pikachu appeared! The electric mouse Pokémon crackles with energy, its cheeks sparking with electricity!"
}
```

### 2. Battle Commentary
Provides dynamic, play-by-play commentary during battles.

**Endpoint:** `POST /api/ai/commentary`

**Request:**
```json
{
  "attacker": "Charizard",
  "defender": "Blastoise",
  "move": "Flamethrower",
  "damage": 65,
  "effectiveness": 0.5
}
```

**Response:**
```json
{
  "text": "Charizard unleashes a massive Flamethrower, but Blastoise's water typing reduces the impact!"
}
```

### 3. AI Move Selection
Strategic AI that selects the best move based on battle state and type effectiveness.

**Endpoint:** `POST /api/ai/move`

**Request:**
```json
{
  "battle_state": {
    "ai_pokemon": {
      "name": "Venusaur",
      "types": ["grass", "poison"],
      "current_hp": 100,
      "max_hp": 100
    },
    "player_pokemon": {
      "name": "Charizard",
      "types": ["fire", "flying"],
      "current_hp": 85,
      "max_hp": 100
    },
    "available_moves": [
      {"name": "Solar Beam", "power": 120, "type": "grass"},
      {"name": "Sludge Bomb", "power": 90, "type": "poison"}
    ]
  }
}
```

**Response:**
```json
{
  "move": {
    "name": "Solar Beam",
    "power": 120,
    "type": "grass"
  }
}
```

### 4. Quest Generation
Creates personalized quests based on player's team composition and progress.

**Endpoint:** `POST /api/ai/quest`

**Request:**
```json
{
  "player_team": [
    {"name": "Pikachu", "types": ["electric"], "level": 10},
    {"name": "Squirtle", "types": ["water"], "level": 8}
  ],
  "player_level": 5
}
```

**Response:**
```json
{
  "title": "Electric Storm Challenge",
  "description": "A powerful storm is brewing in the nearby forest. Electric-type Pokémon are gathering, and trainers are needed to investigate.",
  "objective_type": "battle",
  "objective_target": 3,
  "reward_type": "tokens",
  "reward_amount": 500
}
```

### 5. Egg Hatching Text
Generates exciting reveal text when eggs hatch.

**Endpoint:** `POST /api/ai/hatching`

**Request:**
```json
{
  "pokemon_name": "Charmander",
  "pokemon_types": ["fire"]
}
```

**Response:**
```json
{
  "text": "The egg begins to glow with an intense light! A Charmander emerges, its tail flame burning bright with determination!"
}
```

## Implementation Details

### Rate Limiting

The service implements a rate limiter to prevent API quota exhaustion:
- **Limit:** 60 requests per minute
- **Behavior:** Automatically queues requests when limit is reached
- **Wait Time:** Calculated based on oldest request in the time window

```python
# Rate limiter automatically handles throttling
await self.rate_limiter.acquire()
```

### Error Handling

Comprehensive error handling with fallback responses:

1. **API Errors:** Catches Gemini API failures and returns sensible fallback text
2. **Network Issues:** Handles timeouts and connection errors gracefully
3. **Invalid Responses:** Validates and parses AI responses, falling back if needed
4. **Logging:** All errors are logged for monitoring and debugging

```python
@handle_gemini_errors()
async def generate_encounter_text(...):
    # If Gemini fails, returns: "A wild {pokemon_name} appeared!"
```

### Configuration

Set these environment variables in `.env`:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Model Configuration:**
- **Temperature:** 0.9 (creative, varied responses)
- **Top P:** 0.95 (diverse token selection)
- **Top K:** 40 (balanced creativity)
- **Max Tokens:** 200 (concise responses)

### Prompt Engineering

Each function uses carefully crafted prompts:

1. **Clear Instructions:** Specific format and length requirements
2. **Context:** Relevant game state and Pokémon data
3. **Examples:** Sample outputs to guide the AI
4. **Constraints:** Word/sentence limits for consistency

Example prompt structure:
```python
prompt = f"""You are a Pokémon game narrator.

Context: {context_data}

Instructions:
- Write exactly 2 sentences
- Use exciting, immersive language
- Focus on visual and sensory details

Example: "A wild Pikachu appeared! The electric mouse..."
"""
```

## Testing

### Unit Tests

Run the service tests:
```bash
cd backend
python test_gemini_service.py
```

Tests cover:
- ✅ Encounter text generation
- ✅ Battle commentary
- ✅ AI move selection
- ✅ Quest generation
- ✅ Hatching text
- ✅ Rate limiting
- ✅ Error handling

### Integration Tests

Test API endpoints (requires running server):
```bash
# Terminal 1: Start server
python main.py

# Terminal 2: Run tests
python test_ai_endpoints.py
```

## Performance

### Response Times
- **Encounter Text:** ~1-2 seconds
- **Battle Commentary:** ~1-2 seconds
- **AI Move Selection:** ~2-3 seconds (includes strategy analysis)
- **Quest Generation:** ~2-3 seconds (includes JSON parsing)
- **Hatching Text:** ~1-2 seconds

### Optimization Strategies

1. **Async Operations:** All Gemini calls use `asyncio.to_thread()` for non-blocking execution
2. **Caching:** Consider caching common responses (e.g., starter Pokémon encounters)
3. **Batch Processing:** Group multiple requests when possible
4. **Fallback Speed:** Instant fallback responses if AI fails

## Best Practices

### 1. Always Handle Errors
```python
try:
    text = await gemini_service.generate_encounter_text(...)
except Exception as e:
    # Use fallback text
    text = f"A wild {pokemon_name} appeared!"
```

### 2. Validate AI Responses
```python
# Check for empty or invalid responses
if not text or len(text) < 10:
    text = fallback_text
```

### 3. Monitor Rate Limits
```python
# The service handles this automatically, but monitor logs:
logger.warning(f"Rate limit reached. Waiting...")
```

### 4. Use Appropriate Timeouts
```python
# Set reasonable timeouts for API calls
async with httpx.AsyncClient(timeout=5.0) as client:
    response = await client.post(...)
```

## Troubleshooting

### Issue: "Rate limit exceeded"
**Solution:** The service automatically handles this. If persistent, increase the rate limit window or reduce request frequency.

### Issue: "API key invalid"
**Solution:** Check `.env` file and ensure `GEMINI_API_KEY` is set correctly.

### Issue: "Slow response times"
**Solution:** 
1. Check network connectivity
2. Verify Gemini API status
3. Consider implementing response caching
4. Use fallback text for time-critical operations

### Issue: "JSON parsing errors in quest generation"
**Solution:** The service automatically falls back to a default quest. Check logs for details and adjust prompt if needed.

## Future Enhancements

1. **Response Caching:** Cache common AI responses to reduce API calls
2. **Streaming Responses:** Implement streaming for real-time commentary
3. **Multi-language Support:** Generate content in different languages
4. **Personality Profiles:** Different AI trainer personalities with unique speaking styles
5. **Context Memory:** Maintain conversation history for more coherent dialogue
6. **A/B Testing:** Test different prompts to optimize response quality

## API Quota Management

**Gemini 2.0 Flash Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

**Current Usage:**
- Rate limited to 60 requests/minute (adjust based on your quota)
- Average ~100 tokens per request
- Estimated capacity: ~10,000 requests/day

**Recommendations:**
- Monitor usage in Google Cloud Console
- Implement caching for repeated requests
- Use fallback text during high-traffic periods
- Consider upgrading to paid tier for production

## Security Considerations

1. **API Key Protection:** Never commit API keys to version control
2. **Rate Limiting:** Prevents abuse and quota exhaustion
3. **Input Validation:** All inputs are validated before sending to AI
4. **Output Sanitization:** AI responses are stripped and validated
5. **Error Logging:** Errors are logged without exposing sensitive data

## Support

For issues or questions:
1. Check logs: `backend/logs/` (if configured)
2. Review test output: `python test_gemini_service.py`
3. Verify API key and configuration
4. Check Gemini API status: https://status.cloud.google.com/

---

**Last Updated:** 2024
**Version:** 1.0.0
**Model:** Gemini 2.0 Flash Experimental
