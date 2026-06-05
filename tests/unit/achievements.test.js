/**
 * Unit tests for achievements.js
 * Tests achievement system - unlocking, rewards, and tracking
 */

import { AchievementSystem } from '../../js/achievements.js';
import { GameState } from '../../js/gameState.js';

describe('Achievement System', () => {
    let gameState;
    let achievementSystem;

    beforeEach(() => {
    // Create a fresh game state
        gameState = new GameState();
        gameState.milestones = []; // Disable milestones

        // Create achievement system
        achievementSystem = new AchievementSystem(gameState);
    });

    afterEach(() => {
        if (gameState && gameState.tickInterval) {
            clearInterval(gameState.tickInterval);
        }
    });

    describe('Initialization', () => {
        test('should create achievement system', () => {
            expect(achievementSystem).toBeDefined();
            expect(achievementSystem.gameState).toBe(gameState);
        });

        test('should initialize achievements array', () => {
            expect(achievementSystem.achievements).toBeDefined();
            expect(Array.isArray(achievementSystem.achievements)).toBe(true);
            expect(achievementSystem.achievements.length).toBeGreaterThan(0);
        });

        test('should initialize unlocked achievements set', () => {
            expect(achievementSystem.unlockedAchievements).toBeDefined();
            expect(achievementSystem.unlockedAchievements).toBeInstanceOf(Set);
            expect(achievementSystem.unlockedAchievements.size).toBe(0);
        });

        test('all achievements should have required fields', () => {
            achievementSystem.achievements.forEach(ach => {
                expect(ach.id).toBeDefined();
                expect(typeof ach.id).toBe('string');

                expect(ach.name).toBeDefined();
                expect(typeof ach.name).toBe('string');

                expect(ach.description).toBeDefined();
                expect(typeof ach.description).toBe('string');

                expect(ach.condition).toBeDefined();
                expect(typeof ach.condition).toBe('function');

                expect(ach.reward).toBeDefined();
                expect(typeof ach.reward).toBe('object');
            });
        });

        test('achievement IDs should be unique', () => {
            const ids = achievementSystem.achievements.map(a => a.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('Achievement Unlocking', () => {
        test('should not unlock achievements by default', () => {
            expect(achievementSystem.unlockedAchievements.size).toBe(0);
        });

        test('should unlock first_cast achievement', () => {
            gameState.totalTaps = 1;
            achievementSystem.checkAchievements();

            expect(achievementSystem.unlockedAchievements.has('first_cast')).toBe(true);
        });

        test('should unlock first_ab achievement', () => {
            gameState.ab = 1;
            achievementSystem.checkAchievements();

            expect(achievementSystem.unlockedAchievements.has('first_ab')).toBe(true);
        });

        test('should unlock first_workstation achievement', () => {
            gameState.totalWorkstationsCrafted = 1;
            achievementSystem.checkAchievements();

            expect(achievementSystem.unlockedAchievements.has('first_workstation')).toBe(true);
        });

        test('should unlock multiple achievements at once', () => {
            gameState.totalTaps = 10;
            gameState.ab = 50;
            achievementSystem.checkAchievements();

            // Should unlock at least first_cast, ten_casts, first_ab, and fifty_ab
            expect(achievementSystem.unlockedAchievements.size).toBeGreaterThanOrEqual(4);
        });

        test('should not unlock same achievement twice', () => {
            gameState.totalTaps = 1;
            achievementSystem.checkAchievements();
            const firstCount = achievementSystem.unlockedAchievements.size;

            achievementSystem.checkAchievements();
            const secondCount = achievementSystem.unlockedAchievements.size;

            expect(secondCount).toBe(firstCount);
        });
    });

    describe('Achievement Rewards', () => {
        test('should grant AB reward', () => {
            const initialAB = gameState.ab;
            const reward = { type: 'ab', amount: 100 };

            achievementSystem.grantReward(reward);

            expect(gameState.ab).toBe(initialAB + 100);
        });

        test('should grant prestige point reward', () => {
            const initialPP = gameState.prestigePoints;
            const reward = { type: 'ek', amount: 10 };

            achievementSystem.grantReward(reward);

            expect(gameState.prestigePoints).toBe(initialPP + 10);
        });

        test('should grant multiple rewards', () => {
            const reward1 = { type: 'ab', amount: 100 };
            const reward2 = { type: 'ab', amount: 50 };

            achievementSystem.grantReward(reward1);
            achievementSystem.grantReward(reward2);

            expect(gameState.ab).toBeGreaterThanOrEqual(150);
        });

        test('should handle reward with zero amount', () => {
            const initialAB = gameState.ab;
            const reward = { type: 'ab', amount: 0 };

            achievementSystem.grantReward(reward);

            expect(gameState.ab).toBe(initialAB);
        });
    });

    describe('Achievement Tracking', () => {
        test('should get total achievement count', () => {
            const total = achievementSystem.getTotalCount();
            expect(typeof total).toBe('number');
            expect(total).toBeGreaterThan(0);
            expect(total).toBe(achievementSystem.achievements.length);
        });

        test('should get unlocked achievement count', () => {
            expect(achievementSystem.getUnlockedCount()).toBe(0);

            gameState.totalTaps = 1;
            achievementSystem.checkAchievements();

            expect(achievementSystem.getUnlockedCount()).toBeGreaterThan(0);
        });

        test('unlocked count should match set size', () => {
            gameState.totalTaps = 10;
            gameState.ab = 100;
            achievementSystem.checkAchievements();

            expect(achievementSystem.getUnlockedCount()).toBe(achievementSystem.unlockedAchievements.size);
        });

        test('should track progress toward achievements', () => {
            const totalBefore = achievementSystem.getTotalCount();
            const unlockedBefore = achievementSystem.getUnlockedCount();

            gameState.totalTaps = 100;
            achievementSystem.checkAchievements();

            const unlockedAfter = achievementSystem.getUnlockedCount();

            expect(unlockedAfter).toBeGreaterThan(unlockedBefore);
            expect(achievementSystem.getTotalCount()).toBe(totalBefore); // Total never changes
        });
    });

    describe('Achievement Conditions', () => {
        test('should check cast-based achievements', () => {
            gameState.totalTaps = 0;
            achievementSystem.checkAchievements();
            const count1 = achievementSystem.getUnlockedCount();

            gameState.totalTaps = 10;
            achievementSystem.checkAchievements();
            const count2 = achievementSystem.getUnlockedCount();

            expect(count2).toBeGreaterThan(count1);
        });

        test('should check AB-based achievements', () => {
            gameState.ab = 0;
            achievementSystem.checkAchievements();
            const count1 = achievementSystem.getUnlockedCount();

            gameState.ab = 100;
            achievementSystem.checkAchievements();
            const count2 = achievementSystem.getUnlockedCount();

            expect(count2).toBeGreaterThan(count1);
        });

        test('should check workstation-based achievements', () => {
            gameState.totalWorkstationsCrafted = 0;
            achievementSystem.checkAchievements();
            const count1 = achievementSystem.getUnlockedCount();

            gameState.totalWorkstationsCrafted = 1;
            achievementSystem.checkAchievements();
            const count2 = achievementSystem.getUnlockedCount();

            expect(count2).toBeGreaterThan(count1);
        });

        test('achievement conditions should be callable', () => {
            achievementSystem.achievements.forEach(ach => {
                expect(() => ach.condition()).not.toThrow();
            });
        });

        test('achievement conditions should return boolean', () => {
            achievementSystem.achievements.forEach(ach => {
                const result = ach.condition();
                expect(typeof result).toBe('boolean');
            });
        });
    });

    describe('Edge Cases', () => {
        test('should handle very high game state values', () => {
            gameState.totalTaps = 1000000;
            gameState.ab = 1000000;
            gameState.totalWorkstationsCrafted = 1000;

            achievementSystem.checkAchievements();

            // Should unlock many achievements
            expect(achievementSystem.getUnlockedCount()).toBeGreaterThan(5);
        });

        test('should handle zero values in game state', () => {
            gameState.totalTaps = 0;
            gameState.ab = 0;
            gameState.totalWorkstationsCrafted = 0;

            achievementSystem.checkAchievements();

            // No achievements should be unlocked
            expect(achievementSystem.getUnlockedCount()).toBe(0);
        });

        test('should handle invalid reward types gracefully', () => {
            const reward = { type: 'invalid', amount: 100 };

            // Should not throw error
            expect(() => achievementSystem.grantReward(reward)).not.toThrow();
        });

        test('should throw error for null reward', () => {
            expect(() => achievementSystem.grantReward(null)).toThrow();
        });

        test('should throw error for undefined reward', () => {
            expect(() => achievementSystem.grantReward(undefined)).toThrow();
        });
    });

    describe('Achievement Progress', () => {
        test('should make incremental progress', () => {
            const initialCount = achievementSystem.getUnlockedCount();

            // Increment taps gradually
            for (let i = 1; i <= 10; i++) {
                gameState.totalTaps = i;
                achievementSystem.checkAchievements();
            }

            expect(achievementSystem.getUnlockedCount()).toBeGreaterThan(initialCount);
        });

        test('should unlock achievements in order of difficulty', () => {
            gameState.totalTaps = 1;
            achievementSystem.checkAchievements();
            expect(achievementSystem.unlockedAchievements.has('first_cast')).toBe(true);

            gameState.totalTaps = 10;
            achievementSystem.checkAchievements();
            expect(achievementSystem.unlockedAchievements.has('ten_casts')).toBe(true);

            gameState.totalTaps = 100;
            achievementSystem.checkAchievements();
            expect(achievementSystem.unlockedAchievements.has('hundred_casts')).toBe(true);
        });

        test('should persist unlocked state', () => {
            gameState.totalTaps = 10;
            achievementSystem.checkAchievements();
            const unlockedCount = achievementSystem.getUnlockedCount();

            // Reset game state but keep achievement system
            gameState.totalTaps = 0;

            // Achievements should still be unlocked
            expect(achievementSystem.getUnlockedCount()).toBe(unlockedCount);
        });
    });
});
