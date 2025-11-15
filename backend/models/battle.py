from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class Move(BaseModel):
    name: str
    type: str
    power: int = Field(..., ge=0, le=250)
    accuracy: float = Field(default=1.0, ge=0.0, le=1.0)


class BattleEvent(BaseModel):
    turn: int
    attacker: str
    defender: str
    move: str
    damage: int
    effectiveness: float
    critical: bool = False
    commentary: Optional[str] = None


class BattleState(BaseModel):
    battle_id: str
    player_pokemon: Dict[str, Any]
    opponent_pokemon: Dict[str, Any]
    player_hp: int
    opponent_hp: int
    turn: int
    events: List[BattleEvent] = []
    winner: Optional[str] = None


class DamageCalculation(BaseModel):
    attacker: Dict[str, Any]
    defender: Dict[str, Any]
    move: Move


class DamageResult(BaseModel):
    damage: int
    effectiveness: float
    critical: bool
    message: str
