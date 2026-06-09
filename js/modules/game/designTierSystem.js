/**
 * Design Tier System - Manages progressive revelation of game design
 * Feature 2: Progressive Design Revelation
 * REDESIGNED: Terminal Progression Style
 */

import { COLORS } from '../../config/colorConstants.js';

const KYANITE_THEME = {
    primary: COLORS.KY_MAGENTA,
    secondary: COLORS.KY_CYAN,
    accent: COLORS.KY_AMBER,
    corruption: COLORS.KY_RED
};

export class DesignTierSystem {
    static DESIGN_SYSTEM_VERSION = 'kyanite-1';
    static DESIGN_SYSTEM_STORAGE_KEY = 'hexcompiler-design-system-version';

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

    async reconcileDesignSystemVersion() {
        const stored = localStorage.getItem(DesignTierSystem.DESIGN_SYSTEM_STORAGE_KEY);
        const current = DesignTierSystem.DESIGN_SYSTEM_VERSION;
        document.documentElement.dataset.designSystemVersion = current;
        if (stored !== current) {
            localStorage.setItem(DesignTierSystem.DESIGN_SYSTEM_STORAGE_KEY, current);
            await this.applyTier(this.currentTier);
        }
    }

    /**
     * Check if a tier should be unlocked based on game state
     */
    checkTierUnlocks() {
        if (!this.gameState) return;

        const ab = this.gameState.ab || 0;
        const unlockedCount = this.uiManager?.systems?.achievementSystem?.getUnlockedCount() || 0;
        // Tier 1: BASIC - 500 AB + 3 Achievements
        if (!this.unlockedTiers.has(1)) {
            if (unlockedCount >= 3 && ab >= 500) {
                this.unlockTier(1);
            }
        }

        // Tier 2: ENHANCED - 5,000 AB + 6 Achievements
        if (!this.unlockedTiers.has(2)) {
            if (unlockedCount >= 6 && ab >= 5000) {
                this.unlockTier(2);
            }
        }

        // Tier 3: TERMINAL (Glass) - 50,000 AB + 9 Achievements
        if (!this.unlockedTiers.has(3)) {
            if (unlockedCount >= 9 && ab >= 50000) {
                this.unlockTier(3);
            }
        }

        // Tier 4: FULL (Audio/Parallax) - 500,000 AB + 12 Achievements
        if (!this.unlockedTiers.has(4)) {
            if (unlockedCount >= 12 && ab >= 500000) {
                this.unlockTier(4);
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
            case 0: // DOS Mode (Monochrome, No Effects)
                this.setTheme({
                    primary: COLORS.KY_CRYSTAL,
                    secondary: COLORS.KY_STEEL,
                    accent: COLORS.KY_CRYSTAL,
                    corruption: COLORS.KY_RED
                });
                this.toggleAnimations(false);
                this.toggleAudio(false, false);
                break;
            case 1: // Basic Color (16-bit colors)
                this.setTheme(KYANITE_THEME);
                this.toggleAnimations(false);
                this.toggleAudio(false, false);
                break;
            case 2: // Enhanced (Sound Effects + Color)
                this.setTheme(KYANITE_THEME);
                this.toggleAnimations(true); // Minimal animations
                this.toggleAudio(true, false); // SFX only
                break;
            case 3: // Terminal (Glassmorphism + Full Animations)
                this.setTheme(KYANITE_THEME);
                this.toggleAnimations(true);
                this.toggleAudio(true, false);
                break;
            case 4: // Full (Music + Parallax)
                this.setTheme(KYANITE_THEME);
                this.toggleAnimations(true);
                this.toggleAudio(true, true); // SFX + Music
                break;
        }
    }

    async reconcileDesignSystemVersion() {
        const root = document.documentElement;
        root.dataset.designSystemVersion = DesignTierSystem.DESIGN_SYSTEM_VERSION;

        try {
            const storedVersion = localStorage.getItem(DesignTierSystem.DESIGN_SYSTEM_STORAGE_KEY);
            if (storedVersion !== DesignTierSystem.DESIGN_SYSTEM_VERSION) {
                localStorage.setItem(DesignTierSystem.DESIGN_SYSTEM_STORAGE_KEY, DesignTierSystem.DESIGN_SYSTEM_VERSION);
                this.applyThemeForCurrentTier();
            }
        } catch (error) {
            console.warn('Unable to persist design system version:', error);
        }
    }

    applyThemeForCurrentTier() {
        if (this.currentTier === 0) {
            this.setTheme({
                primary: COLORS.KY_CRYSTAL,
                secondary: COLORS.KY_STEEL,
                accent: COLORS.KY_CRYSTAL,
                corruption: COLORS.KY_RED
            });
            return;
        }

        this.setTheme(KYANITE_THEME);
    }

    setTheme(colors) {
        document.documentElement.style.setProperty('--color-code', colors.secondary.toUpperCase());
        document.documentElement.style.setProperty('--color-magic', colors.accent.toUpperCase());
        document.documentElement.style.setProperty('--color-corruption', (colors.corruption || COLORS.KY_RED).toUpperCase());
    }

    toggleAnimations(enabled) {
        if (enabled) {
            document.body.classList.remove('no-animations');
            document.body.classList.add('full-animations');
        } else {
            document.body.classList.add('no-animations');
            document.body.classList.remove('full-animations');
        }
    }

    toggleAudio(sfx, music) {
        if (!this.audioSystem) return;

        if (sfx) this.audioSystem.enableSoundEffects?.();
        else this.audioSystem.disableSoundEffects?.();

        if (music) this.audioSystem.enableMusic?.();
        else this.audioSystem.disableMusic?.();
    }

    /**
     * Show unlock notification
     */
    showUnlockNotification(tier) {
        const messages = {
            1: { title: 'SYSTEM_UPDATE: v1.0', message: 'COLOR_DRIVERS_LOADED.' },
            2: { title: 'SYSTEM_UPDATE: v2.0', message: 'AUDIO_MODULE_ONLINE.' },
            3: { title: 'SYSTEM_UPDATE: v3.0', message: 'GRAPHICS_ENGINE_OPTIMIZED.' },
            4: { title: 'SYSTEM_UPDATE: v4.0', message: 'FULL_SENSORY_SUITE_ACTIVE.' }
        };

        const msg = messages[tier];
        if (msg && this.uiManager?.showNotification) {
            this.uiManager.showNotification(msg.title, 'success');
            setTimeout(() => {
                this.uiManager.showNotification(msg.message, 'info');
            }, 2000);
        }
    }

    loadTier() {
        const saved = localStorage.getItem('cw.designTier');
        return saved !== null ? parseInt(saved, 10) : 0;
    }

    loadUnlockedTiers() {
        const saved = localStorage.getItem('cw.unlockedTiers');
        if (saved) {
            try {
                this.unlockedTiers = new Set(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading unlocked tiers:', e);
            }
        }
    }

    saveTier() {
        localStorage.setItem('cw.designTier', this.currentTier.toString());
        localStorage.setItem('cw.unlockedTiers', JSON.stringify(Array.from(this.unlockedTiers)));
    }

    getCurrentTier() {
        return this.currentTier;
    }

    async setTier(tier) {
        if (this.unlockedTiers.has(tier)) {
            this.currentTier = tier;
            await this.applyTier(tier);
            this.saveTier();
        }
    }

    getUnlockedTiers() {
        return Array.from(this.unlockedTiers);
    }

    async resetToTier0() {
        this.unlockedTiers = new Set([0]);
        this.currentTier = 0;
        this.gameStartTime = Date.now();
        this.tierUnlockTimes = {};
        await this.applyTier(0);
        this.saveTier();
    }
    
    async unlockAllTiers() {
        for (let i = 0; i <= 4; i++) this.unlockedTiers.add(i);
        this.setTier(4);
    }
}
