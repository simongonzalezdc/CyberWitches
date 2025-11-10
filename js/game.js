import { GameState } from './gameState.js';
import { DailyRituals } from './dailyRituals.js';
import { AchievementSystem } from './achievements.js';
import { ComboSystem } from './comboSystem.js';
import { EventSystem } from './eventSystem.js';
import { MeditationState } from './meditationState.js';
import { MeditationUI } from './meditationUI.js';
import { MeditationTowers } from './meditationTowers.js';
import { DesignTierSystem } from './designTierSystem.js';
import { FadingThemeSystem } from './fadingThemeSystem.js';
import { INGREDIENTS, PRODUCERS, UPGRADES, PRESTIGE_BONUSES, HIDDEN_RECIPES } from './data.js';
import { ELEMENT_SPECIALIZATIONS } from './elementSpecialization.js';
import { formatShort, formatPrecise, formatTimeDuration, formatOneDecimal } from './utils.js';
import { pulseElement, highlightElement, slideIn, animateNumber, shakeElement } from './animations.js';
// Particle effects removed for memory optimization - see VISUAL_ALTERNATIVES.md
import { audioSystem } from './audioSystem.js';
import { VirtualWorkstationList, VirtualUpgradeList, VirtualAchievementList } from './virtualScroll.js';
import { handleError, safeFunction, safeAsyncFunction, validateParams, retryWithBackoff } from './errorHandler.js';
import { debounce, throttle, deepClone, formatWithCommas, clamp, lerp, inRange, randomInt, randomFloat, randomChoice, shuffle, isEmpty, capitalize, secondsToTime, calculatePercentage, isMobile, isTouchDevice, getPixelRatio, createElement, batchDOMUpdate, setLocalStorage, getLocalStorage, removeLocalStorage, clearLocalStorage, isInViewport, scrollIntoView, addEventListener, PerformanceMonitor } from './commonUtils.js';
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
import pwaFeaturesManager from './pwaFeatures.js';
import TutorialSystem from './tutorial.js';
import BalanceTestingFramework from './balanceTesting.js';
import { CodeOrganization, GAME_CONSTANTS, MAGIC_NUMBERS } from './codeOrganization.js';
import coreWebVitalsOptimizer from './coreWebVitals.js';
import ProgressionAnalysis from './progressionAnalysis.js';
import EconomyBalancing from './economyBalancing.js';
import FeedbackLoopManager from './feedbackLoops.js';
import CodeDuplicationDetector from './codeDuplication.js';

/**
 * Animate number with custom formatter (for element counters with 1 decimal)
 */
function animateNumberWithFormatter(element, startValue, endValue, duration, formatter) {
    if (!element) return;
    
    const startTime = performance.now();
    const difference = endValue - startValue;
    
    // If difference is very small, just update directly
    if (Math.abs(difference) < 0.01) {
        element.textContent = formatter(endValue);
        return;
    }
    
    let animationFrameId = null;
    
    function update() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (difference * easeProgress);
        
        // Update text content with custom formatter
        element.textContent = formatter(current);
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(update);
        } else {
            element.textContent = formatter(endValue);
        }
    }
    
    // Start animation
    update();
}

/**
 * Main game controller with optimized timing and performance
 */

// Initialize game
let gameState;
let dailyRituals;
let achievements;
let comboSystem;
let eventSystem;
let meditationState;
let meditationUI;
let meditationTowers;
let designTierSystem;
let fadingThemeSystem;
let tutorialSystem;
let balanceTestingFramework;
let progressionAnalysis;
let economyBalancing;
let feedbackLoopManager;

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

// Keyboard shortcuts
const keyboardShortcuts = {
    '1': () => switchTab('workstations'),
    '2': () => switchTab('inscriptions'),
    '3': () => switchTab('inventory'),
    '4': () => switchTab('experiment'),
    '5': () => switchTab('dailies'),
    '6': () => switchTab('boons'),
    '7': () => switchTab('meditation'),
    '8': () => switchTab('stats'),
    ' ': () => {
        if (castButton) {
            const handler = castButton.onclick;
            if (handler) handler();
        }
    },
    's': () => {
        if (gameState) {
            gameState.saveGameState();
            showNotification('Game saved!', 'success');
        }
    },
    'a': () => {
        if (gameState && gameState.calculatePrestigeGain() > 0) {
            showPrestigeModal();
        }
    },
    'Escape': () => {
        // Close any open modals
        if (prestigeModal && prestigeModal.classList.contains('active')) {
            prestigeModal.classList.remove('active');
        }
        if (welcomeBackModal && welcomeBackModal.classList.contains('active')) {
            welcomeBackModal.classList.remove('active');
        }
    }
};

/**
 * Define global functions for onclick handlers BEFORE initUI
 * This ensures they're available when buttons are created with innerHTML
 */
function defineGlobalFunctions() {
    // Global functions for onclick handlers
    window.craftWorkstation = (wsId, amount, buttonElement = null) => {
        if (!gameState) {
            console.error('GameState not initialized');
            return;
        }
        
        // Create unique key for this button/action combination
        const buttonKey = buttonElement ? `${wsId}-${buttonElement.dataset.amount || '1'}-${buttonElement.dataset.action || 'craft'}` : `${wsId}-${amount}`;
        
        // Debounce: Prevent rapid clicks
        const now = Date.now();
        const lastClick = clickHandlers.lastClickTime.get(buttonKey) || 0;
        if (now - lastClick < clickHandlers.debounceDelay) {
            console.log('Click debounced - too soon after last click');
            return;
        }
        
        // Check if already processing this button
        if (clickHandlers.processing.has(buttonKey)) {
            console.log('Already processing this action, ignoring click');
            return;
        }
        
        // Mark as processing
        clickHandlers.processing.add(buttonKey);
        clickHandlers.lastClickTime.set(buttonKey, now);
        
        // Disable button during processing
        if (buttonElement) {
            buttonElement.disabled = true;
        }
        
        // Ensure amount is a number
        const craftAmount = parseInt(amount, 10) || 1;
        console.log('craftWorkstation called:', { wsId, amount: craftAmount, originalAmount: amount });
        
        const oldCount = gameState.workstations[wsId] || 0;
        const success = gameState.craftWorkstation(wsId, craftAmount);
        
        if (success) {
            const newCount = gameState.workstations[wsId] || 0;
            const gained = newCount - oldCount;
            
            console.log('Crafting successful:', { oldCount, newCount, gained });
            
            // Visual feedback
            if (buttonElement && typeof highlightElement === 'function') {
                highlightElement(buttonElement, '#3CE3C5', 300);
                pulseElement(buttonElement, 1.1, 200);
            }
            
            // Trigger preserve effect
            if (window.fadingThemeSystem && typeof window.fadingThemeSystem.triggerPreserveEffect === 'function') {
                window.fadingThemeSystem.triggerPreserveEffect();
            }
            
            // Show notification in sidebar
            if (gained > 0) {
                const displayName = PRODUCERS.find(p => p.id === wsId)?.displayName || wsId;
                showCraftNotification(`Crafted ${gained} ${displayName}!`, gained);
                
                // Play craft sound for workstation crafting
                if (window.audioSystem && window.audioSystem.playSound) {
                    window.audioSystem.playSound('craft');
                }
                
                // Announce to screen reader
                if (window.Accessibility && typeof window.Accessibility.announceGameEvent === 'function') {
                    window.Accessibility.announceGameEvent('workstation_crafted', {
                        name: displayName,
                        amount: gained
                    });
                }
            }
        } else {
            console.log('Crafting failed - cannot afford');
            // Shake effect on failure
            if (buttonElement && typeof shakeElement === 'function') {
                shakeElement(buttonElement, 5, 300);
            }
        }
        
        // Re-enable button and clear processing flag
        if (buttonElement) {
            // Use setTimeout to ensure UI updates before re-enabling
            setTimeout(() => {
                buttonElement.disabled = false;
            }, 50);
        }
        
        // Clear processing flag after a delay
        setTimeout(() => {
            clickHandlers.processing.delete(buttonKey);
        }, clickHandlers.debounceDelay);
        
        // Refresh virtual scroll if it exists, otherwise update tab
        if (virtualWorkstationList && typeof virtualWorkstationList.refresh === 'function') {
            console.log('Refreshing virtual scroll...');
            virtualWorkstationList.refresh();
        } else if (typeof updateWorkstationsTab === 'function') {
            updateWorkstationsTab();
        }
    };
    
    window.craftWorkstationMax = (wsId, buttonElement = null) => {
        if (!gameState) return;
        
        // Create unique key for this action
        const buttonKey = `max-${wsId}`;
        
        // Debounce: Prevent rapid clicks
        const now = Date.now();
        const lastClick = clickHandlers.lastClickTime.get(buttonKey) || 0;
        if (now - lastClick < clickHandlers.debounceDelay) {
            console.log('Max click debounced - too soon after last click');
            return;
        }
        
        // Check if already processing
        if (clickHandlers.processing.has(buttonKey)) {
            console.log('Already processing max craft, ignoring click');
            return;
        }
        
        // Mark as processing
        clickHandlers.processing.add(buttonKey);
        clickHandlers.lastClickTime.set(buttonKey, now);
        
        // Disable button during processing
        if (buttonElement) {
            buttonElement.disabled = true;
        }
        
        console.log('craftWorkstationMax called for:', wsId);
        let maxCount = 0;
        for (let i = 0; i < 1000; i++) {
            const owned = (gameState.workstations[wsId] || 0) + maxCount;
            const prodData = PRODUCERS.find(p => p.id === wsId);
            if (!prodData) break;
            const recipe = getScaledRecipe(prodData.recipe, owned, prodData.growth);
            
            if (gameState.canAfford(recipe)) {
                maxCount++;
            } else {
                break;
            }
        }
        
        console.log('Max count calculated:', maxCount);
        
        if (maxCount > 0) {
            const oldCount = gameState.workstations[wsId] || 0;
            const success = gameState.craftWorkstation(wsId, maxCount);
            
            if (success) {
                const newCount = gameState.workstations[wsId] || 0;
                const gained = newCount - oldCount;
                
                // Show notification in sidebar
                if (gained > 0) {
                    const displayName = PRODUCERS.find(p => p.id === wsId)?.displayName || wsId;
                    showCraftNotification(`Crafted ${gained} ${displayName}!`, gained);
                }
                
                // Play craft sound (same as x1 and x10)
                if (window.audioSystem && window.audioSystem.playSound) {
                    window.audioSystem.playSound('craft');
                }
            }
            
            // Refresh virtual scroll if it exists, otherwise update tab
            if (virtualWorkstationList && typeof virtualWorkstationList.refresh === 'function') {
                console.log('Refreshing virtual scroll after max craft...');
                virtualWorkstationList.refresh();
            } else if (typeof updateWorkstationsTab === 'function') {
                updateWorkstationsTab();
            }
        }
        
        // Re-enable button and clear processing flag
        if (buttonElement) {
            setTimeout(() => {
                buttonElement.disabled = false;
            }, 50);
        }
        
        // Clear processing flag after a delay
        setTimeout(() => {
            clickHandlers.processing.delete(buttonKey);
        }, clickHandlers.debounceDelay);
    };
    
    window.inscribeUpgrade = (upgId, buttonElement = null) => {
        if (!gameState) {
            console.error('inscribeUpgrade: gameState not available');
            return;
        }
        
        // Create unique key for this action
        const buttonKey = `inscribe-${upgId}`;
        
        // Debounce: Prevent rapid clicks
        const now = Date.now();
        const lastClick = clickHandlers.lastClickTime.get(buttonKey) || 0;
        if (now - lastClick < clickHandlers.debounceDelay) {
            console.log('Inscribe click debounced - too soon after last click');
            return;
        }
        
        // Check if already processing
        if (clickHandlers.processing.has(buttonKey)) {
            console.log('Already processing inscription, ignoring click');
            return;
        }
        
        // Mark as processing
        clickHandlers.processing.add(buttonKey);
        clickHandlers.lastClickTime.set(buttonKey, now);
        
        // Disable button during processing
        if (buttonElement) {
            buttonElement.disabled = true;
        }
        
        console.log('inscribeUpgrade called:', { upgId, buttonElement });
        
        const upgrade = UPGRADES.find(u => u.id === upgId);
        if (!upgrade) {
            console.error('inscribeUpgrade: Upgrade not found:', upgId);
            if (typeof showNotification === 'function') {
                showNotification('Error: Upgrade not found', 'error');
            }
            // Re-enable button on error
            if (buttonElement) {
                setTimeout(() => {
                    buttonElement.disabled = false;
                }, 50);
            }
            clickHandlers.processing.delete(buttonKey);
            return;
        }
        
        const success = gameState.inscribeUpgrade(upgId);
        
        if (success) {
            const displayName = upgrade.displayName || upgId;
            console.log('Inscription successful:', { upgId, displayName });
            
            if (typeof showNotification === 'function') {
                showNotification(`<span class="css-icon-sparkle"></span> Inscribed ${displayName}!`, 'success');
            }
            
            // Play purchase sound (not throttled - purchases are rare)
            if (window.audioSystem && window.audioSystem.playSound) {
                window.audioSystem.playSound('purchase');
            }
            
            // Announce to screen reader
            if (window.Accessibility && typeof window.Accessibility.announceGameEvent === 'function') {
                window.Accessibility.announceGameEvent('upgrade_purchased', {
                    name: displayName
                });
            }
            
            // Pulse effect
            if (buttonElement && typeof pulseElement === 'function') {
                pulseElement(buttonElement, 1.2, 300);
                highlightElement(buttonElement, '#FFDB6E', 400);
            }
        } else {
            console.warn('Inscription failed:', { upgId, upgrade });
            const displayName = upgrade.displayName || upgId;
            
            // Check why it failed
            const owned = gameState.upgradesOwned[upgId] || false;
            const canAfford = gameState.canAfford ? gameState.canAfford(upgrade.recipe) : false;
            let unlockRequirement = upgrade.unlockAtAb;
            if (gameState.elementSpecialization === 'air' && gameState.specializationBonuses.unlockSpeedMult) {
                unlockRequirement *= gameState.specializationBonuses.unlockSpeedMult;
            }
            const unlocked = gameState.ab >= unlockRequirement;
            
            console.warn('Inscription failure reasons:', { owned, canAfford, unlocked, ab: gameState.ab, unlockAtAb: upgrade.unlockAtAb });
            
            if (!unlocked) {
                if (typeof showNotification === 'function') {
                    showNotification(`Requires ${formatShort(upgrade.unlockAtAb)} SE to unlock`, 'error');
                }
            } else if (owned) {
                if (typeof showNotification === 'function') {
                    showNotification(`${displayName} is already owned`, 'error');
                }
            } else if (!canAfford) {
                if (typeof showNotification === 'function') {
                    showNotification(`Cannot afford ${displayName}`, 'error');
                }
            } else {
                if (typeof showNotification === 'function') {
                    showNotification(`Failed to inscribe ${displayName}`, 'error');
                }
            }
        }
        
        // Re-enable button and clear processing flag
        if (buttonElement) {
            setTimeout(() => {
                buttonElement.disabled = false;
            }, 50);
        }
        
        // Clear processing flag after a delay
        setTimeout(() => {
            clickHandlers.processing.delete(buttonKey);
        }, clickHandlers.debounceDelay);
        
        if (typeof updateInscriptionsTab === 'function') {
            updateInscriptionsTab();
        }
    };
    
    window.craftRecipe = (recipeId) => {
        if (!gameState) {
            console.error('GameState not initialized');
            return false;
        }
        
        console.log('craftRecipe called:', { recipeId });
        
        const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
        if (!recipe) {
            console.error('Recipe not found:', recipeId);
            if (typeof showNotification === 'function') {
                showNotification('Recipe not found!', 'error');
            }
            return false;
        }
        
        // Check if recipe is discovered
        if (!gameState.discoveredRecipes.includes(recipeId)) {
            console.error('Recipe not discovered yet:', recipeId);
            if (typeof showNotification === 'function') {
                showNotification('Recipe not discovered yet! Try experimenting first.', 'error');
            }
            return false;
        }
        
        // Check if can afford
        if (!gameState.canAfford(recipe.inputs)) {
            console.log('Cannot afford recipe:', recipeId, 'Required:', recipe.inputs, 'Have:', gameState.inventory);
            if (typeof showNotification === 'function') {
                showNotification('Not enough ingredients!', 'error');
            }
            return false;
        }
        
        const success = gameState.craftDiscoveredRecipe(recipeId);
        
        if (success) {
            console.log('Recipe crafted successfully:', recipeId);
            
            // Track potion crafting for daily tasks
            if (typeof updateDailyProgress === 'function' && gameState) {
                updateDailyProgress('craft_potion', '', gameState.totalPotionsCrafted);
            }
            
            if (typeof showNotification === 'function') {
                showNotification(`<span class="css-icon-sparkle"></span> ${recipe.name} crafted!`, 'success');
            }
            
            // Play purchase sound (not throttled - purchases are rare)
            if (window.audioSystem && window.audioSystem.playSound) {
                window.audioSystem.playSound('purchase');
            }
            
            if (typeof updateExperimentTab === 'function') updateExperimentTab();
            if (typeof updateInventoryTab === 'function') updateInventoryTab();
            
            // Check for newly unlocked achievements
            if (achievements && typeof achievements.checkAchievements === 'function') {
                const newAchievements = achievements.checkAchievements();
                for (const achievement of newAchievements) {
                    // Only show notification if not already shown
                    if (!shownAchievementNotifications.has(achievement.name)) {
                        // Play achievement sound
                        if (window.audioSystem && window.audioSystem.playSound) {
                            window.audioSystem.playSound('achievement');
                        }
                        
                        if (typeof showNotification === 'function') {
                            showNotification(`Achievement: ${achievement.name}!`, 'success');
                        }
                    }
                    
                    // Announce to screen reader
                    if (window.Accessibility && typeof window.Accessibility.announceGameEvent === 'function') {
                        window.Accessibility.announceGameEvent('achievement_unlocked', {
                            name: achievement.name
                        });
                    }
                }
            }
            
            return true;
        } else {
            console.error('Failed to craft recipe:', recipeId);
            if (typeof showNotification === 'function') {
                showNotification('Failed to craft recipe!', 'error');
            }
            return false;
        }
    };
    
    window.claimTask = (taskId) => {
        if (!dailyRituals) return;
        if (dailyRituals.claimTask(taskId)) {
            // Play daily complete sound
            if (window.audioSystem && window.audioSystem.playSound) {
                window.audioSystem.playSound('daily_complete');
            }
            if (typeof updateDailiesTab === 'function') {
                updateDailiesTab();
            }
        }
    };
    
    window.purchaseBoon = (bonusId) => {
        if (!gameState) return;
        if (gameState.purchasePrestigeBonus(bonusId)) {
            // Play purchase sound (not throttled - purchases are rare)
            if (window.audioSystem && window.audioSystem.playSound) {
                window.audioSystem.playSound('purchase');
            }
            if (typeof updateBoonsTab === 'function') {
                updateBoonsTab();
            }
        }
    };
    
    // Coven system archived for future development - see ARCHIVED_COVEN_FEATURES.md
    
    console.log('Global functions defined and attached to window');
    
    // Performance monitoring utility
    window.checkMemoryUsage = () => {
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            const total = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
            const limit = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2);
            const percentage = ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1);
            
            console.log('📊 Memory Usage:');
            console.log(`  Used: ${used} MB`);
            console.log(`  Total: ${total} MB`);
            console.log(`  Limit: ${limit} MB`);
            console.log(`  Usage: ${percentage}%`);
            
            // Check device memory if available
            if (navigator.deviceMemory) {
                console.log(`  Device Memory: ${navigator.deviceMemory} GB`);
            }
            
            return {
                used: parseFloat(used),
                total: parseFloat(total),
                limit: parseFloat(limit),
                percentage: parseFloat(percentage)
            };
        } else {
            console.log('⚠️ Memory API not available in this browser');
            return null;
        }
    };
    
    // Performance info utility
    window.getPerformanceInfo = () => {
        const info = {
            memory: window.checkMemoryUsage(),
            fps: fps || 60,
            frameTime: (1000 / (fps || 60)).toFixed(2) + 'ms',
            activeAnimations: {
                sparkles: document.getElementById('sparkle-canvas') ? 'Active' : 'Inactive',
                particles: document.getElementById('particle-canvas')?.style.display !== 'none' ? 'Active' : 'Inactive'
            }
        };
        
        console.log('📈 Performance Info:');
        console.table(info);
        return info;
    };
}

/**
 * Initialize background sparkles for night sky effect
 * Optimized for performance with visibility detection and cleanup
 */
