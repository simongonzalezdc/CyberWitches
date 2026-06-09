/**
 * Element Specialization System
 * Provides RPG-like element specialization bonuses during ascension
 */

import { INGREDIENTS } from './modules/data/ingredients.js';
import { PRODUCERS } from './modules/data/producers.js';

// Build lookup maps (computed once at module load)
const ingredientElementMap = new Map(INGREDIENTS.map(i => [i.id, i.element]));
const producerElementMap = new Map(PRODUCERS.map(p => [p.id, p.element]));

export const ELEMENT_SPECIALIZATIONS = {
    fire: {
        id: 'fire',
        name: 'Fire Path: Forge Master',
        icon: 'F',
        description: 'Preserve through intensity. Build aggressive preservation structures that burn bright and fast. Rush to automation, maximize what you can save before it\'s gone.',
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
        icon: 'W',
        description: 'Preserve through efficiency. Build balanced structures that flow smoothly. Reduce waste—every bit of magic matters. Sustainable growth means more magic preserved overall.',
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
        icon: 'A',
        description: 'Preserve through speed. Unlock preservation techniques faster—time is running out. Your structures work faster, unlocking new tiers before the fading catches up.',
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
        icon: 'C',
        description: 'Preserve through stability. Build universal foundations that support all elements. Crystal structures are the most stable—they resist the fading better than others.',
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
 * Get element for an ingredient ID using data-driven lookup
 */
export function getIngredientElement(ingredientId) {
    return ingredientElementMap.get(ingredientId) ?? null;
}

/**
 * Get element for a workstation ID using data-driven lookup
 */
export function getWorkstationElement(workstationId) {
    return producerElementMap.get(workstationId) ?? null;
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
