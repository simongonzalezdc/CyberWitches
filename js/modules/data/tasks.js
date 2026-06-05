export const DAILY_TASKS_POOL = [
    // Tier 0 - Basic tasks
    {
        id: 'd_kindle',
        displayName: 'Preserve the Flame',
        description: 'Craft 3 Fire Forges to preserve Fire essence before it fades',
        condition: 'craft:workstation:ws_fire_forge:3',
        rewardType: 'ab',
        rewardValue: 5000.0
    },
    {
        id: 'd_shape',
        displayName: 'Stabilize Crystal',
        description: 'Craft 2 Crystal Chambers to stabilize Crystal essence before it fades',
        condition: 'craft:workstation:ws_crystal_chamber:2',
        rewardType: 'ab',
        rewardValue: 7500.0
    },
    {
        id: 'd_still',
        displayName: 'Synthesize Aether',
        description: 'Craft 2 Aether Synthesizers to preserve Aether before it fades',
        condition: 'craft:workstation:ws_aether_synthesizer:2',
        rewardType: 'ab',
        rewardValue: 7500.0
    },

    // Tier 1 - Intermediate tasks
    {
        id: 'd_song',
        displayName: 'Crystal Resonance',
        description: 'Maintain 3 Crystal Orb Chambers to keep preserved magic stable',
        condition: 'own:workstation:ws_crystal_chamber:3',
        rewardType: 'buff',
        rewardValue: 900.0,
        buffMultiplier: 0.10
    },
    {
        id: 'd_forge',
        displayName: 'Preserve Digital Candles',
        description: 'Craft 2 Digital Candle Forges to preserve Fire essence in stable form',
        condition: 'craft:workstation:ws_digcandle_forge:2',
        rewardType: 'ab',
        rewardValue: 10000.0
    },
    {
        id: 'd_well',
        displayName: 'Aether Well',
        description: 'Maintain 2 Aether Wells to preserve Aether essence',
        condition: 'own:workstation:ws_aether_reactor_t1:2',
        rewardType: 'buff',
        rewardValue: 1200.0,
        buffMultiplier: 0.12
    },

    // Tier 2 - Advanced tasks
    {
        id: 'd_enhanced',
        displayName: 'Enhanced Preservation',
        description: 'Craft 2 Enhanced Candle Forges to preserve Fire essence in enhanced form',
        condition: 'craft:workstation:ws_enhanced_candle_forge:2',
        rewardType: 'ab',
        rewardValue: 25000.0
    },
    {
        id: 'd_core',
        displayName: 'Core Forging',
        description: 'Own 2 Crystal Core Chambers',
        condition: 'own:workstation:ws_crystal_core_chamber:2',
        rewardType: 'buff',
        rewardValue: 1800.0,
        buffMultiplier: 0.15
    },
    {
        id: 'd_flux',
        displayName: 'Flux Reactor',
        description: 'Craft 1 Arcane Bit Reactor',
        condition: 'craft:workstation:ws_arcane_bit_reactor:1',
        rewardType: 'ab',
        rewardValue: 30000.0
    },

    // Tier 3 - Master tasks
    {
        id: 'd_quantum',
        displayName: 'Quantum Forging',
        description: 'Craft 1 Quantum Candle Forge',
        condition: 'craft:workstation:ws_quantum_candle_forge:1',
        rewardType: 'ab',
        rewardValue: 50000.0
    },
    {
        id: 'd_essence',
        displayName: 'Quantum Essence',
        description: 'Own 1 Quantum Crystal Chamber',
        condition: 'own:workstation:ws_quantum_crystal_chamber:1',
        rewardType: 'buff',
        rewardValue: 2400.0,
        buffMultiplier: 0.20
    },

    // Tier 4 - Legendary tasks
    {
        id: 'd_arcane',
        displayName: 'Arcane Tower',
        description: 'Craft 1 Arcane Candle Forge',
        condition: 'craft:workstation:ws_arcane_candle_forge:1',
        rewardType: 'ab',
        rewardValue: 100000.0
    },
    {
        id: 'd_void',
        displayName: 'Void Crystal',
        description: 'Own 1 Void Crystal Chamber',
        condition: 'own:workstation:ws_void_crystal_chamber:1',
        rewardType: 'buff',
        rewardValue: 3600.0,
        buffMultiplier: 0.25
    },

    // General tasks
    {
        id: 'd_flow',
        displayName: 'Rite of Flow',
        description: 'Cast 150 times',
        condition: 'tap:150',
        rewardType: 'ek_frag',
        rewardValue: 1.0
    },
    {
        id: 'd_ab_earn',
        displayName: 'Accumulate Power',
        description: 'Earn 10000 SE',
        condition: 'earn_ab:10000',
        rewardType: 'ab',
        rewardValue: 5000.0
    },
    {
        id: 'd_experiment',
        displayName: 'Experimentation',
        description: 'Discover 3 recipes',
        condition: 'discover_recipe:3',
        rewardType: 'ab',
        rewardValue: 15000.0
    },
    {
        id: 'd_potions',
        displayName: 'Potion Master',
        description: 'Craft 5 temporary buff potions',
        condition: 'craft_potion:5',
        rewardType: 'buff',
        rewardValue: 600.0,
        buffMultiplier: 0.15
    },

    // Meditation tasks
    {
        id: 'd_meditation',
        displayName: 'Meditation Session',
        description: 'Complete 3 meditation waves',
        condition: 'meditation_waves:3',
        rewardType: 'ab',
        rewardValue: 20000.0
    },
    {
        id: 'd_towers',
        displayName: 'Tower Defense',
        description: 'Place 5 meditation towers',
        condition: 'meditation_towers:5',
        rewardType: 'ab',
        rewardValue: 15000.0
    },
    {
        id: 'd_focus',
        displayName: 'Focus Accumulation',
        description: 'Earn 100 Focus',
        condition: 'earn_focus:100',
        rewardType: 'ab',
        rewardValue: 10000.0
    },
    {
        id: 'd_focus_experiment',
        displayName: 'Focus Experiment',
        description: 'Discover Focus Elixir recipe',
        condition: 'discover_recipe:focus_elixir',
        rewardType: 'ab',
        rewardValue: 25000.0
    }
];
