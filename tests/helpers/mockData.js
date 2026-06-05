/**
 * Mock Data for Tests
 * Reusable test data to keep tests consistent and maintainable
 */

/**
 * Mock game state data
 */
export const mockGameState = {
    basic: {
        ab: 100,
        abTotalEarned: 100,
        inventory: {},
        workstations: {},
        upgradesOwned: {},
        prestigePoints: 0,
        prestigeCount: 0,
        discoveredRecipes: [],
        totalTaps: 0
    },

    midGame: {
        ab: 5000,
        abTotalEarned: 10000,
        inventory: {
            fire: 100,
            water: 50,
            earth: 75,
            air: 60
        },
        workstations: {
            ws_basic_fire: 5,
            ws_basic_water: 3
        },
        upgradesOwned: {
            upgrade_fire_1: true,
            upgrade_water_1: true
        },
        prestigePoints: 10,
        prestigeCount: 1,
        discoveredRecipes: ['recipe_1', 'recipe_2'],
        totalTaps: 500
    },

    lateGame: {
        ab: 1000000,
        abTotalEarned: 5000000,
        inventory: {
            fire: 10000,
            water: 8000,
            earth: 9000,
            air: 7500,
            fused_aether: 500,
            resonant_crystal: 300
        },
        workstations: {
            ws_basic_fire: 50,
            ws_basic_water: 40,
            ws_aether_fusion_chamber: 10,
            ws_resonance_crystallizer: 8
        },
        upgradesOwned: {
            upgrade_fire_1: true,
            upgrade_fire_2: true,
            upgrade_water_1: true,
            upgrade_water_2: true,
            upgrade_global_1: true
        },
        prestigePoints: 100,
        prestigeCount: 5,
        discoveredRecipes: ['recipe_1', 'recipe_2', 'recipe_3', 'recipe_4'],
        totalTaps: 5000
    }
};

/**
 * Mock save data with different versions
 */
export const mockSaveData = {
    v1: {
        version: '1.0',
        timestamp: Date.now() / 1000,
        ab: 500,
        abTotal: 800,
        inventory: { fire: 100 },
        workstations: { ws_basic_fire: 3 },
        upgrades: { upgrade_fire_1: true },
        prestige: {
            points: 10,
            lifetimeEarned: 2000,
            bonuses: {},
            count: 1
        },
        experiments: { discovered: [] },
        stats: {
            totalTaps: 100,
            totalWorkstationsCrafted: 8,
            totalPotionsCrafted: 0
        }
    },

    v2: {
        version: '2.1',
        timestamp: Date.now() / 1000,
        ab: 1000,
        abTotal: 2000,
        inventory: { fire: 200, water: 150 },
        workstations: { ws_basic_fire: 5, ws_basic_water: 3 },
        upgrades: { upgrade_fire_1: true, upgrade_water_1: true },
        prestige: {
            points: 25,
            lifetimeEarned: 5000,
            bonuses: {},
            count: 2
        },
        experiments: { discovered: ['recipe_1'] },
        stats: {
            totalTaps: 250,
            totalWorkstationsCrafted: 15,
            totalPotionsCrafted: 0
        },
        milestones: { unlocked: ['milestone_1'] }
    },

    corrupted: 'invalid json data { not valid }'
};

/**
 * Mock producers (workstations)
 */
export const mockProducers = [
    {
        id: 'test_producer_1',
        displayName: 'Test Producer 1',
        unlockAtAb: 0,
        recipe: { fire: 10 },
        growth: 1.1,
        outputs: { water: 1.0 },
        baseCost: 10
    },
    {
        id: 'test_producer_2',
        displayName: 'Test Producer 2',
        unlockAtAb: 100,
        recipe: { water: 20, earth: 10 },
        growth: 1.15,
        outputs: { air: 0.5, ab: 0.1 },
        baseCost: 50
    }
];

/**
 * Mock upgrades
 */
