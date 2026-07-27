/**
 * Dual-safe ownership projection (Overall S+ Systems expand).
 * Coalesces live ws_* and Kernel mod_* bags so role counts / production
 * never double-count the same station.
 * Pure. Prefer live craft ids (ws_*) when a mapsFrom pair exists.
 */

import { PIPELINE_MODULES, LEGACY_TO_MODULE } from './content.js';

/** mod_* → ws_* reverse of LEGACY_TO_MODULE */
export const MODULE_TO_LEGACY = Object.fromEntries(
    Object.entries(LEGACY_TO_MODULE).map(([legacy, mod]) => [mod, legacy])
);

/**
 * Coalesce workstation ownership into a single bag.
 * - Paired legacy/mod: keep max count on legacy id, drop mod
 * - Kernel-only modules (no mapsFrom): keep mod_*
 * - Legacy-only: keep as-is
 *
 * @param {Record<string, number>} workstations
 * @returns {Record<string, number>}
 */
export function coalesceWorkstations(workstations) {
    /** @type {Record<string, number>} */
    const raw = {};
    for (const [id, n] of Object.entries(workstations || {})) {
        const v = Number(n) || 0;
        if (v > 0) raw[id] = (raw[id] || 0) + v;
    }

    /** @type {Record<string, number>} */
    const out = { ...raw };

    for (const [legacy, mod] of Object.entries(LEGACY_TO_MODULE)) {
        const a = out[legacy] || 0;
        const b = out[mod] || 0;
        if (a <= 0 && b <= 0) continue;
        const merged = Math.max(a, b);
        out[legacy] = merged;
        if (out[mod] != null) delete out[mod];
    }

    // Drop zero keys
    for (const k of Object.keys(out)) {
        if (!out[k]) delete out[k];
    }
    return out;
}

/**
 * @param {Record<string, number>} workstations
 * @returns {Record<string, number>}
 */
export function projectOwnershipBag(workstations) {
    return coalesceWorkstations(workstations);
}

/**
 * Kernel-only modules that still contribute production when coalesced bag
 * has no legacy twin (buffers/shields/compilers without mapsFrom).
 * @returns {string[]}
 */
export function kernelOnlyModuleIds() {
    return PIPELINE_MODULES.filter((m) => !m.mapsFrom).map((m) => m.id);
}
