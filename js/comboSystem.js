// Combo/Streak System

export class ComboSystem {
    constructor() {
        this.comboCount = 0;
        this.maxCombo = 0;
        this.lastActionTime = 0;
        this.comboTimeout = 2000; // 2 seconds to maintain combo
        this.comboMultiplier = 1.0;
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
    }
}

