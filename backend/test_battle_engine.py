"""
Unit tests for Battle Engine Service
Tests battle calculations, type effectiveness, capture rates, and XP awards
"""
import pytest
from services.battle_engine import battle_engine
from models.pokemon import Rarity


class TestTypeEffectiveness:
    """Test type effectiveness calculations"""
    
    def test_super_effective(self):
        """Fire should be super effective against grass"""
        effectiveness = battle_engine._calculate_effectiveness('fire', ['grass'])
        assert effectiveness == 2.0
    
    def test_not_very_effective(self):
        """Water should be not very effective against grass"""
        effectiveness = battle_engine._calculate_effectiveness('water', ['grass'])
        assert effectiveness == 0.5
    
    def test_neutral_effectiveness(self):
        """Normal type should be neutral against most types"""
        effectiveness = battle_engine._calculate_effectiveness('normal', ['fire'])
        assert effectiveness == 1.0
    
    def test_dual_type_effectiveness(self):
        """Test effectiveness against dual-type Pokemon"""
        # Fire vs Water/Grass should be 2.0 * 0.5 = 1.0
        effectiveness = battle_engine._calculate_effectiveness('fire', ['water', 'grass'])
        assert effectiveness == 1.0


class TestDamageCalculation:
    """Test damage calculation formula"""
    
    def test_basic_damage(self):
        """Test basic damage calculation"""
        attacker = {
            'level': 10,
            'stats': {'attack': 50, 'defense': 40},
            'types': ['normal']
        }
        defender = {
            'level': 10,
            'stats': {'attack': 40, 'defense': 50},
            'types': ['normal']
        }
        move = {
            'name': 'Tackle',
            'type': 'normal',
            'power': 40
        }
        
        result = battle_engine.calculate_damage(attacker, defender, move)
        
        assert result.damage > 0
        assert result.effectiveness == 1.0
        assert isinstance(result.critical, bool)
        assert isinstance(result.message, str)
    
    def test_super_effective_damage(self):
        """Test that super effective moves deal more damage"""
        attacker = {
            'level': 10,
            'stats': {'attack': 50, 'defense': 40},
            'types': ['fire']
        }
        defender = {
            'level': 10,
            'stats': {'attack': 40, 'defense': 50},
            'types': ['grass']
        }
        move = {
            'name': 'Ember',
            'type': 'fire',
            'power': 40
        }
        
        result = battle_engine.calculate_damage(attacker, defender, move)
        
        assert result.effectiveness == 2.0
        assert "super effective" in result.message.lower()
    
    def test_not_very_effective_damage(self):
        """Test that not very effective moves deal less damage"""
        attacker = {
            'level': 10,
            'stats': {'attack': 50, 'defense': 40},
            'types': ['water']
        }
        defender = {
            'level': 10,
            'stats': {'attack': 40, 'defense': 50},
            'types': ['grass']
        }
        move = {
            'name': 'Water Gun',
            'type': 'water',
            'power': 40
        }
        
        result = battle_engine.calculate_damage(attacker, defender, move)
        
        assert result.effectiveness == 0.5
        assert "not very effective" in result.message.lower()
    
    def test_minimum_damage(self):
        """Test that damage is always at least 1"""
        attacker = {
            'level': 1,
            'stats': {'attack': 1, 'defense': 1},
            'types': ['normal']
        }
        defender = {
            'level': 100,
            'stats': {'attack': 255, 'defense': 255},
            'types': ['normal']
        }
        move = {
            'name': 'Tackle',
            'type': 'normal',
            'power': 1
        }
        
        result = battle_engine.calculate_damage(attacker, defender, move)
        
        assert result.damage >= 1


class TestCaptureRate:
    """Test capture rate calculations"""
    
    def test_common_full_health(self):
        """Test capture rate for common Pokemon at full health"""
        result = battle_engine.attempt_capture(1, 1.0, Rarity.COMMON)
        
        assert 0.0 <= result.capture_rate <= 1.0
        assert isinstance(result.success, bool)
        assert isinstance(result.message, str)
    
    def test_common_low_health(self):
        """Test capture rate for common Pokemon at low health"""
        result = battle_engine.attempt_capture(1, 0.1, Rarity.COMMON)
        
        # Low health should have higher capture rate
        assert result.capture_rate > 0.5
    
    def test_legendary_capture_difficulty(self):
        """Test that legendary Pokemon are harder to catch"""
        common_result = battle_engine.attempt_capture(1, 0.5, Rarity.COMMON)
        legendary_result = battle_engine.attempt_capture(1, 0.5, Rarity.LEGENDARY)
        
        # Legendary should have lower capture rate than common
        assert legendary_result.capture_rate < common_result.capture_rate
    
    def test_health_affects_capture_rate(self):
        """Test that lower health increases capture rate"""
        high_health = battle_engine.attempt_capture(1, 0.9, Rarity.COMMON)
        low_health = battle_engine.attempt_capture(1, 0.1, Rarity.COMMON)
        
        assert low_health.capture_rate > high_health.capture_rate
    
    def test_capture_rate_bounds(self):
        """Test that capture rate is clamped between 5% and 95%"""
        # Test minimum bound
        result_min = battle_engine.attempt_capture(1, 1.0, Rarity.LEGENDARY)
        assert result_min.capture_rate >= 0.05
        
        # Test maximum bound
        result_max = battle_engine.attempt_capture(1, 0.0, Rarity.COMMON)
        assert result_max.capture_rate <= 0.95


