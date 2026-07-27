/**
 * Live integration: GameState cast/fade go through Kernel (no dual write).
 */
import { GameState } from '../../js/gameState.js';
import { castOnGameState, fadeOnGameState, meditationOnGameState } from '../../js/kernel/adapter.js';
import { offlineTickOnGameState, WORKER_DT_THRESHOLD_SEC } from '../../js/kernel/tickWorkerHost.js';
import { projectorsFromGameState } from '../../js/kernel/adapter.js';

describe('Kernel live integration', () => {
    /** @type {GameState} */
    let gs;

    beforeEach(() => {
        gs = new GameState();
        gs.ab = 0;
        gs.inventory = {};
        gs.totalTaps = 0;
        gs.prestigeLifetimeEarned = 0;
        gs.upgradesOwned = {};
        gs.prestigeBonuses = {};
        gs.specializationBonuses = {};
        gs.elementSpecialization = null;
        gs.rngSeed = 42;
        // silence save side effects
        gs.batchUpdate = () => {};
        gs.getBuff = () => 1;
    });

    test('GameState.cast mutates via Kernel (sole cast path)', () => {
        const beforeAb = gs.ab;
        gs.cast(1, 1);
        expect(gs.totalTaps).toBe(1);
        expect(gs.ab).toBeGreaterThan(beforeAb);
        expect(gs.inventory.fire_essence || 0).toBeGreaterThan(0);
        expect(gs.affinity).toBeTruthy();
        expect(gs.rngSeed).toBeDefined();
        // Domain event recorded
        expect(Array.isArray(gs._lastKernelEvents)).toBe(true);
        expect(gs._lastKernelEvents.some((e) => e.type === 'cast')).toBe(true);
    });

    test('cast is deterministic for fixed rngSeed', () => {
        const a = new GameState();
        const b = new GameState();
        for (const g of [a, b]) {
            g.batchUpdate = () => {};
            g.getBuff = () => 1;
            g.rngSeed = 99;
            g.upgradesOwned = {};
            g.prestigeBonuses = {};
            g.specializationBonuses = {};
            g.inventory = {};
            g.ab = 0;
            g.totalTaps = 0;
            g.prestigeLifetimeEarned = 0;
        }
        a.cast();
        b.cast();
        expect(a.ab).toBe(b.ab);
        expect(a.inventory.fire_essence).toBe(b.inventory.fire_essence);
    });

    test('fadeOnGameState is sole fade path used by tick', () => {
        gs.inventory = { fire_essence: 500 };
        gs.storageCap = 20;
        gs.totalTaps = 1000;
        const r = fadeOnGameState(gs, 10, { soft: false });
        expect(gs.inventory.fire_essence).toBeLessThan(500);
        expect(r.faded.fire_essence).toBeGreaterThan(0);
    });

    test('tick applies kernel fade after production', () => {
        gs.inventory = { fire_essence: 400 };
        gs.storageCap = 10;
        gs.totalTaps = 500;
        gs.workstations = {};
        gs.lastTickTime = Date.now();
        gs.lastSaveTime = Date.now() / 1000;
        gs.tick(5);
        expect(gs.inventory.fire_essence).toBeLessThan(400);
    });

    test('meditation mastery writes productionMult on GameState', () => {
        gs.prestigeCount = 1;
        const r = meditationOnGameState(gs, { durationSec: 90, wavesCleared: 2 });
        expect(r.events.some((e) => e.type === 'meditation_mastered')).toBe(true);
        expect(gs.specializationBonuses.productionMult).toBeGreaterThan(1);
    });

    test('projectors expose pipeline roles without dual quest', () => {
        const p = projectorsFromGameState(gs);
        expect(p.pipeline.roles).toHaveLength(5);
        expect(p.pipeline.dualQuestHud).toBe(false);
        expect(p.pipeline.primaryVerb).toBe('EXEC');
        expect(p.contract.secondaryRails).toEqual([]);
    });

    test('offlineTickOnGameState returns mode', async () => {
        gs.inventory = { fire_essence: 200 };
        gs.storageCap = 20;
        const r = await offlineTickOnGameState(gs, 5);
        expect(['main', 'worker', 'main_fallback']).toContain(r.mode);
        expect(WORKER_DT_THRESHOLD_SEC).toBe(60);
    });

    test('castOnGameState matches GameState.cast resource path', () => {
        const g2 = new GameState();
        g2.batchUpdate = () => {};
        g2.getBuff = () => 1;
        g2.rngSeed = 7;
        g2.upgradesOwned = {};
        g2.prestigeBonuses = {};
        g2.specializationBonuses = {};
        const r = castOnGameState(g2, { comboMult: 1, eventMult: 1, clickMult: 1 });
        expect(r.events.some((e) => e.type === 'cast')).toBe(true);
        expect(g2.totalTaps).toBe(1);
    });

    test('offline progress applies kernel fade (no void-law hole)', () => {
        gs.inventory = { fire_essence: 800 };
        gs.storageCap = 30;
        gs.totalTaps = 500;
        gs.workstations = {};
        gs.applyOfflineProgress(120);
        expect(gs.inventory.fire_essence).toBeLessThan(800);
        expect(gs._lastVoidLoss).toBeTruthy();
    });

    test('kernel mirror fields round-trip save payload shape', () => {
        gs.cast();
        expect(gs.affinity).toBeTruthy();
        // Simulate save payload construction fields
        const kernelBlob = {
            affinity: gs.affinity ? { ...gs.affinity } : undefined,
            chapters: gs.kernelChapters,
            storageCap: gs.storageCap,
            rngSeed: gs.rngSeed
        };
        expect(kernelBlob.affinity).toBeTruthy();
        expect(typeof kernelBlob.rngSeed === 'number' || kernelBlob.rngSeed === undefined).toBe(true);
    });
});
