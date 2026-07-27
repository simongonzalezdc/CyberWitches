/**
 * Quest/Objective System
 * Provides quests and objectives for player guidance
 */

class QuestSystem {
    constructor() {
        this.quests = [];
        this.activeQuests = [];
        this.completedQuests = [];
        this.init();
    }
    
    init() {
        // Load saved quests
        this.loadQuests();
        
        // Create initial quests
        this.createInitialQuests();
    }
    
    /**
     * Load quests from localStorage
     */
    loadQuests() {
        try {
            const saved = localStorage.getItem('quests');
            if (saved) {
                const data = JSON.parse(saved);
                this.activeQuests = data.activeQuests || [];
                this.completedQuests = data.completedQuests || [];
            }
        } catch (error) {
            console.error('Failed to load quests:', error);
            if (typeof window !== 'undefined' && typeof window.__appendSystemLog === 'function') {
                window.__appendSystemLog('ERR quest load failed', 'error');
            }
            if (typeof window !== 'undefined' && typeof window.showNotification === 'function') {
                window.showNotification('Quest data could not be loaded. Objectives may reset.', 'warning', 4000);
            }
        }
    }
    
    /**
     * Save quests to localStorage
     */
    saveQuests() {
        try {
            localStorage.setItem('quests', JSON.stringify({
                activeQuests: this.activeQuests,
                completedQuests: this.completedQuests
            }));
        } catch (error) {
            console.error('Failed to save quests:', error);
            if (typeof window !== 'undefined' && typeof window.__appendSystemLog === 'function') {
                window.__appendSystemLog('ERR quest save failed', 'error');
            }
            if (typeof window !== 'undefined' && typeof window.showNotification === 'function') {
                window.showNotification('Quest progress could not be saved.', 'warning', 4000);
            }
        }
    }
    
    /**
     * Create initial quests
     */
    createInitialQuests() {
        if (this.activeQuests.length === 0 && this.completedQuests.length === 0) {
            // First cast quest
            this.addQuest({
                id: 'first_cast',
                title: 'First Cast',
                description: 'Cast your first spell to earn AB',
                objective: { type: 'cast', target: 1 },
                reward: { type: 'notification', message: 'Great! You\'ve cast your first spell!' }
            });
            
            // First workstation quest
            this.addQuest({
                id: 'first_workstation',
                title: 'Build Your First Workstation',
                description: 'Craft a workstation to start producing ingredients',
                objective: { type: 'craft_workstation', target: 1 },
                reward: { type: 'notification', message: 'Excellent! Your first workstation is ready!' }
            });
        }
    }
    
    /**
     * Add quest
     * @param {Object} quest - Quest object
     */
    addQuest(quest) {
        quest.progress = 0;
        quest.completed = false;
        this.activeQuests.push(quest);
        this.saveQuests();
    }
    
    /**
     * Update quest progress
     * @param {string} questId - Quest ID
     * @param {number} progress - Progress value
     */
    updateQuestProgress(questId, progress) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (quest) {
            quest.progress = progress;
            
            if (quest.progress >= quest.objective.target) {
                this.completeQuest(questId);
            }
            
            this.saveQuests();
        }
    }
    
    /**
     * Complete quest
     * @param {string} questId - Quest ID
     */
    completeQuest(questId) {
        const questIndex = this.activeQuests.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            const quest = this.activeQuests[questIndex];
            quest.completed = true;
            
            // Move to completed
            this.activeQuests.splice(questIndex, 1);
            this.completedQuests.push(quest);
            
            // Give reward
            this.giveReward(quest.reward);
            
            // Show notification
            if (window.showNotification) {
                window.showNotification(`Quest completed: ${quest.title}!`, 'success');
            }
            
            this.saveQuests();
        }
    }
    
    /**
     * Give quest reward
     * @param {Object} reward - Reward object
     */
    giveReward(reward) {
        if (reward.type === 'notification' && window.showNotification) {
            window.showNotification(reward.message, 'success');
        } else if (reward.type === 'ab' && window.gameState) {
            window.gameState.ab += reward.amount || 0;
        }
    }
    
    /**
     * Get active quests
     * @returns {Array} Active quests
     */
    getActiveQuests() {
        return this.activeQuests;
    }
    
    /**
     * Get completed quests
     * @returns {Array} Completed quests
     */
    getCompletedQuests() {
        return this.completedQuests;
    }
}

// Create global instance
const questSystem = new QuestSystem();

// Global functions for compatibility
window.addQuest = (quest) => {
    questSystem.addQuest(quest);
};

window.updateQuestProgress = (questId, progress) => {
    questSystem.updateQuestProgress(questId, progress);
};

export default questSystem;

