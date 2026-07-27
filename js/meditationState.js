import { MEDITATION_TOWERS, MEDITATION_DISTRACTIONS, MEDITATION_UPGRADES } from './modules/data/meditation.js';
import { mirrorToIndexedDB, idbDelete } from './save/indexedDBBackup.js';
import { handleError, notifyPlayer } from './errorHandler.js';

/**
 * Meditation State Manager - Manages meditation tower defense mode
 * Separate game mode with tower defense gameplay
 */
export class MeditationState {
    constructor(gameState, options = {}) {
        // Reference to main game state for accessing inventory
        this.gameState = gameState;

        // Injectable clock + RNG. Production uses Date.now / Math.random; tests
        // pass deterministic stubs so the whole tower-defense simulation can be
        // stepped reproducibly and asserted on (it has no canvas/DOM deps).
        this._now = options.now || (() => Date.now());
        this._random = options.random || (() => Math.random());

        // Sim-tracked wave timer (replaces real setTimeout chaining so wave
        // progression is deterministic and testable). 0 = no wave scheduled.
        this.nextWaveStartTime = 0;

        // Meditation resources
        this.focus = 0.0;
        this.focusTotalEarned = 0.0;
        this.focusPassiveRate = 0.1; // Passive focus per second

        // Tranquility (health)
        this.tranquility = 100.0;
        this.tranquilityMax = 100.0;

        // Grid system (20x20 grid)
        this.gridSize = 20;
        this.grid = []; // Array of {x, y, tower: null or tower object, isPath: false}
        this.towers = []; // Array of placed towers
        this.path = []; // Array of path tiles {x, y, nextX, nextY} for pathfinding
        this.pathTiles = new Set(); // Set of path tile coordinates as strings "x,y"
        this.pathDistances = new Map(); // Map of path tile distances from center: "x,y" -> distance

        // Wave system
        this.currentWave = 0;
        this.waveActive = false;
        this.distractions = []; // Active distractions on the grid
        this.nextSpawnTime = 0;
        this.waveStartTime = 0;
        this.waveEndTime = 0; // When the wave should end (duration-based)
        this.waveMaxDuration = 30000; // Base 30 seconds per wave (increases with wave number)
        this.waveDistractionsSpawned = 0; // Track total distractions spawned this wave
        this.waveMaxDistractions = 10; // Max distractions per wave (increases with wave number)

        // Active session
        this.activeSession = false;
        this.sessionStartTime = 0;

        // Meditation inventory (exclusive ingredients)
        this.meditationInventory = {};

        // Meditation upgrades
        this.meditationUpgrades = {};

        // Meditation statistics (for production bonus)
        this.totalWavesCompleted = 0;
        this.totalDistractionsKilled = 0;
        this.totalSessionsCompleted = 0;

        // Tick timer
        this.tickInterval = null;
        this.lastTickTime = this._now();

        // Callbacks
        this.onFocusChanged = null;
        this.onTranquilityChanged = null;
        this.onWaveChanged = null;
        this.onTowerPlaced = null;
        this.onDistractionKilled = null;

        // Initialize grid
        this.initializeGrid();
        this.initializePath();

        this.dailyRituals = null;
    }

    /**
     * Set daily rituals system
     * @param {Object} dailyRituals - Daily rituals system
     */
    setDailyRituals(dailyRituals) {
        this.dailyRituals = dailyRituals;
    }

