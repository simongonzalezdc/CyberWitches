/**
 * Design Tier System - Manages progressive revelation of game design
 * Feature 2: Progressive Design Revelation
 * REDESIGNED: Terminal Progression Style
 */

import { COLORS } from '../../config/colorConstants.js';
import { markFirstHeal } from './funnelMetrics.js';
import { playHealCeremonyInBrowser } from './healCeremony.js';

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
        /** @type {null | ((detail: { fromTier: number, toTier: number, at: number }) => void)} */
        this.onTierAdvance = null;
    }

    /**
     * Keep the live document on the current design-system version.
     * If the stored version differs from current, applies the theme for
     * the current tier and persists the new version.
     */
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

    /**
     * Check if a tier should be unlocked based on game state
     */
    checkTierUnlocks() {
        if (!this.gameState) return;

        const ab = this.gameState.ab || 0;
        // UIManager is constructed with { achievements } (not achievementSystem).
        // Also accept window.achievements and legacy misspelled key.
        const achievementSrc =
            this.uiManager?.systems?.achievements
            || (typeof window !== 'undefined' ? window.achievements : null)
            || this.uiManager?.systems?.achievementSystem;
        const unlockedCount = typeof achievementSrc?.getUnlockedCount === 'function'
            ? achievementSrc.getUnlockedCount()
            : 0;
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

        this.notifyTierProgress(ab, unlockedCount);
    }

    /**
     * Player-facing truth: near a gate, say what is still needed (once per threshold).
     * @param {number} ab
     * @param {number} unlockedCount
     */
    notifyTierProgress(ab, unlockedCount) {
        if (typeof window === 'undefined') return;
        const gates = [
            { tier: 1, ab: 500, ach: 3 },
            { tier: 2, ab: 5000, ach: 6 },
            { tier: 3, ab: 50000, ach: 9 },
            { tier: 4, ab: 500000, ach: 12 }
        ];
        for (const g of gates) {
            if (this.unlockedTiers.has(g.tier)) continue;
            const abMet = ab >= g.ab;
            const achMet = unlockedCount >= g.ach;
            if (!abMet && !achMet) continue;
            if (abMet && achMet) continue; // unlock path owns this
            const key = `cw.tierGateHint.${g.tier}`;
            try {
                if (sessionStorage.getItem(key) === '1') continue;
                sessionStorage.setItem(key, '1');
            } catch { /* private mode */ }
            const need = [];
            if (!abMet) need.push(`${g.ab} AB`);
            if (!achMet) need.push(`${g.ach} achievements (have ${unlockedCount})`);
            const msg = `SYSTEM_RESTORE v${g.tier}.0 pending: need ${need.join(' and ')}.`;
            if (typeof window.showNotification === 'function') {
                window.showNotification(msg, 'info', 6000);
            }
            if (typeof window.__appendSystemLog === 'function') {
                window.__appendSystemLog(msg, 'info');
            }
            break; // one hint per check tick
        }
    }

    /**
     * Unlock a tier and apply its effects.
     * Adversarial GD: defer chrome apply until ceremony restore_line so the
     * stranger sees broken → restored (not restored → flash).
     */
    async unlockTier(tier) {
        if (this.unlockedTiers.has(tier)) return;

        const fromTier = this.currentTier;
        this.unlockedTiers.add(tier);
        this.currentTier = Math.max(this.currentTier, tier);
        this.saveTier();
        // Flavor lines → SYSTEM_LOG only (ceremony owns the single toast)
        this.showUnlockNotification(tier, { logOnly: true });

        let chromeApplied = false;
        const applyChrome = async () => {
            if (chromeApplied) return;
            chromeApplied = true;
            await this.applyTier(tier);
            if (tier >= 3 && this.uiManager?.systems?.particleSystem) {
                try { this.uiManager.systems.particleSystem.init(); } catch { /* optional */ }
            }
        };

        try {
            this.emitTierAdvance(fromTier, tier, { applyChrome });
        } catch (e) {
            console.warn('emitTierAdvance failed during unlock', e);
            try { await applyChrome(); } catch (err) { console.warn(err); }
            return;
        }

        // Deferred safety: if ceremony never applied chrome (thrown mid-flight),
        // force apply after ceremony window — never block at t=0 (that kills the reveal).
        if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
            window.setTimeout(() => {
                if (!chromeApplied) {
                    applyChrome().catch((err) => console.warn('late applyChrome failed', err));
                }
            }, 1800);
        }
    }

    /**
     * First-class tier advance bus (heal/share/telemetry subscribe here).
     * @param {number} fromTier
     * @param {number} toTier
     * @param {{ applyChrome?: () => void | Promise<void> }} [opts]
     */
    emitTierAdvance(fromTier, toTier, opts = {}) {
        const detail = { fromTier, toTier, at: Date.now() };
        try {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new window.CustomEvent('hex:tierAdvance', { detail }));
                window.__lastTierAdvance = detail;
                this.playHealMoment(detail, { applyChrome: opts.applyChrome });
                try {
                    markFirstHeal(detail.at);
                } catch { /* private mode */ }
            }
        } catch (e) {
            console.warn('emitTierAdvance failed', e);
            if (typeof opts.applyChrome === 'function') {
                try { opts.applyChrome(); } catch { /* ignore */ }
            }
        }
        if (typeof this.onTierAdvance === 'function') {
            try { this.onTierAdvance(detail); } catch (e) { console.warn(e); }
        }
    }

    /**
     * Diegetic heal moment via ceremony state machine.
     * @param {{ fromTier: number, toTier: number, at: number }} detail
     * @param {{ applyChrome?: () => void | Promise<void> }} [opts]
     */
    playHealMoment(detail, opts = {}) {
        try {
            playHealCeremonyInBrowser(detail, {
                audioSystem: this.audioSystem,
                applyChrome: opts.applyChrome
            });
            if (this.audioSystem && typeof this.audioSystem.playSound === 'function') {
                try { this.audioSystem.playSound('tier_unlock'); } catch { /* optional stinger */ }
            }
        } catch (e) {
            console.warn('playHealMoment failed', e);
            if (typeof opts.applyChrome === 'function') {
                try { opts.applyChrome(); } catch { /* ignore */ }
            }
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

    reapplyThemeForTier(tier) {
        if (tier === 0) {
            this.setTheme({ primary: '#FFFFFF', secondary: '#FFFFFF', accent: '#FFFFFF' });
            return;
        }

        this.setTheme({ primary: '#FF2F6D', secondary: '#26E6FF', accent: '#F5D35C' });
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
     * Unlock flavor — SYSTEM_RESTORE vocabulary only.
     * @param {number} tier
     * @param {{ logOnly?: boolean }} [opts] when true (ceremony path), skip toast stack
     */
    showUnlockNotification(tier, opts = {}) {
        const messages = {
            1: { title: 'SYSTEM_RESTORE v1.0', message: 'COLOR_DRIVERS_LOADED.' },
            2: { title: 'SYSTEM_RESTORE v2.0', message: 'AUDIO_MODULE_ONLINE.' },
            3: { title: 'SYSTEM_RESTORE v3.0', message: 'GRAPHICS_ENGINE_OPTIMIZED.' },
            4: { title: 'SYSTEM_RESTORE v4.0', message: 'FULL_SENSORY_SUITE_ACTIVE.' }
        };

        const msg = messages[tier];
        if (!msg) return;

        // Prefer SYSTEM_LOG for flavor so ceremony owns the single mute-readable toast
        if (opts.logOnly || typeof window !== 'undefined') {
            try {
                if (typeof window.__appendSystemLog === 'function') {
                    window.__appendSystemLog(`${msg.title} — ${msg.message}`, 'success');
                }
            } catch { /* optional */ }
        }
        if (opts.logOnly) return;

        if (this.uiManager?.showNotification) {
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
