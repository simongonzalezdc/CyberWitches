// Game Data Definitions

export const INGREDIENTS = [
    // Tier 0 - Base ingredients
    { id: "crystal_dust", displayName: "Crystal Dust", tier: 0 },
    { id: "aether_ess", displayName: "Aether Essence", tier: 0 },
    { id: "fire_essence", displayName: "Fire Essence", tier: 0 },
    { id: "water_essence", displayName: "Water Essence", tier: 0 },
    { id: "air_essence", displayName: "Air Essence", tier: 0 },
    
    // Tier 1 - Refined ingredients
    { id: "shaped_crys", displayName: "Shaped Crystal", tier: 1 },
    { id: "dist_aether", displayName: "Distilled Aether", tier: 1 },
    { id: "dist_fire", displayName: "Distilled Fire", tier: 1 },
    { id: "dig_candle", displayName: "Digital Candle", tier: 1 },
    { id: "crystal_orb", displayName: "Crystal Orb", tier: 1 },
    { id: "aether_well", displayName: "Aether Well", tier: 1 },
    { id: "liquid_essence", displayName: "Liquid Essence", tier: 1 },
    { id: "aqua_well", displayName: "Aqua Well", tier: 1 },
    { id: "ethereal_gust", displayName: "Ethereal Gust", tier: 1 },
    { id: "zephyr_totem", displayName: "Zephyr Totem", tier: 1 },
    
    // Tier 1.5 - Mid-game transition ingredients (NEW - fills content gap)
    { id: "fused_aether", displayName: "Fused Aether", tier: 1.5 },
    { id: "resonant_crystal", displayName: "Resonant Crystal", tier: 1.5 },
    { id: "harmonic_essence", displayName: "Harmonic Essence", tier: 1.5 },

    // Tier 2 - Advanced ingredients
    { id: "enhanced_candle", displayName: "Enhanced Candle", tier: 2 },
    { id: "crystal_core", displayName: "Crystal Core", tier: 2 },
    { id: "flowing_current", displayName: "Flowing Current", tier: 2 },
    { id: "wind_spiral", displayName: "Wind Spiral", tier: 2 },
    { id: "focus", displayName: "Focus", tier: 2 },
    
    // Tier 3 - Master ingredients
    { id: "quantum_candle", displayName: "Quantum Candle", tier: 3 },
    { id: "quantum_crystal", displayName: "Quantum Crystal", tier: 3 },
    { id: "quantum_water", displayName: "Quantum Water", tier: 3 },
    { id: "quantum_air", displayName: "Quantum Air", tier: 3 },
    
    // Tier 4 - Legendary ingredients
    { id: "arcane_candle", displayName: "Arcane Candle", tier: 4 },
    { id: "void_crystal", displayName: "Void Crystal", tier: 4 },
    { id: "void_liquid", displayName: "Void Liquid", tier: 4 },
    { id: "void_breath", displayName: "Void Breath", tier: 4 },
    
    // Meditation-exclusive ingredients
    { id: "serenity_essence", displayName: "Serenity Essence", tier: 0, meditationOnly: true },
    { id: "focus_crystal", displayName: "Focus Crystal", tier: 1, meditationOnly: true },
    { id: "tranquil_aether", displayName: "Tranquil Aether", tier: 2, meditationOnly: true },
    { id: "zen_orb", displayName: "Zen Orb", tier: 3, meditationOnly: true },
    { id: "nirvana_essence", displayName: "Nirvana Essence", tier: 4, meditationOnly: true },
    { id: "eternal_essence", displayName: "Eternal Essence", tier: 5, meditationOnly: true }
];

