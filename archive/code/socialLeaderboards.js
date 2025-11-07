import { handleError, safeFunction } from './errorHandler.js';

/**
 * Social Leaderboards System - Manages competitive rankings for covens and players
 * Handles various leaderboard categories and time-based competitions
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} id - Unique identifier (player or coven ID)
 * @property {string} name - Display name
 * @property {number} score - Current score
 * @property {number} rank - Current rank position
 * @property {Object} stats - Additional statistics
 * @property {number} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} Leaderboard
 * @property {string} id - Unique leaderboard identifier
 * @property {string} name - Leaderboard display name
 * @property {string} category - Leaderboard category ('production', 'casting', 'crafting', 'coven_level', 'rituals')
 * @property {string} timeframe - Timeframe ('daily', 'weekly', 'monthly', 'all_time')
 * @property {boolean} isCoven - Whether this is a coven leaderboard
 * @property {LeaderboardEntry[]} entries - Leaderboard entries
 * @property {number} lastReset - Last reset timestamp
 * @property {number} nextReset - Next reset timestamp
 */

/**
 * Social Leaderboards System class
 */
export class SocialLeaderboardsSystem {
    /**
     * Create a new SocialLeaderboardsSystem instance
     * @param {CovenSystem} covenSystem - Reference to coven system
     */
    constructor(covenSystem) {
        this.covenSystem = covenSystem;
        this.leaderboards = new Map();
        this.playerRankings = new Map();
        this.covenRankings = new Map();
        
        // Callbacks for UI updates
        this.onLeaderboardUpdated = null;
        this.onRankChanged = null;
        
        // Initialize leaderboards
        this.initializeLeaderboards();
        
        // Start periodic updates
        this.startPeriodicUpdates();
    }
    
    /**
     * Initialize all leaderboards
     * @private
     */
    initializeLeaderboards() {
        const leaderboardConfigs = [
            // Player leaderboards
            { id: 'player_production_daily', name: 'Daily Production', category: 'production', timeframe: 'daily', isCoven: false },
            { id: 'player_production_weekly', name: 'Weekly Production', category: 'production', timeframe: 'weekly', isCoven: false },
            { id: 'player_production_all_time', name: 'All-Time Production', category: 'production', timeframe: 'all_time', isCoven: false },
            { id: 'player_casting_daily', name: 'Daily Casting', category: 'casting', timeframe: 'daily', isCoven: false },
            { id: 'player_casting_weekly', name: 'Weekly Casting', category: 'casting', timeframe: 'weekly', isCoven: false },
            { id: 'player_casting_all_time', name: 'All-Time Casting', category: 'casting', timeframe: 'all_time', isCoven: false },
            { id: 'player_crafting_daily', name: 'Daily Crafting', category: 'crafting', timeframe: 'daily', isCoven: false },
            { id: 'player_crafting_weekly', name: 'Weekly Crafting', category: 'crafting', timeframe: 'weekly', isCoven: false },
            { id: 'player_crafting_all_time', name: 'All-Time Crafting', category: 'crafting', timeframe: 'all_time', isCoven: false },
            
            // Coven leaderboards
            { id: 'coven_level', name: 'Coven Level', category: 'coven_level', timeframe: 'all_time', isCoven: true },
            { id: 'coven_production_daily', name: 'Daily Coven Production', category: 'production', timeframe: 'daily', isCoven: true },
            { id: 'coven_production_weekly', name: 'Weekly Coven Production', category: 'production', timeframe: 'weekly', isCoven: true },
            { id: 'coven_production_all_time', name: 'All-Time Coven Production', category: 'production', timeframe: 'all_time', isCoven: true },
            { id: 'coven_rituals_daily', name: 'Daily Rituals Completed', category: 'rituals', timeframe: 'daily', isCoven: true },
            { id: 'coven_rituals_weekly', name: 'Weekly Rituals Completed', category: 'rituals', timeframe: 'weekly', isCoven: true },
            { id: 'coven_rituals_all_time', name: 'All-Time Rituals Completed', category: 'rituals', timeframe: 'all_time', isCoven: true },
            { id: 'coven_members', name: 'Coven Size', category: 'members', timeframe: 'all_time', isCoven: true }
        ];
        
        for (const config of leaderboardConfigs) {
            this.leaderboards.set(config.id, {
                ...config,
                entries: [],
                lastReset: this.calculateLastReset(config.timeframe),
                nextReset: this.calculateNextReset(config.timeframe)
            });
        }
        
        // Generate mock data for demonstration
        this.generateMockLeaderboardData();
    }
    
