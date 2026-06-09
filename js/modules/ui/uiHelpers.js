/**
 * uiHelpers.js
 * Shared utility functions for UI rendering.
 */

import { PRODUCERS, UPGRADES, INGREDIENTS } from '../data/index.js';
import { TIER_STYLES } from '../../config/tierColors.js';




let _designTierSystem = null;

/**
 * Initialize UI helpers with design tier system
 * @param {Object} designTierSystem - The design tier system
 */
export function initUIHelpers(designTierSystem) {
    _designTierSystem = designTierSystem;
}

/**
 * Get tier symbol and styles
 * @param {number} tier - Tier number (0-5)
 * @returns {Object} Tier symbol and style configuration
 */
export function getTierSymbol(tier) {
    return TIER_STYLES[tier] || TIER_STYLES[0];
}

/**
 * Get tier-appropriate styling based on current design tier
 * @param {number} itemTier - The tier of the item
 * @returns {Object} Style configuration object
 */
export function getTierAppropriateStyle(itemTier) {
    const currentDesignTier = _designTierSystem ? _designTierSystem.getCurrentTier() : 0;
    const tierSymbol = getTierSymbol(itemTier);

    // Tier 0: Monochrome, no shadows, no transitions
    if (currentDesignTier === 0) {
        return {
            color: '#FFFFFF',
            textShadow: 'none',
            boxShadow: 'none',
            borderGlow: '#FFFFFF',
            gradient: '#FFFFFF',
            transition: 'none',
            fontFamily: "'Courier New', monospace",
            hasGlow: false,
            hasShadows: false,
            hasTransitions: false
        };
    }

    // Tier 1-2: Colors but no shadows/glows, no transitions
    if (currentDesignTier <= 2) {
        return {
            color: tierSymbol.color,
            textShadow: 'none',
            boxShadow: 'none',
            borderGlow: tierSymbol.color,
            gradient: tierSymbol.color,
            transition: 'none',
            fontFamily: "'Orbitron', sans-serif",
            hasGlow: false,
            hasShadows: false,
            hasTransitions: false
        };
    }

    // Tier 3-4: Full effects (colors, shadows, glows, transitions)
    return {
        color: tierSymbol.color,
        textShadow: `0 0 8px ${tierSymbol.color}, 0 0 12px ${tierSymbol.glow}`,
        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.3), 0 0 12px ${tierSymbol.glow}`,
        borderGlow: tierSymbol.borderGlow,
        gradient: tierSymbol.gradient,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Orbitron', sans-serif",
        hasGlow: true,
        hasShadows: true,
        hasTransitions: true
    };
}

/**
 * Strip emojis from text if the current design tier is low (0-2)
 * @param {string} text - Text to process
 * @returns {string} Text with emojis removed if low tier
 */
export function stripEmojisIfLowTier(text) {
    if (!text || typeof text !== 'string') return text;

    // Check current tier
    const currentTier = _designTierSystem ? _designTierSystem.getCurrentTier() : 0;

    // If tier < 3, remove emojis
    if (currentTier < 3) {
        // Remove common emoji characters (Unicode ranges for emojis)
        // This regex removes emojis while preserving HTML tags
        // Includes: symbols (✓, ○, ⚡, ⚙, etc.), emojis, and other Unicode emoji ranges
        return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2190}-\u{21FF}]|[\u{2713}-\u{2714}]|[\u{25CB}-\u{25CF}]|[\u{26A1}]|[\u{2699}]|[\u{2728}]|[\u{1F4F1}]|[\u{1F4BE}]|[\u{1F680}]|[\u{1F3AE}]|[\u{1F9D8}]|[\u{1F319}]|[\u{23F0}]/gu, '')
            .replace(/\s+/g, ' ') // Clean up extra spaces
            .trim();
    }

    return text;
}

/**
 * Animate number with custom formatter (for element counters with 1 decimal)
 */
export function animateNumberWithFormatter(element, startValue, endValue, duration, formatter) {
    if (!element) return;

    const startTime = performance.now();
    const difference = endValue - startValue;

    // If difference is very small, just update directly
    if (Math.abs(difference) < 0.01) {
        element.textContent = formatter(endValue);
        return;
    }

    function update() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (difference * easeProgress);

        // Update text content with custom formatter
        element.textContent = formatter(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatter(endValue);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Get tier for a workstation based on its position in PRODUCERS array
 * @param {Object} prodData - Producer data object
 * @returns {number} Tier number (0-4) or -1 if not found
 */
export function getWorkstationTier(prodData) {
    const index = PRODUCERS.findIndex(p => p.id === prodData.id);
    if (index === -1) return -1; // Not found
    if (index <= 4) return 0;   // Tier 0: 5 workstations (indices 0-4)
    if (index <= 9) return 1;   // Tier 1: 5 workstations (indices 5-9)
    if (index <= 14) return 2;   // Tier 2: 5 workstations (indices 10-14)
    if (index <= 19) return 3;  // Tier 3: 5 workstations (indices 15-19)
    if (index <= 24) return 4;  // Tier 4: 5 workstations (indices 20-24)
    return -1; // Invalid tier
}

/**
 * Get tier for an upgrade based on its position in UPGRADES array
 * Uses fixed index ranges based on data/upgrades.js structure
 * @param {Object} upgData - Upgrade data object
 * @returns {number} Tier number (0-5) or -1 if not found
 */
export function getUpgradeTier(upgData) {
    // Try to find by ID first (fastest)
    const index = UPGRADES.findIndex(u => u.id === upgData.id);

    if (index !== -1) {
        // Tier 0: indices 0-2
        if (index <= 2) return 0;
        // Tier 1: indices 3-5
        if (index <= 5) return 1;
        // Tier 2: indices 6-14 (Workstation + Global Tier 2)
        if (index <= 14) return 2;
        // Tier 3: indices 15-19
        if (index <= 19) return 3;
        // Tier 4: indices 20-21
        if (index <= 21) return 4;
        // Tier 5: indices 22-24
        if (index <= 24) return 5;
    }

    // Fallback: Calculate from recipe ingredients (for tests or dynamic upgrades)
    if (upgData.recipe) {
        let maxTier = 0;
        for (const ingId of Object.keys(upgData.recipe)) {
            const ingredient = INGREDIENTS.find(i => i.id === ingId);
            if (ingredient && typeof ingredient.tier === 'number') {
                maxTier = Math.max(maxTier, ingredient.tier);
            }
        }
        return maxTier;
    }

    // Special/Focus upgrades (treat as Tier 0 or specific tier if needed)
    return 0;
}
