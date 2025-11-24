/**
 * Game Initialization Module
 * Handles the setup and wiring of all game systems.
 */

import { UIManager } from './modules/ui/uiManager.js';
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

export async function initGame() {
    console.log('Initializing Hex Compiler...');

    try {
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

        // 4. Initialize Feature Managers (depend on GameState and often UIManager)
        // Week 2: Wrap critical systems with error boundaries for module isolation
        const inputManagerBoundary = createErrorBoundary('InputManager');
        const inputManager = inputManagerBoundary.wrap(() => new InputManager(gameState, uiManager, craftingManager))();
        
        const castManagerBoundary = createErrorBoundary('CastManager');
        const castManager = castManagerBoundary.wrap(() => new CastManager(gameState, uiManager, comboSystem, eventSystem))();
        
        const pwaManager = new PWAFeaturesManager(gameState, uiManager);
        const tutorialSystem = new TutorialSystem(gameState, uiManager);
        const meditationManager = new MeditationManager(gameState, uiManager);
        const prestigeManager = new PrestigeManager(gameState, uiManager);
        const inscriptionsManager = new InscriptionsManager(gameState, uiManager);
        
        const audioSystemBoundary = createErrorBoundary('AudioSystem');
        const audioSystem = audioSystemBoundary.wrap(() => new AudioSystem())();
        
        const particleSystemBoundary = createErrorBoundary('ParticleSystem');
        const particleSystem = particleSystemBoundary.wrap(() => new ParticleSystem(gameState))();
        
        // Design Tier System depends on AudioSystem
        const designTierSystem = new DesignTierSystem(gameState, uiManager, audioSystem);
        initUIHelpers(designTierSystem);

        const fadingThemeSystem = new FadingThemeSystem(gameState, designTierSystem, uiManager);

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
        if (designTierSystem.getCurrentTier() >= 3) {
            particleSystem.init();
        }

        // 7. Set up Game State callbacks
        setupGameStateCallbacks(gameState, uiManager, dailyRituals, castManager);

        // 8. Initialize Unified Game Loop (replaces multiple setInterval calls)
        const gameLoop = new UnifiedGameLoop();
        
        // Register game state tick for logic updates (10 TPS)
        gameLoop.registerLogicUpdate((delta) => {
            gameState.tick(delta, 1.0); // Pass delta and event multiplier
        });
        
        // Register visual updates (60 FPS) - particle systems, animations
        if (particleSystem && particleSystem.initialized) {
            gameLoop.registerVisualUpdate((delta) => {
                // Particle system handles its own animation loop
                // This is for other visual updates if needed
            });
        }
        
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
        
        // Store game loop for cleanup
        window.gameLoop = gameLoop;
        
        // Start unified game loop (replaces gameState.start() tick loop)
        gameState.loadGameState(); // Load state but don't start old tick loop
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
        uiManager.modalManager.showElementSpecializationChoice(uiManager.updateAllUI);
        
        // Check unlock
        uiManager.systems.meditationManager.checkUnlock();
        
        // Update auto button
        castManager.updateAutoButtonVisibility();
        
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
            // We need formatShort and formatTimeDuration. 
            // Ideally GameState shouldn't know about formatting, passing raw values.
            // ModalManager handles formatting or imports utils.
            // But wait, ModalManager.showWelcomeBack expects formatted strings in the current implementation?
            // Let's check ModalManager.js.
            // showWelcomeBack(elapsed, abGained, formatTimeDuration, formatShort)
            // It expects formatting functions passed in!
            // We need to import them here.
            
            import('./utils.js').then(({ formatShort, formatTimeDuration }) => {
                uiManager.modalManager.showWelcomeBack(elapsed, abGained, formatTimeDuration, formatShort);
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
