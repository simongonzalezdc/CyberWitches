import { handleError, safeFunction } from './errorHandler.js';
// Particle effects removed for memory optimization
import { audioSystem } from './audioSystem.js';
import { celebrationAnimations } from './celebrationAnimations.js';

/**
 * Easter Eggs System - Manages hidden features and Easter eggs
 * Provides secret content and special interactions
 */

/**
 * @typedef {Object} EasterEgg
 * @property {string} id - Unique Easter egg identifier
 * @property {string} name - Easter egg name
 * @property {string} description - Easter egg description
 * @property {string} type - Easter egg type ('sequence', 'click', 'time', 'combo', 'text')
 * @property {Array} trigger - Trigger conditions
 * @property {Function} action - Action to perform when triggered
 * @property {boolean} discovered - Whether Easter egg has been discovered
 * @property {number} discoveryCount - Number of times discovered
 * @property {number} lastDiscovery - Last discovery timestamp
 */

/**
 * Easter Eggs System class
 */
export class EasterEggsSystem {
    /**
     * Create a new EasterEggsSystem instance
     */
    constructor() {
        this.easterEggs = new Map();
        this.discoveredEggs = new Set();
        this.activeSequences = new Map();
        this.clickPattern = [];
        this.lastClickTime = 0;
        this.comboCount = 0;
        this.lastComboTime = 0;
        
        // Easter egg state
        this.konamiCode = [];
        this.textInputBuffer = '';
        this.specialDates = new Map();
        
        // Initialize Easter eggs
        this.initializeEasterEggs();
        
        // Load discovered eggs
        this.loadDiscoveredEggs();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check for special dates
        this.checkSpecialDates();
    }
    
