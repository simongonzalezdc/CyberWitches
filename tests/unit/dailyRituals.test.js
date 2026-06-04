/**
 * Unit tests for dailyRituals.js
 * Tests daily task system, progress tracking, and rewards
 */

import { DailyRituals } from '../../js/dailyRituals.js';
import { GameState } from '../../js/gameState.js';

describe('Daily Rituals', () => {
    let gameState;
    let dailyRituals;
    let originalDateNow;

    beforeEach(() => {
        gameState = new GameState();
        gameState.milestones = [];
        dailyRituals = new DailyRituals(gameState);
        originalDateNow = Date.now;
    });

    afterEach(() => {
        Date.now = originalDateNow;
        if (gameState.tickInterval) {
            clearInterval(gameState.tickInterval);
        }
    });

    describe('Initialization', () => {
        test('should create daily rituals system', () => {
            expect(dailyRituals).toBeDefined();
            expect(dailyRituals.gameState).toBe(gameState);
        });

        test('should initialize with empty state', () => {
            expect(dailyRituals.activeTasks).toEqual([]);
            expect(dailyRituals.taskProgress).toEqual({});
            expect(dailyRituals.claimedTasks).toEqual([]);
            expect(dailyRituals.ekFragments).toBe(0);
        });

        test('should have task pool from data', () => {
            expect(dailyRituals.taskPool).toBeDefined();
            expect(Array.isArray(dailyRituals.taskPool)).toBe(true);
        });

        test('should initialize callbacks as null', () => {
            expect(dailyRituals.onTaskProgressUpdated).toBeNull();
            expect(dailyRituals.onTaskCompleted).toBeNull();
            expect(dailyRituals.onTasksRefreshed).toBeNull();
        });
    });

    describe('Day Key Generation', () => {
        test('should generate day key in correct format', () => {
            const dayKey = dailyRituals.getDayKey();
            expect(dayKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        test('should generate consistent day key for same day', () => {
            const key1 = dailyRituals.getDayKey();
            const key2 = dailyRituals.getDayKey();
            expect(key1).toBe(key2);
        });

        test('should pad month and day with zeros', () => {
            const dayKey = dailyRituals.getDayKey();
            const parts = dayKey.split('-');
            expect(parts[1].length).toBe(2);
            expect(parts[2].length).toBe(2);
        });
    });

    describe('Daily Refresh', () => {
        test('should select tasks on first refresh', () => {
            dailyRituals.checkDailyRefresh();
            expect(dailyRituals.activeTasks.length).toBeGreaterThan(0);
        });

        test('should reset progress on day change', () => {
            dailyRituals.currentDayKey = '2020-01-01';
            dailyRituals.taskProgress = { task1: 50 };
            dailyRituals.claimedTasks = ['task1'];

            dailyRituals.checkDailyRefresh();

            expect(dailyRituals.taskProgress).toEqual({});
            expect(dailyRituals.claimedTasks).toEqual([]);
        });

        test('should not reset on same day', () => {
            dailyRituals.checkDailyRefresh();
            const tasksBefore = dailyRituals.activeTasks.length;
            dailyRituals.taskProgress = { task1: 50 };

            dailyRituals.checkDailyRefresh();

            expect(dailyRituals.taskProgress).toEqual({ task1: 50 });
        });

        test('should call onTasksRefreshed callback', () => {
            let callbackCalled = false;
            dailyRituals.onTasksRefreshed = () => { callbackCalled = true; };
            dailyRituals.currentDayKey = '2020-01-01';

            dailyRituals.checkDailyRefresh();

            expect(callbackCalled).toBe(true);
        });
    });

    describe('Task Selection', () => {
        test('should select up to 3 tasks', () => {
            dailyRituals.selectDailyTasks();
            expect(dailyRituals.activeTasks.length).toBeLessThanOrEqual(3);
        });

        test('should select tasks from pool', () => {
            dailyRituals.selectDailyTasks();

            for (const task of dailyRituals.activeTasks) {
                expect(dailyRituals.taskPool.some(t => t.id === task.id)).toBe(true);
            }
        });

        test('should select different tasks each time (with randomization)', () => {
            dailyRituals.selectDailyTasks();
            const firstSet = dailyRituals.activeTasks.map(t => t.id);

            // Select multiple times and see if we get variation
            let foundDifferent = false;
            for (let i = 0; i < 10; i++) {
                dailyRituals.selectDailyTasks();
                const newSet = dailyRituals.activeTasks.map(t => t.id);
                if (JSON.stringify(firstSet) !== JSON.stringify(newSet)) {
                    foundDifferent = true;
                    break;
                }
            }

            expect(foundDifferent).toBe(true);
        });
    });

    describe('Task Progress', () => {
        beforeEach(() => {
            // Add a simple tap task
            dailyRituals.activeTasks = [{
                id: 'tap_test',
                condition: 'tap:10',
                rewardType: 'ab',
                rewardValue: 100
            }];
        });

        test('should update tap task progress', () => {
            dailyRituals.updateTaskProgress('tap', null, 5);
            expect(dailyRituals.taskProgress['tap_test']).toBe(5);
        });

        test('should call onTaskProgressUpdated callback', () => {
            let callbackArgs = null;
            dailyRituals.onTaskProgressUpdated = (...args) => { callbackArgs = args; };

            dailyRituals.updateTaskProgress('tap', null, 5);

            expect(callbackArgs).toEqual(['tap_test', 5, 10]);
        });

        test('should call onTaskCompleted when target reached', () => {
            let completedTaskId = null;
            dailyRituals.onTaskCompleted = (taskId) => { completedTaskId = taskId; };

            dailyRituals.updateTaskProgress('tap', null, 10);

            expect(completedTaskId).toBe('tap_test');
        });

        test('should not update claimed tasks', () => {
            dailyRituals.claimedTasks = ['tap_test'];

            dailyRituals.updateTaskProgress('tap', null, 5);

            expect(dailyRituals.taskProgress['tap_test']).toBeUndefined();
        });
    });

    describe('Task Claiming', () => {
        beforeEach(() => {
            dailyRituals.activeTasks = [{
                id: 'claim_test',
                condition: 'tap:5',
                rewardType: 'ab',
                rewardValue: 100
            }];
            dailyRituals.taskProgress = { claim_test: 5 };
        });

        test('should claim completed task', () => {
            const result = dailyRituals.claimTask('claim_test');
            expect(result).toBe(true);
        });

        test('should not claim incomplete task', () => {
            dailyRituals.taskProgress = { claim_test: 3 };
            const result = dailyRituals.claimTask('claim_test');
            expect(result).toBe(false);
        });

        test('should not claim already claimed task', () => {
            dailyRituals.claimTask('claim_test');
            const result = dailyRituals.claimTask('claim_test');
            expect(result).toBe(false);
        });

        test('should not claim non-existent task', () => {
            const result = dailyRituals.claimTask('fake_task');
            expect(result).toBe(false);
        });

        test('should grant AB reward', () => {
            const initialAB = gameState.ab;
            dailyRituals.claimTask('claim_test');
            expect(gameState.ab).toBe(initialAB + 100);
        });

        test('should add task to claimed list', () => {
            dailyRituals.claimTask('claim_test');
            expect(dailyRituals.claimedTasks).toContain('claim_test');
        });
    });

    describe('EK Fragments', () => {
        test('should grant EK fragments', () => {
            dailyRituals.grantEkFragments(3);
            expect(dailyRituals.ekFragments).toBe(3);
        });

        test('should convert 5 fragments to 1 EK', () => {
            const initialEK = gameState.prestigePoints;
            dailyRituals.grantEkFragments(5);

            expect(dailyRituals.ekFragments).toBe(0);
            expect(gameState.prestigePoints).toBe(initialEK + 1);
        });

        test('should handle partial fragments', () => {
            const initialEK = gameState.prestigePoints;
            dailyRituals.grantEkFragments(7);

            expect(dailyRituals.ekFragments).toBe(2);
            expect(gameState.prestigePoints).toBe(initialEK + 1);
        });

        test('should convert multiple sets of 5 fragments', () => {
            const initialEK = gameState.prestigePoints;
            dailyRituals.grantEkFragments(13);

            expect(dailyRituals.ekFragments).toBe(3);
            expect(gameState.prestigePoints).toBe(initialEK + 2);
        });
    });

    describe('Save and Load', () => {
        test('should save state', () => {
            dailyRituals.currentDayKey = '2025-01-01';
            dailyRituals.activeTasks = [{ id: 'task1' }, { id: 'task2' }];
            dailyRituals.taskProgress = { task1: 5 };
            dailyRituals.claimedTasks = ['task2'];
            dailyRituals.ekFragments = 3;

            const saved = dailyRituals.saveState();

            expect(saved.dayKey).toBe('2025-01-01');
            expect(saved.activeIds).toEqual(['task1', 'task2']);
            expect(saved.progress).toEqual({ task1: 5 });
            expect(saved.claimed).toEqual(['task2']);
            expect(saved.ekFragments).toBe(3);
        });

        test('should load state', () => {
            const today = dailyRituals.getDayKey();
            const savedData = {
                dayKey: today, // Use today to avoid refresh
                activeIds: [],
                progress: { task1: 10 },
                claimed: ['task1'],
                ekFragments: 2
            };

            dailyRituals.loadState(savedData);

            expect(dailyRituals.currentDayKey).toBe(today);
            expect(dailyRituals.taskProgress).toEqual({ task1: 10 });
            expect(dailyRituals.claimedTasks).toEqual(['task1']);
            expect(dailyRituals.ekFragments).toBe(2);
        });

        test('should reconstruct active tasks from IDs', () => {
            // Assuming task pool has some tasks
            if (dailyRituals.taskPool.length > 0) {
                const today = dailyRituals.getDayKey();
                const taskId = dailyRituals.taskPool[0].id;
                const savedData = {
                    dayKey: today, // Use today to avoid refresh
                    activeIds: [taskId],
                    progress: {},
                    claimed: []
                };

                dailyRituals.loadState(savedData);

                expect(dailyRituals.activeTasks.length).toBe(1);
                expect(dailyRituals.activeTasks[0].id).toBe(taskId);
            }
        });

        test('should handle missing data gracefully', () => {
            const savedData = {};

            expect(() => {
                dailyRituals.loadState(savedData);
            }).not.toThrow();

            expect(dailyRituals.taskProgress).toEqual({});
            expect(dailyRituals.claimedTasks).toEqual([]);
        });
    });
});
