/**
 * MeditationUI.js
 * Manages the rendering and updates of the Meditation tab.
 */

import { MEDITATION_TOWERS, MEDITATION_UPGRADES, INGREDIENTS } from '../data/index.js';
import { formatShort, formatPrecise, escapeHtml } from '../../utils.js';

/**
 * Meditation UI Manager - Handles rendering of meditation mode UI
 */
export class MeditationUI {
    constructor(meditationState, gameState, uiManager) {
        this.meditationState = meditationState;
        this.gameState = gameState;
        this.uiManager = uiManager;

        // UI Elements
        this.focusDisplay = null;
        this.focuspsDisplay = null;
        this.tranquilityDisplay = null;
        this.tranquilityMaxDisplay = null;
        this.waveDisplay = null;
        this.startButton = null;
        this.endButton = null;
        this.towerList = null;
        this.meditationInventoryList = null;
        this.meditationUpgradeList = null;

        // Update intervals
        this.updateIntervals = [];
    }

    /**
     * Initialize UI elements
     */
    init() {
        // Get UI elements
        this.focusDisplay = document.getElementById('focus-display');
        this.focuspsDisplay = document.getElementById('focusps-display');
        this.tranquilityDisplay = document.getElementById('tranquility-display');
        this.tranquilityMaxDisplay = document.getElementById('tranquility-max-display');
        this.waveDisplay = document.getElementById('wave-display');
        this.startButton = document.getElementById('start-meditation-button');
        this.endButton = document.getElementById('end-meditation-button');
        this.towerList = document.getElementById('tower-list');
        this.meditationInventoryList = document.getElementById('meditation-inventory-list');
        this.meditationUpgradeList = document.getElementById('meditation-upgrade-list');

        // Set up button handlers
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.meditationState.startSession();
                this.updateControls();
            });
        }

        if (this.endButton) {
            this.endButton.addEventListener('click', () => {
                this.meditationState.endSession();
                this.updateControls();
            });
        }

        // Set up callbacks
        this.meditationState.onFocusChanged = () => {
            this.updateFocusDisplay();
            // Track focus earning for daily tasks
            if (this.uiManager && this.uiManager.systems.dailyRituals) {
                this.uiManager.systems.dailyRituals.updateTaskProgress('earn_focus', '', this.meditationState.focusTotalEarned);
            }
        };

        this.meditationState.onTranquilityChanged = () => {
            this.updateTranquilityDisplay();
        };

        this.meditationState.onWaveChanged = (wave) => {
            this.updateWaveDisplay();
            // Track meditation waves for daily tasks
            if (this.uiManager && this.uiManager.systems.dailyRituals) {
                this.uiManager.systems.dailyRituals.updateTaskProgress('meditation_waves', '', wave);
            }
        };

        // Start update intervals
        this.startUpdateIntervals();

        // Initial render
        this.updateAll();
    }

    /**
     * Start update intervals
     */
    startUpdateIntervals() {
        // Update focus display every second
        const focusInterval = setInterval(() => {
            this.updateFocusDisplay();
            this.updateFocuspsDisplay();
        }, 1000);
        this.updateIntervals.push(focusInterval);

        // Update all displays every 500ms
        const updateInterval = setInterval(() => {
            this.updateAll();
        }, 500);
        this.updateIntervals.push(updateInterval);
    }

    /**
     * Stop update intervals
     */
    stopUpdateIntervals() {
        this.updateIntervals.forEach(interval => clearInterval(interval));
        this.updateIntervals = [];
    }

    /**
     * Update all displays
     */
    update() {
        this.updateAll();
    }

    /**
     * Update all displays (internal)
     */
    updateAll() {
        this.updateFocusDisplay();
        this.updateFocuspsDisplay();
        this.updateTranquilityDisplay();
        this.updateWaveDisplay();
        this.updateTowerList();
        this.updateMeditationInventory();
        this.updateMeditationUpgrades();
        this.updateControls();
        this.updateProductionBonus();
    }

    /**
     * Update focus display
     */
    updateFocusDisplay() {
        if (this.focusDisplay && this.meditationState) {
            this.focusDisplay.textContent = `Focus: ${formatShort(this.meditationState.focus)}`;
        }
    }

    /**
     * Update focus per second display
     */
    updateFocuspsDisplay() {
        if (this.focuspsDisplay && this.meditationState) {
            const focusps = this.meditationState.focusPassiveRate * this.meditationState.getFocusMultiplier();
            this.focuspsDisplay.textContent = `${formatPrecise(focusps, 2)} Focus/s`;
        }
    }

    /**
     * Update tranquility display
     */
    updateTranquilityDisplay() {
        if (this.tranquilityDisplay && this.meditationState) {
            this.tranquilityDisplay.textContent = String(Math.floor(this.meditationState.tranquility));
        }
        if (this.tranquilityMaxDisplay && this.meditationState) {
            this.tranquilityMaxDisplay.textContent = String(Math.floor(this.meditationState.tranquilityMax));
        }
    }

    /**
     * Update wave display
     */
    updateWaveDisplay() {
        if (this.waveDisplay && this.meditationState) {
            this.waveDisplay.textContent = this.meditationState.currentWave;
        }
    }

    /**
     * Update tower list - shows all 4 tower types and placed towers with upgrade buttons
     */
    updateTowerList() {
        if (!this.towerList || !this.meditationState) return;

        this.towerList.innerHTML = '';

        // Show all 4 tower types (no tiers)
        for (const towerData of MEDITATION_TOWERS) {
            const canAfford = this.meditationState.canAffordTower(towerData);

            const towerCard = document.createElement('div');
            towerCard.className = `card tower-card ${canAfford ? 'can-afford' : 'cannot-afford'}`;

            // Show base stats - compact format
            const recipeItems = Object.entries(towerData.recipe).map(([ingId, amount]) => {
                const have = this.gameState.inventory[ingId] || 0;
                const canAffordIng = have >= amount;
                const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                const displayName = ingredient ? ingredient.displayName : ingId;
                return `<span class="recipe-item-inline ${canAffordIng ? 'can-afford' : 'cannot-afford'}">
                    ${escapeHtml(displayName)}: ${formatShort(have)}/${formatShort(amount)}
                </span>`;
            }).join('');

            towerCard.innerHTML = `
                <div class="card-title">${escapeHtml(towerData.displayName)}</div>
                <div class="card-description">
                    ${escapeHtml(String(towerData.baseDamage))} dmg | ${escapeHtml(String(towerData.baseRange))} range | ${escapeHtml(towerData.baseAttackSpeed.toFixed(2))}/s
                </div>
                <div class="card-section">
                    ${recipeItems}
                </div>
                <button class="btn-primary tower-place-button" data-tower-id="${escapeHtml(towerData.id)}" ${canAfford ? '' : 'disabled'}>
                    Place Tower
                </button>
            `;

            // Add click handler for tower placement
            const button = towerCard.querySelector('.tower-place-button');
            if (button) {
                button.addEventListener('click', () => {
                    this.handleTowerPlacement(towerData.id);
                });
            }

            this.towerList.appendChild(towerCard);
        }

        // Show placed towers with upgrade buttons (collapsible)
        const placedTowers = this.meditationState.towers || [];
        if (placedTowers.length > 0) {
            // Check if any tower can be upgraded
            let hasUpgradeAvailable = false;
            for (const tower of placedTowers) {
                const level = tower.upgradeLevel || 0;
                if (this.meditationState.canAffordTowerUpgrade(tower.data, level)) {
                    hasUpgradeAvailable = true;
                    break;
                }
            }

            // Create collapsible container
            const placedContainer = document.createElement('div');
            placedContainer.className = 'placed-towers-container';

            // Create collapsible header
            const placedHeader = document.createElement('div');
            placedHeader.className = `tier-header placed-towers-header ${hasUpgradeAvailable ? 'upgrade-available' : ''}`;

            const headerText = document.createElement('span');
            headerText.className = 'placed-towers-header-text';
            headerText.textContent = 'Placed Towers';

            const expandIcon = document.createElement('span');
            expandIcon.className = 'placed-towers-expand-icon';
            expandIcon.textContent = '▼';

            placedHeader.appendChild(headerText);
            placedHeader.appendChild(expandIcon);

            // Create collapsible content container
            const placedContent = document.createElement('div');
            placedContent.className = 'placed-towers-content';

            // Store collapsed state (default to collapsed, expand if upgrade available)
            let isCollapsed = !hasUpgradeAvailable;
            if (!isCollapsed) {
                placedContent.classList.add('expanded');
                expandIcon.classList.add('expanded');
            }

            // Toggle collapse on header click
            placedHeader.addEventListener('click', () => {
                isCollapsed = !isCollapsed;
                if (isCollapsed) {
                    placedContent.classList.remove('expanded');
                    expandIcon.classList.remove('expanded');
                } else {
                    placedContent.classList.add('expanded');
                    expandIcon.classList.add('expanded');
                }
            });

            // Add towers to content container
            for (const tower of placedTowers) {
                const stats = this.meditationState.getTowerStats(tower);
                const level = tower.upgradeLevel || 0;
                const canUpgrade = this.meditationState.canAffordTowerUpgrade(tower.data, level);

                // Calculate upgrade cost
                const costMultiplier = Math.pow(1.5, level);
                const upgradeCosts = Object.entries(tower.data.upgradeCost || {}).map(([ingId, baseCost]) => {
                    const required = baseCost * costMultiplier;
                    const have = this.meditationState.meditationInventory[ingId] || 0;
                    const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                    const displayName = ingredient ? ingredient.displayName : ingId;
                    return { ingId, displayName, required, have, canAfford: have >= required };
                });

                const towerCard = document.createElement('div');
                towerCard.className = 'card tower-card placed-tower';

                const upgradeCostItems = upgradeCosts.map(({ displayName, required, have, canAfford }) => {
                    return `<span class="recipe-item-inline ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        ${escapeHtml(displayName)}: ${formatShort(have)}/${formatShort(required)}
                    </span>`;
                }).join('');

                towerCard.innerHTML = `
                    <div class="card-title">${escapeHtml(tower.data.displayName)} (Lv${escapeHtml(level)})</div>
                    <div class="card-description">
                        ${escapeHtml(stats.damage.toFixed(1))} dmg | ${escapeHtml(stats.range.toFixed(1))} range | ${escapeHtml(stats.attackSpeed.toFixed(2))}/s
                    </div>
                    <div class="card-section">
                        <div class="tower-upgrade-label">Upgrade to Lv${escapeHtml(level + 1)}:</div>
                        ${upgradeCostItems}
                    </div>
                    <button class="btn-primary tower-upgrade-button" data-tower-gridx="${escapeHtml(tower.gridX)}" data-tower-gridy="${escapeHtml(tower.gridY)}" ${canUpgrade ? '' : 'disabled'}>
                        Upgrade to Level ${escapeHtml(level + 1)}
                    </button>
                `;

                // Add click handler for tower upgrade
                const upgradeButton = towerCard.querySelector('.tower-upgrade-button');
                if (upgradeButton) {
                    upgradeButton.addEventListener('click', () => {
                        if (this.meditationState.upgradeTower(tower)) {
                            this.updateTowerList();
                            this.updateMeditationInventory();

                            // Try to use systems first, then window
                            if (this.uiManager && this.uiManager.systems.meditationTowers) {
                                this.uiManager.systems.meditationTowers.renderTowers();
                            } else if (window.meditationTowers) {
                                window.meditationTowers.renderTowers();
                            }
                        }
                    });
                }

                placedContent.appendChild(towerCard);
            }

            placedContainer.appendChild(placedHeader);
            placedContainer.appendChild(placedContent);
            this.towerList.appendChild(placedContainer);
        }
    }

    /**
     * Handle tower placement
     */
    handleTowerPlacement(towerId) {
        // Set selected tower in the tower system
        const towersSystem = (this.uiManager && this.uiManager.systems.meditationTowers) || window.meditationTowers;

        if (towersSystem) {
            towersSystem.setSelectedTower(towerId);
            console.info('Tower selected for placement:', towerId);

            // Add visual feedback
            const buttons = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.tower-place-button'));
            buttons.forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.towerId === towerId) {
                    btn.classList.add('selected');
                    btn.textContent = 'Selected - Click on grid';
                } else {
                    btn.textContent = 'Place Tower';
                }
            });
        } else {
            console.error('Meditation towers system not initialized');
        }
    }

    /**
     * Update meditation inventory
     */
    updateMeditationInventory() {
        if (!this.meditationInventoryList || !this.meditationState) return;

        this.meditationInventoryList.innerHTML = '';

        const inventory = this.meditationState.meditationInventory || {};
        const items = Object.entries(inventory)
            .filter(([_id, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1]);

        if (items.length === 0) {
            this.meditationInventoryList.innerHTML = '<div class="empty-message">No ingredients yet</div>';
            return;
        }

        for (const [ingId, amount] of items) {
            const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
            const displayName = ingredient ? ingredient.displayName : ingId;

            const itemCard = document.createElement('div');
            itemCard.className = 'card inventory-item-card';

            itemCard.innerHTML = `
                <div class="card-title">${escapeHtml(displayName)}</div>
                <div class="card-value">${formatShort(amount)}</div>
            `;

            this.meditationInventoryList.appendChild(itemCard);
        }
    }

    /**
     * Update meditation upgrades
     */
    updateMeditationUpgrades() {
        if (!this.meditationUpgradeList || !this.meditationState) return;

        this.meditationUpgradeList.innerHTML = '';

        // Filter unlocked upgrades
        const unlockedUpgrades = MEDITATION_UPGRADES.filter(upg => {
            if (upg.unlockAtFocus && this.meditationState.focusTotalEarned < upg.unlockAtFocus) {
                return false;
            }
            return true;
        });

        for (const upgData of unlockedUpgrades) {
            const owned = this.meditationState.meditationUpgrades[upgData.id] || false;
            const canAfford = this.meditationState.canAffordUpgrade(upgData);

            const upgCard = document.createElement('div');
            upgCard.className = `card upgrade-card ${canAfford && !owned ? 'can-afford' : 'cannot-afford'}`;

            const upgradeRecipeItems = Object.entries(upgData.recipe).map(([ingId, amount]) => {
                const have = this.meditationState.meditationInventory[ingId] || 0;
                const canAffordIng = have >= amount;
                return `<span class="recipe-item-inline ${canAffordIng ? 'can-afford' : 'cannot-afford'}">
                    ${escapeHtml(ingId)}: ${formatShort(have)}/${formatShort(amount)}
                </span>`;
            }).join('');

            upgCard.innerHTML = `
                <div class="card-title">${escapeHtml(upgData.displayName)} ${owned ? '✓' : ''}</div>
                <div class="card-description">${escapeHtml(upgData.description)}</div>
                <div class="card-section">
                    ${upgradeRecipeItems}
                </div>
                <button class="btn-primary upgrade-purchase-button" data-upgrade-id="${escapeHtml(upgData.id)}" ${owned || !canAfford ? 'disabled' : ''}>
                    ${escapeHtml(owned ? 'Owned' : 'Purchase')}
                </button>
            `;

            // Add click handler
            const button = upgCard.querySelector('.upgrade-purchase-button');
            if (button && !owned) {
                button.addEventListener('click', () => {
                    if (this.meditationState.purchaseMeditationUpgrade(upgData.id)) {
                        this.updateMeditationUpgrades();
                        this.updateMeditationInventory();
                    }
                });
            }

            this.meditationUpgradeList.appendChild(upgCard);
        }
    }

    /**
     * Update controls
     */
    updateControls() {
        if (!this.startButton || !this.endButton) return;

        const isActive = this.meditationState.activeSession;

        if (isActive) {
            this.startButton.style.display = 'none';
            this.endButton.style.display = 'inline-block';
        } else {
            this.startButton.style.display = 'inline-block';
            this.endButton.style.display = 'none';
        }
    }

    /**
     * Update meditation production bonus display
     */
    updateProductionBonus() {
        if (!this.meditationState) return;

        // Find or create production bonus display element in meditation header
        let bonusDisplay = document.getElementById('meditation-production-bonus');
        if (!bonusDisplay) {
            // Create bonus display in meditation header
            const header = document.querySelector('.meditation-header');
            if (header) {
                bonusDisplay = document.createElement('div');
                bonusDisplay.id = 'meditation-production-bonus';
                bonusDisplay.className = 'meditation-bonus-display';
                header.appendChild(bonusDisplay);
            } else {
                return; // Header not found
            }
        }

        // Calculate bonus
        const bonus = this.meditationState.getMeditationProductionBonus();
        const bonusPercent = ((bonus - 1.0) * 100).toFixed(1);

        // Update display - compact format
        bonusDisplay.innerHTML = `
            <div class="meditation-bonus-label">Focus Bonus</div>
            <div class="meditation-bonus-value">+${escapeHtml(bonusPercent)}%</div>
        `;
    }
}
