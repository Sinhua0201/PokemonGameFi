"""
Integration tests for AI API endpoints
"""
import asyncio
import httpx


BASE_URL = "http://localhost:8000"


async def test_encounter_endpoint():
    """Test /api/ai/encounter endpoint"""
    print("1️⃣ Testing /api/ai/encounter endpoint...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/ai/encounter",
            json={
                "pokemon_name": "Pikachu",
                "pokemon_types": ["electric"],
                "pokemon_level": 5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        assert len(data["text"]) > 0
        print(f"   ✅ Response: {data['text'][:100]}...")


async def test_commentary_endpoint():
    """Test /api/ai/commentary endpoint"""
    print("\n2️⃣ Testing /api/ai/commentary endpoint...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/ai/commentary",
            json={
                "attacker": "Charizard",
                "defender": "Blastoise",
                "move": "Flamethrower",
                "damage": 65,
                "effectiveness": 0.5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        assert len(data["text"]) > 0
        print(f"   ✅ Response: {data['text']}")


async def test_move_endpoint():
    """Test /api/ai/move endpoint"""
    print("\n3️⃣ Testing /api/ai/move endpoint...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/ai/move",
            json={
                "battle_state": {
                    "ai_pokemon": {
                        "name": "Venusaur",
                        "types": ["grass", "poison"],
                        "current_hp": 100,
                        "max_hp": 100
                    },
                    "player_pokemon": {
                        "name": "Charizard",
                        "types": ["fire", "flying"],
                        "current_hp": 85,
                        "max_hp": 100
                    },
                    "available_moves": [
                        {"name": "Solar Beam", "power": 120, "type": "grass"},
                        {"name": "Sludge Bomb", "power": 90, "type": "poison"},
                        {"name": "Tackle", "power": 40, "type": "normal"}
                    ]
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "move" in data
        assert "name" in data["move"]
        print(f"   ✅ AI selected: {data['move']['name']} (Power: {data['move']['power']})")


async def test_quest_endpoint():
    """Test /api/ai/quest endpoint"""
    print("\n4️⃣ Testing /api/ai/quest endpoint...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/ai/quest",
            json={
                "player_team": [
                    {"name": "Pikachu", "types": ["electric"], "level": 10},
                    {"name": "Squirtle", "types": ["water"], "level": 8}
                ],
                "player_level": 5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "description" in data
        print(f"   ✅ Quest: {data['title']}")
        print(f"      {data['description'][:100]}...")


async def test_hatching_endpoint():
    """Test /api/ai/hatching endpoint"""
    print("\n5️⃣ Testing /api/ai/hatching endpoint...")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/ai/hatching",
            json={
                "pokemon_name": "Eevee",
                "pokemon_types": ["normal"]
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "text" in data
        assert len(data["text"]) > 0
        print(f"   ✅ Response: {data['text'][:100]}...")


async def main():
    print("🧪 Testing AI API Endpoints")
    print("=" * 60)
    print("⚠️  Make sure the FastAPI server is running on http://localhost:8000")
    print("=" * 60)
    print()
    
    try:
        await test_encounter_endpoint()
        await test_commentary_endpoint()
        await test_move_endpoint()
        await test_quest_endpoint()
        await test_hatching_endpoint()
        
        print("\n" + "=" * 60)
        print("✅ All API endpoint tests passed!")
        print("=" * 60)
        
    except httpx.ConnectError:
        print("\n❌ Error: Could not connect to the API server.")
        print("   Please start the server with: python main.py")
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")


if __name__ == "__main__":
    asyncio.run(main())
