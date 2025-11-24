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
        const inputManager = new InputManager(gameState, uiManager, craftingManager);
        const castManager = new CastManager(gameState, uiManager, comboSystem, eventSystem);
        const pwaManager = new PWAFeaturesManager(gameState, uiManager);
        const tutorialSystem = new TutorialSystem(gameState, uiManager);
        const meditationManager = new MeditationManager(gameState, uiManager);
        const prestigeManager = new PrestigeManager(gameState, uiManager);
        const inscriptionsManager = new InscriptionsManager(gameState, uiManager);
        const audioSystem = new AudioSystem();
        const particleSystem = new ParticleSystem(gameState);
        
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

        // 8. Start Game Loop
        gameState.start();

        // 9. Initial UI Update
        uiManager.updateAllUI();
        
        // Switch to first tab
        uiManager.switchTab('workstations');

        // 10. Set up periodic checks (that aren't in GameState tick)
        setupPeriodicChecks(gameState, designTierSystem, achievements, eventSystem, uiManager);

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
        
        return { gameState, uiManager };

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

function setupPeriodicChecks(gameState, designTierSystem, achievements, eventSystem, uiManager) {
    // 1. Check Tier Unlocks (every 10s)
    const tierCheckInterval = setInterval(() => {
        try {
            designTierSystem.checkTierUnlocks();
        } catch (error) {
            console.error('Error checking tier unlocks:', error);
        }
    }, 10000);
    memoryLeakPreventionManager.trackInterval(tierCheckInterval);

    // 2. Check Achievements (every 2s)
    const shownAchievementNotifications = new Set();
    const achievementCheckInterval = setInterval(() => {
        if (achievements) {
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                if (!shownAchievementNotifications.has(achievement.name)) {
                    shownAchievementNotifications.add(achievement.name);
                    uiManager.showNotification(`Achievement: ${achievement.name}!`, 'success');
                    
                    // Check tier unlocks after achievement
                    designTierSystem.checkTierUnlocks();
                    
                    if (uiManager.accessibilityManager) {
                        uiManager.accessibilityManager.announce(`Achievement unlocked: ${achievement.name}`, 'polite');
                    }
                }
            }
        }
    }, 2000);
    memoryLeakPreventionManager.trackInterval(achievementCheckInterval);

    // 3. Check Events (every 1s)
    const eventCheckInterval = setInterval(() => {
        if (eventSystem) {
            eventSystem.checkForEvents();
            eventSystem.updateEvents(1.0); 
            uiManager.hudUI.updateActiveEvents();
        }
    }, 1000);
    memoryLeakPreventionManager.trackInterval(eventCheckInterval);

    // 4. Update ABPS and Combo (every 0.5s)
    const hudUpdateInterval = setInterval(() => {
        uiManager.hudUI.updateABPS();
        uiManager.hudUI.updateComboDisplay();
    }, 500);
    memoryLeakPreventionManager.trackInterval(hudUpdateInterval);
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
