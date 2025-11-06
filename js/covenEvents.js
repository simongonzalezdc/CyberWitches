import { handleError, safeFunction } from './errorHandler.js';

/**
 * Coven Events System - Manages special coven events with unique rewards
 * Handles time-limited events, competitions, and special activities
 */

/**
 * @typedef {Object} CovenEvent
 * @property {string} id - Unique event identifier
 * @property {string} name - Event display name
 * @property {string} description - Event description
 * @property {string} type - Event type ('competition', 'collaboration', 'special', 'seasonal')
 * @property {number} startTime - Event start timestamp
 * @property {number} endTime - Event end timestamp
 * @property {Object} requirements - Event requirements
 * @property {Object} rewards - Event rewards
 * @property {boolean} isActive - Whether event is currently active
 * @property {Object} progress - Current event progress
 * @property {number} maxProgress - Maximum progress required
 */

/**
 * Coven Events System class
 */
export class CovenEventsSystem {
    /**
     * Create a new CovenEventsSystem instance
     * @param {CovenSystem} covenSystem - Reference to coven system
     */
    constructor(covenSystem) {
        this.covenSystem = covenSystem;
        this.events = [];
        this.activeEvents = new Map();
        this.eventHistory = [];
        
        // Callbacks for UI updates
        this.onEventStarted = null;
        this.onEventEnded = null;
        this.onProgressUpdated = null;
        this.onEventCompleted = null;
        
        // Initialize events
        this.initializeEvents();
        
        // Start event checker
        this.startEventChecker();
    }
    
    /**
     * Initialize all possible events
     * @private
     */
    initializeEvents() {
        this.events = [
            // Competition events
            {
                id: 'production_race',
                name: 'Production Race',
                description: 'Compete with other covens to produce the most AB in 24 hours',
                type: 'competition',
                requirements: { type: 'coven_members', min: 3 },
                rewards: {
                    first: { type: 'coven_bonus', value: 0.25, duration: 86400 },
                    second: { type: 'coven_bonus', value: 0.15, duration: 43200 },
                    third: { type: 'coven_bonus', value: 0.10, duration: 21600 },
                    participation: { type: 'coven_exp', value: 100 }
                },
                duration: 86400000, // 24 hours
                cooldown: 604800000, // 1 week cooldown
                isActive: false
            },
            {
                id: 'casting_marathon',
                name: 'Casting Marathon',
                description: 'Cast spells as a coven to reach the target first',
                type: 'competition',
                requirements: { type: 'coven_members', min: 2 },
                rewards: {
                    first: { type: 'coven_bonus', value: 0.20, duration: 43200 },
                    second: { type: 'coven_bonus', value: 0.12, duration: 21600 },
                    third: { type: 'coven_bonus', value: 0.08, duration: 10800 },
                    participation: { type: 'coven_exp', value: 75 }
                },
                duration: 43200000, // 12 hours
                cooldown: 259200000, // 3 days cooldown
                isActive: false
            },
            
            // Collaboration events
            {
                id: 'ritual_mastery',
                name: 'Ritual Mastery Challenge',
                description: 'Complete as many collaborative rituals as possible',
                type: 'collaboration',
                requirements: { type: 'coven_level', min: 3 },
                rewards: {
                    bronze: { type: 'coven_bonus', value: 0.10, duration: 21600, threshold: 5 },
                    silver: { type: 'coven_bonus', value: 0.15, duration: 43200, threshold: 10 },
                    gold: { type: 'coven_bonus', value: 0.25, duration: 86400, threshold: 20 },
                    participation: { type: 'coven_exp', value: 50 }
                },
                duration: 172800000, // 48 hours
                cooldown: 604800000, // 1 week cooldown
                isActive: false
            },
            {
                id: 'resource_gathering',
                name: 'Great Resource Gathering',
                description: 'Work together to gather rare resources',
                type: 'collaboration',
                requirements: { type: 'coven_level', min: 2 },
                rewards: {
                    tier1: { type: 'resource_bundle', value: 'basic', threshold: 1000 },
                    tier2: { type: 'resource_bundle', value: 'advanced', threshold: 5000 },
                    tier3: { type: 'resource_bundle', value: 'legendary', threshold: 20000 },
                    participation: { type: 'coven_exp', value: 25 }
                },
                duration: 86400000, // 24 hours
                cooldown: 432000000, // 5 days cooldown
                isActive: false
            },
            
            // Special events
            {
                id: 'mystery_ritual',
                name: 'Mystery Ritual',
                description: 'Discover and complete a mysterious ritual with unknown rewards',
                type: 'special',
                requirements: { type: 'coven_level', min: 5 },
                rewards: {
                    completion: { type: 'mystery_box', value: 'legendary' },
                    participation: { type: 'coven_exp', value: 150 }
                },
                duration: 21600000, // 6 hours
                cooldown: 1209600000, // 2 weeks cooldown
                isActive: false
            },
            {
                id: 'knowledge_sharing',
                name: 'Knowledge Sharing Festival',
                description: 'Share discoveries and recipes with coven members',
                type: 'special',
                requirements: { type: 'coven_members', min: 4 },
                rewards: {
                    tier1: { type: 'recipe_shard', value: 1, threshold: 5 },
                    tier2: { type: 'recipe_shard', value: 3, threshold: 15 },
                    tier3: { type: 'recipe_shard', value: 5, threshold: 30 },
                    participation: { type: 'coven_exp', value: 40 }
                },
                duration: 43200000, // 12 hours
                cooldown: 604800000, // 1 week cooldown
                isActive: false
            },
            
            // Seasonal events
            {
                id: 'solstice_celebration',
                name: 'Summer Solstice Celebration',
                description: 'Celebrate the solstice with enhanced magical energies',
                type: 'seasonal',
                requirements: { type: 'coven_level', min: 1 },
                rewards: {
                    completion: { type: 'seasonal_bonus', value: 0.30, duration: 1209600 },
                    participation: { type: 'seasonal_currency', value: 100 }
                },
                duration: 259200000, // 3 days
                seasonal: 'summer',
                isActive: false
            },
            {
                id: 'harvest_festival',
                name: 'Harvest Festival',
                description: 'Gather magical resources during the harvest season',
                type: 'seasonal',
                requirements: { type: 'coven_level', min: 2 },
                rewards: {
                    completion: { type: 'seasonal_bonus', value: 0.25, duration: 1209600 },
                    participation: { type: 'seasonal_currency', value: 150 }
                },
                duration: 259200000, // 3 days
                seasonal: 'autumn',
                isActive: false
            }
        ];
    }
    
