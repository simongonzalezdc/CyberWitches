/**
 * InputManager.js
 * Handles all user input and event delegation to replace inline event handlers.
 */

import { showNotification } from './notifications.js';

export class InputManager {
    constructor(gameState, uiManager, craftingManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.craftingManager = craftingManager;
        this.boundHandlers = new Map();

        // Initialize event listeners
        this.init();
    }

    init() {
        // Global click delegation
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Global keydown handler
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
    }

    handleClick(e) {
        // Handle global click delegation
        const target = e.target;
        const button = target.closest('button');

        // Handle cast button specifically (it might not have data-action)
        if (target.id === 'cast-button' || target.closest('#cast-button')) {
            this.handleCast();
            return;
        }

        if (!button || button.disabled) return;

        const action = button.dataset.action;
        if (!action) return;

        // Check if event was already handled by a direct handler
        if (e.defaultPrevented) {
            return;
        }

        // Get button data attributes
        const wsId = button.dataset.wsId || button.dataset['ws-id'];
        const amount = button.dataset.amount;
        const recipeId = button.dataset.recipeId || button.dataset['recipe-id'];
        const taskId = button.dataset.taskId || button.dataset['task-id'];
        const boonId = button.dataset.boonId || button.dataset['boon-id'];
        const upgradeId = button.dataset.upgradeId || button.dataset['upgrade-id'];

        // Handle different action types
        let handled = false;
        if (action === 'craft' && wsId) {
            const craftAmount = parseInt(amount, 10) || 1;
            if (this.craftingManager) {
                this.craftingManager.craftWorkstation(wsId, craftAmount, button);
                handled = true;
            }
        } else if (action === 'craft-max' && wsId) {
            if (this.craftingManager) {
                this.craftingManager.craftWorkstationMax(wsId, button);
                handled = true;
            }
        } else if (action === 'craft-recipe' && recipeId) {
            if (this.craftingManager) {
                this.craftingManager.craftDiscoveredRecipe(recipeId);
                handled = true;
            }
        } else if (action === 'claim-task' && taskId) {
            if (this.uiManager.systems.dailyRituals) {
                this.uiManager.systems.dailyRituals.claimTask(taskId);
                handled = true;
            }
        } else if (action === 'purchase-boon' && boonId) {
            if (this.uiManager.systems.prestigeManager) {
                this.uiManager.systems.prestigeManager.purchaseBoon(boonId);
                handled = true;
            }
        } else if (action === 'inscribe' && upgradeId) {
            if (this.uiManager.systems.inscriptionsManager) {
                this.uiManager.systems.inscriptionsManager.inscribeUpgrade(upgradeId, button);
                handled = true;
            }
        }

        if (handled) {
            e.preventDefault();
            e.stopPropagation();
            // console.log('InputManager handled action:', action);
        }
    }

    handleKeydown(e) {
        // Ignore if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Handle Escape key for closing modals
        if (e.key === 'Escape') {
            if (this.uiManager.modalManager) {
                this.uiManager.modalManager.closeAllModals();
                if (this.uiManager.systems.accessibilityManager) {
                    this.uiManager.systems.accessibilityManager.announce('Modals closed', 'polite');
                }
                e.preventDefault();
                return;
            }
        }

        // Handle shortcuts
        switch (e.key) {
            case '1': this.uiManager.switchTab('workstations'); break;
            case '2': this.uiManager.switchTab('inscriptions'); break;
            case '3': this.uiManager.switchTab('inventory'); break;
            case '4': this.uiManager.switchTab('experiment'); break;
            case '5': this.uiManager.switchTab('dailies'); break;
            case '6': this.uiManager.switchTab('boons'); break;
            case '7': this.uiManager.switchTab('meditation'); break;
            case '8': this.uiManager.switchTab('stats'); break;
            case ' ':
                e.preventDefault();
                this.handleCast();
                break;
            case 's':
                if (this.gameState) {
                    this.gameState.saveGameState();
                    showNotification('Game saved!', 'success');
                }
                break;
            case 'a':
                if (this.gameState && this.gameState.calculatePrestigeGain() > 0) {
                    this.uiManager.modalManager.showPrestigeModal();
                }
                break;
        }
    }

    handleCast() {
        if (this.uiManager.systems.castManager) {
            this.uiManager.systems.castManager.handleCast();
        }
    }
}
