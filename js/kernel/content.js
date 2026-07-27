/**
 * Pipeline modules content pack (Restoration Kernel).
 * Roles: capture | store | bind | compile | shield
 */

/** @typedef {'capture'|'store'|'bind'|'compile'|'shield'} PipelineRole */

/**
 * @typedef {Object} PipelineModule
 * @property {string} id
 * @property {string} displayName
 * @property {string} description
 * @property {PipelineRole} role
 * @property {number} unlockAtAb
 * @property {Record<string, number>} recipe
 * @property {number} growth
 * @property {Record<string, number>} [outputs]
 * @property {number} [storageBonus]
 * @property {number} [fadeMult]
 * @property {string} [element]
 * @property {string} [mapsFrom] legacy producer id if any
 */

/** @type {PipelineModule[]} */
export const PIPELINE_MODULES = [
    // Capture
    {
        id: 'mod_fire_capture',
        displayName: 'Fire Sector Tap',
        description: 'Latches heat noise into addressable Fire packets. Still full void weight until Store covers it.',
        role: 'capture',
        unlockAtAb: 0,
        recipe: { fire_essence: 10 },
        growth: 1.12,
        outputs: { fire_essence: 0.2 },
        element: 'fire',
        mapsFrom: 'ws_fire_forge'
    },
    {
        id: 'mod_water_capture',
        displayName: 'Water Sector Tap',
        description: 'Forces circulation so Water does not checksum-rot mid-frame. Capture without Store is a leak.',
        role: 'capture',
        unlockAtAb: 0,
        recipe: { water_essence: 10 },
        growth: 1.12,
        outputs: { water_essence: 0.2 },
        element: 'water',
        mapsFrom: 'ws_aqua_well'
    },
    {
        id: 'mod_air_capture',
        displayName: 'Air Sector Tap',
        description: 'Recompiles dispersing Air before it leaves the sector map. High throughput, high overcap risk.',
        role: 'capture',
        unlockAtAb: 0,
        recipe: { air_essence: 10 },
        growth: 1.12,
        outputs: { air_essence: 0.2 },
        element: 'air',
        mapsFrom: 'ws_zephyr_generator'
    },
    {
        id: 'mod_crystal_capture',
        displayName: 'Crystal Sector Tap',
        description: 'Pulls Crystal dust into lattice buffers. Scaffold material for every Store and Bind recipe.',
        role: 'capture',
        unlockAtAb: 0,
        recipe: { crystal_dust: 10 },
        growth: 1.12,
        outputs: { crystal_dust: 0.2 },
        element: 'crystal',
        mapsFrom: 'ws_crystal_chamber'
    },
    // Store
    {
        id: 'mod_essence_buffer',
        displayName: 'Essence Buffer',
        description: 'Raises unbound cap so soft fade stops eating your first captures. Without this, Capture is a leak.',
        role: 'store',
        unlockAtAb: 0,
        recipe: { crystal_dust: 8, fire_essence: 4 },
        growth: 1.15,
        storageBonus: 40
    },
    {
        id: 'mod_deep_cache',
        displayName: 'Deep Cache Vault',
        description: 'High-capacity vault that also slows global fade. Mid-run answer when intermediate packets still bleed.',
        role: 'store',
        unlockAtAb: 100,
        recipe: { crystal_dust: 40, water_essence: 20, air_essence: 20 },
        growth: 1.16,
        storageBonus: 120,
        fadeMult: 0.85
    },
    // Bind
    {
        id: 'mod_aether_bind',
        displayName: 'Aether Binder',
        description: 'Forces four streams into Distilled Aether — lower void weight than raw, never immortal.',
        role: 'bind',
        unlockAtAb: 0,
        recipe: {
            fire_essence: 2,
            water_essence: 2,
            air_essence: 2,
            crystal_dust: 2
        },
        growth: 1.12,
        outputs: { dist_aether: 0.2 },
        element: 'aether',
        mapsFrom: 'ws_aether_synthesizer'
    },
    {
        id: 'mod_purity_lattice',
        displayName: 'Purity Lattice',
        description: 'Bind throughput upgrade. More Distilled Aether per second when multi-stream recipes stall.',
        role: 'bind',
        unlockAtAb: 200,
        recipe: { dist_aether: 5, crystal_dust: 25 },
        growth: 1.14,
        outputs: { dist_aether: 0.35 }
    },
    // Compile
    {
        id: 'mod_bit_reactor',
        displayName: 'Arcane Bit Reactor',
        description: 'Compiles aether + raw essence into Arcane Bits. Passive AB once Capture, Store, and Bind are online.',
        role: 'compile',
        unlockAtAb: 50,
        recipe: { dist_aether: 10, fire_essence: 20, crystal_dust: 20 },
        growth: 1.15,
        outputs: { ab: 0.15 },
        mapsFrom: 'ws_arcane_bit_reactor'
    },
    {
        id: 'mod_sector_compiler',
        displayName: 'Sector Compiler',
        description: 'Early compile node — trickle AB from fire+water before the reactor unlocks.',
        role: 'compile',
        unlockAtAb: 15,
        recipe: { fire_essence: 15, water_essence: 15 },
        growth: 1.13,
        outputs: { ab: 0.05 }
    },
    // Shield
    {
        id: 'mod_hex_shield',
        displayName: 'Hex Shield Coil',
        description: 'Global fade dampener. Scarce recipe — spend when Store alone cannot hold the overcap.',
        role: 'shield',
        unlockAtAb: 75,
        recipe: { air_essence: 30, crystal_dust: 30, dist_aether: 3 },
        growth: 1.2,
        fadeMult: 0.9
    },
    {
        id: 'mod_stability_ring',
        displayName: 'Stability Ring',
        description: 'Harder global fade cut for late pre-prestige. Stacks multiplicatively with Deep Cache / Coil.',
        role: 'shield',
        unlockAtAb: 500,
        recipe: { dist_aether: 20, crystal_dust: 80 },
        growth: 1.22,
        fadeMult: 0.85
    }
];