function initBackgroundSparkles() {
    // Prevent double initialization
    const sparkleCanvas = document.getElementById('sparkle-canvas');
    if (sparkleCanvas && sparkleCanvas.dataset.initialized === 'true') {
        return; // Already initialized
    }
    try {
        const canvas = document.getElementById('sparkle-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
    // Performance optimization: reduce sparkle count on mobile/low-end devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const sparkleCount = isMobile ? 15 : 25; // Reduced from 30
    
    // Set canvas size with debounced resize
    let resizeTimeout = null;
    const resizeCanvas = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Reinitialize sparkles if they go off-screen
            sparkles.forEach(sparkle => {
                if (sparkle.x > canvas.width) sparkle.x = canvas.width * Math.random();
                if (sparkle.y > canvas.height) sparkle.y = canvas.height * Math.random();
            });
        }, 250); // Debounce resize
    };
    resizeCanvas();
    const resizeHandler = resizeCanvas;
    window.addEventListener('resize', resizeHandler);
    
    // Store cleanup function
    window._backgroundSparklesCleanup = () => {
        window.removeEventListener('resize', resizeHandler);
        if (resizeTimeout) clearTimeout(resizeTimeout);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    };
    
    // Sparkle particles
    const sparkles = [];
    
    // Create sparkles
    for (let i = 0; i < sparkleCount; i++) {
        sparkles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            angle: Math.random() * Math.PI * 2,
            twinkle: Math.random() * Math.PI * 2,
            color: [
                { r: 255, g: 255, b: 255 }, // White
                { r: 255, g: 45, b: 170 },  // Pink
                { r: 34, g: 227, b: 255 },  // Cyan
                { r: 255, g: 219, b: 110 }, // Yellow
                { r: 60, g: 227, b: 197 }   // Teal
            ][Math.floor(Math.random() * 5)],
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    // Animation state
    let lastTime = performance.now();
    let animationFrameId = null;
    let isPaused = false;
    let frameSkip = 0; // Skip frames for performance
    const targetFPS = 30; // Target 30 FPS for background animation (less than 60)
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = 0;
    
    // Visibility detection - pause when tab is not visible
    const handleVisibilityChange = () => {
        isPaused = document.hidden;
        if (!isPaused && !animationFrameId) {
            lastTime = performance.now();
            animate();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Store visibility cleanup
    const originalCleanup = window._backgroundSparklesCleanup;
    window._backgroundSparklesCleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (originalCleanup) originalCleanup();
    };
    
    // Optimized animation loop with frame skipping
    function animate(currentTime) {
        if (isPaused) {
            animationFrameId = null;
            return;
        }
        
        const elapsed = currentTime - lastFrameTime;
        
        // Skip frames to maintain target FPS
        if (elapsed < frameInterval) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }
        
        lastFrameTime = currentTime - (elapsed % frameInterval);
        // Ensure deltaTime is valid and capped (handle first frame and large jumps)
        let deltaTime = currentTime - lastTime;
        if (isNaN(deltaTime) || deltaTime <= 0 || deltaTime > 100) {
            deltaTime = 16; // Default to ~60fps frame time (16ms)
        }
        lastTime = currentTime;
        
        // Clear canvas with fade effect (optimized - use globalAlpha instead of rgba)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(10, 10, 15, 0.15)'; // Slightly more opaque for better fade
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Optimize: batch draw operations
        ctx.globalCompositeOperation = 'lighter'; // Additive blending for sparkles
        
        // Update and draw sparkles
        sparkles.forEach(sparkle => {
            // Update position
            sparkle.x += Math.cos(sparkle.angle) * sparkle.speed;
            sparkle.y += Math.sin(sparkle.angle) * sparkle.speed;
            
            // Wrap around edges
            if (sparkle.x < 0) sparkle.x = canvas.width;
            if (sparkle.x > canvas.width) sparkle.x = 0;
            if (sparkle.y < 0) sparkle.y = canvas.height;
            if (sparkle.y > canvas.height) sparkle.y = 0;
            
            // Update twinkle (ensure it stays in valid range)
            if (isNaN(sparkle.twinkle)) sparkle.twinkle = 0;
            sparkle.twinkle += deltaTime * 0.002;
            // Keep twinkle in reasonable range to prevent overflow
            if (sparkle.twinkle > Math.PI * 4) sparkle.twinkle -= Math.PI * 4;
            
            // Ensure sparkle.opacity is valid
            if (isNaN(sparkle.opacity) || !sparkle.opacity) {
                sparkle.opacity = 0.5; // Default opacity
            }
            
            // Calculate opacity with validation
            const twinkleOpacity = Math.sin(sparkle.twinkle) * 0.3 + 0.7;
            let currentOpacity = sparkle.opacity * twinkleOpacity;
            
            // Clamp opacity to valid range [0, 1] and ensure it's a number
            if (isNaN(currentOpacity) || !isFinite(currentOpacity)) {
                currentOpacity = 0.5; // Default fallback
            }
            currentOpacity = Math.max(0, Math.min(1, currentOpacity));
            
            // Optimized drawing: use simple circles instead of gradients for better performance
            // Only use gradient for larger sparkles
            if (sparkle.size > 1.2) {
                // Use gradient for larger sparkles
                const gradient = ctx.createRadialGradient(
                    sparkle.x, sparkle.y, 0,
                    sparkle.x, sparkle.y, sparkle.size * 3
                );
                gradient.addColorStop(0, `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${currentOpacity})`);
                gradient.addColorStop(0.5, `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${currentOpacity * 0.5})`);
                gradient.addColorStop(1, `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, 0)`);
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(sparkle.x, sparkle.y, sparkle.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw bright center (always)
            ctx.fillStyle = `rgba(${sparkle.color.r}, ${sparkle.color.g}, ${sparkle.color.b}, ${currentOpacity})`;
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalCompositeOperation = 'source-over';
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation
    if (!document.hidden) {
        lastTime = performance.now();
        animate();
    }
    
    // Mark as initialized
    if (sparkleCanvas) {
        sparkleCanvas.dataset.initialized = 'true';
    }
    
    } catch (error) {
        console.error('Error initializing background sparkles:', error);
        // Don't break game initialization if sparkles fail
        if (typeof window._backgroundSparklesCleanup === 'function') {
            delete window._backgroundSparklesCleanup;
        }
    }
}

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
    defineGlobalFunctions();
    
    // Get UI elements after DOM is loaded
    abDisplay = document.getElementById('ab-display');
    abpsDisplay = document.getElementById('abps-display');
    castButton = document.getElementById('cast-button');
    
    // Auto-cast state (needs to be in function scope for closure)
    let autoCastEnabled = false;
    let autoCastInterval = null;
    
    // Make autoCastEnabled accessible globally for combo display
    window.getAutoCastEnabled = () => autoCastEnabled;
    
    // Function to get current auto-cast interval based on events
    const getAutoCastInterval = () => {
        // Check if Inspiration event is active (double cast rewards)
        if (eventSystem && eventSystem.hasEventEffect('double_casts')) {
            // Faster casting during Inspiration events (250ms instead of 500ms)
            return 250;
        }
        // Default interval
        return 500;
    };
    
    // Function to update auto-cast interval based on events
    const updateAutoCastInterval = () => {
        if (autoCastEnabled && autoCastInterval) {
            // Clear existing interval
            clearInterval(autoCastInterval);
            if (memoryLeakPreventionManager) {
                memoryLeakPreventionManager.clearTrackedInterval(autoCastInterval);
            }
            
            // Create new interval with updated speed
            const interval = getAutoCastInterval();
            autoCastInterval = setInterval(() => {
                if (gameState && castButton) {
                    const handler = castButton.onclick;
                    if (handler) handler();
                }
            }, interval);
            
            // Track new interval
            if (memoryLeakPreventionManager) {
                memoryLeakPreventionManager.trackInterval(autoCastInterval);
            }
            
            // Show notification if speed changed due to event
            if (eventSystem && eventSystem.hasEventEffect('double_casts')) {
                if (window.showNotification) {
                    window.showNotification('⚡ Auto-cast speed boosted by Inspiration event!', 'info');
                }
            }
        }
    };
    
    // Make updateAutoCastInterval accessible globally for event system
    window.updateAutoCastInterval = updateAutoCastInterval;
    
    // Function to update visual feedback for auto-cast
    const updateAutoCastVisualFeedback = () => {
        if (autoCastEnabled) {
            // Add visual feedback to cast button
            if (castButton) {
                castButton.classList.add('auto-cast-active');
            }
            
            // Highlight combo display when auto-cast is maintaining combo
            const comboDisplay = document.getElementById('combo-display');
            if (comboDisplay && comboSystem && comboSystem.getComboCount() > 0) {
                comboDisplay.classList.add('auto-combo-active');
            }
        } else {
            // Remove visual feedback
            if (castButton) {
                castButton.classList.remove('auto-cast-active');
            }
            
            const comboDisplay = document.getElementById('combo-display');
            if (comboDisplay) {
                comboDisplay.classList.remove('auto-combo-active');
            }
        }
    };
    
    // Make updateAutoCastVisualFeedback accessible globally
    window.updateAutoCastVisualFeedback = updateAutoCastVisualFeedback;
    
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
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Help menu opened', 'polite');
            }
        });
    }

    if (closeHelpButton && helpModal) {
        closeHelpButton.addEventListener('click', () => {
            helpModal.style.display = 'none';
            helpModal.classList.remove('active');
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Help menu closed', 'polite');
            }
        });
    }

    if (helpModalClose && helpModal) {
        helpModalClose.addEventListener('click', () => {
            helpModal.style.display = 'none';
            helpModal.classList.remove('active');
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Help menu closed', 'polite');
            }
        });
    }

    // Close help modal when clicking outside
    if (helpModal) {
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
                helpModal.classList.remove('active');
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Help menu closed', 'polite');
                }
            }
        });
    }

    // Initialize game state
    gameState = new GameState();
    gameState.start(); // Start the game tick loop
    dailyRituals = new DailyRituals(gameState);
    achievements = new AchievementSystem(gameState);
    comboSystem = new ComboSystem();
    eventSystem = new EventSystem(gameState);
    
    // Show story introduction on first launch
    showStoryIntroduction();
    
    // Initialize tutorial system
    tutorialSystem = new TutorialSystem(gameState);
    window.tutorialSystem = tutorialSystem;
    
    // Initialize quest system (already initialized as singleton, but ensure it's accessible)
    if (questSystem) {
        window.questSystem = questSystem;
        // Don't call init() again - it's already called in the constructor
    }
    
    // Initialize balance testing framework
    balanceTestingFramework = new BalanceTestingFramework(gameState);
    window.balanceTestingFramework = balanceTestingFramework;
    
    // Initialize progression analysis
    progressionAnalysis = new ProgressionAnalysis(gameState);
    window.progressionAnalysis = progressionAnalysis;
    
    // Initialize economy balancing
    economyBalancing = new EconomyBalancing(gameState);
    window.economyBalancing = economyBalancing;
    
    // Initialize feedback loop manager
    feedbackLoopManager = new FeedbackLoopManager(gameState);
    window.feedbackLoopManager = feedbackLoopManager;
    
    // Initialize design tier system (Feature 2: Progressive Design Revelation)
    designTierSystem = new DesignTierSystem(gameState);
    designTierSystem.applyTier(designTierSystem.getCurrentTier()).catch(err => console.error('Error applying initial tier:', err));
    window.designTierSystem = designTierSystem; // Make globally accessible
    
    // Initialize fading theme system
    fadingThemeSystem = new FadingThemeSystem(gameState, designTierSystem);
    window.fadingThemeSystem = fadingThemeSystem; // Make globally accessible
    
    // Update fading theme when tier changes
    const originalApplyTier = designTierSystem.applyTier.bind(designTierSystem);
    designTierSystem.applyTier = async function(tier) {
        await originalApplyTier(tier);
        if (fadingThemeSystem) {
            fadingThemeSystem.updateForTier(tier);
        }
    };
    
    // Also update when tier is set manually
    const originalSetTier = designTierSystem.setTier.bind(designTierSystem);
    designTierSystem.setTier = async function(tier) {
        await originalSetTier(tier);
        if (fadingThemeSystem) {
            fadingThemeSystem.updateForTier(tier);
        }
    };
    window.achievements = achievements; // Make achievements accessible for design tier system
    // Particle effects removed for memory optimization
    window.audioSystem = audioSystem; // Make audio system accessible globally
    
    // Unlock audio on first user interaction (required by browsers)
    let audioUnlocked = false;
    const unlockAudio = async () => {
        if (audioUnlocked) return;
        audioUnlocked = true;
        if (window.audioSystem && window.audioSystem.audioContext) {
            if (window.audioSystem.audioContext.state === 'suspended') {
                try {
                    await window.audioSystem.audioContext.resume();
                    console.log('Audio context unlocked on user interaction');
                    
                    // If we're at Tier 2+, ensure sound effects are enabled
                    const currentTier = designTierSystem ? designTierSystem.getCurrentTier() : 0;
                    if (currentTier >= 2 && window.audioSystem.enableSoundEffects) {
                        await window.audioSystem.enableSoundEffects();
                        console.log('Sound effects enabled after user interaction for Tier', currentTier);
                    }
                    
                    // If on Tier 4, ensure music is enabled and start it
                    if (currentTier >= 4) {
                        console.log('Tier 4 detected - ensuring music is enabled and starting...');
                        if (!window.audioSystem.musicEnabled) {
                            await window.audioSystem.enableMusic();
                        }
                        // Always try to start music after user interaction (browser autoplay policy)
                        if (window.audioSystem.musicEnabled) {
                            await window.audioSystem.startMusic();
                        }
                    }
                } catch (error) {
                    console.error('Failed to unlock audio:', error);
                }
            } else {
                // Audio context already running, but check if we need to enable sounds
                const currentTier = designTierSystem ? designTierSystem.getCurrentTier() : 0;
                
                // If Tier 2+ and sound effects not enabled, enable them
                if (currentTier >= 2 && window.audioSystem.enableSoundEffects && !window.audioSystem.soundEffectsEnabled) {
                    await window.audioSystem.enableSoundEffects();
                    console.log('Sound effects enabled (audio context already running) for Tier', currentTier);
                }
                
                // If Tier 4 and music not playing, start it
                if (currentTier >= 4 && window.audioSystem.musicEnabled) {
                    if (window.audioSystem.musicNodes.length === 0) {
                        console.log('Tier 4 detected - audio context running but music not playing, starting music...');
                        await window.audioSystem.startMusic();
                    }
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
    
    // Make initBackgroundSparkles globally accessible for tier unlocks
    window.initBackgroundSparkles = initBackgroundSparkles;
    
    // Initialize background sparkles only for Tier 3+ (animations enabled)
    if (designTierSystem.getCurrentTier() >= 3) {
        initBackgroundSparkles();
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
        gameState.addAb = function(amount) {
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
    if (gameState.prestigeCount >= 1) {
        meditationState = new MeditationState(gameState);
        meditationState.loadState();
        meditationState.startTickLoop();
        meditationUI = new MeditationUI(meditationState, gameState);
        meditationTowers = new MeditationTowers(meditationState, gameState);
        meditationUI.init();
        meditationTowers.init();
        window.meditationTowers = meditationTowers; // Make globally accessible for tower placement
        window.meditationUI = meditationUI; // Make globally accessible for UI updates
        window.meditationState = meditationState; // Make globally accessible for production bonus
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
                if (window.audioSystem && window.audioSystem.playSound) {
                    window.audioSystem.playSound('click', { volume: 0.2 });
                }
                const tabName = button.dataset.tab;
                switchTab(tabName);
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
                updateSettingsTab(); // Refresh display
                if (window.showNotification) {
                    window.showNotification(`Design tier set to ${selectedTier}`, 'info');
                }
            } else {
                // Reset to current tier if trying to select locked tier
                e.target.value = designTierSystem.getCurrentTier().toString();
                if (window.showNotification) {
                    window.showNotification('This tier has not been unlocked yet!', 'error');
                }
            }
        });
    }
    
    // Read Full Story button
    const readFullStoryButton = document.getElementById('read-full-story-button');
    if (readFullStoryButton) {
        readFullStoryButton.addEventListener('click', () => {
            showFullStoryModal();
        });
    }
    
    // Reset all progress button - use event delegation for reliability
    // Attach to document to ensure it works even if button is added later
    if (!window.resetButtonListenerAttached) {
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
        window.resetButtonListenerAttached = true;
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
    window.resetAllProgress = resetAllProgress;
    
    // Settings counter in sidebar (replaces old settings button)
    const settingsCounter = document.getElementById('settings-counter');
    if (settingsCounter) {
        settingsCounter.addEventListener('click', () => {
            switchTab('settings');
            // Announce to screen readers
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Settings tab opened', 'polite');
            }
        });
        // Also handle Enter key for accessibility
        settingsCounter.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchTab('settings');
            }
        });
    }
    
    // Legacy settings button (if it still exists, keep it working)
    const settingsQuickButton = document.getElementById('settings-quick-button');
    if (settingsQuickButton) {
        settingsQuickButton.addEventListener('click', () => {
            switchTab('settings');
            // Announce to screen readers
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Settings tab opened', 'polite');
            }
        });
    }
    
    // Keyboard shortcut for settings (Ctrl+,)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            switchTab('settings');
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Settings tab opened', 'polite');
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
            
            // Check if meditation is unlocked
            if (!gameState || gameState.prestigeCount < 1) {
                if (window.showNotification) {
                    window.showNotification('Meditation unlocks after your first ascension!', 'error');
                }
                return;
            }
            
            // Ensure meditation systems are initialized
            if (!meditationState) {
                console.log('Initializing meditation systems from button click...');
                meditationState = new MeditationState(gameState);
                meditationState.loadState();
                meditationState.startTickLoop();
                meditationUI = new MeditationUI(meditationState, gameState);
                meditationTowers = new MeditationTowers(meditationState, gameState);
                meditationUI.init();
                meditationTowers.init();
                window.meditationTowers = meditationTowers;
                window.meditationUI = meditationUI;
            }
            
            // Start meditation session
            if (meditationState && !meditationState.activeSession) {
                meditationState.startSession();
                if (meditationUI) {
                    meditationUI.updateControls();
                }
                if (window.showNotification) {
                    window.showNotification('Meditation session started!', 'success');
                }
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
            
            // End meditation session
            if (meditationState && meditationState.activeSession) {
                meditationState.endSession();
                if (meditationUI) {
                    meditationUI.updateControls();
                }
                if (window.showNotification) {
                    window.showNotification('Meditation session ended!', 'info');
                }
            }
        });
    }
    
    // Cast button - optimized for responsiveness
    if (castButton) {
        let isProcessing = false;
        
        const handleCast = () => {
            // Safety checks - ensure game state is initialized
            if (!gameState) {
                console.error('GameState not initialized yet');
                return;
            }
            
            // Prevent double-processing
            if (isProcessing) return;
            isProcessing = true;
            
            try {
                // Process cast immediately (synchronous)
                const oldAb = gameState.ab;
                
                // Apply combo multiplier if active
                const comboMult = comboSystem ? comboSystem.getComboMultiplier() : 1.0;
                if (comboSystem) {
                    comboSystem.recordAction();
                }
                
                // Check for event multipliers
                const eventMult = eventSystem && eventSystem.hasEventEffect('double_casts') ? 2.0 : 1.0;
                
                gameState.cast(comboMult, eventMult);
                
                // Track analytics
                if (playerAnalyticsManager && playerAnalyticsManager.enabled) {
                    playerAnalyticsManager.trackAction('cast', {
                        taps: gameState.totalTaps
                    });
                }
                
                // Update quest progress
                if (questSystem) {
                    questSystem.updateQuestProgress('first_cast', gameState.totalTaps);
                }
                
                // Play cast sound (throttled for auto mode)
                if (window.audioSystem && window.audioSystem.playSound) {
                    // Check if auto mode is on - if so, only play sound every 10 casts
                    const shouldPlaySound = !autoCastEnabled || (gameState.totalTaps % 10 === 0);
                    if (shouldPlaySound) {
                        window.audioSystem.playSound('cast', { volume: autoCastEnabled ? 0.3 : 0.4 });
                    }
                }
                
                // Check for achievements (debounced)
                if (typeof debouncedAchievementCheck === 'function') {
                    debouncedAchievementCheck();
                }
                
                if (typeof updateDailyProgress === 'function') {
                    updateDailyProgress('tap', '', gameState.totalTaps);
                }
                
                // Visual feedback (non-blocking)
                if (castButton) {
                    castButton.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        if (castButton) {
                            castButton.style.transform = 'scale(1)';
                        }
                        isProcessing = false;
                    }, 100);
                    
                    // Trigger preserve effect
                    if (window.fadingThemeSystem && typeof window.fadingThemeSystem.triggerPreserveEffect === 'function') {
                        window.fadingThemeSystem.triggerPreserveEffect();
                    }
                    
                    // Particles (deferred to not block)
                    requestAnimationFrame(() => {
                        const rect = castButton.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        
                        // Particle effects removed for memory optimization
                        // Visual feedback now uses CSS animations (see VISUAL_ALTERNATIVES.md)
                        
                        // Announce to screen reader
                        if (window.Accessibility) {
                            window.Accessibility.announceGameEvent('cast', {
                                amount: gameState.ab - oldAb
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Error in handleCast:', error);
                isProcessing = false;
            }
        };
        
        // Use both click and mousedown for better responsiveness
        castButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCast();
        }, { passive: false });
        
        castButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Also support touch for mobile
        castButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCast();
        }, { passive: false });
        
        // Store handler for auto-cast
        castButton.onclick = handleCast;
        
        // Debug: Confirm event listener attached
        console.log('Cast button initialized and event listeners attached');
    } else {
        console.error('Cast button not found in DOM');
    }
    
    // Auto-cast toggle - only visible at Tier 4+
    const autoCastToggle = document.getElementById('auto-cast-toggle');
    window.autoCastEnabled = () => autoCastEnabled; // Make accessible for sound throttling
    
    // Function to update auto button visibility based on first ascension
    const updateAutoButtonVisibility = () => {
        if (autoCastToggle && gameState) {
            const hasAscended = gameState.prestigeCount >= 1;
            if (hasAscended) {
                // Show auto button after first ascension
                autoCastToggle.style.display = 'flex';
                autoCastToggle.style.visibility = 'visible';
                autoCastToggle.style.opacity = '1';
            } else {
                // Hide auto button until first ascension
                autoCastToggle.style.display = 'none';
                autoCastToggle.style.visibility = 'hidden';
                autoCastToggle.style.opacity = '0';
                // Also disable auto-cast if it was enabled
                if (autoCastEnabled) {
                    autoCastEnabled = false;
                    if (autoCastInterval) {
                        clearInterval(autoCastInterval);
                        autoCastInterval = null;
                    }
                    // Update status display
                    const autoStatus = document.getElementById('auto-status');
                    if (autoStatus) {
                        autoStatus.textContent = 'OFF';
                    }
                    // Update button styling
                    autoCastToggle.classList.add('auto-disabled');
                    autoCastToggle.classList.remove('auto-enabled');
                }
            }
        }
    };
    
    // Make updateAutoButtonVisibility globally accessible
    window.updateAutoButtonVisibility = updateAutoButtonVisibility;
    
    // Initialize visibility based on current tier
    updateAutoButtonVisibility();
    
    if (autoCastToggle) {
        autoCastToggle.addEventListener('click', () => {
            // Double-check prestige count before allowing auto-cast
            if (gameState && gameState.prestigeCount < 1) {
                return; // Don't allow auto-cast until first ascension
            }
            
            autoCastEnabled = !autoCastEnabled;
            
            // Update sidebar button display
            const autoStatus = document.getElementById('auto-status');
            if (autoStatus) {
                autoStatus.textContent = autoCastEnabled ? 'ON' : 'OFF';
            }
            
            // Update button styling
            if (autoCastEnabled) {
                autoCastToggle.classList.add('auto-enabled');
                autoCastToggle.classList.remove('auto-disabled');
            } else {
                autoCastToggle.classList.add('auto-disabled');
                autoCastToggle.classList.remove('auto-enabled');
            }
            
            if (autoCastEnabled) {
                // Auto-cast with event-aware interval
                const interval = getAutoCastInterval();
                autoCastInterval = setInterval(() => {
                    if (gameState && castButton) {
                        const handler = castButton.onclick;
                        if (handler) handler();
                    }
                }, interval);
                
                // Track interval for cleanup
                if (memoryLeakPreventionManager) {
                    memoryLeakPreventionManager.trackInterval(autoCastInterval);
                }
                
                // Show notification about event-aware speed if Inspiration is active
                if (eventSystem && eventSystem.hasEventEffect('double_casts')) {
                    if (window.showNotification) {
                        window.showNotification('⚡ Auto-cast speed boosted by Inspiration event!', 'info');
                    }
                }
            } else {
                if (autoCastInterval) {
                    clearInterval(autoCastInterval);
                    if (memoryLeakPreventionManager) {
                        memoryLeakPreventionManager.clearTrackedInterval(autoCastInterval);
                    }
                    autoCastInterval = null;
                }
            }
            
            // Update visual feedback
            updateAutoCastVisualFeedback();
        });
    }
    
    // Listen for prestige count changes to update button visibility
    // Check periodically and on ascension events
    if (gameState) {
        // Also check periodically in case prestige count changes externally
        setInterval(() => {
            updateAutoButtonVisibility();
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
                if (window.showNotification) {
                    window.showNotification('Ascension cancelled.', 'info');
                }
                return;
            }
            
            // Show loading state
            if (window.showLoadingState) {
                window.showLoadingState('Ascending...');
            }
            
            try {
                const oldPrestigeCount = gameState.prestigeCount;
                gameState.ascend();
                if (prestigeModal) prestigeModal.classList.remove('active');
                
                // Hide loading state
                if (window.hideLoadingState) {
                    window.hideLoadingState();
                }
                
                // Play level up sound for prestige/ascension
                if (window.audioSystem && window.audioSystem.playSound) {
                    window.audioSystem.playSound('level_up');
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
                    if (!meditationState) {
                        meditationState = new MeditationState(gameState);
                        meditationState.loadState();
                        meditationState.startTickLoop();
                        meditationUI = new MeditationUI(meditationState, gameState);
                        meditationTowers = new MeditationTowers(meditationState, gameState);
                        meditationUI.init();
                        meditationTowers.init();
                        window.meditationTowers = meditationTowers;
                        window.meditationUI = meditationUI;
                    }
                    updateMeditationVisibility();
                    if (window.showNotification) {
                        window.showNotification('Meditation unlocked!', 'success');
                    }
                }
                
                // Update auto button visibility after ascension
                if (window.updateAutoButtonVisibility) {
                    window.updateAutoButtonVisibility();
                }
                
                // Update settings tab to show tier selector after first ascension
                updateSettingsTab();
                
                updateAllUI();
            } catch (error) {
                // Hide loading state on error
                if (window.hideLoadingState) {
                    window.hideLoadingState();
                }
                console.error('Error during ascension:', error);
                handleError(error, 'ascension', true);
                if (window.showNotification) {
                    window.showNotification('An error occurred during ascension. Please try again.', 'error');
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
        if (typeof updateDailyProgress === 'function' && gameState) {
            updateDailyProgress('earn_ab', '', gameState.abTotalEarned);
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
        updateDailyProgress('craft', wsId, gameState.totalWorkstationsCrafted);
        updateDailyProgress('own', wsId, count);
        debouncedUIUpdate('workstationsTab', updateWorkstationsTab);
    };
    
    gameState.onUpgradePurchased = () => {
        debouncedUIUpdate('inscriptionsTab', updateInscriptionsTab);
    };
    
    gameState.onPrestigeCompleted = (ekGained) => {
        // Show element specialization choice UI
        showElementSpecializationChoice();
        
        // Check if meditation should be unlocked after this ascension
        if (gameState.prestigeCount >= 1 && !meditationState) {
            // Initialize meditation after first ascension
            meditationState = new MeditationState(gameState);
            meditationState.loadState();
            meditationState.startTickLoop();
            meditationUI = new MeditationUI(meditationState, gameState);
            meditationTowers = new MeditationTowers(meditationState, gameState);
            meditationUI.init();
            meditationTowers.init();
            window.meditationTowers = meditationTowers;
            window.meditationUI = meditationUI;
            updateMeditationVisibility();
            if (window.showNotification) {
                window.showNotification('Meditation unlocked!', 'success');
            }
        } else if (gameState.prestigeCount >= 1) {
            // Just update visibility if already initialized
            updateMeditationVisibility();
        }
        // Update auto button visibility after prestige
        if (window.updateAutoButtonVisibility) {
            window.updateAutoButtonVisibility();
        }
        debouncedUIUpdate('allUI', updateAllUI);
    };
    
    gameState.onRecipeDiscovered = (recipeId) => {
        // Track recipe discovery for daily tasks
        if (typeof updateDailyProgress === 'function') {
            updateDailyProgress('discover_recipe', '', gameState.discoveredRecipes.length);
        }
        debouncedUIUpdate('experimentTab', updateExperimentTab);
    };
    
    gameState.onWelcomeBack = (elapsed, abGained) => {
        showWelcomeBack(elapsed, abGained);
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
                    switch(tabId) {
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
    console.log('Updating all UI...');
    updateAllUI();
    console.log('UI update complete');
    
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
                if (window.Accessibility) {
                    window.Accessibility.announceGameEvent('achievement_unlocked', {
                        name: achievement.name
                    });
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
        if (window.updateAutoCastVisualFeedback) {
            window.updateAutoCastVisualFeedback();
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
    gameState.tick = function() {
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
    
    // Make showNotification globally available for event system
    window.showNotification = showNotification;
    
    // Make game state available for mobile and accessibility features
    window.gameState = gameState;
    window.castButton = castButton;
    
    // Make data available globally for virtual scroll
    window.UPGRADES = UPGRADES;
    window.INGREDIENTS = INGREDIENTS;
    
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
    
    // Set up unified button handler for all data-action buttons
    // This ensures all buttons work reliably - fires immediately on first click
    // Use capture phase to ensure we catch clicks before they bubble
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;
        
        const action = button.dataset.action;
        if (!action) return;
        
        // Check if event was already handled by a direct handler
        // Skip if the event was explicitly prevented (direct handler already processed it)
        if (e.defaultPrevented) {
            return;
        }
        
        // Check if button is already being processed (debounce check)
        const wsId = button.dataset.wsId || button.dataset['ws-id'];
        const amount = button.dataset.amount;
        let buttonKey = '';
        if (action === 'craft' && wsId) {
            buttonKey = `${wsId}-${amount || '1'}-craft`;
        } else if (action === 'craft-max' && wsId) {
            buttonKey = `max-${wsId}`;
        }
        
        if (buttonKey && clickHandlers.processing.has(buttonKey)) {
            // Already processing this action, ignore click
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Get button data attributes
        const recipeId = button.dataset.recipeId || button.dataset['recipe-id'];
        const taskId = button.dataset.taskId || button.dataset['task-id'];
        const boonId = button.dataset.boonId || button.dataset['boon-id'];
        const upgradeId = button.dataset.upgradeId || button.dataset['upgrade-id'];
        
        // Handle different action types - fire immediately
        let handled = false;
        if (action === 'craft' && wsId && typeof window.craftWorkstation === 'function') {
            const craftAmount = parseInt(amount, 10) || 1;
            window.craftWorkstation(wsId, craftAmount, button);
            handled = true;
        } else if (action === 'craft-max' && wsId && typeof window.craftWorkstationMax === 'function') {
            window.craftWorkstationMax(wsId, button);
            handled = true;
        } else if (action === 'craft-recipe' && recipeId && typeof window.craftRecipe === 'function') {
            window.craftRecipe(recipeId);
            handled = true;
        } else if (action === 'claim-task' && taskId && typeof window.claimTask === 'function') {
            window.claimTask(taskId);
            handled = true;
        } else if (action === 'purchase-boon' && boonId && typeof window.purchaseBoon === 'function') {
            window.purchaseBoon(boonId);
            handled = true;
        } else if (action === 'inscribe' && upgradeId && typeof window.inscribeUpgrade === 'function') {
            window.inscribeUpgrade(upgradeId, button);
            handled = true;
        }
        
        if (handled) {
            // Prevent default and stop propagation to avoid double-handling
            e.preventDefault();
            e.stopPropagation();
            console.log('Unified handler executed for:', action);
            return; // Exit early to prevent fallback handlers
        }
        
        // Check if button has onclick attribute (fallback for legacy buttons)
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr) {
            // Try to execute the onclick handler manually as fallback
            // First try native onclick, then fallback to manual execution
            const nativeHandler = button.onclick;
            if (nativeHandler && typeof nativeHandler === 'function') {
                // Native handler exists, let it handle it
                return;
            }
            
            // No native handler, manually execute
            try {
                // Extract function name and arguments from onclick
                // Handle patterns like: craftWorkstation('ws_id', 1, this)
                const match = onclickAttr.match(/(\w+)\((.*?)\)/);
                if (match) {
                    const funcName = match[1];
                    const argsStr = match[2].trim();
                    
                    // Check if function exists on window
                    if (typeof window[funcName] === 'function') {
                        // Parse arguments properly
                        const args = [];
                        let currentArg = '';
                        let inQuotes = false;
                        let quoteChar = '';
                        
                        for (let i = 0; i < argsStr.length; i++) {
                            const char = argsStr[i];
                            
                            if ((char === '"' || char === "'") && !inQuotes) {
                                inQuotes = true;
                                quoteChar = char;
                            } else if (char === quoteChar && inQuotes) {
                                inQuotes = false;
                                quoteChar = '';
                                args.push(currentArg);
                                currentArg = '';
                                // Skip comma and space after quoted string
                                while (i + 1 < argsStr.length && (argsStr[i + 1] === ',' || argsStr[i + 1] === ' ')) {
                                    i++;
                                }
                            } else if (char === ',' && !inQuotes) {
                                if (currentArg.trim()) {
                                    const trimmed = currentArg.trim();
                                    if (trimmed === 'this') {
                                        args.push(button);
                                    } else if (!isNaN(trimmed) && trimmed !== '') {
                                        args.push(parseFloat(trimmed));
                                    } else {
                                        args.push(trimmed);
                                    }
                                }
                                currentArg = '';
                            } else {
                                currentArg += char;
                            }
                        }
                        
                        // Handle last argument
                        if (currentArg.trim()) {
                            const trimmed = currentArg.trim();
                            if (trimmed === 'this') {
                                args.push(button);
                            } else if (!isNaN(trimmed) && trimmed !== '') {
                                args.push(parseFloat(trimmed));
                            } else {
                                args.push(trimmed);
                            }
                        }
                        
                        // Call the function
                        window[funcName](...args);
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        console.warn('Function not found on window:', funcName);
                    }
                }
            } catch (parseError) {
                console.error('Error executing onclick handler:', onclickAttr, parseError);
            }
        }
    }, true); // Use capture phase to catch events early
}

function switchTab(tabName) {
    console.log('switchTab called with:', tabName);
    
    // Check if tab is locked
    const tabButton = Array.from(tabButtons || []).find(btn => btn.dataset.tab === tabName);
    if (tabButton && tabButton.classList.contains('locked')) {
        // Show notification that tab is locked
        const unlockCondition = tabButton.getAttribute('data-unlock-condition') || 'Prestige 1';
        if (window.showNotification) {
            window.showNotification(`This tab is locked. Unlocks at: ${unlockCondition}`, 'info');
        }
        return;
    }
    
    // Update browser history if browser navigation manager is available
    if (browserNavigationManager) {
        browserNavigationManager.switchToTab(tabName);
    }
    if (!tabButtons || !tabPanes) {
        console.error('Tab buttons or panes not found!', { tabButtons: !!tabButtons, tabPanes: !!tabPanes });
        return;
    }
    
    console.log('Found', tabButtons.length, 'tab buttons and', tabPanes.length, 'tab panes');
    
    // Update buttons with ARIA states
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    
    // Check if we're switching away from meditation tab
    const wasMeditationActive = document.getElementById('meditation-tab')?.classList.contains('active');
    const isMeditationActive = tabName === 'meditation';
    
    // Cleanup meditation state when leaving meditation tab (Priority 2: Memory optimization)
    if (wasMeditationActive && !isMeditationActive && meditationState) {
        console.log('Leaving meditation tab - cleaning up meditation state');
        
        // Clear distractions array to free memory (~2-5 MB savings)
        if (meditationState.distractions && meditationState.distractions.length > 0) {
            console.log(`Clearing ${meditationState.distractions.length} distractions`);
            meditationState.distractions = [];
        }
        
        // Stop meditation tick loop if session is not active
        if (!meditationState.activeSession) {
            meditationState.stopTickLoop();
            console.log('Meditation tick loop stopped (session inactive)');
        }
        
        // Stop UI update intervals to reduce CPU usage
        if (meditationUI) {
            meditationUI.stopUpdateIntervals();
            console.log('Meditation UI update intervals stopped');
        }
        
        // Stop meditation towers animation loop to save CPU (similar to audio loops stopping)
        if (window.meditationTowers && typeof window.meditationTowers.stopAnimationLoop === 'function') {
            window.meditationTowers.stopAnimationLoop();
            console.log('Meditation towers animation loop stopped (tab hidden)');
        }
    }
    
    // Start meditation towers animation loop when entering meditation tab
    if (!wasMeditationActive && isMeditationActive) {
        if (window.meditationTowers && typeof window.meditationTowers.startAnimationLoop === 'function') {
            window.meditationTowers.startAnimationLoop();
            console.log('Meditation towers animation loop started (tab visible)');
        }
    }
    
    // Update panes with ARIA states
    tabPanes.forEach(pane => {
        const isActive = pane.id === `${tabName}-tab`;
        pane.classList.toggle('active', isActive);
        pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        pane.setAttribute('tabindex', isActive ? '0' : '-1');

        // Force visibility for active tab
        if (isActive) {
            pane.style.display = 'block';
            pane.style.visibility = 'visible';
            pane.style.opacity = '1';
            pane.style.pointerEvents = 'auto';
            pane.style.zIndex = '1';
        } else {
            pane.style.display = 'none';
            pane.style.visibility = 'hidden';
            pane.style.opacity = '0';
            pane.style.pointerEvents = 'none';
        }

        console.log(`Tab panel ${pane.id} isActive:`, isActive, 'has active class:', pane.classList.contains('active'), 'display:', pane.style.display);
    });

    // Announce tab change to screen readers
    if (window.announceToScreenReader) {
        const tabLabel = tabName.charAt(0).toUpperCase() + tabName.slice(1);
        window.announceToScreenReader(`Switched to ${tabLabel} tab`, 'polite');
    }
    
    // Music continues playing normally (no mode switching needed)
    // Meditation tab now uses the same tier 4 music as the rest of the game
    
    // Ensure all non-active tabs are properly hidden
    tabPanes.forEach(pane => {
        if (!pane.classList.contains('active')) {
            pane.style.display = 'none';
            pane.style.visibility = 'hidden';
            pane.style.opacity = '0';
            pane.style.pointerEvents = 'none';
        }
    });
    
    // Update tab content
    switch(tabName) {
        case 'workstations':
            console.log('Updating workstations tab content...');
            // Ensure meditation tab is hidden
            const meditationTab = document.getElementById('meditation-tab');
            if (meditationTab) {
                meditationTab.classList.remove('active');
                meditationTab.style.display = 'none';
                meditationTab.style.visibility = 'hidden';
                meditationTab.style.opacity = '0';
                meditationTab.style.pointerEvents = 'none';
            }
            updateWorkstationsTab();
            // Force container visibility after update
            setTimeout(() => {
                const container = document.getElementById('workstation-list');
                if (container) {
                    container.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 15px !important; max-height: 70vh !important; overflow-y: auto !important; padding: 10px !important; position: relative !important; z-index: 10 !important; pointer-events: auto !important; visibility: visible !important; opacity: 1 !important; width: 100% !important;';
                    console.log('Workstation list container forced visible, children:', container.children.length);
                }
            }, 100);
            break;
        case 'inscriptions':
            console.log('Updating inscriptions tab content...');
            updateInscriptionsTab();
            // Force container visibility after update
            setTimeout(() => {
                const container = document.getElementById('upgrade-list');
                if (container) {
                    container.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 15px !important; max-height: 70vh !important; overflow-y: auto !important; padding: 10px !important; position: relative !important; z-index: 10 !important; pointer-events: auto !important; visibility: visible !important; opacity: 1 !important; width: 100% !important;';
                    console.log('Upgrade list container forced visible, children:', container.children.length);
                }
            }, 100);
            break;
        case 'inventory':
            updateInventoryTab();
            break;
        case 'experiment':
            updateExperimentTab();
            break;
        case 'dailies':
            updateDailiesTab();
            break;
        // Coven tab archived for future development - see ARCHIVED_COVEN_FEATURES.md
        // case 'coven':
        //     console.log('Updating coven tab content...');
        //     updateCovenTab();
        //     break;
        case 'boons':
            // Check if boons is unlocked (after first ascension)
            if (gameState && gameState.prestigeCount < 1) {
                if (window.showNotification) {
                    window.showNotification('Boons unlock after your first ascension!', 'info');
                }
                // Switch to a different tab
                switchTab('workstations');
                return;
            }
            updateBoonsTab();
            break;
        case 'meditation':
            // Check if meditation is unlocked (after first ascension)
            if (gameState && gameState.prestigeCount < 1) {
                if (window.showNotification) {
                    window.showNotification('Meditation unlocks after your first ascension!', 'info');
                }
                // Switch to a different tab
                switchTab('workstations');
                return;
            }
            console.log('Updating meditation tab content...');
            
            // Ensure meditation systems are initialized
            if (gameState.prestigeCount >= 1 && !meditationState) {
                console.log('Initializing meditation systems...');
                meditationState = new MeditationState(gameState);
                meditationState.loadState();
                meditationState.startTickLoop();
                meditationUI = new MeditationUI(meditationState, gameState);
                meditationTowers = new MeditationTowers(meditationState, gameState);
                meditationUI.init();
                meditationTowers.init();
                window.meditationTowers = meditationTowers;
                window.meditationUI = meditationUI;
            }
            
            if (meditationUI) {
                meditationUI.updateAll();
                // Restart UI update intervals when entering meditation tab
                meditationUI.startUpdateIntervals();
            }
            
            // Restart meditation tick loop if it was stopped
            if (meditationState && !meditationState.tickInterval) {
                meditationState.startTickLoop();
                console.log('Meditation tick loop restarted');
            }
            
            // Music switching is handled at the top level of switchTab function
            break;
        case 'stats':
            console.log('Updating stats tab content...');
            updateStatsTab();
            // Force container visibility after update
            setTimeout(() => {
                const container = document.getElementById('stats-content');
                if (container) {
                    container.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 15px !important; max-height: 70vh !important; overflow-y: auto !important; padding: 10px !important; position: relative !important; z-index: 10 !important; pointer-events: auto !important; visibility: visible !important; opacity: 1 !important; width: 100% !important;';
                    console.log('Stats content container forced visible, children:', container.children.length);
                }
            }, 100);
            break;
        case 'settings':
            console.log('Updating settings tab content...');
            updateSettingsTab();
            // Re-attach reset button listener when settings tab is shown
            const resetBtn = document.getElementById('reset-all-progress-button');
            if (resetBtn) {
                // Remove any existing listeners by cloning
                const newResetBtn = resetBtn.cloneNode(true);
                resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
                
                // Attach fresh listener
                newResetBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Reset button clicked from settings tab');
                    resetAllProgress();
                }, true); // Use capture phase
                console.log('Reset button listener re-attached on settings tab open');
            }
            break;
        default:
            console.warn('Unknown tab:', tabName);
    }
}

/**
 * Update workstations tab with virtual scrolling for performance
 */
function updateWorkstationsTab() {
    console.log('updateWorkstationsTab called, gameState exists:', !!gameState);
    if (!gameState) {
        console.error('gameState not initialized in updateWorkstationsTab');
        return;
    }
    
    const container = document.getElementById('workstation-list');
    if (!container) {
        console.error('workstation-list container not found!');
        return;
    }
    console.log('workstation-list container found, updating content...');
    
    // Ensure container is visible
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    const containerComputed = window.getComputedStyle(container);
    console.log('Container styles:', {
        display: containerComputed.display,
        visibility: containerComputed.visibility,
        opacity: containerComputed.opacity,
        height: containerComputed.height,
        minHeight: containerComputed.minHeight
    });
    
    // Filter unlocked workstations (with Air specialization unlock speed bonus)
    let unlockedWorkstations = PRODUCERS.filter(prod => {
        let unlockRequirement = prod.unlockAtAb;
        if (gameState.elementSpecialization === 'air' && gameState.specializationBonuses.unlockSpeedMult) {
            unlockRequirement *= gameState.specializationBonuses.unlockSpeedMult;
        }
        return gameState.ab >= unlockRequirement;
    });
    
    // Focus is only gained through meditation, no workstations needed
    
    console.log('Unlocked workstations:', unlockedWorkstations.length, 'of', PRODUCERS.length, 'total');
    
    // Destroy existing virtual list if it exists
    if (virtualWorkstationList) {
        try {
            virtualWorkstationList.destroy();
        } catch (e) {
            console.error('Error destroying virtual workstation list:', e);
        }
        virtualWorkstationList = null;
    }
    
    // Create virtual list if there are many workstations
    // DISABLED: Virtual scroll causes items to disappear - using traditional rendering instead
    if (false && unlockedWorkstations.length > 10) {
        console.log('Using virtual scrolling for', unlockedWorkstations.length, 'workstations');
        try {
            virtualWorkstationList = new VirtualWorkstationList(container, unlockedWorkstations, gameState);
            // Force initial render after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (virtualWorkstationList && virtualWorkstationList._constructorComplete) {
                    console.log('Forcing virtual scroll initial render...');
                    // Force container to be visible first
                    container.style.display = 'flex';
                    container.style.flexDirection = 'column';
                    container.style.visibility = 'visible';
                    container.style.opacity = '1';
                    container.style.minHeight = '400px';
                    // Force a reflow
                    void container.offsetHeight;
                    virtualWorkstationList.updateContainerHeight();
                    virtualWorkstationList.renderVisibleItems();
                    
                    // Verify items were rendered - if not, fall back to traditional
                    setTimeout(() => {
                        const viewport = container.querySelector('.virtual-scroll-viewport');
                        const renderedItems = viewport ? viewport.children.length : 0;
                        console.log('Virtual scroll rendered items check:', renderedItems, 'expected at least:', Math.ceil(400 / 200));
                        
                        if (renderedItems === 0) {
                            console.warn('Virtual scroll rendered 0 items, falling back to traditional rendering');
                            if (virtualWorkstationList) {
                                try {
                                    virtualWorkstationList.destroy();
                                } catch (e) {
                                    console.error('Error destroying virtual scroll:', e);
                                }
                                virtualWorkstationList = null;
                            }
                            // Fall back to traditional rendering
                            container.innerHTML = '';
                            updateWorkstationsTabTraditional(container, unlockedWorkstations);
                        }
                    }, 200);
                }
            }, 100);
        } catch (e) {
            console.error('Error creating virtual workstation list:', e);
            // Fall back to traditional rendering
            container.innerHTML = '';
            console.log('Falling back to traditional rendering due to error');
            updateWorkstationsTabTraditional(container, unlockedWorkstations);
        }
    } else {
        // Use traditional rendering for small lists
        updateWorkstationsTabTraditional(container, unlockedWorkstations);
    }
}

/**
 * Get inscription bonuses for a workstation (only inscriptions, not buffs/prestige)
 * @param {string} workstationId - The workstation ID
 * @returns {Object} - Object with multiplier and list of applied inscriptions
 */
function getInscriptionBonuses(workstationId) {
    let mult = 1.0;
    const inscriptions = [];
    
    // Global upgrades
    for (const upgId in gameState.upgradesOwned) {
        const upgData = UPGRADES.find(u => u.id === upgId);
        if (upgData && upgData.affects === "global" && upgData.type === "multiplier") {
            mult *= upgData.value;
            inscriptions.push({
                name: upgData.displayName,
                type: 'global',
                multiplier: upgData.value
            });
        }
    }
    
    // Producer-specific upgrades
    const targetAffects = "producer:" + workstationId;
    for (const upgId in gameState.upgradesOwned) {
        const upgData = UPGRADES.find(u => u.id === upgId);
        if (upgData && upgData.affects === targetAffects && upgData.type === "multiplier") {
            mult *= upgData.value;
            inscriptions.push({
                name: upgData.displayName,
                type: 'workstation',
                multiplier: upgData.value
            });
        }
    }
    
    return { multiplier: mult, inscriptions };
}

/**
 * Calculate inscription bonus per second for each output
 * @param {Object} prodData - Producer data
 * @param {number} owned - Number owned
 * @param {number} inscriptionMult - Inscription multiplier
 * @returns {Object} - Object with outputId -> bonus rate per second
 */
function getInscriptionBonusRates(prodData, owned, inscriptionMult) {
    const bonuses = {};
    
    if (owned > 0 && inscriptionMult > 1.0) {
        for (const [outputId, baseRate] of Object.entries(prodData.outputs)) {
            const baseTotal = baseRate * owned;
            const actualTotal = baseTotal * inscriptionMult;
            const bonus = actualTotal - baseTotal;
            if (bonus > 0) {
                bonuses[outputId] = bonus;
            }
        }
    }
    
    return bonuses;
}

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
function getTierSymbol(tier) {
    const tierStyles = {
        0: { 
            symbol: '◉',
            color: '#FFFFFF', // White
            glow: 'rgba(255, 255, 255, 0.4)',
            gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
            borderGlow: 'rgba(255, 255, 255, 0.6)'
        },
        1: { 
            symbol: '◆', // Swapped from tier 2
            color: '#FF10F0', // Neon Pink
            glow: 'rgba(255, 16, 240, 0.4)',
            gradient: 'linear-gradient(135deg, #FF10F0 0%, #FF2DAA 100%)',
            borderGlow: 'rgba(255, 16, 240, 0.8)'
        },
        2: { 
            symbol: '◈', // Swapped from tier 1
            color: '#FFFF00', // Neon Yellow
            glow: 'rgba(255, 255, 0, 0.4)',
            gradient: 'linear-gradient(135deg, #FFFF00 0%, #FFD700 100%)',
            borderGlow: 'rgba(255, 255, 0, 0.9)'
        },
        3: { 
            symbol: '✧', // Swapped from tier 4
            color: '#39FF14', // Neon Green
            glow: 'rgba(57, 255, 20, 0.4)',
            gradient: 'linear-gradient(135deg, #39FF14 0%, #00FF00 100%)',
            borderGlow: 'rgba(57, 255, 20, 0.6)'
        },
        4: { 
            symbol: '✦', // Swapped from tier 3
            color: '#00FFFF', // Neon Cyan
            glow: 'rgba(0, 255, 255, 0.4)',
            gradient: 'linear-gradient(135deg, #00FFFF 0%, #00CED1 100%)',
            borderGlow: 'rgba(0, 255, 255, 0.7)'
        },
        5: { 
            symbol: '✪',
            color: '#FF6B00', // Neon Orange
            glow: 'rgba(255, 107, 0, 0.6)',
            gradient: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
            borderGlow: 'rgba(255, 107, 0, 0.9)'
        }
    };
    return tierStyles[tier] || tierStyles[0];
}

/**
 * Get tier-appropriate styling based on current design tier
 * @param {number} itemTier - The tier of the item (0-5)
 * @returns {Object} Styling object with color, textShadow, boxShadow, transition, etc.
 */
function getTierAppropriateStyle(itemTier) {
    const currentDesignTier = designTierSystem ? designTierSystem.getCurrentTier() : 0;
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
 * Get tier for a workstation based on its position in PRODUCERS array
 * Tier 0: indices 0-4 (5 workstations)
 * Tier 1: indices 5-9 (5 workstations)
 * Tier 2: indices 10-14 (5 workstations)
 * Tier 3: indices 15-19 (5 workstations)
 * Tier 4: indices 20-24 (5 workstations)
 */
function getWorkstationTier(prodData) {
    const index = PRODUCERS.findIndex(p => p.id === prodData.id);
    if (index === -1) return -1; // Not found
    if (index <= 4) return 0;   // Tier 0: 5 workstations (indices 0-4)
    if (index <= 9) return 1;    // Tier 1: 5 workstations (indices 5-9)
    if (index <= 14) return 2;   // Tier 2: 5 workstations (indices 10-14)
    if (index <= 19) return 3;  // Tier 3: 5 workstations (indices 15-19)
    if (index <= 24) return 4;  // Tier 4: 5 workstations (indices 20-24)
    return -1; // Invalid tier (should not happen with current structure)
}

/**
 * Get tier for an upgrade based on the highest tier ingredient in its recipe
 * @param {Object} upgData - Upgrade data
 * @returns {number} - Tier (0-5)
 */
function getUpgradeTier(upgData) {
    let maxTier = 0;
    for (const ingId in upgData.recipe) {
        const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
        if (ingredient && ingredient.tier !== undefined) {
            maxTier = Math.max(maxTier, ingredient.tier);
        }
    }
    return maxTier;
}

// Traditional rendering function (used for small lists or as fallback)
function updateWorkstationsTabTraditional(container, unlockedWorkstations) {
    // Clear only cards, preserve search/filter UI
    const searchContainer = container.parentElement?.querySelector('.search-filter-container');
    container.innerHTML = '';
    
    if (unlockedWorkstations.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
                <picture>
                    <source srcset="images/ui/empty-state.webp" type="image/webp">
                    <img src="images/ui/empty-state.png" alt="Empty State" class="empty-state-illustration" style="max-width: 400px; width: 100%; height: auto; margin-bottom: 20px; opacity: 0.8;">
                </picture>
                <p class="empty-state-message" style="color: var(--text-dim); font-size: 18px;">No workstations yet. Cast spells to unlock them!</p>
            </div>
        `;
        return;
    }
    
        
        console.log('Rendering', unlockedWorkstations.length, 'workstations using traditional rendering');
        
        // Group workstations by tier
        const workstationsByTier = {};
        for (const prodData of unlockedWorkstations) {
            const tier = getWorkstationTier(prodData);
            if (!workstationsByTier[tier]) {
                workstationsByTier[tier] = [];
            }
            workstationsByTier[tier].push(prodData);
        }
        
        // Render by tier
        const tierNames = ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Tier 5'];
        for (let tier = 0; tier <= 5; tier++) {
            if (!workstationsByTier[tier] || workstationsByTier[tier].length === 0) continue;
            
            // Add tier header with tier symbol
            const tierSymbol = getTierSymbol(tier);
            const tierStyle = getTierAppropriateStyle(tier);
            const tierHeader = document.createElement('div');
            tierHeader.className = 'tier-header';
            tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; margin-right: 8px; font-size: 20px;">${tierSymbol.symbol}</span> Tier ${tier}`;
            container.appendChild(tierHeader);
            
            // Render workstations for this tier
            for (const prodData of workstationsByTier[tier]) {
            const owned = gameState.workstations[prodData.id] || 0;
            const recipe = getScaledRecipe(prodData.recipe, owned, prodData.growth);
            
            // Check affordability for different amounts
            const canAfford1 = gameState.canAfford(recipe);
            
            // For x10, check if we can afford at least 1 craft (simplified - actual crafting will handle the limit)
            const canAfford10 = canAfford1; // Simplified - will let craft function handle actual amount
            
            // For max, check if we can afford at least 1 craft
            const canAffordMax = canAfford1;
            
            // Get inscription bonuses
            const inscriptionData = getInscriptionBonuses(prodData.id);
            const inscriptionBonusRates = getInscriptionBonusRates(prodData, owned, inscriptionData.multiplier);
            
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-ws-id', prodData.id);
            if (owned > 0) {
                card.classList.add('owned');
            } else {
                card.classList.add('unowned');
            }
            card.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
            
            // Build inscription bonus display (compact 2-column layout)
            let inscriptionBonusHTML = '';
            if (Object.keys(inscriptionBonusRates).length > 0) {
                const bonusEntries = Object.entries(inscriptionBonusRates);
                inscriptionBonusHTML = `
                    <div class="card-label" style="color: var(--success); font-size: 12px; margin-bottom: 6px;"><span class="css-icon-scroll"></span> Bonuses:</div>
                    <div class="inscription-bonuses">
                        ${bonusEntries.map(([outputId, bonusRate]) => {
                            const ingredient = INGREDIENTS.find(ing => ing.id === outputId);
                            const displayName = ingredient?.displayName || outputId;
                            return `<div class="inscription-bonus-item">
                                <span class="bonus-label">+${formatShort(bonusRate)}/s</span>
                                <span class="bonus-numbers">${displayName}</span>
                            </div>`;
                        }).join('')}
                    </div>
                    ${inscriptionData.inscriptions.length > 0 ? `
                        <div class="inscription-list">
                            ${inscriptionData.inscriptions.map(ins => `• ${ins.name} (×${ins.multiplier.toFixed(2)})`).join(' • ')}
                        </div>
                    ` : ''}
                `;
            }
            
            card.innerHTML = `
                <div class="card-title">${prodData.displayName}</div>
                <div class="card-description">${stripEmojisIfLowTier('⚙️')} Owned: ${owned}</div>
                <div class="card-content-left">
                    <div class="card-section">
                        <div class="card-label">Makes:</div>
                        ${Object.entries(prodData.outputs).map(([id, rate]) => {
                            const baseTotal = rate * owned;
                            const actualRate = owned > 0 ? baseTotal : rate;
                            const ingredient = INGREDIENTS.find(ing => ing.id === id);
                            const displayName = ingredient?.displayName || id;
                            return `<div class="card-value">${formatPrecise(actualRate, 2)}/s ${displayName}</div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="card-content-right">
                    <div class="card-section">
                        <div class="card-label">Cost:</div>
                        ${Object.entries(recipe).map(([ingId, amount]) => {
                            const have = gameState.inventory[ingId] || 0;
                            const canAfford = have >= amount;
                            const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                            const displayName = ingredient?.displayName || ingId;
                            return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                                <span class="recipe-label">${displayName}:</span>
                                <span class="recipe-numbers">${formatShort(have)} / ${formatShort(amount)}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                ${inscriptionBonusHTML ? `<div class="card-section full-width" style="border-left: 3px solid var(--success); background: rgba(60, 227, 197, 0.1);">${inscriptionBonusHTML}</div>` : ''}
                <div class="button-row">
                    <button class="btn-primary ${canAfford1 ? '' : 'btn-disabled'}" data-action="craft" data-ws-id="${prodData.id}" data-amount="1" ${canAfford1 ? '' : 'disabled'}>Craft x1</button>
                    <button class="btn-primary ${canAfford10 ? '' : 'btn-disabled'}" data-action="craft" data-ws-id="${prodData.id}" data-amount="10" ${canAfford10 ? '' : 'disabled'}>Craft x10</button>
                    <button class="btn-primary ${canAffordMax ? '' : 'btn-disabled'}" data-action="craft-max" data-ws-id="${prodData.id}" ${canAffordMax ? '' : 'disabled'}>Max</button>
                </div>
            `;
            
                // Ensure buttons are clickable - unified handler will handle clicks
                const buttons = card.querySelectorAll('button[data-action]');
                buttons.forEach(btn => {
                    // Ensure button is clickable
                    btn.style.position = 'relative';
                    btn.style.zIndex = '100';
                    btn.style.pointerEvents = 'auto';
                    btn.style.cursor = 'pointer';
                    btn.style.visibility = 'visible';
                    btn.style.display = 'inline-block';
                    // Unified handler in initUI() will handle all clicks
                });
            
            container.appendChild(card);
            console.log('Added workstation card to container, total children:', container.children.length);
            }
        }
        console.log('Finished rendering workstations, container now has', container.children.length, 'children');
    }

/**
 * Update inscriptions tab with virtual scrolling for performance
 */
function updateInscriptionsTab() {
    console.log('updateInscriptionsTab called, gameState exists:', !!gameState);
    const container = document.getElementById('upgrade-list');
    if (!container) {
        console.error('upgrade-list container not found!');
        return;
    }
    console.log('upgrade-list container found, updating content...');
    
    // Ensure container is visible
    container.style.display = 'flex';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    
    // Filter unlocked upgrades
    let unlockedUpgrades = UPGRADES.filter(upg => {
        let unlockRequirement = upg.unlockAtAb;
        if (gameState.elementSpecialization === 'air' && gameState.specializationBonuses.unlockSpeedMult) {
            unlockRequirement *= gameState.specializationBonuses.unlockSpeedMult;
        }
        return gameState.ab >= unlockRequirement;
    });
    
    // Hide focus upgrades until meditation is unlocked
    const isMeditationUnlocked = gameState.prestigeCount >= 1;
    if (!isMeditationUnlocked) {
        unlockedUpgrades = unlockedUpgrades.filter(upg => 
            !upg.id.includes('focus') && !upg.affects.includes('focus')
        );
    }
    
    // Destroy existing virtual list if it exists
    if (virtualUpgradeList) {
        try {
            virtualUpgradeList.destroy();
        } catch (e) {
            console.error('Error destroying virtual upgrade list:', e);
        }
        virtualUpgradeList = null;
    }
    
    // Create virtual list if there are many upgrades
    // DISABLED: Virtual scroll causes items to disappear - using traditional rendering instead
    if (false && unlockedUpgrades.length > 10) {
        console.log('Using virtual scrolling for', unlockedUpgrades.length, 'upgrades');
        try {
            virtualUpgradeList = new VirtualUpgradeList(container, unlockedUpgrades, gameState);
            // Force initial render after a short delay to ensure DOM is ready
            setTimeout(() => {
                if (virtualUpgradeList && virtualUpgradeList._constructorComplete) {
                    console.log('Forcing virtual scroll initial render for upgrades...');
                    // Force container to be visible first
                    container.style.display = 'flex';
                    container.style.flexDirection = 'column';
                    container.style.visibility = 'visible';
                    container.style.opacity = '1';
                    container.style.minHeight = '400px';
                    // Force a reflow
                    void container.offsetHeight;
                    virtualUpgradeList.updateContainerHeight();
                    virtualUpgradeList.renderVisibleItems();
                    
                    // Verify items were rendered - if not, fall back to traditional
                    setTimeout(() => {
                        const viewport = container.querySelector('.virtual-scroll-viewport');
                        const renderedItems = viewport ? viewport.children.length : 0;
                        console.log('Virtual scroll rendered items check:', renderedItems, 'expected at least:', Math.ceil(400 / 200));
                        
                        if (renderedItems === 0) {
                            console.warn('Virtual scroll rendered 0 items, falling back to traditional rendering');
                            if (virtualUpgradeList) {
                                try {
                                    virtualUpgradeList.destroy();
                                } catch (e) {
                                    console.error('Error destroying virtual scroll:', e);
                                }
                                virtualUpgradeList = null;
                            }
                            // Fall back to traditional rendering
                            container.innerHTML = '';
                            updateInscriptionsTabTraditional(container, unlockedUpgrades);
                        }
                    }, 200);
                }
            }, 100);
        } catch (e) {
            console.error('Error creating virtual upgrade list:', e);
            // Fall back to traditional rendering
            container.innerHTML = '';
            console.log('Falling back to traditional rendering due to error');
            updateInscriptionsTabTraditional(container, unlockedUpgrades);
        }
    } else {
        // Use traditional rendering for small lists
        updateInscriptionsTabTraditional(container, unlockedUpgrades);
    }
}

// Traditional rendering function for inscriptions (used for small lists or as fallback)
function updateInscriptionsTabTraditional(container, unlockedUpgrades) {
    container.innerHTML = '';
    
    // Group upgrades by tier
    const upgradesByTier = {};
    for (const upgData of unlockedUpgrades) {
        const tier = getUpgradeTier(upgData);
        if (!upgradesByTier[tier]) {
            upgradesByTier[tier] = [];
        }
        upgradesByTier[tier].push(upgData);
    }
    
    // Render upgrades grouped by tier
    for (let tier = 0; tier <= 5; tier++) {
        if (!upgradesByTier[tier] || upgradesByTier[tier].length === 0) {
            continue;
        }
        
        // Add tier header with tier symbol
        const tierSymbol = getTierSymbol(tier);
        const tierStyle = getTierAppropriateStyle(tier);
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; margin-right: 8px; font-size: 20px;">${tierSymbol.symbol}</span> Tier ${tier}`;
        container.appendChild(tierHeader);
        
        // Render upgrades for this tier
        for (const upgData of upgradesByTier[tier]) {
            const owned = gameState.upgradesOwned[upgData.id] || false;
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
            
            let effectText = '';
            if (upgData.affects === 'global') {
                effectText = `Global ${upgData.type} ×${upgData.value}`;
            } else if (upgData.affects.startsWith('producer:')) {
                const wsId = upgData.affects.split(':')[1];
                effectText = `${wsId} ${upgData.type} ×${upgData.value}`;
            } else if (upgData.affects === 'click') {
                effectText = `Click ${upgData.type} +${upgData.value}`;
            }
            
            // Check if can afford all materials
            let canAffordAll = true;
            if (!owned && upgData.recipe) {
                for (const [ingId, amount] of Object.entries(upgData.recipe)) {
                    const have = gameState.inventory[ingId] || 0;
                    if (have < amount) {
                        canAffordAll = false;
                        break;
                    }
                }
            }
            
            card.innerHTML = `
                <div class="card-title">${upgData.displayName} ${owned ? stripEmojisIfLowTier('✓') : ''}</div>
                <div class="card-description">${upgData.description}</div>
                <div class="card-section">
                    <div class="card-label">${effectText}</div>
                </div>
                <div class="card-section">
                    <div class="card-label">Cost:</div>
                    ${Object.entries(upgData.recipe).map(([ingId, amount]) => {
                        const have = gameState.inventory[ingId] || 0;
                        const canAfford = have >= amount;
                        const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                        const displayName = ingredient?.displayName || ingId;
                        return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                            <span class="recipe-label">${displayName}:</span>
                            <span class="recipe-numbers">${formatShort(have)} / ${formatShort(amount)}</span>
                        </div>`;
                    }).join('')}
                </div>
                <button class="btn-primary" data-action="inscribe" data-upgrade-id="${upgData.id}" ${owned || !canAffordAll ? 'disabled' : ''}>
                    ${owned ? 'Owned' : 'Inscribe'}
                </button>
            `;
            
            // Attach event listener directly - always attach handler, check conditions inside
            const button = card.querySelector('button[data-action="inscribe"]');
            if (button) {
                // Ensure button is visible and clickable
                button.style.position = 'relative';
                button.style.zIndex = '100';
                
                // Properly manage disabled state - remove disabled attribute if we can afford it
                if (owned || !canAffordAll) {
                    button.disabled = true;
                    button.style.pointerEvents = 'none';
                    button.style.cursor = 'not-allowed';
                    button.style.opacity = '0.6';
                } else {
                    button.disabled = false;
                    button.style.pointerEvents = 'auto';
                    button.style.cursor = 'pointer';
                    button.style.opacity = '1';
                }
                
                button.style.visibility = 'visible';
                button.style.display = 'inline-block';
                
                // Always attach handler - it will check if it can execute
                if (typeof window.inscribeUpgrade === 'function') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Re-check conditions dynamically at click time (don't rely on closure variables)
                        if (!gameState) {
                            console.error('gameState not available');
                            return;
                        }
                        
                        const currentOwned = gameState.upgradesOwned[upgData.id] || false;
                        if (currentOwned) {
                            console.log('Inscribe button: Already owned:', { upgId: upgData.id });
                            return;
                        }
                        
                        // Re-check if we can afford all materials
                        let currentCanAffordAll = true;
                        if (upgData.recipe) {
                            for (const [ingId, amount] of Object.entries(upgData.recipe)) {
                                const have = gameState.inventory[ingId] || 0;
                                if (have < amount) {
                                    currentCanAffordAll = false;
                                    console.log('Inscribe button: Cannot afford:', { ingId, have, needed: amount });
                                    break;
                                }
                            }
                        }
                        
                        if (!currentCanAffordAll || button.disabled) {
                            console.log('Inscribe button disabled:', { currentCanAffordAll, disabled: button.disabled, upgId: upgData.id });
                            return;
                        }
                        
                        console.log('Inscribe button clicked:', { upgId: upgData.id, button });
                        window.inscribeUpgrade(upgData.id, button);
                    });
                }
            }
            
            container.appendChild(card);
            console.log('Added upgrade card to container, total children:', container.children.length);
        }
    }
    console.log('Finished rendering upgrades, container now has', container.children.length, 'children');
}

/**
 * Update inventory tab with optimized rendering
 */
function updateInventoryTab() {
    if (!gameState) {
        console.error('gameState not initialized in updateInventoryTab');
        return;
    }
    
    const container = document.getElementById('inventory-list');
    if (!container) {
        console.error('inventory-list container not found!');
        return;
    }
    
    // Ensure container is visible - use grid layout for compact display
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
    container.style.gap = '3px';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.innerHTML = '';
    
    // Clean up zero-amount items from inventory before rendering (no empty boxes)
    if (gameState.inventory) {
        for (const ingId in gameState.inventory) {
            if ((gameState.inventory[ingId] || 0) <= 0) {
                delete gameState.inventory[ingId];
            }
        }
    }
    
    if (!gameState.inventory || Object.keys(gameState.inventory).length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; grid-column: 1 / -1;">
                <picture>
                    <source srcset="images/ui/empty-state.webp" type="image/webp">
                    <img src="images/ui/empty-state.png" alt="Empty State" class="empty-state-illustration" style="max-width: 400px; width: 100%; height: auto; margin-bottom: 20px; opacity: 0.8;">
                </picture>
                <p class="empty-state-message" style="color: var(--text-dim); font-size: 18px;">Inventory empty. Craft workstations to get ingredients!</p>
            </div>
        `;
        return;
    }
    
    
    // Get all items and sort by tier and amount
    const items = [];
    let maxAmount = 0;
    
    // Hide focus from inventory until meditation is unlocked
    const isMeditationUnlocked = gameState.prestigeCount >= 1;
    
    for (const ingId in gameState.inventory) {
        const amount = gameState.inventory[ingId];
        // Skip items with zero or negative amounts (no empty boxes)
        if (amount <= 0) {
            // Clean up zero-amount items from inventory
            delete gameState.inventory[ingId];
            continue;
        }
        
        // Skip focus-related ingredients if meditation is not unlocked
        if (!isMeditationUnlocked && (ingId === 'focus' || ingId.includes('focus'))) {
            continue;
        }
        
        const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
        const tier = ingredient?.tier || 0;
        const displayName = ingredient?.displayName || ingId;
        
        items.push({ id: ingId, amount, tier, displayName });
        maxAmount = Math.max(maxAmount, amount);
    }
    
    // Sort by tier (ascending), then by amount (descending)
    items.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier - b.tier;
        return b.amount - a.amount;
    });
    
    // Group items by tier
    const itemsByTier = {};
    for (const item of items) {
        if (!itemsByTier[item.tier]) {
            itemsByTier[item.tier] = [];
        }
        itemsByTier[item.tier].push(item);
    }
    
    // Batch DOM updates for better performance
    const fragment = document.createDocumentFragment();
    
    // Create compact header card
    const currentDesignTier = designTierSystem ? designTierSystem.getCurrentTier() : 0;
    const isTier0 = currentDesignTier === 0;
    const isTier1Or2 = currentDesignTier <= 2;
    
    const headerCard = document.createElement('div');
    headerCard.className = 'card inventory-header';
    headerCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block; grid-column: 1 / -1; padding: 8px 12px;';
    
    if (isTier0) {
        // Tier 0: Monochrome, no gradients, no shadows - compact single line
        headerCard.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">◈</span>
                    <span style="font-size: 16px; font-weight: 600; color: #FFFFFF;">Inventory</span>
                </div>
                <div style="font-size: 12px; color: #FFFFFF; opacity: 0.8;">${items.length} items • ${formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total</div>
            </div>
        `;
    } else if (isTier1Or2) {
        // Tier 1-2: Colors but no gradients/shadows - compact single line
        headerCard.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">◈</span>
                    <span style="font-size: 16px; font-weight: 600; color: var(--primary);">Inventory</span>
                </div>
                <div style="font-size: 12px; color: var(--text-dim);">${items.length} items • ${formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total</div>
            </div>
        `;
    } else {
        // Tier 3-4: Full effects (gradients and shadows) - compact single line
        headerCard.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px; filter: drop-shadow(0 0 6px var(--primary));">◈</span>
                    <span style="font-size: 16px; font-weight: 600; background: linear-gradient(90deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Inventory</span>
                </div>
                <div style="font-size: 12px; color: var(--text-dim);">${items.length} items • ${formatShort(items.reduce((sum, item) => sum + item.amount, 0))} total</div>
            </div>
        `;
    }
    fragment.appendChild(headerCard);
    
    // Create items grouped by tier with enhanced visuals
    for (let tier = 0; tier <= 5; tier++) {
        if (!itemsByTier[tier] || itemsByTier[tier].length === 0) {
            continue;
        }
        
        // Add compact tier header with tier symbol
        const tierSymbol = getTierSymbol(tier);
        const tierStyle = getTierAppropriateStyle(tier);
        tierStyle.symbol = tierSymbol.symbol; // Ensure symbol is available
        
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.style.cssText = 'grid-column: 1 / -1; padding: 4px 8px; font-size: 11px; font-weight: 600; margin-top: 2px;';
        tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; margin-right: 4px; font-size: 14px;">${tierSymbol.symbol}</span>Tier ${tier}`;
        fragment.appendChild(tierHeader);
        
        // Create items for this tier
        for (const item of itemsByTier[tier]) {
            const cardId = `inventory-item-${item.id}`;
            
            // Check current design tier for restrictions
            const currentDesignTier = designTierSystem ? designTierSystem.getCurrentTier() : 0;
            const isTier0 = currentDesignTier === 0;
            const isTier1Or2 = currentDesignTier <= 2;
            
            const card = document.createElement('div');
            card.className = 'card inventory-item';
            card.setAttribute('data-tier', tier);
            card.setAttribute('data-item-id', item.id);
            
            // Apply tier-appropriate styling - compact
            if (isTier0) {
                // Tier 0: Strictly monochrome, no shadows, no transitions
            card.style.cssText = `
                position: relative; 
                z-index: 1; 
                pointer-events: auto; 
                visibility: visible; 
                display: block;
                    border: 1px solid #FFFFFF;
                    background: #000000;
                    box-shadow: none;
                    transition: none;
                    overflow: hidden;
                    min-height: auto;
                `;
            } else if (isTier1Or2) {
                // Tier 1-2: Colors but no shadows/glows, no transitions
                card.style.cssText = `
                    position: relative; 
                    z-index: 1; 
                    pointer-events: auto; 
                    visibility: visible; 
                    display: block;
                    border: 1px solid ${tierStyle.borderGlow};
                    background: #000000;
                    box-shadow: none;
                    transition: none;
                    overflow: hidden;
                    min-height: auto;
                `;
            } else {
                // Tier 3-4: Full effects (colors, shadows, glows, transitions)
                card.style.cssText = `
                    position: relative; 
                    z-index: 1; 
                    pointer-events: auto; 
                    visibility: visible; 
                    display: block;
                    border: 1px solid ${tierStyle.borderGlow};
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
                    box-shadow: ${tierStyle.boxShadow}, inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transition: ${tierStyle.transition};
                overflow: hidden;
                min-height: auto;
            `;
            }
            
            // Add shimmer overlay (only for tier 3+)
            if (!isTier0 && !isTier1Or2) {
            const shimmer = document.createElement('div');
            shimmer.className = 'inventory-shimmer';
            shimmer.style.cssText = `
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                animation: inventoryShimmer 3s infinite;
                pointer-events: none;
                z-index: 1;
            `;
            card.appendChild(shimmer);
            }
            
            // Add pulsing glow for high tiers (only for tier 3+)
            if (!isTier0 && !isTier1Or2 && tier >= 3) {
                const pulseGlow = document.createElement('div');
                pulseGlow.className = 'inventory-pulse-glow';
                pulseGlow.style.cssText = `
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
                    opacity: 0.3;
                    animation: pulseGlow 2s ease-in-out infinite;
                    pointer-events: none;
                    z-index: 0;
                `;
                card.appendChild(pulseGlow);
            }
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'inventory-item-content';
            contentDiv.style.cssText = 'position: relative; z-index: 2; padding: 4px 6px;';
            
            // Apply tier-appropriate content styling - number under title
            if (isTier0) {
                // Tier 0: Monochrome, no shadows, no animations - number under title
                contentDiv.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <span class="inventory-icon tier-icon-${tier}" style="font-size: 12px; color: #FFFFFF; text-shadow: none; flex-shrink: 0;">${tierStyle.symbol}</span>
                            <div class="card-label" style="font-size: 11px; font-weight: 600; color: #FFFFFF; text-shadow: none; font-family: 'Courier New', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${item.displayName}</div>
                        </div>
                        <div class="inventory-amount" style="font-size: 13px; font-weight: 700; color: #FFFFFF; text-shadow: none; font-family: 'Courier New', monospace; white-space: nowrap; text-align: left; padding-left: 16px;">
                            ${formatShort(item.amount)}
                        </div>
                    </div>
                `;
            } else if (isTier1Or2) {
                // Tier 1-2: Colors but no shadows/glows, no transitions - number under title
                contentDiv.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <span class="inventory-icon tier-icon-${tier}" style="font-size: 12px; color: ${tierStyle.color}; text-shadow: none; flex-shrink: 0;">${tierStyle.symbol}</span>
                            <div class="card-label" style="font-size: 11px; font-weight: 600; color: ${tierStyle.color}; text-shadow: none; font-family: 'Orbitron', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${item.displayName}</div>
                        </div>
                        <div class="inventory-amount" style="font-size: 13px; font-weight: 700; color: ${tierStyle.color}; text-shadow: none; font-family: 'Orbitron', monospace; white-space: nowrap; text-align: left; padding-left: 16px;">
                            ${formatShort(item.amount)}
                        </div>
                    </div>
                `;
            } else {
                // Tier 3-4: Full effects (colors, shadows, glows, transitions) - number under title
                contentDiv.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <span class="inventory-icon tier-icon-${tier}" style="font-size: 12px; color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; flex-shrink: 0;">${tierStyle.symbol}</span>
                            <div class="card-label" style="font-size: 11px; font-weight: 600; color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; font-family: 'Orbitron', sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${item.displayName}</div>
                        </div>
                        <div class="inventory-amount" style="font-size: 13px; font-weight: 700; color: ${tierStyle.color}; text-shadow: ${tierStyle.textShadow}; font-family: 'Orbitron', monospace; white-space: nowrap; text-align: left; padding-left: 16px;">
                            ${formatShort(item.amount)}
                        </div>
                    </div>
                `;
            }
            
            card.appendChild(contentDiv);
            
            // Add hover effect listener (only for tier 3+)
            if (!isTier0 && !isTier1Or2) {
                const tierSymbolData = getTierSymbol(tier);
            card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-2px) scale(1.01)';
                card.style.boxShadow = `
                        0 4px 12px rgba(0, 0, 0, 0.4),
                        0 0 20px ${tierSymbolData.glow},
                        inset 0 1px 0 rgba(255, 255, 255, 0.15)
                `;
                    card.style.borderColor = tierSymbolData.color;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                    card.style.boxShadow = tierStyle.boxShadow + ', inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                card.style.borderColor = tierStyle.borderGlow;
            });
            }
            
            // Particle effects removed for memory optimization
            // Visual feedback now uses CSS animations (see VISUAL_ALTERNATIVES.md)
            
            fragment.appendChild(card);
        }
    }
    
    container.appendChild(fragment);
}

/**
 * Update experiment tab with optimized rendering
 */
function updateExperimentTab() {
    const container = document.getElementById('recipe-list');
    container.innerHTML = '';
    
    // Experiment button handler
    const expButton = document.getElementById('experiment-button');
    if (expButton) {
        // Explicitly set button text to ensure no emoji (prevents caching issues)
        expButton.textContent = 'Try Experiment';
        expButton.title = 'Discover new preservation techniques through experimentation';
        
        // Remove any existing handlers to prevent duplicates
        expButton.onclick = null;
        expButton.replaceWith(expButton.cloneNode(true));
        const newExpButton = document.getElementById('experiment-button');
        
        newExpButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Mark as handled to prevent fallback handler from firing
            newExpButton.dataset.handled = 'true';
            setTimeout(() => {
                delete newExpButton.dataset.handled;
            }, 100);
            
            try {
                console.log('Experiment button clicked');
                const result = gameState.tryExperiment();
                const resultLabel = document.getElementById('experiment-result');
                
                // Ensure result label is visible
                if (resultLabel) {
                    resultLabel.style.display = 'block';
                    resultLabel.style.visibility = 'visible';
                    resultLabel.style.opacity = '1';
                }
                
                if (result.success) {
                    console.log('Experiment succeeded:', result.recipe.name);
                    resultLabel.innerHTML = `
                        <picture>
                            <source srcset="images/ui/experiment-result.webp" type="image/webp">
                            <img src="images/ui/experiment-result.png" alt="Experiment Success" class="experiment-result-illustration" style="width: 256px; height: 256px; object-fit: contain; margin: 0 auto 20px; display: block;">
                        </picture>
                        <span class="css-icon-sparkle"></span> Discovered: ${result.recipe.name}
                    `;
                    resultLabel.className = 'result-label success';
                    
                    // Celebration!
                    if (typeof pulseElement === 'function') {
                        pulseElement(newExpButton, 1.2, 400);
                    }
                    showNotification(`<span class="css-icon-celebration"></span> Discovered: ${result.recipe.name}!`, 'success');
                    
                    // Particle effects removed for memory optimization
                    // Visual feedback now uses CSS animations (see VISUAL_ALTERNATIVES.md)
                    
                    // Check achievements
                    if (achievements) {
                        const newAchievements = achievements.checkAchievements();
                        for (const achievement of newAchievements) {
                            // Only show notification if not already shown
                            if (!shownAchievementNotifications.has(achievement.name)) {
                                showNotification(`Achievement: ${achievement.name}!`, 'success');
                            }
                        }
                    }
                } else {
                    console.log('Experiment failed:', result.message);
                    resultLabel.innerHTML = `<div class="result-label error" style="color: var(--danger); padding: 15px; font-size: 16px; text-align: center;">${result.message}</div>`;
                    resultLabel.className = 'result-box';
                    
                    // Shake on failure
                    if (typeof shakeElement === 'function') {
                        shakeElement(newExpButton, 3, 200);
                    }
                    
                    // Show notification for feedback
                    showNotification(result.message, 'error');
                }
                
                updateExperimentTab();
            } catch (error) {
                console.error('Error in experiment:', error);
                const resultLabel = document.getElementById('experiment-result');
                if (resultLabel) {
                    resultLabel.innerHTML = `<div class="result-label error" style="color: var(--danger); padding: 15px; font-size: 16px; text-align: center;">Experiment failed. Try again.</div>`;
                    resultLabel.className = 'result-box';
                    resultLabel.style.display = 'block';
                    resultLabel.style.visibility = 'visible';
                    resultLabel.style.opacity = '1';
                }
                showNotification('Experiment failed. Try again.', 'error');
            }
        });
    }
    
    // Show discovered recipes with batched DOM updates
    const fragment = document.createDocumentFragment();
    
    for (const recipeId of gameState.discoveredRecipes) {
        const recipe = HIDDEN_RECIPES.find(r => r.id === recipeId);
        if (!recipe) continue;
        
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-title">${recipe.name}</div>
            <div class="card-description">${recipe.description}</div>
            <div class="card-section">
                        <div class="card-label">Cost:</div>
                ${Object.entries(recipe.inputs).map(([ingId, amount]) => {
                    const have = gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        <span class="recipe-label">${ingId}:</span>
                        <span class="recipe-numbers">${formatShort(have)} / ${formatShort(amount)}</span>
                    </div>`;
                }).join('')}
            </div>
            <div class="card-section">
                        <div class="card-label">Makes:</div>
                ${Object.entries(recipe.outputs).map(([outputId, amount]) =>
                    `<div class="card-value">${outputId}: ${formatShort(amount)}</div>`
                ).join('')}
            </div>
            <button class="btn-primary" data-action="craft-recipe" data-recipe-id="${recipeId}">Craft</button>
        `;
        
        // Attach event listener directly - use event delegation for better reliability
        const button = card.querySelector('button[data-action="craft-recipe"]');
        if (button && typeof window.craftRecipe === 'function') {
            // Ensure button is visible and clickable
            button.style.position = 'relative';
            button.style.zIndex = '100';
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
            button.style.visibility = 'visible';
            button.style.display = 'inline-block';
            
            // Attach handler directly - use capture phase to fire before unified handler
            button.addEventListener('click', (e) => {
                // Mark button as handled BEFORE processing to prevent unified handler from firing
                button.dataset.handled = 'true';
                
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Craft recipe button clicked:', { recipeId });
                const success = window.craftRecipe(recipeId);
                
                // Update UI after crafting
                if (success) {
                    updateExperimentTab();
                    if (typeof updateAllUI === 'function') {
                        debouncedUIUpdate('allUI', updateAllUI);
                    }
                }
                
                // Visual feedback
                if (success && typeof pulseElement === 'function') {
                    pulseElement(button, 1.1, 200);
                } else if (!success && typeof shakeElement === 'function') {
                    shakeElement(button, 3, 200);
                }
                
                // Clear handled flag after a short delay
                setTimeout(() => {
                    delete button.dataset.handled;
                }, 200);
            }, { capture: true, once: false }); // Use capture phase, allow multiple clicks
        }
        
        fragment.appendChild(card);
    }
    
    container.appendChild(fragment);
}

/**
 * Update daily rituals tab with optimized rendering
 */
function updateDailiesTab() {
    const container = document.getElementById('task-list');
    container.innerHTML = '';
    
    try {
        dailyRituals.checkDailyRefresh();
        
        // Batch DOM updates for better performance
        const fragment = document.createDocumentFragment();
        
        for (const task of dailyRituals.activeTasks) {
            const parts = task.condition.split(':');
            const target = parts.length > 0 ? parseInt(parts[parts.length - 1]) : 1;
            const progress = dailyRituals.taskProgress[task.id] || 0;
            const claimed = dailyRituals.claimedTasks.includes(task.id);
            
            let rewardText = '';
            switch (task.rewardType) {
                case 'ab':
                    rewardText = `${formatShort(task.rewardValue)} SE`;
                    break;
                case 'buff':
                    rewardText = `+${Math.floor(task.buffMultiplier * 100)}% for ${formatTimeDuration(task.rewardValue)}`;
                    break;
                case 'ek_frag':
                    rewardText = `${Math.floor(task.rewardValue)} EK Fragment${Math.floor(task.rewardValue) !== 1 ? 's' : ''}`;
                    break;
            }
            
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div class="card-title">${task.displayName}</div>
                <div class="card-description">${task.description}</div>
                <div class="card-section">
                    <div class="card-label">Progress: ${progress} / ${target}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(100, (progress / target) * 100)}%"></div>
                    </div>
                </div>
                <div class="card-section">
                    <div class="card-label">Reward: ${rewardText}</div>
                </div>
                <button class="btn-primary" data-action="claim-task" data-task-id="${task.id}" ${progress >= target && !claimed ? '' : 'disabled'}>
                    ${claimed ? 'Claimed' : progress >= target ? 'Claim' : 'Not Ready'}
                </button>
            `;
            
                // Attach event listener directly - always attach handler, check conditions inside
                const button = card.querySelector('button[data-action="claim-task"]');
                if (button && typeof window.claimTask === 'function') {
                    // Ensure button is visible and clickable
                    button.style.position = 'relative';
                    button.style.zIndex = '100';
                    button.style.pointerEvents = (progress < target || claimed || button.disabled) ? 'none' : 'auto';
                    button.style.cursor = (progress < target || claimed || button.disabled) ? 'not-allowed' : 'pointer';
                    button.style.visibility = 'visible';
                    button.style.display = 'inline-block';
                    
                    // Always attach handler - it will check if it can execute
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Check if we can actually claim
                        if (progress < target || claimed || button.disabled) {
                            console.log('Claim button disabled:', { progress, target, claimed, disabled: button.disabled });
                            return;
                        }
                        
                        console.log('Claim task button clicked:', { taskId: task.id });
                        window.claimTask(task.id);
                    });
                }
            
            fragment.appendChild(card);
        }
        
        container.appendChild(fragment);
    } catch (error) {
        console.error('Error updating dailies tab:', error);
        showNotification('Failed to load daily tasks', 'error');
    }
}

