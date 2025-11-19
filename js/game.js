import { UIManager } from './modules/ui/uiManager.js';
import { InputManager } from './modules/ui/inputManager.js';
import { CraftingManager } from './modules/game/craftingManager.js';
import { GameState } from './gameState.js';
import { DailyRituals } from './dailyRituals.js';
import { AchievementSystem } from './achievements.js';
import { ComboSystem } from './comboSystem.js';
import { EventSystem } from './eventSystem.js';

import { INGREDIENTS, PRODUCERS, UPGRADES, PRESTIGE_BONUSES, HIDDEN_RECIPES } from './data.js';
import { ELEMENT_SPECIALIZATIONS } from './elementSpecialization.js';
import { formatShort, formatPrecise, formatTimeDuration, formatOneDecimal } from './utils.js';
import { pulseElement, highlightElement, slideIn, animateNumber, shakeElement } from './animations.js';
// Particle effects removed for memory optimization - see VISUAL_ALTERNATIVES.md

import { VirtualWorkstationList, VirtualUpgradeList, VirtualAchievementList } from './virtualScroll.js';
import { handleError, safeFunction, safeAsyncFunction, validateParams, retryWithBackoff } from './errorHandler.js';
import { debounce, throttle, deepClone, formatWithCommas, clamp, lerp, inRange, randomInt, randomFloat, randomChoice, shuffle, isEmpty, capitalize, secondsToTime, calculatePercentage, isMobile, isTouchDevice, getPixelRatio, createElement, batchDOMUpdate, setLocalStorage, getLocalStorage, removeLocalStorage, clearLocalStorage, isInViewport, scrollIntoView, addEventListener, PerformanceMonitor } from './commonUtils.js';
import { globalLifecycleManager } from './lifecycleManager.js';
import loadingStateManager from './loadingState.js';
import accessibilityManager from './accessibility.js';
import errorRecoveryManager from './errorRecovery.js';
import privacyManager from './privacyControls.js';
import progressIndicatorManager from './progressIndicators.js';
import featureIndicatorManager from './featureIndicators.js';
import customTooltipManager from './customTooltips.js';
import sustainableDesignManager from './sustainableDesign.js';
import browserNavigationManager from './browserNavigation.js';
import mobileNavigationManager from './mobileNavigation.js';
import mobilePerformanceManager from './mobilePerformance.js';
import errorReportingManager from './errorReporting.js';
import domOptimizationManager from './domOptimization.js';
import memoryLeakPreventionManager from './memoryLeakFix.js';
import lazyAssetLoadingManager from './lazyAssetLoading.js';
import animationOptimizationManager from './animationOptimization.js';
import questSystem from './questSystem.js';
import playerAnalyticsManager from './playerAnalytics.js';
import balanceAnalyticsManager from './balanceAnalytics.js';
import { PWAFeaturesManager } from './modules/pwa/pwaFeaturesManager.js';

import BalanceTestingFramework from './balanceTesting.js';
import { CodeOrganization, GAME_CONSTANTS, MAGIC_NUMBERS } from './codeOrganization.js';
import coreWebVitalsOptimizer from './coreWebVitals.js';
import ProgressionAnalysis from './progressionAnalysis.js';
import EconomyBalancing from './economyBalancing.js';
import FeedbackLoopManager from './feedbackLoops.js';
import CodeDuplicationDetector from './codeDuplication.js';
import { MeditationManager } from './modules/game/meditationManager.js';
import { PrestigeManager } from './modules/game/prestigeManager.js';
import { InscriptionsManager } from './modules/game/inscriptionsManager.js';
import { CastManager } from './modules/game/castManager.js';
import { AudioSystem } from './audioSystem.js';
import { DesignTierSystem } from './modules/game/designTierSystem.js';
import { FadingThemeSystem } from './modules/game/fadingThemeSystem.js';
import { TutorialSystem } from './modules/game/tutorialSystem.js';
import { stripEmojisIfLowTier, initUIHelpers } from './modules/ui/uiHelpers.js';


/**
 * Main game controller with optimized timing and performance
 */

// Initialize game
let gameState;
let dailyRituals;
let achievements;
let comboSystem;
let eventSystem;
let meditationManager;
let prestigeManager;
let inscriptionsManager;
let castManager;
let designTierSystem;
let fadingThemeSystem;
let tutorialSystem;
let particleSystem;
let audioSystem;
let balanceTestingFramework;
let progressionAnalysis;
let economyBalancing;
let feedbackLoopManager;
let craftingManager;
let inputManager;
let pwaManager;

// UI Elements (will be set after DOM loads)
let abDisplay;
let abpsDisplay;
let castButton;
let tabButtons;
let tabPanes;
let prestigeModal;
let welcomeBackModal;

// Performance optimization variables
let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;
let fpsUpdateInterval = 1000; // Update FPS counter every second
let lastFpsUpdate = 0;
let lastMemoryCleanup = 0;

// Debounced UI updates
let uiUpdateTimeouts = new Map();
let uiUpdateDelay = 16; // ~60fps

// Auto-save configuration
let autoSaveInterval = 30000; // 30 seconds default
let autoSaveTimer = null;

// Virtual scrolling managers
let virtualWorkstationList = null;
let virtualUpgradeList = null;
let virtualAchievementList = null;

// Track if we're currently updating to prevent infinite loops
let isUpdatingWorkstations = false;
let isUpdatingInscriptions = false;

// Track initialization state to prevent multiple calls
let uiInitialized = false;
let updateIntervals = [];
let allIntervals = []; // Track all intervals for cleanup
let allTimeouts = []; // Track all timeouts for cleanup
let autoCastInterval = null; // Track auto-cast interval

// Click handling state - prevent duplicate clicks
const clickHandlers = {
    processing: new Set(), // Track buttons currently being processed
    lastClickTime: new Map(), // Track last click time per button
    debounceDelay: 300 // Minimum time between clicks (ms)
};

// Keyboard shortcuts are now handled by InputManager

/**
 * Define global functions for InputManager and backward compatibility
 */
// Global functions removed - using modular managers instead

/**
 * Initialize background sparkles for night sky effect
 * Optimized for performance with visibility detection and cleanup
 */
// initBackgroundSparkles removed - use ParticleSystem instead

/**
 * Initialize UI with performance optimizations
 */
