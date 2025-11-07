import { handleError, safeFunction } from './errorHandler.js';

/**
 * Coven Achievement System - Manages coven-level achievements and rewards
 * Handles collaborative achievements that benefit all coven members
 */

/**
 * @typedef {Object} CovenAchievement
 * @property {string} id - Unique achievement identifier
 * @property {string} name - Achievement display name
 * @property {string} description - Achievement description
 * @property {string} category - Achievement category ('production', 'collaboration', 'milestone', 'special')
 * @property {Object} requirement - Achievement requirement
 * @property {Object} reward - Achievement reward
 * @property {number} points - Achievement points for coven progression
 * @property {boolean} secret - Whether achievement is hidden until unlocked
 * @property {number} unlockedAt - Timestamp when achievement was unlocked (0 if not unlocked)
 */

/**
 * Coven Achievement System class
 */
export class CovenAchievementSystem {
    /**
     * Create a new CovenAchievementSystem instance
     * @param {CovenSystem} covenSystem - Reference to the coven system
     */
    constructor(covenSystem) {
        this.covenSystem = covenSystem;
        this.achievements = [];
        this.unlockedAchievements = new Set();
        this.achievementProgress = new Map();
        
        // Callbacks for UI updates
        this.onAchievementUnlocked = null;
        this.onProgressUpdated = null;
        
        this.initializeAchievements();
    }
    
    /**
     * Initialize all coven achievements
     * @private
     */
    initializeAchievements() {
        this.achievements = [
            // Production achievements
            {
                id: 'coven_prod_1k',
                name: 'Coven Production I',
                description: 'Coven collectively produces 1,000 AB',
                category: 'production',
                requirement: { type: 'coven_total_production', target: 1000 },
                reward: { type: 'coven_bonus', value: 0.02, duration: 3600 },
                points: 10,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_prod_10k',
                name: 'Coven Production II',
                description: 'Coven collectively produces 10,000 AB',
                category: 'production',
                requirement: { type: 'coven_total_production', target: 10000 },
                reward: { type: 'coven_bonus', value: 0.05, duration: 7200 },
                points: 25,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_prod_100k',
                name: 'Coven Production III',
                description: 'Coven collectively produces 100,000 AB',
                category: 'production',
                requirement: { type: 'coven_total_production', target: 100000 },
                reward: { type: 'coven_bonus', value: 0.10, duration: 14400 },
                points: 50,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_prod_1m',
                name: 'Coven Production Master',
                description: 'Coven collectively produces 1,000,000 AB',
                category: 'production',
                requirement: { type: 'coven_total_production', target: 1000000 },
                reward: { type: 'coven_bonus', value: 0.15, duration: 28800 },
                points: 100,
                secret: false,
                unlockedAt: 0
            },
            
            // Collaboration achievements
            {
                id: 'coven_members_5',
                name: 'Growing Coven',
                description: 'Reach 5 coven members',
                category: 'collaboration',
                requirement: { type: 'coven_members', target: 5 },
                reward: { type: 'coven_bonus', value: 0.03, duration: 7200 },
                points: 15,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_members_10',
                name: 'Thriving Coven',
                description: 'Reach 10 coven members',
                category: 'collaboration',
                requirement: { type: 'coven_members', target: 10 },
                reward: { type: 'coven_bonus', value: 0.07, duration: 14400 },
                points: 30,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_rituals_10',
                name: 'Ritual Masters',
                description: 'Complete 10 collaborative rituals',
                category: 'collaboration',
                requirement: { type: 'coven_rituals_completed', target: 10 },
                reward: { type: 'coven_bonus', value: 0.05, duration: 10800 },
                points: 40,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_rituals_50',
                name: 'Ritual Legends',
                description: 'Complete 50 collaborative rituals',
                category: 'collaboration',
                requirement: { type: 'coven_rituals_completed', target: 50 },
                reward: { type: 'coven_bonus', value: 0.12, duration: 21600 },
                points: 75,
                secret: false,
                unlockedAt: 0
            },
            
            // Milestone achievements
            {
                id: 'coven_level_5',
                name: 'Established Coven',
                description: 'Reach coven level 5',
                category: 'milestone',
                requirement: { type: 'coven_level', target: 5 },
                reward: { type: 'coven_bonus', value: 0.04, duration: 7200 },
                points: 20,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_level_10',
                name: 'Powerful Coven',
                description: 'Reach coven level 10',
                category: 'milestone',
                requirement: { type: 'coven_level', target: 10 },
                reward: { type: 'coven_bonus', value: 0.08, duration: 14400 },
                points: 50,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_level_25',
                name: 'Legendary Coven',
                description: 'Reach coven level 25',
                category: 'milestone',
                requirement: { type: 'coven_level', target: 25 },
                reward: { type: 'coven_bonus', value: 0.15, duration: 28800 },
                points: 100,
                secret: false,
                unlockedAt: 0
            },
            
            // Special achievements
            {
                id: 'coven_daily_streak_7',
                name: 'Daily Devotion',
                description: 'All members contribute for 7 consecutive days',
                category: 'special',
                requirement: { type: 'coven_daily_streak', target: 7 },
                reward: { type: 'coven_bonus', value: 0.10, duration: 21600 },
                points: 60,
                secret: false,
                unlockedAt: 0
            },
            {
                id: 'coven_secret_ritual',
                name: 'Secret Knowledge',
                description: 'Discover and complete a secret ritual',
                category: 'special',
                requirement: { type: 'secret_ritual_completed', target: 1 },
                reward: { type: 'coven_bonus', value: 0.20, duration: 43200 },
                points: 150,
                secret: true,
                unlockedAt: 0
            },
            {
                id: 'coven_perfect_week',
                name: 'Week of Harmony',
                description: 'Complete all daily rituals for a full week',
                category: 'special',
                requirement: { type: 'perfect_week', target: 1 },
                reward: { type: 'coven_bonus', value: 0.25, duration: 604800 },
                points: 200,
                secret: false,
                unlockedAt: 0
            }
        ];
        
        // Initialize progress tracking
        for (const achievement of this.achievements) {
            this.achievementProgress.set(achievement.id, 0);
        }
    }
    