/**
 * Update boons tab with optimized rendering
 */
function updateBoonsTab() {
    try {
        const ekDisplay = document.getElementById('ek-display');
        if (ekDisplay) {
            ekDisplay.textContent = `Eldritch Keys: ${gameState.prestigePoints}`;
        }
        
        const container = document.getElementById('boon-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Batch DOM updates for better performance
        const fragment = document.createDocumentFragment();
        
        for (const boonData of PRESTIGE_BONUSES) {
            const currentLevel = gameState.prestigeBonuses[boonData.id] || 0;
            const cost = boonData.baseCostPp * Math.pow(boonData.costGrowth, currentLevel);
            
            let effectText = '';
            switch (boonData.type) {
                case 'global_mult':
                    effectText = `+${Math.floor(boonData.value * 100)}% Global Production per level`;
                    break;
                case 'producer_mult':
                    effectText = `+${Math.floor(boonData.value * 100)}% ${boonData.param} Production per level`;
                    break;
                case 'starting_currency':
                    effectText = `+${formatShort(boonData.value)} SE at start per level`;
                    break;
                case 'start_ingredient':
                    effectText = `+${formatShort(boonData.value)} ${boonData.param} at start per level`;
                    break;
                case 'ab_production_mult':
                    effectText = `+${Math.floor(boonData.value * 100)}% Spell Energy Production per level`;
                    break;
                case 'click_mult':
                    effectText = `+${Math.floor(boonData.value * 100)}% Cast Rewards per level`;
                    break;
                case 'prestige_speed':
                    effectText = `+${Math.floor(boonData.value * 100)}% Prestige Point Gain per level`;
                    break;
            }
            
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div class="card-title">${boonData.displayName} (Lv. ${currentLevel})</div>
                <div class="card-description">${boonData.description}</div>
                <div class="card-section">
                    <div class="card-label">${effectText}</div>
                </div>
                <div class="card-section">
                    <div class="card-label">${Math.floor(cost)} EK</div>
                </div>
                <button class="btn-primary" data-action="purchase-boon" data-boon-id="${boonData.id}" ${gameState.prestigePoints >= cost ? '' : 'disabled'}>
                    Purchase
                </button>
            `;
            
                // Attach event listener directly - always attach handler, check conditions inside
                const button = card.querySelector('button[data-action="purchase-boon"]');
                if (button && typeof window.purchaseBoon === 'function') {
                    // Ensure button is visible and clickable
                    button.style.position = 'relative';
                    button.style.zIndex = '100';
                    button.style.pointerEvents = (gameState.prestigePoints < cost || button.disabled) ? 'none' : 'auto';
                    button.style.cursor = (gameState.prestigePoints < cost || button.disabled) ? 'not-allowed' : 'pointer';
                    button.style.visibility = 'visible';
                    button.style.display = 'inline-block';
                    
                    // Always attach handler - it will check if it can execute
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Check if we can actually purchase
                        if (gameState.prestigePoints < cost || button.disabled) {
                            console.log('Purchase boon button disabled:', { prestigePoints: gameState.prestigePoints, cost, disabled: button.disabled });
                            return;
                        }
                        
                        console.log('Purchase boon button clicked:', { boonId: boonData.id });
                        window.purchaseBoon(boonData.id);
                    });
                }
            
            fragment.appendChild(card);
        }
        
        container.appendChild(fragment);
    } catch (error) {
        console.error('Error updating boons tab:', error);
        showNotification('Failed to load boons', 'error');
    }
}

function updateComboDisplay() {
    if (!comboSystem) return;
    
    const comboCount = comboSystem.getComboCount();
    const comboDisplay = document.getElementById('combo-display');
    
    if (comboCount > 0 && comboDisplay) {
        const mult = comboSystem.getComboMultiplier();
        // Check if auto-cast is maintaining this combo
        const autoMaintaining = window.getAutoCastEnabled && window.getAutoCastEnabled();
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
 * Map ingredient IDs to their elements based on workstation outputs
 */
function getIngredientElement(ingId) {
    // Base essences map directly to elements
    if (ingId === 'fire_essence') return 'fire';
    if (ingId === 'water_essence') return 'water';
    if (ingId === 'air_essence') return 'air';
    if (ingId === 'crystal_dust') return 'crystal';
    if (ingId === 'aether_ess') return 'aether';
    
    // Special ingredients
    if (ingId === 'focus') return 'aether'; // Focus is Aether-related (meditation/mental energy)
    if (ingId === 'ab') return 'aether'; // Spell Energy is Aether currency
    
    // Find which workstation produces this ingredient
    const producer = PRODUCERS.find(p => {
        if (!p.outputs) return false;
        return Object.keys(p.outputs).includes(ingId);
    });
    
    if (!producer) {
        // If not found, try to infer from name
        if (ingId.includes('fire') || ingId.includes('candle') || ingId.includes('wax') || ingId.includes('flame')) return 'fire';
        if (ingId.includes('water') || ingId.includes('liquid') || ingId.includes('aqua') || ingId.includes('flowing')) return 'water';
        if (ingId.includes('air') || ingId.includes('wind') || ingId.includes('zephyr') || ingId.includes('breath') || ingId.includes('gust')) return 'air';
        if (ingId.includes('crystal') || ingId.includes('shaped') || ingId.includes('orb') || (ingId.includes('core') && !ingId.includes('infinity'))) return 'crystal';
        if (ingId.includes('aether') || ingId.includes('dist') || ingId.includes('infinity') || ingId === 'ab') return 'aether';
        return null;
    }
    
    // Map workstation type to element based on building type and name
    const wsId = producer.id;
    const displayName = producer.displayName || '';
    
    // Fire: Forges (except crystal/wind ones)
    if (wsId.includes('fire') || wsId.includes('candle') || (wsId.includes('forge') && !wsId.includes('crystal') && !wsId.includes('wind') && !wsId.includes('spiral'))) return 'fire';
    
    // Water: Wells (except aether ones)
    if (wsId.includes('water') || wsId.includes('aqua') || wsId.includes('liquid') || wsId.includes('flowing') || (wsId.includes('well') && !wsId.includes('aether'))) return 'water';
    
    // Air: Generators
    if (wsId.includes('air') || wsId.includes('zephyr') || wsId.includes('wind') || wsId.includes('breath') || wsId.includes('generator') || wsId.includes('spiral')) return 'air';
    
    // Crystal: Chambers
    if (wsId.includes('crystal') || wsId.includes('chamber')) return 'crystal';
    
    // Aether: Reactors
    if (wsId.includes('aether') || wsId.includes('reactor')) return 'aether';
    
    return null;
}

function calculateElementTotals() {
    if (!gameState || !gameState.inventory) {
        return { fire: 0, water: 0, air: 0, crystal: 0, aether: 0 };
    }
    
    const totals = { fire: 0, water: 0, air: 0, crystal: 0, aether: 0 };
    
    // Sum up all ingredients by element
    for (const ingId in gameState.inventory) {
        const amount = gameState.inventory[ingId] || 0;
        if (amount <= 0) continue;
        
        const element = getIngredientElement(ingId);
        if (element && totals.hasOwnProperty(element)) {
            totals[element] += amount;
        }
    }
    
    return totals;
}

// Store previous element totals to detect changes
let previousElementTotals = { fire: 0, water: 0, air: 0, crystal: 0, aether: 0, focus: 0 };

/**
 * Update element counter displays with current totals
 */
function updateElementCounters() {
    if (!gameState) return;
    
    const totals = calculateElementTotals();
    
    // Update each element counter (with 1 decimal place)
    const elements = ['fire', 'water', 'air', 'crystal', 'aether'];
    for (const element of elements) {
        const counterElement = document.getElementById(`element-counter-${element}`);
        if (!counterElement) continue;
        
        const amountElement = counterElement.querySelector('.element-amount');
        if (!amountElement) continue;
        
        const total = totals[element];
        const formattedTotal = formatOneDecimal(total);
        const previousTotal = previousElementTotals[element] || 0;
        
        // Only update if value changed significantly (avoid unnecessary updates)
        if (Math.abs(total - previousTotal) > 0.01) {
            // Animate number change if significant change (using formatOneDecimal for element counters)
            if (previousTotal > 0 && Math.abs(total - previousTotal) > 0.1) {
                animateNumberWithFormatter(amountElement, previousTotal, total, 500, formatOneDecimal);
            } else {
                // Just update text for small changes
                amountElement.textContent = formattedTotal;
            }
            previousElementTotals[element] = total;
        } else if (amountElement.textContent.trim() !== formattedTotal) {
            // Update text if formatting changed but value is same
            amountElement.textContent = formattedTotal;
        }
    }
    
    // Update Focus counter to show meditation production bonus - only if meditation is unlocked
    const isMeditationUnlocked = gameState.prestigeCount >= 1;
    const focusCounter = document.getElementById('element-counter-focus');
    if (focusCounter) {
        if (isMeditationUnlocked) {
            // Show focus counter
            focusCounter.style.display = 'flex';
            focusCounter.style.visibility = 'visible';
            focusCounter.style.opacity = '1';
            
            const focusAmountElement = focusCounter.querySelector('.element-amount');
            if (focusAmountElement && window.meditationState) {
                // Get meditation production bonus
                const meditationBonus = window.meditationState.getMeditationProductionBonus();
                const bonusPercent = ((meditationBonus - 1.0) * 100).toFixed(1);
                const formattedBonus = `+${bonusPercent}%`;
                const previousBonus = previousElementTotals['meditationBonus'] || 0;
                
                if (Math.abs(meditationBonus - previousBonus) > 0.001) {
                    if (previousBonus > 0 && Math.abs(meditationBonus - previousBonus) > 0.01) {
                        // Animate the bonus change
                        const startPercent = ((previousBonus - 1.0) * 100).toFixed(1);
                        const endPercent = bonusPercent;
                        animateNumberWithFormatter(
                            focusAmountElement,
                            parseFloat(startPercent),
                            parseFloat(endPercent),
                            500,
                            (val) => `+${val.toFixed(1)}%`
                        );
                    } else {
                        focusAmountElement.textContent = formattedBonus;
                    }
                    previousElementTotals['meditationBonus'] = meditationBonus;
                } else if (focusAmountElement.textContent.trim() !== formattedBonus) {
                    focusAmountElement.textContent = formattedBonus;
                }
            }
        } else {
            // Hide focus counter
            focusCounter.style.display = 'none';
            focusCounter.style.visibility = 'hidden';
            focusCounter.style.opacity = '0';
        }
    }
}

function updateActiveEvents() {
    if (!eventSystem) return;
    
    const activeEvents = eventSystem.getActiveEvents();
    const eventsContainer = document.getElementById('active-events');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '';
    
    for (const event of activeEvents) {
        const remaining = Math.ceil((event.endTime - Date.now()) / 1000);
        const badge = document.createElement('div');
        badge.className = 'event-badge';
        badge.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${event.name}</div>
            <div style="font-size: 12px; color: var(--text-dim);">${remaining}s remaining</div>
        `;
        eventsContainer.appendChild(badge);
    }
}

/**
 * Update stats tab with virtual scrolling for achievements
 */
function updateStatsTab() {
    console.log('updateStatsTab called, gameState exists:', !!gameState, 'achievements exists:', !!achievements);
    if (!gameState || !achievements) {
        console.error('gameState or achievements not initialized');
        return;
    }
    
    const container = document.getElementById('stats-content');
    if (!container) {
        console.error('stats-content container not found!');
        return;
    }
    console.log('stats-content container found, updating content...');
    
    // Ensure container is visible
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.innerHTML = '';
    
    // Stats section with two-column layout
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
    statsCard.innerHTML = '<div class="card-title">Game Statistics</div>';
    
    // Create stats container with grid layout
    const statsContainer = document.createElement('div');
    statsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 10px;';
    
    // Split stats into two columns
    const leftColumnStats = [
        { label: 'Total Casts', value: gameState.totalTaps },
        { label: 'Total Arcane Bits Earned', value: formatShort(gameState.abTotalEarned) },
        { label: 'Arcane Bits Per Second', value: formatShort(gameState.getAbPerSecond()) },
        { label: 'Recipes Discovered', value: gameState.discoveredRecipes.length },
        { label: 'Achievements', value: `${achievements.getUnlockedCount()}/${achievements.getTotalCount()}` }
    ];
    
    const rightColumnStats = [
        { label: 'Workstations Crafted', value: gameState.totalWorkstationsCrafted },
        { label: 'Current Arcane Bits', value: formatShort(gameState.ab) },
        { label: 'Prestige Points', value: gameState.prestigePoints },
        { label: 'Max Combo', value: comboSystem ? comboSystem.maxCombo : 0 }
    ];
    
    // Add meditation production bonus if meditation is unlocked
    if (window.meditationState && typeof window.meditationState.getMeditationProductionBonus === 'function') {
        const meditationBonus = window.meditationState.getMeditationProductionBonus();
        const bonusPercent = ((meditationBonus - 1.0) * 100).toFixed(1);
        rightColumnStats.push({ 
            label: stripEmojisIfLowTier('🧘 Meditation Production Bonus'), 
            value: `+${bonusPercent}%`,
            style: 'color: var(--success); font-weight: bold;'
        });
    }
    
    // Create left column
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
    for (const stat of leftColumnStats) {
        const item = document.createElement('div');
        if (stat.style) {
            item.style.cssText = stat.style;
        }
        item.className = 'card-section';
        item.style.cssText += 'margin-bottom: 0;';
        item.innerHTML = `
            <div class="card-label">${stat.label}</div>
            <div class="card-value" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${stat.value}</div>
        `;
        leftColumn.appendChild(item);
    }
    
    // Create right column
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
    for (const stat of rightColumnStats) {
        const item = document.createElement('div');
        if (stat.style) {
            item.style.cssText = stat.style;
        }
        item.className = 'card-section';
        item.style.cssText += 'margin-bottom: 0;';
        item.innerHTML = `
            <div class="card-label">${stat.label}</div>
            <div class="card-value" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal;">${stat.value}</div>
        `;
        rightColumn.appendChild(item);
    }
    
    statsContainer.appendChild(leftColumn);
    statsContainer.appendChild(rightColumn);
    statsCard.appendChild(statsContainer);
    container.appendChild(statsCard);
    
    // Achievements section with two-column layout
    const achievementsCard = document.createElement('div');
    achievementsCard.className = 'card';
    achievementsCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
    achievementsCard.innerHTML = '<div class="card-title">Achievements</div>';
    
    // Create achievements container with grid layout (two columns)
    const achievementsContainer = document.createElement('div');
    achievementsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 10px; max-height: 50vh; overflow-y: auto;';
    
    // Create left and right columns for achievements
    const achievementsLeftColumn = document.createElement('div');
    achievementsLeftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
    
    const achievementsRightColumn = document.createElement('div');
    achievementsRightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
    
    const achievementsList = document.createElement('div');
    achievementsList.className = 'content-list';
    achievementsList.style.cssText = 'display: none;'; // Hidden, we'll use the columns instead
    
    // Destroy existing virtual list if it exists
    if (virtualAchievementList) {
        virtualAchievementList.destroy();
    }
    
    // Get achievements array - check multiple possible structures
    const achievementsArray = achievements.achievements || achievements.getAllAchievements?.() || [];
    console.log('Achievements array length:', achievementsArray.length);
    
    // Always use traditional rendering for achievements (simpler and more reliable)
    // DISABLED: Virtual scroll causes items to disappear - using traditional rendering instead
    if (false && achievementsArray && achievementsArray.length > 10) {
        console.log('Using virtual scrolling for', achievementsArray.length, 'achievements');
        try {
            virtualAchievementList = new VirtualAchievementList(achievementsList, achievementsArray, achievements);
            // Force initial render after a short delay
            setTimeout(() => {
                if (virtualAchievementList && virtualAchievementList._constructorComplete) {
                    console.log('Forcing virtual scroll initial render for achievements...');
                    virtualAchievementList.updateContainerHeight();
                    virtualAchievementList.renderVisibleItems();
                }
            }, 50);
        } catch (e) {
            console.error('Error creating virtual achievement list:', e);
            // Fall back to traditional rendering
            renderAchievementsTraditional(achievementsArray);
        }
    } else {
        // Traditional rendering for all lists
        renderAchievementsTraditional(achievementsArray);
    }
    
    // Helper function for traditional rendering with two-column layout
    function renderAchievementsTraditional(achievementsArray) {
        console.log('Using traditional rendering for', achievementsArray.length, 'achievements');
        
        if (!achievementsArray || achievementsArray.length === 0) {
            console.warn('No achievements to render');
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'card-section';
            emptyMsg.style.cssText = 'padding: 10px; color: var(--text-dim); grid-column: 1 / -1;';
            emptyMsg.textContent = 'No achievements yet.';
            achievementsContainer.appendChild(emptyMsg);
            return;
        }
        
        // Distribute achievements across two columns
        achievementsArray.forEach((achievement, index) => {
            if (!achievement) return;
            const unlocked = achievements.unlockedAchievements?.has(achievement.id) || false;
            
            // Calculate progress if achievement has progress tracking
            let progressHTML = '';
            if (!unlocked && achievement.checkProgress && typeof achievement.checkProgress === 'function') {
                try {
                    const progress = achievement.checkProgress(gameState);
                    if (progress && progress.current !== undefined && progress.target !== undefined) {
                        const percentage = Math.min(100, Math.round((progress.current / progress.target) * 100));
                        progressHTML = `
                            <div class="achievement-progress" style="margin-top: 8px;">
                                <div class="progress-bar-container" style="width: 100%; height: 8px; background: rgba(0, 0, 0, 0.3); border-radius: 4px; overflow: hidden;">
                                    <div class="progress-bar" style="width: ${percentage}%; height: 100%; background: var(--primary, #FF2DAA); transition: width 0.3s;"></div>
                                </div>
                                <div class="progress-text" style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">
                                    ${progress.current} / ${progress.target} (${percentage}%)
                                </div>
                            </div>
                        `;
                    }
                } catch (e) {
                    console.warn('Error calculating achievement progress:', e);
                }
            }
            
            const item = document.createElement('div');
            item.className = 'card-section achievement-item';
            item.style.cssText = `padding: 10px; border-radius: 6px; background: ${unlocked ? 'rgba(60, 227, 197, 0.2)' : 'rgba(0, 0, 0, 0.3)'}; margin-bottom: 8px; position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; box-sizing: border-box; overflow: visible; line-height: 1.5;`;
            item.innerHTML = `
                <div class="card-label" style="color: ${unlocked ? 'var(--success)' : 'var(--text-dim)'}; word-wrap: break-word; overflow-wrap: break-word; margin-bottom: 6px; font-weight: 600; line-height: 1.5; display: block; white-space: normal;">
                    ${stripEmojisIfLowTier(unlocked ? '✓' : '○')} ${achievement.name || 'Unknown Achievement'}
                </div>
                <div class="card-description" style="font-size: 11px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; line-height: 1.5; color: var(--text-dim); display: block; white-space: normal; margin-bottom: 4px;">${achievement.description || 'No description'}</div>
                ${progressHTML}
            `;
            
            // Alternate between left and right columns
            if (index % 2 === 0) {
                achievementsLeftColumn.appendChild(item);
            } else {
                achievementsRightColumn.appendChild(item);
            }
        });
        
        // Append columns to container
        achievementsContainer.appendChild(achievementsLeftColumn);
        achievementsContainer.appendChild(achievementsRightColumn);
        
        console.log('Rendered', achievementsArray.length, 'achievements using traditional rendering in two columns');
    }
    
    achievementsCard.appendChild(achievementsContainer);
    container.appendChild(achievementsCard);
    
    console.log('Stats tab updated, container children:', container.children.length);
}

/**
 * Update coven tab with current coven information
 * Archived for future development - see ARCHIVED_COVEN_FEATURES.md
 */
function updateCovenTab() {
    // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        return;
}

/**
 * Update coven rituals display
 * Archived for future development - see ARCHIVED_COVEN_FEATURES.md
 */
function updateCovenRituals() {
    // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        return;
}

/**
 * Update coven members display
 * Archived for future development - see ARCHIVED_COVEN_FEATURES.md
 */
function updateCovenMembers() {
    // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        return;
}

function updateAllUI() {
    updateWorkstationsTab();
    updateInscriptionsTab();
    updateInventoryTab();
    updateExperimentTab();
    updateDailiesTab();
    // updateCovenTab(); // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
    updateBoonsTab();
    updateStatsTab();
    updateMeditationVisibility(); // Update meditation tab visibility
    updateElementCounters(); // Update element counters
    updateSpecializationIndicator(); // Update specialization indicator
}

/**
 * Update specialization indicator in HUD
 */
function updateSpecializationIndicator() {
    const indicator = document.getElementById('specialization-indicator');
    if (!indicator || !gameState) return;
    
    if (gameState.elementSpecialization) {
        const spec = ELEMENT_SPECIALIZATIONS[gameState.elementSpecialization];
        if (spec) {
            indicator.textContent = spec.icon;
            indicator.style.display = 'inline-block';
            indicator.title = `${spec.name}\n${spec.description}`;
        } else {
            indicator.style.display = 'none';
        }
    } else {
        indicator.style.display = 'none';
    }
}

/**
 * Update meditation and boons tab visibility based on prestige count
 * Also hides/shows focus-related features
 */
function updateMeditationVisibility() {
    if (!gameState) return;
    
    const isUnlocked = gameState.prestigeCount >= 1;
    
    // Show meditation story introduction on first unlock
    if (isUnlocked && !localStorage.getItem('hasSeenMeditationStory')) {
        showMeditationStoryIntroduction();
        localStorage.setItem('hasSeenMeditationStory', 'true');
    }
    
    // Update meditation tab
    const meditationTabButton = document.querySelector('.tab-btn[data-tab="meditation"]');
    const meditationTabPanel = document.getElementById('meditation-tab');
    
    if (meditationTabButton) {
        if (isUnlocked) {
            meditationTabButton.style.display = 'flex';
            meditationTabButton.style.visibility = 'visible';
            meditationTabButton.style.opacity = '1';
            meditationTabButton.style.pointerEvents = 'auto';
        } else {
            meditationTabButton.style.display = 'none';
            meditationTabButton.style.visibility = 'hidden';
            meditationTabButton.style.opacity = '0';
            meditationTabButton.style.pointerEvents = 'none';
        }
    }
    
    if (meditationTabPanel) {
        if (isUnlocked) {
            meditationTabPanel.style.display = 'block';
            meditationTabPanel.style.visibility = 'visible';
            meditationTabPanel.style.opacity = '1';
            meditationTabPanel.style.pointerEvents = 'auto';
        } else {
            meditationTabPanel.style.display = 'none';
            meditationTabPanel.style.visibility = 'hidden';
            meditationTabPanel.style.opacity = '0';
            meditationTabPanel.style.pointerEvents = 'none';
        }
    }
    
    // Update focus counter visibility
    const focusCounter = document.getElementById('element-counter-focus');
    if (focusCounter) {
        if (isUnlocked) {
            focusCounter.style.display = 'flex';
            focusCounter.style.visibility = 'visible';
            focusCounter.style.opacity = '1';
            focusCounter.style.pointerEvents = 'auto';
        } else {
            focusCounter.style.display = 'none';
            focusCounter.style.visibility = 'hidden';
            focusCounter.style.opacity = '0';
            focusCounter.style.pointerEvents = 'none';
        }
    }
    
    // Update boons tab (also requires first ascension)
    const boonsTabButton = document.querySelector('.tab-btn[data-tab="boons"]');
    const boonsTabPanel = document.getElementById('boons-tab');
    
    if (boonsTabButton) {
        if (isUnlocked) {
            boonsTabButton.style.display = 'flex';
            boonsTabButton.style.visibility = 'visible';
            boonsTabButton.style.opacity = '1';
            boonsTabButton.style.pointerEvents = 'auto';
        } else {
            boonsTabButton.style.display = 'none';
            boonsTabButton.style.visibility = 'hidden';
            boonsTabButton.style.opacity = '0';
            boonsTabButton.style.pointerEvents = 'none';
        }
    }
    
    if (boonsTabPanel) {
        if (isUnlocked) {
            boonsTabPanel.style.display = 'block';
            boonsTabPanel.style.visibility = 'visible';
            boonsTabPanel.style.opacity = '1';
            boonsTabPanel.style.pointerEvents = 'auto';
        } else {
            boonsTabPanel.style.display = 'none';
            boonsTabPanel.style.visibility = 'hidden';
            boonsTabPanel.style.opacity = '0';
            boonsTabPanel.style.pointerEvents = 'none';
        }
    }
}

/**
 * Initialize volume sliders
 */
function initializeVolumeSliders() {
    if (!window.audioSystem) {
        console.warn('audioSystem not available for volume sliders');
        return;
    }
    
    // Sound Effects Volume Slider (Tier 2+)
    const sfxVolumeSlider = document.getElementById('sfx-volume-slider');
    const sfxVolumeValue = document.getElementById('sfx-volume-value');
    
    if (sfxVolumeSlider && sfxVolumeValue) {
        // Set initial value from audioSystem
        const currentSfxVolume = window.audioSystem.sfxVolume || 1;
        sfxVolumeSlider.value = currentSfxVolume;
        sfxVolumeValue.textContent = Math.round(currentSfxVolume * 100) + '%';
        
        // Add event listener
        sfxVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            window.audioSystem.setSfxVolume(volume);
            sfxVolumeValue.textContent = Math.round(volume * 100) + '%';
        });
    }
    
    // Music Volume Slider (Tier 4+)
    const musicVolumeSlider = document.getElementById('music-volume-slider');
    const musicVolumeValue = document.getElementById('music-volume-value');
    
    if (musicVolumeSlider && musicVolumeValue) {
        // Set initial value from audioSystem
        const currentMusicVolume = window.audioSystem.musicVolume || 1;
        musicVolumeSlider.value = currentMusicVolume;
        musicVolumeValue.textContent = Math.round(currentMusicVolume * 100) + '%';
        
        // Add event listener
        musicVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            if (window.audioSystem.setMusicVolume) {
                window.audioSystem.setMusicVolume(volume);
            } else {
                // Fallback if setMusicVolume doesn't exist
                window.audioSystem.musicVolume = volume;
                window.audioSystem.saveMusicVolume();
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
            } else if (window.startTutorial) {
                window.startTutorial();
            }
        });
    }
    
    if (resetTutorialButton && !resetTutorialButton.hasAttribute('data-tutorial-listener-added')) {
        resetTutorialButton.setAttribute('data-tutorial-listener-added', 'true');
        resetTutorialButton.addEventListener('click', () => {
            if (tutorialSystem) {
                tutorialSystem.reset();
                if (window.showNotification) {
                    window.showNotification('Tutorial reset. It will start automatically on next game load.', 'info');
                }
            } else if (window.resetTutorial) {
                window.resetTutorial();
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
            if (window.showNotification) {
                window.showNotification('Reset cancelled. Your progress is safe.', 'info');
            }
            return;
        }
    
        console.log('Reset confirmed, proceeding with reset...');
        
        // Show loading state
        if (window.showLoadingState) {
            window.showLoadingState('Resetting game...');
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
    if (meditationState) {
        meditationState.reset();
    }
    
    // Show notification
    if (window.showNotification) {
        window.showNotification('<span class="css-icon-reset"></span> All progress has been reset!', 'info');
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
function showElementSpecializationChoice() {
    // Don't show if already has specialization (shouldn't happen, but safety check)
    if (gameState.elementSpecialization) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'specialization-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    const content = document.createElement('div');
    content.className = 'specialization-content';
    content.style.cssText = `
        background: var(--bg-primary, #1a1a2e);
        border: 2px solid var(--accent, #6c5ce7);
        border-radius: 15px;
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    
    content.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 20px; color: var(--accent, #6c5ce7); font-size: 28px;">
            Choose Your Preservation Strategy
        </h2>
        <p style="text-align: center; margin-bottom: 30px; color: var(--text-secondary, #aaa); font-size: 16px;">
            This plane is too far gone. You've learned all you can here. As you prepare to Ascend to other realms where magic still exists, you must choose how you'll approach preservation in the next realm. Each element offers a different strategy for fighting the fading.
        </p>
        <div class="element-choices" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 20px;">
            ${Object.values(ELEMENT_SPECIALIZATIONS).map(spec => `
                <div class="element-choice" data-element="${spec.id}" style="
                    background: var(--bg-secondary, #16213e);
                    border: 2px solid var(--accent, #6c5ce7);
                    border-radius: 10px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                ">
                    <div class="element-icon" style="font-size: 48px; margin-bottom: 10px;">${spec.icon}</div>
                    <h3 style="margin: 10px 0; color: var(--text-primary, #fff); font-size: 18px;">${spec.name}</h3>
                    <p style="margin: 10px 0; color: var(--text-secondary, #aaa); font-size: 12px; line-height: 1.4;">${spec.description}</p>
                    <div class="element-bonuses" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border, #333);">
                        ${Object.entries(spec.bonuses).map(([key, value]) => {
                            let display = '';
                            if (key === 'baseProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% ${spec.id} production`;
                            else if (key === 'abProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% AB from ${spec.id} reactors`;
                            else if (key === 'costReduction') display = `-${(value * 100).toFixed(0)}% ${spec.id} costs`;
                            else if (key === 'castRewardMult') display = `+${((value - 1) * 100).toFixed(0)}% cast rewards`;
                            else if (key === 'globalProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% all production`;
                            else if (key === 'ingredientProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% ingredient production`;
                            else if (key === 'unlockSpeedMult') display = `Unlock ${((1 - value) * 100).toFixed(0)}% earlier`;
                            else if (key === 'productionSpeedMult') display = `+${((value - 1) * 100).toFixed(0)}% production speed`;
                            else if (key === 'castSpeedMult') display = `+${((value - 1) * 100).toFixed(0)}% cast speed`;
                            else if (key === 'universalIngredientMult') display = `+${((value - 1) * 100).toFixed(0)}% universal ingredients`;
                            else if (key === 'bottleneckCostReduction') display = `-${(value * 100).toFixed(0)}% bottleneck costs`;
                            else if (key === 'crystalBuildingMult') display = `+${((value - 1) * 100).toFixed(0)}% Crystal building production`;
                            return `<div style="font-size: 11px; color: var(--success, #00d4aa); margin: 3px 0;">${display}</div>`;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Add hover effects
    const choices = modal.querySelectorAll('.element-choice');
    choices.forEach(choice => {
        choice.addEventListener('mouseenter', () => {
            choice.style.transform = 'scale(1.05)';
            choice.style.borderColor = 'var(--success, #00d4aa)';
            choice.style.boxShadow = '0 5px 20px rgba(0, 212, 170, 0.3)';
        });
        choice.addEventListener('mouseleave', () => {
            choice.style.transform = 'scale(1)';
            choice.style.borderColor = 'var(--accent, #6c5ce7)';
            choice.style.boxShadow = 'none';
        });
        choice.addEventListener('click', () => {
            const element = choice.dataset.element;
            if (gameState.chooseElementSpecialization(element)) {
                modal.remove();
                if (window.showNotification) {
                    const spec = ELEMENT_SPECIALIZATIONS[element];
                    window.showNotification(`${spec.icon} ${spec.name} chosen!`, 'success');
                }
                debouncedUIUpdate('allUI', updateAllUI);
            }
        });
    });
}

function updateDailyProgress(conditionType, param, value) {
    if (dailyRituals) {
        dailyRituals.updateTaskProgress(conditionType, param, value);
    }
}

// Make globally accessible for meditation system
window.updateDailyProgress = updateDailyProgress;
window.updateSettingsTab = updateSettingsTab;

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
        if (meditationState && typeof meditationState.saveState === 'function') {
            meditationState.saveState();
        }
        
        // Periodic memory cleanup (every 5 minutes)
        if (typeof window._lastMemoryCleanup === 'undefined' || Date.now() - window._lastMemoryCleanup > 300000) {
            performMemoryCleanup();
            window._lastMemoryCleanup = Date.now();
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

// Notification system with queue management
let notificationQueue = [];
let isShowingNotification = false;
let maxNotificationsPerSecond = 3;

/**
 * Remove emojis from text if tier < 3
 * @param {string} text - Text that may contain emojis
 * @returns {string} - Text without emojis if tier < 3, otherwise original text
 */
function stripEmojisIfLowTier(text) {
    if (!text || typeof text !== 'string') return text;
    
    // Check current tier
    const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
    
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

// Make function globally available
window.stripEmojisIfLowTier = stripEmojisIfLowTier;
let notificationCount = 0;
let lastNotificationReset = Date.now();

// Sound throttling for notifications
let lastNotificationSoundTime = 0;
let notificationSoundThrottle = 500; // Only play notification sound every 500ms

/**
 * Show notification with rate limiting
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
function showNotification(message, type = 'info') {
    // Remove emojis if tier < 3
    message = stripEmojisIfLowTier(message);
    
    // Track analytics if enabled
    if (playerAnalyticsManager && playerAnalyticsManager.enabled) {
        playerAnalyticsManager.track('notification_shown', {
            type,
            message: message.substring(0, 50) // Truncate for privacy
        });
    }
    
    // Rate limiting
    const now = Date.now();
    if (now - lastNotificationReset > 1000) {
        notificationCount = 0;
        lastNotificationReset = now;
    }
    
    if (notificationCount >= maxNotificationsPerSecond) {
        // Queue notification if rate limited
        notificationQueue.push({ message, type });
        return;
    }
    
    notificationCount++;
    
    // Play appropriate sound based on notification type (throttled to prevent spam)
    if (window.audioSystem && window.audioSystem.playSound) {
        const now = Date.now();
        if (now - lastNotificationSoundTime >= notificationSoundThrottle) {
            if (type === 'error') {
                window.audioSystem.playSound('error', { volume: 0.3 });
            } else if (type === 'success') {
                // Don't play success sound here - achievement/level_up sounds are played separately
                // Only play if it's not an achievement notification (those have their own sound)
                if (!message.includes('Achievement')) {
                    window.audioSystem.playSound('success', { volume: 0.3 });
                }
            } else {
                // Info type - play notification sound
                window.audioSystem.playSound('notification', { volume: 0.3 });
            }
            lastNotificationSoundTime = now;
        }
    }
    
    // Create and show notification immediately
    createNotificationElement(message, type);
}

/**
 * Show craft notification in sidebar
 * @param {string} message - Notification message
 * @param {number} amount - Amount crafted
 */
function showCraftNotification(message, amount) {
    const container = document.getElementById('craft-notifications');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'craft-notification';
    notification.innerHTML = `
        <span class="craft-icon">${stripEmojisIfLowTier('✨')}</span>
        <span class="craft-message">${message}</span>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('craft-notification-visible');
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('craft-notification-visible');
        notification.classList.add('craft-notification-fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Limit to 5 notifications max
    const notifications = container.querySelectorAll('.craft-notification');
    if (notifications.length > 5) {
        const oldest = notifications[0];
        oldest.classList.remove('craft-notification-visible');
        oldest.classList.add('craft-notification-fade-out');
        setTimeout(() => {
            if (oldest.parentNode) {
                oldest.parentNode.removeChild(oldest);
            }
        }, 300);
    }
}

// Track shown achievement notifications to prevent duplicates
const shownAchievementNotifications = new Set();

/**
 * Create notification element
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
function createNotificationElement(message, type) {
    // Prevent duplicate achievement notifications
    if (type === 'success' && message.includes('Achievement')) {
        // Extract achievement name from message
        const achievementMatch = message.match(/Achievement: (.+)!/);
        if (achievementMatch) {
            const achievementName = achievementMatch[1];
            if (shownAchievementNotifications.has(achievementName)) {
                // Already shown this achievement, skip
                return;
            }
            shownAchievementNotifications.add(achievementName);
        }
    }
    
    // Get or create notifications container
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add achievement unlock scene for achievement notifications
    if (type === 'success' && message.includes('Achievement')) {
        notification.classList.add('achievement-notification');
        notification.innerHTML = `
            <picture>
                <source srcset="images/achievements/achievement-unlock-scene.webp" type="image/webp">
                <img src="images/achievements/achievement-unlock-scene.png" alt="Achievement Unlocked" class="achievement-scene">
            </picture>
            <span>${message}</span>
        `;
    } else {
        notification.innerHTML = message; // Use innerHTML to support CSS icons
    }
    
    container.appendChild(notification);
    
    slideIn(notification, 'top', 300);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            notification.remove();
            // Process queue after current notification is done
            processNotificationQueue();
        }, 300);
    }, 3000);
}

/**
 * Process notification queue
 */
function processNotificationQueue() {
    if (isShowingNotification || notificationQueue.length === 0) return;
    
    isShowingNotification = true;
    const { message, type } = notificationQueue.shift();
    
    createNotificationElement(message, type);
    
    setTimeout(() => {
        isShowingNotification = false;
        processNotificationQueue();
    }, 3000);
}

function showWelcomeBack(elapsed, abGained) {
    document.getElementById('welcome-time').innerHTML = `<span class="css-icon-clock"></span> Away for: ${formatTimeDuration(elapsed)}`;
    document.getElementById('welcome-ab').innerHTML = `<span class="css-icon-sparkle"></span> Earned: ${formatShort(abGained)} SE`;
    welcomeBackModal.classList.add('active');
    // Force show when active
    welcomeBackModal.style.display = 'flex';
    welcomeBackModal.style.pointerEvents = 'auto';
    welcomeBackModal.style.visibility = 'visible';
    welcomeBackModal.style.opacity = '1';
    
    // Animate modal appearance
    const modalContent = welcomeBackModal.querySelector('.modal-content');
    if (modalContent) {
        slideIn(modalContent, 'bottom', 400);
    }
    
    setTimeout(() => {
        welcomeBackModal.classList.remove('active');
        // Hide when inactive
        welcomeBackModal.style.display = 'none';
        welcomeBackModal.style.pointerEvents = 'none';
        welcomeBackModal.style.visibility = 'hidden';
        welcomeBackModal.style.opacity = '0';
    }, 5000);
}

// Show prestige modal
/**
 * Show story introduction modal on first launch
 */
function showStoryIntroduction() {
    if (!gameState) return;
    
    // Check if story introduction was already shown
    const hasSeenStory = localStorage.getItem('hasSeenStoryIntroduction') === 'true';
    if (hasSeenStory) return;
    
    const modal = document.createElement('div');
    modal.className = 'story-intro-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.className = 'story-intro-content';
    content.style.cssText = `
        background: var(--bg-primary, #1a1a2e);
        border: 2px solid var(--accent, #6c5ce7);
        border-radius: 15px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
    `;
    
    content.innerHTML = `
        <h1 style="color: var(--accent, #6c5ce7); font-size: 36px; margin-bottom: 20px;">Hex Compiler</h1>
        <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
            Magic is dying. The world's spell energy is fading, and once it's gone, it won't return.
        </p>
        <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
            You are a <strong style="color: var(--success, #00d4aa);">Hex Compiler</strong>—one of the last who knows how to preserve magic by crystallizing it into permanent structures.
        </p>
        <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Every spell you cast pulls energy from a dwindling pool. If you don't act, magic will be gone forever.
        </p>
        <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Your workstations are preservation chambers—structures that capture and hold spell energy before it fades.
        </p>
        <button class="btn-primary" onclick="closeStoryIntroduction()" style="
            padding: 15px 40px;
            font-size: 18px;
            background: var(--accent, #6c5ce7);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
        ">Begin Preservation</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Mark as seen
    localStorage.setItem('hasSeenStoryIntroduction', 'true');
}

/**
 * Close story introduction modal
 */
window.closeStoryIntroduction = function() {
    const modal = document.querySelector('.story-intro-modal');
    if (modal) modal.remove();
};

/**
 * Show meditation story introduction when meditation unlocks
 */
function showMeditationStoryIntroduction() {
    const modal = document.createElement('div');
    modal.className = 'meditation-story-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        backdrop-filter: blur(10px);
    `;
    
    const content = document.createElement('div');
    content.className = 'meditation-story-content';
    content.style.cssText = `
        background: var(--bg-primary, #1a1a2e);
        border: 2px solid var(--accent, #6c5ce7);
        border-radius: 15px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
    `;
    
    content.innerHTML = `
        <h1 style="color: var(--accent, #6c5ce7); font-size: 36px; margin-bottom: 20px;">The Mental Defense</h1>
        <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
            As magic fades, the chaos and despair create <strong style="color: var(--error, #ff4757);">Distractions</strong>—mental intrusions that break your focus.
        </p>
        <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
            The fading doesn't just drain magic; it attacks your mind. Doubt, despair, and chaos seep in, making it harder to preserve what remains.
        </p>
        <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            You've learned to defend your mind. <strong style="color: var(--success, #00d4aa);">Meditation</strong> is your mental fortress—a space where you use preserved materials to build towers of focus.
        </p>
        <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            These towers defend your <strong style="color: var(--success, #00d4aa);">Tranquility</strong> against waves of Distractions. The more focused you are, the better you can preserve magic.
        </p>
        <button class="btn-primary" onclick="closeMeditationStory()" style="
            padding: 15px 40px;
            font-size: 18px;
            background: var(--accent, #6c5ce7);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.3s;
        ">Enter Meditation</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * Close meditation story introduction modal
 */
window.closeMeditationStory = function() {
    const modal = document.querySelector('.meditation-story-modal');
    if (modal) modal.remove();
};

/**
 * Show full story modal
 */
function showFullStoryModal() {
    const modal = document.createElement('div');
    modal.className = 'full-story-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        backdrop-filter: blur(10px);
        overflow-y: auto;
    `;
    
    const content = document.createElement('div');
    content.className = 'full-story-content';
    content.style.cssText = `
        background: var(--bg-primary, #1a1a2e);
        border: 2px solid var(--accent, #6c5ce7);
        border-radius: 15px;
        padding: 40px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        margin: 20px;
    `;
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: var(--accent, #6c5ce7); font-size: 36px; margin-bottom: 10px;">Hex Compiler</h1>
            <p style="color: var(--text-secondary, #aaa); font-size: 18px;">The Story of The Fading</p>
        </div>
        
        <div style="color: var(--text-primary, #fff); font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
            <h2 style="color: var(--accent, #6c5ce7); font-size: 24px; margin-top: 30px; margin-bottom: 15px;">The Premise</h2>
            <p style="margin-bottom: 15px;">
                Magic is dying. The world's spell energy is fading, and once it's gone, it won't return. You are a <strong style="color: var(--success, #00d4aa);">Hex Compiler</strong>—one of the last who knows how to preserve magic by crystallizing it into permanent structures.
            </p>
            
            <h2 style="color: var(--accent, #6c5ce7); font-size: 24px; margin-top: 30px; margin-bottom: 15px;">The Urgency</h2>
            <p style="margin-bottom: 15px;">
                Every spell you cast pulls energy from a dwindling pool. If you don't act, magic will be gone forever. Your workstations are preservation chambers—structures that capture and hold spell energy before it fades.
            </p>
            
            <h2 style="color: var(--accent, #6c5ce7); font-size: 24px; margin-top: 30px; margin-bottom: 15px;">The Journey</h2>
            
            <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Early Game</h3>
            <p style="margin-bottom: 15px;">
                You cast desperate spells, gathering what elemental essences remain. Fire, Water, Air, Crystal—each element fades at a different rate. You build basic workstations (Forges, Wells, Generators, Chambers) to stabilize these essences into materials that won't fade.
            </p>
            
            <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Mid Game</h3>
            <p style="margin-bottom: 15px;">
                You've learned to combine preserved materials into more stable forms. Some workstations can generate Arcane Bits—they're not just preserving magic, they're creating self-sustaining loops that slow the fading.
            </p>
            
            <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Late Game</h3>
            <p style="margin-bottom: 15px;">
                You're building quantum and void-level structures—the most stable forms possible. These are your last hope to preserve magic in forms that might outlast the fading.
            </p>
            
            <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Meditation - The Mental Defense</h3>
            <p style="margin-bottom: 15px;">
                As magic fades, the chaos and despair create <strong style="color: var(--error, #ff4757);">Distractions</strong>—mental intrusions that break your focus. The fading doesn't just drain magic; it attacks your mind. Doubt, despair, and chaos seep in, making it harder to preserve what remains.
            </p>
            <p style="margin-bottom: 15px;">
                After your first Ascension, you learn to defend your mind. <strong style="color: var(--success, #00d4aa);">Meditation</strong> is your mental fortress—a space where you use preserved materials to build towers of focus. These towers defend your <strong style="color: var(--success, #00d4aa);">Tranquility</strong> against waves of Distractions.
            </p>
            
            <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Ascension - The Elemental Choice</h3>
            <p style="margin-bottom: 15px;">
                This plane is too far gone. You've learned all you can here. As you prepare to Ascend to other realms where magic still exists, you must choose how you'll approach preservation in the next realm. Each element offers a different strategy for fighting the fading:
            </p>
            <ul style="margin-left: 20px; margin-bottom: 15px; list-style: none;">
                <li style="margin-bottom: 10px;"><strong style="color: var(--primary, #FF2DAA);">🔥 Fire Path:</strong> Preserve through intensity. Build aggressive preservation structures that burn bright and fast.</li>
                <li style="margin-bottom: 10px;"><strong style="color: var(--secondary, #22E3FF);">💧 Water Path:</strong> Preserve through efficiency. Build balanced structures that flow smoothly.</li>
                <li style="margin-bottom: 10px;"><strong style="color: var(--accent, #FFDB6E);">💨 Air Path:</strong> Preserve through speed. Unlock preservation techniques faster—time is running out.</li>
                <li style="margin-bottom: 10px;"><strong style="color: var(--success, #3CE3C5);">💎 Crystal Path:</strong> Preserve through stability. Build universal foundations that support all elements.</li>
            </ul>
            <p style="margin-bottom: 15px;">
                You carry your chosen preservation technique forward. Each realm teaches you more, but the fading follows you—you must work faster, build better, preserve more.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button class="btn-primary" onclick="closeFullStory()" style="
                padding: 15px 40px;
                font-size: 18px;
                background: var(--accent, #6c5ce7);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
            ">Close</button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * Close full story modal
 */
window.closeFullStory = function() {
    const modal = document.querySelector('.full-story-modal');
    if (modal) modal.remove();
};

window.showPrestigeModal = () => {
    if (!gameState || !prestigeModal) return;
    document.getElementById('prestige-ek').textContent = gameState.prestigePoints;
    document.getElementById('prestige-gain').textContent = gameState.calculatePrestigeGain();
    document.getElementById('ascend-button').disabled = gameState.calculatePrestigeGain() <= 0;
    prestigeModal.classList.add('active');
    // Force show when active
    prestigeModal.style.display = 'flex';
    prestigeModal.style.pointerEvents = 'auto';
    prestigeModal.style.visibility = 'visible';
    prestigeModal.style.opacity = '1';
};

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
                            if (window.showNotification) {
                                window.showNotification('App update available! Refresh to update.', 'info');
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
    
    // PWA Installation Prompt - Enhanced experience
    let deferredPrompt = null;
    let installPromptShown = false;
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
    
    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button in HUD
        if (installButton) {
            installButton.style.display = 'inline-flex';
            installButton.style.visibility = 'visible';
        }
        
        // Show welcome/install modal for first-time users
        if (!installPromptShown && !localStorage.getItem('installPromptShown')) {
            showInstallWelcomeModal();
            installPromptShown = true;
            localStorage.setItem('installPromptShown', 'true');
        } else if (window.showNotification) {
            window.showNotification('📱 Install Cyber Witches for offline play!', 'info', 5000);
        }
    });
    
    // Make deferredPrompt accessible to modal functions
    window.getDeferredPrompt = () => deferredPrompt;
    
    // Install button click handler
    if (installButton) {
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                try {
                    // Show install prompt
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        console.log('User accepted install prompt');
                        if (window.showNotification) {
                            window.showNotification('<span class="css-icon-celebration"></span> Installing Cyber Witches...', 'success');
                        }
                        // Hide install button
                        if (installButton) {
                            installButton.style.display = 'none';
                        }
                    } else {
                        console.log('User dismissed install prompt');
                    }
                    
                    deferredPrompt = null;
                } catch (error) {
                    console.error('Error showing install prompt:', error);
                    // Fallback: show manual installation instructions
                    showInstallInstructions();
                }
            } else {
                // No prompt available, show manual instructions
                showInstallInstructions();
            }
        });
    }
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('App installed successfully');
        if (installButton) {
            installButton.style.display = 'none';
        }
        deferredPrompt = null;
        
        if (window.showNotification) {
            window.showNotification('<span class="css-icon-celebration"></span> Cyber Witches is now installed! Play offline anytime!', 'success', 5000);
        }
        
        // Close any install modals
        const installModal = document.getElementById('install-welcome-modal');
        if (installModal) {
            installModal.remove();
        }
    });
    
    /**
     * Show welcome/install modal for first-time users
     */
    function showInstallWelcomeModal() {
        const modal = document.createElement('div');
        modal.id = 'install-welcome-modal';
        modal.className = 'install-modal';
        modal.innerHTML = `
            <div class="install-modal-content">
                <div class="install-modal-header">
                    <h2>${stripEmojisIfLowTier('✨ Welcome to Cyber Witches!')}</h2>
                    <button class="install-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="install-modal-body">
                    <p><strong>Install the app for the best experience:</strong></p>
                    <ul class="install-benefits">
                        <li>${stripEmojisIfLowTier('📱 Play offline - No internet required')}</li>
                        <li>${stripEmojisIfLowTier('💾 Auto-save - Your progress is always safe')}</li>
                        <li>${stripEmojisIfLowTier('🚀 Faster startup - Launch like a desktop app')}</li>
                        <li>${stripEmojisIfLowTier('🎮 Full screen - Immersive gameplay')}</li>
                    </ul>
                    <div class="install-modal-actions">
                        <button id="install-welcome-button" class="btn-primary btn-install-large">
                            <span class="install-icon">${stripEmojisIfLowTier('📱')}</span> Install Now
                        </button>
                        <button class="btn-secondary install-modal-skip">Maybe Later</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close button
        const closeBtn = modal.querySelector('.install-modal-close');
        const skipBtn = modal.querySelector('.install-modal-skip');
        const installBtn = modal.querySelector('#install-welcome-button');
        
        closeBtn.addEventListener('click', () => modal.remove());
        skipBtn.addEventListener('click', () => modal.remove());
        
        // Install button
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                const prompt = window.getDeferredPrompt ? window.getDeferredPrompt() : deferredPrompt;
                if (prompt) {
                    try {
                        prompt.prompt();
                        const { outcome } = await prompt.userChoice;
                        if (outcome === 'accepted') {
                            modal.remove();
                        }
                    } catch (error) {
                        console.error('Error showing install prompt:', error);
                        showInstallInstructions();
                        modal.remove();
                    }
                } else {
                    // No prompt available, show instructions
                    showInstallInstructions();
                    modal.remove();
                }
            });
        }
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * Show manual installation instructions based on platform
     */
    function showInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
        const isEdge = /Edge/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        
        let instructions = '';
        
        if (isIOS) {
            instructions = `
                <h3>${stripEmojisIfLowTier('📱 Install on iOS (Safari)')}</h3>
                <ol>
                    <li>Tap the <strong>Share</strong> button ${stripEmojisIfLowTier('<span style="font-size: 20px;">📤</span>')} at the bottom</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> to confirm</li>
                    <li>Launch from your home screen!</li>
                </ol>
            `;
        } else if (isAndroid) {
            instructions = `
                <h3>${stripEmojisIfLowTier('📱 Install on Android')}</h3>
                <ol>
                    <li>Tap the <strong>Menu</strong> button ${stripEmojisIfLowTier('<span style="font-size: 20px;">⋮</span>')} (three dots)</li>
                    <li>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>Tap <strong>"Install"</strong> to confirm</li>
                    <li>Launch from your home screen!</li>
                </ol>
            `;
        } else if (isChrome || isEdge) {
            instructions = `
                <h3>${stripEmojisIfLowTier('💻 Install on Desktop (Chrome/Edge)')}</h3>
                <ol>
                    <li>Look for the <strong>Install</strong> icon ${stripEmojisIfLowTier('<span style="font-size: 20px;">➕</span>')} in the address bar</li>
                    <li>Click it and select <strong>"Install"</strong></li>
                    <li>Or use the <strong>"Install"</strong> button in the top bar</li>
                    <li>Launch from your desktop or app menu!</li>
                </ol>
            `;
        } else {
            instructions = `
                <h3>${stripEmojisIfLowTier('📱 Install Instructions')}</h3>
                <p>Look for an <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong> option in your browser menu.</p>
                <p>On desktop: Check the address bar for an install icon.</p>
                <p>On mobile: Use the browser's share menu to add to home screen.</p>
            `;
        }
        
        const modal = document.createElement('div');
        modal.className = 'install-modal';
        modal.innerHTML = `
            <div class="install-modal-content">
                <div class="install-modal-header">
                    <h2>${stripEmojisIfLowTier('📱 How to Install')}</h2>
                    <button class="install-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="install-modal-body">
                    ${instructions}
                    <div class="install-modal-actions">
                        <button class="btn-primary install-modal-close">Got it!</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.install-modal-close');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
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
                console.log('Ascend button clicked');
                if (typeof window.showPrestigeModal === 'function') {
                    window.showPrestigeModal();
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
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Handle Escape key for closing modals
        if (e.key === 'Escape') {
            // Close prestige modal
            if (prestigeModal && prestigeModal.style.display !== 'none') {
                prestigeModal.style.display = 'none';
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Modal closed', 'polite');
                }
                e.preventDefault();
                return;
            }
            // Close welcome back modal
            if (welcomeBackModal && welcomeBackModal.style.display !== 'none') {
                welcomeBackModal.style.display = 'none';
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Modal closed', 'polite');
                }
                e.preventDefault();
                return;
            }
            // Close any other visible modals
            const visibleModals = document.querySelectorAll('.modal[style*="display: block"], .modal[style*="display: flex"]');
            if (visibleModals.length > 0) {
                visibleModals.forEach(modal => {
                    modal.style.display = 'none';
                });
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Modal closed', 'polite');
                }
                e.preventDefault();
                return;
            }
        }

        // Prevent default for our shortcuts
        if (keyboardShortcuts[e.key]) {
            e.preventDefault();
            keyboardShortcuts[e.key]();
        }
    });
    
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
                hasListeners: castBtn.onclick !== null,
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
                hasListeners: btn.onclick !== null,
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
    
    // Cleanup background sparkles
    if (typeof window._backgroundSparklesCleanup === 'function') {
        window._backgroundSparklesCleanup();
        delete window._backgroundSparklesCleanup;
    }
    
    // Cleanup meditation state tick loop
    if (meditationState && typeof meditationState.stopTickLoop === 'function') {
        meditationState.stopTickLoop();
    }
    
    // Cleanup memory leak prevention manager
    if (memoryLeakPreventionManager && typeof memoryLeakPreventionManager.cleanup === 'function') {
        memoryLeakPreventionManager.cleanup();
    }
    
    // Save game state before cleanup
    if (gameState) {
        try {
            gameState.saveGameState();
        } catch (error) {
            console.error('Error saving game state during cleanup:', error);
        }
    }
    
    // Save meditation state before cleanup
    if (meditationState && typeof meditationState.saveState === 'function') {
        try {
            meditationState.saveState();
        } catch (error) {
            console.error('Error saving meditation state during cleanup:', error);
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
    getTierSymbol,
    getTierAppropriateStyle,
    getWorkstationTier,
    getUpgradeTier,
    getIngredientElement,
    calculateElementTotals,
    getScaledRecipe
};