/**
 * Design Tier System - Manages progressive revelation of game design
 * Feature 2: Progressive Design Revelation
 */

export class DesignTierSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTier = this.loadTier();
        this.unlockedTiers = new Set([0]); // Tier 0 always unlocked
        this.loadUnlockedTiers();
    }
    
    /**
     * Check if a tier should be unlocked based on game state
     */
    checkTierUnlocks() {
        const ab = this.gameState.ab;
        // Get achievement count from the achievement system if available
        // Use getUnlockedCount() instead of getUnlockedAchievements() which doesn't exist
        const unlockedCount = window.achievements && typeof window.achievements.getUnlockedCount === 'function' 
            ? window.achievements.getUnlockedCount() 
            : 0;
        // Prestige count - actual number of ascensions (prestige completions)
        const prestigeCount = this.gameState.prestigeCount || 0;
        
        // Tier 1: First achievement or 100 AB
        if (!this.unlockedTiers.has(1)) {
            if (unlockedCount > 0 || ab >= 100) {
                this.unlockTier(1);
            }
        }
        
        // Tier 2: First prestige or 1000 AB
        if (!this.unlockedTiers.has(2)) {
            if (prestigeCount >= 1 || ab >= 1000) {
                this.unlockTier(2);
            }
        }
        
        // Tier 3: Second prestige or 10,000 AB
        if (!this.unlockedTiers.has(3)) {
            if (prestigeCount >= 2 || ab >= 10000) {
                this.unlockTier(3);
            }
        }
        
        // Tier 4: Third prestige or 100,000 AB
        if (!this.unlockedTiers.has(4)) {
            if (prestigeCount >= 3 || ab >= 100000) {
                this.unlockTier(4);
            }
        }
    }
    
    /**
     * Unlock a tier and apply its effects
     */
    unlockTier(tier) {
        if (this.unlockedTiers.has(tier)) return;
        
        this.unlockedTiers.add(tier);
        this.currentTier = Math.max(this.currentTier, tier);
        this.applyTier(tier);
        this.saveTier();
        this.showUnlockNotification(tier);
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
        switch(tier) {
            case 0:
                this.applyTier0();
                break;
            case 1:
                this.applyTier1();
                break;
            case 2:
                this.applyTier2();
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
        // Try multiple possible names for particle system
        if (window.particleSystem) {
            window.particleSystem.disable();
        } else if (window.particleEffects) {
            window.particleEffects.disable();
        }
        
        // Disable sound effects (Tier 0 = no sound)
        if (window.audioSystem && window.audioSystem.disableSoundEffects) {
            window.audioSystem.disableSoundEffects();
        }
        
        // Disable music (Tier 0 = no music)
        if (window.audioSystem && window.audioSystem.disableMusic) {
            window.audioSystem.disableMusic();
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
        // Don't add color-transitions - we want zero animations
        
        // Keep particle canvas disabled
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'none';
        }
        
        // Disable any animation systems
        if (window.particleSystem) {
            window.particleSystem.disable();
        } else if (window.particleEffects) {
            window.particleEffects.disable();
        }
        
        // Disable sound effects (Tier 1 = no sound, only color)
        if (window.audioSystem && window.audioSystem.disableSoundEffects) {
            window.audioSystem.disableSoundEffects();
        }
        
        // Disable music (Tier 1 = no music)
        if (window.audioSystem && window.audioSystem.disableMusic) {
            window.audioSystem.disableMusic();
        }
    }
    
    applyTier2() {
        // Tier 2 looks exactly like Tier 1 (basic color CLI) but with sound effects
        // Simply call applyTier1() to get all the visual settings, then enable sound
        this.applyTier1();
        
        // Disable music (Tier 2 = sound effects only, no music)
        if (window.audioSystem && window.audioSystem.disableMusic) {
            window.audioSystem.disableMusic();
        }
        
        // Enable sound effects (the only difference from Tier 1)
        if (window.audioSystem) {
            window.audioSystem.enableSoundEffects();
        }
    }
    
    applyTier3() {
        // Disable music (Tier 3 = animations + sound effects, no music yet)
        if (window.audioSystem && window.audioSystem.disableMusic) {
            window.audioSystem.disableMusic();
        }
        
        // Enable sound effects (Tier 3 includes Tier 2's sound effects)
        if (window.audioSystem && window.audioSystem.enableSoundEffects) {
            window.audioSystem.enableSoundEffects();
        }
        
        // Enable animations and particle effects
        document.body.classList.add('full-animations');
        
        // Enable particle canvas
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'block';
        }
        
        // Try multiple possible names for particle system
        if (window.particleSystem) {
            window.particleSystem.enable();
        } else if (window.particleEffects) {
            window.particleEffects.enable();
        }
    }
    
    async applyTier4() {
        // Apply Tier 3 visuals first (animations, particles, sound effects)
        // But DON'T call applyTier3() because it disables music!
        // Instead, manually apply Tier 3 features without disabling music
        
        // Disable music (but we'll re-enable it right after)
        // Actually, don't disable - just skip that part
        // Enable sound effects (Tier 3 includes Tier 2's sound effects)
        if (window.audioSystem && window.audioSystem.enableSoundEffects) {
            window.audioSystem.enableSoundEffects();
        }
        
        // Enable animations and particle effects
        document.body.classList.add('full-animations');
        
        // Enable particle canvas
        const particleCanvas = document.getElementById('particle-canvas');
        if (particleCanvas) {
            particleCanvas.style.display = 'block';
        }
        
        // Try multiple possible names for particle system
        if (window.particleSystem) {
            window.particleSystem.enable();
        } else if (window.particleEffects) {
            window.particleEffects.enable();
        }
        
        // Enable background music (the only difference from Tier 3)
        if (window.audioSystem) {
            console.log('applyTier4: Enabling music...');
            await window.audioSystem.enableMusic();
            console.log('applyTier4: Music enabled');
            
            // If audio context is suspended, try to resume it
            if (window.audioSystem.audioContext && window.audioSystem.audioContext.state === 'suspended') {
                try {
                    await window.audioSystem.audioContext.resume();
                    console.log('applyTier4: Audio context resumed');
                    // Restart music after resuming
                    await window.audioSystem.startMusic();
                } catch (error) {
                    console.error('applyTier4: Failed to resume audio context:', error);
                    // Music will start when user interacts with page
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
        if (msg && window.showNotification) {
            // Use the existing notification system which now supports HTML
            window.showNotification(msg.title, 'success');
            setTimeout(() => {
                window.showNotification(msg.message, 'info');
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
     * Unlock all tiers for testing
     */
    async unlockAllTiers() {
        console.log('Unlocking all tiers...');
        console.log('Current unlocked tiers before:', Array.from(this.unlockedTiers));
        
        // Unlock all tiers (0-4)
        for (let tier = 0; tier <= 4; tier++) {
            if (!this.unlockedTiers.has(tier)) {
                this.unlockedTiers.add(tier);
                console.log(`Unlocked tier ${tier}`);
            }
        }
        
        // Set current tier to highest
        this.currentTier = 4;
        console.log('Setting current tier to:', this.currentTier);
        
        // Apply only the highest tier (4) to ensure all features are enabled
        // Don't apply all tiers sequentially as that would disable music between tiers
        await this.applyTier(4);
        console.log(`Applied tier 4 styling and features (includes all previous tiers)`);
        
        // Save the unlocked tiers
        this.saveTier();
        console.log('Saved unlocked tiers to localStorage');
        
        // Refresh the Settings tab UI if the function exists
        if (typeof window.updateSettingsTab === 'function') {
            window.updateSettingsTab();
            console.log('Updated Settings tab UI');
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
                console.log('Updated tier selector manually');
            }
        }
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('All design tiers unlocked for testing!', 'success');
        }
        
        console.log('All design tiers unlocked:', Array.from(this.unlockedTiers));
        console.log('Current tier:', this.currentTier);
        return true;
    }
}

