// Combo/Streak System

export class ComboSystem {
    constructor() {
        this.comboCount = 0;
        this.maxCombo = 0;
        this.lastActionTime = 0;
        this.comboTimeout = 2000; // 2 seconds to maintain combo
        this.comboMultiplier = 1.0;
        this.milestoneBonuses = new Set(); // Track which milestones have been rewarded
        this.milestones = [10, 25, 50, 100, 250, 500]; // Combo milestones
    }
    
    recordAction() {
        const now = Date.now();
        
        if (now - this.lastActionTime < this.comboTimeout) {
            // Continue combo
            this.comboCount++;
        } else {
            // Reset combo
            this.comboCount = 1;
        }
        
        this.lastActionTime = now;
        
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }
        
        // Calculate multiplier (caps at 2x for 50+ combo)
        this.comboMultiplier = Math.min(1.0 + (this.comboCount * 0.02), 2.0);
        
        // Check for milestone bonuses (dopamine maximization)
        this.milestones.forEach(milestone => {
            if (this.comboCount === milestone && !this.milestoneBonuses.has(milestone)) {
                this.triggerMilestoneReward(milestone);
                this.milestoneBonuses.add(milestone);
            }
        });
    }
    
    triggerMilestoneReward(milestone) {
        // Give bonus AB
        const bonus = milestone * 0.1; // 0.1 AB per combo point
        if (window.gameState) {
            window.gameState.ab += bonus;
        }
        
        // Visual feedback
        if (window.showNotification) {
            window.showNotification(`<span class="css-icon-fire"></span> ${milestone}x Combo! +${bonus.toFixed(1)} AB`, 'success');
        }
        
        // Particle effect
        // Particle effects removed for memory optimization
        // Visual feedback now uses CSS animations
        const castButton = document.getElementById('cast-button');
        if (castButton) {
            // Use CSS animation instead of particles
            if (typeof pulseElement === 'function') {
                pulseElement(castButton, 1.15, 300);
            }
        }
        
        // Audio feedback
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('achievement');
        }
    }
    
    getComboMultiplier() {
        // Check if combo is still active
        const now = Date.now();
        if (now - this.lastActionTime > this.comboTimeout) {
            this.comboCount = 0;
            this.comboMultiplier = 1.0;
        }
        
        return this.comboMultiplier;
    }
    
    getComboCount() {
        const now = Date.now();
        if (now - this.lastActionTime > this.comboTimeout) {
            this.comboCount = 0;
        }
        return this.comboCount;
    }
    
    reset() {
        this.comboCount = 0;
        this.comboMultiplier = 1.0;
        // Don't reset milestone bonuses - they're one-time rewards
    }
}

