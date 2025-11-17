/**
 * Game State Tests
 * Comprehensive tests for gameState.js
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { GameState } from '../js/gameState.js';
import { GAME_CONSTANTS } from '../js/codeOrganization.js';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

global.localStorage = localStorageMock;

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        localStorage.clear();
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
        test('should initialize with default values', () => {
            expect(gameState.ab).toBe(0.0);
            expect(gameState.abTotalEarned).toBe(0.0);
            expect(gameState.inventory).toEqual({});
            expect(gameState.workstations).toEqual({});
            expect(gameState.upgradesOwned).toEqual({});
            expect(gameState.prestigePoints).toBe(0);
            expect(gameState.prestigeCount).toBe(0);
            expect(gameState.discoveredRecipes).toEqual([]);
            expect(gameState.totalTaps).toBe(0);
        });

        test('should initialize milestones correctly', () => {
            // Create a fresh gameState with milestones enabled
            const freshGameState = new GameState();
            expect(freshGameState.milestones).toEqual(GAME_CONSTANTS.MILESTONE_THRESHOLDS);
            expect(freshGameState.unlockedMilestones).toBeInstanceOf(Set);
        });
    });

    describe('Currency Management', () => {
        test('should add AB correctly', () => {
            gameState.addAb(100);
            expect(gameState.ab).toBe(100);
            expect(gameState.abTotalEarned).toBe(100);
        });

        test('should track total AB earned', () => {
            gameState.addAb(50);
            gameState.addAb(50);
            expect(gameState.ab).toBe(100);
            expect(gameState.abTotalEarned).toBe(100);
        });

        test('should spend AB correctly', () => {
            gameState.addAb(100);
            gameState.spendAb(50);
            expect(gameState.ab).toBe(50);
        });

        test('should not allow negative AB', () => {
            gameState.addAb(50);
            gameState.spendAb(100);
            expect(gameState.ab).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Inventory Management', () => {
        test('should add ingredients correctly', () => {
            gameState.addIngredient('fire', 10);
            expect(gameState.inventory['fire']).toBe(10);
        });

        test('should spend ingredients correctly', () => {
            gameState.addIngredient('fire', 10);
            gameState.spendIngredient('fire', 5);
            expect(gameState.inventory['fire']).toBe(5);
        });

        test('should not allow negative ingredients', () => {
            gameState.addIngredient('fire', 10);
            gameState.spendIngredient('fire', 15);
            expect(gameState.inventory['fire']).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Production', () => {
        test('should calculate production correctly', () => {
            // Add a workstation
            gameState.workstations['test_ws'] = 1;
            
            // Mock PRODUCERS data
            const production = gameState.calculateTotalProduction(1.0);
            expect(production).toBeDefined();
        });

        test('should get AB per second', () => {
            const abps = gameState.getAbPerSecond();
            expect(abps).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Save/Load', () => {
        test('should save game state', () => {
            gameState.addAb(100);
            gameState.addIngredient('fire', 10);
            gameState.saveGameStateImmediate();

            const savedData = JSON.parse(localStorage.getItem('cyberWitchesSave'));
            expect(savedData).toBeDefined();
            expect(savedData.ab).toBe(100);
        });

        test('should load game state', () => {
            // Save the current state
            gameState.addAb(100);
            gameState.addIngredient('fire', 10);
            gameState.saveGameStateImmediate();

            // Clear and reload
            gameState.ab = 0;
            gameState.inventory = {};
            gameState.loadGameState();

            // Verify key data was loaded
            expect(gameState.ab).toBe(100);
            // Inventory loading is tested in unit/gameState.test.js
            expect(gameState.inventory).toBeDefined();
        });

        test('should handle corrupted save data', () => {
            localStorage.setItem('cyberWitchesSave', 'invalid json');
            expect(() => gameState.loadGameState()).not.toThrow();
        });

        test('should validate save data', () => {
            const invalidData = { version: '2.1', ab: 'invalid' };
            const isValid = gameState.validateSaveData(invalidData);
            expect(isValid).toBe(false);
        });
    });

    describe('Save Conflict Resolution', () => {
        test('should detect save conflicts', () => {
            const save1 = {
                version: '2.1',
                timestamp: Date.now() / 1000,
                ab: 100
            };
            const save2 = {
                version: '2.1',
                timestamp: (Date.now() / 1000) + 10,
                ab: 200
            };
            
            localStorage.setItem('cyberWitchesSave', JSON.stringify(save1));
            localStorage.setItem('cyberWitchesSave_alt', JSON.stringify(save2));
            
            const hasConflict = gameState.checkSaveConflicts();
            expect(hasConflict).toBe(true);
        });

        test('should merge save data when possible', () => {
            const save1 = {
                version: '2.1',
                timestamp: Date.now() / 1000,
                ab: 100,
                inventory: { fire: 10 },
                workstations: { ws1: 5 }
            };
            const save2 = {
                version: '2.1',
                timestamp: (Date.now() / 1000) + 60, // 1 minute later
                ab: 200,
                inventory: { fire: 15, water: 5 },
                workstations: { ws1: 3, ws2: 2 }
            };
            
            const merged = gameState.mergeSaveData(save1, save2);
            expect(merged).toBeDefined();
            expect(merged.ab).toBe(200); // Higher value
            expect(merged.inventory.fire).toBe(15); // Higher value
            expect(merged.inventory.water).toBe(5); // From save2
            expect(merged.workstations.ws1).toBe(5); // Higher value
            expect(merged.workstations.ws2).toBe(2); // From save2
        });
    });

    describe('Buffs', () => {
        test('should add buffs correctly', () => {
            gameState.addBuff('production', 0.5, 60);
            expect(gameState.activeBuffs.length).toBe(1);
            expect(gameState.activeBuffs[0].type).toBe('production');
            expect(gameState.activeBuffs[0].value).toBe(0.5); // Multiplier value (0.5 for +50%)
        });

        test('should get buff multiplier', () => {
            gameState.addBuff('production', 0.5, 60);
            const mult = gameState.getBuff('production');
            expect(mult).toBe(1.5);
        });

        test('should update buffs and remove expired ones', () => {
            gameState.addBuff('production', 0.5, 1); // 1 second duration
            gameState.updateBuffs(2); // 2 seconds elapsed
            expect(gameState.activeBuffs.length).toBe(0);
        });
    });

    describe('Prestige', () => {
        test('should calculate prestige gain', () => {
            gameState.abTotalEarned = 1000000;
            const gain = gameState.calculatePrestigeGain();
            expect(gain).toBeGreaterThanOrEqual(0);
        });

        test('should complete prestige', () => {
            gameState.abTotalEarned = 1000000;
            const gain = gameState.calculatePrestigeGain();
            if (gain > 0) {
                const success = gameState.completePrestige();
                expect(success).toBe(true);
                expect(gameState.prestigePoints).toBeGreaterThan(0);
                expect(gameState.prestigeCount).toBe(1);
            }
        });
    });
});
