// Game Data Definitions

export const INGREDIENTS = [
    // Tier 0 - Base ingredients
    { id: "wax_bits", displayName: "Wax Bits", tier: 0 },
    { id: "wick_fiber", displayName: "Wick Fiber", tier: 0 },
    { id: "crystal_dust", displayName: "Crystal Dust", tier: 0 },
    { id: "aether_ess", displayName: "Aether Essence", tier: 0 },
    { id: "fire_essence", displayName: "Fire Essence", tier: 0 },
    { id: "water_essence", displayName: "Water Essence", tier: 0 },
    { id: "air_essence", displayName: "Air Essence", tier: 0 },
    
    // Tier 1 - Refined ingredients
    { id: "wax_block", displayName: "Wax Block", tier: 1 },
    { id: "braided_wick", displayName: "Braided Wick", tier: 1 },
    { id: "shaped_crys", displayName: "Shaped Crystal", tier: 1 },
    { id: "dist_aether", displayName: "Distilled Aether", tier: 1 },
    { id: "dig_candle", displayName: "Digital Candle", tier: 1 },
    { id: "crystal_orb", displayName: "Crystal Orb", tier: 1 },
    { id: "aether_well", displayName: "Aether Well", tier: 1 },
    { id: "dist_fire", displayName: "Distilled Fire", tier: 1 },
    { id: "liquid_essence", displayName: "Liquid Essence", tier: 1 },
    { id: "aqua_well", displayName: "Aqua Well", tier: 1 },
    { id: "ethereal_gust", displayName: "Ethereal Gust", tier: 1 },
    { id: "zephyr_totem", displayName: "Zephyr Totem", tier: 1 },
    
    // Tier 2 - Advanced ingredients
    { id: "enhanced_candle", displayName: "Enhanced Candle", tier: 2 },
    { id: "crystal_core", displayName: "Crystal Core", tier: 2 },
    { id: "aether_flux", displayName: "Aether Flux", tier: 2 },
    { id: "wax_hex", displayName: "Wax Hex", tier: 2 },
    { id: "flowing_current", displayName: "Flowing Current", tier: 2 },
    { id: "wind_spiral", displayName: "Wind Spiral", tier: 2 },
    
    // Tier 3 - Master ingredients
    { id: "quantum_candle", displayName: "Quantum Candle", tier: 3 },
    { id: "quantum_essence", displayName: "Quantum Essence", tier: 3 },
    { id: "quantum_aether", displayName: "Quantum Aether", tier: 3 },
    { id: "eldritch_wax", displayName: "Eldritch Wax", tier: 3 },
    { id: "quantum_crystal", displayName: "Quantum Crystal", tier: 3 },
    { id: "quantum_water", displayName: "Quantum Water", tier: 3 },
    { id: "quantum_air", displayName: "Quantum Air", tier: 3 },
    // Legacy ingredients (still used in upgrades/hidden recipes)
    { id: "sigil_charge", displayName: "Sigil Charge", tier: 3 },
    { id: "coven_blessing", displayName: "Coven Blessing", tier: 3 },
    
    // Tier 4 - Legendary ingredients
    { id: "arcane_candle", displayName: "Arcane Candle", tier: 4 },
    { id: "void_crystal", displayName: "Void Crystal", tier: 4 },
    { id: "infinity_flux", displayName: "Infinity Flux", tier: 4 },
    { id: "void_liquid", displayName: "Void Liquid", tier: 4 },
    { id: "void_breath", displayName: "Void Breath", tier: 4 },
    
    // Meditation-exclusive ingredients
    { id: "serenity_essence", displayName: "Serenity Essence", tier: 0, meditationOnly: true },
    { id: "focus_crystal", displayName: "Focus Crystal", tier: 1, meditationOnly: true },
    { id: "tranquil_aether", displayName: "Tranquil Aether", tier: 2, meditationOnly: true },
    { id: "zen_orb", displayName: "Zen Orb", tier: 3, meditationOnly: true },
    { id: "nirvana_essence", displayName: "Nirvana Essence", tier: 4, meditationOnly: true }
];

