/**
 * Headless, deterministic tests for the meditation tower-defense simulation.
 *
 * MeditationState is the simulation core (no canvas/DOM). The only obstacles to
 * deterministic testing were wall-clock reads and Math.random; both are now
 * injectable via the constructor's `options`. These tests drive the sim with a
 * controlled clock + seeded RNG and assert on plain state — the canvas renderer
 * is a separate, read-only view of exactly this state.
 */
import { describe, test, expect } from '@jest/globals';
import { MeditationState } from '../../js/meditationState.js';

// A controllable clock: tests advance `clock.t` (ms) and the sim sees only that.
function makeSim(opts = {}) {
    const clock = { t: 0 };
    const gameState = {
        inventory: {
            fire_essence: 1e6, water_essence: 1e6, air_essence: 1e6,
            crystal_dust: 1e6, dist_fire: 1e6, dig_candle: 1e6, shaped_crys: 1e6
        },
        spendIngredient(id, n) { this.inventory[id] = (this.inventory[id] || 0) - n; }
    };
    const sim = new MeditationState(gameState, {
        now: () => clock.t,
        random: opts.random || (() => 0), // always pick index 0 -> deterministic spawns
    });
    sim.lastTickTime = 0;
    return { sim, clock, gameState };
}

// Advance the injected clock by `ms` and run one sim tick.
function tickBy(sim, clock, ms) {
    clock.t += ms;
    sim.tick();
}

// A compact, comparable snapshot of the simulation state.
function snapshot(sim) {
    return JSON.stringify({
        focus: sim.focus.toFixed(6),
        tranquility: sim.tranquility.toFixed(6),
        currentWave: sim.currentWave,
        waveActive: sim.waveActive,
        spawned: sim.waveDistractionsSpawned,
        killed: sim.totalDistractionsKilled,
        distractions: sim.distractions.map(d => ({
            h: d.health.toFixed(4), x: d.x.toFixed(4), y: d.y.toFixed(4)
        }))
    });
}

describe('MeditationState simulation — determinism', () => {
    test('identical clock + seeded RNG produce identical state (reproducible)', () => {
        const run = () => {
            const { sim, clock } = makeSim();
            sim.startSession();
            // 30 seconds of simulation at 10 Hz.
            for (let i = 0; i < 300; i++) tickBy(sim, clock, 100);
            return snapshot(sim);
        };
        expect(run()).toBe(run());
    });

    test('a different RNG seed changes the outcome (RNG is actually used)', () => {
        const a = (() => { const { sim, clock } = makeSim({ random: () => 0 }); sim.startSession(); for (let i = 0; i < 200; i++) tickBy(sim, clock, 100); return snapshot(sim); })();
        const b = (() => { const { sim, clock } = makeSim({ random: () => 0.999 }); sim.startSession(); for (let i = 0; i < 200; i++) tickBy(sim, clock, 100); return snapshot(sim); })();
        expect(a).not.toBe(b);
    });
});

describe('MeditationState simulation — clock injection', () => {
    test('time only advances via the injected clock (no wall-clock leakage)', () => {
        const { sim, clock } = makeSim();
        const f0 = sim.focus;
        // Tick WITHOUT advancing the clock -> zero elapsed -> no passive focus.
        sim.tick();
        expect(sim.focus).toBe(f0);
        // Advance 10s of clock across ticks -> deterministic passive focus gain.
        for (let i = 0; i < 100; i++) tickBy(sim, clock, 100);
        expect(sim.focus).toBeGreaterThan(f0);
        // 0.1 focus/sec * 10s (times a >=1 multiplier) ~ at least ~1.0.
        expect(sim.focus).toBeGreaterThanOrEqual(0.9);
    });
});

describe('MeditationState simulation — wave lifecycle', () => {
    test('startSession schedules wave 1, which begins when the clock reaches it', () => {
        const { sim, clock } = makeSim();
        sim.startSession();
        expect(sim.activeSession).toBe(true);
        expect(sim.currentWave).toBe(0);
        expect(sim.nextWaveStartTime).toBeGreaterThan(clock.t); // scheduled ~2s out

        // Advance ~2.5s -> the queued wave starts deterministically.
        for (let i = 0; i < 25; i++) tickBy(sim, clock, 100);
        expect(sim.currentWave).toBe(1);
        expect(sim.waveActive).toBe(true);
    });

    test('distractions spawn during an active wave', () => {
        const { sim, clock } = makeSim();
        sim.startSession();
        for (let i = 0; i < 60; i++) tickBy(sim, clock, 100); // ~6s: wave 1 + several spawns
        expect(sim.waveDistractionsSpawned).toBeGreaterThan(0);
        expect(sim.distractions.length).toBeGreaterThan(0);
    });
});

