from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services.blockchain_service import blockchain_service

router = APIRouter()


class MintPokemonRequest(BaseModel):
    owner: str
    species_id: int
    name: str
    level: int = 1


class MintEggRequest(BaseModel):
    owner: str
    parent1_id: str
    parent2_id: str


class UpdateStatsRequest(BaseModel):
    nft_id: str
    new_xp: int
    new_level: int
    new_stats: Dict[str, int]


@router.get("/nfts/{address}")
async def get_player_nfts(address: str):
    """
    Get all NFTs owned by a wallet address
    """
    try:
        nfts = await blockchain_service.get_player_nfts(address)
        return {"nfts": nfts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch NFTs: {str(e)}")


@router.post("/prepare-mint-pokemon")
async def prepare_mint_pokemon(request: MintPokemonRequest):
    """
    Prepare transaction data for minting a Pokémon NFT
    """
    try:
        tx_data = await blockchain_service.prepare_mint_pokemon(
            request.owner,
            request.species_id,
            request.name,
            request.level
        )
        return tx_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare mint: {str(e)}")


@router.post("/prepare-mint-egg")
async def prepare_mint_egg(request: MintEggRequest):
    """
    Prepare transaction data for minting an Egg NFT
    """
    try:
        tx_data = await blockchain_service.prepare_mint_egg(
            request.owner,
            request.parent1_id,
            request.parent2_id
        )
        return tx_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare egg mint: {str(e)}")


@router.post("/prepare-update-stats")
async def prepare_update_stats(request: UpdateStatsRequest):
    """
    Prepare transaction data for updating Pokémon stats
    """
    try:
        tx_data = await blockchain_service.prepare_update_stats(
            request.nft_id,
            request.new_xp,
            request.new_level,
            request.new_stats
        )
        return tx_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare stats update: {str(e)}")
