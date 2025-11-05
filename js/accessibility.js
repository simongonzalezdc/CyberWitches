/**
 * Accessibility Module for Cyber Witches
 * Handles screen reader announcements, keyboard navigation, and accessibility features
 */

// Screen reader announcement system
class ScreenReaderAnnouncer {
    constructor() {
        this.announcer = null;
        this.announcementQueue = [];
        this.isAnnouncing = false;
        this.init();
    }
    
    init() {
        // Create hidden announcer element
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.setAttribute('class', 'sr-only');
        this.announcer.style.position = 'absolute';
        this.announcer.style.left = '-10000px';
        this.announcer.style.width = '1px';
        this.announcer.style.height = '1px';
        this.announcer.style.overflow = 'hidden';
        document.body.appendChild(this.announcer);
    }
    
    announce(message, priority = 'normal') {
        if (!this.announcer) return;
        
        this.announcementQueue.push({ message, priority });
        
        if (!this.isAnnouncing) {
            this.processQueue();
        }
    }
    
    processQueue() {
        if (this.announcementQueue.length === 0) {
            this.isAnnouncing = false;
            return;
        }
        
        this.isAnnouncing = true;
        
        // Sort by priority (high > normal > low)
        this.announcementQueue.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        const { message } = this.announcementQueue.shift();
        
        // Clear current content
        this.announcer.textContent = '';
        
        // Add new message with slight delay for screen readers to detect change
        setTimeout(() => {
            this.announcer.textContent = message;
            
            // Process next announcement after this one is read
            setTimeout(() => {
                this.processQueue();
            }, 100);
        }, 50);
    }
    
    announceResourceGain(resource, amount) {
        this.announce(`Gained ${amount} ${resource}`, 'normal');
    }
    
    announceAchievement(achievementName) {
        this.announce(`Achievement unlocked: ${achievementName}`, 'high');
    }
    
    announceLevelUp(level) {
        this.announce(`Level up! You are now level ${level}`, 'high');
    }
    
    announceTabChange(tabName) {
        this.announce(`Switched to ${tabName} tab`, 'normal');
    }
    
    announceError(errorMessage) {
        this.announce(`Error: ${errorMessage}`, 'high');
    }
}

// Keyboard navigation manager
class KeyboardNavigationManager {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.trapElement = null;
        this.previousFocus = null;
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
    }
    
    handleKeyDown(e) {
        switch (e.key) {
            case 'Tab':
                this.handleTabNavigation(e);
                break;
            case 'Escape':
                this.handleEscape(e);
                break;
            case 'Enter':
            case ' ':
                this.handleActivation(e);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleArrowNavigation(e);
                break;
            case 'Home':
            case 'End':
                this.handleHomeEnd(e);
                break;
        }
    }
    
    handleTabNavigation(e) {
        // Let browser handle tab navigation by default
        // But we add custom behavior for specific scenarios
        setTimeout(() => {
            this.updateFocusIndicator();
        }, 0);
    }
    
    handleEscape(e) {
        // Close modals or exit focus traps
        if (this.trapElement) {
            this.releaseFocusTrap();
            e.preventDefault();
        } else {
            // Try to close any open modals
            const modals = document.querySelectorAll('.modal.active');
            if (modals.length > 0) {
                modals[0].classList.remove('active');
                e.preventDefault();
            }
        }
    }
    
    handleActivation(e) {
        const target = e.target;
        
        // Handle space key on buttons that don't normally support it
        if (e.key === ' ' && target.tagName === 'BUTTON') {
            e.preventDefault();
            target.click();
        }
        
        // Handle activation on custom interactive elements
        if (target.classList.contains('card') || target.classList.contains('tab-button')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                target.click();
            }
        }
    }
    
    handleArrowNavigation(e) {
        const target = e.target;
        
        // Arrow navigation for tabs
        if (target.classList.contains('tab-button')) {
            e.preventDefault();
            this.navigateTabs(e.key);
        }
        
        // Arrow navigation for card lists
        if (target.closest('.scroll-container')) {
            e.preventDefault();
            this.navigateCards(e.key, target.closest('.scroll-container'));
        }
    }
    
    handleHomeEnd(e) {
        const target = e.target;
        
        if (target.classList.contains('tab-button')) {
            e.preventDefault();
            const tabs = Array.from(document.querySelectorAll('.tab-button'));
            const targetTab = e.key === 'Home' ? tabs[0] : tabs[tabs.length - 1];
            if (targetTab) {
                targetTab.focus();
            }
        }
    }
    
    handleFocusIn(e) {
        this.updateFocusIndicator();
        
        // Announce focus changes for screen readers
        const target = e.target;
        if (target.classList.contains('tab-button')) {
            screenReaderAnnouncer.announceTabChange(target.textContent.trim());
        }
    }
    
    navigateTabs(direction) {
        const tabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = tabs.findIndex(tab => tab === document.activeElement);
        
        let nextIndex;
        if (direction === 'ArrowLeft' || direction === 'ArrowUp') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
            nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (tabs[nextIndex]) {
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
        }
    }
    
    navigateCards(direction, container) {
        const cards = Array.from(container.querySelectorAll('.card, .primary-button, .secondary-button'));
        const currentIndex = cards.findIndex(card => card.contains(document.activeElement));
        
        let nextIndex;
        if (direction === 'ArrowUp' || direction === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        } else {
            nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (cards[nextIndex]) {
            cards[nextIndex].focus();
        }
    }
    
    createFocusTrap(element) {
        this.trapElement = element;
        this.previousFocus = document.activeElement;
        
        // Get all focusable elements within the trap
        this.focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // Focus first element
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
        }
    }
    
    releaseFocusTrap() {
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
        
        this.trapElement = null;
        this.focusableElements = [];
        this.previousFocus = null;
    }
    
    updateFocusIndicator() {
        // Remove existing focus indicators
        document.querySelectorAll('.keyboard-focus-indicator').forEach(el => {
            el.classList.remove('keyboard-focus-indicator');
        });
        
        // Add focus indicator to current element
        if (document.activeElement) {
            document.activeElement.classList.add('keyboard-focus-indicator');
        }
    }
}

