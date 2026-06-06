/**
 * Tutorial/Onboarding System
 * Provides guided onboarding for new players
 * REDESIGNED: Boot Sequence Style
 */
import { notify as defaultNotify } from '../../ui/notifier.js';

export class TutorialSystem {
    constructor(gameState, notify = defaultNotify) {
        this.gameState = gameState;
        // Depend on the notifier port, not the whole UIManager.
        this.notify = notify;
        this.currentStep = 0;
        this.completedSteps = new Set();
        this.tutorialSteps = [];
        this.init();
    }

    init() {
        this.loadProgress();
        this.createTutorialSteps();

        // Check if tutorial/boot sequence should start
        if (this.shouldStartTutorial()) {
            this.startBootSequence();
        } else {
            // Ensure boot screen is hidden if not needed
            const bootScreen = document.getElementById('boot-screen');
            if (bootScreen) bootScreen.style.display = 'none';
        }
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('tutorialProgress');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentStep = data.currentStep || 0;
                this.completedSteps = new Set(data.completedSteps || []);
            }
        } catch (error) {
            console.error('Failed to load tutorial progress:', error);
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('tutorialProgress', JSON.stringify({
                currentStep: this.currentStep,
                completedSteps: Array.from(this.completedSteps)
            }));
        } catch (error) {
            console.error('Failed to save tutorial progress:', error);
        }
    }

    shouldStartTutorial() {
        const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
        if (tutorialCompleted) return false;

        const tutorialSkipped = localStorage.getItem('tutorialSkipped') === 'true';
        if (tutorialSkipped) return false;

        const isNewGame = !this.gameState || (
            (this.gameState.totalTaps === 0 || this.gameState.totalTaps === undefined) &&
            (this.gameState.abTotalEarned === 0 || this.gameState.abTotalEarned === undefined) &&
            (this.gameState.ab === 0 || this.gameState.ab === undefined)
        );

        return this.completedSteps.size === 0 && isNewGame;
    }

    /**
     * Start the Boot Sequence (Diegetic Onboarding)
     */
    startBootSequence() {
        const bootScreen = document.getElementById('boot-screen');
        if (!bootScreen) return;

        bootScreen.style.display = 'flex';
        bootScreen.style.flexDirection = 'column';
        bootScreen.style.justifyContent = 'center';
        bootScreen.style.alignItems = 'flex-start';
        bootScreen.style.padding = '40px';
        bootScreen.style.background = '#000';
        bootScreen.style.color = '#39FF14'; // Retro green
        bootScreen.style.fontFamily = 'monospace';
        bootScreen.style.position = 'fixed';
        bootScreen.style.top = '0';
        bootScreen.style.left = '0';
        bootScreen.style.width = '100%';
        bootScreen.style.height = '100%';
        bootScreen.style.zIndex = '140';

        const lines = [
            '> KERNEL_INIT...',
            '> LOADING_MAGIC_DRIVERS... [OK]',
            '> CONNECTING_TO_AETHER_NET... [OK]',
            '> COMPILING_HEX_PROTOCOLS... [OK]',
            '> ERROR: MAGIC_RESERVES_CRITICAL.',
            '> ACTION_REQUIRED: MANUAL_INTERVENTION.',
            '> INITIALIZING_USER_INTERFACE...'
        ];

        let lineIndex = 0;
        bootScreen.innerHTML = ''; // Clear previous

        const addLine = () => {
            if (lineIndex >= lines.length) {
                setTimeout(() => {
                    this.endBootSequence(bootScreen);
                }, 1000);
                return;
            }

            const p = document.createElement('p');
            p.textContent = lines[lineIndex];
            p.style.margin = '5px 0';
            p.style.opacity = '0';
            p.style.animation = 'fadeIn 0.1s forwards';
            
            if (lines[lineIndex].includes('ERROR')) {
                p.style.color = '#FF2A6D'; // Red error
            }

            bootScreen.appendChild(p);
            lineIndex++;
            
            // Random typing delay
            setTimeout(addLine, Math.random() * 500 + 200);
        };

        addLine();
    }

    endBootSequence(bootScreen) {
        // Fade out boot screen
        bootScreen.style.transition = 'opacity 1s ease-out';
        bootScreen.style.opacity = '0';
        
        setTimeout(() => {
            bootScreen.style.display = 'none';
            this.startTutorialSteps();
        }, 1000);
    }

    createTutorialSteps() {
        // Tooltip-based tutorial steps
        this.tutorialSteps = [
            {
                id: 'cast_button',
                title: 'EXECUTE_PROTOCOL',
                message: 'Click EXEC to compile raw magic into data. This is your primary input method.',
                target: '#cast-button',
                position: 'top'
            },
            {
                id: 'resources',
                title: 'RESOURCE_MONITOR',
                message: 'Monitor your elemental essences here. Do not let them fade.',
                target: '#sidebar',
                position: 'right'
            },
            {
                id: 'workstations',
                title: 'SYSTEM_MODULES',
                message: 'Install workstations to automate the compilation process.',
                target: '.tab-btn[data-tab="workstations"]',
                position: 'bottom'
            }
        ];
    }

    startTutorialSteps() {
        if (this.tutorialSteps.length === 0) return;
        this.showStep(0);
    }

    showStep(stepIndex) {
        if (stepIndex >= this.tutorialSteps.length) {
            this.completeTutorial();
            return;
        }

        const step = this.tutorialSteps[stepIndex];
        this.currentStep = stepIndex;
        this.createTutorialOverlay(step);
        this.saveProgress();
    }

    createTutorialOverlay(step) {
        // Remove existing
        const existing = document.getElementById('tutorial-overlay');
        if (existing) existing.remove();

        // Create overlay container (transparent, clicks pass through except on tooltip)
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '120';
        overlay.style.pointerEvents = 'none'; // Let clicks pass through to game

        // Highlight target
        if (step.target) {
            const targetEl = document.querySelector(step.target);
            if (targetEl) {
                const rect = targetEl.getBoundingClientRect();
                
                // Create highlight box
                const highlight = document.createElement('div');
                highlight.style.position = 'absolute';
                highlight.style.top = `${rect.top - 5}px`;
                highlight.style.left = `${rect.left - 5}px`;
                highlight.style.width = `${rect.width + 10}px`;
                highlight.style.height = `${rect.height + 10}px`;
                highlight.style.border = '2px solid var(--color-code)';
                highlight.style.boxShadow = '0 0 15px var(--color-code)';
                highlight.style.borderRadius = '4px';
                highlight.style.animation = 'pulse-glow 1.5s infinite';
                highlight.style.pointerEvents = 'none';
                overlay.appendChild(highlight);

                // Create Tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'card'; // Reuse card styling
                tooltip.style.position = 'absolute';
                tooltip.style.pointerEvents = 'auto'; // Enable clicking buttons
                tooltip.style.maxWidth = '300px';
                tooltip.style.background = 'var(--bg-panel)';
                tooltip.style.border = '1px solid var(--color-code)';
                
                // Positioning logic
                if (step.position === 'top') {
                    tooltip.style.top = `${rect.top - 150}px`;
                    tooltip.style.left = `${rect.left + rect.width/2 - 150}px`;
                } else if (step.position === 'right') {
                    tooltip.style.top = `${rect.top}px`;
                    tooltip.style.left = `${rect.right + 20}px`;
                } else {
                    tooltip.style.top = `${rect.bottom + 20}px`;
                    tooltip.style.left = `${rect.left}px`;
                }

                tooltip.innerHTML = `
                    <h3 class="card-title" style="margin-bottom: 8px;">> ${step.title}</h3>
                    <p class="card-description" style="color: var(--color-system);">${step.message}</p>
                    <div style="display: flex; justify-content: flex-end; gap: 8px;">
                        <button id="tut-next" class="btn-primary">NEXT_STEP</button>
                    </div>
                `;

                overlay.appendChild(tooltip);
            }
        }

        document.body.appendChild(overlay);

        // Attach listener
        setTimeout(() => {
            const nextBtn = document.getElementById('tut-next');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.showStep(this.currentStep + 1);
                });
            }
        }, 100);
    }

    completeTutorial() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.remove();
        
        localStorage.setItem('tutorialCompleted', 'true');
        
        this.notify('SYSTEM_READY. BEGIN_OPERATIONS.', 'success');
    }
    
    skipTutorial() {
        this.completeTutorial();
    }
    
    reset() {
        localStorage.removeItem('tutorialCompleted');
        localStorage.removeItem('tutorialProgress');
        this.currentStep = 0;
        this.completedSteps.clear();
    }
}
