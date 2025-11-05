import { GameState } from './gameState.js';
import { DailyRituals } from './dailyRituals.js';
import { AchievementSystem } from './achievements.js';
import { ComboSystem } from './comboSystem.js';
import { EventSystem } from './eventSystem.js';
import { MeditationState } from './meditationState.js';
import { MeditationUI } from './meditationUI.js';
import { MeditationTowers } from './meditationTowers.js';
import { DesignTierSystem } from './designTierSystem.js';
import { INGREDIENTS, PRODUCERS, UPGRADES, PRESTIGE_BONUSES, HIDDEN_RECIPES } from './data.js';
import { formatShort, formatPrecise, formatTimeDuration } from './utils.js';
import { createParticle, pulseElement, highlightElement, slideIn, animateNumber, shakeElement } from './animations.js';
import { particleEffects } from './particleEffects.js';
import { VirtualWorkstationList, VirtualUpgradeList, VirtualAchievementList } from './virtualScroll.js';
import { handleError, safeFunction, safeAsyncFunction, validateParams, retryWithBackoff } from './errorHandler.js';
import { debounce, throttle, deepClone, formatWithCommas, clamp, lerp, inRange, randomInt, randomFloat, randomChoice, shuffle, isEmpty, capitalize, secondsToTime, calculatePercentage, isMobile, isTouchDevice, getPixelRatio, createElement, batchDOMUpdate, setLocalStorage, getLocalStorage, removeLocalStorage, clearLocalStorage, isInViewport, scrollIntoView, addEventListener, PerformanceMonitor } from './commonUtils.js';

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

