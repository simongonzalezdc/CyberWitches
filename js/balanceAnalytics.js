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
        // Set up periodic metric collection
        setInterval(() => {
            this.collectMetrics();
        }, 60000); // Collect every minute
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
                const scaling = nextCost / (prod.recipe.ab || 1);
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
     * @returns {number} Next cost
     */
    calculateNextCost(producer, owned) {
        if (!producer.recipe || !producer.growth) {
            return 0;
        }
        
        const baseCost = producer.recipe.ab || 0;
        return Math.ceil(baseCost * Math.pow(producer.growth, owned));
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

