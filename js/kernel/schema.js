/**
 * Content pack validator (ticket 02).
 * Pure — no DOM. CI-friendly.
 */

import { PIPELINE_MODULES } from './content.js';

const ROLES = new Set(['capture', 'store', 'bind', 'compile', 'shield']);

/**
 * @param {unknown} pack
 * @returns {{ ok: true, modules: object[] } | { ok: false, errors: string[] }}
 */
export function validateContentPack(pack = PIPELINE_MODULES) {
    /** @type {string[]} */
    const errors = [];
    if (!Array.isArray(pack)) {
        return { ok: false, errors: ['content pack must be an array'] };
    }
    if (pack.length === 0) {
        errors.push('content pack empty');
    }

    const ids = new Set();
    let prePrestige = 0;

    for (let i = 0; i < pack.length; i++) {
        const m = /** @type {Record<string, unknown>} */ (pack[i]);
        const path = `modules[${i}]`;
        if (!m || typeof m !== 'object') {
            errors.push(`${path}: not an object`);
            continue;
        }
        if (typeof m.id !== 'string' || !m.id) errors.push(`${path}.id required string`);
        else if (ids.has(m.id)) errors.push(`${path}.id duplicate ${m.id}`);
        else ids.add(m.id);

        if (typeof m.displayName !== 'string') errors.push(`${path}.displayName required`);
        if (!ROLES.has(/** @type {string} */ (m.role))) {
            errors.push(`${path}.role must be one of capture|store|bind|compile|shield`);
        }
        if (typeof m.unlockAtAb !== 'number' || m.unlockAtAb < 0) {
            errors.push(`${path}.unlockAtAb must be >= 0 number`);
        }
        if (!m.recipe || typeof m.recipe !== 'object') {
            errors.push(`${path}.recipe required object`);
        } else {
            for (const [k, v] of Object.entries(/** @type {Record<string, unknown>} */ (m.recipe))) {
                if (typeof v !== 'number' || v < 0) errors.push(`${path}.recipe.${k} invalid`);
            }
        }
        if (typeof m.growth !== 'number' || m.growth < 1) {
            errors.push(`${path}.growth must be >= 1`);
        }
        if (typeof m.unlockAtAb === 'number' && m.unlockAtAb < 9000) prePrestige += 1;
    }

    if (prePrestige > 16) {
        errors.push(`pre-prestige modules ${prePrestige} exceed cap 16`);
    }

    // Role coverage
    for (const role of ROLES) {
        if (!pack.some((m) => m && /** @type {any} */ (m).role === role)) {
            errors.push(`missing role coverage: ${role}`);
        }
    }

    if (errors.length) return { ok: false, errors };
    return { ok: true, modules: /** @type {object[]} */ (pack) };
}

/**
 * CLI-friendly assert for CI scripts.
 * @throws {Error}
 */
export function assertContentPackValid(pack = PIPELINE_MODULES) {
    const r = validateContentPack(pack);
    if (!r.ok) {
        throw new Error(`Content pack invalid:\n${/** @type {{ ok: false, errors: string[] }} */ (r).errors.join('\n')}`);
    }
    return r;
}
