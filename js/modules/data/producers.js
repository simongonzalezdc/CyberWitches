export const PRODUCERS = [
    // Tier 0 - Basic producers (5 workstations: one per element)
    // Fire - Forge
    {
        id: 'ws_fire_forge',
        displayName: 'Fire Forge',
        description: 'A digital preservation chamber that compiles Fire essence into stable data structures. Every forge you program is a small victory against entropy.',
        unlockAtAb: 0.0,
        recipe: { fire_essence: 10 },
        growth: 1.12,
        outputs: { dist_fire: 0.20 },
        element: 'fire'
    },
    // Water - Well
    {
        id: 'ws_aqua_well',
        displayName: 'Aqua Well',
        description: 'A digital preservation chamber that encodes Water essence into flowing data streams. Constant data circulation preserves what static storage would lose.',
        unlockAtAb: 0.0,
        recipe: { water_essence: 10 },
        growth: 1.12,
        outputs: { liquid_essence: 0.20 },
        element: 'water'
    },
    // Air - Generator
    {
        id: 'ws_zephyr_generator',
        displayName: 'Zephyr Generator',
        description: 'A preservation chamber that stabilizes Air essence before it fades. Constant circulation creates a barrier against entropy.',
        unlockAtAb: 0.0,
        recipe: { air_essence: 10 },
        growth: 1.12,
        outputs: { ethereal_gust: 0.20 },
        element: 'air'
    },
    // Crystal - Chamber
    {
        id: 'ws_crystal_chamber',
        displayName: 'Crystal Chamber',
        description: 'A preservation chamber that stabilizes Crystal essence before it fades. Crystal structures resist entropy better than other elements—the foundation of all preservation work.',
        unlockAtAb: 0.0,
        recipe: { crystal_dust: 10 },
        growth: 1.12,
        outputs: { shaped_crys: 0.20 },
        element: 'crystal'
    },
    // Aether - Synthesizer (combines all 4 elements to create Aether)
    {
        id: 'ws_aether_synthesizer',
        displayName: 'Aether Synthesizer',
        description: 'A digital chamber that runs synthesis algorithms to merge all four elemental data streams into Aether. Aether—the binding force—fades fastest, but compiled together, elements resist entropy better than apart.',
        unlockAtAb: 0.0,
        recipe: {
            fire_essence: 2,
            water_essence: 2,
            air_essence: 2,
            crystal_dust: 2
        },
        growth: 1.12,
        outputs: { dist_aether: 0.20 },
        element: 'aether'
    },

    // Tier 1 - Early Game Producers (5 workstations: one per element)
    // Fire - Forge
    {
        id: 'ws_digcandle_forge',
        displayName: 'Digital Candle Forge',
        unlockAtAb: 75.0,
        recipe: { dist_fire: 3, shaped_crys: 2 },
        growth: 1.14,
        outputs: { dig_candle: 0.4 },
        element: 'fire'
    },
    // Water - Well
    {
        id: 'ws_aqua_well_t1',
        displayName: 'Deep Aqua Well',
        unlockAtAb: 100.0,
        recipe: { liquid_essence: 3, shaped_crys: 2 },
        growth: 1.14,
        outputs: { aqua_well: 0.4 },
        element: 'water'
    },
    // Air - Generator
    {
        id: 'ws_zephyr_generator_t1',
        displayName: 'Enhanced Zephyr Generator',
        unlockAtAb: 125.0,
        recipe: { ethereal_gust: 3, shaped_crys: 2 },
        growth: 1.14,
        outputs: { zephyr_totem: 0.4 },
        element: 'air'
    },
    // Crystal - Chamber
    {
        id: 'ws_crystal_chamber_t1',
        displayName: 'Crystal Orb Chamber',
        unlockAtAb: 150.0,
        recipe: { shaped_crys: 3, dist_fire: 1, dist_aether: 1 },
        growth: 1.14,
        outputs: { crystal_orb: 0.4 },
        element: 'crystal'
    },
    // Aether - Reactor
    {
        id: 'ws_aether_reactor_t1',
        displayName: 'Aether Reactor',
        unlockAtAb: 200.0,
        recipe: { dist_aether: 3, shaped_crys: 2 },
        growth: 1.15,
        outputs: { aether_well: 0.4 },
        element: 'aether'
    },

    // ===== NEW: Tier 1.5 - Mid-Game Bridge Producers (fills 200-5000 AB gap) =====
    // Aether Fusion Chamber - Combines multiple Tier 1 ingredients
    {
        id: 'ws_aether_fusion_chamber',
        displayName: 'Aether Fusion Chamber',
        description: 'A complex preservation chamber that fuses multiple aether sources into a more stable form. Layering preservation techniques creates compound stability—each layer reinforces the others.',
        unlockAtAb: 500.0,
        recipe: {
            aether_well: 3,
            dist_aether: 5,
            crystal_orb: 2,
            dig_candle: 2
        },
        growth: 1.145,
        outputs: { fused_aether: 0.5 },
        element: 'aether'
    },
    // Resonance Crystallizer - Creates resonant crystals
    {
        id: 'ws_resonance_crystallizer',
        displayName: 'Resonance Crystallizer',
        description: 'Uses harmonic vibrations to create crystals that resonate with magical frequencies. Far more stable than ordinary crystals.',
        unlockAtAb: 750.0,
        recipe: {
            crystal_orb: 4,
            shaped_crys: 8,
            zephyr_totem: 3,
            fused_aether: 2
        },
        growth: 1.15,
        outputs: { resonant_crystal: 0.45 },
        element: 'crystal'
    },
    // Harmonic Stabilizer - Produces harmonic essence AND AB
    {
        id: 'ws_harmonic_stabilizer',
        displayName: 'Harmonic Stabilizer',
        description: 'A sophisticated chamber that uses resonant frequencies to stabilize magic. Produces both harmonic essence and small amounts of Arcane Bits.',
        unlockAtAb: 1000.0,
        recipe: {
            fused_aether: 3,
            resonant_crystal: 2,
            dig_candle: 3,
            aqua_well: 3,
            zephyr_totem: 3
        },
        growth: 1.155,
        outputs: {
            harmonic_essence: 0.35,
            ab: 0.5  // Small AB production to help progression
        },
        element: 'aether'
    },

    // Tier 2 - Mid Game Producers (5 workstations: one per element + Arcane Bits producer)
    // Fire - Forge
    {
        id: 'ws_enhanced_candle_forge',
        displayName: 'Enhanced Candle Forge',
        unlockAtAb: 5000.0,
        recipe: { dig_candle: 2, crystal_orb: 1, aether_well: 1 },
        growth: 1.16,
        outputs: { enhanced_candle: 0.4 },
        element: 'fire'
    },
    // Water - Well
    {
        id: 'ws_flowing_current_well',
        displayName: 'Flowing Current Well',
        unlockAtAb: 6000.0,
        recipe: { aqua_well: 3, crystal_orb: 2, dig_candle: 1 },
        growth: 1.16,
        outputs: { flowing_current: 0.4 },
        element: 'water'
    },
    // Air - Generator
    {
        id: 'ws_wind_spiral_generator',
        displayName: 'Wind Spiral Generator',
        unlockAtAb: 7000.0,
        recipe: { zephyr_totem: 3, crystal_orb: 2, dig_candle: 1 },
        growth: 1.16,
        outputs: { wind_spiral: 0.4 },
        element: 'air'
    },
    // Crystal - Chamber
    {
        id: 'ws_crystal_core_chamber',
        displayName: 'Crystal Core Chamber',
        unlockAtAb: 8000.0,
        recipe: { crystal_orb: 3, aether_well: 2, dig_candle: 2 },
        growth: 1.17,
        outputs: { crystal_core: 0.4 },
        element: 'crystal'
    },
    // Aether - Reactor (Arcane Bits Producer - requires all 4 other elements + Aether)
    {
        id: 'ws_arcane_bit_reactor',
        displayName: 'Arcane Bit Reactor',
        description: 'A self-executing algorithm that generates Arcane Bits autonomously. Orchestrates all five elements in perfect harmony, creating a generative loop. Digital preservation that creates, not just conserves.',
        unlockAtAb: 10000.0,
        recipe: { enhanced_candle: 2, flowing_current: 2, wind_spiral: 2, crystal_core: 2, aether_well: 2 },
        growth: 1.18,
        outputs: { ab: 5.0 },
        element: 'aether'
    },

    // Tier 3 - Late Game Producers (5 workstations: one per element + Arcane Bits producer)
    // Fire - Forge
    {
        id: 'ws_quantum_candle_forge',
        displayName: 'Quantum Candle Forge',
        unlockAtAb: 100000.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, flowing_current: 2, wind_spiral: 2 },
        growth: 1.20,
        outputs: { quantum_candle: 0.3 },
        element: 'fire'
    },
    // Water - Well
    {
        id: 'ws_quantum_water_well',
        displayName: 'Quantum Water Well',
        unlockAtAb: 120000.0,
        recipe: { flowing_current: 4, crystal_core: 2, enhanced_candle: 2, wind_spiral: 2 },
        growth: 1.20,
        outputs: { quantum_water: 0.3 },
        element: 'water'
    },
    // Air - Generator
    {
        id: 'ws_quantum_air_generator',
        displayName: 'Quantum Air Generator',
        unlockAtAb: 140000.0,
        recipe: { wind_spiral: 4, crystal_core: 2, enhanced_candle: 2, flowing_current: 2 },
        growth: 1.20,
        outputs: { quantum_air: 0.3 },
        element: 'air'
    },
    // Crystal - Chamber
    {
        id: 'ws_quantum_crystal_chamber',
        displayName: 'Quantum Crystal Chamber',
        unlockAtAb: 160000.0,
        recipe: { crystal_core: 4, enhanced_candle: 2, flowing_current: 2, wind_spiral: 2 },
        growth: 1.21,
        outputs: { quantum_crystal: 0.3 },
        element: 'crystal'
    },
    // Aether - Reactor (Arcane Bits Producer - requires all 4 other elements + Aether)
    {
        id: 'ws_etheric_bit_reactor',
        displayName: 'Etheric Energy Reactor',
        unlockAtAb: 200000.0,
        recipe: { quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3, aether_well: 3 },
        growth: 1.22,
        outputs: { ab: 25.0 },
        element: 'aether'
    },

    // Tier 4 - Legendary Producers (5 workstations: one per element + Arcane Bits producer)
    // Fire - Forge
    {
        id: 'ws_arcane_candle_forge',
        displayName: 'Arcane Candle Forge',
        unlockAtAb: 5000000.0,
        recipe: { quantum_candle: 5, quantum_water: 3, quantum_air: 3, quantum_crystal: 3 },
        growth: 1.25,
        outputs: { arcane_candle: 0.2 },
        element: 'fire'
    },
    // Water - Well
    {
        id: 'ws_void_liquid_well',
        displayName: 'Void Liquid Well',
        unlockAtAb: 6500000.0,
        recipe: { quantum_water: 5, quantum_crystal: 3, quantum_candle: 3, quantum_air: 3 },
        growth: 1.26,
        outputs: { void_liquid: 0.2 },
        element: 'water'
    },
    // Air - Generator
    {
        id: 'ws_void_breath_generator',
        displayName: 'Void Breath Generator',
        unlockAtAb: 8000000.0,
        recipe: { quantum_air: 5, quantum_crystal: 3, quantum_candle: 3, quantum_water: 3 },
        growth: 1.26,
        outputs: { void_breath: 0.2 },
        element: 'air'
    },
    // Crystal - Chamber
    {
        id: 'ws_void_crystal_chamber',
        displayName: 'Void Crystal Chamber',
        unlockAtAb: 9000000.0,
        recipe: { quantum_crystal: 5, quantum_candle: 3, quantum_water: 3, quantum_air: 3 },
        growth: 1.26,
        outputs: { void_crystal: 0.2 },
        element: 'crystal'
    },
    // Aether - Reactor (Arcane Bits Producer - requires all 4 other elements + Aether)
    {
        id: 'ws_infinity_bit_reactor',
        displayName: 'Infinity Energy Reactor',
        description: "The apex of arcane programming. Operates at reality's edge, compiling void-level data structures that exist beyond normal spacetime. Generates massive Arcane Bits from the source itself. Transcendence through code.",
        unlockAtAb: 20000000.0,
        recipe: { arcane_candle: 5, void_liquid: 5, void_breath: 5, void_crystal: 5, aether_well: 5 },
        growth: 1.30,
        outputs: { ab: 750.0 },
        element: 'aether'
    }
];
