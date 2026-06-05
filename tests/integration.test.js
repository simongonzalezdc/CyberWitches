/**
 * Integration tests for save/load functionality
 * Tests the complete save/load cycle with coven data
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { GameState } from '../js/gameState.js';
// Coven system archived - see ARCHIVED_COVEN_FEATURES.md
// import { CovenSystem } from '../js/covenSystem.js'; // Archived - see archive/code/covenSystem.js

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
        test('should handle save/load cycle with prestige data', () => {
            // Set up game with prestige
            gameState.prestigePoints = 25;
            gameState.prestigeLifetimeEarned = 5000;
            gameState.prestigeBonuses.test_bonus = 3;
            
            // Save the game
            gameState.saveGameStateImmediate();
            
            // Verify prestige data was saved
            const saveData = JSON.parse(localStorage.getItem('cyberWitchesSave'));
            expect(saveData.prestige.points).toBe(25);
            expect(saveData.prestige.lifetimeEarned).toBe(5000);
            expect(saveData.prestige.bonuses.test_bonus).toBe(3);
            
            // Load the game
            const newGameState = new GameState();
            localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData));
            newGameState.loadGameState();
            
            // Verify prestige data was loaded
            expect(newGameState.prestigePoints).toBe(25);
            expect(newGameState.prestigeLifetimeEarned).toBe(5000);
            expect(newGameState.prestigeBonuses.test_bonus).toBe(3);
        });
    });
    
    describe('Backward Compatibility', () => {
    });
    
    describe('Error Handling', () => {
        test('should handle corrupted save data gracefully', () => {
            // Mock corrupted save data
            localStorage.setItem('cyberWitchesSave', 'invalid json data');
            
            // Should not throw an error
            expect(() => gameState.loadGameState()).not.toThrow();
            
            // Game should be in a valid state
            expect(gameState.ab).toBe(0);
            expect(gameState.inventory).toEqual({});
            expect(gameState.covenSystem).toBeDefined();
        });
        
        test('should handle save errors gracefully (e.g. quota exceeded)', () => {
            // Simulate localStorage.setItem throwing (quota exceeded / private mode).
            const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const lastSaveBefore = gameState.lastSaveTime;
            try {
                // A failed persist must never crash the game...
                expect(() => gameState.saveGameStateImmediate()).not.toThrow();
                // ...and must not falsely advance lastSaveTime (that field is only
                // set AFTER a successful localStorage write), so callers/autosave
                // know the data did not actually persist.
                expect(gameState.lastSaveTime).toBe(lastSaveBefore);
            } finally {
                setItemSpy.mockRestore();
            }
        });

        test('should handle load errors gracefully (e.g. storage access denied)', () => {
            // Simulate localStorage.getItem throwing on read.
            const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('Access denied');
            });

            try {
                // A failed load must never crash the game...
                expect(() => gameState.loadGameState()).not.toThrow();
                // ...and the game must remain in a valid default state.
                expect(gameState.ab).toBe(0);
                expect(gameState.inventory).toEqual({});
            } finally {
                getItemSpy.mockRestore();
            }
        });

        test('flushPendingSave persists immediately only when a save is pending', () => {
            const saveSpy = jest.spyOn(gameState, 'saveGameStateImmediate').mockImplementation(() => {});

            // No pending change -> nothing persisted, flag stays clear.
            gameState.hasPendingSave = false;
            gameState.flushPendingSave();
            expect(saveSpy).not.toHaveBeenCalled();

            // Pending change (the tab-hide / pagehide case) -> flush now, clear flag.
            // This is the core of the data-loss fix: progress accrued since the last
            // autosave is persisted when the page is backgrounded/closed.
            gameState.hasPendingSave = true;
            gameState.flushPendingSave();
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(gameState.hasPendingSave).toBe(false);

            // force=true persists even with nothing pending.
            gameState.flushPendingSave(true);
            expect(saveSpy).toHaveBeenCalledTimes(2);

            saveSpy.mockRestore();
        });

        test('registerLifecycleHandlers wires hide/pagehide flush and is idempotent', () => {
            // Regression guard: the game runs on UnifiedGameLoop (startTickLoop is
            // skipped), so the save-flush handlers MUST be registered independently
            // of the tick loop. If this regresses, progress is silently lost on
            // mobile background/close.
            const docAdd = jest.fn();
            const winAdd = jest.fn();
            const realDocAdd = global.document.addEventListener;
            const realWinAdd = global.window.addEventListener;
            global.document.addEventListener = docAdd;
            global.window.addEventListener = winAdd;

            try {
                gameState.visibilityHandler = null;
                gameState.pageHideHandler = null;

                gameState.registerLifecycleHandlers();
                expect(docAdd).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
                expect(winAdd).toHaveBeenCalledWith('pagehide', expect.any(Function));

                // Idempotent: a second call must not re-register.
                docAdd.mockClear();
                winAdd.mockClear();
                gameState.registerLifecycleHandlers();
                expect(docAdd).not.toHaveBeenCalled();
                expect(winAdd).not.toHaveBeenCalled();

                // The exit handlers FORCE a save — even when no autosave is pending.
                // This is the key data-loss guard: closing the tab shortly after a
                // craft/cast (before the 30s autosave sets hasPendingSave) must still
                // persist. A non-forced flush would silently drop that progress.
                const saveSpy = jest.spyOn(gameState, 'saveGameStateImmediate').mockImplementation(() => {});
                gameState.hasPendingSave = false;
                gameState.pageHideHandler();
                expect(saveSpy).toHaveBeenCalledTimes(1); // forced despite no pending flag

                gameState.hasPendingSave = false;
                const hiddenDesc = Object.getOwnPropertyDescriptor(global.document, 'hidden');
                Object.defineProperty(global.document, 'hidden', { configurable: true, get: () => true });
                try {
                    gameState.visibilityHandler();
                    expect(saveSpy).toHaveBeenCalledTimes(2);
                } finally {
                    if (hiddenDesc) Object.defineProperty(global.document, 'hidden', hiddenDesc);
                    else delete global.document.hidden;
                }
                saveSpy.mockRestore();
            } finally {
                global.document.addEventListener = realDocAdd;
                global.window.addEventListener = realWinAdd;
            }
        });
    });
});