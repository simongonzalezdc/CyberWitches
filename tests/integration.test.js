/**
 * Integration tests for save/load functionality
 * Tests the complete save/load cycle with coven data
 */

import { GameState } from '../js/gameState.js';
import { CovenSystem } from '../js/covenSystem.js';

// Mock modules
jest.mock('../js/data.js', () => ({
    PRODUCERS: [
        {
            id: 'test_producer',
            displayName: 'Test Producer',
            unlockAtAb: 0,
            recipe: { test_ingredient: 10 },
            growth: 1.1,
            outputs: { test_output: 1.0 }
        }
    ],
    UPGRADES: [
        {
            id: 'test_upgrade',
            displayName: 'Test Upgrade',
            description: 'A test upgrade',
            affects: 'global',
            type: 'multiplier',
            value: 2.0,
            recipe: { test_ingredient: 5 },
            unlockAtAb: 0
        }
    ],
    PRESTIGE_BONUSES: [
        {
            id: 'test_bonus',
            displayName: 'Test Bonus',
            description: 'A test bonus',
            type: 'global_mult',
            value: 0.1,
            baseCostPp: 10,
            costGrowth: 1.5
        }
    ],
    HIDDEN_RECIPES: []
}));

jest.mock('../js/utils.js', () => ({
    Balance: {
        calculateOfflineProduction: jest.fn((elapsed, abps) => elapsed * abps),
        prestigePointsFor: jest.fn((total) => Math.floor(total / 1000))
    }
}));

jest.mock('../js/errorHandler.js', () => ({
    handleError: jest.fn()
}));

