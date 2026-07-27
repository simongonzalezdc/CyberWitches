/**
 * Dual-safe ownership projection (Overall S+ Systems).
 * Canonical id: live craft ws_* when LEGACY_TO_MODULE pairs exist; else mod_*.
 * Coalesce SUMs paired counts (independent craft paths write one namespace each)
 * onto the canonical id and drops the alias — never max-masks purchases.
 */

import { PIPELINE_MODULES, LEGACY_TO_MODULE } from './content.js';

/** mod_* → ws_* reverse of LEGACY_TO_MODULE */
export const MODULE_TO_LEGACY = Object.fromEntries(
    Object.entries(LEGACY_TO_MODULE).map(([legacy, mod]) => [mod, legacy])
);

/**
 * Canonical write/read id for a workstation or kernel module.
 * @param {string} id
 * @returns {string}
 */
export function canonicalWorkstationId(id) {
    if (!id) return id;
    if (MODULE_TO_LEGACY[id]) return MODULE_TO_LEGACY[id];
    return id;
}

/**
 * Total owned for an id including its dual-graph alias (before coalesce).
 * @param {Record<string, number>} workstations
 * @param {string} id
 */
export function ownedCountIncludingAlias(workstations, id) {
    const bag = workstations || {};
    const canon = canonicalWorkstationId(id);
    const mod = LEGACY_TO_MODULE[canon];
    let n = Number(bag[canon]) || 0;
    if (mod) n += Number(bag[mod]) || 0;
    // if caller passed a mod id that is kernel-only, only that key
    if (!LEGACY_TO_MODULE[canon] && !MODULE_TO_LEGACY[id]) {
        return Number(bag[id]) || 0;
    }
    // also if id is mod with legacy twin, included above
    if (MODULE_TO_LEGACY[id] && id !== canon) {
        // already counted both
        return n;
    }
    return n;
}

/**
 * Coalesce workstation ownership into a single bag.
 * - Paired legacy/mod: SUM onto legacy (ws_*), drop mod
 * - Kernel-only modules (no mapsFrom): keep mod_*
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
        // Sum: live craft and kernel craft write different namespaces independently
        out[legacy] = a + b;
        if (out[mod] != null) delete out[mod];
    }

    for (const k of Object.keys(out)) {
        if (!out[k]) delete out[k];
    }
    return out;
}

/**
 * Apply a craft +1 onto the bag using the canonical id (write-side single-id).
 * Removes alias keys so the bag stays clean.
 * @param {Record<string, number>} workstations
 * @param {string} id module or workstation id being crafted
 * @param {number} [delta]
 * @returns {Record<string, number>}
 */
export function applyOwnershipDelta(workstations, id, delta = 1) {
    const bag = { ...(workstations || {}) };
    const canon = canonicalWorkstationId(id);
    const mod = LEGACY_TO_MODULE[canon];
    const before = ownedCountIncludingAlias(bag, canon);
    // strip both keys then set canon
    if (mod) delete bag[mod];
    delete bag[canon];
    // if id was kernel-only (canon === id and no legacy)
    if (!LEGACY_TO_MODULE[canon] && id !== canon) {
        delete bag[id];
    }
    const next = before + (Number(delta) || 0);
    if (next > 0) bag[canon] = next;
    return bag;
}

/**
 * @param {Record<string, number>} workstations
 * @returns {Record<string, number>}
 */
export function projectOwnershipBag(workstations) {
    return coalesceWorkstations(workstations);
}

/**
 * Kernel-only modules (no mapsFrom twin).
 * @returns {string[]}
 */
export function kernelOnlyModuleIds() {
    return PIPELINE_MODULES.filter((m) => !m.mapsFrom).map((m) => m.id);
}

/**
 * @param {Record<string, number>} workstations
 * @param {string} id
 * @param {number} [min]
 */
export function owns(workstations, id, min = 1) {
    return ownedCountIncludingAlias(workstations, id) >= min;
}
