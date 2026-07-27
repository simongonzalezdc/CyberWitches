/**
 * Bridge GameState ⇄ Kernel — sole mutator for cast resources + soft fade.
 * Live cast/fade must go through these helpers (no dual economy write).
 */

import { createKernel, createInitialState, reduce } from './index.js';
import { mapLegacyWorkstations } from './content.js';
import { applyFade } from './fade.js';
import { applyCast } from './cast.js';
import { applyChapterCheck } from './chapters.js';
import { applyTierCheck } from './tiers.js';
import { applyMeditationComplete } from './meditation.js';
import { SPECIALIZATION_STRATEGIES } from './affinity.js';
import { projectPipelineHud, projectContractHud, projectAffinityHud } from './projector.js';

/**
 * Build a Kernel state snapshot from a GameState-like object.
 * @param {any} gs
 */
export function gameStateToKernel(gs) {
    const seed =
        Number(gs?.rngSeed) ||
        (((Number(gs?.totalTaps) || 1) ^ 0x9e3779b9) >>> 0) ||
        1;
    const base = createInitialState(seed);
    if (!gs) return base;
    return {
        ...base,
        ab: Number(gs.ab) || 0,
        inventory: { ...(gs.inventory || {}) },
        workstations: {
            ...mapLegacyWorkstations(gs.workstations || {}),
            ...(gs.kernelWorkstations || {})
        },
        upgradesOwned: { ...(gs.upgradesOwned || {}) },
        prestigeBonuses: { ...(gs.prestigeBonuses || {}) },
        prestigeCount: gs.prestigeCount || 0,
        prestigeLifetimeEarned: Number(gs.prestigeLifetimeEarned) || 0,
        totalKeys: Number(gs.totalKeys ?? gs.prestigePoints) || 0,
        keys: Number(gs.keys ?? gs.prestigePoints) || 0,
        totalTaps: gs.totalTaps || 0,
        elementSpecialization: gs.elementSpecialization || null,
        specializationBonuses: { ...(gs.specializationBonuses || {}) },
        designTier:
            typeof gs.designTier === 'number'
                ? gs.designTier
                : (gs._designTierMirror ?? base.designTier),
        unlockedTiers: Array.isArray(gs.kernelUnlockedTiers)
            ? gs.kernelUnlockedTiers
            : base.unlockedTiers,
        affinity: gs.affinity || base.affinity,
        chapters: gs.kernelChapters || base.chapters,
        contractsCompleted: gs.kernelContractsCompleted || base.contractsCompleted,
        storageCap: Number(gs.storageCap) || base.storageCap,
        rngSeed: seed,
        tick: Number(gs.kernelTick) || 0
    };
}

/**
 * Apply Kernel economy fields onto GameState (mutates gs).
 * @param {any} gs
 * @param {import('./types.js').KernelState} kState
 * @param {import('./types.js').DomainEvent[]} [events]
 */
export function applyKernelResourcesToGameState(gs, kState, events = []) {
    if (!gs || !kState) return;
    gs.ab = kState.ab;
    gs.inventory = { ...kState.inventory };
    gs.totalTaps = kState.totalTaps;
    if (kState.prestigeLifetimeEarned != null) {
        gs.prestigeLifetimeEarned = kState.prestigeLifetimeEarned;
    }
    gs.affinity = { ...(kState.affinity || {}) };
    gs.kernelChapters = kState.chapters
        ? JSON.parse(JSON.stringify(kState.chapters))
        : gs.kernelChapters;
    gs.kernelContractsCompleted = [...(kState.contractsCompleted || [])];
    gs.storageCap = kState.storageCap;
    gs.rngSeed = kState.rngSeed;
    gs.kernelTick = kState.tick;
    gs.totalKeys = kState.totalKeys;
    gs.keys = kState.keys;
    gs.kernelUnlockedTiers = [...(kState.unlockedTiers || [])];
    gs._designTierMirror = kState.designTier;
    if (kState.elementSpecialization) {
        gs.elementSpecialization = kState.elementSpecialization;
    }
    if (kState.specializationBonuses) {
        gs.specializationBonuses = {
            ...(gs.specializationBonuses || {}),
            ...kState.specializationBonuses
        };
    }
    gs._lastKernelEvents = events;
}

