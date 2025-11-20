/**
 * Balance Testing Framework
 * Provides tools for testing game balance and progression
 */

class BalanceTestingFramework {
    constructor(gameState) {
        this.gameState = gameState;
        this.testResults = [];
        this.init();
    }

    init() {
        // Set up test environment
        this.setupTestEnvironment();
    }

    /**
     * Set up test environment
     */
    setupTestEnvironment() {
        // Create test UI if in development mode
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.createTestUI();
        }
    }

    /**
     * Create test UI
     */
    createTestUI() {
        const testPanel = document.createElement('div');
        testPanel.id = 'balance-test-panel';
        testPanel.className = 'balance-test-panel';
        testPanel.innerHTML = `
            <h3>Balance Testing</h3>
            <button id="test-progression">Test Progression</button>
            <button id="test-economy">Test Economy</button>
            <button id="test-scaling">Test Scaling</button>
            <div id="test-results"></div>
        `;
        testPanel.className = 'balance-test-panel';
        // Styles moved to CSS
        document.body.appendChild(testPanel);

        // Add event listeners
        document.getElementById('test-progression')?.addEventListener('click', () => {
            this.testProgression();
        });

        document.getElementById('test-economy')?.addEventListener('click', () => {
            this.testEconomy();
        });

        document.getElementById('test-scaling')?.addEventListener('click', () => {
            this.testScaling();
        });

        // Toggle panel with Ctrl+B
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                const panel = document.getElementById('balance-test-panel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
            }
        });
    }

    /**
     * Test progression curves
     */
    testProgression() {
        const results = {
            test: 'Progression Curves',
            timestamp: Date.now(),
            data: {}
        };

        // Test AB generation over time
        const abGeneration = [];
        const testDuration = 3600; // 1 hour in seconds
        const tickRate = 0.1; // 10 ticks per second

        for (let t = 0; t < testDuration; t += tickRate) {
            const abps = this.gameState.getAbPerSecond();
            abGeneration.push({
                time: t,
                abps: abps,
                totalAB: this.gameState.abTotalEarned
            });
        }

        results.data.abGeneration = abGeneration;

        // Test workstation unlock progression
        const unlockProgression = [];
        window.PRODUCERS?.forEach(prod => {
            unlockProgression.push({
                id: prod.id,
                unlockAtAb: prod.unlockAtAb,
                baseCost: prod.recipe?.ab || 0,
                growth: prod.growth || 1.15
            });
        });

        results.data.unlockProgression = unlockProgression;

        this.testResults.push(results);
        this.displayResults(results);
    }

    /**
     * Test resource economy
     */
    testEconomy() {
        const results = {
            test: 'Resource Economy',
            timestamp: Date.now(),
            data: {}
        };

        // Test ingredient production rates
        const productionRates = {};
        window.PRODUCERS?.forEach(prod => {
            if (prod.production) {
                productionRates[prod.id] = {
                    base: prod.production,
                    withUpgrades: this.calculateProductionWithUpgrades(prod.id)
                };
            }
        });

        results.data.productionRates = productionRates;

        // Test cost scaling
        const costScaling = {};
        window.PRODUCERS?.forEach(prod => {
            const scaling = [];
            for (let owned = 0; owned < 100; owned++) {
                const cost = this.calculateNextCost(prod, owned);
                scaling.push({ owned, cost });
            }
            costScaling[prod.id] = scaling;
        });

        results.data.costScaling = costScaling;

        this.testResults.push(results);
        this.displayResults(results);
    }

    /**
     * Test scaling mechanics
     */
    testScaling() {
        const results = {
            test: 'Scaling Mechanics',
            timestamp: Date.now(),
            data: {}
        };

        // Test upgrade effectiveness
        const upgradeEffectiveness = {};
        window.UPGRADES?.forEach(upg => {
            upgradeEffectiveness[upg.id] = {
                cost: upg.recipe?.ab || 0,
                value: upg.value,
                effectiveness: this.calculateUpgradeEffectiveness(upg)
            };
        });

        results.data.upgradeEffectiveness = upgradeEffectiveness;

        // Test prestige bonus scaling
        const prestigeScaling = {};
        window.PRESTIGE_BONUSES?.forEach(bonus => {
            const scaling = [];
            for (let level = 1; level <= 10; level++) {
                scaling.push({
                    level,
                    value: bonus.value * level,
                    cost: this.calculatePrestigeCost(bonus, level)
                });
            }
            prestigeScaling[bonus.id] = scaling;
        });

        results.data.prestigeScaling = prestigeScaling;

        this.testResults.push(results);
        this.displayResults(results);
    }

    /**
     * Calculate production with upgrades
     * @param {string} producerId - Producer ID
     * @returns {Object} Production rates
     */
    calculateProductionWithUpgrades(producerId) {
        const mult = this.gameState.getProductionMultiplier(producerId);
        const prod = window.PRODUCERS.find(p => p.id === producerId);
        if (!prod || !prod.production) return {};

        const production = {};
        Object.keys(prod.production).forEach(key => {
            production[key] = (prod.production[key] || 0) * mult;
        });

        return production;
    }

    /**
     * Calculate next cost
     * @param {Object} producer - Producer object
     * @param {number} owned - Currently owned count
     * @returns {number} Next cost
     */
    calculateNextCost(producer, owned) {
        if (!producer.recipe || !producer.growth) return 0;

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
     * Calculate upgrade effectiveness
     * @param {Object} upgrade - Upgrade object
     * @returns {number} Effectiveness score
     */
    calculateUpgradeEffectiveness(upgrade) {
        const cost = upgrade.recipe?.ab || 0;
        if (cost === 0) return 0;
        return upgrade.value / cost;
    }

    /**
     * Calculate prestige cost
     * @param {Object} bonus - Prestige bonus object
     * @param {number} level - Bonus level
     * @returns {number} Cost
     */
    calculatePrestigeCost(bonus, level) {
        // Simple linear scaling for prestige bonuses
        return (bonus.cost || 1) * level;
    }

    /**
     * Display test results
     * @param {Object} results - Test results
     */
    displayResults(results) {
        const resultsDiv = document.getElementById('test-results');
        if (!resultsDiv) return;

        const resultElement = document.createElement('div');
        resultElement.className = 'test-result';
        resultElement.innerHTML = `
            <h4>${results.test}</h4>
            <pre>${JSON.stringify(results.data, null, 2)}</pre>
        `;
        resultsDiv.appendChild(resultElement);

        // Log to console
        console.log('Balance Test Results:', results);
    }

    /**
     * Export test results
     * @returns {string} JSON string of results
     */
    exportResults() {
        return JSON.stringify(this.testResults, null, 2);
    }
}

// Create global instance
let balanceTestingFramework = null;

// Global functions
window.runBalanceTests = () => {
    if (balanceTestingFramework) {
        balanceTestingFramework.testProgression();
        balanceTestingFramework.testEconomy();
        balanceTestingFramework.testScaling();
    }
};

export default BalanceTestingFramework;

