export const UPGRADES = [
    // Tier 0 - Basic upgrades
    {
        id: 'u_global_1',
        displayName: 'Hex Compiler v1',
        description: '+50% all production',
        affects: 'global',
        type: 'multiplier',
        value: 1.5,
        recipe: { dist_fire: 2, shaped_crys: 2, dist_aether: 1 },
        unlockAtAb: 0.0
    },
    {
        id: 'u_click_1',
        displayName: 'Sigil Stroke',
        description: '+1 cast rewards',
        affects: 'click',
        type: 'additive',
        value: 1.0,
        recipe: { fire_essence: 10 },
        unlockAtAb: 0.0
    },
    {
        id: 'u_click_2',
        displayName: 'Enhanced Sigil',
        description: '+2 cast rewards',
        affects: 'click',
        type: 'additive',
        value: 2.0,
        recipe: { dist_fire: 5, shaped_crys: 2 },
        unlockAtAb: 500.0
    },

    // Tier 1 - Workstation upgrades
    {
        id: 'u_digcandle_forge_1',
        displayName: 'Candle Algorithm',
        description: '×2 Digital Candle Forge',
        affects: 'producer:ws_digcandle_forge',
        type: 'multiplier',
        value: 2.0,
        recipe: { dig_candle: 5, dist_fire: 10 },
        unlockAtAb: 200.0
    },
    {
        id: 'u_crystal_1',
        displayName: 'Orb Optimization',
        description: '×2 Crystal Orb Forge',
        affects: 'producer:ws_crystal_chamber_t1',
        type: 'multiplier',
        value: 2.0,
        recipe: { crystal_orb: 3, shaped_crys: 5 },
        unlockAtAb: 500.0
    },
    {
        id: 'u_cauldron_1',
        displayName: 'Well Enhancement',
        description: '×2 Aether Well',
        affects: 'producer:ws_aether_reactor_t1',
        type: 'multiplier',
        value: 2.0,
        recipe: { aether_well: 3, dist_aether: 5 },
        unlockAtAb: 1000.0
    },
    // Tier 2 - Workstation upgrades
    {
        id: 'u_digcandle_forge_t2_1',
        displayName: 'Enhanced Candle Boost',
        description: '×2 Enhanced Candle Forge',
        affects: 'producer:ws_enhanced_candle_forge',
        type: 'multiplier',
        value: 2.0,
        recipe: { enhanced_candle: 3, dig_candle: 5 },
        unlockAtAb: 8000.0
    },
    {
        id: 'u_coreforge_1',
        displayName: 'Core Enhancement',
        description: '×2 Crystal Core Forge',
        affects: 'producer:ws_crystal_core_chamber',
        type: 'multiplier',
        value: 2.0,
        recipe: { crystal_core: 2, crystal_orb: 3 },
        unlockAtAb: 15000.0
    },
    {
        id: 'u_fluxreactor_1',
        displayName: 'Flux Overdrive',
        description: '×2 Flowing Current Well',
        affects: 'producer:ws_flowing_current_well',
        type: 'multiplier',
        value: 2.0,
        recipe: { flowing_current: 3, aqua_well: 5 },
        unlockAtAb: 25000.0
    },
    {
        id: 'u_hexforge_1',
        displayName: 'Hex Optimization',
        description: '×2 Wind Spiral Generator',
        affects: 'producer:ws_wind_spiral_generator',
        type: 'multiplier',
        value: 2.0,
        recipe: { wind_spiral: 3, zephyr_totem: 2 },
        unlockAtAb: 60000.0
    },
    {
        id: 'u_sigilforge_1',
        displayName: 'Reactor Boost',
        description: '×2 Etheric Bit Reactor',
        affects: 'producer:ws_etheric_bit_reactor',
        type: 'multiplier',
        value: 2.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, aether_well: 2 },
        unlockAtAb: 100000.0
    },

    // Tier 2 - Global upgrades
    {
        id: 'u_global_2',
        displayName: 'Sigil Cache',
        description: '+80% all production',
        affects: 'global',
        type: 'multiplier',
        value: 1.8,
        recipe: { dist_fire: 3, shaped_crys: 2, dist_aether: 2 },
        unlockAtAb: 500.0
    },
    {
        id: 'u_global_3',
        displayName: 'Coven Pact',
        description: '+150% all production',
        affects: 'global',
        type: 'multiplier',
        value: 2.5,
        recipe: { enhanced_candle: 2, crystal_core: 3, flowing_current: 2, wind_spiral: 2 },
        unlockAtAb: 80000.0
    },
    {
        id: 'u_global_4',
        displayName: 'Eldritch Binding',
        description: '+300% all production',
        affects: 'global',
        type: 'multiplier',
        value: 4.0,
        recipe: { quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3 },
        unlockAtAb: 500000.0
    },
    {
        id: 'u_global_5',
        displayName: 'Infinity Nexus',
        description: '+500% all production',
        affects: 'global',
        type: 'multiplier',
        value: 6.0,
        recipe: { arcane_candle: 3, void_crystal: 3, quantum_candle: 3, quantum_crystal: 3 },
        unlockAtAb: 5000000.0
    },

    // Tier 3 - Master workstation upgrades
    {
        id: 'u_quantumlab_candle_1',
        displayName: 'Quantum Candle Boost',
        description: '×3 Quantum Candle Forge',
        affects: 'producer:ws_quantum_candle_forge',
        type: 'multiplier',
        value: 3.0,
        recipe: { quantum_candle: 3, enhanced_candle: 5 },
        unlockAtAb: 150000.0
    },
    {
        id: 'u_quantumlab_1',
        displayName: 'Quantum Resonance',
        description: '×3 Quantum Crystal Chamber',
        affects: 'producer:ws_quantum_crystal_chamber',
        type: 'multiplier',
        value: 3.0,
        recipe: { quantum_crystal: 5, crystal_core: 3 },
        unlockAtAb: 350000.0
    },
    {
        id: 'u_quantumlab_aether_1',
        displayName: 'Quantum Aether Amplifier',
        description: '×3 Quantum Water Well',
        affects: 'producer:ws_quantum_water_well',
        type: 'multiplier',
        value: 3.0,
        recipe: { quantum_water: 3, flowing_current: 5 },
        unlockAtAb: 600000.0
    },
    {
        id: 'u_eldritchforge_1',
        displayName: 'Eldritch Power',
        description: '×3 Quantum Air Generator',
        affects: 'producer:ws_quantum_air_generator',
        type: 'multiplier',
        value: 3.0,
        recipe: { quantum_air: 5, wind_spiral: 3 },
        unlockAtAb: 1200000.0
    },
    {
        id: 'u_covenaltar_1',
        displayName: 'Nexus Boost',
        description: '×3 Etheric Bit Reactor',
        affects: 'producer:ws_etheric_bit_reactor',
        type: 'multiplier',
        value: 3.0,
        recipe: { quantum_candle: 3, quantum_water: 2, quantum_air: 2, quantum_crystal: 2 },
        unlockAtAb: 2500000.0
    },

    // Tier 4 - Legendary upgrades (first half)
    {
        id: 'u_arcanetower_1',
        displayName: 'Arcane Mastery',
        description: '×3 Arcane Candle Forge',
        affects: 'producer:ws_arcane_candle_forge',
        type: 'multiplier',
        value: 3.0,
        recipe: { arcane_candle: 5, quantum_candle: 3 },
        unlockAtAb: 6000000.0
    },
    {
        id: 'u_voidchamber_1',
        displayName: 'Void Mastery',
        description: '×3 Void Crystal Chamber',
        affects: 'producer:ws_void_crystal_chamber',
        type: 'multiplier',
        value: 3.0,
        recipe: { void_crystal: 5, quantum_crystal: 3 },
        unlockAtAb: 8000000.0
    },

    // Tier 5 - Legendary upgrades (second half + new tier 5)
    {
        id: 'u_voidliquid_1',
        displayName: 'Void Liquid Mastery',
        description: '×3 Void Liquid Well',
        affects: 'producer:ws_void_liquid_well',
        type: 'multiplier',
        value: 3.0,
        recipe: { void_liquid: 5, void_crystal: 3 },
        unlockAtAb: 10000000.0
    },
    {
        id: 'u_voidbreath_1',
        displayName: 'Void Breath Mastery',
        description: '×3 Void Breath Generator',
        affects: 'producer:ws_void_breath_generator',
        type: 'multiplier',
        value: 3.0,
        recipe: { void_breath: 5, void_crystal: 3 },
        unlockAtAb: 11000000.0
    },
    {
        id: 'u_infinitycore_ab_1',
        displayName: 'Infinity Engine Boost',
        description: '×3 Infinity Bit Reactor',
        affects: 'producer:ws_infinity_bit_reactor',
        type: 'multiplier',
        value: 3.0,
        recipe: { arcane_candle: 3, void_crystal: 3, void_liquid: 3, void_breath: 3 },
        unlockAtAb: 25000000.0
    },

    // Special upgrades
    {
        id: 'u_click_3',
        displayName: 'Master Sigil',
        description: '+5 cast rewards',
        affects: 'click',
        type: 'additive',
        value: 5.0,
        recipe: { enhanced_candle: 10, crystal_core: 5 },
        unlockAtAb: 100000.0
    },
    {
        id: 'u_click_4',
        displayName: 'Eldritch Sigil',
        description: '+10 cast rewards',
        affects: 'click',
        type: 'additive',
        value: 10.0,
        recipe: { quantum_candle: 10, quantum_crystal: 5 },
        unlockAtAb: 1000000.0
    },

    // Focus-related upgrades
    {
        id: 'u_focus_meditation_1',
        displayName: 'Meditative Focus',
        description: '+50% meditation Focus',
        affects: 'meditation_focus',
        type: 'multiplier',
        value: 1.5,
        recipe: { focus: 25, enhanced_candle: 3, crystal_core: 3 },
        unlockAtAb: 8000.0
    },
    {
        id: 'u_focus_conversion_1',
        displayName: 'Focus Conversion',
        description: 'Convert Focus to AB (1 AB = 100 Focus)',
        affects: 'focus_to_ab',
        type: 'conversion',
        value: 0.01, // 100 focus = 1 AB
        recipe: { focus: 100, enhanced_candle: 5, crystal_core: 5 },
        unlockAtAb: 10000.0
    },
    {
        id: 'u_ab_mult_1',
        displayName: 'Arcane Bits Multiplier',
        description: '+50% AB production',
        affects: 'ab_production',
        type: 'multiplier',
        value: 1.5,
        recipe: { dig_candle: 5, crystal_orb: 3, aether_well: 3 },
        unlockAtAb: 2000.0
    },
    {
        id: 'u_ab_mult_2',
        displayName: 'Arcane Bits Amplifier',
        description: '+100% AB production',
        affects: 'ab_production',
        type: 'multiplier',
        value: 2.0,
        recipe: { enhanced_candle: 5, crystal_core: 3, flowing_current: 3, wind_spiral: 3 },
        unlockAtAb: 100000.0
    },
    {
        id: 'u_ab_mult_3',
        displayName: 'Arcane Bits Transcendence',
        description: '+200% AB production',
        affects: 'ab_production',
        type: 'multiplier',
        value: 3.0,
        recipe: { quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3 },
        unlockAtAb: 2000000.0
    },
    {
        id: 'u_ab_mult_4',
        displayName: 'Arcane Bits Infinity',
        description: '+500% AB production',
        affects: 'ab_production',
        type: 'multiplier',
        value: 6.0,
        recipe: { arcane_candle: 3, void_liquid: 3, void_breath: 3, void_crystal: 3 },
        unlockAtAb: 50000000.0
    }
];
