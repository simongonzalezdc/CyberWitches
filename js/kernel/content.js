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
        description: 'Captures fading Fire essence from ambient hex noise.',
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
        description: 'Captures Water essence before it stagnates.',
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
        description: 'Captures Air essence in circulation loops.',
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
        description: 'Captures Crystal dust into lattice buffers.',
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
        description: 'Raises unbound storage so essence resists soft fade.',
        role: 'store',
        unlockAtAb: 0,
        recipe: { crystal_dust: 8, fire_essence: 4 },
        growth: 1.15,
        storageBonus: 40
    },
    {
        id: 'mod_deep_cache',
        displayName: 'Deep Cache Vault',
        description: 'High-capacity vault. Cuts fade further when stocked.',
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
        description: 'Binds four essence streams into Aether (stable intermediate).',
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
        description: 'Improves bind efficiency — less waste when synthesizing.',
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
        description: 'Compiles preserved stock into stable Arcane Bits.',
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
        description: 'Early compile node — slow AB from raw essence.',
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
        description: 'Slows global fade rate. Scarce — spend carefully.',
        role: 'shield',
        unlockAtAb: 75,
        recipe: { air_essence: 30, crystal_dust: 30, dist_aether: 3 },
        growth: 1.2,
        fadeMult: 0.9
    },
    {
        id: 'mod_stability_ring',
        displayName: 'Stability Ring',
        description: 'Stronger global fade dampener for late pre-prestige.',
        role: 'shield',
        unlockAtAb: 500,
        recipe: { dist_aether: 20, crystal_dust: 80 },
        growth: 1.22,
        fadeMult: 0.85
    }
];

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
