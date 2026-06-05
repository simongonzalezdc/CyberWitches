import { getTierSymbol, getTierAppropriateStyle, stripEmojisIfLowTier, getUpgradeTier } from './uiHelpers.js';
import { UPGRADES } from '../data/upgrades.js';
import { INGREDIENTS } from '../data/ingredients.js';
import { formatShort } from '../../utils.js';

export class InscriptionsUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this._inscribeDelegationBound = false;
    }

    /**
     * Update inscriptions tab with optimized rendering
     */
    update() {
        if (!this.gameState) {
            console.error('gameState not initialized in InscriptionsUI');
            return;
        }

        const container = document.getElementById('upgrade-list');
        if (!container) {
            return;
        }

        // Ensure container is visible
        container.classList.remove('hidden');
        container.style.display = 'flex';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.flexDirection = 'column';
        container.style.gap = '15px';

        // Filter unlocked upgrades
        let unlockedUpgrades = UPGRADES.filter(upg => {
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

        // Bind the inscribe click handler ONCE via delegation on the stable
        // #upgrade-list container, instead of re-attaching a listener to every
        // card on every render (which churned ~31 listeners per update — a real
        // leak signal over a long session). Buttons carry the upgrade id in
        // data-inscribe-id; clearing container.innerHTML doesn't remove this
        // listener since it lives on the container itself.
        if (!this._inscribeDelegationBound) {
            container.addEventListener('click', (e) => {
                const btn = /** @type {HTMLElement} */ (/** @type {HTMLElement} */ (e.target).closest('button[data-inscribe-id]'));
                if (!btn || !container.contains(btn)) return;
                e.preventDefault();
                e.stopPropagation();
                const im = this.uiManager && this.uiManager.systems && this.uiManager.systems.inscriptionsManager;
                if (im) {
                    im.inscribeUpgrade(btn.dataset.inscribeId, btn);
                } else {
                    console.error('InscriptionsManager not found in uiManager.systems');
                }
            });
            this._inscribeDelegationBound = true;
        }

        // Use traditional rendering
        this.updateTraditional(container, unlockedUpgrades);
    }

    // Traditional rendering function for inscriptions
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

            const symbolSpan = document.createElement('span');
            symbolSpan.className = `tier-symbol tier-icon-${tier}`;
            symbolSpan.style.color = tierStyle.color;
            symbolSpan.style.textShadow = tierStyle.textShadow;
            symbolSpan.style.marginRight = '8px';
            symbolSpan.style.fontSize = '20px';
            symbolSpan.textContent = tierSymbol.symbol;

            tierHeader.appendChild(symbolSpan);
            tierHeader.appendChild(document.createTextNode(` Tier ${tier}`));

            container.appendChild(tierHeader);

            // Render upgrades for this tier
            for (const upgData of upgradesByTier[tier]) {
                const owned = this.gameState.upgradesOwned[upgData.id] || false;

                const card = document.createElement('div');
                card.className = 'card force-visible';

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

                // Build card content using DOM methods to avoid inline styles in innerHTML
                const titleDiv = document.createElement('div');
                titleDiv.className = 'card-title';
                titleDiv.textContent = `${upgData.displayName} ${owned ? stripEmojisIfLowTier('✓') : ''}`;
                card.appendChild(titleDiv);

                const descDiv = document.createElement('div');
                descDiv.className = 'card-description';
                descDiv.textContent = upgData.description;
                card.appendChild(descDiv);

                const effectSection = document.createElement('div');
                effectSection.className = 'card-section';
                const effectLabel = document.createElement('div');
                effectLabel.className = 'card-label';
                effectLabel.textContent = effectText;
                effectSection.appendChild(effectLabel);
                card.appendChild(effectSection);

                const costSection = document.createElement('div');
                costSection.className = 'card-section';
                const costLabel = document.createElement('div');
                costLabel.className = 'card-label';
                costLabel.textContent = 'Cost:';
                costSection.appendChild(costLabel);

                if (upgData.recipe) {
                    Object.entries(upgData.recipe).forEach(([ingId, amount]) => {
                        const have = this.gameState.inventory[ingId] || 0;
                        const canAfford = have >= amount;
                        const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                        const displayName = ingredient?.displayName || ingId;

                        const recipeItem = document.createElement('div');
                        recipeItem.className = `recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}`;

                        const labelSpan = document.createElement('span');
                        labelSpan.className = 'recipe-label';
                        labelSpan.textContent = `${displayName}:`;

                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'recipe-numbers';
                        numberSpan.textContent = `${formatShort(have)} / ${formatShort(amount)}`;

                        recipeItem.appendChild(labelSpan);
                        recipeItem.appendChild(numberSpan);
                        costSection.appendChild(recipeItem);
                    });
                }
                card.appendChild(costSection);

                const button = document.createElement('button');
                button.className = 'btn-primary';
                button.dataset.action = 'inscribe';
                button.dataset.upgradeId = upgData.id;
                button.textContent = owned ? 'Owned' : 'Inscribe';

                if (owned || !canAffordAll) {
                    button.disabled = true;
                    // Use classes for disabled state if possible, but these styles were inline before
                    button.style.pointerEvents = 'none';
                    button.style.cursor = 'not-allowed';
                    button.style.opacity = '0.6';
                } else {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                    button.style.cursor = 'pointer';
                    button.style.opacity = '1';
                }

                button.style.position = 'relative';
                button.style.zIndex = '100';
                button.style.visibility = 'visible';
                button.style.display = 'inline-block';

                // Handled by the delegated listener on #upgrade-list (see update()).
                button.dataset.inscribeId = upgData.id;

                card.appendChild(button);
                container.appendChild(card);
            }
        }
    }
}

