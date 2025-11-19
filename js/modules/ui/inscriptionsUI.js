/**
 * InscriptionsUI.js
 * Manages the rendering and updates of the Inscriptions (Upgrades) tab.
 */

import { getTierSymbol, getTierAppropriateStyle, stripEmojisIfLowTier, getUpgradeTier } from './uiHelpers.js';

export class InscriptionsUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.virtualUpgradeList = null;
    }

    /**
     * Update inscriptions tab with optimized rendering
     */
    update() {
        // console.log('updateInscriptionsTab called, gameState exists:', !!this.gameState);
        if (!this.gameState) {
            console.error('gameState not initialized in InscriptionsUI');
            return;
        }

        const container = document.getElementById('upgrade-list');
        if (!container) {
            // console.error('upgrade-list container not found!');
            return;
        }
        // console.log('upgrade-list container found, updating content...');

        // Ensure container is visible
        container.style.display = 'flex';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';

        // Filter unlocked upgrades
        let unlockedUpgrades = window.UPGRADES.filter(upg => {
            let unlockRequirement = upg.unlockAtAb;
            if (this.gameState.elementSpecialization === 'air' && this.gameState.specializationBonuses.unlockSpeedMult) {
                unlockRequirement *= this.gameState.specializationBonuses.unlockSpeedMult;
            }
            return this.gameState.ab >= unlockRequirement;
        });

        // Hide focus upgrades until meditation is unlocked
        const isMeditationUnlocked = this.gameState.prestigeCount >= 1;
        if (!isMeditationUnlocked) {
            unlockedUpgrades = unlockedUpgrades.filter(upg =>
                !upg.id.includes('focus') && !upg.affects.includes('focus')
            );
        }

        // Destroy existing virtual list if it exists
        if (this.virtualUpgradeList) {
            try {
                this.virtualUpgradeList.destroy();
            } catch (e) {
                console.error('Error destroying virtual upgrade list:', e);
            }
            this.virtualUpgradeList = null;
        }

        // Create virtual list if there are many upgrades
        // DISABLED: Virtual scroll causes items to disappear - using traditional rendering instead
        if (false && unlockedUpgrades.length > 10 && window.VirtualUpgradeList) {
            console.log('Using virtual scrolling for', unlockedUpgrades.length, 'upgrades');
            try {
                this.virtualUpgradeList = new window.VirtualUpgradeList(container, unlockedUpgrades, this.gameState);
                // Force initial render after a short delay to ensure DOM is ready
                setTimeout(() => {
                    if (this.virtualUpgradeList && this.virtualUpgradeList._constructorComplete) {
                        console.log('Forcing virtual scroll initial render for upgrades...');
                        // Force container to be visible first
                        container.style.display = 'flex';
                        container.style.flexDirection = 'column';
                        container.style.visibility = 'visible';
                        container.style.opacity = '1';
                        container.style.minHeight = '400px';
                        // Force a reflow
                        void container.offsetHeight;
                        this.virtualUpgradeList.updateContainerHeight();
                        this.virtualUpgradeList.renderVisibleItems();

                        // Verify items were rendered - if not, fall back to traditional
                        setTimeout(() => {
                            const viewport = container.querySelector('.virtual-scroll-viewport');
                            const renderedItems = viewport ? viewport.children.length : 0;
                            // console.log('Virtual scroll rendered items check:', renderedItems, 'expected at least:', Math.ceil(400 / 200));

                            if (renderedItems === 0) {
                                console.warn('Virtual scroll rendered 0 items, falling back to traditional rendering');
                                if (this.virtualUpgradeList) {
                                    try {
                                        this.virtualUpgradeList.destroy();
                                    } catch (e) {
                                        console.error('Error destroying virtual scroll:', e);
                                    }
                                    this.virtualUpgradeList = null;
                                }
                                // Fall back to traditional rendering
                                container.innerHTML = '';
                                this.updateTraditional(container, unlockedUpgrades);
                            }
                        }, 200);
                    }
                }, 100);
            } catch (e) {
                console.error('Error creating virtual upgrade list:', e);
                // Fall back to traditional rendering
                container.innerHTML = '';
                console.log('Falling back to traditional rendering due to error');
                this.updateTraditional(container, unlockedUpgrades);
            }
        } else {
            // Use traditional rendering for small lists
            this.updateTraditional(container, unlockedUpgrades);
        }
    }

    // Traditional rendering function for inscriptions (used for small lists or as fallback)
    updateTraditional(container, unlockedUpgrades) {
        container.innerHTML = '';

        // Group upgrades by tier
        const upgradesByTier = {};
        for (const upgData of unlockedUpgrades) {
            const tier = getUpgradeTier(upgData);
            if (!upgradesByTier[tier]) {
                upgradesByTier[tier] = [];
            }
            upgradesByTier[tier].push(upgData);
        }

        // Render upgrades grouped by tier
        for (let tier = 0; tier <= 5; tier++) {
            if (!upgradesByTier[tier] || upgradesByTier[tier].length === 0) {
                continue;
            }

            // Add tier header with tier symbol
            const tierSymbol = getTierSymbol(tier);
            const tierStyle = getTierAppropriateStyle(tier);
            const tierHeader = document.createElement('div');
            tierHeader.className = 'tier-header';
            tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; margin-right: 8px; font-size: 20px;">${tierSymbol.symbol}</span> Tier ${tier}`;
            container.appendChild(tierHeader);

            // Render upgrades for this tier
            for (const upgData of upgradesByTier[tier]) {
                const owned = this.gameState.upgradesOwned[upgData.id] || false;

                const card = document.createElement('div');
                card.className = 'card';
                card.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';

                let effectText = '';
                if (upgData.affects === 'global') {
                    effectText = `Global ${upgData.type} ×${upgData.value}`;
                } else if (upgData.affects.startsWith('producer:')) {
                    const wsId = upgData.affects.split(':')[1];
                    effectText = `${wsId} ${upgData.type} ×${upgData.value}`;
                } else if (upgData.affects === 'click') {
                    effectText = `Click ${upgData.type} +${upgData.value}`;
                }

                // Check if can afford all materials
                let canAffordAll = true;
                if (!owned && upgData.recipe) {
                    for (const [ingId, amount] of Object.entries(upgData.recipe)) {
                        const have = this.gameState.inventory[ingId] || 0;
                        if (have < amount) {
                            canAffordAll = false;
                            break;
                        }
                    }
                }

                card.innerHTML = `
                    <div class="card-title">${upgData.displayName} ${owned ? stripEmojisIfLowTier('✓') : ''}</div>
                    <div class="card-description">${upgData.description}</div>
                    <div class="card-section">
                        <div class="card-label">${effectText}</div>
                    </div>
                    <div class="card-section">
                        <div class="card-label">Cost:</div>
                        ${Object.entries(upgData.recipe).map(([ingId, amount]) => {
                    const have = this.gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    const ingredient = window.INGREDIENTS.find(ing => ing.id === ingId);
                    const displayName = ingredient?.displayName || ingId;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                                <span class="recipe-label">${displayName}:</span>
                                <span class="recipe-numbers">${window.formatShort(have)} / ${window.formatShort(amount)}</span>
                            </div>`;
                }).join('')}
                    </div>
                    <button class="btn-primary" data-action="inscribe" data-upgrade-id="${upgData.id}" ${owned || !canAffordAll ? 'disabled' : ''}>
                        ${owned ? 'Owned' : 'Inscribe'}
                    </button>
                `;

                // Attach event listener directly - always attach handler, check conditions inside
                const button = card.querySelector('button[data-action="inscribe"]');
                if (button) {
                    // Ensure button is visible and clickable
                    button.style.position = 'relative';
                    button.style.zIndex = '100';

                    // Properly manage disabled state - remove disabled attribute if we can afford it
                    if (owned || !canAffordAll) {
                        button.disabled = true;
                        button.style.pointerEvents = 'none';
                        button.style.cursor = 'not-allowed';
                        button.style.opacity = '0.6';
                    } else {
                        button.disabled = false;
                        button.style.pointerEvents = 'auto';
                        button.style.cursor = 'pointer';
                        button.style.opacity = '1';
                    }

                    button.style.visibility = 'visible';
                    button.style.display = 'inline-block';

                    // Always attach handler - it will check if it can execute
                    if (typeof window.inscribeUpgrade === 'function') {
                        button.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // Re-check conditions dynamically at click time (don't rely on closure variables)
                            if (!this.gameState) {
                                console.error('gameState not available');
                                return;
                            }

                            const currentOwned = this.gameState.upgradesOwned[upgData.id] || false;
                            if (currentOwned) {
                                console.log('Inscribe button: Already owned:', { upgId: upgData.id });
                                return;
                            }

                            // Re-check if we can afford all materials
                            let currentCanAffordAll = true;
                            if (upgData.recipe) {
                                for (const [ingId, amount] of Object.entries(upgData.recipe)) {
                                    const have = this.gameState.inventory[ingId] || 0;
                                    if (have < amount) {
                                        currentCanAffordAll = false;
                                        console.log('Inscribe button: Cannot afford:', { ingId, have, needed: amount });
                                        break;
                                    }
                                }
                            }

                            if (!currentCanAffordAll || button.disabled) {
                                console.log('Inscribe button disabled:', { currentCanAffordAll, disabled: button.disabled, upgId: upgData.id });
                                return;
                            }

                            console.log('Inscribe button clicked:', { upgId: upgData.id, button });
                            window.inscribeUpgrade(upgData.id, button);
                        });
                    }
                }

                container.appendChild(card);
                // console.log('Added upgrade card to container, total children:', container.children.length);
            }
        }
        // console.log('Finished rendering upgrades, container now has', container.children.length, 'children');
    }

}