/**
 * Legacy GameState workstation ids → Kernel module ids (derived from mapsFrom).
 * @type {Record<string, string>}
 */
export const LEGACY_TO_MODULE = Object.fromEntries(
    PIPELINE_MODULES.filter((m) => m.mapsFrom).map((m) => [/** @type {string} */ (m.mapsFrom), m.id])
);

/**
 * Remap a workstation bag from legacy ws_* ids to mod_*.
 * @param {Record<string, number>} ws
 * @returns {Record<string, number>}
 */
export function mapLegacyWorkstations(ws) {
    /** @type {Record<string, number>} */
    const out = {};
    for (const [id, n] of Object.entries(ws || {})) {
        if (!n) continue;
        const mapped = LEGACY_TO_MODULE[id] || id;
        out[mapped] = (out[mapped] || 0) + n;
    }
    return out;
}

/**
 * @param {string} id
 * @returns {PipelineModule | undefined}
 */
export function getModule(id) {
    return PIPELINE_MODULES.find((m) => m.id === id);
}

/**
 * Total storage capacity from owned store modules.
 * @param {Record<string, number>} workstations
 */
export function computeStorageCap(workstations, baseCap = 50) {
    let cap = baseCap;
    for (const mod of PIPELINE_MODULES) {
        if (mod.role !== 'store') continue;
        const n = workstations[mod.id] || 0;
        if (n > 0 && mod.storageBonus) cap += mod.storageBonus * n;
    }
    return cap;
}

/**
 * Aggregate fade multiplier from shields + deep cache (min 0.5).
 * @param {Record<string, number>} workstations
 */
export function computeFadeMult(workstations) {
    let m = 1;
    for (const mod of PIPELINE_MODULES) {
        const n = workstations[mod.id] || 0;
        if (n > 0 && mod.fadeMult) {
            m *= Math.pow(mod.fadeMult, n);
        }
    }
    return Math.max(0.5, m);
}
