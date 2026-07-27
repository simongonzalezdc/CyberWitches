/**
 * Soft fade + storage law (ticket 03).
 * Pure. Early game soft: first minutes use reduced rate via opts.soft.
 */

import { computeFadeMult, computeStorageCap } from './content.js';

/** Essence keys subject to fade when over capacity / unbound. */
export const FADEABLE = [
    'fire_essence',
    'water_essence',
    'air_essence',
    'crystal_dust',
    'dist_aether'
];

/** Base fade fraction per second of amount over soft floor. */
export const BASE_FADE_PER_SEC = 0.002;

/**
 * Total units of fadeable inventory.
 * @param {Record<string, number>} inventory
 */
export function fadeableTotal(inventory) {
    let t = 0;
    for (const k of FADEABLE) t += inventory[k] || 0;
    return t;
}

/**
 * Apply fade over dtSec. Mutates a cloned inventory-like bag on state via return.
 * @param {import('./types.js').KernelState} state
 * @param {number} dtSec
 * @param {{ soft?: boolean }} [opts] soft = early-game reduced fade
 * @returns {{ inventory: Record<string, number>, faded: Record<string, number>, storageCap: number }}
 */
export function applyFade(state, dtSec, opts = {}) {
    const dt = Math.max(0, Number(dtSec) || 0);
    const inventory = { ...state.inventory };
    /** @type {Record<string, number>} */
    const faded = {};
    if (dt <= 0) {
        return {
            inventory,
            faded,
            storageCap: computeStorageCap(state.workstations || {}, state.storageCap || 50)
        };
    }

    const cap = computeStorageCap(state.workstations || {}, state.storageCap || 50);
    const total = fadeableTotal(inventory);
    if (total <= cap) {
        return { inventory, faded, storageCap: cap };
    }

    const over = total - cap;
    let fadeMult = computeFadeMult(state.workstations || {});
    if (opts.soft) fadeMult *= 0.25; // early softness
    // Prestige 0 + very early taps: extra soft
    if ((state.totalTaps || 0) < 40 && (state.prestigeCount || 0) === 0) {
        fadeMult *= 0.2;
    }

    const lose = over * BASE_FADE_PER_SEC * fadeMult * dt;
    if (lose <= 1e-12) return { inventory, faded, storageCap: cap };

    // Proportional take from fadeable stacks
    for (const k of FADEABLE) {
        const have = inventory[k] || 0;
        if (have <= 0) continue;
        const share = have / total;
        const take = Math.min(have, lose * share);
        if (take > 0) {
            inventory[k] = have - take;
            faded[k] = (faded[k] || 0) + take;
        }
    }

    return { inventory, faded, storageCap: cap };
}
