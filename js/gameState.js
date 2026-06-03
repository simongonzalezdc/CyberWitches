import { showLoadingState, hideLoadingState } from './loadingState.js';
import { INGREDIENTS, PRODUCERS, UPGRADES, PRESTIGE_BONUSES, HIDDEN_RECIPES } from './data.js';
import { Balance } from './utils.js';
import { handleError, safeFunction, safeAsyncFunction, validateParams, retryWithBackoff } from './errorHandler.js';
import { GAME_CONSTANTS } from './codeOrganization.js';
import { ELEMENT_SPECIALIZATIONS, getIngredientElement, getWorkstationElement, isUniversalIngredient, isABProducer } from './elementSpecialization.js';
import { debounce } from './commonUtils.js';
// Coven system archived for future development - see ARCHIVED_COVEN_FEATURES.md
// import { CovenSystem } from './covenSystem.js';

/**
 * Game State Manager - Manages all game state and logic
 * Implements DOM update batching to reduce frequent DOM manipulations
 */
export class GameState {
    constructor() {
        // Currency
        this.ab = 0.0;
        this.abTotalEarned = 0.0;

        // Inventory
        this.inventory = {};

        // Workstations
        this.workstations = {};

        // Upgrades
        this.upgradesOwned = {};

        // Prestige
        this.prestigePoints = 0;
        this.prestigeLifetimeEarned = 0.0;
        this.prestigeBonuses = {};

        // Element Specialization
        this.elementSpecialization = null; // 'fire', 'water', 'air', 'crystal', or null
        this.specializationBonuses = {};
        this.prestigeCount = 0; // Track number of ascensions (prestige completions)

        // Buffs
        this.activeBuffs = [];

        // Experiments
        this.discoveredRecipes = [];

        // Stats
        this.totalTaps = 0;
        this.totalWorkstationsCrafted = 0;
        this.totalPotionsCrafted = 0;

        // Story Flags
        this.storyFlags = {
            introShown: false
        };

        // Milestone rewards (Feature 3: Dopamine Maximization)
        this.unlockedMilestones = new Set();
        this.milestones = GAME_CONSTANTS.MILESTONE_THRESHOLDS;

        // Timestamps
        this.lastSaveTime = Date.now() / 1000;

        // Tick timer
        this.tickInterval = null;
        this.lastTickTime = Date.now();

        // Coven System - Archived for future development - see ARCHIVED_COVEN_FEATURES.md
        // this.covenSystem = new CovenSystem(this);
        this.covenSystem = null; // Placeholder to prevent errors

        // Callbacks
        this.onAbChanged = null;
        this.onIngredientChanged = null;
        this.onWorkstationCrafted = null;
        this.onUpgradePurchased = null;
        this.onPrestigeCompleted = null;
        this.onRecipeDiscovered = null;
        this.onWelcomeBack = null;

        // DOM update batching
        this.pendingUpdates = new Set();
        this.batchTimeout = null;
        this.batchDelay = GAME_CONSTANTS.UI_UPDATE_DELAY; // ~60fps

        // Debounced save - wait 3 seconds after last change before saving
        // This prevents blocking the main thread during rapid game state changes
        this.debouncedSave = debounce(() => {
            // Use requestIdleCallback for non-blocking save
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(() => {
                    this.saveGameStateImmediate();
                }, { timeout: 2000 }); // Fallback to timeout after 2s
            } else {
                // Fallback for browsers without requestIdleCallback
                setTimeout(() => {
                    this.saveGameStateImmediate();
                }, 0);
            }
        }, 3000); // Wait 3 seconds of inactivity

        // Pending save flag
        this.hasPendingSave = false;