    /**
     * Calculate last reset time based on timeframe
     * @param {string} timeframe - Timeframe ('daily', 'weekly', 'monthly', 'all_time')
     * @returns {number} Last reset timestamp
     * @private
     */
    calculateLastReset(timeframe) {
        const now = new Date();
        
        switch (timeframe) {
            case 'daily':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            case 'weekly':
                const dayOfWeek = now.getDay();
                const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday).getTime();
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            case 'all_time':
                return 0;
            default:
                return now.getTime();
        }
    }
    
    /**
     * Calculate next reset time based on timeframe
     * @param {string} timeframe - Timeframe ('daily', 'weekly', 'monthly', 'all_time')
     * @returns {number} Next reset timestamp
     * @private
     */
    calculateNextReset(timeframe) {
        const now = new Date();
        
        switch (timeframe) {
            case 'daily':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
            case 'weekly':
                const dayOfWeek = now.getDay();
                const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToNextMonday).getTime();
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
            case 'all_time':
                return Number.MAX_SAFE_INTEGER;
            default:
                return now.getTime() + 86400000; // Default to 24 hours
        }
    }
    
    /**
     * Generate mock leaderboard data for demonstration
     * @private
     */
    generateMockLeaderboardData() {
        // Generate mock player data
        const mockPlayers = [
            { id: 'player_1', name: 'ArcaneMaster', production: 1000000, casting: 50000, crafting: 1000 },
            { id: 'player_2', name: 'CrystalWitch', production: 850000, casting: 45000, crafting: 900 },
            { id: 'player_3', name: 'HexCaster', production: 750000, casting: 60000, crafting: 800 },
            { id: 'player_4', name: 'QuantumSage', production: 650000, casting: 40000, crafting: 1100 },
            { id: 'player_5', name: 'VoidWalker', production: 550000, casting: 35000, crafting: 750 },
            { id: 'player_6', name: 'EldritchLord', production: 450000, casting: 30000, crafting: 700 },
            { id: 'player_7', name: 'SigilMaster', production: 350000, casting: 25000, crafting: 650 },
            { id: 'player_8', name: 'AetherWeaver', production: 250000, casting: 20000, crafting: 600 },
            { id: 'player_9', name: 'WaxShaper', production: 150000, casting: 15000, crafting: 550 },
            { id: 'player_10', name: 'CandleMaker', production: 100000, casting: 10000, crafting: 500 }
        ];
        
        // Generate mock coven data
        const mockCovens = [
            { id: 'coven_1', name: 'Arcane Circle', level: 25, members: 15, production: 5000000, rituals: 150 },
            { id: 'coven_2', name: 'Crystal Collective', level: 22, members: 12, production: 4200000, rituals: 130 },
            { id: 'coven_3', name: 'Hex Syndicate', level: 20, members: 10, production: 3800000, rituals: 120 },
            { id: 'coven_4', name: 'Quantum Covenant', level: 18, members: 8, production: 3200000, rituals: 100 },
            { id: 'coven_5', name: 'Void Assembly', level: 15, members: 7, production: 2500000, rituals: 85 }
        ];
        
        // Populate player leaderboards
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            if (!leaderboard.isCoven) {
                const entries = mockPlayers.map((player, index) => {
                    let score = 0;
                    let stats = {};
                    
                    switch (leaderboard.category) {
                        case 'production':
                            score = player.production;
                            stats = { totalProduction: player.production };
                            break;
                        case 'casting':
                            score = player.casting;
                            stats = { totalCasts: player.casting };
                            break;
                        case 'crafting':
                            score = player.crafting;
                            stats = { totalCrafted: player.crafting };
                            break;
                    }
                    
                    return {
                        id: player.id,
                        name: player.name,
                        score: score,
                        rank: index + 1,
                        stats: stats,
                        lastUpdated: Date.now()
                    };
                });
                
                leaderboard.entries = entries.sort((a, b) => b.score - a.score);
            }
        }
        
        // Populate coven leaderboards
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            if (leaderboard.isCoven) {
                const entries = mockCovens.map((coven, index) => {
                    let score = 0;
                    let stats = {};
                    
                    switch (leaderboard.category) {
                        case 'coven_level':
                            score = coven.level;
                            stats = { level: coven.level, members: coven.members };
                            break;
                        case 'production':
                            score = coven.production;
                            stats = { totalProduction: coven.production, members: coven.members };
                            break;
                        case 'rituals':
                            score = coven.rituals;
                            stats = { totalRituals: coven.rituals, members: coven.members };
                            break;
                        case 'members':
                            score = coven.members;
                            stats = { memberCount: coven.members, level: coven.level };
                            break;
                    }
                    
                    return {
                        id: coven.id,
                        name: coven.name,
                        score: score,
                        rank: index + 1,
                        stats: stats,
                        lastUpdated: Date.now()
                    };
                });
                
                leaderboard.entries = entries.sort((a, b) => b.score - a.score);
            }
        }
    }
    
    /**
     * Start periodic updates for leaderboards
     * @private
     */
    startPeriodicUpdates() {
        // Check for resets every hour
        setInterval(() => {
            this.checkAndResetLeaderboards();
        }, 3600000);
        
        // Update rankings every 5 minutes
        setInterval(() => {
            this.updateAllRankings();
        }, 300000);
    }
    
    /**
     * Check and reset time-based leaderboards
     * @private
     */
    checkAndResetLeaderboards() {
        const now = Date.now();
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            if (now >= leaderboard.nextReset && leaderboard.timeframe !== 'all_time') {
                this.resetLeaderboard(leaderboardId);
            }
        }
    }
    
    /**
     * Reset a leaderboard
     * @param {string} leaderboardId - Leaderboard ID to reset
     * @private
     */
    resetLeaderboard(leaderboardId) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            return;
        }
        
        leaderboard.entries = [];
        leaderboard.lastReset = Date.now();
        leaderboard.nextReset = this.calculateNextReset(leaderboard.timeframe);
        
        if (this.onLeaderboardUpdated) {
            this.onLeaderboardUpdated(leaderboardId, leaderboard);
        }
    }
    
    /**
     * Update all rankings
     * @private
     */
    updateAllRankings() {
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            this.updateRankings(leaderboardId);
        }
    }
    
    /**
     * Update rankings for a specific leaderboard
     * @param {string} leaderboardId - Leaderboard ID
     * @private
     */
    updateRankings(leaderboardId) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            return;
        }
        
        // Sort entries by score
        leaderboard.entries.sort((a, b) => b.score - a.score);
        
        // Update ranks
        leaderboard.entries.forEach((entry, index) => {
            const oldRank = entry.rank;
            entry.rank = index + 1;
            
            if (oldRank !== entry.rank) {
                if (this.onRankChanged) {
                    this.onRankChanged(leaderboardId, entry.id, oldRank, entry.rank);
                }
            }
        });
    }
    
    /**
     * Update player score on leaderboards
     * @param {string} playerId - Player ID
     * @param {string} category - Score category
     * @param {number} value - Score value
     * @param {string} timeframe - Timeframe ('daily', 'weekly', 'all_time')
     */
    updatePlayerScore(playerId, category, value, timeframe = 'all_time') {
        const leaderboardId = `player_${category}_${timeframe}`;
        const leaderboard = this.leaderboards.get(leaderboardId);
        
        if (!leaderboard) {
            return;
        }
        
        // Find existing entry or create new one
        let entry = leaderboard.entries.find(e => e.id === playerId);
        if (!entry) {
            entry = {
                id: playerId,
                name: this.getPlayerName(playerId),
                score: 0,
                rank: 0,
                stats: {},
                lastUpdated: Date.now()
            };
            leaderboard.entries.push(entry);
        }
        
        // Update score
        entry.score += value;
        entry.lastUpdated = Date.now();
        
        // Update stats
        switch (category) {
            case 'production':
                entry.stats.totalProduction = (entry.stats.totalProduction || 0) + value;
                break;
            case 'casting':
                entry.stats.totalCasts = (entry.stats.totalCasts || 0) + value;
                break;
            case 'crafting':
                entry.stats.totalCrafted = (entry.stats.totalCrafted || 0) + value;
                break;
        }
        
        // Update rankings
        this.updateRankings(leaderboardId);
        
        if (this.onLeaderboardUpdated) {
            this.onLeaderboardUpdated(leaderboardId, leaderboard);
        }
    }
    
    /**
     * Update coven score on leaderboards
     * @param {string} covenId - Coven ID
     * @param {string} category - Score category
     * @param {number} value - Score value
     * @param {string} timeframe - Timeframe ('daily', 'weekly', 'all_time')
     */
    updateCovenScore(covenId, category, value, timeframe = 'all_time') {
        const leaderboardId = `coven_${category}_${timeframe}`;
        const leaderboard = this.leaderboards.get(leaderboardId);
        
        if (!leaderboard) {
            return;
        }
        
        // Find existing entry or create new one
        let entry = leaderboard.entries.find(e => e.id === covenId);
        if (!entry) {
            entry = {
                id: covenId,
                name: this.getCovenName(covenId),
                score: 0,
                rank: 0,
                stats: {},
                lastUpdated: Date.now()
            };
            leaderboard.entries.push(entry);
        }
        
        // Update score
        entry.score += value;
        entry.lastUpdated = Date.now();
        
        // Update stats
        switch (category) {
            case 'production':
                entry.stats.totalProduction = (entry.stats.totalProduction || 0) + value;
                break;
            case 'rituals':
                entry.stats.totalRituals = (entry.stats.totalRituals || 0) + value;
                break;
        }
        
        // Update rankings
        this.updateRankings(leaderboardId);
        
        if (this.onLeaderboardUpdated) {
            this.onLeaderboardUpdated(leaderboardId, leaderboard);
        }
    }
    
    /**
     * Get player name from ID
     * @param {string} playerId - Player ID
     * @returns {string} Player name
     * @private
     */
    getPlayerName(playerId) {
        // In a real implementation, this would fetch from a database
        // For now, return a formatted name
        return `Player_${playerId.substring(0, 8)}`;
    }
    
    /**
     * Get coven name from ID
     * @param {string} covenId - Coven ID
     * @returns {string} Coven name
     * @private
     */
    getCovenName(covenId) {
        // In a real implementation, this would fetch from a database
        // For now, return a formatted name
        return `Coven_${covenId.substring(0, 8)}`;
    }
    
    /**
     * Get leaderboard by ID
     * @param {string} leaderboardId - Leaderboard ID
     * @returns {Object|null} Leaderboard object or null
     */
    getLeaderboard(leaderboardId) {
        return this.leaderboards.get(leaderboardId) || null;
    }
    
    /**
     * Get all leaderboards
     * @param {boolean} isCoven - Filter by coven leaderboards
     * @returns {Array} Array of leaderboards
     */
    getAllLeaderboards(isCoven = null) {
        const leaderboards = Array.from(this.leaderboards.values());
        
        if (isCoven !== null) {
            return leaderboards.filter(l => l.isCoven === isCoven);
        }
        
        return leaderboards;
    }
    
    /**
     * Get player rankings across all leaderboards
     * @param {string} playerId - Player ID
     * @returns {Object} Player rankings
     */
    getPlayerRankings(playerId) {
        const rankings = {};
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            if (!leaderboard.isCoven) {
                const entry = leaderboard.entries.find(e => e.id === playerId);
                if (entry) {
                    rankings[leaderboardId] = {
                        rank: entry.rank,
                        score: entry.score,
                        leaderboardName: leaderboard.name
                    };
                }
            }
        }
        
        return rankings;
    }
    
    /**
     * Get coven rankings across all leaderboards
     * @param {string} covenId - Coven ID
     * @returns {Object} Coven rankings
     */
    getCovenRankings(covenId) {
        const rankings = {};
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            if (leaderboard.isCoven) {
                const entry = leaderboard.entries.find(e => e.id === covenId);
                if (entry) {
                    rankings[leaderboardId] = {
                        rank: entry.rank,
                        score: entry.score,
                        leaderboardName: leaderboard.name
                    };
                }
            }
        }
        
        return rankings;
    }
    
    /**
     * Get top entries from a leaderboard
     * @param {string} leaderboardId - Leaderboard ID
     * @param {number} limit - Maximum number of entries to return
     * @returns {Array} Array of leaderboard entries
     */
    getTopEntries(leaderboardId, limit = 10) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            return [];
        }
        
        return leaderboard.entries.slice(0, limit);
    }
    
    /**
     * Get player's position in a leaderboard
     * @param {string} leaderboardId - Leaderboard ID
     * @param {string} playerId - Player ID
     * @returns {Object|null} Player entry with surrounding entries
     */
    getPlayerPosition(leaderboardId, playerId) {
        const leaderboard = this.leaderboards.get(leaderboardId);
        if (!leaderboard) {
            return null;
        }
        
        const playerIndex = leaderboard.entries.findIndex(e => e.id === playerId);
        if (playerIndex === -1) {
            return null;
        }
        
        const playerEntry = leaderboard.entries[playerIndex];
        const startIndex = Math.max(0, playerIndex - 2);
        const endIndex = Math.min(leaderboard.entries.length, playerIndex + 3);
        
        return {
            playerEntry: playerEntry,
            surroundingEntries: leaderboard.entries.slice(startIndex, endIndex),
            playerRank: playerIndex + 1,
            totalEntries: leaderboard.entries.length
        };
    }
    
    /**
     * Save leaderboard data
     * @returns {Object} Serializable leaderboard data
     */
    saveLeaderboardData() {
        const data = {};
        
        for (const [leaderboardId, leaderboard] of this.leaderboards) {
            data[leaderboardId] = {
                entries: leaderboard.entries,
                lastReset: leaderboard.lastReset,
                nextReset: leaderboard.nextReset
            };
        }
        
        return data;
    }
    
    /**
     * Load leaderboard data
     * @param {Object} data - Saved leaderboard data
     */
    loadLeaderboardData(data) {
        if (!data) {
            return;
        }
        
        for (const [leaderboardId, leaderboardData] of Object.entries(data)) {
            const leaderboard = this.leaderboards.get(leaderboardId);
            if (leaderboard) {
                leaderboard.entries = leaderboardData.entries || [];
                leaderboard.lastReset = leaderboardData.lastReset || this.calculateLastReset(leaderboard.timeframe);
                leaderboard.nextReset = leaderboardData.nextReset || this.calculateNextReset(leaderboard.timeframe);
            }
        }
        
        // Update rankings after loading
        this.updateAllRankings();
    }
}