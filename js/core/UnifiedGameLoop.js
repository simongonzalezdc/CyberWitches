/**
 * Unified Game Loop System
 * Implements dual-rate updates: 10 TPS for game logic, 30 FPS for visuals
 * (cinematic / low-power; see visualTimestep below). Rendering still runs
 * once per requestAnimationFrame with interpolation for smoothness.
 * Replaces multiple setInterval calls with single RAF-based loop
 * 
 * Key Benefits:
 * - Eliminates timing drift from setInterval
 * - Prevents frame skipping issues
 * - Reduces CPU usage (logic runs at 10 TPS, not 60 FPS)
 * - Better synchronization between systems
 */

import { GAME_CONSTANTS } from '../codeOrganization.js';

export class UnifiedGameLoop {
    constructor() {
        // Visual accumulator (30 FPS = ~33.3ms per visual step; see visualTimestep)
        this.visualAccumulator = 0;
        
        // Logic accumulator (10 TPS = 100ms per tick)
        this.logicAccumulator = 0;
        
        this.lastTime = performance.now();
        this.visualTimestep = 1000 / 30;  // 30 FPS (Cinematic/Low Power)
        this.logicTimestep = GAME_CONSTANTS.TICK_RATE;  // 10 TPS for game logic
        this.maxFrameTime = 250;  // Prevent spiral of death (4x normal frame time)
        
        this.isRunning = false;
        this.rafId = null;
        
        // Periodic check counters (integrated into main loop)
        this.tickCounter = 0;
        
        // Callbacks for different update types
        this.logicCallbacks = [];
        this.visualCallbacks = [];
        this.renderCallbacks = [];
        
        // Periodic check intervals (in ticks)
        this.periodicChecks = {
            tierCheck: { interval: 100, counter: 0, callback: null },      // Every 10s (100 ticks)
            achievementCheck: { interval: 20, counter: 0, callback: null }, // Every 2s (20 ticks)
            eventCheck: { interval: 10, counter: 0, callback: null },      // Every 1s (10 ticks)
            hudUpdate: { interval: 5, counter: 0, callback: null }          // Every 0.5s (5 ticks)
        };
    }
    
    /**
     * Register a callback for game logic updates (runs at 10 TPS)
     * @param {Function} callback - Function to call with delta time
     */
    registerLogicUpdate(callback) {
        if (typeof callback === 'function') {
            this.logicCallbacks.push(callback);
        }
    }
    
    /**
     * Register a callback for visual updates (runs at 60 FPS)
     * @param {Function} callback - Function to call with delta time
     */
    registerVisualUpdate(callback) {
        if (typeof callback === 'function') {
            this.visualCallbacks.push(callback);
        }
    }
    
    /**
     * Register a callback for rendering (runs at 60 FPS with interpolation)
     * @param {Function} callback - Function to call with interpolation alpha (0-1)
     */
    registerRender(callback) {
        if (typeof callback === 'function') {
            this.renderCallbacks.push(callback);
        }
    }
    
    /**
     * Register periodic check callback
     * @param {string} checkName - Name of the check ('tierCheck', 'achievementCheck', etc.)
     * @param {Function} callback - Function to call
     */
    registerPeriodicCheck(checkName, callback) {
        if (this.periodicChecks[checkName] && typeof callback === 'function') {
            this.periodicChecks[checkName].callback = callback;
        }
    }
    
    /**
     * Start the unified game loop
     */
    start() {
        if (this.isRunning) {
            console.warn('UnifiedGameLoop: Already running');
            return;
        }
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.visualAccumulator = 0;
        this.logicAccumulator = 0;
        this.tickCounter = 0;
        
        // Reset periodic check counters
        Object.values(this.periodicChecks).forEach(check => {
            check.counter = 0;
        });
        
        this.tick();
    }
    
    /**
     * Stop the unified game loop
     */
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
    
    /**
     * Main tick function - runs every frame via requestAnimationFrame
     * @private
     */
    tick() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        let frameTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Prevent spiral of death - cap frame time to prevent huge jumps
        if (frameTime > this.maxFrameTime) {
            frameTime = this.maxFrameTime;
        }
        
