"""
Quest Service - Handles quest generation, tracking, and daily challenges
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import random

from models.quest import (
    Quest,
    QuestObjective,
    QuestReward,
    DailyChallenge,
    ObjectiveType,
    RewardType,
    QuestGenerationRequest
)
from services.gemini_service import gemini_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class QuestService:
    """Service for managing quests and daily challenges"""
    
    def __init__(self):
        logger.info("✅ Quest Service initialized")
    
    async def generate_quest(
        self,
        player_team: List[Dict[str, Any]],
        player_level: int = 1
    ) -> Quest:
        """
        Generate a personalized quest using Gemini AI
        
        Args:
            player_team: List of player's Pokémon
            player_level: Player's current level
            
        Returns:
            Quest object with AI-generated content
        """
        try:
            # Use Gemini to generate quest
            quest_data = await gemini_service.generate_quest(player_team, player_level)
            
            # Create quest ID
            quest_id = str(uuid.uuid4())
            
            # Parse objective
            objective = QuestObjective(
                type=ObjectiveType(quest_data.get('objective_type', 'battle')),
                target=quest_data.get('objective_target', 3),
                current=0,
                description=quest_data.get('description', '')
            )
            
            # Parse reward
            reward_type = RewardType(quest_data.get('reward_type', 'tokens'))
            reward = QuestReward(
                type=reward_type,
                amount=quest_data.get('reward_amount') if reward_type == RewardType.TOKENS else None,
                pokemon_id=quest_data.get('reward_amount') if reward_type == RewardType.POKEMON else None
            )
            
            # Quest expires in 7 days
            expires_at = datetime.now() + timedelta(days=7)
            
            quest = Quest(
                id=quest_id,
                title=quest_data.get('title', 'Training Challenge'),
                description=quest_data.get('description', 'Complete this quest to earn rewards!'),
                objectives=[objective],
                rewards=reward,
                expires_at=expires_at
            )
            
            logger.info(f"Generated quest: {quest.title} (ID: {quest_id})")
            return quest
            
        except Exception as e:
            logger.error(f"Error generating quest: {str(e)}")
            # Return fallback quest
            return self._create_fallback_quest()
    
    def _create_fallback_quest(self) -> Quest:
        """Create a simple fallback quest when AI generation fails"""
        quest_id = str(uuid.uuid4())
        
        objective = QuestObjective(
            type=ObjectiveType.BATTLE,
            target=3,
            current=0,
            description="Win 3 battles to prove your skills as a trainer!"
        )
        
        reward = QuestReward(
            type=RewardType.TOKENS,
            amount=300
        )
        
        expires_at = datetime.now() + timedelta(days=7)
        
        return Quest(
            id=quest_id,
            title="Training Challenge",
            description="Win 3 battles to prove your skills as a trainer!",
            objectives=[objective],
            rewards=reward,
            expires_at=expires_at
        )
    
    async def generate_daily_challenges(
        self,
        player_level: int = 1
    ) -> List[DailyChallenge]:
        """
        Generate 3 daily challenges with varying difficulty
        
        Args:
            player_level: Player's current level
            
        Returns:
            List of 3 daily challenges
        """
        challenges = []
        
        # Challenge templates based on difficulty
        easy_challenges = [
            {
                "description": "Win 1 battle",
                "type": ObjectiveType.BATTLE,
                "target": 1,
                "reward_amount": 100
            },
            {
                "description": "Capture 1 Pokémon",
                "type": ObjectiveType.CAPTURE,
                "target": 1,
                "reward_amount": 150
            },
        ]
        
        medium_challenges = [
            {
                "description": "Win 3 battles",
                "type": ObjectiveType.BATTLE,
                "target": 3,
                "reward_amount": 300
            },
            {
                "description": "Capture 2 Pokémon",
                "type": ObjectiveType.CAPTURE,
                "target": 2,
                "reward_amount": 400
            },
        ]
        
        hard_challenges = [
            {
                "description": "Win 5 battles",
                "type": ObjectiveType.BATTLE,
                "target": 5,
                "reward_amount": 500
            },
            {
                "description": "Hatch 1 egg",
                "type": ObjectiveType.HATCH,
                "target": 1,
                "reward_amount": 600
            },
            {
                "description": "Capture 3 Pokémon",
                "type": ObjectiveType.CAPTURE,
                "target": 3,
                "reward_amount": 550
            },
        ]
        
        # Select one from each difficulty
        easy = random.choice(easy_challenges)
        medium = random.choice(medium_challenges)
        hard = random.choice(hard_challenges)
        
        for challenge_data in [easy, medium, hard]:
            challenge_id = str(uuid.uuid4())
            
            reward = QuestReward(
                type=RewardType.TOKENS,
                amount=challenge_data['reward_amount']
            )
            
            challenge = DailyChallenge(
                id=challenge_id,
                description=challenge_data['description'],
                progress=0,
                target=challenge_data['target'],
                reward=reward
            )
            
            challenges.append(challenge)
        
        logger.info(f"Generated {len(challenges)} daily challenges")
        return challenges
    
    def check_quest_completion(self, quest: Quest) -> bool:
        """
        Check if all quest objectives are completed
        
        Args:
            quest: Quest to check
            
        Returns:
            True if all objectives are completed
        """
        return all(obj.current >= obj.target for obj in quest.objectives)
    
    def update_quest_progress(
        self,
        quest: Quest,
        action_type: ObjectiveType,
        increment: int = 1
    ) -> Quest:
        """
        Update quest progress based on player action
        
        Args:
            quest: Quest to update
            action_type: Type of action performed
            increment: Amount to increment progress
            
        Returns:
            Updated quest
        """
        for objective in quest.objectives:
            if objective.type == action_type and objective.current < objective.target:
                objective.current = min(objective.current + increment, objective.target)
                logger.info(f"Quest {quest.id} progress: {objective.current}/{objective.target}")
        
        return quest
    
    def update_challenge_progress(
        self,
        challenge: DailyChallenge,
        increment: int = 1
    ) -> DailyChallenge:
        """
        Update daily challenge progress
        
        Args:
            challenge: Challenge to update
            increment: Amount to increment progress
            
        Returns:
            Updated challenge
        """
        challenge.progress = min(challenge.progress + increment, challenge.target)
        logger.info(f"Challenge {challenge.id} progress: {challenge.progress}/{challenge.target}")
        return challenge
    
    def is_challenge_completed(self, challenge: DailyChallenge) -> bool:
        """Check if daily challenge is completed"""
        return challenge.progress >= challenge.target
    
    def calculate_reward_value(self, reward: QuestReward) -> str:
        """
        Calculate human-readable reward description
        
        Args:
            reward: Quest reward
            
        Returns:
            Formatted reward string
        """
        if reward.type == RewardType.TOKENS:
            return f"{reward.amount} tokens"
        elif reward.type == RewardType.POKEMON:
            return f"Rare Pokémon encounter (ID: {reward.pokemon_id})"
        elif reward.type == RewardType.EGG:
            return "Egg NFT"
        return "Unknown reward"


# Global instance
quest_service = QuestService()