function initUI() {
    // Prevent multiple initializations
    if (uiInitialized) {
        console.warn('initUI() called multiple times, skipping');
        return;
    }

    // Clear any existing intervals
    updateIntervals.forEach(interval => clearInterval(interval));
    updateIntervals = [];

    // Define global functions FIRST before anything else


    // Get UI elements after DOM is loaded
    abDisplay = document.getElementById('ab-display');
    abpsDisplay = document.getElementById('abps-display');
    castButton = document.getElementById('cast-button');

    // Auto-cast state (needs to be in function scope for closure)




    // Query for tab buttons - try both class names for compatibility
    tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length === 0) {
        console.warn('No elements found with .tab-btn, trying .tab-button');
        tabButtons = document.querySelectorAll('.tab-button');
    }

    // Query for tab panes - try both class names for compatibility
    tabPanes = document.querySelectorAll('.tab-panel');
    if (tabPanes.length === 0) {
        console.warn('No elements found with .tab-panel, trying .tab-pane');
        tabPanes = document.querySelectorAll('.tab-pane');
    }

    // Verify we found the elements
    if (tabButtons.length === 0) {
        console.error('CRITICAL: No tab buttons found! Check HTML class names.');
        console.error('Expected: .tab-btn or .tab-button');
        console.error('Found in DOM:', document.querySelectorAll('[class*="tab"]').length, 'elements with "tab" in class');
    }
    if (tabPanes.length === 0) {
        console.error('CRITICAL: No tab panes found! Check HTML class names.');
        console.error('Expected: .tab-panel or .tab-pane');
        console.error('Found in DOM:', document.querySelectorAll('[class*="panel"], [class*="pane"]').length, 'elements');
    }

    console.log('Tab elements found:', {
        buttons: tabButtons.length,
        panes: tabPanes.length,
        buttonClasses: Array.from(tabButtons).map(btn => btn.className),
        paneClasses: Array.from(tabPanes).map(pane => pane.className)
    });

    prestigeModal = document.getElementById('prestige-modal');
    welcomeBackModal = document.getElementById('welcome-back-modal');
    const helpModal = document.getElementById('help-modal');

    // Set up help modal
    const helpButton = document.getElementById('help-button');
    const closeHelpButton = document.getElementById('close-help-button');
    const helpModalClose = helpModal?.querySelector('.modal-close');

    if (helpButton && helpModal) {
        helpButton.addEventListener('click', () => {
            helpModal.style.display = 'flex';
            helpModal.classList.add('active');
            if (uiManager && uiManager.announceToScreenReader) {
                uiManager.announceToScreenReader('Help menu opened', 'polite');
            }
        });
    }

    if (closeHelpButton && helpModal) {
        closeHelpButton.addEventListener('click', () => {
            helpModal.style.display = 'none';
            helpModal.classList.remove('active');
            if (uiManager && uiManager.announceToScreenReader) {
                uiManager.announceToScreenReader('Help menu closed', 'polite');
            }
        });
    }

    if (helpModalClose && helpModal) {
        helpModalClose.addEventListener('click', () => {
            helpModal.style.display = 'none';
            helpModal.classList.remove('active');
            if (uiManager && uiManager.announceToScreenReader) {
                uiManager.announceToScreenReader('Help menu closed', 'polite');
            }
        });
    }

    // Close help modal when clicking outside
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
                helpModal.classList.remove('active');
                if (uiManager && uiManager.announceToScreenReader) {
                    uiManager.announceToScreenReader('Help menu closed', 'polite');
                }
            }
        });
    }

    // Initialize game state
    // Initialize game state
    gameState = new GameState();
    gameState.start(); // Start the game tick loop
    // Initialize Daily Rituals
    dailyRituals = new DailyRituals(gameState, uiManager);
    dailyRituals.init();
    uiManager.systems.dailyRituals = dailyRituals;
    achievements = new AchievementSystem(gameState);
    comboSystem = new ComboSystem(gameState);
    eventSystem = new EventSystem(gameState);

    // Initialize CraftingManager
    craftingManager = new CraftingManager(gameState);

    // Initialize UIManager
    // Note: meditationState and meditationTowers are initialized lazily, so they will be undefined here initially
    uiManager = new UIManager(gameState, {
        dailyRituals,
        achievements,
        comboSystem,
        eventSystem,
        craftingManager
    });


    // Initialize InputManager
    // inputManager is declared at module level
    const inputManagerInstance = new InputManager(gameState, uiManager, craftingManager);
    // We don't need a global variable for inputManager if it attaches listeners itself, 
    // but we might want to store it in uiManager or a module-level variable if we need to access it.
    // Since inputManager is imported as a class, we should assign it to a variable if we want to keep it.
    // However, game.js doesn't have a top-level inputManager variable declared in the snippet I saw (only imported class).
    // Wait, I should declare 'let inputManager' at the top if I want to use it, or just 'new InputManager(...)' is enough if it works by side effects (listeners).
    // InputManager attaches listeners in constructor.

    // Initialize PWA Manager
    pwaManager = new PWAFeaturesManager(gameState, uiManager);
    uiManager.systems.pwaManager = pwaManager;
    pwaManager.init();

    // Initialize Input Manager
    inputManager = new InputManager(gameState, uiManager, craftingManager);

    // Initialize CastManager
    castManager = new CastManager(gameState, uiManager, comboSystem, eventSystem);
    uiManager.systems.castManager = castManager;

    // Initialize tutorial system
    tutorialSystem = new TutorialSystem(gameState);
    uiManager.systems.tutorialSystem = tutorialSystem; // Add to UI manager

    // Initialize quest system (already initialized as singleton)
    if (questSystem) {
        // questSystem is already available in scope
    }


    // Initialize balance testing framework
    balanceTestingFramework = new BalanceTestingFramework(gameState);


    // Initialize progression analysis
    progressionAnalysis = new ProgressionAnalysis(gameState);


    // Initialize economy balancing
    economyBalancing = new EconomyBalancing(gameState);


    // Initialize feedback loop manager
    feedbackLoopManager = new FeedbackLoopManager(gameState);


    // Initialize Meditation Manager
    meditationManager = new MeditationManager(gameState, uiManager);
    uiManager.systems.meditationManager = meditationManager;

    // Initialize Prestige Manager
    prestigeManager = new PrestigeManager(gameState, uiManager);
    uiManager.systems.prestigeManager = prestigeManager;

    // Initialize Inscriptions Manager
    inscriptionsManager = new InscriptionsManager(gameState, uiManager);
    uiManager.systems.inscriptionsManager = inscriptionsManager;

    // Pass Accessibility Manager
    uiManager.systems.accessibilityManager = accessibilityManager;

    // Initialize Audio System
    audioSystem = new AudioSystem();
    uiManager.systems.audioSystem = audioSystem;



    // Show story introduction if first time
    if (!gameState.storyFlags.introShown) {
        uiManager.modalManager.showStoryIntroduction();
    }

    // Initialize design tier system (Feature 2: Progressive Design Revelation)
    designTierSystem = new DesignTierSystem(gameState);
    designTierSystem.applyTier(designTierSystem.getCurrentTier()).catch(err => console.error('Error applying initial tier:', err));


    // Initialize fading theme system
    fadingThemeSystem = new FadingThemeSystem(gameState, designTierSystem);


    // Update fading theme when tier changes
    const originalApplyTier = designTierSystem.applyTier.bind(designTierSystem);
    designTierSystem.applyTier = async function (tier) {
        await originalApplyTier(tier);
        if (fadingThemeSystem) {
            fadingThemeSystem.updateForTier(tier);
        }
    };

    // Also update when tier is set manually
    const originalSetTier = designTierSystem.setTier.bind(designTierSystem);
    designTierSystem.setTier = async function (tier) {
        await originalSetTier(tier);
        if (fadingThemeSystem) {
            fadingThemeSystem.updateForTier(tier);
        }
    };
    // Window globals removed - systems are now passed via dependency injection
    // window.achievements = achievements; 
    // window.audioSystem = audioSystem;

    // Unlock audio on first user interaction (required by browsers)
    let audioUnlocked = false;
    const unlockAudio = async () => {
        if (audioUnlocked) return;
        audioUnlocked = true;

        if (uiManager.systems.audioSystem && uiManager.systems.audioSystem.audioContext) {
            if (uiManager.systems.audioSystem.audioContext.state === 'suspended') {
                try {
                    await uiManager.systems.audioSystem.audioContext.resume();
                    console.log('Audio context resumed successfully');
                } catch (e) {
                    console.warn('Could not resume audio context:', e);
                }
            }

            // Enable sound effects if Tier 2+
            const currentTier = designTierSystem ? designTierSystem.getCurrentTier() : 0;
            if (currentTier >= 2 && uiManager.systems.audioSystem.enableSoundEffects) {
                await uiManager.systems.audioSystem.enableSoundEffects();
            }

            // Enable music if Tier 4+
            if (currentTier >= 4) {
                if (!uiManager.systems.audioSystem.musicEnabled) {
                    await uiManager.systems.audioSystem.enableMusic();
                }

                if (uiManager.systems.audioSystem.musicEnabled) {
                    await uiManager.systems.audioSystem.startMusic();
                }
            }
        }
    };
    // Unlock audio on any user interaction (not just once, in case audio context gets suspended)
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    // Particle effects removed for memory optimization (~3-8 MB savings)
    // See VISUAL_ALTERNATIVES.md for economical visual alternatives
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
        particleCanvas.style.display = 'none'; // Hide particle canvas
    }

    // Initialize systems
    designTierSystem = new DesignTierSystem(gameState, uiManager, audioSystem);
    initUIHelpers(designTierSystem);
    particleSystem = new ParticleSystem(gameState);

    // Initialize UIManager with systems
    uiManager.systems.designTierSystem = designTierSystem;
    uiManager.systems.particleSystem = particleSystem;

    fadingThemeSystem = new FadingThemeSystem(gameState, designTierSystem, uiManager);
    uiManager.systems.fadingThemeSystem = fadingThemeSystem;

    tutorialSystem = new TutorialSystem(gameState, uiManager);
    uiManager.systems.tutorialSystem = tutorialSystem;

    // Initialize background sparkles only for Tier 3+ (animations enabled)
    if (designTierSystem.getCurrentTier() >= 3) {
        particleSystem.init();
    }

    // Check for tier unlocks periodically (optimized: check every 10 seconds)
    const tierUnlockInterval = setInterval(() => {
        if (designTierSystem && gameState) {
            try {
                designTierSystem.checkTierUnlocks();
            } catch (error) {
                console.error('Error checking tier unlocks:', error);
            }
        }
    }, 10000); // Check every 10 seconds (optimized from 5 seconds)

    // Track interval for cleanup
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(tierUnlockInterval);
    }

    // Also check tier unlocks on key events for immediate feedback
    const checkTierUnlocksOnEvent = () => {
        if (designTierSystem && gameState) {
            try {
                designTierSystem.checkTierUnlocks();
            } catch (error) {
                console.error('Error checking tier unlocks:', error);
            }
        }
    };

    // Check tier unlocks when Spell Energy changes significantly (achievement milestones)
    // Hook into addAb to check on Spell Energy changes
    if (gameState && gameState.addAb) {
        const originalAddAb = gameState.addAb.bind(gameState);
        gameState.addAb = function (amount) {
            const result = originalAddAb(amount);
            // Check unlocks on Spell Energy milestones (1,000, 10,000, 100,000, 1,000,000)
            const ab = this.ab || 0;
            if (ab >= 1000 && ab < 10000 || ab >= 10000 && ab < 100000 || ab >= 100000 && ab < 1000000 || ab >= 1000000) {
                checkTierUnlocksOnEvent();
            }
            return result;
        };
    }

    // Initialize meditation systems only after first ascension
    // Initialize meditation systems only after first ascension
    if (meditationManager) {
        meditationManager.checkUnlock();
    }

    // Update meditation tab visibility based on prestige count
    updateMeditationVisibility();

    // Initialize auto-save
    initAutoSave();

    // Tab switching
    if (tabButtons && tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Play click sound for tab switch
                if (uiManager.systems.audioSystem && uiManager.systems.audioSystem.playSound) {
                    uiManager.systems.audioSystem.playSound('click', { volume: 0.2 });
                }
                const tabName = button.dataset.tab;
                uiManager.switchTab(tabName);
            });
        });
    }

    // Settings tab event handlers
    const tierSelector = document.getElementById('tier-selector');
    if (tierSelector && designTierSystem) {
        tierSelector.addEventListener('change', async (e) => {
            const selectedTier = parseInt(e.target.value, 10);
            const unlockedTiers = designTierSystem.getUnlockedTiers();
            if (unlockedTiers.includes(selectedTier)) {
                await designTierSystem.setTier(selectedTier);
                // updateSettingsTab(); // Refresh display - removed as it might not exist
                if (uiManager.showNotification) {
                    uiManager.showNotification(`Design tier set to ${selectedTier}`, 'info');
                }
            } else {
                // Reset to current tier if trying to select locked tier
                e.target.value = designTierSystem.getCurrentTier().toString();
                if (uiManager.showNotification) {
                    uiManager.showNotification('This tier has not been unlocked yet!', 'error');
                }
            }
        });
    }

    // Read Full Story button
    const readFullStoryButton = document.getElementById('read-full-story-button');
    if (readFullStoryButton) {
        readFullStoryButton.addEventListener('click', () => {
            uiManager.modalManager.showFullStoryModal();
        });
    }

    // Reset all progress button - use event delegation for reliability
    // Attach to document to ensure it works even if button is added later
    // We use a local flag to prevent multiple attachments if initUI is called multiple times
    if (!uiManager._resetButtonListenerAttached) {
        document.addEventListener('click', (e) => {
            // Check if click is on the button or any child element inside it
            const button = e.target.closest('#reset-all-progress-button');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Reset button clicked via delegation');
                resetAllProgress();
            }
        }, true); // Use capture phase for better reliability
        uiManager._resetButtonListenerAttached = true;
        console.log('Reset button event delegation attached');
    }

    // Also attach directly if button exists
    const resetButton = document.getElementById('reset-all-progress-button');
    if (resetButton) {
        // Remove any existing listeners by cloning
        const newResetBtn = resetButton.cloneNode(true);
        resetButton.parentNode.replaceChild(newResetBtn, resetButton);

        // Attach fresh listener
        newResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Reset button clicked via direct listener');
            resetAllProgress();
        }, true); // Use capture phase
        console.log('Reset button direct event listener attached');
    } else {
        console.warn('Reset button not found during initUI');
    }

    // Make resetAllProgress globally accessible for debugging


    // Settings counter in sidebar (replaces old settings button)
    const settingsCounter = document.getElementById('settings-counter');
    if (settingsCounter) {
        settingsCounter.addEventListener('click', () => {
            uiManager.switchTab('settings');
            // Announce to screen readers
            if (uiManager.systems.accessibilityManager) {
                uiManager.systems.accessibilityManager.announce('Settings tab opened', 'polite');
            }
        });
        // Also handle Enter key for accessibility
        settingsCounter.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                uiManager.switchTab('settings');
            }
        });
    }

    // Legacy settings button (if it still exists, keep it working)
    const settingsQuickButton = document.getElementById('settings-quick-button');
    if (settingsQuickButton) {
        settingsQuickButton.addEventListener('click', () => {
            uiManager.switchTab('settings');
            // Announce to screen readers
            if (uiManager.systems.accessibilityManager) {
                uiManager.systems.accessibilityManager.announce('Settings tab opened', 'polite');
            }
        });
    }

    // Keyboard shortcut for settings (Ctrl+,)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            uiManager.switchTab('settings');
            if (uiManager.systems.accessibilityManager) {
                uiManager.systems.accessibilityManager.announce('Settings tab opened', 'polite');
            }
        }
    });

    // Initialize feature indicators
    if (featureIndicatorManager) {
        featureIndicatorManager.updateIndicators();
    }

    // Add fallback handlers for meditation buttons (in case meditationUI isn't initialized yet)
    const startMeditationButton = document.getElementById('start-meditation-button');
    const endMeditationButton = document.getElementById('end-meditation-button');

    if (startMeditationButton) {
        // Remove any existing listeners and add our own
        const newStartButton = startMeditationButton.cloneNode(true);
        startMeditationButton.parentNode.replaceChild(newStartButton, startMeditationButton);

        newStartButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (meditationManager) {
                // Check unlock status first
                if (!meditationManager.checkUnlock()) {
                    if (uiManager.showNotification) {
                        uiManager.showNotification('Meditation unlocks after your first ascension!', 'error');
                    }
                    return;
                }

                meditationManager.startSession();
            }
        });
    }

    if (endMeditationButton) {
        // Remove any existing listeners and add our own
        const newEndButton = endMeditationButton.cloneNode(true);
        endMeditationButton.parentNode.replaceChild(newEndButton, endMeditationButton);

        newEndButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (meditationManager) {
                meditationManager.endSession();
            }
        });
    }

    // Cast button - optimized for responsiveness
    if (castButton) {
        // handleCast removed - use castManager.handleCast
        // Use both click and mousedown for better responsiveness
        castButton.addEventListener('click', (e) => {
            e.preventDefault();
            castManager.handleCast();
        });

        castButton.addEventListener('mousedown', (e) => {
            // Only handle left click
            if (e.button === 0) {
                e.preventDefault();
                castManager.handleCast();
            }
        });

        // Touch support
        castButton.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent mouse emulation
            castManager.handleCast();
        }, { passive: false });

        // Store handler for auto-cast
        castButton.addEventListener('click', handleCast);

        // Debug: Confirm event listener attached
        console.log('Cast button initialized and event listeners attached');
    } else {
        console.error('Cast button not found in DOM');
    }

    // Auto-cast toggle - only visible at Tier 4+
    const autoCastToggle = document.getElementById('auto-cast-toggle');


    // Initialize visibility based on current tier
    if (castManager) {
        castManager.updateAutoButtonVisibility();
    }

    // Auto-cast toggle
    if (autoCastToggle) {
        autoCastToggle.addEventListener('click', () => {
            if (castManager) {
                castManager.toggleAutoCast();
            }
        });
    }

    // Listen for prestige count changes to update button visibility
    // Check periodically and on ascension events
    if (gameState) {
        // Also check periodically in case prestige count changes externally
        setInterval(() => {
            if (castManager) {
                castManager.updateAutoButtonVisibility();
            }
        }, 2000); // Check every 2 seconds
    }

    // Prestige modal
    const ascendButton = document.getElementById('ascend-button');
    if (ascendButton) {
        ascendButton.addEventListener('click', async () => {
            if (!gameState) return;

            // Show confirmation dialog
            const prestigeGain = gameState.calculatePrestigeGain();
            const confirmed = await showDestructiveConfirmation(
                stripEmojisIfLowTier('⚡ Ascend'),
                `Are you sure you want to ascend?\n\nYou will gain ${prestigeGain.toFixed(2)} Eldritch Keys (EK).\n\nYou will lose:\n• All Arcane Bits and ingredients\n• All workstations\n• All upgrades (except prestige bonuses)\n\nYou will keep:\n• Prestige points (Eldritch Keys)\n• Prestige bonuses (Boons)\n• Discovered recipes\n• Achievements\n• Design tier unlocks`,
                'ASCEND'
            );

            if (!confirmed) {
                if (uiManager && uiManager.showNotification) {
                    uiManager.showNotification('Ascension cancelled.', 'info');
                }
                return;
            }

            // Show loading state
            if (uiManager && uiManager.showLoadingState) {
                uiManager.showLoadingState('Ascending...');
            }

            try {
                const oldPrestigeCount = gameState.prestigeCount;
                gameState.ascend();
                if (prestigeModal) prestigeModal.classList.remove('active');

                // Hide loading state
                if (uiManager && uiManager.hideLoadingState) {
                    uiManager.hideLoadingState();
                }

                // Play level up sound for prestige/ascension
                if (uiManager && uiManager.systems.audioSystem && uiManager.systems.audioSystem.playSound) {
                    uiManager.systems.audioSystem.playSound('level_up');
                }

                // Reset design tiers to tier 0 when ascending
                if (designTierSystem) {
                    try {
                        await designTierSystem.resetToTier0();
                        console.log('Design tiers reset to tier 0 after ascend');
                    } catch (error) {
                        console.error('Error resetting design tiers after ascend:', error);
                    }
                }

                // Check tier unlocks after prestige (prestige count changed)
                // This will re-unlock tiers based on new game state
                if (designTierSystem) {
                    try {
                        designTierSystem.checkTierUnlocks();
                    } catch (error) {
                        console.error('Error checking tier unlocks after prestige:', error);
                    }
                }

                // If this is the first ascension, initialize meditation
                if (oldPrestigeCount === 0 && gameState.prestigeCount >= 1) {
                    // Initialize meditation if unlocked
                    if (meditationManager) {
                        meditationManager.checkUnlock();
                    }
                }

                // Update auto button visibility after ascension
                if (castManager && castManager.updateAutoButtonVisibility) {
                    castManager.updateAutoButtonVisibility();
                }

                // Update settings tab to show tier selector after first ascension
                updateSettingsTab();

                // Update UI
                uiManager.updateAllUI();
            } catch (error) {
                // Hide loading state on error
                if (uiManager && uiManager.hideLoadingState) {
                    uiManager.hideLoadingState();
                }
                console.error('Error during ascension:', error);
                handleError(error, 'ascension', true);
                if (uiManager && uiManager.showNotification) {
                    uiManager.showNotification('An error occurred during ascension. Please try again.', 'error');
                }
            }
        });
    }

    const closePrestigeButton = document.getElementById('close-prestige-button');
    if (closePrestigeButton && prestigeModal) {
        closePrestigeButton.addEventListener('click', () => {
            prestigeModal.classList.remove('active');
            // Hide when inactive
            prestigeModal.style.display = 'none';
            prestigeModal.style.pointerEvents = 'none';
            prestigeModal.style.visibility = 'hidden';
            prestigeModal.style.opacity = '0';
        });
    }

    // Welcome back modal
    const closeWelcomeButton = document.getElementById('close-welcome-button');
    if (closeWelcomeButton && welcomeBackModal) {
        closeWelcomeButton.addEventListener('click', () => {
            welcomeBackModal.classList.remove('active');
            // Hide when inactive
            welcomeBackModal.style.display = 'none';
            welcomeBackModal.style.pointerEvents = 'none';
            welcomeBackModal.style.visibility = 'hidden';
            welcomeBackModal.style.opacity = '0';
        });
    }

    // Comprehensive button verification function
    function verifyAllButtons() {
        // Note: Buttons use addEventListener, not onclick attributes
        // This verification only checks if buttons exist, not if they have handlers
        // (Checking for event listeners is not reliable without browser dev tools)
        const buttons = {
            'cast-button': () => {
                const btn = document.getElementById('cast-button');
                return btn !== null;
            },
            'auto-cast-toggle': () => {
                const btn = document.getElementById('auto-cast-toggle');
                return btn !== null;
            },
            'experiment-button': () => {
                const btn = document.getElementById('experiment-button');
                return btn !== null;
            },
            'start-meditation-button': () => {
                const btn = document.getElementById('start-meditation-button');
                return btn !== null;
            },
            'end-meditation-button': () => {
                const btn = document.getElementById('end-meditation-button');
                return btn !== null;
            },
            'ascend-button': () => {
                const btn = document.getElementById('ascend-button');
                return btn !== null;
            },
            'close-prestige-button': () => {
                const btn = document.getElementById('close-prestige-button');
                return btn !== null;
            },
            'close-welcome-button': () => {
                const btn = document.getElementById('close-welcome-button');
                return btn !== null;
            },
            'reset-all-progress-button': () => {
                const btn = document.getElementById('reset-all-progress-button');
                return btn !== null;
            },
            'tier-selector': () => {
                const selector = document.getElementById('tier-selector');
                return selector !== null;
            }
        };

        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabButtonsWorking = tabButtons.length > 0 && Array.from(tabButtons).every(btn => {
            return btn.dataset.tab && typeof switchTab === 'function';
        });

        const results = {
            staticButtons: Object.entries(buttons).map(([id, check]) => ({ id, exists: !!document.getElementById(id), hasHandler: check() })),
            tabButtons: { count: tabButtons.length, working: tabButtonsWorking }
        };

        console.log('Button verification:', results);

        // Log any issues (only log if button doesn't exist)
        results.staticButtons.forEach(({ id, exists, hasHandler }) => {
            if (!exists) {
                console.warn(`Button ${id} not found in DOM!`);
            }
            // Note: We don't check for handlers since buttons use addEventListener
            // which doesn't set onclick attributes
        });

        if (!results.tabButtons.working) {
            console.warn('Tab buttons may not be working properly!');
        }

        return results;
    }

    // Run verification after a short delay to ensure all handlers are attached
    setTimeout(verifyAllButtons, 100);

    // Game state callbacks with optimized updates
    let previousAb = gameState ? gameState.ab : 0;

    gameState.onAbChanged = (newValue) => {
        if (!abDisplay) return;

        // Track Spell Energy earning for daily tasks (use total earned, not current balance)
        if (dailyRituals && gameState) {
            dailyRituals.updateTaskProgress('earn_ab', '', gameState.abTotalEarned);
        }

        // Use debounced update for better performance
        debouncedUIUpdate('abDisplay', () => {
            // Simple update for small changes, animate for large changes
            const diff = newValue - previousAb;
            if (Math.abs(diff) > 1) {
                animateNumber(abDisplay, previousAb, newValue, 200);
            } else {
                // Direct update for small changes (faster)
                abDisplay.textContent = `AB: ${formatShort(newValue)}`;
            }

            previousAb = newValue;
        });
    };

    gameState.onWorkstationCrafted = (wsId, count) => {
        if (dailyRituals) {
            dailyRituals.updateTaskProgress('craft', wsId, gameState.totalWorkstationsCrafted);
            dailyRituals.updateTaskProgress('own', wsId, count);
        }
        debouncedUIUpdate('workstationsTab', updateWorkstationsTab);
    };

    gameState.onUpgradePurchased = () => {
        debouncedUIUpdate('inscriptionsTab', updateInscriptionsTab);
    };

    gameState.onPrestigeCompleted = (ekGained) => {
        // Show element specialization choice UI
        showElementSpecializationChoice();

        // Check if meditation should be unlocked after this ascension
        meditationManager.checkUnlock();

        // Update auto button visibility after prestige
        if (castManager && castManager.updateAutoButtonVisibility) {
            castManager.updateAutoButtonVisibility();
        }
        debouncedUIUpdate('allUI', updateAllUI);
    };

    gameState.onRecipeDiscovered = (recipeId) => {
        // Track recipe discovery for daily tasks
        if (dailyRituals) {
            dailyRituals.updateTaskProgress('discover_recipe', '', gameState.discoveredRecipes.length);
        }
        debouncedUIUpdate('experimentTab', updateExperimentTab);
    };

    gameState.onWelcomeBack = (elapsed, abGained) => {
        // Show welcome back modal if significant offline progress
        if (abGained > 0 && elapsed > 60) {
            uiManager.modalManager.showWelcomeBack(elapsed, abGained);
        }
    };

    // Update inventory when ingredients change (optimized)
    gameState.onIngredientChanged = (ingId, newValue) => {
        // Update element counters immediately (always visible in HUD)
        updateElementCounters();

        // Only update if relevant tabs are currently active
        const activeTabs = ['inventory-tab', 'workstations-tab', 'inscriptions-tab', 'experiment-tab'];

        for (const tabId of activeTabs) {
            const tab = document.getElementById(tabId);
            if (tab && tab.classList.contains('active')) {
                // Prevent infinite loops
                if (tabId === 'workstations-tab' && isUpdatingWorkstations) {
                    continue;
                }
                if (tabId === 'inscriptions-tab' && isUpdatingInscriptions) {
                    continue;
                }

                debouncedUIUpdate(tabId, () => {
                    switch (tabId) {
                        case 'inventory-tab':
                            updateInventoryTab();
                            break;
                        case 'workstations-tab':
                            if (!isUpdatingWorkstations) {
                                isUpdatingWorkstations = true;
                                // Refresh virtual scroll if it exists, otherwise update tab
                                if (virtualWorkstationList && typeof virtualWorkstationList.refresh === 'function') {
                                    console.log('Refreshing virtual scroll due to ingredient change...');
                                    virtualWorkstationList.refresh();
                                } else {
                                    updateWorkstationsTab();
                                }
                                setTimeout(() => { isUpdatingWorkstations = false; }, 100);
                            }
                            break;
                        case 'inscriptions-tab':
                            if (!isUpdatingInscriptions) {
                                isUpdatingInscriptions = true;
                                // Refresh virtual scroll if it exists, otherwise update tab
                                if (virtualUpgradeList && typeof virtualUpgradeList.refresh === 'function') {
                                    console.log('Refreshing virtual scroll for upgrades due to ingredient change...');
                                    virtualUpgradeList.refresh();
                                } else {
                                    updateInscriptionsTab();
                                }
                                setTimeout(() => { isUpdatingInscriptions = false; }, 100);
                            }
                            break;
                        case 'experiment-tab':
                            updateExperimentTab();
                            break;
                    }
                });
                break; // Only update first active tab found
            }
        }
    };

    // Daily rituals callbacks
    dailyRituals.onTaskProgressUpdated = () => {
        updateDailiesTab();
    };

    dailyRituals.onTaskCompleted = () => {
        updateDailiesTab();
    };

    dailyRituals.onTasksRefreshed = () => {
        updateDailiesTab();
    };

    // Start game
    gameState.start();
    dailyRituals.init();

    // Initialize tutorial system (will auto-start if needed)
    if (tutorialSystem) {
        // Tutorial will check if it should start automatically
    }

    // Initialize progression analysis
    if (progressionAnalysis) {
        // Progression analysis starts automatically
    }

    // Initialize economy balancing
    if (economyBalancing) {
        // Economy balancing starts automatically
    }

    // Initialize feedback loop manager
    if (feedbackLoopManager) {
        // Feedback loop manager starts automatically
    }

    // Force visibility of main game area
    const mainGame = document.querySelector('.main-game');
    if (mainGame) {
        mainGame.style.cssText = 'margin-top: 80px !important; padding: 20px !important; max-width: 1400px !important; margin-left: auto !important; margin-right: auto !important; position: relative !important; z-index: 1 !important; pointer-events: auto !important; visibility: visible !important; display: block !important;';
        console.log('Main game area styles forced');
    }

    const tabContent = document.querySelector('.tabs-content');
    if (tabContent) {
        tabContent.style.cssText = 'position: relative !important; width: 100% !important; min-height: 400px !important; display: block !important; visibility: visible !important; z-index: 1 !important; pointer-events: auto !important;';
        console.log('Tab content styles forced');
    }

    // Initialize first tab (workstations)
    console.log('Switching to workstations tab...');
    switchTab('workstations');

    // Force visibility of workstations tab immediately
    const workstationsTab = document.getElementById('workstations-tab');
    if (workstationsTab) {
        workstationsTab.classList.add('active');
        workstationsTab.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 1 !important; pointer-events: auto !important;';
        console.log('Workstations tab styles forced');
    }

    const workstationList = document.getElementById('workstation-list');
    if (workstationList) {
        workstationList.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 15px !important; max-height: 70vh !important; overflow-y: auto !important; padding: 10px !important; position: relative !important; z-index: 1 !important; pointer-events: auto !important; visibility: visible !important; width: 100% !important;';
        console.log('Workstation list container styles forced');
    }

    const upgradeList = document.getElementById('upgrade-list');
    if (upgradeList) {
        upgradeList.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 15px !important; max-height: 70vh !important; overflow-y: auto !important; padding: 10px !important; position: relative !important; z-index: 1 !important; pointer-events: auto !important; visibility: visible !important; width: 100% !important;';
        console.log('Upgrade list container styles forced');
    }

    console.log('Tab switched, workstations tab ID:', document.getElementById('workstations-tab')?.id);
    console.log('Workstations tab has active class:', document.getElementById('workstations-tab')?.classList.contains('active'));
    console.log('Workstation list container exists:', !!document.getElementById('workstation-list'));

    // Update UI
    uiManager.updateAllUI();

    // Update ABPS every second with animation (optimized)
    let previousAbps = 0;
    const abpsInterval = setInterval(() => {
        if (abpsDisplay && gameState) {
            // Get event multiplier for display
            let eventMult = 1.0;
            if (eventSystem) {
                eventMult = eventSystem.getProductionMultiplier();
            }
            const abps = gameState.getAbPerSecond(eventMult);

            if (abps !== previousAbps) {
                // Format with SE/s label using animateNumberWithFormatter
                animateNumberWithFormatter(abpsDisplay, previousAbps, abps, 500, (val) => {
                    return `${formatOneDecimal(val)} SE/s`;
                });

                // Add glow effect if SE/s increased
                if (abps > previousAbps && abps > 0) {
                    abpsDisplay.style.textShadow = '0 0 10px rgba(34, 227, 255, 0.8)';
                    setTimeout(() => {
                        abpsDisplay.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.375)';
                    }, 500);
                }

                previousAbps = abps;
            }
        }
    }, 1000);

    // Track interval for cleanup
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(abpsInterval);
    }
    updateIntervals.push(abpsInterval);

    // Check for achievements periodically (optimized) - reduced frequency to prevent spam
    const achievementInterval = setInterval(() => {
        if (achievements) {
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                // Only show notification if not already shown
                const notificationMessage = `Achievement: ${achievement.name}!`;
                if (!shownAchievementNotifications.has(achievement.name)) {
                    showNotification(notificationMessage, 'success');
                }

                // Check tier unlocks after achievement is unlocked
                if (designTierSystem) {
                    try {
                        designTierSystem.checkTierUnlocks();
                    } catch (error) {
                        console.error('Error checking tier unlocks after achievement:', error);
                    }
                }

                // Announce to screen reader
                if (uiManager && uiManager.accessibilityManager) {
                    uiManager.accessibilityManager.announce(`Achievement unlocked: ${achievement.name}`, 'polite');
                }
            }
        }
    }, 2000); // Increased interval from 1000ms to 2000ms to reduce frequency

    // Track interval for cleanup
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(achievementInterval);
    }
    updateIntervals.push(achievementInterval);

    // Check for random events (optimized)
    const eventInterval = setInterval(() => {
        if (eventSystem) {
            eventSystem.checkForEvents();
            eventSystem.updateEvents(0.1);
            updateActiveEvents();

            // Update auto-cast interval if Inspiration event starts/ends
            if (window.updateAutoCastInterval) {
                window.updateAutoCastInterval();
            }
        }
    }, 1000);

    // Track interval for cleanup
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(eventInterval);
    }
    updateIntervals.push(eventInterval);

    // Update combo display (optimized) - reduced frequency to prevent flickering
    const comboInterval = setInterval(() => {
        updateComboDisplay();
        // Update auto-cast visual feedback to keep combo highlighting in sync
        if (castManager && castManager.updateAutoCastVisuals) {
            castManager.updateAutoCastVisuals();
        }
    }, 500);

    // Track interval for cleanup
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(comboInterval);
    }
    updateIntervals.push(comboInterval);

    // Update element counters live (optimized) - update every second
    const elementCounterInterval = setInterval(() => {
        updateElementCounters();
    }, 1000);

    // Track interval for cleanup
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(elementCounterInterval);
    }
    updateIntervals.push(elementCounterInterval);

    // Modify game tick to include event multipliers
    const originalTick = gameState.tick;
    gameState.tick = function () {
        let eventMult = 1.0;
        if (eventSystem) {
            eventMult = eventSystem.getProductionMultiplier();
        }
        originalTick.call(this, eventMult);
    };

    // Set up sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebar && sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            // Save sidebar state
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebar_collapsed', isCollapsed.toString());
        });

        // Load sidebar state
        const savedState = localStorage.getItem('sidebar_collapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
        }
    }

    // Make game state available for mobile and accessibility features


    // Initial Arcane Bits display
    if (abDisplay && gameState) {
        abDisplay.textContent = `AB: ${formatShort(gameState.ab)}`;
        previousAb = gameState.ab;
    }

    // Initial AB/s display
    if (abpsDisplay && gameState) {
        const abps = gameState.getAbPerSecond();
        abpsDisplay.textContent = `${formatOneDecimal(abps)} AB/s`;
        previousAbps = abps;
    }

    // Update specialization indicator
    updateSpecializationIndicator();

    // Initial element counters display
    if (gameState) {
        updateElementCounters();
    }

    // Mark as initialized
    uiInitialized = true;

    // Unified button handler is now managed by InputManager

}

