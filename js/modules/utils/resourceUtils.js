/**
 * resourceUtils.js
 * Utility functions for resource calculations and element mapping.
 */

import { getIngredientElement as getElementFromSpecialization } from '../../elementSpecialization.js';

/**
 * Map ingredient IDs to their elements using the canonical implementation
 * @param {string} ingId - The ingredient ID
 * @returns {string|null} The element (fire, water, air, crystal, aether) or null
 */
export function getIngredientElement(ingId) {
    return getElementFromSpecialization(ingId);
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
        if (element && Object.hasOwn(totals, element)) {
            totals[element] += amount;
        }
    }

    return totals;
}
