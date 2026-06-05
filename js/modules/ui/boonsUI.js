/**
 * BoonsUI.js
 * Manages the rendering and updates of the Boons (Prestige) tab.
 */

import { showNotification } from './notifications.js';
import { PRESTIGE_BONUSES } from '../data/index.js';
import { formatTimeDuration, formatShort } from '../../utils.js';

export class BoonsUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
    }

    /**
     * Update boons tab with optimized rendering
     */
    update() {
        try {
            const ekDisplay = document.getElementById('ek-display');
            if (ekDisplay) {
                ekDisplay.textContent = `Eldritch Keys: ${this.gameState.prestigePoints}`;
            }

            const container = document.getElementById('boon-list');
            if (!container) return;

            container.innerHTML = '';

            // Batch DOM updates for better performance
            const fragment = document.createDocumentFragment();

            for (const boonData of PRESTIGE_BONUSES) {
                const currentLevel = this.gameState.prestigeBonuses[boonData.id] || 0;
                const cost = boonData.baseCostPp * Math.pow(boonData.costGrowth, currentLevel);

                let effectText = '';
                switch (boonData.type) {
                    case 'global_mult':
                        effectText = `+${Math.floor(boonData.value * 100)}% Global Production per level`;
                        break;
                    case 'producer_mult':
                        effectText = `+${Math.floor(boonData.value * 100)}% ${boonData.param} Production per level`;
                        break;
                    case 'starting_currency':
                        effectText = `+${formatShort(boonData.value)} SE at start per level`;
                        break;
                    case 'start_ingredient':
                        effectText = `+${formatShort(boonData.value)} ${boonData.param} at start per level`;
                        break;
                    case 'ab_production_mult':
                        effectText = `+${Math.floor(boonData.value * 100)}% Spell Energy Production per level`;
                        break;
                    case 'click_mult':
                        effectText = `+${Math.floor(boonData.value * 100)}% Cast Rewards per level`;
                        break;
                    case 'prestige_speed':
                        effectText = `+${Math.floor(boonData.value * 100)}% Prestige Point Gain per level`;
                        break;
                }

                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                    <div class="card-title">${boonData.displayName} (Lv. ${currentLevel})</div>
                    <div class="card-description">${boonData.description}</div>
                    <div class="card-section">
                        <div class="card-label">${effectText}</div>
                    </div>
                    <div class="card-section">
                        <div class="card-label">${Math.floor(cost)} EK</div>
                    </div>
                    <button class="btn-primary" data-action="purchase-boon" data-boon-id="${boonData.id}" ${this.gameState.prestigePoints >= cost ? '' : 'disabled'}>
                        Purchase
                    </button>
                `;

                // Attach event listener directly - always attach handler, check conditions inside
                const button = /** @type {HTMLButtonElement} */ (card.querySelector('button[data-action="purchase-boon"]'));
                const prestigeManager = this.uiManager.systems.prestigeManager;

                if (button && prestigeManager) {
                    // Ensure button is visible and clickable
                    button.style.position = 'relative';
                    button.style.zIndex = '100';
                    button.style.pointerEvents = (this.gameState.prestigePoints < cost || button.disabled) ? 'none' : 'auto';
                    button.style.cursor = (this.gameState.prestigePoints < cost || button.disabled) ? 'not-allowed' : 'pointer';
                    button.style.visibility = 'visible';
                    button.style.display = 'inline-block';

                    // Always attach handler - it will check if it can execute
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Check if we can actually purchase
                        if (this.gameState.prestigePoints < cost || button.disabled) {
                            console.log('Purchase boon button disabled:', { prestigePoints: this.gameState.prestigePoints, cost, disabled: button.disabled });
                            return;
                        }

                        console.log('Purchase boon button clicked:', { boonId: boonData.id });
                        prestigeManager.purchaseBoon(boonData.id);

                        // Update UI after purchase
                        this.update();
                    });
                }

                fragment.appendChild(card);
            }

            container.appendChild(fragment);
        } catch (error) {
            console.error('Error updating boons tab:', error);
            showNotification('Failed to load boons', 'error');
        }
    }
}