// switchTab is now handled by UIManager


/**
 * Update workstations tab with virtual scrolling for performance
 */
// updateWorkstationsTab moved to WorkstationUI

/**
 * Get inscription bonuses for a workstation (only inscriptions, not buffs/prestige)
 * @param {string} workstationId - The workstation ID
 * @returns {Object} - Object with multiplier and list of applied inscriptions
 */
// getInscriptionBonuses and getInscriptionBonusRates moved to WorkstationUI

/**
 * Get tier symbol and styles - centralized helper for consistent tier symbols throughout app
 * @param {number} tier - Tier number (0-5)
 * @returns {Object} Tier symbol and style information
 */
/**
 * Get tier symbol and styling information
 * @param {number} tier - Item tier (0-5)
 * @returns {Object} Tier style object
 */
// Tier helpers moved to WorkstationUI/InventoryUI

// Traditional rendering function (used for small lists or as fallback)
// updateWorkstationsTabTraditional moved to WorkstationUI

/**
 * Update inscriptions tab with optimized rendering
 */



/**
 * Update experiment tab with optimized rendering
 */

/**
 * Update boons tab with optimized rendering
 */

function updateComboDisplay() {
    if (!comboSystem) return;

    const comboCount = comboSystem.getComboCount();
    const comboDisplay = document.getElementById('combo-display');

    if (comboCount > 0 && comboDisplay) {
        const mult = comboSystem.getComboMultiplier();
        // Check if auto-cast is maintaining this combo
        const autoMaintaining = castManager && castManager.getAutoCastEnabled && castManager.getAutoCastEnabled();
        comboDisplay.innerHTML = `<span class="css-icon-fire"></span> ${comboCount}x Combo (${(mult * 100).toFixed(0)}%)${autoMaintaining ? ' <span class="auto-indicator">⚡</span>' : ''}`;
        comboDisplay.style.display = 'block';

        // Update auto-combo visual feedback
        if (autoMaintaining) {
            comboDisplay.classList.add('auto-combo-active');
        } else {
            comboDisplay.classList.remove('auto-combo-active');
        }
    } else if (comboDisplay) {
        comboDisplay.style.display = 'none';
        comboDisplay.classList.remove('auto-combo-active');
    }
}