/**
 * Sole cast path: pure Kernel cast + chapter/tier → write resources back.
 * @param {any} gs
 * @param {object} [castOpts]
 * @returns {{ state: import('./types.js').KernelState, events: import('./types.js').DomainEvent[] }}
 */
export function castOnGameState(gs, castOpts = {}) {
    const before = gameStateToKernel(gs);
    const result = applyCast(before, castOpts);
    let state = result.state;
    /** @type {import('./types.js').DomainEvent[]} */
    const events = [...result.events];
    const ch = applyChapterCheck(state);
    state = ch.state;
    events.push(...ch.events);
    const tr = applyTierCheck(state);
    state = tr.state;
    events.push(...tr.events);
    applyKernelResourcesToGameState(gs, state, events);
    return { state, events };
}

/** @deprecated use castOnGameState */
export function projectCastThroughKernel(/** @type {any} */ gs, castOpts = {}) {
    return castOnGameState(gs, castOpts);
}

/**
 * Sole fade mutator — call after production each tick.
 * @param {any} gs
 * @param {number} dtSec
 * @param {{ soft?: boolean, offline?: boolean }} [opts]
 * @returns {{ faded: Record<string, number>, storageCap: number }}
 */
export function fadeOnGameState(gs, dtSec, opts = {}) {
    const snap = gameStateToKernel(gs);
    const soft =
        opts.soft != null
            ? opts.soft
            : (snap.totalTaps || 0) < 80 && (snap.prestigeCount || 0) === 0;
    const r = applyFade(snap, Math.max(0, Number(dtSec) || 0), {
        soft: soft || !!opts.offline
    });
    gs.inventory = { ...r.inventory };
    gs.storageCap = r.storageCap;
    if (Object.keys(r.faded).length) {
        gs._lastKernelEvents = [{ type: 'faded', amounts: r.faded }];
    }
    return { faded: r.faded, storageCap: r.storageCap };
}

/**
 * Meditation mastery / skip via Kernel.
 * @param {any} gs
 * @param {{ durationSec?: number, wavesCleared?: number, skip?: boolean }} opts
 */
export function meditationOnGameState(gs, opts = {}) {
    const before = gameStateToKernel(gs);
    const result = applyMeditationComplete(before, opts);
    applyKernelResourcesToGameState(gs, result.state, result.events);
    if (result.state.specializationBonuses?.productionMult) {
        gs.specializationBonuses = {
            ...(gs.specializationBonuses || {}),
            productionMult: result.state.specializationBonuses.productionMult
        };
        gs.prestigeBonuses = gs.prestigeBonuses || {};
        gs.prestigeBonuses.meditation_production_mult =
            result.state.specializationBonuses.productionMult;
    }
    return result;
}

/**
 * @param {string} element
 */
export function strategyBonusesFor(element) {
    const s =
        SPECIALIZATION_STRATEGIES[
            /** @type {keyof typeof SPECIALIZATION_STRATEGIES} */ (element)
        ];
    return s
        ? { ...s.bonuses, strategyName: s.name, pipelineHint: s.pipelineHint }
        : null;
}

/**
 * @param {any} gs
 */
export function projectorsFromGameState(gs) {
    const k = gameStateToKernel(gs);
    return {
        pipeline: projectPipelineHud(k, {
            legacyWorkstations: gs.workstations || {}
        }),
        contract: projectContractHud(k),
        affinity: projectAffinityHud(k)
    };
}

/**
 * Offline / large-dt catch-up pure tick (worker host may call this).
 * @param {import('./types.js').KernelState} state
 * @param {number} dtSec
 * @param {boolean} [offline]
 */
export function offlineTick(state, dtSec, offline = true) {
    return reduce(state, { type: 'tick', dtSec, offline });
}

export { createKernel, createInitialState, SPECIALIZATION_STRATEGIES };
