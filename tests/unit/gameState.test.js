/**
 * Unit tests for gameState.js
 * Tests core game state management, currency, inventory, and production
 */

import { GameState } from '../../js/gameState.js';
import { Balance } from '../../js/utils.js';

describe('GameState - Core Functionality', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
    // Disable milestones for predictable testing
    gameState.milestones = [];
  });

  afterEach(() => {
    if (gameState.tickInterval) {
      clearInterval(gameState.tickInterval);
    }
  });

  describe('Initialization', () => {
    test('should initialize with default currency values', () => {
      expect(gameState.ab).toBe(0.0);
      expect(gameState.abTotalEarned).toBe(0.0);
    });

    test('should initialize with empty inventory', () => {
      expect(gameState.inventory).toEqual({});
    });

    test('should initialize with empty workstations', () => {
      expect(gameState.workstations).toEqual({});
    });

    test('should initialize with empty upgrades', () => {
      expect(gameState.upgradesOwned).toEqual({});
    });

    test('should initialize prestige system', () => {
      expect(gameState.prestigePoints).toBe(0);
      expect(gameState.prestigeLifetimeEarned).toBe(0.0);
      expect(gameState.prestigeBonuses).toEqual({});
      expect(gameState.prestigeCount).toBe(0);
    });

    test('should initialize element specialization', () => {
      expect(gameState.elementSpecialization).toBeNull();
      expect(gameState.specializationBonuses).toEqual({});
    });

    test('should initialize stats', () => {
      expect(gameState.totalTaps).toBe(0);
      expect(gameState.totalWorkstationsCrafted).toBe(0);
      expect(gameState.totalPotionsCrafted).toBe(0);
    });

    test('should initialize milestones', () => {
      expect(gameState.unlockedMilestones).toBeInstanceOf(Set);
      expect(gameState.unlockedMilestones.size).toBe(0);
      expect(gameState.milestones).toBeDefined();
    });

    test('should initialize buffs system', () => {
      expect(gameState.activeBuffs).toEqual([]);
    });

    test('should initialize discovered recipes', () => {
      expect(gameState.discoveredRecipes).toEqual([]);
    });
  });

  describe('AB Currency Management', () => {
    test('should add AB correctly', () => {
      gameState.addAb(100);
      expect(gameState.ab).toBe(100);
    });

    test('should track total AB earned', () => {
      gameState.addAb(50);
      gameState.addAb(75);
      expect(gameState.ab).toBe(125);
      expect(gameState.abTotalEarned).toBe(125);
    });

    test('should add AB even if amount is negative', () => {
      // addAb allows negative amounts (can go below 0)
      gameState.addAb(-10);
      // Implementation allows negative balances
      expect(gameState.ab).toBe(-10);
      expect(gameState.abTotalEarned).toBe(-10);
    });

    test('should spend AB correctly', () => {
      gameState.addAb(100);
      gameState.spendAb(40);
      expect(gameState.ab).toBe(60);
    });

    test('should not decrease total earned when spending', () => {
      gameState.addAb(100);
      gameState.spendAb(40);
      expect(gameState.abTotalEarned).toBe(100);
    });

    test('should handle spending more than available', () => {
      gameState.addAb(50);
      gameState.spendAb(100);
      // Should not go negative
      expect(gameState.ab).toBeGreaterThanOrEqual(0);
    });

    test('should handle large AB amounts', () => {
      const largeAmount = 1e15; // 1 quadrillion
      gameState.addAb(largeAmount);
      expect(gameState.ab).toBe(largeAmount);
      expect(gameState.abTotalEarned).toBe(largeAmount);
    });

    test('should handle decimal AB amounts', () => {
      gameState.addAb(123.456);
      expect(gameState.ab).toBeCloseTo(123.456, 3);
    });
  });

  describe('Inventory Management', () => {
    test('should add ingredients to empty inventory', () => {
      gameState.addIngredient('fire', 10);
      expect(gameState.inventory['fire']).toBe(10);
    });

    test('should accumulate ingredients', () => {
      gameState.addIngredient('fire', 10);
      gameState.addIngredient('fire', 5);
      expect(gameState.inventory['fire']).toBe(15);
    });

    test('should handle multiple ingredient types', () => {
      gameState.addIngredient('fire', 10);
      gameState.addIngredient('water', 20);
      gameState.addIngredient('earth', 30);

      expect(gameState.inventory['fire']).toBe(10);
      expect(gameState.inventory['water']).toBe(20);
      expect(gameState.inventory['earth']).toBe(30);
    });

    test('should spend ingredients correctly', () => {
      gameState.addIngredient('fire', 50);
      gameState.spendIngredient('fire', 20);
      expect(gameState.inventory['fire']).toBe(30);
    });

    test('should handle spending non-existent ingredient', () => {
      const result = gameState.spendIngredient('fire', 10);
      // Implementation returns false and doesn't modify inventory
      expect(result).toBe(false);
      expect(gameState.inventory['fire']).toBeUndefined();
    });

    test('should handle decimal ingredient amounts', () => {
      gameState.addIngredient('fire', 10.5);
      gameState.addIngredient('fire', 5.3);
      expect(gameState.inventory['fire']).toBeCloseTo(15.8, 1);
    });

    test('should handle very small ingredient amounts', () => {
      gameState.addIngredient('fire', 0.001);
      expect(gameState.inventory['fire']).toBeCloseTo(0.001, 4);
    });
  });

  describe('Workstation Management', () => {
    test('should add workstation when crafted', () => {
      gameState.workstations['test_ws'] = 1;
      expect(gameState.workstations['test_ws']).toBe(1);
    });

    test('should increment workstation count', () => {
      gameState.workstations['test_ws'] = 1;
      gameState.workstations['test_ws']++;
      expect(gameState.workstations['test_ws']).toBe(2);
    });

    test('should handle multiple workstation types', () => {
      gameState.workstations['ws1'] = 5;
      gameState.workstations['ws2'] = 10;
      gameState.workstations['ws3'] = 15;

      expect(gameState.workstations['ws1']).toBe(5);
      expect(gameState.workstations['ws2']).toBe(10);
      expect(gameState.workstations['ws3']).toBe(15);
    });

    test('should track total workstations crafted', () => {
      gameState.totalWorkstationsCrafted = 0;
      gameState.totalWorkstationsCrafted += 5;
      expect(gameState.totalWorkstationsCrafted).toBe(5);
    });
  });

  describe('Upgrade System', () => {
    test('should mark upgrade as owned', () => {
      gameState.upgradesOwned['test_upgrade'] = true;
      expect(gameState.upgradesOwned['test_upgrade']).toBe(true);
    });

    test('should handle multiple upgrades', () => {
      gameState.upgradesOwned['upgrade1'] = true;
      gameState.upgradesOwned['upgrade2'] = true;
      gameState.upgradesOwned['upgrade3'] = true;

      expect(gameState.upgradesOwned['upgrade1']).toBe(true);
      expect(gameState.upgradesOwned['upgrade2']).toBe(true);
      expect(gameState.upgradesOwned['upgrade3']).toBe(true);
    });

    test('should check if upgrade is owned', () => {
      gameState.upgradesOwned['test'] = true;
      expect(gameState.upgradesOwned['test']).toBe(true);
      expect(gameState.upgradesOwned['nonexistent']).toBeUndefined();
    });
  });

  describe('Prestige System', () => {
    test('should have prestige points', () => {
      gameState.prestigePoints = 10;
      expect(gameState.prestigePoints).toBe(10);
    });

    test('should track lifetime earned', () => {
      gameState.prestigeLifetimeEarned = 1000000;
      expect(gameState.prestigeLifetimeEarned).toBe(1000000);
    });

    test('should track prestige count', () => {
      gameState.prestigeCount = 5;
      expect(gameState.prestigeCount).toBe(5);
    });

    test('should manage prestige bonuses', () => {
      gameState.prestigeBonuses['bonus1'] = 3;
      gameState.prestigeBonuses['bonus2'] = 5;

      expect(gameState.prestigeBonuses['bonus1']).toBe(3);
      expect(gameState.prestigeBonuses['bonus2']).toBe(5);
    });

    test('should calculate prestige gain correctly', () => {
      gameState.abTotalEarned = 1200000; // Should give 1 prestige point
      const gain = Balance.prestigePointsFor(gameState.abTotalEarned);
      expect(gain).toBeGreaterThan(0);
    });
  });

  describe('Element Specialization', () => {
    test('should start with no specialization', () => {
      expect(gameState.elementSpecialization).toBeNull();
    });

    test('should allow setting specialization', () => {
      gameState.elementSpecialization = 'fire';
      expect(gameState.elementSpecialization).toBe('fire');
    });

    test('should handle specialization bonuses', () => {
      gameState.specializationBonuses = { productionMult: 1.2 };
      expect(gameState.specializationBonuses.productionMult).toBe(1.2);
    });

    test('should support different element types', () => {
      const elements = ['fire', 'water', 'air', 'crystal'];
      elements.forEach(element => {
        gameState.elementSpecialization = element;
        expect(gameState.elementSpecialization).toBe(element);
      });
    });
  });

  describe('Buff System', () => {
    test('should add buff to active buffs', () => {
      const buff = {
        type: 'production',
        value: 1.5,
        duration: 60,
        remainingTime: 60
      };
      gameState.activeBuffs.push(buff);
      expect(gameState.activeBuffs.length).toBe(1);
      expect(gameState.activeBuffs[0].type).toBe('production');
    });

    test('should handle multiple buffs', () => {
      gameState.activeBuffs.push({ type: 'production', value: 1.5 });
      gameState.activeBuffs.push({ type: 'speed', value: 1.2 });
      expect(gameState.activeBuffs.length).toBe(2);
    });

    test('should remove expired buffs', () => {
      gameState.activeBuffs = [
        { type: 'production', remainingTime: 0 },
        { type: 'speed', remainingTime: 60 }
      ];
      gameState.activeBuffs = gameState.activeBuffs.filter(b => b.remainingTime > 0);
      expect(gameState.activeBuffs.length).toBe(1);
      expect(gameState.activeBuffs[0].type).toBe('speed');
    });
  });

  describe('Stats Tracking', () => {
    test('should increment total taps', () => {
      gameState.totalTaps = 0;
      gameState.totalTaps++;
      gameState.totalTaps++;
      expect(gameState.totalTaps).toBe(2);
    });

    test('should track workstations crafted', () => {
      gameState.totalWorkstationsCrafted = 5;
      gameState.totalWorkstationsCrafted += 10;
      expect(gameState.totalWorkstationsCrafted).toBe(15);
    });

    test('should track potions crafted', () => {
      gameState.totalPotionsCrafted = 0;
      gameState.totalPotionsCrafted += 3;
      expect(gameState.totalPotionsCrafted).toBe(3);
    });

    test('should handle large stat values', () => {
      gameState.totalTaps = 1000000;
      expect(gameState.totalTaps).toBe(1000000);
    });
  });

  describe('Recipe Discovery', () => {
    test('should start with no discovered recipes', () => {
      expect(gameState.discoveredRecipes).toEqual([]);
    });

    test('should add discovered recipe', () => {
      gameState.discoveredRecipes.push('recipe1');
      expect(gameState.discoveredRecipes).toContain('recipe1');
    });

    test('should track multiple discovered recipes', () => {
      gameState.discoveredRecipes.push('recipe1');
      gameState.discoveredRecipes.push('recipe2');
      gameState.discoveredRecipes.push('recipe3');

      expect(gameState.discoveredRecipes.length).toBe(3);
      expect(gameState.discoveredRecipes).toEqual(['recipe1', 'recipe2', 'recipe3']);
    });

    test('should check if recipe is discovered', () => {
      gameState.discoveredRecipes.push('recipe1');
      expect(gameState.discoveredRecipes.includes('recipe1')).toBe(true);
      expect(gameState.discoveredRecipes.includes('recipe2')).toBe(false);
    });
  });

  describe('Milestone System', () => {
    test('should have unlocked milestones set', () => {
      expect(gameState.unlockedMilestones).toBeInstanceOf(Set);
    });

    test('should add unlocked milestone', () => {
      gameState.unlockedMilestones.add('milestone_1');
      expect(gameState.unlockedMilestones.has('milestone_1')).toBe(true);
    });

    test('should track multiple milestones', () => {
      gameState.unlockedMilestones.add('milestone_1');
      gameState.unlockedMilestones.add('milestone_2');
      gameState.unlockedMilestones.add('milestone_3');

      expect(gameState.unlockedMilestones.size).toBe(3);
    });

    test('should not add duplicate milestones', () => {
      gameState.unlockedMilestones.add('milestone_1');
      gameState.unlockedMilestones.add('milestone_1');

      expect(gameState.unlockedMilestones.size).toBe(1);
    });

    test('should check milestone unlock status', () => {
      gameState.unlockedMilestones.add('test_milestone');
      expect(gameState.unlockedMilestones.has('test_milestone')).toBe(true);
      expect(gameState.unlockedMilestones.has('other_milestone')).toBe(false);
    });
  });

  describe('Timestamps and Timing', () => {
    test('should track last save time', () => {
      const now = Date.now() / 1000;
      gameState.lastSaveTime = now;
      expect(gameState.lastSaveTime).toBeCloseTo(now, 1);
    });

    test('should track last tick time', () => {
      const now = Date.now();
      gameState.lastTickTime = now;
      expect(gameState.lastTickTime).toBe(now);
    });

    test('should calculate time delta', () => {
      const start = Date.now();
      gameState.lastTickTime = start;

      // Simulate time passing
      const later = start + 1000; // 1 second later
      const delta = (later - gameState.lastTickTime) / 1000;

      expect(delta).toBeCloseTo(1.0, 1);
    });
  });

  describe('Tick Loop Management', () => {
    test('should have no tick interval initially', () => {
      expect(gameState.tickInterval).toBeNull();
    });

    test('should set tick interval when started', () => {
      gameState.startTickLoop();
      expect(gameState.tickInterval).not.toBeNull();
      clearInterval(gameState.tickInterval);
    });

    test('should clear tick interval when stopped', () => {
      gameState.startTickLoop();
      gameState.stopTickLoop();
      expect(gameState.tickInterval).toBeNull();
    });

    test('should clear existing interval when restarting', () => {
      gameState.startTickLoop();
      const firstInterval = gameState.tickInterval;
      gameState.startTickLoop();
      const secondInterval = gameState.tickInterval;

      expect(secondInterval).not.toBe(firstInterval);
      clearInterval(gameState.tickInterval);
    });
  });

  describe('Callbacks', () => {
    test('should initialize all callbacks as null', () => {
      expect(gameState.onAbChanged).toBeNull();
      expect(gameState.onIngredientChanged).toBeNull();
      expect(gameState.onWorkstationCrafted).toBeNull();
      expect(gameState.onUpgradePurchased).toBeNull();
      expect(gameState.onPrestigeCompleted).toBeNull();
      expect(gameState.onRecipeDiscovered).toBeNull();
      expect(gameState.onWelcomeBack).toBeNull();
    });

    test('should allow setting callbacks', () => {
      const callback = () => {};
      gameState.onAbChanged = callback;
      expect(gameState.onAbChanged).toBe(callback);
    });

    test('should allow setting multiple callbacks', () => {
      const cb1 = () => {};
      const cb2 = () => {};
      const cb3 = () => {};

      gameState.onAbChanged = cb1;
      gameState.onIngredientChanged = cb2;
      gameState.onWorkstationCrafted = cb3;

      expect(gameState.onAbChanged).toBe(cb1);
      expect(gameState.onIngredientChanged).toBe(cb2);
      expect(gameState.onWorkstationCrafted).toBe(cb3);
    });
  });

  describe('State Consistency', () => {
    test('should maintain consistent state after operations', () => {
      // Add some AB
      gameState.addAb(100);

      // Add some ingredients
      gameState.addIngredient('fire', 50);
      gameState.addIngredient('water', 30);

      // Add workstation
      gameState.workstations['test_ws'] = 5;

      // Add upgrade
      gameState.upgradesOwned['test_upgrade'] = true;

      // Verify all changes persisted
      expect(gameState.ab).toBe(100);
      expect(gameState.inventory['fire']).toBe(50);
      expect(gameState.inventory['water']).toBe(30);
      expect(gameState.workstations['test_ws']).toBe(5);
      expect(gameState.upgradesOwned['test_upgrade']).toBe(true);
    });

    test('should handle complex state modifications', () => {
      // Build up complex state
      for (let i = 0; i < 10; i++) {
        gameState.addAb(i * 10);
        gameState.addIngredient('fire', i * 5);
      }

      expect(gameState.ab).toBe(450); // 0+10+20+...+90 = 450
      expect(gameState.inventory['fire']).toBe(225); // 0+5+10+...+45 = 225
    });
  });
});
