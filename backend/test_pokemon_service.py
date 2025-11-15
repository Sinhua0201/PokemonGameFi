"""
Test script for Pokemon Service
Run this to verify the Pokemon service works without Redis
"""
import asyncio
import sys
from services.pokemon_service import pokemon_service


async def test_pokemon_service():
    print("=" * 60)
    print("Testing Pokemon Service")
    print("=" * 60)
    print()
    
    # Test 1: Fetch a specific Pokemon
    print("Test 1: Fetching Pikachu (ID: 25)...")
    try:
        pikachu = await pokemon_service.get_pokemon(25)
        print(f"✅ Success!")
        print(f"   Name: {pikachu.name}")
        print(f"   Types: {', '.join(pikachu.types)}")
        print(f"   Rarity: {pikachu.rarity}")
        print(f"   Stats: HP={pikachu.stats.hp}, ATK={pikachu.stats.attack}, "
              f"DEF={pikachu.stats.defense}, SPD={pikachu.stats.speed}")
        print()
    except Exception as e:
        print(f"❌ Failed: {e}")
        print()
    
    # Test 2: Fetch a random starter
    print("Test 2: Fetching random starter...")
    try:
        starter = await pokemon_service.get_random_starter()
        print(f"✅ Success!")
        print(f"   Name: {starter.name}")
        print(f"   Types: {', '.join(starter.types)}")
        print(f"   Rarity: {starter.rarity}")
        print()
    except Exception as e:
        print(f"❌ Failed: {e}")
        print()
    
    # Test 3: Fetch all starters
    print("Test 3: Fetching all starters...")
    try:
        starters = await pokemon_service.get_all_starters()
        print(f"✅ Success! Found {len(starters)} starters:")
        for starter in starters:
            print(f"   - {starter.name} ({starter.rarity})")
        print()
    except Exception as e:
        print(f"❌ Failed: {e}")
        print()
    
    # Test 4: Fetch random Pokemon with rarity
    print("Test 4: Fetching random legendary Pokemon...")
    try:
        from models.pokemon import Rarity
        legendary = await pokemon_service.get_random_pokemon(Rarity.LEGENDARY)
        print(f"✅ Success!")
        print(f"   Name: {legendary.name}")
        print(f"   Rarity: {legendary.rarity}")
        print()
    except Exception as e:
        print(f"❌ Failed: {e}")
        print()
    
    # Test 5: Calculate capture rate
    print("Test 5: Calculating capture rate...")
    try:
        capture_rate = await pokemon_service.calculate_capture_rate(25, 0.5)
        print(f"✅ Success!")
        print(f"   Capture rate for Pikachu at 50% health: {capture_rate:.2%}")
        print()
    except Exception as e:
        print(f"❌ Failed: {e}")
        print()
    
    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)


if __name__ == "__main__":
    # Note: This test runs without Redis
    # Redis caching will be skipped if Redis is not available
    asyncio.run(test_pokemon_service())
