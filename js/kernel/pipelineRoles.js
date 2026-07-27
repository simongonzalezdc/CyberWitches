/**
 * Pipeline role mapping for live PRODUCERS (ws_*) + Kernel modules (mod_*).
 * Closes dual-graph UX: every craftable station maps to Capture|Store|Bind|Compile|Shield.
 */

import { PIPELINE_MODULES, LEGACY_TO_MODULE } from './content.js';

/** @typedef {'capture'|'store'|'bind'|'compile'|'shield'} PipelineRole */

/**
 * Explicit role for every live workstation id (legacy graph).
 * Derived from diegetic function, not only mapsFrom.
 * @type {Record<string, PipelineRole>}
 */
export const PRODUCER_PIPELINE_ROLES = {
    // Tier 0 capture
    ws_fire_forge: 'capture',
    ws_aqua_well: 'capture',
    ws_zephyr_generator: 'capture',
    ws_crystal_chamber: 'capture',
    // Bind
    ws_aether_synthesizer: 'bind',
    // T1 capture-ish / compile intermediates
    ws_digcandle_forge: 'capture',
    ws_aqua_well_t1: 'capture',
    ws_zephyr_generator_t1: 'capture',
    ws_crystal_chamber_t1: 'capture',
    ws_aether_reactor_t1: 'compile',
    // Mid
    ws_aether_fusion_chamber: 'bind',
    ws_resonance_crystallizer: 'store',
    ws_harmonic_stabilizer: 'shield',
    ws_enhanced_candle_forge: 'capture',
    ws_flowing_current_well: 'capture',
    ws_wind_spiral_generator: 'capture',
    ws_crystal_core_chamber: 'store',
    // Late
    ws_quantum_candle_forge: 'capture',
    ws_quantum_water_well: 'capture',
    ws_quantum_air_generator: 'capture',
    ws_quantum_crystal_chamber: 'store',
    ws_void_liquid_well: 'capture',
    ws_void_breath_generator: 'shield',
    ws_void_crystal_chamber: 'store',
    ws_arcane_candle_forge: 'compile',
    ws_arcane_bit_reactor: 'compile',
    ws_etheric_bit_reactor: 'compile',
    ws_infinity_bit_reactor: 'compile'
};

/** @type {PipelineRole[]} */
export const ROLE_ORDER = ['capture', 'store', 'bind', 'compile', 'shield'];

/**
 * @param {string} id workstation or kernel module id
 * @returns {PipelineRole|null}
 */
export function roleForId(id) {
    if (!id) return null;
    if (PRODUCER_PIPELINE_ROLES[id]) return PRODUCER_PIPELINE_ROLES[id];
    const mod = PIPELINE_MODULES.find((m) => m.id === id);
    if (mod?.role) return mod.role;
    // Reverse mapsFrom: if this is a kernel id mapped from legacy, use module role
    const mapped = LEGACY_TO_MODULE[id];
    if (mapped) {
        const m = PIPELINE_MODULES.find((x) => x.id === mapped);
        if (m?.role) return m.role;
    }
    return null;
}

/**
 * Count owned stations by pipeline role (legacy + kernel ids).
 * @param {Record<string, number>} workstations
 * @returns {Record<PipelineRole, number>}
 */
export function countOwnedByRole(workstations) {
    /** @type {Record<string, number>} */
    const out = { capture: 0, store: 0, bind: 0, compile: 0, shield: 0 };
    for (const [id, n] of Object.entries(workstations || {})) {
        if (!n) continue;
        const role = roleForId(id);
        if (role) out[role] = (out[role] || 0) + n;
    }
    return /** @type {Record<PipelineRole, number>} */ (out);
}

/**
 * Annotate a producer-like object with pipelineRole for UI.
 * @template {{ id: string, pipelineRole?: string }} T
 * @param {T} prod
 * @returns {T & { pipelineRole: PipelineRole|null }}
 */
export function withPipelineRole(prod) {
    const role = roleForId(prod.id) || prod.pipelineRole || null;
    return { ...prod, pipelineRole: /** @type {PipelineRole|null} */ (role) };
}

/**
 * Coverage: every known producer id has a role (falsifiable).
 * @param {string[]} producerIds
 * @returns {{ ok: boolean, missing: string[] }}
 */
export function assertAllProducersMapped(producerIds) {
    const missing = producerIds.filter((id) => !roleForId(id));
    return { ok: missing.length === 0, missing };
}
