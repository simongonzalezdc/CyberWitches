/**
 * Onboarding Tutorial System
 * Interactive first-5-minutes experience for new players
 * Guides players through core mechanics with contextual tooltips
 */

import { analytics } from './analytics.js';

/**
 * Tutorial steps configuration
 */
const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome, Hex Compiler',
        message: 'Magic is fading from the world. You are one of the last Hex Compilers who can preserve it. Let me show you how.',
        target: null, // Modal, no specific target
        position: 'center',
        action: null,
        highlight: false,
        canSkip: true
    },
    {
        id: 'cast_intro',
        title: 'Cast Your First Spell',
        message: 'Click the CAST button to gather magical elements. Each cast produces elemental essences needed for preservation.',
        target: '.btn-cast',
        position: 'bottom',
        action: 'cast', // Wait for cast action
        highlight: true,
        canSkip: false
    },
    {
        id: 'resources_gained',
        title: 'Elements Collected',
        message: 'Excellent! You\'ve gathered the four primal elements: Fire, Water, Air, and Crystal. These are the building blocks of all magic.',
        target: '.sidebar-stats',
        position: 'right',
        action: null,
        highlight: true,
        canSkip: false
    },
    {
        id: 'cast_more',
        title: 'Build Your Power',
        message: 'Cast 5 more times to gather enough elements to build your first preservation chamber.',
        target: '.btn-cast',
        position: 'bottom',
        action: 'cast_5', // Wait for 5 casts
        highlight: true,
        canSkip: false
    },
    {
        id: 'workstations_tab',
        title: 'Preservation Chambers',
        message: 'Now you can automate! Click the WORKSTATIONS tab to see what you can build.',
        target: '[data-tab="workstations"]',
        position: 'bottom',
        action: 'tab_workstations',
        highlight: true,
        canSkip: false
    },
    {
        id: 'first_workstation',
        title: 'Build Your First Chamber',
        message: 'Preservation chambers automatically produce ingredients while you\'re away. Build your first one now!',
        target: '.workstation-card:first-child',
        position: 'right',
        action: 'craft_workstation',
        highlight: true,
        canSkip: false
    },
    {
        id: 'workstation_producing',
        title: 'Magic Preserved!',
        message: 'Your preservation chamber is now producing resources automatically. Watch your AB (Arcane Bits) grow!',
        target: '.ab-display',
        position: 'bottom',
        action: null,
        highlight: true,
        canSkip: false
    },
    {
        id: 'inscriptions_intro',
        title: 'Permanent Upgrades',
        message: 'Inscriptions are permanent upgrades that boost your production. Check the INSCRIPTIONS tab when you have enough resources.',
        target: '[data-tab="inscriptions"]',
        position: 'bottom',
        action: null,
        highlight: true,
        canSkip: false
    },
    {
        id: 'design_tier',
        title: 'The Interface Awakens',
        message: 'Notice the glitchy effects? As you preserve more magic, the interface stabilizes. This is your progress visualized!',
        target: 'body',
        position: 'center',
        action: null,
        highlight: false,
        canSkip: false
    },
    {
        id: 'tutorial_complete',
        title: 'You\'re Ready!',
        message: 'You now know the basics! Keep casting, building chambers, and upgrading. Discover experiments, complete daily rituals, and eventually Ascend for powerful bonuses. Good luck, Hex Compiler!',
        target: null,
        position: 'center',
        action: null,
        highlight: false,
        canSkip: false
    }
];

/**
 * Onboarding Tutorial System
 */
class OnboardingSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.isComplete = false;
        this.tutorialOverlay = null;
        this.tutorialTooltip = null;
        this.highlightElement = null;
        this.actionCounter = {};

        // Bind methods
        this.handleAction = this.handleAction.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.skipTutorial = this.skipTutorial.bind(this);
        this.completeTutorial = this.completeTutorial.bind(this);
    }

    /**
     * Initialize the onboarding system
     */
    init() {
        // Check if tutorial is already complete
        const completed = localStorage.getItem('tutorial_complete');
        if (completed === 'true') {
            this.isComplete = true;
            return;
        }

        // Check if tutorial was skipped
        const skipped = localStorage.getItem('tutorial_skipped');
        if (skipped === 'true') {
            return;
        }

        // Check if this is a new player (no saves)
        const hasSave = localStorage.getItem('cyberWitchesSave');
        if (!hasSave) {
            // New player - start tutorial after a brief delay
            setTimeout(() => {
                this.start();
            }, 1000);
        }
    }

    /**
     * Start the tutorial
     */
    start() {
        if (this.isActive || this.isComplete) return;

        this.isActive = true;
        this.currentStep = 0;

        // Track tutorial start
        analytics.trackEvent('tutorial', 'start', {
            timestamp: Date.now()
        });

        // Create overlay
        this.createOverlay();

        // Show first step
        this.showStep(0);
    }

    /**
     * Create tutorial overlay
     */
    createOverlay() {
        // Create semi-transparent overlay
        this.tutorialOverlay = document.createElement('div');
        this.tutorialOverlay.id = 'tutorial-overlay';
        // Styles moved to CSS
        document.body.appendChild(this.tutorialOverlay);

        // Create tooltip container
        this.tutorialTooltip = document.createElement('div');
        this.tutorialTooltip.id = 'tutorial-tooltip';
        // Styles moved to CSS
        document.body.appendChild(this.tutorialTooltip);
    }

    /**
     * Show a specific tutorial step
     */
    showStep(stepIndex) {
        if (stepIndex >= TUTORIAL_STEPS.length) {
            this.completeTutorial();
            return;
        }

        const step = TUTORIAL_STEPS[stepIndex];
        this.currentStep = stepIndex;

        // Track step view
        analytics.trackEvent('tutorial', 'step_view', {
            step_id: step.id,
            step_index: stepIndex
        });

        // Clear previous highlight
        if (this.highlightElement) {
            this.highlightElement.remove();
            this.highlightElement = null;
        }

        // Get target element
        let targetElement = null;
        if (step.target) {
            targetElement = document.querySelector(step.target);
        }

        // Create highlight if needed
        if (step.highlight && targetElement) {
            this.createHighlight(targetElement);
        }

        // Position and show tooltip
        this.showTooltip(step, targetElement);

        // Set up action listener if needed
        if (step.action) {
            this.setupActionListener(step.action);
        }
    }

    /**
     * Create highlight around target element
     */
    createHighlight(targetElement) {
        const rect = targetElement.getBoundingClientRect();

        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'tutorial-highlight';

        // Dynamic positioning still needs to be inline
        this.highlightElement.style.top = `${rect.top - 8}px`;
        this.highlightElement.style.left = `${rect.left - 8}px`;
        this.highlightElement.style.width = `${rect.width + 16}px`;
        this.highlightElement.style.height = `${rect.height + 16}px`;

        // Static styles moved to CSS

        // Animation styles moved to CSS, no need to inject style tag

        document.body.appendChild(this.highlightElement);

        // Make target element clickable
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '120';
    }

    /**
     * Show tooltip with step content
     */
    showTooltip(step, targetElement) {
        const tooltip = this.tutorialTooltip;

        // Build tooltip content
        tooltip.innerHTML = `
            <div class="tutorial-tooltip-content">
                <h3>
                    ${step.title}
                </h3>
                <p>
                    ${step.message}
                </p>
                <div class="tutorial-tooltip-actions">
                    ${step.canSkip ? '<button class="btn-secondary tutorial-skip">Skip Tutorial</button>' : ''}
                    ${!step.action ? '<button class="btn-primary tutorial-next">Next</button>' : ''}
                </div>
                <div class="tutorial-progress">
                    Step ${this.currentStep + 1} of ${TUTORIAL_STEPS.length}
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(tooltip, step.position, targetElement);

        // Add event listeners
        const skipBtn = tooltip.querySelector('.tutorial-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', this.skipTutorial);
        }

        const nextBtn = tooltip.querySelector('.tutorial-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', this.nextStep);
        }
    }

    /**
     * Position tooltip relative to target
     */
    positionTooltip(tooltip, position, targetElement) {
        if (position === 'center' || !targetElement) {
            // Center on screen
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
        } else {
            const rect = targetElement.getBoundingClientRect();

            switch (position) {
                case 'top':
                    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 16}px`;
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.transform = 'translateX(-50%)';
                    break;
                case 'bottom':
                    tooltip.style.top = `${rect.bottom + 16}px`;
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.transform = 'translateX(-50%)';
                    break;
                case 'left':
                    tooltip.style.top = `${rect.top + rect.height / 2}px`;
                    tooltip.style.left = `${rect.left - tooltip.offsetWidth - 16}px`;
                    tooltip.style.transform = 'translateY(-50%)';
                    break;
                case 'right':
                    tooltip.style.top = `${rect.top + rect.height / 2}px`;
                    tooltip.style.left = `${rect.right + 16}px`;
                    tooltip.style.transform = 'translateY(-50%)';
                    break;
            }
        }
    }

    /**
     * Setup action listener for step completion
     */
    setupActionListener(action) {
        // Reset action counter
        if (!this.actionCounter[action]) {
            this.actionCounter[action] = 0;
        }

        // Actions are handled externally via handleAction()
    }

    /**
     * Handle action from game (called externally)
     */
    handleAction(actionType, _data = {}) {
        if (!this.isActive) return;

        const currentStep = TUTORIAL_STEPS[this.currentStep];
        if (!currentStep || !currentStep.action) return;

        // Check if action matches current step
        if (currentStep.action === actionType) {
            // Simple action - advance immediately
            this.nextStep();
        } else if (currentStep.action === 'cast_5' && actionType === 'cast') {
            // Multiple casts required
            this.actionCounter.cast_5 = (this.actionCounter.cast_5 || 0) + 1;

            if (this.actionCounter.cast_5 >= 5) {
                this.nextStep();
            } else {
                // Update tooltip to show progress
                const tooltip = this.tutorialTooltip;
                const message = tooltip.querySelector('p');
                if (message) {
                    const remaining = 5 - this.actionCounter.cast_5;
                    message.textContent = `Great! Cast ${remaining} more ${remaining === 1 ? 'time' : 'times'} to continue.`;
                }
            }
        }
    }

    /**
     * Advance to next step
     */
    nextStep() {
        // Track step completion
        const currentStep = TUTORIAL_STEPS[this.currentStep];
        analytics.trackEvent('tutorial', 'step_complete', {
            step_id: currentStep.id,
            step_index: this.currentStep
        });

        // Show next step
        this.showStep(this.currentStep + 1);
    }

    /**
     * Skip tutorial
     */
    skipTutorial() {
        // Track skip
        analytics.trackEvent('tutorial', 'skip', {
            step_index: this.currentStep
        });

        // Mark as skipped
        localStorage.setItem('tutorial_skipped', 'true');

        // Clean up
        this.cleanup();
    }

    /**
     * Complete tutorial
     */
    completeTutorial() {
        // Track completion
        analytics.trackEvent('tutorial', 'complete', {
            timestamp: Date.now()
        });

        // Mark as complete
        localStorage.setItem('tutorial_complete', 'true');
        this.isComplete = true;

        // Show completion message
        if (this.tutorialTooltip) {
            this.tutorialTooltip.innerHTML = `
                <div class="tutorial-tooltip-content">
                    <h3 class="success-title">
                        Tutorial Complete!
                    </h3>
                    <p>
                        You're now a certified Hex Compiler! Keep exploring, and may your magic never fade.
                    </p>
                    <div class="tutorial-tooltip-actions">
                        <button class="btn-primary tutorial-finish">Let's Go!</button>
                    </div>
                </div>
            `;

            const finishBtn = this.tutorialTooltip.querySelector('.tutorial-finish');
            finishBtn.addEventListener('click', () => {
                this.cleanup();
            });
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
            this.cleanup();
        }, 3000);
    }

    /**
     * Clean up tutorial UI
     */
    cleanup() {
        this.isActive = false;

        // Remove overlay
        if (this.tutorialOverlay) {
            this.tutorialOverlay.style.opacity = '0';
            setTimeout(() => {
                this.tutorialOverlay?.remove();
                this.tutorialOverlay = null;
            }, 300);
        }

        // Remove tooltip
        if (this.tutorialTooltip) {
            this.tutorialTooltip.style.opacity = '0';
            setTimeout(() => {
                this.tutorialTooltip?.remove();
                this.tutorialTooltip = null;
            }, 300);
        }

        // Remove highlight
        if (this.highlightElement) {
            this.highlightElement.remove();
            this.highlightElement = null;
        }

        // Reset z-index of any highlighted elements
        /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[style*="z-index: 120"]')).forEach(el => {
            el.style.zIndex = '';
        });
    }

    /**
     * Restart tutorial (for testing or user request)
     */
    restart() {
        localStorage.removeItem('tutorial_complete');
        localStorage.removeItem('tutorial_skipped');
        this.isComplete = false;
        this.cleanup();
        this.start();
    }

    /**
     * Check if tutorial should be shown
     */
    shouldShow() {
        const completed = localStorage.getItem('tutorial_complete');
        const skipped = localStorage.getItem('tutorial_skipped');
        return !completed && !skipped;
    }
}

// Create singleton instance
export const onboarding = new OnboardingSystem();

// Export helper functions
export function startTutorial() {
    onboarding.start();
}

export function skipTutorial() {
    onboarding.skipTutorial();
}

export function restartTutorial() {
    onboarding.restart();
}

export function handleTutorialAction(actionType, data = {}) {
    onboarding.handleAction(actionType, data);
}

export function isTutorialActive() {
    return onboarding.isActive;
}

export function isTutorialComplete() {
    return onboarding.isComplete;
}

// Export default
export default onboarding;
