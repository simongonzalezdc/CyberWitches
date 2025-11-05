/**
 * Mobile and Touch Interaction Handler for CyberWitches
 * Implements touch gestures, mobile optimizations, and accessibility features
 */

// Touch and mobile state
let touchState = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isSwiping: false,
    longPressTimer: null,
    isLongPress: false,
    pinchDistance: 0,
    lastTapTime: 0,
    tapCount: 0
};

// Mobile configuration
const mobileConfig = {
    minSwipeDistance: 50,
    maxSwipeTime: 300,
    longPressDelay: 500,
    doubleTapDelay: 300,
    minTapTargetSize: 44, // iOS HIG recommendation
    zoomScale: 1.0,
    maxZoomScale: 2.0,
    minZoomScale: 0.8
};

// Pull-to-refresh state
let pullToRefreshState = {
    isPulling: false,
    startY: 0,
    currentY: 0,
    threshold: 80,
    isRefreshing: false
};

// Haptic feedback simulation (visual feedback for web)
function triggerHapticFeedback(type = 'light') {
    if (!navigator.vibrate) return;
    
    switch (type) {
        case 'light':
            navigator.vibrate(10);
            break;
        case 'medium':
            navigator.vibrate(25);
            break;
        case 'heavy':
            navigator.vibrate(50);
            break;
        case 'success':
            navigator.vibrate([10, 50, 10]);
            break;
        case 'error':
            navigator.vibrate([50, 30, 50]);
            break;
    }
}

// Visual feedback for touch interactions
function createTouchFeedback(element, type = 'touch') {
    const feedback = document.createElement('div');
    feedback.className = `touch-feedback touch-feedback-${type}`;
    
    const rect = element.getBoundingClientRect();
    feedback.style.left = `${rect.left + rect.width / 2}px`;
    feedback.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(feedback);
    
    // Animate and remove
    requestAnimationFrame(() => {
        feedback.style.transform = 'scale(1.5)';
        feedback.style.opacity = '0';
    });
    
    setTimeout(() => {
        feedback.remove();
    }, 300);
}

// Initialize touch event listeners
function initTouchHandlers() {
    const mainContainer = document.querySelector('.main-container');
    const tabs = document.querySelector('.tabs');
    
    if (!mainContainer || !tabs) return;
    
    // Touch start
    mainContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    mainContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    mainContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Prevent default touch behaviors on game elements
    document.addEventListener('touchmove', (e) => {
        if (touchState.isSwiping) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle pinch-to-zoom
    mainContainer.addEventListener('touchstart', handlePinchStart, { passive: false });
    mainContainer.addEventListener('touchmove', handlePinchMove, { passive: false });
    mainContainer.addEventListener('touchend', handlePinchEnd, { passive: false });
}

// Handle touch start
function handleTouchStart(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchState.startX = touch.clientX;
        touchState.startY = touch.clientY;
        touchState.isSwiping = false;
        touchState.isLongPress = false;
        
        // Start long press timer
        touchState.longPressTimer = setTimeout(() => {
            touchState.isLongPress = true;
            triggerHapticFeedback('medium');
            showContextMenu(touch.clientX, touch.clientY);
        }, mobileConfig.longPressDelay);
        
        // Check for pull-to-refresh at top of page
        if (window.scrollY === 0) {
            pullToRefreshState.isPulling = true;
            pullToRefreshState.startY = touch.clientY;
        }
    }
}

// Handle touch move
function handleTouchMove(e) {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchState.endX = touch.clientX;
        touchState.endY = touch.clientY;
        
        // Check if this is a swipe
        const deltaX = Math.abs(touchState.endX - touchState.startX);
        const deltaY = Math.abs(touchState.endY - touchState.startY);
        
        if (deltaX > 10 || deltaY > 10) {
            touchState.isSwiping = true;
            clearTimeout(touchState.longPressTimer);
        }
        
        // Handle pull-to-refresh
        if (pullToRefreshState.isPulling && !pullToRefreshState.isRefreshing) {
            const pullDistance = touch.clientY - pullToRefreshState.startY;
            if (pullDistance > 0) {
                e.preventDefault();
                pullToRefreshState.currentY = pullDistance;
                updatePullToRefreshIndicator(pullDistance);
            }
        }
    }
}

// Handle touch end
function handleTouchEnd(e) {
    clearTimeout(touchState.longPressTimer);
    
    if (touchState.isSwiping && !touchState.isLongPress) {
        handleSwipeGesture();
    } else if (!touchState.isLongPress) {
        handleTap(e);
    }
    
    // Handle pull-to-refresh
    if (pullToRefreshState.isPulling && !pullToRefreshState.isRefreshing) {
        if (pullToRefreshState.currentY > pullToRefreshState.threshold) {
            triggerPullToRefresh();
        } else {
            hidePullToRefreshIndicator();
        }
    }
    
    // Reset state
    touchState.isSwiping = false;
    touchState.isLongPress = false;
    pullToRefreshState.isPulling = false;
    pullToRefreshState.currentY = 0;
}