    /**
     * Initialize the meditation grid
     */
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.grid.push({
                    x: x,
                    y: y,
                    tower: null,
                    isPath: false
                });
            }
        }
    }

    /**
     * Initialize maze-like path from edges to center
     * Creates a more complex, winding maze with multiple routes and strategic chokepoints
     */
    initializePath() {
        this.path = [];
        this.pathTiles = new Set();

        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);
        const quarter = Math.floor(this.gridSize / 4);
        const threeQuarter = Math.floor(this.gridSize * 3 / 4);

        // Create a more complex maze with winding paths and multiple routes

        // === NORTH ENTRY POINTS ===
        // Top-left entry (winding path)
        this.addPathSegment(0, 0, 2, 0);
        this.addPathSegment(2, 0, 2, 3);
        this.addPathSegment(2, 3, 5, 3);
        this.addPathSegment(5, 3, 5, 5);
        this.addPathSegment(5, 5, centerX - 2, 5);
        this.addPathSegment(centerX - 2, 5, centerX - 2, centerY - 2);
        this.addPathSegment(centerX - 2, centerY - 2, centerX, centerY - 2);
        this.addPathSegment(centerX, centerY - 2, centerX, centerY);

        // Top-center entry (direct path with a turn)
        this.addPathSegment(centerX, 0, centerX, 2);
        this.addPathSegment(centerX, 2, centerX + 2, 2);
        this.addPathSegment(centerX + 2, 2, centerX + 2, centerY - 1);
        this.addPathSegment(centerX + 2, centerY - 1, centerX, centerY);

        // Top-right entry (zigzag path)
        this.addPathSegment(this.gridSize - 1, 0, this.gridSize - 2, 0);
        this.addPathSegment(this.gridSize - 2, 0, this.gridSize - 2, 4);
        this.addPathSegment(this.gridSize - 2, 4, this.gridSize - 5, 4);
        this.addPathSegment(this.gridSize - 5, 4, this.gridSize - 5, 6);
        this.addPathSegment(this.gridSize - 5, 6, centerX + 2, 6);
        this.addPathSegment(centerX + 2, 6, centerX + 2, centerY + 1);
        this.addPathSegment(centerX + 2, centerY + 1, centerX, centerY);

        // === EAST ENTRY POINTS ===
        // Right-center entry (spiral-like)
        this.addPathSegment(this.gridSize - 1, centerY, this.gridSize - 3, centerY);
        this.addPathSegment(this.gridSize - 3, centerY, this.gridSize - 3, centerY - 3);
        this.addPathSegment(this.gridSize - 3, centerY - 3, centerX + 1, centerY - 3);
        this.addPathSegment(centerX + 1, centerY - 3, centerX + 1, centerY);

        // Right-top entry
        this.addPathSegment(this.gridSize - 1, quarter, this.gridSize - 4, quarter);
        this.addPathSegment(this.gridSize - 4, quarter, this.gridSize - 4, centerY - 2);
        this.addPathSegment(this.gridSize - 4, centerY - 2, centerX, centerY - 2);
        this.addPathSegment(centerX, centerY - 2, centerX, centerY);

        // Right-bottom entry
        this.addPathSegment(this.gridSize - 1, threeQuarter, this.gridSize - 5, threeQuarter);
        this.addPathSegment(this.gridSize - 5, threeQuarter, this.gridSize - 5, centerY + 2);
        this.addPathSegment(this.gridSize - 5, centerY + 2, centerX, centerY + 2);
        this.addPathSegment(centerX, centerY + 2, centerX, centerY);

        // === SOUTH ENTRY POINTS ===
        // Bottom-left entry (long winding path)
        this.addPathSegment(0, this.gridSize - 1, 3, this.gridSize - 1);
        this.addPathSegment(3, this.gridSize - 1, 3, this.gridSize - 4);
        this.addPathSegment(3, this.gridSize - 4, 7, this.gridSize - 4);
        this.addPathSegment(7, this.gridSize - 4, 7, this.gridSize - 7);
        this.addPathSegment(7, this.gridSize - 7, centerX - 2, this.gridSize - 7);
        this.addPathSegment(centerX - 2, this.gridSize - 7, centerX - 2, centerY + 2);
        this.addPathSegment(centerX - 2, centerY + 2, centerX, centerY + 2);
        this.addPathSegment(centerX, centerY + 2, centerX, centerY);

        // Bottom-center entry
        this.addPathSegment(centerX, this.gridSize - 1, centerX, this.gridSize - 3);
        this.addPathSegment(centerX, this.gridSize - 3, centerX - 3, this.gridSize - 3);
        this.addPathSegment(centerX - 3, this.gridSize - 3, centerX - 3, centerY + 1);
        this.addPathSegment(centerX - 3, centerY + 1, centerX, centerY);

        // Bottom-right entry
        this.addPathSegment(this.gridSize - 1, this.gridSize - 1, this.gridSize - 4, this.gridSize - 1);
        this.addPathSegment(this.gridSize - 4, this.gridSize - 1, this.gridSize - 4, this.gridSize - 5);
        this.addPathSegment(this.gridSize - 4, this.gridSize - 5, centerX + 2, this.gridSize - 5);
        this.addPathSegment(centerX + 2, this.gridSize - 5, centerX + 2, centerY + 2);
        this.addPathSegment(centerX + 2, centerY + 2, centerX, centerY);

        // === WEST ENTRY POINTS ===
        // Left-center entry
        this.addPathSegment(0, centerY, 2, centerY);
        this.addPathSegment(2, centerY, 2, centerY + 3);
        this.addPathSegment(2, centerY + 3, centerX - 1, centerY + 3);
        this.addPathSegment(centerX - 1, centerY + 3, centerX - 1, centerY);
        this.addPathSegment(centerX - 1, centerY, centerX, centerY);

        // Left-top entry
        this.addPathSegment(0, quarter, 3, quarter);
        this.addPathSegment(3, quarter, 3, centerY - 2);
        this.addPathSegment(3, centerY - 2, centerX, centerY - 2);
        this.addPathSegment(centerX, centerY - 2, centerX, centerY);

        // Left-bottom entry
        this.addPathSegment(0, threeQuarter, 4, threeQuarter);
        this.addPathSegment(4, threeQuarter, 4, centerY + 2);
        this.addPathSegment(4, centerY + 2, centerX, centerY + 2);
        this.addPathSegment(centerX, centerY + 2, centerX, centerY);

        // === INTERNAL CONNECTING PATHS (create loops and alternative routes) ===
        // Horizontal connector near top
        this.addPathSegment(quarter, 5, centerX - 1, 5);
        this.addPathSegment(centerX - 1, 5, centerX + 1, 5);
        this.addPathSegment(centerX + 1, 5, threeQuarter, 5);

        // Horizontal connector in middle-top
        this.addPathSegment(quarter, 8, centerX, 8);
        this.addPathSegment(centerX, 8, threeQuarter, 8);

        // Horizontal connector in middle-bottom
        this.addPathSegment(quarter, 12, centerX, 12);
        this.addPathSegment(centerX, 12, threeQuarter, 12);

        // Vertical connector on left side
        this.addPathSegment(6, quarter, 6, centerY - 1);
        this.addPathSegment(6, centerY - 1, 6, centerY + 1);
        this.addPathSegment(6, centerY + 1, 6, threeQuarter);

        // Vertical connector on right side
        this.addPathSegment(this.gridSize - 7, quarter, this.gridSize - 7, centerY);
        this.addPathSegment(this.gridSize - 7, centerY, this.gridSize - 7, threeQuarter);

        // Diagonal connector (creates interesting routing)
        this.addPathSegment(8, 7, 9, 8);
        this.addPathSegment(9, 8, 10, 9);
        this.addPathSegment(10, 9, centerX + 1, centerY - 1);

        // Create a small loop near center (strategic chokepoint)
        this.addPathSegment(centerX - 2, centerY - 1, centerX - 1, centerY - 1);
        this.addPathSegment(centerX - 1, centerY - 1, centerX - 1, centerY + 1);
        this.addPathSegment(centerX - 1, centerY + 1, centerX - 2, centerY + 1);
        this.addPathSegment(centerX - 2, centerY + 1, centerX - 2, centerY - 1);

        // Mark path tiles in grid
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const gridIndex = y * this.gridSize + x;
                if (this.pathTiles.has(`${x},${y}`)) {
                    this.grid[gridIndex].isPath = true;
                }
            }
        }

        // Calculate distances from center using BFS
        this.calculatePathDistances();

        // Optimize path for smoother movement (remove redundant waypoints)
        this.optimizePath();
    }

    /**
     * Calculate distance from center for each path tile using BFS
     */
    calculatePathDistances() {
        this.pathDistances.clear();

        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);
        const centerKey = `${centerX},${centerY}`;

        // Initialize: center has distance 0
        if (this.pathTiles.has(centerKey)) {
            this.pathDistances.set(centerKey, 0);
        }

        // BFS queue: [x, y, distance]
        const queue = [[centerX, centerY, 0]];
        const visited = new Set([centerKey]);

        // Directions: up, down, left, right, and diagonals
        const directions = [
            [0, -1], [0, 1], [-1, 0], [1, 0],  // cardinal
            [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
        ];

        while (queue.length > 0) {
            const [x, y, dist] = queue.shift();

            // Check all adjacent tiles
            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                const neighborKey = `${nx},${ny}`;

                // Skip if out of bounds or not a path tile
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;
                if (!this.pathTiles.has(neighborKey)) continue;
                if (visited.has(neighborKey)) continue;

                // Calculate distance (Manhattan distance for cardinal, slightly more for diagonal)
                const distance = dist + (Math.abs(dx) + Math.abs(dy) === 2 ? 1.5 : 1);

                // Add to visited and queue
                visited.add(neighborKey);
                this.pathDistances.set(neighborKey, distance);
                queue.push([nx, ny, distance]);
            }
        }

        console.info(`Calculated distances for ${this.pathDistances.size} path tiles`);
    }

    /**
     * Optimize path for smoother movement by removing redundant waypoints
     * This creates a cleaner path that's easier to follow
     */
    optimizePath() {
        // Create a simplified path by removing redundant intermediate points
        // This helps distractions move more smoothly along the path
        const optimizedPath = [];
        const visited = new Set();

        // Group path segments by direction to find straight segments
        for (const segment of this.path) {
            const key = `${segment.x},${segment.y}`;
            if (!visited.has(key)) {
                visited.add(key);
                optimizedPath.push(segment);
            }
        }

        // Update path with optimized version (keep original for reference)
        this.path = optimizedPath;
        console.info(`Path optimized: ${this.path.length} segments`);
    }

    /**
     * Add a path segment from start to end
     */
    addPathSegment(startX, startY, endX, endY) {
        const dx = endX > startX ? 1 : (endX < startX ? -1 : 0);
        const dy = endY > startY ? 1 : (endY < startY ? -1 : 0);

        let x = startX;
        let y = startY;

        while (x !== endX || y !== endY) {
            this.pathTiles.add(`${x},${y}`);

            // Add to path array with next direction
            const nextX = x + dx;
            const nextY = y + dy;
            this.path.push({ x, y, nextX, nextY });

            if (x !== endX) x += dx;
            if (y !== endY) y += dy;
        }

        // Add final tile
        this.pathTiles.add(`${endX},${endY}`);
        this.path.push({ x: endX, y: endY, nextX: endX, nextY: endY });
    }

    /**
     * Get path direction from a position using distance-based pathfinding
     * Only allows cardinal directions (no diagonals) to ensure following the path
     */
    getPathDirection(x, y) {
        // Round to nearest grid position
        const gridX = Math.round(x);
        const gridY = Math.round(y);

        // Clamp to grid bounds
        const clampedX = Math.max(0, Math.min(this.gridSize - 1, gridX));
        const clampedY = Math.max(0, Math.min(this.gridSize - 1, gridY));

        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);

        // Check if at center
        if (clampedX === centerX && clampedY === centerY) {
            return { nextX: centerX, nextY: centerY };
        }

        // Find current position's nearest path tile
        let currentTile = null;
        let currentTileKey = `${clampedX},${clampedY}`;

        if (this.pathTiles.has(currentTileKey)) {
            currentTile = { x: clampedX, y: clampedY };
        } else {
            // Not on path, find nearest path tile
            let nearestDist = Infinity;
            for (const tileStr of this.pathTiles) {
                const [tx, ty] = tileStr.split(',').map(Number);
                const dist = Math.abs(tx - clampedX) + Math.abs(ty - clampedY);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    currentTile = { x: tx, y: ty };
                    currentTileKey = tileStr;
                }
            }

            // If no path tile found, return center
            if (!currentTile) {
                return { nextX: centerX, nextY: centerY };
            }
        }

        // Get current tile's distance (if not found, it's very far)
        const currentDistance = this.pathDistances.get(currentTileKey) ?? Infinity;

        // Find all adjacent path tiles - ONLY CARDINAL DIRECTIONS (no diagonals)
        // This ensures distractions follow the path exactly, not cutting corners
        const adjacentTiles = [];
        const directions = [
            [0, -1], [0, 1], [-1, 0], [1, 0]  // cardinal only - no diagonals
        ];

        for (const [dx, dy] of directions) {
            const nx = currentTile.x + dx;
            const ny = currentTile.y + dy;
            const neighborKey = `${nx},${ny}`;

            // Skip if out of bounds
            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;

            // Check if it's a path tile
            if (this.pathTiles.has(neighborKey)) {
                const neighborDistance = this.pathDistances.get(neighborKey) ?? Infinity;

                // Only consider tiles that are closer to center (or same distance if at center)
                if (neighborDistance < currentDistance || (neighborDistance === 0 && currentDistance === 0)) {
                    adjacentTiles.push({
                        x: nx,
                        y: ny,
                        distance: neighborDistance
                    });
                }
            }
        }

        // If no valid adjacent tiles, try to find any path tile closer to center
        if (adjacentTiles.length === 0) {
            // Fallback: find any path tile that's closer to center
            let fallbackTile = null;
            let fallbackDist = Infinity;

            for (const tileStr of this.pathTiles) {
                const [tx, ty] = tileStr.split(',').map(Number);
                const tileDist = this.pathDistances.get(tileStr) ?? Infinity;

                // Check if this tile is closer to center than current
                if (tileDist < currentDistance && tileDist < fallbackDist) {
                    // Check if it's reachable (within reasonable distance)
                    const reachDist = Math.abs(tx - currentTile.x) + Math.abs(ty - currentTile.y);
                    if (reachDist <= 2) { // Allow up to 2 tiles away
                        fallbackTile = { x: tx, y: ty };
                        fallbackDist = tileDist;
                    }
                }
            }

            if (fallbackTile) {
                return { nextX: fallbackTile.x, nextY: fallbackTile.y };
            }

            // Last resort: move toward center directly
            const centerDx = centerX - currentTile.x;
            const centerDy = centerY - currentTile.y;
            const centerDist = Math.sqrt(centerDx * centerDx + centerDy * centerDy);

            if (centerDist > 0.001) {
                // Move one step toward center
                const stepX = centerDx > 0 ? 1 : centerDx < 0 ? -1 : 0;
                const stepY = centerDy > 0 ? 1 : centerDy < 0 ? -1 : 0;
                const nextX = Math.max(0, Math.min(this.gridSize - 1, currentTile.x + stepX));
                const nextY = Math.max(0, Math.min(this.gridSize - 1, currentTile.y + stepY));
                return { nextX, nextY };
            }

            // Stay put as last resort
            return { nextX: currentTile.x, nextY: currentTile.y };
        }

        // Choose the adjacent tile with the lowest distance (closest to center)
        // If multiple tiles have the same distance, prefer the one that's more directly toward center
        const bestTile = adjacentTiles.reduce((best, tile) => {
            if (tile.distance < best.distance) {
                return tile;
            } else if (tile.distance === best.distance) {
                // If same distance, prefer the one that's more directly toward center
                const bestDx = best.x - centerX;
                const bestDy = best.y - centerY;
                const tileDx = tile.x - centerX;
                const tileDy = tile.y - centerY;
                const bestDistToCenter = Math.sqrt(bestDx * bestDx + bestDy * bestDy);
                const tileDistToCenter = Math.sqrt(tileDx * tileDx + tileDy * tileDy);

                // Prefer the tile that's closer to center
                return tileDistToCenter < bestDistToCenter ? tile : best;
            }
            return best;
        });

        return { nextX: bestTile.x, nextY: bestTile.y };
    }

    /**
     * Start meditation session
     */
    startSession() {
        if (this.activeSession) return;

        this.activeSession = true;
        this.sessionStartTime = this._now();
        this.waveActive = false;
        this.currentWave = 0;
        this.tranquility = this.tranquilityMax;
        this.distractions = [];

        // Enable sound effects if at Tier 2+ (required for meditation sound effects)
        if (window.audioSystem) {
            const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            console.info('Meditation session starting - Current tier:', currentTier);
            console.info('Music enabled:', window.audioSystem.musicEnabled);
            console.info('Sound effects enabled:', window.audioSystem.soundEffectsEnabled);
            console.info('Audio context state:', window.audioSystem.audioContext ? window.audioSystem.audioContext.state : 'no context');
            console.info('Is muted:', window.audioSystem.isMuted);

            // Enable sound effects if at Tier 2+ (required for meditation sound effects)
            if (currentTier >= 2) {
                console.info('Enabling sound effects for meditation...');
                // Always call enableSoundEffects to ensure initialization, even if already enabled
                window.audioSystem.enableSoundEffects().then(() => {
                    console.info('Sound effects enabled and initialized for meditation');
                    console.info('Tone.js synths initialized:', window.audioSystem.toneSynths ? window.audioSystem.toneSynths.size : 0);
                    console.info('SFX Master gain:', window.audioSystem.toneSfxMaster ? window.audioSystem.toneSfxMaster.gain.value : 'not initialized');
                    console.info('SFX Reverb:', window.audioSystem.toneSfxReverb ? 'initialized' : 'not initialized');
                }).catch(err => {
                    console.error('Failed to enable sound effects for meditation:', err);
                });
            }

            // Start music if music is enabled and at Tier 4+ (uses normal tier 4 music)
            // Update music for meditation mode (mute sparkle/typing, slow tempo, add tier 2 layer)
            if (currentTier >= 4) {
                // If music is not enabled, try to enable it
                if (!window.audioSystem.musicEnabled) {
                    console.info('Music not enabled, attempting to enable...');
                    window.audioSystem.enableMusic().then(() => {
                        console.info('Music enabled successfully');
                        // Wait for startMusic() to complete before updating for meditation mode
                        window.audioSystem.startMusic().then(() => {
                            // Update music for meditation mode after music is fully initialized
                            if (window.audioSystem.updateMusicForMeditation) {
                                window.audioSystem.updateMusicForMeditation();
                            }
                        }).catch(err => {
                            console.error('Failed to start music:', err);
                        });
                    }).catch(err => {
                        console.error('Failed to enable music:', err);
                    });
                } else {
                    // Music is already enabled, just start it (if not already playing)
                    if (window.audioSystem.musicNodes.length === 0) {
                        console.info('Music already enabled, starting music...');
                        // Wait for startMusic() to complete before updating for meditation mode
                        window.audioSystem.startMusic().then(() => {
                            // Update music for meditation mode after music is fully initialized
                            if (window.audioSystem.updateMusicForMeditation) {
                                window.audioSystem.updateMusicForMeditation();
                            }
                        }).catch(err => {
                            console.error('Failed to start music:', err);
                        });
                    } else {
                        // Music is already playing, just update it for meditation mode
                        if (window.audioSystem.updateMusicForMeditation) {
                            window.audioSystem.updateMusicForMeditation();
                        }
                    }
                }
            } else {
                console.info('Tier too low for music. Current tier:', currentTier, '(need 4+)');
            }
        } else {
            console.warn('Audio system not available');
        }

        // Schedule the first wave (sim-tracked timer; checked in tick()).
        this.nextWaveStartTime = this._now() + 2000;
    }

    /**
     * End meditation session
     * @param {boolean} tranquilityLost - Whether the session ended due to losing all tranquility
     */
    endSession(tranquilityLost = false) {
        if (!this.activeSession) return;

        this.activeSession = false;
        this.waveActive = false;
        this.distractions = [];

        // Capture production mult before rewards mutate meditation bonus
        let multBefore = null;
        try {
            if (window.gameState && typeof window.gameState.getProductionMultiplier === 'function') {
                // Prefer a real workstation if owned; else synthetic id still runs formula
                const wsIds = Object.keys(window.gameState.workstations || {}).filter(
                    (id) => (window.gameState.workstations[id] || 0) > 0
                );
                const sampleId = wsIds[0] || 'ws_fire_forge';
                multBefore = window.gameState.getProductionMultiplier(sampleId);
            }
        } catch { /* optional */ }

        // Show notification if tranquility was lost
        if (tranquilityLost && window.showNotification) {
            window.showNotification('Meditation ended - All tranquility lost!', 'error');
        }

        // Update music back to normal mode (restore sparkle/typing, normal tempo, remove tier 2 layer)
        if (window.audioSystem && window.audioSystem.updateMusicForMeditation) {
            window.audioSystem.updateMusicForMeditation();
        }

        // Calculate rewards based on performance
        this.calculateSessionRewards();

        // Meditation Δ mult feedback on the live production path
        try {
            if (window.gameState) {
                if (window.gameState.storyFlags) {
                    window.gameState.storyFlags.meditationSessionDone = true;
                }
                if (typeof window.gameState.getProductionMultiplier === 'function' && multBefore != null) {
                    const wsIds = Object.keys(window.gameState.workstations || {}).filter(
                        (id) => (window.gameState.workstations[id] || 0) > 0
                    );
                    const sampleId = wsIds[0] || 'ws_fire_forge';
                    const multAfter = window.gameState.getProductionMultiplier(sampleId);
                    const delta = multAfter - multBefore;
                    const pct = multBefore > 0 ? ((delta / multBefore) * 100) : 0;
                    const sign = delta >= 0 ? '+' : '';
                    const line = `MEDITATION_Δ mult ${multBefore.toFixed(2)} → ${multAfter.toFixed(2)} (${sign}${pct.toFixed(1)}%)`;
                    if (typeof window.__appendSystemLog === 'function') {
                        window.__appendSystemLog(line, 'success');
                    }
                    if (window.showNotification) {
                        window.showNotification(line, 'success', 4000);
                    }
                    window.__lastMeditationMultDelta = { before: multBefore, after: multAfter, delta, pct };
                }
            }
        } catch (e) {
            console.warn('meditation mult delta feedback failed', e);
        }
    }

    /**
     * Start a new wave
     */
    startWave() {
        if (!this.activeSession) return;

        this.currentWave++;
        this.waveActive = true;
        this.waveStartTime = this._now();
        // Wave duration increases slightly with wave number (30s base, +2s per wave, max 60s)
        const waveDuration = Math.min(30000 + (this.currentWave * 2000), 60000);
        this.waveEndTime = this.waveStartTime + waveDuration;
        // Faster initial spawn with higher waves (wave 1 = 1s, wave 5 = 0.5s, wave 10+ = 0.3s)
        const initialSpawnDelay = Math.max(1000 - (this.currentWave * 50), 300);
        this.nextSpawnTime = this._now() + initialSpawnDelay;
        this.waveDistractionsSpawned = 0;
        // Increase max distractions with wave number (wave 1 = 10, wave 2 = 15, etc.)
        this.waveMaxDistractions = 10 + (this.currentWave * 5);

        if (this.onWaveChanged) {
            this.onWaveChanged(this.currentWave);
        }

        // Play wave start sound (Tier 2+)
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('wave_start');
        }
    }

    /**
     * Main meditation tick
     */
    tick() {
        const now = this._now();
        const delta = (now - this.lastTickTime) / 1000;
        this.lastTickTime = now;

        // Passive focus generation (even when not in session)
        const focusMult = this.getFocusMultiplier();
        const passiveFocus = this.focusPassiveRate * focusMult * delta;
        this.addFocus(passiveFocus);

        if (!this.activeSession) return;

        // Deterministic wave scheduling (replaces the old setTimeout chaining):
        // start the queued wave once its scheduled time arrives.
        if (!this.waveActive && this.nextWaveStartTime && now >= this.nextWaveStartTime) {
            this.nextWaveStartTime = 0;
            this.startWave();
        }

        // Update wave if active
        if (this.waveActive) {
            this.updateWave(delta);

            // Update towers
            this.updateTowers(delta);

            // Update distractions
            this.updateDistractions(delta);

            // Check if wave should end (duration exceeded or max distractions spawned)
            const waveDurationExceeded = now >= this.waveEndTime;
            const maxDistractionsReached = this.waveDistractionsSpawned >= this.waveMaxDistractions;
            const shouldStopSpawning = waveDurationExceeded || maxDistractionsReached;

            // If we should stop spawning, set nextSpawnTime far in the future
            if (shouldStopSpawning && this.nextSpawnTime < now + 10000) {
                this.nextSpawnTime = now + 10000; // Stop spawning
            }

            // Check if wave is complete (all distractions killed AND spawning stopped)
            const spawningStopped = this.nextSpawnTime > now + 5000;
            const allDistractionsKilled = this.distractions.length === 0;

            if (allDistractionsKilled && spawningStopped) {
                // Wave complete
                this.waveActive = false;
                this.totalWavesCompleted++;

                // Play wave complete sound (Tier 2+)
                if (window.audioSystem && window.audioSystem.playSound) {
                    window.audioSystem.playSound('wave_complete');
                }

                // Schedule the next wave (sim-tracked; checked in tick()).
                this.nextWaveStartTime = this._now() + 3000;
            }

            // Check if tranquility reached 0
            if (this.tranquility <= 0) {
                this.endSession(true); // Pass true to indicate tranquility loss
            }
        }
    }

    /**
     * Update wave spawning
     */
    updateWave(_delta) {
        const now = this._now();

        // Check if wave should stop spawning
        const waveDurationExceeded = now >= this.waveEndTime;
        const maxDistractionsReached = this.waveDistractionsSpawned >= this.waveMaxDistractions;

        if (!waveDurationExceeded && !maxDistractionsReached && now >= this.nextSpawnTime) {
            this.spawnDistraction();
            this.waveDistractionsSpawned++;

            // Calculate next spawn time (faster spawning as wave progresses AND with higher waves)
            const waveProgress = (now - this.waveStartTime) / (this.waveEndTime - this.waveStartTime);
            // Base interval decreases with wave number (wave 1 = 2s, wave 5 = 1.2s, wave 10 = 0.8s)
            const waveBaseInterval = Math.max(2000 - (this.currentWave * 120), 500);
            // Within-wave progression: faster spawning as wave progresses
            const progressReduction = waveProgress * (waveBaseInterval * 0.6); // Up to 60% faster by end of wave
            const baseInterval = waveBaseInterval - progressReduction;
            this.nextSpawnTime = now + Math.max(baseInterval, 300); // Minimum 300ms between spawns
        }
    }

    /**
     * Spawn a new distraction
     */
    spawnDistraction() {
        // Select distraction based on wave
        const tier = Math.min(Math.floor(this.currentWave / 2), 4);
        const availableDistractions = MEDITATION_DISTRACTIONS.filter(d => d.tier <= tier);

        if (availableDistractions.length === 0) return;

        const distractionData = availableDistractions[Math.floor(this._random() * availableDistractions.length)];

        // Spawn at random path entry point (edge of path)
        // Find all path tiles on the edges
        const edgePathTiles = [];
        for (const tileStr of this.pathTiles) {
            const [tx, ty] = tileStr.split(',').map(Number);
            if (tx === 0 || tx === this.gridSize - 1 || ty === 0 || ty === this.gridSize - 1) {
                edgePathTiles.push({ x: tx, y: ty });
            }
        }

        let x, y;
        if (edgePathTiles.length === 0) {
            // Fallback: use corners and find nearest path tile
            const entryPoints = [
                { x: 0, y: 0 },
                { x: this.gridSize - 1, y: 0 },
                { x: 0, y: this.gridSize - 1 },
                { x: this.gridSize - 1, y: this.gridSize - 1 }
            ];
            const entryPoint = entryPoints[Math.floor(this._random() * entryPoints.length)];

            // Find nearest path tile
            let nearestPath = null;
            let minDist = Infinity;
            for (const tileStr of this.pathTiles) {
                const [tx, ty] = tileStr.split(',').map(Number);
                const dist = Math.abs(tx - entryPoint.x) + Math.abs(ty - entryPoint.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearestPath = { x: tx, y: ty };
                }
            }

            if (nearestPath) {
                x = nearestPath.x;
                y = nearestPath.y;
            } else {
                // Last resort: use entry point (shouldn't happen)
                x = entryPoint.x;
                y = entryPoint.y;
            }
        } else {
            // Pick a random edge path tile
            const randomTile = edgePathTiles[Math.floor(this._random() * edgePathTiles.length)];
            x = randomTile.x;
            y = randomTile.y;
        }

        // Scale health, speed, and damage with wave for increasing difficulty
        const waveMultiplier = 1 + (this.currentWave * 0.2);
        const speedMultiplier = 1 + (this.currentWave * 0.1); // 10% speed increase per wave
        const damageMultiplier = 1 + (this.currentWave * 0.15); // 15% damage increase per wave

        const health = distractionData.health * waveMultiplier;
        const speed = distractionData.speed * speedMultiplier;
        const damage = distractionData.damage * damageMultiplier;

        const distraction = {
            id: distractionData.id,
            displayName: distractionData.displayName,
            tier: distractionData.tier,
            health: health,
            maxHealth: health,
            speed: speed,
            damage: damage,
            reward: distractionData.reward,
            x: x,
            y: y,
            targetX: this.gridSize / 2 - 0.5, // Center of grid
            targetY: this.gridSize / 2 - 0.5,
            progress: 0.0, // 0.0 to 1.0 (progress to center)
            lastMoveTime: this._now(), // Track when last moved
            stuckCount: 0 // Track how many times stuck
        };

        this.distractions.push(distraction);

        // Play distraction spawn sound (Tier 2+)
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('distraction_spawn', { volume: 0.2 }); // Lower volume for frequent spawns
        }
    }

    /**
     * Update distractions movement and health
     */
    updateDistractions(delta) {
        const centerX = this.gridSize / 2 - 0.5;
        const centerY = this.gridSize / 2 - 0.5;

        for (let i = this.distractions.length - 1; i >= 0; i--) {
            const dist = this.distractions[i];

            // Check if reached center
            const distToCenter = Math.sqrt((dist.x - centerX) ** 2 + (dist.y - centerY) ** 2);
            if (distToCenter < 0.5) {
                // Reached center, deal damage to tranquility
                this.tranquility = Math.max(0, this.tranquility - dist.damage);
                if (this.onTranquilityChanged) {
                    this.onTranquilityChanged(this.tranquility, this.tranquilityMax);
                }

                // Play tranquility damage sound (Tier 2+)
                if (window.audioSystem && window.audioSystem.playSound) {
                    window.audioSystem.playSound('tranquility_damage');
                }

                // Remove distraction
                this.distractions.splice(i, 1);
                continue;
            }

            // Follow path using distance-based pathfinding with smooth interpolation
            const pathDir = this.getPathDirection(dist.x, dist.y);
            const targetX = pathDir.nextX;
            const targetY = pathDir.nextY;
            const dx = targetX - dist.x;
            const dy = targetY - dist.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Stuck detection: real progress toward path/center, not mere oscillation
            const now = this._now();
            const timeSinceLastMove = now - (dist.lastMoveTime || now);
            const prevX = dist._prevX ?? dist.x;
            const prevY = dist._prevY ?? dist.y;
            const _posDelta = Math.hypot(dist.x - prevX, dist.y - prevY);
            dist._prevX = dist.x;
            dist._prevY = dist.y;

            const prevWaypointDist = dist._prevWaypointDist ?? distance;
            const closingOnWaypoint = distance < prevWaypointDist - 0.005;
            dist._prevWaypointDist = distance;

            const prevCenterDist = dist._prevCenterDist ?? distToCenter;
            const closingOnCenter = distToCenter < prevCenterDist - 0.005;
            dist._prevCenterDist = distToCenter;

            // Oscillation without closing on path/center is stuck (ignore pure posDelta thrash)
            const hasMoved = closingOnWaypoint || closingOnCenter;

            if (!hasMoved && timeSinceLastMove > 1000) {
                dist.stuckCount = (dist.stuckCount || 0) + 1;

                // Always nudge when stuck; stronger after repeated stalls
                const forceMult = dist.stuckCount > 3 ? 2.0 : 1.25;
                let nudgeDx = dx;
                let nudgeDy = dy;
                let nudgeDist = distance;
                if (nudgeDist < 0.001 || dist.stuckCount > 3) {
                    nudgeDx = centerX - dist.x;
                    nudgeDy = centerY - dist.y;
                    nudgeDist = Math.hypot(nudgeDx, nudgeDy);
                }
                if (nudgeDist > 0.001) {
                    const forceMoveSpeed = dist.speed * delta * forceMult;
                    dist.x += (nudgeDx / nudgeDist) * forceMoveSpeed;
                    dist.y += (nudgeDy / nudgeDist) * forceMoveSpeed;
                    dist.lastMoveTime = now;
                    if (dist.stuckCount > 3) dist.stuckCount = 0;
                    continue;
                }
            } else if (hasMoved) {
                dist.lastMoveTime = now;
                dist.stuckCount = 0;
            }

            // Check if very close to target (snap threshold)
            const snapThreshold = 0.1;
            if (distance < snapThreshold) {
                // Snap to target tile if very close
                dist.x = targetX;
                dist.y = targetY;
                dist.lastMoveTime = now;
            } else {
                // Smooth movement toward target using interpolation
                const moveSpeed = dist.speed * delta;
                const moveDistance = Math.min(moveSpeed, distance);

                // Normalize direction and apply movement
                if (distance > 0.001) {
                    dist.x += (dx / distance) * moveDistance;
                    dist.y += (dy / distance) * moveDistance;
                    dist.lastMoveTime = now;
                }

                // Ensure we stay on path (gentle correction if we drift)
                const currentTileKey = `${Math.round(dist.x)},${Math.round(dist.y)}`;
                if (!this.pathTiles.has(currentTileKey)) {
                    // Find nearest path tile and gently correct
                    const pathDirCorrected = this.getPathDirection(dist.x, dist.y);
                    const correctionX = pathDirCorrected.nextX - dist.x;
                    const correctionY = pathDirCorrected.nextY - dist.y;
                    const correctionDist = Math.sqrt(correctionX * correctionX + correctionY * correctionY);

                    if (correctionDist > 0.5) {
                        // Only correct if significantly off path
                        const correctionSpeed = Math.min(moveSpeed * 0.5, correctionDist * 0.3);
                        if (correctionDist > 0.001) {
                            dist.x += (correctionX / correctionDist) * correctionSpeed;
                            dist.y += (correctionY / correctionDist) * correctionSpeed;
                        }
                    }
                }
            }

            // Safety check: if stuck at edge, snap to nearest path tile
            const isOnEdge = dist.x === 0 || dist.x === this.gridSize - 1 || dist.y === 0 || dist.y === this.gridSize - 1;
            if (isOnEdge && !this.pathTiles.has(`${Math.round(dist.x)},${Math.round(dist.y)}`)) {
                // Find nearest path tile and snap to it
                let nearestPath = null;
                let minDist = Infinity;
                for (const tile of this.path) {
                    const distToTile = Math.abs(tile.x - dist.x) + Math.abs(tile.y - dist.y);
                    if (distToTile < minDist) {
                        minDist = distToTile;
                        nearestPath = tile;
                    }
                }
                if (nearestPath && minDist < 2) {
                    dist.x = nearestPath.x;
                    dist.y = nearestPath.y;
                }
            }

            // Calculate progress to center
            const currentDistToCenter = Math.sqrt((dist.x - centerX) ** 2 + (dist.y - centerY) ** 2);
            const maxDistToCenter = Math.sqrt((this.gridSize / 2) ** 2 + (this.gridSize / 2) ** 2);
            dist.progress = 1.0 - (currentDistToCenter / maxDistToCenter);

            // Check if health <= 0
            if (dist.health <= 0) {
                // Grant rewards
                this.grantDistractionReward(dist);

                // Remove distraction
                this.distractions.splice(i, 1);

                if (this.onDistractionKilled) {
                    this.onDistractionKilled(dist);
                }
            }
        }
    }

    /**
     * Grant reward for killing a distraction
     */
    grantDistractionReward(distraction) {
        // Track statistics
        this.totalDistractionsKilled++;

        // Grant focus
        if (distraction.reward.focus) {
            this.addFocus(distraction.reward.focus);
        }

        // Grant meditation ingredients
        for (const ingId in distraction.reward) {
            if (ingId !== 'focus') {
                this.addMeditationIngredient(ingId, distraction.reward[ingId]);
            }
        }

        // Play distraction death sound (Tier 2+)
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('distraction_death');
        }
    }

    /**
     * Update towers (attack distractions)
     */
    updateTowers(_delta) {
        for (const tower of this.towers) {
            if (!tower || !tower.data) continue;

            // Find nearest distraction in range (use current tower stats)
            const stats = this.getTowerStats(tower);
            const nearestDist = this.findNearestDistraction(tower.x, tower.y, stats.range);

            if (nearestDist) {
                // Check if tower can attack (based on attack speed)
                const now = this._now();
                if (!tower.lastAttackTime) tower.lastAttackTime = 0;
                const attackInterval = 1.0 / stats.attackSpeed;
                const timeSinceAttack = (now - tower.lastAttackTime) / 1000;

                if (timeSinceAttack >= attackInterval) {
                    // Attack! Use current tower stats (includes upgrades)
                    nearestDist.health -= stats.damage;

                    tower.lastAttackTime = now;

                    // Consume attack cost
                    this.consumeTowerCost(tower);

                    // Show projectile visualization
                    if (window.meditationTowers && window.meditationTowers.addTowerAttack) {
                        window.meditationTowers.addTowerAttack(tower.x, tower.y, nearestDist.x, nearestDist.y);
                    }

                    // Show damage number
                    if (window.meditationTowers && window.meditationTowers.addDamageNumber) {
                        const pixelX = nearestDist.x * (window.meditationTowers.cellSize || 30);
                        const pixelY = nearestDist.y * (window.meditationTowers.cellSize || 30);
                        window.meditationTowers.addDamageNumber(pixelX, pixelY, stats.damage);
                    }

                    // Sound is now played when projectile visually hits (in meditationTowers.js)
                    // This ensures better sync between visual and audio
                }
            }
        }
    }

    /**
     * Find nearest distraction in range
     */
    findNearestDistraction(x, y, range) {
        let nearest = null;
        let nearestDist = Infinity;

        for (const dist of this.distractions) {
            const dx = dist.x - x;
            const dy = dist.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= range && distance < nearestDist) {
                nearest = dist;
                nearestDist = distance;
            }
        }

        return nearest;
    }

    /**
     * Consume tower attack cost
     */
    consumeTowerCost(tower) {
        if (!tower.data.cost) return;

        for (const ingId in tower.data.cost) {
            const cost = tower.data.cost[ingId];
            if (this.meditationInventory[ingId] < cost) {
                // Can't afford, disable tower temporarily
                tower.disabled = true;
                return;
            }
            this.meditationInventory[ingId] -= cost;
        }
    }

    /**
     * Place a tower on the grid
     */
    placeTower(towerId, gridX, gridY) {
        // Check if valid position
        if (gridX < 0 || gridX >= this.gridSize || gridY < 0 || gridY >= this.gridSize) {
            return false;
        }

        const gridIndex = gridY * this.gridSize + gridX;
        const cell = this.grid[gridIndex];

        // Check if cell is a path tile (can't place towers on path)
        if (cell.isPath) {
            return false;
        }

        // Check if cell is occupied
        if (cell.tower) {
            return false;
        }

        // Find tower data
        const towerData = MEDITATION_TOWERS.find(t => t.id === towerId);
        if (!towerData) {
            return false;
        }

        // Check if player can afford tower
        if (!this.canAffordTower(towerData)) {
            return false;
        }

        // Spend ingredients
        this.spendTowerCost(towerData);

        // Place tower with upgrade level 0
        const tower = {
            id: towerId,
            data: towerData,
            x: gridX + 0.5, // Center of cell
            y: gridY + 0.5,
            gridX: gridX,
            gridY: gridY,
            upgradeLevel: 0, // Start at level 0
            lastAttackTime: 0,
            disabled: false
        };

        cell.tower = tower;
        this.towers.push(tower);

        if (this.onTowerPlaced) {
            this.onTowerPlaced(tower);
        }

        // Track tower placement for daily tasks
        if (this.dailyRituals) {
            this.dailyRituals.updateTaskProgress('meditation_towers', '', this.towers.length);
        }

        // Play tower place sound (Tier 2+)
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('tower_place');
        }

        return true;
    }

    /**
     * Check if player can afford tower
     */
    canAffordTower(towerData) {
        if (!towerData.recipe) return false;

        for (const ingId in towerData.recipe) {
            const required = towerData.recipe[ingId];
            const have = this.gameState.inventory[ingId] || 0;
            if (have < required) {
                return false;
            }
        }

        return true;
    }

    /**
     * Spend tower cost
     */
    spendTowerCost(towerData) {
        if (!towerData.recipe) return;

        for (const ingId in towerData.recipe) {
            const amount = towerData.recipe[ingId];
            this.gameState.spendIngredient(ingId, amount);
        }
    }

    /**
     * Calculate session rewards
     */
    calculateSessionRewards() {
        // Base reward: wave completion
        const baseReward = this.currentWave * 10;

        // Final reward
        this.addFocus(baseReward);
    }

    /**
     * Add focus
     */
    addFocus(amount) {
        // Apply active focus_gain potion buffs from main gameState when present
        let mult = 1;
        if (this.gameState && typeof this.gameState.getBuff === 'function') {
            mult = this.gameState.getBuff('focus_gain') || 1;
        }
        const granted = amount * mult;
        this.focus += granted;
        this.focusTotalEarned += granted;

        if (this.onFocusChanged) {
            this.onFocusChanged(this.focus);
        }
    }

    /**
     * Spend focus
     */
    spendFocus(amount) {
        if (this.focus >= amount) {
            this.focus -= amount;
            if (this.onFocusChanged) {
                this.onFocusChanged(this.focus);
            }
            return true;
        }
        return false;
    }

    /**
     * Add meditation ingredient
     */
    addMeditationIngredient(ingId, amount) {
        if (!this.meditationInventory[ingId]) {
            this.meditationInventory[ingId] = 0;
        }
        this.meditationInventory[ingId] += amount;
    }

    /**
     * Get focus multiplier from upgrades
     */
    getFocusMultiplier() {
        let mult = 1.0;
        for (const upgId in this.meditationUpgrades) {
            const upg = MEDITATION_UPGRADES.find(u => u.id === upgId);
            if (upg && upg.type === 'focus_generation') {
                mult *= upg.value;
            }
        }
        return mult;
    }

    /**
     * Get meditation production bonus for main game
     * This is a special bonus that can ONLY be obtained through meditation
     * Scales with meditation progress: focus earned, waves completed, distractions killed, sessions
     * @returns {number} Production multiplier (1.0 = no bonus)
     */
    getMeditationProductionBonus() {
        // Focus contribution (major): 1% per 100 focus earned (capped at 50% = 1.5x)
        const focusContribution = Math.min(this.focusTotalEarned / 10000, 0.5); // 10,000 focus = 50% bonus

        // Waves contribution (medium): 0.5% per wave completed (capped at 25% = 1.25x)
        const wavesContribution = Math.min(this.totalWavesCompleted / 500, 0.25); // 500 waves = 25% bonus

        // Distractions contribution (small): 0.1% per 100 distractions killed (capped at 10% = 1.1x)
        const distractionsContribution = Math.min(this.totalDistractionsKilled / 10000, 0.1); // 10,000 distractions = 10% bonus

        // Sessions contribution (tiny): 0.05% per session completed (capped at 5% = 1.05x)
        const sessionsContribution = Math.min(this.totalSessionsCompleted / 1000, 0.05); // 1,000 sessions = 5% bonus

        // Base bonus 1.0 + all contributions (max 1.9x = 90% bonus)
        const bonus = 1.0 + focusContribution + wavesContribution + distractionsContribution + sessionsContribution;

        // Cap at 2.0x (100% bonus) maximum
        return Math.min(bonus, 2.0);
    }

    /**
     * Get tower stats (damage, range, attack speed) based on base stats and upgrade level
     */
    getTowerStats(tower) {
        if (!tower || !tower.data) return { damage: 0, range: 0, attackSpeed: 0 };

        const level = tower.upgradeLevel || 0;
        const data = tower.data;

        // Calculate stats: base * (multiplier ^ level)
        const damage = data.baseDamage * Math.pow(data.upgradeDamageMult, level);
        const range = data.baseRange * Math.pow(data.upgradeRangeMult, level);
        const attackSpeed = data.baseAttackSpeed * Math.pow(data.upgradeSpeedMult, level);

        return { damage, range, attackSpeed };
    }

    /**
     * Upgrade a tower
     */
    upgradeTower(tower) {
        if (!tower || !tower.data) return false;

        const data = tower.data;
        const level = tower.upgradeLevel || 0;

        // Check if can afford upgrade
        if (!this.canAffordTowerUpgrade(data, level)) {
            return false;
        }

        // Spend upgrade cost
        this.spendTowerUpgradeCost(data, level);

        // Upgrade tower
        tower.upgradeLevel = (tower.upgradeLevel || 0) + 1;

        // Save state
        this.saveState();

        // Play tower upgrade sound (Tier 2+)
        if (window.audioSystem && window.audioSystem.playSound) {
            window.audioSystem.playSound('tower_upgrade');
        }

        return true;
    }

    /**
     * Check if can afford tower upgrade
     */
    canAffordTowerUpgrade(towerData, currentLevel) {
        if (!towerData.upgradeCost) return false;

        // Upgrade cost scales with level (each level costs more)
        const costMultiplier = Math.pow(1.5, currentLevel); // 1x, 1.5x, 2.25x, etc.

        for (const ingId in towerData.upgradeCost) {
            const baseCost = towerData.upgradeCost[ingId];
            const required = baseCost * costMultiplier;
            const have = this.meditationInventory[ingId] || 0;
            if (have < required) {
                return false;
            }
        }

        return true;
    }

    /**
     * Spend tower upgrade cost
     */
    spendTowerUpgradeCost(towerData, currentLevel) {
        if (!towerData.upgradeCost) return;

        // Upgrade cost scales with level
        const costMultiplier = Math.pow(1.5, currentLevel);

        for (const ingId in towerData.upgradeCost) {
            const baseCost = towerData.upgradeCost[ingId];
            const amount = baseCost * costMultiplier;
            this.meditationInventory[ingId] = Math.max(0, (this.meditationInventory[ingId] || 0) - amount);
        }
    }

    /**
     * Purchase meditation upgrade
     */
    purchaseMeditationUpgrade(upgId) {
        const upg = MEDITATION_UPGRADES.find(u => u.id === upgId);
        if (!upg) return false;

        // Check if already owned
        if (this.meditationUpgrades[upgId]) return false;

        // Check if unlocked
        if (upg.unlockAtFocus && this.focusTotalEarned < upg.unlockAtFocus) return false;

        // Check if can afford
        if (!this.canAffordUpgrade(upg)) return false;

        // Spend ingredients
        this.spendUpgradeCost(upg);

        // Purchase upgrade
        this.meditationUpgrades[upgId] = true;

        return true;
    }

    /**
     * Check if can afford upgrade
     */
    canAffordUpgrade(upg) {
        if (!upg.recipe) return false;

        for (const ingId in upg.recipe) {
            const required = upg.recipe[ingId];
            const have = this.meditationInventory[ingId] || 0;
            if (have < required) {
                return false;
            }
        }

        return true;
    }

    /**
     * Spend upgrade cost
     */
    spendUpgradeCost(upg) {
        if (!upg.recipe) return;

        for (const ingId in upg.recipe) {
            const amount = upg.recipe[ingId];
            this.meditationInventory[ingId] = Math.max(0, (this.meditationInventory[ingId] || 0) - amount);
        }
    }

    /**
     * Start meditation tick loop
     */
    startTickLoop() {
        const tickRate = 100; // 10 ticks per second
        this.tickInterval = setInterval(() => {
            this.tick();
        }, tickRate);
    }

    /**
     * Stop meditation tick loop
     */
    stopTickLoop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }

    /**
     * Save meditation state
     */
    /**
     * Fully reset meditation progression — in memory AND on disk.
     *
     * `meditationManager.reset()` delegated here but the method never existed, so
     * calling it threw "this.state.reset is not a function". This clears every
     * persisted/progression field back to constructor defaults, drops active
     * combat objects, stops the tick loop, and removes the separate
     * `meditationState` localStorage key (the one the save-wipe handler also
     * clears) so no stale focus/towers/stats survive a reset.
     */
    reset() {
        // Resources
        this.focus = 0.0;
        this.focusTotalEarned = 0.0;
        this.focusPassiveRate = 0.1;

        // Health
        this.tranquility = this.tranquilityMax;

        // Combat objects
        this.towers = [];
        this.distractions = [];

        // Free every grid cell's tower slot. placeTower() and the placement
        // preview reject cells where `cell.tower` is truthy, so emptying only the
        // towers array would leave previously-used cells permanently unbuildable
        // after a reset even though no tower exists there anymore.
        for (const cell of this.grid) {
            if (cell) cell.tower = null;
        }

        // Wave system
        this.currentWave = 0;
        this.waveActive = false;
        this.nextWaveStartTime = 0;
        this.waveDistractionsSpawned = 0;

        // Session
        this.activeSession = false;
        this.sessionStartTime = 0;

        // Inventory / upgrades
        this.meditationInventory = {};
        this.meditationUpgrades = {};

        // Statistics
        this.totalWavesCompleted = 0;
        this.totalDistractionsKilled = 0;
        this.totalSessionsCompleted = 0;

        // Stop any running tick loop
        if (typeof this.stopTickLoop === 'function') {
            this.stopTickLoop();
        }

        // Drop persisted state (both stores) so it can't resurrect on reload.
        try {
            localStorage.removeItem('meditationState');
        } catch {
            // localStorage may be unavailable (private mode / SSR); ignore.
        }
        idbDelete('meditationState');
    }

    saveState() {
        try {
            const state = {
                focus: this.focus,
                focusTotalEarned: this.focusTotalEarned,
                tranquilityMax: this.tranquilityMax,
                meditationInventory: this.meditationInventory,
                meditationUpgrades: this.meditationUpgrades,
                towers: this.towers.map(t => ({
                    id: t.id,
                    gridX: t.gridX,
                    gridY: t.gridY,
                    upgradeLevel: t.upgradeLevel || 0
                })),
                // Save meditation statistics for production bonus
                totalWavesCompleted: this.totalWavesCompleted,
                totalDistractionsKilled: this.totalDistractionsKilled,
                totalSessionsCompleted: this.totalSessionsCompleted
            };

            const serialized = JSON.stringify(state);
            localStorage.setItem('meditationState', serialized);
            // Durable, eviction-resistant mirror (non-blocking). See indexedDBBackup.js.
            mirrorToIndexedDB('meditationState', serialized);
        } catch (error) {
            console.error('Error saving meditation state:', error);
            handleError(error, 'meditation:save', true);
        }
    }

    /**
     * Load meditation state
     */
    loadState() {
        try {
            const saved = localStorage.getItem('meditationState');
            if (!saved) return;

            let state;
            try {
                state = JSON.parse(saved);
            } catch (_parseError) {
                try {
                    localStorage.setItem(`meditationState_corrupt_${Date.now()}`, saved);
                } catch { /* quota */ }
                handleError(
                    new Error('Meditation save was corrupted and could not be loaded. A backup was kept.'),
                    'meditation:load',
                    true
                );
                return;
            }

            this.focus = state.focus || 0;
            this.focusTotalEarned = state.focusTotalEarned || 0;
            this.tranquilityMax = state.tranquilityMax || 100;
            this.meditationInventory = state.meditationInventory || {};
            this.meditationUpgrades = state.meditationUpgrades || {};

            // Restore meditation statistics (production bonus depends on these)
            this.totalWavesCompleted = state.totalWavesCompleted || 0;
            this.totalDistractionsKilled = state.totalDistractionsKilled || 0;
            this.totalSessionsCompleted = state.totalSessionsCompleted || 0;

            // Rebuild towers
            if (state.towers) {
                this.towers = [];
                let skipped = 0;
                for (const towerData of state.towers) {
                    const towerInfo = MEDITATION_TOWERS.find(t => t.id === towerData.id);
                    if (towerInfo) {
                        const gridIndex = towerData.gridY * this.gridSize + towerData.gridX;
                        const cell = this.grid[gridIndex];
                        if (cell) {
                            const tower = {
                                id: towerData.id,
                                data: towerInfo,
                                x: towerData.gridX + 0.5,
                                y: towerData.gridY + 0.5,
                                gridX: towerData.gridX,
                                gridY: towerData.gridY,
                                upgradeLevel: towerData.upgradeLevel || 0,
                                lastAttackTime: 0,
                                disabled: false
                            };
                            cell.tower = tower;
                            this.towers.push(tower);
                        } else {
                            skipped++;
                        }
                    } else {
                        skipped++;
                    }
                }
                if (skipped > 0) {
                    notifyPlayer(
                        `Meditation load skipped ${skipped} tower(s) with invalid data.`,
                        'meditation:load',
                        'warning'
                    );
                }
            }
        } catch (error) {
            console.error('Error loading meditation state:', error);
            handleError(error, 'meditation:load', true);
        }
    }
}