// High contrast mode manager
class HighContrastManager {
    constructor() {
        this.isHighContrast = false;
        this.init();
    }
    
    init() {
        // Check for high contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            this.enableHighContrast();
        }
        
        // Listen for changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
                if (e.matches) {
                    this.enableHighContrast();
                } else {
                    this.disableHighContrast();
                }
            });
        }
        
        // Add keyboard shortcut for high contrast toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'h') {
                e.preventDefault();
                this.toggleHighContrast();
            }
        });
    }
    
    enableHighContrast() {
        this.isHighContrast = true;
        document.body.classList.add('high-contrast-mode');
        
        // Update CSS variables for high contrast
        document.documentElement.style.setProperty('--primary', '#FFFFFF');
        document.documentElement.style.setProperty('--secondary', '#FFFF00');
        document.documentElement.style.setProperty('--accent', '#00FF00');
        document.documentElement.style.setProperty('--success', '#00FFFF');
        document.documentElement.style.setProperty('--mystical', '#FF00FF');
        document.documentElement.style.setProperty('--bg-dark', '#000000');
        document.documentElement.style.setProperty('--text', '#FFFFFF');
        document.documentElement.style.setProperty('--text-dim', '#CCCCCC');
        
        screenReaderAnnouncer.announce('High contrast mode enabled', 'normal');
    }
    
    disableHighContrast() {
        this.isHighContrast = false;
        document.body.classList.remove('high-contrast-mode');
        
        // Reset CSS variables to defaults
        document.documentElement.style.setProperty('--primary', '#FF2DAA');
        document.documentElement.style.setProperty('--secondary', '#22E3FF');
        document.documentElement.style.setProperty('--accent', '#FFDB6E');
        document.documentElement.style.setProperty('--success', '#3CE3C5');
        document.documentElement.style.setProperty('--mystical', '#C9A0FF');
        document.documentElement.style.setProperty('--bg-dark', '#0E0E12');
        document.documentElement.style.setProperty('--text', '#FFFFFF');
        document.documentElement.style.setProperty('--text-dim', '#AAAAAA');
        
        screenReaderAnnouncer.announce('High contrast mode disabled', 'normal');
    }
    
    toggleHighContrast() {
        if (this.isHighContrast) {
            this.disableHighContrast();
        } else {
            this.enableHighContrast();
        }
    }
}

// Text scaling manager
class TextScalingManager {
    constructor() {
        this.currentScale = 1.0;
        this.minScale = 0.8;
        this.maxScale = 2.0;
        this.init();
    }
    
    init() {
        // Check for reduced motion preference
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // Add keyboard shortcuts for text scaling
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '=':
                    case '+':
                        e.preventDefault();
                        this.increaseTextScale();
                        break;
                    case '-':
                    case '_':
                        e.preventDefault();
                        this.decreaseTextScale();
                        break;
                    case '0':
                        e.preventDefault();
                        this.resetTextScale();
                        break;
                }
            }
        });
    }
    
    increaseTextScale() {
        if (this.currentScale < this.maxScale) {
            this.currentScale = Math.min(this.currentScale + 0.1, this.maxScale);
            this.applyTextScale();
            screenReaderAnnouncer.announce(`Text size increased to ${Math.round(this.currentScale * 100)}%`, 'normal');
        }
    }
    
    decreaseTextScale() {
        if (this.currentScale > this.minScale) {
            this.currentScale = Math.max(this.currentScale - 0.1, this.minScale);
            this.applyTextScale();
            screenReaderAnnouncer.announce(`Text size decreased to ${Math.round(this.currentScale * 100)}%`, 'normal');
        }
    }
    
    resetTextScale() {
        this.currentScale = 1.0;
        this.applyTextScale();
        screenReaderAnnouncer.announce('Text size reset to 100%', 'normal');
    }
    
    applyTextScale() {
        document.documentElement.style.fontSize = `${this.currentScale}rem`;
        
        // Update root font size for rem-based scaling
        const rootFontSize = 16 * this.currentScale;
        document.documentElement.style.setProperty('--root-font-size', `${rootFontSize}px`);
    }
}

