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
        // Styles moved to CSS

        // Create mobile menu overlay
        const menuOverlay = document.createElement('div');
        menuOverlay.id = 'mobile-menu-overlay';
        menuOverlay.className = 'mobile-menu-overlay';
        // Styles moved to CSS

        // Clone tab buttons for mobile menu
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            const mobileBtn = btn.cloneNode(true);
            mobileBtn.classList.add('mobile-menu-btn');
            // Styles moved to CSS
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
        closeBtn.className = 'mobile-menu-close';
        // Styles moved to CSS
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
            const isOpen = overlay.classList.contains('active');
            if (isOpen) {
                overlay.classList.remove('active');
            } else {
                overlay.classList.add('active');
            }

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
            overlay.classList.remove('active');
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
        // CSS media queries handle display toggling now
        // Just need to close menu if switching to desktop
        if (!this.isMobile) {
            this.closeMobileMenu();
        }
    }
}

// Create global instance
const mobileNavigationManager = new MobileNavigationManager();

// Global functions for compatibility
// window.updateMobileNavigation removed as it is no longer needed with CSS media queries

export default mobileNavigationManager;

