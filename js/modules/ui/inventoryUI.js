/**
 * InventoryUI.js
 * Manages the rendering and updates of the Inventory tab.
 */

import { getTierSymbol, getTierAppropriateStyle } from './uiHelpers.js';

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
                <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; grid-column: 1 / -1;">
                    <picture>
                        <source srcset="images/ui/empty-state.webp" type="image/webp">
                        <img src="images/ui/empty-state.png" alt="Empty State" class="empty-state-illustration" style="max-width: 400px; width: 100%; height: auto; margin-bottom: 20px; opacity: 0.8;">
                    </picture>
                    <p class="empty-state-message" style="color: var(--text-dim); font-size: 18px;">Inventory empty. Craft workstations to get ingredients!</p>
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
        headerCard.className = 'card inventory-header';
        headerCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block; grid-column: 1 / -1; padding: 8px 12px;';

        if (isTier0) {
            // Tier 0: Monochrome, no gradients, no shadows - compact single line
            headerCard.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px;">◈</span>
                        <span style="font-size: 16px; font-weight: 600; color: #FFFFFF;">Inventory</span>
                    </div>
                    <div style="font-size: 12px; color: #FFFFFF; opacity: 0.8;">${items.length} items • ${window.formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total</div>
                </div>
            `;
        } else if (isTier1Or2) {
            // Tier 1-2: Colors but no gradients/shadows - compact single line
            headerCard.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px;">◈</span>
                        <span style="font-size: 16px; font-weight: 600; color: var(--primary);">Inventory</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${items.length} items • ${window.formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total</div>
                </div>
            `;
        } else {
            // Tier 3-4: Full effects - compact single line
            headerCard.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px; color: var(--accent);">◈</span>
                        <span style="font-size: 16px; font-weight: 600; color: var(--text-primary);">Inventory</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${items.length} items • ${window.formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total</div>
                </div>
            `;
        }
        fragment.appendChild(headerCard);

        // Render items by tier
        const tiers = Object.keys(itemsByTier).sort((a, b) => a - b);

        for (const tier of tiers) {
            const tierNum = parseInt(tier);
            const tierItems = itemsByTier[tier];
            const tierStyle = getTierAppropriateStyle(tierNum);

            // Tier separator (if multiple tiers)
            if (tiers.length > 1) {
                const separator = document.createElement('div');
                separator.className = 'tier-separator';
                separator.style.cssText = `
                    grid-column: 1 / -1;
                    margin: 10px 0 5px 0;
                    padding-bottom: 5px;
                    border-bottom: 1px solid ${tierStyle.borderGlow};
                    color: ${tierStyle.color};
                    font-size: 14px;
                    font-family: ${tierStyle.fontFamily};
                    display: flex;
                    align-items: center;
                    gap: 8px;
                `;
                separator.innerHTML = `<span>Tier ${tierNum}</span>`;
                fragment.appendChild(separator);
            }

            for (const item of tierItems) {
                const itemCard = document.createElement('div');
                itemCard.className = 'inventory-item';
                itemCard.dataset.id = item.id;

                // Compact card style
                let cardStyle = `
                    background: ${isTier0 ? '#000000' : 'rgba(20, 20, 30, 0.6)'};
                    border: 1px solid ${tierStyle.borderGlow};
                    border-radius: 4px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    transition: ${tierStyle.transition};
                    position: relative;
                    overflow: hidden;
                `;

                if (tierStyle.hasGlow) {
                    cardStyle += `box-shadow: 0 0 5px ${tierStyle.borderGlow.replace('0.8', '0.1')};`;
                }

                itemCard.style.cssText = cardStyle;

                // Item content
                itemCard.innerHTML = `
                    <div style="font-size: 12px; color: ${tierStyle.color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600;">${item.displayName}</div>
                    <div style="font-size: 16px; color: #FFFFFF; font-family: monospace;">${window.formatShort(item.amount)}</div>
                `;

                fragment.appendChild(itemCard);
            }
        }

        container.appendChild(fragment);
    }

}
