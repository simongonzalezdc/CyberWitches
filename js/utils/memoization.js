/**
 * Memoization Utilities
 * LRU cache-based memoization for expensive calculations
 * 
 * Week 3, Day 1-2 Optimization
 */

/**
 * LRU Cache implementation
 */
class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    /**
     * Get value from cache
     * @param {*} key - Cache key
     * @returns {*} Cached value or undefined
     */
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        
        return value;
    }
    
    /**
     * Set value in cache
     * @param {*} key - Cache key
     * @param {*} value - Value to cache
     */
    set(key, value) {
        // If key exists, remove it first
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        // If cache is full, remove least recently used (first item)
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        // Add to end
        this.cache.set(key, value);
    }
    
    /**
     * Check if key exists in cache
     * @param {*} key - Cache key
     * @returns {boolean} True if exists
     */
    has(key) {
        return this.cache.has(key);
    }
    
    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
    }
    
    /**
     * Get cache size
     * @returns {number} Current cache size
     */
    get size() {
        return this.cache.size;
    }
}

/**
 * Memoize a function with LRU cache
 * @param {Function} fn - Function to memoize
 * @param {Object} [options] - Options
 * @param {Function} [options.keyFn] - Function to generate cache key from arguments
 * @param {number} [options.maxSize] - Maximum cache size (default: 100)
 * @returns {Function} Memoized function
 */
export function memoize(fn, options = {}) {
    if (typeof fn !== 'function') {
        throw new Error('memoize: First argument must be a function');
    }
    
    const {
        keyFn = null,
        maxSize = 100
    } = options;
    
    const cache = new LRUCache(maxSize);
    
    const memoized = function(...args) {
        // Generate cache key
        let key;
        if (keyFn) {
            key = keyFn(...args);
        } else {
            // Default: JSON.stringify (works for primitive types and simple objects)
            try {
                key = JSON.stringify(args);
            } catch (_error) {
                // Fallback: use first argument as key if JSON.stringify fails
                key = args[0];
            }
        }
        
        // Check cache
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        // Compute value
        const value = fn.apply(this, args);
        
        // Cache result
        cache.set(key, value);
        
        return value;
    };
    
    // Expose cache for debugging
    memoized.cache = cache;
    memoized.clearCache = () => cache.clear();
    
    return memoized;
}

/**
 * Memoize async function
 * @param {Function} asyncFn - Async function to memoize
 * @param {Object} options - Options
 * @returns {Function} Memoized async function
 */
export function memoizeAsync(asyncFn, options = {}) {
    if (typeof asyncFn !== 'function') {
        throw new Error('memoizeAsync: First argument must be a function');
    }
    
    const {
        keyFn = null,
        maxSize = 100,
        ttl = null // Time to live in milliseconds
    } = options;
    
    const cache = new LRUCache(maxSize);
    const timestamps = new Map();
    
    const memoized = async function(...args) {
        // Generate cache key
        let key;
        if (keyFn) {
            key = keyFn(...args);
        } else {
            try {
                key = JSON.stringify(args);
            } catch (_error) {
                key = args[0];
            }
        }
        
        // Check cache and TTL
        if (cache.has(key)) {
            if (ttl) {
                const timestamp = timestamps.get(key);
                if (timestamp && Date.now() - timestamp < ttl) {
                    return cache.get(key);
                } else {
                    // Expired, remove
                    cache.cache.delete(key);
                    timestamps.delete(key);
                }
            } else {
                return cache.get(key);
            }
        }
        
        // Compute value
        const value = await asyncFn.apply(this, args);
        
        // Cache result
        cache.set(key, value);
        if (ttl) {
            timestamps.set(key, Date.now());
        }
        
        return value;
    };
    
    memoized.cache = cache;
    memoized.clearCache = () => {
        cache.clear();
        timestamps.clear();
    };
    
    return memoized;
}

/**
 * Create a memoized version of a function with custom key generator
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Key generator function
 * @param {number} maxSize - Maximum cache size
 * @returns {Function} Memoized function
 */
export function memoizeWithKey(fn, keyFn, maxSize = 100) {
    return memoize(fn, { keyFn, maxSize });
}

