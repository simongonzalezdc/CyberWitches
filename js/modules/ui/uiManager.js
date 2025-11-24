/**
 * UIManager.js
 * Central manager for all UI interactions, tab switching, and updates.
 */

import { ModalManager } from './modalManager.js';
import { WorkstationUI } from './workstationUI.js';
import { InventoryUI } from './inventoryUI.js';
import { InscriptionsUI } from './inscriptionsUI.js';
import { ExperimentUI } from './experimentUI.js';
import { StatsUI } from './statsUI.js';
import { DailiesUI } from './dailiesUI.js';
import { BoonsUI } from './boonsUI.js';
// MeditationUI loaded lazily when meditation tab is accessed
// import { MeditationUI } from './meditationUI.js';
import { FloatingTextUI } from './floatingTextUI.js';
import { HUDUI } from './hudUI.js';
import { showNotification } from './notifications.js';
import { accessibilityManager, announceToScreenReader } from '../../accessibility.js';
import { showLoadingState, hideLoadingState } from '../../loadingState.js';
import { batchDOMUpdate } from '../../utils/DOMBatcher.js'; // Week 3: DOM batching
import { uiStore } from '../../state/uiStore.js'; // Week 4: Reactive UI store (optional)

export class UIManager {
    constructor(gameState, gameSystems = {}) {
        this.gameState = gameState;
        this.systems = gameSystems;
        this.eventSystem = gameSystems.eventSystem;
        this.meditationState = gameSystems.meditationState;

        // Initialize sub-managers
        this.modalManager = new ModalManager(gameState);
        this.workstationUI = new WorkstationUI(gameState, this);
        this.inventoryUI = new InventoryUI(gameState, this);
        this.inscriptionsUI = new InscriptionsUI(gameState, this);
        this.experimentUI = new ExperimentUI(gameState, this);
        this.statsUI = new StatsUI(gameState, this);
        this.dailiesUI = new DailiesUI(gameState, this);
        this.boonsUI = new BoonsUI(gameState, this);
        this.hudUI = new HUDUI(gameState, this);
        this.floatingTextUI = new FloatingTextUI();
        // MeditationUI is initialized dynamically in game.js when unlocked, but we can prepare for it
        this.meditationUI = null;

        // UI State
        this.tabButtons = [];
        this.tabPanes = [];
        this.updateIntervals = [];
        this.uiUpdateTimeouts = new Map();
        this.uiUpdateDelay = 50; // ms
        this.activeTab = null; // To keep track of the currently active tab

        // Bind methods
        this.switchTab = this.switchTab.bind(this);
        this.updateAllUI = this.updateAllUI.bind(this);
        this.debouncedUIUpdate = this.debouncedUIUpdate.bind(this);

        // Initialize UI elements
        this.init();

        // Inject dependencies into notification manager
        if (this.systems.audioSystem) {
            import('./notifications.js')
                .then(({ notificationManager }) => {
                    notificationManager.setAudioSystem(this.systems.audioSystem);
                })
                .catch(err => {
                    console.error('Failed to load notification manager:', err);
                    // Non-critical - notifications will still work without audio
                });
        }
    }

    init() {
        // Query for tab buttons - try both class names for compatibility
        this.tabButtons = document.querySelectorAll('.tab-btn');
        if (this.tabButtons.length === 0) {
            console.warn('No elements found with .tab-btn, trying .tab-button');
            this.tabButtons = document.querySelectorAll('.tab-button');
        }

        // Query for tab panes - try both class names for compatibility
        this.tabPanes = document.querySelectorAll('.tab-panel');
        if (this.tabPanes.length === 0) {
            console.warn('No elements found with .tab-panel, trying .tab-pane');
            this.tabPanes = document.querySelectorAll('.tab-pane');
        }

        // Verify we found the elements
        if (this.tabButtons.length === 0) {
            console.error('CRITICAL: No tab buttons found! Check HTML class names.');
        }
        if (this.tabPanes.length === 0) {
            console.error('CRITICAL: No tab panes found! Check HTML class names.');
        }

        // Attach event listeners to tab buttons
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Set initial active tab if any is marked active in HTML
        const initialActiveButton = document.querySelector('.tab-btn.active, .tab-button.active');
        if (initialActiveButton) {
            this.activeTab = initialActiveButton.dataset.tab;
        } else if (this.tabButtons.length > 0) {
            // Default to the first tab if no active tab is found
            this.activeTab = this.tabButtons[0].dataset.tab;
            this.switchTab(this.activeTab); // Ensure UI reflects this
        }
    }

