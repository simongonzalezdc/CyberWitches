/**
 * Game Initialization Module
 * Handles the setup and wiring of all game systems.
 */

// ── Critical-path static imports (needed for boot / first paint) ──────────
import { UIManager } from './modules/ui/uiManager.js';
import { showNotification } from './modules/ui/notifications.js';
import { appendSystemLog, ensureSystemLogEmptyState } from './modules/ui/systemLog.js';
import { announceToScreenReader } from './accessibility.js';
import { InputManager } from './modules/ui/inputManager.js';
import { CraftingManager } from './modules/game/craftingManager.js';
import { GameState } from './gameState.js';
import { DailyRituals } from './dailyRituals.js';
import { AchievementSystem } from './achievements.js';
import { ComboSystem } from './comboSystem.js';
import { EventSystem } from './eventSystem.js';
import { CastManager } from './modules/game/castManager.js';
import { PrestigeManager } from './modules/game/prestigeManager.js';
import { InscriptionsManager } from './modules/game/inscriptionsManager.js';
import { DesignTierSystem } from './modules/game/designTierSystem.js';
import { FadingThemeSystem } from './modules/game/fadingThemeSystem.js';
import { initUIHelpers } from './modules/ui/uiHelpers.js';
import accessibilityManager from './accessibility.js';
import featureIndicatorManager from './featureIndicators.js';
import { handleError } from './errorHandler.js';
import { UnifiedGameLoop } from './core/UnifiedGameLoop.js';
import { createErrorBoundary } from './core/ErrorBoundary.js';
import { errorReporter } from './modules/core/errorReporter.js';
import { INGREDIENTS } from './modules/data/ingredients.js';
import { PRODUCERS } from './modules/data/producers.js';
import { UPGRADES } from './modules/data/upgrades.js';
import { HIDDEN_RECIPES } from './modules/data/recipes.js';
import { PRESTIGE_BONUSES } from './modules/data/prestige.js';
import { formatShort, formatNumber, formatTimeDuration } from './utils.js';
import { ELEMENT_SPECIALIZATIONS } from './elementSpecialization.js';

// ── Lazy-loaded modules (dynamic import → separate chunk) ────────────────
// These are fetched AFTER the critical bundle parses and the game shell renders.
// Each module is loaded on demand: audio on first user gesture, meditation when
// the tab unlocks (Prestige 1), PWA/tutorial/particles shortly after boot.
const lazy = {
    get AudioSystem() { return import('./audioSystem.js').then(m => m.AudioSystem); },
    get MeditationManager() { return import('./modules/game/meditationManager.js').then(m => m.MeditationManager); },
    get PWAFeaturesManager() { return import('./modules/pwa/pwaFeaturesManager.js').then(m => m.PWAFeaturesManager); },
    get ParticleSystem() { return import('./modules/game/particleSystem.js').then(m => m.ParticleSystem); },
    get TutorialSystem() { return import('./modules/game/tutorialSystem.js').then(m => m.TutorialSystem); },
    get animations() { return import('./animations.js'); },
    get setAudioSystem() { return import('./audio/audioAccess.js').then(m => m.setAudioSystem); }
};

