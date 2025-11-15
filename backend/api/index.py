"""
Vercel Serverless Function entry point for FastAPI backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from routes import pokemon, battle, ai, auth, blockchain, quest

# Create FastAPI app without lifespan (Redis not supported in serverless)
app = FastAPI(
    title="PokéChain Battles API",
    description="Backend API for PokéChain Battles GameFi application",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
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
@app.get("/api")
async def root():
    return {
        "message": "PokéChain Battles API",
        "version": "1.0.0",
        "status": "running",
        "deployment": "vercel-serverless"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "deployment": "vercel-serverless"
    }


# Export for Vercel
handler = app
