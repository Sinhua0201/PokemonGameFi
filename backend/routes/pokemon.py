from fastapi import APIRouter, HTTPException
from typing import Optional
import random

from models.pokemon import PokemonData, Rarity
from services.pokemon_service import pokemon_service

router = APIRouter()


@router.get("/random", response_model=PokemonData)
async def get_random_pokemon(rarity: Optional[Rarity] = None):
    """
    Get a random Pokémon with optional rarity filter
    """
    try:
        pokemon = await pokemon_service.get_random_pokemon(rarity)
        return pokemon
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/starter/random", response_model=PokemonData)
async def get_random_starter():
    """
    Get a random starter Pokémon from the predefined list
    """
    try:
        pokemon = await pokemon_service.get_random_starter()
        return pokemon
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/starters/all")
async def get_all_starters():
    """
    Get all available starter Pokémon
    """
    try:
        starters = await pokemon_service.get_all_starters()
        return {"starters": starters}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{pokemon_id}", response_model=PokemonData)
async def get_pokemon(pokemon_id: int):
    """
    Get Pokémon data by ID
    """
    try:
        pokemon = await pokemon_service.get_pokemon(pokemon_id)
        return pokemon
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Pokémon not found: {str(e)}")
