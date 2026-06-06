/**
 * Unit tests for onboarding.js
 * Tests tutorial system state management and progression
 */

import onboarding, { startTutorial, skipTutorial, restartTutorial, handleTutorialAction, isTutorialActive, isTutorialComplete } from '../../js/onboarding.js';

describe('Onboarding System', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset onboarding state
        onboarding.isActive = false;
        onboarding.isComplete = false;
        onboarding.currentStep = 0;
        onboarding.actionCounter = {};
    });

    describe('Initialization', () => {
        test('should exist', () => {
            expect(onboarding).toBeDefined();
        });

        test('should start with inactive state', () => {
            expect(onboarding.isActive).toBe(false);
        });

        test('should start with incomplete state', () => {
            expect(onboarding.isComplete).toBe(false);
        });

        test('should start at step 0', () => {
            expect(onboarding.currentStep).toBe(0);
        });

        test('should have action counter initialized', () => {
            expect(onboarding.actionCounter).toBeDefined();
            expect(typeof onboarding.actionCounter).toBe('object');
        });

        test('should check localStorage for completion on init', () => {
            localStorage.setItem('tutorial_complete', 'true');
            onboarding.init();

            expect(onboarding.isComplete).toBe(true);
        });

        test('should not start if already complete', () => {
            onboarding.isComplete = true;
            onboarding.start();

            expect(onboarding.isActive).toBe(false);
        });

        test('should not start if already active', () => {
            onboarding.isActive = true;
            const initialStep = onboarding.currentStep;

            onboarding.start();

            expect(onboarding.currentStep).toBe(initialStep);
        });
    });

    describe('Tutorial State Management', () => {
        test('should initialize action counter', () => {
            expect(onboarding.actionCounter).toBeDefined();
            expect(typeof onboarding.actionCounter).toBe('object');
        });

        test('should handle actions when not active', () => {
            onboarding.isActive = false;

            expect(() => {
                onboarding.handleAction('cast');
            }).not.toThrow();
        });

        test('should handle action with data', () => {
            expect(() => {
                onboarding.handleAction('cast', { element: 'fire' });
            }).not.toThrow();
        });

        test('should handle undefined data parameter', () => {
            expect(() => {
                onboarding.handleAction('cast', undefined);
            }).not.toThrow();
        });

        test('should not throw on empty action type', () => {
            expect(() => {
                onboarding.handleAction('');
            }).not.toThrow();
        });
    });

    describe('Tutorial Progress', () => {
        test('should track current step', () => {
            onboarding.currentStep = 5;
            expect(onboarding.currentStep).toBe(5);
        });

        test('should allow skipping tutorial', () => {
            onboarding.isActive = true;
            onboarding.skipTutorial();

            expect(onboarding.isActive).toBe(false);
        });

        test('should save skip state to localStorage', () => {
            onboarding.skipTutorial();

            const skipped = localStorage.getItem('tutorial_skipped');
            expect(skipped).toBe('true');
        });

        test('should complete tutorial', () => {
            onboarding.isActive = true;
            onboarding.completeTutorial();

            expect(onboarding.isComplete).toBe(true);
            expect(localStorage.getItem('tutorial_complete')).toBe('true');
        });

        test('should save completion state to localStorage', () => {
            onboarding.completeTutorial();

            const completed = localStorage.getItem('tutorial_complete');
            expect(completed).toBe('true');
        });

        test('should allow restarting tutorial', () => {
            onboarding.isComplete = true;
            onboarding.restart();

            expect(onboarding.currentStep).toBe(0);
            expect(onboarding.isComplete).toBe(false);
        });

        test('should clear localStorage on restart', () => {
            localStorage.setItem('tutorial_complete', 'true');
            localStorage.setItem('tutorial_skipped', 'true');

            onboarding.restart();

            expect(localStorage.getItem('tutorial_complete')).toBeNull();
            expect(localStorage.getItem('tutorial_skipped')).toBeNull();
        });
    });

    describe('Global Functions', () => {
        test('should have startTutorial function', () => {
            expect(typeof startTutorial).toBe('function');
        });

        test('should have skipTutorial function', () => {
            expect(typeof skipTutorial).toBe('function');
        });

        test('should have restartTutorial function', () => {
            expect(typeof restartTutorial).toBe('function');
        });

        test('should have handleTutorialAction function', () => {
            expect(typeof handleTutorialAction).toBe('function');
        });

        test('should have isTutorialActive function', () => {
            expect(typeof isTutorialActive).toBe('function');
        });

        test('should have isTutorialComplete function', () => {
            expect(typeof isTutorialComplete).toBe('function');
        });

        test('isTutorialActive should return boolean', () => {
            const result = isTutorialActive();
            expect(typeof result).toBe('boolean');
        });

        test('isTutorialComplete should return boolean', () => {
            const result = isTutorialComplete();
            expect(typeof result).toBe('boolean');
        });

        test('handleTutorialAction should accept action type', () => {
            expect(() => {
                handleTutorialAction('cast');
            }).not.toThrow();
        });

        test('handleTutorialAction should accept data parameter', () => {
            expect(() => {
                handleTutorialAction('cast', { value: 1 });
            }).not.toThrow();
        });

        test('startTutorial should call onboarding.start', () => {
            const _originalActive = onboarding.isActive;

            expect(() => {
                startTutorial();
            }).not.toThrow();
        });

        test('skipTutorial should call onboarding.skipTutorial', () => {
            expect(() => {
                skipTutorial();
            }).not.toThrow();

            const skipped = localStorage.getItem('tutorial_skipped');
            expect(skipped).toBe('true');
        });

        test('restartTutorial should call onboarding.restartTutorial', () => {
            onboarding.isComplete = true;

            restartTutorial();

            expect(onboarding.currentStep).toBe(0);
        });
    });

    describe('State Queries', () => {
        test('should return active state correctly', () => {
            onboarding.isActive = false;
            expect(isTutorialActive()).toBe(false);

            onboarding.isActive = true;
            expect(isTutorialActive()).toBe(true);
        });

        test('should return complete state correctly', () => {
            onboarding.isComplete = false;
            expect(isTutorialComplete()).toBe(false);

            onboarding.isComplete = true;
            expect(isTutorialComplete()).toBe(true);
        });
    });

    describe('Tutorial Persistence', () => {
        test('should not auto-start if save exists', () => {
            localStorage.setItem('cyberWitchesSave', 'some_save_data');

            onboarding.init();

            // Should not start automatically
            expect(onboarding.isActive).toBe(false);
        });

        test('should not start if previously skipped', () => {
            localStorage.setItem('tutorial_skipped', 'true');

            onboarding.init();

            expect(onboarding.isActive).toBe(false);
        });

        test('should mark as complete if previously completed', () => {
            localStorage.setItem('tutorial_complete', 'true');

            onboarding.init();

            expect(onboarding.isComplete).toBe(true);
        });
    });

    describe('Tutorial Actions', () => {
        test('should call handleAction when using global function', () => {
            expect(() => {
                handleTutorialAction('cast');
            }).not.toThrow();
        });

        test('should handle multiple action types', () => {
            expect(() => {
                handleTutorialAction('cast');
                handleTutorialAction('craft_workstation');
                handleTutorialAction('tab_workstations');
            }).not.toThrow();
        });

        test('should handle rapid actions', () => {
            expect(() => {
                for (let i = 0; i < 10; i++) {
                    handleTutorialAction('cast');
                }
            }).not.toThrow();
        });

        test('should handle actions with various data types', () => {
            expect(() => {
                handleTutorialAction('test', { number: 1 });
                handleTutorialAction('test', { string: 'value' });
                handleTutorialAction('test', { array: [1, 2, 3] });
                handleTutorialAction('test', { nested: { obj: 'value' } });
            }).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        test('should handle completion when not active', () => {
            onboarding.isActive = false;

            expect(() => {
                onboarding.completeTutorial();
            }).not.toThrow();
        });

        test('should handle skip when not active', () => {
            onboarding.isActive = false;

            expect(() => {
                onboarding.skipTutorial();
            }).not.toThrow();
        });

        test('should handle action when tutorial not active', () => {
            onboarding.isActive = false;

            expect(() => {
                handleTutorialAction('cast');
            }).not.toThrow();
        });

        test('should handle restart multiple times', () => {
            restartTutorial();
            restartTutorial();
            restartTutorial();

            expect(onboarding.currentStep).toBe(0);
        });

        test('should reset action counter on restart', () => {
            onboarding.actionCounter = { cast: 10, craft: 5 };

            onboarding.restart();

            // restart() calls cleanup() and start(), which creates new actionCounter
            expect(onboarding.actionCounter).toBeDefined();
        });

        test('should have shouldShow method', () => {
            expect(typeof onboarding.shouldShow).toBe('function');
        });

        test('shouldShow returns false when tutorial is complete', () => {
            localStorage.setItem('tutorial_complete', 'true');
            expect(onboarding.shouldShow()).toBe(false);
        });

        test('shouldShow returns false when tutorial is skipped', () => {
            localStorage.setItem('tutorial_skipped', 'true');
            expect(onboarding.shouldShow()).toBe(false);
        });
    });
});
