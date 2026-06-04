/**
 * Tutorial/Onboarding System
 * Provides guided onboarding for new players
 */

class TutorialSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentStep = 0;
        this.completedSteps = new Set();
        this.tutorialSteps = [];
        this.init();
    }
    
    init() {
        // Load tutorial progress
        this.loadProgress();
        
        // Create tutorial steps
        this.createTutorialSteps();
        
        // Check if tutorial should start
        if (this.shouldStartTutorial()) {
            this.startTutorial();
        }
    }
    
    /**
     * Load tutorial progress from localStorage
     */
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
    
    /**
     * Save tutorial progress to localStorage
     */
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
    
    /**
     * Check if tutorial should start
     */
    shouldStartTutorial() {
        // Check if tutorial was already completed
        const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
        if (tutorialCompleted) {
            return false;
        }
        
        // Check if tutorial was explicitly skipped
        const tutorialSkipped = localStorage.getItem('tutorialSkipped') === 'true';
        if (tutorialSkipped) {
            return false;
        }
        
        // Start if no steps completed and game is truly new
        // Check multiple properties to ensure game is new
        const isNewGame = !this.gameState || (
            (this.gameState.totalTaps === 0 || this.gameState.totalTaps === undefined) && 
            (this.gameState.abTotalEarned === 0 || this.gameState.abTotalEarned === undefined) &&
            (this.gameState.ab === 0 || this.gameState.ab === undefined) &&
            Object.keys(this.gameState.inventory || {}).length === 0
        );
        
        return this.completedSteps.size === 0 && isNewGame;
    }
    
    /**
     * Create tutorial steps
     */
    createTutorialSteps() {
        this.tutorialSteps = [
            {
                id: 'welcome',
                title: 'Welcome, Hex Compiler',
                message: 'In a distant future where magic and technology converged, something went wrong. Magic is fading—and once it\'s gone, it won\'t return.\n\nYou are a Hex Compiler—one of the last who can translate magical hexes into executable hexadecimal code. You compile spells into stable data structures, program algorithms that resist entropy, and build digital preservation chambers.\n\nYour mission: Compile hexes into code before magic fades. Every hex you translate, every chamber you program, every algorithm you optimize—it all pushes back against the inevitable.\n\nLet\'s begin.',
                target: null,
                position: 'center',
                action: null
            },
            {
                id: 'cast_button',
                title: 'Cast Your First Spell',
                message: 'Click Cast to gather elemental essences before they fade: Fire, Water, Air, Crystal, and Aether.\n\nEach spell pulls magic from a dwindling pool. The elements respond to your call—but not for much longer. Gather them while you still can.',
                target: '#cast-button',
                position: 'bottom',
                action: () => {
                    // Highlight cast button
                    const btn = document.getElementById('cast-button');
                    if (btn) {
                        btn.style.boxShadow = '0 0 20px rgba(255, 45, 170, 0.8)';
                        btn.style.animation = 'pulse 1s infinite';
                    }
                }
            },
            {
                id: 'workstations',
                title: 'Build Preservation Chambers',
                message: 'Preservation chambers capture and hold spell energy before it fades. They stabilize fading essences into materials that won\'t fade.',
                target: '.tab-btn[data-tab="workstations"]',
                position: 'bottom',
                action: () => {
                    // Switch to workstations tab
                    if (window.switchTab) {
                        window.switchTab('workstations');
                    }
                }
            },
            {
                id: 'craft_workstation',
                title: 'Craft Your First Preservation Chamber',
                message: 'Click "Craft x1" to build your first preservation chamber. Each element fades at a different rate—preserve what you can.',
                target: '.card button[data-action="craft"]',
                position: 'top',
                action: null
            },
            {
                id: 'inscriptions',
                title: 'Refine Your Preservation Techniques',
                message: 'Buy permanent upgrades in Inscriptions to refine your preservation techniques and fight the fading more effectively.',
                target: '.tab-btn[data-tab="inscriptions"]',
                position: 'bottom',
                action: () => {
                    if (window.switchTab) {
                        window.switchTab('inscriptions');
                    }
                }
            },
            {
                id: 'complete',
                title: 'Tutorial Complete!',
                message: 'You\'re ready! Explore tabs and experiment.',
                target: null,
                position: 'center',
                action: null
            }
        ];
    }
    
    /**
     * Start tutorial
     */
    startTutorial() {
        if (this.tutorialSteps.length === 0) return;
        
        this.currentStep = 0;
        this.showStep(this.currentStep);
    }
    
    /**
     * Show tutorial step
     * @param {number} stepIndex - Step index
     */
    showStep(stepIndex) {
        if (stepIndex >= this.tutorialSteps.length) {
            this.completeTutorial();
            return;
        }
        
        const step = this.tutorialSteps[stepIndex];
        this.currentStep = stepIndex;
        
        // Create or update tutorial overlay
        this.createTutorialOverlay(step);
        
        // Execute step action if any
        if (step.action && typeof step.action === 'function') {
            step.action();
        }
        
        // Save progress
        this.saveProgress();
    }
    
    /**
     * Create tutorial overlay
     * @param {Object} step - Tutorial step
     */
    createTutorialOverlay(step) {
        // Remove existing overlay
        const existing = document.getElementById('tutorial-overlay');
        if (existing) {
            existing.remove();
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'tutorial-overlay';
        
        // Create backdrop - use pointer-events: none so it doesn't block clicks
        const backdrop = document.createElement('div');
        backdrop.className = 'tutorial-backdrop';
        backdrop.style.pointerEvents = 'none'; // Don't block clicks
        overlay.appendChild(backdrop);
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tutorial-tooltip tutorial-tooltip-${step.position}`;
        
        const title = document.createElement('h3');
        title.textContent = step.title;
        tooltip.appendChild(title);
        
        const message = document.createElement('p');
        message.textContent = step.message;
        tooltip.appendChild(message);
        
        const buttons = document.createElement('div');
        buttons.className = 'tutorial-buttons';
        
        if (this.currentStep > 0) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Previous';
            prevBtn.className = 'btn-secondary';
            prevBtn.addEventListener('click', () => {
                this.showStep(this.currentStep - 1);
            });
            buttons.appendChild(prevBtn);
        }
        
        const nextBtn = document.createElement('button');
        nextBtn.textContent = this.currentStep === this.tutorialSteps.length - 1 ? 'Finish' : 'Next';
        nextBtn.className = 'btn-primary';
        nextBtn.addEventListener('click', () => {
            this.completeStep(step.id);
            this.showStep(this.currentStep + 1);
        });
        buttons.appendChild(nextBtn);
        
        const skipBtn = document.createElement('button');
        skipBtn.textContent = 'Skip Tutorial';
        skipBtn.className = 'btn-secondary';
        skipBtn.addEventListener('click', () => {
            this.skipTutorial();
        });
        buttons.appendChild(skipBtn);
        
        tooltip.appendChild(buttons);
        overlay.appendChild(tooltip);
        
        // Position tooltip near target if specified
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + 10}px`;
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.transform = 'translateX(-50%)';
                
                // Highlight target
                target.style.outline = '3px solid var(--primary)';
                target.style.outlineOffset = '5px';
                target.style.zIndex = '10000';
            }
        }
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Complete tutorial step
     * @param {string} stepId - Step ID
     */
    completeStep(stepId) {
        this.completedSteps.add(stepId);
        this.saveProgress();
    }
    
    /**
     * Complete tutorial
     */
    completeTutorial() {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Remove all highlights
        document.querySelectorAll('[style*="outline"]').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
            el.style.zIndex = '';
        });
        
        // Mark all steps as completed
        this.tutorialSteps.forEach(step => {
            this.completedSteps.add(step.id);
        });
        this.saveProgress();
        
        // Mark tutorial as completed in localStorage
        localStorage.setItem('tutorialCompleted', 'true');
        
        if (window.showNotification) {
            window.showNotification('Tutorial completed!', 'success');
        }
    }
    
    /**
     * Skip tutorial
     */
    skipTutorial() {
        if (confirm('Are you sure you want to skip the tutorial?')) {
            // Mark as skipped so it doesn't auto-start again
            localStorage.setItem('tutorialSkipped', 'true');
            this.completeTutorial();
        }
    }
    
    /**
     * Reset tutorial
     */
    reset() {
        this.currentStep = 0;
        this.completedSteps.clear();
        localStorage.removeItem('tutorialProgress');
        localStorage.removeItem('tutorialCompleted');
    }
}

// Create global instance
const tutorialSystem = null;

// Global functions
window.startTutorial = () => {
    if (tutorialSystem) {
        tutorialSystem.startTutorial();
    }
};

window.resetTutorial = () => {
    if (tutorialSystem) {
        tutorialSystem.reset();
    }
};

export default TutorialSystem;