/**
 * Calculate total ingredient count for each tier
 * @returns {Object} Object with tier numbers as keys and total counts as values
 */

/**
 * Initialize volume sliders
 */
function initializeVolumeSliders() {
    if (!uiManager || !uiManager.systems.audioSystem) {
        console.warn('audioSystem not available for volume sliders');
        return;
    }

    const audioSystem = uiManager.systems.audioSystem;

    // Sound Effects Volume Slider (Tier 2+)
    const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
    const sfxVolumeValue = document.getElementById('sfx-volume-value');

    if (sfxVolumeSlider && sfxVolumeValue) {
        // Set initial value from audioSystem
        const currentSfxVolume = audioSystem.sfxVolume || 1;
        sfxVolumeSlider.value = currentSfxVolume;
        sfxVolumeValue.textContent = Math.round(currentSfxVolume * 100) + '%';

        // Add event listener
        sfxVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            audioSystem.setSfxVolume(volume);
            sfxVolumeValue.textContent = Math.round(volume * 100) + '%';
        });
    }

    // Music Volume Slider (Tier 4+)
    const musicVolumeSlider = document.getElementById('music-volume-slider');
    const musicVolumeValue = document.getElementById('music-volume-value');

    if (musicVolumeSlider && musicVolumeValue) {
        // Set initial value from audioSystem
        const currentMusicVolume = audioSystem.musicVolume || 1;
        musicVolumeSlider.value = currentMusicVolume;
        musicVolumeValue.textContent = Math.round(currentMusicVolume * 100) + '%';

        // Add event listener
        musicVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            if (audioSystem.setMusicVolume) {
                audioSystem.setMusicVolume(volume);
            } else {
                // Fallback if setMusicVolume doesn't exist

            }
            musicVolumeValue.textContent = Math.round(volume * 100) + '%';
        });
    }
}

