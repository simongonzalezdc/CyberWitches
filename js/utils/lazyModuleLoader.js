/**
 * Lazy Module Loader Utility
 * Loads the meditation module on demand and returns the manager instance.
 */

export async function loadMeditationSystem() {
    // Parse/load the meditation module on demand (the browser caches it after the
    // first call). The MeditationManager instance itself is constructed in
    // gameInit.js and exposed via the UIManager's systems registry.
    await import('../modules/game/meditationManager.js');
    return window.uiManager?.systems?.meditationManager;
}
