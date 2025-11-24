/**
 * Object Pool Implementation
 * Reduces garbage collection pressure by reusing objects instead of creating new ones
 * 
 * Usage:
 *   const pool = new ObjectPool(() => ({ x: 0, y: 0, active: false }), 100);
 *   const obj = pool.acquire();
 *   // ... use obj ...
 *   pool.release(obj);
 */

export class ObjectPool {
    /**
     * Create a new object pool
     * @param {Function} factory - Function that creates new objects
     * @param {number} maxSize - Maximum pool size (default: 100)
     * @param {Function} reset - Optional function to reset object state before reuse
     */
    constructor(factory, maxSize = 100, reset = null) {
        if (typeof factory !== 'function') {
            throw new Error('ObjectPool: factory must be a function');
        }
        
        this.factory = factory;
        this.maxSize = maxSize;
        this.reset = reset || ((obj) => {
            // Default reset: set all properties to undefined/null
            if (typeof obj === 'object' && obj !== null) {
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'number') {
                        obj[key] = 0;
                    } else if (typeof obj[key] === 'boolean') {
                        obj[key] = false;
                    } else {
                        obj[key] = undefined;
                    }
                });
            }
        });
        
        this.pool = [];
        this.activeCount = 0;
    }
    
    /**
     * Acquire an object from the pool
     * @returns {*} Object from pool or newly created
     */
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
        } else {
            obj = this.factory();
        }
        
        this.activeCount++;
        return obj;
    }
    
    /**
     * Release an object back to the pool
     * @param {*} obj - Object to release
     */
    release(obj) {
        if (!obj) return;
        
        // Reset object state
        this.reset(obj);
        
        // Only add back to pool if under max size
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
        }
        
        this.activeCount--;
    }
    
    /**
     * Release multiple objects at once
     * @param {Array} objects - Array of objects to release
     */
    releaseAll(objects) {
        if (!Array.isArray(objects)) return;
        
        objects.forEach(obj => this.release(obj));
    }
    
    /**
     * Clear the pool
     */
    clear() {
        this.pool = [];
        this.activeCount = 0;
    }
    
    /**
     * Get pool statistics
     * @returns {Object} Pool statistics
     */
    getStats() {
        return {
            poolSize: this.pool.length,
            activeCount: this.activeCount,
            maxSize: this.maxSize,
            utilization: this.activeCount / (this.pool.length + this.activeCount) || 0
        };
    }
}

/**
 * Particle Pool - Specialized pool for particle objects
 */
export class ParticlePool extends ObjectPool {
    constructor(maxSize = 100) {
        super(() => ({
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 1,
            life: 0,
            maxLife: 1,
            opacity: 1,
            color: { r: 255, g: 255, b: 255 },
            active: false
        }), maxSize, (particle) => {
            // Reset particle to default state
            particle.x = 0;
            particle.y = 0;
            particle.vx = 0;
            particle.vy = 0;
            particle.size = 1;
            particle.life = 0;
            particle.maxLife = 1;
            particle.opacity = 1;
            particle.color = { r: 255, g: 255, b: 255 };
            particle.active = false;
        });
    }
    
    /**
     * Acquire and initialize a particle
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {Object} config - Particle configuration
     * @returns {Object} Initialized particle
     */
    acquireParticle(x, y, config = {}) {
        const particle = this.acquire();
        
        particle.x = x;
        particle.y = y;
        particle.vx = config.vx || (Math.random() * 2 - 1) * 0.5;
        particle.vy = config.vy || (Math.random() * 2 - 1) * 0.5;
        particle.size = config.size || Math.random() * 1.5 + 0.5;
        particle.life = config.life || 1.0;
        particle.maxLife = particle.life;
        particle.opacity = config.opacity || Math.random() * 0.5 + 0.3;
        particle.color = config.color || { r: 255, g: 255, b: 255 };
        particle.active = true;
        
        return particle;
    }
}

