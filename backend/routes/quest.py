"""
Quest API Routes
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime, timedelta
import logging

from models.quest import (
    Quest,
    QuestGenerationRequest,
    DailyChallenge,
    ObjectiveType
)
from services.quest_service import quest_service
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/generate", response_model=Quest)
async def generate_quest(request: QuestGenerationRequest):
    """
    Generate a personalized quest using AI
    
    Args:
        request: Quest generation request with player team and level
        
    Returns:
        Generated quest
    """
    try:
        quest = await quest_service.generate_quest(
            player_team=request.player_team,
            player_level=request.player_level
        )
        return quest
    except Exception as e:
        logger.error(f"Error generating quest: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quest: {str(e)}"
        )


@router.get("/daily-challenges", response_model=List[DailyChallenge])
async def get_daily_challenges(player_level: int = 1):
    """
    Generate daily challenges for a player
    
    Args:
        player_level: Player's current level
        
    Returns:
        List of 3 daily challenges
    """
    try:
        challenges = await quest_service.generate_daily_challenges(player_level)
        return challenges
    except Exception as e:
        logger.error(f"Error generating daily challenges: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate daily challenges: {str(e)}"
        )


@router.post("/update-progress")
async def update_quest_progress(
    quest_data: Dict[str, Any],
    action_type: str,
    increment: int = 1
):
    """
    Update quest progress based on player action
    
    Args:
        quest_data: Current quest data
        action_type: Type of action (battle, capture, hatch, trade)
        increment: Amount to increment progress
        
    Returns:
        Updated quest
    """
    try:
        # Convert dict to Quest object
        quest = Quest(**quest_data)
        
        # Convert action type string to enum
        action_enum = ObjectiveType(action_type)
        
        # Update progress
        updated_quest = quest_service.update_quest_progress(
            quest=quest,
            action_type=action_enum,
            increment=increment
        )
        
        # Check if completed
        is_completed = quest_service.check_quest_completion(updated_quest)
        
        return {
            "quest": updated_quest,
            "completed": is_completed
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action type: {action_type}"
        )
    except Exception as e:
        logger.error(f"Error updating quest progress: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update quest progress: {str(e)}"
        )


@router.post("/complete")
async def complete_quest(quest_id: str):
    """
    Mark a quest as completed and award rewards
    
    Args:
        quest_id: ID of the quest to complete
        
    Returns:
        Completion status and reward information
    """
    try:
        # In a real implementation, this would:
        # 1. Verify quest is actually completed
        # 2. Award rewards to player
        # 3. Update database
        # 4. Return reward details
        
        logger.info(f"Quest {quest_id} completed")
        
        return {
            "success": True,
            "message": "Quest completed successfully",
            "quest_id": quest_id
        }
    except Exception as e:
        logger.error(f"Error completing quest: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete quest: {str(e)}"
        )


@router.post("/challenge/update-progress")
async def update_challenge_progress(
    challenge_data: Dict[str, Any],
    increment: int = 1
):
    """
    Update daily challenge progress
    
    Args:
        challenge_data: Current challenge data
        increment: Amount to increment progress
        
    Returns:
        Updated challenge
    """
    try:
        # Convert dict to DailyChallenge object
        challenge = DailyChallenge(**challenge_data)
        
        # Update progress
        updated_challenge = quest_service.update_challenge_progress(
            challenge=challenge,
            increment=increment
        )
        
        # Check if completed
        is_completed = quest_service.is_challenge_completed(updated_challenge)
        
        return {
            "challenge": updated_challenge,
            "completed": is_completed
        }
    except Exception as e:
        logger.error(f"Error updating challenge progress: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update challenge progress: {str(e)}"
        )


@router.get("/health")
async def quest_health_check():
    """Health check endpoint for quest service"""
    return {
        "status": "healthy",
        "service": "quest",
        "timestamp": datetime.now().isoformat()
    }
