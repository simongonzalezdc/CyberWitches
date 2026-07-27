/**
 * WorkstationUI.js
 * Manages the rendering and updates of the Workstations tab.
 */

import { formatNumber, escapeHtml } from '../../utils.js';
import { getTierSymbol, getTierAppropriateStyle, getWorkstationTier } from './uiHelpers.js';
import { PRODUCERS, UPGRADES, INGREDIENTS } from '../data/index.js';
import { Balance } from '../../utils.js';
import { accessibilityManager } from '../../accessibility.js';

export class WorkstationUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.virtualWorkstationList = null;
        this.lastRenderSignature = '';
        this.hasLoaded = false;
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

        // Show skeleton only on the very first call when container is empty.
        // Once we've rendered at least once, skip straight to content.
        if (!this.hasLoaded && container.childElementCount === 0) {
            container.innerHTML = this.renderSkeleton();
            // Don't return — fall through to render real content immediately
            // so the skeleton is visible only until the first render completes.
        }

        // Filter unlocked workstations (with Air specialization unlock speed bonus)
        const unlockedWorkstations = PRODUCERS.filter(prod => {
            let unlockRequirement = prod.unlockAtAb;
            if (this.gameState.elementSpecialization === 'air' && this.gameState.specializationBonuses.unlockSpeedMult) {
                unlockRequirement *= this.gameState.specializationBonuses.unlockSpeedMult;
            }
            return this.gameState.ab >= unlockRequirement;
        });

        const renderSignature = this.createRenderSignature(unlockedWorkstations);
        if (renderSignature === this.lastRenderSignature && container.childElementCount > 0) {
            return;
        }

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
        this.lastRenderSignature = renderSignature;
        this.hasLoaded = true;

        // Apply background images to all existing cards (covers cached DOM from prior sessions)
        this.applyWorkstationBackgrounds(container);
    }

    /**
     * Apply background images to all workstation cards in the container.
     * Called after every update to ensure backgrounds are set even when
     * cards are not re-created (render signature unchanged).
     */
    applyWorkstationBackgrounds(container) {
        const wsBgImages = {
            'ws_fire_forge': 'images/backgrounds/fire-forge.jpg',
            'ws_digcandle_forge': 'images/backgrounds/fire-forge.jpg',
            'ws_enhanced_candle_forge': 'images/backgrounds/fire-forge.jpg',
            'ws_quantum_candle_forge': 'images/backgrounds/fire-forge.jpg',
            'ws_arcane_candle_forge': 'images/backgrounds/fire-forge.jpg',
            'ws_aqua_well': 'images/backgrounds/aqua-well.jpg',
            'ws_aqua_well_t1': 'images/backgrounds/aqua-well.jpg',
            'ws_flowing_current_well': 'images/backgrounds/aqua-well.jpg',
            'ws_quantum_water_well': 'images/backgrounds/aqua-well.jpg',
            'ws_void_liquid_well': 'images/backgrounds/aqua-well.jpg',
            'ws_zephyr_generator': 'images/backgrounds/zephyr-generator.jpg',
            'ws_zephyr_generator_t1': 'images/backgrounds/zephyr-generator.jpg',
            'ws_wind_spiral_generator': 'images/backgrounds/zephyr-generator.jpg',
            'ws_quantum_air_generator': 'images/backgrounds/zephyr-generator.jpg',
            'ws_void_breath_generator': 'images/backgrounds/zephyr-generator.jpg',
            'ws_crystal_chamber': 'images/backgrounds/crystal-chamber.jpg',
            'ws_crystal_chamber_t1': 'images/backgrounds/crystal-chamber.jpg',
            'ws_crystal_core_chamber': 'images/backgrounds/crystal-chamber.jpg',
            'ws_quantum_crystal_chamber': 'images/backgrounds/crystal-chamber.jpg',
            'ws_void_crystal_chamber': 'images/backgrounds/crystal-chamber.jpg',
            'ws_resonance_crystallizer': 'images/backgrounds/crystal-chamber.jpg',
            'ws_aether_synthesizer': 'images/backgrounds/aether-synthesizer.jpg',
            'ws_aether_reactor_t1': 'images/backgrounds/aether-synthesizer.jpg',
            'ws_aether_fusion_chamber': 'images/backgrounds/aether-synthesizer.jpg',
            'ws_harmonic_stabilizer': 'images/backgrounds/aether-synthesizer.jpg',
            'ws_arcane_bit_reactor': 'images/backgrounds/aether-synthesizer.jpg',
            'ws_etheric_bit_reactor': 'images/backgrounds/aether-synthesizer.jpg',
            'ws_infinity_bit_reactor': 'images/backgrounds/aether-synthesizer.jpg'
        };
        const cards = container.querySelectorAll('.workstation-card');
        for (const card of cards) {
            const id = card.dataset.id;
            const bgUrl = wsBgImages[id];
            if (bgUrl && !card.style.backgroundImage) {
                card.style.backgroundImage = `linear-gradient(to right, rgba(16,18,32,0.92) 0%, rgba(16,18,32,0.75) 50%, rgba(16,18,32,0.55) 100%), url('${bgUrl}')`;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center right';
            }
        }
    }

    createRenderSignature(unlockedWorkstations) {
        return unlockedWorkstations.map((prodData) => {
            const owned = this.gameState.workstations[prodData.id] || 0;
            const growth = Number(prodData.growth);
            const cost = prodData.recipe && !isNaN(growth) && growth > 0
                ? (Balance ? Balance.scaledRecipe(prodData.recipe, owned, growth) : {})
                : {};
            const costSignature = Object.entries(cost)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([ingId, amount]) => `${ingId}:${amount}`)
                .join(',');
            const canAfford = this.gameState.canAfford(cost) ? '1' : '0';
            const inscriptionMult = this.getInscriptionBonuses(prodData.id).multiplier;
            return `${prodData.id}:${owned}:${canAfford}:${costSignature}:${inscriptionMult}`;
        }).join('|');
    }

    // Traditional rendering function (used for small lists or as fallback)
    updateTraditional(container, unlockedWorkstations) {
        // Clear only cards, preserve search/filter UI
        // const searchContainer = container.parentElement?.querySelector('.search-filter-container');
        container.innerHTML = '';

        if (unlockedWorkstations.length === 0) {
            container.innerHTML = this.renderEmptyState({
                totalItems: PRODUCERS.length,
                unlockedItems: 0,
                firstActionHint: 'COMPILE ESSENCE TO INSTALL MODULES'
            });
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
            // Background image mapping for workstation cards (all variants → base art)
            const wsBgImages = {
                // Fire
                'ws_fire_forge': 'images/backgrounds/fire-forge.jpg',
                'ws_digcandle_forge': 'images/backgrounds/fire-forge.jpg',
                'ws_enhanced_candle_forge': 'images/backgrounds/fire-forge.jpg',
                'ws_quantum_candle_forge': 'images/backgrounds/fire-forge.jpg',
                'ws_arcane_candle_forge': 'images/backgrounds/fire-forge.jpg',
                // Water
                'ws_aqua_well': 'images/backgrounds/aqua-well.jpg',
                'ws_aqua_well_t1': 'images/backgrounds/aqua-well.jpg',
                'ws_flowing_current_well': 'images/backgrounds/aqua-well.jpg',
                'ws_quantum_water_well': 'images/backgrounds/aqua-well.jpg',
                'ws_void_liquid_well': 'images/backgrounds/aqua-well.jpg',
                // Air
                'ws_zephyr_generator': 'images/backgrounds/zephyr-generator.jpg',
                'ws_zephyr_generator_t1': 'images/backgrounds/zephyr-generator.jpg',
                'ws_wind_spiral_generator': 'images/backgrounds/zephyr-generator.jpg',
                'ws_quantum_air_generator': 'images/backgrounds/zephyr-generator.jpg',
                'ws_void_breath_generator': 'images/backgrounds/zephyr-generator.jpg',
                // Crystal
                'ws_crystal_chamber': 'images/backgrounds/crystal-chamber.jpg',
                'ws_crystal_chamber_t1': 'images/backgrounds/crystal-chamber.jpg',
                'ws_crystal_core_chamber': 'images/backgrounds/crystal-chamber.jpg',
                'ws_quantum_crystal_chamber': 'images/backgrounds/crystal-chamber.jpg',
                'ws_void_crystal_chamber': 'images/backgrounds/crystal-chamber.jpg',
                'ws_resonance_crystallizer': 'images/backgrounds/crystal-chamber.jpg',
                // Aether
                'ws_aether_synthesizer': 'images/backgrounds/aether-synthesizer.jpg',
                'ws_aether_reactor_t1': 'images/backgrounds/aether-synthesizer.jpg',
                'ws_aether_fusion_chamber': 'images/backgrounds/aether-synthesizer.jpg',
                'ws_harmonic_stabilizer': 'images/backgrounds/aether-synthesizer.jpg',
                'ws_arcane_bit_reactor': 'images/backgrounds/aether-synthesizer.jpg',
                'ws_etheric_bit_reactor': 'images/backgrounds/aether-synthesizer.jpg',
                'ws_infinity_bit_reactor': 'images/backgrounds/aether-synthesizer.jpg'
            };

            for (const prodData of workstationsByTier[tier]) {
                const card = document.createElement('div');
                card.className = 'workstation-card card'; // Use both classes for compatibility
                card.dataset.id = prodData.id;
                card.dataset.tier = String(tierNum); // Store tier for CSS targeting

                // Apply background image if available
                const bgUrl = wsBgImages[prodData.id];
                if (bgUrl) {
                    card.style.backgroundImage = `linear-gradient(to right, rgba(16,18,32,0.92) 0%, rgba(16,18,32,0.75) 50%, rgba(16,18,32,0.55) 100%), url('${bgUrl}')`;
                    card.style.backgroundSize = 'cover';
                    card.style.backgroundPosition = 'center right';
                }

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

                // Generate specific disabled reason
                const disabledReason = canAfford ? '' : this.generateDisabledReason(cost);

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
                            <span class="cost-amount">${escapeHtml(formatNumber(validAmount))}</span>
                            <span class="cost-name">${escapeHtml(ing ? ing.displayName : ingId)}</span>
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
                                <span class="prod-amount">+${escapeHtml(formatNumber(validAmount))}/s</span>
                                <span class="prod-name">${escapeHtml(ing ? ing.displayName : outputId)}</span>
                            </div>
                        `;
                    }

                    // Show inscription bonus if active
                    if (inscriptionMult > 1.0) {
                        productionHtml += `
                            <div class="inscription-bonus">
                                <span class="css-icon-bolt" aria-hidden="true"></span> ${escapeHtml(formatNumber((inscriptionMult - 1) * 100))}% Bonus
                            </div>
                        `;
                    }

                    productionHtml += '</div>';
                }

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-title-row">
                            <h3 class="card-title">${escapeHtml(prodData.displayName)}</h3>
                            <span class="card-owned">Lv. ${escapeHtml(formatNumber(owned))}</span>
                        </div>
                        ${prodData.description ? `<p class="card-desc">${escapeHtml(prodData.description)}</p>` : ''}
                    </div>

                    ${productionHtml}

                    <div class="card-actions">
                        <div class="cost-display">
                            ${costHtml}
                        </div>
                        <div class="button-group">
                            <button class="btn-craft" data-action="craft" data-ws-id="${escapeHtml(prodData.id)}" data-amount="1" ${!canAfford ? `disabled aria-disabled="true" data-disabled-reason="${escapeHtml(disabledReason)}"` : ''} aria-describedby="${!canAfford ? `craft-disabled-${escapeHtml(prodData.id)}` : ''}">
                                Craft
                            </button>
                            <button class="btn-craft-max" data-action="craft-max" data-ws-id="${escapeHtml(prodData.id)}" ${!canAfford ? `disabled aria-disabled="true" data-disabled-reason="${escapeHtml(disabledReason)}"` : ''} aria-describedby="${!canAfford ? `craft-disabled-${escapeHtml(prodData.id)}` : ''}">
                                Max
                            </button>
                            ${!canAfford ? `<span id="craft-disabled-${escapeHtml(prodData.id)}" class="sr-only">${escapeHtml(disabledReason)}</span>` : ''}
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

    /**
     * Generate a specific disabled reason message for craft buttons
     */
    generateDisabledReason(cost) {
        const missingItems = [];
        for (const [ingId, amount] of Object.entries(cost)) {
            const userHas = this.gameState.inventory[ingId] || 0;
            if (userHas < amount) {
                const ing = INGREDIENTS.find(i => i.id === ingId);
                const needed = formatNumber(amount - userHas);
                missingItems.push(`${needed} ${ing ? ing.displayName : ingId}`);
            }
        }

        if (missingItems.length === 0) return 'Unknown error';
        if (missingItems.length === 1) return `Need ${missingItems[0]}`;
        if (missingItems.length === 2) return `Need ${missingItems.join(' & ')}`;
        return `Need ${missingItems.slice(0, 2).join(', ')} & ${missingItems.length - 1} more`;
    }

    /**
     * Show visual feedback for craft attempt results
     */
    showCraftFeedback(button, result) {
        if (!button) return;

        // Remove any existing animation classes
        button.classList.remove('error-shake', 'error-flash', 'success-pulse');

        // Trigger reflow
        void button.offsetWidth;

        if (result.success) {
            button.classList.add('success-pulse');
            // Announce to screen reader
            if (accessibilityManager) {
                accessibilityManager.announce(result.message, 'polite');
            }
        } else {
            button.classList.add('error-shake');
            button.classList.add('error-flash');
            // Announce error to screen reader
            if (accessibilityManager) {
                accessibilityManager.announce(`Failed: ${result.message}`, 'assertive');
            }
        }

        // Clean up animation classes after animation completes
        setTimeout(() => {
            button.classList.remove('error-shake', 'error-flash', 'success-pulse');
        }, 600);
    }

    /**
     * Render progressive empty state based on player progress
     */
    renderEmptyState(context = {}) {
        const { totalItems, unlockedItems, firstActionHint } = context;

        // Progress-aware message
        if (unlockedItems > 0 && unlockedItems < totalItems) {
            return `
                <div class="empty-state-container">
                    <div class="empty-state-sigil" aria-hidden="true">◈</div>
                    <p class="empty-state-message">> ${unlockedItems}/${totalItems} MODULES_DETECTED</p>
                    <p class="empty-state-hint">> Continue compiling to unlock remaining modules</p>
                </div>
            `;
        }

        // First-time empty with CTA
        return `
            <div class="empty-state-container">
                <div class="empty-state-sigil" aria-hidden="true">◈</div>
                <p class="empty-state-message">> ${firstActionHint || 'NO_DATA_FOUND'}</p>
                <button class="btn-primary btn-sm" onclick="document.getElementById('cast-button')?.focus()">> BEGIN_COMPILATION</button>
            </div>
        `;
    }

    /**
     * Render skeleton loading state for workstation cards
     */
    renderSkeleton() {
        return Array.from({length: 3}, () =>
            '<div class="card skeleton-card"><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line-short"></div></div>'
        ).join('');
    }

    /**
     * Render error state for workstation tab
     */
    renderError(message = 'Failed to load workstations', onRetry) {
        const retryHtml = onRetry
            ? '<button class="error-state__retry" data-action="retry-workstations">RETRY</button>'
            : '';

        return `
            <div class="error-state">
                <div class="error-state__icon">⚠</div>
                <div class="error-state__message">${message}</div>
                ${retryHtml}
            </div>
        `;
    }
}
