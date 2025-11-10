// Achievement System

export class AchievementSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.achievements = [];
        this.unlockedAchievements = new Set();
        this.initializeAchievements();
    }
    
    initializeAchievements() {
        this.achievements = [
            // Early game achievements - adjusted to prevent too-quick unlocks
            {
                id: 'first_cast',
                name: 'First Spell Cast',
                description: 'You\'ve cast your first spell, gathering magic before it fades completely. Fire from the air. Water from moisture. Crystal from dust. The elements respond to your call—for now. This is your first step in preserving what remains.',
                condition: () => this.gameState.totalTaps >= 1,
                reward: { type: 'ab', amount: 10 }
            },
            {
                id: 'first_ab',
                name: 'First Spell Energy',
                description: 'You\'ve preserved your first Spell Energy—magic captured and crystallized before it could fade. Unstable, fragile, but real. This proves preservation is possible. Keep going.',
                condition: () => this.gameState.ab >= 1,
                reward: { type: 'ab', amount: 5 }
            },
            {
                id: 'first_workstation',
                name: 'First Preservation Chamber',
                description: 'You\'ve built your first preservation chamber. The fading slows, if only slightly. One chamber won\'t save the world—but it\'s a start. Every small victory against entropy matters.',
                condition: () => this.gameState.totalWorkstationsCrafted >= 1,
                reward: { type: 'ab', amount: 50 }
            },
            {
                id: 'ten_casts',
                name: 'Decade of Spells',
                description: 'Cast 10 spells',
                condition: () => this.gameState.totalTaps >= 10,
                reward: { type: 'ab', amount: 20 }
            },
            {
                id: 'hundred_casts',
                name: 'Century of Spells',
                description: 'Cast 100 spells',
                condition: () => this.gameState.totalTaps >= 100,
                reward: { type: 'ab', amount: 100 }
            },
            {
                id: 'fifty_ab',
                name: 'Half Century of Power',
                description: 'Reach 50 AB',
                condition: () => this.gameState.ab >= 50,
                reward: { type: 'ab', amount: 100 }
            },
            {
                id: 'hundred_ab',
                name: 'Century of Power',
                description: 'Reach 100 AB',
                condition: () => this.gameState.ab >= 100,
                reward: { type: 'ab', amount: 200 }
            },
            {
                id: 'first_discovery',
                name: 'Experimenter',
                description: 'You\'ve discovered a new preservation technique through experimentation. Each discovery helps you fight the fading more effectively. Innovation isn\'t lost—you\'re proof of that.',
                condition: () => this.gameState.discoveredRecipes.length >= 1,
                reward: { type: 'ab', amount: 100 }
            },
            
            // Mid game achievements
            {
                id: 'five_workstations',
                name: 'Growing Production',
                description: 'Craft 5 workstations',
                condition: () => this.gameState.totalWorkstationsCrafted >= 5,
                reward: { type: 'ab', amount: 200 }
            },
            {
                id: 'ten_workstations',
                name: 'Industrial Scale',
                description: 'Craft 10 workstations',
                condition: () => this.gameState.totalWorkstationsCrafted >= 10,
                reward: { type: 'ab', amount: 500 }
            },
            {
                id: 'five_hundred_ab',
                name: 'Half Thousand Power',
                description: 'Reach 500 AB',
                condition: () => this.gameState.ab >= 500,
                reward: { type: 'ab', amount: 500 }
            },
            {
                id: 'thousand_ab',
                name: 'Thousand Power',
                description: 'Reach 1000 AB',
                condition: () => this.gameState.ab >= 1000,
                reward: { type: 'ab', amount: 1000 }
            },
            {
                id: 'three_workstation_types',
                name: 'Diverse Start',
                description: 'Own 3 different workstation types',
                condition: () => Object.keys(this.gameState.workstations).length >= 3,
                reward: { type: 'ab', amount: 300 }
            },
            {
                id: 'five_workstation_types',
                name: 'Diverse Production',
                description: 'Own 5 different workstation types',
                condition: () => Object.keys(this.gameState.workstations).length >= 5,
                reward: { type: 'ab', amount: 500 }
            },
            {
                id: 'five_hundred_casts',
                name: 'Half Millennium of Spells',
                description: 'Cast 500 spells',
                condition: () => this.gameState.totalTaps >= 500,
                reward: { type: 'ab', amount: 1000 }
            },
            {
                id: 'thousand_casts',
                name: 'Millennium of Spells',
                description: 'Cast 1000 spells',
                condition: () => this.gameState.totalTaps >= 1000,
                reward: { type: 'ab', amount: 2000 }
            },
            {
                id: 'five_upgrades',
                name: 'Apprentice Inscriber',
                description: 'Purchase 5 upgrades',
                condition: () => Object.keys(this.gameState.upgradesOwned).length >= 5,
                reward: { type: 'ab', amount: 2000 }
            },
            {
                id: 'ten_upgrades',
                name: 'Master Inscriber',
                description: 'Purchase 10 upgrades',
                condition: () => Object.keys(this.gameState.upgradesOwned).length >= 10,
                reward: { type: 'ab', amount: 5000 }
            },
            {
                id: 'three_discoveries',
                name: 'Experienced Alchemist',
                description: 'Discover 3 recipes',
                condition: () => this.gameState.discoveredRecipes.length >= 3,
                reward: { type: 'ab', amount: 1000 }
            },
            {
                id: 'five_discoveries',
                name: 'Master Alchemist',
                description: 'Discover 5 recipes',
                condition: () => this.gameState.discoveredRecipes.length >= 5,
                reward: { type: 'ab', amount: 2000 }
            },
            
            // Late game achievements
            {
                id: 'ten_thousand_ab',
                name: 'Ten Thousand Power',
                description: 'Reach 10000 AB',
                condition: () => this.gameState.ab >= 10000,
                reward: { type: 'ab', amount: 10000 }
            },
            {
                id: 'hundred_workstations',
                name: 'Mass Production',
                description: 'Craft 100 workstations',
                condition: () => this.gameState.totalWorkstationsCrafted >= 100,
                reward: { type: 'ab', amount: 50000 }
            },
            {
                id: 'ten_workstation_types',
                name: 'Complete Production',
                description: 'Own 10 different workstation types',
                condition: () => Object.keys(this.gameState.workstations).length >= 10,
                reward: { type: 'ab', amount: 20000 }
            },
            {
                id: 'hundred_thousand_ab',
                name: 'Hundred Thousand Power',
                description: 'Reach 100000 AB',
                condition: () => this.gameState.ab >= 100000,
                reward: { type: 'ab', amount: 100000 }
            },
            {
                id: 'million_ab',
                name: 'Million Power',
                description: 'Reach 1000000 AB',
                condition: () => this.gameState.ab >= 1000000,
                reward: { type: 'ab', amount: 500000 }
            },
            {
                id: 'all_discoveries',
                name: 'Master Alchemist',
                description: 'Discover all recipes',
                condition: () => this.gameState.discoveredRecipes.length >= 20,
                reward: { type: 'ab', amount: 100000 }
            },
            {
                id: 'all_upgrades',
                name: 'Complete Inscription',
                description: 'Purchase all upgrades',
                condition: () => Object.keys(this.gameState.upgradesOwned).length >= 25,
                reward: { type: 'ab', amount: 500000 }
            },
            
            // Prestige achievements
            {
                id: 'first_prestige',
                name: 'Ascendant',
                description: 'Complete your first prestige',
                condition: () => this.gameState.prestigePoints >= 1,
                reward: { type: 'ek', amount: 1 }
            },
            {
                id: 'ten_prestige',
                name: 'Master Ascendant',
                description: 'Complete 10 prestiges',
                condition: () => this.gameState.prestigePoints >= 10,
                reward: { type: 'ek', amount: 5 }
            },
            {
                id: 'hundred_prestige',
                name: 'Grand Master',
                description: 'Complete 100 prestiges',
                condition: () => this.gameState.prestigePoints >= 100,
                reward: { type: 'ek', amount: 50 }
            },
            
            // Special achievements
            {
                id: 'million_casts',
                name: 'Legendary Caster',
                description: 'Cast 1000000 spells',
                condition: () => this.gameState.totalTaps >= 1000000,
                reward: { type: 'ab', amount: 1000000 }
            },
            {
                id: 'all_workstation_types',
                name: 'Universal Producer',
                description: 'Own all workstation types',
                condition: () => Object.keys(this.gameState.workstations).length >= 17,
                reward: { type: 'ab', amount: 1000000 }
            },
            
            // Focus-related achievements
            {
                id: 'hundred_focus',
                name: 'Focus Accumulator',
                description: 'Produce 100 Focus',
                condition: () => (this.gameState.inventory?.focus || 0) + (this.gameState.totalFocusProduced || 0) >= 100,
                reward: { type: 'ab', amount: 10000 }
            },
            {
                id: 'thousand_focus',
                name: 'Focus Master',
                description: 'Produce 1000 Focus',
                condition: () => (this.gameState.inventory?.focus || 0) + (this.gameState.totalFocusProduced || 0) >= 1000,
                reward: { type: 'ab', amount: 50000 }
            },
            {
                id: 'focus_experiment',
                name: 'Focus Experimenter',
                description: 'Discover Focus Elixir recipe',
                condition: () => this.gameState.discoveredRecipes?.includes('focus_elixir'),
                reward: { type: 'ab', amount: 25000 }
            },
            {
                id: 'ten_thousand_focus',
                name: 'Focus Transcendence',
                description: 'Produce 10000 Focus',
                condition: () => (this.gameState.inventory?.focus || 0) + (this.gameState.totalFocusProduced || 0) >= 10000,
                reward: { type: 'ab', amount: 500000 }
            }
        ];
    }
    
    checkAchievements() {
        const newlyUnlocked = [];
        
        for (const achievement of this.achievements) {
            if (this.unlockedAchievements.has(achievement.id)) continue;
            
            if (achievement.condition()) {
                this.unlockedAchievements.add(achievement.id);
                newlyUnlocked.push(achievement);
                
                // Grant reward
                this.grantReward(achievement.reward);
            }
        }
        
        return newlyUnlocked;
    }
    
    grantReward(reward) {
        switch (reward.type) {
            case 'ab':
                this.gameState.addAb(reward.amount);
                break;
            case 'ek':
                this.gameState.prestigePoints += reward.amount;
                break;
        }
    }
    
    getUnlockedCount() {
        return this.unlockedAchievements.size;
    }
    
    getTotalCount() {
        return this.achievements.length;
    }
}

