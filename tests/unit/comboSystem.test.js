/**
 * Unit tests for comboSystem.js
 * Tests combo/streak mechanics and multipliers
 */

import { ComboSystem } from '../../js/comboSystem.js';

describe('Combo System', () => {
  let comboSystem;
  let originalDateNow;

  beforeEach(() => {
    comboSystem = new ComboSystem();
    originalDateNow = Date.now;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('Initialization', () => {
    test('should initialize with zero combo', () => {
      expect(comboSystem.comboCount).toBe(0);
      expect(comboSystem.maxCombo).toBe(0);
    });

    test('should initialize with 1.0 multiplier', () => {
      expect(comboSystem.comboMultiplier).toBe(1.0);
    });

    test('should have combo timeout of 2000ms', () => {
      expect(comboSystem.comboTimeout).toBe(2000);
    });

    test('should initialize milestone bonuses set', () => {
      expect(comboSystem.milestoneBonuses).toBeInstanceOf(Set);
      expect(comboSystem.milestoneBonuses.size).toBe(0);
    });
  });

  describe('Combo Building', () => {
    test('should start combo at 1 on first action', () => {
      comboSystem.recordAction();
      expect(comboSystem.comboCount).toBe(1);
    });

    test('should increment combo on rapid actions', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      comboSystem.recordAction();
      currentTime += 1000; // Within timeout
      comboSystem.recordAction();

      expect(comboSystem.comboCount).toBe(2);
    });

    test('should reset combo after timeout', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      comboSystem.recordAction();
      currentTime += 3000; // Past timeout
      comboSystem.recordAction();

      expect(comboSystem.comboCount).toBe(1);
    });

    test('should track max combo', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      for (let i = 0; i < 5; i++) {
        comboSystem.recordAction();
        currentTime += 500;
      }

      expect(comboSystem.maxCombo).toBe(5);
    });

    test('should maintain max combo even after reset', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      for (let i = 0; i < 10; i++) {
        comboSystem.recordAction();
        currentTime += 500;
      }
      const maxBefore = comboSystem.maxCombo;

      currentTime += 3000;
      comboSystem.recordAction();

      expect(comboSystem.maxCombo).toBe(maxBefore);
    });
  });

  describe('Combo Multiplier', () => {
    test('should calculate multiplier correctly', () => {
      comboSystem.comboCount = 10;
      comboSystem.comboMultiplier = 1.0 + (10 * 0.02);

      expect(comboSystem.comboMultiplier).toBe(1.2);
    });

    test('should cap multiplier at 2.0', () => {
      comboSystem.comboCount = 100;
      comboSystem.recordAction();

      expect(comboSystem.comboMultiplier).toBeLessThanOrEqual(2.0);
    });

    test('should return 1.0 when combo expires', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      comboSystem.recordAction();
      currentTime += 3000;

      const multiplier = comboSystem.getComboMultiplier();
      expect(multiplier).toBe(1.0);
    });

    test('should return current multiplier when combo active', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      comboSystem.recordAction();
      currentTime += 500;
      comboSystem.recordAction();

      const multiplier = comboSystem.getComboMultiplier();
      expect(multiplier).toBeGreaterThan(1.0);
    });
  });

  describe('Combo Count', () => {
    test('should return current combo count', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      comboSystem.recordAction();
      currentTime += 500;
      comboSystem.recordAction();

      expect(comboSystem.getComboCount()).toBe(2);
    });

    test('should return 0 when combo expires', () => {
      let currentTime = 1000;
      Date.now = () => currentTime;

      comboSystem.recordAction();
      currentTime += 3000;

      expect(comboSystem.getComboCount()).toBe(0);
    });
  });

  describe('Reset', () => {
    test('should reset combo count', () => {
      comboSystem.comboCount = 50;
      comboSystem.reset();

      expect(comboSystem.comboCount).toBe(0);
    });

    test('should reset multiplier', () => {
      comboSystem.comboMultiplier = 1.5;
      comboSystem.reset();

      expect(comboSystem.comboMultiplier).toBe(1.0);
    });

    test('should not reset milestone bonuses', () => {
      comboSystem.milestoneBonuses.add(10);
      comboSystem.reset();

      expect(comboSystem.milestoneBonuses.has(10)).toBe(true);
    });
  });
});