// Color blind friendly themes
class ColorBlindThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themes = {
            default: {
                primary: '#FF2DAA',
                secondary: '#22E3FF',
                accent: '#FFDB6E',
                success: '#3CE3C5',
                mystical: '#C9A0FF'
            },
            protanopia: {
                primary: '#0066CC',
                secondary: '#FF9900',
                accent: '#FFFF00',
                success: '#00CC66',
                mystical: '#9933CC'
            },
            deuteranopia: {
                primary: '#0066CC',
                secondary: '#FF9900',
                accent: '#FFFF00',
                success: '#00CC66',
                mystical: '#9933CC'
            },
            tritanopia: {
                primary: '#CC0066',
                secondary: '#00CCFF',
                accent: '#FFFF00',
                success: '#00CC66',
                mystical: '#CC00CC'
            }
        };
        this.init();
    }
    
    init() {
        // Add keyboard shortcuts for color blind themes
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.setTheme('default');
                        break;
                    case '2':
                        e.preventDefault();
                        this.setTheme('protanopia');
                        break;
                    case '3':
                        e.preventDefault();
                        this.setTheme('deuteranopia');
                        break;
                    case '4':
                        e.preventDefault();
                        this.setTheme('tritanopia');
                        break;
                }
            }
        });
    }
    
    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        // Update CSS variables
        Object.entries(theme).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
        });
        
        document.body.className = document.body.className.replace(/color-blind-\w+/g, '');
        if (themeName !== 'default') {
            document.body.classList.add(`color-blind-${themeName}`);
        }
        
        screenReaderAnnouncer.announce(`Color blind theme changed to ${themeName}`, 'normal');
    }
}

// Initialize accessibility features
const screenReaderAnnouncer = new ScreenReaderAnnouncer();
const keyboardNavigation = new KeyboardNavigationManager();
const highContrastManager = new HighContrastManager();
const textScalingManager = new TextScalingManager();
const colorBlindThemeManager = new ColorBlindThemeManager();

// Game-specific accessibility functions
function announceGameEvent(eventType, data) {
    switch (eventType) {
        case 'cast':
            screenReaderAnnouncer.announceResourceGain('Arcane Bits', data.amount || 1);
            break;
        case 'workstation_crafted':
            screenReaderAnnouncer.announce(`Crafted ${data.name} workstation`, 'normal');
            break;
        case 'upgrade_purchased':
            screenReaderAnnouncer.announce(`Purchased ${data.name} upgrade`, 'normal');
            break;
        case 'achievement_unlocked':
            screenReaderAnnouncer.announceAchievement(data.name);
            break;
        case 'level_up':
            screenReaderAnnouncer.announceLevelUp(data.level);
            break;
        case 'error':
            screenReaderAnnouncer.announceError(data.message);
            break;
    }
}

// Add ARIA labels to dynamic content
function addAriaLabels() {
    // Add labels to currency displays
    const abDisplay = document.getElementById('ab-display');
    if (abDisplay) {
        abDisplay.setAttribute('aria-label', 'Arcane Bits balance');
        abDisplay.setAttribute('role', 'status');
    }
    
    const abpsDisplay = document.getElementById('abps-display');
    if (abpsDisplay) {
        abpsDisplay.setAttribute('aria-label', 'Arcane Bits per second production rate');
        abpsDisplay.setAttribute('role', 'status');
    }
    
    // Add labels to progress bars
    document.querySelectorAll('.progress-bar').forEach(bar => {
        const fill = bar.querySelector('.progress-fill');
        if (fill) {
            const percentage = Math.round((parseFloat(fill.style.width) || 0));
            bar.setAttribute('aria-label', `Progress: ${percentage}%`);
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-valuenow', percentage);
            bar.setAttribute('aria-valuemin', 0);
            bar.setAttribute('aria-valuemax', 100);
        }
    });
    
    // Add labels to cards
    document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('.card-title');
        if (title) {
            card.setAttribute('aria-label', title.textContent.trim());
        }
    });
}

// Skip link functionality
function initSkipLinks() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
                
                // Announce to screen reader
                screenReaderAnnouncer.announce('Skipped to main content', 'normal');
            }
        });
        
        // Make skip link visible when focused
        skipLink.addEventListener('focus', () => {
            skipLink.style.opacity = '1';
            skipLink.style.transform = 'translateY(0)';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.opacity = '0';
            skipLink.style.transform = 'translateY(-100%)';
        });
    }
}

// Export for global access
window.Accessibility = {
    announceGameEvent,
    addAriaLabels,
    initSkipLinks,
    screenReaderAnnouncer,
    keyboardNavigation,
    highContrastManager,
    textScalingManager,
    colorBlindThemeManager
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addAriaLabels();
        initSkipLinks();
    });
} else {
    addAriaLabels();
    initSkipLinks();
}