        // Memoization cache for production multipliers
        this.multiplierCache = new Map();
        this.multiplierCacheDirty = true;
    }

    /**
     * Initialize the game state
     * Note: If using UnifiedGameLoop, call loadGameState() directly instead
     */
    start() {
        this.loadGameState();
        // Only start tick loop if not using UnifiedGameLoop
        // UnifiedGameLoop will call tick() directly
        if (!window.gameLoop) {
            this.startTickLoop();
        }
    }

    /**
     * Start the game tick loop with optimized timing
     * Pauses when tab is hidden to save CPU (similar to audio loops stopping)
     */
    startTickLoop() {
        // Clear existing interval if any
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }

        const tick = () => {
            // Skip tick if tab is hidden (save CPU)
            if (document.hidden) {
                return;
            }
            this.tick();
        };

        this.tickInterval = setInterval(tick, GAME_CONSTANTS.TICK_RATE);

        // Listen for visibility changes to pause/resume
        if (!this.visibilityHandler) {
            this.visibilityHandler = () => {
                if (document.hidden) {
                    // Tab hidden - ticks will be skipped automatically
                    // No need to clear interval, just skip processing
                } else {
                    // Tab visible - ticks will resume automatically
                }
            };
            document.addEventListener('visibilitychange', this.visibilityHandler);
        }
    }

    /**
     * Stop the game tick loop
     */
    stopTickLoop() {
        // Flush any pending saves before stopping
        if (this.hasPendingSave) {
            this.saveGameStateImmediate();
            this.hasPendingSave = false;
        }

        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }

        // Remove visibility handler
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
    }

    /**
     * Main game tick with optimized timing and batching
     * @param {number} delta - Time delta in seconds (from unified game loop)
     * @param {number} eventMultiplier - Event multiplier for production
     */
    tick(delta = null, eventMultiplier = 1.0) {
        // If delta is provided (from unified game loop), use it
        // Otherwise calculate from last tick time (backward compatibility)
        const now = Date.now();
        if (delta === null || delta === undefined) {
            delta = (now - this.lastTickTime) / 1000;
        }
        this.lastTickTime = now;

        // Update buffs
        this.updateBuffs(delta);

        // Calculate production (with event multiplier)
        const production = this.calculateTotalProduction(delta, eventMultiplier);

        // Apply production
        for (const outputId in production) {
            if (outputId === "ab") {
                this.addAb(production[outputId]);
            } else {
                this.addIngredient(outputId, production[outputId]);
            }
        }

        // Auto-save every 30 seconds using debounced version
        const nowSeconds = Date.now() / 1000;
        if (nowSeconds - this.lastSaveTime > GAME_CONSTANTS.AUTO_SAVE_INTERVAL / 1000) {
            this.saveGameState(); // Uses debounced version
            this.hasPendingSave = true;
        }
    }

    /**
     * Calculate total production from all workstations
     * @param {number} delta - Time delta in seconds
     * @param {number} eventMultiplier - Event multiplier for production (default: 1.0)
     * @returns {Object} Total output per resource type
     */
    calculateTotalProduction(delta, eventMultiplier = 1.0) {
        // Safety check for delta
        if (isNaN(delta) || delta <= 0) return {};

        const totalOutput = {};

        // Apply Air specialization speed bonus to delta
        let effectiveDelta = delta;
        if (this.elementSpecialization === 'air' && this.specializationBonuses.productionSpeedMult) {
            effectiveDelta *= this.specializationBonuses.productionSpeedMult;
        }

        for (const wsId in this.workstations) {
            const owned = this.workstations[wsId];
            if (!owned || owned <= 0) continue;

            const prodData = PRODUCERS.find(p => p.id === wsId);
            if (!prodData) continue;

            // Get base outputs
            for (const outputId in prodData.outputs) {
                const baseRate = prodData.outputs[outputId];

                // Apply multipliers
                const mult = this.getProductionMultiplier(wsId);

                // Apply element specialization bonuses
                let specializationMult = 1.0;
                if (this.elementSpecialization) {
                    const spec = this.specializationBonuses;
                    const element = getWorkstationElement(wsId);
                    const ingredientElement = getIngredientElement(outputId);

                    // Element-specific production multiplier
                    if (element === this.elementSpecialization || ingredientElement === this.elementSpecialization) {
                        specializationMult *= spec.baseProductionMult;
                    }

                    // Water: Global production multiplier
                    if (this.elementSpecialization === 'water' && spec.globalProductionMult) {
                        specializationMult *= spec.globalProductionMult;
                    }

                    // Crystal: Universal ingredient multiplier
                    if (this.elementSpecialization === 'crystal' && isUniversalIngredient(outputId)) {
                        specializationMult *= spec.universalIngredientMult;
                    }

                    // Crystal: Crystal building multiplier
                    if (this.elementSpecialization === 'crystal' && element === 'crystal' && spec.crystalBuildingMult) {
                        specializationMult *= spec.crystalBuildingMult;
                    }

                    // Fire: AB production multiplier for Fire-based reactors
                    if (this.elementSpecialization === 'fire' && isABProducer(wsId) && element === 'fire' && spec.abProductionMult) {
                        specializationMult *= spec.abProductionMult;
                    }

                    // Water: Ingredient production multiplier
                    if (this.elementSpecialization === 'water' && spec.ingredientProductionMult && outputId !== 'ab') {
                        specializationMult *= spec.ingredientProductionMult;
                    }
                }

                // Apply event multiplier
                const finalMult = mult * specializationMult * eventMultiplier;

                const finalRate = baseRate * finalMult * owned;

                if (!totalOutput[outputId]) {
                    totalOutput[outputId] = 0.0;
                }
                totalOutput[outputId] += finalRate * effectiveDelta;
            }
        }

        // Apply AB production multipliers to AB output
        if (totalOutput.ab) {
            for (const upgId in this.upgradesOwned) {
                const upgData = UPGRADES.find(u => u.id === upgId);
                if (upgData && upgData.affects === "ab_production") {
                    if (upgData.type === "multiplier") {
                        totalOutput.ab *= upgData.value;
                    }
                }
            }

            // Apply prestige AB production multiplier
            for (const bonusId in this.prestigeBonuses) {
                const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
                if (bonusData && bonusData.type === "ab_production_mult") {
                    const levels = this.prestigeBonuses[bonusId] || 0;
                    totalOutput.ab *= (1.0 + bonusData.value * levels);
                }
            }

            // Apply AB production buffs
            totalOutput.ab *= this.getBuff('ab_production');
        }

        // Apply coven production bonus if in a coven
        // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        // if (totalOutput.ab && this.covenSystem && this.covenSystem.isInCoven()) {
        //     const covenBonus = this.covenSystem.getCovenProductionBonus();
        //     totalOutput.ab *= covenBonus;
        // }

        return totalOutput;
    }

    /**
     * Get production multiplier for a specific workstation (memoized)
     * @param {string} workstationId - ID of the workstation
     * @returns {number} Total production multiplier
     */
    getProductionMultiplier(workstationId) {
        // Check cache if not dirty
        if (!this.multiplierCacheDirty && this.multiplierCache.has(workstationId)) {
            return this.multiplierCache.get(workstationId);
        }

        // Recalculate if cache is dirty or missing
        let mult = 1.0;

        // Global upgrades
        for (const upgId in this.upgradesOwned) {
            const upgData = UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === "global" && upgData.type === "multiplier") {
                mult *= upgData.value;
            }
        }

        // Producer-specific upgrades
        const targetAffects = "producer:" + workstationId;
        for (const upgId in this.upgradesOwned) {
            const upgData = UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === targetAffects && upgData.type === "multiplier") {
                mult *= upgData.value;
            }
        }

        // Prestige bonuses (global)
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === "global_mult") {
                const levels = this.prestigeBonuses[bonusId];
                mult *= (1.0 + bonusData.value * levels);
            }
        }

        // Prestige bonuses (producer-specific)
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === "producer_mult" && bonusData.param === workstationId) {
                const levels = this.prestigeBonuses[bonusId];
                mult *= (1.0 + bonusData.value * levels);
            }
        }

        // Active production buffs
        mult *= this.getBuff('production');

        // Active ingredient production buffs
        mult *= this.getBuff('ingredient_production');

        // Meditation production bonus (only available through meditation)
        if (window.meditationState && typeof window.meditationState.getMeditationProductionBonus === 'function') {
            const meditationBonus = window.meditationState.getMeditationProductionBonus();
            mult *= meditationBonus;
        }

        // Cache the result
        this.multiplierCache.set(workstationId, mult);

        return mult;
    }

    /**
     * Invalidate multiplier cache (call when upgrades/bonuses change)
     */
    invalidateMultiplierCache() {
        this.multiplierCacheDirty = true;
    }

    /**
     * Rebuild multiplier cache for all workstations
     */
    rebuildMultiplierCache() {
        this.multiplierCache.clear();
        this.multiplierCacheDirty = false;

        // Pre-calculate for all owned workstations
        for (const wsId in this.workstations) {
            if (this.workstations[wsId] > 0) {
                this.getProductionMultiplier(wsId);
            }
        }
    }

    /**
     * Get AB production per second
     * @param {number} eventMultiplier - Event multiplier for production (default: 1.0)
     * @returns {number} AB per second
     */
    getAbPerSecond(eventMultiplier = 1.0) {
        const production = this.calculateTotalProduction(1.0, eventMultiplier);
        return production.ab || 0.0;
    }

    /**
     * Update active buffs and remove expired ones
     * @param {number} delta - Time delta in seconds
     */
    updateBuffs(delta) {
        for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
            this.activeBuffs[i].remaining -= delta;
            if (this.activeBuffs[i].remaining <= 0) {
                this.activeBuffs.splice(i, 1);
            }
        }
    }

    addBuff(type, value, duration) {
        this.activeBuffs.push({
            type: type, // 'production', 'ab_production', 'cast_speed', 'ingredient_production', 'prestige_gain'
            value: value, // Multiplier value (e.g., 0.5 for +50%)
            remaining: duration // Duration in seconds
        });

        // Invalidate multiplier cache if production-related buff
        if (type === 'production' || type === 'ab_production' || type === 'ingredient_production') {
            this.invalidateMultiplierCache();
        }
    }

    getBuff(type) {
        let totalValue = 0;
        for (const buff of this.activeBuffs) {
            if (buff.type === type) {
                totalValue += buff.value;
            }
        }
        return 1.0 + totalValue; // Return as multiplier (1.0 + 0.5 = 1.5x)
    }

    getPotionEffect(potionId) {
        // Activate potion based on ID
        const potionEffects = {
            // Tier 1
            'production_elixir': { type: 'production', value: 0.5, duration: 30 * 60 },
            'haste_potion': { type: 'cast_speed', value: 1.0, duration: 15 * 60 },
            'ab_amplifier': { type: 'ab_production', value: 2.0, duration: 20 * 60 },

            // Tier 2
            'mega_production_elixir': { type: 'production', value: 1.0, duration: 60 * 60 },
            'speed_essence': { type: 'cast_speed', value: 2.0, duration: 30 * 60 },
            'ab_turbo_charge': { type: 'ab_production', value: 5.0, duration: 45 * 60 },
            'rare_catalyst': { type: 'ingredient_production', value: 1.0, duration: 60 * 60 },

            // Tier 3
            'ultimate_production_elixir': { type: 'production', value: 2.0, duration: 2 * 60 * 60 },
            'quantum_speed_boost': { type: 'cast_speed', value: 3.0, duration: 60 * 60 },
            'ab_overdrive': { type: 'ab_production', value: 10.0, duration: 1.5 * 60 * 60 },
            'master_catalyst': { type: 'ingredient_production', value: 2.0, duration: 2 * 60 * 60 },
            'prestige_boost': { type: 'prestige_gain', value: 0.5, duration: 3 * 60 * 60 },

            // Tier 4
            'infinity_production_elixir': { type: 'production', value: 5.0, duration: 4 * 60 * 60 },
            'void_speed_surge': { type: 'cast_speed', value: 5.0, duration: 2 * 60 * 60 },
            'ab_infinity_boost': { type: 'ab_production', value: 20.0, duration: 3 * 60 * 60 },
            'ab_eternal_boost': { type: 'ab_production', value: 10.0, duration: 2 * 60 * 60 },
            'infinity_catalyst': { type: 'ingredient_production', value: 4.0, duration: 4 * 60 * 60 },
            'prestige_mastery': { type: 'prestige_gain', value: 1.0, duration: 6 * 60 * 60 }
        };

        return potionEffects[potionId] || null;
    }

    consumePotion(potionId) {
        const have = this.inventory[potionId] || 0;
        if (have < 1) return false;

        this.spendIngredient(potionId, 1);

        const effect = this.getPotionEffect(potionId);
        if (effect) {
            this.addBuff(effect.type, effect.value, effect.duration);
            return true;
        }

        return false;
    }

    /**
     * Add AB to the player's balance with DOM update batching
     * @param {number} amount - Amount of AB to add
     */
    addAb(amount) {
        // Validation: prevent NaN corruption
        if (amount === undefined || amount === null || isNaN(amount)) {
            console.warn('⚠️ Attempted to add invalid AB amount:', amount);
            return;
        }
        
        this.ab += amount;
        this.abTotalEarned += amount;
        this.prestigeLifetimeEarned += amount;
        this.batchUpdate('abChanged', this.ab);

        // Check for milestone rewards (Feature 3: Dopamine Maximization)
        this.checkMilestones();
    }

    /**
     * Check and unlock milestone rewards
     */
    checkMilestones() {
        const currentAB = this.ab;

        this.milestones.forEach(milestone => {
            if (currentAB >= milestone && !this.unlockedMilestones.has(milestone)) {
                this.unlockMilestone(milestone);
            }
        });
    }

    /**
     * Unlock a milestone and give reward
     */
    unlockMilestone(ab) {
        this.unlockedMilestones.add(ab);

        // Give milestone reward (10% of milestone as bonus)
        const reward = ab * 0.1;
        this.ab += reward;

        // Visual feedback
        if (window.showNotification) {
            window.showNotification(`Milestone: ${this.formatShort(ab)} AB! +${this.formatShort(reward)} bonus`, 'success');
        }

        // Particle effects removed for memory optimization
        // Visual feedback now uses CSS animations
        const abDisplay = document.getElementById('ab-display');
        if (abDisplay) {
            // Use CSS animation instead of particles
            if (typeof pulseElement === 'function') {
                pulseElement(abDisplay, 1.1, 200);
            }
        }

        // Audio feedback
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('achievement');
        }
    }

    /**
     * Format short number for display
     */
    formatShort(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(1);
    }

    /**
     * Spend AB if the player has enough
     * @param {number} amount - Amount of AB to spend
     * @returns {boolean} - Whether the transaction was successful
     */
    spendAb(amount) {
        if (this.ab < amount) return false;
        this.ab -= amount;
        this.batchUpdate('abChanged', this.ab);
        return true;
    }

    /**
     * Add ingredient to inventory with DOM update batching
     * @param {string} ingId - Ingredient ID
     * @param {number} amount - Amount to add
     */
    addIngredient(ingId, amount) {
        if (!this.inventory[ingId]) {
            this.inventory[ingId] = 0.0;
        }
        this.inventory[ingId] += amount;
        // Remove item if amount reaches zero (no empty boxes)
        if (this.inventory[ingId] <= 0) {
            delete this.inventory[ingId];
            this.batchUpdate('ingredientChanged', ingId, 0);
        } else {
            this.batchUpdate('ingredientChanged', ingId, this.inventory[ingId]);
        }
    }

    /**
     * Spend ingredient if the player has enough
     * @param {string} ingId - Ingredient ID
     * @param {number} amount - Amount to spend
     * @returns {boolean} - Whether the transaction was successful
     */
    spendIngredient(ingId, amount) {
        if ((this.inventory[ingId] || 0) < amount) return false;
        this.inventory[ingId] -= amount;
        // Remove item if amount reaches zero (no empty boxes)
        if (this.inventory[ingId] <= 0) {
            delete this.inventory[ingId];
            this.batchUpdate('ingredientChanged', ingId, 0);
        } else {
            this.batchUpdate('ingredientChanged', ingId, this.inventory[ingId]);
        }
        return true;
    }

    cast(comboMultiplier = 1.0, eventMultiplier = 1.0) {
        this.totalTaps++;

        // Base tier-0 ingredients (4 alchemical elements - Aether is synthesized from these)
        let baseAmounts = {
            crystal_dust: 0.5,
            fire_essence: 0.5,
            water_essence: 0.5,
            air_essence: 0.5
        };

        // Apply Fire specialization cast reward multiplier
        if (this.elementSpecialization === 'fire' && this.specializationBonuses.castRewardMult) {
            for (const ingId in baseAmounts) {
                baseAmounts[ingId] *= this.specializationBonuses.castRewardMult;
            }
        }

        // Variable reward system (dopamine maximization)
        const bonusRoll = Math.random();
        let bonusMultiplier = 1.0;
        let bonusType = null;

        if (bonusRoll < 0.05) {
            // 5% chance for 2x-5x bonus (jackpot)
            bonusMultiplier = 2.0 + Math.random() * 3.0; // 2.0 to 5.0
            bonusType = 'jackpot';
        } else if (bonusRoll < 0.15) {
            // 10% chance for 1.5x bonus
            bonusMultiplier = 1.5;
            bonusType = 'bonus';
        }

        // Apply click upgrades
        let clickAdditive = 0.0;
        let clickMult = 1.0;

        for (const upgId in this.upgradesOwned) {
            const upgData = UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === "click") {
                if (upgData.type === "multiplier") {
                    clickMult *= upgData.value;
                } else if (upgData.type === "additive") {
                    clickAdditive += upgData.value;
                }
            }
        }

        // Apply prestige click multiplier
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === "click_mult") {
                const levels = this.prestigeBonuses[bonusId] || 0;
                clickMult *= (1.0 + bonusData.value * levels);
            }
        }

        // Apply cast speed buffs
        const castSpeedMult = this.getBuff('cast_speed');

        // Apply combo, event, and bonus multipliers
        const totalMult = clickMult * comboMultiplier * eventMultiplier * castSpeedMult * bonusMultiplier;

        // Grant ingredients (with additive bonus)
        for (const ingId in baseAmounts) {
            this.addIngredient(ingId, (baseAmounts[ingId] + clickAdditive) * totalMult);
        }

        // Also grant a small amount of AB per cast (for progression)
        // This allows players to eventually unlock AB-producing workstations
        const abPerCast = 0.15 * totalMult;
        this.addAb(abPerCast);

        // Trigger bonus feedback if applicable
        if (bonusType && window.triggerBonusFeedback) {
            window.triggerBonusFeedback(bonusType, bonusMultiplier);
        }

        // Track bonus casts for achievements
        if (bonusMultiplier >= 5.0) {
            this.lastCastBonus = 5.0;
        }

        // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        // Update coven progress for casting
        // if (this.covenSystem) this.covenSystem.updateCovenProgress('casting', 1);
    }

    canAfford(recipe) {
        for (const ingId in recipe) {
            const needed = recipe[ingId];
            const have = this.inventory[ingId] || 0.0;
            if (have < needed) return false;
        }
        return true;
    }

    consumeRecipe(recipe) {
        for (const ingId in recipe) {
            this.spendIngredient(ingId, recipe[ingId]);
        }
    }

    calculatePrestigeGain() {
        const currentEk = Balance.prestigePointsFor(this.prestigeLifetimeEarned);
        const baseGain = Math.max(0, currentEk - this.prestigePoints);

        // Apply prestige gain buffs
        const prestigeBuffMult = this.getBuff('prestige_gain');

        return baseGain * prestigeBuffMult;
    }

    ascend() {
        const ekGain = this.calculatePrestigeGain();
        if (ekGain <= 0) return;

        this.prestigePoints += ekGain;
        this.prestigeCount++; // Increment prestige count (number of ascensions)

        // Reset element specialization (player will choose new one)
        this.elementSpecialization = null;
        this.specializationBonuses = {};

        // Reset run
        this.ab = 0.0;
        this.abTotalEarned = 0.0;
        this.inventory = {};
        this.workstations = {};
        this.upgradesOwned = {};
        this.activeBuffs = [];
        this.totalTaps = 0;
        this.totalWorkstationsCrafted = 0;
        this.totalPotionsCrafted = 0;

        // Apply prestige start bonuses
        this.applyPrestigeStartBonuses();

        // Trigger specialization choice UI (will be handled in game.js)
        if (this.onPrestigeCompleted) this.onPrestigeCompleted(ekGain);
        this.saveGameStateImmediate(); // Critical save - use immediate
    }

    /**
     * Choose element specialization (called from UI after ascension)
     * @param {string} element - 'fire', 'water', 'air', or 'crystal'
     * @returns {boolean} - Whether the choice was successful
     */
    chooseElementSpecialization(element) {
        if (!['fire', 'water', 'air', 'crystal'].includes(element)) {
            console.error('Invalid element specialization:', element);
            return false;
        }

        this.elementSpecialization = element;
        const spec = ELEMENT_SPECIALIZATIONS[element];
        if (spec) {
            this.specializationBonuses = spec.bonuses;
        } else {
            console.error('Element specialization not found:', element);
            return false;
        }

        this.saveGameStateImmediate(); // Critical save - use immediate
        return true;
    }

    applyPrestigeStartBonuses() {
        // Starting AB
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === "starting_currency") {
                const levels = this.prestigeBonuses[bonusId];
                this.addAb(bonusData.value * levels);
            }
        }

        // Starting ingredients
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === "start_ingredient") {
                const levels = this.prestigeBonuses[bonusId];
                this.addIngredient(bonusData.param, bonusData.value * levels);
            }
        }
    }

    purchasePrestigeBonus(bonusId) {
        const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
        if (!bonusData) return false;

        const currentLevel = this.prestigeBonuses[bonusId] || 0;
        const cost = bonusData.baseCostPp * Math.pow(bonusData.costGrowth, currentLevel);

        if (this.prestigePoints < cost) return false;

        this.prestigePoints -= Math.floor(cost);
        this.prestigeBonuses[bonusId] = (this.prestigeBonuses[bonusId] || 0) + 1;

        // Invalidate multiplier cache since bonuses affect production
        this.invalidateMultiplierCache();

        return true;
    }

    // tryExperiment moved to CraftingManager

    // craftDiscoveredRecipe moved to CraftingManager

    /**
     * Save game state (debounced) - Use this for auto-saves
     */
    saveGameState() {
        this.debouncedSave();
    }

    /**
     * Save game state immediately to localStorage with error handling
     * Use this for critical saves (before prestige, manual save, etc.)
     */
    saveGameStateImmediate() {
        // Include element specialization in save
        try {
            // Show loading state if available
            let loadingId = null;
            if (showLoadingState) {
                loadingId = showLoadingState('Saving game...');
            }

            const saveData = {
                ab: this.ab,
                abTotal: this.abTotalEarned,
                inventory: { ...this.inventory },
                workstations: { ...this.workstations },
                upgrades: { ...this.upgradesOwned },
                prestige: {
                    points: this.prestigePoints,
                    lifetimeEarned: this.prestigeLifetimeEarned,
                    bonuses: { ...this.prestigeBonuses },
                    count: this.prestigeCount
                },
                experiments: {
                    discovered: [...this.discoveredRecipes]
                },
                stats: {
                    totalTaps: this.totalTaps,
                    totalWorkstationsCrafted: this.totalWorkstationsCrafted,
                    totalPotionsCrafted: this.totalPotionsCrafted
                },
                milestones: {
                    unlocked: Array.from(this.unlockedMilestones)
                },
                // Element Specialization
                elementSpecialization: this.elementSpecialization,
                specializationBonuses: { ...this.specializationBonuses },
                // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
                coven: null, // this.covenSystem ? this.covenSystem.saveCovenData() : null,
                timestamp: Date.now() / 1000,
                version: "2.1" // Updated version for save data validation
            };

            // Validate save data before saving
            if (!this.validateSaveData(saveData)) {
                console.error('Save data validation failed!', saveData);
                handleError(new Error('Save data validation failed'), 'save', true);
                return;
            }

            // Compress save data before storing
            const compressedDataObj = this.compressSaveDataObject(saveData);

            // Add checksum for integrity verification (calculate on compressed data)
            compressedDataObj.checksum = this.calculateChecksum(compressedDataObj);

            // Stringify and save
            const compressedData = JSON.stringify(compressedDataObj);
            localStorage.setItem('cyberWitchesSave', compressedData);
            this.lastSaveTime = Date.now() / 1000;

            // Hide loading state
            if (loadingId && hideLoadingState) {
                hideLoadingState(loadingId);
            }
        } catch (error) {
            // Hide loading state on error
            if (hideLoadingState) {
                hideLoadingState();
            }
            handleError(error, 'save', true);
        }
    }

    /**
     * Load game state from localStorage with validation and error handling
     */
    loadGameState() {
        try {
            // Show loading state if available
            let loadingId = null;
            if (showLoadingState) {
                loadingId = showLoadingState('Loading game...');
            }

            const saveDataStr = localStorage.getItem('cyberWitchesSave');
            if (!saveDataStr) {
                // Hide loading state if no save data
                if (loadingId && window.hideLoadingState) {
                    window.hideLoadingState(loadingId);
                }
                return;
            }

            let data;
            try {
                data = JSON.parse(saveDataStr);

                // Check for save conflicts (multiple saves)
                this.checkSaveConflicts();
            } catch (parseError) {
                console.error('Failed to parse save data:', parseError);
                handleError(parseError, 'load', true);
                // Try to create backup before clearing
                try {
                    localStorage.setItem('cyberWitchesSave_backup_' + Date.now(), saveDataStr);
                } catch (e) {
                    console.error('Failed to create backup:', e);
                }
                return;
            }

            // Verify checksum for data integrity
            if (!this.verifyChecksum(data)) {
                console.warn('Save data checksum verification failed - recalculating checksum');
                // Recalculate checksum and update it (may have been saved with different property order or structure)
                const newChecksum = this.calculateChecksum(data);
                data.checksum = newChecksum;

                // Create backup of the original save
                try {
                    localStorage.setItem('cyberWitchesSave_checksum_fix_' + Date.now(), saveDataStr);
                } catch (e) {
                    console.error('Failed to create checksum fix backup:', e);
                }

                // Continue loading with recalculated checksum
                // The checksum will be updated on next save
            }

            // Migrate save data if needed
            if (data.version && this.migrateSaveData) {
                if (!this.migrateSaveData(data)) {
                    console.warn('Save data migration failed, starting fresh');
                    // Preserve the un-migratable save so it is never silently lost.
                    try {
                        localStorage.setItem('cyberWitchesSave_migration_failed_' + Date.now(), saveDataStr);
                    } catch (e) {
                        console.error('Failed to back up un-migratable save:', e);
                    }
                    // Tell the player rather than silently resetting their progress.
                    handleError(
                        new Error('Your save could not be upgraded to this version and was reset. A backup was kept in this browser.'),
                        'load:migration', true
                    );
                    return;
                }
            }

            // Validate save data structure
            if (!this.validateSaveData(data)) {
                console.warn('Invalid save data detected, starting fresh');
                // Create backup before clearing
                try {
                    localStorage.setItem('cyberWitchesSave_backup_' + Date.now(), saveDataStr);
                } catch (e) {
                    console.error('Failed to create backup:', e);
                }
                // Surface the reset to the player instead of failing silently.
                handleError(
                    new Error('Your save was corrupted and could not be loaded, so the game was reset. A backup was kept in this browser.'),
                    'load:validation', true
                );
                return;
            }

            // Calculate offline progress BEFORE loading state
            const elapsed = (Date.now() / 1000) - (data.timestamp || Date.now() / 1000);

            // Load state
            this.ab = Number(data.ab);
            if (isNaN(this.ab)) {
                console.warn('⚠️ Corrupted Save: AB was NaN. Resetting to 0.');
                this.ab = 0.0;
            }
            
            this.abTotalEarned = Number(data.abTotal);
            if (isNaN(this.abTotalEarned)) {
                this.abTotalEarned = 0.0;
            }

            this.inventory = data.inventory || {};
            this.workstations = data.workstations || {};
            this.upgradesOwned = data.upgrades || {};

            // Clean up deprecated ingredients from inventory
            this.cleanupInventory();

            const prestigeData = data.prestige || {};
            this.prestigePoints = prestigeData.points || 0;
            this.prestigeLifetimeEarned = prestigeData.lifetimeEarned || 0.0;
            this.prestigeBonuses = prestigeData.bonuses || {};

            // Load element specialization
            this.elementSpecialization = data.elementSpecialization || null;
            if (this.elementSpecialization) {
                const spec = ELEMENT_SPECIALIZATIONS[this.elementSpecialization];
                if (spec) {
                    this.specializationBonuses = spec.bonuses;
                } else {
                    // Invalid specialization, reset it
                    this.elementSpecialization = null;
                    this.specializationBonuses = {};
                }
            } else {
                this.specializationBonuses = {};
            }

            // Load prestige count, with fallback: if missing but has prestige points, assume at least 1 ascension
            let prestigeCountInferred = false;
            if (prestigeData.count !== undefined && prestigeData.count !== null) {
                this.prestigeCount = prestigeData.count;
            } else if (this.prestigePoints > 0 || Object.keys(this.prestigeBonuses).length > 0) {
                // If they have prestige points or bonuses but no count, they must have ascended at least once
                this.prestigeCount = 1;
                prestigeCountInferred = true;
                console.log('Prestige count missing from save, inferred from prestige points/bonuses. Setting to 1.');
            } else {
                this.prestigeCount = 0;
            }

            // If we inferred the count, save it back to ensure it's persisted
            if (prestigeCountInferred) {
                // Save after a short delay to ensure all loading is complete
                setTimeout(() => {
                    this.saveGameState();
                }, 1000);
            }

            const experimentsData = data.experiments || {};
            this.discoveredRecipes = experimentsData.discovered || [];

            const stats = data.stats || {};
            this.totalTaps = stats.totalTaps || 0;
            this.totalWorkstationsCrafted = stats.totalWorkstationsCrafted || 0;
            this.totalPotionsCrafted = stats.totalPotionsCrafted || 0;

            // Load unlocked milestones
            const milestonesData = data.milestones || {};
            if (milestonesData.unlocked && Array.isArray(milestonesData.unlocked)) {
                this.unlockedMilestones = new Set(milestonesData.unlocked);
            } else {
                this.unlockedMilestones = new Set();
            }

            // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
            // Load coven data
            // if (this.covenSystem && data.coven) this.covenSystem.loadCovenData(data.coven);

            // Apply offline progress
            if (elapsed > 0) {
                this.applyOfflineProgress(elapsed);
            }

            this.lastSaveTime = Date.now() / 1000;

            // Hide loading state
            if (loadingId && hideLoadingState) {
                hideLoadingState(loadingId);
            }
        } catch (error) {
            // Hide loading state on error
            if (hideLoadingState) {
                hideLoadingState();
            }
            handleError(error, 'load', true);
        }
    }

    /**
     * Apply offline progress with validation
     * @param {number} elapsedSeconds - Time elapsed in seconds
     */
    applyOfflineProgress(elapsedSeconds) {
        const abps = this.getAbPerSecond();
        const offlineAb = Balance.calculateOfflineProduction(elapsedSeconds, abps);

        if (offlineAb > 0) {
            this.addAb(offlineAb);
            this.batchUpdate('welcomeBack', elapsedSeconds, offlineAb);

            // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
            // Update coven progress for offline production
            // if (this.covenSystem) this.covenSystem.updateCovenProgress('production', offlineAb, 'ab');
        }
    }

    /**
     * Batch DOM updates to reduce frequent manipulations
     * @param {string} updateType - Type of update
     * @param {...any} args - Arguments for the update callback
     */
    batchUpdate(updateType, ...args) {
        // Add to pending updates
        this.pendingUpdates.add({ type: updateType, args });

        // Clear existing timeout
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
        }

        // Set new timeout to process batch
        this.batchTimeout = setTimeout(() => {
            this.processBatchedUpdates();
        }, this.batchDelay);
    }

    /**
     * Process all batched DOM updates
     */
    processBatchedUpdates() {
        // Group updates by type to avoid redundant calls
        const updateGroups = new Map();

        for (const update of this.pendingUpdates) {
            if (!updateGroups.has(update.type)) {
                updateGroups.set(update.type, []);
            }
            updateGroups.get(update.type).push(update.args);
        }

        // Process each group
        for (const [type, argsList] of updateGroups) {
            // Use only the latest args for each type to avoid redundant updates
            const latestArgs = argsList[argsList.length - 1];

            switch (type) {
                case 'abChanged':
                    if (this.onAbChanged) {
                        this.onAbChanged(...latestArgs);
                    }
                    break;
                case 'ingredientChanged':
                    if (this.onIngredientChanged) {
                        this.onIngredientChanged(...latestArgs);
                    }
                    break;
                case 'welcomeBack':
                    if (this.onWelcomeBack) {
                        this.onWelcomeBack(...latestArgs);
                    }
                    break;
            }
        }

        // Clear pending updates
        this.pendingUpdates.clear();
        this.batchTimeout = null;
    }

    /**
     * Validate save data structure and values
     * @param {Object} data - Save data to validate
     * @returns {boolean} - Whether the data is valid
     */
    validateSaveData(data) {
        // Check basic structure
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            console.error('Save validation failed: Invalid data structure');
            return false;
        }

        // Check version exists and is valid
        if (!data.version || typeof data.version !== 'string') {
            console.warn('Save data missing version, attempting migration');
            // Try to migrate old save data
            return this.migrateSaveData(data);
        }

        // Validate numeric values
        const numericFields = ['ab', 'abTotal', 'timestamp'];
        for (const field of numericFields) {
            if (data[field] !== undefined) {
                if (typeof data[field] !== 'number' || isNaN(data[field])) {
                    console.error(`Save validation failed: Invalid ${field} value`);
                    return false;
                }

                // Check for bounded values (prevent negative/overflow)
                if (field === 'ab' || field === 'abTotal') {
                    if (data[field] < 0) {
                        console.error(`Save validation failed: Negative ${field} value`);
                        return false;
                    }
                    if (data[field] > Number.MAX_SAFE_INTEGER) {
                        console.error(`Save validation failed: ${field} overflow`);
                        return false;
                    }
                }

                // Timestamp validation (reasonable range)
                if (field === 'timestamp') {
                    const currentTime = Date.now() / 1000;
                    const year2020 = 1577836800; // Jan 1, 2020
                    const futureLimit = currentTime + (365 * 24 * 60 * 60); // 1 year in future

                    if (data[field] < year2020 || data[field] > futureLimit) {
                        console.error(`Save validation failed: Invalid timestamp (${data[field]})`);
                        return false;
                    }
                }
            }
        }

        // Validate nested objects
        const objectFields = ['inventory', 'workstations', 'upgrades', 'prestige', 'experiments', 'stats'];
        for (const field of objectFields) {
            if (data[field] !== undefined) {
                if (typeof data[field] !== 'object' || data[field] === null) {
                    console.error(`Save validation failed: Invalid ${field} object`);
                    return false;
                }

                // Validate inventory/workstation values are non-negative numbers
                if (field === 'inventory' || field === 'workstations') {
                    for (const key in data[field]) {
                        const value = data[field][key];
                        if (typeof value !== 'number' || isNaN(value) || value < 0) {
                            console.error(`Save validation failed: Invalid ${field}.${key} value`);
                            return false;
                        }
                        if (value > Number.MAX_SAFE_INTEGER) {
                            console.error(`Save validation failed: ${field}.${key} overflow`);
                            return false;
                        }
                    }
                }

                // Validate prestige data
                if (field === 'prestige' && data.prestige) {
                    const prestigeFields = ['points', 'lifetimeEarned', 'count'];
                    for (const pField of prestigeFields) {
                        if (data.prestige[pField] !== undefined) {
                            if (typeof data.prestige[pField] !== 'number' || isNaN(data.prestige[pField]) || data.prestige[pField] < 0) {
                                console.error(`Save validation failed: Invalid prestige.${pField} value`);
                                return false;
                            }
                        }
                    }

                    // Validate bonuses object
                    if (data.prestige.bonuses && typeof data.prestige.bonuses === 'object') {
                        for (const bonusId in data.prestige.bonuses) {
                            const level = data.prestige.bonuses[bonusId];
                            if (typeof level !== 'number' || isNaN(level) || level < 0 || level > 1000) {
                                console.error(`Save validation failed: Invalid prestige bonus level for ${bonusId}`);
                                return false;
                            }
                        }
                    }
                }
            }
        }

        // Validate arrays
        const arrayFields = ['discoveredRecipes'];
        for (const field of arrayFields) {
            if (data[field] !== undefined && !Array.isArray(data[field])) {
                console.error(`Save validation failed: ${field} is not an array`);
                return false;
            }
        }

        // Validate experiments.discovered array if it exists
        if (data.experiments?.discovered !== undefined) {
            if (!Array.isArray(data.experiments.discovered)) {
                console.error('Save validation failed: experiments.discovered is not an array');
                return false;
            }
            // Limit array size to prevent memory issues
            if (data.experiments.discovered.length > 1000) {
                console.error('Save validation failed: experiments.discovered array too large');
                return false;
            }
        }

        // Validate milestones.unlocked if it exists
        if (data.milestones?.unlocked !== undefined) {
            if (!Array.isArray(data.milestones.unlocked)) {
                console.error('Save validation failed: milestones.unlocked is not an array');
                return false;
            }
            if (data.milestones.unlocked.length > 10000) {
                console.error('Save validation failed: milestones.unlocked array too large');
                return false;
            }
        }

        // Check data size to prevent localStorage overflow
        const dataStr = JSON.stringify(data);
        const dataSizeKB = dataStr.length / 1024;
        if (dataSizeKB > 4096) { // 4MB limit (localStorage usually has 5-10MB limit)
            console.error(`Save validation failed: Save data too large (${dataSizeKB.toFixed(2)} KB)`);
            return false;
        }

        return true;
    }

    /**
     * Recursively sort object keys for deterministic JSON stringification
     * @param {*} obj - Object to sort
     * @returns {*} Object with sorted keys
     */
    sortObjectKeys(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sortObjectKeys(item));
        }

        const sorted = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
            sorted[key] = this.sortObjectKeys(obj[key]);
        }
        return sorted;
    }

    /**
     * Calculate a simple checksum for save data integrity
     * @param {Object} data - Save data to checksum
     * @returns {string} Checksum value
     */
    calculateChecksum(data) {
        // Create a clean copy without checksum field
        const cleanData = { ...data };
        delete cleanData.checksum;

        // Sort keys recursively to ensure deterministic JSON stringification
        const sortedData = this.sortObjectKeys(cleanData);

        // Simple hash function (not cryptographic, just for corruption detection)
        const str = JSON.stringify(sortedData);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    /**
     * Verify save data checksum
     * @param {Object} data - Save data with checksum
     * @returns {boolean} True if checksum is valid or missing (old save)
     */
    verifyChecksum(data) {
        // If no checksum exists, it's an old save - allow it
        if (!data.checksum) {
            return true;
        }

        // Calculate expected checksum
        const expectedChecksum = this.calculateChecksum(data);

        if (data.checksum !== expectedChecksum) {
            // Don't log as error - this is handled gracefully in loadGameState
            // The mismatch might be due to property order differences
            return false;
        }

        return true;
    }

    /**
     * Migrate save data from older versions
     * @param {Object} data - Save data to migrate
     * @returns {boolean} - Whether migration was successful
     */
    migrateSaveData(data) {
        try {
            // Add version if missing
            if (!data.version) {
                data.version = "2.0";
            }

            // Migrate from version 1.0 to 2.0
            if (data.version === "1.0" || parseFloat(data.version) < 2.0) {
                // Ensure all required fields exist
                if (!data.inventory) data.inventory = {};
                if (!data.workstations) data.workstations = {};
                if (!data.upgrades) data.upgrades = {};
                if (!data.prestige) data.prestige = { points: 0, lifetimeEarned: 0.0, bonuses: {}, count: 0 };
                if (!data.experiments) data.experiments = { discovered: [] };
                if (!data.stats) data.stats = { totalTaps: 0, totalWorkstationsCrafted: 0, totalPotionsCrafted: 0 };
                if (!data.milestones) data.milestones = { unlocked: [] };

                data.version = "2.0";
            }

            // Migrate to version 2.1 (add validation and ensure prestige.count exists)
            if (data.version === "2.0" || parseFloat(data.version) < 2.1) {
                // Ensure prestige.count exists - if missing but has prestige points/bonuses, infer it
                if (data.prestige) {
                    if (data.prestige.count === undefined || data.prestige.count === null) {
                        // If they have prestige points or bonuses, they must have ascended at least once
                        if ((data.prestige.points > 0) || (data.prestige.bonuses && Object.keys(data.prestige.bonuses).length > 0)) {
                            data.prestige.count = 1;
                            console.log('Migrating save: Added missing prestige.count (inferred from prestige points/bonuses)');
                        } else {
                            data.prestige.count = 0;
                        }
                    }
                }

                data.version = "2.1";
            }

            return true;
        } catch (error) {
            console.error('Save data migration failed:', error);
            return false;
        }
    }

    /**
     * Compress save data to reduce size (returns object)
     * @param {Object} data - Save data to compress
     * @returns {Object} Compressed save data object
     */
    compressSaveDataObject(data) {
        // Remove unnecessary data
        const compressed = {
            ab: data.ab,
            abTotal: data.abTotal,
            inventory: data.inventory,
            workstations: data.workstations,
            upgrades: data.upgrades,
            prestige: data.prestige,
            experiments: data.experiments,
            stats: data.stats,
            milestones: data.milestones,
            elementSpecialization: data.elementSpecialization,
            specializationBonuses: data.specializationBonuses,
            timestamp: data.timestamp,
            version: data.version
        };

        // Remove zero values to save space
        Object.keys(compressed.inventory).forEach(key => {
            if (compressed.inventory[key] === 0) {
                delete compressed.inventory[key];
            }
        });

        Object.keys(compressed.workstations).forEach(key => {
            if (compressed.workstations[key] === 0) {
                delete compressed.workstations[key];
            }
        });

        return compressed;
    }

    /**
     * Compress save data to reduce size (returns string)
     * @param {Object} data - Save data to compress
     * @returns {string} Compressed save data
     */
    compressSaveData(data) {
        const compressed = this.compressSaveDataObject(data);
        // Include checksum if it exists
        if (data.checksum) {
            compressed.checksum = data.checksum;
        }
        return JSON.stringify(compressed);
    }

    /**
     * Clean up deprecated ingredients from inventory
     * Removes ingredients that no longer exist in the game
     */
    cleanupInventory() {
        if (!this.inventory) return;

        // List of deprecated ingredients that should be removed
        const deprecatedIngredients = [
            'quantum_essence',
            'quantum_aether',
            'aether_flux',
            'wax_hex',
            'infinity_flux',
            'eldritch_wax',
            'sigil_charge',
            'coven_blessing'
        ];

        // Get list of valid ingredient IDs from INGREDIENTS array
        const validIngredients = new Set();
        if (typeof INGREDIENTS !== 'undefined') {
            INGREDIENTS.forEach(ing => validIngredients.add(ing.id));
        }

        // Also allow base essences and AB
        validIngredients.add('fire_essence');
        validIngredients.add('water_essence');
        validIngredients.add('air_essence');
        validIngredients.add('crystal_dust');
        validIngredients.add('aether_ess');
        validIngredients.add('ab');

        // Remove deprecated ingredients
        let removedCount = 0;
        for (const depIng of deprecatedIngredients) {
            if (this.inventory.hasOwnProperty(depIng)) {
                const amount = this.inventory[depIng];
                delete this.inventory[depIng];
                removedCount++;
                console.log(`Removed deprecated ingredient: ${depIng} (had ${amount})`);
            }
        }

        // Remove any ingredients not in the valid list (check against INGREDIENTS array)
        // Also remove items with zero or negative amounts (clean up empty slots)
        const itemsToRemove = [];
        for (const ingId in this.inventory) {
            // Remove items with zero or negative amounts (clean up empty slots)
            if ((this.inventory[ingId] || 0) <= 0) {
                itemsToRemove.push(ingId);
                continue;
            }

            if (!validIngredients.has(ingId)) {
                // Check if it's a meditation-only ingredient (keep those)
                const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                if (!ingredient || !ingredient.meditationOnly) {
                    const amount = this.inventory[ingId];
                    itemsToRemove.push(ingId);
                    console.log(`Removed invalid ingredient: ${ingId} (had ${amount})`);
                }
            }
        }

        // Remove all items in one pass
        for (const ingId of itemsToRemove) {
            delete this.inventory[ingId];
            removedCount++;
        }

        if (removedCount > 0) {
            console.log(`Cleaned up ${removedCount} deprecated/invalid ingredients from inventory`);
            // Save after cleanup - debounced is fine for cleanup
            this.saveGameState();
        }
    }

    /**
     * Check for save conflicts and resolve them
     * @returns {boolean} True if conflicts were resolved, false otherwise
     */
    checkSaveConflicts() {
        // Check for multiple save files (exclude all backup/checkpoint files)
        const allSaveKeys = Object.keys(localStorage).filter(key =>
            key.startsWith('cyberWitchesSave') &&
            !key.includes('_backup_') &&
            !key.includes('_corrupted_') &&
            !key.includes('_checksum_fix_')
        );

        if (allSaveKeys.length <= 1) {
            return false; // No conflicts (only main save exists)
        }

        // If we have multiple save files (not backups), log once
        if (!this._saveConflictLogged) {
            console.warn('Multiple save files detected. Attempting to resolve conflicts.');
            this._saveConflictLogged = true;
        }

        // Parse all saves
        const saves = [];
        allSaveKeys.forEach(key => {
            try {
                const saveDataStr = localStorage.getItem(key);
                const saveData = JSON.parse(saveDataStr);
                saves.push({
                    key: key,
                    data: saveData,
                    timestamp: saveData.timestamp || 0,
                    version: saveData.version || '1.0'
                });
            } catch (e) {
                console.error('Failed to parse save:', key, e);
            }
        });

        if (saves.length <= 1) {
            return false; // No valid saves
        }

        // Sort by timestamp (most recent first)
        saves.sort((a, b) => b.timestamp - a.timestamp);

        // Get primary save (most recent)
        const primarySave = saves[0];

        // Try to merge saves if they're close in time (within 5 minutes)
        const timeDiff = primarySave.timestamp - saves[1].timestamp;
        const fiveMinutes = 5 * 60; // 5 minutes in seconds

        if (timeDiff < fiveMinutes && saves.length === 2) {
            // Attempt to merge saves
            const merged = this.mergeSaveData(primarySave.data, saves[1].data);
            if (merged) {
                console.log('Successfully merged save data.');
                const mergedData = {
                    ...primarySave.data,
                    ...merged,
                    timestamp: Math.max(primarySave.timestamp, saves[1].timestamp),
                    version: primarySave.version
                };
                localStorage.setItem('cyberWitchesSave', JSON.stringify(mergedData));

                // Clean up old saves
                saves.forEach(save => {
                    if (save.key !== 'cyberWitchesSave') {
                        localStorage.removeItem(save.key);
                    }
                });
                return true;
            }
        }

        // Use most recent save if merge failed or saves are too far apart
        if (primarySave.key !== 'cyberWitchesSave') {
            const saveData = localStorage.getItem(primarySave.key);
            localStorage.setItem('cyberWitchesSave', saveData);
        }

        // Clean up old saves (keep backups)
        saves.forEach(save => {
            if (save.key !== 'cyberWitchesSave' && !save.key.includes('_backup_')) {
                // Create backup before removing
                try {
                    const backupKey = `cyberWitchesSave_backup_${Date.now()}_${save.key}`;
                    localStorage.setItem(backupKey, localStorage.getItem(save.key));
                } catch (e) {
                    console.error('Failed to create backup:', e);
                }
                localStorage.removeItem(save.key);
            }
        });

        return true;
    }

    /**
     * Merge two save data objects
     * @param {Object} save1 - First save data
     * @param {Object} save2 - Second save data
     * @returns {Object|null} Merged save data or null if merge failed
     */
    mergeSaveData(save1, save2) {
        try {
            const merged = {
                // Use higher values for currency and stats
                ab: Math.max(save1.ab || 0, save2.ab || 0),
                abTotal: Math.max(save1.abTotal || 0, save2.abTotal || 0),

                // Merge inventories (take maximum)
                inventory: {},
                workstations: {},
                upgrades: {},

                // Merge prestige data
                prestige: {
                    points: Math.max(
                        (save1.prestige?.points || 0),
                        (save2.prestige?.points || 0)
                    ),
                    lifetimeEarned: Math.max(
                        (save1.prestige?.lifetimeEarned || 0),
                        (save2.prestige?.lifetimeEarned || 0)
                    ),
                    bonuses: { ...save1.prestige?.bonuses, ...save2.prestige?.bonuses },
                    count: Math.max(
                        (save1.prestige?.count || 0),
                        (save2.prestige?.count || 0)
                    )
                },

                // Merge experiments (union of discovered recipes)
                experiments: {
                    discovered: [...new Set([
                        ...(save1.experiments?.discovered || []),
                        ...(save2.experiments?.discovered || [])
                    ])]
                },

                // Merge stats (take maximum)
                stats: {
                    totalTaps: Math.max(
                        (save1.stats?.totalTaps || 0),
                        (save2.stats?.totalTaps || 0)
                    ),
                    totalWorkstationsCrafted: Math.max(
                        (save1.stats?.totalWorkstationsCrafted || 0),
                        (save2.stats?.totalWorkstationsCrafted || 0)
                    ),
                    totalPotionsCrafted: Math.max(
                        (save1.stats?.totalPotionsCrafted || 0),
                        (save2.stats?.totalPotionsCrafted || 0)
                    )
                },

                // Merge milestones (union)
                milestones: {
                    unlocked: [...new Set([
                        ...(save1.milestones?.unlocked || []),
                        ...(save2.milestones?.unlocked || [])
                    ])]
                }
            };

            // Merge inventories (take maximum)
            const allIngredients = new Set([
                ...Object.keys(save1.inventory || {}),
                ...Object.keys(save2.inventory || {})
            ]);
            allIngredients.forEach(ingId => {
                merged.inventory[ingId] = Math.max(
                    save1.inventory?.[ingId] || 0,
                    save2.inventory?.[ingId] || 0
                );
            });

            // Merge workstations (take maximum)
            const allWorkstations = new Set([
                ...Object.keys(save1.workstations || {}),
                ...Object.keys(save2.workstations || {})
            ]);
            allWorkstations.forEach(wsId => {
                merged.workstations[wsId] = Math.max(
                    save1.workstations?.[wsId] || 0,
                    save2.workstations?.[wsId] || 0
                );
            });

            // Merge upgrades (union)
            merged.upgrades = { ...save1.upgrades, ...save2.upgrades };

            return merged;
        } catch (error) {
            console.error('Failed to merge save data:', error);
            return null;
        }
    }
}