        // Skip if tab is hidden (save CPU)
        if (document.hidden) {
            this.rafId = requestAnimationFrame(() => this.tick());
            return;
        }
        
        // Accumulate time for both systems
        this.visualAccumulator += frameTime;
        this.logicAccumulator += frameTime;
        
        // Update game logic at 10 TPS (currency calculations, achievements, etc.)
        // No need for 60 FPS here - saves significant CPU!
        while (this.logicAccumulator >= this.logicTimestep) {
            const delta = this.logicTimestep / 1000; // Convert to seconds
            
            // Call all logic update callbacks
            this.logicCallbacks.forEach(callback => {
                try {
                    callback(delta);
                } catch (error) {
                    console.error('UnifiedGameLoop: Error in logic callback:', error);
                }
            });
            
            // Run periodic checks
            this.runPeriodicChecks();
            
            this.logicAccumulator -= this.logicTimestep;
            this.tickCounter++;
        }
        
        // Update visuals at 30 FPS for cinematic feel and low CPU usage
        while (this.visualAccumulator >= this.visualTimestep) {
            const delta = this.visualTimestep / 1000; // Convert to seconds
            
            // Call all visual update callbacks
            this.visualCallbacks.forEach(callback => {
                try {
                    callback(delta);
                } catch (error) {
                    console.error('UnifiedGameLoop: Error in visual callback:', error);
                }
            });
            
            this.visualAccumulator -= this.visualTimestep;
        }
        
        // Render with interpolation for ultra-smooth visuals
        const alpha = this.visualAccumulator / this.visualTimestep; // 0-1 interpolation factor
        
        this.renderCallbacks.forEach(callback => {
            try {
                callback(alpha);
            } catch (error) {
                console.error('UnifiedGameLoop: Error in render callback:', error);
            }
        });
        
        // Continue loop
        this.rafId = requestAnimationFrame(() => this.tick());
    }
    
    /**
     * Run periodic checks based on tick counter
     * @private
     */
    runPeriodicChecks() {
        // Tier checks (every 100 ticks = 10 seconds)
        const tierCheck = this.periodicChecks.tierCheck;
        tierCheck.counter++;
        if (tierCheck.counter >= tierCheck.interval && tierCheck.callback) {
            try {
                tierCheck.callback();
            } catch (error) {
                console.error('UnifiedGameLoop: Error in tier check:', error);
            }
            tierCheck.counter = 0;
        }
        
        // Achievement checks (every 20 ticks = 2 seconds)
        const achievementCheck = this.periodicChecks.achievementCheck;
        achievementCheck.counter++;
        if (achievementCheck.counter >= achievementCheck.interval && achievementCheck.callback) {
            try {
                achievementCheck.callback();
            } catch (error) {
                console.error('UnifiedGameLoop: Error in achievement check:', error);
            }
            achievementCheck.counter = 0;
        }
        
        // Event checks (every 10 ticks = 1 second)
        const eventCheck = this.periodicChecks.eventCheck;
        eventCheck.counter++;
        if (eventCheck.counter >= eventCheck.interval && eventCheck.callback) {
            try {
                eventCheck.callback();
            } catch (error) {
                console.error('UnifiedGameLoop: Error in event check:', error);
            }
            eventCheck.counter = 0;
        }
        
        // HUD updates (every 5 ticks = 0.5 seconds)
        const hudUpdate = this.periodicChecks.hudUpdate;
        hudUpdate.counter++;
        if (hudUpdate.counter >= hudUpdate.interval && hudUpdate.callback) {
            try {
                hudUpdate.callback();
            } catch (error) {
                console.error('UnifiedGameLoop: Error in HUD update:', error);
            }
            hudUpdate.counter = 0;
        }
    }
    
    /**
     * Get current performance metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        return {
            isRunning: this.isRunning,
            tickCounter: this.tickCounter,
            visualAccumulator: this.visualAccumulator,
            logicAccumulator: this.logicAccumulator,
            logicCallbacks: this.logicCallbacks.length,
            visualCallbacks: this.visualCallbacks.length,
            renderCallbacks: this.renderCallbacks.length
        };
    }
}