// Keyboard shortcuts
const keyboardShortcuts = {
    '1': () => switchTab('workstations'),
    '2': () => switchTab('inscriptions'),
    '3': () => switchTab('inventory'),
    '4': () => switchTab('experiment'),
    '5': () => switchTab('dailies'),
    '6': () => switchTab('coven'),
    '7': () => switchTab('boons'),
    '8': () => switchTab('meditation'),
    '9': () => switchTab('stats'),
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
            
            // Show notification
            if (gained > 0) {
                const displayName = PRODUCERS.find(p => p.id === wsId)?.displayName || wsId;
                if (typeof showNotification === 'function') {
                    showNotification(`<span class="css-icon-sparkle"></span> Crafted ${gained} ${displayName}!`, 'success');
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
        
        // Refresh virtual scroll if it exists, otherwise update tab
        if (virtualWorkstationList && typeof virtualWorkstationList.refresh === 'function') {
            console.log('Refreshing virtual scroll...');
            virtualWorkstationList.refresh();
        } else if (typeof updateWorkstationsTab === 'function') {
            updateWorkstationsTab();
        }
    };
    
    window.craftWorkstationMax = (wsId) => {
        if (!gameState) return;
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
            gameState.craftWorkstation(wsId, maxCount);
            // Refresh virtual scroll if it exists, otherwise update tab
            if (virtualWorkstationList && typeof virtualWorkstationList.refresh === 'function') {
                console.log('Refreshing virtual scroll after max craft...');
                virtualWorkstationList.refresh();
            } else if (typeof updateWorkstationsTab === 'function') {
                updateWorkstationsTab();
            }
        }
    };
    
    window.inscribeUpgrade = (upgId, buttonElement = null) => {
        if (!gameState) return;
        
        const success = gameState.inscribeUpgrade(upgId);
        
        if (success) {
            const upgrade = UPGRADES.find(u => u.id === upgId);
            const displayName = upgrade?.displayName || upgId;
            if (typeof showNotification === 'function') {
                showNotification(`<span class="css-icon-sparkle"></span> Inscribed ${displayName}!`, 'success');
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
        }
        
        if (typeof updateInscriptionsTab === 'function') {
            updateInscriptionsTab();
        }
    };
    
    window.craftRecipe = (recipeId) => {
        if (!gameState) return;
        if (gameState.craftDiscoveredRecipe(recipeId)) {
            // Track potion crafting for daily tasks
            if (typeof updateDailyProgress === 'function' && gameState) {
                updateDailyProgress('craft_potion', '', gameState.totalPotionsCrafted);
            }
            
            if (typeof showNotification === 'function') {
                showNotification('<span class="css-icon-sparkle"></span> Recipe crafted!', 'success');
            }
            if (typeof updateExperimentTab === 'function') updateExperimentTab();
            if (typeof updateInventoryTab === 'function') updateInventoryTab();
            
            // Check for newly unlocked achievements
            if (achievements && typeof achievements.checkAchievements === 'function') {
                const newAchievements = achievements.checkAchievements();
                for (const achievement of newAchievements) {
                    if (typeof showNotification === 'function') {
                        showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
                    }
                    
                    // Announce to screen reader
                    if (window.Accessibility && typeof window.Accessibility.announceGameEvent === 'function') {
                        window.Accessibility.announceGameEvent('achievement_unlocked', {
                            name: achievement.name
                        });
                    }
                }
            }
        }
    };
    
    window.claimTask = (taskId) => {
        if (!dailyRituals) return;
        if (dailyRituals.claimTask(taskId)) {
            if (typeof updateDailiesTab === 'function') {
                updateDailiesTab();
            }
        }
    };
    
    window.purchaseBoon = (bonusId) => {
        if (!gameState) return;
        if (gameState.purchasePrestigeBonus(bonusId)) {
            if (typeof updateBoonsTab === 'function') {
                updateBoonsTab();
            }
        }
    };
    
    // Coven-related global functions
    window.createCoven = () => {
        if (!gameState || !gameState.covenSystem) return;
        
        const nameInput = document.getElementById('coven-name-input');
        const descInput = document.getElementById('coven-desc-input');
        
        if (!nameInput || !descInput) return;
        
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        
        if (gameState.covenSystem.createCoven(name, description)) {
            nameInput.value = '';
            descInput.value = '';
            if (typeof updateCovenTab === 'function') updateCovenTab();
            if (typeof showNotification === 'function') {
                showNotification(`🔮 Created coven: ${name}!`, 'success');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Failed to create coven', 'error');
            }
        }
    };
    
    window.joinCoven = () => {
        if (!gameState || !gameState.covenSystem) return;
        
        const codeInput = document.getElementById('coven-code-input');
        if (!codeInput) return;
        
        const covenCode = codeInput.value.trim();
        
        if (!covenCode) {
            if (typeof showNotification === 'function') {
                showNotification('Please enter a coven code', 'error');
            }
            return;
        }
        
        if (gameState.covenSystem.joinCoven(covenCode)) {
            codeInput.value = '';
            if (typeof updateCovenTab === 'function') updateCovenTab();
            if (typeof showNotification === 'function') {
                showNotification('🔮 Joined coven!', 'success');
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Failed to join coven', 'error');
            }
        }
    };
    
    window.leaveCoven = () => {
        if (!gameState || !gameState.covenSystem) return;
        
        // Confirm before leaving coven
        if (confirm('Are you sure you want to leave your coven?')) {
            if (gameState.covenSystem.leaveCoven()) {
                if (typeof updateCovenTab === 'function') updateCovenTab();
                if (typeof showNotification === 'function') {
                    showNotification('Left coven', 'info');
                }
            } else {
                // Handle error case when leaveCoven() returns false
                if (typeof showNotification === 'function') {
                    showNotification('Failed to leave coven', 'error');
                }
            }
        }
    };
    
    window.toggleCovenSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const isVisible = section.style.display !== 'none';
            section.style.display = isVisible ? 'none' : 'block';
        }
    };
    
    console.log('Global functions defined and attached to window');
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
    
    // Initialize game state
    gameState = new GameState();
    dailyRituals = new DailyRituals(gameState);
    achievements = new AchievementSystem(gameState);
    comboSystem = new ComboSystem();
    eventSystem = new EventSystem(gameState);
    
    // Initialize design tier system (Feature 2: Progressive Design Revelation)
    designTierSystem = new DesignTierSystem(gameState);
    designTierSystem.applyTier(designTierSystem.getCurrentTier());
    window.designTierSystem = designTierSystem; // Make globally accessible
    window.achievements = achievements; // Make achievements accessible for design tier system
    window.particleEffects = particleEffects; // Make particle effects accessible globally
    
    // Initialize particle system if canvas exists
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
        particleEffects.initialize(particleCanvas);
        // Hide by default - will be enabled when tier 3+ is unlocked
        if (designTierSystem.getCurrentTier() < 3) {
            particleCanvas.style.display = 'none';
            particleEffects.disable();
        }
    }
    
    // Check for tier unlocks periodically
    setInterval(() => {
        if (designTierSystem && gameState) {
            designTierSystem.checkTierUnlocks();
        }
    }, 5000); // Check every 5 seconds
    
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
                const tabName = button.dataset.tab;
                switchTab(tabName);
            });
        });
    }
    
    // Settings tab event handlers
    const tierSelector = document.getElementById('tier-selector');
    if (tierSelector && designTierSystem) {
        tierSelector.addEventListener('change', (e) => {
            const selectedTier = parseInt(e.target.value, 10);
            const unlockedTiers = designTierSystem.getUnlockedTiers();
            if (unlockedTiers.includes(selectedTier)) {
                designTierSystem.setTier(selectedTier);
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
                    
                    // Particles (deferred to not block)
                    requestAnimationFrame(() => {
                        const rect = castButton.getBoundingClientRect();
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;
                        
                        // Create particles (limit to prevent spam)
                        if (gameState.totalTaps % 5 === 0 || Math.random() > 0.7) {
                            if (typeof createParticle === 'function') {
                                createParticle(x, y - 30, '+1', '#22E3FF');
                            }
                        }
                        
                        // Show AB gain if any
                        if (gameState.ab > oldAb && (gameState.ab - oldAb) > 0.05) {
                            if (typeof createParticle === 'function') {
                                createParticle(x, y - 60, `+${formatShort(gameState.ab - oldAb)} AB`, '#FFDB6E');
                            }
                            
                            // Announce to screen reader
                            if (window.Accessibility) {
                                window.Accessibility.announceGameEvent('cast', {
                                    amount: gameState.ab - oldAb
                                });
                            }
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
    
    // Auto-cast toggle
    const autoCastToggle = document.getElementById('auto-cast-toggle');
    let autoCastEnabled = false;
    let autoCastInterval = null;
    
    if (autoCastToggle) {
        autoCastToggle.addEventListener('click', () => {
            autoCastEnabled = !autoCastEnabled;
            autoCastToggle.textContent = `Auto: ${autoCastEnabled ? 'ON' : 'OFF'}`;
            autoCastToggle.style.background = autoCastEnabled ? 'var(--success)' : 'transparent';
            
            if (autoCastEnabled) {
                // Auto-cast every 500ms
                autoCastInterval = setInterval(() => {
                    if (gameState && castButton) {
                        const handler = castButton.onclick;
                        if (handler) handler();
                    }
                }, 500);
            } else {
                if (autoCastInterval) {
                    clearInterval(autoCastInterval);
                    autoCastInterval = null;
                }
            }
        });
    }
    
    // Prestige modal
    const ascendButton = document.getElementById('ascend-button');
    if (ascendButton) {
        ascendButton.addEventListener('click', () => {
            if (gameState) {
                const oldPrestigeCount = gameState.prestigeCount;
                gameState.ascend();
                if (prestigeModal) prestigeModal.classList.remove('active');
                
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
                
                updateAllUI();
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
    
    // Game state callbacks with optimized updates
    let previousAb = gameState ? gameState.ab : 0;
    
    gameState.onAbChanged = (newValue) => {
        if (!abDisplay) return;
        
        // Track AB earning for daily tasks (use total earned, not current balance)
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
    updateIntervals.push(setInterval(() => {
        if (abpsDisplay && gameState) {
            // Get event multiplier for display
            let eventMult = 1.0;
            if (eventSystem) {
                eventMult = eventSystem.getProductionMultiplier();
            }
            const abps = gameState.getAbPerSecond(eventMult);
            
            if (abps !== previousAbps) {
                // Animate number change
                animateNumber(abpsDisplay, previousAbps, abps, 500);
                
                // Add glow effect if AB/s increased
                if (abps > previousAbps && abps > 0) {
                    abpsDisplay.style.textShadow = '0 0 10px rgba(34, 227, 255, 0.8)';
                    setTimeout(() => {
                        abpsDisplay.style.textShadow = '';
                    }, 500);
                }
                
                previousAbps = abps;
            }
        }
    }, 1000));
    
    // Check for achievements periodically (optimized)
    updateIntervals.push(setInterval(() => {
        if (achievements) {
            const newAchievements = achievements.checkAchievements();
            for (const achievement of newAchievements) {
                showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
                
                // Announce to screen reader
                if (window.Accessibility) {
                    window.Accessibility.announceGameEvent('achievement_unlocked', {
                        name: achievement.name
                    });
                }
            }
        }
    }, 1000));
    
    // Check for random events (optimized)
    updateIntervals.push(setInterval(() => {
        if (eventSystem) {
            eventSystem.checkForEvents();
            eventSystem.updateEvents(0.1);
            updateActiveEvents();
        }
    }, 1000));
    
    // Update combo display (optimized) - reduced frequency to prevent flickering
    updateIntervals.push(setInterval(() => {
        updateComboDisplay();
    }, 500));
    
    // Modify game tick to include event multipliers
    const originalTick = gameState.tick;
    gameState.tick = function() {
        let eventMult = 1.0;
        if (eventSystem) {
            eventMult = eventSystem.getProductionMultiplier();
        }
        originalTick.call(this, eventMult);
    };
    
    // Make showNotification globally available for event system
    window.showNotification = showNotification;
    
    // Make game state available for mobile and accessibility features
    window.gameState = gameState;
    window.castButton = castButton;
    
    // Make data available globally for virtual scroll
    window.UPGRADES = UPGRADES;
    window.INGREDIENTS = INGREDIENTS;
    
    // Initial AB display
    if (abDisplay && gameState) {
        abDisplay.textContent = `AB: ${formatShort(gameState.ab)}`;
        previousAb = gameState.ab;
    }
    
    // Mark as initialized
    uiInitialized = true;
    
    // Set up event delegation for buttons created dynamically with onclick attributes
    // This ensures buttons work even if native onclick handlers fail
    // Use capture phase to catch events before they might be stopped
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;
        
        // Check if button has onclick attribute
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
    if (!tabButtons || !tabPanes) {
        console.error('Tab buttons or panes not found!', { tabButtons: !!tabButtons, tabPanes: !!tabPanes });
        return;
    }
    
    console.log('Found', tabButtons.length, 'tab buttons and', tabPanes.length, 'tab panes');
    
    // Update buttons
    tabButtons.forEach(btn => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
    });
    
    // Update panes
    tabPanes.forEach(pane => {
        const isActive = pane.id === `${tabName}-tab`;
        pane.classList.toggle('active', isActive);
        
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
    
    // Update tab content
    switch(tabName) {
        case 'workstations':
            console.log('Updating workstations tab content...');
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
        case 'coven':
            console.log('Updating coven tab content...');
            updateCovenTab();
            // Force container visibility after update
            setTimeout(() => {
                const container = document.getElementById('coven-content');
                if (container) {
                    container.style.cssText = 'display: flex !important; flex-direction: column !important; gap: 15px !important; max-height: 70vh !important; overflow-y: auto !important; padding: 10px !important; position: relative !important; z-index: 10 !important; pointer-events: auto !important; visibility: visible !important; opacity: 1 !important; width: 100% !important;';
                    console.log('Coven content container forced visible, children:', container.children.length);
                }
            }, 100);
            break;
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
            if (meditationUI) {
                meditationUI.updateAll();
            }
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
    
    // Filter unlocked workstations
    const unlockedWorkstations = PRODUCERS.filter(prod => gameState.ab >= prod.unlockAtAb);
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
 * @param {number} tier - Tier number (0-4)
 * @returns {Object} Tier symbol and style information
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
        }
    };
    return tierStyles[tier] || tierStyles[0];
}

/**
 * Get tier for a workstation based on its position in PRODUCERS array
 * Tier 0: indices 0-3, Tier 1: 4-7, Tier 2: 8-12, Tier 3: 13-17, Tier 4: 18-21
 */
function getWorkstationTier(prodData) {
    const index = PRODUCERS.findIndex(p => p.id === prodData.id);
    if (index <= 3) return 0;
    if (index <= 7) return 1;
    if (index <= 12) return 2;
    if (index <= 17) return 3;
    return 4;
}

/**
 * Get tier for an upgrade based on the highest tier ingredient in its recipe
 * @param {Object} upgData - Upgrade data
 * @returns {number} - Tier (0-4)
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
    container.innerHTML = '';
    
    if (unlockedWorkstations.length === 0) {
            console.log('No workstations unlocked yet. First workstation requires:', PRODUCERS[0]?.unlockAtAb || 'unknown', 'AB');
            const message = document.createElement('div');
            message.className = 'card';
            message.style.cssText = 'position: relative; z-index: 10; pointer-events: auto; visibility: visible; display: block;';
            message.innerHTML = `
                <div class="card-title">No Workstations Unlocked</div>
                <div class="card-description">Cast spells to earn Arcane Bits and unlock your first workstation!</div>
                <div class="card-section">
                    <div class="card-label">First workstation requires: ${PRODUCERS[0]?.unlockAtAb || 0} AB</div>
                    <div class="card-label">Current AB: ${formatShort(gameState.ab)}</div>
                </div>
                <div class="button-row">
                    <button class="btn-primary" style="position: relative; z-index: 11; pointer-events: auto;" onclick="console.log('Cast button clicked from message'); if (typeof window.castButton !== 'undefined' && window.castButton) window.castButton.click();"><span class="css-icon-sparkle"></span> Cast to Earn AB</button>
                </div>
            `;
            container.appendChild(message);
            console.log('Added message card to container, container children:', container.children.length);
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
        const tierNames = ['Tier 0', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
        for (let tier = 0; tier <= 4; tier++) {
            if (!workstationsByTier[tier] || workstationsByTier[tier].length === 0) continue;
            
            // Add tier header with tier symbol
            const tierSymbol = getTierSymbol(tier);
            const tierHeader = document.createElement('div');
            tierHeader.className = 'tier-header';
            tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierSymbol.color}; text-shadow: 0 0 10px ${tierSymbol.glow}; margin-right: 8px; font-size: 20px;">${tierSymbol.symbol}</span>${tierNames[tier]} Workstations`;
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
            card.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
            
            // Build inscription bonus display (compact 2-column layout)
            let inscriptionBonusHTML = '';
            if (Object.keys(inscriptionBonusRates).length > 0) {
                const bonusEntries = Object.entries(inscriptionBonusRates);
                inscriptionBonusHTML = `
                    <div class="card-label" style="color: var(--success); font-size: 12px; margin-bottom: 6px;"><span class="css-icon-scroll"></span> Inscription Bonuses:</div>
                    <div class="inscription-bonuses">
                        ${bonusEntries.map(([outputId, bonusRate]) => {
                            const ingredient = INGREDIENTS.find(ing => ing.id === outputId);
                            const displayName = ingredient?.displayName || outputId;
                            return `<div class="inscription-bonus-item">
                                +${formatShort(bonusRate)}/s ${displayName}
                            </div>`;
                        }).join('')}
                    </div>
                    ${inscriptionData.inscriptions.length > 0 ? `
                        <div class="inscription-list">
                            ${inscriptionData.inscriptions.map(ins => `• ${ins.name} (×${ins.multiplier.toFixed(2)})`).join('<br>')}
                        </div>
                    ` : ''}
                `;
            }
            
            card.innerHTML = `
                <div class="card-title">${prodData.displayName}</div>
                <div class="card-description">⚙️ Owned: ${owned}</div>
                <div class="card-content-left">
                    <div class="card-section">
                        <div class="card-label">Produces:</div>
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
                        <div class="card-label">Recipe for next:</div>
                        ${Object.entries(recipe).map(([ingId, amount]) => {
                            const have = gameState.inventory[ingId] || 0;
                            const canAfford = have >= amount;
                            const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                            const displayName = ingredient?.displayName || ingId;
                            return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                                ${displayName}: ${formatShort(have)} / ${formatShort(amount)}
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
            
                // Attach event listeners directly
                const buttons = card.querySelectorAll('button[data-action]');
                buttons.forEach(btn => {
                    // Ensure button is clickable
                    btn.style.position = 'relative';
                    btn.style.zIndex = '100';
                    btn.style.pointerEvents = 'auto';
                    btn.style.cursor = 'pointer';
                    btn.style.visibility = 'visible';
                    btn.style.display = 'inline-block';
                    
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const action = btn.dataset.action;
                        const wsId = btn.dataset.wsId;
                        
                        console.log('Button clicked:', { action, wsId, button: btn });
                        
                        if (action === 'craft' && typeof window.craftWorkstation === 'function') {
                            const amount = parseInt(btn.dataset.amount, 10) || 1;
                            console.log('Traditional rendering button clicked:', { action, wsId, amount });
                            window.craftWorkstation(wsId, amount, btn);
                        } else if (action === 'craft-max' && typeof window.craftWorkstationMax === 'function') {
                            console.log('Traditional rendering max button clicked:', { wsId });
                            window.craftWorkstationMax(wsId);
                        } else {
                            console.error('Button action handler not found:', { action, wsId });
                        }
                    });
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
    const unlockedUpgrades = UPGRADES.filter(upg => gameState.ab >= upg.unlockAtAb);
    
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
    for (let tier = 0; tier <= 4; tier++) {
        if (!upgradesByTier[tier] || upgradesByTier[tier].length === 0) {
            continue;
        }
        
        // Add tier header with tier symbol
        const tierSymbol = getTierSymbol(tier);
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierSymbol.color}; text-shadow: 0 0 10px ${tierSymbol.glow}; margin-right: 8px; font-size: 20px;">${tierSymbol.symbol}</span>Tier ${tier} Inscriptions`;
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
            
            card.innerHTML = `
                <div class="card-title">${upgData.displayName} ${owned ? '✓' : ''}</div>
                <div class="card-description">${upgData.description}</div>
                <div class="card-section">
                    <div class="card-label">Effect: ${effectText}</div>
                </div>
                <div class="card-section">
                    <div class="card-label">Recipe:</div>
                    ${Object.entries(upgData.recipe).map(([ingId, amount]) => {
                        const have = gameState.inventory[ingId] || 0;
                        const canAfford = have >= amount;
                        const ingredient = INGREDIENTS.find(ing => ing.id === ingId);
                        const displayName = ingredient?.displayName || ingId;
                        return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                            ${displayName}: ${formatShort(have)} / ${formatShort(amount)}
                        </div>`;
                    }).join('')}
                </div>
                <button class="btn-primary" data-action="inscribe" data-upgrade-id="${upgData.id}" ${owned ? 'disabled' : ''}>
                    ${owned ? 'Owned' : 'Inscribe'}
                </button>
            `;
            
            // Attach event listener directly
            const button = card.querySelector('button[data-action="inscribe"]');
            if (button) {
                // Ensure button is clickable
                button.style.position = 'relative';
                button.style.zIndex = '100';
                button.style.pointerEvents = owned ? 'none' : 'auto';
                button.style.cursor = owned ? 'not-allowed' : 'pointer';
                button.style.visibility = 'visible';
                button.style.display = 'inline-block';
                
                if (!owned && typeof window.inscribeUpgrade === 'function') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
    
    // Ensure container is visible
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.innerHTML = '';
    
    if (!gameState.inventory || Object.keys(gameState.inventory).length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'card';
        emptyMsg.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
        emptyMsg.innerHTML = '<div class="card-title">Inventory</div><div class="card-description">No ingredients yet. Cast to gather ingredients!</div>';
        container.appendChild(emptyMsg);
        return;
    }
    
    // Get all items and sort by tier and amount
    const items = [];
    let maxAmount = 0;
    
    for (const ingId in gameState.inventory) {
        const amount = gameState.inventory[ingId];
        if (amount <= 0) continue;
        
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
    
    // Create header card
    const headerCard = document.createElement('div');
    headerCard.className = 'card inventory-header';
    headerCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
    headerCard.innerHTML = `
        <div class="card-title" style="font-size: 24px; background: linear-gradient(90deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 28px; filter: drop-shadow(0 0 8px var(--primary));">◈</span> Inventory
        </div>
        <div class="card-description" style="font-size: 14px;">Total Items: ${items.length} • Total Value: ${formatShort(items.reduce((sum, item) => sum + item.amount, 0))}</div>
    `;
    fragment.appendChild(headerCard);
    
    // Create items grouped by tier with enhanced visuals
    for (let tier = 0; tier <= 4; tier++) {
        if (!itemsByTier[tier] || itemsByTier[tier].length === 0) {
            continue;
        }
        
        // Add tier header with tier symbol
        const tierSymbol = getTierSymbol(tier);
        const tierHeader = document.createElement('div');
        tierHeader.className = 'tier-header';
        tierHeader.innerHTML = `<span class="tier-symbol tier-icon-${tier}" style="color: ${tierSymbol.color}; text-shadow: 0 0 10px ${tierSymbol.glow}; margin-right: 8px; font-size: 20px;">${tierSymbol.symbol}</span>Tier ${tier} Ingredients`;
        fragment.appendChild(tierHeader);
        
        // Use centralized tier style
        const tierStyle = tierSymbol;
        tierStyle.symbol = tierSymbol.symbol; // Ensure symbol is available
        
        // Create items for this tier
        for (const item of itemsByTier[tier]) {
            const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const cardId = `inventory-item-${item.id}`;
            
            const card = document.createElement('div');
            card.className = 'card inventory-item';
            card.setAttribute('data-tier', tier);
            card.setAttribute('data-item-id', item.id);
            card.style.cssText = `
                position: relative; 
                z-index: 1; 
                pointer-events: auto; 
                visibility: visible; 
                display: block;
                border: 2px solid ${tierStyle.borderGlow};
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
                box-shadow: 
                    0 4px 20px rgba(0, 0, 0, 0.4),
                    0 0 20px ${tierStyle.glow},
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            `;
            
            // Add shimmer overlay
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
            
            // Add pulsing glow for high tiers (using dark background to maintain consistency)
            if (tier >= 3) {
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
            contentDiv.style.cssText = 'position: relative; z-index: 2; padding: 20px;';
            contentDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="inventory-icon tier-icon-${tier}" style="font-size: 32px; color: ${tierStyle.color}; text-shadow: 0 0 10px ${tierStyle.color}, 0 0 20px ${tierStyle.glow}; animation: iconFloat ${2 + tier * 0.5}s ease-in-out infinite; display: inline-block; line-height: 1;">${tierStyle.symbol}</span>
                        <div>
                            <div class="card-label" style="font-size: 18px; font-weight: 700; color: ${tierStyle.color}; text-shadow: 0 0 10px ${tierStyle.glow}; font-family: 'Orbitron', sans-serif;">${item.displayName}</div>
                            <div class="card-description" style="font-size: 12px; color: var(--text-dim); margin-top: 2px;">Tier ${tier} • ${item.id}</div>
                        </div>
                    </div>
                    <div class="inventory-amount" style="font-size: 22px; font-weight: 700; color: ${tierStyle.color}; text-shadow: 0 0 15px ${tierStyle.glow}; font-family: 'Orbitron', monospace; min-width: 80px; text-align: right;">
                        ${formatShort(item.amount)}
                    </div>
                </div>
                <div class="progress-bar-container" style="width: 100%; height: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 8px; overflow: hidden; position: relative; margin-top: 8px; box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);">
                    <div class="progress-bar-fill inventory-progress" style="height: 100%; width: ${percentage}%; background: ${tierStyle.gradient}; border-radius: 8px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 15px ${tierStyle.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); animation: shimmer 2s infinite;"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: var(--text-dim);">
                    <span>${percentage.toFixed(1)}% of max</span>
                    <span style="opacity: 0.6;">${formatShort(item.amount)} total</span>
                </div>
            `;
            
            card.appendChild(contentDiv);
            
            // Add hover effect listener
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
                card.style.boxShadow = `
                    0 8px 30px rgba(0, 0, 0, 0.5),
                    0 0 40px ${tierStyle.glow},
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `;
                card.style.borderColor = tierStyle.color;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = `
                    0 4px 20px rgba(0, 0, 0, 0.4),
                    0 0 20px ${tierStyle.glow},
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `;
                card.style.borderColor = tierStyle.borderGlow;
            });
            
            // Add click effect
            card.addEventListener('click', () => {
                const rect = card.getBoundingClientRect();
                createParticle(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    tierStyle.symbol,
                    tierStyle.color
                );
            });
            
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
        expButton.onclick = () => {
            try {
                const result = gameState.tryExperiment();
                const resultLabel = document.getElementById('experiment-result');
                
                if (result.success) {
                    resultLabel.innerHTML = `<span class="css-icon-sparkle"></span> Discovered: ${result.recipe.name}`;
                    resultLabel.className = 'result-label success';
                    
                    // Celebration!
                    pulseElement(expButton, 1.2, 400);
                    showNotification(`<span class="css-icon-celebration"></span> Discovered: ${result.recipe.name}!`, 'success');
                    
                    // Create confetti-like particles
                    const rect = expButton.getBoundingClientRect();
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            createParticle(
                                rect.left + Math.random() * rect.width,
                                rect.top + Math.random() * rect.height,
                                '✨',
                                ['#FF2DAA', '#22E3FF', '#FFDB6E', '#3CE3C5', '#C9A0FF'][i % 5]
                            );
                        }, i * 50);
                    }
                    
                    // Check achievements
                    if (achievements) {
                        const newAchievements = achievements.checkAchievements();
                        for (const achievement of newAchievements) {
                            showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
                        }
                    }
                } else {
                    resultLabel.textContent = result.message;
                    resultLabel.className = 'result-label error';
                    
                    // Shake on failure
                    if (expButton && typeof shakeElement === 'function') {
                        shakeElement(expButton, 3, 200);
                    }
                }
                
                updateExperimentTab();
            } catch (error) {
                console.error('Error in experiment:', error);
                showNotification('Experiment failed due to an error', 'error');
            }
        };
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
                <div class="card-label">Costs:</div>
                ${Object.entries(recipe.inputs).map(([ingId, amount]) => {
                    const have = gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        ${ingId}: ${formatShort(have)} / ${formatShort(amount)}
                    </div>`;
                }).join('')}
            </div>
            <div class="card-section">
                <div class="card-label">Produces:</div>
                ${Object.entries(recipe.outputs).map(([outputId, amount]) =>
                    `<div class="card-value">${outputId}: ${formatShort(amount)}</div>`
                ).join('')}
            </div>
            <button class="btn-primary" data-action="craft-recipe" data-recipe-id="${recipeId}">Craft</button>
        `;
        
            // Attach event listener directly
            const button = card.querySelector('button[data-action="craft-recipe"]');
            if (button && typeof window.craftRecipe === 'function') {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.craftRecipe(recipeId);
                });
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
                    rewardText = `${formatShort(task.rewardValue)} AB`;
                    break;
                case 'buff':
                    rewardText = `+${Math.floor(task.buffMultiplier * 100)}% for ${formatTimeDuration(task.rewardValue)}`;
                    break;
                case 'ek_frag':
                    rewardText = `${Math.floor(task.rewardValue)} EK Fragment(s)`;
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
                    ${claimed ? 'Claimed' : progress >= target ? 'Claim' : 'Incomplete'}
                </button>
            `;
            
                // Attach event listener directly
                const button = card.querySelector('button[data-action="claim-task"]');
                if (button && !button.disabled && typeof window.claimTask === 'function') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
                    effectText = `+${formatShort(boonData.value)} AB at start per level`;
                    break;
                case 'start_ingredient':
                    effectText = `+${formatShort(boonData.value)} ${boonData.param} at start per level`;
                    break;
                case 'ab_production_mult':
                    effectText = `+${Math.floor(boonData.value * 100)}% AB Production per level`;
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
                    <div class="card-label">Effect: ${effectText}</div>
                </div>
                <div class="card-section">
                    <div class="card-label">Cost: ${Math.floor(cost)} EK</div>
                </div>
                <button class="btn-primary" data-action="purchase-boon" data-boon-id="${boonData.id}" ${gameState.prestigePoints >= cost ? '' : 'disabled'}>
                    Purchase
                </button>
            `;
            
                // Attach event listener directly
                const button = card.querySelector('button[data-action="purchase-boon"]');
                if (button && !button.disabled && typeof window.purchaseBoon === 'function') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
        comboDisplay.innerHTML = `<span class="css-icon-fire"></span> ${comboCount}x Combo (${(mult * 100).toFixed(0)}%)`;
        comboDisplay.style.display = 'block';
    } else if (comboDisplay) {
        comboDisplay.style.display = 'none';
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
    
    // Stats section
    const statsCard = document.createElement('div');
    statsCard.className = 'card';
    statsCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
    statsCard.innerHTML = '<div class="card-title">Game Statistics</div>';
    
    const stats = [
        { label: 'Total Casts', value: gameState.totalTaps },
        { label: 'Workstations Crafted', value: gameState.totalWorkstationsCrafted },
        { label: 'Total AB Earned', value: formatShort(gameState.abTotalEarned) },
        { label: 'Current AB', value: formatShort(gameState.ab) },
        { label: 'AB Per Second', value: formatShort(gameState.getAbPerSecond()) },
        { label: 'Prestige Points', value: gameState.prestigePoints },
        { label: 'Recipes Discovered', value: gameState.discoveredRecipes.length },
        { label: 'Max Combo', value: comboSystem ? comboSystem.maxCombo : 0 },
        { label: 'Achievements', value: `${achievements.getUnlockedCount()}/${achievements.getTotalCount()}` }
    ];
    
    for (const stat of stats) {
        const item = document.createElement('div');
        item.className = 'card-section';
        item.innerHTML = `
            <div class="card-label">${stat.label}</div>
            <div class="card-value">${stat.value}</div>
        `;
        statsCard.appendChild(item);
    }
    
    container.appendChild(statsCard);
    
    // Achievements section
    const achievementsCard = document.createElement('div');
    achievementsCard.className = 'card';
    achievementsCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
    achievementsCard.innerHTML = '<div class="card-title">Achievements</div>';
    
    const achievementsList = document.createElement('div');
    achievementsList.className = 'content-list';
    achievementsList.style.cssText = 'display: flex; flex-direction: column; gap: 10px; max-height: 50vh; overflow-y: auto;';
    
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
            renderAchievementsTraditional(achievementsList, achievementsArray);
        }
    } else {
        // Traditional rendering for all lists
        renderAchievementsTraditional(achievementsList, achievementsArray);
    }
    
    // Helper function for traditional rendering
    function renderAchievementsTraditional(achievementsList, achievementsArray) {
        console.log('Using traditional rendering for', achievementsArray.length, 'achievements');
        
        // Ensure achievementsList is visible
        achievementsList.style.display = 'flex';
        achievementsList.style.flexDirection = 'column';
        achievementsList.style.gap = '10px';
        achievementsList.style.visibility = 'visible';
        achievementsList.style.opacity = '1';
        achievementsList.style.minHeight = '100px';
        
        if (!achievementsArray || achievementsArray.length === 0) {
            console.warn('No achievements to render');
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'card-section';
            emptyMsg.style.cssText = 'padding: 10px; color: var(--text-dim);';
            emptyMsg.textContent = 'No achievements available yet.';
            achievementsList.appendChild(emptyMsg);
            return;
        }
        
        achievementsArray.forEach(achievement => {
            if (!achievement) return;
            const unlocked = achievements.unlockedAchievements?.has(achievement.id) || false;
            const item = document.createElement('div');
            item.className = 'card-section';
            item.style.cssText = `padding: 10px; border-radius: 6px; background: ${unlocked ? 'rgba(60, 227, 197, 0.2)' : 'rgba(0, 0, 0, 0.3)'}; margin-bottom: 10px; position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;`;
            item.innerHTML = `
                <div class="card-label" style="color: ${unlocked ? 'var(--success)' : 'var(--text-dim)'};">
                    ${unlocked ? '✓' : '○'} ${achievement.name || 'Unknown Achievement'}
                </div>
                <div class="card-description" style="font-size: 12px;">${achievement.description || 'No description'}</div>
            `;
            achievementsList.appendChild(item);
        });
        console.log('Rendered', achievementsArray.length, 'achievements using traditional rendering');
    }
    
    achievementsCard.appendChild(achievementsList);
    container.appendChild(achievementsCard);
    
    console.log('Stats tab updated, container children:', container.children.length);
}

/**
 * Update coven tab with current coven information
 */
function updateCovenTab() {
    console.log('updateCovenTab called, gameState exists:', !!gameState, 'covenSystem exists:', !!gameState?.covenSystem);
    if (!gameState || !gameState.covenSystem) {
        console.error('Coven system not initialized');
        const container = document.getElementById('coven-content');
        if (container) {
            container.innerHTML = '<div class="card"><div class="card-title">Coven System</div><div class="card-description">Coven system not available</div></div>';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '15px';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
        }
        return;
    }
    
    const container = document.getElementById('coven-content');
    if (!container) {
        console.error('coven-content container not found!');
        return;
    }
    console.log('coven-content container found, updating content...');
    
    // Ensure container is visible
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.innerHTML = '';
    
    const covenSystem = gameState.covenSystem;
    const isInCoven = covenSystem.isInCoven();
    
    // Create coven status card
    const statusCard = document.createElement('div');
    statusCard.className = 'card';
    statusCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
    
    if (isInCoven) {
        const coven = covenSystem.getCurrentCoven();
        const bonus = covenSystem.getCovenProductionBonus();
        const expPercent = (coven.experience / coven.experienceToNext) * 100;
        
        statusCard.innerHTML = `
            <div class="card-title">${coven.name}</div>
            <div class="card-description">${coven.description}</div>
            <div class="card-section">
                <div class="card-label">Level: ${coven.level}</div>
                <div class="card-label">Members: ${coven.members.length}</div>
                <div class="card-label">Production Bonus: +${Math.floor((bonus - 1) * 100)}%</div>
                <div class="card-label">Experience: ${Math.floor(coven.experience)} / ${coven.experienceToNext} XP</div>
            </div>
        `;
    } else {
        statusCard.innerHTML = `
            <div class="card-title">Not in a Coven</div>
            <div class="card-description">Join or create a coven to unlock social bonuses!</div>
            <div class="button-row">
                <button class="btn-primary" onclick="window.createCoven && window.createCoven()">Create Coven</button>
                <button class="btn-primary" onclick="window.joinCoven && window.joinCoven()">Join Coven</button>
            </div>
        `;
    }
    
    container.appendChild(statusCard);
    
    // Add member list if in coven
    if (isInCoven) {
        const membersCard = document.createElement('div');
        membersCard.className = 'card';
        membersCard.style.cssText = 'position: relative; z-index: 1; pointer-events: auto; visibility: visible; display: block;';
        membersCard.innerHTML = '<div class="card-title">Members</div>';
        
        const coven = covenSystem.getCurrentCoven();
        const currentPlayerId = covenSystem.playerId;
        const sortedMembers = [...coven.members].sort((a, b) => {
            if (a.isLeader && !b.isLeader) return -1;
            if (!a.isLeader && b.isLeader) return 1;
            return b.contribution - a.contribution;
        });
        
        sortedMembers.forEach(member => {
            const isCurrentPlayer = member.id === currentPlayerId;
            const memberItem = document.createElement('div');
            memberItem.className = 'card-section';
            memberItem.innerHTML = `
                <div class="card-label">${member.name} ${isCurrentPlayer ? '(You)' : ''} ${member.isLeader ? '👑' : '🔮'}</div>
                <div class="card-description">Contribution: ${formatShort(member.contribution)}</div>
            `;
            membersCard.appendChild(memberItem);
        });
        
        container.appendChild(membersCard);
        
        // Add leave button
        const leaveButton = document.createElement('button');
        leaveButton.className = 'btn-secondary';
        leaveButton.textContent = 'Leave Coven';
        leaveButton.onclick = () => {
            if (window.leaveCoven) window.leaveCoven();
        };
        container.appendChild(leaveButton);
    }
    
    console.log('Coven tab updated, container children:', container.children.length);
}

/**
 * Update coven rituals display
 */
function updateCovenRituals() {
    if (!gameState || !gameState.covenSystem || !gameState.covenSystem.isInCoven()) {
        return;
    }
    
    const ritualList = document.getElementById('ritual-list');
    const coven = gameState.covenSystem.getCurrentCoven();
    
    ritualList.innerHTML = '';
    
    // Batch DOM updates for better performance
    const fragment = document.createDocumentFragment();
    
    for (const ritual of coven.activeRituals) {
        const ritualCard = document.createElement('div');
        ritualCard.className = `ritual-card ${ritual.completedAt > 0 ? 'completed' : ''}`;
        
        const progressPercent = (ritual.progress / ritual.maxProgress) * 100;
        
        ritualCard.innerHTML = `
            <div class="ritual-title">${ritual.name}</div>
            <div class="ritual-description">${ritual.description}</div>
            <div class="ritual-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, progressPercent)}%"></div>
                </div>
                <div class="progress-text">${Math.floor(ritual.progress)} / ${ritual.maxProgress}</div>
            </div>
            <div class="ritual-rewards">
                <div class="ritual-reward">+${ritual.rewards.experience} XP</div>
                <div class="ritual-reward">+${Math.floor(ritual.rewards.covenBonus * 100)}% Bonus</div>
            </div>
        `;
        
        fragment.appendChild(ritualCard);
    }
    
    ritualList.appendChild(fragment);
}

/**
 * Update coven members display
 */
function updateCovenMembers() {
    if (!gameState || !gameState.covenSystem || !gameState.covenSystem.isInCoven()) {
        return;
    }
    
    const memberList = document.getElementById('member-list');
    const coven = gameState.covenSystem.getCurrentCoven();
    const currentPlayerId = gameState.covenSystem.playerId;
    
    memberList.innerHTML = '';
    
    // Sort members: leader first, then by contribution
    const sortedMembers = [...coven.members].sort((a, b) => {
        if (a.isLeader && !b.isLeader) return -1;
        if (!a.isLeader && b.isLeader) return 1;
        return b.contribution - a.contribution;
    });
    
    // Batch DOM updates for better performance
    const fragment = document.createDocumentFragment();
    
    for (const member of sortedMembers) {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        
        const joinedDate = new Date(member.joinedAt).toLocaleDateString();
        const isCurrentPlayer = member.id === currentPlayerId;
        
        memberCard.innerHTML = `
            <div class="member-info">
                <div class="member-name">${member.name} ${isCurrentPlayer ? '(You)' : ''}</div>
                <div class="member-role">${member.isLeader ? '👑 Coven Leader' : '🔮 Coven Member'}</div>
            </div>
            <div class="member-stats">
                <div class="member-contribution">Contribution: ${formatShort(member.contribution)}</div>
                <div class="member-joined">Joined: ${joinedDate}</div>
            </div>
        `;
        
        fragment.appendChild(memberCard);
    }
    
    memberList.appendChild(fragment);
}

function updateAllUI() {
    updateWorkstationsTab();
    updateInscriptionsTab();
    updateInventoryTab();
    updateExperimentTab();
    updateDailiesTab();
    updateCovenTab();
    updateBoonsTab();
    updateStatsTab();
    updateMeditationVisibility(); // Update meditation tab visibility
}

/**
 * Update meditation and boons tab visibility based on prestige count
 */
function updateMeditationVisibility() {
    if (!gameState) return;
    
    const isUnlocked = gameState.prestigeCount >= 1;
    
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
    
    // Update tier selector
    const tierSelector = document.getElementById('tier-selector');
    if (tierSelector) {
        tierSelector.value = designTierSystem.getCurrentTier().toString();
        
        // Disable locked tiers
        const unlockedTiers = designTierSystem.getUnlockedTiers();
        Array.from(tierSelector.options).forEach(option => {
            const tier = parseInt(option.value, 10);
            option.disabled = !unlockedTiers.includes(tier);
        });
    }
}

/**
 * Reset all game progress
 */
function resetAllProgress() {
    console.log('resetAllProgress called');
    
    if (!confirm('⚠️ WARNING: This will permanently delete ALL your game progress!\n\nThis includes:\n- All currency and ingredients\n- All workstations and upgrades\n- All prestige points and bonuses\n- All achievements\n- All milestones\n- Everything!\n\nThis action CANNOT be undone!\n\nAre you ABSOLUTELY sure?')) {
        console.log('Reset cancelled by user (first confirmation)');
        return;
    }
    
    // Double confirmation - use confirm instead of prompt (prompt() is blocked in some browsers)
    if (!confirm('⚠️ FINAL WARNING!\n\nYou are about to PERMANENTLY DELETE everything!\n\nThis is your LAST chance to cancel.\n\nClick OK to proceed with reset, or Cancel to keep your progress.')) {
        console.log('Reset cancelled by user (second confirmation)');
        if (window.showNotification) {
            window.showNotification('Reset cancelled. Your progress is safe.', 'info');
        }
        return;
    }
    
    console.log('Reset confirmed, proceeding with reset...');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Reset all game state
    if (gameState) {
        // Reset game state to initial values
        gameState.ab = 0.0;
        gameState.abTotalEarned = 0.0;
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
        
        // Save empty state
        gameState.saveGameState();
    }
    
    // Reset design tier system
    if (designTierSystem) {
        designTierSystem.currentTier = 0;
        designTierSystem.unlockedTiers = new Set([0]);
        designTierSystem.applyTier(0);
        designTierSystem.saveTier();
    }
    
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

function updateDailyProgress(conditionType, param, value) {
    if (dailyRituals) {
        dailyRituals.updateTaskProgress(conditionType, param, value);
    }
}

// Make globally accessible for meditation system
window.updateDailyProgress = updateDailyProgress;

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
                showNotification(`🏆 Achievement: ${achievement.name}!`, 'success');
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
    }, autoSaveInterval);
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
let notificationCount = 0;
let lastNotificationReset = Date.now();

/**
 * Show notification with rate limiting
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
function showNotification(message, type = 'info') {
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
    
    // Create and show notification immediately
    createNotificationElement(message, type);
}

/**
 * Create notification element
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
function createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message; // Use innerHTML to support CSS icons
    document.body.appendChild(notification);
    
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
    document.getElementById('welcome-ab').innerHTML = `<span class="css-icon-sparkle"></span> Earned: ${formatShort(abGained)} AB`;
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

// Debug: Log all clicks to see if they're being registered
document.addEventListener('click', (e) => {
    console.log('CLICK DETECTED:', {
        target: e.target,
        targetTag: e.target.tagName,
        targetClass: e.target.className,
        targetId: e.target.id,
        currentTarget: e.currentTarget,
        path: e.composedPath().map(el => ({
            tag: el.tagName,
            class: el.className,
            id: el.id
        })).slice(0, 5)
    });
}, true);

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
    
    // PWA Installation Prompt
    let deferredPrompt;
    const installButton = document.createElement('button');
    installButton.className = 'btn-secondary';
    installButton.textContent = '📱 Install App';
    installButton.style.display = 'none';
    installButton.setAttribute('aria-label', 'Install Cyber Witches app');
    
    // Add install button to top bar
    const installBar = document.querySelector('.top-bar');
    if (installBar) {
        installBar.appendChild(installButton);
    }
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash event so it can be triggered later
        deferredPrompt = e;
        // Show install button
        installButton.style.display = 'block';
        
        // Show notification about app installation
        if (window.showNotification) {
            window.showNotification('📱 Cyber Witches can be installed!', 'info');
        }
    });
    
    // Install button click handler
    installButton.addEventListener('click', () => {
        if (deferredPrompt) {
            // Show install prompt
            deferredPrompt.prompt();
            // Wait for user to respond to prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    if (window.showNotification) {
                        window.showNotification('<span class="css-icon-celebration"></span> Cyber Witches installed successfully!', 'success');
                    }
                    console.log('User accepted install prompt');
                } else {
                    console.log('User dismissed install prompt');
                }
                // Clear deferred prompt
                deferredPrompt = null;
                // Hide install button
                installButton.style.display = 'none';
            });
        }
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        // Hide install button
        installButton.style.display = 'none';
        // Clear deferred prompt
        deferredPrompt = null;
        // Show success notification
        if (window.showNotification) {
            window.showNotification('<span class="css-icon-celebration"></span> Cyber Witches is now installed!', 'success');
        }
    });
    
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
        initCovenSystem();
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
        
        // Check if cast button exists and is clickable
        const castBtn = document.getElementById('cast-button');
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
 */
function initCovenSystem() {
    if (!gameState || !gameState.covenSystem) {
        console.error('Coven system not available');
        return;
    }
    
    const covenSystem = gameState.covenSystem;
    
    // Set up coven system callbacks
    covenSystem.onCovenJoined = (coven) => {
        console.log('Joined coven:', coven.name);
        updateCovenTab();
    };
    
    covenSystem.onCovenLeft = (coven) => {
        console.log('Left coven:', coven.name);
        updateCovenTab();
    };
    
    covenSystem.onMemberJoined = (member) => {
        console.log('Member joined:', member.name);
        updateCovenTab();
        showNotification(`🔮 ${member.name} joined coven!`, 'info');
    };
    
    covenSystem.onMemberLeft = (member) => {
        console.log('Member left:', member.name);
        updateCovenTab();
        showNotification(`${member.name} left coven`, 'info');
    };
    
    covenSystem.onRitualProgress = (ritual) => {
        updateCovenTab();
    };
    
    covenSystem.onRitualCompleted = (ritual) => {
        showNotification(`<span class="css-icon-celebration"></span> Ritual completed: ${ritual.name}!`, 'success');
        updateCovenTab();
    };
    
    covenSystem.onCovenLevelUp = (newLevel) => {
        showNotification(`<span class="css-icon-celebration"></span> Coven reached level ${newLevel}!`, 'success');
        updateCovenTab();
    };
    
    // Set up event listeners for coven UI elements
    const createButton = document.getElementById('create-coven-button');
    const joinButton = document.getElementById('join-coven-button');
    const leaveButton = document.getElementById('leave-coven-button');
    const membersButton = document.getElementById('coven-members-button');
    
    if (createButton) {
        createButton.addEventListener('click', createCoven);
    }
    
    if (joinButton) {
        joinButton.addEventListener('click', joinCoven);
    }
    
    if (leaveButton) {
        leaveButton.addEventListener('click', leaveCoven);
    }
    
    if (membersButton) {
        membersButton.addEventListener('click', () => {
            toggleCovenSection('coven-members');
        });
    }
    
    // Add enter key support for input fields
    const nameInput = document.getElementById('coven-name-input');
    const descInput = document.getElementById('coven-desc-input');
    const codeInput = document.getElementById('coven-code-input');
    
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') createCoven();
        });
    }
    
    if (descInput) {
        descInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') createCoven();
        });
    }
    
    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') joinCoven();
        });
    }
}