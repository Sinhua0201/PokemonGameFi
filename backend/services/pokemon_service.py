"""
Pokémon Service - Handles fetching and caching Pokémon data from PokéAPI
"""
import httpx
import random
from typing import Optional, List, Dict
from models.pokemon import PokemonData, PokemonStats, Rarity
from services.redis_service import redis_service
from config import settings
import json


class PokemonService:
    def __init__(self):
        self.base_url = settings.POKEAPI_BASE_URL
        self.cache_ttl = settings.POKEMON_CACHE_TTL
        self.starter_ids = settings.starter_pokemon_ids_list
        
        # Rarity weights (must sum to 100)
        self.rarity_weights = {
            Rarity.COMMON: 60,
            Rarity.UNCOMMON: 25,
            Rarity.RARE: 12,
            Rarity.LEGENDARY: 3
        }
        
        # Legendary Pokémon IDs (Generation 1)
        self.legendary_ids = [144, 145, 146, 150, 151]  # Articuno, Zapdos, Moltres, Mewtwo, Mew
        
        # Rare Pokémon IDs (pseudo-legendaries and rare spawns)
        self.rare_ids = [3, 6, 9, 65, 68, 94, 130, 131, 142]  # Final evolutions and rare ones
        
        # Uncommon Pokémon IDs (second evolutions)
        self.uncommon_ids = [2, 5, 8, 14, 15, 17, 18, 20, 22, 24, 26, 28, 31, 34, 36, 38, 40, 
                            42, 45, 47, 49, 51, 53, 55, 57, 59, 62, 64, 67, 71, 73, 75, 76, 
                            78, 80, 82, 83, 85, 87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 
                            106, 107, 108, 110, 112, 113, 114, 115, 117, 119, 121, 122, 124, 
                            125, 126, 127, 128, 132, 134, 135, 136, 137, 139, 141, 143, 148, 149]

    async def get_pokemon(self, pokemon_id: int) -> PokemonData:
        """
        Get Pokémon data by ID, with Redis caching
        """
        # Check cache first (if Redis is available)
        cache_key = f"pokemon:{pokemon_id}"
        try:
            cached_data = await redis_service.get(cache_key)
            if cached_data:
                if isinstance(cached_data, str):
                    return PokemonData(**json.loads(cached_data))
                return PokemonData(**cached_data)
        except Exception as e:
            print(f"Redis cache read failed: {e}")
        
        # Fetch from PokéAPI
        pokemon_data = await self._fetch_from_pokeapi(pokemon_id)
        
        # Cache the result (if Redis is available)
        try:
            await redis_service.set(
                cache_key,
                pokemon_data.dict(),
                ttl=self.cache_ttl
            )
        except Exception as e:
            print(f"Redis cache write failed: {e}")
        
        return pokemon_data

    async def _fetch_from_pokeapi(self, pokemon_id: int) -> PokemonData:
        """
        Fetch Pokémon data from PokéAPI
        """
        async with httpx.AsyncClient() as client:
            # Fetch Pokémon data
            response = await client.get(f"{self.base_url}/pokemon/{pokemon_id}")
            response.raise_for_status()
            data = response.json()
            
            # Fetch species data for additional info
            species_response = await client.get(data['species']['url'])
            species_response.raise_for_status()
            species_data = species_response.json()
            
            # Extract stats
            stats = PokemonStats(
                hp=next(s['base_stat'] for s in data['stats'] if s['stat']['name'] == 'hp'),
                attack=next(s['base_stat'] for s in data['stats'] if s['stat']['name'] == 'attack'),
                defense=next(s['base_stat'] for s in data['stats'] if s['stat']['name'] == 'defense'),
                speed=next(s['base_stat'] for s in data['stats'] if s['stat']['name'] == 'speed')
            )
            
            # Extract types
            types = [t['type']['name'] for t in data['types']]
            
            # Get sprites (both static and animated)
            sprites_data = data['sprites']
            
            # Try to get animated sprite first (GIF), fallback to static
            sprite = (
                sprites_data.get('versions', {}).get('generation-v', {}).get('black-white', {}).get('animated', {}).get('front_default') or
                sprites_data.get('front_default') or
                sprites_data.get('other', {}).get('official-artwork', {}).get('front_default')
            )
            
            # Get back sprite for battles (also try animated)
            back_sprite = (
                sprites_data.get('versions', {}).get('generation-v', {}).get('black-white', {}).get('animated', {}).get('back_default') or
                sprites_data.get('back_default')
            )
            
            # Determine rarity
            rarity = self._determine_rarity(pokemon_id)
            
            return PokemonData(
                id=pokemon_id,
                name=data['name'].capitalize(),
                types=types,
                stats=stats,
                sprite=sprite,
                back_sprite=back_sprite,
                rarity=rarity
            )

    def _determine_rarity(self, pokemon_id: int) -> Rarity:
        """
        Determine Pokémon rarity based on ID
        """
        if pokemon_id in self.legendary_ids:
            return Rarity.LEGENDARY
        elif pokemon_id in self.rare_ids:
            return Rarity.RARE
        elif pokemon_id in self.uncommon_ids:
            return Rarity.UNCOMMON
        else:
            return Rarity.COMMON

    async def get_random_pokemon(self, rarity: Optional[Rarity] = None) -> PokemonData:
        """
        Get a random Pokémon with optional rarity filter
        Uses weighted random selection if no rarity specified
        """
        if rarity:
            # Get random Pokémon of specific rarity
            pokemon_id = self._get_random_id_by_rarity(rarity)
        else:
            # Weighted random selection
            rarity = self._weighted_random_rarity()
            pokemon_id = self._get_random_id_by_rarity(rarity)
        
        return await self.get_pokemon(pokemon_id)

    def _weighted_random_rarity(self) -> Rarity:
        """
        Select a random rarity based on weights
        """
        rand = random.randint(1, 100)
        cumulative = 0
        
        for rarity, weight in self.rarity_weights.items():
            cumulative += weight
            if rand <= cumulative:
                return rarity
        
        return Rarity.COMMON  # Fallback

    def _get_random_id_by_rarity(self, rarity: Rarity) -> int:
        """
        Get a random Pokémon ID based on rarity
        """
        if rarity == Rarity.LEGENDARY:
            return random.choice(self.legendary_ids)
        elif rarity == Rarity.RARE:
            return random.choice(self.rare_ids)
        elif rarity == Rarity.UNCOMMON:
            return random.choice(self.uncommon_ids)
        else:
            # Common: Generation 1 Pokémon not in other categories
            all_gen1 = list(range(1, 152))
            excluded = self.legendary_ids + self.rare_ids + self.uncommon_ids
            common_ids = [pid for pid in all_gen1 if pid not in excluded]
            return random.choice(common_ids)

    async def get_random_starter(self) -> PokemonData:
        """
        Get a random starter Pokémon from the predefined list
        """
        starter_id = random.choice(self.starter_ids)
        return await self.get_pokemon(starter_id)

    async def get_all_starters(self) -> List[PokemonData]:
        """
        Get all available starter Pokémon
        """
        starters = []
        for starter_id in self.starter_ids:
            try:
                pokemon = await self.get_pokemon(starter_id)
                starters.append(pokemon)
            except Exception as e:
                print(f"Error fetching starter {starter_id}: {e}")
                continue
        
        return starters

    async def prefetch_generation_1(self):
        """
        Pre-fetch and cache all Generation 1 Pokémon (1-151)
        Called on startup to warm up the cache
        """
        print("🔄 Pre-fetching Generation 1 Pokémon...")
        success_count = 0
        
        for pokemon_id in range(1, 152):
            try:
                await self.get_pokemon(pokemon_id)
                success_count += 1
                if success_count % 10 == 0:
                    print(f"   Cached {success_count}/151 Pokémon...")
            except Exception as e:
                print(f"   Failed to cache Pokémon {pokemon_id}: {e}")
        
        print(f"✅ Pre-fetched {success_count}/151 Pokémon")

    async def calculate_capture_rate(
        self, 
        pokemon_id: int, 
        health_percent: float
    ) -> float:
        """
        Calculate capture rate based on Pokémon rarity and health
        
        Formula: base_rate * (1 - health_percent * 0.5) * rarity_modifier
        """
        pokemon = await self.get_pokemon(pokemon_id)
        
        # Base capture rates by rarity
        base_rates = {
            Rarity.COMMON: 0.8,
            Rarity.UNCOMMON: 0.6,
            Rarity.RARE: 0.4,
            Rarity.LEGENDARY: 0.1
        }
        
        base_rate = base_rates[pokemon.rarity]
        
        # Lower health = higher capture rate
        health_modifier = 1 - (health_percent * 0.5)
        
        # Calculate final rate
        capture_rate = base_rate * health_modifier
        
        # Clamp between 0.05 and 0.95
        return max(0.05, min(0.95, capture_rate))


# Global instance
pokemon_service = PokemonService()
