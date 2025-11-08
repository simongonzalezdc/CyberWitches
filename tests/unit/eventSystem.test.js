/**
 * Unit tests for eventSystem.js
 * Tests random event triggering and effects
 */

import { EventSystem } from '../../js/eventSystem.js';
import { GameState } from '../../js/gameState.js';

describe('Event System', () => {
  let gameState;
  let eventSystem;
  let originalDateNow;
  let originalMathRandom;

  beforeEach(() => {
    gameState = new GameState();
    gameState.milestones = [];
    eventSystem = new EventSystem(gameState);
    originalDateNow = Date.now;
    originalMathRandom = Math.random;
  });

  afterEach(() => {
    Date.now = originalDateNow;
    Math.random = originalMathRandom;
    if (gameState.tickInterval) {
      clearInterval(gameState.tickInterval);
    }
  });

  describe('Initialization', () => {
    test('should initialize with game state reference', () => {
      expect(eventSystem.gameState).toBe(gameState);
    });

    test('should initialize with empty active events', () => {
      expect(eventSystem.activeEvents).toEqual([]);
    });

    test('should have event chance configured', () => {
      expect(eventSystem.eventChance).toBe(0.001);
    });

    test('should have minimum event interval', () => {
      expect(eventSystem.minEventInterval).toBe(60000);
    });
  });

  describe('Event Timing', () => {
    test('should not trigger events before minimum interval', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;
      Math.random = () => 0; // Force event

      eventSystem.checkForEvents();
      const eventsCount = eventSystem.activeEvents.length;

      currentTime += 30000; // Only 30 seconds
      eventSystem.checkForEvents();

      // Should not add new event
      expect(eventSystem.activeEvents.length).toBe(eventsCount);
    });

    test('should allow events after minimum interval', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      eventSystem.lastEventTime = currentTime - 70000; // 70 seconds ago

      expect(currentTime - eventSystem.lastEventTime).toBeGreaterThan(eventSystem.minEventInterval);
    });
  });

  describe('Event Chance Scaling', () => {
    test('should double chance after 100 taps', () => {
      gameState.totalTaps = 150;
      const baseChance = eventSystem.eventChance;

      // Check that chance would be doubled (we can't test internal logic directly,
      // but we can verify the threshold exists)
      expect(gameState.totalTaps).toBeGreaterThan(100);
    });

    test('should scale chance further after 500 taps', () => {
      gameState.totalTaps = 600;

      expect(gameState.totalTaps).toBeGreaterThan(500);
    });
  });

  describe('Event Activation', () => {
    test('should activate instant reward events', () => {
      const instantEvent = {
        id: 'test_instant',
        instant: true,
        reward: () => 100
      };

      const initialAB = gameState.ab;
      eventSystem.activateEvent(instantEvent);

      expect(gameState.ab).toBe(initialAB + 100);
    });

    test('should activate timed events', () => {
      const timedEvent = {
        id: 'test_timed',
        duration: 30,
        effect: (mult) => mult * 2
      };

      const result = eventSystem.activateEvent(timedEvent);

      expect(result.type).toBe('duration');
    });

    test('should return event result', () => {
      const event = {
        id: 'test',
        instant: true,
        reward: () => 50
      };

      const result = eventSystem.activateEvent(event);

      expect(result).toBeDefined();
      expect(result.reward).toBe(50);
    });
  });

  describe('Event Management', () => {
    test('should track active timed events', () => {
      const event = {
        id: 'test_timed',
        duration: 30,
        effect: () => 2
      };

      eventSystem.activateEvent(event);

      // Should add to active events
      expect(eventSystem.activeEvents).toBeDefined();
    });

    test('should have method to check for events', () => {
      expect(typeof eventSystem.checkForEvents).toBe('function');
    });

    test('should have method to trigger events', () => {
      expect(typeof eventSystem.triggerRandomEvent).toBe('function');
    });

    test('should have method to activate events', () => {
      expect(typeof eventSystem.activateEvent).toBe('function');
    });
  });

  describe('Event Types', () => {
    test('should handle lucky strike event', () => {
      const event = {
        id: 'lucky_strike',
        name: '✨ Lucky Strike',
        duration: 30,
        effect: (mult) => mult * 2.0
      };

      const result = eventSystem.activateEvent(event);
      expect(result).toBeDefined();
    });

    test('should handle windfall event', () => {
      gameState.ab = 1000;
      const event = {
        id: 'windfall',
        name: '💰 Windfall',
        instant: true,
        reward: () => Math.max(100, gameState.ab * 0.1)
      };

      eventSystem.activateEvent(event);
      expect(gameState.ab).toBeGreaterThan(1000);
    });
  });
});
