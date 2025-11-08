/**
 * Unit tests for cloudSave.js
 * Tests cloud save synchronization, conflict resolution, and data management
 */

import { CloudSaveSystem } from '../../js/cloudSave.js';
import { GameState } from '../../js/gameState.js';

describe('Cloud Save System', () => {
  let cloudSave;
  let gameState;
  let originalDateNow;

  beforeEach(() => {
    localStorage.clear();
    gameState = new GameState();
    gameState.milestones = [];

    originalDateNow = Date.now;

    // Create cloudSave but don't let it start syncing
    cloudSave = new CloudSaveSystem(gameState);
    cloudSave.isOnline = false; // Prevent auto-sync during tests
  });

  afterEach(() => {
    Date.now = originalDateNow;
    if (gameState && gameState.tickInterval) {
      clearInterval(gameState.tickInterval);
    }
  });

  describe('Initialization', () => {
    test('should create cloud save system', () => {
      expect(cloudSave).toBeDefined();
      expect(cloudSave.gameState).toBe(gameState);
    });

    test('should generate or retrieve device ID', () => {
      expect(cloudSave.deviceId).toBeDefined();
      expect(typeof cloudSave.deviceId).toBe('string');
      expect(cloudSave.deviceId.length).toBeGreaterThan(0);
    });

    test('should persist device ID across instances', () => {
      const firstId = cloudSave.deviceId;
      const newCloudSave = new CloudSaveSystem(gameState);

      expect(newCloudSave.deviceId).toBe(firstId);
    });

    test('should initialize with offline status if navigator offline', () => {
      expect(typeof cloudSave.isOnline).toBe('boolean');
    });

    test('should initialize sync state', () => {
      expect(cloudSave.syncInProgress).toBe(false);
      expect(cloudSave.pendingSync).toBe(false);
      expect(cloudSave.lastSyncTime).toBe(0);
    });
  });

  describe('Device ID Management', () => {
    test('should create new device ID if none exists', () => {
      localStorage.removeItem('cyberWitchesDeviceId');
      const deviceId = cloudSave.getOrCreateDeviceId();

      expect(deviceId).toBeDefined();
      expect(deviceId.startsWith('device_')).toBe(true);
    });

    test('should store device ID in localStorage', () => {
      localStorage.removeItem('cyberWitchesDeviceId');
      const deviceId = cloudSave.getOrCreateDeviceId();

      const stored = localStorage.getItem('cyberWitchesDeviceId');
      expect(stored).toBe(deviceId);
    });

    test('should generate unique device IDs', () => {
      localStorage.removeItem('cyberWitchesDeviceId');
      const id1 = cloudSave.getOrCreateDeviceId();

      localStorage.removeItem('cyberWitchesDeviceId');
      const id2 = cloudSave.getOrCreateDeviceId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('Save Data Collection', () => {
    test('should collect save data', () => {
      const saveData = cloudSave.collectSaveData();

      expect(saveData).toBeDefined();
      expect(saveData.version).toBe('1.0');
      expect(saveData.timestamp).toBeGreaterThan(0);
      expect(saveData.deviceId).toBe(cloudSave.deviceId);
    });

    test('should include game state in save data', () => {
      const saveData = cloudSave.collectSaveData();

      expect(saveData.gameState).toBeDefined();
      expect(typeof saveData.gameState).toBe('object');
    });

    test('should extract game state correctly', () => {
      gameState.ab = 1000;
      gameState.prestigePoints = 5;

      const extracted = cloudSave.extractGameState();

      expect(extracted.ab).toBe(1000);
      expect(extracted.prestigePoints).toBe(5);
    });

    test('should handle missing optional data', () => {
      const achievementData = cloudSave.extractAchievementData();
      expect(achievementData).toBeDefined();
    });

    test('should extract coven data safely', () => {
      const covenData = cloudSave.extractCovenData();
      expect(covenData).toBeDefined();
    });

    test('should extract event data safely', () => {
      const eventData = cloudSave.extractEventData();
      expect(eventData).toBeDefined();
    });
  });

  describe('Sync Attempt Logic', () => {
    test('should not sync when offline', async () => {
      cloudSave.isOnline = false;
      const result = await cloudSave.attemptSync();

      expect(result).toBe(false);
    });

    test('should not sync when sync in progress', async () => {
      cloudSave.isOnline = true;
      cloudSave.syncInProgress = true;
      const result = await cloudSave.attemptSync();

      expect(result).toBe(false);
    });

    test('should handle sync start callback', async () => {
      cloudSave.isOnline = true;
      let callbackCalled = false;
      cloudSave.onSyncStarted = () => { callbackCalled = true; };

      // Mock download to fail quickly
      cloudSave.downloadCloudSave = async () => null;
      cloudSave.uploadCloudSave = async () => true;

      await cloudSave.attemptSync();

      expect(callbackCalled).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should validate save data structure', () => {
      const saveData = cloudSave.collectSaveData();

      expect(saveData.version).toBeDefined();
      expect(saveData.timestamp).toBeDefined();
      expect(saveData.deviceId).toBeDefined();
    });

    test('should include all required fields', () => {
      const saveData = cloudSave.collectSaveData();

      expect(saveData.gameState).toBeDefined();
      expect(saveData.covenData).toBeDefined();
      expect(saveData.achievementData).toBeDefined();
    });
  });

  describe('Conflict Resolution', () => {
    test('should have conflict resolution method', () => {
      expect(typeof cloudSave.resolveSaveConflict).toBe('function');
    });

    test('should resolve conflict between saves', () => {
      const localSave = {
        version: '1.0',
        timestamp: 1000,
        gameState: { ab: 100 }
      };

      const remoteSave = {
        version: '1.0',
        timestamp: 2000,
        gameState: { ab: 200 }
      };

      expect(() => {
        cloudSave.resolveSaveConflict(localSave, remoteSave);
      }).not.toThrow();
    });

    test('should handle missing timestamps in conflict resolution', () => {
      const localSave = { version: '1.0', gameState: { ab: 100 } };
      const remoteSave = { version: '1.0', gameState: { ab: 200 } };

      expect(() => {
        cloudSave.resolveSaveConflict(localSave, remoteSave);
      }).not.toThrow();
    });
  });

  describe('Data Application', () => {
    test('should have apply data method', () => {
      expect(typeof cloudSave.applySaveData).toBe('function');
    });

    test('should handle save data application', () => {
      const saveData = {
        version: '1.0',
        timestamp: Date.now(),
        deviceId: 'test',
        gameState: { ab: 5000 }
      };

      expect(() => {
        cloudSave.applySaveData(saveData);
      }).not.toThrow();
    });

    test('should handle missing game state data gracefully', () => {
      const saveData = {
        version: '1.0',
        timestamp: Date.now()
      };

      expect(() => {
        cloudSave.applySaveData(saveData);
      }).not.toThrow();
    });
  });
});