describe('Save/Load Integration Tests', () => {
    let gameState;
    
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        
        // Create a new GameState instance
        gameState = new GameState();
        
        // Mock DOM methods
        global.document = {
            getElementById: jest.fn(),
            createElement: jest.fn().mockReturnValue({
                style: {},
                appendChild: jest.fn(),
                textContent: ''
            })
        };
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Complete Save/Load Cycle', () => {
        test('should save and load complete game state including coven data', () => {
            // Set up a complex game state
            gameState.addAb(1000);
            gameState.addIngredient('test_ingredient', 500);
            gameState.craftWorkstation('test_producer', 5);
            gameState.inscribeUpgrade('test_upgrade');
            gameState.totalTaps = 250;
            gameState.totalWorkstationsCrafted = 15;
            
            // Create and join a coven
            const covenCreated = gameState.covenSystem.createCoven('Integration Test Coven', 'A coven for integration testing');
            expect(covenCreated).toBe(true);
            
            // Add some progress to coven
            gameState.covenSystem.updateCovenProgress('production', 200, 'ab');
            gameState.covenSystem.updateCovenProgress('casting', 50);
            
            // Save the game
            gameState.saveGameState();
            
            // Verify save data contains all expected fields
            const saveData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            
            expect(saveData.ab).toBe(1000);
            expect(saveData.abTotal).toBe(1000);
            expect(saveData.inventory.test_ingredient).toBe(500);
            expect(saveData.workstations.test_producer).toBe(5);
            expect(saveData.upgrades.test_upgrade).toBe(true);
            expect(saveData.stats.totalTaps).toBe(250);
            expect(saveData.stats.totalWorkstationsCrafted).toBe(15);
            expect(saveData.coven).toBeDefined();
            expect(saveData.coven.coven.name).toBe('Integration Test Coven');
            expect(saveData.coven.coven.level).toBe(1);
            expect(saveData.version).toBe('2.0');
            
            // Create a new game state and load the saved data
            const newGameState = new GameState();
            localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
            newGameState.loadGameState();
            
            // Verify all data was loaded correctly
            expect(newGameState.ab).toBe(1000);
            expect(newGameState.inventory.test_ingredient).toBe(500);
            expect(newGameState.workstations.test_producer).toBe(5);
            expect(newGameState.upgradesOwned.test_upgrade).toBe(true);
            expect(newGameState.totalTaps).toBe(250);
            expect(newGameState.totalWorkstationsCrafted).toBe(15);
            expect(newGameState.covenSystem.isInCoven()).toBe(true);
            expect(newGameState.covenSystem.getCurrentCoven().name).toBe('Integration Test Coven');
        });
        
        test('should handle save/load cycle with coven level progression', () => {
            // Set up game with coven
            gameState.covenSystem.createCoven('Level Test Coven', 'Testing level progression');
            
            // Complete enough rituals to level up the coven
            const coven = gameState.covenSystem.getCurrentCoven();
            const productionRitual = coven.activeRituals.find(r => r.requirements.type === 'production');
            
            // Complete the ritual multiple times to gain enough experience
            for (let i = 0; i < 5; i++) {
                productionRitual.progress = productionRitual.maxProgress;
                gameState.covenSystem.updateCovenProgress('production', 0, 'ab');
            }
            
            // Save the game
            gameState.saveGameState();
            
            // Verify coven level increased
            const saveData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(saveData.coven.coven.level).toBeGreaterThan(1);
            
            // Load the game
            const newGameState = new GameState();
            localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
            newGameState.loadGameState();
            
            // Verify coven level was preserved
            expect(newGameState.covenSystem.getCurrentCoven().level).toBeGreaterThan(1);
        });
        
        test('should handle save/load cycle with prestige data', () => {
            // Set up game with prestige
            gameState.prestigePoints = 25;
            gameState.prestigeLifetimeEarned = 5000;
            gameState.prestigeBonuses.test_bonus = 3;
            
            // Save the game
            gameState.saveGameState();
            
            // Verify prestige data was saved
            const saveData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(saveData.prestige.points).toBe(25);
            expect(saveData.prestige.lifetimeEarned).toBe(5000);
            expect(saveData.prestige.bonuses.test_bonus).toBe(3);
            
            // Load the game
            const newGameState = new GameState();
            localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
            newGameState.loadGameState();
            
            // Verify prestige data was loaded
            expect(newGameState.prestigePoints).toBe(25);
            expect(newGameState.prestigeLifetimeEarned).toBe(5000);
            expect(newGameState.prestigeBonuses.test_bonus).toBe(3);
        });
    });
    
    describe('Backward Compatibility', () => {
        test('should load save data from version 1.0 without coven data', () => {
            // Create a version 1.0 save data (without coven)
            const v1SaveData = {
                ab: 500,
                abTotal: 800,
                inventory: { test_ingredient: 200 },
                workstations: { test_producer: 3 },
                upgrades: { test_upgrade: true },
                prestige: {
                    points: 10,
                    lifetimeEarned: 2000,
                    bonuses: { test_bonus: 1 }
                },
                experiments: { discovered: [] },
                stats: {
                    totalTaps: 100,
                    totalWorkstationsCrafted: 8
                },
                timestamp: Date.now() / 1000,
                version: "1.0"
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(v1SaveData));
            gameState.loadGameState();
            
            // Verify data was loaded correctly
            expect(gameState.ab).toBe(500);
            expect(gameState.inventory.test_ingredient).toBe(200);
            expect(gameState.workstations.test_producer).toBe(3);
            expect(gameState.upgradesOwned.test_upgrade).toBe(true);
            expect(gameState.prestigePoints).toBe(10);
            expect(gameState.totalTaps).toBe(100);
            
            // Coven system should be initialized but not in a coven
            expect(gameState.covenSystem).toBeDefined();
            expect(gameState.covenSystem.isInCoven()).toBe(false);
        });
        
        test('should handle missing optional fields in save data', () => {
            // Create save data with missing optional fields
            const incompleteSaveData = {
                ab: 100,
                version: "2.0"
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(incompleteSaveData));
            gameState.loadGameState();
            
            // Should load without errors and use defaults
            expect(gameState.ab).toBe(100);
            expect(gameState.inventory).toEqual({});
            expect(gameState.workstations).toEqual({});
            expect(gameState.upgradesOwned).toEqual({});
            expect(gameState.prestigePoints).toBe(0);
            expect(gameState.totalTaps).toBe(0);
            
            // Coven system should be initialized but not in a coven
            expect(gameState.covenSystem).toBeDefined();
            expect(gameState.covenSystem.isInCoven()).toBe(false);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle corrupted save data gracefully', () => {
            // Mock corrupted save data
            localStorage.getItem.mockReturnValue('invalid json data');
            
            // Should not throw an error
            expect(() => gameState.loadGameState()).not.toThrow();
            
            // Game should be in a valid state
            expect(gameState.ab).toBe(0);
            expect(gameState.inventory).toEqual({});
            expect(gameState.covenSystem).toBeDefined();
        });
        
        test('should handle save errors gracefully', () => {
            // Mock localStorage to throw an error on save
            localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });
            
            // Should not throw an error
            expect(() => gameState.saveGameState()).not.toThrow();
            
            // Should call error handler
            const { handleError } = require('../js/errorHandler.js');
            expect(handleError).toHaveBeenCalled();
        });
        
        test('should handle load errors gracefully', () => {
            // Mock localStorage to throw an error on load
            localStorage.getItem.mockImplementation(() => {
                throw new Error('Access denied');
            });
            
            // Should not throw an error
            expect(() => gameState.loadGameState()).not.toThrow();
            
            // Game should be in a valid state
            expect(gameState.ab).toBe(0);
            expect(gameState.inventory).toEqual({});
        });
    });
    
    describe('Performance with Large Save Data', () => {
        test('should handle large save files efficiently', () => {
            // Create a large save file
            gameState.addAb(1000000);
            
            // Add many different ingredients
            for (let i = 0; i < 100; i++) {
                gameState.addIngredient(`ingredient_${i}`, Math.random() * 1000);
            }
            
            // Add many workstations
            for (let i = 0; i < 50; i++) {
                gameState.workstations[`workstation_${i}`] = Math.floor(Math.random() * 100);
            }
            
            // Create a large coven with many members
            gameState.covenSystem.createCoven('Large Coven', 'A coven with many members');
            const coven = gameState.covenSystem.getCurrentCoven();
            
            // Add many members
            for (let i = 0; i < 50; i++) {
                coven.members.push({
                    id: `member_${i}`,
                    name: `Member ${i}`,
                    contribution: Math.random() * 1000,
                    joinedAt: Date.now() - Math.random() * 86400000,
                    isLeader: false
                });
            }
            
            // Measure save time
            const startTime = performance.now();
            gameState.saveGameState();
            const saveTime = performance.now() - startTime;
            
            // Save should complete in reasonable time (< 100ms)
            expect(saveTime).toBeLessThan(100);
            
            // Verify save data contains all the large data
            const saveData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(Object.keys(saveData.inventory)).toHaveLength(100);
            expect(Object.keys(saveData.workstations)).toHaveLength(50);
            expect(saveData.coven.coven.members).toHaveLength(51); // 50 + 1 leader
            
            // Measure load time
            const loadStartTime = performance.now();
            const newGameState = new GameState();
            localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
            newGameState.loadGameState();
            const loadTime = performance.now() - loadStartTime;
            
            // Load should complete in reasonable time (< 200ms)
            expect(loadTime).toBeLessThan(200);
            
            // Verify all data was loaded correctly
            expect(newGameState.ab).toBe(1000000);
            expect(Object.keys(newGameState.inventory)).toHaveLength(100);
            expect(Object.keys(newGameState.workstations)).toHaveLength(50);
            expect(newGameState.covenSystem.getCurrentCoven().members).toHaveLength(51);
        });
    });
});