from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.gemini_service import gemini_service

router = APIRouter()


class EncounterRequest(BaseModel):
    pokemon_name: str
    pokemon_types: List[str]
    pokemon_level: int


class BattleCommentaryRequest(BaseModel):
    prompt: str


class AIMoveRequest(BaseModel):
    ai_pokemon: Dict[str, Any]
    player_pokemon: Dict[str, Any]
    available_moves: List[Dict[str, Any]]


class QuestGenerationRequest(BaseModel):
    player_team: List[Dict[str, Any]]
    player_level: int = 1


@router.post("/encounter")
async def generate_encounter_text(request: EncounterRequest):
    """
    Generate AI-powered encounter description
    """
    try:
        text = await gemini_service.generate_encounter_text(
            request.pokemon_name,
            request.pokemon_types,
            request.pokemon_level
        )
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate encounter text: {str(e)}")


@router.post("/commentary")
async def generate_battle_commentary(request: BattleCommentaryRequest):
    """
    Generate AI-powered battle commentary
    """
    try:
        text = await gemini_service.generate_commentary(request.prompt)
        return {"commentary": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate commentary: {str(e)}")


@router.post("/move")
async def select_ai_move(request: AIMoveRequest):
    """
    AI trainer selects the best move
    """
    try:
        move, reasoning = await gemini_service.select_ai_move(
            request.ai_pokemon,
            request.player_pokemon,
            request.available_moves
        )
        return {"move": move, "reasoning": reasoning}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to select AI move: {str(e)}")


@router.post("/quest")
async def generate_quest(request: QuestGenerationRequest):
    """
    Generate personalized quest using AI
    """
    try:
        quest = await gemini_service.generate_quest(
            request.player_team,
            request.player_level
        )
        return quest
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quest: {str(e)}")


class HatchingRequest(BaseModel):
    pokemon_name: str
    pokemon_types: List[str]


@router.post("/hatching")
async def generate_hatching_text(request: HatchingRequest):
    """
    Generate AI-powered egg hatching reveal text
    """
    try:
        text = await gemini_service.generate_hatching_text(
            request.pokemon_name,
            request.pokemon_types
        )
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate hatching text: {str(e)}")


class TrainerDialogueRequest(BaseModel):
    player_message: str
    trainer_personality: str  # 'friendly', 'competitive', 'mysterious'
    conversation_history: List[Dict[str, str]] = []
    context: Dict[str, Any] = None


@router.post("/dialogue")
async def generate_trainer_dialogue(request: TrainerDialogueRequest):
    """
    Generate AI trainer dialogue response
    """
    try:
        response = await gemini_service.generate_trainer_dialogue(
            request.player_message,
            request.trainer_personality,
            request.conversation_history,
            request.context
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate trainer dialogue: {str(e)}")