    /**
     * Start the event checker to automatically activate events
     * @private
     */
    startEventChecker() {
        // Check for events every minute
        setInterval(() => {
            this.checkAndStartEvents();
            this.checkAndEndEvents();
        }, 60000);
        
        // Initial check
        this.checkAndStartEvents();
    }
    
    /**
     * Check and start eligible events
     * @private
     */
    checkAndStartEvents() {
        if (!this.covenSystem.isInCoven()) {
            return;
        }
        
        const coven = this.covenSystem.getCurrentCoven();
        const now = Date.now();
        
        for (const eventTemplate of this.events) {
            // Skip if event is already active
            if (this.activeEvents.has(eventTemplate.id)) {
                continue;
            }
            
            // Check seasonal events
            if (eventTemplate.type === 'seasonal' && !this.isSeasonActive(eventTemplate.seasonal)) {
                continue;
            }
            
            // Check cooldown
            const lastEvent = this.eventHistory.find(e => e.id === eventTemplate.id);
            if (lastEvent && (now - lastEvent.endTime) < eventTemplate.cooldown) {
                continue;
            }
            
            // Check requirements
            if (!this.checkEventRequirements(eventTemplate.requirements, coven)) {
                continue;
            }
            
            // Random chance to start eligible events (30% chance per check)
            if (Math.random() < 0.3) {
                this.startEvent(eventTemplate);
            }
        }
    }
    
    /**
     * Check if a seasonal event should be active based on current date
     * @param {string} season - Season name
     * @returns {boolean} Whether the season is active
     * @private
     */
    isSeasonActive(season) {
        const month = new Date().getMonth(); // 0-11
        
        switch (season) {
            case 'spring': return month >= 2 && month <= 4; // March-May
            case 'summer': return month >= 5 && month <= 7; // June-August
            case 'autumn': return month >= 8 && month <= 10; // September-November
            case 'winter': return month === 11 || month <= 1; // December-February
            default: return false;
        }
    }
    
