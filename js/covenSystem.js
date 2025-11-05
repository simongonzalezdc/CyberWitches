import { handleError, safeFunction } from './errorHandler.js';

/**
 * Coven System - Manages social features and collaborative gameplay
 * Handles coven creation, joining, and shared bonuses
 */

/**
 * @typedef {Object} CovenMember
 * @property {string} id - Unique member identifier
 * @property {string} name - Member display name
 * @property {number} contribution - Total contribution to coven
 * @property {number} joinedAt - Timestamp when member joined
 * @property {boolean} isLeader - Whether member is the coven leader
 */

/**
 * @typedef {Object} CovenRitual
 * @property {string} id - Unique ritual identifier
 * @property {string} name - Ritual display name
 * @property {string} description - Ritual description
 * @property {Object} requirements - Requirements to complete ritual
 * @property {Object} rewards - Rewards for completing ritual
 * @property {number} progress - Current progress towards completion
 * @property {number} maxProgress - Maximum progress required
 * @property {number} completedAt - Timestamp when completed (0 if not completed)
 */

/**
 * @typedef {Object} Coven
 * @property {string} id - Unique coven identifier
 * @property {string} name - Coven display name
 * @property {string} description - Coven description
 * @property {number} level - Current coven level
 * @property {number} experience - Current experience towards next level
 * @property {number} experienceToNext - Experience needed for next level
 * @property {CovenMember[]} members - Array of coven members
 * @property {CovenRitual[]} activeRituals - Array of active collaborative rituals
 * @property {number} createdAt - Timestamp when coven was created
 * @property {Object} stats - Coven statistics
 */

/**
 * Coven System class for managing social features
 */
export class CovenSystem {
    /**
     * Create a new CovenSystem instance
     * @param {GameState} gameState - Reference to the main game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        
        /** @type {Coven|null} */
        this.currentCoven = null;
        
        /** @type {string|null} */
        this.playerId = null;
        
        /** @type {string|null} */
        this.playerName = null;
        
        // Callbacks for UI updates
        this.onCovenJoined = null;
        this.onCovenLeft = null;
        this.onMemberJoined = null;
        this.onMemberLeft = null;
        this.onRitualProgress = null;
        this.onRitualCompleted = null;
        this.onCovenLevelUp = null;
        
