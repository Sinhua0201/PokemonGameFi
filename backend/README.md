# PokéChain Battles - Backend API

FastAPI backend for PokéChain Battles GameFi application.

## Tech Stack

- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Database:** Firebase (Firestore, Auth)
- **Cache:** Redis
- **AI:** Google Gemini API
- **Blockchain:** pysui (Sui/OneChain)

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config/                 # Configuration
│   ├── settings.py        # Environment settings
│   └── __init__.py
├── models/                 # Pydantic models
│   ├── pokemon.py         # Pokémon data models
│   ├── battle.py          # Battle-related models
│   ├── quest.py           # Quest models
│   └── __init__.py
├── routes/                 # API routes
│   ├── auth.py            # Authentication endpoints
│   ├── pokemon.py         # Pokémon endpoints
│   ├── battle.py          # Battle endpoints
│   ├── ai.py              # AI/Gemini endpoints
│   ├── blockchain.py      # Blockchain endpoints
│   └── __init__.py
├── services/              # Business logic services
│   ├── redis_service.py   # Redis cache service
│   ├── pokemon_service.py # Pokémon data service
│   ├── battle_engine.py   # Battle calculations
│   ├── gemini_service.py  # Gemini AI service
│   ├── blockchain_service.py # Blockchain interactions
│   └── __init__.py
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── README.md             # This file
```

## Setup Instructions

### 1. Install Python 3.11+

Make sure you have Python 3.11 or higher installed:

```bash
python --version
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Update the `.env` file with your configuration:

```env
# Gemini API Key (already configured)
GEMINI_API_KEY=AIzaSyDAL621Fd02tvoKCJ9apijDp0h6BRuJ_cE

# Firebase Service Account
# Download from Firebase Console and save as serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json

# Redis (install locally or use cloud service)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Set up Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `serviceAccountKey.json` in the backend directory
4. **Important:** Add `serviceAccountKey.json` to `.gitignore`

### 6. Install and Start Redis

**Windows (using Memurai):**
```bash
# Download from https://www.memurai.com/
# Or use Docker:
docker run -d -p 6379:6379 redis:latest
```

**Linux/Mac:**
```bash
# Install Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                  # macOS

# Start Redis
redis-server
```

**Or use Redis Cloud (free tier):**
- Sign up at https://redis.com/try-free/
- Update REDIS_HOST and REDIS_PORT in `.env`

### 7. Run Development Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API:** http://localhost:8000
- **Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/wallet` - Generate Firebase custom token for wallet
- `GET /api/auth/verify/{wallet_address}` - Verify wallet registration

### Pokémon
- `GET /api/pokemon/{pokemon_id}` - Get Pokémon by ID
- `GET /api/pokemon/random` - Get random Pokémon
- `GET /api/pokemon/starter/random` - Get random starter
- `GET /api/pokemon/starters/all` - Get all starters

### Battle
- `POST /api/battle/calculate-damage` - Calculate battle damage
- `POST /api/battle/capture-rate` - Calculate capture success
- `POST /api/battle/award-xp` - Calculate XP rewards

### AI (Gemini)
- `POST /api/ai/encounter` - Generate encounter description
- `POST /api/ai/commentary` - Generate battle commentary
- `POST /api/ai/move` - AI trainer move selection
- `POST /api/ai/quest` - Generate personalized quest
- `POST /api/ai/hatching` - Generate hatching reveal text

### Blockchain
- `GET /api/blockchain/nfts/{address}` - Get player's NFTs
- `POST /api/blockchain/prepare-mint-pokemon` - Prepare mint transaction
- `POST /api/blockchain/prepare-mint-egg` - Prepare egg mint
- `POST /api/blockchain/prepare-update-stats` - Prepare stats update

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
isort .
```

### Type Checking

```bash
mypy .
```

## Deployment

### Using Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t pokechain-backend .
docker run -p 8000:8000 --env-file .env pokechain-backend
```

### Deploy to Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

### Deploy to Render

1. Create new Web Service on Render
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

## Troubleshooting

### Redis Connection Failed
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_HOST and REDIS_PORT in `.env`
- Try using 127.0.0.1 instead of localhost

### Firebase Authentication Error
- Verify `serviceAccountKey.json` exists and is valid
- Check Firebase project ID matches
- Ensure Firebase Admin SDK is initialized

### Gemini API Rate Limit
- The free tier has rate limits
- Implement exponential backoff
- Consider caching AI responses

### PokéAPI Timeout
- PokéAPI can be slow sometimes
- Redis caching helps reduce requests
- Consider pre-fetching common Pokémon

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| HOST | Server host | 0.0.0.0 |
| PORT | Server port | 8000 |
| DEBUG | Debug mode | True |
| CORS_ORIGINS | Allowed origins | http://localhost:3000 |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| GEMINI_API_KEY | Gemini API key | (required) |
| GEMINI_MODEL | Gemini model | gemini-2.0-flash-exp |
| FIREBASE_SERVICE_ACCOUNT_PATH | Firebase key path | serviceAccountKey.json |
| POKEAPI_BASE_URL | PokéAPI URL | https://pokeapi.co/api/v2 |
| POKEMON_CACHE_TTL | Cache TTL (seconds) | 86400 |

## Next Steps

1. Implement remaining service files (pokemon_service.py, battle_engine.py, etc.)
2. Add comprehensive error handling
3. Implement rate limiting
4. Add request validation
5. Set up logging
6. Write unit tests
7. Deploy to production

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [PokéAPI Documentation](https://pokeapi.co/docs/v2)
- [Redis Documentation](https://redis.io/docs/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
