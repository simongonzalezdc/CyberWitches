/**
 * Main Game Entry Point
 * Replaces game.v7.js with a cleaner initialization flow.
 */

import { initGame } from './gameInit.js';
import { handleError } from './errorHandler.js';

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
        const { gameState, uiManager } = await initGame();
        
        // Expose for debugging
        window.gameState = gameState;
        window.uiManager = uiManager;
        
        console.log('Game started successfully.');
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