export const PRODUCERS = [
    // Tier 0 - Basic producers
    {
        id: "ws_melter",
        displayName: "Wax Melter",
        unlockAtAb: 0.0,
        recipe: { wax_bits: 10 },
        growth: 1.10,
        outputs: { wax_block: 0.30 }
    },
    {
        id: "ws_spinner",
        displayName: "Wick Spinner",
        unlockAtAb: 0.0,
        recipe: { wick_fiber: 10 },
        growth: 1.10,
        outputs: { braided_wick: 0.30 }
    },
    {
        id: "ws_shaper",
        displayName: "Crystal Shaper",
        unlockAtAb: 25.0,
        recipe: { crystal_dust: 10 },
        growth: 1.12,
        outputs: { shaped_crys: 0.20 }
    },
    {
        id: "ws_still",
        displayName: "Aether Still",
        unlockAtAb: 50.0,
        recipe: { aether_ess: 10 },
        growth: 1.12,
        outputs: { dist_aether: 0.20 }
    },
    {
        id: "ws_fire_still",
        displayName: "Fire Still",
        unlockAtAb: 55.0,
        recipe: { fire_essence: 10 },
        growth: 1.12,
        outputs: { dist_fire: 0.20 }
    },
    {
        id: "ws_aqua_collector",
        displayName: "Aqua Collector",
        unlockAtAb: 60.0,
        recipe: { water_essence: 10 },
        growth: 1.12,
        outputs: { liquid_essence: 0.20 }
    },
    {
        id: "ws_zephyr_collector",
        displayName: "Zephyr Collector",
        unlockAtAb: 65.0,
        recipe: { air_essence: 10 },
        growth: 1.12,
        outputs: { ethereal_gust: 0.20 }
    },
    
    // Tier 1 - Producers
    {
        id: "ws_digcandle_forge",
        displayName: "Digital Candle Forge",
        unlockAtAb: 75.0,
        recipe: { wax_block: 5, braided_wick: 1, dist_aether: 2 },
        growth: 1.14,
        outputs: { dig_candle: 0.5 }
    },
    {
        id: "ws_crystal",
        displayName: "Crystal Orb Forge",
        unlockAtAb: 250.0,
        recipe: { shaped_crys: 2, dist_aether: 2 },
        growth: 1.14,
        outputs: { crystal_orb: 0.3 }
    },
    {
        id: "ws_cauldron",
        displayName: "Aether Well",
        unlockAtAb: 750.0,
        recipe: { dist_aether: 3, shaped_crys: 2 },
        growth: 1.15,
        outputs: { aether_well: 0.4 }
    },
    {
        id: "ws_candle",
        displayName: "Arcane Bit Forge",
        unlockAtAb: 1500.0,
        recipe: { dig_candle: 2, crystal_orb: 1, aether_well: 1 },
        growth: 1.16,
        outputs: { ab: 2.5 }
    },
    {
        id: "ws_aqua_well",
        displayName: "Aqua Well",
        unlockAtAb: 1000.0,
        recipe: { liquid_essence: 3, shaped_crys: 2 },
        growth: 1.15,
        outputs: { aqua_well: 0.4 }
    },
    {
        id: "ws_zephyr_generator",
        displayName: "Zephyr Generator",
        unlockAtAb: 1200.0,
        recipe: { ethereal_gust: 3, shaped_crys: 2 },
        growth: 1.15,
        outputs: { zephyr_totem: 0.4 }
    },
    
    // Tier 2 - Advanced producers
    {
        id: "ws_digcandle_forge_t2",
        displayName: "Enhanced Candle Forge",
        unlockAtAb: 5000.0,
        recipe: { dig_candle: 2, crystal_orb: 1, aether_well: 1 },
        growth: 1.16,
        outputs: { enhanced_candle: 0.4 }
    },
    {
        id: "ws_coreforge",
        displayName: "Crystal Core Forge",
        unlockAtAb: 10000.0,
        recipe: { crystal_orb: 3, aether_well: 2, dig_candle: 2 },
        growth: 1.17,
        outputs: { crystal_core: 0.3 }
    },
    {
        id: "ws_fluxreactor",
        displayName: "Aether Flux Reactor",
        unlockAtAb: 20000.0,
        recipe: { aether_well: 3, crystal_core: 2, enhanced_candle: 1 },
        growth: 1.18,
        outputs: { aether_flux: 0.4 }
    },
    {
        id: "ws_hexforge",
        displayName: "Wax Hex Forge",
        unlockAtAb: 50000.0,
        recipe: { wax_block: 10, shaped_crys: 5, enhanced_candle: 2 },
        growth: 1.19,
        outputs: { wax_hex: 0.5 }
    },
    {
        id: "ws_sigilforge",
        displayName: "Etheric Bit Reactor",
        unlockAtAb: 75000.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, aether_flux: 2 },
        growth: 1.20,
        outputs: { ab: 5.0 }
    },
    {
        id: "ws_flowing_current",
        displayName: "Flowing Current Generator",
        unlockAtAb: 15000.0,
        recipe: { aqua_well: 3, crystal_core: 2, enhanced_candle: 1 },
        growth: 1.17,
        outputs: { flowing_current: 0.4 }
    },
    {
        id: "ws_wind_spiral",
        displayName: "Wind Spiral Forge",
        unlockAtAb: 18000.0,
        recipe: { zephyr_totem: 3, crystal_core: 2, enhanced_candle: 1 },
        growth: 1.17,
        outputs: { wind_spiral: 0.4 }
    },
    
    // Tier 3 - Master producers
    {
        id: "ws_quantumlab_candle",
        displayName: "Quantum Candle Forge",
        unlockAtAb: 100000.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, aether_flux: 2 },
        growth: 1.20,
        outputs: { quantum_candle: 0.3 }
    },
    {
        id: "ws_quantumlab",
        displayName: "Quantum Essence Lab",
        unlockAtAb: 250000.0,
        recipe: { crystal_core: 5, aether_flux: 3, quantum_candle: 2 },
        growth: 1.21,
        outputs: { quantum_essence: 0.25 }
    },
    {
        id: "ws_quantumlab_aether",
        displayName: "Quantum Aether Chamber",
        unlockAtAb: 500000.0,
        recipe: { aether_flux: 4, quantum_essence: 2, quantum_candle: 2 },
        growth: 1.22,
        outputs: { quantum_aether: 0.2 }
    },
    {
        id: "ws_eldritchforge",
        displayName: "Eldritch Wax Forge",
        unlockAtAb: 1000000.0,
        recipe: { wax_hex: 5, quantum_essence: 3, quantum_aether: 2 },
        growth: 1.23,
        outputs: { eldritch_wax: 0.15 }
    },
    {
        id: "ws_covenaltar",
        displayName: "Cosmic Bit Nexus",
        unlockAtAb: 2000000.0,
        recipe: { quantum_candle: 3, quantum_essence: 2, quantum_aether: 2 },
        growth: 1.24,
        outputs: { ab: 25.0 }
    },
    {
        id: "ws_quantum_crystal",
        displayName: "Quantum Crystal Chamber",
        unlockAtAb: 400000.0,
        recipe: { crystal_core: 4, quantum_essence: 2, quantum_candle: 2 },
        growth: 1.22,
        outputs: { quantum_crystal: 0.2 }
    },
    {
        id: "ws_quantum_water",
        displayName: "Quantum Water Chamber",
        unlockAtAb: 400000.0,
        recipe: { flowing_current: 4, quantum_essence: 2, quantum_candle: 2 },
        growth: 1.22,
        outputs: { quantum_water: 0.2 }
    },
    {
        id: "ws_quantum_air",
        displayName: "Quantum Air Chamber",
        unlockAtAb: 500000.0,
        recipe: { wind_spiral: 4, quantum_essence: 2, quantum_candle: 2 },
        growth: 1.22,
        outputs: { quantum_air: 0.2 }
    },
    
    // Tier 4 - Legendary producers
    {
        id: "ws_arcanetower",
        displayName: "Arcane Candle Tower",
        unlockAtAb: 5000000.0,
        recipe: { quantum_candle: 5, quantum_essence: 3, quantum_aether: 3 },
        growth: 1.25,
        outputs: { arcane_candle: 0.08 }
    },
    {
        id: "ws_voidchamber",
        displayName: "Void Crystal Chamber",
        unlockAtAb: 10000000.0,
        recipe: { quantum_essence: 5, quantum_aether: 3, arcane_candle: 2 },
        growth: 1.26,
        outputs: { void_crystal: 0.05 }
    },
    {
        id: "ws_infinitycore",
        displayName: "Infinity Flux Core",
        unlockAtAb: 25000000.0,
        recipe: { quantum_aether: 5, void_crystal: 2, arcane_candle: 3 },
        growth: 1.27,
        outputs: { infinity_flux: 0.02 }
    },
    {
        id: "ws_infinitycore_ab",
        displayName: "Infinity Bit Engine",
        unlockAtAb: 50000000.0,
        recipe: { arcane_candle: 3, void_crystal: 2, infinity_flux: 1 },
        growth: 1.28,
        outputs: { ab: 750.0 }
    },
    {
        id: "ws_void_liquid",
        displayName: "Void Liquid Core",
        unlockAtAb: 15000000.0,
        recipe: { quantum_water: 5, void_crystal: 3, arcane_candle: 2 },
        growth: 1.27,
        outputs: { void_liquid: 0.05 }
    },
    {
        id: "ws_void_breath",
        displayName: "Void Breath Core",
        unlockAtAb: 20000000.0,
        recipe: { quantum_air: 5, void_crystal: 3, arcane_candle: 2 },
        growth: 1.27,
        outputs: { void_breath: 0.05 }
    }
];

