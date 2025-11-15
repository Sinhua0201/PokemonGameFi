from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class ObjectiveType(str, Enum):
    BATTLE = "battle"
    CAPTURE = "capture"
    HATCH = "hatch"
    TRADE = "trade"


class RewardType(str, Enum):
    TOKENS = "tokens"
    POKEMON = "pokemon"
    EGG = "egg"


class QuestObjective(BaseModel):
    type: ObjectiveType
    target: int = Field(..., ge=1)
    current: int = Field(default=0, ge=0)
    description: str


class QuestReward(BaseModel):
    type: RewardType
    amount: Optional[int] = None
    pokemon_id: Optional[int] = None


class Quest(BaseModel):
    id: str
    title: str
    description: str
    objectives: List[QuestObjective]
    rewards: QuestReward
    expires_at: datetime


class QuestGenerationRequest(BaseModel):
    player_team: List[dict]
    player_level: int = Field(default=1, ge=1)


class DailyChallenge(BaseModel):
    id: str
    description: str
    progress: int = Field(default=0, ge=0)
    target: int = Field(..., ge=1)
    reward: QuestReward
