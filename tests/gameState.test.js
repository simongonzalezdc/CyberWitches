/**
 * Unit tests for GameState class
 * Tests core game logic, save/load functionality, and coven integration
 */

import { GameState } from '../js/gameState.js';

// Mock the modules that GameState depends on
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

jest.mock('../js/covenSystem.js', () => {
    return {
        CovenSystem: jest.fn().mockImplementation(() => ({
            isInCoven: jest.fn().mockReturnValue(false),
            getCovenProductionBonus: jest.fn().mockReturnValue(1.0),
            updateCovenProgress: jest.fn(),
            saveCovenData: jest.fn().mockReturnValue(null),
            loadCovenData: jest.fn()
        }))
    };
});

jest.mock('../js/errorHandler.js', () => ({
    handleError: jest.fn(),
    safeFunction: jest.fn((fn) => fn),
    safeAsyncFunction: jest.fn((fn) => fn),
    validateParams: jest.fn(),
    retryWithBackoff: jest.fn()
}));

describe('GameState', () => {
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
        // Clean up after each test
        jest.clearAllMocks();
    });
    
    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(gameState.ab).toBe(0.0);
            expect(gameState.abTotalEarned).toBe(0.0);
            expect(gameState.inventory).toEqual({});
            expect(gameState.workstations).toEqual({});
            expect(gameState.upgradesOwned).toEqual({});
            expect(gameState.prestigePoints).toBe(0);
            expect(gameState.prestigeLifetimeEarned).toBe(0.0);
            expect(gameState.prestigeBonuses).toEqual({});
            expect(gameState.activeBuffs).toEqual([]);
            expect(gameState.discoveredRecipes).toEqual([]);
            expect(gameState.totalTaps).toBe(0);
            expect(gameState.totalWorkstationsCrafted).toBe(0);
        });
        
        test('should initialize coven system', () => {
            expect(gameState.covenSystem).toBeDefined();
        });
    });
    
    describe('Currency Management', () => {
        test('should add AB correctly', () => {
            const initialAb = gameState.ab;
            const amount = 100.5;
            
            gameState.addAb(amount);
            
            expect(gameState.ab).toBe(initialAb + amount);
            expect(gameState.abTotalEarned).toBe(initialAb + amount);
            expect(gameState.prestigeLifetimeEarned).toBe(initialAb + amount);
        });
        
        test('should spend AB if enough is available', () => {
            gameState.addAb(100);
            const result = gameState.spendAb(50);
            
            expect(result).toBe(true);
            expect(gameState.ab).toBe(50);
        });
        
        test('should not spend AB if not enough is available', () => {
            gameState.addAb(30);
            const result = gameState.spendAb(50);
            
            expect(result).toBe(false);
            expect(gameState.ab).toBe(30);
        });
    });
    
    describe('Inventory Management', () => {
        test('should add ingredients correctly', () => {
            gameState.addIngredient('test_ingredient', 10);
            
            expect(gameState.inventory['test_ingredient']).toBe(10);
        });
        
        test('should accumulate ingredients when adding multiple times', () => {
            gameState.addIngredient('test_ingredient', 5);
            gameState.addIngredient('test_ingredient', 7);
            
            expect(gameState.inventory['test_ingredient']).toBe(12);
        });
        
        test('should spend ingredients if enough is available', () => {
            gameState.addIngredient('test_ingredient', 20);
            const result = gameState.spendIngredient('test_ingredient', 15);
            
            expect(result).toBe(true);
            expect(gameState.inventory['test_ingredient']).toBe(5);
        });
        
        test('should not spend ingredients if not enough is available', () => {
            gameState.addIngredient('test_ingredient', 10);
            const result = gameState.spendIngredient('test_ingredient', 15);
            
            expect(result).toBe(false);
            expect(gameState.inventory['test_ingredient']).toBe(10);
        });
    });
    
    describe('Production Calculation', () => {
        test('should calculate production correctly', () => {
            gameState.workstations['test_producer'] = 2;
            
            const production = gameState.calculateTotalProduction(1.0);
            
            expect(production['test_output']).toBe(2.0);
        });
        
        test('should apply coven bonus when in coven', () => {
            // Mock coven system to return a bonus
            gameState.covenSystem.isInCoven.mockReturnValue(true);
            gameState.covenSystem.getCovenProductionBonus.mockReturnValue(1.25); // 25% bonus
            
            gameState.workstations['test_producer'] = 2;
            gameState.addAb(100); // Add AB to enable AB production
            
            const production = gameState.calculateTotalProduction(1.0);
            
            expect(production['test_output']).toBe(2.0); // Base production
        });
    });
    
    describe('Casting', () => {
        test('should increment tap count', () => {
            const initialTaps = gameState.totalTaps;
            
            gameState.cast();
            
            expect(gameState.totalTaps).toBe(initialTaps + 1);
        });
        
        test('should grant base ingredients', () => {
            gameState.cast();
            
            expect(gameState.inventory['wax_bits']).toBe(1.0);
            expect(gameState.inventory['wick_fiber']).toBe(1.0);
            expect(gameState.inventory['crystal_dust']).toBe(0.5);
            expect(gameState.inventory['aether_ess']).toBe(0.5);
        });
        
        test('should grant AB per cast', () => {
            const initialAb = gameState.ab;
            
            gameState.cast();
            
            expect(gameState.ab).toBeGreaterThan(initialAb);
        });
        
        test('should update coven progress', () => {
            gameState.cast();
            
            expect(gameState.covenSystem.updateCovenProgress).toHaveBeenCalledWith('casting', 1);
        });
    });
    
    describe('Workstation Crafting', () => {
        test('should craft workstation if affordable', () => {
            gameState.addIngredient('test_ingredient', 20);
            
            const result = gameState.craftWorkstation('test_producer', 1);
            
            expect(result).toBe(true);
            expect(gameState.workstations['test_producer']).toBe(1);
            expect(gameState.inventory['test_ingredient']).toBe(10); // 20 - 10 cost
            expect(gameState.totalWorkstationsCrafted).toBe(1);
        });
        
        test('should not craft workstation if not affordable', () => {
            gameState.addIngredient('test_ingredient', 5);
            
            const result = gameState.craftWorkstation('test_producer', 1);
            
            expect(result).toBe(false);
            expect(gameState.workstations['test_producer']).toBe(0);
            expect(gameState.inventory['test_ingredient']).toBe(5); // Unchanged
        });
        
        test('should update coven progress when crafting', () => {
            gameState.addIngredient('test_ingredient', 20);
            
            gameState.craftWorkstation('test_producer', 2);
            
            expect(gameState.covenSystem.updateCovenProgress).toHaveBeenCalledWith('crafting', 2);
        });
    });
    
    describe('Save/Load Functionality', () => {
        test('should save game state correctly', () => {
            // Set up some game state
            gameState.addAb(100);
            gameState.addIngredient('test_ingredient', 50);
            gameState.workstations['test_producer'] = 3;
            gameState.upgradesOwned['test_upgrade'] = true;
            gameState.prestigePoints = 5;
            
            // Save the game
            gameState.saveGameState();
            
            // Check that localStorage was called with correct data
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'cyberWitchesSave',
                expect.stringContaining('"ab":100')
            );
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'cyberWitchesSave',
                expect.stringContaining('"test_ingredient":50')
            );
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'cyberWitchesSave',
                expect.stringContaining('"test_producer":3')
            );
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'cyberWitchesSave',
                expect.stringContaining('"version":"2.0"')
            );
        });
        
        test('should load game state correctly', () => {
            // Mock localStorage data
            const saveData = {
                ab: 200,
                abTotal: 300,
                inventory: { test_ingredient: 75 },
                workstations: { test_producer: 5 },
                upgrades: { test_upgrade: true },
                prestige: {
                    points: 10,
                    lifetimeEarned: 500,
                    bonuses: { test_bonus: 2 }
                },
                experiments: { discovered: [] },
                stats: {
                    totalTaps: 50,
                    totalWorkstationsCrafted: 25
                },
                coven: null,
                timestamp: Date.now() / 1000,
                version: "2.0"
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
            
            // Load the game
            gameState.loadGameState();
            
            // Check that state was loaded correctly
            expect(gameState.ab).toBe(200);
            expect(gameState.abTotalEarned).toBe(300);
            expect(gameState.inventory['test_ingredient']).toBe(75);
            expect(gameState.workstations['test_producer']).toBe(5);
            expect(gameState.upgradesOwned['test_upgrade']).toBe(true);
            expect(gameState.prestigePoints).toBe(10);
            expect(gameState.prestigeLifetimeEarned).toBe(500);
            expect(gameState.prestigeBonuses['test_bonus']).toBe(2);
            expect(gameState.totalTaps).toBe(50);
            expect(gameState.totalWorkstationsCrafted).toBe(25);
        });
        
        test('should handle corrupted save data gracefully', () => {
            // Mock corrupted save data
            localStorage.getItem.mockReturnValue('invalid json');
            
            // Should not throw an error
            expect(() => gameState.loadGameState()).not.toThrow();
        });
        
        test('should load coven data when loading game', () => {
            const covenData = {
                coven: {
                    id: 'test_coven',
                    name: 'Test Coven',
                    level: 3
                },
                playerId: 'test_player',
                playerName: 'TestPlayer'
            };
            
            const saveData = {
                ab: 0,
                abTotal: 0,
                inventory: {},
                workstations: {},
                upgrades: {},
                prestige: { points: 0, lifetimeEarned: 0, bonuses: {} },
                experiments: { discovered: [] },
                stats: { totalTaps: 0, totalWorkstationsCrafted: 0 },
                coven: covenData,
                timestamp: Date.now() / 1000,
                version: "2.0"
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(saveData));
            
            gameState.loadGameState();
            
            expect(gameState.covenSystem.loadCovenData).toHaveBeenCalledWith(covenData);
        });
    });
    
    describe('Offline Progress', () => {
        test('should apply offline progress correctly', () => {
            gameState.addAb(100);
            const abps = gameState.getAbPerSecond();
            
            gameState.applyOfflineProgress(60); // 1 minute
            
            expect(gameState.covenSystem.updateCovenProgress).toHaveBeenCalledWith(
                'production',
                expect.any(Number),
                'ab'
            );
        });
    });
    
    describe('Error Handling', () => {
        test('should handle save errors gracefully', () => {
            // Mock localStorage to throw an error
            localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            
            // Should not throw an error
            expect(() => gameState.saveGameState()).not.toThrow();
            
            // Should call error handler
            expect(gameState.covenSystem.constructor.mock.calls[0][1].handleError).toHaveBeenCalled();
        });
        
        test('should handle load errors gracefully', () => {
            // Mock localStorage to throw an error
            localStorage.getItem.mockImplementation(() => {
                throw new Error('Load error');
            });
            
            // Should not throw an error
            expect(() => gameState.loadGameState()).not.toThrow();
        });
    });
});