export const UPGRADES = [
    // Tier 0 - Basic upgrades
    {
        id: "u_global_1",
        displayName: "Hex Compiler v1",
        description: "Increases all production by 50%",
        affects: "global",
        type: "multiplier",
        value: 1.5,
        recipe: { wax_block: 2, braided_wick: 2, shaped_crys: 1 },
        unlockAtAb: 0.0
    },
    {
        id: "u_click_1",
        displayName: "Sigil Stroke",
        description: "Adds +1 to all cast rewards",
        affects: "click",
        type: "additive",
        value: 1.0,
        recipe: { wick_fiber: 10 },
        unlockAtAb: 0.0
    },
    {
        id: "u_click_2",
        displayName: "Enhanced Sigil",
        description: "Adds +2 to all cast rewards",
        affects: "click",
        type: "additive",
        value: 2.0,
        recipe: { braided_wick: 5, shaped_crys: 2 },
        unlockAtAb: 500.0
    },
    
    // Tier 1 - Workstation upgrades
    {
        id: "u_digcandle_forge_1",
        displayName: "Candle Algorithm",
        description: "Doubles Digital Candle Forge production",
        affects: "producer:ws_digcandle_forge",
        type: "multiplier",
        value: 2.0,
        recipe: { dig_candle: 5, wax_block: 10 },
        unlockAtAb: 200.0
    },
    {
        id: "u_crystal_1",
        displayName: "Orb Optimization",
        description: "Doubles Crystal Orb Forge production",
        affects: "producer:ws_crystal",
        type: "multiplier",
        value: 2.0,
        recipe: { crystal_orb: 3, shaped_crys: 5 },
        unlockAtAb: 500.0
    },
    {
        id: "u_cauldron_1",
        displayName: "Well Enhancement",
        description: "Doubles Aether Well production",
        affects: "producer:ws_cauldron",
        type: "multiplier",
        value: 2.0,
        recipe: { aether_well: 3, dist_aether: 5 },
        unlockAtAb: 1000.0
    },
    {
        id: "u_candle_1",
        displayName: "Bit Forge Boost",
        description: "Doubles Arcane Bit Forge production",
        affects: "producer:ws_candle",
        type: "multiplier",
        value: 2.0,
        recipe: { dig_candle: 3, crystal_orb: 2, aether_well: 2 },
        unlockAtAb: 2000.0
    },
    // Tier 2 - Workstation upgrades
    {
        id: "u_digcandle_forge_t2_1",
        displayName: "Enhanced Candle Boost",
        description: "Doubles Enhanced Candle Forge production",
        affects: "producer:ws_digcandle_forge_t2",
        type: "multiplier",
        value: 2.0,
        recipe: { enhanced_candle: 3, dig_candle: 5 },
        unlockAtAb: 8000.0
    },
    {
        id: "u_coreforge_1",
        displayName: "Core Enhancement",
        description: "Doubles Crystal Core Forge production",
        affects: "producer:ws_coreforge",
        type: "multiplier",
        value: 2.0,
        recipe: { crystal_core: 2, crystal_orb: 3 },
        unlockAtAb: 15000.0
    },
    {
        id: "u_fluxreactor_1",
        displayName: "Flux Overdrive",
        description: "Doubles Aether Flux Reactor production",
        affects: "producer:ws_fluxreactor",
        type: "multiplier",
        value: 2.0,
        recipe: { aether_flux: 3, aether_well: 5 },
        unlockAtAb: 25000.0
    },
    {
        id: "u_hexforge_1",
        displayName: "Hex Optimization",
        description: "Doubles Wax Hex Forge production",
        affects: "producer:ws_hexforge",
        type: "multiplier",
        value: 2.0,
        recipe: { wax_hex: 3, enhanced_candle: 2 },
        unlockAtAb: 60000.0
    },
    {
        id: "u_sigilforge_1",
        displayName: "Reactor Boost",
        description: "Doubles Etheric Bit Reactor production",
        affects: "producer:ws_sigilforge",
        type: "multiplier",
        value: 2.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, aether_flux: 2 },
        unlockAtAb: 100000.0
    },
    
    // Tier 2 - Global upgrades
    {
        id: "u_global_2",
        displayName: "Sigil Cache",
        description: "Increases all production by 80%",
        affects: "global",
        type: "multiplier",
        value: 1.8,
        recipe: { wax_block: 3, shaped_crys: 2, dist_aether: 2 },
        unlockAtAb: 500.0
    },
    {
        id: "u_global_3",
        displayName: "Coven Pact",
        description: "Increases all production by 150%",
        affects: "global",
        type: "multiplier",
        value: 2.5,
        recipe: { enhanced_candle: 2, crystal_core: 3, aether_flux: 2 },
        unlockAtAb: 80000.0
    },
    {
        id: "u_global_4",
        displayName: "Eldritch Binding",
        description: "Increases all production by 300%",
        affects: "global",
        type: "multiplier",
        value: 4.0,
        recipe: { quantum_essence: 5, quantum_aether: 3, quantum_candle: 2 },
        unlockAtAb: 500000.0
    },
    {
        id: "u_global_5",
        displayName: "Infinity Nexus",
        description: "Increases all production by 500%",
        affects: "global",
        type: "multiplier",
        value: 6.0,
        recipe: { eldritch_wax: 5, arcane_candle: 3, void_crystal: 2 },
        unlockAtAb: 5000000.0
    },
    
    // Tier 3 - Master workstation upgrades
    {
        id: "u_quantumlab_candle_1",
        displayName: "Quantum Candle Boost",
        description: "Triples Quantum Candle Forge production",
        affects: "producer:ws_quantumlab_candle",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_candle: 3, enhanced_candle: 5 },
        unlockAtAb: 150000.0
    },
    {
        id: "u_quantumlab_1",
        displayName: "Quantum Resonance",
        description: "Triples Quantum Essence Lab production",
        affects: "producer:ws_quantumlab",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_essence: 5, crystal_core: 3 },
        unlockAtAb: 350000.0
    },
    {
        id: "u_quantumlab_aether_1",
        displayName: "Quantum Aether Amplifier",
        description: "Triples Quantum Aether Chamber production",
        affects: "producer:ws_quantumlab_aether",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_aether: 3, aether_flux: 5 },
        unlockAtAb: 600000.0
    },
    {
        id: "u_eldritchforge_1",
        displayName: "Eldritch Power",
        description: "Triples Eldritch Wax Forge production",
        affects: "producer:ws_eldritchforge",
        type: "multiplier",
        value: 3.0,
        recipe: { eldritch_wax: 5, wax_hex: 3 },
        unlockAtAb: 1200000.0
    },
    {
        id: "u_covenaltar_1",
        displayName: "Nexus Boost",
        description: "Triples Cosmic Bit Nexus production",
        affects: "producer:ws_covenaltar",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_candle: 3, quantum_essence: 2, quantum_aether: 2 },
        unlockAtAb: 2500000.0
    },
    
    // Tier 4 - Legendary upgrades
    {
        id: "u_arcanetower_1",
        displayName: "Arcane Mastery",
        description: "Triples Arcane Candle Tower production",
        affects: "producer:ws_arcanetower",
        type: "multiplier",
        value: 3.0,
        recipe: { arcane_candle: 5, quantum_candle: 3 },
        unlockAtAb: 6000000.0
    },
    {
        id: "u_voidchamber_1",
        displayName: "Void Mastery",
        description: "Triples Void Crystal Chamber production",
        affects: "producer:ws_voidchamber",
        type: "multiplier",
        value: 3.0,
        recipe: { void_crystal: 5, quantum_essence: 3 },
        unlockAtAb: 12000000.0
    },
    {
        id: "u_infinitycore_1",
        displayName: "Flux Mastery",
        description: "Triples Infinity Flux Core production",
        affects: "producer:ws_infinitycore",
        type: "multiplier",
        value: 3.0,
        recipe: { infinity_flux: 3, quantum_aether: 5 },
        unlockAtAb: 30000000.0
    },
    {
        id: "u_infinitycore_ab_1",
        displayName: "Infinity Engine Boost",
        description: "Triples Infinity Bit Engine production",
        affects: "producer:ws_infinitycore_ab",
        type: "multiplier",
        value: 3.0,
        recipe: { arcane_candle: 3, void_crystal: 2, infinity_flux: 1 },
        unlockAtAb: 60000000.0
    },
    
    // Special upgrades
    {
        id: "u_click_3",
        displayName: "Master Sigil",
        description: "Adds +5 to all cast rewards",
        affects: "click",
        type: "additive",
        value: 5.0,
        recipe: { sigil_charge: 10, quantum_essence: 5 },
        unlockAtAb: 100000.0
    },
    {
        id: "u_click_4",
        displayName: "Eldritch Sigil",
        description: "Adds +10 to all cast rewards",
        affects: "click",
        type: "additive",
        value: 10.0,
        recipe: { eldritch_wax: 10, arcane_candle: 5 },
        unlockAtAb: 1000000.0
    },
    {
        id: "u_ab_mult_1",
        displayName: "AB Multiplier",
        description: "Increases all AB production by 50%",
        affects: "ab_production",
        type: "multiplier",
        value: 1.5,
        recipe: { dig_candle: 5, crystal_orb: 3, aether_well: 3 },
        unlockAtAb: 2000.0
    },
    {
        id: "u_ab_mult_2",
        displayName: "AB Amplifier",
        description: "Increases all AB production by 100%",
        affects: "ab_production",
        type: "multiplier",
        value: 2.0,
        recipe: { enhanced_candle: 5, crystal_core: 3, aether_flux: 3 },
        unlockAtAb: 100000.0
    },
    {
        id: "u_ab_mult_3",
        displayName: "AB Transcendence",
        description: "Increases all AB production by 200%",
        affects: "ab_production",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_candle: 5, quantum_essence: 3, quantum_aether: 3 },
        unlockAtAb: 2000000.0
    },
    {
        id: "u_ab_mult_4",
        displayName: "AB Infinity",
        description: "Increases all AB production by 500%",
        affects: "ab_production",
        type: "multiplier",
        value: 6.0,
        recipe: { arcane_candle: 5, void_crystal: 3, infinity_flux: 2 },
        unlockAtAb: 50000000.0
    }
];

