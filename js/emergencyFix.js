/**
 * Emergency State Fixer
 * Run this if your save is corrupted (NaN values)
 */
window.fixCorruptedSave = function() {
    console.log('🚑 Starting emergency save repair...');
    
    if (!window.gameState) {
        console.error('❌ GameState not found!');
        return;
    }

    let fixed = false;

    // Fix AB
    if (isNaN(window.gameState.ab) || !isFinite(window.gameState.ab)) {
        console.log('🔧 Fixing corrupted AB (was NaN)');
        window.gameState.ab = 0;
        fixed = true;
    }

    // Fix AB Total
    if (isNaN(window.gameState.abTotalEarned) || !isFinite(window.gameState.abTotalEarned)) {
        console.log('🔧 Fixing corrupted AB Total (was NaN)');
        window.gameState.abTotalEarned = 0;
        fixed = true;
    }

    // Fix Lifetime
    if (isNaN(window.gameState.prestigeLifetimeEarned) || !isFinite(window.gameState.prestigeLifetimeEarned)) {
        console.log('🔧 Fixing corrupted Lifetime Earnings (was NaN)');
        window.gameState.prestigeLifetimeEarned = 0;
        fixed = true;
    }

    // Fix Inventory
    if (window.gameState.inventory) {
        for (const key in window.gameState.inventory) {
            if (isNaN(window.gameState.inventory[key])) {
                console.log(`🔧 Fixing corrupted inventory item: ${key}`);
                window.gameState.inventory[key] = 0;
                fixed = true;
            }
        }
    }

    if (fixed) {
        console.log('✅ Repairs complete. Saving clean state...');
        window.gameState.saveGameStateImmediate();
        console.log('🔄 Reloading page in 2 seconds...');
        setTimeout(() => window.location.reload(), 2000);
    } else {
        console.log('✅ No corruption detected.');
    }
};

// Auto-run on load if NaN is detected
if (window.gameState && (isNaN(window.gameState.ab) || isNaN(window.gameState.abTotalEarned))) {
    console.warn('⚠️ NaN Detected on load! Auto-running repair...');
    window.fixCorruptedSave();
}

