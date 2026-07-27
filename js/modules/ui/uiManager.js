/**
 * UIManager.js
 * Central manager for all UI interactions, tab switching, and updates.
 */

import { WorkstationUI } from './workstationUI.js';
import { InventoryUI } from './inventoryUI.js';
import { InscriptionsUI } from './inscriptionsUI.js';
import { FloatingTextUI } from './floatingTextUI.js';
import { HUDUI } from './hudUI.js';
import { PipelineHudUI } from './pipelineHudUI.js';
import { showNotification } from './notifications.js';
import { announceToScreenReader } from '../../accessibility.js';
import { showLoadingState, hideLoadingState } from '../../loadingState.js';
import { batchDOMUpdate } from '../../utils/DOMBatcher.js'; // Week 3: DOM batching
import { uiStore } from '../../state/uiStore.js'; // Week 4: Reactive UI store (optional)

export class UIManager {
    constructor(gameState, gameSystems = {}) {
        this.gameState = gameState;
        this.systems = gameSystems;
        this.eventSystem = gameSystems.eventSystem;
        this.meditationState = gameSystems.meditationState;

        // Initialize critical sub-managers (needed for first paint / boot)
        this.modalManager = null; // lazy-loaded via initModalManager()
        this.workstationUI = new WorkstationUI(gameState, this);
        this.inventoryUI = new InventoryUI(gameState, this);
        this.inscriptionsUI = new InscriptionsUI(gameState, this);
        this.hudUI = new HUDUI(gameState, this);
        this.pipelineHudUI = new PipelineHudUI(gameState);
        this.floatingTextUI = new FloatingTextUI();
        /** @type {import('./compileGoalUI.js').CompileGoalUI | null} */
        this.compileGoalUI = null;

        // Non-critical UI modules — loaded lazily after boot to keep critical bundle small
        this.experimentUI = null;
        this.statsUI = null;
        this.dailiesUI = null;
        this.boonsUI = null;
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
        // Query for tab buttons - try both class names for compatibility.
        // Array.from yields a real array (these fields are used as arrays via
        // .forEach/.find elsewhere); the HTMLElement cast keeps `.dataset` typed.
        this.tabButtons = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.tab-btn')));
        if (this.tabButtons.length === 0) {
            console.warn('No elements found with .tab-btn, trying .tab-button');
            this.tabButtons = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.tab-button')));
        }

        // Query for tab panes - try both class names for compatibility
        this.tabPanes = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.tab-panel')));
        if (this.tabPanes.length === 0) {
            console.warn('No elements found with .tab-panel, trying .tab-pane');
            this.tabPanes = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('.tab-pane')));
        }

        // Verify we found the elements
        if (this.tabButtons.length === 0) {
            console.error('CRITICAL: No tab buttons found! Check HTML class names.');
        }
        if (this.tabPanes.length === 0) {
            console.error('CRITICAL: No tab panes found! Check HTML class names.');
        }

        // Attach event listeners to tab buttons
        this.tabButtons.forEach((btn, index) => {
            const tabName = btn.dataset.tab;
            if (tabName) {
                const panelId = `${tabName}-tab`;
                btn.id = btn.id || `tab-${tabName}`;
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-controls', panelId);
                btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
                btn.setAttribute('tabindex', btn.classList.contains('active') || index === 0 ? '0' : '-1');
                btn.setAttribute('aria-disabled', btn.classList.contains('locked') ? 'true' : 'false');
                if (btn.classList.contains('locked')) {
                    const unlockCondition = btn.getAttribute('data-unlock-condition') || 'Prestige 1';
                    btn.setAttribute('title', `Unlocks at: ${unlockCondition}`);
                }
            }
            btn.addEventListener('keydown', (e) => this.handleTabKeydown(e, index));
        });

        const tabClickRoot = document.querySelector('.tabs-nav') || document;
        tabClickRoot.addEventListener('click', (e) => {
            const target = /** @type {HTMLElement | null} */ (e.target);
            const tabButton = /** @type {HTMLElement | null} */ (target?.closest?.('.tab-btn, .tab-button') || null);
            if (!tabButton || !this.tabButtons.includes(tabButton)) return;

            e.preventDefault();
            if (tabButton.dataset.tab) {
                this.switchTab(tabButton.dataset.tab);
            }
        });

        this.tabPanes.forEach(pane => {
            const tabName = pane.id.replace(/-tab$/, '');
            pane.setAttribute('role', 'tabpanel');
            pane.setAttribute('aria-labelledby', `tab-${tabName}`);
            pane.setAttribute('tabindex', '-1');
        });

        // Set initial active tab if any is marked active in HTML
        const initialActiveButton = /** @type {HTMLElement|null} */ (document.querySelector('.tab-btn.active, .tab-button.active'));
        if (initialActiveButton) {
            this.activeTab = initialActiveButton.dataset.tab;
        } else if (this.tabButtons.length > 0) {
            // Default to the first tab if no active tab is found
            this.activeTab = this.tabButtons[0].dataset.tab;
            this.switchTab(this.activeTab); // Ensure UI reflects this
        }
    }

    handleTabKeydown(e, index) {
        const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Enter', ' '];
        if (!keys.includes(e.key)) return;

        const current = this.tabButtons[index];
        if ((e.key === 'Enter' || e.key === ' ') && current?.dataset.tab) {
            e.preventDefault();
            this.switchTab(current.dataset.tab);
            return;
        }

        e.preventDefault();
        let nextIndex = index;
        if (e.key === 'Home') nextIndex = 0;
        else if (e.key === 'End') nextIndex = this.tabButtons.length - 1;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (index + 1) % this.tabButtons.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (index - 1 + this.tabButtons.length) % this.tabButtons.length;

        const next = this.tabButtons[nextIndex];
        if (next) {
            this.tabButtons.forEach(btn => btn.setAttribute('tabindex', '-1'));
            next.setAttribute('tabindex', '0');
            next.focus();
        }
    }

    /**
     * Show/hide a lightweight loading state on a panel while a system lazy-loads.
     * Non-destructive (toggles a class only) — must NOT replace the panel's
     * content, which holds the real, statically-rendered UI (e.g. the meditation
     * canvas + HUD). Previously these were called but never defined, so switching
     * to the meditation tab threw.
     */
    showSkeletonScreen(panelId) {
        document.getElementById(panelId)?.classList.add('is-loading');
    }

    hideSkeletonScreen(panelId) {
        document.getElementById(panelId)?.classList.remove('is-loading');
    }

    /**
     * Lazy-load ModalManager (~24KB). Called by gameInit before the story intro
     * or any modal is shown. Keeps the critical bundle lean.
     */
    async initModalManager() {
        if (this.modalManager) return;
        const { ModalManager } = await import('./modalManager.js');
        this.modalManager = new ModalManager(this.gameState);
    }

    /**
     * Lazy-load non-critical UI modules after the game shell is interactive.
     * Each module is loaded independently so one failure doesn't block others.
     */
    async initLazyUIs() {
        const load = async (factory, exportName, propName, ...args) => {
            if (this[propName]) return;
            try {
                const mod = await factory();
                const Constructor = mod[exportName];
                if (Constructor) {
                    this[propName] = new Constructor(...args);
                }
            } catch (e) {
                console.warn(`Lazy UI: failed to load ${exportName}`, e);
            }
        };

        await Promise.all([
            load(() => import('./experimentUI.js'), 'ExperimentUI', 'experimentUI', this.gameState, this),
            load(() => import('./statsUI.js'), 'StatsUI', 'statsUI', this.gameState, this),
            load(() => import('./dailiesUI.js'), 'DailiesUI', 'dailiesUI', this.gameState, this),
            load(() => import('./boonsUI.js'), 'BoonsUI', 'boonsUI', this.gameState, this)
        ]);
    }

    switchTab(tabName) {
        // Check if tab is locked
        const tabButton = Array.from(this.tabButtons || []).find(btn => btn.dataset.tab === tabName);
        if (tabButton && tabButton.classList.contains('locked')) {
            // Show notification that tab is locked
            const unlockCondition = tabButton.getAttribute('data-unlock-condition') || 'Prestige 1';
            showNotification(`This tab is locked. Unlocks at: ${unlockCondition}`, 'info');
            announceToScreenReader(`Locked tab. Unlocks at ${unlockCondition}.`, 'polite');
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
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Check if we're switching away from meditation tab
        const wasMeditationActive = document.getElementById('meditation-tab')?.classList.contains('active');
        const isMeditationActive = tabName === 'meditation';

        // Cleanup meditation state when leaving meditation tab
        const meditationState = this.systems.meditationState;
        const meditationTowers = this.systems.meditationTowers;

        if (wasMeditationActive && !isMeditationActive && meditationState) {
            console.info('Leaving meditation tab - cleaning up meditation state');

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

        // The visual pane swap. Pulled into a function so it can run either
        // directly or inside a View Transition.
        const applyPaneVisibility = () => {
            this.tabPanes.forEach(pane => {
                const isActive = pane.id === `${tabName}-tab`;
                pane.classList.toggle('active', isActive);
                // Remove the `hidden` utility class from the active pane. It is
                // `display:none !important`, so the inline `display:block` below
                // cannot override it on its own — without this, panes that start
                // hidden in the markup (stats/dailies/boons/meditation) never showed.
                pane.classList.toggle('hidden', !isActive);
                pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
                pane.setAttribute('tabindex', '-1');

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
        };

        // Keep tab changes synchronous. The View Transitions API created a short
        // top-layer hit-test window where fast user clicks landed on <html>
        // instead of visible controls, so reliability wins over crossfade polish.
        applyPaneVisibility();

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
        // Pipeline role strip + affinity foreshadow (Kernel projectors)
        if (this.pipelineHudUI) this.pipelineHudUI.update();
        // Post-tutorial primary compile goal (always-on after tutorial)
        if (this.compileGoalUI) this.compileGoalUI.update();
    }

    showNotification(message, type = 'info', duration = 3000, options = {}) {
        showNotification(message, type, duration, options);
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