export async function initGame() {
    console.info('Initializing Hex Compiler...');

    try {
        // 0. Install error reporter for production monitoring
        errorReporter.install();

        // 1. Expose the static data tables as globals. Several modules (inventoryUI,
        //    experimentUI, balanceAnalytics, balanceTesting, economyBalancing) read
        //    window.INGREDIENTS / window.HIDDEN_RECIPES / window.PRODUCERS etc., but
        //    nothing ever set them — so e.g. the discovered-recipes list and inventory
        //    item names silently failed to render (the error was swallowed by the DOM
        //    batcher). Set them BEFORE any system or UI is created.
        window.INGREDIENTS = INGREDIENTS;
        window.PRODUCERS = PRODUCERS;
        window.UPGRADES = UPGRADES;
        window.HIDDEN_RECIPES = HIDDEN_RECIPES;
        window.PRESTIGE_BONUSES = PRESTIGE_BONUSES;

        // 2. Initialize Game State
        const gameState = new GameState();

        // 3. Initialize Core Systems
        const dailyRituals = new DailyRituals(gameState);
        const achievements = new AchievementSystem(gameState);
        const comboSystem = new ComboSystem(gameState);
        const eventSystem = new EventSystem(gameState);
        const craftingManager = new CraftingManager(gameState);

        // 4. Initialize UI Manager (needs core systems for sub-managers)
        // MeditationState is not yet initialized, so we pass what we have.
        // Managers that depend on UI will be initialized after.
        const uiManager = new UIManager(gameState, {
            dailyRituals,
            achievements,
            comboSystem,
            eventSystem,
            craftingManager
        });

        // Bind the global notification + screen-reader bridges. Many systems
        // (gameState milestones, comboSystem, questSystem, tutorial, and the
        // save-load error notices in errorHandler) call
        // `window.showNotification(...)` / `window.announceToScreenReader(...)`
        // guarded by `if (window.showNotification)`. Nothing ever assigned these
        // globals, so every one of those notifications was a silent no-op.
        window.showNotification = showNotification;
        ensureSystemLogEmptyState();


        // Diegetic cast overclock feedback (replaces dead jackpot hook)
        window.triggerBonusFeedback = (bonusType, multiplier) => {
            const mult = Number(multiplier) || 1;
            const multLabel = `×${mult.toFixed(1)}`;
            let copy;
            if (bonusType === 'critical_compile' || bonusType === 'jackpot') {
                copy = `CRITICAL_COMPILE ${multLabel}`;
            } else if (bonusType === 'compile_overclock' || bonusType === 'bonus') {
                copy = `COMPILE_OVERCLOCK ${multLabel}`;
            } else {
                copy = `COMPILE_EVENT ${multLabel}`;
            }
            try {
                const castBtn = document.getElementById('cast-button');
                const rect = castBtn ? castBtn.getBoundingClientRect() : null;
                const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
                const y = rect ? rect.top : window.innerHeight * 0.4;
                if (uiManager?.floatingTextUI?.show) {
                    uiManager.floatingTextUI.show(copy, x, y, 'crit');
                } else if (typeof showNotification === 'function') {
                    showNotification(copy, 'success', 2000);
                }
                appendSystemLog(copy, 'success');
            } catch (error) {
                console.warn('triggerBonusFeedback failed:', error);
            }
        };

        window.announceToScreenReader = announceToScreenReader;
        window.errorReporter = errorReporter;

        // Formatting helpers are read as globals by several UI modules.
        // Animation helpers are loaded lazily but stubbed here so callers
        // don't crash before the lazy chunk arrives.
        window.formatShort = formatShort;
        window.formatNumber = formatNumber;
        window.formatTimeDuration = formatTimeDuration;
        window.pulseElement = () => {};
        window.shakeElement = () => {};
        window.slideIn = () => {};

        // 5. Initialize Feature Managers (depend on GameState and often UIManager)
        // Week 2: Wrap critical systems with error boundaries for module isolation
        const inputManagerBoundary = createErrorBoundary('InputManager');
        const inputManager = inputManagerBoundary.wrap(() => new InputManager(gameState, uiManager, craftingManager))();

        const castManagerBoundary = createErrorBoundary('CastManager');
        const castManager = castManagerBoundary.wrap(() => new CastManager(gameState, uiManager, comboSystem, eventSystem))();

        const prestigeManager = new PrestigeManager(gameState, uiManager);
        const inscriptionsManager = new InscriptionsManager(gameState, uiManager);

        // Design Tier System — audioSystem is null at first; lazy-loaded later.
        const designTierSystem = new DesignTierSystem(gameState, uiManager, null);
        initUIHelpers(designTierSystem);
        // Batch 1: enforce Tier 0 (or saved tier) at first paint + design-system root contract
        try {
            await designTierSystem.reconcileDesignSystemVersion();
            const bootTier = typeof designTierSystem.getCurrentTier === 'function'
                ? designTierSystem.getCurrentTier()
                : (designTierSystem.currentTier ?? 0);
            await designTierSystem.applyTier(bootTier);
        } catch (error) {
            console.warn('Design tier boot apply failed:', error);
            document.body.classList.add('tier-0');
        }

        const fadingThemeSystem = new FadingThemeSystem(gameState, designTierSystem);

        // 6. Wire up systems to UIManager
        uiManager.systems.inputManager = inputManager;
        uiManager.systems.castManager = castManager;
        uiManager.systems.prestigeManager = prestigeManager;
        uiManager.systems.inscriptionsManager = inscriptionsManager;
        uiManager.systems.designTierSystem = designTierSystem;
        uiManager.systems.fadingThemeSystem = fadingThemeSystem;
        uiManager.systems.accessibilityManager = accessibilityManager;
        // Lazy systems are wired when their chunks load (see loadLazySystems below)

        // 6b. Load ModalManager (needed before story intro) and non-critical UIs
        await uiManager.initModalManager();

        // 7. Initialize specific systems
        dailyRituals.init();

        // 8. Set up Game State callbacks
        setupGameStateCallbacks(gameState, uiManager, dailyRituals, castManager);

        // 9. Initialize Unified Game Loop (replaces multiple setInterval calls)
        const gameLoop = new UnifiedGameLoop();

        // Assign gameLoop to window BEFORE particle system checks for it
        // This ensures particle system can detect UnifiedGameLoop management
        window.gameLoop = gameLoop;

        // Register game state tick for logic updates (10 TPS)
        gameLoop.registerLogicUpdate((delta) => {
            gameState.tick(delta, 1.0); // Pass delta and event multiplier
        });

        // Register visual updates (60 FPS) - particle systems, animations
        // Particle system is loaded lazily; the guard handles the null case.
        gameLoop.registerVisualUpdate((_delta) => {
            const ps = uiManager.systems.particleSystem;
            if (ps && ps.initialized && !ps.isPaused) {
                ps.animate(performance.now());
            }
        });

        // Register render callbacks (60 FPS with interpolation)
        gameLoop.registerRender((_alpha) => {
            // Update UI at 60 FPS for smooth updates
            uiManager.updateAllUI();
            uiManager.hudUI.updateABPS();
            uiManager.hudUI.updateComboDisplay();
        });

        // Register periodic checks (integrated into game loop)
        gameLoop.registerPeriodicCheck('tierCheck', () => {
            try {
                designTierSystem.checkTierUnlocks();
            } catch (error) {
                console.error('Error checking tier unlocks:', error);
            }
        });

        const shownAchievementNotifications = new Set();
        gameLoop.registerPeriodicCheck('achievementCheck', () => {
            if (achievements) {
                const newAchievements = achievements.checkAchievements();
                for (const achievement of newAchievements) {
                    if (!shownAchievementNotifications.has(achievement.name)) {
                        shownAchievementNotifications.add(achievement.name);
                        uiManager.showNotification(`Achievement: ${achievement.name}!`, 'success');
                        designTierSystem.checkTierUnlocks();
                        if (typeof uiManager.announceToScreenReader === 'function') {
                            uiManager.announceToScreenReader(`Achievement unlocked: ${achievement.name}`, 'polite');
                        }
                    }
                }
            }
        });

        gameLoop.registerPeriodicCheck('eventCheck', () => {
            if (eventSystem) {
                eventSystem.checkForEvents();
                eventSystem.updateEvents(1.0);
                uiManager.hudUI.updateActiveEvents();
            }
        });

        gameLoop.registerPeriodicCheck('hudUpdate', () => {
            uiManager.hudUI.updateABPS();
            uiManager.hudUI.updateComboDisplay();
        });

        // Start unified game loop (replaces gameState.start() tick loop)
        // Note: window.gameLoop was already assigned above for particle system detection
        gameState.loadGameState(); // Load state but don't start old tick loop
        // Register save-on-hide/close handlers. startTickLoop() is skipped under
        // the unified loop, so this is where the data-loss-prevention flush gets
        // wired up for the real game.
        gameState.registerLifecycleHandlers();
        gameLoop.start();

        // 10. Initial UI Update
        uiManager.updateAllUI();

        // Switch to first tab
        uiManager.switchTab('workstations');

        // 11. Kick off lazy loading in the background. The game shell is already
        // interactive at this point — audio/meditation/PWA/particles load async.
        loadLazySystems(gameState, uiManager, designTierSystem, gameLoop);

        // Load non-critical UI modules (stats, dailies, boons, experiment) in background
        uiManager.initLazyUIs().catch(e => console.warn('Lazy UI init failed:', e));

        // 12. Show Story Intro if needed
        if (!gameState.storyFlags.introShown) {
            uiManager.modalManager.showStoryIntroduction();
        }

        // 13. Check Feature Indicators
        if (featureIndicatorManager) {
            featureIndicatorManager.updateIndicators();
        }

        console.info('Hex Compiler initialization complete.');

        return { gameState, uiManager, gameLoop };

    } catch (error) {
        console.error('Critical error during game initialization:', error);
        handleError(error, 'initGame', true);
        throw error;
    }
}

