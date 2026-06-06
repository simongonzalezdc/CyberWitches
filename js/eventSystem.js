// Random Events System

export class EventSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.activeEvents = [];
        this.eventChance = 0.001; // 0.1% chance per tick
        this.lastEventTime = Date.now();
        this.minEventInterval = 60000; // Minimum 60 seconds between events
    }
    
    checkForEvents() {
        const now = Date.now();
        
        // Don't spawn events too frequently
        if (now - this.lastEventTime < this.minEventInterval) {
            return;
        }
        
        // Increase chance if player is active (more taps = more events)
        let adjustedChance = this.eventChance;
        if (this.gameState.totalTaps > 100) {
            adjustedChance *= 2; // Double chance after 100 taps
        }
        if (this.gameState.totalTaps > 500) {
            adjustedChance *= 1.5; // Even more after 500 taps
        }
        
        // Random chance for event
        if (Math.random() < adjustedChance) {
            this.triggerRandomEvent();
            this.lastEventTime = now;
        }
    }
    
    triggerRandomEvent() {
        const events = [
            {
                id: 'lucky_strike',
                name: 'Lucky Strike',
                description: 'All production doubled for 30 seconds!',
                duration: 30,
                effect: (mult) => mult * 2.0
            },
            {
                id: 'windfall',
                name: 'Windfall',
                description: 'Instant AB bonus!',
                instant: true,
                reward: () => Math.max(100, this.gameState.ab * 0.1)
            },
            {
                id: 'inspiration',
                name: 'Inspiration',
                description: 'Double cast rewards for 20 seconds!',
                duration: 20,
                effect: 'double_casts'
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        const result = this.activateEvent(event);
        
        // Show notification about event
        if (window.showNotification) {
            if (result.type === 'instant') {
                window.showNotification(`${event.name}! +${result.reward.toFixed(0)} AB`, 'success');
            } else {
                window.showNotification(`${event.name}! ${event.description}`, 'info');
            }
        }
        
        return event;
    }
    
    activateEvent(event) {
        if (event.instant) {
            // Instant reward
            const reward = event.reward();
            this.gameState.addAb(reward);
            return {
                type: 'instant',
                event: event,
                reward: reward
            };
        } else {
            // Duration-based event
            this.activeEvents.push({
                ...event,
                startTime: Date.now(),
                endTime: Date.now() + (event.duration * 1000)
            });
            
            return {
                type: 'duration',
                event: event
            };
        }
    }
    
    updateEvents(_delta) {
        for (let i = this.activeEvents.length - 1; i >= 0; i--) {
            const event = this.activeEvents[i];
            
            if (Date.now() >= event.endTime) {
                this.activeEvents.splice(i, 1);
            }
        }
    }
    
    getActiveEvents() {
        return this.activeEvents.filter(e => Date.now() < e.endTime);
    }
    
    getEventMultiplier(eventType) {
        let multiplier = 1.0;
        
        for (const event of this.activeEvents) {
            if (event.id === eventType && typeof event.effect === 'function') {
                multiplier = event.effect(multiplier);
            }
        }
        
        return multiplier;
    }
    
    hasEventEffect(effectType) {
        return this.activeEvents.some(e => e.effect === effectType);
    }
    
    getProductionMultiplier() {
        let mult = 1.0;
        for (const event of this.activeEvents) {
            if (event.id === 'lucky_strike' && typeof event.effect === 'function') {
                mult = event.effect(mult);
            }
        }
        return mult;
    }
}
