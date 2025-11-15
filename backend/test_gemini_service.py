"""
Tests for Gemini AI Service
"""
import pytest
import asyncio
from services.gemini_service import gemini_service


class TestGeminiService:
    """Test suite for Gemini AI Service"""
    
    @pytest.mark.asyncio
    async def test_generate_encounter_text(self):
        """Test encounter text generation"""
        text = await gemini_service.generate_encounter_text(
            pokemon_name="Pikachu",
            pokemon_types=["electric"],
            pokemon_level=5
        )
        
        assert text is not None
        assert len(text) > 0
        assert "Pikachu" in text or "pikachu" in text.lower()
        print(f"✅ Encounter text: {text}")
    
    @pytest.mark.asyncio
    async def test_generate_battle_commentary(self):
        """Test battle commentary generation"""
        text = await gemini_service.generate_battle_commentary(
            attacker="Pikachu",
            defender="Squirtle",
            move="Thunderbolt",
            damage=45,
            effectiveness=2.0
        )
        
        assert text is not None
        assert len(text) > 0
        print(f"✅ Battle commentary: {text}")
    
    @pytest.mark.asyncio
    async def test_select_ai_move(self):
        """Test AI move selection"""
        battle_state = {
            "ai_pokemon": {
                "name": "Charizard",
                "types": ["fire", "flying"],
                "current_hp": 80,
                "max_hp": 100
            },
            "player_pokemon": {
                "name": "Venusaur",
                "types": ["grass", "poison"],
                "current_hp": 90,
                "max_hp": 100
            },
            "available_moves": [
                {"name": "Flamethrower", "power": 90, "type": "fire"},
                {"name": "Wing Attack", "power": 60, "type": "flying"},
                {"name": "Slash", "power": 70, "type": "normal"}
            ]
        }
        
        move = await gemini_service.select_ai_move(battle_state)
        
        assert move is not None
        assert "name" in move
        assert "power" in move
        assert "type" in move
        print(f"✅ AI selected move: {move['name']} (Power: {move['power']}, Type: {move['type']})")
    
    @pytest.mark.asyncio
    async def test_generate_quest(self):
        """Test quest generation"""
        player_team = [
            {"name": "Pikachu", "types": ["electric"], "level": 10},
            {"name": "Charmander", "types": ["fire"], "level": 8}
        ]
        
        quest = await gemini_service.generate_quest(
            player_team=player_team,
            player_level=5
        )
        
        assert quest is not None
        assert "title" in quest
        assert "description" in quest
        assert "objective_type" in quest
        assert "objective_target" in quest
        assert "reward_type" in quest
        print(f"✅ Generated quest: {quest['title']}")
        print(f"   Description: {quest['description']}")
        print(f"   Objective: {quest['objective_type']} x{quest['objective_target']}")
        print(f"   Reward: {quest['reward_type']} ({quest.get('reward_amount', 'N/A')})")
    
    @pytest.mark.asyncio
    async def test_generate_hatching_text(self):
        """Test egg hatching text generation"""
        text = await gemini_service.generate_hatching_text(
            pokemon_name="Charmander",
            pokemon_types=["fire"]
        )
        
        assert text is not None
        assert len(text) > 0
        assert "Charmander" in text or "charmander" in text.lower()
        print(f"✅ Hatching text: {text}")
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test that rate limiting doesn't break functionality"""
        # Make multiple rapid requests
        tasks = [
            gemini_service.generate_encounter_text("Bulbasaur", ["grass", "poison"], 5)
            for _ in range(3)
        ]
        
        results = await asyncio.gather(*tasks)
        
        assert len(results) == 3
        assert all(result is not None for result in results)
        print(f"✅ Rate limiting test passed - all {len(results)} requests completed")
    
    @pytest.mark.asyncio
    async def test_error_handling_with_invalid_data(self):
        """Test error handling with edge cases"""
        # Test with empty types
        text = await gemini_service.generate_encounter_text(
            pokemon_name="MissingNo",
            pokemon_types=[],
            pokemon_level=0
        )
        
        assert text is not None
        assert len(text) > 0
        print(f"✅ Error handling test passed: {text}")


if __name__ == "__main__":
    # Run tests
    print("🧪 Running Gemini Service Tests...\n")
    
    async def run_tests():
        test = TestGeminiService()
        
        print("1️⃣ Testing encounter text generation...")
        await test.test_generate_encounter_text()
        print()
        
        print("2️⃣ Testing battle commentary generation...")
        await test.test_generate_battle_commentary()
        print()
        
        print("3️⃣ Testing AI move selection...")
        await test.test_select_ai_move()
        print()
        
        print("4️⃣ Testing quest generation...")
        await test.test_generate_quest()
        print()
        
        print("5️⃣ Testing hatching text generation...")
        await test.test_generate_hatching_text()
        print()
        
        print("6️⃣ Testing rate limiting...")
        await test.test_rate_limiting()
        print()
        
        print("7️⃣ Testing error handling...")
        await test.test_error_handling_with_invalid_data()
        print()
        
        print("✅ All tests completed!")
    
    asyncio.run(run_tests())
