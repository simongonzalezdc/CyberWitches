/**
 * Unit tests for balanceAnalytics.js
 * Tests balance tracking and metrics collection
 */

import balanceAnalyticsManager from '../../js/balanceAnalytics.js';
import { GameState } from '../../js/gameState.js';
import { PRODUCERS } from '../../js/data.js';

describe('Balance Analytics', () => {
  let gameState;
  let originalGameState;
  let originalProducers;

  beforeEach(() => {
    gameState = new GameState();
    gameState.milestones = [];

    // Save originals
    originalGameState = window.gameState;
    originalProducers = window.PRODUCERS;

    // Set globals for tests
    window.gameState = gameState;
    window.PRODUCERS = PRODUCERS;

    // Reset metrics
    balanceAnalyticsManager.metrics = {
      resourceGeneration: {},
      progressionSpeed: {},
      costScaling: {}
    };
  });

  afterEach(() => {
    // Restore originals
    window.gameState = originalGameState;
    window.PRODUCERS = originalProducers;

    if (gameState && gameState.tickInterval) {
      clearInterval(gameState.tickInterval);
    }
  });

  describe('Initialization', () => {
    test('should have balance analytics manager', () => {
      expect(balanceAnalyticsManager).toBeDefined();
    });

    test('should initialize with empty metrics', () => {
      expect(balanceAnalyticsManager.metrics).toBeDefined();
      expect(balanceAnalyticsManager.metrics.resourceGeneration).toBeDefined();
      expect(balanceAnalyticsManager.metrics.progressionSpeed).toBeDefined();
      expect(balanceAnalyticsManager.metrics.costScaling).toBeDefined();
    });

    test('should have getMetrics method', () => {
      expect(typeof balanceAnalyticsManager.getMetrics).toBe('function');
    });
  });

  describe('Metrics Collection', () => {
    test('should collect metrics when gameState exists', () => {
      expect(() => {
        balanceAnalyticsManager.collectMetrics();
      }).not.toThrow();
    });

    test('should not error when gameState is null', () => {
      window.gameState = null;

      expect(() => {
        balanceAnalyticsManager.collectMetrics();
      }).not.toThrow();
    });

    test('should get metrics object', () => {
      const metrics = balanceAnalyticsManager.getMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('ABPS Calculation', () => {
    test('should calculate ABPS with no workstations', () => {
      gameState.workstations = {};

      const abps = balanceAnalyticsManager.calculateABPS();

      expect(abps).toBe(0);
    });

    test('should calculate ABPS with workstations', () => {
      // Find a producer that generates AB
      const producer = PRODUCERS.find(p => p.production && p.production.ab);

      if (producer) {
        gameState.workstations[producer.id] = 5;

        const abps = balanceAnalyticsManager.calculateABPS();

        expect(abps).toBeGreaterThan(0);
        expect(abps).toBe(producer.production.ab * 5);
      }
    });

    test('should return 0 when gameState is null', () => {
      window.gameState = null;

      const abps = balanceAnalyticsManager.calculateABPS();

      expect(abps).toBe(0);
    });

    test('should return 0 when PRODUCERS is null', () => {
      window.PRODUCERS = null;

      const abps = balanceAnalyticsManager.calculateABPS();

      expect(abps).toBe(0);
    });

    test('should sum ABPS from multiple workstations', () => {
      // Find producers that generate AB
      const abProducers = PRODUCERS.filter(p => p.production && p.production.ab);

      if (abProducers.length >= 2) {
        gameState.workstations[abProducers[0].id] = 3;
        gameState.workstations[abProducers[1].id] = 2;

        const abps = balanceAnalyticsManager.calculateABPS();

        const expected = (abProducers[0].production.ab * 3) +
                        (abProducers[1].production.ab * 2);
        expect(abps).toBe(expected);
      }
    });
  });

  describe('Element PS Calculation', () => {
    test('should calculate element PS with no workstations', () => {
      gameState.workstations = {};

      const firePS = balanceAnalyticsManager.calculateElementPS('fire');

      expect(firePS).toBe(0);
    });

    test('should calculate element PS with workstations', () => {
      // Find a producer that generates fire
      const producer = PRODUCERS.find(p => p.production && p.production.fire);

      if (producer) {
        gameState.workstations[producer.id] = 4;

        const firePS = balanceAnalyticsManager.calculateElementPS('fire');

        expect(firePS).toBeGreaterThan(0);
        expect(firePS).toBe(producer.production.fire * 4);
      }
    });

    test('should return 0 for element with no production', () => {
      const ps = balanceAnalyticsManager.calculateElementPS('nonexistent');

      expect(ps).toBe(0);
    });

    test('should return 0 when gameState is null', () => {
      window.gameState = null;

      const ps = balanceAnalyticsManager.calculateElementPS('fire');

      expect(ps).toBe(0);
    });

    test('should return 0 when PRODUCERS is null', () => {
      window.PRODUCERS = null;

      const ps = balanceAnalyticsManager.calculateElementPS('fire');

      expect(ps).toBe(0);
    });

    test('should sum element PS from multiple workstations', () => {
      // Find producers that generate water
      const waterProducers = PRODUCERS.filter(p => p.production && p.production.water);

      if (waterProducers.length >= 2) {
        gameState.workstations[waterProducers[0].id] = 2;
        gameState.workstations[waterProducers[1].id] = 3;

        const waterPS = balanceAnalyticsManager.calculateElementPS('water');

        const expected = (waterProducers[0].production.water * 2) +
                        (waterProducers[1].production.water * 3);
        expect(waterPS).toBe(expected);
      }
    });
  });

  describe('Next Cost Calculation', () => {
    test('should calculate next cost for producer', () => {
      const producer = PRODUCERS.find(p => p.recipe && p.growth);

      if (producer) {
        const nextCost = balanceAnalyticsManager.calculateNextCost(producer, 0);

        expect(nextCost).toBeGreaterThan(0);
      }
    });

    test('should scale cost with ownership', () => {
      const producer = PRODUCERS.find(p => p.recipe && p.growth);

      if (producer) {
        const cost0 = balanceAnalyticsManager.calculateNextCost(producer, 0);
        const cost5 = balanceAnalyticsManager.calculateNextCost(producer, 5);

        expect(cost5).toBeGreaterThan(cost0);
      }
    });

    test('should return 0 when no recipe', () => {
      const producer = { id: 'test', growth: 1.1 };

      const cost = balanceAnalyticsManager.calculateNextCost(producer, 0);

      expect(cost).toBe(0);
    });

    test('should return 0 when no growth', () => {
      const producer = { id: 'test', recipe: { fire: 10 } };

      const cost = balanceAnalyticsManager.calculateNextCost(producer, 0);

      expect(cost).toBe(0);
    });

    test('should sum all ingredient costs', () => {
      const producer = {
        id: 'test',
        recipe: { fire: 10, water: 5 },
        growth: 1.1
      };

      const cost = balanceAnalyticsManager.calculateNextCost(producer, 0);

      // At owned=0, cost should be Math.ceil(10 * 1.1^0) + Math.ceil(5 * 1.1^0) = 10 + 5 = 15
      expect(cost).toBe(15);
    });
  });

  describe('Resource Generation Tracking', () => {
    test('should track resource generation', () => {
      expect(() => {
        balanceAnalyticsManager.trackResourceGeneration();
      }).not.toThrow();
    });

    test('should not error when gameState is null', () => {
      window.gameState = null;

      expect(() => {
        balanceAnalyticsManager.trackResourceGeneration();
      }).not.toThrow();
    });

    test('should store metrics with timestamp', () => {
      balanceAnalyticsManager.trackResourceGeneration();

      const timestamps = Object.keys(balanceAnalyticsManager.metrics.resourceGeneration);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });

  describe('Progression Speed Tracking', () => {
    test('should track progression speed', () => {
      expect(() => {
        balanceAnalyticsManager.trackProgressionSpeed();
      }).not.toThrow();
    });

    test('should not error when gameState is null', () => {
      window.gameState = null;

      expect(() => {
        balanceAnalyticsManager.trackProgressionSpeed();
      }).not.toThrow();
    });

    test('should track AB value', () => {
      gameState.ab = 1000;
      balanceAnalyticsManager.trackProgressionSpeed();

      const timestamps = Object.keys(balanceAnalyticsManager.metrics.progressionSpeed);
      const latestMetrics = balanceAnalyticsManager.metrics.progressionSpeed[timestamps[timestamps.length - 1]];

      expect(latestMetrics.ab).toBe(1000);
    });

    test('should track prestige count', () => {
      gameState.prestigeCount = 5;
      balanceAnalyticsManager.trackProgressionSpeed();

      const timestamps = Object.keys(balanceAnalyticsManager.metrics.progressionSpeed);
      const latestMetrics = balanceAnalyticsManager.metrics.progressionSpeed[timestamps[timestamps.length - 1]];

      expect(latestMetrics.prestigeCount).toBe(5);
    });
  });

  describe('Cost Scaling Tracking', () => {
    test('should track cost scaling', () => {
      expect(() => {
        balanceAnalyticsManager.trackCostScaling();
      }).not.toThrow();
    });

    test('should not error when gameState is null', () => {
      window.gameState = null;

      expect(() => {
        balanceAnalyticsManager.trackCostScaling();
      }).not.toThrow();
    });

    test('should not error when PRODUCERS is null', () => {
      window.PRODUCERS = null;

      expect(() => {
        balanceAnalyticsManager.trackCostScaling();
      }).not.toThrow();
    });
  });

  describe('Global Functions', () => {
    test('should have getBalanceMetrics global function', () => {
      expect(typeof window.getBalanceMetrics).toBe('function');
    });

    test('getBalanceMetrics should return metrics', () => {
      const metrics = window.getBalanceMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });
});
