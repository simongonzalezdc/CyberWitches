import { handleError, safeFunction } from './errorHandler.js';
// Particle effects removed for memory optimization
import { audioSystem } from './audioSystem.js';

/**
 * Celebration Animations System - Manages achievement celebration animations
 * Combines particle effects, audio, and visual feedback
 */

/**
 * @typedef {Object} Celebration
 * @property {string} id - Unique celebration identifier
 * @property {string} type - Celebration type
 * @property {string} title - Celebration title
 * @property {string} description - Celebration description
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} startTime - Start time
 * @property {number} duration - Duration in milliseconds
 * @property {Object} config - Celebration configuration
 * @property {boolean} isActive - Whether celebration is active
 * @property {HTMLElement} element - DOM element for celebration
 */

/**
 * Celebration Animations System class
 */
export class CelebrationAnimationsSystem {
    /**
     * Create a new CelebrationAnimationsSystem instance
     */
    constructor() {
        this.celebrations = new Map();
        this.celebrationQueue = [];
        this.isProcessingQueue = false;

        // DOM elements
        this.container = null;
        this.overlay = null;

        // Animation settings
        this.maxConcurrentCelebrations = 3;
        this.celebrationDelay = 500; // Delay between queued celebrations

        // Initialize celebration system
        this.initializeCelebrationSystem();

        // Initialize celebration templates
        this.initializeCelebrationTemplates();
    }

    /**
     * Initialize the celebration system
     * @private
     */
    initializeCelebrationSystem() {
        try {
            // Create overlay container
            this.overlay = document.createElement('div');
            this.overlay.className = 'celebration-overlay';
            this.overlay.style.cssText = ''; // Clear any inline styles
            // Styles moved to CSS

            // Create celebration container
            this.container = document.createElement('div');
            this.container.className = 'celebration-container';
            this.container.style.cssText = ''; // Clear any inline styles
            // Styles moved to CSS

            this.overlay.appendChild(this.container);
            document.body.appendChild(this.overlay);

            // Add styles - moved to CSS
            // this.addCelebrationStyles();
        } catch (error) {
            handleError(error, 'celebrationInitialize');
        }
    }

    /**
     * Add celebration styles to the page
     * @private
     */
    addCelebrationStyles() {
        // Styles moved to CSS
    }

    /**
     * Initialize celebration templates
     * @private
     */
    initializeCelebrationTemplates() {
        this.celebrationTemplates = new Map([
            ['achievement', {
                icon: '🏆',
                sound: 'achievement',
                particleEffect: 'achievement',
                duration: 3000,
                showProgress: false,
                showReward: true
            }],
            ['level_up', {
                icon: '⬆️',
                sound: 'level_up',
                particleEffect: 'level_up',
                duration: 2500,
                showProgress: false,
                showReward: false
            }],
            ['milestone', {
                icon: '🎯',
                sound: 'achievement',
                particleEffect: 'achievement',
                duration: 3500,
                showProgress: false,
                showReward: true
            }],
            ['rare_achievement', {
                icon: '💎',
                sound: 'achievement',
                particleEffect: 'achievement',
                duration: 4000,
                showProgress: false,
                showReward: true,
                rarity: 'rare'
            }],
            ['epic_achievement', {
                icon: '🌟',
                sound: 'achievement',
                particleEffect: 'achievement',
                duration: 5000,
                showProgress: false,
                showReward: true,
                rarity: 'epic'
            }],
            ['legendary_achievement', {
                icon: '👑',
                sound: 'achievement',
                particleEffect: 'achievement',
                duration: 6000,
                showProgress: false,
                showReward: true,
                rarity: 'legendary'
            }],
            ['coven_achievement', {
                icon: '🔮',
                sound: 'achievement',
                particleEffect: 'ritual',
                duration: 4000,
                showProgress: false,
                showReward: true
            }],
            ['event_complete', {
                icon: '🎉',
                sound: 'achievement',
                particleEffect: 'level_up',
                duration: 3000,
                showProgress: false,
                showReward: true
            }],
            ['ritual_complete', {
                icon: '✨',
                sound: 'ritual_complete',
                particleEffect: 'ritual',
                duration: 3500,
                showProgress: true,
                showReward: true
            }]
        ]);
    }