/**
 * Update settings tab content
 */
function updateSettingsTab() {
    if (!gameState || !designTierSystem) {
        console.error('gameState or designTierSystem not initialized');
        return;
    }

    // Update current tier display
    const currentTierDisplay = document.getElementById('current-tier-display');
    if (currentTierDisplay) {
        currentTierDisplay.textContent = designTierSystem.getCurrentTier();
    }

    // Initialize volume sliders
    initializeVolumeSliders();

    // Initialize sustainable design settings
    if (sustainableDesignManager) {
        const lowPowerToggle = document.getElementById('low-power-mode-toggle');
        const animationQualitySelect = document.getElementById('animation-quality-select');

        if (lowPowerToggle) {
            const settings = sustainableDesignManager.getSettings();
            lowPowerToggle.checked = settings.lowPowerMode;
            lowPowerToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    sustainableDesignManager.enableLowPowerMode();
                } else {
                    sustainableDesignManager.disableLowPowerMode();
                }
            });
        }

        if (animationQualitySelect) {
            const settings = sustainableDesignManager.getSettings();
            animationQualitySelect.value = settings.animationQuality;
            animationQualitySelect.addEventListener('change', (e) => {
                sustainableDesignManager.setAnimationQuality(e.target.value);
            });
        }

        // Mobile performance mode toggle
        if (mobilePerformanceManager && (isMobile || window.innerWidth <= 768)) {
            const mobilePerfSetting = document.getElementById('mobile-performance-setting');
            const mobilePerfToggle = document.getElementById('mobile-performance-mode-toggle');

            if (mobilePerfSetting) {
                mobilePerfSetting.style.display = 'block';
            }

            if (mobilePerfToggle) {
                const perfMode = mobilePerformanceManager.getPerformanceMode();
                mobilePerfToggle.checked = perfMode === 'low';
                mobilePerfToggle.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        mobilePerformanceManager.enablePerformanceMode();
                    } else {
                        mobilePerformanceManager.disablePerformanceMode();
                    }
                });
            }
        }
    }

    // Show tier selector after first ascension (prestigeCount >= 1)
    const tierSelector = document.getElementById('tier-selector');
    if (tierSelector) {
        const hasAscended = gameState.prestigeCount >= 1;

        if (hasAscended) {
            // Show the tier selector
            tierSelector.style.display = 'block';

            // Show the label if it exists
            const tierSelectorLabel = tierSelector.previousElementSibling;
            if (tierSelectorLabel && tierSelectorLabel.textContent.includes('Tier')) {
                tierSelectorLabel.style.display = 'block';
            }

            // Show the parent container if it exists
            const tierSelectorContainer = tierSelector.closest('.settings-section, .card-section, .form-group');
            if (tierSelectorContainer) {
                tierSelectorContainer.style.display = 'block';
            }

            // Update tier selector options based on unlocked tiers
            const unlockedTiers = designTierSystem.getUnlockedTiers();
            Array.from(tierSelector.options).forEach(option => {
                const tier = parseInt(option.value, 10);
                option.disabled = !unlockedTiers.includes(tier);
            });

            // Set current tier value
            tierSelector.value = designTierSystem.getCurrentTier().toString();

            console.log('Tier selector enabled after ascension. Current tier:', designTierSystem.getCurrentTier(), 'Unlocked tiers:', unlockedTiers);
        } else {
            // Hide the tier selector until first ascension
            tierSelector.style.display = 'none';

            // Also hide the label if it exists
            const tierSelectorLabel = tierSelector.previousElementSibling;
            if (tierSelectorLabel && tierSelectorLabel.textContent.includes('Tier')) {
                tierSelectorLabel.style.display = 'none';
            }

            // Hide the parent container if it exists
            const tierSelectorContainer = tierSelector.closest('.settings-section, .card-section, .form-group');
            if (tierSelectorContainer) {
                tierSelectorContainer.style.display = 'none';
            }

            console.log('Tier selector hidden until first ascension. Prestige count:', gameState.prestigeCount);
        }
    }

    // Initialize tutorial buttons (only once, check if already initialized)
    const startTutorialButton = document.getElementById('start-tutorial-button');
    const resetTutorialButton = document.getElementById('reset-tutorial-button');

    if (startTutorialButton && !startTutorialButton.hasAttribute('data-tutorial-listener-added')) {
        startTutorialButton.setAttribute('data-tutorial-listener-added', 'true');
        startTutorialButton.addEventListener('click', () => {
            if (tutorialSystem) {
                tutorialSystem.startTutorial();
            }
        });
    }

    if (resetTutorialButton && !resetTutorialButton.hasAttribute('data-tutorial-listener-added')) {
        resetTutorialButton.setAttribute('data-tutorial-listener-added', 'true');
        resetTutorialButton.addEventListener('click', () => {
            if (tutorialSystem) {
                tutorialSystem.reset();
                if (uiManager && uiManager.showNotification) {
                    uiManager.showNotification('Tutorial reset. It will start automatically on next game load.', 'info');
                }
            }
        });
    }
}

