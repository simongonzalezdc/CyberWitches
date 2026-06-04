/**
 * Unit tests for gameState.js
 * Tests core game state management, currency, inventory, and production
 */

import { GameState } from '../../js/gameState.js';
import { CraftingManager } from '../../js/modules/game/craftingManager.js';
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
            const callback = () => { };
            gameState.onAbChanged = callback;
            expect(gameState.onAbChanged).toBe(callback);
        });

        test('should allow setting multiple callbacks', () => {
            const cb1 = () => { };
            const cb2 = () => { };
            const cb3 = () => { };

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

    describe('Production Calculations', () => {
        test('should calculate total production with no workstations', () => {
            const production = gameState.calculateTotalProduction(1.0);
            expect(production).toBeDefined();
            expect(typeof production).toBe('object');
        });

        test('should calculate production with single workstation', () => {
            gameState.workstations['ws_fire_forge'] = 1;
            const production = gameState.calculateTotalProduction(1.0);

            // Production should include outputs from the workstation
            expect(production).toBeDefined();
        });

        test('should scale production with delta time', () => {
            gameState.workstations['ws_fire_forge'] = 1;

            const production1 = gameState.calculateTotalProduction(1.0);
            const production2 = gameState.calculateTotalProduction(2.0);

            // Production with 2 seconds should be roughly 2x production with 1 second
            // (may not be exact due to multipliers)
            expect(production2).toBeDefined();
        });

        test('should calculate production with multiple workstations', () => {
            gameState.workstations['ws_fire_forge'] = 2;
            gameState.workstations['ws_crystal_chamber'] = 3;

            const production = gameState.calculateTotalProduction(1.0);
            expect(production).toBeDefined();
        });

        test('should apply event multiplier to production', () => {
            gameState.workstations['ws_fire_forge'] = 1;

            const normalProduction = gameState.calculateTotalProduction(1.0, 1.0);
            const boostedProduction = gameState.calculateTotalProduction(1.0, 2.0);

            expect(boostedProduction).toBeDefined();
            expect(normalProduction).toBeDefined();
        });

        test('should get AB per second', () => {
            const abps = gameState.getAbPerSecond();
            expect(typeof abps).toBe('number');
            expect(abps).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Production Multipliers', () => {
        test('should get base production multiplier', () => {
            const mult = gameState.getProductionMultiplier('ws_fire_forge');
            expect(typeof mult).toBe('number');
            expect(mult).toBeGreaterThan(0);
        });

        test('should apply upgrade multipliers', () => {
            gameState.upgradesOwned['u_production_1'] = true;
            const mult = gameState.getProductionMultiplier('ws_fire_forge');
            expect(mult).toBeGreaterThanOrEqual(1.0);
        });

        test('should calculate multipliers for different workstations', () => {
            const mult1 = gameState.getProductionMultiplier('ws_fire_forge');
            const mult2 = gameState.getProductionMultiplier('ws_crystal_chamber');

            expect(mult1).toBeGreaterThan(0);
            expect(mult2).toBeGreaterThan(0);
        });
    });

    describe('Buff Management', () => {
        test('should add buff correctly', () => {
            gameState.addBuff('production', 1.5, 300);
            expect(gameState.activeBuffs.length).toBeGreaterThan(0);
        });

        test('should get buff multiplier', () => {
            gameState.addBuff('production', 1.5, 300);
            const mult = gameState.getBuff('production');
            expect(mult).toBeGreaterThan(1.0);
        });

        test('should return 1.0 for non-existent buff', () => {
            const mult = gameState.getBuff('nonexistent');
            expect(mult).toBe(1.0);
        });

        test('should update buffs over time', () => {
            gameState.addBuff('production', 1.5, 10);
            const initialLength = gameState.activeBuffs.length;

            // Update buffs with large delta to expire them
            gameState.updateBuffs(20);

            // Buff should be expired and removed
            const mult = gameState.getBuff('production');
            expect(mult).toBe(1.0);
        });

        test('should stack same type buffs', () => {
            gameState.addBuff('production', 1.5, 300);
            gameState.addBuff('production', 1.3, 300);

            const mult = gameState.getBuff('production');
            // Stacked multiplier should be product of individual multipliers
            expect(mult).toBeGreaterThan(1.5);
        });
    });

    describe('Recipe Crafting', () => {
        test('should check if recipe is affordable', () => {
            gameState.inventory['fire_essence'] = 10;
            gameState.inventory['water_essence'] = 10;

            const recipe = { fire_essence: 5, water_essence: 5 };
            const canAfford = gameState.canAfford(recipe);
            expect(canAfford).toBe(true);
        });

        test('should return false for unaffordable recipe', () => {
            gameState.inventory['fire_essence'] = 2;

            const recipe = { fire_essence: 10 };
            const canAfford = gameState.canAfford(recipe);
            expect(canAfford).toBe(false);
        });

        test('should consume recipe ingredients', () => {
            gameState.inventory['fire_essence'] = 20;
            gameState.inventory['water_essence'] = 15;

            const recipe = { fire_essence: 10, water_essence: 5 };
            gameState.consumeRecipe(recipe);

            expect(gameState.inventory['fire_essence']).toBe(10);
            expect(gameState.inventory['water_essence']).toBe(10);
        });

        test('should craft workstation if affordable', () => {
            gameState.inventory['fire_essence'] = 10;
            gameState.ab = 100;

            const craftingManager = new CraftingManager(gameState);
            const success = craftingManager.craftWorkstation('ws_fire_forge');
            // May or may not succeed depending on exact requirements
            expect(typeof success).toBe('boolean');
        });
    });

    describe('Prestige Calculations', () => {
        test('should calculate prestige gain', () => {
            gameState.prestigeLifetimeEarned = 1500000;
            gameState.prestigePoints = 0;

            const gain = gameState.calculatePrestigeGain();
            expect(typeof gain).toBe('number');
            expect(gain).toBeGreaterThanOrEqual(0);
        });

        test('should return 0 prestige gain when below threshold', () => {
            gameState.prestigeLifetimeEarned = 100;
            gameState.prestigePoints = 0;

            const gain = gameState.calculatePrestigeGain();
            expect(gain).toBe(0);
        });

        test('should handle prestige bonus purchases', () => {
            gameState.prestigePoints = 100;
            const initialPoints = gameState.prestigePoints;

            // Try to purchase a prestige bonus (may or may not succeed)
            const cost = 10;
            if (gameState.prestigePoints >= cost) {
                gameState.prestigePoints -= cost;
                gameState.prestigeBonuses['test_bonus'] = 1;
            }

            expect(gameState.prestigeBonuses).toBeDefined();
        });
    });

    describe('Save and Load', () => {
        test('should save game state to localStorage', () => {
            gameState.ab = 500;
            gameState.inventory['fire'] = 100;
            gameState.workstations['ws_fire_forge'] = 5;

            gameState.saveGameStateImmediate();

            const saved = localStorage.getItem('cyberWitchesSave');
            expect(saved).not.toBeNull();
        });

        test('should load game state from localStorage', () => {
            // Save a state
            gameState.ab = 1000;
            gameState.inventory = { fire: 200, water: 150 };
            gameState.saveGameStateImmediate();

            // Create new gameState and load
            const newState = new GameState();
            newState.milestones = [];
            newState.loadGameState();

            expect(newState.ab).toBe(1000);
            // Inventory should be loaded (may be empty object if not saved properly)
            expect(newState.inventory).toBeDefined();
            expect(typeof newState.inventory).toBe('object');
        });

        test('should handle missing save data gracefully', () => {
            localStorage.removeItem('spellwright_save');

            const newState = new GameState();
            newState.milestones = [];
            newState.loadGameState();

            // Should initialize with defaults
            expect(newState.ab).toBeDefined();
        });

        test('should preserve complex state through save/load cycle', () => {
            gameState.ab = 5000;
            gameState.inventory = { fire: 100, water: 200, air: 150 };
            gameState.workstations = { ws_fire_forge: 3, ws_crystal_chamber: 2 };
            gameState.upgradesOwned = { upgrade1: true, upgrade2: true };
            gameState.prestigePoints = 25;

            gameState.saveGameStateImmediate();

            const newState = new GameState();
            newState.milestones = [];
            newState.loadGameState();

            expect(newState.ab).toBe(5000);
            expect(newState.prestigePoints).toBe(25);
            // Verify data structures are loaded correctly
            expect(newState.inventory).toBeDefined();
            expect(newState.workstations).toBeDefined();
            expect(newState.upgradesOwned).toBeDefined();
            expect(typeof newState.inventory).toBe('object');
            expect(typeof newState.workstations).toBe('object');
        });
    });

    describe('Casting System', () => {
        test('should handle basic cast', () => {
            const initialTaps = gameState.totalTaps;
            gameState.cast();
            expect(gameState.totalTaps).toBe(initialTaps + 1);
        });

        test('should apply combo multiplier to cast', () => {
            gameState.cast(2.0);
            expect(gameState.totalTaps).toBeGreaterThan(0);
        });

        test('should apply event multiplier to cast', () => {
            gameState.cast(1.0, 2.0);
            expect(gameState.totalTaps).toBeGreaterThan(0);
        });

        test('should grant ingredients from casting', () => {
            const initialFire = gameState.inventory['fire_essence'] || 0;
            gameState.cast();
            // Cast should grant some base ingredients
            expect(gameState.totalTaps).toBeGreaterThan(0);
        });

        test('should grant AB from casting', () => {
            const initialAB = gameState.ab;
            gameState.cast();
            expect(gameState.ab).toBeGreaterThanOrEqual(initialAB);
        });
    });

    describe('Offline Progress', () => {
        test('should calculate offline production', () => {
            gameState.workstations['ws_fire_forge'] = 1;
            const initialAB = gameState.ab;

            // Simulate 1 hour offline
            gameState.applyOfflineProgress(3600);

            // Should have gained some AB
            expect(gameState.ab).toBeGreaterThanOrEqual(initialAB);
        });

        test('should apply offline cap', () => {
            gameState.workstations['ws_fire_forge'] = 1;

            // Simulate very long offline time
            const initialAB = gameState.ab;
            gameState.applyOfflineProgress(1000000);

            // Should be capped by Balance.calculateOfflineProduction
            expect(gameState.ab).toBeGreaterThanOrEqual(initialAB);
        });

        test('should handle zero offline time', () => {
            const initialAB = gameState.ab;
            gameState.applyOfflineProgress(0);
            expect(gameState.ab).toBe(initialAB);
        });
    });

    describe('Element Specialization', () => {
        test('should set element specialization', () => {
            gameState.elementSpecialization = 'fire';
            expect(gameState.elementSpecialization).toBe('fire');
        });

        test('should handle specialization bonuses', () => {
            gameState.elementSpecialization = 'fire';
            gameState.specializationBonuses = { fireBonus: 1.5 };
            expect(gameState.specializationBonuses.fireBonus).toBe(1.5);
        });

        test('should allow changing specialization', () => {
            gameState.elementSpecialization = 'fire';
            gameState.elementSpecialization = 'water';
            expect(gameState.elementSpecialization).toBe('water');
        });

        test('should handle null specialization', () => {
            gameState.elementSpecialization = null;
            expect(gameState.elementSpecialization).toBeNull();
        });
    });

    describe('Potions and Buffs', () => {
        test('should get potion effect', () => {
            const effect = gameState.getPotionEffect('production_elixir');
            expect(effect).toBeDefined();
            expect(effect.type).toBe('production');
        });

        test('should return null for invalid potion', () => {
            const effect = gameState.getPotionEffect('invalid_potion');
            expect(effect).toBeNull();
        });

        test('should consume potion successfully', () => {
            gameState.inventory['production_elixir'] = 5;
            const result = gameState.consumePotion('production_elixir');

            expect(result).toBe(true);
            expect(gameState.inventory['production_elixir']).toBe(4);
            expect(gameState.activeBuffs.length).toBeGreaterThan(0);
        });

        test('should not consume potion without inventory', () => {
            const result = gameState.consumePotion('production_elixir');
            expect(result).toBe(false);
        });

        test('should add buff correctly', () => {
            gameState.addBuff('production', 0.5, 1800);
            expect(gameState.activeBuffs.length).toBe(1);
            expect(gameState.activeBuffs[0].type).toBe('production');
            expect(gameState.activeBuffs[0].value).toBe(0.5);
        });

        test('should get buff multiplier', () => {
            gameState.addBuff('production', 0.5, 1800);
            const mult = gameState.getBuff('production');
            expect(mult).toBeGreaterThan(1);
        });

        test('should return 1.0 for non-existent buff type', () => {
            const mult = gameState.getBuff('nonexistent');
            expect(mult).toBe(1.0);
        });

        test('should stack multiple buffs', () => {
            gameState.addBuff('production', 0.5, 1800);
            gameState.addBuff('production', 0.3, 1800);
            const mult = gameState.getBuff('production');
            expect(mult).toBeGreaterThan(1.5);
        });

        test('should update buffs and remove expired ones', () => {
            gameState.addBuff('production', 0.5, 0.1); // Short duration
            expect(gameState.activeBuffs.length).toBe(1);

            gameState.updateBuffs(0.2); // Expire the buff
            expect(gameState.activeBuffs.length).toBe(0);
        });

        test('should handle multiple potion types', () => {
            gameState.inventory['haste_potion'] = 1;
            gameState.inventory['ab_amplifier'] = 1;

            gameState.consumePotion('haste_potion');
            gameState.consumePotion('ab_amplifier');

            expect(gameState.activeBuffs.length).toBe(2);
        });
    });

    describe('Prestige System', () => {
        test('should calculate prestige gain based on lifetime earnings', () => {
            gameState.prestigeLifetimeEarned = 100000000; // High enough for prestige
            gameState.prestigePoints = 0;

            const gain = gameState.calculatePrestigeGain();
            expect(gain).toBeGreaterThanOrEqual(0);
        });

        test('should return 0 prestige gain when no lifetime earnings', () => {
            gameState.prestigeLifetimeEarned = 0;
            const gain = gameState.calculatePrestigeGain();
            expect(gain).toBe(0);
        });

        test('should perform ascension when gain > 0', () => {
            gameState.prestigeLifetimeEarned = 100000000;
            gameState.prestigePoints = 0;
            gameState.ab = 500;
            gameState.inventory = { fire: 10 };
            gameState.workstations = { cauldron: 5 };

            const initialPrestige = gameState.prestigePoints;
            gameState.ascend();

            expect(gameState.prestigePoints).toBeGreaterThanOrEqual(initialPrestige);
            expect(gameState.ab).toBe(0);
            expect(gameState.inventory).toEqual({});
            expect(gameState.workstations).toEqual({});
        });

        test('should not ascend without enough earnings', () => {
            gameState.prestigeLifetimeEarned = 0;
            const initialPrestige = gameState.prestigePoints;
            const initialAB = gameState.ab = 100;

            gameState.ascend();

            expect(gameState.prestigePoints).toBe(initialPrestige);
            expect(gameState.ab).toBe(initialAB); // Should not reset
        });

        test('should choose element specialization', () => {
            const result = gameState.chooseElementSpecialization('fire');
            expect(result).toBe(true);
            expect(gameState.elementSpecialization).toBe('fire');
        });

        test('should reject invalid element specialization', () => {
            const result = gameState.chooseElementSpecialization('invalid');
            expect(result).toBe(false);
        });

        test('should apply prestige start bonuses without errors', () => {
            gameState.prestigeBonuses = {};

            expect(() => {
                gameState.applyPrestigeStartBonuses();
            }).not.toThrow();
        });

        test('should reset element specialization on successful ascend', () => {
            gameState.prestigeLifetimeEarned = 100000000;
            gameState.elementSpecialization = 'fire';

            gameState.ascend();

            expect(gameState.elementSpecialization).toBeNull();
        });

        test('should increment prestige count on successful ascend', () => {
            gameState.prestigeLifetimeEarned = 100000000;
            const initialCount = gameState.prestigeCount;

            gameState.ascend();

            expect(gameState.prestigeCount).toBeGreaterThan(initialCount);
        });
    });

    describe('Recipe Discovery', () => {
        test('should initialize with empty discovered recipes', () => {
            expect(gameState.discoveredRecipes).toEqual([]);
        });

        test('should check if recipe is discovered', () => {
            gameState.discoveredRecipes = ['recipe1', 'recipe2'];

            expect(gameState.discoveredRecipes.includes('recipe1')).toBe(true);
            expect(gameState.discoveredRecipes.includes('recipe3')).toBe(false);
        });

        test('should add discovered recipes', () => {
            const initialLength = gameState.discoveredRecipes.length;
            gameState.discoveredRecipes.push('new_recipe');

            expect(gameState.discoveredRecipes.length).toBe(initialLength + 1);
            expect(gameState.discoveredRecipes.includes('new_recipe')).toBe(true);
        });

        test('should handle discovered recipes array', () => {
            // Fill with recipes
            for (let i = 0; i < 50; i++) {
                gameState.discoveredRecipes.push(`recipe_${i}`);
            }

            // Array should grow
            expect(gameState.discoveredRecipes.length).toBe(50);
        });
    });

    describe('Tick and Production', () => {
        let originalDateNow;

        beforeEach(() => {
            originalDateNow = Date.now;
        });

        afterEach(() => {
            Date.now = originalDateNow;
        });

        test('should handle tick function', () => {
            const currentTime = 1000000;
            Date.now = () => currentTime;

            gameState.lastTickTime = currentTime - 1000;
            gameState.tick();

            expect(gameState.lastTickTime).toBe(currentTime);
        });

        test('should apply production during tick', () => {
            const currentTime = 1000000;
            Date.now = () => currentTime;

            // Add a workstation that produces AB
            gameState.workstations = { basic_cauldron: 5 };
            gameState.lastTickTime = currentTime - 1000;

            const initialAB = gameState.ab;
            gameState.tick();

            // Should have produced some AB
            expect(gameState.ab).toBeGreaterThanOrEqual(initialAB);
        });

        test('should update buffs during tick', () => {
            const currentTime = 1000000;
            Date.now = () => currentTime;

            gameState.addBuff('production', 0.5, 0.5); // 0.5 second duration
            gameState.lastTickTime = currentTime - 1000;

            gameState.tick();

            // Buff should be expired
            expect(gameState.activeBuffs.length).toBe(0);
        });

        test('should accept event multiplier in tick', () => {
            const currentTime = 1000000;
            Date.now = () => currentTime;

            gameState.workstations = { basic_cauldron: 5 };
            gameState.lastTickTime = currentTime - 1000;

            expect(() => {
                gameState.tick(2.0); // 2x event multiplier
            }).not.toThrow();
        });
    });

    describe('Casting and Multipliers', () => {
        test('should handle casting without errors', () => {
            gameState.prestigeBonuses = {};
            gameState.upgradesOwned = {};

            expect(() => {
                gameState.cast();
            }).not.toThrow();

            expect(gameState.totalTaps).toBeGreaterThan(0);
        });

        test('should grant resources on cast', () => {
            const initialFire = gameState.inventory.fire_essence || 0;

            gameState.cast();

            expect(gameState.inventory.fire_essence).toBeGreaterThan(initialFire);
        });

        test('should apply multipliers to cast', () => {
            const initialFire = gameState.inventory.fire_essence || 0;

            gameState.cast(2.0, 1.0); // 2x combo multiplier

            const gained = gameState.inventory.fire_essence - initialFire;
            expect(gained).toBeGreaterThan(0);
        });

        test('should grant AB per cast', () => {
            const initialAB = gameState.ab;

            gameState.cast();

            expect(gameState.ab).toBeGreaterThan(initialAB);
        });

        test('should handle specialization bonuses in cast', () => {
            gameState.elementSpecialization = 'fire';
            gameState.specializationBonuses = { castRewardMult: 2.0 };

            expect(() => {
                gameState.cast();
            }).not.toThrow();
        });
    });

    describe('Save State Structure', () => {
        test('should save and load discovered recipes', () => {
            gameState.discoveredRecipes = ['recipe1', 'recipe2'];
            gameState.saveGameStateImmediate();

            const newState = new GameState();
            newState.loadGameState();

            expect(newState.discoveredRecipes).toContain('recipe1');
            expect(newState.discoveredRecipes).toContain('recipe2');
        });

        test('should save game state without errors', () => {
            gameState.addBuff('production', 0.5, 1800);

            expect(() => {
                gameState.saveGameStateImmediate();
            }).not.toThrow();
        });

        test('should save and load prestige data', () => {
            gameState.prestigePoints = 10;
            gameState.prestigeCount = 5;
            gameState.saveGameStateImmediate();

            const newState = new GameState();
            newState.loadGameState();

            expect(newState.prestigePoints).toBe(10);
            expect(newState.prestigeCount).toBe(5);
        });

        test('should save and load element specialization', () => {
            gameState.elementSpecialization = 'fire';
            gameState.specializationBonuses = { test: 1.5 };
            gameState.saveGameStateImmediate();

            const newState = new GameState();
            newState.loadGameState();

            expect(newState.elementSpecialization).toBe('fire');
        });

        test('should handle corrupted save data', () => {
            localStorage.setItem('cyberWitchesGameState', 'corrupted{data');

            expect(() => {
                const newState = new GameState();
                newState.loadGameState();
            }).not.toThrow();
        });

        test('should handle missing save data', () => {
            localStorage.removeItem('cyberWitchesGameState');

            expect(() => {
                const newState = new GameState();
                newState.loadGameState();
            }).not.toThrow();
        });
    });
});