    switchTab(tabName) {
        console.log('switchTab called with:', tabName);

        // Check if tab is locked
        const tabButton = Array.from(this.tabButtons || []).find(btn => btn.dataset.tab === tabName);
        if (tabButton && tabButton.classList.contains('locked')) {
            // Show notification that tab is locked
            const unlockCondition = tabButton.getAttribute('data-unlock-condition') || 'Prestige 1';
            showNotification(`This tab is locked. Unlocks at: ${unlockCondition}`, 'info');
            return;
        }

        // Week 2: Lazy load meditation system when meditation tab is accessed (non-blocking)
        if (tabName === 'meditation' && !this.meditationUI && !this.systems.meditationState) {
            // Show skeleton screen while loading
            this.showSkeletonScreen('meditation-tab');
            
            // Load asynchronously without blocking tab switch
            import('../../utils/lazyModuleLoader.js').then(({ loadMeditationSystem }) => {
                return loadMeditationSystem();
            }).then((meditationManager) => {
                // Hide skeleton screen
                this.hideSkeletonScreen('meditation-tab');
                
                if (meditationManager && meditationManager.checkUnlock()) {
                    // System initialized, update UI if still on meditation tab
                    if (this.activeTab === 'meditation' && this.meditationUI) {
                        this.meditationUI.update();
                    }
                }
            }).catch((error) => {
                // Hide skeleton screen on error
                this.hideSkeletonScreen('meditation-tab');
                console.error('Failed to lazy load meditation system:', error);
                showNotification('Failed to load meditation system', 'error');
            });
        }

        // Update browser history if browser navigation manager is available
        if (this.systems.browserNavigationManager) {
            this.systems.browserNavigationManager.switchToTab(tabName);
        }

        // Set the active tab
        this.activeTab = tabName;
        
        // Week 4: Update reactive UI store
        if (uiStore) {
            uiStore.set('currentTab', tabName);
        }

        // Update buttons with ARIA states
        this.tabButtons.forEach(btn => {
            const isActive = btn.dataset.tab === tabName;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Check if we're switching away from meditation tab
        const wasMeditationActive = document.getElementById('meditation-tab')?.classList.contains('active');
        const isMeditationActive = tabName === 'meditation';

        // Cleanup meditation state when leaving meditation tab
        const meditationState = this.systems.meditationState;
        const meditationTowers = this.systems.meditationTowers;

        if (wasMeditationActive && !isMeditationActive && meditationState) {
            console.log('Leaving meditation tab - cleaning up meditation state');

            // Clear distractions array to free memory
            if (meditationState.distractions && meditationState.distractions.length > 0) {
                meditationState.distractions = [];
            }

            // Stop meditation tick loop if session is not active
            if (!meditationState.activeSession) {
                meditationState.stopTickLoop();
            }

            // Stop UI update intervals
            if (this.meditationUI) {
                this.meditationUI.stopUpdateIntervals();
            }

            // Stop meditation towers animation loop
            if (meditationTowers && typeof meditationTowers.stopAnimationLoop === 'function') {
                meditationTowers.stopAnimationLoop();
            }
        }

        // Start meditation towers animation loop when entering meditation tab
        if (!wasMeditationActive && isMeditationActive) {
            if (meditationTowers && typeof meditationTowers.startAnimationLoop === 'function') {
                meditationTowers.startAnimationLoop();
            }
        }

        // Update panes with ARIA states
        this.tabPanes.forEach(pane => {
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
        });

        // Scroll to top of new tab
        window.scrollTo(0, 0);
    }

    /**
     * Debounced UI update function to prevent excessive DOM manipulations
     * @param {string} key - Unique key for update
     * @param {Function} updateFn - Function to execute for update
     */
    debouncedUIUpdate(key, updateFn) {
        // Week 3: Use DOM batching for better performance
        // DOM batching handles debouncing via batchDelay, so we don't need setTimeout
        batchDOMUpdate(key, updateFn, 0);
        
        // Clear any existing timeout for this key (legacy cleanup)
        if (this.uiUpdateTimeouts.has(key)) {
            clearTimeout(this.uiUpdateTimeouts.get(key));
            this.uiUpdateTimeouts.delete(key);
        }
        
        // Note: DOM batching replaces timeout-based debouncing
        // The batchDOMUpdate function schedules updates to execute on the next RAF cycle
        // which provides better performance than setTimeout
    }

    updateAllUI() {
        // This function will delegate to specific update functions
        // Update specific tabs based on visibility
        if (this.activeTab === 'workstations') {
            if (this.workstationUI) this.workstationUI.update();
        } else if (this.activeTab === 'inventory') {
            if (this.inventoryUI) this.inventoryUI.update();
        } else if (this.activeTab === 'inscriptions') {
            if (this.inscriptionsUI) this.inscriptionsUI.update();
        } else if (this.activeTab === 'experiment') {
            if (this.experimentUI) this.experimentUI.update();
        } else if (this.activeTab === 'stats') {
            if (this.statsUI) this.statsUI.update();
        } else if (this.activeTab === 'dailies') {
            if (this.dailiesUI) this.dailiesUI.update();
        } else if (this.activeTab === 'boons') {
            if (this.boonsUI) this.boonsUI.update();
        } else if (this.activeTab === 'meditation') {
            if (this.meditationUI) this.meditationUI.update();
        }

        // Update HUD elements (global)
        if (this.hudUI) this.hudUI.update();
    }

    showNotification(message, type = 'info', duration = 3000) {
        showNotification(message, type, duration);
    }

    announceToScreenReader(message, politeness) {
        announceToScreenReader(message, politeness);
    }

    showLoadingState(message) {
        return showLoadingState(message);
    }

    hideLoadingState(id) {
        hideLoadingState(id);
    }
}
