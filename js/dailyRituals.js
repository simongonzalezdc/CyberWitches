import { DAILY_TASKS_POOL } from './modules/data/tasks.js';

export class DailyRituals {
    constructor(gameState) {
        this.gameState = gameState;
        this.taskPool = DAILY_TASKS_POOL;
        this.activeTasks = [];
        this.taskProgress = {};
        this.claimedTasks = [];
        this.currentDayKey = '';
        this.ekFragments = 0;
        
        this.onTaskProgressUpdated = null;
        this.onTaskCompleted = null;
        this.onTasksRefreshed = null;
    }
    
    init() {
        this.checkDailyRefresh();
    }
    
    getDayKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    checkDailyRefresh() {
        const today = this.getDayKey();
        
        if (today !== this.currentDayKey) {
            this.currentDayKey = today;
            this.selectDailyTasks();
            this.taskProgress = {};
            this.claimedTasks = [];
            if (this.onTasksRefreshed) this.onTasksRefreshed();
        }
    }
    
    selectDailyTasks() {
        // Randomly select 3 tasks
        this.activeTasks = [];
        
        const available = [...this.taskPool];
        // Shuffle
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }
        
        for (let i = 0; i < Math.min(3, available.length); i++) {
            this.activeTasks.push(available[i]);
        }
    }
    
    updateTaskProgress(conditionType, param, value) {
        for (const task of this.activeTasks) {
            if (this.claimedTasks.includes(task.id)) continue;
            
            const parts = task.condition.split(':');
            if (parts.length < 2) continue;
            
            const taskType = parts[0];
            
            // Match condition type
            if (taskType === conditionType) {
                // For workstation tasks
                if (conditionType === 'craft' || conditionType === 'own') {
                    if (parts.length > 2 && parts[2] === param) {
                        const target = parts.length > 3 ? parseInt(parts[3], 10) : 1;
                        this.taskProgress[task.id] = value;
                        if (this.onTaskProgressUpdated) {
                            this.onTaskProgressUpdated(task.id, value, target);
                        }
                        
                        if (value >= target) {
                            if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                        }
                    }
                }
                // For tap tasks
                else if (conditionType === 'tap') {
                    const target = parseInt(parts[1], 10);
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
                // For craft_item tasks
                else if (conditionType === 'craft_item') {
                    if (parts.length > 1 && parts[1] === param) {
                        const target = parts.length > 2 ? parseInt(parts[2], 10) : 1;
                        this.taskProgress[task.id] = value;
                        if (this.onTaskProgressUpdated) {
                            this.onTaskProgressUpdated(task.id, value, target);
                        }
                        
                        if (value >= target) {
                            if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                        }
                    }
                }
                // For earn_ab tasks
                else if (conditionType === 'earn_ab') {
                    const target = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
                // For discover_recipe tasks
                else if (conditionType === 'discover_recipe') {
                    const target = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
                // For craft_potion tasks
                else if (conditionType === 'craft_potion') {
                    const target = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
                // For meditation tasks
                else if (conditionType === 'meditation_waves') {
                    const target = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
                else if (conditionType === 'meditation_towers') {
                    const target = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
                else if (conditionType === 'earn_focus') {
                    const target = parts.length > 1 ? parseInt(parts[1], 10) : 1;
                    this.taskProgress[task.id] = value;
                    if (this.onTaskProgressUpdated) {
                        this.onTaskProgressUpdated(task.id, value, target);
                    }
                    
                    if (value >= target) {
                        if (this.onTaskCompleted) this.onTaskCompleted(task.id);
                    }
                }
            }
        }
    }
    
    claimTask(taskId) {
        if (this.claimedTasks.includes(taskId)) return false;
        
        const task = this.activeTasks.find(t => t.id === taskId);
        if (!task) return false;
        
        // Check completion
        const parts = task.condition.split(':');
        const target = parts.length > 0 ? parseInt(parts[parts.length - 1], 10) : 1;
        const progress = this.taskProgress[taskId] || 0;
        
        if (progress < target) return false;
        
        // Grant reward
        switch (task.rewardType) {
            case 'ab':
                this.gameState.addAb(task.rewardValue);
                break;
            case 'buff':
                // Buff type: 'production' for production bonuses, duration in seconds
                this.gameState.addBuff('production', task.buffMultiplier, task.rewardValue);
                break;
            case 'ek_frag':
                this.grantEkFragments(Math.floor(task.rewardValue));
                break;
        }
        
        this.claimedTasks.push(taskId);
        return true;
    }
    
    grantEkFragments(amount) {
        this.ekFragments += amount;
        
        // Convert 5 fragments → 1 EK
        while (this.ekFragments >= 5) {
            this.ekFragments -= 5;
            this.gameState.prestigePoints += 1;
        }
    }
    
    saveState() {
        return {
            dayKey: this.currentDayKey,
            activeIds: this.activeTasks.map(t => t.id),
            progress: { ...this.taskProgress },
            claimed: [...this.claimedTasks],
            ekFragments: this.ekFragments
        };
    }
    
    loadState(data) {
        this.currentDayKey = data.dayKey || '';
        this.taskProgress = data.progress || {};
        this.claimedTasks = data.claimed || [];
        this.ekFragments = data.ekFragments || 0;
        
        // Reconstruct active tasks
        const activeIds = data.activeIds || [];
        this.activeTasks = [];
        for (const taskId of activeIds) {
            const task = this.taskPool.find(t => t.id === taskId);
            if (task) this.activeTasks.push(task);
        }
        
        this.checkDailyRefresh();
    }
}

