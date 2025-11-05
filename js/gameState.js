import { PRODUCERS, UPGRADES, PRESTIGE_BONUSES, HIDDEN_RECIPES } from './data.js';
import { Balance } from './utils.js';

// Game State Manager
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
        
        // Buffs
        this.activeBuffs = [];
        
        // Experiments
        this.discoveredRecipes = [];
        
        // Stats
        this.totalTaps = 0;
        this.totalWorkstationsCrafted = 0;
        
        // Timestamps
        this.lastSaveTime = Date.now() / 1000;
        
        // Tick timer
        this.tickInterval = null;
        this.lastTickTime = Date.now();
        
        // Callbacks
        this.onAbChanged = null;
        this.onIngredientChanged = null;
        this.onWorkstationCrafted = null;
        this.onUpgradePurchased = null;
        this.onPrestigeCompleted = null;
        this.onRecipeDiscovered = null;
        this.onWelcomeBack = null;
    }
    
    start() {
        this.loadGameState();
        this.startTickLoop();
    }
    
    startTickLoop() {
        const tickRate = 100; // 10 ticks per second
        this.tickInterval = setInterval(() => {
            this.tick();
        }, tickRate);
    }
    
    tick(eventMultiplier = 1.0) {
        const now = Date.now();
        const delta = (now - this.lastTickTime) / 1000;
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
        
        // Auto-save every 30 seconds
        const nowSeconds = Date.now() / 1000;
        if (nowSeconds - this.lastSaveTime > 30.0) {
            this.saveGameState();
        }
    }
    
    calculateTotalProduction(delta, eventMultiplier = 1.0) {
        const totalOutput = {};
        
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
                
                // Apply event multiplier
                const finalMult = mult * eventMultiplier;
                
                const finalRate = baseRate * finalMult * owned;
                
                if (!totalOutput[outputId]) {
                    totalOutput[outputId] = 0.0;
                }
                totalOutput[outputId] += finalRate * delta;
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
        }
        
        return totalOutput;
    }
    
    getProductionMultiplier(workstationId) {
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
        
        // Active buffs
        for (const buff of this.activeBuffs) {
            if (buff.multiplier) {
                mult *= (1.0 + buff.multiplier);
            }
        }
        
        return mult;
    }
    
    getAbPerSecond(eventMultiplier = 1.0) {
        const production = this.calculateTotalProduction(1.0, eventMultiplier);
        return production.ab || 0.0;
    }
    
    updateBuffs(delta) {
        for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
            this.activeBuffs[i].remaining -= delta;
            if (this.activeBuffs[i].remaining <= 0) {
                this.activeBuffs.splice(i, 1);
            }
        }
    }
    
    addBuff(multiplier, duration) {
        this.activeBuffs.push({
            multiplier: multiplier,
            remaining: duration
        });
    }
    
    addAb(amount) {
        this.ab += amount;
        this.abTotalEarned += amount;
        this.prestigeLifetimeEarned += amount;
        if (this.onAbChanged) {
            this.onAbChanged(this.ab);
        }
    }
    
    spendAb(amount) {
        if (this.ab < amount) return false;
        this.ab -= amount;
        if (this.onAbChanged) this.onAbChanged(this.ab);
        return true;
    }
    
    addIngredient(ingId, amount) {
        if (!this.inventory[ingId]) {
            this.inventory[ingId] = 0.0;
        }
        this.inventory[ingId] += amount;
        if (this.onIngredientChanged) this.onIngredientChanged(ingId, this.inventory[ingId]);
    }
    
    spendIngredient(ingId, amount) {
        if ((this.inventory[ingId] || 0) < amount) return false;
        this.inventory[ingId] -= amount;
        if (this.onIngredientChanged) this.onIngredientChanged(ingId, this.inventory[ingId]);
        return true;
    }
    
    cast(comboMultiplier = 1.0, eventMultiplier = 1.0) {
        this.totalTaps++;
        
        // Base tier-0 ingredients
        const baseAmounts = {
            wax_bits: 1.0,
            wick_fiber: 1.0,
            crystal_dust: 0.5,
            aether_ess: 0.5
        };
        
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
        
        // Apply combo and event multipliers
        const totalMult = clickMult * comboMultiplier * eventMultiplier;
        
        // Grant ingredients (with additive bonus)
        for (const ingId in baseAmounts) {
            this.addIngredient(ingId, (baseAmounts[ingId] + clickAdditive) * totalMult);
        }
        
        // Also grant a small amount of AB per cast (for progression)
        // This allows players to eventually unlock AB-producing workstations
        const abPerCast = 0.1 * totalMult;
        this.addAb(abPerCast);
    }
    
    craftWorkstation(wsId, amount = 1) {
        const prodData = PRODUCERS.find(p => p.id === wsId);
        if (!prodData) return false;
        
        // Check unlock
        if (this.ab < prodData.unlockAtAb) return false;
        
        let successCount = 0;
        for (let i = 0; i < amount; i++) {
            const currentOwned = this.workstations[wsId] || 0;
            const recipe = Balance.scaledRecipe(prodData.recipe, currentOwned, prodData.growth);
            
            if (!this.canAfford(recipe)) break;
            
            this.consumeRecipe(recipe);
            this.workstations[wsId] = (this.workstations[wsId] || 0) + 1;
            successCount++;
            this.totalWorkstationsCrafted++;
        }
        
        if (successCount > 0) {
            if (this.onWorkstationCrafted) this.onWorkstationCrafted(wsId, this.workstations[wsId]);
            return true;
        }
        
        return false;
    }
    
    inscribeUpgrade(upgId) {
        if (this.upgradesOwned[upgId]) return false;
        
        const upgData = UPGRADES.find(u => u.id === upgId);
        if (!upgData) return false;
        
        // Check unlock
        if (this.ab < upgData.unlockAtAb) return false;
        
        // Check recipe
        if (!this.canAfford(upgData.recipe)) return false;
        
        this.consumeRecipe(upgData.recipe);
        this.upgradesOwned[upgId] = true;
        if (this.onUpgradePurchased) this.onUpgradePurchased(upgId);
        return true;
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
        return Math.max(0, currentEk - this.prestigePoints);
    }
    
    ascend() {
        const ekGain = this.calculatePrestigeGain();
        if (ekGain <= 0) return;
        
        this.prestigePoints += ekGain;
        
        // Reset run
        this.ab = 0.0;
        this.abTotalEarned = 0.0;
        this.inventory = {};
        this.workstations = {};
        this.upgradesOwned = {};
        this.activeBuffs = [];
        this.totalTaps = 0;
        this.totalWorkstationsCrafted = 0;
        
        // Apply prestige start bonuses
        this.applyPrestigeStartBonuses();
        
        if (this.onPrestigeCompleted) this.onPrestigeCompleted(ekGain);
        this.saveGameState();
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
        
        return true;
    }
    
    tryExperiment() {
        for (const recipe of HIDDEN_RECIPES) {
            if (this.discoveredRecipes.includes(recipe.id)) continue;
            
            // Check if player has ingredients
            let hasAll = true;
            for (const ingId in recipe.inputs) {
                if ((this.inventory[ingId] || 0) < recipe.inputs[ingId]) {
                    hasAll = false;
                    break;
                }
            }
            
            if (hasAll) {
                this.discoveredRecipes.push(recipe.id);
                if (this.onRecipeDiscovered) this.onRecipeDiscovered(recipe.id);
                return {
                    success: true,
                    recipe: recipe
                };
            }
        }
        
        return {
            success: false,
            message: "No new recipes discovered. Try gathering more materials!"
        };
    }
    
    craftDiscoveredRecipe(recipeId) {
        if (!this.discoveredRecipes.includes(recipeId)) return false;
        
        const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return false;
        
        if (!this.canAfford(recipe.inputs)) return false;
        
        this.consumeRecipe(recipe.inputs);
        
        for (const outputId in recipe.outputs) {
            if (outputId === "ab") {
                this.addAb(recipe.outputs[outputId]);
            } else {
                this.addIngredient(outputId, recipe.outputs[outputId]);
            }
        }
        
        return true;
    }
    
    saveGameState() {
        const saveData = {
            ab: this.ab,
            abTotal: this.abTotalEarned,
            inventory: { ...this.inventory },
            workstations: { ...this.workstations },
            upgrades: { ...this.upgradesOwned },
            prestige: {
                points: this.prestigePoints,
                lifetimeEarned: this.prestigeLifetimeEarned,
                bonuses: { ...this.prestigeBonuses }
            },
            experiments: {
                discovered: [...this.discoveredRecipes]
            },
            stats: {
                totalTaps: this.totalTaps,
                totalWorkstationsCrafted: this.totalWorkstationsCrafted
            },
            timestamp: Date.now() / 1000
        };
        
        localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData));
        this.lastSaveTime = Date.now() / 1000;
    }
    
    loadGameState() {
        const saveDataStr = localStorage.getItem('cyberWitchesSave');
        if (!saveDataStr) return;
        
        const data = JSON.parse(saveDataStr);
        
        // Calculate offline progress BEFORE loading state
        const elapsed = (Date.now() / 1000) - (data.timestamp || Date.now() / 1000);
        
        // Load state
        this.ab = data.ab || 0.0;
        this.abTotalEarned = data.abTotal || 0.0;
        this.inventory = data.inventory || {};
        this.workstations = data.workstations || {};
        this.upgradesOwned = data.upgrades || {};
        
        const prestigeData = data.prestige || {};
        this.prestigePoints = prestigeData.points || 0;
        this.prestigeLifetimeEarned = prestigeData.lifetimeEarned || 0.0;
        this.prestigeBonuses = prestigeData.bonuses || {};
        
        const experimentsData = data.experiments || {};
        this.discoveredRecipes = experimentsData.discovered || [];
        
        const stats = data.stats || {};
        this.totalTaps = stats.totalTaps || 0;
        this.totalWorkstationsCrafted = stats.totalWorkstationsCrafted || 0;
        
        // Apply offline progress
        if (elapsed > 0) {
            this.applyOfflineProgress(elapsed);
        }
        
        this.lastSaveTime = Date.now() / 1000;
    }
    
    applyOfflineProgress(elapsedSeconds) {
        const abps = this.getAbPerSecond();
        const offlineAb = Balance.calculateOfflineProduction(elapsedSeconds, abps);
        
        if (offlineAb > 0) {
            this.addAb(offlineAb);
            if (this.onWelcomeBack) this.onWelcomeBack(elapsedSeconds, offlineAb);
        }
    }
}

