import { handleError, safeFunction, safeAsyncFunction, retryWithBackoff } from './errorHandler.js';

/**
 * Cloud Save System - Manages cloud save functionality with local fallback
 * Handles save synchronization, conflict resolution, and import/export
 */

/**
 * @typedef {Object} SaveData
 * @property {string} version - Save data version
 * @property {number} timestamp - Save timestamp
 * @property {Object} gameState - Game state data
 * @property {Object} covenData - Coven system data
 * @property {Object} achievementData - Achievement system data
 * @property {Object} eventData - Event system data
 * @property {Object} chatData - Chat system data
 * @property {string} deviceId - Unique device identifier
 */

/**
 * Cloud Save System class
 */
export class CloudSaveSystem {
    /**
     * Create a new CloudSaveSystem instance
     * @param {GameState} gameState - Reference to game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.deviceId = this.getOrCreateDeviceId();
        this.isOnline = navigator.onLine;
        this.lastSyncTime = 0;
        this.syncInProgress = false;
        this.pendingSync = false;
        
        // Cloud storage endpoints (mock implementation)
        this.cloudEndpoint = 'https://api.cyberwitches.game/saves';
        this.apiKey = null; // Would be configured in production
        
        // Callbacks for UI updates
        this.onSyncStarted = null;
        this.onSyncCompleted = null;
        this.onSyncFailed = null;
        this.onConflictDetected = null;
        this.onSaveImported = null;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.attemptSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Start periodic sync
        this.startPeriodicSync();
    }
    
    /**
     * Get or create device ID
     * @returns {string} Device identifier
     * @private
     */
    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('cyberWitchesDeviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2);
            localStorage.setItem('cyberWitchesDeviceId', deviceId);
        }
        return deviceId;
    }
    
    /**
     * Start periodic synchronization
     * @private
     */
    startPeriodicSync() {
        // Sync every 5 minutes
        setInterval(() => {
            this.attemptSync();
        }, 300000);
        
        // Initial sync attempt
        setTimeout(() => {
            this.attemptSync();
        }, 5000);
    }
    
    /**
     * Attempt to synchronize with cloud
     * @returns {Promise<boolean>} Whether sync was successful
     */
    async attemptSync() {
        if (!this.isOnline || this.syncInProgress) {
            return false;
        }
        
        try {
            this.syncInProgress = true;
            
            if (this.onSyncStarted) {
                this.onSyncStarted();
            }
            
            // Get current save data
            const localSaveData = this.collectSaveData();
            
            // Try to download cloud save
            const cloudSaveData = await this.downloadCloudSave();
            
            if (cloudSaveData) {
                // Compare timestamps and resolve conflicts
                const resolvedData = this.resolveSaveConflict(localSaveData, cloudSaveData);
                
                if (resolvedData.needsUpload) {
                    // Upload resolved data to cloud
                    await this.uploadCloudSave(resolvedData.data);
                } else if (resolvedData.needsDownload) {
                    // Apply cloud data to local game
                    this.applySaveData(resolvedData.data);
                }
            } else {
                // No cloud save exists, upload local save
                await this.uploadCloudSave(localSaveData);
            }
            
            this.lastSyncTime = Date.now();
            this.pendingSync = false;
            
            if (this.onSyncCompleted) {
                this.onSyncCompleted();
            }
            
            return true;
        } catch (error) {
            handleError(error, 'cloudSync');
            this.pendingSync = true;
            
            if (this.onSyncFailed) {
                this.onSyncFailed(error.message);
            }
            
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Collect all save data from game systems
     * @returns {SaveData} Complete save data
     * @private
     */
    collectSaveData() {
        const saveData = {
            version: '2.0',
            timestamp: Date.now(),
            deviceId: this.deviceId,
            gameState: this.extractGameState(),
            covenData: this.extractCovenData(),
            achievementData: this.extractAchievementData(),
            eventData: this.extractEventData(),
            chatData: this.extractChatData()
        };
        
        return saveData;
    }
    
    /**
     * Extract game state data
     * @returns {Object} Game state data
     * @private
     */
    extractGameState() {
        return {
            ab: this.gameState.ab,
            abTotal: this.gameState.abTotalEarned,
            inventory: { ...this.gameState.inventory },
            workstations: { ...this.gameState.workstations },
            upgrades: { ...this.gameState.upgradesOwned },
            prestige: {
                points: this.gameState.prestigePoints,
                lifetimeEarned: this.gameState.prestigeLifetimeEarned,
                bonuses: { ...this.gameState.prestigeBonuses }
            },
            experiments: {
                discovered: [...this.gameState.discoveredRecipes]
            },
            stats: {
                totalTaps: this.gameState.totalTaps,
                totalWorkstationsCrafted: this.gameState.totalWorkstationsCrafted
            },
            timestamp: this.gameState.lastSaveTime
        };
    }
    
    /**
     * Extract coven system data
     * @returns {Object} Coven system data
     * @private
     */
    extractCovenData() {
        if (!this.gameState.covenSystem) {
            return null;
        }
        
        return this.gameState.covenSystem.saveCovenData();
    }
    
    /**
     * Extract achievement system data
     * @returns {Object} Achievement system data
     * @private
     */
    extractAchievementData() {
        // This would be implemented when achievement system is integrated
        return null;
    }
    
    /**
     * Extract event system data
     * @returns {Object} Event system data
     * @private
     */
    extractEventData() {
        // This would be implemented when event system is integrated
        return null;
    }
    
    /**
     * Extract chat system data
     * @returns {Object} Chat system data
     * @private
     */
    extractChatData() {
        // This would be implemented when chat system is integrated
        return null;
    }
    
    /**
     * Download save data from cloud
     * @returns {Promise<SaveData|null>} Cloud save data or null
     * @private
     */
    async downloadCloudSave() {
        try {
            // In a real implementation, this would make an API call
            // For now, we'll simulate with localStorage
            const cloudSaveStr = localStorage.getItem('cyberWitchesCloudSave');
            
            if (cloudSaveStr) {
                const cloudSave = JSON.parse(cloudSaveStr);
                
                // Validate cloud save data
                if (this.validateSaveData(cloudSave)) {
                    return cloudSave;
                }
            }
            
            return null;
        } catch (error) {
            handleError(error, 'cloudDownload');
            return null;
        }
    }
    
    /**
     * Upload save data to cloud
     * @param {SaveData} saveData - Save data to upload
     * @returns {Promise<boolean>} Whether upload was successful
     * @private
     */
    async uploadCloudSave(saveData) {
        try {
            // In a real implementation, this would make an API call
            // For now, we'll simulate with localStorage
            localStorage.setItem('cyberWitchesCloudSave', JSON.stringify(saveData));
            
            // Also save to localStorage as backup
            this.saveToLocalStorage(saveData);
            
            return true;
        } catch (error) {
            handleError(error, 'cloudUpload');
            return false;
        }
    }
    
    /**
     * Resolve save conflicts between local and cloud data
     * @param {SaveData} localData - Local save data
     * @param {SaveData} cloudData - Cloud save data
     * @returns {Object} Resolution result
     * @private
     */
    resolveSaveConflict(localData, cloudData) {
        const localTime = localData.timestamp || 0;
        const cloudTime = cloudData.timestamp || 0;
        
        // If timestamps are the same, no conflict
        if (localTime === cloudTime) {
            return { needsUpload: false, needsDownload: false, data: localData };
        }
        
        // If local is newer, upload to cloud
        if (localTime > cloudTime) {
            return { needsUpload: true, needsDownload: false, data: localData };
        }
        
        // If cloud is newer, download to local
        if (cloudTime > localTime) {
            return { needsUpload: false, needsDownload: true, data: cloudData };
        }
        
        // If timestamps are very close, merge data
        if (Math.abs(localTime - cloudTime) < 60000) { // Within 1 minute
            const mergedData = this.mergeSaveData(localData, cloudData);
            return { needsUpload: true, needsDownload: true, data: mergedData };
        }
        
        return { needsUpload: false, needsDownload: false, data: localData };
    }
    
    /**
     * Merge two save data objects
     * @param {SaveData} data1 - First save data
     * @param {SaveData} data2 - Second save data
     * @returns {SaveData} Merged save data
     * @private
     */
    mergeSaveData(data1, data2) {
        // Use the newer timestamp
        const mergedTimestamp = Math.max(data1.timestamp || 0, data2.timestamp || 0);
        
        // Merge game state by taking maximum values for progress
        const mergedGameState = {
            ab: Math.max(data1.gameState?.ab || 0, data2.gameState?.ab || 0),
            abTotal: Math.max(data1.gameState?.abTotal || 0, data2.gameState?.abTotal || 0),
            inventory: this.mergeObjects(data1.gameState?.inventory || {}, data2.gameState?.inventory || {}),
            workstations: this.mergeObjects(data1.gameState?.workstations || {}, data2.gameState?.workstations || {}),
            upgrades: this.mergeObjects(data1.gameState?.upgrades || {}, data2.gameState?.upgrades || {}),
            prestige: this.mergePrestigeData(data1.gameState?.prestige || {}, data2.gameState?.prestige || {}),
            experiments: {
                discovered: this.mergeArrays(data1.gameState?.experiments?.discovered || [], data2.gameState?.experiments?.discovered || [])
            },
            stats: {
                totalTaps: Math.max(data1.gameState?.stats?.totalTaps || 0, data2.gameState?.stats?.totalTaps || 0),
                totalWorkstationsCrafted: Math.max(data1.gameState?.stats?.totalWorkstationsCrafted || 0, data2.gameState?.stats?.totalWorkstationsCrafted || 0)
            },
            timestamp: mergedTimestamp
        };
        
        return {
            version: data1.version || data2.version,
            timestamp: mergedTimestamp,
            deviceId: this.deviceId,
            gameState: mergedGameState,
            covenData: data2.covenData || data1.covenData, // Prefer cloud coven data
            achievementData: this.mergeObjects(data1.achievementData || {}, data2.achievementData || {}),
            eventData: this.mergeObjects(data1.eventData || {}, data2.eventData || {}),
            chatData: data2.chatData || data1.chatData // Prefer cloud chat data
        };
    }
    
    /**
     * Merge two objects by taking maximum values for numeric properties
     * @param {Object} obj1 - First object
     * @param {Object} obj2 - Second object
     * @returns {Object} Merged object
     * @private
     */
    mergeObjects(obj1, obj2) {
        const merged = { ...obj1 };
        
        for (const [key, value] of Object.entries(obj2)) {
            if (typeof value === 'number' && typeof merged[key] === 'number') {
                merged[key] = Math.max(merged[key], value);
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }
    
    /**
     * Merge prestige data
     * @param {Object} prestige1 - First prestige data
     * @param {Object} prestige2 - Second prestige data
     * @returns {Object} Merged prestige data
     * @private
     */
    mergePrestigeData(prestige1, prestige2) {
        return {
            points: Math.max(prestige1.points || 0, prestige2.points || 0),
            lifetimeEarned: Math.max(prestige1.lifetimeEarned || 0, prestige2.lifetimeEarned || 0),
            bonuses: this.mergeObjects(prestige1.bonuses || {}, prestige2.bonuses || {})
        };
    }
    
    /**
     * Merge two arrays, removing duplicates
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @returns {Array} Merged array
     * @private
     */
    mergeArrays(arr1, arr2) {
        const merged = [...new Set([...arr1, ...arr2])];
        return merged;
    }
    
    /**
     * Apply save data to game state
     * @param {SaveData} saveData - Save data to apply
     * @private
     */
    applySaveData(saveData) {
        try {
            if (!saveData || !saveData.gameState) {
                throw new Error('Invalid save data structure');
            }
            
            // Apply game state
            this.gameState.ab = saveData.gameState.ab || 0;
            this.gameState.abTotalEarned = saveData.gameState.abTotal || 0;
            this.gameState.inventory = saveData.gameState.inventory || {};
            this.gameState.workstations = saveData.gameState.workstations || {};
            this.gameState.upgradesOwned = saveData.gameState.upgrades || {};
            
            if (saveData.gameState.prestige) {
                this.gameState.prestigePoints = saveData.gameState.prestige.points || 0;
                this.gameState.prestigeLifetimeEarned = saveData.gameState.prestige.lifetimeEarned || 0;
                this.gameState.prestigeBonuses = saveData.gameState.prestige.bonuses || {};
            }
            
            if (saveData.gameState.experiments) {
                this.gameState.discoveredRecipes = saveData.gameState.experiments.discovered || [];
            }
            
            if (saveData.gameState.stats) {
                this.gameState.totalTaps = saveData.gameState.stats.totalTaps || 0;
                this.gameState.totalWorkstationsCrafted = saveData.gameState.stats.totalWorkstationsCrafted || 0;
            }
            
            // Apply coven data
            if (saveData.covenData && this.gameState.covenSystem) {
                this.gameState.covenSystem.loadCovenData(saveData.covenData);
            }
            
            // Apply other system data as needed
            // This would be expanded as more systems are integrated
            
            // Save to localStorage as backup
            this.saveToLocalStorage(saveData);
            
        } catch (error) {
            handleError(error, 'applySaveData');
        }
    }
    
    /**
     * Save data to localStorage as fallback
     * @param {SaveData} saveData - Save data to save
     * @private
     */
    saveToLocalStorage(saveData) {
        try {
            localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData.gameState));
            localStorage.setItem('cyberWitchesSaveTimestamp', saveData.timestamp.toString());
        } catch (error) {
            handleError(error, 'localStorageSave');
        }
    }
    
    /**
     * Load data from localStorage fallback
     * @returns {SaveData|null} Local save data or null
     * @private
     */
    loadFromLocalStorage() {
        try {
            const saveDataStr = localStorage.getItem('cyberWitchesSave');
            const timestamp = localStorage.getItem('cyberWitchesSaveTimestamp');
            
            if (saveDataStr) {
                return {
                    version: '2.0',
                    timestamp: parseInt(timestamp) || Date.now(),
                    deviceId: this.deviceId,
                    gameState: JSON.parse(saveDataStr),
                    covenData: null,
                    achievementData: null,
                    eventData: null,
                    chatData: null
                };
            }
            
            return null;
        } catch (error) {
            handleError(error, 'localStorageLoad');
            return null;
        }
    }
    
    /**
     * Validate save data structure
     * @param {SaveData} saveData - Save data to validate
     * @returns {boolean} Whether save data is valid
     * @private
     */
    validateSaveData(saveData) {
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        if (!saveData.version || !saveData.timestamp || !saveData.gameState) {
            return false;
        }
        
        // Validate game state structure
        const gameState = saveData.gameState;
        if (typeof gameState !== 'object') {
            return false;
        }
        
        // Check required numeric fields
        const numericFields = ['ab', 'abTotal'];
        for (const field of numericFields) {
            if (gameState[field] !== undefined && (typeof gameState[field] !== 'number' || isNaN(gameState[field]))) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Export save data to file
     * @returns {boolean} Whether export was successful
     */
    exportSave() {
        try {
            const saveData = this.collectSaveData();
            const saveDataStr = JSON.stringify(saveData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([saveDataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `cyberwitches_save_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            handleError(error, 'exportSave');
            return false;
        }
    }
    
    /**
     * Import save data from file
     * @param {File} file - Save file to import
     * @returns {Promise<boolean>} Whether import was successful
     */
    async importSave(file) {
        try {
            if (!file || !file.name.endsWith('.json')) {
                throw new Error('Invalid file format. Please select a JSON save file.');
            }
            
            const saveDataStr = await file.text();
            const saveData = JSON.parse(saveDataStr);
            
            // Validate imported data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save file format or corrupted data.');
            }
            
            // Apply imported data
            this.applySaveData(saveData);
            
            // Try to sync with cloud
            await this.uploadCloudSave(saveData);
            
            if (this.onSaveImported) {
                this.onSaveImported(saveData);
            }
            
            return true;
        } catch (error) {
            handleError(error, 'importSave');
            return false;
        }
    }
    
    /**
     * Force immediate sync
     * @returns {Promise<boolean>} Whether sync was successful
     */
    async forceSync() {
        if (!this.isOnline) {
            throw new Error('Cannot sync while offline');
        }
        
        return await this.attemptSync();
    }
    
    /**
     * Get sync status
     * @returns {Object} Sync status information
     */
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            syncInProgress: this.syncInProgress,
            pendingSync: this.pendingSync,
            lastSyncTime: this.lastSyncTime,
            deviceId: this.deviceId
        };
    }
    
    /**
     * Clear all cloud save data
     * @returns {Promise<boolean>} Whether clear was successful
     */
    async clearCloudSave() {
        try {
            // In a real implementation, this would make an API call
            localStorage.removeItem('cyberWitchesCloudSave');
            
            return true;
        } catch (error) {
            handleError(error, 'clearCloudSave');
            return false;
        }
    }
    
    /**
     * Get save statistics
     * @returns {Object} Save statistics
     */
    getSaveStats() {
        const localSave = this.loadFromLocalStorage();
        const cloudSave = localStorage.getItem('cyberWitchesCloudSave');
        
        return {
            hasLocalSave: !!localSave,
            localSaveTime: localSave?.timestamp || 0,
            hasCloudSave: !!cloudSave,
            cloudSaveTime: cloudSave ? JSON.parse(cloudSave).timestamp : 0,
            lastSyncTime: this.lastSyncTime,
            deviceId: this.deviceId
        };
    }
}