export const PRODUCERS = [
    // Tier 0 - Basic producers (5 workstations: one per element)
    // Fire - Forge
    {
        id: "ws_fire_forge",
        displayName: "Fire Forge",
        description: "A digital preservation chamber that compiles Fire essence into stable data structures. Your code creates crystalline matrices that capture heat as information before it dissipates. Fire fades faster than other elements—every forge you program is a small victory against entropy.",
        unlockAtAb: 25.0,
        recipe: { fire_essence: 10 },
        growth: 1.12,
        outputs: { dist_fire: 0.20 }
    },
    // Water - Well
    {
        id: "ws_aqua_well",
        displayName: "Aqua Well",
        description: "A digital preservation chamber that encodes Water essence into flowing data streams. Your algorithms create perpetual loops—constant data circulation preserves what static storage would lose. Motion coded into logic.",
        unlockAtAb: 30.0,
        recipe: { water_essence: 10 },
        growth: 1.12,
        outputs: { liquid_essence: 0.20 }
    },
    // Air - Generator
    {
        id: "ws_zephyr_generator",
        displayName: "Zephyr Generator",
        description: "A preservation chamber that stabilizes Air essence before it fades. The constant circulation creates a barrier against entropy. Air is the most elusive element—capturing wind is like holding onto a memory.",
        unlockAtAb: 35.0,
        recipe: { air_essence: 10 },
        growth: 1.12,
        outputs: { ethereal_gust: 0.20 }
    },
    // Crystal - Chamber
    {
        id: "ws_crystal_chamber",
        displayName: "Crystal Chamber",
        description: "A preservation chamber that stabilizes Crystal essence before it fades. Crystal structures resist entropy better than other elements—they're the foundation of all your preservation work. When everything else fades, crystal endures.",
        unlockAtAb: 40.0,
        recipe: { crystal_dust: 10 },
        growth: 1.12,
        outputs: { shaped_crys: 0.20 }
    },
    // Aether - Synthesizer (combines all 4 elements to create Aether)
    {
        id: "ws_aether_synthesizer",
        displayName: "Aether Synthesizer",
        description: "A digital chamber that runs synthesis algorithms to merge all four elemental data streams into Aether. Your code combines Fire, Water, Air, and Crystal into something greater than their sum. Aether—the binding force—fades fastest, but compiled together, the elements resist entropy better than apart.",
        unlockAtAb: 50.0,
        recipe: {
            fire_essence: 2,
            water_essence: 2,
            air_essence: 2,
            crystal_dust: 2
        },
        growth: 1.12,
        outputs: { dist_aether: 0.20 }
    },
    
    // Tier 1 - Early Game Producers (5 workstations: one per element)
    // Fire - Forge
    {
        id: "ws_digcandle_forge",
        displayName: "Digital Candle Forge",
        unlockAtAb: 75.0,
        recipe: { dist_fire: 3, shaped_crys: 2 },
        growth: 1.14,
        outputs: { dig_candle: 0.4 }
    },
    // Water - Well
    {
        id: "ws_aqua_well_t1",
        displayName: "Deep Aqua Well",
        unlockAtAb: 100.0,
        recipe: { liquid_essence: 3, shaped_crys: 2 },
        growth: 1.14,
        outputs: { aqua_well: 0.4 }
    },
    // Air - Generator
    {
        id: "ws_zephyr_generator_t1",
        displayName: "Enhanced Zephyr Generator",
        unlockAtAb: 125.0,
        recipe: { ethereal_gust: 3, shaped_crys: 2 },
        growth: 1.14,
        outputs: { zephyr_totem: 0.4 }
    },
    // Crystal - Chamber
    {
        id: "ws_crystal_chamber_t1",
        displayName: "Crystal Orb Chamber",
        unlockAtAb: 150.0,
        recipe: { shaped_crys: 3, dist_fire: 1, dist_aether: 1 },
        growth: 1.14,
        outputs: { crystal_orb: 0.4 }
    },
    // Aether - Reactor
    {
        id: "ws_aether_reactor_t1",
        displayName: "Aether Reactor",
        unlockAtAb: 200.0,
        recipe: { dist_aether: 3, shaped_crys: 2 },
        growth: 1.15,
        outputs: { aether_well: 0.4 }
    },

    // ===== NEW: Tier 1.5 - Mid-Game Bridge Producers (fills 200-5000 AB gap) =====
    // Aether Fusion Chamber - Combines multiple Tier 1 ingredients
    {
        id: "ws_aether_fusion_chamber",
        displayName: "Aether Fusion Chamber",
        description: "A complex preservation chamber that fuses multiple aether sources into a more stable form. You've discovered that layering preservation techniques creates compound stability—each layer reinforces the others. This is a breakthrough in fighting the fading.",
        unlockAtAb: 500.0,
        recipe: {
            aether_well: 3,
            dist_aether: 5,
            crystal_orb: 2,
            dig_candle: 2
        },
        growth: 1.145,
        outputs: { fused_aether: 0.5 }
    },
    // Resonance Crystallizer - Creates resonant crystals
    {
        id: "ws_resonance_crystallizer",
        displayName: "Resonance Crystallizer",
        description: "Uses harmonic vibrations to create crystals that resonate with magical frequencies. These crystals are far more stable than ordinary ones.",
        unlockAtAb: 750.0,
        recipe: {
            crystal_orb: 4,
            shaped_crys: 8,
            zephyr_totem: 3,
            fused_aether: 2
        },
        growth: 1.15,
        outputs: { resonant_crystal: 0.45 }
    },
    // Harmonic Stabilizer - Produces harmonic essence AND AB
    {
        id: "ws_harmonic_stabilizer",
        displayName: "Harmonic Stabilizer",
        description: "A sophisticated chamber that uses resonant frequencies to stabilize magic. It produces both harmonic essence and small amounts of Arcane Bits.",
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
        }
    },

    // Tier 2 - Mid Game Producers (5 workstations: one per element + Arcane Bits producer)
    // Fire - Forge
    {
        id: "ws_enhanced_candle_forge",
        displayName: "Enhanced Candle Forge",
        unlockAtAb: 5000.0,
        recipe: { dig_candle: 2, crystal_orb: 1, aether_well: 1 },
        growth: 1.16,
        outputs: { enhanced_candle: 0.4 }
    },
    // Water - Well
    {
        id: "ws_flowing_current_well",
        displayName: "Flowing Current Well",
        unlockAtAb: 6000.0,
        recipe: { aqua_well: 3, crystal_orb: 2, dig_candle: 1 },
        growth: 1.16,
        outputs: { flowing_current: 0.4 }
    },
    // Air - Generator
    {
        id: "ws_wind_spiral_generator",
        displayName: "Wind Spiral Generator",
        unlockAtAb: 7000.0,
        recipe: { zephyr_totem: 3, crystal_orb: 2, dig_candle: 1 },
        growth: 1.16,
        outputs: { wind_spiral: 0.4 }
    },
    // Crystal - Chamber
    {
        id: "ws_crystal_core_chamber",
        displayName: "Crystal Core Chamber",
        unlockAtAb: 8000.0,
        recipe: { crystal_orb: 3, aether_well: 2, dig_candle: 2 },
        growth: 1.17,
        outputs: { crystal_core: 0.4 }
    },
    // Aether - Reactor (Arcane Bits Producer - requires all 4 other elements + Aether)
    {
        id: "ws_arcane_bit_reactor",
        displayName: "Arcane Bit Reactor",
        description: "A self-executing algorithm that doesn't just preserve magic—it generates Arcane Bits autonomously. Your code orchestrates all five elements in perfect harmony, creating a generative loop. The program runs itself, proving that digital preservation can create, not just conserve. The fading continues, but your code pushes back.",
        unlockAtAb: 10000.0,
        recipe: { enhanced_candle: 2, flowing_current: 2, wind_spiral: 2, crystal_core: 2, aether_well: 2 },
        growth: 1.18,
        outputs: { ab: 5.0 }
    },
    
    // Tier 3 - Late Game Producers (5 workstations: one per element + Arcane Bits producer)
    // Fire - Forge
    {
        id: "ws_quantum_candle_forge",
        displayName: "Quantum Candle Forge",
        unlockAtAb: 100000.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, flowing_current: 2, wind_spiral: 2 },
        growth: 1.20,
        outputs: { quantum_candle: 0.3 }
    },
    // Water - Well
    {
        id: "ws_quantum_water_well",
        displayName: "Quantum Water Well",
        unlockAtAb: 120000.0,
        recipe: { flowing_current: 4, crystal_core: 2, enhanced_candle: 2, wind_spiral: 2 },
        growth: 1.20,
        outputs: { quantum_water: 0.3 }
    },
    // Air - Generator
    {
        id: "ws_quantum_air_generator",
        displayName: "Quantum Air Generator",
        unlockAtAb: 140000.0,
        recipe: { wind_spiral: 4, crystal_core: 2, enhanced_candle: 2, flowing_current: 2 },
        growth: 1.20,
        outputs: { quantum_air: 0.3 }
    },
    // Crystal - Chamber
    {
        id: "ws_quantum_crystal_chamber",
        displayName: "Quantum Crystal Chamber",
        unlockAtAb: 160000.0,
        recipe: { crystal_core: 4, enhanced_candle: 2, flowing_current: 2, wind_spiral: 2 },
        growth: 1.21,
        outputs: { quantum_crystal: 0.3 }
    },
    // Aether - Reactor (Arcane Bits Producer - requires all 4 other elements + Aether)
    {
        id: "ws_etheric_bit_reactor",
        displayName: "Etheric Energy Reactor",
        unlockAtAb: 200000.0,
        recipe: { quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3, aether_well: 3 },
        growth: 1.22,
        outputs: { ab: 25.0 }
    },
    
    // Tier 4 - Legendary Producers (5 workstations: one per element + Arcane Bits producer)
    // Fire - Forge
    {
        id: "ws_arcane_candle_forge",
        displayName: "Arcane Candle Forge",
        unlockAtAb: 5000000.0,
        recipe: { quantum_candle: 5, quantum_water: 3, quantum_air: 3, quantum_crystal: 3 },
        growth: 1.25,
        outputs: { arcane_candle: 0.2 }
    },
    // Water - Well
    {
        id: "ws_void_liquid_well",
        displayName: "Void Liquid Well",
        unlockAtAb: 6500000.0,
        recipe: { quantum_water: 5, quantum_crystal: 3, quantum_candle: 3, quantum_air: 3 },
        growth: 1.26,
        outputs: { void_liquid: 0.2 }
    },
    // Air - Generator
    {
        id: "ws_void_breath_generator",
        displayName: "Void Breath Generator",
        unlockAtAb: 8000000.0,
        recipe: { quantum_air: 5, quantum_crystal: 3, quantum_candle: 3, quantum_water: 3 },
        growth: 1.26,
        outputs: { void_breath: 0.2 }
    },
    // Crystal - Chamber
    {
        id: "ws_void_crystal_chamber",
        displayName: "Void Crystal Chamber",
        unlockAtAb: 9000000.0,
        recipe: { quantum_crystal: 5, quantum_candle: 3, quantum_water: 3, quantum_air: 3 },
        growth: 1.26,
        outputs: { void_crystal: 0.2 }
    },
    // Aether - Reactor (Arcane Bits Producer - requires all 4 other elements + Aether)
    {
        id: "ws_infinity_bit_reactor",
        displayName: "Infinity Energy Reactor",
        description: "The apex of arcane programming. Your code operates at reality's edge, compiling void-level data structures that exist beyond normal spacetime. The algorithm taps into the deep layers of existence where magic originates, generating massive Arcane Bits from the source itself. Not just preservation. Not just generation. Transcendence through code.",
        unlockAtAb: 20000000.0,
        recipe: { arcane_candle: 5, void_liquid: 5, void_breath: 5, void_crystal: 5, aether_well: 5 },
        growth: 1.30,
        outputs: { ab: 750.0 }
    }
];