export const PRESTIGE_BONUSES = [
    // Global production bonuses
    {
        id: "pp_global_1",
        displayName: "Coven's Oath",
        description: "+10% global production per level",
        type: "global_mult",
        value: 0.10,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    {
        id: "pp_global_2",
        displayName: "Eldritch Pact",
        description: "+25% global production per level",
        type: "global_mult",
        value: 0.25,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_global_3",
        displayName: "Infinity Binding",
        description: "+50% global production per level",
        type: "global_mult",
        value: 0.50,
        baseCostPp: 200.0,
        costGrowth: 1.5
    },
    
    // Starting currency bonuses
    {
        id: "pp_start_bits",
        displayName: "Seeded Spellbook",
        description: "+1000 AB at start per level",
        type: "starting_currency",
        value: 1000.0,
        baseCostPp: 5.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_bits_2",
        displayName: "Enchanted Tome",
        description: "+10000 AB at start per level",
        type: "starting_currency",
        value: 10000.0,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_bits_3",
        displayName: "Arcane Library",
        description: "+100000 AB at start per level",
        type: "starting_currency",
        value: 100000.0,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    
    // Producer-specific bonuses
    {
        id: "pp_digcandle_forge_mult",
        displayName: "Candle Moon",
        description: "+5% Digital Candle Forge production per level",
        type: "producer_mult",
        param: "ws_digcandle_forge",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_crystal_mult",
        displayName: "Orb Star",
        description: "+5% Crystal Orb Forge production per level",
        type: "producer_mult",
        param: "ws_crystal",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_cauldron_mult",
        displayName: "Well Constellation",
        description: "+5% Aether Well production per level",
        type: "producer_mult",
        param: "ws_cauldron",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_candle_mult",
        displayName: "Bit Forge Star",
        description: "+5% Arcane Bit Forge production per level",
        type: "producer_mult",
        param: "ws_candle",
        value: 0.05,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    {
        id: "pp_sigilforge_mult",
        displayName: "Reactor Star",
        description: "+5% Etheric Bit Reactor production per level",
        type: "producer_mult",
        param: "ws_sigilforge",
        value: 0.05,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: "pp_quantumlab_mult",
        displayName: "Quantum Constellation",
        description: "+5% Quantum Essence Lab production per level",
        type: "producer_mult",
        param: "ws_quantumlab",
        value: 0.05,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: "pp_covenaltar_mult",
        displayName: "Nexus Star",
        description: "+5% Cosmic Bit Nexus production per level",
        type: "producer_mult",
        param: "ws_covenaltar",
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_eldritchforge_mult",
        displayName: "Eldritch Star",
        description: "+5% Eldritch Wax Forge production per level",
        type: "producer_mult",
        param: "ws_eldritchforge",
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_arcanetower_mult",
        displayName: "Arcane Star",
        description: "+5% Arcane Candle Tower production per level",
        type: "producer_mult",
        param: "ws_arcanetower",
        value: 0.05,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    {
        id: "pp_voidchamber_mult",
        displayName: "Void Star",
        description: "+5% Void Crystal Chamber production per level",
        type: "producer_mult",
        param: "ws_voidchamber",
        value: 0.05,
        baseCostPp: 200.0,
        costGrowth: 1.5
    },
    {
        id: "pp_infinitycore_mult",
        displayName: "Infinity Star",
        description: "+5% Infinity Flux Core production per level",
        type: "producer_mult",
        param: "ws_infinitycore",
        value: 0.05,
        baseCostPp: 500.0,
        costGrowth: 1.5
    },
    {
        id: "pp_infinitycore_ab_mult",
        displayName: "Engine Star",
        description: "+5% Infinity Bit Engine production per level",
        type: "producer_mult",
        param: "ws_infinitycore_ab",
        value: 0.05,
        baseCostPp: 1000.0,
        costGrowth: 1.5
    },
    
    // Starting ingredient bonuses
    {
        id: "pp_start_ingred",
        displayName: "Pocket Satchel",
        description: "+100 Wax Bits at start per level",
        type: "start_ingredient",
        param: "wax_bits",
        value: 100.0,
        baseCostPp: 6.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_ingred_2",
        displayName: "Enchanted Pouch",
        description: "+1000 Wax Bits at start per level",
        type: "start_ingredient",
        param: "wax_bits",
        value: 1000.0,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_crystal",
        displayName: "Crystal Cache",
        description: "+50 Crystal Cores at start per level",
        type: "start_ingredient",
        param: "crystal_core",
        value: 50.0,
        baseCostPp: 30.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_sigil",
        displayName: "Sigil Reserve",
        description: "+10 Sigil Charges at start per level",
        type: "start_ingredient",
        param: "sigil_charge",
        value: 10.0,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    
    // Special bonuses
    {
        id: "pp_ab_mult",
        displayName: "AB Amplifier",
        description: "+10% AB production per level",
        type: "ab_production_mult",
        value: 0.10,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: "pp_click_mult",
        displayName: "Cast Mastery",
        description: "+5% cast rewards per level",
        type: "click_mult",
        value: 0.05,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: "pp_prestige_speed",
        displayName: "Ascension Speed",
        description: "+1% prestige point gain per level",
        type: "prestige_speed",
        value: 0.01,
        baseCostPp: 100.0,
        costGrowth: 1.5
    }
];

export const DAILY_TASKS_POOL = [
    // Tier 0 - Basic tasks
    {
        id: "d_kindle",
        displayName: "Kindle the Grid",
        description: "Craft 3 Wax Melters",
        condition: "craft:workstation:ws_melter:3",
        rewardType: "ab",
        rewardValue: 5000.0
    },
    {
        id: "d_spin",
        displayName: "Weave the Threads",
        description: "Craft 3 Wick Spinners",
        condition: "craft:workstation:ws_spinner:3",
        rewardType: "ab",
        rewardValue: 5000.0
    },
    {
        id: "d_shape",
        displayName: "Crystal Shaping",
        description: "Craft 2 Crystal Shapers",
        condition: "craft:workstation:ws_shaper:2",
        rewardType: "ab",
        rewardValue: 7500.0
    },
    {
        id: "d_still",
        displayName: "Aether Distillation",
        description: "Craft 2 Aether Stills",
        condition: "craft:workstation:ws_still:2",
        rewardType: "ab",
        rewardValue: 7500.0
    },
    
    // Tier 1 - Intermediate tasks
    {
        id: "d_song",
        displayName: "Crystal Song",
        description: "Own 3 Crystal Orb Forges",
        condition: "own:workstation:ws_crystal:3",
        rewardType: "buff",
        rewardValue: 900.0,
        buffMultiplier: 0.10
    },
    {
        id: "d_forge",
        displayName: "Digital Crafting",
        description: "Craft 2 Digital Candle Forges",
        condition: "craft:workstation:ws_digcandle_forge:2",
        rewardType: "ab",
        rewardValue: 10000.0
    },
    {
        id: "d_well",
        displayName: "Aether Well",
        description: "Own 2 Aether Wells",
        condition: "own:workstation:ws_cauldron:2",
        rewardType: "buff",
        rewardValue: 1200.0,
        buffMultiplier: 0.12
    },
    
    // Tier 2 - Advanced tasks
    {
        id: "d_enhanced",
        displayName: "Enhanced Production",
        description: "Craft 2 Enhanced Candle Forges",
        condition: "craft:workstation:ws_digcandle_forge_t2:2",
        rewardType: "ab",
        rewardValue: 25000.0
    },
    {
        id: "d_core",
        displayName: "Core Forging",
        description: "Own 2 Crystal Core Forges",
        condition: "own:workstation:ws_coreforge:2",
        rewardType: "buff",
        rewardValue: 1800.0,
        buffMultiplier: 0.15
    },
    {
        id: "d_flux",
        displayName: "Flux Reactor",
        description: "Craft 1 Aether Flux Reactor",
        condition: "craft:workstation:ws_fluxreactor:1",
        rewardType: "ab",
        rewardValue: 30000.0
    },
    
    // Tier 3 - Master tasks
    {
        id: "d_quantum",
        displayName: "Quantum Forging",
        description: "Craft 1 Quantum Candle Forge",
        condition: "craft:workstation:ws_quantumlab_candle:1",
        rewardType: "ab",
        rewardValue: 50000.0
    },
    {
        id: "d_essence",
        displayName: "Quantum Essence",
        description: "Own 1 Quantum Essence Lab",
        condition: "own:workstation:ws_quantumlab:1",
        rewardType: "buff",
        rewardValue: 2400.0,
        buffMultiplier: 0.20
    },
    
    // Tier 4 - Legendary tasks
    {
        id: "d_arcane",
        displayName: "Arcane Tower",
        description: "Craft 1 Arcane Candle Tower",
        condition: "craft:workstation:ws_arcanetower:1",
        rewardType: "ab",
        rewardValue: 100000.0
    },
    {
        id: "d_void",
        displayName: "Void Crystal",
        description: "Own 1 Void Crystal Chamber",
        condition: "own:workstation:ws_voidchamber:1",
        rewardType: "buff",
        rewardValue: 3600.0,
        buffMultiplier: 0.25
    },
    
    // General tasks
    {
        id: "d_flow",
        displayName: "Rite of Flow",
        description: "Cast 150 times",
        condition: "tap:150",
        rewardType: "ek_frag",
        rewardValue: 1.0
    },
    {
        id: "d_ab_earn",
        displayName: "Accumulate Power",
        description: "Earn 10000 AB",
        condition: "earn_ab:10000",
        rewardType: "ab",
        rewardValue: 5000.0
    },
    {
        id: "d_experiment",
        displayName: "Experimentation",
        description: "Discover 3 recipes",
        condition: "discover_recipe:3",
        rewardType: "ab",
        rewardValue: 15000.0
    },
    {
        id: "d_potions",
        displayName: "Potion Master",
        description: "Craft 5 temporary buff potions",
        condition: "craft_potion:5",
        rewardType: "buff",
        rewardValue: 600.0,
        buffMultiplier: 0.15
    },
    
    // Meditation tasks
    {
        id: "d_meditation",
        displayName: "Meditation Session",
        description: "Complete 3 meditation waves",
        condition: "meditation_waves:3",
        rewardType: "ab",
        rewardValue: 20000.0
    },
    {
        id: "d_towers",
        displayName: "Tower Defense",
        description: "Place 5 meditation towers",
        condition: "meditation_towers:5",
        rewardType: "ab",
        rewardValue: 15000.0
    },
    {
        id: "d_focus",
        displayName: "Focus Accumulation",
        description: "Earn 100 Focus",
        condition: "earn_focus:100",
        rewardType: "ab",
        rewardValue: 10000.0
    }
];

export const HIDDEN_RECIPES = [
    // Tier 1 - Temporary Buff Potions
    {
        id: "production_elixir",
        inputs: { dig_candle: 3, crystal_orb: 2, aether_well: 1 },
        outputs: { production_elixir: 1 },
        name: "Production Elixir",
        description: "✨ TEMPORARY: +50% production for 30 minutes"
    },
    {
        id: "haste_potion",
        inputs: { dig_candle: 2, dist_aether: 5 },
        outputs: { haste_potion: 1 },
        name: "Haste Potion",
        description: "⚡ TEMPORARY: +100% cast speed for 15 minutes"
    },
    {
        id: "ab_amplifier_potion",
        inputs: { crystal_orb: 5, aether_well: 3 },
        outputs: { ab_amplifier: 1 },
        name: "AB Amplifier Potion",
        description: "💰 TEMPORARY: +200% AB production for 20 minutes"
    },
    
    // Tier 2 - Temporary Buff Potions
    {
        id: "mega_production_elixir",
        inputs: { enhanced_candle: 3, crystal_core: 2, aether_flux: 1 },
        outputs: { mega_production_elixir: 1 },
        name: "Mega Production Elixir",
        description: "✨ TEMPORARY: +100% production for 1 hour"
    },
    {
        id: "speed_essence",
        inputs: { enhanced_candle: 2, crystal_core: 3 },
        outputs: { speed_essence: 1 },
        name: "Speed Essence",
        description: "⚡ TEMPORARY: +200% cast speed for 30 minutes"
    },
    {
        id: "ab_turbo_charge",
        inputs: { crystal_core: 5, aether_flux: 3 },
        outputs: { ab_turbo_charge: 1 },
        name: "AB Turbo Charge",
        description: "💰 TEMPORARY: +500% AB production for 45 minutes"
    },
    {
        id: "rare_material_catalyst",
        inputs: { enhanced_candle: 5, crystal_core: 3, aether_flux: 2 },
        outputs: { rare_catalyst: 1 },
        name: "Rare Material Catalyst",
        description: "🔮 TEMPORARY: Double all ingredient production for 1 hour"
    },
    
    // Tier 3 - Temporary Buff Potions
    {
        id: "ultimate_production_elixir",
        inputs: { quantum_candle: 3, quantum_essence: 2, quantum_aether: 1 },
        outputs: { ultimate_production_elixir: 1 },
        name: "Ultimate Production Elixir",
        description: "✨ TEMPORARY: +200% production for 2 hours"
    },
    {
        id: "quantum_speed_boost",
        inputs: { quantum_candle: 2, quantum_essence: 3 },
        outputs: { quantum_speed_boost: 1 },
        name: "Quantum Speed Boost",
        description: "⚡ TEMPORARY: +300% cast speed for 1 hour"
    },
    {
        id: "ab_overdrive",
        inputs: { quantum_essence: 5, quantum_aether: 3 },
        outputs: { ab_overdrive: 1 },
        name: "AB Overdrive",
        description: "💰 TEMPORARY: +1000% AB production for 1.5 hours"
    },
    {
        id: "master_catalyst",
        inputs: { quantum_candle: 5, quantum_essence: 3, quantum_aether: 2 },
        outputs: { master_catalyst: 1 },
        name: "Master Catalyst",
        description: "🔮 TEMPORARY: Triple all ingredient production for 2 hours"
    },
    {
        id: "prestige_boost_potion",
        inputs: { quantum_candle: 3, quantum_essence: 5, quantum_aether: 3 },
        outputs: { prestige_boost: 1 },
        name: "Prestige Boost Potion",
        description: "⭐ TEMPORARY: +50% prestige point gain for 3 hours"
    },
    
    // Tier 4 - Temporary Buff Potions
    {
        id: "infinity_production_elixir",
        inputs: { arcane_candle: 3, void_crystal: 2, infinity_flux: 1 },
        outputs: { infinity_production_elixir: 1 },
        name: "Infinity Production Elixir",
        description: "✨ TEMPORARY: +500% production for 4 hours"
    },
    {
        id: "void_speed_surge",
        inputs: { arcane_candle: 2, void_crystal: 3 },
        outputs: { void_speed_surge: 1 },
        name: "Void Speed Surge",
        description: "⚡ TEMPORARY: +500% cast speed for 2 hours"
    },
    {
        id: "ab_infinity_boost",
        inputs: { void_crystal: 5, infinity_flux: 3 },
        outputs: { ab_infinity_boost: 1 },
        name: "AB Infinity Boost",
        description: "💰 TEMPORARY: +2000% AB production for 3 hours"
    },
    {
        id: "infinity_catalyst",
        inputs: { arcane_candle: 5, void_crystal: 3, infinity_flux: 2 },
        outputs: { infinity_catalyst: 1 },
        name: "Infinity Catalyst",
        description: "🔮 TEMPORARY: 5x all ingredient production for 4 hours"
    },
    {
        id: "prestige_mastery_potion",
        inputs: { arcane_candle: 3, void_crystal: 5, infinity_flux: 3 },
        outputs: { prestige_mastery: 1 },
        name: "Prestige Mastery Potion",
        description: "⭐ TEMPORARY: +100% prestige point gain for 6 hours"
    }
];

// Meditation Tower Defense Data

export const MEDITATION_TOWERS = [
    // Tier 0 - Basic meditation circles
    {
        id: "peace_circle",
        displayName: "Peace Circle",
        tier: 0,
        recipe: { wax_bits: 5, wick_fiber: 5 },
        damage: 10,
        range: 2,
        attackSpeed: 1.0, // attacks per second
        cost: { serenity_essence: 0.1 } // Focus cost per attack
    },
    {
        id: "focus_ring",
        displayName: "Focus Ring",
        tier: 0,
        recipe: { crystal_dust: 5, aether_ess: 5 },
        damage: 15,
        range: 2.5,
        attackSpeed: 1.2,
        cost: { serenity_essence: 0.15 }
    },
    // Tier 1 - Enhanced circles
    {
        id: "tranquility_shrine",
        displayName: "Tranquility Shrine",
        tier: 1,
        recipe: { wax_block: 3, braided_wick: 2, shaped_crys: 2 },
        damage: 25,
        range: 3,
        attackSpeed: 1.5,
        cost: { focus_crystal: 0.2 }
    },
    {
        id: "serenity_altar",
        displayName: "Serenity Altar",
        tier: 1,
        recipe: { dig_candle: 2, crystal_orb: 2, dist_aether: 3 },
        damage: 30,
        range: 3.5,
        attackSpeed: 1.3,
        cost: { focus_crystal: 0.25 }
    },
    // Tier 2 - Advanced sanctuaries
    {
        id: "zen_pavilion",
        displayName: "Zen Pavilion",
        tier: 2,
        recipe: { enhanced_candle: 2, crystal_core: 2, aether_flux: 2 },
        damage: 50,
        range: 4,
        attackSpeed: 2.0,
        cost: { tranquil_aether: 0.3 }
    },
    {
        id: "meditation_temple",
        displayName: "Meditation Temple",
        tier: 2,
        recipe: { wax_hex: 3, crystal_core: 2, aether_flux: 3 },
        damage: 60,
        range: 4.5,
        attackSpeed: 1.8,
        cost: { tranquil_aether: 0.35 }
    },
    // Tier 3 - Master sanctuaries
    {
        id: "quantum_sanctum",
        displayName: "Quantum Sanctum",
        tier: 3,
        recipe: { quantum_candle: 2, quantum_essence: 2, quantum_aether: 2 },
        damage: 100,
        range: 5,
        attackSpeed: 2.5,
        cost: { zen_orb: 0.5 }
    },
    // Tier 4 - Legendary sanctuaries
    {
        id: "nirvana_sanctuary",
        displayName: "Nirvana Sanctuary",
        tier: 4,
        recipe: { arcane_candle: 2, void_crystal: 2, infinity_flux: 2 },
        damage: 200,
        range: 6,
        attackSpeed: 3.0,
        cost: { nirvana_essence: 1.0 }
    }
];

export const MEDITATION_DISTRACTIONS = [
    // Tier 0 - Basic distractions
    {
        id: "anxiety",
        displayName: "Anxiety",
        tier: 0,
        health: 20,
        speed: 1.0,
        damage: 1,
        reward: { serenity_essence: 0.5, focus: 1.0 }
    },
    {
        id: "stress",
        displayName: "Stress",
        tier: 0,
        health: 30,
        speed: 0.8,
        damage: 2,
        reward: { serenity_essence: 0.7, focus: 1.5 }
    },
    // Tier 1 - Moderate distractions
    {
        id: "chaos",
        displayName: "Chaos",
        tier: 1,
        health: 50,
        speed: 1.2,
        damage: 3,
        reward: { focus_crystal: 0.3, focus: 2.5 }
    },
    {
        id: "doubt",
        displayName: "Doubt",
        tier: 1,
        health: 70,
        speed: 1.0,
        damage: 4,
        reward: { focus_crystal: 0.4, focus: 3.0 }
    },
    // Tier 2 - Advanced distractions
    {
        id: "despair",
        displayName: "Despair",
        tier: 2,
        health: 100,
        speed: 0.9,
        damage: 6,
        reward: { tranquil_aether: 0.5, focus: 5.0 }
    },
    {
        id: "turmoil",
        displayName: "Turmoil",
        tier: 2,
        health: 150,
        speed: 1.1,
        damage: 8,
        reward: { tranquil_aether: 0.7, focus: 7.0 }
    },
    // Tier 3 - Master distractions
    {
        id: "void_fear",
        displayName: "Void Fear",
        tier: 3,
        health: 250,
        speed: 1.0,
        damage: 12,
        reward: { zen_orb: 0.5, focus: 12.0 }
    },
    // Tier 4 - Legendary distractions
    {
        id: "cosmic_chaos",
        displayName: "Cosmic Chaos",
        tier: 4,
        health: 500,
        speed: 0.8,
        damage: 20,
        reward: { nirvana_essence: 1.0, focus: 25.0 }
    }
];

export const MEDITATION_UPGRADES = [
    // Meditation mode upgrades
    {
        id: "med_focus_1",
        displayName: "Deep Focus",
        description: "Increases Focus generation by 50%",
        affects: "meditation",
        type: "focus_generation",
        value: 1.5,
        recipe: { serenity_essence: 10 },
        unlockAtFocus: 0.0
    },
    {
        id: "med_tower_1",
        displayName: "Tower Mastery",
        description: "Increases all tower damage by 25%",
        affects: "meditation",
        type: "tower_damage",
        value: 1.25,
        recipe: { focus_crystal: 5, serenity_essence: 10 },
        unlockAtFocus: 50.0
    },
    {
        id: "med_tranquility_1",
        displayName: "Inner Peace",
        description: "Increases maximum Tranquility by 50",
        affects: "meditation",
        type: "tranquility_max",
        value: 50,
        recipe: { tranquil_aether: 3, focus_crystal: 5 },
        unlockAtFocus: 200.0
    },
    {
        id: "med_rhythm_1",
        displayName: "Rhythm Mastery",
        description: "Increases rhythm bonus multiplier by 25%",
        affects: "meditation",
        type: "rhythm_bonus",
        value: 1.25,
        recipe: { zen_orb: 2, tranquil_aether: 5 },
        unlockAtFocus: 500.0
    },
    // Main game integration upgrades
    {
        id: "med_production_boost",
        displayName: "Meditative Production",
        description: "Meditation bonuses increase main game production by 10%",
        affects: "global",
        type: "production_multiplier",
        value: 1.1,
        recipe: { nirvana_essence: 1, zen_orb: 5 },
        unlockAtFocus: 1000.0
    },
    {
        id: "med_ek_conversion",
        displayName: "Enlightened Ascension",
        description: "Convert Focus to Eldritch Keys (1 EK per 1000 Focus)",
        affects: "prestige",
        type: "ek_conversion",
        value: 0.001, // 1000 Focus = 1 EK
        recipe: { nirvana_essence: 5, zen_orb: 10 },
        unlockAtFocus: 2000.0
    }
];