    /**
     * Check and update achievement progress based on coven actions
     * @param {string} actionType - Type of action
     * @param {number} value - Action value
     * @param {Object} context - Additional context for the action
     */
    updateProgress(actionType, value, context = {}) {
        if (!this.covenSystem.isInCoven()) {
            return;
        }
        
        try {
            const coven = this.covenSystem.getCurrentCoven();
            const newlyUnlocked = [];
            
            for (const achievement of this.achievements) {
                if (this.unlockedAchievements.has(achievement.id)) {
                    continue; // Skip already unlocked achievements
                }
                
                const { requirement } = achievement;
                let currentProgress = this.achievementProgress.get(achievement.id) || 0;
                let newProgress = currentProgress;
                
                // Update progress based on requirement type
                switch (requirement.type) {
                    case 'coven_total_production':
                        if (actionType === 'production') {
                            newProgress = Math.min(currentProgress + value, requirement.target);
                        }
                        break;
                        
                    case 'coven_members':
                        if (actionType === 'member_count') {
                            newProgress = Math.min(value, requirement.target);
                        }
                        break;
                        
                    case 'coven_rituals_completed':
                        if (actionType === 'ritual_completed') {
                            newProgress = Math.min(currentProgress + 1, requirement.target);
                        }
                        break;
                        
                    case 'coven_level':
                        if (actionType === 'level_up') {
                            newProgress = Math.min(value, requirement.target);
                        }
                        break;
                        
                    case 'coven_daily_streak':
                        if (actionType === 'daily_contribution') {
                            newProgress = Math.min(value, requirement.target);
                        }
                        break;
                        
                    case 'secret_ritual_completed':
                        if (actionType === 'secret_ritual') {
                            newProgress = Math.min(currentProgress + 1, requirement.target);
                        }
                        break;
                        
                    case 'perfect_week':
                        if (actionType === 'perfect_week') {
                            newProgress = Math.min(currentProgress + 1, requirement.target);
                        }
                        break;
                }
                
                // Update progress if changed
                if (newProgress !== currentProgress) {
                    this.achievementProgress.set(achievement.id, newProgress);
                    
                    if (this.onProgressUpdated) {
                        this.onProgressUpdated(achievement.id, newProgress, requirement.target);
                    }
                    
                    // Check if achievement is unlocked
                    if (newProgress >= requirement.target) {
                        this.unlockAchievement(achievement);
                        newlyUnlocked.push(achievement);
                    }
                }
            }
            
            return newlyUnlocked;
        } catch (error) {
            handleError(error, 'covenAchievementUpdate');
            return [];
        }
    }
    