export const UPGRADES = [
    // Tier 0 - Basic upgrades
    {
        id: "u_global_1",
        displayName: "Hex Compiler v1",
        description: "+50% all production",
        affects: "global",
        type: "multiplier",
        value: 1.5,
        recipe: { dist_fire: 2, shaped_crys: 2, dist_aether: 1 },
        unlockAtAb: 0.0
    },
    {
        id: "u_click_1",
        displayName: "Sigil Stroke",
        description: "+1 cast rewards",
        affects: "click",
        type: "additive",
        value: 1.0,
        recipe: { fire_essence: 10 },
        unlockAtAb: 0.0
    },
    {
        id: "u_click_2",
        displayName: "Enhanced Sigil",
        description: "+2 cast rewards",
        affects: "click",
        type: "additive",
        value: 2.0,
        recipe: { dist_fire: 5, shaped_crys: 2 },
        unlockAtAb: 500.0
    },
    
    // Tier 1 - Workstation upgrades
    {
        id: "u_digcandle_forge_1",
        displayName: "Candle Algorithm",
        description: "×2 Digital Candle Forge",
        affects: "producer:ws_digcandle_forge",
        type: "multiplier",
        value: 2.0,
        recipe: { dig_candle: 5, dist_fire: 10 },
        unlockAtAb: 200.0
    },
    {
        id: "u_crystal_1",
        displayName: "Orb Optimization",
        description: "×2 Crystal Orb Forge",
        affects: "producer:ws_crystal_chamber_t1",
        type: "multiplier",
        value: 2.0,
        recipe: { crystal_orb: 3, shaped_crys: 5 },
        unlockAtAb: 500.0
    },
    {
        id: "u_cauldron_1",
        displayName: "Well Enhancement",
        description: "×2 Aether Well",
        affects: "producer:ws_aether_reactor_t1",
        type: "multiplier",
        value: 2.0,
        recipe: { aether_well: 3, dist_aether: 5 },
        unlockAtAb: 1000.0
    },
    // Tier 2 - Workstation upgrades
    {
        id: "u_digcandle_forge_t2_1",
        displayName: "Enhanced Candle Boost",
        description: "×2 Enhanced Candle Forge",
        affects: "producer:ws_enhanced_candle_forge",
        type: "multiplier",
        value: 2.0,
        recipe: { enhanced_candle: 3, dig_candle: 5 },
        unlockAtAb: 8000.0
    },
    {
        id: "u_coreforge_1",
        displayName: "Core Enhancement",
        description: "×2 Crystal Core Forge",
        affects: "producer:ws_crystal_core_chamber",
        type: "multiplier",
        value: 2.0,
        recipe: { crystal_core: 2, crystal_orb: 3 },
        unlockAtAb: 15000.0
    },
    {
        id: "u_fluxreactor_1",
        displayName: "Flux Overdrive",
        description: "×2 Flowing Current Well",
        affects: "producer:ws_flowing_current_well",
        type: "multiplier",
        value: 2.0,
        recipe: { flowing_current: 3, aqua_well: 5 },
        unlockAtAb: 25000.0
    },
    {
        id: "u_hexforge_1",
        displayName: "Hex Optimization",
        description: "×2 Wind Spiral Generator",
        affects: "producer:ws_wind_spiral_generator",
        type: "multiplier",
        value: 2.0,
        recipe: { wind_spiral: 3, zephyr_totem: 2 },
        unlockAtAb: 60000.0
    },
    {
        id: "u_sigilforge_1",
        displayName: "Reactor Boost",
        description: "×2 Etheric Bit Reactor",
        affects: "producer:ws_etheric_bit_reactor",
        type: "multiplier",
        value: 2.0,
        recipe: { enhanced_candle: 3, crystal_core: 2, aether_well: 2 },
        unlockAtAb: 100000.0
    },
    
    // Tier 2 - Global upgrades
    {
        id: "u_global_2",
        displayName: "Sigil Cache",
        description: "+80% all production",
        affects: "global",
        type: "multiplier",
        value: 1.8,
        recipe: { dist_fire: 3, shaped_crys: 2, dist_aether: 2 },
        unlockAtAb: 500.0
    },
    {
        id: "u_global_3",
        displayName: "Coven Pact",
        description: "+150% all production",
        affects: "global",
        type: "multiplier",
        value: 2.5,
        recipe: { enhanced_candle: 2, crystal_core: 3, flowing_current: 2, wind_spiral: 2 },
        unlockAtAb: 80000.0
    },
    {
        id: "u_global_4",
        displayName: "Eldritch Binding",
        description: "+300% all production",
        affects: "global",
        type: "multiplier",
        value: 4.0,
        recipe: { quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3 },
        unlockAtAb: 500000.0
    },
    {
        id: "u_global_5",
        displayName: "Infinity Nexus",
        description: "+500% all production",
        affects: "global",
        type: "multiplier",
        value: 6.0,
        recipe: { arcane_candle: 3, void_crystal: 3, quantum_candle: 3, quantum_crystal: 3 },
        unlockAtAb: 5000000.0
    },
    
    // Tier 3 - Master workstation upgrades
    {
        id: "u_quantumlab_candle_1",
        displayName: "Quantum Candle Boost",
        description: "×3 Quantum Candle Forge",
        affects: "producer:ws_quantum_candle_forge",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_candle: 3, enhanced_candle: 5 },
        unlockAtAb: 150000.0
    },
    {
        id: "u_quantumlab_1",
        displayName: "Quantum Resonance",
        description: "×3 Quantum Crystal Chamber",
        affects: "producer:ws_quantum_crystal_chamber",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_crystal: 5, crystal_core: 3 },
        unlockAtAb: 350000.0
    },
    {
        id: "u_quantumlab_aether_1",
        displayName: "Quantum Aether Amplifier",
        description: "×3 Quantum Water Well",
        affects: "producer:ws_quantum_water_well",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_water: 3, flowing_current: 5 },
        unlockAtAb: 600000.0
    },
    {
        id: "u_eldritchforge_1",
        displayName: "Eldritch Power",
        description: "×3 Quantum Air Generator",
        affects: "producer:ws_quantum_air_generator",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_air: 5, wind_spiral: 3 },
        unlockAtAb: 1200000.0
    },
    {
        id: "u_covenaltar_1",
        displayName: "Nexus Boost",
        description: "×3 Etheric Bit Reactor",
        affects: "producer:ws_etheric_bit_reactor",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_candle: 3, quantum_water: 2, quantum_air: 2, quantum_crystal: 2 },
        unlockAtAb: 2500000.0
    },
    
    // Tier 4 - Legendary upgrades (first half)
    {
        id: "u_arcanetower_1",
        displayName: "Arcane Mastery",
        description: "×3 Arcane Candle Forge",
        affects: "producer:ws_arcane_candle_forge",
        type: "multiplier",
        value: 3.0,
        recipe: { arcane_candle: 5, quantum_candle: 3 },
        unlockAtAb: 6000000.0
    },
    {
        id: "u_voidchamber_1",
        displayName: "Void Mastery",
        description: "×3 Void Crystal Chamber",
        affects: "producer:ws_void_crystal_chamber",
        type: "multiplier",
        value: 3.0,
        recipe: { void_crystal: 5, quantum_crystal: 3 },
        unlockAtAb: 8000000.0
    },
    
    // Tier 5 - Legendary upgrades (second half + new tier 5)
    {
        id: "u_voidliquid_1",
        displayName: "Void Liquid Mastery",
        description: "×3 Void Liquid Well",
        affects: "producer:ws_void_liquid_well",
        type: "multiplier",
        value: 3.0,
        recipe: { void_liquid: 5, void_crystal: 3 },
        unlockAtAb: 10000000.0
    },
    {
        id: "u_voidbreath_1",
        displayName: "Void Breath Mastery",
        description: "×3 Void Breath Generator",
        affects: "producer:ws_void_breath_generator",
        type: "multiplier",
        value: 3.0,
        recipe: { void_breath: 5, void_crystal: 3 },
        unlockAtAb: 11000000.0
    },
    {
        id: "u_infinitycore_ab_1",
        displayName: "Infinity Engine Boost",
        description: "×3 Infinity Bit Reactor",
        affects: "producer:ws_infinity_bit_reactor",
        type: "multiplier",
        value: 3.0,
        recipe: { arcane_candle: 3, void_crystal: 3, void_liquid: 3, void_breath: 3 },
        unlockAtAb: 25000000.0
    },
    
    // Special upgrades
    {
        id: "u_click_3",
        displayName: "Master Sigil",
        description: "+5 cast rewards",
        affects: "click",
        type: "additive",
        value: 5.0,
        recipe: { enhanced_candle: 10, crystal_core: 5 },
        unlockAtAb: 100000.0
    },
    {
        id: "u_click_4",
        displayName: "Eldritch Sigil",
        description: "+10 cast rewards",
        affects: "click",
        type: "additive",
        value: 10.0,
        recipe: { quantum_candle: 10, quantum_crystal: 5 },
        unlockAtAb: 1000000.0
    },
    
    // Focus-related upgrades
    {
        id: "u_focus_meditation_1",
        displayName: "Meditative Focus",
        description: "+50% meditation Focus",
        affects: "meditation_focus",
        type: "multiplier",
        value: 1.5,
        recipe: { focus: 25, enhanced_candle: 3, crystal_core: 3 },
        unlockAtAb: 8000.0
    },
    {
        id: "u_focus_conversion_1",
        displayName: "Focus Conversion",
        description: "Convert Focus to SE (1 SE = 100 Focus)",
        affects: "focus_to_ab",
        type: "conversion",
        value: 0.01, // 100 focus = 1 SE
        recipe: { focus: 100, enhanced_candle: 5, crystal_core: 5 },
        unlockAtAb: 10000.0
    },
    {
        id: "u_ab_mult_1",
        displayName: "Arcane Bits Multiplier",
        description: "+50% AB production",
        affects: "ab_production",
        type: "multiplier",
        value: 1.5,
        recipe: { dig_candle: 5, crystal_orb: 3, aether_well: 3 },
        unlockAtAb: 2000.0
    },
    {
        id: "u_ab_mult_2",
        displayName: "Arcane Bits Amplifier",
        description: "+100% AB production",
        affects: "ab_production",
        type: "multiplier",
        value: 2.0,
        recipe: { enhanced_candle: 5, crystal_core: 3, flowing_current: 3, wind_spiral: 3 },
        unlockAtAb: 100000.0
    },
    {
        id: "u_ab_mult_3",
        displayName: "Arcane Bits Transcendence",
        description: "+200% AB production",
        affects: "ab_production",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_candle: 3, quantum_water: 3, quantum_air: 3, quantum_crystal: 3 },
        unlockAtAb: 2000000.0
    },
    {
        id: "u_ab_mult_4",
        displayName: "Arcane Bits Infinity",
        description: "+500% AB production",
        affects: "ab_production",
        type: "multiplier",
        value: 6.0,
        recipe: { arcane_candle: 3, void_liquid: 3, void_breath: 3, void_crystal: 3 },
        unlockAtAb: 50000000.0
    }
];