        // Initialize with mock data for solo play
        this.initializeMockData();
    }
    
    /**
     * Initialize mock data for solo play testing
     * @private
     */
    initializeMockData() {
        // Generate a unique player ID if not exists
        if (!this.playerId) {
            this.playerId = this.generatePlayerId();
        }
        
        // Set default player name if not exists
        if (!this.playerName) {
            this.playerName = `CyberWitch_${this.playerId.substring(0, 8)}`;
        }
    }
    
    /**
     * Generate a unique player identifier
     * @returns {string} Unique player ID
     * @private
     */
    generatePlayerId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Create a new coven
     * @param {string} name - Coven name
     * @param {string} description - Coven description
     * @returns {boolean} True if coven was created successfully
     */
    createCoven(name, description) {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Coven name cannot be empty');
            }
            
            if (name.length > 50) {
                throw new Error('Coven name cannot exceed 50 characters');
            }
            
            if (this.currentCoven) {
                throw new Error('You are already in a coven');
            }
            
            const newCoven = {
                id: this.generateCovenId(),
                name: name.trim(),
                description: description.trim() || 'A mysterious coven of cyber witches',
                level: 1,
                experience: 0,
                experienceToNext: this.getExperienceForLevel(2),
                members: [{
                    id: this.playerId,
                    name: this.playerName,
                    contribution: 0,
                    joinedAt: Date.now(),
                    isLeader: true
                }],
                activeRituals: this.generateInitialRituals(),
                createdAt: Date.now(),
                stats: {
                    totalProduction: 0,
                    totalRitualsCompleted: 0,
                    totalMembersJoined: 1
                }
            };
            
            this.currentCoven = newCoven;
            
            if (this.onCovenJoined) {
                this.onCovenJoined(newCoven);
            }
            
            return true;
        } catch (error) {
            handleError(error, 'covenCreate');
            return false;
        }
    }
    
    /**
     * Generate a unique coven identifier
     * @returns {string} Unique coven ID
     * @private
     */
    generateCovenId() {
        return 'coven_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Get experience required for a specific level
     * @param {number} level - Target level
     * @returns {number} Experience required
     * @private
     */
    getExperienceForLevel(level) {
        // Exponential scaling: 100 * 1.5^(level-1)
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    /**
     * Generate initial collaborative rituals for a new coven
     * @returns {CovenRitual[]} Array of initial rituals
     * @private
     */
    generateInitialRituals() {
        return [
            {
                id: 'coven_production_1',
                name: 'Coven Production Circle',
                description: 'Collectively produce 1000 AB',
                requirements: { type: 'production', target: 1000, resource: 'ab' },
                rewards: { experience: 50, covenBonus: 0.05 },
                progress: 0,
                maxProgress: 1000,
                completedAt: 0
            },
            {
                id: 'coven_casting_1',
                name: 'Group Casting Ritual',
                description: 'Cast spells 500 times collectively',
                requirements: { type: 'casting', target: 500 },
                rewards: { experience: 30, covenBonus: 0.03 },
                progress: 0,
                maxProgress: 500,
                completedAt: 0
            },
            {
                id: 'coven_crafting_1',
                name: 'Collaborative Crafting',
                description: 'Craft 50 workstations collectively',
                requirements: { type: 'crafting', target: 50 },
                rewards: { experience: 40, covenBonus: 0.04 },
                progress: 0,
                maxProgress: 50,
                completedAt: 0
            }
        ];
    }
    
    /**
     * Join an existing coven (mock implementation)
     * @param {string} covenId - ID of coven to join
     * @returns {boolean} True if joined successfully
     */
    joinCoven(covenId) {
        try {
            if (this.currentCoven) {
                throw new Error('You are already in a coven');
            }
            
            // In a real implementation, this would fetch coven data from a server
            // For now, we'll create a mock coven to join
            const mockCoven = {
                id: covenId,
                name: 'Mock Coven for Testing',
                description: 'A mock coven for testing purposes',
                level: 3,
                experience: 150,
                experienceToNext: this.getExperienceForLevel(4),
                members: [
                    {
                        id: 'leader_123',
                        name: 'CovenLeader',
                        contribution: 1000,
                        joinedAt: Date.now() - 86400000, // 1 day ago
                        isLeader: true
                    }
                ],
                activeRituals: this.generateInitialRituals(),
                createdAt: Date.now() - 86400000,
                stats: {
                    totalProduction: 5000,
                    totalRitualsCompleted: 5,
                    totalMembersJoined: 2
                }
            };
            
            // Add current player as member
            mockCoven.members.push({
                id: this.playerId,
                name: this.playerName,
                contribution: 0,
                joinedAt: Date.now(),
                isLeader: false
            });
            
            mockCoven.stats.totalMembersJoined++;
            
            this.currentCoven = mockCoven;
            
            if (this.onCovenJoined) {
                this.onCovenJoined(mockCoven);
            }
            
            if (this.onMemberJoined) {
                this.onMemberJoined(mockCoven.members[mockCoven.members.length - 1]);
            }
            
            return true;
        } catch (error) {
            handleError(error, 'covenJoin');
            return false;
        }
    }
    
    /**
     * Leave the current coven
     * @returns {boolean} True if left successfully
     */
    leaveCoven() {
        try {
            if (!this.currentCoven) {
                throw new Error('You are not in a coven');
            }
            
            const memberIndex = this.currentCoven.members.findIndex(m => m.id === this.playerId);
            if (memberIndex === -1) {
                throw new Error('You are not a member of this coven');
            }
            
            // Remove member from coven
            this.currentCoven.members.splice(memberIndex, 1);
            this.currentCoven.stats.totalMembersJoined--;
            
            const leftCoven = this.currentCoven;
            this.currentCoven = null;
            
            if (this.onCovenLeft) {
                this.onCovenLeft(leftCoven);
            }
            
            return true;
        } catch (error) {
            handleError(error, 'covenLeave');
            return false;
        }
    }
    
    /**
     * Calculate coven production bonus based on member count
     * @returns {number} Production multiplier (1.0 = no bonus)
     */
    getCovenProductionBonus() {
        if (!this.currentCoven) {
            return 1.0;
        }
        
        const memberCount = this.currentCoven.members.length;
        const bonusPerMember = 0.05; // 5% per member
        const maxBonus = 0.25; // Max 25% bonus
        
        const bonus = Math.min(memberCount * bonusPerMember, maxBonus);
        return 1.0 + bonus;
    }
    
    /**
     * Update coven progress based on player actions
     * @param {string} actionType - Type of action ('production', 'casting', 'crafting')
     * @param {number} amount - Amount contributed
     * @param {string} [resource] - Resource type (for production actions)
     */
    updateCovenProgress(actionType, amount, resource = null) {
        if (!this.currentCoven) {
            return;
        }
        
        try {
            // Update member contribution
            const member = this.currentCoven.members.find(m => m.id === this.playerId);
            if (member) {
                member.contribution += amount;
            }
            
            // Update coven stats
            if (actionType === 'production') {
                this.currentCoven.stats.totalProduction += amount;
            }
            
            // Update ritual progress
            this.currentCoven.activeRituals.forEach(ritual => {
                if (ritual.completedAt > 0) {
                    return; // Skip completed rituals
                }
                
                const { requirements } = ritual;
                let shouldUpdate = false;
                
                switch (requirements.type) {
                    case 'production':
                        shouldUpdate = !resource || resource === requirements.resource;
                        break;
                    case 'casting':
                        shouldUpdate = actionType === 'casting';
                        break;
                    case 'crafting':
                        shouldUpdate = actionType === 'crafting';
                        break;
                }
                
                if (shouldUpdate) {
                    ritual.progress = Math.min(ritual.progress + amount, ritual.maxProgress);
                    
                    if (this.onRitualProgress) {
                        this.onRitualProgress(ritual);
                    }
                    
                    // Check if ritual is completed
                    if (ritual.progress >= ritual.maxProgress && ritual.completedAt === 0) {
                        this.completeRitual(ritual);
                    }
                }
            });
            
            // Check for level up
            this.checkCovenLevelUp();
        } catch (error) {
            handleError(error, 'covenProgressUpdate');
        }
    }
    
    /**
     * Complete a ritual and award rewards
     * @param {CovenRitual} ritual - Ritual to complete
     * @private
     */
    completeRitual(ritual) {
        ritual.completedAt = Date.now();
        this.currentCoven.stats.totalRitualsCompleted++;
        
        // Award experience to coven
        this.addCovenExperience(ritual.rewards.experience);
        
        if (this.onRitualCompleted) {
            this.onRitualCompleted(ritual);
        }
        
        // Generate new ritual to replace completed one
        this.replaceCompletedRitual(ritual);
    }
    
    /**
     * Add experience to the coven
     * @param {number} amount - Experience amount to add
     * @private
     */
    addCovenExperience(amount) {
        this.currentCoven.experience += amount;
        
        // Check for level up
        while (this.currentCoven.experience >= this.currentCoven.experienceToNext) {
            this.currentCoven.experience -= this.currentCoven.experienceToNext;
            this.currentCoven.level++;
            this.currentCoven.experienceToNext = this.getExperienceForLevel(this.currentCoven.level + 1);
            
            if (this.onCovenLevelUp) {
                this.onCovenLevelUp(this.currentCoven.level);
            }
        }
    }
    
    /**
     * Replace a completed ritual with a new one
     * @param {CovenRitual} completedRitual - The completed ritual to replace
     * @private
     */
    replaceCompletedRitual(completedRitual) {
        const index = this.currentCoven.activeRituals.findIndex(r => r.id === completedRitual.id);
        if (index === -1) {
            return;
        }
        
        // Generate new ritual with increased difficulty based on coven level
        const newRitual = this.generateRitualForLevel(this.currentCoven.level);
        this.currentCoven.activeRituals[index] = newRitual;
    }
    
    /**
     * Generate a ritual appropriate for the given coven level
     * @param {number} level - Coven level
     * @returns {CovenRitual} Generated ritual
     * @private
     */
    generateRitualForLevel(level) {
        const ritualTypes = [
            {
                type: 'production',
                name: 'Coven Production Circle',
                description: 'Collectively produce {target} AB',
                baseTarget: 1000,
                targetMultiplier: 1.5,
                resource: 'ab'
            },
            {
                type: 'casting',
                name: 'Group Casting Ritual',
                description: 'Cast spells {target} times collectively',
                baseTarget: 500,
                targetMultiplier: 1.3
            },
            {
                type: 'crafting',
                name: 'Collaborative Crafting',
                description: 'Craft {target} workstations collectively',
                baseTarget: 50,
                targetMultiplier: 1.4
            }
        ];
        
        const ritualType = ritualTypes[Math.floor(Math.random() * ritualTypes.length)];
        const target = Math.floor(ritualType.baseTarget * Math.pow(ritualType.targetMultiplier, level - 1));
        const experience = Math.floor(30 + level * 10);
        const bonus = Math.min(0.02 + level * 0.01, 0.1);
        
        return {
            id: 'coven_ritual_' + Date.now() + '_' + Math.random().toString(36).substring(2),
            name: ritualType.name,
            description: ritualType.description.replace('{target}', target),
            requirements: {
                type: ritualType.type,
                target: target,
                resource: ritualType.resource
            },
            rewards: {
                experience: experience,
                covenBonus: bonus
            },
            progress: 0,
            maxProgress: target,
            completedAt: 0
        };
    }
    
    /**
     * Check if coven should level up
     * @private
     */
    checkCovenLevelUp() {
        // This is now handled in addCovenExperience
        // Keeping this method for compatibility
    }
    
    /**
     * Get current coven information
     * @returns {Coven|null} Current coven or null if not in one
     */
    getCurrentCoven() {
        return this.currentCoven;
    }
    
    /**
     * Check if player is in a coven
     * @returns {boolean} True if player is in a coven
     */
    isInCoven() {
        return this.currentCoven !== null;
    }
    
    /**
     * Check if player is the coven leader
     * @returns {boolean} True if player is the coven leader
     */
    isCovenLeader() {
        if (!this.currentCoven) {
            return false;
        }
        
        const member = this.currentCoven.members.find(m => m.id === this.playerId);
        return member ? member.isLeader : false;
    }
    
    /**
     * Get coven member information
     * @returns {CovenMember|null} Current player's member info or null
     */
    getPlayerMemberInfo() {
        if (!this.currentCoven) {
            return null;
        }
        
        return this.currentCoven.members.find(m => m.id === this.playerId) || null;
    }
    
    /**
     * Save coven data to game state
     * @returns {Object} Serializable coven data
     */
    saveCovenData() {
        if (!this.currentCoven) {
            return null;
        }
        
        return {
            coven: this.currentCoven,
            playerId: this.playerId,
            playerName: this.playerName
        };
    }
    
    /**
     * Load coven data from saved state
     * @param {Object} data - Saved coven data
     */
    loadCovenData(data) {
        if (!data || !data.coven) {
            return;
        }
        
        this.currentCoven = data.coven;
        this.playerId = data.playerId || this.generatePlayerId();
        this.playerName = data.playerName || `CyberWitch_${this.playerId.substring(0, 8)}`;
        
        if (this.onCovenJoined) {
            this.onCovenJoined(this.currentCoven);
        }
    }
}