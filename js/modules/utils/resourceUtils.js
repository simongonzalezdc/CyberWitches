/**
 * resourceUtils.js
 * Utility functions for resource calculations and element mapping.
 */

import { PRODUCERS } from '../data/index.js';

/**
 * Map ingredient IDs to their elements based on workstation outputs
 * @param {string} ingId - The ingredient ID
 * @returns {string|null} The element (fire, water, air, crystal, aether) or null
 */
export function getIngredientElement(ingId) {
    // Base essences map directly to elements
    if (ingId === 'fire_essence') return 'fire';
    if (ingId === 'water_essence') return 'water';
    if (ingId === 'air_essence') return 'air';
    if (ingId === 'crystal_dust') return 'crystal';
    if (ingId === 'aether_ess') return 'aether';

    // Special ingredients
    if (ingId === 'focus') return 'aether'; // Focus is Aether-related (meditation/mental energy)
    if (ingId === 'ab') return 'aether'; // Spell Energy is Aether currency

    // Find which workstation produces this ingredient
    const producer = PRODUCERS.find(p => {
        if (!p.outputs) return false;
        return Object.keys(p.outputs).includes(ingId);
    });

    if (!producer) {
        // If not found, try to infer from name
        if (ingId.includes('fire') || ingId.includes('candle') || ingId.includes('wax') || ingId.includes('flame')) return 'fire';
        if (ingId.includes('water') || ingId.includes('liquid') || ingId.includes('aqua') || ingId.includes('flowing')) return 'water';
        if (ingId.includes('air') || ingId.includes('wind') || ingId.includes('zephyr') || ingId.includes('breath') || ingId.includes('gust')) return 'air';
        if (ingId.includes('crystal') || ingId.includes('shaped') || ingId.includes('orb') || (ingId.includes('core') && !ingId.includes('infinity'))) return 'crystal';
        if (ingId.includes('aether') || ingId.includes('dist') || ingId.includes('infinity') || ingId === 'ab') return 'aether';
        return null;
    }

    // Map workstation type to element based on building type and name
    const wsId = producer.id;

    // Fire: Forges (except crystal/wind ones)
    if (wsId.includes('fire') || wsId.includes('candle') || (wsId.includes('forge') && !wsId.includes('crystal') && !wsId.includes('wind') && !wsId.includes('spiral'))) return 'fire';

    // Water: Wells (except aether ones)
    if (wsId.includes('water') || wsId.includes('aqua') || wsId.includes('liquid') || wsId.includes('flowing') || (wsId.includes('well') && !wsId.includes('aether'))) return 'water';

    // Air: Generators
    if (wsId.includes('air') || wsId.includes('zephyr') || wsId.includes('wind') || wsId.includes('breath') || wsId.includes('generator') || wsId.includes('spiral')) return 'air';

    // Crystal: Chambers
    if (wsId.includes('crystal') || wsId.includes('chamber')) return 'crystal';

    // Aether: Reactors
    if (wsId.includes('aether') || wsId.includes('reactor')) return 'aether';

    return null;
}

/**
 * Calculate total amount of ingredients for each element
 * @param {Object} gameState - The current game state
 * @returns {Object} Totals for each element
 */
export function calculateElementTotals(gameState) {
    if (!gameState || !gameState.inventory) {
        return { fire: 0, water: 0, air: 0, crystal: 0, aether: 0 };
    }

    const totals = { fire: 0, water: 0, air: 0, crystal: 0, aether: 0 };

    // Sum up all ingredients by element
    for (const ingId in gameState.inventory) {
        const amount = gameState.inventory[ingId] || 0;
        if (amount <= 0) continue;

        const element = getIngredientElement(ingId);
        if (element && totals.hasOwnProperty(element)) {
            totals[element] += amount;
        }
    }

    return totals;
}