    /**
     * Create a celebration
     * @param {string} type - Celebration type
     * @param {string} title - Celebration title
     * @param {string} description - Celebration description
     * @param {Object} options - Additional options
     * @returns {string} Celebration ID
     */
    createCelebration(type, title, description, options = {}) {
        try {
            // Check if we have too many concurrent celebrations
            if (this.celebrations.size >= this.maxConcurrentCelebrations) {
                // Queue the celebration
                this.celebrationQueue.push({ type, title, description, options });
                return null;
            }

            const template = this.celebrationTemplates.get(type);
            if (!template) {
                console.warn(`Unknown celebration type: ${type}`);
                return null;
            }

            const celebrationId = 'celebration_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            const config = { ...template, ...options };

            // Calculate position (center of screen)
            const x = window.innerWidth / 2;
            const y = window.innerHeight / 2;

            const celebration = {
                id: celebrationId,
                type: type,
                title: title,
                description: description,
                x: x,
                y: y,
                startTime: Date.now(),
                duration: config.duration,
                config: config,
                isActive: true,
                element: null
            };

            // Create DOM element
            celebration.element = this.createCelebrationElement(celebration);

            // Add to container
            this.container.appendChild(celebration.element);

            // Add to active celebrations
            this.celebrations.set(celebrationId, celebration);

            // Play sound effect
            if (config.sound) {
                audioSystem.playSound(config.sound);
            }

            // Create particle effect
            // Particle effects removed for memory optimization
            // Visual feedback now uses CSS animations

            // Start celebration animation
            this.startCelebrationAnimation(celebration);

            // Process queue after delay
            setTimeout(() => {
                this.processCelebrationQueue();
            }, this.celebrationDelay);

            return celebrationId;
        } catch (error) {
            handleError(error, 'createCelebration');
            return null;
        }
    }

    /**
     * Create DOM element for celebration
     * @param {Celebration} celebration - Celebration data
     * @returns {HTMLElement} Celebration DOM element
     * @private
     */
    createCelebrationElement(celebration) {
        const element = document.createElement('div');
        element.className = 'celebration';
        element.style.left = `${celebration.x}px`;
        element.style.top = `${celebration.y}px`;

        // Add rarity class if specified
        if (celebration.config.rarity) {
            element.classList.add(`celebration-${celebration.config.rarity}`);
        }

        // Create content
        const content = document.createElement('div');
        content.className = 'celebration-content';

        // Add icon
        const icon = document.createElement('div');
        icon.className = 'celebration-icon';
        icon.textContent = celebration.config.icon;
        content.appendChild(icon);

        // Add title
        const title = document.createElement('div');
        title.className = 'celebration-title';
        title.textContent = celebration.title;
        content.appendChild(title);

        // Add description
        const description = document.createElement('div');
        description.className = 'celebration-description';
        description.textContent = celebration.description;
        content.appendChild(description);

        // Add progress bar if needed
        if (celebration.config.showProgress) {
            const progress = document.createElement('div');
            progress.className = 'celebration-progress';

            const progressFill = document.createElement('div');
            progressFill.className = 'celebration-progress-fill';
            progress.appendChild(progressFill);

            content.appendChild(progress);
        }

        // Add reward if needed
        if (celebration.config.showReward && celebration.config.reward) {
            const reward = document.createElement('div');
            reward.className = 'celebration-reward';
            reward.textContent = `Reward: ${celebration.config.reward}`;
            content.appendChild(reward);
        }

        element.appendChild(content);

        return element;
    }

    /**
     * Start celebration animation
     * @param {Celebration} celebration - Celebration to animate
     * @private
     */
    startCelebrationAnimation(celebration) {
        // Set up auto-removal
        setTimeout(() => {
            this.endCelebration(celebration.id);
        }, celebration.duration);

        // Update progress bar if needed
        if (celebration.config.showProgress) {
            this.updateCelebrationProgress(celebration);
        }
    }

    /**
     * Update celebration progress
     * @param {Celebration} celebration - Celebration to update
     * @private
     */
    updateCelebrationProgress(celebration) {
        const progressFill = celebration.element.querySelector('.celebration-progress-fill');
        if (!progressFill) {
            return;
        }

        const startTime = Date.now();
        const duration = celebration.duration;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            progressFill.style.width = `${progress * 100}%`;

            if (progress < 1) {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);
    }

    /**
     * End a celebration
     * @param {string} celebrationId - Celebration ID to end
     * @private
     */
    endCelebration(celebrationId) {
        const celebration = this.celebrations.get(celebrationId);
        if (!celebration) {
            return;
        }

        // Mark as inactive
        celebration.isActive = false;

        // Fade out animation
        if (celebration.element) {
            celebration.element.style.animation = 'celebrationFadeOut 0.5s ease-in forwards';

            // Remove element after animation
            setTimeout(() => {
                if (celebration.element && celebration.element.parentNode) {
                    celebration.element.parentNode.removeChild(celebration.element);
                }
            }, 500);
        }

        // Remove from active celebrations
        this.celebrations.delete(celebrationId);

        // Process queue
        setTimeout(() => {
            this.processCelebrationQueue();
        }, 100);
    }

