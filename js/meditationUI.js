import { MEDITATION_TOWERS, MEDITATION_UPGRADES, INGREDIENTS } from './data.js';
import { formatShort, formatPrecise } from './utils.js';

/**
 * Meditation UI Manager - Handles rendering of meditation mode UI
 */
export class MeditationUI {
    constructor(meditationState, gameState) {
        this.meditationState = meditationState;
        this.gameState = gameState;
        
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
            if (typeof window.updateDailyProgress === 'function') {
                window.updateDailyProgress('earn_focus', '', this.meditationState.focusTotalEarned);
            }
        };
        
        this.meditationState.onTranquilityChanged = () => {
            this.updateTranquilityDisplay();
        };
        
        this.meditationState.onWaveChanged = (wave) => {
            this.updateWaveDisplay();
            // Track meditation waves for daily tasks
            if (typeof window.updateDailyProgress === 'function') {
                window.updateDailyProgress('meditation_waves', '', wave);
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
    updateAll() {
        this.updateFocusDisplay();
        this.updateFocuspsDisplay();
        this.updateTranquilityDisplay();
        this.updateWaveDisplay();
        this.updateTowerList();
        this.updateMeditationInventory();
        this.updateMeditationUpgrades();
        this.updateControls();
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
            this.tranquilityDisplay.textContent = Math.floor(this.meditationState.tranquility);
        }
        if (this.tranquilityMaxDisplay && this.meditationState) {
            this.tranquilityMaxDisplay.textContent = Math.floor(this.meditationState.tranquilityMax);
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
     * Update tower list
     */
    updateTowerList() {
        if (!this.towerList || !this.meditationState) return;
        
        this.towerList.innerHTML = '';
        
        // Group towers by tier
        const towersByTier = {};
        for (const tower of MEDITATION_TOWERS) {
            if (!towersByTier[tower.tier]) {
                towersByTier[tower.tier] = [];
            }
            towersByTier[tower.tier].push(tower);
        }
        
        // Render towers by tier
        for (let tier = 0; tier <= 4; tier++) {
            if (!towersByTier[tier] || towersByTier[tier].length === 0) continue;
            
            // Add tier header
            const tierHeader = document.createElement('div');
            tierHeader.className = 'tier-header';
            tierHeader.textContent = `Tier ${tier} Towers`;
            this.towerList.appendChild(tierHeader);
            
            // Render towers for this tier
            for (const towerData of towersByTier[tier]) {
                const canAfford = this.meditationState.canAffordTower(towerData);
                
                const towerCard = document.createElement('div');
                towerCard.className = `card tower-card ${canAfford ? 'can-afford' : 'cannot-afford'}`;
                
                towerCard.innerHTML = `
                    <div class="card-title">${towerData.displayName}</div>
                    <div class="card-description">
                        Damage: ${towerData.damage} | Range: ${towerData.range} | Speed: ${towerData.attackSpeed.toFixed(2)}/s
                    </div>
                    <div class="card-section">
                        <div class="card-label">Recipe:</div>
                        ${Object.entries(towerData.recipe).map(([ingId, amount]) => {
                            const have = this.gameState.inventory[ingId] || 0;
                            const canAffordIng = have >= amount;
                            const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                            const displayName = ingredient ? ingredient.displayName : ingId;
                            return `<div class="recipe-item ${canAffordIng ? 'can-afford' : 'cannot-afford'}">
                                ${displayName}: ${formatShort(have)} / ${formatShort(amount)}
                            </div>`;
                        }).join('')}
                    </div>
                    <button class="btn-primary tower-place-button" data-tower-id="${towerData.id}" ${canAfford ? '' : 'disabled'}>
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
        }
    }
    
    /**
     * Handle tower placement
     */
    handleTowerPlacement(towerId) {
        // Set selected tower in the tower system
        if (window.meditationTowers) {
            window.meditationTowers.setSelectedTower(towerId);
            console.log('Tower selected for placement:', towerId);
            
            // Add visual feedback
            const buttons = document.querySelectorAll('.tower-place-button');
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
            .filter(([id, amount]) => amount > 0)
            .sort((a, b) => b[1] - a[1]);
        
        if (items.length === 0) {
            this.meditationInventoryList.innerHTML = '<div class="empty-message">No meditation ingredients</div>';
            return;
        }
        
        for (const [ingId, amount] of items) {
            const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
            const displayName = ingredient ? ingredient.displayName : ingId;
            
            const itemCard = document.createElement('div');
            itemCard.className = 'card inventory-item-card';
            
            itemCard.innerHTML = `
                <div class="card-title">${displayName}</div>
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
            
            upgCard.innerHTML = `
                <div class="card-title">${upgData.displayName} ${owned ? '✓' : ''}</div>
                <div class="card-description">${upgData.description}</div>
                <div class="card-section">
                    <div class="card-label">Recipe:</div>
                    ${Object.entries(upgData.recipe).map(([ingId, amount]) => {
                        const have = this.meditationState.meditationInventory[ingId] || 0;
                        const canAffordIng = have >= amount;
                        return `<div class="recipe-item ${canAffordIng ? 'can-afford' : 'cannot-afford'}">
                            ${ingId}: ${formatShort(have)} / ${formatShort(amount)}
                        </div>`;
                    }).join('')}
                </div>
                <button class="btn-primary upgrade-purchase-button" data-upgrade-id="${upgData.id}" ${owned || !canAfford ? 'disabled' : ''}>
                    ${owned ? 'Owned' : 'Purchase'}
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
}

