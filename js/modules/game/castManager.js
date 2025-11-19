/**
 * CastManager
 * Manages spell casting logic, including resource generation, combo system interaction, and visual feedback.
 */
export class CastManager {
    /**
     * @param {Object} gameState - The global game state
     * @param {Object} uiManager - The UI manager
     * @param {Object} comboSystem - The combo system
     * @param {Object} eventSystem - The event system
     */
    constructor(gameState, uiManager, comboSystem, eventSystem) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.comboSystem = comboSystem;
        this.eventSystem = eventSystem;

        this.isProcessing = false;

        // Initialize auto-cast
        this.initAutoCast();

        // Bind methods
        this.handleCast = this.handleCast.bind(this);
    }

    /**
     * Handle the cast action
     */
    handleCast() {
        // Safety checks - ensure game state is initialized
        if (!this.gameState) {
            console.error('GameState not initialized yet');
            return;
        }

        // Prevent double-processing
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // Process cast immediately (synchronous)
            const oldAb = this.gameState.ab;

            // Apply combo multiplier if active
            const comboMult = this.comboSystem ? this.comboSystem.getComboMultiplier() : 1.0;
            if (this.comboSystem) {
                this.comboSystem.recordAction();
            }

            // Check for event multipliers
            let eventMult = 1.0;
            if (this.eventSystem) {
                eventMult = this.eventSystem.getProductionMultiplier();
            }

            // Calculate gain
            const gain = this.gameState.abps * this.gameState.clickMult * comboMult * eventMult;

            // Add to total
            this.gameState.ab += gain;
            this.gameState.lifetimeAb += gain;

            // Track stats
            if (!this.gameState.stats) {
                this.gameState.stats = { totalCasts: 0 };
            }
            this.gameState.stats.totalCasts++;

            // Check for unlocks
            this.gameState.checkUnlocks();

            // Visual feedback
            this.showVisualFeedback(gain);

            // Play sound
            const audioSystem = this.uiManager.systems.audioSystem || window.audioSystem;
            if (audioSystem && typeof audioSystem.playSound === 'function') {
                audioSystem.playSound('cast');
            }

            // Update UI
            // Note: We rely on the main loop for regular updates, but force one here for responsiveness
            if (this.uiManager && this.uiManager.hudUI) {
                this.uiManager.hudUI.update();
            }

            // Announce to screen reader
            const accessibilityManager = this.uiManager.systems.accessibilityManager;
            if (accessibilityManager) {
                accessibilityManager.announce(`Casted spell, gained ${this.formatNumber(gain)} energy`, 'polite');
            }

        } catch (error) {
            console.error('Error in handleCast:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Show visual feedback for the cast
     * @param {number} amount - Amount gained
     */
    showVisualFeedback(amount) {
        const castBtn = document.getElementById('cast-button');
        if (!castBtn) return;

        // Pulse effect
        castBtn.classList.remove('pulse-animation');
        void castBtn.offsetWidth; // Trigger reflow
        castBtn.classList.add('pulse-animation');

        // Floating text
        if (this.uiManager && this.uiManager.floatingTextUI) {
            const rect = castBtn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top;
            this.uiManager.floatingTextUI.show(`+${this.formatNumber(amount)}`, x, y, 'success');
        }
    }

    /**
     * Helper to format numbers
     * @param {number} num 
     * @returns {string}
     */
    formatNumber(num) {
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
        return Math.floor(num).toString();
    }

    // Auto-Cast Functionality

    /**
     * Initialize auto-cast state
     */
    initAutoCast() {
        this.autoCastEnabled = false;
        this.autoCastTimer = 0;
        this.baseAutoCastInterval = 1000; // 1 second
    }

    /**
     * Toggle auto-cast state
     * @returns {boolean} New state
     */
    toggleAutoCast() {
        this.autoCastEnabled = !this.autoCastEnabled;
        this.updateAutoCastVisuals();
        return this.autoCastEnabled;
    }

    /**
     * Set auto-cast state
     * @param {boolean} enabled 
     */
    setAutoCast(enabled) {
        this.autoCastEnabled = enabled;
        this.updateAutoCastVisuals();
    }

    /**
     * Get auto-cast state
     * @returns {boolean}
     */
    getAutoCastEnabled() {
        return this.autoCastEnabled;
    }

    /**
     * Update auto-cast logic
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (!this.autoCastEnabled) return;

        // Calculate interval based on upgrades/events
        let interval = this.baseAutoCastInterval;

        // Apply upgrades (example: if we had an upgrade system for this)
        // For now, just use the base interval or modify based on game state if needed

        // Apply event effects
        if (this.eventSystem && this.eventSystem.hasEventEffect('double_casts')) {
            interval /= 2; // Double speed
        }

        this.autoCastTimer += deltaTime;
        if (this.autoCastTimer >= interval) {
            this.handleCast();
            this.autoCastTimer = 0;
        }
    }

    /**
     * Update visual feedback for auto-cast
     */
    updateAutoCastVisuals() {
        const autoStatus = document.getElementById('auto-status');
        const autoBtn = document.getElementById('auto-cast-toggle');

        if (autoStatus) {
            autoStatus.textContent = this.autoCastEnabled ? 'ON' : 'OFF';
            if (this.autoCastEnabled) {
                autoStatus.classList.add('active');
            } else {
                autoStatus.classList.remove('active');
            }
        }

        if (autoBtn) {
            if (this.autoCastEnabled) {
                autoBtn.classList.add('active');
            } else {
                autoBtn.classList.remove('active');
            }
        }
    }

    /**
     * Update auto button visibility based on first ascension
     */
    updateAutoButtonVisibility() {
        const autoCastToggle = document.getElementById('auto-cast-toggle');
        if (autoCastToggle && this.gameState) {
            const hasAscended = this.gameState.prestigeCount >= 1;
            if (hasAscended) {
                // Show auto button after first ascension
                autoCastToggle.style.display = 'flex';
                autoCastToggle.style.visibility = 'visible';
                autoCastToggle.style.opacity = '1';
            } else {
                // Hide auto button until first ascension
                autoCastToggle.style.display = 'none';
                autoCastToggle.style.visibility = 'hidden';
                autoCastToggle.style.opacity = '0';
                // Also disable auto-cast if it was enabled
                if (this.autoCastEnabled) {
                    this.setAutoCast(false);
                }
            }
        }
    }
}
