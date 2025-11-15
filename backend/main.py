from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from config import settings
from routes import pokemon, battle, ai, auth, blockchain, quest
from services.redis_service import redis_service
from services.pokemon_service import pokemon_service
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Redis connection
    await redis_service.connect()
    print("✅ Redis connected")
    
    # Pre-fetch Generation 1 Pokémon in background
    print("🔄 Starting Pokémon cache pre-fetch...")
    asyncio.create_task(pokemon_service.prefetch_generation_1())
    
    yield
    
    # Shutdown: Close Redis connection
    await redis_service.close()
    print("❌ Redis disconnected")


app = FastAPI(
    title="PokéChain Battles API",
    description="Backend API for PokéChain Battles GameFi application",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(pokemon.router, prefix="/api/pokemon", tags=["Pokémon"])
app.include_router(battle.router, prefix="/api/battle", tags=["Battle"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["Blockchain"])
app.include_router(quest.router, prefix="/api/quests", tags=["Quests"])


@app.get("/")
async def root():
    return {
        "message": "PokéChain Battles API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    redis_status = await redis_service.ping()
    return {
        "status": "healthy",
        "redis": "connected" if redis_status else "disconnected",
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
