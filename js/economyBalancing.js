/**
 * Resource Economy Balancing
 * Provides tools for analyzing and balancing the resource economy
 */

class EconomyBalancing {
    constructor(gameState) {
        this.gameState = gameState;
        this.economyData = [];
        this.init();
    }
    
    init() {
        // Start collecting economy data
        this.startDataCollection();
    }
    
    /**
     * Start collecting economy data
     */
    startDataCollection() {
        // Collect data every 30 seconds
        setInterval(() => {
            this.collectEconomyData();
        }, 30000);
        
        // Initial data point
        this.collectEconomyData();
    }
    
    /**
     * Collect economy data
     */
    collectEconomyData() {
        if (!this.gameState) return;
        
        const dataPoint = {
            timestamp: Date.now(),
            ab: this.gameState.ab,
            abps: this.gameState.getAbPerSecond(),
            inventory: { ...this.gameState.inventory },
            workstations: { ...this.gameState.workstations },
            productionRates: this.calculateProductionRates(),
            consumptionRates: this.calculateConsumptionRates()
        };
        
        this.economyData.push(dataPoint);
        
        // Keep only last 100 data points
        if (this.economyData.length > 100) {
            this.economyData.shift();
        }
    }
    
    /**
     * Calculate production rates
     * @returns {Object} Production rates by ingredient
     */
    calculateProductionRates() {
        const rates = {};
        
        window.PRODUCERS?.forEach(prod => {
            const owned = this.gameState.workstations[prod.id] || 0;
            if (owned > 0 && prod.production) {
                const mult = this.gameState.getProductionMultiplier(prod.id);
                Object.keys(prod.production).forEach(ingId => {
                    if (!rates[ingId]) rates[ingId] = 0;
                    rates[ingId] += (prod.production[ingId] || 0) * owned * mult;
                });
            }
        });
        
        return rates;
    }
    
    /**
     * Calculate consumption rates
     * @returns {Object} Consumption rates by ingredient
     */
    calculateConsumptionRates() {
        const rates = {};
        
        // Calculate consumption from active workstations being crafted
        // This is a simplified calculation
        window.PRODUCERS?.forEach(prod => {
            if (prod.recipe) {
                Object.keys(prod.recipe).forEach(ingId => {
                    if (!rates[ingId]) rates[ingId] = 0;
                    // Estimate consumption based on crafting frequency
                    rates[ingId] += (prod.recipe[ingId] || 0) * 0.1; // Rough estimate
                });
            }
        });
        
        return rates;
    }
    
    /**
     * Analyze economy balance
     * @returns {Object} Economy analysis
     */
    analyzeEconomy() {
        if (this.economyData.length < 2) {
            return { error: 'Not enough data' };
        }
        
        const analysis = {
            productionVsConsumption: this.compareProductionConsumption(),
            ingredientSurplus: this.calculateIngredientSurplus(),
            bottlenecks: this.identifyEconomyBottlenecks(),
            recommendations: this.generateRecommendations()
        };
        
        return analysis;
    }
    
    /**
     * Compare production vs consumption
     * @returns {Object} Comparison data
     */
    compareProductionConsumption() {
        const latest = this.economyData[this.economyData.length - 1];
        const production = latest.productionRates || {};
        const consumption = latest.consumptionRates || {};
        
        const comparison = {};
        const allIngredients = new Set([
            ...Object.keys(production),
            ...Object.keys(consumption)
        ]);
        
        allIngredients.forEach(ingId => {
            const prod = production[ingId] || 0;
            const cons = consumption[ingId] || 0;
            comparison[ingId] = {
                production: prod,
                consumption: cons,
                net: prod - cons,
                ratio: cons > 0 ? prod / cons : Infinity
            };
        });
        
        return comparison;
    }
    
    /**
     * Calculate ingredient surplus
     * @returns {Object} Surplus by ingredient
     */
    calculateIngredientSurplus() {
        const latest = this.economyData[this.economyData.length - 1];
        const inventory = latest.inventory || {};
        const production = latest.productionRates || {};
        
        const surplus = {};
        Object.keys(inventory).forEach(ingId => {
            const amount = inventory[ingId] || 0;
            const prod = production[ingId] || 0;
            surplus[ingId] = {
                current: amount,
                productionRate: prod,
                timeToDeplete: prod > 0 ? amount / prod : Infinity
            };
        });
        
        return surplus;
    }
    
    /**
     * Identify economy bottlenecks
     * @returns {Array} List of bottlenecks
     */
    identifyEconomyBottlenecks() {
        const bottlenecks = [];
        const comparison = this.compareProductionConsumption();
        
        Object.keys(comparison).forEach(ingId => {
            const data = comparison[ingId];
            if (data.ratio < 1.0 && data.consumption > 0) {
                bottlenecks.push({
                    ingredient: ingId,
                    type: 'consumption_exceeds_production',
                    severity: data.ratio < 0.5 ? 'high' : 'medium',
                    message: `${ingId} is being consumed faster than produced (ratio: ${data.ratio.toFixed(2)})`
                });
            }
        });
        
        return bottlenecks;
    }
    
    /**
     * Generate balancing recommendations
     * @returns {Array} Recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        const comparison = this.compareProductionConsumption();
        const bottlenecks = this.identifyEconomyBottlenecks();
        
        bottlenecks.forEach(bottleneck => {
            const ingId = bottleneck.ingredient;
            const prod = window.PRODUCERS?.find(p => 
                p.production && p.production[ingId]
            );
            
            if (prod) {
                recommendations.push({
                    type: 'increase_production',
                    ingredient: ingId,
                    action: `Build more ${prod.displayName} to increase ${ingId} production`,
                    priority: bottleneck.severity === 'high' ? 'high' : 'medium'
                });
            }
        });
        
        return recommendations;
    }
    
    /**
     * Get economy report
     * @returns {Object} Economy report
     */
    getReport() {
        return {
            dataPoints: this.economyData.length,
            analysis: this.analyzeEconomy(),
            currentState: {
                ab: this.gameState.ab,
                abps: this.gameState.getAbPerSecond(),
                inventory: { ...this.gameState.inventory },
                productionRates: this.calculateProductionRates()
            }
        };
    }
    
    /**
     * Export economy data
     * @returns {string} JSON string
     */
    exportData() {
        return JSON.stringify({
            economyData: this.economyData,
            analysis: this.analyzeEconomy()
        }, null, 2);
    }
}

// Create global instance
let economyBalancing = null;

// Global functions
window.getEconomyReport = () => {
    if (economyBalancing) {
        return economyBalancing.getReport();
    }
    return null;
};

export default EconomyBalancing;

