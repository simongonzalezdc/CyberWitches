/**
 * Lazy Asset Loading System
 * Implements lazy loading for images and other assets
 */

class LazyAssetLoadingManager {
    constructor() {
        this.loadedAssets = new Set();
        this.loadingAssets = new Set();
        this.init();
    }
    
    init() {
        // Set up Intersection Observer for lazy loading
        this.setupIntersectionObserver();
        
        // Lazy load images
        this.lazyLoadImages();
    }
    
    /**
     * Set up Intersection Observer for lazy loading
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px' // Start loading 50px before image enters viewport
            });
            
            // Observe all lazy images
            document.querySelectorAll('img[data-lazy]').forEach(img => {
                observer.observe(img);
            });
        }
    }
    
    /**
     * Lazy load images
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-lazy]');
        images.forEach(img => {
            // Set placeholder
            if (!img.src) {
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
            }
        });
    }
    
    /**
     * Load image
     * @param {HTMLImageElement} img - Image element
     */
    loadImage(img) {
        const src = img.getAttribute('data-lazy');
        if (!src || this.loadedAssets.has(src)) {
            return;
        }
        
        if (this.loadingAssets.has(src)) {
            return; // Already loading
        }
        
        this.loadingAssets.add(src);
        
        const imageLoader = new Image();
        imageLoader.onload = () => {
            img.src = src;
            img.removeAttribute('data-lazy');
            this.loadedAssets.add(src);
            this.loadingAssets.delete(src);
        };
        
        imageLoader.onerror = () => {
            console.error('Failed to load image:', src);
            this.loadingAssets.delete(src);
        };
        
        imageLoader.src = src;
    }
    
    /**
     * Preload asset
     * @param {string} url - Asset URL
     * @param {string} type - Asset type ('image', 'script', 'style')
     */
    preloadAsset(url, type = 'image') {
        if (this.loadedAssets.has(url)) {
            return Promise.resolve();
        }
        
        if (this.loadingAssets.has(url)) {
            return new Promise((resolve) => {
                const checkLoaded = setInterval(() => {
                    if (this.loadedAssets.has(url)) {
                        clearInterval(checkLoaded);
                        resolve();
                    }
                }, 100);
            });
        }
        
        this.loadingAssets.add(url);
        
        return new Promise((resolve, reject) => {
            if (type === 'image') {
                const img = new Image();
                img.onload = () => {
                    this.loadedAssets.add(url);
                    this.loadingAssets.delete(url);
                    resolve();
                };
                img.onerror = () => {
                    this.loadingAssets.delete(url);
                    reject(new Error(`Failed to load image: ${url}`));
                };
                img.src = url;
            } else if (type === 'script') {
                const script = document.createElement('script');
                script.src = url;
                script.onload = () => {
                    this.loadedAssets.add(url);
                    this.loadingAssets.delete(url);
                    resolve();
                };
                script.onerror = () => {
                    this.loadingAssets.delete(url);
                    reject(new Error(`Failed to load script: ${url}`));
                };
                document.head.appendChild(script);
            } else if (type === 'style') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = url;
                link.onload = () => {
                    this.loadedAssets.add(url);
                    this.loadingAssets.delete(url);
                    resolve();
                };
                link.onerror = () => {
                    this.loadingAssets.delete(url);
                    reject(new Error(`Failed to load stylesheet: ${url}`));
                };
                document.head.appendChild(link);
            }
        });
    }
}

// Create global instance
const lazyAssetLoadingManager = new LazyAssetLoadingManager();

// Global functions for compatibility
window.preloadAsset = (url, type) => {
    return lazyAssetLoadingManager.preloadAsset(url, type);
};

export default lazyAssetLoadingManager;

