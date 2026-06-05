export const PRESTIGE_BONUSES = [
    // Global production bonuses
    {
        id: 'pp_global_1',
        displayName: "Coven's Oath",
        description: '+10% all production / level',
        type: 'global_mult',
        value: 0.10,
        baseCostPp: 10.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_global_2',
        displayName: 'Eldritch Pact',
        description: '+25% all production / level',
        type: 'global_mult',
        value: 0.25,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_global_3',
        displayName: 'Infinity Binding',
        description: '+50% all production / level',
        type: 'global_mult',
        value: 0.50,
        baseCostPp: 200.0,
        costGrowth: 1.5
    },

    // Starting currency bonuses
    {
        id: 'pp_start_bits',
        displayName: 'Seeded Spellbook',
        description: '+1000 SE at start / level',
        type: 'starting_currency',
        value: 1000.0,
        baseCostPp: 5.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_start_bits_2',
        displayName: 'Enchanted Tome',
        description: '+10K SE at start / level',
        type: 'starting_currency',
        value: 10000.0,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_start_bits_3',
        displayName: 'Arcane Library',
        description: '+100K SE at start / level',
        type: 'starting_currency',
        value: 100000.0,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },

    // Producer-specific bonuses
    {
        id: 'pp_digcandle_forge_mult',
        displayName: 'Candle Moon',
        description: '+5% Digital Candle / level',
        type: 'producer_mult',
        param: 'ws_digcandle_forge',
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_crystal_mult',
        displayName: 'Orb Star',
        description: '+5% Crystal Orb / level',
        type: 'producer_mult',
        param: 'ws_crystal_chamber_t1',
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_cauldron_mult',
        displayName: 'Well Constellation',
        description: '+5% Aether Well / level',
        type: 'producer_mult',
        param: 'ws_aether_reactor_t1',
        value: 0.05,
        baseCostPp: 8.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_sigilforge_mult',
        displayName: 'Reactor Star',
        description: '+5% Etheric Reactor / level',
        type: 'producer_mult',
        param: 'ws_etheric_bit_reactor',
        value: 0.05,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_quantumlab_mult',
        displayName: 'Quantum Constellation',
        description: '+5% Quantum Crystal Chamber / level',
        type: 'producer_mult',
        param: 'ws_quantum_crystal_chamber',
        value: 0.05,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_covenaltar_mult',
        displayName: 'Nexus Star',
        description: '+5% Etheric Energy Reactor / level',
        type: 'producer_mult',
        param: 'ws_etheric_bit_reactor',
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_eldritchforge_mult',
        displayName: 'Eldritch Star',
        description: '+5% Quantum Candle Forge / level',
        type: 'producer_mult',
        param: 'ws_quantum_candle_forge',
        value: 0.05,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_arcanetower_mult',
        displayName: 'Arcane Star',
        description: '+5% Arcane Candle Forge / level',
        type: 'producer_mult',
        param: 'ws_arcane_candle_forge',
        value: 0.05,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_voidchamber_mult',
        displayName: 'Void Star',
        description: '+5% Void Crystal Chamber / level',
        type: 'producer_mult',
        param: 'ws_void_crystal_chamber',
        value: 0.05,
        baseCostPp: 200.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_infinitycore_ab_mult',
        displayName: 'Engine Star',
        description: '+5% Infinity Energy Reactor / level',
        type: 'producer_mult',
        param: 'ws_infinity_bit_reactor',
        value: 0.05,
        baseCostPp: 1000.0,
        costGrowth: 1.5
    },

    // Starting ingredient bonuses
    {
        id: 'pp_start_ingred',
        displayName: 'Pocket Satchel',
        description: '+100 Fire Essence / level',
        type: 'start_ingredient',
        param: 'fire_essence',
        value: 100.0,
        baseCostPp: 6.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_start_ingred_2',
        displayName: 'Enchanted Pouch',
        description: '+1K Fire Essence / level',
        type: 'start_ingredient',
        param: 'fire_essence',
        value: 1000.0,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_start_crystal',
        displayName: 'Crystal Cache',
        description: '+50 Crystal Cores / level',
        type: 'start_ingredient',
        param: 'crystal_core',
        value: 50.0,
        baseCostPp: 30.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_start_sigil',
        displayName: 'Sigil Reserve',
        description: '+10 Focus / level',
        type: 'start_ingredient',
        param: 'focus',
        value: 10.0,
        baseCostPp: 50.0,
        costGrowth: 1.5
    },

    // Special bonuses
    {
        id: 'pp_ab_mult',
        displayName: 'Arcane Bits Amplifier',
        description: '+10% SE production / level',
        type: 'ab_production_mult',
        value: 0.10,
        baseCostPp: 25.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_click_mult',
        displayName: 'Cast Mastery',
        description: '+5% cast rewards / level',
        type: 'click_mult',
        value: 0.05,
        baseCostPp: 15.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_prestige_speed',
        displayName: 'Ascension Speed',
        description: '+1% EK gain / level',
        type: 'prestige_speed',
        value: 0.01,
        baseCostPp: 100.0,
        costGrowth: 1.5
    },

    {
        id: 'pp_meditation_focus_1',
        displayName: 'Meditative Focus',
        description: '+20% meditation Focus / level',
        type: 'meditation_focus_mult',
        value: 0.20,
        baseCostPp: 20.0,
        costGrowth: 1.5
    },
    {
        id: 'pp_focus_conversion_1',
        displayName: 'Focus Conversion',
        description: '+10% Focus→SE conversion / level',
        type: 'focus_conversion_mult',
        value: 0.10,
        baseCostPp: 30.0,
        costGrowth: 1.5
    }
];
