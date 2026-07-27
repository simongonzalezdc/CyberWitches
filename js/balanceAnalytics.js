/**
 * Balance Analytics System
 * Tracks game balance metrics for analysis
 */

class BalanceAnalyticsManager {
    constructor() {
        this.metrics = {
            resourceGeneration: {},
            progressionSpeed: {},
            costScaling: {}
        };
        this.init();
    }
    
    init() {
        // Debug-only: never own an uncleared interval on the default player path
        const debug = (() => {
            try {
                return typeof window !== 'undefined' && (
                    new URLSearchParams(window.location.search).has('debugAnalytics')
                    || localStorage.getItem('cyberWitchesDebugAnalytics') === 'true'
                );
            } catch { return false; }
        })();
        if (!debug) return;
        this._intervalId = setInterval(() => {
            this.collectMetrics();
        }, 60000);
    }

    dispose() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    }
    
    /**
     * Collect balance metrics
     */
    collectMetrics() {
        if (!window.gameState) {
            return;
        }
        
        // Track resource generation rates
        this.trackResourceGeneration();
        
        // Track progression speed
        this.trackProgressionSpeed();
        
        // Track cost scaling
        this.trackCostScaling();
    }
    
    /**
     * Track resource generation rates
     */
    trackResourceGeneration() {
        if (!window.gameState) {
            return;
        }
        
        const timestamp = Date.now();
        
        // Calculate AB generation rate
        const abps = this.calculateABPS();
        if (!this.metrics.resourceGeneration[timestamp]) {
            this.metrics.resourceGeneration[timestamp] = {};
        }
        this.metrics.resourceGeneration[timestamp].abps = abps;
        
        // Calculate element generation rates
        const elements = ['fire', 'water', 'air', 'crystal', 'aether', 'focus'];
        elements.forEach(element => {
            const rate = this.calculateElementPS(element);
            if (rate > 0) {
                this.metrics.resourceGeneration[timestamp][element] = rate;
            }
        });
    }
    
    /**
     * Track progression speed
     */
    trackProgressionSpeed() {
        if (!window.gameState) {
            return;
        }
        
        const timestamp = Date.now();
        
        if (!this.metrics.progressionSpeed[timestamp]) {
            this.metrics.progressionSpeed[timestamp] = {};
        }
        
        this.metrics.progressionSpeed[timestamp] = {
            ab: window.gameState.ab || 0,
            prestigeCount: window.gameState.prestigeCount || 0,
            totalWorkstations: Object.values(window.gameState.workstations || {}).reduce((sum, count) => sum + count, 0),
            totalUpgrades: Object.keys(window.gameState.upgradesOwned || {}).length
        };
    }
    
    /**
     * Track cost scaling
     */
    trackCostScaling() {
        if (!window.gameState || !window.PRODUCERS) {
            return;
        }
        
        const timestamp = Date.now();
        
        if (!this.metrics.costScaling[timestamp]) {
            this.metrics.costScaling[timestamp] = {};
        }
        
        // Calculate average cost scaling for workstations
        const scalingData = [];
        window.PRODUCERS.forEach(prod => {
            const owned = window.gameState.workstations[prod.id] || 0;
            if (owned > 0) {
                // Calculate next cost
                const nextCost = this.calculateNextCost(prod, owned);
                
                // Calculate base cost (sum of base recipe ingredients)
                let baseCost = 0;
                if (prod.recipe) {
                    for (const ingId in prod.recipe) {
                        baseCost += prod.recipe[ingId];
                    }
                }
                
                // Calculate scaling ratio (next cost / base cost)
                const scaling = baseCost > 0 ? nextCost / baseCost : 0;
                scalingData.push({ id: prod.id, scaling });
            }
        });
        
        if (scalingData.length > 0) {
            const avgScaling = scalingData.reduce((sum, d) => sum + d.scaling, 0) / scalingData.length;
            this.metrics.costScaling[timestamp].averageScaling = avgScaling;
        }
    }
    
    /**
     * Calculate AB per second
     * @returns {number} AB per second
     */
    calculateABPS() {
        if (!window.gameState || !window.PRODUCERS) {
            return 0;
        }
        
        let totalABPS = 0;
        window.PRODUCERS.forEach(prod => {
            const owned = window.gameState.workstations[prod.id] || 0;
            if (owned > 0 && prod.production) {
                const production = prod.production.ab || 0;
                totalABPS += production * owned;
            }
        });
        
        return totalABPS;
    }
    
    /**
     * Calculate element per second
     * @param {string} element - Element name
     * @returns {number} Element per second
     */
    calculateElementPS(element) {
        if (!window.gameState || !window.PRODUCERS) {
            return 0;
        }
        
        let totalPS = 0;
        window.PRODUCERS.forEach(prod => {
            const owned = window.gameState.workstations[prod.id] || 0;
            if (owned > 0 && prod.production) {
                const production = prod.production[element] || 0;
                totalPS += production * owned;
            }
        });
        
        return totalPS;
    }
    
    /**
     * Calculate next cost
     * @param {Object} producer - Producer object
     * @param {number} owned - Currently owned count
     * @returns {number} Next cost (sum of all ingredient amounts in scaled recipe)
     */
    calculateNextCost(producer, owned) {
        if (!producer.recipe || !producer.growth) {
            return 0;
        }
        
        // Calculate scaled recipe using the same logic as gameState
        const scaledRecipe = {};
        for (const ingId in producer.recipe) {
            const baseCost = producer.recipe[ingId];
            scaledRecipe[ingId] = Math.ceil(baseCost * Math.pow(producer.growth, owned));
        }
        
        // Sum all ingredient costs to get total recipe cost
        let totalCost = 0;
        for (const ingId in scaledRecipe) {
            totalCost += scaledRecipe[ingId];
        }
        
        return totalCost;
    }
    
    /**
     * Get balance metrics
     * @returns {Object} Balance metrics
     */
    getMetrics() {
        return this.metrics;
    }
}

// Create global instance
const balanceAnalyticsManager = new BalanceAnalyticsManager();

// Global functions for compatibility
window.getBalanceMetrics = () => {
    return balanceAnalyticsManager.getMetrics();
};

export default balanceAnalyticsManager;

