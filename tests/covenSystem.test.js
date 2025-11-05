/**
 * Unit tests for CovenSystem class
 * Tests coven creation, joining, rituals, and bonuses
 */

import { CovenSystem } from '../js/covenSystem.js';

// Mock the error handler
jest.mock('../js/errorHandler.js', () => ({
    handleError: jest.fn()
}));

describe('CovenSystem', () => {
    let covenSystem;
    let mockGameState;
    
    beforeEach(() => {
        // Create a mock game state
        mockGameState = {
            ab: 100,
            inventory: { test_ingredient: 50 }
        };
        
        // Create a new CovenSystem instance
        covenSystem = new CovenSystem(mockGameState);
        
        // Clear all mocks
        jest.clearAllMocks();
    });
    
    describe('Initialization', () => {
        test('should initialize with default values', () => {
            expect(covenSystem.currentCoven).toBeNull();
            expect(covenSystem.playerId).toBeDefined();
            expect(covenSystem.playerName).toBeDefined();
            expect(covenSystem.playerName).toMatch(/^CyberWitch_/);
        });
        
        test('should generate unique player IDs', () => {
            const covenSystem2 = new CovenSystem(mockGameState);
            
            expect(covenSystem.playerId).not.toBe(covenSystem2.playerId);
        });
    });
    
    describe('Coven Creation', () => {
        test('should create a coven with valid data', () => {
            const result = covenSystem.createCoven('Test Coven', 'A test coven');
            
            expect(result).toBe(true);
            expect(covenSystem.currentCoven).toBeDefined();
            expect(covenSystem.currentCoven.name).toBe('Test Coven');
            expect(covenSystem.currentCoven.description).toBe('A test coven');
            expect(covenSystem.currentCoven.level).toBe(1);
            expect(covenSystem.currentCoven.members).toHaveLength(1);
            expect(covenSystem.currentCoven.members[0].isLeader).toBe(true);
            expect(covenSystem.currentCoven.activeRituals).toHaveLength(3);
        });
        
        test('should not create coven with empty name', () => {
            const result = covenSystem.createCoven('', 'A test coven');
            
            expect(result).toBe(false);
            expect(covenSystem.currentCoven).toBeNull();
        });
        
        test('should not create coven with name too long', () => {
            const longName = 'a'.repeat(51);
            const result = covenSystem.createCoven(longName, 'A test coven');
            
            expect(result).toBe(false);
            expect(covenSystem.currentCoven).toBeNull();
        });
        
        test('should not create coven if already in one', () => {
            // First coven creation should succeed
            covenSystem.createCoven('First Coven', 'First coven');
            
            // Second coven creation should fail
            const result = covenSystem.createCoven('Second Coven', 'Second coven');
            
            expect(result).toBe(false);
            expect(covenSystem.currentCoven.name).toBe('First Coven');
        });
        
        test('should use default description if none provided', () => {
            covenSystem.createCoven('Test Coven', '');
            
            expect(covenSystem.currentCoven.description).toBe('A mysterious coven of cyber witches');
        });
    });
    
    describe('Coven Joining', () => {
        test('should join a coven with valid ID', () => {
            const result = covenSystem.joinCoven('test_coven_id');
            
            expect(result).toBe(true);
            expect(covenSystem.currentCoven).toBeDefined();
            expect(covenSystem.currentCoven.name).toBe('Mock Coven for Testing');
            expect(covenSystem.currentCoven.members).toHaveLength(2); // Leader + current player
        });
        
        test('should not join coven if already in one', () => {
            // First join should succeed
            covenSystem.joinCoven('test_coven_id');
            
            // Second join should fail
            const result = covenSystem.joinCoven('another_coven_id');
            
            expect(result).toBe(false);
            expect(covenSystem.currentCoven.name).toBe('Mock Coven for Testing');
        });
    });
    
    describe('Coven Leaving', () => {
        beforeEach(() => {
            // Join a coven first
            covenSystem.joinCoven('test_coven_id');
        });
        
        test('should leave coven successfully', () => {
            const result = covenSystem.leaveCoven();
            
            expect(result).toBe(true);
            expect(covenSystem.currentCoven).toBeNull();
        });
        
        test('should not leave coven if not in one', () => {
            // Leave the coven first
            covenSystem.leaveCoven();
            
            // Try to leave again
            const result = covenSystem.leaveCoven();
            
            expect(result).toBe(false);
        });
    });
    
    describe('Production Bonus', () => {
        test('should return no bonus when not in coven', () => {
            const bonus = covenSystem.getCovenProductionBonus();
            
            expect(bonus).toBe(1.0);
        });
        
        test('should calculate correct bonus based on member count', () => {
            // Create a coven with 3 members
            covenSystem.createCoven('Test Coven', 'Test');
            
            // Manually add more members for testing
            covenSystem.currentCoven.members.push(
                { id: 'member2', name: 'Member 2', contribution: 0, joinedAt: Date.now(), isLeader: false },
                { id: 'member3', name: 'Member 3', contribution: 0, joinedAt: Date.now(), isLeader: false }
            );
            
            const bonus = covenSystem.getCovenProductionBonus();
            
            // 3 members * 5% = 15% bonus, so multiplier should be 1.15
            expect(bonus).toBe(1.15);
        });
        
        test('should cap bonus at maximum', () => {
            // Create a coven with 10 members (would exceed 25% cap)
            covenSystem.createCoven('Test Coven', 'Test');
            
            // Add many members
            for (let i = 2; i <= 10; i++) {
                covenSystem.currentCoven.members.push({
                    id: `member${i}`,
                    name: `Member ${i}`,
                    contribution: 0,
                    joinedAt: Date.now(),
                    isLeader: false
                });
            }
            
            const bonus = covenSystem.getCovenProductionBonus();
            
            // Should be capped at 25% bonus (1.25 multiplier)
            expect(bonus).toBe(1.25);
        });
    });
    
    describe('Coven Progress Updates', () => {
        beforeEach(() => {
            // Create a coven for testing
            covenSystem.createCoven('Test Coven', 'Test');
        });
        
        test('should update production progress', () => {
            const initialContribution = covenSystem.currentCoven.members[0].contribution;
            
            covenSystem.updateCovenProgress('production', 100, 'ab');
            
            expect(covenSystem.currentCoven.members[0].contribution).toBe(initialContribution + 100);
            expect(covenSystem.currentCoven.stats.totalProduction).toBe(100);
        });
        
        test('should update casting progress', () => {
            covenSystem.updateCovenProgress('casting', 5);
            
            // Should update the casting ritual progress
            const castingRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'casting');
            expect(castingRitual.progress).toBe(5);
        });
        
        test('should update crafting progress', () => {
            covenSystem.updateCovenProgress('crafting', 3);
            
            // Should update the crafting ritual progress
            const craftingRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'crafting');
            expect(craftingRitual.progress).toBe(3);
        });
        
        test('should not update progress when not in coven', () => {
            covenSystem.leaveCoven();
            
            // Should not throw an error
            expect(() => {
                covenSystem.updateCovenProgress('production', 100, 'ab');
            }).not.toThrow();
        });
    });
    
    describe('Ritual Completion', () => {
        beforeEach(() => {
            // Create a coven for testing
            covenSystem.createCoven('Test Coven', 'Test');
        });
        
        test('should complete ritual when progress reaches target', () => {
            const productionRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'production');
            
            // Set progress to just below completion
            productionRitual.progress = productionRitual.maxProgress - 1;
            
            // Update progress to complete the ritual
            covenSystem.updateCovenProgress('production', 1, 'ab');
            
            expect(productionRitual.completedAt).toBeGreaterThan(0);
            expect(covenSystem.currentCoven.stats.totalRitualsCompleted).toBe(1);
        });
        
        test('should add experience when ritual completes', () => {
            const initialExp = covenSystem.currentCoven.experience;
            const productionRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'production');
            
            // Complete the ritual
            productionRitual.progress = productionRitual.maxProgress;
            covenSystem.updateCovenProgress('production', 0, 'ab');
            
            expect(covenSystem.currentCoven.experience).toBe(initialExp + productionRitual.rewards.experience);
        });
        
        test('should replace completed ritual with new one', () => {
            const initialRitualCount = covenSystem.currentCoven.activeRituals.length;
            const productionRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'production');
            
            // Complete the ritual
            productionRitual.progress = productionRitual.maxProgress;
            covenSystem.updateCovenProgress('production', 0, 'ab');
            
            // Should still have the same number of rituals
            expect(covenSystem.currentCoven.activeRituals).toHaveLength(initialRitualCount);
            
            // The completed ritual should be replaced
            const newProductionRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'production');
            expect(newProductionRitual.id).not.toBe(productionRitual.id);
            expect(newProductionRitual.progress).toBe(0);
        });
    });
    
    describe('Coven Level System', () => {
        beforeEach(() => {
            // Create a coven for testing
            covenSystem.createCoven('Test Coven', 'Test');
        });
        
        test('should level up when enough experience is gained', () => {
            const initialLevel = covenSystem.currentCoven.level;
            const productionRitual = covenSystem.currentCoven.activeRituals.find(r => r.requirements.type === 'production');
            
            // Add enough experience to level up
            productionRitual.progress = productionRitual.maxProgress;
            covenSystem.updateCovenProgress('production', 0, 'ab');
            
            expect(covenSystem.currentCoven.level).toBe(initialLevel + 1);
        });
        
        test('should calculate experience requirements correctly', () => {
            // Test experience for level 2 (should be 100 * 1.5^(2-1) = 150)
            const expForLevel2 = covenSystem.getExperienceForLevel(2);
            expect(expForLevel2).toBe(150);
            
            // Test experience for level 3 (should be 100 * 1.5^(3-1) = 225)
            const expForLevel3 = covenSystem.getExperienceForLevel(3);
            expect(expForLevel3).toBe(225);
        });
        
        test('should generate harder rituals at higher levels', () => {
            // Level up the coven
            covenSystem.currentCoven.level = 5;
            
            const newRitual = covenSystem.generateRitualForLevel(5);
            
            // Higher level rituals should have higher targets
            expect(newRitual.maxProgress).toBeGreaterThan(1000); // Base target for level 1
            expect(newRitual.rewards.experience).toBeGreaterThan(50); // Base reward for level 1
        });
    });
    
    describe('Utility Functions', () => {
        beforeEach(() => {
            // Create a coven for testing
            covenSystem.createCoven('Test Coven', 'Test');
        });
        
        test('should correctly report coven membership status', () => {
            expect(covenSystem.isInCoven()).toBe(true);
            
            covenSystem.leaveCoven();
            
            expect(covenSystem.isInCoven()).toBe(false);
        });
        
        test('should correctly report leader status', () => {
            expect(covenSystem.isCovenLeader()).toBe(true);
            
            // Leave and rejoin as non-leader
            covenSystem.leaveCoven();
            covenSystem.joinCoven('test_coven_id');
            
            expect(covenSystem.isCovenLeader()).toBe(false);
        });
        
        test('should return current coven', () => {
            const coven = covenSystem.getCurrentCoven();
            
            expect(coven).toBeDefined();
            expect(coven.name).toBe('Test Coven');
        });
        
        test('should return player member info', () => {
            const memberInfo = covenSystem.getPlayerMemberInfo();
            
            expect(memberInfo).toBeDefined();
            expect(memberInfo.isLeader).toBe(true);
            expect(memberInfo.name).toBe(covenSystem.playerName);
        });
        
        test('should return null for player member info when not in coven', () => {
            covenSystem.leaveCoven();
            
            const memberInfo = covenSystem.getPlayerMemberInfo();
            
            expect(memberInfo).toBeNull();
        });
    });
    
    describe('Save/Load Functionality', () => {
        test('should save coven data correctly', () => {
            covenSystem.createCoven('Test Coven', 'Test coven');
            
            const saveData = covenSystem.saveCovenData();
            
            expect(saveData).toBeDefined();
            expect(saveData.coven).toBeDefined();
            expect(saveData.playerId).toBe(covenSystem.playerId);
            expect(saveData.playerName).toBe(covenSystem.playerName);
        });
        
        test('should return null when not in coven', () => {
            const saveData = covenSystem.saveCovenData();
            
            expect(saveData).toBeNull();
        });
        
        test('should load coven data correctly', () => {
            const covenData = {
                coven: {
                    id: 'loaded_coven',
                    name: 'Loaded Coven',
                    level: 3,
                    members: [
                        { id: 'leader', name: 'Leader', contribution: 100, isLeader: true },
                        { id: covenSystem.playerId, name: 'You', contribution: 0, isLeader: false }
                    ]
                },
                playerId: 'loaded_player_id',
                playerName: 'LoadedPlayer'
            };
            
            covenSystem.loadCovenData(covenData);
            
            expect(covenSystem.currentCoven).toBeDefined();
            expect(covenSystem.currentCoven.name).toBe('Loaded Coven');
            expect(covenSystem.currentCoven.level).toBe(3);
            expect(covenSystem.playerId).toBe('loaded_player_id');
            expect(covenSystem.playerName).toBe('LoadedPlayer');
        });
        
        test('should handle null coven data gracefully', () => {
            covenSystem.loadCovenData(null);
            
            expect(covenSystem.currentCoven).toBeNull();
        });
    });
});