export const mockUpgrades = [
    {
        id: 'test_upgrade_global',
        displayName: 'Test Global Upgrade',
        description: 'Doubles all production',
        affects: 'global',
        type: 'multiplier',
        value: 2.0,
        recipe: { fire: 50 },
        unlockAtAb: 0
    },
    {
        id: 'test_upgrade_specific',
        displayName: 'Test Specific Upgrade',
        description: 'Boosts fire production',
        affects: 'fire',
        type: 'multiplier',
        value: 1.5,
        recipe: { fire: 25, water: 25 },
        unlockAtAb: 50
    }
];

/**
 * Mock ingredients
 */
export const mockIngredients = [
    { id: 'fire', displayName: 'Fire', tier: 1 },
    { id: 'water', displayName: 'Water', tier: 1 },
    { id: 'earth', displayName: 'Earth', tier: 1 },
    { id: 'air', displayName: 'Air', tier: 1 },
    { id: 'fused_aether', displayName: 'Fused Aether', tier: 1.5 },
    { id: 'resonant_crystal', displayName: 'Resonant Crystal', tier: 1.5 }
];

/**
 * Mock analytics events
 */
export const mockAnalyticsEvents = {
    cast: {
        category: 'gameplay',
        action: 'cast',
        data: { amount: 1, source: 'manual' }
    },

    craft: {
        category: 'economy',
        action: 'craft_workstation',
        data: { workstationId: 'ws_basic_fire', count: 1, cost: 10 }
    },

    prestige: {
        category: 'progression',
        action: 'prestige',
        data: { prestigeCount: 1, pointsGained: 50, abTotal: 1000000 }
    },

    achievement: {
        category: 'achievement',
        action: 'unlock',
        data: { achievementId: 'first_cast', timestamp: Date.now() }
    }
};

/**
 * Mock retention data
 */
export const mockRetentionData = {
    firstVisit: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
    d1Return: Date.now(),
    d7Return: null,
    d30Return: null,
    utmSource: 'reddit',
    utmMedium: 'organic',
    utmCampaign: 'launch'
};

/**
 * Mock achievements
 */
export const mockAchievements = [
    {
        id: 'first_cast',
        displayName: 'First Cast',
        description: 'Cast your first spell',
        condition: { type: 'stat', stat: 'totalTaps', value: 1 },
        reward: { type: 'ab', value: 10 },
        unlocked: false
    },
    {
        id: 'workstation_master',
        displayName: 'Workstation Master',
        description: 'Own 10 workstations',
        condition: { type: 'workstation_count', value: 10 },
        reward: { type: 'multiplier', target: 'global', value: 1.1 },
        unlocked: false
    }
];

/**
 * Mock onboarding steps
 */
export const mockOnboardingSteps = [
    {
        id: 'welcome',
        title: 'Welcome',
        message: 'Welcome to the game',
        action: null,
        completed: false
    },
    {
        id: 'first_cast',
        title: 'Cast a Spell',
        message: 'Click the cast button',
        action: 'cast',
        completed: false
    },
    {
        id: 'first_craft',
        title: 'Craft a Workstation',
        message: 'Craft your first workstation',
        action: 'craft_workstation',
        completed: false
    }
];

/**
 * Mock element specializations
 */
export const mockSpecializations = {
    fire: {
        element: 'fire',
        level: 2,
        bonus: 0.2, // 20% bonus
        unlocked: true
    },
    water: {
        element: 'water',
        level: 1,
        bonus: 0.1,
        unlocked: true
    },
    earth: {
        element: 'earth',
        level: 0,
        bonus: 0,
        unlocked: false
    }
};

/**
 * Generate random game state for stress testing
 */
export function generateRandomGameState(seed = Date.now()) {
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    return {
        ab: random(0, 1000000),
        abTotalEarned: random(0, 5000000),
        inventory: {
            fire: random(0, 10000),
            water: random(0, 10000),
            earth: random(0, 10000),
            air: random(0, 10000)
        },
        workstations: {
            ws_basic_fire: random(0, 100),
            ws_basic_water: random(0, 100)
        },
        upgradesOwned: {},
        prestigePoints: random(0, 500),
        prestigeCount: random(0, 20),
        discoveredRecipes: [],
        totalTaps: random(0, 10000)
    };
}

/**
 * Deep clone helper for test data
 */
export function cloneTestData(data) {
    return JSON.parse(JSON.stringify(data));
}