/**
 * Load heavy subsystems in the background after the game shell is interactive.
 * Each module is loaded independently so one failure doesn't block others.
 */
async function loadLazySystems(gameState, uiManager, designTierSystem, _gameLoop) {
    // Load animations first (small, needed for UI feedback)
    lazy.animations.then(mod => {
        window.pulseElement = mod.pulseElement;
        window.shakeElement = mod.shakeElement;
        window.slideIn = mod.slideIn;
    }).catch(e => console.warn('Lazy: animations failed to load', e));

    // Load PWA features (service worker registration, install prompt)
    lazy.PWAFeaturesManager.then(PWAFeaturesManager => {
        const pwaManager = new PWAFeaturesManager(gameState, uiManager);
        uiManager.systems.pwaManager = pwaManager;
        pwaManager.init();
    }).catch(e => console.warn('Lazy: PWA manager failed to load', e));

    // Load tutorial system
    lazy.TutorialSystem.then(TutorialSystem => {
        const tutorialSystem = new TutorialSystem(gameState);
        uiManager.systems.tutorialSystem = tutorialSystem;
    }).catch(e => console.warn('Lazy: tutorial system failed to load', e));

    // Load particle system (Tier 3+ only)
    if (designTierSystem.getCurrentTier() >= 3) {
        lazy.ParticleSystem.then(ParticleSystem => {
            const particleSystem = new ParticleSystem(gameState);
            uiManager.systems.particleSystem = particleSystem;
            particleSystem.init();
        }).catch(e => console.warn('Lazy: particle system failed to load', e));
    }

    // Load audio system on first user gesture (avoids autoplay warnings)
    loadAudioOnGesture(gameState, uiManager, designTierSystem);
}

/**
 * AudioSystem is ~80KB minified. Defer loading until the user actually
 * interacts with the page (click / touch / keydown). This avoids creating
 * an AudioContext before a user gesture (which triggers autoplay warnings
 * in Chrome) and saves bandwidth on slow connections.
 */
function loadAudioOnGesture(gameState, uiManager, designTierSystem) {
    let audioLoaded = false;

    const loadAndUnlock = async () => {
        if (audioLoaded) return;
        audioLoaded = true;

        try {
            const [AudioSystem, setAudioSystem] = await Promise.all([
                lazy.AudioSystem,
                lazy.setAudioSystem
            ]);

            const audioSystem = new AudioSystem();
            setAudioSystem(audioSystem);
            uiManager.systems.audioSystem = audioSystem;

            // Wire audio into designTierSystem (was null during boot)
            designTierSystem.audioSystem = audioSystem;

            // Resume AudioContext if suspended
            if (audioSystem.audioContext?.state === 'suspended') {
                try { await audioSystem.audioContext.resume(); } catch (_) { /* ignore */ }
            }

            // Enable audio based on current tier
            const tier = designTierSystem.getCurrentTier();
            if (tier >= 2 && audioSystem.enableSoundEffects) {
                await audioSystem.enableSoundEffects();
            }
            if (tier >= 4 && audioSystem.enableMusic && !audioSystem.musicEnabled) {
                await audioSystem.enableMusic();
                await audioSystem.startMusic();
            }
        } catch (e) {
            console.warn('Lazy: audio system failed to load', e);
        }
    };

    document.addEventListener('click', loadAndUnlock, { once: false });
    document.addEventListener('touchstart', loadAndUnlock, { once: false });
    document.addEventListener('keydown', loadAndUnlock, { once: false });
}

/**
 * Load the meditation subsystem on demand. Called when the meditation tab
 * unlocks (Prestige 1) or when a prestige completes. Returns the manager
 * instance (or null on failure).
 */
export async function loadMeditationSystem(gameState, uiManager) {
    try {
        const MeditationManager = await lazy.MeditationManager;
        const meditationManager = new MeditationManager(gameState, uiManager);
        uiManager.systems.meditationManager = meditationManager;
        return meditationManager;
    } catch (e) {
        console.warn('Lazy: meditation manager failed to load', e);
        return null;
    }
}

