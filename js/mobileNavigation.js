/**
 * Mobile Navigation System
 * Implements mobile-friendly navigation patterns
 */

class MobileNavigationManager {
    constructor() {
        this.isMobile = false;
        this.hamburgerMenu = null;
        this.init();
    }
    
    init() {
        // Detect mobile device
        this.isMobile = window.innerWidth <= 768;
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.updateNavigation();
            }
        });
        
        // Set up mobile navigation
        this.setupMobileNavigation();
    }
    
    /**
     * Set up mobile navigation
     */
    setupMobileNavigation() {
        if (this.isMobile) {
            this.createHamburgerMenu();
            this.makeSidebarCollapsible();
            this.optimizeHUDForMobile();
        }
    }
    
    /**
     * Create hamburger menu for mobile
     */
    createHamburgerMenu() {
        const tabsNav = document.querySelector('.tabs-nav');
        if (!tabsNav) return;
        
        // Check if hamburger menu already exists
        if (document.getElementById('mobile-hamburger-menu')) {
            return;
        }
        
        // Create hamburger button
        const hamburger = document.createElement('button');
        hamburger.id = 'mobile-hamburger-menu';
        hamburger.className = 'mobile-hamburger';
        hamburger.innerHTML = '☰';
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.style.cssText = `
            display: none;
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            width: 44px;
            height: 44px;
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-size: 24px;
            cursor: pointer;
        `;
        
        // Create mobile menu overlay
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'mobile-menu-overlay';
        menuOverlay.className = 'mobile-menu-overlay';
        menuOverlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        `;
        
        // Clone tab buttons for mobile menu
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            const mobileBtn = btn.cloneNode(true);
            mobileBtn.style.cssText = `
                width: 80%;
                max-width: 300px;
                padding: 20px;
                font-size: 20px;
                min-height: 60px;
            `;
            mobileBtn.addEventListener('click', () => {
                const tabName = mobileBtn.getAttribute('data-tab');
                if (window.switchTab) {
                    window.switchTab(tabName);
                }
                this.closeMobileMenu();
            });
            menuOverlay.appendChild(mobileBtn);
        });
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-size: 24px;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', () => this.closeMobileMenu());
        menuOverlay.appendChild(closeBtn);
        
        document.body.appendChild(hamburger);
        document.body.appendChild(menuOverlay);
        
        // Toggle menu
        hamburger.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Close on overlay click
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) {
                this.closeMobileMenu();
            }
        });
        
        this.hamburgerMenu = hamburger;
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            const isOpen = overlay.style.display === 'flex';
            overlay.style.display = isOpen ? 'none' : 'flex';
            
            // Trap focus in menu
            if (!isOpen && accessibilityManager) {
                accessibilityManager.trapFocus(overlay);
            }
        }
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const overlay = document.getElementById('mobile-menu-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    /**
     * Make sidebar collapsible on mobile
     */
    makeSidebarCollapsible() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // Collapse by default on mobile
            if (this.isMobile) {
                sidebar.classList.add('collapsed');
            }
        }
    }
    
    /**
     * Optimize HUD for mobile
     */
    optimizeHUDForMobile() {
        const hud = document.querySelector('.hud');
        if (hud && this.isMobile) {
            // Could add mobile-specific HUD optimizations here
        }
    }
    
    /**
     * Update navigation based on screen size
     */
    updateNavigation() {
        const hamburger = document.getElementById('mobile-hamburger-menu');
        const tabsNav = document.querySelector('.tabs-nav');
        
        if (this.isMobile) {
            // Show hamburger, hide tabs
            if (hamburger) {
                hamburger.style.display = 'block';
            }
            if (tabsNav) {
                tabsNav.style.display = 'none';
            }
        } else {
            // Hide hamburger, show tabs
            if (hamburger) {
                hamburger.style.display = 'none';
            }
            if (tabsNav) {
                tabsNav.style.display = 'flex';
            }
            this.closeMobileMenu();
        }
    }
}

// Create global instance
const mobileNavigationManager = new MobileNavigationManager();

// Global functions for compatibility
window.updateMobileNavigation = () => {
    mobileNavigationManager.updateNavigation();
};

export default mobileNavigationManager;