describe('MeditationState simulation — combat', () => {
    test('a tower in range damages and kills a distraction', () => {
        const { sim, clock } = makeSim();
        sim.activeSession = true;
        sim.waveActive = true;
        sim.meditationInventory = { serenity_essence: 1e6 }; // fund per-attack cost
        sim.focus = 1e6;

        // Find a non-path tile to place a tower on.
        let gx = -1, gy = -1;
        for (let y = 1; y < sim.gridSize - 1 && gx < 0; y++) {
            for (let x = 1; x < sim.gridSize - 1; x++) {
                if (!sim.pathTiles.has(`${x},${y}`)) { gx = x; gy = y; break; }
            }
        }
        expect(gx).toBeGreaterThanOrEqual(0);
        expect(sim.placeTower('peace_circle', gx, gy)).toBe(true);

        // Inject a stationary distraction adjacent to the tower (within range).
        sim.distractions = [{
            id: 'd', type: 't', health: 30, maxHealth: 30, speed: 0,
            x: gx + 0.5, y: gy + 1.5, damage: 1, reward: { focus: 1 }
        }];
        const killedBefore = sim.totalDistractionsKilled;

        // Tick for a few seconds — the tower should fire repeatedly and kill it.
        for (let i = 0; i < 50; i++) tickBy(sim, clock, 100);

        expect(sim.totalDistractionsKilled).toBe(killedBefore + 1);
        expect(sim.distractions.length).toBe(0);
    });

    test('a distraction reaching the center drains tranquility and can end the session', () => {
        const { sim, clock } = makeSim();
        sim.activeSession = true;
        sim.waveActive = true;
        sim.tranquility = 0.5;
        const center = sim.gridSize / 2 - 0.5;
        sim.distractions = [{ id: 'd', type: 't', health: 100, maxHealth: 100, speed: 0, x: center, y: center, damage: 10 }];

        tickBy(sim, clock, 100); // distraction at center -> tranquility hit -> reaches 0 -> endSession
        expect(sim.tranquility).toBe(0);
        expect(sim.activeSession).toBe(false);
    });
});

describe('MeditationState simulation — tower placement economy', () => {
    test('placeTower fails when ingredients are unaffordable and succeeds when affordable', () => {
        const { sim } = makeSim();
        sim.gameState.inventory = {}; // can't afford anything
        // pick a non-path tile
        let gx = -1, gy = -1;
        for (let y = 1; y < sim.gridSize - 1 && gx < 0; y++) {
            for (let x = 1; x < sim.gridSize - 1; x++) {
                if (!sim.pathTiles.has(`${x},${y}`)) { gx = x; gy = y; break; }
            }
        }
        expect(sim.placeTower('peace_circle', gx, gy)).toBe(false);
        expect(sim.towers.length).toBe(0);

        sim.gameState.inventory = { fire_essence: 100 };
        expect(sim.placeTower('peace_circle', gx, gy)).toBe(true);
        expect(sim.towers.length).toBe(1);
        expect(sim.gameState.inventory.fire_essence).toBeLessThan(100); // ingredients spent
    });
});

describe('MeditationState — reset()', () => {
    // Regression guard: `meditationManager.reset()` delegated to
    // `this.state.reset()`, but the method did not exist — calling it threw
    // "this.state.reset is not a function". reset() must now clear progression
    // in memory AND drop the separate `meditationState` localStorage key.
    test('reset() exists and clears progression + persisted state', () => {
        const { sim, clock } = makeSim();

        // Build up some progression: focus, a tower, persisted save.
        sim.focus = 500;
        sim.focusTotalEarned = 1200;
        sim.totalWavesCompleted = 7;
        sim.totalDistractionsKilled = 42;
        sim.totalSessionsCompleted = 3;
        sim.gameState.inventory = { fire_essence: 100 };
        let gx = -1, gy = -1;
        for (let y = 1; y < sim.gridSize - 1 && gx < 0; y++) {
            for (let x = 1; x < sim.gridSize - 1; x++) {
                if (!sim.pathTiles.has(`${x},${y}`)) { gx = x; gy = y; break; }
            }
        }
        sim.placeTower('peace_circle', gx, gy);
        sim.saveState();
        expect(localStorage.getItem('meditationState')).not.toBeNull();
        expect(sim.towers.length).toBe(1);

        // Reset must not throw and must wipe everything.
        clock.t = 999999;
        expect(() => sim.reset()).not.toThrow();

        expect(sim.focus).toBe(0);
        expect(sim.focusTotalEarned).toBe(0);
        expect(sim.totalWavesCompleted).toBe(0);
        expect(sim.totalDistractionsKilled).toBe(0);
        expect(sim.totalSessionsCompleted).toBe(0);
        expect(sim.towers).toEqual([]);
        expect(sim.distractions).toEqual([]);
        expect(sim.activeSession).toBe(false);
        expect(sim.tranquility).toBe(sim.tranquilityMax);
        // Persisted progression must be gone so it can't resurrect on reload.
        expect(localStorage.getItem('meditationState')).toBeNull();

        // Every grid cell's tower slot must be freed — otherwise placeTower()
        // would reject the previously-used cell forever.
        expect(sim.grid.some(c => c && c.tower)).toBe(false);
        // And the freed cell must be buildable again.
        sim.gameState.inventory = { fire_essence: 100 };
        expect(sim.placeTower('peace_circle', gx, gy)).toBe(true);
        expect(sim.towers.length).toBe(1);
    });
});
