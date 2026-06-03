/**
 * @jest-environment jsdom
 *
 * Regression tests for save-recovery behavior in GameState.loadGameState().
 *
 * Previously, a corrupt or un-migratable save was discarded with only a
 * console.warn — no backup on some paths and no signal to the player. These
 * tests lock in the observable contract: a bad save is NEVER loaded as game
 * state, and the original bytes are ALWAYS preserved under a backup key so the
 * player's progress is recoverable.
 */

import { GameState } from '../../js/gameState.js';

// Match the lightweight global-mock style used by the other GameState tests.
global.handleError = () => {};
global.showLoadingState = () => null;
global.hideLoadingState = () => {};
global.showNotification = () => {};
global.WORKSTATIONS = [];
global.UPGRADES = [];
global.INGREDIENTS = [];
global.PRESTIGE_BONUSES = [];
global.HIDDEN_RECIPES = [];

const SAVE_KEY = 'cyberWitchesSave';

function backupKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k !== SAVE_KEY && k.startsWith('cyberWitchesSave')) keys.push(k);
  }
  return keys;
}

describe('GameState.loadGameState save recovery', () => {
  let gameState;

  beforeEach(() => {
    localStorage.clear();
    gameState = new GameState();
  });

  test('does nothing destructive when there is no save', () => {
    expect(() => gameState.loadGameState()).not.toThrow();
    expect(gameState.ab).toBe(0);
    expect(backupKeys()).toHaveLength(0);
  });

  test('corrupt (unparseable) save is not loaded and is backed up', () => {
    localStorage.setItem(SAVE_KEY, '{ this is not valid json ');
    gameState.loadGameState();

    // Garbage must not become game state.
    expect(gameState.ab).toBe(0);
    // The original bytes must be preserved for recovery.
    expect(backupKeys().length).toBeGreaterThan(0);
  });

  test('structurally invalid save (valid JSON, bad shape) is rejected and backed up', () => {
    // Valid JSON, but not a valid save: negative currency must fail validation.
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ version: '2.1', ab: -5, timestamp: Date.now() / 1000 })
    );
    gameState.loadGameState();

    expect(gameState.ab).toBe(0);
    expect(backupKeys().length).toBeGreaterThan(0);
  });

  test('a well-formed save still loads normally (recovery does not block valid saves)', () => {
    const good = {
      version: '2.1',
      ab: 1234,
      abTotalEarned: 1234,
      timestamp: Date.now() / 1000,
    };
    good.checksum = gameState.calculateChecksum(good);
    localStorage.setItem(SAVE_KEY, JSON.stringify(good));

    gameState.loadGameState();

    expect(gameState.ab).toBe(1234);
    // A valid load must not spray backup keys.
    expect(backupKeys()).toHaveLength(0);
  });
});
