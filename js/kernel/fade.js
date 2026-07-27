/**
 * Soft fade + storage law (ticket 03) — anti-cliché: compiled stock still bleeds
 * if unbound, just slower than raw ambient essence.
 * Pure. Early game soft: first minutes use reduced rate via opts.soft.
 */

import { computeFadeMult, computeStorageCap } from './content.js';

/**
 * Fade weights: 1 = full raw bleed, <1 = more "compiled" / bound (still at risk).
 * Intermediates must not be immortal — otherwise Store dies as a verb after T0.
 * @type {Record<string, number>}
 */
export const FADE_WEIGHT = {
    fire_essence: 1,
    water_essence: 1,
    air_essence: 1,
    crystal_dust: 1,
    dist_aether: 0.85,
    // Live craft intermediates (ws_* ladder) — partial void pressure
    dist_fire: 0.55,
    liquid_essence: 0.55,
    ethereal_gust: 0.55,
    shaped_crys: 0.5,
    dig_candle: 0.4,
    aqua_well: 0.4,
    zephyr_totem: 0.4,
    crystal_orb: 0.35,
    aether_well: 0.45,
    fused_aether: 0.4,
    resonant_crystal: 0.3
};

/** Keys subject to fade when over capacity / unbound. */
export const FADEABLE = Object.keys(FADE_WEIGHT);

/** Base fade fraction per second of amount over soft floor. */
export const BASE_FADE_PER_SEC = 0.002;

/**
 * Total weighted units of fadeable inventory.
 * @param {Record<string, number>} inventory
 */
export function fadeableTotal(inventory) {
    let t = 0;
    for (const k of FADEABLE) {
        const w = FADE_WEIGHT[k] || 1;
        t += (inventory[k] || 0) * w;
    }
    return t;
}

/**
 * Apply fade over dtSec.
 * @param {import('./types.js').KernelState} state
 * @param {number} dtSec
 * @param {{ soft?: boolean }} [opts]
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
    if (opts.soft) fadeMult *= 0.25;
    if ((state.totalTaps || 0) < 40 && (state.prestigeCount || 0) === 0) {
        fadeMult *= 0.2;
    }

    const lose = over * BASE_FADE_PER_SEC * fadeMult * dt;
    if (lose <= 1e-12) return { inventory, faded, storageCap: cap };

    // Proportional take weighted by stack * weight / total
    for (const k of FADEABLE) {
        const have = inventory[k] || 0;
        if (have <= 0) continue;
        const w = FADE_WEIGHT[k] || 1;
        const share = (have * w) / total;
        const take = Math.min(have, lose * share);
        if (take > 0) {
            inventory[k] = have - take;
            faded[k] = (faded[k] || 0) + take;
        }
    }

    return { inventory, faded, storageCap: cap };
}
