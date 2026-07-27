/**
 * Bridge GameState ⇄ Kernel (strangler adapter).
 * Lets live game optionally project cast through pure Kernel.
 */

import { createKernel, createInitialState } from './index.js';
import { mapLegacyWorkstations } from './content.js';

/**
 * Build a Kernel state snapshot from a GameState-like object.
 * @param {any} gs
 */
export function gameStateToKernel(gs) {
    const base = createInitialState(1);
    if (!gs) return base;
    return {
        ...base,
        ab: gs.ab || 0,
        inventory: { ...(gs.inventory || {}) },
        workstations: mapLegacyWorkstations(gs.workstations || {}),
        upgradesOwned: { ...(gs.upgradesOwned || {}) },
        prestigeBonuses: { ...(gs.prestigeBonuses || {}) },
        prestigeCount: gs.prestigeCount || 0,
        prestigeLifetimeEarned: gs.prestigeLifetimeEarned || 0,
        totalKeys: gs.totalKeys || gs.enlightenmentKeys || 0,
        keys: gs.keys || gs.enlightenmentKeys || 0,
        totalTaps: gs.totalTaps || 0,
        elementSpecialization: gs.elementSpecialization || null,
        specializationBonuses: { ...(gs.specializationBonuses || {}) },
        designTier: typeof gs.designTier === 'number' ? gs.designTier : base.designTier,
        rngSeed: (gs.totalTaps || 1) ^ 0x9e3779b9
    };
}

/**
 * Apply Kernel cast result back onto GameState inventory/ab (mutates gs).
 * @param {any} gs
 * @param {import('./types.js').KernelState} kState
 */
export function applyKernelResourcesToGameState(gs, kState) {
    if (!gs || !kState) return;
    gs.ab = kState.ab;
    gs.inventory = { ...kState.inventory };
    gs.totalTaps = kState.totalTaps;
    if (kState.prestigeLifetimeEarned != null) {
        gs.prestigeLifetimeEarned = Math.max(gs.prestigeLifetimeEarned || 0, kState.prestigeLifetimeEarned);
    }
}

/**
 * Pure cast projection helper for tests / gradual wiring.
 * @param {any} gs
 * @param {object} [castOpts]
 */
export function projectCastThroughKernel(gs, castOpts = {}) {
    const k = createKernel(gameStateToKernel(gs));
    const result = k.dispatch({ type: 'cast', ...castOpts });
    return result;
}
