import { MEDITATION_TOWERS, MEDITATION_DISTRACTIONS, MEDITATION_UPGRADES } from './data.js';
import { handleError, safeFunction } from './errorHandler.js';

/**
 * Meditation State Manager - Manages meditation tower defense mode
 * Separate game mode with rhythm-based mechanics and tower defense gameplay
 */
export class MeditationState {
    constructor(gameState) {
        // Reference to main game state for accessing inventory
        this.gameState = gameState;
        
        // Meditation resources
        this.focus = 0.0;
        this.focusTotalEarned = 0.0;
        this.focusPassiveRate = 0.1; // Passive focus per second
        
        // Tranquility (health)
        this.tranquility = 100.0;
        this.tranquilityMax = 100.0;
        
        // Grid system (16x16 grid for higher resolution)
        this.gridSize = 16;
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
        this.lastTickTime = Date.now();
        
        // Callbacks
        this.onFocusChanged = null;
        this.onTranquilityChanged = null;
        this.onWaveChanged = null;
        this.onTowerPlaced = null;
        this.onDistractionKilled = null;
        
        // Initialize grid
        this.initializeGrid();
        this.initializePath();
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
     */
    initializePath() {
        this.path = [];
        this.pathTiles = new Set();
        
        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);
        
        // Create multiple paths from different edges to center
        // Top-left entry
        this.addPathSegment(0, 0, 3, 0);
        this.addPathSegment(3, 0, 3, 3);
        this.addPathSegment(3, 3, centerX, 3);
        this.addPathSegment(centerX, 3, centerX, centerY);
        
        // Top-right entry
        this.addPathSegment(this.gridSize - 1, 0, this.gridSize - 4, 0);
        this.addPathSegment(this.gridSize - 4, 0, this.gridSize - 4, 3);
        this.addPathSegment(this.gridSize - 4, 3, centerX, 3);
        
        // Bottom-left entry
        this.addPathSegment(0, this.gridSize - 1, 3, this.gridSize - 1);
        this.addPathSegment(3, this.gridSize - 1, 3, this.gridSize - 4);
        this.addPathSegment(3, this.gridSize - 4, centerX, this.gridSize - 4);
        this.addPathSegment(centerX, this.gridSize - 4, centerX, centerY);
        
        // Bottom-right entry
        this.addPathSegment(this.gridSize - 1, this.gridSize - 1, this.gridSize - 4, this.gridSize - 1);
        this.addPathSegment(this.gridSize - 4, this.gridSize - 1, this.gridSize - 4, this.gridSize - 4);
        this.addPathSegment(this.gridSize - 4, this.gridSize - 4, centerX, this.gridSize - 4);
        
        // Add horizontal connecting paths
        this.addPathSegment(3, 6, centerX, 6);
        this.addPathSegment(centerX, 6, this.gridSize - 4, 6);
        this.addPathSegment(3, 9, centerX, 9);
        this.addPathSegment(centerX, 9, this.gridSize - 4, 9);
        
        // Add vertical connecting paths
        this.addPathSegment(6, 3, 6, centerY);
        this.addPathSegment(6, centerY, 6, this.gridSize - 4);
        this.addPathSegment(9, 3, 9, centerY);
        this.addPathSegment(9, centerY, 9, this.gridSize - 4);
        
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
        
        console.log(`Calculated distances for ${this.pathDistances.size} path tiles`);
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
        
        // Find all adjacent path tiles (within 1.5 tile distance)
        const adjacentTiles = [];
        const directions = [
            [0, -1], [0, 1], [-1, 0], [1, 0],  // cardinal
            [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonal
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
        
        // If no valid adjacent tiles, stay put (shouldn't happen, but safety check)
        if (adjacentTiles.length === 0) {
            return { nextX: currentTile.x, nextY: currentTile.y };
        }
        
        // Choose the adjacent tile with the lowest distance (closest to center)
        const bestTile = adjacentTiles.reduce((best, tile) => {
            return tile.distance < best.distance ? tile : best;
        });
        
        return { nextX: bestTile.x, nextY: bestTile.y };
    }
    
    /**
     * Start meditation session
     */
    startSession() {
        if (this.activeSession) return;
        
        this.activeSession = true;
        this.sessionStartTime = Date.now();
        this.waveActive = false;
        this.currentWave = 0;
        this.tranquility = this.tranquilityMax;
        this.distractions = [];
        
        // Start meditation music if music is enabled and at Tier 4+
        if (window.audioSystem) {
            const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            console.log('Meditation session starting - Current tier:', currentTier);
            console.log('Music enabled:', window.audioSystem.musicEnabled);
            console.log('Audio context state:', window.audioSystem.audioContext ? window.audioSystem.audioContext.state : 'no context');
            console.log('Is muted:', window.audioSystem.isMuted);
            
            if (currentTier >= 4) {
                // If music is not enabled, try to enable it
                if (!window.audioSystem.musicEnabled) {
                    console.log('Music not enabled, attempting to enable...');
                    window.audioSystem.enableMusic().then(() => {
                        console.log('Music enabled successfully');
                        // Set music mode to meditation and start music
                        window.audioSystem.currentMusicMode = 'meditation';
                        window.audioSystem.startMusic().catch(err => {
                            console.error('Failed to start meditation music:', err);
                        });
                    }).catch(err => {
                        console.error('Failed to enable music:', err);
                    });
                } else {
                    // Music is already enabled, just start it
                    console.log('Music already enabled, starting meditation music...');
                    window.audioSystem.currentMusicMode = 'meditation';
                    window.audioSystem.startMusic().catch(err => {
                        console.error('Failed to start meditation music:', err);
                    });
                }
            } else {
                console.log('Tier too low for music. Current tier:', currentTier, '(need 4+)');
            }
        } else {
            console.warn('Audio system not available');
        }
        
        // Start wave after a delay
        setTimeout(() => {
            this.startWave();
        }, 2000);
    }
    
    /**
     * End meditation session
     */
    endSession() {
        if (!this.activeSession) return;
        
        this.activeSession = false;
        this.waveActive = false;
        this.distractions = [];
        
        // Switch music back to normal mode if meditation music was playing
        if (window.audioSystem && window.audioSystem.currentMusicMode === 'meditation') {
            const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            const meditationTab = document.getElementById('meditation-tab');
            const isMeditationTabActive = meditationTab && meditationTab.classList.contains('active');
            
            // Only switch if meditation tab is no longer active
            if (!isMeditationTabActive && currentTier >= 4 && window.audioSystem.musicEnabled) {
                window.audioSystem.currentMusicMode = 'normal';
                window.audioSystem.startMusic().catch(err => {
                    console.error('Failed to switch to normal music:', err);
                });
            }
        }
        
        // Calculate rewards based on performance
        this.calculateSessionRewards();
    }
    
    /**
     * Start a new wave
     */
    startWave() {
        if (!this.activeSession) return;
        
        this.currentWave++;
        this.waveActive = true;
        this.waveStartTime = Date.now();
        this.nextSpawnTime = Date.now() + 1000; // First spawn after 1 second
        
        if (this.onWaveChanged) {
            this.onWaveChanged(this.currentWave);
        }
    }
    
    /**
     * Main meditation tick
     */
    tick() {
        const now = Date.now();
        const delta = (now - this.lastTickTime) / 1000;
        this.lastTickTime = now;
        
        // Passive focus generation (even when not in session)
        const focusMult = this.getFocusMultiplier();
        const passiveFocus = this.focusPassiveRate * focusMult * delta;
        this.addFocus(passiveFocus);
        
        if (!this.activeSession) return;
        
        // Update wave if active
        if (this.waveActive) {
            this.updateWave(delta);
            
            // Update towers
            this.updateTowers(delta);
            
            // Update distractions
            this.updateDistractions(delta);
            
            // Check if wave is complete
            if (this.distractions.length === 0 && this.nextSpawnTime > now + 5000) {
                // Wave complete
                this.waveActive = false;
                this.totalWavesCompleted++;
                setTimeout(() => {
                    this.startWave();
                }, 3000);
            }
            
            // Check if tranquility reached 0
            if (this.tranquility <= 0) {
                this.endSession();
            }
        }
    }
    
    /**
     * Update wave spawning
     */
    updateWave(delta) {
        const now = Date.now();
        
        if (now >= this.nextSpawnTime) {
            this.spawnDistraction();
            
            // Calculate next spawn time (faster spawning as wave progresses)
            const waveProgress = (now - this.waveStartTime) / 30000; // 30 second waves
            const baseInterval = 2000 - (waveProgress * 1500); // 2s to 0.5s
            this.nextSpawnTime = now + Math.max(baseInterval, 500);
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
        
        const distractionData = availableDistractions[Math.floor(Math.random() * availableDistractions.length)];
        
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
            const entryPoint = entryPoints[Math.floor(Math.random() * entryPoints.length)];
            
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
            const randomTile = edgePathTiles[Math.floor(Math.random() * edgePathTiles.length)];
            x = randomTile.x;
            y = randomTile.y;
        }
        
        // Scale health and rewards with wave
        const waveMultiplier = 1 + (this.currentWave * 0.2);
        const health = distractionData.health * waveMultiplier;
        const speed = distractionData.speed;
        const damage = distractionData.damage;
        
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
            progress: 0.0 // 0.0 to 1.0 (progress to center)
        };
        
        this.distractions.push(distraction);
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
                
                // Remove distraction
                this.distractions.splice(i, 1);
                continue;
            }
            
            // Follow path using distance-based pathfinding
            const pathDir = this.getPathDirection(dist.x, dist.y);
            const dx = pathDir.nextX - dist.x;
            const dy = pathDir.nextY - dist.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If very close to target tile (within 0.2 tiles), snap to it
            if (distance < 0.2) {
                // Snap to target tile
                dist.x = pathDir.nextX;
                dist.y = pathDir.nextY;
            } else if (distance > 0.05) {
                // Move toward next path tile (normalized movement)
                const moveSpeed = dist.speed * delta * 1.0; // Increased from 0.5 to 1.0
                dist.x += (dx / distance) * moveSpeed;
                dist.y += (dy / distance) * moveSpeed;
            } else {
                // Very close but not snapped, snap it
                dist.x = pathDir.nextX;
                dist.y = pathDir.nextY;
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
    }
    
    /**
     * Update towers (attack distractions)
     */
    updateTowers(delta) {
        for (const tower of this.towers) {
            if (!tower || !tower.data) continue;
            
            // Find nearest distraction in range
            const nearestDist = this.findNearestDistraction(tower.x, tower.y, tower.data.range);
            
            if (nearestDist) {
                // Check if tower can attack (based on attack speed)
                const now = Date.now();
                if (!tower.lastAttackTime) tower.lastAttackTime = 0;
                const timeSinceAttack = (now - tower.lastAttackTime) / 1000;
                const attackInterval = 1.0 / tower.data.attackSpeed;
                
                if (timeSinceAttack >= attackInterval) {
                    // Attack!
                    const damage = tower.data.damage * this.getTowerDamageMultiplier();
                    nearestDist.health -= damage;
                    
                    tower.lastAttackTime = now;
                    
                    // Consume attack cost
                    this.consumeTowerCost(tower);
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
        
        // Place tower
        const tower = {
            id: towerId,
            data: towerData,
            x: gridX + 0.5, // Center of cell
            y: gridY + 0.5,
            gridX: gridX,
            gridY: gridY,
            lastAttackTime: 0,
            disabled: false
        };
        
        cell.tower = tower;
        this.towers.push(tower);
        
        if (this.onTowerPlaced) {
            this.onTowerPlaced(tower);
        }
        
        // Track tower placement for daily tasks
        if (typeof window.updateDailyProgress === 'function') {
            window.updateDailyProgress('meditation_towers', '', this.towers.length);
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
        this.focus += amount;
        this.focusTotalEarned += amount;
        
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
        // Base bonus: 1.0 (no bonus)
        let bonus = 1.0;
        
        // Focus contribution (major): 1% per 100 focus earned (capped at 50% = 1.5x)
        const focusContribution = Math.min(this.focusTotalEarned / 10000, 0.5); // 10,000 focus = 50% bonus
        
        // Waves contribution (medium): 0.5% per wave completed (capped at 25% = 1.25x)
        const wavesContribution = Math.min(this.totalWavesCompleted / 500, 0.25); // 500 waves = 25% bonus
        
        // Distractions contribution (small): 0.1% per 100 distractions killed (capped at 10% = 1.1x)
        const distractionsContribution = Math.min(this.totalDistractionsKilled / 10000, 0.1); // 10,000 distractions = 10% bonus
        
        // Sessions contribution (tiny): 0.05% per session completed (capped at 5% = 1.05x)
        const sessionsContribution = Math.min(this.totalSessionsCompleted / 1000, 0.05); // 1,000 sessions = 5% bonus
        
        // Total bonus: 1.0 + all contributions (max 1.9x = 90% bonus)
        bonus = 1.0 + focusContribution + wavesContribution + distractionsContribution + sessionsContribution;
        
        // Cap at 2.0x (100% bonus) maximum
        return Math.min(bonus, 2.0);
    }
    
    /**
     * Get tower damage multiplier from upgrades
     */
    getTowerDamageMultiplier() {
        let mult = 1.0;
        for (const upgId in this.meditationUpgrades) {
            const upg = MEDITATION_UPGRADES.find(u => u.id === upgId);
            if (upg && upg.type === 'tower_damage') {
                mult *= upg.value;
            }
        }
        return mult;
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
    saveState() {
        const state = {
            focus: this.focus,
            focusTotalEarned: this.focusTotalEarned,
            tranquilityMax: this.tranquilityMax,
            meditationInventory: this.meditationInventory,
            meditationUpgrades: this.meditationUpgrades,
            towers: this.towers.map(t => ({
                id: t.id,
                gridX: t.gridX,
                gridY: t.gridY
            })),
            // Save meditation statistics for production bonus
            totalWavesCompleted: this.totalWavesCompleted,
            totalDistractionsKilled: this.totalDistractionsKilled,
            totalSessionsCompleted: this.totalSessionsCompleted
        };
        
        localStorage.setItem('meditationState', JSON.stringify(state));
    }
    
    /**
     * Load meditation state
     */
    loadState() {
        try {
            const saved = localStorage.getItem('meditationState');
            if (!saved) return;
            
            const state = JSON.parse(saved);
            
            this.focus = state.focus || 0;
            this.focusTotalEarned = state.focusTotalEarned || 0;
            this.tranquilityMax = state.tranquilityMax || 100;
            this.meditationInventory = state.meditationInventory || {};
            this.meditationUpgrades = state.meditationUpgrades || {};
            
            // Rebuild towers
            if (state.towers) {
                this.towers = [];
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
                                lastAttackTime: 0,
                                disabled: false
                            };
                            cell.tower = tower;
                            this.towers.push(tower);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading meditation state:', error);
        }
    }
}

