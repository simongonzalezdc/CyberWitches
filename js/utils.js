// Utility Functions
// Week 3: Import memoization for expensive calculations
import { memoize, memoizeWithKey } from './utils/memoization.js';

// Week 3: Memoize formatShort since it's called frequently with same values
export const formatShort = memoize((value) => {
    if (value < 1000) {
        return Math.floor(value).toString();
    }

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    let tier = 0;
    let num = value;

    while (num >= 1000 && tier < suffixes.length - 1) {
        num /= 1000;
        tier++;
    }

    return num.toFixed(2) + suffixes[tier];
}, { maxSize: 500 }); // Cache up to 500 formatted values

export const formatNumber = formatShort;


export function formatPrecise(value, decimals = 2) {
    return value.toFixed(decimals);
}

/**
 * Format number with 1 decimal place (for element counters)
 */
export function formatOneDecimal(value) {
    if (value < 1000) {
        return value.toFixed(1);
    }

    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    let tier = 0;
    let num = value;

    while (num >= 1000 && tier < suffixes.length - 1) {
        num /= 1000;
        tier++;
    }

    return num.toFixed(1) + suffixes[tier];
}

// Week 3: Memoize formatTimeDuration since time values repeat frequently
export const formatTimeDuration = memoize((seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds - hrs * 3600) / 60);
    const secs = Math.floor(seconds - hrs * 3600 - mins * 60);

    if (hrs > 0) {
        return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
        return `${mins}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}, { maxSize: 200 }); // Cache up to 200 time formats

// Balance Formulas
// Week 3: Memoize expensive balance calculations

export const Balance = {
    prestigeScale: 1_200_000,

    // Week 3: Memoize prestige calculations
    prestigePointsFor: memoize((lifetimeEarned) => {
        return Math.floor(Math.sqrt(Math.max(lifetimeEarned, 0) / Balance.prestigeScale));
    }, { maxSize: 100 }),

    nextPrestigeThreshold: memoize((currentEk) => {
        return Math.pow(currentEk + 1, 2) * Balance.prestigeScale;
    }, { maxSize: 100 }),

    // Week 3: Memoize recipe scaling (expensive calculation)
    scaledRecipe: memoizeWithKey(
        (baseRecipe, owned, growth) => {
            const scaled = {};
            for (const ingId in baseRecipe) {
                const baseCost = baseRecipe[ingId];
                scaled[ingId] = Math.ceil(baseCost * Math.pow(growth, owned));
            }
            return scaled;
        },
        (baseRecipe, owned, growth) => {
            // Generate cache key from recipe ID, owned count, and growth
            const recipeKey = JSON.stringify(baseRecipe);
            return `${recipeKey}-${owned}-${growth}`;
        },
        200 // Cache up to 200 scaled recipes
    ),

    offlineCapSeconds: 43200, // 12 hours

    calculateOfflineProduction: memoize((elapsedSeconds, productionPerSecond) => {
        const cappedTime = Math.min(elapsedSeconds, Balance.offlineCapSeconds);
        return productionPerSecond * cappedTime;
    }, {
        keyFn: (elapsedSeconds, productionPerSecond) => `${elapsedSeconds}-${productionPerSecond}`,
        maxSize: 100
    })
};

