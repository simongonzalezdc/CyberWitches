/**
 * CraftingManager.js
 * Manages all crafting operations, including workstations, upgrades, and experiments.
 * Extracts logic previously in GameState to improve modularity.
 */

import { PRODUCERS, UPGRADES, HIDDEN_RECIPES } from '../../modules/data/index.js';

export class CraftingManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Craft a workstation
     * @param {string} wsId - Workstation ID
     * @param {number} amount - Amount to craft
     * @returns {boolean} - Whether crafting was successful
     */
    craftWorkstation(wsId, amount = 1) {
        const prodData = PRODUCERS.find(p => p.id === wsId);
        if (!prodData) return false;

        // Check unlock
        if (this.gameState.ab < prodData.unlockAtAb) return false;

        let successCount = 0;
        for (let i = 0; i < amount; i++) {
            const currentOwned = this.gameState.workstations[wsId] || 0;
            const recipe = this.scaledRecipe(prodData.recipe, currentOwned, prodData.growth);

            if (!this.gameState.canAfford(recipe)) break;

            this.gameState.consumeRecipe(recipe);
            this.gameState.workstations[wsId] = (this.gameState.workstations[wsId] || 0) + 1;
            successCount++;
            this.gameState.totalWorkstationsCrafted++;
        }

        if (successCount > 0) {
            if (this.gameState.onWorkstationCrafted) this.gameState.onWorkstationCrafted(wsId, this.gameState.workstations[wsId]);
            return true;
        }

        return false;
    }

    /**
     * Craft max possible workstations
     * @param {string} wsId - Workstation ID
     * @returns {boolean} - Whether at least one was crafted
     */
    craftWorkstationMax(wsId) {
        const prodData = PRODUCERS.find(p => p.id === wsId);
        if (!prodData) return false;

        // Check unlock
        if (this.gameState.ab < prodData.unlockAtAb) return false;

        let successCount = 0;
        // Limit max crafting to prevent freezing
        const MAX_BATCH = 100;

        for (let i = 0; i < MAX_BATCH; i++) {
            const currentOwned = this.gameState.workstations[wsId] || 0;
            const recipe = this.scaledRecipe(prodData.recipe, currentOwned, prodData.growth);

            if (!this.gameState.canAfford(recipe)) break;

            this.gameState.consumeRecipe(recipe);
            this.gameState.workstations[wsId] = (this.gameState.workstations[wsId] || 0) + 1;
            successCount++;
            this.gameState.totalWorkstationsCrafted++;
        }

        if (successCount > 0) {
            if (this.gameState.onWorkstationCrafted) this.gameState.onWorkstationCrafted(wsId, this.gameState.workstations[wsId]);
            return true;
        }

        return false;
    }

    /**
     * Inscribe an upgrade
     * @param {string} upgId - Upgrade ID
     * @returns {boolean} - Whether inscription was successful
     */
    inscribeUpgrade(upgId) {
        if (this.gameState.upgradesOwned[upgId]) return false;

        const upgData = UPGRADES.find(u => u.id === upgId);
        if (!upgData) return false;

        // Check unlock
        if (this.gameState.ab < upgData.unlockAtAb) return false;

        // Check recipe
        if (!this.gameState.canAfford(upgData.recipe)) return false;

        this.gameState.consumeRecipe(upgData.recipe);
        this.gameState.upgradesOwned[upgId] = true;

        // Invalidate multiplier cache since upgrades affect production
        if (this.gameState.invalidateMultiplierCache) {
            this.gameState.invalidateMultiplierCache();
        }

        return true;
    }

    /**
     * Try to discover a new recipe
     * @returns {Object} - Result object { success, recipe, message }
     */
    tryExperiment() {
        for (const recipe of HIDDEN_RECIPES) {
            if (this.gameState.discoveredRecipes.includes(recipe.id)) continue;

            // Check if player has ingredients
            let hasAll = true;
            for (const ingId in recipe.inputs) {
                if ((this.gameState.inventory[ingId] || 0) < recipe.inputs[ingId]) {
                    hasAll = false;
                    break;
                }
            }

            if (hasAll) {
                // Cap discovered recipes array to prevent unbounded memory growth
                const MAX_DISCOVERED_RECIPES = 100;
                if (this.gameState.discoveredRecipes.length >= MAX_DISCOVERED_RECIPES) {
                    // Remove oldest recipe (FIFO)
                    this.gameState.discoveredRecipes.shift();
                }
                this.gameState.discoveredRecipes.push(recipe.id);
                if (this.gameState.onRecipeDiscovered) this.gameState.onRecipeDiscovered(recipe.id);
                return {
                    success: true,
                    recipe: recipe
                };
            }
        }

        return {
            success: false,
            message: 'No new recipes discovered. Try gathering more materials!'
        };
    }

    /**
     * Craft a discovered recipe
     * @param {string} recipeId - Recipe ID
     * @returns {boolean} - Whether crafting was successful
     */
    craftDiscoveredRecipe(recipeId) {
        if (!this.gameState.discoveredRecipes.includes(recipeId)) return false;

        const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return false;

        if (!this.gameState.canAfford(recipe.inputs)) return false;

        this.gameState.consumeRecipe(recipe.inputs);

        for (const outputId in recipe.outputs) {
            if (outputId === 'ab') {
                this.gameState.addAb(recipe.outputs[outputId]);
            } else {
                // A potion is anything getPotionEffect() recognizes — the single
                // source of truth. Deriving from it (instead of a second hardcoded
                // id list that silently drifts) means new potions activate
                // correctly without touching this file. Previously e.g.
                // `ab_eternal_boost` was a known effect but missing from the list,
                // so it would have wrongly landed in inventory instead of activating.
                const effect = this.gameState.getPotionEffect ? this.gameState.getPotionEffect(outputId) : null;
                if (effect) {
                    // Potions activate immediately on craft (don't add to inventory).
                    for (let i = 0; i < recipe.outputs[outputId]; i++) {
                        this.gameState.addBuff(effect.type, effect.value, effect.duration);
                        this.gameState.totalPotionsCrafted++; // Track potion crafting
                    }
                } else {
                    // Regular ingredients go to inventory
                    this.gameState.addIngredient(outputId, recipe.outputs[outputId]);
                }
            }
        }

        return true;
    }

    /**
     * Helper for scaled recipe calculation if Balance is not available
     */
    scaledRecipe(baseRecipe, owned, growth) {
        const scaled = {};
        for (const ingId in baseRecipe) {
            scaled[ingId] = Math.floor(baseRecipe[ingId] * Math.pow(growth, owned));
        }
        return scaled;
    }
}
