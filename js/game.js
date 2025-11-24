/**
 * Main Game Entry Point
 * Replaces game.v7.js with a cleaner initialization flow.
 * Week 1 Optimization: Includes performance baseline measurement
 */

import { initGame } from './gameInit.js';
import { handleError } from './errorHandler.js';
import { PerformanceBaseline } from './utils/performanceBaseline.js';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
    handleError(event.reason, 'unhandledRejection', true);
});

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}

async function start() {
    try {
        // Week 1, Day 1: Establish performance baseline (if not already measured)
        const savedBaseline = PerformanceBaseline.load();
        if (!savedBaseline) {
            console.log('📊 Measuring performance baseline...');
            const baseline = new PerformanceBaseline();
            await baseline.measure();
            baseline.save();
            window.performanceBaseline = baseline.getMetrics();
            console.log('✅ Baseline saved:', window.performanceBaseline);
        } else {
            window.performanceBaseline = savedBaseline;
            console.log('📊 Using saved baseline:', savedBaseline);
        }
        
        const { gameState, uiManager, gameLoop } = await initGame();
        
        // Expose for debugging
        window.gameState = gameState;
        window.uiManager = uiManager;
        window.gameLoop = gameLoop;
        
        console.log('✅ Game started successfully.');
        console.log('🎮 Unified game loop active (10 TPS logic, 60 FPS visuals)');
        
        // Measure performance after initialization (for comparison)
        setTimeout(async () => {
            const currentBaseline = new PerformanceBaseline();
            await currentBaseline.measure();
            const comparison = window.performanceBaseline 
                ? currentBaseline.compare(window.performanceBaseline)
                : null;
            if (comparison) {
                console.log('📈 Performance comparison:', comparison);
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
        errorDiv.style.background = '#330000';
        errorDiv.style.color = '#ff0000';
        errorDiv.style.padding = '20px';
        errorDiv.style.border = '2px solid #ff0000';
        errorDiv.style.zIndex = '9999';
        errorDiv.innerHTML = `
            <h2>Game Failed to Load</h2>
            <p>${error.message}</p>
            <p>Please refresh the page. If the issue persists, clear your browser data.</p>
        `;
        document.body.appendChild(errorDiv);
    }
}