    /**
     * Process celebration queue
     * @private
     */
    processCelebrationQueue() {
        if (this.isProcessingQueue || this.celebrationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        const nextCelebration = this.celebrationQueue.shift();
        this.createCelebration(
            nextCelebration.type,
            nextCelebration.title,
            nextCelebration.description,
            nextCelebration.options
        );

        this.isProcessingQueue = false;
    }

    /**
     * Create an achievement celebration
     * @param {string} achievementName - Achievement name
     * @param {string} achievementDescription - Achievement description
     * @param {string} rarity - Achievement rarity ('common', 'rare', 'epic', 'legendary')
     * @param {string} reward - Achievement reward
     * @returns {string} Celebration ID
     */
    createAchievementCelebration(achievementName, achievementDescription, rarity = 'common', reward = '') {
        let type = 'achievement';

        // Adjust type based on rarity
        if (rarity === 'rare') {
            type = 'rare_achievement';
        } else if (rarity === 'epic') {
            type = 'epic_achievement';
        } else if (rarity === 'legendary') {
            type = 'legendary_achievement';
        }

        return this.createCelebration(type, achievementName, achievementDescription, {
            rarity: rarity,
            reward: reward
        });
    }

    /**
     * Create a level up celebration
     * @param {number} newLevel - New level achieved
     * @param {string} levelType - Type of level ('player', 'coven')
     * @returns {string} Celebration ID
     */
    createLevelUpCelebration(newLevel, levelType = 'player') {
        const title = `Level ${newLevel}!`;
        const description = `You reached ${levelType} level ${newLevel}!`;

        return this.createCelebration('level_up', title, description);
    }

    /**
     * Create a milestone celebration
     * @param {string} milestoneName - Milestone name
     * @param {string} milestoneDescription - Milestone description
     * @param {string} reward - Milestone reward
     * @returns {string} Celebration ID
     */
    createMilestoneCelebration(milestoneName, milestoneDescription, reward = '') {
        return this.createCelebration('milestone', milestoneName, milestoneDescription, {
            reward: reward
        });
    }

    /**
     * Create a coven achievement celebration
     * @param {string} achievementName - Achievement name
     * @param {string} achievementDescription - Achievement description
     * @param {string} reward - Achievement reward
     * @returns {string} Celebration ID
     */
    createCovenAchievementCelebration(achievementName, achievementDescription, reward = '') {
        return this.createCelebration('coven_achievement', achievementName, achievementDescription, {
            reward: reward
        });
    }

    /**
     * Create an event completion celebration
     * @param {string} eventName - Event name
     * @param {string} eventResult - Event result
     * @param {string} reward - Event reward
     * @returns {string} Celebration ID
     */
    createEventCompletionCelebration(eventName, eventResult, reward = '') {
        const title = `Event Complete!`;
        const description = `${eventName} - ${eventResult}`;

        return this.createCelebration('event_complete', title, description, {
            reward: reward
        });
    }

    /**
     * Create a ritual completion celebration
     * @param {string} ritualName - Ritual name
     * @param {string} reward - Ritual reward
     * @returns {string} Celebration ID
     */
    createRitualCompletionCelebration(ritualName, reward = '') {
        const title = `Ritual Complete!`;
        const description = `${ritualName} completed successfully`;

        return this.createCelebration('ritual_complete', title, description, {
            reward: reward
        });
    }

    /**
     * Stop all active celebrations
     */
    stopAllCelebrations() {
        for (const [celebrationId, celebration] of this.celebrations) {
            this.endCelebration(celebrationId);
        }

        // Clear queue
        this.celebrationQueue = [];
    }

    /**
     * Get celebration system statistics
     * @returns {Object} Celebration system statistics
     */
    getStats() {
        return {
            activeCelebrations: this.celebrations.size,
            queuedCelebrations: this.celebrationQueue.length,
            maxConcurrentCelebrations: this.maxConcurrentCelebrations,
            isProcessingQueue: this.isProcessingQueue
        };
    }

    /**
     * Set maximum concurrent celebrations
     * @param {number} maxConcurrent - Maximum concurrent celebrations
     */
    setMaxConcurrentCelebrations(maxConcurrent) {
        this.maxConcurrentCelebrations = Math.max(1, maxConcurrent);
    }

    /**
     * Set celebration delay
     * @param {number} delay - Delay between celebrations in milliseconds
     */
    setCelebrationDelay(delay) {
        this.celebrationDelay = Math.max(0, delay);
    }

    /**
     * Check if celebration system is initialized
     * @returns {boolean} Whether system is initialized
     */
    isInitialized() {
        return !!(this.container && this.overlay);
    }

    /**
     * Destroy the celebration system
     */
    destroy() {
        this.stopAllCelebrations();

        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

        this.container = null;
        this.overlay = null;
    }
}

// Create global celebration animations instance
export const celebrationAnimations = new CelebrationAnimationsSystem();