    /**
     * Unlock an achievement and apply rewards
     * @param {CovenAchievement} achievement - Achievement to unlock
     * @private
     */
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        achievement.unlockedAt = Date.now();
        
        // Apply reward to coven
        this.applyReward(achievement.reward);
        
        // Add achievement points to coven
        if (this.covenSystem.currentCoven) {
            this.covenSystem.addCovenExperience(achievement.points);
        }
        
        if (this.onAchievementUnlocked) {
            this.onAchievementUnlocked(achievement);
        }
    }
    
    /**
     * Apply achievement reward to coven
     * @param {Object} reward - Reward to apply
     * @private
     */
    applyReward(reward) {
        switch (reward.type) {
            case 'coven_bonus':
                // Add temporary production bonus to coven
                this.covenSystem.addTemporaryBonus(reward.value, reward.duration);
                break;
            case 'coven_exp':
                // Add experience to coven
                this.covenSystem.addCovenExperience(reward.value);
                break;
            case 'member_reward':
                // Give rewards to all coven members
                this.distributeMemberRewards(reward);
                break;
        }
    }
    
    /**
     * Distribute rewards to all coven members
     * @param {Object} reward - Reward to distribute
     * @private
     */
    distributeMemberRewards(reward) {
        // In a real implementation, this would distribute rewards to all members
        // For now, we'll just log the reward distribution
        console.log(`Distributed ${reward.value} ${reward.resource} to all coven members`);
    }
    
    /**
     * Get achievement progress for a specific achievement
     * @param {string} achievementId - Achievement ID
     * @returns {Object} Progress information
     */
    getAchievementProgress(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) {
            return null;
        }
        
        return {
            achievement: achievement,
            progress: this.achievementProgress.get(achievementId) || 0,
            target: achievement.requirement.target,
            isUnlocked: this.unlockedAchievements.has(achievementId),
            unlockedAt: achievement.unlockedAt
        };
    }
    
    /**
     * Get all achievements in a specific category
     * @param {string} category - Achievement category
     * @returns {Array} Array of achievements with progress
     */
    getAchievementsByCategory(category) {
        return this.achievements
            .filter(a => a.category === category)
            .map(achievement => ({
                ...achievement,
                progress: this.achievementProgress.get(achievement.id) || 0,
                isUnlocked: this.unlockedAchievements.has(achievement.id)
            }));
    }
    
    /**
     * Get all unlocked achievements
     * @returns {Array} Array of unlocked achievements
     */
    getUnlockedAchievements() {
        return this.achievements
            .filter(a => this.unlockedAchievements.has(a.id))
            .sort((a, b) => b.unlockedAt - a.unlockedAt);
    }
    
    /**
     * Get achievement statistics
     * @returns {Object} Achievement statistics
     */
    getAchievementStats() {
        const totalPoints = this.achievements.reduce((sum, a) => sum + a.points, 0);
        const unlockedPoints = this.achievements
            .filter(a => this.unlockedAchievements.has(a.id))
            .reduce((sum, a) => sum + a.points, 0);
        
        return {
            totalAchievements: this.achievements.length,
            unlockedAchievements: this.unlockedAchievements.size,
            totalPoints: totalPoints,
            unlockedPoints: unlockedPoints,
            completionPercentage: (this.unlockedAchievements.size / this.achievements.length) * 100,
            pointsPercentage: totalPoints > 0 ? (unlockedPoints / totalPoints) * 100 : 0
        };
    }
    
    /**
     * Save achievement data
     * @returns {Object} Serializable achievement data
     */
    saveAchievementData() {
        return {
            unlockedAchievements: Array.from(this.unlockedAchievements),
            achievementProgress: Object.fromEntries(this.achievementProgress),
            achievements: this.achievements.map(a => ({
                id: a.id,
                unlockedAt: a.unlockedAt
            }))
        };
    }
    
    /**
     * Load achievement data
     * @param {Object} data - Saved achievement data
     */
    loadAchievementData(data) {
        if (!data) {
            return;
        }
        
        this.unlockedAchievements = new Set(data.unlockedAchievements || []);
        this.achievementProgress = new Map(Object.entries(data.achievementProgress || {}));
        
        // Update achievement unlock times
        if (data.achievements) {
            for (const savedAchievement of data.achievements) {
                const achievement = this.achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.unlockedAt = savedAchievement.unlockedAt || 0;
                }
            }
        }
    }
}