    /**
     * Initialize all Easter eggs
     * @private
     */
    initializeEasterEggs() {
        // Konami Code Easter Egg
        this.easterEggs.set('konami_code', {
            id: 'konami_code',
            name: 'Konami Code',
            description: 'Enter the classic Konami code for a surprise!',
            type: 'sequence',
            trigger: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
            action: () => this.triggerKonamiCode(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Rapid Click Easter Egg
        this.easterEggs.set('rapid_click', {
            id: 'rapid_click',
            name: 'Hyper Clicking',
            description: 'Click 20 times within 2 seconds to unlock hyper mode!',
            type: 'click',
            trigger: { count: 20, timeframe: 2000 },
            action: () => this.triggerRapidClick(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Midnight Magic Easter Egg
        this.easterEggs.set('midnight_magic', {
            id: 'midnight_magic',
            name: 'Midnight Magic',
            description: 'Play at midnight for enhanced magical powers!',
            type: 'time',
            trigger: { hour: 0, minute: 0 },
            action: () => this.triggerMidnightMagic(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Combo Master Easter Egg
        this.easterEggs.set('combo_master', {
            id: 'combo_master',
            name: 'Combo Master',
            description: 'Achieve a 50x combo to enter the matrix!',
            type: 'combo',
            trigger: { multiplier: 50 },
            action: () => this.triggerComboMaster(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Secret Command Easter Egg
        this.easterEggs.set('secret_command', {
            id: 'secret_command',
            name: 'Secret Command',
            description: 'Type the secret incantation to unlock ancient knowledge!',
            type: 'text',
            trigger: { phrases: ['abra cadabra', 'open sesame', 'expecto patronum', 'wingardium leviosa'] },
            action: (phrase) => this.triggerSecretCommand(phrase),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Number of the Beast Easter Egg
        this.easterEggs.set('number_of_the_beast', {
            id: 'number_of_the_beast',
            name: 'Number of the Beast',
            description: 'Have exactly 666 AB to unlock demonic powers!',
            type: 'combo',
            trigger: { abAmount: 666 },
            action: () => this.triggerNumberOfTheBeast(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Perfect Balance Easter Egg
        this.easterEggs.set('perfect_balance', {
            id: 'perfect_balance',
            name: 'Perfect Balance',
            description: 'Own exactly 100 of each basic ingredient for harmony bonus!',
            type: 'combo',
            trigger: { ingredients: { crystal_dust: 100, aether_ess: 100, fire_essence: 100, water_essence: 100, air_essence: 100 } },
            action: () => this.triggerPerfectBalance(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Binary Day Easter Egg
        this.easterEggs.set('binary_day', {
            id: 'binary_day',
            name: 'Binary Day',
            description: 'Play on 10/31 (Oct 31) for binary magic!',
            type: 'time',
            trigger: { month: 9, day: 31 }, // Month is 0-indexed
            action: () => this.triggerBinaryDay(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Pi Day Easter Egg
        this.easterEggs.set('pi_day', {
            id: 'pi_day',
            name: 'Pi Day',
            description: 'Play on 3/14 (Mar 14) at 1:59 PM for mathematical enlightenment!',
            type: 'time',
            trigger: { month: 2, day: 14, hour: 13, minute: 59 },
            action: () => this.triggerPiDay(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Friday the 13th Easter Egg
        this.easterEggs.set('friday_13th', {
            id: 'friday_13th',
            name: 'Friday the 13th',
            description: 'Play on Friday the 13th for unlucky (or lucky?) rewards!',
            type: 'time',
            trigger: { dayOfWeek: 5, day: 13 }, // Day 5 = Friday
            action: () => this.triggerFriday13th(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Developer Mode Easter Egg
        this.easterEggs.set('developer_mode', {
            id: 'developer_mode',
            name: 'Developer Mode',
            description: 'Type "sudo make me a developer" for admin access!',
            type: 'text',
            trigger: { phrases: ['sudo make me a developer', 'admin mode activate', 'god mode on'] },
            action: (phrase) => this.triggerDeveloperMode(phrase),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Quantum Entanglement Easter Egg
        this.easterEggs.set('quantum_entanglement', {
            id: 'quantum_entanglement',
            name: 'Quantum Entanglement',
            description: 'Craft 42 workstations to discover the meaning of life!',
            type: 'combo',
            trigger: { workstationCount: 42 },
            action: () => this.triggerQuantumEntanglement(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
        
        // Hexadecimal Mastery Easter Egg
        this.easterEggs.set('hexadecimal_mastery', {
            id: 'hexadecimal_mastery',
            name: 'Hexadecimal Mastery',
            description: 'Reach exactly 255 of any workstation for hex power!',
            type: 'combo',
            trigger: { workstationCount: 255 },
            action: () => this.triggerHexadecimalMastery(),
            discovered: false,
            discoveryCount: 0,
            lastDiscovery: 0
        });
    }
    
    /**
     * Set up event listeners for Easter egg detection
     * @private
     */
    setupEventListeners() {
        // Keyboard events for sequences
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // Click events for rapid clicking
        document.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        // Time-based checks
        setInterval(() => {
            this.checkTimeBasedEggs();
        }, 60000); // Check every minute
    }
    
    /**
     * Handle key press events for sequence detection
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    handleKeyPress(event) {
        const key = event.key;
        
        // Check Konami code
        const konamiEgg = this.easterEggs.get('konami_code');
        if (konamiEgg && !konamiEgg.discovered) {
            this.konamiCode.push(key);
            
            // Keep only last 9 keys
            if (this.konamiCode.length > 9) {
                this.konamiCode.shift();
            }
            
            // Check if sequence matches
            const sequenceMatches = konamiEgg.trigger.every((triggerKey, index) => 
                this.konamiCode[index] === triggerKey
            );
            
            if (sequenceMatches) {
                this.discoverEasterEgg('konami_code');
            }
        }
        
        // Check text input for secret commands
        const secretCommandEgg = this.easterEggs.get('secret_command');
        const developerModeEgg = this.easterEggs.get('developer_mode');
        
        if ((secretCommandEgg && !secretCommandEgg.discovered) || 
            (developerModeEgg && !developerModeEgg.discovered)) {
            
            // Build text buffer
            if (key.length === 1) {
                this.textInputBuffer += key.toLowerCase();
            } else if (key === 'Backspace') {
                this.textInputBuffer = this.textInputBuffer.slice(0, -1);
            } else if (key === 'Enter') {
                this.checkTextInputPhrases();
                this.textInputBuffer = '';
            }
            
            // Keep buffer manageable
            if (this.textInputBuffer.length > 100) {
                this.textInputBuffer = this.textInputBuffer.slice(-50);
            }
        }
    }
    
    /**
     * Check text input for secret phrases
     * @private
     */
    checkTextInputPhrases() {
        const secretCommandEgg = this.easterEggs.get('secret_command');
        const developerModeEgg = this.easterEggs.get('developer_mode');
        
        // Check secret command phrases
        if (secretCommandEgg && !secretCommandEgg.discovered) {
            for (const phrase of secretCommandEgg.trigger.phrases) {
                if (this.textInputBuffer.includes(phrase)) {
                    this.discoverEasterEgg('secret_command', phrase);
                    return;
                }
            }
        }
        
        // Check developer mode phrases
        if (developerModeEgg && !developerModeEgg.discovered) {
            for (const phrase of developerModeEgg.trigger.phrases) {
                if (this.textInputBuffer.includes(phrase)) {
                    this.discoverEasterEgg('developer_mode', phrase);
                    return;
                }
            }
        }
    }
    
    /**
     * Handle click events for rapid clicking detection
     * @param {MouseEvent} event - Mouse event
     * @private
     */
    handleClick(event) {
        const now = Date.now();
        
        // Add to click pattern
        this.clickPattern.push(now);
        
        // Keep only clicks within last 5 seconds
        this.clickPattern = this.clickPattern.filter(time => now - time < 5000);
        
        // Check rapid click Easter egg
        const rapidClickEgg = this.easterEggs.get('rapid_click');
        if (rapidClickEgg && !rapidClickEgg.discovered) {
            const recentClicks = this.clickPattern.filter(time => now - time < rapidClickEgg.trigger.timeframe);
            
            if (recentClicks.length >= rapidClickEgg.trigger.count) {
                this.discoverEasterEgg('rapid_click');
            }
        }
        
        this.lastClickTime = now;
    }
    
    /**
     * Check time-based Easter eggs
     * @private
     */
    checkTimeBasedEggs() {
        const now = new Date();
        
        // Check midnight magic
        const midnightEgg = this.easterEggs.get('midnight_magic');
        if (midnightEgg && !midnightEgg.discovered) {
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                this.discoverEasterEgg('midnight_magic');
            }
        }
        
        // Check binary day
        const binaryDayEgg = this.easterEggs.get('binary_day');
        if (binaryDayEgg && !binaryDayEgg.discovered) {
            if (now.getMonth() === 9 && now.getDate() === 31) { // October 31
                this.discoverEasterEgg('binary_day');
            }
        }
        
        // Check Pi day
        const piDayEgg = this.easterEggs.get('pi_day');
        if (piDayEgg && !piDayEgg.discovered) {
            if (now.getMonth() === 2 && now.getDate() === 14 && 
                now.getHours() === 13 && now.getMinutes() === 59) {
                this.discoverEasterEgg('pi_day');
            }
        }
        
        // Check Friday the 13th
        const friday13thEgg = this.easterEggs.get('friday_13th');
        if (friday13thEgg && !friday13thEgg.discovered) {
            if (now.getDay() === 5 && now.getDate() === 13) { // Friday = 5
                this.discoverEasterEgg('friday_13th');
            }
        }
    }
    
    /**
     * Check for special dates
     * @private
     */
    checkSpecialDates() {
        const now = new Date();
        const dateString = `${now.getMonth() + 1}-${now.getDate()}`;
        
        // Store special dates for reference
        this.specialDates.set('new_year', `${now.getFullYear()}-1-1`);
        this.specialDates.set('halloween', `${now.getFullYear()}-10-31`);
        this.specialDates.set('christmas', `${now.getFullYear()}-12-25`);
    }
    
    /**
     * Discover an Easter egg
     * @param {string} eggId - Easter egg ID
     * @param {*} context - Additional context for discovery
     * @private
     */
    discoverEasterEgg(eggId, context = null) {
        const egg = this.easterEggs.get(eggId);
        if (!egg || egg.discovered) {
            return;
        }
        
        // Mark as discovered
        egg.discovered = true;
        egg.discoveryCount++;
        egg.lastDiscovery = Date.now();
        
        this.discoveredEggs.add(eggId);
        
        // Save discovery
        this.saveDiscoveredEggs();
        
        // Trigger Easter egg action
        try {
            egg.action(context);
        } catch (error) {
            handleError(error, 'easterEggAction');
        }
        
        // Show discovery notification
        this.showDiscoveryNotification(egg);
    }
    
    /**
     * Trigger Konami code Easter egg
     * @private
     */
    triggerKonamiCode() {
        // Add special visual effects
        document.body.style.animation = 'konamiEffect 2s ease-in-out';
        
        // Play special sound
        audioSystem.playSound('level_up');
        
        // Create particle effect
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Particle effects removed for memory optimization
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Konami Code Master!',
            'You unlocked the classic Konami code! +30 lives!',
            'epic',
            'Extra Lives: +30'
        );
        
        // Reset animation after completion
        setTimeout(() => {
            document.body.style.animation = '';
        }, 2000);
    }
    
    /**
     * Trigger rapid click Easter egg
     * @private
     */
    triggerRapidClick() {
        // Enable hyper clicking mode
        const castButton = document.getElementById('cast-button');
        if (castButton) {
            castButton.style.animation = 'hyperClickPulse 0.5s ease-in-out infinite';
            castButton.style.boxShadow = '0 0 20px rgba(255, 0, 255, 0.8)';
        }
        
        // Play hyper sound
        audioSystem.playSound('cast');
        
        // Show notification
        celebrationAnimations.createAchievementCelebration(
            'Hyper Clicking Activated!',
            'Your clicking speed has been enhanced! 2x casting speed for 5 minutes!',
            'rare',
            '2x Casting Speed (5 min)'
        );
        
        // Reset after 5 minutes
        setTimeout(() => {
            if (castButton) {
                castButton.style.animation = '';
                castButton.style.boxShadow = '';
            }
        }, 300000);
    }
    
    /**
     * Trigger midnight magic Easter egg
     * @private
     */
    triggerMidnightMagic() {
        // Add mystical visual effect
        document.body.style.filter = 'hue-rotate(180deg) saturate(1.5)';
        
        // Play mystical sound
        audioSystem.playSound('ritual_complete');
        
        // Create magical particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Particle effects removed for memory optimization
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Midnight Magic!',
            'The witching hour has begun! All production doubled for 1 hour!',
            'epic',
            '2x Production (1 hour)'
        );
        
        // Reset after 1 hour
        setTimeout(() => {
            document.body.style.filter = '';
        }, 3600000);
    }
    
    /**
     * Trigger combo master Easter egg
     * @private
     */
    triggerComboMaster() {
        // Add matrix effect
        const matrixRain = document.createElement('div');
        matrixRain.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 0, 0.1) 2px
            );
            animation: matrixRain 3s linear infinite;
        `;
        document.body.appendChild(matrixRain);
        
        // Play matrix sound
        audioSystem.playSound('level_up');
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Combo Master!',
            'You entered the matrix! All upgrades are free for 30 seconds!',
            'legendary',
            'Free Upgrades (30 sec)'
        );
        
        // Remove effect after 30 seconds
        setTimeout(() => {
            if (matrixRain.parentNode) {
                matrixRain.parentNode.removeChild(matrixRain);
            }
        }, 30000);
    }
    
    /**
     * Trigger secret command Easter egg
     * @param {string} phrase - Secret phrase that was entered
     * @private
     */
    triggerSecretCommand(phrase) {
        // Play magical sound
        audioSystem.playSound('ritual_complete');
        
        // Create magical particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Particle effects removed for memory optimization
        
        // Show celebration with phrase-specific message
        const messages = {
            'abra cadabra': 'Ancient magic unlocked! +100 AB!',
            'open sesame': 'Secret cave opened! Hidden treasure revealed!',
            'expecto patronum': 'Patronus charm learned! Ghosts repelled!',
            'wingardium leviosa': 'Levitation mastered! Objects float!'
        };
        
        const message = messages[phrase] || 'Ancient knowledge revealed!';
        
        celebrationAnimations.createAchievementCelebration(
            'Secret Command!',
            message,
            'epic',
            'Ancient Knowledge'
        );
    }
    
    /**
     * Trigger number of the beast Easter egg
     * @private
     */
    triggerNumberOfTheBeast() {
        // Add demonic visual effect
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        
        // Play evil sound
        audioSystem.playSound('error');
        
        // Show dark celebration
        celebrationAnimations.createAchievementCelebration(
            'Number of the Beast!',
            '666 AB achieved! Demonic powers unlocked! Production increased by 6.66%!',
            'epic',
            '+6.66% Production'
        );
        
        // Reset after 10 seconds
        setTimeout(() => {
            document.body.style.filter = '';
        }, 10000);
    }
    
    /**
     * Trigger perfect balance Easter egg
     * @private
     */
    triggerPerfectBalance() {
        // Add harmony effect
        document.body.style.filter = 'sepia(0.2) saturate(1.2)';
        
        // Play harmony sound
        audioSystem.playSound('achievement');
        
        // Create balance particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        particleEffects.createAchievementEffect(centerX, centerY);
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Perfect Balance!',
            'Harmony achieved! All production increased by 25% for 10 minutes!',
            'rare',
            '+25% Production (10 min)'
        );
        
        // Reset after 10 minutes
        setTimeout(() => {
            document.body.style.filter = '';
        }, 600000);
    }
    
    /**
     * Trigger binary day Easter egg
     * @private
     */
    triggerBinaryDay() {
        // Add binary effect
        document.body.style.filter = 'contrast(1.5) grayscale(1)';
        
        // Play digital sound
        audioSystem.playSound('notification');
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Binary Day!',
            '01010110! Binary magic activated! All workstations produce in binary!',
            'rare',
            'Binary Production'
        );
        
        // Reset after 24 hours
        setTimeout(() => {
            document.body.style.filter = '';
        }, 86400000);
    }
    
    /**
     * Trigger Pi day Easter egg
     * @private
     */
    triggerPiDay() {
        // Add mathematical effect
        document.body.style.filter = 'hue-rotate(120deg) saturate(1.5)';
        
        // Play mathematical sound
        audioSystem.playSound('achievement');
        
        // Create pi particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Particle effects removed for memory optimization
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Pi Day!',
            '3.1415926535... Mathematical enlightenment achieved! All circles are now perfect!',
            'epic',
            'Perfect Circles'
        );
        
        // Reset after 24 hours
        setTimeout(() => {
            document.body.style.filter = '';
        }, 86400000);
    }
    
    /**
     * Trigger Friday the 13th Easter egg
     * @private
     */
    triggerFriday13th() {
        // Add unlucky effect
        document.body.style.filter = 'sepia(0.3) contrast(1.2)';
        
        // Play spooky sound
        audioSystem.playSound('error');
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Friday the 13th!',
            'Unlucky day? Or lucky! All production increased by 13%!',
            'rare',
            '+13% Production'
        );
        
        // Reset after 24 hours
        setTimeout(() => {
            document.body.style.filter = '';
        }, 86400000);
    }
    
    /**
     * Trigger developer mode Easter egg
     * @param {string} phrase - Phrase that triggered the egg
     * @private
     */
    triggerDeveloperMode(phrase) {
        // Add developer console
        const devConsole = document.createElement('div');
        devConsole.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 200px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ff00;
            border-radius: 5px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            z-index: 9999;
            overflow-y: auto;
        `;
        devConsole.innerHTML = `
            <div style="color: #00ff00; font-weight: bold; margin-bottom: 10px;">
                DEVELOPER MODE ACTIVATED
            </div>
            <div>Access granted. Debug tools enabled.</div>
            <div>System commands:</div>
            <div>- add_ab(1000)</div>
            <div>- unlock_all()</div>
            <div>- max_level()</div>
        `;
        document.body.appendChild(devConsole);
        
        // Play admin sound
        audioSystem.playSound('level_up');
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Developer Mode!',
            'Admin access granted! Debug console enabled!',
            'legendary',
            'Debug Console'
        );
        
        // Remove after 5 minutes
        setTimeout(() => {
            if (devConsole.parentNode) {
                devConsole.parentNode.removeChild(devConsole);
            }
        }, 300000);
    }
    
    /**
     * Trigger quantum entanglement Easter egg
     * @private
     */
    triggerQuantumEntanglement() {
        // Add quantum effect
        document.body.style.filter = 'blur(1px) hue-rotate(90deg)';
        
        // Play quantum sound
        audioSystem.playSound('ritual_complete');
        
        // Create quantum particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Particle effects removed for memory optimization
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Quantum Entanglement!',
            'The answer to life, the universe, and everything! All workstations are now entangled!',
            'legendary',
            'Quantum Entanglement'
        );
        
        // Reset after 1 hour
        setTimeout(() => {
            document.body.style.filter = '';
        }, 3600000);
    }
    
    /**
     * Trigger hexadecimal mastery Easter egg
     * @private
     */
    triggerHexadecimalMastery() {
        // Add hex effect
        document.body.style.filter = 'hue-rotate(270deg) saturate(2)';
        
        // Play hex sound
        audioSystem.playSound('level_up');
        
        // Create hex particles
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Particle effects removed for memory optimization
        
        // Show celebration
        celebrationAnimations.createAchievementCelebration(
            'Hexadecimal Mastery!',
            '0xFF achieved! Maximum power reached! All production multiplied by 2.55!',
            'legendary',
            '2.55x Production'
        );
        
        // Reset after 30 minutes
        setTimeout(() => {
            document.body.style.filter = '';
        }, 1800000);
    }
    
    /**
     * Show discovery notification
     * @param {EasterEgg} egg - Discovered Easter egg
     * @private
     */
    showDiscoveryNotification(egg) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: easterEggNotification 0.5s ease-out;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 5px;">🥚 EASTER EGG FOUND!</div>
            <div style="font-weight: normal;">${egg.name}</div>
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">${egg.description}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Play discovery sound
        audioSystem.playSound('achievement');
        
        // Particle effects removed for memory optimization
        // Achievement effect removed
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'easterEggNotificationFade 0.5s ease-out forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    /**
     * Check combo-based Easter eggs
     * @param {number} multiplier - Current combo multiplier
     */
    checkComboEggs(multiplier) {
        const comboEgg = this.easterEggs.get('combo_master');
        if (comboEgg && !comboEgg.discovered && multiplier >= comboEgg.trigger.multiplier) {
            this.discoverEasterEgg('combo_master');
        }
    }
    
    /**
     * Check AB amount Easter eggs
     * @param {number} abAmount - Current AB amount
     */
    checkABEggs(abAmount) {
        const beastEgg = this.easterEggs.get('number_of_the_beast');
        if (beastEgg && !beastEgg.discovered && Math.floor(abAmount) === beastEgg.trigger.abAmount) {
            this.discoverEasterEgg('number_of_the_beast');
        }
    }
    
    /**
     * Check workstation count Easter eggs
     * @param {number} workstationCount - Current workstation count
     */
    checkWorkstationEggs(workstationCount) {
        const quantumEgg = this.easterEggs.get('quantum_entanglement');
        if (quantumEgg && !quantumEgg.discovered && workstationCount >= quantumEgg.trigger.workstationCount) {
            this.discoverEasterEgg('quantum_entanglement');
        }
        
        const hexEgg = this.easterEggs.get('hexadecimal_mastery');
        if (hexEgg && !hexEgg.discovered && workstationCount >= hexEgg.trigger.workstationCount) {
            this.discoverEasterEgg('hexadecimal_mastery');
        }
    }
    
    /**
     * Check ingredient balance Easter eggs
     * @param {Object} ingredients - Current ingredient amounts
     */
    checkIngredientEggs(ingredients) {
        const balanceEgg = this.easterEggs.get('perfect_balance');
        if (balanceEgg && !balanceEgg.discovered) {
            const requiredIngredients = balanceEgg.trigger.ingredients;
            const hasPerfectBalance = Object.entries(requiredIngredients).every(
                ([ingredient, amount]) => Math.floor(ingredients[ingredient] || 0) === amount
            );
            
            if (hasPerfectBalance) {
                this.discoverEasterEgg('perfect_balance');
            }
        }
    }
    
    /**
     * Load discovered Easter eggs from localStorage
     * @private
     */
    loadDiscoveredEggs() {
        try {
            const saved = localStorage.getItem('cyberWitchesEasterEggs');
            if (saved) {
                const discovered = JSON.parse(saved);
                this.discoveredEggs = new Set(discovered);
                
                // Update egg discovery status
                for (const eggId of this.discoveredEggs) {
                    const egg = this.easterEggs.get(eggId);
                    if (egg) {
                        egg.discovered = true;
                    }
                }
            }
        } catch (error) {
            handleError(error, 'loadEasterEggs');
        }
    }
    
    /**
     * Save discovered Easter eggs to localStorage
     * @private
     */
    saveDiscoveredEggs() {
        try {
            localStorage.setItem(
                'cyberWitchesEasterEggs',
                JSON.stringify(Array.from(this.discoveredEggs))
            );
        } catch (error) {
            handleError(error, 'saveEasterEggs');
        }
    }
    
    /**
     * Get Easter egg statistics
     * @returns {Object} Easter egg statistics
     */
    getStats() {
        const totalEggs = this.easterEggs.size;
        const discoveredCount = this.discoveredEggs.size;
        const discoveryRate = totalEggs > 0 ? (discoveredCount / totalEggs) * 100 : 0;
        
        return {
            totalEggs: totalEggs,
            discoveredCount: discoveredCount,
            discoveryRate: discoveryRate,
            discoveredEggs: Array.from(this.discoveredEggs),
            specialDates: Object.fromEntries(this.specialDates)
        };
    }
    
    /**
     * Reset all Easter eggs
     */
    resetEasterEggs() {
        this.discoveredEggs.clear();
        this.konamiCode = [];
        this.clickPattern = [];
        this.textInputBuffer = '';
        
        // Reset all egg discovery status
        for (const egg of this.easterEggs.values()) {
            egg.discovered = false;
            egg.discoveryCount = 0;
            egg.lastDiscovery = 0;
        }
        
        // Save reset state
        this.saveDiscoveredEggs();
    }
    
    /**
     * Add custom CSS for Easter egg effects
     * @private
     */
    addEasterEggStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes konamiEffect {
                0% { filter: hue-rotate(0deg); }
                50% { filter: hue-rotate(180deg) saturate(2); }
                100% { filter: hue-rotate(360deg); }
            }
            
            @keyframes hyperClickPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes matrixRain {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
            
            @keyframes easterEggNotification {
                0% {
                    opacity: 0;
                    transform: translateX(100%);
                }
                100% {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes easterEggNotificationFade {
                0% {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateX(100%) scale(0.8);
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Add Easter egg styles
const easterEggsSystem = new EasterEggsSystem();
easterEggsSystem.addEasterEggStyles();

// Export for use in other modules
export { easterEggsSystem };