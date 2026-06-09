import { ELEMENT_SPECIALIZATIONS } from '../../elementSpecialization.js';
import { formatOneDecimal, formatShort, escapeHtml } from '../../utils.js';
import { animateNumberWithFormatter } from './uiHelpers.js';
import { animateNumber } from '../../animations.js';
import { calculateElementTotals } from '../utils/resourceUtils.js';

export class HUDUI {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.previousElementTotals = { fire: 0, water: 0, air: 0, crystal: 0, aether: 0, focus: 0, meditationBonus: 0 };
        this.previousAbps = 0;
        this.previousAb = 0;

        // DOM Elements
        this.abDisplay = document.getElementById('ab-display');
        this.abpsDisplay = document.getElementById('abps-display');
        this.comboDisplay = document.getElementById('combo-display');
    }

    /**
     * Update all HUD elements
     */
    update() {
        this.updateElementCounters();
        this.updateSpecializationIndicator();
        this.updateActiveEvents();
        this.updateMeditationVisibility();
        this.updateABPS();
        this.updateComboDisplay();
        this.updateABDisplay();
    }

    /**
     * Update Arcane Bits display with animation
     */
    updateABDisplay() {
        if (!this.gameState || !this.abDisplay) return;

        const currentAb = this.gameState.ab;

        // Only animate for significant changes
        if (Math.abs(currentAb - this.previousAb) > 1) {
            // animateNumber preserves the "AB: " prefix if present
            animateNumber(this.abDisplay, this.previousAb, currentAb, 200);
        } else {
            // Direct update for small changes
            this.abDisplay.textContent = `AB: ${formatShort(currentAb)}`;
        }
        this.previousAb = currentAb;
    }

    /**
     * Update AB per second display
     */
    updateABPS() {
        if (!this.gameState || !this.abpsDisplay) return;

        let eventMult = 1.0;
        if (this.uiManager.eventSystem) {
            eventMult = this.uiManager.eventSystem.getProductionMultiplier();
        }
        const abps = this.gameState.getAbPerSecond(eventMult);

        if (abps !== this.previousAbps) {
            animateNumberWithFormatter(this.abpsDisplay, this.previousAbps, abps, 500, (val) => {
                return `${formatOneDecimal(val)} AB/s`;
            });

            // Add glow effect if SE/s increased
            if (abps > this.previousAbps && abps > 0) {
                this.abpsDisplay.style.textShadow = '0 0 10px rgba(34, 227, 255, 0.8)';
                setTimeout(() => {
                    this.abpsDisplay.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.375)';
                }, 500);
            }

            this.previousAbps = abps;
        }
    }

    /**
     * Update Combo display
     */
    updateComboDisplay() {
        // Access comboSystem via uiManager.systems
        const comboSystem = this.uiManager.systems.comboSystem;
        if (!comboSystem || !this.comboDisplay) return;

        const comboCount = comboSystem.getComboCount();

        if (comboCount > 0) {
            const mult = comboSystem.getComboMultiplier();
            // Check if auto-cast is maintaining this combo
            const castManager = this.uiManager.systems.castManager;
            const autoMaintaining = castManager && castManager.getAutoCastEnabled && castManager.getAutoCastEnabled();

            this.comboDisplay.innerHTML = `<span class="css-icon-fire"></span> ${escapeHtml(comboCount)}x Combo (${escapeHtml((mult * 100).toFixed(0))}%)${autoMaintaining ? ' <span class="auto-indicator">AUTO</span>' : ''}`;
            this.comboDisplay.style.display = 'block';

            // Update auto-combo visual feedback
            if (autoMaintaining) {
                this.comboDisplay.classList.add('auto-combo-active');
            } else {
                this.comboDisplay.classList.remove('auto-combo-active');
            }
        } else {
            this.comboDisplay.style.display = 'none';
            this.comboDisplay.classList.remove('auto-combo-active');
        }
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
        // Note: active-events container might not exist in index.html, game.v7.js didn't seem to update it either.
        // game.v7.js: uiManager.hudUI.updateActiveEvents();
        // But where is the container? I don't recall seeing it in index.html.
        // Let's check if it exists, if not, we skip.
        if (!eventsContainer) return;

        eventsContainer.innerHTML = '';

        for (const event of activeEvents) {
            const remaining = Math.ceil((event.endTime - Date.now()) / 1000);
            const badge = document.createElement('div');
            badge.className = 'event-badge';
            badge.innerHTML = `
                <div class="event-name">${escapeHtml(event.name)}</div>
                <div class="event-timer">${remaining}s remaining</div>
            `;
            eventsContainer.appendChild(badge);
        }
    }

    /**
     * Update meditation tab visibility based on prestige count
     */
    updateMeditationVisibility() {
        const meditationTabBtn = /** @type {HTMLElement} */ (document.querySelector('.tab-btn[data-tab="meditation"]'));
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
