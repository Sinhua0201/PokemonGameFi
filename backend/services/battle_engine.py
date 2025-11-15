"""
Battle Engine Service - Handles battle calculations and mechanics
"""
import random
from typing import Dict, Any
from models.pokemon import Rarity, CaptureResult
from models.battle import DamageResult


class BattleEngine:
    def __init__(self):
        # Type effectiveness chart (simplified)
        self.type_chart = {
            'fire': {'grass': 2.0, 'water': 0.5, 'fire': 0.5},
            'water': {'fire': 2.0, 'grass': 0.5, 'water': 0.5},
            'grass': {'water': 2.0, 'fire': 0.5, 'grass': 0.5},
            'electric': {'water': 2.0, 'grass': 0.5, 'electric': 0.5},
            'normal': {},
        }
        
        # Base capture rates by rarity
        self.base_capture_rates = {
            Rarity.COMMON: 0.8,
            Rarity.UNCOMMON: 0.6,
            Rarity.RARE: 0.4,
            Rarity.LEGENDARY: 0.1,
        }

    def calculate_damage(
        self,
        attacker: Dict[str, Any],
        defender: Dict[str, Any],
        move: Dict[str, Any]
    ) -> DamageResult:
        """
        Calculate damage for a battle move
        
        Formula: ((2 * Level / 5 + 2) * Power * Attack / Defense / 50 + 2) * Modifiers
        """
        level = attacker.get('level', 1)
        attack = attacker.get('stats', {}).get('attack', 50)
        defense = defender.get('stats', {}).get('defense', 50)
        power = move.get('power', 40)
        
        # Base damage calculation
        base_damage = ((2 * level / 5 + 2) * power * attack / defense / 50 + 2)
        
        # Type effectiveness
        attacker_types = attacker.get('types', ['normal'])
        defender_types = defender.get('types', ['normal'])
        move_type = move.get('type', 'normal')
        
        effectiveness = self._calculate_effectiveness(move_type, defender_types)
        
        # Random factor (0.85 - 1.0)
        random_factor = random.uniform(0.85, 1.0)
        
        # STAB (Same Type Attack Bonus)
        stab = 1.5 if move_type in attacker_types else 1.0
        
        # Critical hit (6.25% chance)
        critical = 2.0 if random.random() < 0.0625 else 1.0
        
        # Final damage
        damage = int(base_damage * effectiveness * stab * critical * random_factor)
        damage = max(1, damage)  # Minimum 1 damage
        
        return DamageResult(
            damage=damage,
            effectiveness=effectiveness,
            critical=critical > 1.0,
            message=self._generate_damage_message(damage, effectiveness, critical > 1.0)
        )

    def get_type_effectiveness(self, move_type: str, defender_types: list) -> float:
        """
        Calculate type effectiveness multiplier (public API)
        """
        return self._calculate_effectiveness(move_type, defender_types)
    
    def _calculate_effectiveness(self, move_type: str, defender_types: list) -> float:
        """
        Calculate type effectiveness multiplier (internal)
        """
        effectiveness = 1.0
        
        for defender_type in defender_types:
            if move_type in self.type_chart:
                type_matchup = self.type_chart[move_type]
                if defender_type in type_matchup:
                    effectiveness *= type_matchup[defender_type]
        
        return effectiveness

    def _generate_damage_message(self, damage: int, effectiveness: float, critical: bool) -> str:
        """
        Generate battle message based on damage dealt
        """
        messages = []
        
        if critical:
            messages.append("A critical hit!")
        
        if effectiveness > 1.0:
            messages.append("It's super effective!")
        elif effectiveness < 1.0:
            messages.append("It's not very effective...")
        
        if not messages:
            messages.append(f"Dealt {damage} damage!")
        
        return " ".join(messages)

    def calculate_capture_rate(
        self,
        health_percent: float,
        rarity: str
    ) -> float:
        """
        Calculate capture rate based on health and rarity (public API)
        
        Capture rate formula: base_rate * (1 - health_percent * 0.5)
        """
        # Convert string rarity to enum
        rarity_enum = Rarity(rarity)
        
        # Get base capture rate
        base_rate = self.base_capture_rates[rarity_enum]
        
        # Health modifier (lower health = higher capture rate)
        health_modifier = 1 - (health_percent * 0.5)
        
        # Calculate final capture rate
        capture_rate = base_rate * health_modifier
        capture_rate = max(0.05, min(0.95, capture_rate))  # Clamp between 5% and 95%
        
        return capture_rate
    
    def attempt_capture(
        self,
        pokemon_id: int,
        health_percent: float,
        rarity: str
    ) -> CaptureResult:
        """
        Attempt to capture a Pokémon
        
        Capture rate formula: base_rate * (1 - health_percent * 0.5)
        """
        # Calculate capture rate
        capture_rate = self.calculate_capture_rate(health_percent, rarity)
        
        # Attempt capture
        success = random.random() < capture_rate
        
        # Generate message
        if success:
            message = f"Gotcha! Pokémon was caught! (Capture rate: {capture_rate:.1%})"
        else:
            message = f"Oh no! The Pokémon broke free! (Capture rate: {capture_rate:.1%})"
        
        return CaptureResult(
            success=success,
            capture_rate=capture_rate,
            message=message
        )

    def award_experience(self, winner_level: int, loser_level: int) -> int:
        """
        Calculate experience points awarded after battle
        
        Formula: (loser_level * 50) * (1 + (loser_level - winner_level) * 0.1)
        """
        base_xp = loser_level * 50
        level_diff_bonus = 1 + ((loser_level - winner_level) * 0.1)
        level_diff_bonus = max(0.5, min(2.0, level_diff_bonus))  # Clamp between 0.5x and 2.0x
        
        xp = int(base_xp * level_diff_bonus)
        return max(10, xp)  # Minimum 10 XP

    def check_level_up(self, current_xp: int, current_level: int) -> bool:
        """
        Check if Pokémon should level up
        
        XP required for next level: level^3
        """
        xp_required = current_level ** 3
        return current_xp >= xp_required

    def calculate_stat_growth(self, base_stat: int, level: int) -> int:
        """
        Calculate stat value at a given level
        
        Formula: (base_stat * 2 * level / 100) + level + 10
        """
        stat = int((base_stat * 2 * level / 100) + level + 10)
        return stat


# Global instance
battle_engine = BattleEngine()
