/**
 * MeditationManager
 * Manages the lifecycle and coordination of the Meditation system.
 */
import { MeditationState } from '../../meditationState.js';
import { MeditationTowers } from '../../meditationTowers.js';
import { MeditationUI } from '../ui/meditationUI.js';

export class MeditationManager {
    /**
     * @param {Object} gameState - The global game state
     * @param {Object} uiManager - The UI manager
     */
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;

        this.state = null; // MeditationState instance
        this.towers = null; // MeditationTowers instance

        // Bind methods
        this.checkUnlock = this.checkUnlock.bind(this);
    }

    /**
     * Check if meditation should be unlocked and initialize if so
     */
    checkUnlock() {
        if (this.gameState.prestigeCount >= 1 && !this.state) {
            this.initialize();
            return true;
        } else if (this.gameState.prestigeCount >= 1) {
            // Already initialized, just ensure visibility
            if (this.uiManager && this.uiManager.hudUI) {
                this.uiManager.hudUI.updateMeditationVisibility();
            }
            return true;
        }
        return false;
    }

    /**
     * Initialize the meditation system
     */
    initialize() {
        console.log('Initializing Meditation System...');

        // Create state
        this.state = new MeditationState(this.gameState);
        this.state.loadState();
        this.state.startTickLoop();

        // Create towers system
        this.towers = new MeditationTowers(this.state, this.gameState);

        // Initialize UI
        // Note: UIManager handles the MeditationUI instance creation, 
        // but we need to trigger it or pass the state to it.
        // In the current refactor, UIManager creates MeditationUI when needed.

        if (this.uiManager) {
            // Create MeditationUI instance in UIManager
            this.uiManager.meditationUI = new MeditationUI(this.state, this.gameState, this.uiManager);
            this.uiManager.meditationUI.init();

            // Update UIManager's reference to systems
            this.uiManager.systems.meditationState = this.state;
            this.uiManager.systems.meditationTowers = this.towers;

            // Update visibility
            if (this.uiManager.hudUI) {
                this.uiManager.hudUI.updateMeditationVisibility();
            }
        }

        // Legacy global fallbacks removed
        // window.meditationState = this.state;
        // window.meditationTowers = this.towers;

        if (this.uiManager && this.uiManager.showNotification) {
            this.uiManager.showNotification('Meditation unlocked!', 'success');
        }
    }

    /**
     * Reset the meditation system
     */
    reset() {
        if (this.state) {
            this.state.reset();
        }
    }

    /**
     * Save the meditation state
     */
    save() {
        if (this.state && typeof this.state.saveState === 'function') {
            this.state.saveState();
        }
    }
    /**
     * Start a meditation session
     */
    startSession() {
        if (this.state && !this.state.activeSession) {
            this.state.startSession();
            if (this.uiManager && this.uiManager.meditationUI) {
                this.uiManager.meditationUI.updateControls();
            }
            if (this.uiManager && this.uiManager.showNotification) {
                this.uiManager.showNotification('Meditation session started!', 'success');
            }
        }
    }

    /**
     * End a meditation session
     */
    endSession() {
        if (this.state && this.state.activeSession) {
            this.state.endSession();
            if (this.uiManager && this.uiManager.meditationUI) {
                this.uiManager.meditationUI.updateControls();
            }
            if (this.uiManager && this.uiManager.showNotification) {
                this.uiManager.showNotification('Meditation session ended!', 'info');
            }
        }
    }
}
