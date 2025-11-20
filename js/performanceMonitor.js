import { handleError, safeFunction } from './errorHandler.js';
import { analytics } from './analytics.js';

/**
 * Performance Monitor System - Tracks FPS, memory usage, and performance metrics
 * Provides optimization suggestions and debug mode
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} fps - Current frames per second
 * @property {number} averageFps - Average FPS over time
 * @property {number} minFps - Minimum FPS recorded
 * @property {number} maxFps - Maximum FPS recorded
 * @property {number} frameTime - Average frame time in milliseconds
 * @property {number} memoryUsage - Current memory usage in MB
 * @property {number} memoryLimit - Memory limit in MB
 * @property {number} memoryPressure - Memory pressure (0-1)
 * @property {number} jsHeapSize - JavaScript heap size in MB
 * @property {number} jsHeapUsed - JavaScript heap used in MB
 * @property {number} jsHeapLimit - JavaScript heap limit in MB
 */

/**
 * Performance Monitor System class
 */
export class PerformanceMonitorSystem {
    /**
     * Create a new PerformanceMonitorSystem instance
     */
    constructor() {
        this.isMonitoring = false;
        this.isDebugMode = false;
        this.showPerformanceOverlay = false;

        // Performance metrics
        this.metrics = {
            fps: 0,
            averageFps: 0,
            minFps: 60,
            maxFps: 0,
            frameTime: 0,
            memoryUsage: 0,
            memoryLimit: 0,
            memoryPressure: 0,
            jsHeapSize: 0,
            jsHeapUsed: 0,
            jsHeapLimit: 0
        };

        // FPS tracking
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fpsHistory = [];
        this.fpsHistorySize = 60; // Track last 60 frames

        // Memory tracking
        this.memoryHistory = [];
        this.memoryHistorySize = 60; // Track last 60 measurements
        this.lastMemoryCheck = 0;

        // Performance overlay
        this.overlay = null;
        this.overlayUpdateInterval = null;

        // Performance suggestions
        this.suggestions = [];
        this.lastSuggestionUpdate = 0;

        // Debug mode
        this.debugConsole = null;
        this.debugCommands = new Map();

        // Initialize debug commands
        this.initializeDebugCommands();
    }

    /**
     * Initialize performance monitoring
     * @param {boolean} debugMode - Whether to enable debug mode
     */
    initialize(debugMode = false) {
        try {
            this.isDebugMode = debugMode;
            this.isMonitoring = true;

            // Create performance overlay if needed
            if (debugMode) {
                this.createPerformanceOverlay();
            }

            // Start monitoring
            this.startMonitoring();

            // Set up debug console if needed
            if (debugMode) {
                this.createDebugConsole();
            }
        } catch (error) {
            handleError(error, 'performanceMonitorInitialize');
        }
    }

    /**
     * Start performance monitoring
     * @private
     */
    startMonitoring() {
        // Start FPS monitoring
        this.startFPSMonitoring();

        // Start memory monitoring
        this.startMemoryMonitoring();

        // Start performance tracking
        this.startPerformanceTracking();
    }

