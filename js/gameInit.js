/**
 * Game Initialization Module
 * Handles the setup and wiring of all game systems.
 */

import { UIManager } from './modules/ui/uiManager.js';
import { showNotification } from './modules/ui/notifications.js';
import { announceToScreenReader } from './accessibility.js';
import { InputManager } from './modules/ui/inputManager.js';
import { CraftingManager } from './modules/game/craftingManager.js';
import { GameState } from './gameState.js';
import { DailyRituals } from './dailyRituals.js';
import { AchievementSystem } from './achievements.js';
import { ComboSystem } from './comboSystem.js';
import { EventSystem } from './eventSystem.js';
import { CastManager } from './modules/game/castManager.js';
import { MeditationManager } from './modules/game/meditationManager.js';
import { PrestigeManager } from './modules/game/prestigeManager.js';
import { InscriptionsManager } from './modules/game/inscriptionsManager.js';
import { DesignTierSystem } from './modules/game/designTierSystem.js';
import { FadingThemeSystem } from './modules/game/fadingThemeSystem.js';
import { TutorialSystem } from './modules/game/tutorialSystem.js';
import { ParticleSystem } from './modules/game/particleSystem.js';
import { AudioSystem } from './audioSystem.js';
import { PWAFeaturesManager } from './modules/pwa/pwaFeaturesManager.js';
import { initUIHelpers } from './modules/ui/uiHelpers.js';
import accessibilityManager from './accessibility.js';
import featureIndicatorManager from './featureIndicators.js';
import memoryLeakPreventionManager from './memoryLeakFix.js';
import { handleError } from './errorHandler.js';
import { UnifiedGameLoop } from './core/UnifiedGameLoop.js';
import { createErrorBoundary } from './core/ErrorBoundary.js';
import { setAudioSystem } from './audio/audioAccess.js';
import { PRODUCERS, INGREDIENTS, UPGRADES, HIDDEN_RECIPES, PRESTIGE_BONUSES } from './data.js';
import { formatShort, formatNumber, formatTimeDuration } from './utils.js';
import { pulseElement, shakeElement, slideIn } from './animations.js';
import { ELEMENT_SPECIALIZATIONS } from './elementSpecialization.js';

export async function initGame() {
    console.log('Initializing Hex Compiler...');

    try {
        // 0. Expose the static data tables as globals. Several modules (inventoryUI,
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

        // 1. Initialize Game State
        const gameState = new GameState();

        // 2. Initialize Core Systems
        const dailyRituals = new DailyRituals(gameState);
        const achievements = new AchievementSystem(gameState);
        const comboSystem = new ComboSystem(gameState);
        const eventSystem = new EventSystem(gameState);
        const craftingManager = new CraftingManager(gameState);
        
        // 3. Initialize UI Manager (needs core systems for sub-managers)
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
        window.announceToScreenReader = announceToScreenReader;

        // Formatting + animation helpers are likewise read as globals by several
        // UI modules (inventoryUI/statsUI/experimentUI use window.formatShort
        // UNGUARDED — an actual crash; modalManager/experimentUI use
        // window.slideIn/pulseElement/shakeElement guarded — silent no-ops). None
        // were ever assigned, so those panels failed to render and celebration
        // animations never played. Expose them here.
        window.formatShort = formatShort;
        window.formatNumber = formatNumber;
        window.formatTimeDuration = formatTimeDuration;
        window.pulseElement = pulseElement;
        window.shakeElement = shakeElement;
        window.slideIn = slideIn;

        // 4. Initialize Feature Managers (depend on GameState and often UIManager)
        // Week 2: Wrap critical systems with error boundaries for module isolation
        const inputManagerBoundary = createErrorBoundary('InputManager');
        const inputManager = inputManagerBoundary.wrap(() => new InputManager(gameState, uiManager, craftingManager))();
        
        const castManagerBoundary = createErrorBoundary('CastManager');
        const castManager = castManagerBoundary.wrap(() => new CastManager(gameState, uiManager, comboSystem, eventSystem))();
        
        const pwaManager = new PWAFeaturesManager(gameState, uiManager);
        const tutorialSystem = new TutorialSystem(gameState);
        const meditationManager = new MeditationManager(gameState, uiManager);
        const prestigeManager = new PrestigeManager(gameState, uiManager);
        const inscriptionsManager = new InscriptionsManager(gameState, uiManager);
        
        const audioSystemBoundary = createErrorBoundary('AudioSystem');
        const audioSystem = audioSystemBoundary.wrap(() => new AudioSystem())();
        setAudioSystem(audioSystem);
        
        const particleSystemBoundary = createErrorBoundary('ParticleSystem');
        const particleSystem = particleSystemBoundary.wrap(() => new ParticleSystem(gameState))();
        
        // Design Tier System depends on AudioSystem
        const designTierSystem = new DesignTierSystem(gameState, uiManager, audioSystem);
        initUIHelpers(designTierSystem);

        const fadingThemeSystem = new FadingThemeSystem(gameState, designTierSystem);

        // 5. Wire up systems to UIManager
        uiManager.systems.inputManager = inputManager;
        uiManager.systems.castManager = castManager;
        uiManager.systems.pwaManager = pwaManager;
        uiManager.systems.tutorialSystem = tutorialSystem;
        uiManager.systems.meditationManager = meditationManager;
        uiManager.systems.prestigeManager = prestigeManager;
        uiManager.systems.inscriptionsManager = inscriptionsManager;
        uiManager.systems.audioSystem = audioSystem;
        uiManager.systems.particleSystem = particleSystem;
        uiManager.systems.designTierSystem = designTierSystem;
        uiManager.systems.fadingThemeSystem = fadingThemeSystem;
        uiManager.systems.accessibilityManager = accessibilityManager;

        // 6. Initialize specific systems
        pwaManager.init();
        dailyRituals.init();
        
        // Initialize particles if Tier 3+
        // Note: Particle system will integrate with UnifiedGameLoop automatically
        if (designTierSystem.getCurrentTier() >= 3) {
            particleSystem.init();
            // Don't call start() - UnifiedGameLoop will handle animation
        }

        // 7. Set up Game State callbacks
        setupGameStateCallbacks(gameState, uiManager, dailyRituals, castManager);

        // 8. Initialize Unified Game Loop (replaces multiple setInterval calls)
        const gameLoop = new UnifiedGameLoop();
        
        // Assign gameLoop to window BEFORE particle system checks for it
        // This ensures particle system can detect UnifiedGameLoop management
        window.gameLoop = gameLoop;
        
        // Register game state tick for logic updates (10 TPS)
        gameLoop.registerLogicUpdate((delta) => {
            gameState.tick(delta, 1.0); // Pass delta and event multiplier
        });
        
        // Register visual updates (60 FPS) - particle systems, animations
        // Particle system will be updated via UnifiedGameLoop if initialized
        gameLoop.registerVisualUpdate((delta) => {
            // Update particle system if initialized and active
            if (particleSystem && particleSystem.initialized && !particleSystem.isPaused) {
                const currentTime = performance.now();
                particleSystem.animate(currentTime);
            }
        });
        
        // Register render callbacks (60 FPS with interpolation)
        gameLoop.registerRender((alpha) => {
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
                        if (uiManager.accessibilityManager) {
                            uiManager.accessibilityManager.announce(`Achievement unlocked: ${achievement.name}`, 'polite');
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

        // 9. Initial UI Update
        uiManager.updateAllUI();
        
        // Switch to first tab
        uiManager.switchTab('workstations');

        // 11. Unlock Audio on interaction
        setupAudioUnlock(audioSystem, designTierSystem);

        // 12. Show Story Intro if needed
        if (!gameState.storyFlags.introShown) {
            uiManager.modalManager.showStoryIntroduction();
        }

        // 13. Check Feature Indicators
        if (featureIndicatorManager) {
            featureIndicatorManager.updateIndicators();
        }

        console.log('Hex Compiler initialization complete.');
        
        return { gameState, uiManager, gameLoop };

    } catch (error) {
        console.error('Critical error during game initialization:', error);
        handleError(error, 'initGame', true);
        throw error;
    }
}

function setupGameStateCallbacks(gameState, uiManager, dailyRituals, castManager) {
    gameState.onAbChanged = (newValue) => {
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
    };

    gameState.onUpgradePurchased = () => {
        uiManager.debouncedUIUpdate('inscriptionsTab', () => uiManager.inscriptionsUI.update());
    };

    gameState.onPrestigeCompleted = (ekGained) => {
        // Pass BOTH args: the method is showElementSpecializationChoice(ELEMENT_SPECIALIZATIONS,
        // updateAllUI). Previously only updateAllUI was passed, landing in the data
        // slot, so post-ascension the choice rendered with zero element options.
        uiManager.modalManager.showElementSpecializationChoice(ELEMENT_SPECIALIZATIONS, uiManager.updateAllUI);
        
        // Check unlock
        uiManager.systems.meditationManager.checkUnlock();

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

    gameState.onRecipeDiscovered = (recipeId) => {
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

    gameState.onIngredientChanged = (ingId, newValue) => {
        uiManager.hudUI.updateElementCounters();
        
        // Targeted updates based on active tab
        const activeTab = uiManager.activeTab;
        if (activeTab === 'inventory') uiManager.debouncedUIUpdate('inventory', () => uiManager.inventoryUI.update());
        else if (activeTab === 'workstations') uiManager.debouncedUIUpdate('workstations', () => uiManager.workstationUI.update());
        else if (activeTab === 'inscriptions') uiManager.debouncedUIUpdate('inscriptions', () => uiManager.inscriptionsUI.update());
        else if (activeTab === 'experiment') uiManager.debouncedUIUpdate('experiment', () => uiManager.experimentUI.update());
    };

    dailyRituals.onTaskProgressUpdated = () => uiManager.dailiesUI.update();
    dailyRituals.onTaskCompleted = () => uiManager.dailiesUI.update();
    dailyRituals.onTasksRefreshed = () => uiManager.dailiesUI.update();
}

// DEPRECATED: setupPeriodicChecks - Replaced by UnifiedGameLoop periodic checks
// This function is kept for reference but is no longer called.
// All periodic checks are now integrated into UnifiedGameLoop (see gameInit.js lines 99-160)
function setupPeriodicChecks(gameState, designTierSystem, achievements, eventSystem, uiManager) {
    console.warn('setupPeriodicChecks is deprecated. Use UnifiedGameLoop.registerPeriodicCheck() instead.');
    // This function is no longer used - periodic checks are handled by UnifiedGameLoop
}

function setupAudioUnlock(audioSystem, designTierSystem) {
    let audioUnlocked = false;
    const unlockAudio = async () => {
        if (audioUnlocked) return;
        audioUnlocked = true;

        if (audioSystem.audioContext && audioSystem.audioContext.state === 'suspended') {
            try {
                await audioSystem.audioContext.resume();
            } catch (e) {
                console.warn('Could not resume audio context:', e);
            }
        }

        const currentTier = designTierSystem.getCurrentTier();
        if (currentTier >= 2 && audioSystem.enableSoundEffects) {
            await audioSystem.enableSoundEffects();
        }
        if (currentTier >= 4 && audioSystem.enableMusic && !audioSystem.musicEnabled) {
            await audioSystem.enableMusic();
            await audioSystem.startMusic();
        }
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
}
