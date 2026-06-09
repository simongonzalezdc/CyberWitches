/**
 * Main Game Entry Point
 * Replaces game.v7.js with a cleaner initialization flow.
 * Week 1 Optimization: Includes performance baseline measurement
 */

import { initGame } from './gameInit.js';
import { handleError } from './errorHandler.js';
import { PerformanceBaseline } from './utils/performanceBaseline.js';
import { restoreMissingFromIndexedDB } from './save/indexedDBBackup.js';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
    handleError(event.reason, 'unhandledRejection', true);
});

/**
 * Performance instrumentation (baseline measurement + the Tailwind-migration
 * validation pass) is developer tooling, not gameplay. It is OFF by default so
 * players never pay its cost or see "Performance validation failed" warnings in
 * their console. Enable it with `?perf` in the URL or
 * `localStorage.setItem('cyberWitchesPerfDebug','true')`.
 */
function isPerfDebugEnabled() {
    try {
        if (new URLSearchParams(window.location.search).has('perf')) return true;
        return localStorage.getItem('cyberWitchesPerfDebug') === 'true';
    } catch {
        return false;
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}

async function start() {
    try {
        const perfDebug = isPerfDebugEnabled();

        // Establish performance baseline (developer tooling, opt-in only —
        // measuring it delays startup, so players skip it entirely).
        if (perfDebug) {
            const savedBaseline = PerformanceBaseline.load();
            if (!savedBaseline) {
                console.info('📊 Measuring performance baseline...');
                const baseline = new PerformanceBaseline();
                await baseline.measure();
                baseline.save();
                window.performanceBaseline = baseline.getMetrics();
                console.info('✅ Baseline saved:', window.performanceBaseline);
            } else {
                window.performanceBaseline = savedBaseline;
                console.info('📊 Using saved baseline:', savedBaseline);
            }
        }

        // Before loading, restore any save that survives only in IndexedDB
        // (e.g. localStorage was evicted under storage pressure). This copies the
        // durable IndexedDB mirror back into localStorage so the existing
        // synchronous load path picks it up. Never throws; never blocks for long.
        await restoreMissingFromIndexedDB(['cyberWitchesSave', 'meditationState']);

        const { gameState, uiManager, gameLoop } = await initGame();

        // Expose for debugging
        window.gameState = gameState;
        window.uiManager = uiManager;
        window.gameLoop = gameLoop;

        // Now that window.gameState exists AND the save has loaded (prestigeCount
        // is known), run the tab-lock pass. The boons/meditation tabs default to
        // `locked` in the markup; this UNLOCKS them for saves with prestige >= 1.
        // (FeatureIndicatorManager's earlier pass inside initGame no-ops because
        // window.gameState isn't assigned until here.)
        if (window.updateFeatureIndicators) window.updateFeatureIndicators();

        console.info('✅ Game started successfully.');
        console.info('🎮 Unified game loop active (10 TPS logic, 30 FPS visuals)');
        
        // Measure performance after initialization (developer tooling, opt-in).
        // Previously this always ran 6s after load and printed a scary
        // "Performance validation failed" warning into every player's console.
        if (perfDebug) setTimeout(async () => {
            const { performanceValidator } = await import('./utils/performanceValidator.js');
            
            // Load baseline if available
            performanceValidator.loadBaseline();
            
            // Measure current performance
            await performanceValidator.measureCurrent();
            
            // Compare and validate
            const comparison = performanceValidator.compare();
            if (comparison) {
                console.info('📈 Performance comparison:', comparison);
            }
            
            // Validate improvements
            const validation = performanceValidator.validate();
            if (validation) {
                performanceValidator.printReport();
                
                // Create migration baseline for Tailwind CSS
                if (validation.valid) {
                    performanceValidator.createMigrationBaseline();
                    console.info('✅ Performance validation passed. Ready for Tailwind CSS migration.');
                } else {
                    console.warn('⚠️ Performance validation failed. Review regressions before proceeding.');
                }
            }
        }, 6000); // Wait 6 seconds after load
        
    } catch (error) {
        console.error('Failed to start game:', error);
        // Display fatal error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.background = 'var(--color-glitch-500)';
        errorDiv.style.color = 'var(--color-retro-red)';
        errorDiv.style.padding = '20px';
        errorDiv.style.border = '2px solid var(--color-retro-red)';
        errorDiv.style.zIndex = '140';
        // Build with static markup + textContent for the dynamic message so an
        // error string can never inject markup into the page.
        const heading = document.createElement('h2');
        heading.textContent = 'Game Failed to Load';
        const detail = document.createElement('p');
        detail.textContent = error.message;
        const hint = document.createElement('p');
        hint.textContent = 'Please refresh the page. If the issue persists, clear your browser data.';
        errorDiv.append(heading, detail, hint);
        document.body.appendChild(errorDiv);
    }
}