// Handle swipe gestures for tab navigation
function handleSwipeGesture() {
    const deltaX = touchState.endX - touchState.startX;
    const deltaY = touchState.endY - touchState.startY;
    const deltaTime = Date.now() - touchState.lastTapTime;
    
    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > mobileConfig.minSwipeDistance && 
        Math.abs(deltaY) < mobileConfig.minSwipeDistance &&
        deltaTime < mobileConfig.maxSwipeTime) {
        
        const activeTab = document.querySelector('.tab-button.active');
        if (!activeTab) return;
        
        const tabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = tabs.indexOf(activeTab);
        
        if (deltaX > 0 && currentIndex > 0) {
            // Swipe right - previous tab
            const prevTab = tabs[currentIndex - 1];
            if (prevTab) {
                prevTab.click();
                triggerHapticFeedback('light');
                createTouchFeedback(prevTab, 'swipe');
            }
        } else if (deltaX < 0 && currentIndex < tabs.length - 1) {
            // Swipe left - next tab
            const nextTab = tabs[currentIndex + 1];
            if (nextTab) {
                nextTab.click();
                triggerHapticFeedback('light');
                createTouchFeedback(nextTab, 'swipe');
            }
        }
    }
}

// Handle tap with double-tap detection
function handleTap(e) {
    const currentTime = Date.now();
    const tapTarget = e.target.closest('.tab-button, .primary-button, .secondary-button, .cast-button, .card');
    
    if (tapTarget) {
        // Check for double tap
        if (currentTime - touchState.lastTapTime < mobileConfig.doubleTapDelay) {
            touchState.tapCount++;
            if (touchState.tapCount === 2) {
                handleDoubleTap(tapTarget);
                touchState.tapCount = 0;
            }
        } else {
            touchState.tapCount = 1;
        }
        
        touchState.lastTapTime = currentTime;
        
        // Visual feedback
        createTouchFeedback(tapTarget, 'tap');
        triggerHapticFeedback('light');
    }
}

// Handle double tap for zoom
function handleDoubleTap(element) {
    if (element.closest('.main-container')) {
        // Toggle zoom
        if (mobileConfig.zoomScale === 1.0) {
            mobileConfig.zoomScale = 1.5;
        } else {
            mobileConfig.zoomScale = 1.0;
        }
        
        applyZoom();
        triggerHapticFeedback('medium');
    }
}

// Pinch-to-zoom handlers
function handlePinchStart(e) {
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchState.pinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
    }
}

function handlePinchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (touchState.pinchDistance > 0) {
            const scale = currentDistance / touchState.pinchDistance;
            mobileConfig.zoomScale = Math.max(
                mobileConfig.minZoomScale,
                Math.min(mobileConfig.maxZoomScale, mobileConfig.zoomScale * scale)
            );
            
            applyZoom();
        }
        
        touchState.pinchDistance = currentDistance;
    }
}

function handlePinchEnd(e) {
    touchState.pinchDistance = 0;
}

// Apply zoom transformation
function applyZoom() {
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.style.transform = `scale(${mobileConfig.zoomScale})`;
        mainContainer.style.transformOrigin = 'center center';
    }
}

// Pull-to-refresh functionality
function updatePullToRefreshIndicator(pullDistance) {
    let indicator = document.getElementById('pull-to-refresh-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pull-to-refresh-indicator';
        indicator.className = 'pull-to-refresh-indicator';
        indicator.innerHTML = `
            <div class="pull-icon">⬇️</div>
            <div class="pull-text">Pull to refresh</div>
        `;
        document.body.appendChild(indicator);
    }
    
    const progress = Math.min(pullDistance / pullToRefreshState.threshold, 1);
    indicator.style.transform = `translateY(${Math.min(pullDistance, pullToRefreshState.threshold)}px)`;
    indicator.style.opacity = progress;
    
    if (progress >= 1) {
        indicator.querySelector('.pull-text').textContent = 'Release to refresh';
        indicator.querySelector('.pull-icon').textContent = '⚡';
    }
}

function hidePullToRefreshIndicator() {
    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator) {
        indicator.style.transform = 'translateY(0)';
        indicator.style.opacity = '0';
        setTimeout(() => {
            indicator.remove();
        }, 300);
    }
}

function triggerPullToRefresh() {
    if (pullToRefreshState.isRefreshing) return;
    
    pullToRefreshState.isRefreshing = true;
    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator) {
        indicator.querySelector('.pull-text').textContent = 'Refreshing...';
        indicator.querySelector('.pull-icon').innerHTML = '<div class="spinner"></div>';
    }
    
    triggerHapticFeedback('success');
    
    // Simulate refresh - in a real app, this would fetch new data
    setTimeout(() => {
        hidePullToRefreshIndicator();
        pullToRefreshState.isRefreshing = false;
        
        // Trigger a manual cast for resource generation
        if (window.gameState && window.castButton) {
            const handler = window.castButton.onclick;
            if (handler) handler();
        }
        
        // Use global notification system if available
        if (window.showNotification) {
            window.showNotification('Resources refreshed!', 'success');
        } else {
            console.log('Resources refreshed!');
        }
    }, 1500);
}

