/**
 * ExperimentUI.js
 * Manages the rendering and updates of the Experiment tab.
 */

import { showNotification } from './notifications.js';

export class ExperimentUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.boundExperimentClick = this.handleExperimentClick.bind(this);

        if (typeof document !== 'undefined') {
            document.addEventListener('click', this.boundExperimentClick);
        }
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
        }

        // Show discovered recipes with batched DOM updates
        const fragment = document.createDocumentFragment();

        // Show empty state if no recipes discovered yet
        if (this.gameState.discoveredRecipes.length === 0) {
            container.innerHTML = this.renderEmptyState({
                firstActionHint: 'EXPERIMENTS_UNLOCK_WITH_PROGRESS'
            });
            return;
        }

        for (const recipeId of this.gameState.discoveredRecipes) {
            const recipe = window.HIDDEN_RECIPES.find(r => r.id === recipeId);
            if (!recipe) {
                console.warn('🔴 Recipe not found:', recipeId);
                continue;
            }

            const card = document.createElement('div');
            card.className = 'card';

            // Validate recipe has required fields
            const recipeInputs = recipe.inputs || {};
            const recipeOutputs = recipe.outputs || {};

            // Debug logging
            console.info('📋 Rendering recipe:', recipeId, {
                name: recipe.name,
                inputs: recipeInputs,
                outputs: recipeOutputs
            });
            
            card.innerHTML = `
                <div class="card-title">${recipe.name || 'Unknown Recipe'}</div>
                <div class="card-description">${recipe.description || 'No description'}</div>
                <div class="card-section">
                            <div class="card-label">Cost:</div>
                    ${Object.entries(recipeInputs).map(([ingId, amount]) => {
        // Validate amount is a valid number
        if (amount === undefined || amount === null || isNaN(amount)) {
            console.warn(`Invalid recipe input amount for ${ingId}:`, amount);
            amount = 0;
        }
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
                    ${Object.entries(recipeOutputs).map(([outputId, amount]) => {
        // Validate amount is a valid number
        if (amount === undefined || amount === null || isNaN(amount)) {
            console.warn(`Invalid recipe output amount for ${outputId}:`, amount);
            amount = 0;
        }
        return `<div class="card-value">${outputId}: ${window.formatShort(amount)}</div>`;
    }).join('')}
                </div>
                <button class="btn-primary craft-recipe-btn" data-action="craft-recipe" data-recipe-id="${recipeId}">Craft</button>
            `;

            // The "Craft" button is handled by the unified delegated input handler
            // (InputManager: data-action="craft-recipe" -> craftDiscoveredRecipe).
            // A legacy per-button handler that depended on a never-set
            // `window.craftRecipe` global used to live here; it never ran (so the
            // unified path did the work) and, if revived, would have broken it by
            // marking the button "handled". Removed.

            fragment.appendChild(card);
        }

        container.appendChild(fragment);
    }

    handleExperimentClick(e) {
        const target = /** @type {HTMLElement | null} */ (e.target);
        const newExpButton = /** @type {HTMLElement | null} */ (target?.closest?.('#experiment-button') || null);
        if (!newExpButton) return;

        e.preventDefault();
        e.stopPropagation();

        // Mark as handled to prevent fallback handler from firing.
        newExpButton.dataset.handled = 'true';
        setTimeout(() => {
            delete newExpButton.dataset.handled;
        }, 100);

        try {
            console.info('Experiment button clicked');
            // tryExperiment lives on CraftingManager. The old call used a
            // never-set `window.craftingManager` global, so every "Try
            // Experiment" click threw (recipe discovery was unreachable here).
            const result = this.uiManager.systems.craftingManager.tryExperiment();
            const resultLabel = document.getElementById('experiment-result');

            // Ensure result label is visible.
            if (resultLabel) {
                resultLabel.classList.add('experiment-result-visible');
            }

            if (result.success) {
                console.info('Experiment succeeded:', result.recipe.name);
                resultLabel.innerHTML = `
                    <picture>
                        <source srcset="images/ui/experiment-result.webp" type="image/webp">
                        <img src="images/ui/experiment-result.png" alt="Experiment Success" class="experiment-result-illustration">
                    </picture>
                    <span class="css-icon-sparkle"></span> Discovered: ${result.recipe.name}
                `;
                resultLabel.className = 'result-label success experiment-result-visible';

                if (typeof window.pulseElement === 'function') {
                    window.pulseElement(newExpButton, 1.2, 400);
                }
                showNotification(`<span class="css-icon-celebration"></span> Discovered: ${result.recipe.name}!`, 'success');

                if (window.achievements) {
                    window.achievements.checkAchievements();
                }
            } else {
                console.info('Experiment failed:', result.message);
                resultLabel.innerHTML = `<div class="result-label error experiment-error-message">${result.message}</div>`;
                resultLabel.className = 'result-box experiment-result-visible';

                if (typeof window.shakeElement === 'function') {
                    window.shakeElement(newExpButton, 3, 200);
                }

                showNotification(result.message, 'error');
            }

            this.update();
        } catch (error) {
            console.error('Error in experiment:', error);
            const resultLabel = document.getElementById('experiment-result');
            if (resultLabel) {
                resultLabel.innerHTML = '<div class="result-label error experiment-error-message">Experiment failed. Try again.</div>';
                resultLabel.className = 'result-box experiment-result-visible';
            }
            showNotification('Experiment failed. Try again.', 'error');
        }
    }

    /**
     * Render progressive empty state based on player progress
     */
    renderEmptyState(context = {}) {
        const { firstActionHint } = context;

        // Simple empty state for experiments (no progress tracking)
        return `
            <div class="empty-state-container">
                <div class="empty-state-sigil" aria-hidden="true">◈</div>
                <p class="empty-state-message">> ${firstActionHint || 'NO_DATA_FOUND'}</p>
                <button class="btn-primary btn-sm" onclick="document.getElementById('experiment-button')?.focus()">> TRY_EXPERIMENT</button>
            </div>
        `;
    }
}
