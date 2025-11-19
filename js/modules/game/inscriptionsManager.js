/**
 * InscriptionsManager
 * Manages inscription-related actions and logic.
 */
import { showNotification } from '../ui/notifications.js';

export class InscriptionsManager {
    /**
     * @param {Object} gameState - The global game state
     * @param {Object} uiManager - The UI manager
     */
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;

        // Click handling state
        this.clickHandlers = {
            processing: new Set(),
            lastClickTime: new Map(),
            debounceDelay: 300
        };

        // Bind methods
        this.inscribeUpgrade = this.inscribeUpgrade.bind(this);
    }

    /**
     * Inscribe an upgrade onto a workstation
     * @param {string} upgId - The upgrade ID
     * @param {HTMLElement} buttonElement - The button element that triggered the action
     */
    inscribeUpgrade(upgId, buttonElement = null) {
        if (!this.gameState) {
            console.error('inscribeUpgrade: gameState not available');
            return;
        }

        // Create unique key for this action
        const buttonKey = `inscribe-${upgId}`;

        // Debounce: Prevent rapid clicks
        const now = Date.now();
        const lastClick = this.clickHandlers.lastClickTime.get(buttonKey) || 0;
        if (now - lastClick < this.clickHandlers.debounceDelay) {
            console.log('Inscribe click debounced - too soon after last click');
            return;
        }

        // Check if already processing
        if (this.clickHandlers.processing.has(buttonKey)) {
            console.log('Already processing inscribe for:', upgId);
            return;
        }

        this.clickHandlers.processing.add(buttonKey);
        this.clickHandlers.lastClickTime.set(buttonKey, now);

        // Disable button temporarily to prevent double-clicks
        if (buttonElement) {
            buttonElement.disabled = true;
        }

        // Attempt to inscribe
        const success = this.gameState.inscribeUpgrade(upgId);

        if (success) {
            // Play sound
            const audioSystem = this.uiManager.systems.audioSystem || window.audioSystem;
            if (audioSystem && typeof audioSystem.playSound === 'function') {
                audioSystem.playSound('upgrade');
            }

            // Show notification
            const upgrade = this.gameState.upgrades[upgId];
            const displayName = upgrade ? upgrade.displayName : upgId;
            showNotification(`Inscribed ${displayName}!`, 'success');

            // Update UI
            if (this.uiManager && this.uiManager.inscriptionsUI) {
                this.uiManager.inscriptionsUI.update();
            }

            // Also update workstations tab as inscriptions affect them
            if (this.uiManager && this.uiManager.workstationUI) {
                this.uiManager.workstationUI.update();
            }
        } else {
            const upgrade = this.gameState.upgrades[upgId];
            const displayName = upgrade ? upgrade.displayName : upgId;
            showNotification(`Failed to inscribe ${displayName}`, 'error');
        }

        // Re-enable button and clear processing flag
        if (buttonElement) {
            setTimeout(() => {
                buttonElement.disabled = false;
            }, 50);
        }

        // Clear processing flag after a delay
        setTimeout(() => {
            this.clickHandlers.processing.delete(buttonKey);
        }, this.clickHandlers.debounceDelay);
    }
}
