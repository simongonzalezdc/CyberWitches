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
