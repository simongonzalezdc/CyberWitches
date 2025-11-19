import { ELEMENT_SPECIALIZATIONS } from '../../elementSpecialization.js';
import { formatOneDecimal } from '../../utils.js';
import { animateNumberWithFormatter } from './uiHelpers.js';
import { calculateElementTotals } from '../utils/resourceUtils.js';

export class HUDUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.previousElementTotals = { fire: 0, water: 0, air: 0, crystal: 0, aether: 0, focus: 0, meditationBonus: 0 };
    }

    /**
     * Update all HUD elements
     */
    update() {
        this.updateElementCounters();
        this.updateSpecializationIndicator();
        this.updateActiveEvents();
        this.updateMeditationVisibility();
    }

    /**
     * Update element counter displays with current totals
     */
    updateElementCounters() {
        if (!this.gameState) return;

        const totals = calculateElementTotals(this.gameState);

        // Update each element counter (with 1 decimal place)
        const elements = ['fire', 'water', 'air', 'crystal', 'aether'];
        for (const element of elements) {
            const counterElement = document.getElementById(`element-counter-${element}`);
            if (!counterElement) continue;

            const amountElement = counterElement.querySelector('.element-amount');
            if (!amountElement) continue;

            const total = totals[element];
            const formattedTotal = formatOneDecimal(total);
            const previousTotal = this.previousElementTotals[element] || 0;

            // Only update if value changed significantly (avoid unnecessary updates)
            if (Math.abs(total - previousTotal) > 0.01) {
                // Animate number change if significant change (using formatOneDecimal for element counters)
                if (previousTotal > 0 && Math.abs(total - previousTotal) > 0.1) {
                    animateNumberWithFormatter(amountElement, previousTotal, total, 500, formatOneDecimal);
                } else {
                    // Just update text for small changes
                    amountElement.textContent = formattedTotal;
                }
                this.previousElementTotals[element] = total;
            } else if (amountElement.textContent.trim() !== formattedTotal) {
                // Update text if formatting changed but value is same
                amountElement.textContent = formattedTotal;
            }
        }

        // Update Focus counter to show meditation production bonus - only if meditation is unlocked
        const isMeditationUnlocked = this.gameState.prestigeCount >= 1;
        const focusCounter = document.getElementById('element-counter-focus');
        if (focusCounter) {
            if (isMeditationUnlocked) {
                // Show focus counter
                focusCounter.style.display = 'flex';
                focusCounter.style.visibility = 'visible';
                focusCounter.style.opacity = '1';

                const focusAmountElement = focusCounter.querySelector('.element-amount');
                // Access meditationState via uiManager
                const meditationState = this.uiManager.meditationState;

                if (focusAmountElement && meditationState) {
                    // Get meditation production bonus
                    const meditationBonus = meditationState.getMeditationProductionBonus();
                    const bonusPercent = ((meditationBonus - 1.0) * 100).toFixed(1);
                    const formattedBonus = `+${bonusPercent}%`;
                    const previousBonus = this.previousElementTotals['meditationBonus'] || 0;

                    if (Math.abs(meditationBonus - previousBonus) > 0.001) {
                        if (previousBonus > 0 && Math.abs(meditationBonus - previousBonus) > 0.01) {
                            // Animate the bonus change
                            const startPercent = ((previousBonus - 1.0) * 100).toFixed(1);
                            const endPercent = bonusPercent;
                            animateNumberWithFormatter(
                                focusAmountElement,
                                parseFloat(startPercent),
                                parseFloat(endPercent),
                                500,
                                (val) => `+${val.toFixed(1)}%`
                            );
                        } else {
                            focusAmountElement.textContent = formattedBonus;
                        }
                        this.previousElementTotals['meditationBonus'] = meditationBonus;
                    } else if (focusAmountElement.textContent.trim() !== formattedBonus) {
                        focusAmountElement.textContent = formattedBonus;
                    }
                }
            } else {
                // Hide focus counter
                focusCounter.style.display = 'none';
                focusCounter.style.visibility = 'hidden';
                focusCounter.style.opacity = '0';
            }
        }
    }

    /**
     * Update specialization indicator in HUD
     */
    updateSpecializationIndicator() {
        const indicator = document.getElementById('specialization-indicator');
        if (!indicator || !this.gameState) return;

        if (this.gameState.elementSpecialization) {
            const spec = ELEMENT_SPECIALIZATIONS[this.gameState.elementSpecialization];
            if (spec) {
                indicator.textContent = spec.icon;
                indicator.style.display = 'inline-block';
                indicator.title = `${spec.name}\n${spec.description}`;
            } else {
                indicator.style.display = 'none';
            }
        } else {
            indicator.style.display = 'none';
        }
    }

    /**
     * Update active events display
     */
    updateActiveEvents() {
        // Access eventSystem via uiManager
        const eventSystem = this.uiManager.eventSystem;
        if (!eventSystem) return;

        const activeEvents = eventSystem.getActiveEvents();
        const eventsContainer = document.getElementById('active-events');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = '';

        for (const event of activeEvents) {
            const remaining = Math.ceil((event.endTime - Date.now()) / 1000);
            const badge = document.createElement('div');
            badge.className = 'event-badge';
            badge.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${event.name}</div>
                <div style="font-size: 12px; color: var(--text-dim);">${remaining}s remaining</div>
            `;
            eventsContainer.appendChild(badge);
        }
    }

    /**
     * Update meditation tab visibility based on prestige count
     */
    updateMeditationVisibility() {
        const meditationTabBtn = document.querySelector('.tab-btn[data-tab="meditation"]');
        if (meditationTabBtn) {
            if (this.gameState.prestigeCount >= 1) {
                meditationTabBtn.style.display = 'flex';
                meditationTabBtn.classList.remove('locked');
            } else {
                meditationTabBtn.style.display = 'none';
                meditationTabBtn.classList.add('locked');
            }
        }
    }
}
