/**
 * Design Tier System - Manages progressive revelation of game design
 * Feature 2: Progressive Design Revelation
 */

export class DesignTierSystem {
    constructor(gameState, uiManager, audioSystem) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.audioSystem = audioSystem;
        this.currentTier = this.loadTier();
        this.unlockedTiers = new Set([0]); // Tier 0 always unlocked
        this.loadUnlockedTiers();
        this.gameStartTime = Date.now(); // Track when game started for time-based requirements
        this.tierUnlockTimes = {}; // Track when each tier was unlocked
    }

    /**
     * Check if a tier should be unlocked based on game state
     */
    checkTierUnlocks() {
        // Add error handling for gameState
        if (!this.gameState) {
            console.error('DesignTierSystem: gameState is not available');
            return;
        }

        // Add null checks with defaults
        const ab = this.gameState.ab || 0;
        // Get achievement count from the achievement system if available
        const unlockedCount = this.uiManager?.systems?.achievementSystem?.getUnlockedCount() || 0;
        // Prestige count - actual number of ascensions (prestige completions)
        const prestigeCount = this.gameState.prestigeCount || 0;

        // Calculate playtime in seconds
        const playtimeSeconds = (Date.now() - this.gameStartTime) / 1000;

        // Get time spent in current tier (if any tier unlocked)
        const currentTier = Math.max(...Array.from(this.unlockedTiers));
        const tierUnlockTime = this.tierUnlockTimes[currentTier] || this.gameStartTime;
        const timeInCurrentTier = (Date.now() - tierUnlockTime) / 1000;

        // Tier 1: Require 3 achievements AND 500 AB AND minimum 30 seconds playtime
        if (!this.unlockedTiers.has(1)) {
            const minPlaytime = 30; // 30 seconds
            if (unlockedCount >= 3 && ab >= 500 && playtimeSeconds >= minPlaytime) {
                this.tierUnlockTimes[1] = Date.now();
                this.unlockTier(1).catch(err => console.error('Error unlocking tier 1:', err));
            }
        }

        // Tier 2: Require 6 achievements AND 5,000 AB AND minimum 2 minutes playtime AND 30 seconds in Tier 1
        if (!this.unlockedTiers.has(2)) {
            const minPlaytime = 120; // 2 minutes
            const minTimeInTier1 = 30; // 30 seconds in Tier 1
            const timeInTier1 = this.tierUnlockTimes[1] ? (Date.now() - this.tierUnlockTimes[1]) / 1000 : 0;
            const canUnlock = unlockedCount >= 6 && ab >= 5000 && playtimeSeconds >= minPlaytime && timeInTier1 >= minTimeInTier1;
            if (canUnlock) {
                this.tierUnlockTimes[2] = Date.now();
                this.unlockTier(2).catch(err => console.error('Error unlocking tier 2:', err));
            }
        }

        // Tier 3: Require 9 achievements AND 50,000 AB AND minimum 5 minutes playtime AND 2 minutes in Tier 2
        if (!this.unlockedTiers.has(3)) {
            const minPlaytime = 300; // 5 minutes
            const minTimeInTier2 = 120; // 2 minutes in Tier 2
            const timeInTier2 = this.tierUnlockTimes[2] ? (Date.now() - this.tierUnlockTimes[2]) / 1000 : 0;
            const canUnlock = unlockedCount >= 9 && ab >= 50000 && playtimeSeconds >= minPlaytime && timeInTier2 >= minTimeInTier2;
            if (canUnlock) {
                this.tierUnlockTimes[3] = Date.now();
                this.unlockTier(3).catch(err => console.error('Error unlocking tier 3:', err));
            }
        }

        // Tier 4: Require 12 achievements AND 500,000 AB AND minimum 10 minutes playtime AND 5 minutes in Tier 3
        if (!this.unlockedTiers.has(4)) {
            const minPlaytime = 600; // 10 minutes
            const minTimeInTier3 = 300; // 5 minutes in Tier 3
            const timeInTier3 = this.tierUnlockTimes[3] ? (Date.now() - this.tierUnlockTimes[3]) / 1000 : 0;
            const canUnlock = unlockedCount >= 12 && ab >= 500000 && playtimeSeconds >= minPlaytime && timeInTier3 >= minTimeInTier3;
            if (canUnlock) {
                this.tierUnlockTimes[4] = Date.now();
                this.unlockTier(4).catch(err => console.error('Error unlocking tier 4:', err));
            }
        }
    }

    /**
     * Unlock a tier and apply its effects
     */
    async unlockTier(tier) {
        if (this.unlockedTiers.has(tier)) return;

        this.unlockedTiers.add(tier);
        this.currentTier = Math.max(this.currentTier, tier);
        await this.applyTier(tier);
        this.saveTier();
        this.showUnlockNotification(tier);

        // Initialize background sparkles when Tier 3 is unlocked
        if (tier >= 3 && this.uiManager?.systems?.particleSystem) {
            this.uiManager.systems.particleSystem.init();
        }
    }

    /**
     * Apply tier visual and audio settings
     */
    async applyTier(tier) {
        const body = document.body;

        // Remove all tier classes
        body.classList.remove('tier-0', 'tier-1', 'tier-2', 'tier-3', 'tier-4');

        // Apply current tier class
        body.classList.add(`tier-${tier}`);

        // Apply tier-specific settings
        switch (tier) {
            case 0:
                this.applyTier0();
                break;
            case 1:
                this.applyTier1();
                break;
            case 2:
                await this.applyTier2();
                break;
            case 3:
                this.applyTier3();
                break;
            case 4:
                await this.applyTier4();
                break;
        }
    }

    applyTier0() {
        // Monochrome mode
        document.documentElement.style.setProperty('--primary', '#FFFFFF');
        document.documentElement.style.setProperty('--secondary', '#FFFFFF');
        document.documentElement.style.setProperty('--accent', '#FFFFFF');
        document.documentElement.style.setProperty('--success', '#FFFFFF');

        // Disable all animations and transitions
        document.body.classList.add('no-animations');

        // Disable particle effects
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'none';
        }

        // Disable any animation systems
        if (this.uiManager?.systems?.particleSystem) {
            this.uiManager.systems.particleSystem.disable();
        }

        // Disable sound effects (Tier 0 = no sound)
        if (this.audioSystem && this.audioSystem.disableSoundEffects) {
            this.audioSystem.disableSoundEffects();
        }

        // Disable music (Tier 0 = no music)
        if (this.audioSystem && this.audioSystem.disableMusic) {
            this.audioSystem.disableMusic();
        }
    }

    applyTier1() {
        // Enable basic colors - CLI terminal style
        document.documentElement.style.setProperty('--primary', '#FF2DAA');
        document.documentElement.style.setProperty('--secondary', '#22E3FF');
        document.documentElement.style.setProperty('--accent', '#FFDB6E');
        document.documentElement.style.setProperty('--success', '#3CE3C5');

        // Remove glow variables for Tier 1
        document.documentElement.style.setProperty('--primary-glow', 'transparent');
        document.documentElement.style.setProperty('--secondary-glow', 'transparent');
        document.documentElement.style.setProperty('--accent-glow', 'transparent');
        document.documentElement.style.setProperty('--success-glow', 'transparent');
        document.documentElement.style.setProperty('--shadow-glow', 'transparent');

        // Keep animations disabled for Tier 1 - it's still CLI-like with just colors
        document.body.classList.add('no-animations');

        // Keep particle canvas disabled
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'none';
        }

        // Disable any animation systems
        if (this.uiManager?.systems?.particleSystem) {
            this.uiManager.systems.particleSystem.disable();
        }

        // Disable sound effects (Tier 1 = no sound, only color)
        if (this.audioSystem && this.audioSystem.disableSoundEffects) {
            this.audioSystem.disableSoundEffects();
        }

        // Disable music (Tier 1 = no music)
        if (this.audioSystem && this.audioSystem.disableMusic) {
            this.audioSystem.disableMusic();
        }
    }

    async applyTier2() {
        // Tier 2 looks exactly like Tier 1 (basic color CLI) but with sound effects
        // Simply call applyTier1() to get all the visual settings, then enable sound
        this.applyTier1();

        // Disable music (Tier 2 = sound effects only, no music)
        if (this.audioSystem && this.audioSystem.disableMusic) {
            this.audioSystem.disableMusic();
        }

        // Enable sound effects (the only difference from Tier 1)
        if (this.audioSystem) {
            await this.audioSystem.enableSoundEffects();
            console.log('Tier 2 sound effects enabled');

            // Test sound to verify it's working (after a short delay to ensure audio context is ready)
            setTimeout(() => {
                if (this.audioSystem && this.audioSystem.playSound) {
                    const played = this.audioSystem.playSound('click', { volume: 0.5 });
                    console.log('Tier 2 test sound played:', played);
                }
            }, 500);
        }
    }

    applyTier3() {
        // Disable music (Tier 3 = animations + sound effects, no music yet)
        if (this.audioSystem && this.audioSystem.disableMusic) {
            this.audioSystem.disableMusic();
        }

        // Enable sound effects (Tier 3 includes Tier 2's sound effects)
        if (this.audioSystem && this.audioSystem.enableSoundEffects) {
            this.audioSystem.enableSoundEffects();
        }

        // Enable animations (particle effects disabled for performance)
        document.body.classList.add('full-animations');

        // Disable particle canvas (removed for performance)
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'none';
        }

        // Disable particle systems
        if (this.uiManager?.systems?.particleSystem) {
            this.uiManager.systems.particleSystem.disable();
        }
    }

    async applyTier4() {
        // Apply Tier 3 visuals first (animations, particles, sound effects)
        // But DON'T call applyTier3() because it disables music!
        // Instead, manually apply Tier 3 features without disabling music

        // Enable sound effects (Tier 3 includes Tier 2's sound effects)
        if (this.audioSystem && this.audioSystem.enableSoundEffects) {
            this.audioSystem.enableSoundEffects();
        }

        // Enable animations (particle effects disabled for performance)
        document.body.classList.add('full-animations');

        // Disable particle canvas (removed for performance)
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'none';
        }

        // Disable particle systems
        if (this.uiManager?.systems?.particleSystem) {
            this.uiManager.systems.particleSystem.disable();
        }

        // Enable background music (the only difference from Tier 3)
        if (this.audioSystem) {
            console.log('applyTier4: Enabling music...');
            await this.audioSystem.enableMusic();
            console.log('applyTier4: Music enabled');

            // Ensure audio context is running
            if (this.audioSystem.audioContext) {
                if (this.audioSystem.audioContext.state === 'suspended') {
                    try {
                        await this.audioSystem.audioContext.resume();
                        console.log('applyTier4: Audio context resumed');
                    } catch (error) {
                        console.error('applyTier4: Failed to resume audio context:', error);
                    }
                }

                // Always try to start music after enabling
                if (this.audioSystem.audioContext.state === 'running') {
                    try {
                        if (this.audioSystem.musicNodes.length === 0) {
                            console.log('applyTier4: Starting music (no nodes playing)...');
                            await this.audioSystem.startMusic();
                        }
                    } catch (error) {
                        console.error('applyTier4: Failed to start music:', error);
                    }
                }
            }
        }
    }

    /**
     * Show unlock notification
     */
    showUnlockNotification(tier) {
        const messages = {
            1: { title: '<span class="css-icon-sparkle"></span> Colors Awakened <span class="css-icon-sparkle"></span>', message: 'The world gains color...' },
            2: { title: '<span class="css-icon-sound"></span> Sounds Awakened <span class="css-icon-sound"></span>', message: 'Silence is broken...' },
            3: { title: '<span class="css-icon-sparkle"></span> Motion Awakened <span class="css-icon-sparkle"></span>', message: 'The world comes alive...' },
            4: { title: '<span class="css-icon-music"></span> Music Awakened <span class="css-icon-music"></span>', message: 'Harmony fills the air...' }
        };

        const msg = messages[tier];
        if (msg && this.uiManager?.showNotification) {
            this.uiManager.showNotification(msg.title, 'success');
            setTimeout(() => {
                this.uiManager.showNotification(msg.message, 'info');
            }, 2000);
        }
    }

    /**
     * Load tier from save
     */
    loadTier() {
        const saved = localStorage.getItem('cw.designTier');
        if (saved !== null) {
            return parseInt(saved, 10);
        }
        return 0; // Default to Tier 0
    }

    /**
     * Load unlocked tiers from save
     */
    loadUnlockedTiers() {
        const saved = localStorage.getItem('cw.unlockedTiers');
        if (saved) {
            try {
                const tiers = JSON.parse(saved);
                this.unlockedTiers = new Set(tiers);
            } catch (e) {
                console.error('Error loading unlocked tiers:', e);
            }
        }
    }

    /**
     * Save tier to localStorage
     */
    saveTier() {
        localStorage.setItem('cw.designTier', this.currentTier.toString());
        localStorage.setItem('cw.unlockedTiers', JSON.stringify(Array.from(this.unlockedTiers)));
    }

    /**
     * Get current tier
     */
    getCurrentTier() {
        return this.currentTier;
    }

    /**
     * Set tier manually (for settings/preferences)
     */
    async setTier(tier) {
        if (this.unlockedTiers.has(tier)) {
            this.currentTier = tier;
            await this.applyTier(tier);
            this.saveTier();
        }
    }

    /**
     * Get unlocked tiers
     */
    getUnlockedTiers() {
        return Array.from(this.unlockedTiers);
    }

    /**
     * Reset tiers to tier 0 (called when ascending)
     */
    async resetToTier0() {
        console.log('Resetting design tiers to tier 0 after ascend...');

        // Reset unlocked tiers to only tier 0
        this.unlockedTiers = new Set([0]);

        // Set current tier to 0
        this.currentTier = 0;

        // Reset playtime tracking for new run
        this.gameStartTime = Date.now();

        // Reset tier unlock times
        this.tierUnlockTimes = {};

        // Apply tier 0 settings
        await this.applyTier(0);

        // Save the reset state
        this.saveTier();

        console.log('Design tiers reset to tier 0. Unlocked tiers:', Array.from(this.unlockedTiers));
    }

    /**
     * Unlock all tiers for testing
     */
    async unlockAllTiers() {
        console.log('Unlocking all tiers...');

        // Unlock all tiers (0-4)
        for (let tier = 0; tier <= 4; tier++) {
            if (!this.unlockedTiers.has(tier)) {
                this.unlockedTiers.add(tier);
                console.log(`Unlocked tier ${tier}`);
            }
        }

        // Set current tier to highest
        this.currentTier = 4;

        // Apply only the highest tier (4) to ensure all features are enabled
        await this.applyTier(4);

        // Save the unlocked tiers
        this.saveTier();

        // Refresh the Settings tab UI if possible
        if (this.uiManager?.settingsUI?.update) {
            this.uiManager.settingsUI.update();
        } else {
            // Try to manually update the tier selector
            const tierSelector = document.getElementById('tier-selector');
            if (tierSelector) {
                const unlockedTiers = Array.from(this.unlockedTiers);
                Array.from(tierSelector.options).forEach(option => {
                    const tier = parseInt(option.value, 10);
                    option.disabled = !unlockedTiers.includes(tier);
                });
                tierSelector.value = this.currentTier.toString();
            }
        }

        // Show notification
        if (this.uiManager?.showNotification) {
            this.uiManager.showNotification('All design tiers unlocked for testing!', 'success');
        }

        return true;
    }
}
