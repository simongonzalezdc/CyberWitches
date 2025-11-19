/**
 * WorkstationUI.js
 * Manages the rendering and updates of the Workstations tab.
 */

import { formatTimeDuration, formatShort } from '../../utils.js';
import { getTierSymbol, getTierAppropriateStyle, getWorkstationTier } from './uiHelpers.js';

export class WorkstationUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.virtualWorkstationList = null;
    }

    /**
     * Update workstations tab with virtual scrolling for performance
     */
    update() {
        // console.log('updateWorkstationsTab called, gameState exists:', !!this.gameState);
        if (!this.gameState) {
            console.error('gameState not initialized in WorkstationUI');
            return;
        }

        const container = document.getElementById('workstation-list');
        if (!container) {
            // console.error('workstation-list container not found!');
            return;
        }
        // console.log('workstation-list container found, updating content...');

        // Ensure container is visible
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';
        container.style.visibility = 'visible';
        container.style.opacity = '1';

        // Filter unlocked workstations (with Air specialization unlock speed bonus)
        let unlockedWorkstations = window.PRODUCERS.filter(prod => {
            let unlockRequirement = prod.unlockAtAb;
            if (this.gameState.elementSpecialization === 'air' && this.gameState.specializationBonuses.unlockSpeedMult) {
                unlockRequirement *= this.gameState.specializationBonuses.unlockSpeedMult;
            }
            return this.gameState.ab >= unlockRequirement;
        });

        // Destroy existing virtual list if it exists
        if (this.virtualWorkstationList) {
            try {
                this.virtualWorkstationList.destroy();
            } catch (e) {
                console.error('Error destroying virtual workstation list:', e);
            }
            this.virtualWorkstationList = null;
        }

        // Create virtual list if there are many workstations
        // DISABLED: Virtual scroll causes items to disappear - using traditional rendering instead
        if (false && unlockedWorkstations.length > 10 && window.VirtualWorkstationList) {
            console.log('Using virtual scrolling for', unlockedWorkstations.length, 'workstations');
            try {
                this.virtualWorkstationList = new window.VirtualWorkstationList(container, unlockedWorkstations, this.gameState);
                // Force initial render after a short delay to ensure DOM is ready
                setTimeout(() => {
                    if (this.virtualWorkstationList && this.virtualWorkstationList._constructorComplete) {
                        console.log('Forcing virtual scroll initial render...');
                        // Force container to be visible first
                        container.style.display = 'flex';
                        container.style.flexDirection = 'column';
                        container.style.visibility = 'visible';
                        container.style.opacity = '1';
                        container.style.minHeight = '400px';
                        // Force a reflow
                        void container.offsetHeight;
                        this.virtualWorkstationList.updateContainerHeight();
                        this.virtualWorkstationList.renderVisibleItems();

                        // Verify items were rendered - if not, fall back to traditional
                        setTimeout(() => {
                            const viewport = container.querySelector('.virtual-scroll-viewport');
                            const renderedItems = viewport ? viewport.children.length : 0;

                            if (renderedItems === 0) {
                                console.warn('Virtual scroll rendered 0 items, falling back to traditional rendering');
                                if (this.virtualWorkstationList) {
                                    try {
                                        this.virtualWorkstationList.destroy();
                                    } catch (e) {
                                        console.error('Error destroying virtual scroll:', e);
                                    }
                                    this.virtualWorkstationList = null;
                                }
                                // Fall back to traditional rendering
                                container.innerHTML = '';
                                this.updateTraditional(container, unlockedWorkstations);
                            }
                        }, 200);
                    }
                }, 100);
            } catch (e) {
                console.error('Error creating virtual workstation list:', e);
                // Fall back to traditional rendering
                container.innerHTML = '';
                console.log('Falling back to traditional rendering due to error');
                this.updateTraditional(container, unlockedWorkstations);
            }
        } else {
            // Use traditional rendering for small lists
            this.updateTraditional(container, unlockedWorkstations);
        }
    }

    // Traditional rendering function (used for small lists or as fallback)
    updateTraditional(container, unlockedWorkstations) {
        // Clear only cards, preserve search/filter UI
        // const searchContainer = container.parentElement?.querySelector('.search-filter-container');
        container.innerHTML = '';

        if (unlockedWorkstations.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
                    <picture>
                        <source srcset="images/ui/empty-state.webp" type="image/webp">
                        <img src="images/ui/empty-state.png" alt="Empty State" class="empty-state-illustration" style="max-width: 400px; width: 100%; height: auto; margin-bottom: 20px; opacity: 0.8;">
                    </picture>
                    <p class="empty-state-message" style="color: var(--text-dim); font-size: 18px;">No workstations yet. Cast spells to unlock them!</p>
                </div>
            `;
            return;
        }

        // Group workstations by tier
        const workstationsByTier = {};
        for (const prodData of unlockedWorkstations) {
            const tier = getWorkstationTier(prodData);
            if (!workstationsByTier[tier]) {
                workstationsByTier[tier] = [];
            }
            workstationsByTier[tier].push(prodData);
        }

        // Render by tier
        // Sort tiers descending (highest tier first)
        const tiers = Object.keys(workstationsByTier).sort((a, b) => b - a);

        for (const tier of tiers) {
            const tierNum = parseInt(tier);
            const tierStyle = getTierAppropriateStyle(tierNum);
            const tierSymbol = getTierSymbol(tierNum);

            // Create tier header if we have multiple tiers
            if (tiers.length > 1) {
                const tierHeader = document.createElement('div');
                tierHeader.className = 'tier-header';
                tierHeader.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 20px 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid ${tierStyle.borderGlow};
                    color: ${tierStyle.color};
                    text-shadow: ${tierStyle.textShadow};
                `;
                tierHeader.innerHTML = `
                    <span style="font-size: 24px;">${tierSymbol.symbol}</span>
                    <h3 style="margin: 0; font-family: ${tierStyle.fontFamily};">Tier ${tierNum}</h3>
                `;
                container.appendChild(tierHeader);
            }

            // Render workstations for this tier
            for (const prodData of workstationsByTier[tier]) {
                const card = document.createElement('div');
                card.className = 'workstation-card';
                card.dataset.id = prodData.id;

                // Apply tier styles to card
                if (tierStyle.hasGlow) {
                    card.style.boxShadow = `0 0 15px ${tierStyle.borderGlow.replace('0.8', '0.2')}`;
                    card.style.border = `1px solid ${tierStyle.borderGlow.replace('0.8', '0.4')}`;
                }

                const owned = this.gameState.workstations[prodData.id] || 0;
                const cost = window.Balance ? window.Balance.scaledRecipe(prodData.recipe, owned, prodData.growth) : {};
                const canAfford = this.gameState.canAfford(cost);

                // Calculate production
                const production = {};
                let totalProduction = 0;

                // Base production
                for (const [outputId, amount] of Object.entries(prodData.outputs)) {
                    production[outputId] = (production[outputId] || 0) + (amount * owned);
                    totalProduction += amount * owned;
                }

                // Apply inscription bonuses
                const inscriptionData = this.getInscriptionBonuses(prodData.id);
                const inscriptionMult = inscriptionData.multiplier;

                // Apply bonuses to production display
                for (const outputId in production) {
                    production[outputId] *= inscriptionMult;
                }

                // Format cost string
                let costHtml = '';
                for (const [ingId, amount] of Object.entries(cost)) {
                    const ing = window.INGREDIENTS.find(i => i.id === ingId);
                    const userHas = this.gameState.inventory[ingId] || 0;
                    const canAffordIng = userHas >= amount;
                    costHtml += `
                        <div class="cost-item ${canAffordIng ? 'affordable' : 'unaffordable'}">
                            <span class="cost-amount">${window.formatNumber(amount)}</span>
                            <span class="cost-name">${ing ? ing.displayName : ingId}</span>
                        </div>
                    `;
                }

                // Format production string
                let productionHtml = '';
                if (owned > 0) {
                    productionHtml = '<div class="production-stats">';
                    for (const [outputId, amount] of Object.entries(production)) {
                        if (amount > 0) {
                            const ing = window.INGREDIENTS.find(i => i.id === outputId);
                            productionHtml += `
                                <div class="production-item">
                                    <span class="prod-amount">+${window.formatNumber(amount)}/s</span>
                                    <span class="prod-name">${ing ? ing.displayName : outputId}</span>
                                </div>
                            `;
                        }
                    }

                    // Show inscription bonus if active
                    if (inscriptionMult > 1.0) {
                        productionHtml += `
                            <div class="inscription-bonus" style="color: var(--accent); font-size: 0.8em; margin-top: 4px;">
                                <i class="fas fa-bolt"></i> ${window.formatNumber((inscriptionMult - 1) * 100)}% Bonus
                            </div>
                        `;
                    }

                    productionHtml += '</div>';
                }

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-title-row">
                            <h3 class="card-title" style="color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}">${prodData.displayName}</h3>
                            <span class="card-owned">Lv. ${window.formatNumber(owned)}</span>
                        </div>
                        <p class="card-desc">${prodData.description}</p>
                    </div>
                    
                    ${productionHtml}
                    
                    <div class="card-actions">
                        <div class="cost-display">
                            ${costHtml}
                        </div>
                        <div class="button-group">
                            <button class="btn-craft" data-action="craft" data-ws-id="${prodData.id}" data-amount="1" ${!canAfford ? 'disabled' : ''}>
                                Craft
                            </button>
                            <button class="btn-craft-max" data-action="craft-max" data-ws-id="${prodData.id}" ${!canAfford ? 'disabled' : ''}>
                                Max
                            </button>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            }
        }
    }

    /**
     * Get inscription bonuses for a workstation (only inscriptions, not buffs/prestige)
     */
    getInscriptionBonuses(workstationId) {
        let mult = 1.0;
        const inscriptions = [];

        // Global upgrades
        for (const upgId in this.gameState.upgradesOwned) {
            const upgData = window.UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === "global" && upgData.type === "multiplier") {
                mult *= upgData.value;
                inscriptions.push({
                    name: upgData.displayName,
                    type: 'global',
                    multiplier: upgData.value
                });
            }
        }

        // Producer-specific upgrades
        const targetAffects = "producer:" + workstationId;
        for (const upgId in this.gameState.upgradesOwned) {
            const upgData = window.UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === targetAffects && upgData.type === "multiplier") {
                mult *= upgData.value;
                inscriptions.push({
                    name: upgData.displayName,
                    type: 'workstation',
                    multiplier: upgData.value
                });
            }
        }

        return { multiplier: mult, inscriptions };
    }
}