// Context menu for long press
function showContextMenu(x, y) {
    // Remove existing context menu
    const existingMenu = document.getElementById('mobile-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.id = 'mobile-context-menu';
    menu.className = 'mobile-context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    menu.innerHTML = `
        <div class="context-menu-item" data-action="refresh">🔄 Refresh</div>
        <div class="context-menu-item" data-action="save">💾 Save Game</div>
        <div class="context-menu-item" data-action="stats">📊 Quick Stats</div>
        <div class="context-menu-item" data-action="settings">⚙️ Settings</div>
    `;
    
    document.body.appendChild(menu);
    
    // Add click handlers
    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            handleContextMenuAction(item.dataset.action);
            menu.remove();
        });
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', () => {
            menu.remove();
        }, { once: true });
    }, 100);
}

function handleContextMenuAction(action) {
    triggerHapticFeedback('light');
    
    switch (action) {
        case 'refresh':
            if (window.gameState) {
                window.gameState.tick();
                if (window.showNotification) {
                    window.showNotification('Game refreshed!', 'success');
                } else {
                    console.log('Game refreshed!');
                }
            }
            break;
        case 'save':
            if (window.gameState) {
                window.gameState.saveGameState();
                if (window.showNotification) {
                    window.showNotification('Game saved!', 'success');
                } else {
                    console.log('Game saved!');
                }
            }
            break;
        case 'stats':
            // Switch to stats tab
            const statsTab = document.querySelector('[data-tab="stats"]');
            if (statsTab) statsTab.click();
            break;
        case 'settings':
            if (window.showNotification) {
                window.showNotification('Settings coming soon!', 'info');
            } else {
                console.log('Settings coming soon!');
            }
            break;
    }
}

// Enhance touch targets for mobile
function enhanceTouchTargets() {
    // Ensure all interactive elements meet minimum touch target size
    const interactiveElements = document.querySelectorAll('button, .card, .tab-button');
    
    interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const minSize = mobileConfig.minTapTargetSize;
        
        // Add padding if element is too small
        if (rect.width < minSize || rect.height < minSize) {
            element.style.minWidth = `${minSize}px`;
            element.style.minHeight = `${minSize}px`;
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
        }
        
        // Add touch feedback class
        element.classList.add('touch-enhanced');
    });
}

// Add mobile-specific CSS classes
function addMobileClasses() {
    document.body.classList.add('mobile-enhanced');
    
    // Detect device type
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        document.body.classList.add('mobile-device');
    }
    
    if (/iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768) {
        document.body.classList.add('tablet-device');
    }
}

// Initialize mobile features
function initMobileFeatures() {
    // Only initialize on touch devices
    if (!('ontouchstart' in window)) {
        console.log('Non-touch device detected, skipping mobile initialization');
        return;
    }
    
    console.log('Initializing mobile features...');
    
    addMobileClasses();
    enhanceTouchTargets();
    initTouchHandlers();
    
    // Add mobile-specific UI elements
    addMobileUIElements();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Handle resize events
    window.addEventListener('resize', debounce(handleResize, 250));
}

// Add mobile-specific UI elements
function addMobileUIElements() {
    // Add gesture hints
    const tabsContainer = document.querySelector('.tabs');
    if (tabsContainer) {
        const hint = document.createElement('div');
        hint.className = 'gesture-hint';
        hint.innerHTML = '💡 Swipe left/right to navigate tabs';
        tabsContainer.appendChild(hint);
        
        // Hide hint after first interaction
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 500);
        }, 5000);
    }
}

// Handle orientation change
function handleOrientationChange() {
    triggerHapticFeedback('medium');
    
    // Recalculate touch targets after orientation change
    setTimeout(() => {
        enhanceTouchTargets();
    }, 500);
}

// Handle resize with debouncing
function handleResize() {
    // Update mobile configuration based on new screen size
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-layout');
        document.body.classList.remove('tablet-layout', 'desktop-layout');
    } else if (window.innerWidth < 1024) {
        document.body.classList.add('tablet-layout');
        document.body.classList.remove('mobile-layout', 'desktop-layout');
    } else {
        document.body.classList.add('desktop-layout');
        document.body.classList.remove('mobile-layout', 'tablet-layout');
    }
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.MobileFeatures = {
    init: initMobileFeatures,
    triggerHapticFeedback,
    createTouchFeedback,
    applyZoom: () => applyZoom(),
    resetZoom: () => {
        mobileConfig.zoomScale = 1.0;
        applyZoom();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileFeatures);
} else {
    initMobileFeatures();
}