/**
 * Element Specialization System
 * Provides RPG-like element specialization bonuses during ascension
 */

export const ELEMENT_SPECIALIZATIONS = {
    fire: {
        id: 'fire',
        name: 'Fire Path: Forge Master',
        icon: '🔥',
        description: 'Aggressive production, fast automation, currency focus',
        bonuses: {
            baseProductionMult: 1.5,      // +50% Fire production
            abProductionMult: 1.25,        // +25% AB from Fire reactors
            costReduction: 0.2,            // -20% Fire building costs
            castRewardMult: 1.1            // +10% cast rewards
        },
        uniqueMechanic: {
            name: 'Inferno Mode',
            description: 'Build 10 Fire buildings to activate 3x production for 5 minutes',
            trigger: 'fire_buildings_10',
            effect: 'production_3x',
            duration: 300, // 5 minutes
            cooldown: 1800 // 30 minutes
        }
    },
    water: {
        id: 'water',
        name: 'Water Path: Flow Master',
        icon: '💧',
        description: 'Balanced production, resource efficiency, sustainability',
        bonuses: {
            baseProductionMult: 1.5,      // +50% Water production
            globalProductionMult: 1.25,   // +25% all production
            costReduction: 0.3,            // -30% all building costs
            ingredientProductionMult: 1.2 // +20% ingredient production
        },
        uniqueMechanic: {
            name: 'Tide Pool',
            description: 'Passive +10% resource generation, +1% per Water building',
            trigger: 'passive',
            effect: 'passive_generation',
            baseBonus: 0.1,
            perBuilding: 0.01
        }
    },
    air: {
        id: 'air',
        name: 'Air Path: Speed Master',
        icon: '💨',
        description: 'Fast progression, quick unlocks, rapid scaling',
        bonuses: {
            baseProductionMult: 1.5,      // +50% Air production
            unlockSpeedMult: 0.7,          // Unlock 30% earlier (0.7x AB requirement)
            productionSpeedMult: 1.25,     // +25% production speed
            castSpeedMult: 1.15            // +15% cast speed
        },
        uniqueMechanic: {
            name: 'Gale Force',
            description: 'Unlock new tier to activate 2x speed for 10 minutes',
            trigger: 'tier_unlock',
            effect: 'speed_2x',
            duration: 600, // 10 minutes
            cooldown: 'per_tier'
        }
    },
    crystal: {
        id: 'crystal',
        name: 'Crystal Path: Foundation Master',
        icon: '💎',
        description: 'Universal bonuses, bottleneck management, foundation building',
        bonuses: {
            baseProductionMult: 1.5,      // +50% Crystal production
            universalIngredientMult: 1.25, // +25% universal ingredients
            bottleneckCostReduction: 0.4,  // -40% bottleneck costs
            crystalBuildingMult: 1.3      // +30% production from Crystal buildings
        },
        uniqueMechanic: {
            name: 'Crystal Resonance',
            description: 'Build 5 Crystal buildings to activate +20% all production (permanent)',
            trigger: 'crystal_buildings_5',
            effect: 'global_production_1.2x',
            duration: 'permanent'
        }
    }
};

/**
 * Get element for an ingredient ID
 */
export function getIngredientElement(ingredientId) {
    if (ingredientId.includes('fire') || ingredientId.includes('candle') || ingredientId.includes('flame')) {
        return 'fire';
    }
    if (ingredientId.includes('water') || ingredientId.includes('aqua') || ingredientId.includes('liquid') || ingredientId.includes('current') || ingredientId.includes('flow')) {
        return 'water';
    }
    if (ingredientId.includes('air') || ingredientId.includes('wind') || ingredientId.includes('zephyr') || ingredientId.includes('breath') || ingredientId.includes('gust')) {
        return 'air';
    }
    if (ingredientId.includes('crystal') || ingredientId.includes('orb') || ingredientId.includes('core') || ingredientId.includes('shaped_crys')) {
        return 'crystal';
    }
    if (ingredientId.includes('aether') || ingredientId.includes('dist_aether') || ingredientId.includes('aether_well')) {
        return 'aether';
    }
    return null;
}

/**
 * Get element for a workstation ID
 */
export function getWorkstationElement(workstationId) {
    if (workstationId.includes('fire') || workstationId.includes('candle') || workstationId.includes('flame') || workstationId.includes('digcandle') || workstationId.includes('enhanced_candle') || workstationId.includes('quantum_candle') || workstationId.includes('arcane_candle') || workstationId.includes('eternal_flame')) {
        return 'fire';
    }
    if (workstationId.includes('water') || workstationId.includes('aqua') || workstationId.includes('liquid') || workstationId.includes('current') || workstationId.includes('flow')) {
        return 'water';
    }
    if (workstationId.includes('air') || workstationId.includes('wind') || workstationId.includes('zephyr') || workstationId.includes('breath')) {
        return 'air';
    }
    if (workstationId.includes('crystal') || workstationId.includes('orb') || workstationId.includes('core')) {
        return 'crystal';
    }
    if (workstationId.includes('aether') || workstationId.includes('arcane_bit') || workstationId.includes('etheric_bit') || workstationId.includes('infinity_bit') || workstationId.includes('cosmic_bit')) {
        return 'aether';
    }
    return null;
}

/**
 * Check if ingredient is a universal bottleneck ingredient
 */
export function isUniversalIngredient(ingredientId) {
    const universalIngredients = [
        'shaped_crys',
        'crystal_orb',
        'crystal_core',
        'quantum_crystal',
        'void_crystal',
        'infinity_core'
    ];
    return universalIngredients.includes(ingredientId);
}

/**
 * Check if workstation is an AB producer
 */
export function isABProducer(workstationId) {
    return workstationId.includes('bit_reactor') || workstationId.includes('bit_forge');
}

