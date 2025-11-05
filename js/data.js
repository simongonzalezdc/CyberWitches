// Game Data Definitions

export const INGREDIENTS = [
    // Tier 0 - Base ingredients
    { id: "wax_bits", displayName: "Wax Bits", tier: 0 },
    { id: "wick_fiber", displayName: "Wick Fiber", tier: 0 },
    { id: "crystal_dust", displayName: "Crystal Dust", tier: 0 },
    { id: "aether_ess", displayName: "Aether Essence", tier: 0 },
    
    // Tier 1 - Refined ingredients
    { id: "wax_block", displayName: "Wax Block", tier: 1 },
    { id: "braided_wick", displayName: "Braided Wick", tier: 1 },
    { id: "shaped_crys", displayName: "Shaped Crystal", tier: 1 },
    { id: "dist_aether", displayName: "Distilled Aether", tier: 1 },
    
    // Tier 2 - Advanced ingredients
    { id: "dig_candle", displayName: "Digital Candle", tier: 2 },
    { id: "crystal_core", displayName: "Crystal Core", tier: 2 },
    { id: "aether_flux", displayName: "Aether Flux", tier: 2 },
    { id: "wax_hex", displayName: "Wax Hex", tier: 2 },
    
    // Tier 3 - Master ingredients
    { id: "sigil_charge", displayName: "Sigil Charge", tier: 3 },
    { id: "quantum_essence", displayName: "Quantum Essence", tier: 3 },
    { id: "coven_blessing", displayName: "Coven Blessing", tier: 3 },
    { id: "eldritch_wax", displayName: "Eldritch Wax", tier: 3 },
    
    // Tier 4 - Legendary ingredients
    { id: "arcane_candle", displayName: "Arcane Candle", tier: 4 },
    { id: "void_crystal", displayName: "Void Crystal", tier: 4 },
    { id: "infinity_flux", displayName: "Infinity Flux", tier: 4 }
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
    
    // Tier 1 - AB producers
    {
        id: "ws_candle",
        displayName: "Digital Candle Farm",
        unlockAtAb: 75.0,
        recipe: { wax_block: 5, braided_wick: 1, dist_aether: 2 },
        growth: 1.14,
        outputs: { ab: 1.0 }
    },
    {
        id: "ws_crystal",
        displayName: "Crystal Rig",
        unlockAtAb: 250.0,
        recipe: { shaped_crys: 2, dist_aether: 2 },
        growth: 1.14,
        outputs: { ab: 0.2, crystal_dust: 0.05 }
    },
    {
        id: "ws_digcandle_forge",
        displayName: "Digital Candle Forge",
        unlockAtAb: 750.0,
        recipe: { wax_block: 8, braided_wick: 2, dist_aether: 3 },
        growth: 1.15,
        outputs: { dig_candle: 0.5 }
    },
    {
        id: "ws_cauldron",
        displayName: "Quantum Cauldron",
        unlockAtAb: 1500.0,
        recipe: { shaped_crys: 3, dist_aether: 3, dig_candle: 1 },
        growth: 1.16,
        outputs: { ab: 2.5 }
    },
    
    // Tier 2 - Advanced producers
    {
        id: "ws_hexforge",
        displayName: "Hex Forge",
        unlockAtAb: 5000.0,
        recipe: { wax_block: 10, shaped_crys: 5, dig_candle: 2 },
        growth: 1.15,
        outputs: { wax_hex: 0.5, ab: 0.5 }
    },
    {
        id: "ws_coreforge",
        displayName: "Crystal Core Forge",
        unlockAtAb: 10000.0,
        recipe: { shaped_crys: 10, dist_aether: 5, dig_candle: 3 },
        growth: 1.16,
        outputs: { crystal_core: 0.3, ab: 1.0 }
    },
    {
        id: "ws_fluxreactor",
        displayName: "Aether Flux Reactor",
        unlockAtAb: 20000.0,
        recipe: { dist_aether: 10, crystal_core: 2, dig_candle: 5 },
        growth: 1.17,
        outputs: { aether_flux: 0.4, ab: 2.0 }
    },
    {
        id: "ws_sigilforge",
        displayName: "Sigil Forge",
        unlockAtAb: 50000.0,
        recipe: { wax_hex: 5, crystal_core: 3, aether_flux: 2 },
        growth: 1.18,
        outputs: { sigil_charge: 0.2, ab: 5.0 }
    },
    
    // Tier 3 - Master producers
    {
        id: "ws_quantumlab",
        displayName: "Quantum Laboratory",
        unlockAtAb: 100000.0,
        recipe: { sigil_charge: 3, crystal_core: 5, aether_flux: 3 },
        growth: 1.19,
        outputs: { quantum_essence: 0.15, ab: 10.0 }
    },
    {
        id: "ws_covenaltar",
        displayName: "Coven Altar",
        unlockAtAb: 250000.0,
        recipe: { sigil_charge: 5, quantum_essence: 2, dig_candle: 10 },
        growth: 1.20,
        outputs: { coven_blessing: 0.1, ab: 25.0 }
    },
    {
        id: "ws_eldritchforge",
        displayName: "Eldritch Forge",
        unlockAtAb: 500000.0,
        recipe: { coven_blessing: 2, quantum_essence: 5, sigil_charge: 10 },
        growth: 1.21,
        outputs: { eldritch_wax: 0.08, ab: 50.0 }
    },
    
    // Tier 4 - Legendary producers
    {
        id: "ws_arcanetower",
        displayName: "Arcane Tower",
        unlockAtAb: 1000000.0,
        recipe: { eldritch_wax: 3, coven_blessing: 5, quantum_essence: 10 },
        growth: 1.22,
        outputs: { arcane_candle: 0.05, ab: 100.0 }
    },
    {
        id: "ws_voidchamber",
        displayName: "Void Chamber",
        unlockAtAb: 2500000.0,
        recipe: { arcane_candle: 2, eldritch_wax: 5, coven_blessing: 10 },
        growth: 1.23,
        outputs: { void_crystal: 0.03, ab: 250.0 }
    },
    {
        id: "ws_infinitycore",
        displayName: "Infinity Core",
        unlockAtAb: 10000000.0,
        recipe: { void_crystal: 1, arcane_candle: 5, eldritch_wax: 20 },
        growth: 1.25,
        outputs: { infinity_flux: 0.01, ab: 1000.0 }
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
        id: "u_candle_1",
        displayName: "Wax Algorithm",
        description: "Doubles Digital Candle Farm production",
        affects: "producer:ws_candle",
        type: "multiplier",
        value: 2.0,
        recipe: { wax_block: 3, dist_aether: 1 },
        unlockAtAb: 100.0
    },
    {
        id: "u_crystal_1",
        displayName: "Quantum Faceting",
        description: "Doubles Crystal Rig production",
        affects: "producer:ws_crystal",
        type: "multiplier",
        value: 2.0,
        recipe: { shaped_crys: 2, dist_aether: 1 },
        unlockAtAb: 250.0
    },
    {
        id: "u_digcandle_forge_1",
        displayName: "Candle Algorithm",
        description: "Doubles Digital Candle Forge production",
        affects: "producer:ws_digcandle_forge",
        type: "multiplier",
        value: 2.0,
        recipe: { dig_candle: 5, wax_block: 10 },
        unlockAtAb: 1000.0
    },
    {
        id: "u_cauldron_1",
        displayName: "Brew Daemon",
        description: "Increases Quantum Cauldron production by 80%",
        affects: "producer:ws_cauldron",
        type: "multiplier",
        value: 1.8,
        recipe: { shaped_crys: 2, dist_aether: 2, dig_candle: 1 },
        unlockAtAb: 1500.0
    },
    {
        id: "u_hexforge_1",
        displayName: "Hex Optimization",
        description: "Doubles Hex Forge production",
        affects: "producer:ws_hexforge",
        type: "multiplier",
        value: 2.0,
        recipe: { wax_hex: 3, crystal_core: 1 },
        unlockAtAb: 5000.0
    },
    {
        id: "u_coreforge_1",
        displayName: "Core Enhancement",
        description: "Doubles Crystal Core Forge production",
        affects: "producer:ws_coreforge",
        type: "multiplier",
        value: 2.0,
        recipe: { crystal_core: 2, aether_flux: 1 },
        unlockAtAb: 10000.0
    },
    {
        id: "u_fluxreactor_1",
        displayName: "Flux Overdrive",
        description: "Doubles Aether Flux Reactor production",
        affects: "producer:ws_fluxreactor",
        type: "multiplier",
        value: 2.0,
        recipe: { aether_flux: 3, sigil_charge: 1 },
        unlockAtAb: 20000.0
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
        recipe: { dig_candle: 2, crystal_core: 3, aether_flux: 2 },
        unlockAtAb: 50000.0
    },
    {
        id: "u_global_4",
        displayName: "Eldritch Binding",
        description: "Increases all production by 300%",
        affects: "global",
        type: "multiplier",
        value: 4.0,
        recipe: { sigil_charge: 5, quantum_essence: 3, coven_blessing: 2 },
        unlockAtAb: 250000.0
    },
    {
        id: "u_global_5",
        displayName: "Infinity Nexus",
        description: "Increases all production by 500%",
        affects: "global",
        type: "multiplier",
        value: 6.0,
        recipe: { eldritch_wax: 5, arcane_candle: 3, void_crystal: 2 },
        unlockAtAb: 1000000.0
    },
    
    // Tier 3 - Master workstation upgrades
    {
        id: "u_sigilforge_1",
        displayName: "Sigil Mastery",
        description: "Triples Sigil Forge production",
        affects: "producer:ws_sigilforge",
        type: "multiplier",
        value: 3.0,
        recipe: { sigil_charge: 5, quantum_essence: 2 },
        unlockAtAb: 50000.0
    },
    {
        id: "u_quantumlab_1",
        displayName: "Quantum Resonance",
        description: "Triples Quantum Laboratory production",
        affects: "producer:ws_quantumlab",
        type: "multiplier",
        value: 3.0,
        recipe: { quantum_essence: 5, coven_blessing: 2 },
        unlockAtAb: 100000.0
    },
    {
        id: "u_covenaltar_1",
        displayName: "Blessing Amplifier",
        description: "Triples Coven Altar production",
        affects: "producer:ws_covenaltar",
        type: "multiplier",
        value: 3.0,
        recipe: { coven_blessing: 5, eldritch_wax: 2 },
        unlockAtAb: 250000.0
    },
    {
        id: "u_eldritchforge_1",
        displayName: "Eldritch Power",
        description: "Triples Eldritch Forge production",
        affects: "producer:ws_eldritchforge",
        type: "multiplier",
        value: 3.0,
        recipe: { eldritch_wax: 5, arcane_candle: 2 },
        unlockAtAb: 500000.0
    },
    
    // Tier 4 - Legendary upgrades
    {
        id: "u_arcanetower_1",
        displayName: "Arcane Mastery",
        description: "Triples Arcane Tower production",
        affects: "producer:ws_arcanetower",
        type: "multiplier",
        value: 3.0,
        recipe: { arcane_candle: 5, void_crystal: 2 },
        unlockAtAb: 1000000.0
    },
    {
        id: "u_voidchamber_1",
        displayName: "Void Mastery",
        description: "Triples Void Chamber production",
        affects: "producer:ws_voidchamber",
        type: "multiplier",
        value: 3.0,
        recipe: { void_crystal: 5, infinity_flux: 1 },
        unlockAtAb: 2500000.0
    },
    {
        id: "u_infinitycore_1",
        displayName: "Infinity Mastery",
        description: "Triples Infinity Core production",
        affects: "producer:ws_infinitycore",
        type: "multiplier",
        value: 3.0,
        recipe: { infinity_flux: 3, void_crystal: 10, arcane_candle: 10 },
        unlockAtAb: 10000000.0
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
        recipe: { dig_candle: 5, crystal_core: 3 },
        unlockAtAb: 10000.0
    },
    {
        id: "u_ab_mult_2",
        displayName: "AB Amplifier",
        description: "Increases all AB production by 100%",
        affects: "ab_production",
        type: "multiplier",
        value: 2.0,
        recipe: { sigil_charge: 10, quantum_essence: 5 },
        unlockAtAb: 100000.0
    },
    {
        id: "u_ab_mult_3",
        displayName: "AB Transcendence",
        description: "Increases all AB production by 200%",
        affects: "ab_production",
        type: "multiplier",
        value: 3.0,
        recipe: { eldritch_wax: 10, arcane_candle: 5, void_crystal: 2 },
        unlockAtAb: 1000000.0
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
        id: "pp_candle_mult",
        displayName: "Wax Moon",
        description: "+5% Digital Candle Farm production per level",
        type: "producer_mult",
        param: "ws_candle",
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: "pp_crystal_mult",
        displayName: "Facet Star",
        description: "+5% Crystal Rig production per level",
        type: "producer_mult",
        param: "ws_crystal",
        value: 0.05,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    {
        id: "pp_cauldron_mult",
        displayName: "Crucible Pact",
        description: "+5% Quantum Cauldron production per level",
        type: "producer_mult",
        param: "ws_cauldron",
        value: 0.05,
        baseCostPp: 12.0,
        costGrowth: 1.5
    },
    {
        id: "pp_sigilforge_mult",
        displayName: "Sigil Star",
        description: "+5% Sigil Forge production per level",
        type: "producer_mult",
        param: "ws_sigilforge",
        value: 0.05,
        baseCostPp: 20.0,
        costGrowth: 1.5
    },
    {
        id: "pp_quantumlab_mult",
        displayName: "Quantum Constellation",
        description: "+5% Quantum Laboratory production per level",
        type: "producer_mult",
        param: "ws_quantumlab",
        value: 0.05,
        baseCostPp: 30.0,
        costGrowth: 1.5
    },
    {
        id: "pp_eldritchforge_mult",
        displayName: "Eldritch Star",
        description: "+5% Eldritch Forge production per level",
        type: "producer_mult",
        param: "ws_eldritchforge",
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: "pp_arcanetower_mult",
        displayName: "Arcane Star",
        description: "+5% Arcane Tower production per level",
        type: "producer_mult",
        param: "ws_arcanetower",
        value: 0.05,
        baseCostPp: 75.0,
        costGrowth: 1.5
    },
    {
        id: "pp_voidchamber_mult",
        displayName: "Void Star",
        description: "+5% Void Chamber production per level",
        type: "producer_mult",
        param: "ws_voidchamber",
        value: 0.05,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    {
        id: "pp_infinitycore_mult",
        displayName: "Infinity Star",
        description: "+5% Infinity Core production per level",
        type: "producer_mult",
        param: "ws_infinitycore",
        value: 0.05,
        baseCostPp: 200.0,
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
    {
        id: "d_kindle",
        displayName: "Kindle the Grid",
        description: "Craft 3 Wax Melters",
        condition: "craft:workstation:ws_melter:3",
        rewardType: "ab",
        rewardValue: 5000.0
    },
    {
        id: "d_song",
        displayName: "Crystal Song",
        description: "Own 3 Crystal Rigs",
        condition: "own:workstation:ws_crystal:3",
        rewardType: "buff",
        rewardValue: 900.0,
        buffMultiplier: 0.10
    },
    {
        id: "d_flow",
        displayName: "Rite of Flow",
        description: "Cast 150 times",
        condition: "tap:150",
        rewardType: "ek_frag",
        rewardValue: 1.0
    },
    {
        id: "d_threads",
        displayName: "Threads of Fate",
        description: "Craft 20 Braided Wicks (via experiment)",
        condition: "craft_item:braided_wick:20",
        rewardType: "ab",
        rewardValue: 8000.0
    },
    {
        id: "d_alchemy",
        displayName: "Aether Alchemy",
        description: "Craft 10 Distilled Aether (via experiment)",
        condition: "craft_item:dist_aether:10",
        rewardType: "buff",
        rewardValue: 600.0,
        buffMultiplier: 0.15
    }
];

export const HIDDEN_RECIPES = [
    // Tier 0-1 conversions
    {
        id: "wax_block_bulk",
        inputs: { wax_bits: 50 },
        outputs: { wax_block: 5 },
        name: "Wax Block Bulk",
        description: "Convert raw wax into refined blocks"
    },
    {
        id: "braid_wick",
        inputs: { wick_fiber: 30 },
        outputs: { braided_wick: 3 },
        name: "Braided Wick",
        description: "Weave fibers into sturdy wicks"
    },
    {
        id: "distill_aether",
        inputs: { aether_ess: 40 },
        outputs: { dist_aether: 4 },
        name: "Distilled Aether",
        description: "Purify essence into stable aether"
    },
    {
        id: "candle_compile",
        inputs: { wax_block: 5, braided_wick: 1, dist_aether: 2 },
        outputs: { dig_candle: 1 },
        name: "Digital Candle",
        description: "Assemble a mystical candle artifact"
    },
    {
        id: "crystal_boost",
        inputs: { shaped_crys: 10, dist_aether: 5 },
        outputs: { ab: 50 },
        name: "Crystal Boost",
        description: "Convert crystals directly to AB"
    },
    {
        id: "crystal_ab_conversion",
        inputs: { crystal_dust: 100 },
        outputs: { ab: 10 },
        name: "Crystal to AB Conversion",
        description: "Convert crystal dust to AB"
    },
    {
        id: "excess_basic_conversion",
        inputs: { wax_bits: 1000, wick_fiber: 1000 },
        outputs: { dist_aether: 5 },
        name: "Excess Materials Conversion",
        description: "Convert excess basic materials to distilled aether"
    },
    
    // Tier 2 conversions
    {
        id: "crystal_core_craft",
        inputs: { shaped_crys: 20, dist_aether: 10 },
        outputs: { crystal_core: 2 },
        name: "Crystal Core Crafting",
        description: "Forge powerful crystal cores"
    },
    {
        id: "wax_hex_ritual",
        inputs: { wax_block: 20, crystal_core: 2 },
        outputs: { wax_hex: 3 },
        name: "Wax Hex Ritual",
        description: "Enchant wax with hex magic"
    },
    {
        id: "aether_flux_synthesis",
        inputs: { dist_aether: 30, crystal_core: 5 },
        outputs: { aether_flux: 4 },
        name: "Aether Flux Synthesis",
        description: "Create powerful aether flux"
    },
    {
        id: "ab_conversion_2",
        inputs: { crystal_core: 10, aether_flux: 5 },
        outputs: { ab: 500 },
        name: "Advanced AB Conversion",
        description: "Convert advanced materials to AB"
    },
    
    // Tier 3 conversions
    {
        id: "sigil_charge_craft",
        inputs: { wax_hex: 10, crystal_core: 5, aether_flux: 3 },
        outputs: { sigil_charge: 2 },
        name: "Sigil Charge Crafting",
        description: "Create powerful sigil charges"
    },
    {
        id: "quantum_essence_synthesis",
        inputs: { sigil_charge: 5, crystal_core: 10, aether_flux: 5 },
        outputs: { quantum_essence: 2 },
        name: "Quantum Essence Synthesis",
        description: "Synthesize quantum essence"
    },
    {
        id: "coven_blessing_ritual",
        inputs: { sigil_charge: 10, quantum_essence: 3, dig_candle: 5 },
        outputs: { coven_blessing: 1 },
        name: "Coven Blessing Ritual",
        description: "Invoke a powerful coven blessing"
    },
    {
        id: "eldritch_wax_creation",
        inputs: { coven_blessing: 2, quantum_essence: 5, sigil_charge: 15 },
        outputs: { eldritch_wax: 1 },
        name: "Eldritch Wax Creation",
        description: "Create legendary eldritch wax"
    },
    {
        id: "ab_conversion_3",
        inputs: { quantum_essence: 10, coven_blessing: 5 },
        outputs: { ab: 10000 },
        name: "Master AB Conversion",
        description: "Convert master materials to AB"
    },
    
    // Tier 4 conversions
    {
        id: "arcane_candle_ritual",
        inputs: { eldritch_wax: 5, coven_blessing: 10, quantum_essence: 20 },
        outputs: { arcane_candle: 1 },
        name: "Arcane Candle Ritual",
        description: "Create an arcane candle"
    },
    {
        id: "void_crystal_forging",
        inputs: { arcane_candle: 3, eldritch_wax: 10, coven_blessing: 20 },
        outputs: { void_crystal: 1 },
        name: "Void Crystal Forging",
        description: "Forge a void crystal"
    },
    {
        id: "infinity_flux_synthesis",
        inputs: { void_crystal: 2, arcane_candle: 10, eldritch_wax: 50 },
        outputs: { infinity_flux: 1 },
        name: "Infinity Flux Synthesis",
        description: "Synthesize infinity flux"
    },
    {
        id: "ab_conversion_4",
        inputs: { eldritch_wax: 20, arcane_candle: 10, void_crystal: 5 },
        outputs: { ab: 100000 },
        name: "Legendary AB Conversion",
        description: "Convert legendary materials to AB"
    }
];

