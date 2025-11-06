import { MEDITATION_TOWERS, MEDITATION_DISTRACTIONS } from './data.js';

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
    }
    
    /**
     * Initialize canvas
     */
    init() {
        this.canvas = document.getElementById('meditation-canvas');
        if (!this.canvas) {
            console.error('Meditation canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Wait for container to be sized
        setTimeout(() => {
            // Set canvas size
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Start animation loop
            this.startAnimationLoop();
            
            // Force a render to ensure path is visible
            this.render();
            
            console.log('Meditation towers initialized, canvas size:', this.canvas.width, this.canvas.height, 'cell size:', this.cellSize);
            console.log('Path tiles count:', this.meditationState?.pathTiles?.size || 0);
        }, 100);
    }
    
    /**
     * Resize canvas
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Make canvas square, fit to container
        const size = Math.min(containerWidth, containerHeight) || 600; // Default to 600 if container not sized
        this.canvas.width = size;
        this.canvas.height = size;
        
        // Calculate cell size
        this.cellSize = size / this.meditationState.gridSize;
        
        console.log('Canvas resized:', size, 'cell size:', this.cellSize);
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
        
        // Click - place tower
        this.canvas.addEventListener('click', (e) => {
            if (!this.selectedTowerId) {
                return; // No tower selected, do nothing
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridX = Math.floor(x / this.cellSize);
            const gridY = Math.floor(y / this.cellSize);
            
            console.log('Canvas clicked at grid position:', gridX, gridY, 'Tower:', this.selectedTowerId);
            
            // Try to place tower
            if (this.meditationState && this.meditationState.placeTower(this.selectedTowerId, gridX, gridY)) {
                console.log('Tower placed successfully');
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
                console.log('Failed to place tower - invalid position or cannot afford');
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
     */
    startAnimationLoop() {
        const animate = () => {
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    /**
     * Stop animation loop
     */
    stopAnimationLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
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
        
        // Draw damage numbers
        this.drawDamageNumbers(delta);
    }
    
    /**
     * Draw grid background
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
        this.ctx.fillStyle = 'rgba(60, 227, 197, 0.25)'; // Increased opacity from 0.15 to 0.25
        
        for (const tileStr of this.meditationState.pathTiles) {
            const [x, y] = tileStr.split(',').map(Number);
            const pixelX = x * this.cellSize;
            const pixelY = y * this.cellSize;
            
            this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        }
        
        // Draw path borders for better visibility
        this.ctx.strokeStyle = 'rgba(60, 227, 197, 0.5)'; // Increased opacity from 0.3 to 0.5
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
        gradient.addColorStop(0, 'rgba(255, 45, 170, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 45, 170, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw center circle
        this.ctx.fillStyle = 'rgba(255, 45, 170, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = 'rgba(255, 45, 170, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * Draw towers
     */
    drawTowers() {
        for (const tower of this.meditationState.towers) {
            if (!tower || !tower.data) continue;
            
            const x = tower.x * this.cellSize;
            const y = tower.y * this.cellSize;
            const radius = this.cellSize * 0.3;
            
            // Draw tower range (if active)
            if (this.meditationState.activeSession && this.meditationState.waveActive) {
                const range = tower.data.range * this.cellSize;
                const rangeGradient = this.ctx.createRadialGradient(x, y, 0, x, y, range);
                rangeGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
                rangeGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
                
                this.ctx.fillStyle = rangeGradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, range, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw tower circle
            const tierColor = this.getTierColor(tower.data.tier);
            this.ctx.fillStyle = tierColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw tower border
            this.ctx.strokeStyle = tierColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw tower icon (simple symbol)
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.font = `${radius * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('○', x, y);
        }
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
        this.ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw preview border
        this.ctx.strokeStyle = canPlace ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw range preview
        const range = towerData.range * this.cellSize;
        this.ctx.strokeStyle = canPlace ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, range, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    /**
     * Draw distractions - different shape and color from towers
     */
    drawDistractions() {
        for (const dist of this.meditationState.distractions) {
            if (!dist) continue;
            
            const x = dist.x * this.cellSize;
            const y = dist.y * this.cellSize;
            const size = this.cellSize * 0.25; // Size for square/diamond
            
            // Draw health bar
            const healthPercent = dist.health / dist.maxHealth;
            const barWidth = this.cellSize * 0.6;
            const barHeight = 4;
            const barX = x - barWidth / 2;
            const barY = y - size - 10;
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Health
            this.ctx.fillStyle = healthPercent > 0.5 ? 'rgba(0, 255, 0, 0.8)' : healthPercent > 0.25 ? 'rgba(255, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
            this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // Draw distraction as a diamond/square shape (different from tower circles)
            // Use red/orange color scheme to distinguish from towers
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
        for (let i = this.towerAttacks.length - 1; i >= 0; i--) {
            const attack = this.towerAttacks[i];
            attack.progress += delta * 3; // Speed
            
            if (attack.progress >= 1.0) {
                this.towerAttacks.splice(i, 1);
                continue;
            }
            
            // Draw attack line
            const x = attack.fromX + (attack.toX - attack.fromX) * attack.progress;
            const y = attack.fromY + (attack.toY - attack.fromY) * attack.progress;
            
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
        this.towerAttacks.push({
            fromX: fromX * this.cellSize,
            fromY: fromY * this.cellSize,
            toX: toX * this.cellSize,
            toY: toY * this.cellSize,
            progress: 0
        });
    }
    
    /**
     * Get tier color
     */
    getTierColor(tier) {
        const colors = {
            0: 'rgba(255, 255, 255, 0.8)', // White
            1: 'rgba(255, 16, 240, 0.8)',  // Neon Pink
            2: 'rgba(255, 255, 0, 0.8)',   // Neon Yellow
            3: 'rgba(57, 255, 20, 0.8)',   // Neon Green
            4: 'rgba(0, 255, 255, 0.8)'    // Neon Cyan
        };
        return colors[tier] || colors[0];
    }
}