    /**
     * Check if coven meets event requirements
     * @param {Object} requirements - Event requirements
     * @param {Object} coven - Coven data
     * @returns {boolean} Whether requirements are met
     * @private
     */
    checkEventRequirements(requirements, coven) {
        if (!requirements) {
            return true;
        }
        
        if (requirements.type === 'coven_members' && coven.members.length < requirements.min) {
            return false;
        }
        
        if (requirements.type === 'coven_level' && coven.level < requirements.min) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Start an event
     * @param {Object} eventTemplate - Event template to start
     * @private
     */
    startEvent(eventTemplate) {
        const now = Date.now();
        const event = {
            ...eventTemplate,
            startTime: now,
            endTime: now + eventTemplate.duration,
            isActive: true,
            progress: 0,
            maxProgress: this.getEventMaxProgress(eventTemplate)
        };
        
        this.activeEvents.set(eventTemplate.id, event);
        
        if (this.onEventStarted) {
            this.onEventStarted(event);
        }
    }
    
    /**
     * Get maximum progress for an event
     * @param {Object} eventTemplate - Event template
     * @returns {number} Maximum progress value
     * @private
     */
    getEventMaxProgress(eventTemplate) {
        switch (eventTemplate.id) {
            case 'production_race': return 100000; // 100k AB
            case 'casting_marathon': return 10000; // 10k casts
            case 'ritual_mastery': return 50; // 50 rituals
            case 'resource_gathering': return 50000; // 50k resources
            case 'mystery_ritual': return 1; // Complete mystery ritual
            case 'knowledge_sharing': return 100; // 100 knowledge points
            case 'solstice_celebration': return 1000; // 1000 celebration points
            case 'harvest_festival': return 2000; // 2000 harvest points
            default: return 100;
        }
    }
    
    /**
     * Check and end expired events
     * @private
     */
    checkAndEndEvents() {
        const now = Date.now();
        
        for (const [eventId, event] of this.activeEvents) {
            if (now >= event.endTime) {
                this.endEvent(eventId);
            }
        }
    }
    
    /**
     * End an active event
     * @param {string} eventId - Event ID to end
     * @private
     */
    endEvent(eventId) {
        const event = this.activeEvents.get(eventId);
        if (!event) {
            return;
        }
        
        event.isActive = false;
        this.activeEvents.delete(eventId);
        this.eventHistory.push(event);
        
        // Calculate and distribute rewards
        this.calculateAndDistributeRewards(event);
        
        if (this.onEventEnded) {
            this.onEventEnded(event);
        }
    }
    
    /**
     * Calculate and distribute event rewards
     * @param {Object} event - Completed event
     * @private
     */
    calculateAndDistributeRewards(event) {
        const progressPercentage = (event.progress / event.maxProgress) * 100;
        let rewardTier = 'participation';
        
        // Determine reward tier based on event type and progress
        if (event.type === 'competition') {
            // In a real implementation, this would compare with other covens
            // For now, we'll use progress percentage
            if (progressPercentage >= 90) rewardTier = 'first';
            else if (progressPercentage >= 70) rewardTier = 'second';
            else if (progressPercentage >= 50) rewardTier = 'third';
        } else if (event.type === 'collaboration') {
            if (progressPercentage >= 80) rewardTier = 'gold';
            else if (progressPercentage >= 60) rewardTier = 'silver';
            else if (progressPercentage >= 40) rewardTier = 'bronze';
        } else if (event.type === 'special') {
            if (progressPercentage >= 100) rewardTier = 'completion';
        } else if (event.type === 'seasonal') {
            if (progressPercentage >= 75) rewardTier = 'completion';
        }
        
        // Apply rewards
        const reward = event.rewards[rewardTier];
        if (reward) {
            this.applyEventReward(reward, event);
        }
    }
    
    /**
     * Apply event reward to coven
     * @param {Object} reward - Reward to apply
     * @param {Object} event - Event context
     * @private
     */
    applyEventReward(reward, event) {
        switch (reward.type) {
            case 'coven_bonus':
                this.covenSystem.addTemporaryBonus(reward.value, reward.duration);
                break;
            case 'coven_exp':
                this.covenSystem.addCovenExperience(reward.value);
                break;
            case 'resource_bundle':
                this.distributeResourceBundle(reward.value);
                break;
            case 'mystery_box':
                this.distributeMysteryBox(reward.value);
                break;
            case 'recipe_shard':
                this.distributeRecipeShards(reward.value);
                break;
            case 'seasonal_bonus':
                this.covenSystem.addTemporaryBonus(reward.value, reward.duration);
                break;
            case 'seasonal_currency':
                this.distributeSeasonalCurrency(reward.value);
                break;
        }
    }
    
    /**
     * Distribute resource bundle to coven members
     * @param {string} tier - Bundle tier ('basic', 'advanced', 'legendary')
     * @private
     */
    distributeResourceBundle(tier) {
        const bundles = {
            basic: { crystal_dust: 500, aether_ess: 500, fire_essence: 500, water_essence: 250, air_essence: 250 },
            advanced: { shaped_crys: 50, dist_aether: 50, dist_fire: 50, dig_candle: 25, crystal_orb: 25 },
            legendary: { quantum_candle: 10, quantum_water: 5, quantum_air: 5, quantum_crystal: 3 }
        };
        
        const bundle = bundles[tier];
        if (bundle) {
            console.log(`Distributed ${tier} resource bundle to coven members:`, bundle);
        }
    }
    
    /**
     * Distribute mystery box rewards
     * @param {string} tier - Mystery box tier
     * @private
     */
    distributeMysteryBox(tier) {
        console.log(`Distributed ${tier} mystery box to coven members`);
        // In a real implementation, this would give random valuable rewards
    }
    
    /**
     * Distribute recipe shards to coven members
     * @param {number} count - Number of recipe shards
     * @private
     */
    distributeRecipeShards(count) {
        console.log(`Distributed ${count} recipe shards to coven members`);
        // In a real implementation, this would give recipe shards that can be combined
    }
    
    /**
     * Distribute seasonal currency to coven members
     * @param {number} amount - Amount of seasonal currency
     * @private
     */
    distributeSeasonalCurrency(amount) {
        console.log(`Distributed ${amount} seasonal currency to coven members`);
        // In a real implementation, this would give seasonal currency for special shop
    }
    
    /**
     * Update event progress based on coven actions
     * @param {string} actionType - Type of action
     * @param {number} value - Action value
     */
    updateEventProgress(actionType, value) {
        if (!this.covenSystem.isInCoven()) {
            return;
        }
        
        for (const [eventId, event] of this.activeEvents) {
            if (!event.isActive) {
                continue;
            }
            
            let progressIncrement = 0;
            
            // Calculate progress based on event type and action
            switch (event.id) {
                case 'production_race':
                    if (actionType === 'production') progressIncrement = value;
                    break;
                case 'casting_marathon':
                    if (actionType === 'casting') progressIncrement = value;
                    break;
                case 'ritual_mastery':
                    if (actionType === 'ritual_completed') progressIncrement = 1;
                    break;
                case 'resource_gathering':
                    if (actionType === 'resource_gathered') progressIncrement = value;
                    break;
                case 'mystery_ritual':
                    if (actionType === 'mystery_ritual_progress') progressIncrement = value;
                    break;
                case 'knowledge_sharing':
                    if (actionType === 'knowledge_shared') progressIncrement = value;
                    break;
                case 'solstice_celebration':
                case 'harvest_festival':
                    if (actionType === 'seasonal_activity') progressIncrement = value;
                    break;
            }
            
            if (progressIncrement > 0) {
                event.progress = Math.min(event.progress + progressIncrement, event.maxProgress);
                
                if (this.onProgressUpdated) {
                    this.onProgressUpdated(eventId, event.progress, event.maxProgress);
                }
                
                // Check if event is completed
                if (event.progress >= event.maxProgress) {
                    if (this.onEventCompleted) {
                        this.onEventCompleted(event);
                    }
                }
            }
        }
    }
    
    /**
     * Get all active events
     * @returns {Array} Array of active events
     */
    getActiveEvents() {
        return Array.from(this.activeEvents.values());
    }
    
    /**
     * Get event history
     * @param {number} limit - Maximum number of events to return
     * @returns {Array} Array of past events
     */
    getEventHistory(limit = 10) {
        return this.eventHistory
            .sort((a, b) => b.endTime - a.endTime)
            .slice(0, limit);
    }
    
    /**
     * Get event by ID
     * @param {string} eventId - Event ID
     * @returns {Object|null} Event object or null
     */
    getEvent(eventId) {
        return this.activeEvents.get(eventId) || null;
    }
    
    /**
     * Save event data
     * @returns {Object} Serializable event data
     */
    saveEventData() {
        return {
            activeEvents: Object.fromEntries(this.activeEvents),
            eventHistory: this.eventHistory.slice(-50) // Keep last 50 events
        };
    }
    
    /**
     * Load event data
     * @param {Object} data - Saved event data
     */
    loadEventData(data) {
        if (!data) {
            return;
        }
        
        this.activeEvents = new Map(Object.entries(data.activeEvents || {}));
        this.eventHistory = data.eventHistory || [];
        
        // Check if any loaded events should be ended
        this.checkAndEndEvents();
    }
}