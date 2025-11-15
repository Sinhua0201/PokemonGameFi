"""
Test script for Quest Service
Run with: python test_quest_service.py
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.quest_service import quest_service
from models.quest import ObjectiveType


async def test_quest_generation():
    """Test quest generation"""
    print("=" * 60)
    print("Testing Quest Generation")
    print("=" * 60)
    
    # Sample player team
    player_team = [
        {"name": "Pikachu", "types": ["electric"], "level": 10},
        {"name": "Charizard", "types": ["fire", "flying"], "level": 15},
    ]
    
    try:
        quest = await quest_service.generate_quest(player_team, player_level=5)
        
        print(f"\n✅ Quest Generated Successfully!")
        print(f"ID: {quest.id}")
        print(f"Title: {quest.title}")
        print(f"Description: {quest.description}")
        print(f"\nObjectives:")
        for obj in quest.objectives:
            print(f"  - {obj.type.value}: {obj.current}/{obj.target}")
            print(f"    {obj.description}")
        print(f"\nRewards:")
        print(f"  Type: {quest.rewards.type.value}")
        if quest.rewards.amount:
            print(f"  Amount: {quest.rewards.amount}")
        if quest.rewards.pokemon_id:
            print(f"  Pokémon ID: {quest.rewards.pokemon_id}")
        print(f"\nExpires: {quest.expires_at}")
        
        return True
    except Exception as e:
        print(f"\n❌ Quest Generation Failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_daily_challenges():
    """Test daily challenge generation"""
    print("\n" + "=" * 60)
    print("Testing Daily Challenge Generation")
    print("=" * 60)
    
    try:
        challenges = await quest_service.generate_daily_challenges(player_level=5)
        
        print(f"\n✅ Generated {len(challenges)} Daily Challenges!")
        for i, challenge in enumerate(challenges, 1):
            print(f"\nChallenge {i}:")
            print(f"  ID: {challenge.id}")
            print(f"  Description: {challenge.description}")
            print(f"  Progress: {challenge.progress}/{challenge.target}")
            print(f"  Reward: {challenge.reward.type.value}")
            if challenge.reward.amount:
                print(f"  Amount: {challenge.reward.amount}")
        
        return True
    except Exception as e:
        print(f"\n❌ Daily Challenge Generation Failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def test_quest_progress():
    """Test quest progress tracking"""
    print("\n" + "=" * 60)
    print("Testing Quest Progress Tracking")
    print("=" * 60)
    
    try:
        # Create a test quest
        player_team = [{"name": "Bulbasaur", "types": ["grass", "poison"], "level": 5}]
        quest = await quest_service.generate_quest(player_team, player_level=1)
        
        print(f"\nInitial Quest State:")
        print(f"  Objectives: {quest.objectives[0].current}/{quest.objectives[0].target}")
        print(f"  Completed: {quest_service.check_quest_completion(quest)}")
        
        # Simulate progress
        action_type = quest.objectives[0].type
        print(f"\nSimulating {action_type.value} action...")
        
        for i in range(quest.objectives[0].target):
            quest = quest_service.update_quest_progress(quest, action_type, 1)
            print(f"  Progress: {quest.objectives[0].current}/{quest.objectives[0].target}")
        
        is_completed = quest_service.check_quest_completion(quest)
        print(f"\n✅ Quest Completed: {is_completed}")
        
        return is_completed
    except Exception as e:
        print(f"\n❌ Quest Progress Tracking Failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("QUEST SERVICE TEST SUITE")
    print("=" * 60)
    
    results = []
    
    # Test 1: Quest Generation
    results.append(await test_quest_generation())
    
    # Test 2: Daily Challenges
    results.append(await test_daily_challenges())
    
    # Test 3: Quest Progress
    results.append(await test_quest_progress())
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed!")
    else:
        print(f"❌ {total - passed} test(s) failed")
    
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