function setupGameStateCallbacks(gameState, uiManager, dailyRituals, castManager) {
    gameState.onAbChanged = (_newValue) => {
        uiManager.hudUI.updateABDisplay(); // Use the new method
        
        if (dailyRituals) {
            dailyRituals.updateTaskProgress('earn_ab', '', gameState.abTotalEarned);
        }
    };

    gameState.onWorkstationCrafted = (wsId, count) => {
        if (dailyRituals) {
            dailyRituals.updateTaskProgress('craft', wsId, gameState.totalWorkstationsCrafted);
            dailyRituals.updateTaskProgress('own', wsId, count);
        }
        uiManager.debouncedUIUpdate('workstationsTab', () => uiManager.workstationUI.update());
        try {
            const name = (window.PRODUCERS || []).find?.(p => p.id === wsId)?.displayName || wsId;
            appendSystemLog(`CRAFT_OK ${name} ×${count}`, 'success');
        } catch { /* log optional */ }
    };

    gameState.onUpgradePurchased = () => {
        uiManager.debouncedUIUpdate('inscriptionsTab', () => uiManager.inscriptionsUI.update());
    };

    gameState.onPrestigeCompleted = async (_ekGained) => {
        // Pass BOTH args: the method is showElementSpecializationChoice(ELEMENT_SPECIALIZATIONS,
        // updateAllUI). Previously only updateAllUI was passed, landing in the data
        // slot, so post-ascension the choice rendered with zero element options.
        uiManager.modalManager.showElementSpecializationChoice(ELEMENT_SPECIALIZATIONS, uiManager.updateAllUI);

        // Load meditation system on demand (lazy-loaded, locked until Prestige 1)
        if (!uiManager.systems.meditationManager) {
            await loadMeditationSystem(gameState, uiManager);
        }
        if (uiManager.systems.meditationManager?.checkUnlock) {
            uiManager.systems.meditationManager.checkUnlock();
        }

        // Update auto button
        castManager.updateAutoButtonVisibility();

        // Refresh ALL tab locks now that prestigeCount changed. checkUnlock()
        // above only clears the Meditation lock; the Boons tab also unlocks at
        // Prestige 1 but would otherwise stay `locked` (switchTab blocks it)
        // until a reload. Re-running the full tab-lock pass unlocks both
        // immediately after an in-session ascension.
        if (window.updateFeatureIndicators) window.updateFeatureIndicators();

        uiManager.updateAllUI();
    };

    gameState.onRecipeDiscovered = (_recipeId) => {
        if (dailyRituals) {
            dailyRituals.updateTaskProgress('discover_recipe', '', gameState.discoveredRecipes.length);
        }
        uiManager.debouncedUIUpdate('experimentTab', () => uiManager.experimentUI.update());
    };

    gameState.onWelcomeBack = (elapsed, abGained) => {
        if (abGained > 0 && elapsed > 60) {
            // GameState stays formatting-agnostic and emits raw values; the
            // welcome-back modal takes the formatting helpers as arguments, so we
            // lazy-load them here and hand them in.
            import('./utils.js')
                .then(({ formatShort, formatTimeDuration }) => {
                    uiManager.modalManager.showWelcomeBack(elapsed, abGained, formatTimeDuration, formatShort);
                })
                .catch(err => {
                    console.error('Failed to load utils for welcome back modal:', err);
                    // Fallback: show simple notification without formatting
                    uiManager.showNotification(`Offline for ${Math.floor(elapsed / 1000)}s, gained energy!`, 'info');
                });
        }
    };

    gameState.onIngredientChanged = (_ingId, _newValue) => {
        uiManager.hudUI.updateElementCounters();
        
        // Targeted updates based on active tab
        const activeTab = uiManager.activeTab;
        if (activeTab === 'inventory') uiManager.debouncedUIUpdate('inventory', () => uiManager.inventoryUI.update());
        else if (activeTab === 'workstations') uiManager.debouncedUIUpdate('workstations', () => uiManager.workstationUI.update());
        else if (activeTab === 'inscriptions') uiManager.debouncedUIUpdate('inscriptions', () => uiManager.inscriptionsUI.update());
        else if (activeTab === 'experiment') uiManager.debouncedUIUpdate('experiment', () => uiManager.experimentUI.update());
    };

    dailyRituals.onTaskProgressUpdated = () => uiManager.dailiesUI?.update();
    dailyRituals.onTaskCompleted = () => uiManager.dailiesUI?.update();
    dailyRituals.onTasksRefreshed = () => uiManager.dailiesUI?.update();
}

// Audio unlock is now handled by loadAudioOnGesture() inside loadLazySystems.
// It defers loading the entire AudioSystem module (~80KB minified) until the
// first user gesture, saving bandwidth on slow connections and avoiding
// autoplay policy violations.
