/**
 * InventoryUI.js
 * Manages the rendering and updates of the Inventory tab.
 */

import { getTierAppropriateStyle } from './uiHelpers.js';

export class InventoryUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
    }

    /**
     * Update inventory tab with optimized rendering
     */
    update() {
        if (!this.gameState) {
            console.error('gameState not initialized in InventoryUI');
            return;
        }

        const container = document.getElementById('inventory-list');
        if (!container) {
            // console.error('inventory-list container not found!');
            return;
        }

        // Ensure container is visible - use grid layout for compact display
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
        container.style.gap = '3px';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.innerHTML = '';

        // Clean up zero-amount items from inventory before rendering (no empty boxes)
        if (this.gameState.inventory) {
            for (const ingId in this.gameState.inventory) {
                if ((this.gameState.inventory[ingId] || 0) <= 0) {
                    delete this.gameState.inventory[ingId];
                }
            }
        }

        if (!this.gameState.inventory || Object.keys(this.gameState.inventory).length === 0) {
            container.innerHTML = `
                <div class="empty-state-container" style="grid-column: 1 / -1;">
                    <div class="empty-state-sigil" aria-hidden="true"></div>
                    <p class="empty-state-message">> INVENTORY_EMPTY. Execute protocols to gather elemental data.</p>
                </div>
            `;
            return;
        }


        // Get all items and sort by tier and amount
        const items = [];
        let maxAmount = 0;

        // Hide focus from inventory until meditation is unlocked
        const isMeditationUnlocked = this.gameState.prestigeCount >= 1;

        for (const ingId in this.gameState.inventory) {
            const amount = this.gameState.inventory[ingId];
            // Skip items with zero or negative amounts (no empty boxes)
            if (amount <= 0) {
                // Clean up zero-amount items from inventory
                delete this.gameState.inventory[ingId];
                continue;
            }

            // Skip focus-related ingredients if meditation is not unlocked
            if (!isMeditationUnlocked && (ingId === 'focus' || ingId.includes('focus'))) {
                continue;
            }

            const ingredient = window.INGREDIENTS.find(ing => ing.id === ingId);
            const tier = ingredient?.tier || 0;
            const displayName = ingredient?.displayName || ingId;

            items.push({ id: ingId, amount, tier, displayName });
            maxAmount = Math.max(maxAmount, amount);
        }

        // Sort by tier (ascending), then by amount (descending)
        items.sort((a, b) => {
            if (a.tier !== b.tier) return a.tier - b.tier;
            return b.amount - a.amount;
        });

        // Group items by tier
        const itemsByTier = {};
        for (const item of items) {
            if (!itemsByTier[item.tier]) {
                itemsByTier[item.tier] = [];
            }
            itemsByTier[item.tier].push(item);
        }

        // Batch DOM updates for better performance
        const fragment = document.createDocumentFragment();

        // Create compact header card
        const currentDesignTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        const isTier0 = currentDesignTier === 0;
        const isTier1Or2 = currentDesignTier <= 2;

        const headerCard = document.createElement('div');
        headerCard.className = 'card inventory-header force-visible';
        headerCard.style.gridColumn = '1 / -1';
        headerCard.style.padding = '8px 12px';

        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.alignItems = 'center';
        headerContent.style.justifyContent = 'space-between';
        headerContent.style.gap = '12px';

        const leftSide = document.createElement('div');
        leftSide.style.display = 'flex';
        leftSide.style.alignItems = 'center';
        leftSide.style.gap = '6px';

        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '16px';
        iconSpan.textContent = '◈';

        const titleSpan = document.createElement('span');
        titleSpan.style.fontSize = '16px';
        titleSpan.style.fontWeight = '600';
        titleSpan.textContent = 'Inventory';

        const rightSide = document.createElement('div');
        rightSide.style.fontSize = '12px';
        rightSide.textContent = `${items.length} items • ${window.formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total`;

        if (isTier0) {
            // Tier 0: Monochrome
            titleSpan.style.color = '#FFFFFF';
            rightSide.style.color = '#FFFFFF';
            rightSide.style.opacity = '0.8';
        } else if (isTier1Or2) {
            // Tier 1-2: Colors
            titleSpan.style.color = 'var(--primary)';
            rightSide.style.color = 'var(--text-secondary)';
        } else {
            // Tier 3-4: Full effects
            iconSpan.style.color = 'var(--accent)';
            titleSpan.style.color = 'var(--text-primary)';
            rightSide.style.color = 'var(--text-secondary)';
        }

        leftSide.appendChild(iconSpan);
        leftSide.appendChild(titleSpan);
        headerContent.appendChild(leftSide);
        headerContent.appendChild(rightSide);
        headerCard.appendChild(headerContent);
        fragment.appendChild(headerCard);

        // Render items by tier
        const tiers = Object.keys(itemsByTier).sort((a, b) => Number(a) - Number(b));

        for (const tier of tiers) {
            const tierNum = parseInt(tier, 10);
            const tierItems = itemsByTier[tier];
            const tierStyle = getTierAppropriateStyle(tierNum);

            // Tier separator (if multiple tiers)
            if (tiers.length > 1) {
                const separator = document.createElement('div');
                separator.className = 'tier-separator';
                separator.style.gridColumn = '1 / -1';
                separator.style.margin = '10px 0 5px 0';
                separator.style.paddingBottom = '5px';
                separator.style.borderBottom = `1px solid ${tierStyle.borderGlow}`;
                separator.style.color = tierStyle.color;
                separator.style.fontSize = '14px';
                separator.style.fontFamily = tierStyle.fontFamily;
                separator.style.display = 'flex';
                separator.style.alignItems = 'center';
                separator.style.gap = '8px';

                const sepText = document.createElement('span');
                sepText.textContent = `Tier ${tierNum}`;
                separator.appendChild(sepText);

                fragment.appendChild(separator);
            }

            for (const item of tierItems) {
                const itemCard = document.createElement('div');
                itemCard.className = 'inventory-item';
                itemCard.dataset.id = item.id;

                // Compact card style
                itemCard.style.background = isTier0 ? '#05050a' : 'rgba(20, 20, 30, 0.6)';
                itemCard.style.border = `1px solid ${tierStyle.borderGlow}`;
                itemCard.style.borderRadius = '4px';
                itemCard.style.padding = '8px';
                itemCard.style.display = 'flex';
                itemCard.style.flexDirection = 'column';
                itemCard.style.gap = '4px';
                itemCard.style.transition = tierStyle.transition;
                itemCard.style.position = 'relative';
                itemCard.style.overflow = 'hidden';

                if (tierStyle.hasGlow) {
                    itemCard.style.boxShadow = `0 0 5px ${tierStyle.borderGlow.replace('0.8', '0.1')}`;
                }

                // Item content
                const nameDiv = document.createElement('div');
                nameDiv.style.fontSize = '12px';
                nameDiv.style.color = tierStyle.color;
                nameDiv.style.whiteSpace = 'nowrap';
                nameDiv.style.overflow = 'hidden';
                nameDiv.style.textOverflow = 'ellipsis';
                nameDiv.style.fontWeight = '600';
                nameDiv.textContent = item.displayName;
                itemCard.appendChild(nameDiv);

                const amountDiv = document.createElement('div');
                amountDiv.style.fontSize = '16px';
                amountDiv.style.color = '#FFFFFF';
                amountDiv.style.fontFamily = 'monospace';
                amountDiv.textContent = window.formatShort(item.amount);
                itemCard.appendChild(amountDiv);

                fragment.appendChild(itemCard);
            }
        }

        container.appendChild(fragment);
    }

}
