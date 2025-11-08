/**
 * Unit tests for game.js utility functions
 * Tests non-DOM logic: tier calculations, element mapping, recipe scaling
 */

import {
  getTierSymbol,
  getTierAppropriateStyle,
  getWorkstationTier,
  getUpgradeTier,
  getIngredientElement,
  getScaledRecipe
} from '../../js/game.js';
import { PRODUCERS, INGREDIENTS } from '../../js/data.js';

describe('Game Utility Functions', () => {
  describe('getTierSymbol', () => {
    test('should return tier 0 symbol', () => {
      const tier0 = getTierSymbol(0);
      expect(tier0.symbol).toBe('◉');
      expect(tier0.color).toBe('#FFFFFF');
    });

    test('should return tier 1 symbol', () => {
      const tier1 = getTierSymbol(1);
      expect(tier1.symbol).toBe('◆');
      expect(tier1.color).toBe('#FF10F0');
    });

    test('should return tier 2 symbol', () => {
      const tier2 = getTierSymbol(2);
      expect(tier2.symbol).toBe('◈');
      expect(tier2.color).toBe('#FFFF00');
    });

    test('should return tier 3 symbol', () => {
      const tier3 = getTierSymbol(3);
      expect(tier3.symbol).toBe('✧');
      expect(tier3.color).toBe('#39FF14');
    });

    test('should return tier 4 symbol', () => {
      const tier4 = getTierSymbol(4);
      expect(tier4.symbol).toBe('✦');
      expect(tier4.color).toBe('#00FFFF');
    });

    test('should return tier 5 symbol', () => {
      const tier5 = getTierSymbol(5);
      expect(tier5.symbol).toBe('✪');
      expect(tier5.color).toBe('#FF6B00');
    });

    test('should return tier 0 for invalid tier', () => {
      const invalid = getTierSymbol(999);
      expect(invalid.symbol).toBe('◉');
    });

    test('should include gradient', () => {
      const tier1 = getTierSymbol(1);
      expect(tier1.gradient).toBeDefined();
      expect(tier1.gradient).toContain('linear-gradient');
    });

    test('should include glow', () => {
      const tier1 = getTierSymbol(1);
      expect(tier1.glow).toBeDefined();
      expect(tier1.glow).toContain('rgba');
    });

    test('should include borderGlow', () => {
      const tier1 = getTierSymbol(1);
      expect(tier1.borderGlow).toBeDefined();
    });
  });

  describe('getScaledRecipe', () => {
    test('should scale recipe with growth 1.15', () => {
      const baseRecipe = { fire_essence: 10, water_essence: 5 };
      const scaled = getScaledRecipe(baseRecipe, 1, 1.15);

      expect(scaled.fire_essence).toBe(Math.ceil(10 * 1.15));
      expect(scaled.water_essence).toBe(Math.ceil(5 * 1.15));
    });

    test('should scale recipe for 0 owned', () => {
      const baseRecipe = { fire_essence: 10 };
      const scaled = getScaledRecipe(baseRecipe, 0, 1.15);

      expect(scaled.fire_essence).toBe(10); // 10 * 1.15^0 = 10
    });

    test('should scale recipe for 5 owned', () => {
      const baseRecipe = { crystal_dust: 100 };
      const scaled = getScaledRecipe(baseRecipe, 5, 1.2);

      const expected = Math.ceil(100 * Math.pow(1.2, 5));
      expect(scaled.crystal_dust).toBe(expected);
    });

    test('should handle multiple ingredients', () => {
      const baseRecipe = {
        fire_essence: 10,
        water_essence: 20,
        air_essence: 15
      };
      const scaled = getScaledRecipe(baseRecipe, 2, 1.1);

      expect(scaled.fire_essence).toBeGreaterThan(10);
      expect(scaled.water_essence).toBeGreaterThan(20);
      expect(scaled.air_essence).toBeGreaterThan(15);
    });

    test('should always ceil the result', () => {
      const baseRecipe = { fire_essence: 1 };
      const scaled = getScaledRecipe(baseRecipe, 1, 1.01);

      // 1 * 1.01 = 1.01, should ceil to 2
      expect(scaled.fire_essence).toBe(2);
    });

    test('should handle empty recipe', () => {
      const scaled = getScaledRecipe({}, 5, 1.15);
      expect(scaled).toEqual({});
    });

    test('should scale with growth 2.0', () => {
      const baseRecipe = { fire_essence: 10 };
      const scaled = getScaledRecipe(baseRecipe, 3, 2.0);

      expect(scaled.fire_essence).toBe(Math.ceil(10 * 8)); // 10 * 2^3 = 80
    });
  });

  describe('getWorkstationTier', () => {
    test('should return tier 0 for first workstation', () => {
      if (PRODUCERS.length > 0) {
        const tier = getWorkstationTier(PRODUCERS[0]);
        expect(tier).toBe(0);
      }
    });

    test('should return tier 0 for index 4', () => {
      if (PRODUCERS.length > 4) {
        const tier = getWorkstationTier(PRODUCERS[4]);
        expect(tier).toBe(0);
      }
    });

    test('should return tier 1 for index 5', () => {
      if (PRODUCERS.length > 5) {
        const tier = getWorkstationTier(PRODUCERS[5]);
        expect(tier).toBe(1);
      }
    });

    test('should return tier 1 for index 9', () => {
      if (PRODUCERS.length > 9) {
        const tier = getWorkstationTier(PRODUCERS[9]);
        expect(tier).toBe(1);
      }
    });

    test('should return tier 2 for index 10', () => {
      if (PRODUCERS.length > 10) {
        const tier = getWorkstationTier(PRODUCERS[10]);
        expect(tier).toBe(2);
      }
    });

    test('should return tier 3 for index 15', () => {
      if (PRODUCERS.length > 15) {
        const tier = getWorkstationTier(PRODUCERS[15]);
        expect(tier).toBe(3);
      }
    });

    test('should return tier 4 for index 20', () => {
      if (PRODUCERS.length > 20) {
        const tier = getWorkstationTier(PRODUCERS[20]);
        expect(tier).toBe(4);
      }
    });

    test('should return -1 for non-existent workstation', () => {
      const tier = getWorkstationTier({ id: 'nonexistent' });
      expect(tier).toBe(-1);
    });
  });

  describe('getUpgradeTier', () => {
    test('should return 0 for upgrade with no recipe', () => {
      const tier = getUpgradeTier({ recipe: {} });
      expect(tier).toBe(0);
    });

    test('should return max tier from recipe ingredients', () => {
      // Find a tier 0 and tier 1 ingredient
      const tier0Ing = INGREDIENTS.find(ing => ing.tier === 0);
      const tier1Ing = INGREDIENTS.find(ing => ing.tier === 1);

      if (tier0Ing && tier1Ing) {
        const upgrade = {
          recipe: {
            [tier0Ing.id]: 10,
            [tier1Ing.id]: 5
          }
        };

        const tier = getUpgradeTier(upgrade);
        expect(tier).toBe(1);
      }
    });

    test('should handle recipe with single ingredient', () => {
      const tier2Ing = INGREDIENTS.find(ing => ing.tier === 2);

      if (tier2Ing) {
        const upgrade = {
          recipe: {
            [tier2Ing.id]: 100
          }
        };

        const tier = getUpgradeTier(upgrade);
        expect(tier).toBe(2);
      }
    });

    test('should return 0 for recipe with unknown ingredients', () => {
      const upgrade = {
        recipe: {
          'unknown_ingredient': 50
        }
      };

      const tier = getUpgradeTier(upgrade);
      expect(tier).toBe(0);
    });
  });

  describe('getIngredientElement', () => {
    test('should map fire_essence to fire', () => {
      expect(getIngredientElement('fire_essence')).toBe('fire');
    });

    test('should map water_essence to water', () => {
      expect(getIngredientElement('water_essence')).toBe('water');
    });

    test('should map air_essence to air', () => {
      expect(getIngredientElement('air_essence')).toBe('air');
    });

    test('should map crystal_dust to crystal', () => {
      expect(getIngredientElement('crystal_dust')).toBe('crystal');
    });

    test('should map aether_ess to aether', () => {
      expect(getIngredientElement('aether_ess')).toBe('aether');
    });

    test('should map focus to aether', () => {
      expect(getIngredientElement('focus')).toBe('aether');
    });

    test('should map ab to aether', () => {
      expect(getIngredientElement('ab')).toBe('aether');
    });

    test('should infer fire from name', () => {
      const result = getIngredientElement('fire_candle');
      expect(result).toBe('fire');
    });

    test('should infer water from name', () => {
      const result = getIngredientElement('water_liquid');
      expect(result).toBe('water');
    });

    test('should infer air from name', () => {
      const result = getIngredientElement('air_wind');
      expect(result).toBe('air');
    });

    test('should infer crystal from name', () => {
      const result = getIngredientElement('crystal_orb');
      expect(result).toBe('crystal');
    });

    test('should infer aether from name', () => {
      const result = getIngredientElement('aether_dist');
      expect(result).toBe('aether');
    });

    test('should return null for unknown ingredient', () => {
      const result = getIngredientElement('completely_unknown_thing');
      expect(result).toBeNull();
    });

    test('should throw on undefined input', () => {
      expect(() => {
        getIngredientElement(undefined);
      }).toThrow();
    });

    test('should handle empty string', () => {
      const result = getIngredientElement('');
      expect(result).toBeNull();
    });
  });
});
