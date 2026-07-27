/**
 * Soft fade + storage law (ticket 03).
 * Compiled stock still bleeds if unbound — slower than raw ambient essence.
 * Pure. Early game soft: first minutes use reduced rate via opts.soft.
 */

import { computeFadeMult, computeStorageCap } from './content.js';

/**
 * Fade weights: 1 = full raw void pressure, lower = denser / more bound (still at risk).
 *
 * Model:
 * - `fadeableTotal` is a **weighted** pressure sum (not raw item count).
 * - `storageCap` is measured in the same weighted units (base 50 + store bonuses).
 * - Denser intermediates consume less of the cap per unit, but still overcap and bleed.
 * - No produced intermediate is immortal: Store stays a verb through late game.
 *
 * @type {Record<string, number>}
 */
export const FADE_WEIGHT = {
    // Raw ambient (full pressure)
    fire_essence: 1,
    water_essence: 1,
    air_essence: 1,
    crystal_dust: 1,
    // Bind intermediate
    dist_aether: 0.85,
    // T0 craft ladder
    dist_fire: 0.55,
    liquid_essence: 0.55,
    ethereal_gust: 0.55,
    shaped_crys: 0.5,
    // T1
    dig_candle: 0.4,
    aqua_well: 0.4,
    zephyr_totem: 0.4,
    crystal_orb: 0.35,
    aether_well: 0.45,
    // T1.5 bridge
    fused_aether: 0.4,
    resonant_crystal: 0.3,
    harmonic_essence: 0.28,
    // T2 mid
    enhanced_candle: 0.28,
    flowing_current: 0.28,
    wind_spiral: 0.28,
    crystal_core: 0.25,
    // T3 quantum
    quantum_candle: 0.22,
    quantum_water: 0.22,
    quantum_air: 0.22,
    quantum_crystal: 0.2,
    // T4 void / legendary
    arcane_candle: 0.18,
    void_liquid: 0.15,
    void_breath: 0.15,
    void_crystal: 0.12
};

/** Keys subject to fade when over capacity / unbound. */
export const FADEABLE = Object.keys(FADE_WEIGHT);

/** Base fade fraction per second of amount over soft floor. */
export const BASE_FADE_PER_SEC = 0.002;

/**
 * Total weighted void-pressure units of fadeable inventory.
 * Cap is in the same units (see FADE_WEIGHT model comment).
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

    // Proportional take: share of lose by (stack * weight) / total
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
