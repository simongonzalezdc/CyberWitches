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
