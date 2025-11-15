from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class Rarity(str, Enum):
    COMMON = "common"
    UNCOMMON = "uncommon"
    RARE = "rare"
    LEGENDARY = "legendary"


class PokemonStats(BaseModel):
    hp: int = Field(..., ge=1, le=255)
    attack: int = Field(..., ge=1, le=255)
    defense: int = Field(..., ge=1, le=255)
    speed: int = Field(..., ge=1, le=255)


class PokemonData(BaseModel):
    id: int = Field(..., ge=1)
    name: str
    types: List[str]
    stats: PokemonStats
    sprite: str  # Front sprite (animated if available)
    back_sprite: Optional[str] = None  # Back sprite for battles
    rarity: Rarity


class PokemonNFT(BaseModel):
    id: str
    species_id: int
    name: str
    level: int = Field(..., ge=1, le=100)
    experience: int = Field(..., ge=0)
    stats: PokemonStats
    types: List[str]
    owner: str
    mint_timestamp: int


class EggNFT(BaseModel):
    id: str
    parent1_species: int
    parent2_species: int
    incubation_steps: int = Field(..., ge=0)
    required_steps: int = Field(default=1000)
    genetics: List[int]
    owner: str
    created_timestamp: int


class CaptureAttempt(BaseModel):
    pokemon_id: int
    health_percent: float = Field(..., ge=0.0, le=1.0)
    rarity: Rarity


class CaptureResult(BaseModel):
    success: bool
    capture_rate: float
    message: str