/**
 * Reset all game progress
 */
/**
 * Show confirmation dialog for destructive actions
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Text to type for confirmation
 * @returns {Promise<boolean>} - Whether user confirmed
 */
function showDestructiveConfirmation(title, message, confirmText = 'RESET') {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';

        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'destructive-confirmation-modal';
        modal.style.cssText = 'background: var(--bg-card); border: 2px solid var(--error, #FF4444); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);';

        modal.innerHTML = `
            <h2 style="color: var(--error, #FF4444); margin-bottom: 16px; font-size: 24px;">${title}</h2>
            <p style="color: var(--text); margin-bottom: 20px; line-height: 1.6;">${message}</p>
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: var(--text); margin-bottom: 8px; font-weight: 600;">
                    Type "${confirmText}" to confirm:
                </label>
                <input type="text" id="destructive-confirm-input" 
                    style="width: 100%; padding: 12px; background: var(--bg-dark); border: 2px solid var(--border); border-radius: 8px; color: var(--text); font-size: 16px;"
                    autocomplete="off" spellcheck="false">
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="destructive-confirm-cancel" class="btn-secondary" style="padding: 12px 24px;">Cancel</button>
                <button id="destructive-confirm-ok" class="btn-danger" style="padding: 12px 24px;" disabled>Confirm</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const input = modal.querySelector('#destructive-confirm-input');
        const cancelBtn = modal.querySelector('#destructive-confirm-cancel');
        const okBtn = modal.querySelector('#destructive-confirm-ok');

        // Enable OK button when text matches
        input.addEventListener('input', (e) => {
            okBtn.disabled = e.target.value !== confirmText;
        });

        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !okBtn.disabled) {
                okBtn.click();
            }
        });

        // Focus input
        input.focus();

        // Cancel handler
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });

        // Confirm handler
        okBtn.addEventListener('click', () => {
            if (input.value === confirmText) {
                document.body.removeChild(overlay);
                resolve(true);
            }
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });

        // Close on Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', escapeHandler);
                resolve(false);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    });
}

function resetAllProgress() {
    console.log('resetAllProgress called');

    // Show confirmation dialog
    showDestructiveConfirmation(
        '⚠️ Reset All Progress',
        'This will permanently delete ALL your game progress, including:\n\n• All currency and ingredients\n• All workstations and upgrades\n• All prestige points and bonuses\n• All achievements and milestones\n• Everything!\n\nThis action CANNOT be undone!',
        'RESET'
    ).then((confirmed) => {
        if (!confirmed) {
            console.log('Reset cancelled by user');
            if (uiManager && uiManager.showNotification) {
                uiManager.showNotification('Reset cancelled. Your progress is safe.', 'info');
            }
            return;
        }

        console.log('Reset confirmed, proceeding with reset...');

        // Show loading state
        if (uiManager && uiManager.showLoadingState) {
            uiManager.showLoadingState('Resetting game...');
        }

        // Clear all localStorage FIRST
        localStorage.clear();

        // Also clear sessionStorage
        sessionStorage.clear();

        // Reset all game state
        if (gameState) {
            // Reset game state to initial values
            gameState.ab = 0.0;
            gameState.abTotalEarned = 0.0; // Ensure this is reset
            gameState.inventory = {};
            gameState.workstations = {};
            gameState.upgradesOwned = {};
            gameState.activeBuffs = [];
            gameState.prestigePoints = 0;
            gameState.prestigeLifetimeEarned = 0.0;
            gameState.prestigeBonuses = {};
            gameState.prestigeCount = 0;
            gameState.discoveredRecipes = [];
            gameState.totalTaps = 0;
            gameState.totalWorkstationsCrafted = 0;
            gameState.totalPotionsCrafted = 0;
            gameState.unlockedMilestones = new Set();

            // Force save with empty state - ensure abTotal is explicitly set to 0
            const saveData = {
                ab: 0.0,
                abTotal: 0.0, // Explicitly set abTotal to 0
                inventory: {},
                workstations: {},
                upgrades: {},
                prestige: {
                    points: 0,
                    lifetimeEarned: 0.0,
                    bonuses: {},
                    count: 0
                },
                experiments: {
                    discovered: []
                },
                stats: {
                    totalTaps: 0,
                    totalWorkstationsCrafted: 0,
                    totalPotionsCrafted: 0
                },
                milestones: {
                    unlocked: []
                },
                // coven: null, // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
                timestamp: Date.now() / 1000,
                version: "2.0"
            };

            // Save directly to localStorage to ensure it's saved
            localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData));
            console.log('Reset save data written to localStorage with abTotal: 0');

            // Also call saveGameState to ensure consistency
            gameState.saveGameState();
        }

        // Reset design tier system
        if (designTierSystem) {
            designTierSystem.currentTier = 0;
            designTierSystem.unlockedTiers = new Set([0]);
            designTierSystem.applyTier(0);
            designTierSystem.saveTier();
        }

        // Also reset any other systems that might have abTotalEarned
        // Ensure all localStorage keys are cleared (including any that might be cached)
        // Clear sessionStorage as well
        sessionStorage.clear();

        // Reset combo system
        if (comboSystem) {
            comboSystem.reset();
        }

        // Reset achievements
        if (achievements) {
            achievements.reset();
        }

        // Reset daily rituals
        if (dailyRituals) {
            dailyRituals.activeTasks = [];
            dailyRituals.taskProgress = {};
            dailyRituals.claimedTasks = [];
            dailyRituals.ekFragments = 0;
        }

        // Reset meditation state
        if (meditationManager) {
            meditationManager.reset();
        }

        // Show notification
        if (uiManager && uiManager.showNotification) {
            uiManager.showNotification('<span class="css-icon-reset"></span> All progress has been reset!', 'info');
        }

        // Reload the page to ensure clean state
        setTimeout(() => {
            location.reload();
        }, 1000);
    }); // Close .then() callback
}

// Note: Global functions are now defined in defineGlobalFunctions() 
// which is called early in initUI() to ensure they're available when buttons are created

function getScaledRecipe(baseRecipe, owned, growth) {
    const scaled = {};
    for (const ingId in baseRecipe) {
        const baseCost = baseRecipe[ingId];
        scaled[ingId] = Math.ceil(baseCost * Math.pow(growth, owned));
    }
    return scaled;
}

/**
 * Show element specialization choice modal after ascension
 */
// showElementSpecializationChoice is now handled by ModalManager


function updateDailyProgress(conditionType, param, value) {
    if (dailyRituals) {
        dailyRituals.updateTaskProgress(conditionType, param, value);
    }
}

// Make globally accessible for meditation system


/**
 * Debounced UI update function to prevent excessive DOM manipulations
 * @param {string} key - Unique key for update
 * @param {Function} updateFn - Function to execute for update
 */
function debouncedUIUpdate(key, updateFn) {
    // Clear existing timeout for this key
    if (uiUpdateTimeouts.has(key)) {
        clearTimeout(uiUpdateTimeouts.get(key));
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
        updateFn();
        uiUpdateTimeouts.delete(key);
    }, uiUpdateDelay);

    uiUpdateTimeouts.set(key, timeoutId);
}

/**
 * Debounced achievement check to prevent excessive checks
 */
function debouncedAchievementCheck() {
    debouncedUIUpdate('achievementCheck', () => {
        if (achievements) {
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                // Only show notification if not already shown
                if (!shownAchievementNotifications.has(achievement.name)) {
                    showNotification(`Achievement: ${achievement.name}!`, 'success');
                }
            }
        }
    });
}

/**
 * Initialize auto-save functionality with configurable intervals
 */
function initAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(() => {
        if (gameState) {
            gameState.saveGameState();
        }
        // Also save meditation state if it exists
        if (meditationManager) {
            meditationManager.save();
        }

        // Periodic memory cleanup (every 5 minutes)
        if (Date.now() - lastMemoryCleanup > 300000) {
            performMemoryCleanup();
            lastMemoryCleanup = Date.now();
        }
    }, autoSaveInterval);

    // Track interval for cleanup
    allIntervals.push(autoSaveTimer);
    if (memoryLeakPreventionManager) {
        memoryLeakPreventionManager.trackInterval(autoSaveTimer);
    }
}

/**
 * Perform periodic memory cleanup
 */
function performMemoryCleanup() {
    // Force garbage collection hint (if available)
    if (window.gc && typeof window.gc === 'function') {
        try {
            window.gc();
        } catch (e) {
            // GC not available
        }
    }

    // Clear any cached calculations
    if (gameState && gameState.cachedProduction) {
        // Keep cache but limit its size
        const cacheKeys = Object.keys(gameState.cachedProduction);
        if (cacheKeys.length > 100) {
            // Clear oldest entries
            const keysToDelete = cacheKeys.slice(0, cacheKeys.length - 100);
            keysToDelete.forEach(key => {
                delete gameState.cachedProduction[key];
            });
        }
    }

    // Log memory usage if available (Chrome DevTools)
    if (performance.memory) {
        const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        if (parseFloat(memoryMB) > 1000) {
            console.warn(`High memory usage detected: ${memoryMB} MB`);
        }
    }
}

/**
 * Set auto-save interval
 * @param {number} interval - Interval in milliseconds
 */
function setAutoSaveInterval(interval) {
    autoSaveInterval = interval;
    initAutoSave();
}



// Track shown achievement notifications to prevent duplicates


// showWelcomeBack is now handled by ModalManager


// Show prestige modal
/**
 * Show story introduction modal on first launch
 */
// showStoryIntroduction is now handled by ModalManager

/**
 * Close story introduction modal
 */
// Story and Meditation modals are now handled by ModalManager


// showPrestigeModal is now handled by ModalManager


// Debug click listener removed - was causing interference with click handling

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);

                // Check for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Show update notification
                            if (uiManager && uiManager.showNotification) {
                                uiManager.showNotification('App update available! Refresh to update.', 'info');
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }

    // PWA install prompt handling is now managed by PWAFeaturesManager
    // The following code related to deferredPrompt, installButton, and PWA modals is now handled by PWAFeaturesManager.
    // let deferredPrompt = null;
    // let installPromptShown = false;
    const installButton = document.getElementById('install-app-button');

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');

    if (isInstalled) {
        // Already installed, hide install button
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else {
        // Show install button if available (will be shown when prompt is available)
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    // PWA install prompt handling is now managed by PWAFeaturesManager

    // Make deferredPrompt accessible to modal functions


    // Install button click handler
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (pwaManager) {
                pwaManager.handleInstallButtonClick();
            }
        });
    }

    // Listen for app installed event
    // Managed by PWAFeaturesManager



    // Add prestige button to top bar
    const hudControls = document.querySelector('.hud-controls');
    if (hudControls) {
        // Check if button already exists
        let ascendBtn = document.getElementById('ascend-button-hud');
        if (!ascendBtn) {
            ascendBtn = document.createElement('button');
            ascendBtn.id = 'ascend-button-hud';
            ascendBtn.className = 'btn-primary';
            ascendBtn.innerHTML = '<span class="css-icon-lightning"></span> Ascend';
            ascendBtn.setAttribute('aria-label', 'Ascend to gain Eldritch Keys');
            ascendBtn.style.marginLeft = '10px';
            ascendBtn.style.position = 'relative';
            ascendBtn.style.zIndex = '1000';
            ascendBtn.style.pointerEvents = 'auto';
            ascendBtn.style.visibility = 'visible';
            ascendBtn.style.display = 'inline-block';
            ascendBtn.style.cursor = 'pointer';

            // Use addEventListener instead of onclick
            ascendBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Show prestige modal if we have enough AB
                if (gameState.calculatePrestigeGain() > 0) {
                    uiManager.modalManager.showPrestigeModal();
                } else {
                    console.error('showPrestigeModal function not found');
                }
            });

            hudControls.appendChild(ascendBtn);
            console.log('Ascend button added to HUD controls');
        } else {
            console.log('Ascend button already exists');
        }
    } else {
        console.error('HUD controls not found, cannot add ascend button');
    }

    // Keyboard shortcuts are now handled by InputManager

    // Force modals to be non-interactive immediately
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (!modal.classList.contains('active')) {
            modal.style.display = 'none';
            modal.style.pointerEvents = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
        }
    });
    console.log('Forced modals to be non-interactive:', modals.length);

    try {
        console.log('Starting game initialization...');
        initUI();
        console.log('UI initialized successfully');

        // Verify buttons are clickable
        const castBtn = document.getElementById('cast-button');
        if (castBtn) {
            console.log('Cast button found:', {
                disabled: castBtn.disabled,
                pointerEvents: window.getComputedStyle(castBtn).pointerEvents,
                zIndex: window.getComputedStyle(castBtn).zIndex
            });
        } else {
            console.error('Cast button NOT found in DOM!');
        }

        // Verify tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        console.log(`Found ${tabBtns.length} tab buttons`);
        tabBtns.forEach((btn, i) => {
            console.log(`Tab button ${i}:`, {
                id: btn.id,
                dataset: btn.dataset.tab,
                disabled: btn.disabled
            });
        });

        // Coven system archived for future development - see ARCHIVED_COVEN_FEATURES.md
        // initCovenSystem();
        console.log('Game fully initialized');

        // Double-check modals after init
        modals.forEach(modal => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                modal.style.pointerEvents = 'none';
                modal.style.visibility = 'hidden';
            }
        });

        // Verify modals are actually hidden
        console.log('Modal check after init:');
        modals.forEach(modal => {
            const computed = window.getComputedStyle(modal);
            console.log(`Modal ${modal.id}:`, {
                display: computed.display,
                pointerEvents: computed.pointerEvents,
                visibility: computed.visibility,
                opacity: computed.opacity,
                hasActiveClass: modal.classList.contains('active'),
                zIndex: computed.zIndex
            });
        });

        // Check if cast button exists and is clickable (reuse castBtn variable)
        if (castBtn) {
            const btnComputed = window.getComputedStyle(castBtn);
            console.log('Cast button check:', {
                display: btnComputed.display,
                pointerEvents: btnComputed.pointerEvents,
                visibility: btnComputed.visibility,
                zIndex: btnComputed.zIndex,
                position: btnComputed.position
            });
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        console.error('Stack trace:', error.stack);
        if (typeof handleError === 'function') {
            handleError(error, 'gameInitialization', true);
        } else {
            // Fallback error display
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: red; color: white; padding: 20px; z-index: 99999;';
            errorDiv.textContent = `Game initialization failed: ${error.message}`;
            document.body.appendChild(errorDiv);
        }
    }
});

/**
 * Initialize coven system event handlers
 * Archived for future development - see ARCHIVED_COVEN_FEATURES.md
 */
function initCovenSystem() {
    // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
    return;
}

/**
 * Cleanup function to clear all intervals and timeouts
 * Prevents memory leaks and ensures clean shutdown
 */
function cleanup() {
    console.log('Cleaning up game resources...');

    // Clear all tracked intervals
    allIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
    });
    allIntervals = [];

    // Clear all tracked timeouts
    allTimeouts.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
    });
    allTimeouts = [];

    // Clear update intervals
    updateIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
    });
    updateIntervals = [];

    // Clear UI update timeouts
    uiUpdateTimeouts.forEach((timeout, key) => {
        if (timeout) clearTimeout(timeout);
    });
    uiUpdateTimeouts.clear();

    // Clear auto-cast interval
    if (autoCastInterval) {
        clearInterval(autoCastInterval);
        autoCastInterval = null;
    }

    // Clear auto-save timer
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }



    // Cleanup meditation state tick loop
    if (meditationManager && typeof meditationManager.reset === 'function') {
        // We don't want to reset, just stop loops if any. 
        // MeditationManager doesn't have a stop method exposed, but save() is called below.
        // The tick loop is inside MeditationState.
        if (meditationManager.state && typeof meditationManager.state.stopTickLoop === 'function') {
            meditationManager.state.stopTickLoop();
        }
    }

    // Cleanup memory leak prevention manager
    if (memoryLeakPreventionManager && typeof memoryLeakPreventionManager.cleanup === 'function') {
        memoryLeakPreventionManager.cleanup();
    }

    // Save game state before cleanup (use immediate save)
    if (gameState) {
        try {
            gameState.saveGameStateImmediate();
        } catch (error) {
            console.error('Error saving game state during cleanup:', error);
        }
    }

    // Save meditation state before cleanup
    if (meditationManager && typeof meditationManager.save === 'function') {
        try {
            meditationManager.save();
        } catch (error) {
            console.error('Error saving meditation state during cleanup:', error);
        }
    }

    // Cleanup lifecycle manager (removes all tracked event listeners and timers)
    if (globalLifecycleManager) {
        try {
            globalLifecycleManager.destroy();
            console.log('Lifecycle manager cleanup stats:', globalLifecycleManager.getStats());
        } catch (error) {
            console.error('Error during lifecycle manager cleanup:', error);
        }
    }

    // Clear large arrays/objects that might be holding memory
    if (gameState) {
        // Don't clear gameState itself, but clear any cached data
        if (gameState.cachedProduction) {
            gameState.cachedProduction = null;
        }
    }

    console.log('Cleanup complete');
}

// Add cleanup listener on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
}

// Export utility functions for testing
export {
    getScaledRecipe
};