export const PRESTIGE_BONUSES = [
    // Global production bonuses
    {
        id: "pp_global_1",
        displayName: "Coven's Oath",
        description: "+10% all production / level",
        type: "global_mult",
        value: 0.10,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    {
        id: "pp_global_2",
        displayName: "Eldritch Pact",
        description: "+25% all production / level",
        type: "global_mult",
        value: 0.25,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_global_3",
        displayName: "Infinity Binding",
        description: "+50% all production / level",
        type: "global_mult",
        value: 0.50,
        baseCostPp: 200.0,
        costGrowth: 1.5
    },
    
    // Starting currency bonuses
    {
        id: "pp_start_bits",
        displayName: "Seeded Spellbook",
        description: "+1000 SE at start / level",
        type: "starting_currency",
        value: 1000.0,
        baseCostPp: 5.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_bits_2",
        displayName: "Enchanted Tome",
        description: "+10K SE at start / level",
        type: "starting_currency",
        value: 10000.0,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_bits_3",
        displayName: "Arcane Library",
        description: "+100K SE at start / level",
        type: "starting_currency",
        value: 100000.0,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    
    // Producer-specific bonuses
    {
        id: "pp_digcandle_forge_mult",
        displayName: "Candle Moon",
        description: "+5% Digital Candle / level",
        type: "producer_mult",
        param: "ws_digcandle_forge",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_crystal_mult",
        displayName: "Orb Star",
        description: "+5% Crystal Orb / level",
        type: "producer_mult",
        param: "ws_crystal_chamber_t1",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_cauldron_mult",
        displayName: "Well Constellation",
        description: "+5% Aether Well / level",
        type: "producer_mult",
        param: "ws_aether_reactor_t1",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_sigilforge_mult",
        displayName: "Reactor Star",
        description: "+5% Etheric Reactor / level",
        type: "producer_mult",
        param: "ws_etheric_bit_reactor",
        value: 0.05,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: "pp_quantumlab_mult",
        displayName: "Quantum Constellation",
        description: "+5% Quantum Crystal Chamber / level",
        type: "producer_mult",
        param: "ws_quantum_crystal_chamber",
        value: 0.05,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: "pp_covenaltar_mult",
        displayName: "Nexus Star",
        description: "+5% Etheric Energy Reactor / level",
        type: "producer_mult",
        param: "ws_etheric_bit_reactor",
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_eldritchforge_mult",
        displayName: "Eldritch Star",
        description: "+5% Quantum Candle Forge / level",
        type: "producer_mult",
        param: "ws_quantum_candle_forge",
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_arcanetower_mult",
        displayName: "Arcane Star",
        description: "+5% Arcane Candle Forge / level",
        type: "producer_mult",
        param: "ws_arcane_candle_forge",
        value: 0.05,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    {
        id: "pp_voidchamber_mult",
        displayName: "Void Star",
        description: "+5% Void Crystal Chamber / level",
        type: "producer_mult",
        param: "ws_void_crystal_chamber",
        value: 0.05,
        baseCostPp: 200.0,
        costGrowth: 1.5
    },
    {
        id: "pp_infinitycore_ab_mult",
        displayName: "Engine Star",
        description: "+5% Infinity Energy Reactor / level",
        type: "producer_mult",
        param: "ws_infinity_bit_reactor",
        value: 0.05,
        baseCostPp: 1000.0,
        costGrowth: 1.5
    },
    
    // Starting ingredient bonuses
    {
        id: "pp_start_ingred",
        displayName: "Pocket Satchel",
        description: "+100 Fire Essence / level",
        type: "start_ingredient",
        param: "fire_essence",
        value: 100.0,
        baseCostPp: 6.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_ingred_2",
        displayName: "Enchanted Pouch",
        description: "+1K Fire Essence / level",
        type: "start_ingredient",
        param: "fire_essence",
        value: 1000.0,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_crystal",
        displayName: "Crystal Cache",
        description: "+50 Crystal Cores / level",
        type: "start_ingredient",
        param: "crystal_core",
        value: 50.0,
        baseCostPp: 30.0,
        costGrowth: 1.5
    },
    {
        id: "pp_start_sigil",
        displayName: "Sigil Reserve",
        description: "+10 Focus / level",
        type: "start_ingredient",
        param: "focus",
        value: 10.0,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    
    // Special bonuses
    {
        id: "pp_ab_mult",
        displayName: "Arcane Bits Amplifier",
        description: "+10% SE production / level",
        type: "ab_production_mult",
        value: 0.10,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: "pp_click_mult",
        displayName: "Cast Mastery",
        description: "+5% cast rewards / level",
        type: "click_mult",
        value: 0.05,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: "pp_prestige_speed",
        displayName: "Ascension Speed",
        description: "+1% EK gain / level",
        type: "prestige_speed",
        value: 0.01,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    
    {
        id: "pp_meditation_focus_1",
        displayName: "Meditative Focus",
        description: "+20% meditation Focus / level",
        type: "meditation_focus_mult",
        value: 0.20,
        baseCostPp: 20.0,
        costGrowth: 1.5
    },
    {
        id: "pp_focus_conversion_1",
        displayName: "Focus Conversion",
        description: "+10% Focus→SE conversion / level",
        type: "focus_conversion_mult",
        value: 0.10,
        baseCostPp: 30.0,
        costGrowth: 1.5
    }
];

export const DAILY_TASKS_POOL = [
    // Tier 0 - Basic tasks
    {
        id: "d_kindle",
        displayName: "Preserve the Flame",
        description: "Craft 3 Fire Forges to preserve Fire essence before it fades",
        condition: "craft:workstation:ws_fire_forge:3",
        rewardType: "ab",
        rewardValue: 5000.0
    },
    {
        id: "d_shape",
        displayName: "Stabilize Crystal",
        description: "Craft 2 Crystal Chambers to stabilize Crystal essence before it fades",
        condition: "craft:workstation:ws_crystal_chamber:2",
        rewardType: "ab",
        rewardValue: 7500.0
    },
    {
        id: "d_still",
        displayName: "Synthesize Aether",
        description: "Craft 2 Aether Synthesizers to preserve Aether before it fades",
        condition: "craft:workstation:ws_aether_synthesizer:2",
        rewardType: "ab",
        rewardValue: 7500.0
    },
    
    // Tier 1 - Intermediate tasks
    {
        id: "d_song",
        displayName: "Crystal Resonance",
        description: "Maintain 3 Crystal Orb Chambers to keep preserved magic stable",
        condition: "own:workstation:ws_crystal_chamber:3",
        rewardType: "buff",
        rewardValue: 900.0,
        buffMultiplier: 0.10
    },
    {
        id: "d_forge",
        displayName: "Preserve Digital Candles",
        description: "Craft 2 Digital Candle Forges to preserve Fire essence in stable form",
        condition: "craft:workstation:ws_digcandle_forge:2",
        rewardType: "ab",
        rewardValue: 10000.0
    },
    {
        id: "d_well",
        displayName: "Aether Well",
        description: "Maintain 2 Aether Wells to preserve Aether essence",
        condition: "own:workstation:ws_aether_reactor_t1:2",
        rewardType: "buff",
        rewardValue: 1200.0,
        buffMultiplier: 0.12
    },
    
    // Tier 2 - Advanced tasks
    {
        id: "d_enhanced",
        displayName: "Enhanced Preservation",
        description: "Craft 2 Enhanced Candle Forges to preserve Fire essence in enhanced form",
        condition: "craft:workstation:ws_enhanced_candle_forge:2",
        rewardType: "ab",
        rewardValue: 25000.0
    },
    {
        id: "d_core",
        displayName: "Core Forging",
        description: "Own 2 Crystal Core Chambers",
        condition: "own:workstation:ws_crystal_core_chamber:2",
        rewardType: "buff",
        rewardValue: 1800.0,
        buffMultiplier: 0.15
    },
    {
        id: "d_flux",
        displayName: "Flux Reactor",
        description: "Craft 1 Arcane Bit Reactor",
        condition: "craft:workstation:ws_arcane_bit_reactor:1",
        rewardType: "ab",
        rewardValue: 30000.0
    },
    
    // Tier 3 - Master tasks
    {
        id: "d_quantum",
        displayName: "Quantum Forging",
        description: "Craft 1 Quantum Candle Forge",
        condition: "craft:workstation:ws_quantum_candle_forge:1",
        rewardType: "ab",
        rewardValue: 50000.0
    },
    {
        id: "d_essence",
        displayName: "Quantum Essence",
        description: "Own 1 Quantum Crystal Chamber",
        condition: "own:workstation:ws_quantum_crystal_chamber:1",
        rewardType: "buff",
        rewardValue: 2400.0,
        buffMultiplier: 0.20
    },
    
    // Tier 4 - Legendary tasks
    {
        id: "d_arcane",
        displayName: "Arcane Tower",
        description: "Craft 1 Arcane Candle Forge",
        condition: "craft:workstation:ws_arcane_candle_forge:1",
        rewardType: "ab",
        rewardValue: 100000.0
    },
    {
        id: "d_void",
        displayName: "Void Crystal",
        description: "Own 1 Void Crystal Chamber",
        condition: "own:workstation:ws_void_crystal_chamber:1",
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
        description: "Earn 10000 SE",
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
    },
    {
        id: "d_focus_experiment",
        displayName: "Focus Experiment",
        description: "Discover Focus Elixir recipe",
        condition: "discover_recipe:focus_elixir",
        rewardType: "ab",
        rewardValue: 25000.0
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
        name: "Arcane Bits Amplifier Potion",
        description: "💰 TEMPORARY: +200% Arcane Bits production for 20 minutes"
    },
    
    // Tier 2 - Temporary Buff Potions
    {
        id: "mega_production_elixir",
        inputs: { enhanced_candle: 3, crystal_core: 2, flowing_current: 1, wind_spiral: 1 },
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
        inputs: { crystal_core: 5, flowing_current: 3, wind_spiral: 3 },
        outputs: { ab_turbo_charge: 1 },
        name: "Arcane Bits Turbo Charge",
        description: "💰 TEMPORARY: +500% Arcane Bits production for 45 minutes"
    },
    {
        id: "rare_material_catalyst",
        inputs: { enhanced_candle: 5, crystal_core: 3, flowing_current: 2, wind_spiral: 2 },
        outputs: { rare_catalyst: 1 },
        name: "Rare Material Catalyst",
        description: "🔮 TEMPORARY: Double all ingredient production for 1 hour"
    },
    
    // Tier 3 - Temporary Buff Potions
    {
        id: "ultimate_production_elixir",
        inputs: { quantum_candle: 3, quantum_water: 2, quantum_air: 2, quantum_crystal: 1 },
        outputs: { ultimate_production_elixir: 1 },
        name: "Ultimate Production Elixir",
        description: "✨ TEMPORARY: +200% production for 2 hours"
    },
    {
        id: "quantum_speed_boost",
        inputs: { quantum_candle: 2, quantum_water: 3, quantum_air: 3 },
        outputs: { quantum_speed_boost: 1 },
        name: "Quantum Speed Boost",
        description: "⚡ TEMPORARY: +300% cast speed for 1 hour"
    },
    {
        id: "ab_overdrive",
        inputs: { quantum_water: 5, quantum_air: 5, quantum_crystal: 3 },
        outputs: { ab_overdrive: 1 },
        name: "Arcane Bits Overdrive",
        description: "💰 TEMPORARY: +1000% Arcane Bits production for 1.5 hours"
    },
    {
        id: "master_catalyst",
        inputs: { quantum_candle: 5, quantum_water: 3, quantum_air: 3, quantum_crystal: 2 },
        outputs: { master_catalyst: 1 },
        name: "Master Catalyst",
        description: "🔮 TEMPORARY: Triple all ingredient production for 2 hours"
    },
    {
        id: "prestige_boost_potion",
        inputs: { quantum_candle: 3, quantum_water: 5, quantum_air: 5, quantum_crystal: 3 },
        outputs: { prestige_boost: 1 },
        name: "Prestige Boost Potion",
        description: "⭐ TEMPORARY: +50% prestige point gain for 3 hours"
    },
    
    // Focus-related experiments
    {
        id: "focus_elixir",
        inputs: { focus: 5, enhanced_candle: 2, crystal_core: 2 },
        outputs: { focus_elixir: 1 },
        name: "Focus Elixir",
        description: "🧘 TEMPORARY: +100% meditation Focus generation for 1 hour"
    },
    {
        id: "focus_boost_potion",
        inputs: { focus: 10, enhanced_candle: 3, crystal_core: 3, flowing_current: 2, wind_spiral: 2 },
        outputs: { focus_boost_potion: 1 },
        name: "Focus Boost Potion",
        description: "🧘 TEMPORARY: +200% meditation Focus generation for 2 hours"
    },
    {
        id: "quantum_focus_elixir",
        inputs: { focus: 25, quantum_candle: 2, quantum_crystal: 2, quantum_water: 1, quantum_air: 1 },
        outputs: { quantum_focus_elixir: 1 },
        name: "Quantum Focus Elixir",
        description: "🧘 TEMPORARY: +300% meditation Focus generation for 3 hours"
    },
    {
        id: "void_focus_essence",
        inputs: { focus: 50, quantum_candle: 3, quantum_crystal: 3, quantum_water: 2, quantum_air: 2 },
        outputs: { void_focus_essence: 1 },
        name: "Void Focus Essence",
        description: "🧘 TEMPORARY: +500% meditation Focus generation for 4 hours"
    },
    {
        id: "eternal_focus_essence",
        inputs: { focus: 100, arcane_candle: 3, void_crystal: 3, void_liquid: 2, void_breath: 2 },
        outputs: { eternal_focus_essence: 1 },
        name: "Eternal Focus Essence",
        description: "🧘 TEMPORARY: +1000% meditation Focus generation for 6 hours"
    },
    
    // Tier 4 - Temporary Buff Potions
    {
        id: "infinity_production_elixir",
        inputs: { arcane_candle: 3, void_crystal: 2, quantum_candle: 2, quantum_crystal: 1 },
        outputs: { infinity_production_elixir: 1 },
        name: "Infinity Production Elixir",
        description: "✨ TEMPORARY: +500% production for 4 hours"
    },
    {
        id: "eternal_production_elixir",
        inputs: { arcane_candle: 3, void_crystal: 2, void_liquid: 2, void_breath: 1 },
        outputs: { eternal_production_elixir: 1 },
        name: "Eternal Production Elixir",
        description: "✨ TEMPORARY: +1000% production for 6 hours"
    },
    {
        id: "void_speed_surge",
        inputs: { arcane_candle: 2, void_crystal: 3 },
        outputs: { void_speed_surge: 1 },
        name: "Void Speed Surge",
        description: "⚡ TEMPORARY: +500% cast speed for 2 hours"
    },
    {
        id: "eternal_speed_surge",
        inputs: { arcane_candle: 2, void_crystal: 3 },
        outputs: { eternal_speed_surge: 1 },
        name: "Eternal Speed Surge",
        description: "⚡ TEMPORARY: +1000% cast speed for 4 hours"
    },
    {
        id: "ab_infinity_boost",
        inputs: { void_crystal: 5, void_liquid: 3, void_breath: 3 },
        outputs: { ab_infinity_boost: 1 },
        name: "Arcane Bits Infinity Boost",
        description: "💰 TEMPORARY: +2000% Arcane Bits production for 3 hours"
    },
    {
        id: "ab_eternal_boost",
        inputs: { arcane_candle: 5, void_crystal: 5, void_liquid: 3, void_breath: 3 },
        outputs: { ab_eternal_boost: 1 },
        name: "Arcane Bits Eternal Boost",
        description: "💰 TEMPORARY: +1000% Arcane Bits production for 2 hours"
    },
    {
        id: "infinity_catalyst",
        inputs: { arcane_candle: 5, void_crystal: 3, quantum_candle: 3, quantum_crystal: 2 },
        outputs: { infinity_catalyst: 1 },
        name: "Infinity Catalyst",
        description: "🔮 TEMPORARY: 5x all ingredient production for 4 hours"
    },
    {
        id: "eternal_catalyst",
        inputs: { arcane_candle: 5, void_crystal: 5, void_liquid: 3, void_breath: 3 },
        outputs: { eternal_catalyst: 1 },
        name: "Eternal Catalyst",
        description: "🔮 TEMPORARY: 10x all ingredient production for 6 hours"
    },
    {
        id: "prestige_mastery_potion",
        inputs: { arcane_candle: 3, void_liquid: 5, void_breath: 5, void_crystal: 3 },
        outputs: { prestige_mastery: 1 },
        name: "Prestige Mastery Potion",
        description: "⭐ TEMPORARY: +100% prestige point gain for 6 hours"
    }
];

// Meditation Tower Defense Data

export const MEDITATION_TOWERS = [
    // 4 Simple Tower Types - each can be upgraded directly
    {
        id: "peace_circle",
        displayName: "Peace Circle",
        recipe: { fire_essence: 10 },
        baseDamage: 10,
        baseRange: 2,
        baseAttackSpeed: 1.0, // attacks per second
        cost: { serenity_essence: 0.1 }, // Focus cost per attack
        upgradeCost: { serenity_essence: 5 }, // Cost per upgrade level
        upgradeDamageMult: 1.5, // Damage multiplier per upgrade (1.5x, 2.25x, 3.375x, etc.)
        upgradeRangeMult: 1.2, // Range multiplier per upgrade
        upgradeSpeedMult: 1.15 // Attack speed multiplier per upgrade
    },
    {
        id: "focus_ring",
        displayName: "Focus Ring",
        recipe: { 
            crystal_dust: 3,
            fire_essence: 2,
            water_essence: 2,
            air_essence: 2
        },
        baseDamage: 15,
        baseRange: 2.5,
        baseAttackSpeed: 1.2,
        cost: { serenity_essence: 0.15 },
        upgradeCost: { focus_crystal: 3 },
        upgradeDamageMult: 1.5,
        upgradeRangeMult: 1.2,
        upgradeSpeedMult: 1.15
    },
    {
        id: "tranquility_shrine",
        displayName: "Tranquility Shrine",
        recipe: { dist_fire: 3, dig_candle: 2, shaped_crys: 2 },
        baseDamage: 25,
        baseRange: 3,
        baseAttackSpeed: 1.5,
        cost: { focus_crystal: 0.2 },
        upgradeCost: { focus_crystal: 5, tranquil_aether: 2 },
        upgradeDamageMult: 1.5,
        upgradeRangeMult: 1.2,
        upgradeSpeedMult: 1.15
    },
    {
        id: "zen_pavilion",
        displayName: "Zen Pavilion",
        recipe: { enhanced_candle: 2, crystal_core: 2, flowing_current: 2, wind_spiral: 2 },
        baseDamage: 50,
        baseRange: 4,
        baseAttackSpeed: 2.0,
        cost: { tranquil_aether: 0.3 },
        upgradeCost: { tranquil_aether: 5, zen_orb: 2 },
        upgradeDamageMult: 1.5,
        upgradeRangeMult: 1.2,
        upgradeSpeedMult: 1.15
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
    },
    // Tier 5 - Ultimate distractions
    {
        id: "eternal_void",
        displayName: "Eternal Void",
        tier: 5,
        health: 1000,
        speed: 0.7,
        damage: 35,
        reward: { eternal_essence: 1.5, focus: 50.0 }
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
    }
];


