/**
 * PrestigeManager
 * Manages prestige-related actions and logic.
 */
export class PrestigeManager {
    /**
     * @param {Object} gameState - The global game state
     * @param {Object} uiManager - The UI manager
     */
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;

        // Bind methods
        this.purchaseBoon = this.purchaseBoon.bind(this);
    }

    /**
     * Purchase a prestige bonus (boon)
     * @param {string} bonusId - The ID of the bonus to purchase
     * @returns {boolean} - Whether the purchase was successful
     */
    purchaseBoon(bonusId) {
        if (!this.gameState) return false;

        if (this.gameState.purchasePrestigeBonus(bonusId)) {
            // Play purchase sound
            const audioSystem = this.uiManager.systems.audioSystem || window.audioSystem;
            if (audioSystem && typeof audioSystem.playSound === 'function') {
                audioSystem.playSound('purchase');
            }

            // Update UI
            if (this.uiManager && this.uiManager.boonsUI) {
                this.uiManager.boonsUI.update();
            }

            return true;
        }

        return false;
    }
}
