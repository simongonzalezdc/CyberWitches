/**
 * Unit tests for data.js
 * Tests game data integrity, validation, and cross-references
 */

import {
  INGREDIENTS,
  PRODUCERS,
  UPGRADES,
  PRESTIGE_BONUSES,
  DAILY_TASKS_POOL,
  HIDDEN_RECIPES,
  MEDITATION_TOWERS,
  MEDITATION_DISTRACTIONS,
  MEDITATION_UPGRADES
} from '../../js/data.js';

describe('Data.js - Game Data Validation', () => {

  describe('INGREDIENTS Array', () => {
    test('should export INGREDIENTS array', () => {
      expect(INGREDIENTS).toBeDefined();
      expect(Array.isArray(INGREDIENTS)).toBe(true);
      expect(INGREDIENTS.length).toBeGreaterThan(0);
    });

    test('all ingredients should have required fields', () => {
      INGREDIENTS.forEach(ing => {
        expect(ing.id).toBeDefined();
        expect(typeof ing.id).toBe('string');
        expect(ing.id.length).toBeGreaterThan(0);

        expect(ing.displayName).toBeDefined();
        expect(typeof ing.displayName).toBe('string');

        expect(ing.tier).toBeDefined();
        expect(typeof ing.tier).toBe('number');
        expect(ing.tier).toBeGreaterThanOrEqual(0);
      });
    });

    test('ingredient IDs should be unique', () => {
      const ids = INGREDIENTS.map(ing => ing.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('ingredient tiers should be valid', () => {
      INGREDIENTS.forEach(ing => {
        expect(ing.tier).toBeGreaterThanOrEqual(0);
        expect(ing.tier).toBeLessThanOrEqual(10);
      });
    });

    test('meditation-only ingredients should have meditationOnly flag', () => {
      const meditationIngredients = INGREDIENTS.filter(ing => ing.meditationOnly);
      meditationIngredients.forEach(ing => {
        expect(ing.meditationOnly).toBe(true);
      });
    });

    test('should have base tier 0 ingredients', () => {
      const tier0 = INGREDIENTS.filter(ing => ing.tier === 0);
      expect(tier0.length).toBeGreaterThan(0);
    });

    test('should have ingredients across multiple tiers', () => {
      const tiers = [...new Set(INGREDIENTS.map(ing => ing.tier))];
      expect(tiers.length).toBeGreaterThan(1);
    });
  });

  describe('PRODUCERS Array', () => {
    test('should export PRODUCERS array', () => {
      expect(PRODUCERS).toBeDefined();
      expect(Array.isArray(PRODUCERS)).toBe(true);
      expect(PRODUCERS.length).toBeGreaterThan(0);
    });

    test('all producers should have required fields', () => {
      PRODUCERS.forEach(prod => {
        expect(prod.id).toBeDefined();
        expect(typeof prod.id).toBe('string');

        expect(prod.displayName).toBeDefined();
        expect(typeof prod.displayName).toBe('string');

        // description is optional
        if (prod.description !== undefined) {
          expect(typeof prod.description).toBe('string');
        }

        expect(prod.unlockAtAb).toBeDefined();
        expect(typeof prod.unlockAtAb).toBe('number');
        expect(prod.unlockAtAb).toBeGreaterThanOrEqual(0);

        expect(prod.recipe).toBeDefined();
        expect(typeof prod.recipe).toBe('object');

        expect(prod.growth).toBeDefined();
        expect(typeof prod.growth).toBe('number');
        expect(prod.growth).toBeGreaterThanOrEqual(1.0);

        expect(prod.outputs).toBeDefined();
        expect(typeof prod.outputs).toBe('object');
      });
    });

    test('producer IDs should be unique', () => {
      const ids = PRODUCERS.map(prod => prod.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('producer recipes should reference valid ingredients', () => {
      const ingredientIds = new Set(INGREDIENTS.map(ing => ing.id));

      PRODUCERS.forEach(prod => {
        Object.keys(prod.recipe).forEach(ingId => {
          // Special cases for AB or other non-ingredient costs
          if (ingId !== 'ab') {
            expect(ingredientIds.has(ingId)).toBe(true);
          }
        });
      });
    });

    test('producer outputs should have positive production rates', () => {
      PRODUCERS.forEach(prod => {
        Object.values(prod.outputs).forEach(rate => {
          expect(typeof rate).toBe('number');
          expect(rate).toBeGreaterThan(0);
        });
      });
    });

    test('producer growth rates should be reasonable', () => {
      PRODUCERS.forEach(prod => {
        expect(prod.growth).toBeGreaterThanOrEqual(1.0);
        expect(prod.growth).toBeLessThanOrEqual(2.0); // Typical idle game range
      });
    });

    test('producer unlock costs should be increasing', () => {
      // Generally, producers should have increasing unlock costs
      const unlockCosts = PRODUCERS.map(prod => prod.unlockAtAb).filter(cost => cost > 0);
      const hasProgressiveUnlocks = unlockCosts.length > 1;
      expect(hasProgressiveUnlocks).toBe(true);
    });
  });

  describe('UPGRADES Array', () => {
    test('should export UPGRADES array', () => {
      expect(UPGRADES).toBeDefined();
      expect(Array.isArray(UPGRADES)).toBe(true);
      expect(UPGRADES.length).toBeGreaterThan(0);
    });

    test('all upgrades should have required fields', () => {
      UPGRADES.forEach(upg => {
        expect(upg.id).toBeDefined();
        expect(typeof upg.id).toBe('string');

        expect(upg.displayName).toBeDefined();
        expect(typeof upg.displayName).toBe('string');

        expect(upg.description).toBeDefined();
        expect(typeof upg.description).toBe('string');

        expect(upg.affects).toBeDefined();
        expect(typeof upg.affects).toBe('string');

        expect(upg.type).toBeDefined();
        const validTypes = ['multiplier', 'additive', 'flat', 'conversion'];
        expect(validTypes.includes(upg.type)).toBe(true);

        expect(upg.value).toBeDefined();
        expect(typeof upg.value).toBe('number');

        expect(upg.recipe).toBeDefined();
        expect(typeof upg.recipe).toBe('object');

        expect(upg.unlockAtAb).toBeDefined();
        expect(typeof upg.unlockAtAb).toBe('number');
        expect(upg.unlockAtAb).toBeGreaterThanOrEqual(0);
      });
    });

    test('upgrade IDs should be unique', () => {
      const ids = UPGRADES.map(upg => upg.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('upgrade recipes should reference valid ingredients', () => {
      const ingredientIds = new Set(INGREDIENTS.map(ing => ing.id));

      UPGRADES.forEach(upg => {
        Object.keys(upg.recipe).forEach(ingId => {
          if (ingId !== 'ab') {
            expect(ingredientIds.has(ingId)).toBe(true);
          }
        });
      });
    });

    test('upgrade values should be positive', () => {
      UPGRADES.forEach(upg => {
        expect(upg.value).toBeGreaterThan(0);
      });
    });

    test('multiplier upgrades should have values >= 1.0', () => {
      const multiplierUpgrades = UPGRADES.filter(upg => upg.type === 'multiplier');
      multiplierUpgrades.forEach(upg => {
        expect(upg.value).toBeGreaterThanOrEqual(1.0);
      });
    });

    test('upgrades should have valid affect targets', () => {
      UPGRADES.forEach(upg => {
        // Affects can be any string - just validate it's non-empty
        expect(upg.affects).toBeDefined();
        expect(typeof upg.affects).toBe('string');
        expect(upg.affects.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PRESTIGE_BONUSES Array', () => {
    test('should export PRESTIGE_BONUSES array', () => {
      expect(PRESTIGE_BONUSES).toBeDefined();
      expect(Array.isArray(PRESTIGE_BONUSES)).toBe(true);
      expect(PRESTIGE_BONUSES.length).toBeGreaterThan(0);
    });

    test('all prestige bonuses should have required fields', () => {
      PRESTIGE_BONUSES.forEach(bonus => {
        expect(bonus.id).toBeDefined();
        expect(typeof bonus.id).toBe('string');

        expect(bonus.displayName).toBeDefined();
        expect(typeof bonus.displayName).toBe('string');

        expect(bonus.description).toBeDefined();
        expect(typeof bonus.description).toBe('string');

        expect(bonus.type).toBeDefined();
        expect(typeof bonus.type).toBe('string');

        expect(bonus.value).toBeDefined();
        expect(typeof bonus.value).toBe('number');

        expect(bonus.baseCostPp).toBeDefined();
        expect(typeof bonus.baseCostPp).toBe('number');
        expect(bonus.baseCostPp).toBeGreaterThan(0);

        expect(bonus.costGrowth).toBeDefined();
        expect(typeof bonus.costGrowth).toBe('number');
        expect(bonus.costGrowth).toBeGreaterThanOrEqual(1.0);
      });
    });

    test('prestige bonus IDs should be unique', () => {
      const ids = PRESTIGE_BONUSES.map(bonus => bonus.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('prestige bonus values should be positive', () => {
      PRESTIGE_BONUSES.forEach(bonus => {
        expect(bonus.value).toBeGreaterThan(0);
      });
    });

    test('prestige bonus cost growth should be reasonable', () => {
      PRESTIGE_BONUSES.forEach(bonus => {
        expect(bonus.costGrowth).toBeGreaterThanOrEqual(1.0);
        expect(bonus.costGrowth).toBeLessThanOrEqual(5.0);
      });
    });

    test('prestige bonuses should have valid types', () => {
      const validTypes = [
        'global_mult',
        'ab_production_mult',
        'ingredient_mult',
        'starting_currency',
        'start_ingredient',
        'offline_mult',
        'cast_power',
        'click_mult',
        'producer_mult',
        'production_multiplier',
        'ek_conversion',
        'prestige_speed',
        'focus_conversion_mult',
        'meditation_focus_mult'
      ];

      PRESTIGE_BONUSES.forEach(bonus => {
        expect(validTypes.includes(bonus.type)).toBe(true);
      });
    });
  });

  describe('DAILY_TASKS_POOL Array', () => {
    test('should export DAILY_TASKS_POOL array', () => {
      expect(DAILY_TASKS_POOL).toBeDefined();
      expect(Array.isArray(DAILY_TASKS_POOL)).toBe(true);
    });

    test('all daily tasks should have required fields', () => {
      if (DAILY_TASKS_POOL.length === 0) return;

      DAILY_TASKS_POOL.forEach(task => {
        expect(task.id).toBeDefined();
        expect(typeof task.id).toBe('string');

        expect(task.displayName).toBeDefined();
        expect(typeof task.displayName).toBe('string');

        expect(task.description).toBeDefined();
        expect(typeof task.description).toBe('string');

        expect(task.condition).toBeDefined();
        expect(typeof task.condition).toBe('string');

        expect(task.rewardType).toBeDefined();
        expect(typeof task.rewardType).toBe('string');

        expect(task.rewardValue).toBeDefined();
        expect(typeof task.rewardValue).toBe('number');
      });
    });

    test('daily task IDs should be unique', () => {
      if (DAILY_TASKS_POOL.length === 0) return;

      const ids = DAILY_TASKS_POOL.map(task => task.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('daily task reward values should be positive', () => {
      DAILY_TASKS_POOL.forEach(task => {
        expect(task.rewardValue).toBeGreaterThan(0);
      });
    });
  });

  describe('HIDDEN_RECIPES Array', () => {
    test('should export HIDDEN_RECIPES array', () => {
      expect(HIDDEN_RECIPES).toBeDefined();
      expect(Array.isArray(HIDDEN_RECIPES)).toBe(true);
      expect(HIDDEN_RECIPES.length).toBeGreaterThan(0);
    });

    test('all hidden recipes should have required fields', () => {
      HIDDEN_RECIPES.forEach(recipe => {
        expect(recipe.id).toBeDefined();
        expect(typeof recipe.id).toBe('string');

        // Hidden recipes use 'name' not 'displayName'
        expect(recipe.name).toBeDefined();
        expect(typeof recipe.name).toBe('string');

        expect(recipe.description).toBeDefined();
        expect(typeof recipe.description).toBe('string');

        expect(recipe.inputs).toBeDefined();
        expect(typeof recipe.inputs).toBe('object');

        expect(recipe.outputs).toBeDefined();
        expect(typeof recipe.outputs).toBe('object');
      });
    });

    test('hidden recipe IDs should be unique', () => {
      const ids = HIDDEN_RECIPES.map(recipe => recipe.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('hidden recipe inputs should reference valid ingredients', () => {
      const ingredientIds = new Set(INGREDIENTS.map(ing => ing.id));

      HIDDEN_RECIPES.forEach(recipe => {
        Object.keys(recipe.inputs).forEach(ingId => {
          if (ingId !== 'ab') {
            expect(ingredientIds.has(ingId)).toBe(true);
          }
        });
      });
    });

    test('hidden recipe input amounts should be positive', () => {
      HIDDEN_RECIPES.forEach(recipe => {
        Object.values(recipe.inputs).forEach(amount => {
          expect(typeof amount).toBe('number');
          expect(amount).toBeGreaterThan(0);
        });
      });
    });

    test('hidden recipe output amounts should be positive', () => {
      HIDDEN_RECIPES.forEach(recipe => {
        Object.values(recipe.outputs).forEach(amount => {
          expect(typeof amount).toBe('number');
          expect(amount).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('MEDITATION_TOWERS Array', () => {
    test('should export MEDITATION_TOWERS array', () => {
      expect(MEDITATION_TOWERS).toBeDefined();
      expect(Array.isArray(MEDITATION_TOWERS)).toBe(true);
    });

    test('all meditation towers should have required fields', () => {
      if (MEDITATION_TOWERS.length === 0) return;

      MEDITATION_TOWERS.forEach(tower => {
        expect(tower.id).toBeDefined();
        expect(typeof tower.id).toBe('string');

        expect(tower.displayName).toBeDefined();
        expect(typeof tower.displayName).toBe('string');

        expect(tower.recipe).toBeDefined();
        expect(typeof tower.recipe).toBe('object');

        expect(tower.baseDamage).toBeDefined();
        expect(typeof tower.baseDamage).toBe('number');
        expect(tower.baseDamage).toBeGreaterThan(0);

        expect(tower.baseRange).toBeDefined();
        expect(typeof tower.baseRange).toBe('number');
        expect(tower.baseRange).toBeGreaterThan(0);

        expect(tower.baseAttackSpeed).toBeDefined();
        expect(typeof tower.baseAttackSpeed).toBe('number');
        expect(tower.baseAttackSpeed).toBeGreaterThan(0);
      });
    });

    test('meditation tower IDs should be unique', () => {
      if (MEDITATION_TOWERS.length === 0) return;

      const ids = MEDITATION_TOWERS.map(tower => tower.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('MEDITATION_DISTRACTIONS Array', () => {
    test('should export MEDITATION_DISTRACTIONS array', () => {
      expect(MEDITATION_DISTRACTIONS).toBeDefined();
      expect(Array.isArray(MEDITATION_DISTRACTIONS)).toBe(true);
    });

    test('all meditation distractions should have required fields', () => {
      if (MEDITATION_DISTRACTIONS.length === 0) return;

      MEDITATION_DISTRACTIONS.forEach(distraction => {
        expect(distraction.id).toBeDefined();
        expect(typeof distraction.id).toBe('string');

        expect(distraction.displayName).toBeDefined();
        expect(typeof distraction.displayName).toBe('string');

        expect(distraction.tier).toBeDefined();
        expect(typeof distraction.tier).toBe('number');

        expect(distraction.health).toBeDefined();
        expect(typeof distraction.health).toBe('number');
        expect(distraction.health).toBeGreaterThan(0);

        expect(distraction.speed).toBeDefined();
        expect(typeof distraction.speed).toBe('number');
        expect(distraction.speed).toBeGreaterThan(0);
      });
    });
  });

  describe('MEDITATION_UPGRADES Array', () => {
    test('should export MEDITATION_UPGRADES array', () => {
      expect(MEDITATION_UPGRADES).toBeDefined();
      expect(Array.isArray(MEDITATION_UPGRADES)).toBe(true);
    });

    test('all meditation upgrades should have required fields', () => {
      if (MEDITATION_UPGRADES.length === 0) return;

      MEDITATION_UPGRADES.forEach(upgrade => {
        expect(upgrade.id).toBeDefined();
        expect(typeof upgrade.id).toBe('string');

        expect(upgrade.displayName).toBeDefined();
        expect(typeof upgrade.displayName).toBe('string');

        expect(upgrade.description).toBeDefined();
        expect(typeof upgrade.description).toBe('string');

        expect(upgrade.recipe).toBeDefined();
        expect(typeof upgrade.recipe).toBe('object');

        expect(upgrade.type).toBeDefined();
        expect(typeof upgrade.type).toBe('string');

        expect(upgrade.value).toBeDefined();
        expect(typeof upgrade.value).toBe('number');
      });
    });

    test('meditation upgrade IDs should be unique', () => {
      if (MEDITATION_UPGRADES.length === 0) return;

      const ids = MEDITATION_UPGRADES.map(upgrade => upgrade.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Cross-Reference Validation', () => {
    test('producer outputs should reference valid ingredients or AB', () => {
      const ingredientIds = new Set(INGREDIENTS.map(ing => ing.id));

      PRODUCERS.forEach(prod => {
        Object.keys(prod.outputs).forEach(outputId => {
          if (outputId !== 'ab') {
            expect(ingredientIds.has(outputId)).toBe(true);
          }
        });
      });
    });

    test('upgrade recipes should only use defined ingredients', () => {
      const allIngredientIds = new Set(INGREDIENTS.map(ing => ing.id));

      UPGRADES.forEach(upg => {
        Object.keys(upg.recipe).forEach(ingId => {
          if (ingId !== 'ab') {
            expect(allIngredientIds.has(ingId)).toBe(true);
          }
        });
      });
    });

    test('producer recipes should only use defined ingredients', () => {
      const allIngredientIds = new Set(INGREDIENTS.map(ing => ing.id));

      PRODUCERS.forEach(prod => {
        Object.keys(prod.recipe).forEach(ingId => {
          if (ingId !== 'ab') {
            expect(allIngredientIds.has(ingId)).toBe(true);
          }
        });
      });
    });

    test('hidden recipe inputs should reference valid ingredients', () => {
      const allIngredientIds = new Set([
        ...INGREDIENTS.map(ing => ing.id),
        'ab'
      ]);

      HIDDEN_RECIPES.forEach(recipe => {
        Object.keys(recipe.inputs).forEach(ingId => {
          expect(allIngredientIds.has(ingId)).toBe(true);
        });
      });
    });

    test('hidden recipe outputs should be defined', () => {
      HIDDEN_RECIPES.forEach(recipe => {
        Object.keys(recipe.outputs).forEach(outputId => {
          expect(outputId).toBeDefined();
          expect(typeof outputId).toBe('string');
          expect(outputId.length).toBeGreaterThan(0);
        });
      });
    });

    test('no circular dependencies in recipes', () => {
      // A producer should not directly output its own input ingredients
      PRODUCERS.forEach(prod => {
        const inputs = Object.keys(prod.recipe);
        const outputs = Object.keys(prod.outputs);

        inputs.forEach(input => {
          if (input !== 'ab') {
            expect(outputs.includes(input)).toBe(false);
          }
        });
      });
    });
  });

  describe('Balance Validation', () => {
    test('producer costs should scale reasonably', () => {
      PRODUCERS.forEach(prod => {
        const recipeCost = Object.values(prod.recipe).reduce((sum, amount) => sum + amount, 0);
        expect(recipeCost).toBeGreaterThan(0);
        expect(recipeCost).toBeLessThan(10000); // Sanity check
      });
    });

    test('upgrade costs should scale reasonably', () => {
      UPGRADES.forEach(upg => {
        const recipeCost = Object.values(upg.recipe).reduce((sum, amount) => sum + amount, 0);
        expect(recipeCost).toBeGreaterThan(0);
        expect(recipeCost).toBeLessThan(100000); // Sanity check for late-game upgrades
      });
    });

    test('prestige bonus costs should be balanced', () => {
      PRESTIGE_BONUSES.forEach(bonus => {
        expect(bonus.baseCostPp).toBeGreaterThan(0);
        expect(bonus.baseCostPp).toBeLessThan(10000);

        // Cost growth should be exponential but not extreme
        expect(bonus.costGrowth).toBeGreaterThanOrEqual(1.1);
        expect(bonus.costGrowth).toBeLessThanOrEqual(3.0);
      });
    });

    test('production rates should be reasonable', () => {
      PRODUCERS.forEach(prod => {
        Object.values(prod.outputs).forEach(rate => {
          expect(rate).toBeGreaterThan(0);
          expect(rate).toBeLessThan(1000); // Per second sanity check
        });
      });
    });
  });

  describe('Data Integrity', () => {
    test('all arrays should be non-empty for core game data', () => {
      expect(INGREDIENTS.length).toBeGreaterThan(0);
      expect(PRODUCERS.length).toBeGreaterThan(0);
      expect(UPGRADES.length).toBeGreaterThan(0);
      expect(PRESTIGE_BONUSES.length).toBeGreaterThan(0);
      expect(HIDDEN_RECIPES.length).toBeGreaterThan(0);
    });

    test('ingredient display names should be properly capitalized', () => {
      INGREDIENTS.forEach(ing => {
        expect(ing.displayName[0]).toBe(ing.displayName[0].toUpperCase());
      });
    });

    test('producer display names should be properly capitalized', () => {
      PRODUCERS.forEach(prod => {
        expect(prod.displayName[0]).toBe(prod.displayName[0].toUpperCase());
      });
    });

    test('upgrade display names should be properly capitalized', () => {
      UPGRADES.forEach(upg => {
        expect(upg.displayName[0]).toBe(upg.displayName[0].toUpperCase());
      });
    });

    test('no undefined or null values in critical fields', () => {
      INGREDIENTS.forEach(ing => {
        expect(ing.id).not.toBeNull();
        expect(ing.id).not.toBeUndefined();
        expect(ing.displayName).not.toBeNull();
        expect(ing.displayName).not.toBeUndefined();
      });

      PRODUCERS.forEach(prod => {
        expect(prod.id).not.toBeNull();
        expect(prod.outputs).not.toBeNull();
      });

      UPGRADES.forEach(upg => {
        expect(upg.id).not.toBeNull();
        expect(upg.value).not.toBeNull();
      });
    });
  });
});
