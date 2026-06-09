import { showLoadingState, hideLoadingState } from './loadingState.js';
import { INGREDIENTS, PRODUCERS, UPGRADES, PRESTIGE_BONUSES } from './data.js';
import { Balance, formatShort as formatShortUtil } from './utils.js';
import { handleError } from './errorHandler.js';
import { GAME_CONSTANTS } from './codeOrganization.js';
import { ELEMENT_SPECIALIZATIONS, getIngredientElement, getWorkstationElement, isUniversalIngredient, isABProducer } from './elementSpecialization.js';
import { debounce } from './commonUtils.js';
import { encode, decode, validateSaveData } from './save/saveCodec.js';
import { mirrorToIndexedDB } from './save/indexedDBBackup.js';
import { pulseElement } from './animations.js';
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
        this.pendingUpdates = [];
        this.batchTimeout = null;
        this.batchDelay = GAME_CONSTANTS.UI_UPDATE_DELAY; // ~60fps

        // Debounced save - wait 3 seconds after last change before saving
        // This prevents blocking the main thread during rapid game state changes
        this.debouncedSave = debounce(() => {
            // Use requestIdleCallback for non-blocking save
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(() => {
                    this.saveGameStateImmediate();
                    this.hasPendingSave = false; // Clear only after save completes
                }, { timeout: 2000 }); // Fallback to timeout after 2s
            } else {
                // Fallback for browsers without requestIdleCallback
                setTimeout(() => {
                    this.saveGameStateImmediate();
                    this.hasPendingSave = false; // Clear only after save completes
                }, 0);
            }
        }, 3000); // Wait 3 seconds of inactivity

        // Pending save flag — set immediately when a debounced save is
        // triggered, cleared inside the debounced callback after the actual
        // save completes. This eliminates the race where the flag was set
        // but the debounced save hadn't fired yet.
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

        // Ensure the save-on-hide/close handlers are active for the legacy loop
        // path too (they're idempotent).
        this.registerLifecycleHandlers();
    }

    /**
     * Register save-flush handlers for when the page is hidden or going away.
     * CRITICAL and loop-independent: the game normally runs on UnifiedGameLoop
     * (startTickLoop is skipped), and when the tab is hidden we may never get
     * another tick — and on mobile the page can be killed without `beforeunload`
     * ever firing. Flushing the pending debounced save here is what prevents
     * progress accrued since the last 30s autosave from being silently lost on
     * background/close (the most common "my progress reset" report).
     *
     * Idempotent: safe to call from both startTickLoop() and initGame().
     */
    registerLifecycleHandlers() {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;

        // FORCE the save on exit. `hasPendingSave` is only set by the 30s
        // autosave branch, so a non-forced flush would skip progress made AFTER
        // the last save but BEFORE that interval elapses (e.g. closing a mobile
        // tab 10s after crafting) — exactly the close-before-autosave case this
        // is meant to cover. Forcing always persists the current state on exit.
        if (!this.visibilityHandler) {
            this.visibilityHandler = () => {
                if (document.hidden) {
                    this.flushPendingSave(true);
                }
            };
            document.addEventListener('visibilitychange', this.visibilityHandler);
        }

        // `pagehide` is the reliable "page is going away" signal on iOS/Safari
        // where `beforeunload` does not fire.
        if (!this.pageHideHandler) {
            this.pageHideHandler = () => {
                this.flushPendingSave(true);
            };
            window.addEventListener('pagehide', this.pageHideHandler);
        }
    }

    /**
     * Persist immediately if a save is pending (or always, when forced).
     * Safe to call repeatedly; clears the pending flag. Exit paths
     * (visibilitychange-hidden / pagehide) pass force=true so progress is never
     * lost just because the periodic autosave hasn't marked a pending save yet.
     * @param {boolean} force - Save even if no pending change is flagged.
     */
    flushPendingSave(force = false) {
        if (this.hasPendingSave || force) {
            this.saveGameStateImmediate();
            this.hasPendingSave = false;
        }
    }

    /**
     * Stop the game tick loop
     */
    stopTickLoop() {
        // Flush any pending saves before stopping
        this.flushPendingSave();

        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }

        // Remove visibility handler
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }

        // Remove pagehide handler
        if (this.pageHideHandler) {
            window.removeEventListener('pagehide', this.pageHideHandler);
            this.pageHideHandler = null;
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
            if (outputId === 'ab') {
                this.addAb(production[outputId]);
            } else {
                this.addIngredient(outputId, production[outputId]);
            }
        }

        // Auto-save every 30 seconds using debounced version
        const nowSeconds = Date.now() / 1000;
        if (nowSeconds - this.lastSaveTime > GAME_CONSTANTS.AUTO_SAVE_INTERVAL / 1000) {
            this.hasPendingSave = true; // Mark pending before debounced save fires
            this.saveGameState(); // Uses debounced version — clears flag on completion
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

        // Apply Air specialization speed bonus to delta.
        // INTENTIONAL DESIGN: Air's productionSpeedMult scales the time delta
        // rather than the tick rate. This makes each tick simulate more elapsed
        // time, which is equivalent to running the game faster without changing
        // the actual tick cadence. All downstream per-second rates remain correct.
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
                let mult = this.getProductionMultiplier(wsId);

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

                // Guard against NaN/Infinity from corrupted data
                if (!isFinite(mult) || isNaN(mult)) {
                    mult = 1.0;
                }
                if (!isFinite(specializationMult) || isNaN(specializationMult)) {
                    specializationMult = 1.0;
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
                if (upgData && upgData.affects === 'ab_production') {
                    if (upgData.type === 'multiplier') {
                        totalOutput.ab *= upgData.value;
                    }
                }
            }

            // Apply prestige AB production multiplier
            for (const bonusId in this.prestigeBonuses) {
                const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
                if (bonusData && bonusData.type === 'ab_production_mult') {
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
            if (upgData && upgData.affects === 'global' && upgData.type === 'multiplier') {
                mult *= upgData.value;
            }
        }

        // Producer-specific upgrades
        const targetAffects = 'producer:' + workstationId;
        for (const upgId in this.upgradesOwned) {
            const upgData = UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === targetAffects && upgData.type === 'multiplier') {
                mult *= upgData.value;
            }
        }

        // Prestige bonuses (global)
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === 'global_mult') {
                const levels = this.prestigeBonuses[bonusId];
                mult *= (1.0 + bonusData.value * levels);
            }
        }

        // Prestige bonuses (producer-specific)
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === 'producer_mult' && bonusData.param === workstationId) {
                const levels = this.prestigeBonuses[bonusId];
                mult *= (1.0 + bonusData.value * levels);
            }
        }

        // Active production buffs
        mult *= this.getBuff('production');

        // Active ingredient production buffs
        mult *= this.getBuff('ingredient_production');

        // Meditation production bonus (only available through meditation)
        // NOT cached — meditation state can change independently of cache invalidation
        if (window.meditationState && typeof window.meditationState.getMeditationProductionBonus === 'function') {
            const meditationBonus = window.meditationState.getMeditationProductionBonus();
            if (isFinite(meditationBonus) && !isNaN(meditationBonus)) {
                mult *= meditationBonus;
            }
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
        return Math.max(0.01, 1.0 + totalValue); // Return as multiplier (1.0 + 0.5 = 1.5x), clamped to minimum 0.01
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

        const effect = this.getPotionEffect(potionId);
        if (!effect) {
            console.warn('⚠️ Unknown potion consumed:', potionId);
            return false;
        }

        this.spendIngredient(potionId, 1);
        this.addBuff(effect.type, effect.value, effect.duration);
        return true;
    }

    /**
     * Add AB to the player's balance with DOM update batching
     * @param {number} amount - Amount of AB to add
     */
    addAb(amount) {
        // Validation: prevent NaN corruption and negative amounts
        if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) {
            console.warn('⚠️ Attempted to add invalid AB amount:', amount);
            return;
        }
        if (amount < 0) {
            console.warn('⚠️ Attempted to add negative AB:', amount);
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
        return formatShortUtil(num);
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
        if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) {
            console.warn('⚠️ Attempted to add invalid ingredient amount:', ingId, amount);
            return;
        }
        if (amount < 0) {
            console.warn('⚠️ Attempted to add negative ingredient:', ingId, amount);
            return;
        }
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
        const baseAmounts = {
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
            if (upgData && upgData.affects === 'click') {
                if (upgData.type === 'multiplier') {
                    clickMult *= upgData.value;
                } else if (upgData.type === 'additive') {
                    clickAdditive += upgData.value;
                }
            }
        }

        // Apply prestige click multiplier
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === 'click_mult') {
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
        const EPSILON = 1e-9;
        for (const ingId in recipe) {
            const needed = recipe[ingId];
            const have = this.inventory[ingId] || 0.0;
            if (have < needed - EPSILON) return false;
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
        // NOTE: discoveredRecipes intentionally persists across ascension.
        // Recipes represent player knowledge — standard idle game design keeps
        // knowledge/unlocks through prestige resets. Same for storyFlags.

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
            if (bonusData && bonusData.type === 'starting_currency') {
                const levels = this.prestigeBonuses[bonusId];
                this.addAb(bonusData.value * levels);
            }
        }

        // Starting ingredients
        for (const bonusId in this.prestigeBonuses) {
            const bonusData = PRESTIGE_BONUSES.find(b => b.id === bonusId);
            if (bonusData && bonusData.type === 'start_ingredient') {
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
        const roundedCost = Math.ceil(cost);

        if (this.prestigePoints < roundedCost) return false;

        this.prestigePoints -= roundedCost;
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
                // Story Flags
                storyFlags: { ...this.storyFlags },
                // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
                coven: null, // this.covenSystem ? this.covenSystem.saveCovenData() : null,
                timestamp: Date.now() / 1000,
                version: '2.1' // Updated version for save data validation
            };

            // Validate save data before saving
            if (!validateSaveData(saveData)) {
                console.error('Save data validation failed!', saveData);
                handleError(new Error('Save data validation failed'), 'save', true);
                return;
            }

            // Compress + checksum + stringify via the save codec.
            const compressedData = encode(saveData);
            // Pre-check: estimate if save will fit (typical localStorage limit ~5MB)
            const saveSizeKB = compressedData.length / 1024;
            if (saveSizeKB > 4500) { // Leave 500KB headroom
                console.error(`Save data too large (${saveSizeKB.toFixed(1)} KB). Attempting cleanup...`);
                // Try to clean up backup saves to free space
                this.cleanupOldBackups();
            }
            localStorage.setItem('cyberWitchesSave', compressedData);
            // Mirror to IndexedDB (durable, eviction-resistant) without blocking
            // the save. localStorage remains the source of truth; this is the
            // backup that survives a localStorage eviction.
            mirrorToIndexedDB('cyberWitchesSave', compressedData);
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
        // Declared outside try so the finally block can always hide this loader.
        let loadingId = null;
        try {
            // Show loading state if available
            if (showLoadingState) {
                loadingId = showLoadingState('Loading game...');
            }

            const saveDataStr = localStorage.getItem('cyberWitchesSave');
            if (!saveDataStr) {
                // No save (first-time player). The finally block hides the loader.
                return;
            }

            // Decode runs the integrity pipeline (parse -> checksum -> migrate ->
            // validate). We decide what to do with each outcome here: back up the
            // raw bytes, tell the player, or apply the snapshot.
            const result = decode(saveDataStr);

            if (result.outcome === 'parse_error') {
                console.error('Failed to parse save data:', result.error);
                handleError(result.error, 'load', true);
                this.backupRawSave('cyberWitchesSave_backup_', saveDataStr);
                return;
            }

            // Parse succeeded — check for conflicting saves (multiple keys).
            this.checkSaveConflicts();

            if (result.outcome === 'checksum_recalculated') {
                console.warn('Save data checksum verification failed - recalculating checksum');
                this.backupRawSave('cyberWitchesSave_checksum_fix_', saveDataStr);
            }

            if (result.outcome === 'migration_failed') {
                console.warn('Save data migration failed, starting fresh');
                // Preserve the un-migratable save so it is never silently lost.
                this.backupRawSave('cyberWitchesSave_migration_failed_', saveDataStr);
                // Tell the player rather than silently resetting their progress.
                handleError(
                    new Error('Your save could not be upgraded to this version and was reset. A backup was kept in this browser.'),
                    'load:migration', true
                );
                return;
            }

            if (result.outcome === 'invalid') {
                console.warn('Invalid save data detected, starting fresh');
                this.backupRawSave('cyberWitchesSave_backup_', saveDataStr);
                // Surface the reset to the player instead of failing silently.
                handleError(
                    new Error('Your save was corrupted and could not be loaded, so the game was reset. A backup was kept in this browser.'),
                    'load:validation', true
                );
                return;
            }

            const data = result.snapshot;

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
                console.info('Prestige count missing from save, inferred from prestige points/bonuses. Setting to 1.');
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

            // Load story flags
            if (data.storyFlags && typeof data.storyFlags === 'object') {
                this.storyFlags = { ...this.storyFlags, ...data.storyFlags };
            }

            // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
            // Load coven data
            // if (this.covenSystem && data.coven) this.covenSystem.loadCovenData(data.coven);

            // Apply offline progress
            if (elapsed > 0) {
                this.applyOfflineProgress(elapsed);
            }

            this.lastSaveTime = Date.now() / 1000;

        } catch (error) {
            handleError(error, 'load', true);
        } finally {
            // Always clear the loading overlay, no matter which path we exited on.
            // Several early returns (no save, parse/migration/validation failure)
            // previously bypassed the hide and left a full-screen, click-blocking
            // "Loading game..." overlay stuck over the game.
            if (hideLoadingState) {
                hideLoadingState(loadingId);
            }
        }
    }

    /**
     * Apply offline progress with validation
     * @param {number} elapsedSeconds - Time elapsed in seconds
     */
    applyOfflineProgress(elapsedSeconds) {
        // Cap offline progress at 12 hours for balance
        const wasCapped = elapsedSeconds > Balance.offlineCapSeconds;
        const cappedSeconds = Math.min(elapsedSeconds, Balance.offlineCapSeconds);

        const production = this.calculateTotalProduction(cappedSeconds);

        // Apply offline AB
        const offlineAb = production.ab || 0;
        if (offlineAb > 0) {
            this.addAb(offlineAb);
        }

        // Apply offline ingredients
        for (const outputId in production) {
            if (outputId !== 'ab' && production[outputId] > 0) {
                this.addIngredient(outputId, production[outputId]);
            }
        }

        if (offlineAb > 0) {
            this.batchUpdate('welcomeBack', elapsedSeconds, offlineAb);
        }

        // Inform player if offline progress was capped
        if (wasCapped && window.showNotification) {
            const capHours = Balance.offlineCapSeconds / 3600;
            const actualHours = (elapsedSeconds / 3600).toFixed(1);
            window.showNotification(
                `Welcome back! You were away ${actualHours}h — offline progress capped at ${capHours}h for balance.`,
                'info'
            );
        }

        // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        // Update coven progress for offline production
        // if (this.covenSystem) this.covenSystem.updateCovenProgress('production', offlineAb, 'ab');
    }

    /**
     * Batch DOM updates to reduce frequent manipulations
     * @param {string} updateType - Type of update
     * @param {...any} args - Arguments for the update callback
     */
    batchUpdate(updateType, ...args) {
        // Add to pending updates
        this.pendingUpdates.push({ type: updateType, args });

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
        this.pendingUpdates.length = 0;
        this.batchTimeout = null;
    }

    /**
     * Write a timestamped backup of raw save bytes. Best-effort: a storage
     * failure (quota, private mode) is logged, never thrown, so recovery never
     * makes a bad situation worse.
     * @param {string} prefix - localStorage key prefix
     * @param {string} raw - the raw save string to preserve
     */
    backupRawSave(prefix, raw) {
        try {
            localStorage.setItem(prefix + Date.now(), raw);
        } catch (e) {
            console.error('Failed to create backup:', e);
        }
    }

    /**
     * Clean up old backup saves to free localStorage space
     */
    cleanupOldBackups() {
        try {
            const backupKeys = Object.keys(localStorage)
                .filter(key => key.startsWith('cyberWitchesSave_'))
                .sort()
                .reverse(); // Newest first

            // Keep only the 3 most recent backups
            const toRemove = backupKeys.slice(3);
            for (const key of toRemove) {
                localStorage.removeItem(key);
            }
            if (toRemove.length > 0) {
                console.info(`Cleaned up ${toRemove.length} old backup(s) to free space`);
            }
        } catch (e) {
            console.error('Failed to cleanup backups:', e);
        }
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
            if (Object.hasOwn(this.inventory, depIng)) {
                const amount = this.inventory[depIng];
                delete this.inventory[depIng];
                removedCount++;
                console.info(`Removed deprecated ingredient: ${depIng} (had ${amount})`);
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
                const amount = this.inventory[ingId];
                itemsToRemove.push(ingId);
                console.info(`Removed invalid ingredient: ${ingId} (had ${amount})`);
            }
        }

        // Remove all items in one pass
        for (const ingId of itemsToRemove) {
            delete this.inventory[ingId];
            removedCount++;
        }

        if (removedCount > 0) {
            console.info(`Cleaned up ${removedCount} deprecated/invalid ingredients from inventory`);
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
                console.info('Successfully merged save data.');
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
                // For current AB, prefer the more recent save (already sorted by time)
                // For lifetime totals, take max since those only increase
                ab: save1.ab || 0,
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

            // Only include upgrades from the primary (newer) save
            merged.upgrades = { ...(save1.upgrades || {}) };

            return merged;
        } catch (error) {
            console.error('Failed to merge save data:', error);
            return null;
        }
    }
}
