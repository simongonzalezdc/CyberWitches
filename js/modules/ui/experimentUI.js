/**
 * ExperimentUI.js
 * Manages the rendering and updates of the Experiment tab.
 */

import { stripEmojisIfLowTier } from './uiHelpers.js';
import { showNotification } from './notifications.js';

export class ExperimentUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
    }

    /**
     * Update experiment tab with optimized rendering
     */
    update() {
        const container = document.getElementById('recipe-list');
        if (!container) return;

        container.innerHTML = '';

        // Experiment button handler
        const expButton = document.getElementById('experiment-button');
        if (expButton) {
            // Explicitly set button text to ensure no emoji (prevents caching issues)
            expButton.textContent = 'Try Experiment';
            expButton.title = 'Discover new preservation techniques through experimentation';

            // Remove any existing handlers to prevent duplicates
            expButton.replaceWith(expButton.cloneNode(true));
            const newExpButton = document.getElementById('experiment-button');

            newExpButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Mark as handled to prevent fallback handler from firing
                newExpButton.dataset.handled = 'true';
                setTimeout(() => {
                    delete newExpButton.dataset.handled;
                }, 100);

                try {
                    console.log('Experiment button clicked');
                    const result = window.craftingManager.tryExperiment();
                    const resultLabel = document.getElementById('experiment-result');

                    // Ensure result label is visible
                    if (resultLabel) {
                        resultLabel.classList.add('experiment-result-visible');
                    }

                    if (result.success) {
                        console.log('Experiment succeeded:', result.recipe.name);
                        resultLabel.innerHTML = `
                            <picture>
                                <source srcset="images/ui/experiment-result.webp" type="image/webp">
                                <img src="images/ui/experiment-result.png" alt="Experiment Success" class="experiment-result-illustration">
                            </picture>
                            <span class="css-icon-sparkle"></span> Discovered: ${result.recipe.name}
                        `;
                        resultLabel.className = 'result-label success experiment-result-visible';

                        // Celebration!
                        if (typeof window.pulseElement === 'function') {
                            window.pulseElement(newExpButton, 1.2, 400);
                        }
                        showNotification(`<span class="css-icon-celebration"></span> Discovered: ${result.recipe.name}!`, 'success');

                        // Check achievements
                        if (window.achievements) {
                            const newAchievements = window.achievements.checkAchievements();
                            // Achievement notifications are handled by checkAchievements or global listener
                        }
                    } else {
                        console.log('Experiment failed:', result.message);
                        resultLabel.innerHTML = `<div class="result-label error experiment-error-message">${result.message}</div>`;
                        resultLabel.className = 'result-box experiment-result-visible';

                        // Shake on failure
                        if (typeof window.shakeElement === 'function') {
                            window.shakeElement(newExpButton, 3, 200);
                        }

                        // Show notification for feedback
                        showNotification(result.message, 'error');
                    }

                    this.update();
                } catch (error) {
                    console.error('Error in experiment:', error);
                    const resultLabel = document.getElementById('experiment-result');
                    if (resultLabel) {
                        resultLabel.innerHTML = `<div class="result-label error experiment-error-message">Experiment failed. Try again.</div>`;
                        resultLabel.className = 'result-box experiment-result-visible';
                    }
                    showNotification('Experiment failed. Try again.', 'error');
                }
            });
        }

        // Show discovered recipes with batched DOM updates
        const fragment = document.createDocumentFragment();

        for (const recipeId of this.gameState.discoveredRecipes) {
            const recipe = window.HIDDEN_RECIPES.find(r => r.id === recipeId);
            if (!recipe) continue;

            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <div class="card-title">${recipe.name}</div>
                <div class="card-description">${recipe.description}</div>
                <div class="card-section">
                            <div class="card-label">Cost:</div>
                    ${Object.entries(recipe.inputs).map(([ingId, amount]) => {
                const have = this.gameState.inventory[ingId] || 0;
                const canAfford = have >= amount;
                return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                            <span class="recipe-label">${ingId}:</span>
                            <span class="recipe-numbers">${window.formatShort(have)} / ${window.formatShort(amount)}</span>
                        </div>`;
            }).join('')}
                </div>
                <div class="card-section">
                            <div class="card-label">Makes:</div>
                    ${Object.entries(recipe.outputs).map(([outputId, amount]) =>
                `<div class="card-value">${outputId}: ${window.formatShort(amount)}</div>`
            ).join('')}
                </div>
                <button class="btn-primary craft-recipe-btn" data-action="craft-recipe" data-recipe-id="${recipeId}">Craft</button>
            `;

            // Attach event listener directly - use event delegation for better reliability
            const button = card.querySelector('button[data-action="craft-recipe"]');
            if (button && typeof window.craftRecipe === 'function') {
                // Styles handled by CSS class .craft-recipe-btn

                // Attach handler directly - use capture phase to fire before unified handler
                button.addEventListener('click', (e) => {
                    // Mark button as handled BEFORE processing to prevent unified handler from firing
                    button.dataset.handled = 'true';

                    e.preventDefault();
                    e.stopPropagation();

                    console.log('Craft recipe button clicked:', { recipeId });
                    const success = window.craftRecipe(recipeId);

                    // Update UI after crafting
                    if (success) {
                        this.update();
                        if (this.uiManager && typeof this.uiManager.updateAllUI === 'function') {
                            // Trigger full UI update but debounced if possible, or just let the game loop handle it
                            // For now, we rely on the next game loop tick or manual calls
                        }
                    }

                    // Visual feedback
                    if (success && typeof window.pulseElement === 'function') {
                        window.pulseElement(button, 1.1, 200);
                    } else if (!success && typeof window.shakeElement === 'function') {
                        window.shakeElement(button, 3, 200);
                    }

                    // Clear handled flag after a short delay
                    setTimeout(() => {
                        delete button.dataset.handled;
                    }, 100);
                }, true); // Use capture phase
            }

            fragment.appendChild(card);
        }

        container.appendChild(fragment);
    }
}
