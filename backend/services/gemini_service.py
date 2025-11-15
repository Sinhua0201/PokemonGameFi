"""
Gemini AI Service - Handles AI-powered text generation with rate limiting and error handling
"""
import google.generativeai as genai
from config import settings
from typing import List, Dict, Any, Optional
import asyncio
import time
import json
import logging
from functools import wraps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RateLimiter:
    """Simple rate limiter for API calls"""
    def __init__(self, max_calls: int = 60, time_window: int = 60):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
    
    async def acquire(self):
        """Wait if rate limit is exceeded"""
        now = time.time()
        # Remove old calls outside the time window
        self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
        
        if len(self.calls) >= self.max_calls:
            # Calculate wait time
            oldest_call = min(self.calls)
            wait_time = self.time_window - (now - oldest_call)
            if wait_time > 0:
                logger.warning(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                await asyncio.sleep(wait_time)
                return await self.acquire()
        
        self.calls.append(now)


def handle_gemini_errors(fallback_text: str = ""):
    """Decorator for handling Gemini API errors with fallback"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Gemini API error in {func.__name__}: {str(e)}")
                # Return fallback text or generate simple fallback
                if fallback_text:
                    return fallback_text
                # Try to generate fallback from function context
                return await generate_fallback(func.__name__, args, kwargs)
        return wrapper
    return decorator


async def generate_fallback(func_name: str, args: tuple, kwargs: dict) -> str:
    """Generate simple fallback text based on function name"""
    if "encounter" in func_name:
        pokemon_name = args[1] if len(args) > 1 else kwargs.get('pokemon_name', 'Pokémon')
        return f"A wild {pokemon_name} appeared!"
    elif "commentary" in func_name:
        attacker = args[1] if len(args) > 1 else kwargs.get('attacker', 'Pokémon')
        move = kwargs.get('move', 'attack')
        damage = kwargs.get('damage', 0)
        return f"{attacker} used {move}! It dealt {damage} damage!"
    elif "hatching" in func_name:
        pokemon_name = args[1] if len(args) > 1 else kwargs.get('pokemon_name', 'Pokémon')
        return f"The egg hatched! It's a {pokemon_name}!"
    return "Something exciting happened!"


class GeminiService:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            settings.GEMINI_MODEL,
            generation_config={
                "temperature": 0.9,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 200,
            }
        )
        # Rate limiter: 60 requests per minute
        self.rate_limiter = RateLimiter(max_calls=60, time_window=60)
        logger.info(f"✅ Gemini Service initialized with model: {settings.GEMINI_MODEL}")

    @handle_gemini_errors()
    async def generate_encounter_text(
        self,
        pokemon_name: str,
        pokemon_types: List[str],
        pokemon_level: int
    ) -> str:
        """
        Generate encounter description text with AI
        """
        await self.rate_limiter.acquire()
        
        prompt = f"""You are a Pokémon game narrator. Generate an exciting encounter description.

Pokémon: {pokemon_name}
Types: {', '.join(pokemon_types)}
Level: {pokemon_level}

Write exactly 2 sentences in an exciting, immersive style that captures the moment of encountering this wild Pokémon.
Focus on the Pokémon's appearance, behavior, or the environment.

Example: "A wild Pikachu appeared! The electric mouse Pokémon crackles with energy, its cheeks sparking with electricity!"
"""
        
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        text = response.text.strip()
        logger.info(f"Generated encounter text for {pokemon_name}")
        return text

    @handle_gemini_errors()
    async def generate_battle_commentary(
        self,
        attacker: str,
        defender: str,
        move: str,
        damage: int,
        effectiveness: float
    ) -> str:
        """
        Generate dynamic battle commentary
        """
        await self.rate_limiter.acquire()
        
        effectiveness_text = ""
        if effectiveness > 1.5:
            effectiveness_text = "It's super effective!"
        elif effectiveness < 0.75:
            effectiveness_text = "It's not very effective..."
        elif effectiveness == 0:
            effectiveness_text = "It doesn't affect the opponent!"
        
        prompt = f"""You are an enthusiastic Pokémon battle commentator. Generate exciting commentary for this battle move.

Attacker: {attacker}
Defender: {defender}
Move: {move}
Damage: {damage} HP
Effectiveness: {effectiveness}x {effectiveness_text}

Write exactly 1 sentence of exciting, dynamic commentary that captures the action.
Be creative and vary your style - use different verbs, descriptions, and energy levels.

Examples:
- "Pikachu's Thunderbolt strikes Squirtle with devastating power!"
- "Charizard unleashes a massive Flamethrower that engulfs Venusaur!"
- "The attack barely scratches the opponent's defenses!"
"""
        
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        text = response.text.strip()
        logger.info(f"Generated battle commentary: {attacker} vs {defender}")
        return text

    async def generate_commentary(self, prompt: str) -> str:
        """
        Generate general commentary from a prompt
        """
        await self.rate_limiter.acquire()
        
        try:
            full_prompt = f"""You are an enthusiastic Pokémon battle commentator. {prompt}

Generate exactly 1 sentence of exciting, dynamic commentary.
Be creative and vary your style.
"""
            
            response = await asyncio.to_thread(self.model.generate_content, full_prompt)
            text = response.text.strip()
            logger.info(f"Generated commentary from prompt")
            return text
        except Exception as e:
            logger.error(f"Error generating commentary: {str(e)}")
            return "The battle continues with intense action!"

    async def select_ai_move(
        self,
        ai_pokemon: Dict[str, Any],
        player_pokemon: Dict[str, Any],
        available_moves: List[Dict[str, Any]]
    ) -> tuple[Dict[str, Any], str]:
        """
        AI trainer selects the best move using strategic analysis
        Returns: (selected_move, reasoning)
        """
        await self.rate_limiter.acquire()
        
        if not available_moves:
            return {"name": "Tackle", "power": 40, "type": "normal", "accuracy": 1.0}, "Default move"
        
        try:
            # Use Gemini for strategic move selection
            prompt = f"""You are a strategic Pokémon battle AI. Analyze the battle state and select the best move.

Your Pokémon: {ai_pokemon.get('name', 'Unknown')} (HP: {ai_pokemon.get('currentHp', 100)}/{ai_pokemon.get('stats', {}).get('hp', 100)})
Types: {', '.join(ai_pokemon.get('types', []))}

Opponent: {player_pokemon.get('name', 'Unknown')} (HP: {player_pokemon.get('currentHp', 100)}/{player_pokemon.get('stats', {}).get('hp', 100)})
Types: {', '.join(player_pokemon.get('types', []))}

Available Moves:
{json.dumps(available_moves, indent=2)}

Select the best move considering:
1. Type effectiveness against opponent
2. Move power and accuracy
3. Current HP situation
4. Strategic advantage

Respond with ONLY the move name, nothing else.
"""
            
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            selected_move_name = response.text.strip().strip('"\'').strip('.')
            
            # Find the move in available moves
            for move in available_moves:
                if move['name'].lower() == selected_move_name.lower():
                    logger.info(f"AI selected move: {move['name']}")
                    reasoning = f"Selected {move['name']} for strategic advantage"
                    return move, reasoning
            
            # Fallback: select move with best type effectiveness
            move = self._select_best_move_fallback(available_moves, player_pokemon.get('types', []))
            return move, "Selected based on type effectiveness"
            
        except Exception as e:
            logger.error(f"Error in AI move selection: {str(e)}")
            move = self._select_best_move_fallback(available_moves, player_pokemon.get('types', []))
            return move, "Fallback selection"

    def _select_best_move_fallback(self, moves: List[Dict[str, Any]], opponent_types: List[str]) -> Dict[str, Any]:
        """Fallback move selection based on power and type effectiveness"""
        import random
        
        # Simple type effectiveness chart
        type_chart = {
            'fire': {'grass': 2.0, 'water': 0.5, 'ice': 2.0},
            'water': {'fire': 2.0, 'ground': 2.0, 'grass': 0.5},
            'grass': {'water': 2.0, 'ground': 2.0, 'fire': 0.5},
            'electric': {'water': 2.0, 'flying': 2.0, 'ground': 0.0},
            'ice': {'grass': 2.0, 'ground': 2.0, 'flying': 2.0, 'fire': 0.5},
            'fighting': {'normal': 2.0, 'ice': 2.0, 'flying': 0.5},
            'poison': {'grass': 2.0, 'ground': 0.5},
            'ground': {'fire': 2.0, 'electric': 2.0, 'grass': 0.5},
            'flying': {'grass': 2.0, 'fighting': 2.0, 'electric': 0.5},
            'psychic': {'fighting': 2.0, 'poison': 2.0},
            'bug': {'grass': 2.0, 'psychic': 2.0, 'fire': 0.5},
            'rock': {'fire': 2.0, 'ice': 2.0, 'fighting': 0.5},
            'ghost': {'psychic': 2.0, 'ghost': 2.0},
            'dragon': {'dragon': 2.0},
        }
        
        # Score each move
        best_move = moves[0]
        best_score = 0
        
        for move in moves:
            score = move.get('power', 40)
            move_type = move.get('type', 'normal')
            
            # Check type effectiveness
            for opp_type in opponent_types:
                effectiveness = type_chart.get(move_type, {}).get(opp_type, 1.0)
                score *= effectiveness
            
            if score > best_score:
                best_score = score
                best_move = move
        
        return best_move

    @handle_gemini_errors()
    async def generate_quest(
        self,
        player_team: List[Dict[str, Any]],
        player_level: int
    ) -> Dict[str, Any]:
        """
        Generate personalized quest based on player's team and progress
        """
        await self.rate_limiter.acquire()
        
        team_summary = f"{len(player_team)} Pokémon"
        if player_team:
            team_types = set()
            for pokemon in player_team:
                team_types.update(pokemon.get('types', []))
            team_summary += f" (Types: {', '.join(team_types)})"
        
        prompt = f"""Generate a personalized Pokémon quest for a player.

Player Level: {player_level}
Team: {team_summary}

Create an engaging quest with:
1. Title: Short, exciting (max 5 words)
2. Description: 2-3 sentences explaining the quest story
3. Objective Type: Choose ONE from [battle, capture, hatch, trade]
4. Objective Target: A number between 1-5
5. Reward Type: Choose ONE from [tokens, pokemon, egg]
6. Reward Amount: If tokens, amount between 100-1000. If pokemon, a pokemon_id (1-151). If egg, set to null.

Respond in this EXACT JSON format:
{{
  "title": "Quest Title Here",
  "description": "Quest description here.",
  "objective_type": "battle",
  "objective_target": 3,
  "reward_type": "tokens",
  "reward_amount": 500
}}
"""
        
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        text = response.text.strip()
        
        # Extract JSON from response
        try:
            # Remove markdown code blocks if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            
            quest_data = json.loads(text)
            logger.info(f"Generated quest: {quest_data.get('title')}")
            return quest_data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse quest JSON: {str(e)}")
            # Return fallback quest
            return {
                "title": "Training Challenge",
                "description": "Battle and train your Pokémon to become stronger! Prove your skills as a trainer.",
                "objective_type": "battle",
                "objective_target": 3,
                "reward_type": "tokens",
                "reward_amount": 300
            }

    @handle_gemini_errors()
    async def generate_hatching_text(
        self,
        pokemon_name: str,
        pokemon_types: List[str]
    ) -> str:
        """
        Generate exciting egg hatching reveal text
        """
        await self.rate_limiter.acquire()
        
        prompt = f"""You are a Pokémon game narrator. Generate an exciting egg hatching reveal.

Pokémon: {pokemon_name}
Types: {', '.join(pokemon_types)}

Write exactly 2 sentences that capture the magical moment of the egg hatching.
First sentence: Describe the egg beginning to hatch (glowing, cracking, etc.)
Second sentence: Reveal the Pokémon with a distinctive characteristic.

Example: "The egg begins to glow with an intense light! A Charmander emerges, its tail flame burning bright with determination!"
"""
        
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        text = response.text.strip()
        logger.info(f"Generated hatching text for {pokemon_name}")
        return text

    @handle_gemini_errors()
    async def generate_trainer_dialogue(
        self,
        player_message: str,
        trainer_personality: str,
        conversation_history: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate AI trainer dialogue response based on personality and context
        
        Args:
            player_message: The player's message to the trainer
            trainer_personality: One of 'friendly', 'competitive', 'mysterious'
            conversation_history: List of previous messages [{"role": "player"|"trainer", "message": "..."}]
            context: Optional context like battle state, player team, etc.
        
        Returns:
            AI-generated trainer response
        """
        await self.rate_limiter.acquire()
        
        # Define trainer personalities
        personality_prompts = {
            'friendly': """You are a friendly and encouraging Pokémon trainer. You're supportive, give helpful advice, 
            and always see the positive side. You love sharing stories about your Pokémon and adventures. 
            Keep responses warm, enthusiastic, and under 3 sentences.""",
            
            'competitive': """You are a competitive and confident Pokémon trainer. You're focused on winning, 
            strategy, and becoming the best. You respect strong opponents and challenge them to improve. 
            Keep responses bold, strategic, and under 3 sentences.""",
            
            'mysterious': """You are a mysterious and enigmatic Pokémon trainer. You speak in riddles, 
            hint at hidden knowledge, and have an air of intrigue. You're wise but cryptic. 
            Keep responses intriguing, philosophical, and under 3 sentences."""
        }
        
        personality_prompt = personality_prompts.get(
            trainer_personality, 
            personality_prompts['friendly']
        )
        
        # Build conversation context
        history_text = ""
        if conversation_history:
            recent_history = conversation_history[-5:]  # Last 5 messages for context
            for msg in recent_history:
                role = "Player" if msg['role'] == 'player' else "You"
                history_text += f"{role}: {msg['message']}\n"
        
        # Add game context if provided
        context_text = ""
        if context:
            if context.get('trigger') == 'before_battle':
                context_text = "\n[Context: You're about to start a battle with the player]"
            elif context.get('trigger') == 'after_victory':
                context_text = "\n[Context: The player just won a battle]"
            elif context.get('trigger') == 'after_defeat':
                context_text = "\n[Context: The player just lost a battle]"
            elif context.get('player_team'):
                team_info = ', '.join([p.get('name', 'Unknown') for p in context['player_team'][:3]])
                context_text = f"\n[Context: Player's team includes {team_info}]"
        
        prompt = f"""{personality_prompt}

{history_text}
Player: {player_message}
{context_text}

Respond as the trainer in character. Be natural, engaging, and stay in character.
Keep your response under 3 sentences.
"""
        
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        text = response.text.strip()
        logger.info(f"Generated {trainer_personality} trainer dialogue")
        return text


# Global instance
gemini_service = GeminiService()
