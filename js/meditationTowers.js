import { MEDITATION_TOWERS } from './data.js';
import { MEDITATION_COLORS } from './config/meditationColors.js';

/**
 * Meditation Tower Defense Renderer - Handles canvas rendering for tower defense gameplay
 */
export class MeditationTowers {
    constructor(meditationState, gameState) {
        this.meditationState = meditationState;
        this.gameState = gameState;
        
        // Canvas
        this.canvas = null;
        this.ctx = null;
        this.cellSize = 0;
        
        // Selected tower for placement
        this.selectedTowerId = null;
        this.hoverGridX = null;
        this.hoverGridY = null;
        
        // Animation frame
        this.animationFrame = null;
        this.lastFrameTime = Date.now();
        
        // Visual effects
        this.damageNumbers = []; // Array of {x, y, damage, time}
        this.towerAttacks = []; // Array of {fromX, fromY, toX, toY, progress}
        this.impactEffects = []; // Array of {x, y, time, type} for impact visualizations
    }
    
    /**
     * Initialize canvas
     */
    init() {
        this.canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('meditation-canvas'));
        if (!this.canvas) {
            console.error('Meditation canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Wait for container to be sized
        setTimeout(() => {
            // Set canvas size
            this.resizeCanvas();
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Start animation loop
            this.startAnimationLoop();
            
            // Force a render to ensure path is visible
            this.render();
            
            console.info('Meditation towers initialized, canvas size:', this.canvas.width, this.canvas.height, 'cell size:', this.cellSize);
            console.info('Path tiles count:', this.meditationState?.pathTiles?.size || 0);
        }, 100);
    }
    
    /**
     * Resize canvas
     */
    resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        // Get container inner dimensions - use clientWidth/clientHeight to exclude borders
        // This gives us the actual available space inside the container
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Make canvas match container exactly - use full inner container size
        // Container should already be square, so use the smaller dimension to ensure it fits
        const size = Math.min(containerWidth, containerHeight) || 600; // Default to 600 if container not sized
        
        // Set canvas internal resolution (this is what the drawing uses)
        // Use device pixel ratio for crisp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;
        
        // Set canvas display size (CSS size) - match container exactly
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        // Reset transform to prevent accumulation
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Scale context to account for device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Calculate cell size based on display size (not internal resolution)
        this.cellSize = size / this.meditationState.gridSize;
        
        console.info('Canvas resized:', size, 'cell size:', this.cellSize, 'dpr:', dpr, 'container:', containerWidth, 'x', containerHeight);
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        if (!this.canvas) return;
        
        // Mouse move - track hover position
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.hoverGridX = Math.floor(x / this.cellSize);
            this.hoverGridY = Math.floor(y / this.cellSize);
        });
        
        // Mouse leave - clear hover
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverGridX = null;
            this.hoverGridY = null;
        });
        
        // Click - place tower or upgrade existing tower
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridX = Math.floor(x / this.cellSize);
            const gridY = Math.floor(y / this.cellSize);
            
            // Check if there's a tower at this position
            const gridIndex = gridY * this.meditationState.gridSize + gridX;
            const cell = this.meditationState.grid[gridIndex];
            const existingTower = cell && cell.tower;
            
            if (existingTower) {
                // Clicked on existing tower - try to upgrade it
                if (this.meditationState && this.meditationState.upgradeTower(existingTower)) {
                    console.info('Tower upgraded successfully');
                    // Update UI
                    if (window.meditationUI) {
                        window.meditationUI.updateTowerList();
                        window.meditationUI.updateMeditationInventory();
                    }
                } else {
                    console.info('Cannot upgrade tower - cannot afford or max level');
                }
            } else if (this.selectedTowerId) {
                // No tower at position, try to place selected tower
                console.info('Canvas clicked at grid position:', gridX, gridY, 'Tower:', this.selectedTowerId);
                
                if (this.meditationState && this.meditationState.placeTower(this.selectedTowerId, gridX, gridY)) {
                    console.info('Tower placed successfully');
                    this.selectedTowerId = null; // Clear selection after placement
                    
                    // Clear selected button state
                    const buttons = document.querySelectorAll('.tower-place-button');
                    buttons.forEach(btn => {
                        btn.classList.remove('selected');
                        btn.textContent = 'Place Tower';
                    });
                    
                    // Update UI
                    if (window.meditationUI) {
                        window.meditationUI.updateTowerList();
                    }
                } else {
                    console.info('Failed to place tower - invalid position or cannot afford');
                }
            }
        });
    }
    
    /**
     * Set selected tower for placement
     */
    setSelectedTower(towerId) {
        this.selectedTowerId = towerId;
    }
    
    /**
     * Start animation loop
     * Stops when tab is hidden to save CPU (similar to audio loops stopping)
     */
    startAnimationLoop() {
        // Stop if already running
        if (this.animationFrame) {
            return;
        }
        
        const animate = () => {
            // Stop if tab is hidden (save CPU) or explicitly paused (for
            // deterministic verification — see pause()/stepFrames()).
            if (document.hidden || this.paused) {
                this.animationFrame = null;
                return;
            }

            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        this._animate = animate;

        // Only start if tab is visible and not paused
        if (!document.hidden && !this.paused) {
            this.animationFrame = requestAnimationFrame(animate);
        }
        
        // Listen for visibility changes to pause/resume
        if (!this.visibilityHandler) {
            this.visibilityHandler = () => {
                if (document.hidden) {
                    // Tab hidden - stop animation loop (save CPU)
                    if (this.animationFrame) {
                        cancelAnimationFrame(this.animationFrame);
                        this.animationFrame = null;
                    }
                } else if (!this.animationFrame) {
                    // Tab visible - restart animation loop
                    this.animationFrame = requestAnimationFrame(animate);
                }
            };
            document.addEventListener('visibilitychange', this.visibilityHandler);
        }
    }
    
    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Remove visibility handler
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler);
            this.visibilityHandler = null;
        }
    }

    /**
     * Pause the render loop. The simulation (MeditationState.tick) is independent,
     * so pausing only freezes drawing — leaving the canvas on a static frame.
     * Enables deterministic verification: the page settles (no perpetual RAF) and
     * the harness can drive the sim + render exact frames.
     */
    pause() {
        this.paused = true;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /** Resume the render loop. */
    resume() {
        this.paused = false;
        this.startAnimationLoop();
    }

    /** Render exactly `n` frames synchronously (no-op unless canvas is ready). */
    stepFrames(n = 1) {
        for (let i = 0; i < n; i++) this.render();
    }
    
    /**
     * Main render function
     */
    render() {
        if (!this.canvas || !this.ctx) return;
        
        const now = Date.now();
        const delta = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid background
        this.drawGrid();
        
        // Draw path
        this.drawPath();
        
        // Draw center (sanctuary core)
        this.drawCenter();
        
        // Draw towers
        this.drawTowers();
        
        // Draw tower placement preview
        if (this.selectedTowerId && this.hoverGridX !== null && this.hoverGridY !== null) {
            this.drawTowerPreview(this.selectedTowerId, this.hoverGridX, this.hoverGridY);
        }
        
        // Draw distractions
        this.drawDistractions();
        
        // Draw tower attacks
        this.drawTowerAttacks(delta);
        
        // Draw impact effects
        this.drawImpactEffects(delta);
        
        // Draw damage numbers
        this.drawDamageNumbers(delta);
    }
    
    /**
     * Draw grid background
     */
    drawGrid() {
        this.ctx.strokeStyle = MEDITATION_COLORS.GRID_LINE;
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.meditationState.gridSize; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.meditationState.gridSize; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw path tiles
     */
    drawPath() {
        if (!this.meditationState || !this.meditationState.pathTiles) {
            console.warn('drawPath: meditationState or pathTiles not available');
            return;
        }
        
        // Check if pathTiles is a Set and has items
        if (!(this.meditationState.pathTiles instanceof Set) || this.meditationState.pathTiles.size === 0) {
            console.warn('drawPath: pathTiles is empty or not a Set');
            return;
        }
        
        // Draw path tiles with a more visible color
        this.ctx.fillStyle = MEDITATION_COLORS.SUCCESS_FILL; // Increased opacity from 0.15 to 0.25
        
        for (const tileStr of this.meditationState.pathTiles) {
            const [x, y] = tileStr.split(',').map(Number);
            const pixelX = x * this.cellSize;
            const pixelY = y * this.cellSize;
            
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        }
        
        // Draw path borders for better visibility
        this.ctx.strokeStyle = MEDITATION_COLORS.SUCCESS_STROKE; // Increased opacity from 0.3 to 0.5
        this.ctx.lineWidth = 2; // Increased from 1 to 2 for better visibility
        
        for (const tileStr of this.meditationState.pathTiles) {
            const [x, y] = tileStr.split(',').map(Number);
            const pixelX = x * this.cellSize;
            const pixelY = y * this.cellSize;
            
            this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
        }
    }
    
    /**
     * Draw center (sanctuary core)
     */
    drawCenter() {
        const centerX = (this.meditationState.gridSize / 2) * this.cellSize;
        const centerY = (this.meditationState.gridSize / 2) * this.cellSize;
        const radius = this.cellSize * 0.4;
        
        // Draw outer glow
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
        gradient.addColorStop(0, MEDITATION_COLORS.MAGIC_FILL_START);
        gradient.addColorStop(1, MEDITATION_COLORS.MAGIC_FILL_END);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw center circle
        this.ctx.fillStyle = MEDITATION_COLORS.MAGIC_FILL_START;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = MEDITATION_COLORS.MAGIC_STROKE;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * Draw towers
     */
    drawTowers() {
        const designTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        const isEnhanced = designTier >= 3;
        
        for (const tower of this.meditationState.towers) {
            if (!tower || !tower.data) continue;
            
            const x = tower.x * this.cellSize;
            const y = tower.y * this.cellSize;
            const radius = this.cellSize * 0.3;
            const level = tower.upgradeLevel || 0;
            
            // Draw tower range (if active) - use current tower stats
            if (this.meditationState.activeSession && this.meditationState.waveActive) {
                const stats = this.meditationState.getTowerStats(tower);
                const range = stats.range * this.cellSize;
                
                if (isEnhanced) {
                    // Enhanced range visualization with pulsing effect
                    const time = Date.now() * 0.001;
                    const pulse = 0.1 + Math.sin(time * 2) * 0.05;
                    const rangeGradient = this.ctx.createRadialGradient(x, y, 0, x, y, range);
                    rangeGradient.addColorStop(0, MEDITATION_COLORS.CODE_RANGE_START(pulse));
                    rangeGradient.addColorStop(0.5, MEDITATION_COLORS.CODE_RANGE_MID(pulse));
                    rangeGradient.addColorStop(1, MEDITATION_COLORS.CODE_RANGE_END);
                    
                    this.ctx.fillStyle = rangeGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, range, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Draw range ring
                    this.ctx.strokeStyle = MEDITATION_COLORS.CODE_STROKE(pulse);
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, range, 0, Math.PI * 2);
                    this.ctx.stroke();
                } else {
                    // Basic range visualization
                    const rangeGradient = this.ctx.createRadialGradient(x, y, 0, x, y, range);
                    rangeGradient.addColorStop(0, MEDITATION_COLORS.CODE_AREA_START);
                    rangeGradient.addColorStop(1, MEDITATION_COLORS.CODE_RANGE_END);
                    
                    this.ctx.fillStyle = rangeGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, range, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            const towerColor = this.getTowerColor(tower.id);
            
            if (isEnhanced) {
                // Enhanced tower design with glow, gradients, and unique shapes
                this.drawEnhancedTower(x, y, radius, tower, towerColor, level);
            } else {
                // Basic tower design
                this.ctx.fillStyle = towerColor;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.strokeStyle = towerColor;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // Draw tower level indicator if upgraded
                if (level > 0) {
                    this.ctx.fillStyle = MEDITATION_COLORS.HIGHLIGHT_YELLOW;
                    this.ctx.font = `${radius * 0.4}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(level.toString(), x, y - radius * 0.3);
                }
                
                // Draw tower icon (simple symbol)
                this.ctx.fillStyle = MEDITATION_COLORS.TEXT_WHITE;
                this.ctx.font = `${radius * 0.6}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('○', x, y);
            }
        }
    }
    
    /**
     * Draw enhanced tower design (Tier 3+)
     */
    drawEnhancedTower(x, y, radius, tower, baseColor, level) {
        const time = Date.now() * 0.001;
        
        // Extract RGBA from base color
        const colorMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!colorMatch) return;
        
        const r = parseInt(colorMatch[1], 10);
        const g = parseInt(colorMatch[2], 10);
        const b = parseInt(colorMatch[3], 10);
        const a = colorMatch[4] ? parseFloat(colorMatch[4]) : 0.8;
        
        // Draw outer glow
        const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
        glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.4})`); // Keep dynamic RGB values
        glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.2})`);
        glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw main tower shape based on type
        const towerShape = this.getTowerShape(tower.id);
        
        // Draw gradient fill
        const fillGradient = this.ctx.createRadialGradient(x, y - radius * 0.3, 0, x, y, radius);
        fillGradient.addColorStop(0, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${a})`);
        fillGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);
        this.ctx.fillStyle = fillGradient;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Draw shape-specific design
        if (towerShape === 'hexagon') {
            // Hexagon shape for Peace Circle
            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
            this.ctx.fill();
        } else if (towerShape === 'ring') {
            // Ring shape for Focus Ring
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.fill();
            // Inner ring
            this.ctx.fillStyle = MEDITATION_COLORS.SHADOW_DARK;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (towerShape === 'shrine') {
            // Shrine shape for Tranquility Shrine (tiered)
            this.ctx.beginPath();
            // Bottom tier
            this.ctx.rect(-radius, radius * 0.3, radius * 2, radius * 0.4);
            this.ctx.fill();
            // Middle tier
            this.ctx.rect(-radius * 0.7, 0, radius * 1.4, radius * 0.4);
            this.ctx.fill();
            // Top tier
            this.ctx.beginPath();
            this.ctx.arc(0, -radius * 0.2, radius * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (towerShape === 'pavilion') {
            // Pavilion shape for Zen Pavilion (octagon with center)
            this.ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
            this.ctx.fill();
            // Center circle
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Draw animated border with pulsing effect
        const pulse = 0.8 + Math.sin(time * 3) * 0.2;
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * pulse})`;
        this.ctx.lineWidth = 2 + level * 0.5;
        this.ctx.beginPath();
        if (towerShape === 'hexagon') {
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
        } else if (towerShape === 'ring') {
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        } else if (towerShape === 'shrine') {
            this.ctx.rect(x - radius, y - radius * 0.5, radius * 2, radius);
        } else if (towerShape === 'pavilion') {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
        }
        this.ctx.stroke();
        
        // Draw level indicator with enhanced styling
        if (level > 0) {
            this.ctx.fillStyle = MEDITATION_COLORS.TEXT_YELLOW(time);
            this.ctx.strokeStyle = MEDITATION_COLORS.HIGHLIGHT_ORANGE;
            this.ctx.lineWidth = 1;
            this.ctx.font = `bold ${radius * 0.5}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const levelY = y - radius * 0.4;
            this.ctx.strokeText(level.toString(), x, levelY);
            this.ctx.fillText(level.toString(), x, levelY);
        }
        
        // Draw tower symbol/icon
        const symbol = this.getTowerSymbol(tower.id);
        this.ctx.fillStyle = MEDITATION_COLORS.TEXT_WHITE_PULSE(time);
        this.ctx.font = `${radius * 0.7}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, x, y);
    }
    
    /**
     * Get tower shape type for enhanced rendering
     */
    getTowerShape(towerId) {
        const shapes = {
            'peace_circle': 'hexagon',
            'focus_ring': 'ring',
            'tranquility_shrine': 'shrine',
            'zen_pavilion': 'pavilion'
        };
        return shapes[towerId] || 'hexagon';
    }
    
    /**
     * Get tower symbol/icon
     */
    getTowerSymbol(towerId) {
        const symbols = {
            'peace_circle': '☮',
            'focus_ring': '◎',
            'tranquility_shrine': '◉',
            'zen_pavilion': '◈'
        };
        return symbols[towerId] || '○';
    }
    
    /**
     * Draw tower placement preview
     */
    drawTowerPreview(towerId, gridX, gridY) {
        if (!this.cellSize || this.cellSize <= 0) return; // Don't draw if cell size not calculated
        
        const towerData = MEDITATION_TOWERS.find(t => t.id === towerId);
        if (!towerData) return;
        
        // Check bounds
        if (gridX < 0 || gridX >= this.meditationState.gridSize || gridY < 0 || gridY >= this.meditationState.gridSize) {
            return;
        }
        
        // Check if position is valid
        const gridIndex = gridY * this.meditationState.gridSize + gridX;
        const cell = this.meditationState.grid[gridIndex];
        const canPlace = cell && !cell.isPath && !cell.tower && this.meditationState.canAffordTower(towerData);
        
        const x = (gridX + 0.5) * this.cellSize;
        const y = (gridY + 0.5) * this.cellSize;
        const radius = this.cellSize * 0.3;
        
        // Draw preview circle
        this.ctx.fillStyle = canPlace ? MEDITATION_COLORS.CAN_PLACE : MEDITATION_COLORS.CANNOT_PLACE;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw preview border
        this.ctx.strokeStyle = canPlace ? MEDITATION_COLORS.CAN_PLACE_STROKE : MEDITATION_COLORS.CANNOT_PLACE_STROKE;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw range preview (use base range)
        const range = towerData.baseRange * this.cellSize;
        this.ctx.strokeStyle = canPlace ? MEDITATION_COLORS.CAN_PLACE : MEDITATION_COLORS.CANNOT_PLACE;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, range, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Draw distractions - different shape and color from towers
     */
    drawDistractions() {
        const designTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        const isEnhanced = designTier >= 3;
        
        for (const dist of this.meditationState.distractions) {
            if (!dist) continue;
            
            const x = dist.x * this.cellSize;
            const y = dist.y * this.cellSize;
            const size = this.cellSize * 0.25;
            
            // Draw health bar
            const healthPercent = dist.health / dist.maxHealth;
            const barWidth = this.cellSize * 0.6;
            const barHeight = isEnhanced ? 5 : 4;
            const barX = x - barWidth / 2;
            const barY = y - size - (isEnhanced ? 12 : 10);
            
            if (isEnhanced) {
                // Enhanced health bar with border and gradient
                // Background with border
                this.ctx.fillStyle = MEDITATION_COLORS.SHADOW_DARKER;
                this.ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
                this.ctx.strokeStyle = MEDITATION_COLORS.GRID_LINE;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
                
                // Health gradient
                const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);
                if (healthPercent > 0.5) {
                    healthGradient.addColorStop(0, 'rgba(0, 255, 100, 0.9)');
                    healthGradient.addColorStop(1, 'rgba(0, 200, 80, 0.9)');
                } else if (healthPercent > 0.25) {
                    healthGradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
                    healthGradient.addColorStop(1, 'rgba(255, 200, 0, 0.9)');
                } else {
                    healthGradient.addColorStop(0, 'rgba(255, 50, 50, 0.9)');
                    healthGradient.addColorStop(1, 'rgba(200, 0, 0, 0.9)');
                }
                this.ctx.fillStyle = healthGradient;
                this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            } else {
                // Basic health bar
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.ctx.fillRect(barX, barY, barWidth, barHeight);
                
                this.ctx.fillStyle = healthPercent > 0.5 ? 'rgba(0, 255, 0, 0.8)' : healthPercent > 0.25 ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
                this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            }
            
            if (isEnhanced) {
                // Enhanced distraction design
                this.drawEnhancedDistraction(x, y, size, dist);
            } else {
                // Basic distraction design
                const distractionColor = this.getDistractionColor(dist.tier);
                this.ctx.fillStyle = distractionColor;
                this.ctx.strokeStyle = distractionColor;
                this.ctx.lineWidth = 2;
                
                // Draw diamond shape (rotated square)
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(Math.PI / 4); // Rotate 45 degrees
                this.ctx.beginPath();
                this.ctx.rect(-size / 2, -size / 2, size, size);
                this.ctx.fill();
                this.ctx.stroke();
                this.ctx.restore();
                
                // Draw distraction icon (X symbol) on top
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                this.ctx.font = `${size * 0.6}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('✗', x, y);
            }
        }
    }
    
    /**
     * Draw enhanced distraction design (Tier 3+)
     */
    drawEnhancedDistraction(x, y, size, dist) {
        const time = Date.now() * 0.001;
        const distractionColor = this.getDistractionColor(dist.tier);
        
        // Extract RGBA from color
        const colorMatch = distractionColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!colorMatch) return;
        
        const r = parseInt(colorMatch[1], 10);
        const g = parseInt(colorMatch[2], 10);
        const b = parseInt(colorMatch[3], 10);
        const a = colorMatch[4] ? parseFloat(colorMatch[4]) : 0.9;
        
        // Draw outer glow/pulse effect
        const pulse = 0.3 + Math.sin(time * 4) * 0.2;
        const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * pulse})`);
        glowGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * pulse * 0.5})`);
        glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw main shape with rotation animation
        const rotation = time * 0.5; // Slow rotation
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        // Draw shape based on tier
        const shapeType = this.getDistractionShape(dist.tier);
        
        if (shapeType === 'spike') {
            // Spike/star shape for higher tiers
            this.ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i;
                const outerRadius = size;
                const innerRadius = size * 0.5;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
            
            // Fill with gradient
            const fillGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            fillGradient.addColorStop(0, `rgba(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, ${a})`);
            fillGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);
            this.ctx.fillStyle = fillGradient;
            this.ctx.fill();
        } else if (shapeType === 'crystal') {
            // Crystal shape (diamond with facets)
            this.ctx.beginPath();
            // Top point
            this.ctx.moveTo(0, -size);
            // Right point
            this.ctx.lineTo(size * 0.7, 0);
            // Bottom point
            this.ctx.lineTo(0, size);
            // Left point
            this.ctx.lineTo(-size * 0.7, 0);
            this.ctx.closePath();
            
            const fillGradient = this.ctx.createLinearGradient(-size, -size, size, size);
            fillGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.8})`);
            fillGradient.addColorStop(0.5, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${a})`);
            fillGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a * 0.8})`);
            this.ctx.fillStyle = fillGradient;
            this.ctx.fill();
            
            // Draw facets
            this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.6})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(size * 0.35, 0);
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(-size * 0.35, 0);
            this.ctx.stroke();
        } else {
            // Diamond shape (rotated square) for basic tiers
            this.ctx.beginPath();
            this.ctx.rect(-size / 2, -size / 2, size, size);
            
            const fillGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            fillGradient.addColorStop(0, `rgba(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)}, ${a})`);
            fillGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a})`);
            this.ctx.fillStyle = fillGradient;
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Draw animated border
        const pulseBorder = 0.7 + Math.sin(time * 5) * 0.3;
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * pulseBorder})`;
        this.ctx.lineWidth = 2;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        if (shapeType === 'spike') {
            this.ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i;
                const radius = i % 2 === 0 ? size : size * 0.5;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
            }
            this.ctx.closePath();
        } else if (shapeType === 'crystal') {
            this.ctx.beginPath();
            this.ctx.moveTo(0, -size);
            this.ctx.lineTo(size * 0.7, 0);
            this.ctx.lineTo(0, size);
            this.ctx.lineTo(-size * 0.7, 0);
            this.ctx.closePath();
        } else {
            this.ctx.beginPath();
            this.ctx.rect(-size / 2, -size / 2, size, size);
        }
        this.ctx.stroke();
        this.ctx.restore();
        
        // Draw distraction icon with pulsing effect
        const iconPulse = 0.9 + Math.sin(time * 3) * 0.1;
        const icon = this.getDistractionIcon(dist.tier);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${iconPulse})`;
        this.ctx.font = `bold ${size * 0.7}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(icon, x, y);
    }
    
    /**
     * Get distraction shape type for enhanced rendering
     */
    getDistractionShape(tier) {
        if (tier >= 3) return 'spike';
        if (tier >= 2) return 'crystal';
        return 'diamond';
    }
    
    /**
     * Get distraction icon
     */
    getDistractionIcon(tier) {
        const icons = {
            0: '✗',
            1: '⚠',
            2: '⚡',
            3: '☠',
            4: '💀'
        };
        return icons[tier] || '✗';
    }
    
    /**
     * Get distraction color (different from tower colors - red/orange theme)
     */
    getDistractionColor(tier) {
        // Use red/orange color scheme to distinguish from towers
        const colors = {
            0: 'rgba(255, 100, 100, 0.9)',   // Red
            1: 'rgba(255, 150, 50, 0.9)',    // Orange
            2: 'rgba(255, 200, 0, 0.9)',     // Amber/Yellow-orange
            3: 'rgba(255, 100, 150, 0.9)',   // Pink-red
            4: 'rgba(200, 50, 50, 0.9)'      // Dark red
        };
        return colors[tier] || colors[0];
    }
    
    /**
     * Draw tower attacks
     */
    drawTowerAttacks(delta) {
        const designTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        const isEnhanced = designTier >= 3;
        
        for (let i = this.towerAttacks.length - 1; i >= 0; i--) {
            const attack = this.towerAttacks[i];
            attack.progress += delta * 3; // Speed
            
            // Play sound when projectile is about to hit (at 85% progress)
            // This "splits the difference" - sound can be quantized, but we sync visual timing
            if (!attack.soundPlayed && attack.progress >= 0.85) {
                // Calculate when the projectile will actually hit (in seconds)
                const projectileSpeed = 3.0; // matches delta * 3
                const remainingProgress = 1.0 - attack.progress;
                const timeUntilHit = remainingProgress / projectileSpeed; // Time in seconds until hit
                
                // Play sound with timing that accounts for quantization
                if (window.audioSystem && window.audioSystem.playSound) {
                    const musicIsPlaying = window.audioSystem.musicEnabled && 
                                         window.audioSystem.toneMusic && 
                                         typeof Tone !== 'undefined' &&
                                         Tone.Transport.state === 'started';
                    
                    if (musicIsPlaying && typeof Tone !== 'undefined') {
                        // Calculate next quantized time (16th note quantization for tighter sync)
                        const subdivision = '16n';
                        const subdivisionTime = Tone.Time(subdivision).toSeconds();
                        const now = Tone.Transport.seconds;
                        const currentBeat = Math.floor(now / subdivisionTime);
                        const nextBeat = (currentBeat + 1) * subdivisionTime;
                        const quantizedDelay = Math.max(0, nextBeat - now); // Delay in seconds
                        
                        // If quantization delay is reasonable (< 0.15s) and close to hit time, use it
                        // Otherwise play immediately to stay in sync with visual
                        if (quantizedDelay > 0 && quantizedDelay < 0.15 && Math.abs(quantizedDelay - timeUntilHit) < 0.1) {
                            // Quantized time is close to visual hit time - use quantization
                            // Slightly adjust visual timing to match quantized sound
                            const timeDifference = quantizedDelay - timeUntilHit;
                            if (timeDifference > 0) {
                                // Sound will play slightly after visual hit - slow down projectile slightly
                                attack.progress -= timeDifference * projectileSpeed * 0.3; // Gentle adjustment
                            } else {
                                // Sound will play slightly before visual hit - speed up projectile slightly
                                attack.progress -= timeDifference * projectileSpeed * 0.3; // Gentle adjustment
                            }
                            
                            // Play sound at quantized time (will be scheduled by playToneSound)
                            // Lower volume in meditation mode to blend with music (0.15 instead of 0.2)
                            window.audioSystem.playSound('tower_attack', { volume: 0.15, skipQuantization: false });
                        } else {
                            // Quantization delay too long or not close to hit time - play immediately
                            // Lower volume in meditation mode to blend with music (0.15 instead of 0.2)
                            window.audioSystem.playSound('tower_attack', { volume: 0.15, skipQuantization: true });
                        }
                    } else {
                        // No music playing, play immediately when projectile hits
                        // Use normal volume when no music is playing
                        window.audioSystem.playSound('tower_attack', { volume: 0.2, skipQuantization: true });
                    }
                }
                
                attack.soundPlayed = true;
            }
            
            if (attack.progress >= 1.0) {
                // Projectile reached target - add impact effect
                if (attack.targetX !== undefined && attack.targetY !== undefined) {
                    this.addImpactEffect(attack.targetX, attack.targetY);
                }
                this.towerAttacks.splice(i, 1);
                continue;
            }
            
            // Calculate current position
            const x = attack.fromX + (attack.toX - attack.fromX) * attack.progress;
            const y = attack.fromY + (attack.toY - attack.fromY) * attack.progress;
            
            if (isEnhanced) {
                // Enhanced attack visuals with trail and glow
                // Draw trail
                const trailGradient = this.ctx.createLinearGradient(
                    x - (attack.toX - attack.fromX) * 0.1,
                    y - (attack.toY - attack.fromY) * 0.1,
                    x, y
                );
                trailGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
                trailGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.4)');
                trailGradient.addColorStop(1, 'rgba(0, 255, 255, 0.8)');
                
                this.ctx.strokeStyle = trailGradient;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(attack.fromX, attack.fromY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                
                // Draw main attack line with glow
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(attack.fromX, attack.fromY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
                
                // Draw enhanced projectile with pulsing glow
                const time = Date.now() * 0.001;
                const pulse = 0.8 + Math.sin(time * 8 + attack.progress * 10) * 0.2;
                const projectileSize = 4 + pulse;
                
                // Outer glow
                const projectileGradient = this.ctx.createRadialGradient(x, y, 0, x, y, projectileSize * 2);
                projectileGradient.addColorStop(0, `rgba(0, 255, 255, ${0.6 * pulse})`);
                projectileGradient.addColorStop(0.5, `rgba(0, 200, 255, ${0.3 * pulse})`);
                projectileGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                this.ctx.fillStyle = projectileGradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, projectileSize * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Main projectile
                this.ctx.fillStyle = `rgba(0, 255, 255, ${0.9 * pulse})`;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = 'rgba(0, 255, 255, 0.9)';
                this.ctx.beginPath();
                this.ctx.arc(x, y, projectileSize, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                
                // Inner core
                this.ctx.fillStyle = MEDITATION_COLORS.TEXT_WHITE;
                this.ctx.beginPath();
                this.ctx.arc(x, y, projectileSize * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Basic attack visuals
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(attack.fromX, attack.fromY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                
                // Draw attack projectile
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.9)';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    /**
     * Draw impact effects when projectiles hit distractions
     */
    drawImpactEffects(delta) {
        const designTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        const isEnhanced = designTier >= 3;
        
        for (let i = this.impactEffects.length - 1; i >= 0; i--) {
            const effect = this.impactEffects[i];
            effect.time += delta;
            
            if (effect.time >= 0.3) {
                // Effect duration: 0.3 seconds
                this.impactEffects.splice(i, 1);
                continue;
            }
            
            const progress = effect.time / 0.3; // 0 to 1
            const alpha = 1.0 - progress; // Fade out
            
            if (isEnhanced) {
                // Enhanced impact effect with expanding rings and particles
                // Draw expanding rings
                const ringCount = 3;
                for (let ring = 0; ring < ringCount; ring++) {
                    const ringProgress = (progress + ring * 0.2) % 1.0;
                    const ringSize = (10 + ring * 5) * (1.0 + ringProgress * 2.0);
                    const ringAlpha = alpha * (1.0 - ringProgress) * 0.6;
                    
                    this.ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(effect.x, effect.y, ringSize, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                // Draw central impact flash
                const flashSize = 8 * (1.0 - progress);
                const flashGradient = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, flashSize);
                flashGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
                flashGradient.addColorStop(0.5, `rgba(0, 255, 255, ${alpha * 0.6})`);
                flashGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                
                this.ctx.fillStyle = flashGradient;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, flashSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw particles (small sparks)
                const particleCount = 8;
                for (let p = 0; p < particleCount; p++) {
                    const angle = (Math.PI * 2 / particleCount) * p;
                    const particleDist = 15 * progress;
                    const particleX = effect.x + Math.cos(angle) * particleDist;
                    const particleY = effect.y + Math.sin(angle) * particleDist;
                    const particleSize = 3 * (1.0 - progress);
                    
                    this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.8})`;
                    this.ctx.beginPath();
                    this.ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else {
                // Basic impact effect
                const impactSize = 8 * (1.0 - progress);
                this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.8})`;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, impactSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw expanding ring
                const ringSize = 15 * progress;
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, ringSize, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }
    
    /**
     * Add impact effect when projectile hits distraction
     */
    addImpactEffect(x, y) {
        this.impactEffects.push({
            x: x,
            y: y,
            time: 0,
            type: 'hit'
        });
    }
    
    /**
     * Draw damage numbers
     */
    drawDamageNumbers(delta) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const damage = this.damageNumbers[i];
            damage.time += delta;
            
            if (damage.time >= 1.0) {
                this.damageNumbers.splice(i, 1);
                continue;
            }
            
            // Fade out
            const alpha = 1.0 - damage.time;
            const y = damage.y - (damage.time * 20);
            
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`-${Math.floor(damage.damage)}`, damage.x, y);
        }
    }
    
    /**
     * Add damage number
     */
    addDamageNumber(x, y, damage) {
        this.damageNumbers.push({
            x: x,
            y: y,
            damage: damage,
            time: 0
        });
    }
    
    /**
     * Add tower attack visual
     */
    addTowerAttack(fromX, fromY, toX, toY) {
        // Calculate projectile travel time (projectile speed is delta * 3, so it takes 1/3 seconds)
        const projectileSpeed = 3.0; // matches delta * 3 in drawTowerAttacks
        const travelTime = 1.0 / projectileSpeed; // Time in seconds for projectile to reach target
        
        this.towerAttacks.push({
            fromX: fromX * this.cellSize,
            fromY: fromY * this.cellSize,
            toX: toX * this.cellSize,
            toY: toY * this.cellSize,
            progress: 0,
            // Store target position for impact effect
            targetX: toX * this.cellSize,
            targetY: toY * this.cellSize,
            // Store timing info for sound sync
            startTime: Date.now(),
            travelTime: travelTime,
            soundPlayed: false // Track if sound has been played for this projectile
        });
    }
    
    /**
     * Get tower color based on tower type
     */
    getTowerColor(towerId) {
        const colors = {
            'peace_circle': 'rgba(255, 255, 255, 0.8)',      // White
            'focus_ring': 'rgba(0, 255, 255, 0.8)',          // Cyan
            'tranquility_shrine': 'rgba(255, 16, 240, 0.8)', // Pink
            'zen_pavilion': 'rgba(57, 255, 20, 0.8)'         // Green
        };
        return colors[towerId] || colors['peace_circle'];
    }
}