class TestExperienceAward:
    """Test experience point calculations"""
    
    def test_basic_xp_award(self):
        """Test basic XP calculation"""
        xp = battle_engine.award_experience(winner_level=10, loser_level=10)
        
        assert xp > 0
        assert isinstance(xp, int)
    
    def test_higher_level_opponent_bonus(self):
        """Test that defeating higher level opponents gives more XP"""
        xp_same = battle_engine.award_experience(winner_level=10, loser_level=10)
        xp_higher = battle_engine.award_experience(winner_level=10, loser_level=20)
        
        assert xp_higher > xp_same
    
    def test_lower_level_opponent_penalty(self):
        """Test that defeating lower level opponents gives less XP"""
        xp_same = battle_engine.award_experience(winner_level=10, loser_level=10)
        xp_lower = battle_engine.award_experience(winner_level=10, loser_level=5)
        
        assert xp_lower < xp_same
    
    def test_minimum_xp(self):
        """Test that XP is always at least 10"""
        xp = battle_engine.award_experience(winner_level=100, loser_level=1)
        
        assert xp >= 10


class TestLevelUp:
    """Test level up mechanics"""
    
    def test_level_up_check_true(self):
        """Test that Pokemon levels up when XP threshold is met"""
        current_level = 5
        required_xp = current_level ** 3  # 125
        
        should_level_up = battle_engine.check_level_up(required_xp, current_level)
        
        assert should_level_up is True
    
    def test_level_up_check_false(self):
        """Test that Pokemon doesn't level up when XP threshold is not met"""
        current_level = 5
        current_xp = 100  # Less than 125
        
        should_level_up = battle_engine.check_level_up(current_xp, current_level)
        
        assert should_level_up is False
    
    def test_level_up_formula(self):
        """Test that level up formula is correct (Level^3)"""
        # Level 2 requires 8 XP
        assert battle_engine.check_level_up(8, 2) is True
        assert battle_engine.check_level_up(7, 2) is False
        
        # Level 10 requires 1000 XP
        assert battle_engine.check_level_up(1000, 10) is True
        assert battle_engine.check_level_up(999, 10) is False


class TestStatGrowth:
    """Test stat growth calculations"""
    
    def test_stat_growth_increases_with_level(self):
        """Test that stats increase with level"""
        base_stat = 50
        
        stat_level_1 = battle_engine.calculate_stat_growth(base_stat, 1)
        stat_level_50 = battle_engine.calculate_stat_growth(base_stat, 50)
        stat_level_100 = battle_engine.calculate_stat_growth(base_stat, 100)
        
        assert stat_level_1 < stat_level_50 < stat_level_100
    
    def test_stat_growth_formula(self):
        """Test stat growth formula accuracy"""
        base_stat = 100
        level = 50
        
        # Formula: (base_stat * 2 * level / 100) + level + 10
        expected = int((100 * 2 * 50 / 100) + 50 + 10)  # 160
        actual = battle_engine.calculate_stat_growth(base_stat, level)
        
        assert actual == expected


class TestBattleEngineIntegration:
    """Integration tests for complete battle scenarios"""
    
    def test_complete_battle_flow(self):
        """Test a complete battle scenario"""
        # Setup
        attacker = {
            'level': 10,
            'stats': {'attack': 50, 'defense': 40},
            'types': ['fire']
        }
        defender = {
            'level': 10,
            'stats': {'attack': 40, 'defense': 50},
            'types': ['grass']
        }
        move = {
            'name': 'Ember',
            'type': 'fire',
            'power': 40
        }
        
        # Calculate damage
        damage_result = battle_engine.calculate_damage(attacker, defender, move)
        assert damage_result.damage > 0
        assert damage_result.effectiveness == 2.0
        
        # Award XP
        xp = battle_engine.award_experience(attacker['level'], defender['level'])
        assert xp > 0
        
        # Check level up
        should_level_up = battle_engine.check_level_up(xp, attacker['level'])
        assert isinstance(should_level_up, bool)
    
    def test_capture_after_battle(self):
        """Test capture attempt after weakening Pokemon"""
        # Simulate battle that reduces health to 20%
        health_percent = 0.2
        
        # Attempt capture
        result = battle_engine.attempt_capture(25, health_percent, Rarity.UNCOMMON)
        
        assert result.capture_rate > 0.5  # Should have good chance at low health
        assert isinstance(result.success, bool)


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])
