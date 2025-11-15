from fastapi import APIRouter, HTTPException
from models.battle import DamageCalculation, DamageResult
from models.pokemon import CaptureAttempt, CaptureResult
from services.battle_engine import battle_engine

router = APIRouter()


@router.post("/calculate-damage", response_model=DamageResult)
async def calculate_damage(calculation: DamageCalculation):
    """
    Calculate damage for a battle move
    """
    try:
        result = battle_engine.calculate_damage(
            calculation.attacker,
            calculation.defender,
            calculation.move.dict()
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/capture-rate", response_model=CaptureResult)
async def calculate_capture_rate(attempt: CaptureAttempt):
    """
    Calculate capture success rate and attempt capture
    """
    try:
        result = battle_engine.attempt_capture(
            attempt.pokemon_id,
            attempt.health_percent,
            attempt.rarity
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/award-xp")
async def award_experience(winner_level: int, loser_level: int):
    """
    Calculate experience points awarded after battle
    """
    try:
        xp = battle_engine.award_experience(winner_level, loser_level)
        level_up = battle_engine.check_level_up(xp, winner_level)
        
        return {
            "experience_gained": xp,
            "level_up": level_up,
            "new_level": winner_level + 1 if level_up else winner_level,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
