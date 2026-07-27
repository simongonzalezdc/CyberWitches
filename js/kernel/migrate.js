/**
 * Kernel snapshot migration (ticket 06).
 */

import { createInitialState } from './state.js';

export const KERNEL_SAVE_VERSION = 2;

/**
 * @param {unknown} raw
 * @returns {{ ok: true, state: import('./types.js').KernelState, migratedFrom: number } | { ok: false, reason: string }}
 */
export function migrateKernelSnapshot(raw) {
    if (!raw || typeof raw !== 'object') {
        return { ok: false, reason: 'not_object' };
    }
    /** @type {Record<string, unknown>} */
    const s = /** @type {any} */ (raw);
    let version = Number(s.version) || 1;
    let cur = { ...s };

    if (version < 1) return { ok: false, reason: 'version_too_old' };

    // v1 → v2: ensure pipeline fields
    if (version === 1) {
        cur = {
            ...createInitialState(Number(cur.rngSeed) || 1),
            ...cur,
            version: 2,
            storageCap: Number(cur.storageCap) || 50,
            chapters: cur.chapters || { reached: ['ch0_boot'], qualities: {} },
            affinity: cur.affinity || { fire: 0, water: 0, air: 0, crystal: 0 },
            contractsCompleted: cur.contractsCompleted || [],
            workstations: cur.workstations || {}
        };
        version = 2;
    }

    if (version !== KERNEL_SAVE_VERSION) {
        return { ok: false, reason: `unsupported_version_${version}` };
    }

    // Sanitize numbers
    cur.ab = Math.max(0, Number(cur.ab) || 0);
    cur.inventory = cur.inventory && typeof cur.inventory === 'object' ? cur.inventory : {};
    cur.workstations = cur.workstations && typeof cur.workstations === 'object' ? cur.workstations : {};

    return {
        ok: true,
        state: /** @type {import('./types.js').KernelState} */ (cur),
        migratedFrom: Number(s.version) || 1
    };
}

/**
 * @param {import('./types.js').KernelState} state
 */
export function serializeKernel(state) {
    return JSON.stringify({ ...state, version: KERNEL_SAVE_VERSION });
}

/**
 * @param {string} json
 */
export function deserializeKernel(json) {
    try {
        return migrateKernelSnapshot(JSON.parse(json));
    } catch {
        return { ok: false, reason: 'parse_error' };
    }
}