    /**
     * Start FPS monitoring
     * @private
     */
    startFPSMonitoring() {
        const measureFPS = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            // Calculate FPS
            const fps = 1000 / deltaTime;
            this.metrics.fps = Math.round(fps);

            // Update FPS history
            this.fpsHistory.push(this.metrics.fps);
            if (this.fpsHistory.length > this.fpsHistorySize) {
                this.fpsHistory.shift();
            }

            // Calculate average FPS
            this.metrics.averageFps = Math.round(
                this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length
            );

            // Update min/max FPS
            this.metrics.minFps = Math.min(this.metrics.minFps, this.metrics.fps);
            this.metrics.maxFps = Math.max(this.metrics.maxFps, this.metrics.fps);

            // Calculate frame time
            this.metrics.frameTime = Math.round(deltaTime * 100) / 100;

            // Update debug console if needed
            if (this.isDebugMode && this.debugConsole) {
                this.updateDebugConsole();
            }

            // Track FPS in analytics
            if (this.frameCount % 60 === 0) { // Every second
                analytics.trackPerformance('fps', this.metrics.fps);
            }

            this.frameCount++;

            // Continue monitoring
            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    /**
     * Start memory monitoring
     * @private
     */
    startMemoryMonitoring() {
        const checkMemory = () => {
            const now = Date.now();

            // Throttle memory checks to once per second
            if (now - this.lastMemoryCheck < 1000) {
                return;
            }

            this.lastMemoryCheck = now;

            // Get memory information
            let memoryInfo = {};

            if (performance.memory) {
                memoryInfo = {
                    jsHeapSize: performance.memory.jsHeapSize / 1048576, // Convert to MB
                    jsHeapUsed: performance.memory.usedJSHeapSize / 1048576,
                    jsHeapLimit: performance.memory.jsHeapSizeLimit / 1048576,
                    totalJSHeapSize: performance.memory.totalJSHeapSize / 1048576
                };
            }

            // Get device memory if available
            if (navigator.deviceMemory) {
                memoryInfo.deviceMemory = navigator.deviceMemory;
                memoryInfo.memoryLimit = navigator.deviceMemory * 0.8; // 80% of device memory
            }

            // Calculate memory usage
            if (memoryInfo.jsHeapUsed !== undefined) {
                this.metrics.memoryUsage = memoryInfo.jsHeapUsed;
                this.metrics.jsHeapSize = memoryInfo.jsHeapSize;
                this.metrics.jsHeapUsed = memoryInfo.jsHeapUsed;
                this.metrics.jsHeapLimit = memoryInfo.jsHeapLimit;
            }

            // Calculate memory pressure
            if (memoryInfo.memoryLimit !== undefined && memoryInfo.jsHeapUsed !== undefined) {
                this.metrics.memoryPressure = memoryInfo.jsHeapUsed / memoryInfo.memoryLimit;
            }

            // Update memory history
            this.memoryHistory.push(this.metrics.memoryUsage);
            if (this.memoryHistory.length > this.memoryHistorySize) {
                this.memoryHistory.shift();
            }

            // Update debug console if needed
            if (this.isDebugMode && this.debugConsole) {
                this.updateDebugConsole();
            }

            // Track memory in analytics
            analytics.trackPerformance('memory_usage', this.metrics.memoryUsage);

            // Check for performance issues
            this.checkPerformanceIssues();
        };

        // Check memory immediately
        checkMemory();

        // Set up periodic memory checks
        setInterval(checkMemory, 1000);
    }

    /**
     * Start performance tracking
     * @private
     */
    startPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            if (performance.timing) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                analytics.trackPerformance('page_load_time', loadTime);
            }
        });

        // Track long tasks
        this.trackLongTasks();

        // Track render performance
        this.trackRenderPerformance();
    }

    /**
     * Track long tasks that might block the main thread
     * @private
     */
    trackLongTasks() {
        // Override setTimeout to track long tasks
        const originalSetTimeout = window.setTimeout;

        window.setTimeout = (callback, delay) => {
            const startTime = performance.now();

            const wrappedCallback = () => {
                const endTime = performance.now();
                const executionTime = endTime - startTime;

                // Track tasks that take longer than 50ms
                if (executionTime > 50) {
                    analytics.trackPerformance('long_task', executionTime);

                    if (this.isDebugMode) {
                        console.warn(`Long task detected: ${executionTime.toFixed(2)}ms`);
                    }
                }

                callback();
            };

            return originalSetTimeout(wrappedCallback, delay);
        };

        // Override setInterval to track long intervals
        const originalSetInterval = window.setInterval;

        window.setInterval = (callback, interval) => {
            const startTime = performance.now();

            const wrappedCallback = () => {
                const endTime = performance.now();
                const executionTime = endTime - startTime;

                // Track intervals that take longer than 50ms
                if (executionTime > 50) {
                    analytics.trackPerformance('long_interval', executionTime);

                    if (this.isDebugMode) {
                        console.warn(`Long interval detected: ${executionTime.toFixed(2)}ms`);
                    }
                }

                callback();
            };

            return originalSetInterval(wrappedCallback, interval);
        };
    }

    /**
     * Track render performance
     * @private
     */
    trackRenderPerformance() {
        // Observe layout shifts
        let layoutShiftCount = 0;

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'layout-shift') {
                    layoutShiftCount++;

                    if (this.isDebugMode) {
                        console.warn(`Layout shift detected: ${entry.value}`);
                    }

                    analytics.trackPerformance('layout_shift', entry.value);
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            // PerformanceObserver might not be supported
            console.warn('PerformanceObserver not supported');
        }

        // Track layout shifts in debug mode
        if (this.isDebugMode) {
            setInterval(() => {
                if (layoutShiftCount > 0) {
                    console.log(`Layout shifts in last 10 seconds: ${layoutShiftCount}`);
                    layoutShiftCount = 0;
                }
            }, 10000);
        }
    }

    /**
     * Check for performance issues and generate suggestions
     * @private
     */
    checkPerformanceIssues() {
        const now = Date.now();

        // Only update suggestions every 30 seconds
        if (now - this.lastSuggestionUpdate < 30000) {
            return;
        }

        this.lastSuggestionUpdate = now;
        this.suggestions = [];

        // Check FPS issues
        if (this.metrics.averageFps < 30) {
            this.suggestions.push({
                type: 'fps',
                severity: 'high',
                message: 'Low FPS detected',
                details: `Average FPS: ${this.metrics.averageFps}`,
                solutions: [
                    'Reduce particle effects',
                    'Lower graphics quality',
                    'Close unused browser tabs'
                ]
            });
        } else if (this.metrics.averageFps < 45) {
            this.suggestions.push({
                type: 'fps',
                severity: 'medium',
                message: 'Suboptimal FPS detected',
                details: `Average FPS: ${this.metrics.averageFps}`,
                solutions: [
                    'Reduce visual effects',
                    'Enable hardware acceleration'
                ]
            });
        }

        // Check memory issues
        if (this.metrics.memoryPressure > 0.8) {
            this.suggestions.push({
                type: 'memory',
                severity: 'high',
                message: 'High memory usage detected',
                details: `Memory usage: ${(this.metrics.memoryPressure * 100).toFixed(1)}%`,
                solutions: [
                    'Restart browser',
                    'Close unused tabs',
                    'Reduce particle effects'
                ]
            });
        } else if (this.metrics.memoryPressure > 0.6) {
            this.suggestions.push({
                type: 'memory',
                severity: 'medium',
                message: 'Moderate memory usage detected',
                details: `Memory usage: ${(this.metrics.memoryPressure * 100).toFixed(1)}%`,
                solutions: [
                    'Reduce visual effects',
                    'Refresh page'
                ]
            });
        }

        // Check for long tasks
        // This would be tracked in analytics

        // Update debug console if needed
        if (this.isDebugMode && this.debugConsole) {
            this.updateDebugConsole();
        }
    }

    /**
     * Create performance overlay
     * @private
     */
    createPerformanceOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'performance-overlay';
        // Styles moved to CSS

        document.body.appendChild(this.overlay);

        // Start overlay updates
        this.overlayUpdateInterval = setInterval(() => {
            this.updatePerformanceOverlay();
        }, 500);
    }

    /**
     * Update performance overlay
     * @private
     */
    updatePerformanceOverlay() {
        if (!this.overlay) {
            return;
        }

        this.overlay.innerHTML = `
            <div class="perf-header">PERFORMANCE MONITOR</div>
            <div>FPS: ${this.metrics.fps} (avg: ${this.metrics.averageFps})</div>
            <div>Frame Time: ${this.metrics.frameTime}ms</div>
            <div>Memory: ${this.metrics.memoryUsage.toFixed(1)}MB</div>
            <div>Memory Pressure: ${(this.metrics.memoryPressure * 100).toFixed(1)}%</div>
            <div class="perf-suggestions">
                <div class="perf-suggestions-header">SUGGESTIONS</div>
                ${this.suggestions.map(suggestion => `
                    <div class="perf-suggestion-item">
                        <div class="${suggestion.severity === 'high' ? 'suggestion-high' : (suggestion.severity === 'medium' ? 'suggestion-medium' : 'suggestion-low')}">
                            [${suggestion.severity.toUpperCase()}] ${suggestion.message}
                        </div>
                        <div class="perf-suggestion-details">
                            ${suggestion.details}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Create debug console
     * @private
     */
    createDebugConsole() {
        this.debugConsole = document.createElement('div');
        this.debugConsole.className = 'debug-console';
        // Styles moved to CSS

        // Create console header
        const header = document.createElement('div');
        header.className = 'debug-console-header';
        // Styles moved to CSS

        header.innerHTML = `
            <div class="debug-console-title">DEBUG CONSOLE</div>
            <button id="debug-console-clear" class="debug-console-clear-btn">Clear</button>
        `;

        // Create console output
        const output = document.createElement('div');
        output.id = 'debug-console-output';
        output.className = 'debug-console-output';
        // Styles moved to CSS

        // Create console input
        const inputContainer = document.createElement('div');
        inputContainer.className = 'debug-console-input-container';
        // Styles moved to CSS

        const input = document.createElement('input');
        input.id = 'debug-console-input';
        input.type = 'text';
        input.placeholder = 'Enter debug command...';
        input.className = 'debug-console-input';
        // Styles moved to CSS

        inputContainer.appendChild(input);

        // Assemble console
        this.debugConsole.appendChild(header);
        this.debugConsole.appendChild(output);
        this.debugConsole.appendChild(inputContainer);

        document.body.appendChild(this.debugConsole);

        // Set up console event listeners
        document.getElementById('debug-console-clear').addEventListener('click', () => {
            const output = document.getElementById('debug-console-output');
            output.textContent = '';
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const command = input.value.trim();
                input.value = '';

                if (command) {
                    this.executeDebugCommand(command);
                }
            }
        });
    }

    // ... (skip unchanged methods)

    /**
     * Log message to debug console
     * @param {string} message - Message to log
     * @param {string} type - Message type ('command', 'info', 'error', 'warning')
     * @private
     */
    logToDebugConsole(message, type = 'info') {
        const output = document.getElementById('debug-console-output');
        if (!output) {
            return;
        }

        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'debug-log-entry';

        // Set color class based on type
        switch (type) {
            case 'command':
                entry.classList.add('debug-log-command');
                break;
            case 'error':
                entry.classList.add('debug-log-error');
                break;
            case 'warning':
                entry.classList.add('debug-log-warning');
                break;
            default:
                entry.classList.add('debug-log-info');
        }

        // Styles moved to CSS

        entry.innerHTML = `<span class="debug-timestamp">[${timestamp}]</span> ${message}`;

        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    }

    /**
     * Show debug help
     * @private
     */
    showDebugHelp() {
        this.logToDebugConsole('Available debug commands:', 'info');

        for (const [cmd, info] of this.debugCommands) {
            this.logToDebugConsole(`  ${cmd}: ${info.description}`, 'info');
        }

        this.logToDebugConsole('Type command with arguments, e.g., "add_ab 1000"', 'info');
    }

    /**
     * Show FPS information
     * @private
     */
    showFPSInfo() {
        this.logToDebugConsole(`Current FPS: ${this.metrics.fps}`, 'info');
        this.logToDebugConsole(`Average FPS: ${this.metrics.averageFps}`, 'info');
        this.logToDebugConsole(`Min FPS: ${this.metrics.minFps}`, 'info');
        this.logToDebugConsole(`Max FPS: ${this.metrics.maxFps}`, 'info');
        this.logToDebugConsole(`Frame Time: ${this.metrics.frameTime}ms`, 'info');
    }

    /**
     * Show memory information
     * @private
     */
    showMemoryInfo() {
        this.logToDebugConsole(`Memory Usage: ${this.metrics.memoryUsage.toFixed(2)}MB`, 'info');
        this.logToDebugConsole(`Memory Pressure: ${(this.metrics.memoryPressure * 100).toFixed(1)}%`, 'info');

        if (this.metrics.jsHeapUsed !== undefined) {
            this.logToDebugConsole(`JS Heap Used: ${this.metrics.jsHeapUsed.toFixed(2)}MB`, 'info');
            this.logToDebugConsole(`JS Heap Size: ${this.metrics.jsHeapSize.toFixed(2)}MB`, 'info');
            this.logToDebugConsole(`JS Heap Limit: ${this.metrics.jsHeapLimit.toFixed(2)}MB`, 'info');
        }

        if (navigator.deviceMemory) {
            this.logToDebugConsole(`Device Memory: ${navigator.deviceMemory}GB`, 'info');
        }
    }

    /**
     * Show all performance metrics
     * @private
     */
    showAllMetrics() {
        this.showFPSInfo();
        this.showMemoryInfo();

        this.logToDebugConsole(`Active Suggestions: ${this.suggestions.length}`, 'info');
        for (const suggestion of this.suggestions) {
            this.logToDebugConsole(`  [${suggestion.severity}] ${suggestion.message}`, 'warning');
        }
    }

    /**
     * Debug add AB command
     * @param {Array} args - Command arguments
     * @private
     */
    debugAddAB(args) {
        const amount = parseFloat(args[0]) || 0;

        if (isNaN(amount) || amount <= 0) {
            this.logToDebugConsole('Invalid amount. Usage: add_ab 1000', 'error');
            return;
        }

        // This would need access to the game state
        // For now, we'll just log it
        this.logToDebugConsole(`Added ${amount} AB to player (debug command)`, 'info');
    }

    /**
     * Debug set level command
     * @param {Array} args - Command arguments
     * @private
     */
    debugSetLevel(args) {
        const level = parseInt(args[0]) || 0;

        if (isNaN(level) || level < 0) {
            this.logToDebugConsole('Invalid level. Usage: set_level 10', 'error');
            return;
        }

        // This would need access to the game state
        // For now, we'll just log it
        this.logToDebugConsole(`Set player level to ${level} (debug command)`, 'info');
    }

    /**
     * Debug clear save command
     * @private
     */
    debugClearSave() {
        // This would need access to the game state
        // For now, we'll just log it
        this.logToDebugConsole('Cleared save data (debug command)', 'info');
    }

    /**
     * Debug export save command
     * @private
     */
    debugExportSave() {
        // This would need access to the game state
        // For now, we'll just log it
        this.logToDebugConsole('Exported save data (debug command)', 'info');
    }

    /**
     * Debug toggle particles command
     * @private
     */
    debugToggleParticles() {
        // This would need access to the particle system
        // For now, we'll just log it
        this.logToDebugConsole('Toggled particle effects (debug command)', 'info');
    }

    /**
     * Debug toggle performance command
     * @private
     */
    debugTogglePerformance() {
        this.showPerformanceOverlay = !this.showPerformanceOverlay;

        if (this.showPerformanceOverlay) {
            this.createPerformanceOverlay();
        } else if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }

        this.logToDebugConsole(`Performance overlay: ${this.showPerformanceOverlay ? 'enabled' : 'disabled'}`, 'info');
    }

    /**
     * Update debug console with current metrics
     * @private
     */
    updateDebugConsole() {
        if (!this.isDebugMode || !this.debugConsole) {
            return;
        }

        // Update console title with current FPS
        const header = this.debugConsole.querySelector('div');
        if (header) {
            header.innerHTML = `
                <div class="debug-console-title">DEBUG CONSOLE (FPS: ${this.metrics.fps})</div>
                <button id="debug-console-clear" class="debug-console-clear-btn">Clear</button>
            `;
        }
    }

    /**
     * Get current performance metrics
     * @returns {PerformanceMetrics} Current performance metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Get performance suggestions
     * @returns {Array} Array of performance suggestions
     */
    getSuggestions() {
        return [...this.suggestions];
    }

    /**
     * Toggle performance overlay visibility
     * @param {boolean} show - Whether to show overlay
     */
    togglePerformanceOverlay(show) {
        this.showPerformanceOverlay = show;

        if (show && !this.overlay) {
            this.createPerformanceOverlay();
        } else if (!show && this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }
    }

    /**
     * Stop performance monitoring
     */
    stop() {
        this.isMonitoring = false;

        // Clear overlay update interval
        if (this.overlayUpdateInterval) {
            clearInterval(this.overlayUpdateInterval);
            this.overlayUpdateInterval = null;
        }

        // Remove overlay
        if (this.overlay) {
            document.body.removeChild(this.overlay);
            this.overlay = null;
        }

        // Remove debug console
        if (this.debugConsole) {
            document.body.removeChild(this.debugConsole);
            this.debugConsole = null;
        }
    }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitorSystem();