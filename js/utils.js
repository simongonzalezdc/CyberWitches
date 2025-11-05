// Utility Functions

export function formatShort(value) {
    if (value < 1000) {
        return Math.floor(value).toString();
    }
    
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    let tier = 0;
    
    while (value >= 1000 && tier < suffixes.length - 1) {
        value /= 1000;
        tier++;
    }
    
    return value.toFixed(2) + suffixes[tier];
}

export function formatPrecise(value, decimals = 2) {
    return value.toFixed(decimals);
}

export function formatTimeDuration(seconds) {
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
}

// Balance Formulas
export const Balance = {
    prestigeScale: 1_200_000,
    
    prestigePointsFor(lifetimeEarned) {
        return Math.floor(Math.sqrt(Math.max(lifetimeEarned, 0) / this.prestigeScale));
    },
    
    nextPrestigeThreshold(currentEk) {
        return Math.pow(currentEk + 1, 2) * this.prestigeScale;
    },
    
    scaledRecipe(baseRecipe, owned, growth) {
        const scaled = {};
        for (const ingId in baseRecipe) {
            const baseCost = baseRecipe[ingId];
            scaled[ingId] = Math.ceil(baseCost * Math.pow(growth, owned));
        }
        return scaled;
    },
    
    offlineCapSeconds: 43200, // 12 hours
    
    calculateOfflineProduction(elapsedSeconds, productionPerSecond) {
        const cappedTime = Math.min(elapsedSeconds, this.offlineCapSeconds);
        return productionPerSecond * cappedTime;
    }
};

