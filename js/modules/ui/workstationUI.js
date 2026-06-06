/**
 * WorkstationUI.js
 * Manages the rendering and updates of the Workstations tab.
 */

import { formatNumber } from '../../utils.js';
import { getTierSymbol, getTierAppropriateStyle, getWorkstationTier } from './uiHelpers.js';
import { PRODUCERS, UPGRADES, INGREDIENTS } from '../data/index.js';
import { Balance } from '../../utils.js';

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
        // console.info('updateWorkstationsTab called, gameState exists:', !!this.gameState);
        if (!this.gameState) {
            console.error('gameState not initialized in WorkstationUI');
            return;
        }

        const container = document.getElementById('workstation-list');
        if (!container) {
            // console.error('workstation-list container not found!');
            return;
        }
        // console.info('workstation-list container found, updating content...');

        // Ensure container is visible
        container.classList.add('workstation-list-container');
        // Styles moved to CSS

        // Filter unlocked workstations (with Air specialization unlock speed bonus)
        const unlockedWorkstations = PRODUCERS.filter(prod => {
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

        // Use traditional rendering
        this.updateTraditional(container, unlockedWorkstations);
    }

    // Traditional rendering function (used for small lists or as fallback)
    updateTraditional(container, unlockedWorkstations) {
        // Clear only cards, preserve search/filter UI
        // const searchContainer = container.parentElement?.querySelector('.search-filter-container');
        container.innerHTML = '';

        if (unlockedWorkstations.length === 0) {
            container.innerHTML = `
                <div class="empty-state-container">
                    <div class="empty-state-sigil" aria-hidden="true"></div>
                    <p class="empty-state-message">No workstations yet. Cast to gather essence and unlock the first preservation chamber.</p>
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
        const tiers = Object.keys(workstationsByTier).sort((a, b) => Number(b) - Number(a));

        for (const tier of tiers) {
            const tierNum = parseInt(tier, 10);
            const tierStyle = getTierAppropriateStyle(tierNum);
            const tierSymbol = getTierSymbol(tierNum); // Get tier symbol for colors

            // Create tier header if we have multiple tiers
            if (tiers.length > 1) {
                const tierHeader = document.createElement('div');
                tierHeader.className = 'tier-header';
                // Dynamic styles applied directly
                tierHeader.style.borderBottomColor = tierStyle.borderGlow;
                tierHeader.style.color = tierStyle.color;
                tierHeader.style.textShadow = tierStyle.textShadow;

                tierHeader.innerHTML = `
                    <span class="tier-symbol">${tierSymbol.symbol}</span>
                    <h3 class="tier-title">${tierNum === 0 ? 'Basic' : 'Tier ' + tierNum}</h3>
                `;

                // Apply font family programmatically
                const title = /** @type {HTMLElement} */ (tierHeader.querySelector('.tier-title'));
                if (title) title.style.fontFamily = tierStyle.fontFamily;

                container.appendChild(tierHeader);
            }

            // Render workstations for this tier
            for (const prodData of workstationsByTier[tier]) {
                const card = document.createElement('div');
                card.className = 'workstation-card card'; // Use both classes for compatibility
                card.dataset.id = prodData.id;
                card.dataset.tier = String(tierNum); // Store tier for CSS targeting

                // Always apply tier colors to the card border-left (the status indicator)
                // This makes workstations colorful regardless of design tier
                const tierSymbol = getTierSymbol(tierNum);
                card.style.borderLeftColor = tierSymbol.color;
                card.style.borderLeftWidth = '4px';
                
                // Apply tier styles to card (glows/shadows only if design tier allows)
                if (tierStyle.hasGlow) {
                    card.style.boxShadow = `0 0 15px ${tierStyle.borderGlow.replace('0.8', '0.2')}`;
                    card.style.borderColor = tierStyle.borderGlow.replace('0.8', '0.4');
                } else {
                    // Even without glow, use tier color for border
                    card.style.borderColor = tierSymbol.color;
                }

                const owned = this.gameState.workstations[prodData.id] || 0;
                
                // Validate recipe exists and has valid structure
                if (!prodData.recipe || typeof prodData.recipe !== 'object') {
                    console.warn(`Invalid recipe for workstation ${prodData.id}:`, prodData.recipe);
                    continue; // Skip this workstation
                }
                
                // Validate growth is a valid number
                const growth = Number(prodData.growth);
                if (isNaN(growth) || growth <= 0) {
                    console.warn(`Invalid growth for workstation ${prodData.id}:`, prodData.growth);
                    continue; // Skip this workstation
                }
                
                const cost = Balance ? Balance.scaledRecipe(prodData.recipe, owned, growth) : {};
                const canAfford = this.gameState.canAfford(cost);

                // Calculate production
                const production = {};
                // Base production - validate outputs exist
                if (prodData.outputs && typeof prodData.outputs === 'object') {
                    for (const [outputId, amount] of Object.entries(prodData.outputs)) {
                        // Validate amount is a valid number
                        const validAmount = Number(amount);
                        if (isNaN(validAmount) || !isFinite(validAmount)) {
                            console.warn(`Invalid output amount for ${prodData.id} -> ${outputId}:`, amount);
                            continue; // Skip this output
                        }
                        production[outputId] = (production[outputId] || 0) + (validAmount * owned);
                    }
                }

                // Apply inscription bonuses
                const inscriptionData = this.getInscriptionBonuses(prodData.id);
                const inscriptionMult = inscriptionData.multiplier;

                // Apply bonuses to production display
                for (const outputId in production) {
                    production[outputId] *= inscriptionMult;
                }

                // Format cost string - validate amounts before formatting
                let costHtml = '';
                for (const [ingId, amount] of Object.entries(cost)) {
                    // Validate amount is a valid number
                    const validAmount = Number(amount);
                    if (isNaN(validAmount) || !isFinite(validAmount) || validAmount < 0) {
                        console.warn(`Invalid cost amount for ${prodData.id} -> ${ingId}:`, amount);
                        continue; // Skip this cost item
                    }
                    
                    const ing = INGREDIENTS.find(i => i.id === ingId);
                    const userHas = this.gameState.inventory[ingId] || 0;
                    const canAffordIng = userHas >= validAmount;
                    costHtml += `
                        <div class="cost-item ${canAffordIng ? 'affordable' : 'unaffordable'}">
                            <span class="cost-amount">${formatNumber(validAmount)}</span>
                            <span class="cost-name">${ing ? ing.displayName : ingId}</span>
                        </div>
                    `;
                }

                // Format production string - validate amounts before formatting
                let productionHtml = '';
                if (owned > 0) {
                    productionHtml = '<div class="production-stats">';
                    for (const [outputId, amount] of Object.entries(production)) {
                        // Validate amount is a valid number
                        const validAmount = Number(amount);
                        if (isNaN(validAmount) || !isFinite(validAmount) || validAmount <= 0) {
                            console.warn(`Invalid production amount for ${prodData.id} -> ${outputId}:`, amount);
                            continue; // Skip this production item
                        }
                        
                        const ing = INGREDIENTS.find(i => i.id === outputId);
                        productionHtml += `
                            <div class="production-item">
                                <span class="prod-amount">+${formatNumber(validAmount)}/s</span>
                                <span class="prod-name">${ing ? ing.displayName : outputId}</span>
                            </div>
                        `;
                    }

                    // Show inscription bonus if active
                    if (inscriptionMult > 1.0) {
                        productionHtml += `
                            <div class="inscription-bonus">
                                <i class="fas fa-bolt"></i> ${formatNumber((inscriptionMult - 1) * 100)}% Bonus
                            </div>
                        `;
                    }

                    productionHtml += '</div>';
                }

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-title-row">
                            <h3 class="card-title">${prodData.displayName}</h3>
                            <span class="card-owned">Lv. ${formatNumber(owned)}</span>
                        </div>
                        ${prodData.description ? `<p class="card-desc">${prodData.description}</p>` : ''}
                    </div>
                    
                    ${productionHtml}
                    
                    <div class="card-actions">
                        <div class="cost-display">
                            ${costHtml}
                        </div>
                        <div class="button-group">
                            <button class="btn-craft" data-action="craft" data-ws-id="${prodData.id}" data-amount="1" ${!canAfford ? 'disabled aria-disabled="true" title="Insufficient essence for this workstation."' : ''}>
                                Craft
                            </button>
                            <button class="btn-craft-max" data-action="craft-max" data-ws-id="${prodData.id}" ${!canAfford ? 'disabled aria-disabled="true" title="Insufficient essence for this workstation."' : ''}>
                                Max
                            </button>
                        </div>
                    </div>
                `;

                // Apply dynamic styles programmatically - ALWAYS apply tier colors
                const cardTitle = /** @type {HTMLElement} */ (card.querySelector('.card-title'));
                if (cardTitle) {
                    // Always use tier color, not conditional on design tier
                    cardTitle.style.color = tierSymbol.color;
                    // Apply text shadow if design tier allows it
                    if (tierStyle.textShadow && tierStyle.textShadow !== 'none') {
                        cardTitle.style.textShadow = tierStyle.textShadow;
                    } else {
                        // Even without glow, use subtle shadow for readability
                        cardTitle.style.textShadow = `0 0 4px ${tierSymbol.color}`;
                    }
                    // Apply tier font family
                    if (tierStyle.fontFamily) {
                        cardTitle.style.fontFamily = tierStyle.fontFamily;
                    }
                }
                
                // Apply tier color to owned level badge
                const cardOwned = /** @type {HTMLElement} */ (card.querySelector('.card-owned'));
                if (cardOwned) {
                    cardOwned.style.color = tierSymbol.color;
                }

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
            const upgData = UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === 'global' && upgData.type === 'multiplier') {
                mult *= upgData.value;
                inscriptions.push({
                    name: upgData.displayName,
                    type: 'global',
                    multiplier: upgData.value
                });
            }
        }

        // Producer-specific upgrades
        const targetAffects = 'producer:' + workstationId;
        for (const upgId in this.gameState.upgradesOwned) {
            const upgData = UPGRADES.find(u => u.id === upgId);
            if (upgData && upgData.affects === targetAffects && upgData.type === 'multiplier') {
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
