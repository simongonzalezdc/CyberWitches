/**
 * Progression Curve Analysis
 * Analyzes and reports on game progression curves
 */

class ProgressionAnalysis {
    constructor(gameState) {
        this.gameState = gameState;
        this.progressionData = [];
        this.init();
    }
    
    init() {
        // Start collecting progression data
        this.startDataCollection();
    }
    
    /**
     * Start collecting progression data
     */
    startDataCollection() {
        // Collect data every minute
        setInterval(() => {
            this.collectDataPoint();
        }, 60000);
        
        // Initial data point
        this.collectDataPoint();
    }
    
    /**
     * Collect data point
     */
    collectDataPoint() {
        if (!this.gameState) return;
        
        const dataPoint = {
            timestamp: Date.now(),
            ab: this.gameState.ab,
            abTotal: this.gameState.abTotalEarned,
            abps: this.gameState.getAbPerSecond(),
            workstations: Object.values(this.gameState.workstations).reduce((sum, count) => sum + count, 0),
            upgrades: Object.keys(this.gameState.upgradesOwned).length,
            prestigeCount: this.gameState.prestigeCount,
            totalTaps: this.gameState.totalTaps
        };
        
        this.progressionData.push(dataPoint);
        
        // Keep only last 1000 data points
        if (this.progressionData.length > 1000) {
            this.progressionData.shift();
        }
    }
    
    /**
     * Analyze progression curve
     * @returns {Object} Analysis results
     */
    analyzeProgression() {
        if (this.progressionData.length < 2) {
            return { error: 'Not enough data' };
        }
        
        const analysis = {
            abGrowthRate: this.calculateGrowthRate('ab'),
            abpsGrowthRate: this.calculateGrowthRate('abps'),
            workstationGrowthRate: this.calculateGrowthRate('workstations'),
            upgradeGrowthRate: this.calculateGrowthRate('upgrades'),
            progressionSpeed: this.calculateProgressionSpeed(),
            bottlenecks: this.identifyBottlenecks()
        };
        
        return analysis;
    }
    
    /**
     * Calculate growth rate for a metric
     * @param {string} metric - Metric name
     * @returns {number} Growth rate
     */
    calculateGrowthRate(metric) {
        if (this.progressionData.length < 2) return 0;
        
        const first = this.progressionData[0][metric];
        const last = this.progressionData[this.progressionData.length - 1][metric];
        
        if (first === 0) return 0;
        
        const timeDiff = (this.progressionData[this.progressionData.length - 1].timestamp - 
                          this.progressionData[0].timestamp) / 1000 / 60; // minutes
        
        if (timeDiff === 0) return 0;
        
        return (last - first) / timeDiff;
    }
    
    /**
     * Calculate progression speed
     * @returns {Object} Progression speed metrics
     */
    calculateProgressionSpeed() {
        if (this.progressionData.length < 2) {
            return { error: 'Not enough data' };
        }
        
        const speeds = {
            abPerMinute: this.calculateGrowthRate('ab'),
            abpsPerMinute: this.calculateGrowthRate('abps'),
            workstationsPerMinute: this.calculateGrowthRate('workstations')
        };
        
        return speeds;
    }
    
    /**
     * Identify bottlenecks
     * @returns {Array} List of bottlenecks
     */
    identifyBottlenecks() {
        const bottlenecks = [];
        
        // Check if AB generation is too slow
        const abps = this.gameState.getAbPerSecond();
        const currentAB = this.gameState.ab;
        
        // Find next unlock
        const nextUnlock = window.PRODUCERS?.find(prod => 
            prod.unlockAtAb > currentAB
        );
        
        if (nextUnlock) {
            const timeToUnlock = (nextUnlock.unlockAtAb - currentAB) / abps;
            if (timeToUnlock > 300) { // More than 5 minutes
                bottlenecks.push({
                    type: 'slow_progression',
                    message: `Next unlock (${nextUnlock.displayName}) will take ${Math.ceil(timeToUnlock / 60)} minutes`,
                    severity: timeToUnlock > 600 ? 'high' : 'medium'
                });
            }
        }
        
        // Check if player has too few workstations
        const totalWorkstations = Object.values(this.gameState.workstations).reduce((sum, count) => sum + count, 0);
        if (totalWorkstations === 0 && currentAB > 100) {
            bottlenecks.push({
                type: 'no_workstations',
                message: 'Player has AB but no workstations',
                severity: 'high'
            });
        }
        
        return bottlenecks;
    }
    
    /**
     * Get progression report
     * @returns {Object} Progression report
     */
    getReport() {
        return {
            dataPoints: this.progressionData.length,
            analysis: this.analyzeProgression(),
            currentState: {
                ab: this.gameState.ab,
                abps: this.gameState.getAbPerSecond(),
                workstations: Object.values(this.gameState.workstations).reduce((sum, count) => sum + count, 0),
                upgrades: Object.keys(this.gameState.upgradesOwned).length
            }
        };
    }
    
    /**
     * Export progression data
     * @returns {string} JSON string
     */
    exportData() {
        return JSON.stringify({
            progressionData: this.progressionData,
            analysis: this.analyzeProgression()
        }, null, 2);
    }
}

// Create global instance
const progressionAnalysis = null;

// Global functions
window.getProgressionReport = () => {
    if (progressionAnalysis) {
        return progressionAnalysis.getReport();
    }
    return null;
};

export default ProgressionAnalysis;

