/**
 * Virtual Scrolling Utility for Performance Optimization
 * Implements virtual scrolling concept for large lists to reduce DOM nodes
 */
import { formatShort } from './utils.js';

/**
 * Virtual Scroll Manager
 */
export class VirtualScrollManager {
    /**
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Configuration options
     */
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            itemHeight: options.itemHeight || 100,
            bufferSize: options.bufferSize || 5,
            renderItem: options.renderItem || this.defaultRenderItem,
            getItemCount: options.getItemCount || (() => 0),
            ...options
        };
        
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.scrollTop = 0;
        this.containerHeight = 0;
        
        // Defer init to allow derived classes to set renderItem first
        this._initialized = false;
        this.init();
    }
    
    /**
     * Initialize virtual scrolling
     */
    init() {
        // Create inner container for virtual scrolling
        this.innerContainer = document.createElement('div');
        this.innerContainer.className = 'virtual-scroll-inner';
        this.innerContainer.style.contain = 'layout style paint';
        this.innerContainer.style.visibility = 'visible';
        this.innerContainer.style.display = 'block';
        this.innerContainer.style.opacity = '1';
        this.innerContainer.style.position = 'relative';
        
        // Create viewport for visible items
        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.contain = 'layout style paint';
        this.viewport.style.visibility = 'visible';
        this.viewport.style.display = 'block';
        this.viewport.style.opacity = '1';
        this.viewport.style.position = 'absolute';
        this.viewport.style.top = '0';
        this.viewport.style.left = '0';
        this.viewport.style.right = '0';
        this.viewport.style.width = '100%';
        
        // Set up structure
        this.innerContainer.appendChild(this.viewport);
        this.container.appendChild(this.innerContainer);
        
        // Ensure container has proper overflow
        if (this.container.style.overflowY !== 'auto' && this.container.style.overflowY !== 'scroll') {
            this.container.style.overflowY = 'auto';
        }
        
        // Set up scroll event listener with throttling
        // Note: handleScroll will check _constructorComplete before rendering
        // We'll set up the listener after construction completes
        this._scrollHandler = null;
        
        // Mark as initialized
        this._initialized = true;
        
        // Don't render immediately - let derived classes set renderItem first
        // We'll use requestAnimationFrame to defer any initial render
        this._deferredRenderScheduled = false;
        this._constructorComplete = false;
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        // Don't handle scroll during construction
        if (!this._constructorComplete) {
            return;
        }
        // Get actual scroll position from container
        this.scrollTop = this.container.scrollTop || 0;
        this.renderVisibleItems();
    }
    
    /**
     * Update container height based on total items
     */
    updateContainerHeight() {
        // Don't update during construction
        if (!this._constructorComplete || !this.innerContainer) {
            return;
        }
        const totalItems = this.options.getItemCount();
        const totalHeight = totalItems * this.options.itemHeight;
        this.innerContainer.style.height = `${totalHeight}px`;
        
        // Get container height - try multiple methods
        this.containerHeight = this.container.clientHeight || this.container.offsetHeight || window.innerHeight * 0.7 || 500;
        
        // If container height is still 0, force it to be visible and measure again
        if (this.containerHeight === 0 || this.containerHeight < 100) {
            console.warn('Container height is 0 or very small, forcing visibility and remeasuring...');
            this.container.style.display = 'flex';
            this.container.style.flexDirection = 'column';
            this.container.style.visibility = 'visible';
            this.container.style.opacity = '1';
            this.container.style.minHeight = '400px';
            this.container.style.height = 'auto';
            
            // Force a reflow
            void this.container.offsetHeight;
            
            // Remeasure
            this.containerHeight = this.container.clientHeight || this.container.offsetHeight || window.innerHeight * 0.7 || 500;
            console.log('Container height after forcing visibility:', this.containerHeight);
        }
        
        // Ensure container has proper overflow
        if (this.container.style.overflowY !== 'auto' && this.container.style.overflowY !== 'scroll') {
            this.container.style.overflowY = 'auto';
        }
        
        // Ensure inner container is visible
        this.innerContainer.style.visibility = 'visible';
        this.innerContainer.style.display = 'block';
        this.innerContainer.style.opacity = '1';
        
        // Ensure viewport is visible
        if (this.viewport) {
            this.viewport.style.visibility = 'visible';
            this.viewport.style.display = 'block';
            this.viewport.style.opacity = '1';
        }
        
        console.log('updateContainerHeight: totalItems:', totalItems, 'totalHeight:', totalHeight, 'containerHeight:', this.containerHeight);
    }
    
    /**
     * Calculate visible range and render items
     */
    renderVisibleItems() {
        // Don't render if constructor is not complete or renderItem is not properly set yet
        if (!this._constructorComplete || !this.options || !this.options.renderItem || typeof this.options.renderItem !== 'function') {
            console.log('renderVisibleItems: Skipping - constructor not complete or renderItem not ready');
            return;
        }
        
        // Additional safety check - ensure viewport exists
        if (!this.viewport || !this.innerContainer) {
            console.error('renderVisibleItems: viewport or innerContainer missing');
            return;
        }
        
        try {
            // Get actual scroll position from container
            this.scrollTop = this.container.scrollTop || 0;
            
            // Ensure container height is up to date
            if (this.containerHeight === 0 || this.containerHeight < 100) {
                this.updateContainerHeight();
            }
            
            const totalItems = this.options.getItemCount();
            
            if (totalItems === 0) {
                console.warn('renderVisibleItems: No items to render');
                this.viewport.innerHTML = '';
                return;
            }
            
            console.log('renderVisibleItems: totalItems:', totalItems, 'containerHeight:', this.containerHeight, 'scrollTop:', this.scrollTop);
            
            // Calculate visible range - ensure we always render at least the first few items
            const firstVisibleIndex = Math.floor(this.scrollTop / this.options.itemHeight);
            this.visibleStart = Math.max(0, firstVisibleIndex - this.options.bufferSize);
            this.visibleEnd = Math.min(
                totalItems - 1,
                Math.ceil((this.scrollTop + this.containerHeight) / this.options.itemHeight) + this.options.bufferSize
            );
            
            // Ensure we always render at least the first item if scrollTop is 0
            if (this.scrollTop === 0 && this.visibleStart > 0) {
                this.visibleStart = 0;
            }
            
            // Ensure visibleEnd is at least visibleStart
            if (this.visibleEnd < this.visibleStart) {
                // Calculate how many items should be visible based on container height
                const itemsThatFit = Math.ceil(this.containerHeight / this.options.itemHeight);
                this.visibleEnd = Math.min(totalItems - 1, this.visibleStart + itemsThatFit + this.options.bufferSize);
            }
            
            // Ensure we always render at least a minimum number of items
            const minItemsToRender = Math.max(3, Math.ceil(this.containerHeight / this.options.itemHeight));
            if ((this.visibleEnd - this.visibleStart + 1) < minItemsToRender) {
                this.visibleEnd = Math.min(totalItems - 1, this.visibleStart + minItemsToRender - 1);
            }
            
            console.log('renderVisibleItems: visible range:', this.visibleStart, 'to', this.visibleEnd, '(total:', totalItems, ')');
            
            // Clear viewport
            this.viewport.innerHTML = '';
            
            let renderedCount = 0;
            // Render visible items
            for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
                try {
                    const itemElement = this.options.renderItem(i);
                    if (itemElement && itemElement.nodeType === 1) { // Check if it's a valid DOM element
                        itemElement.style.position = 'absolute';
                        itemElement.style.top = `${i * this.options.itemHeight}px`;
                        itemElement.style.width = '100%';
                        itemElement.style.height = `${this.options.itemHeight}px`;
                        itemElement.style.contain = 'layout style paint';
                        itemElement.style.visibility = 'visible';
                        itemElement.style.display = 'block';
                        itemElement.style.opacity = '1';
                        itemElement.style.zIndex = '1';
                        itemElement.style.pointerEvents = 'auto';
                        itemElement.style.left = '0';
                        itemElement.style.right = '0';
                        
                        this.viewport.appendChild(itemElement);
                        renderedCount++;
                    } else {
                        console.warn('renderVisibleItems: Invalid item element at index', i);
                    }
                } catch (itemError) {
                    console.error('Error rendering item at index', i, itemError);
                    // Continue with next item instead of breaking
                }
            }
            console.log('renderVisibleItems: Rendered', renderedCount, 'items into viewport (expected:', (this.visibleEnd - this.visibleStart + 1), ')');
        } catch (error) {
            console.error('Error in renderVisibleItems:', error);
            // Don't throw - just log and return
        }
    }
    
    /**
     * Default render item function
     * @param {number} index - Item index
     * @returns {HTMLElement} - Item element
     */
    defaultRenderItem(index) {
        const item = document.createElement('div');
        item.className = 'virtual-scroll-item';
        item.textContent = `Item ${index}`;
        return item;
    }
    
    /**
     * Refresh the virtual scroll
     */
    refresh() {
        // Get current scroll position before updating
        this.scrollTop = this.container.scrollTop || 0;
        // Ensure container height is recalculated
        this.containerHeight = 0; // Force recalculation
        this.updateContainerHeight();
        this.renderVisibleItems();
    }
    
    /**
     * Scroll to a specific item
     * @param {number} index - Item index to scroll to
     */
    scrollToItem(index) {
        const targetScrollTop = index * this.options.itemHeight;
        this.container.scrollTop = targetScrollTop;
    }
    
    /**
     * Destroy the virtual scroll manager
     */
    destroy() {
        if (this.container && this.innerContainer) {
            this.container.removeChild(this.innerContainer);
        }
    }
}

/**
 * Virtual List for Workstations
 */
export class VirtualWorkstationList extends VirtualScrollManager {
    /**
     * @param {HTMLElement} container - Container element
     * @param {Array} workstations - Workstation data
     * @param {Object} gameState - Game state
     */
    constructor(container, workstations, gameState) {
        // Store data in closure variables to avoid accessing 'this' before super()
        const workstationsData = workstations;
        const gameStateData = gameState;
        
        // Call super first - cannot access 'this' before super()
        super(container, {
            itemHeight: 200,
            bufferSize: 3,
            getItemCount: () => workstationsData.length
        });
        
        // Now we can safely set properties and methods
        // Store references to data - these will be updated when game state changes
        this.workstations = workstationsData;
        this.gameState = gameStateData;
        
        // Override refresh to update data references
        const originalRefresh = this.refresh.bind(this);
        this.refresh = () => {
            // Update data references to get latest game state
            // Note: workstations array doesn't change, but gameState does
            // The renderItem function uses gameStateData from closure, which should be the same reference
            // But we need to ensure we're using the latest gameState
            originalRefresh();
        };
        
        // Set renderItem after super() is called - use standalone function to avoid 'this' issues
        // Create a standalone render function that doesn't need instance methods
        // Use a flag to prevent execution during construction
        let renderItemReady = false;
        // Import formatShort at module level to avoid any 'this' issues
        const formatShortFn = formatShort;
        
        this.options.renderItem = function(index) {
            // Safety check - don't render if constructor isn't complete
            if (!renderItemReady) {
                const placeholder = document.createElement('div');
                placeholder.className = 'card virtual-scroll-item';
                placeholder.textContent = 'Loading...';
                return placeholder;
            }
            
            try {
                const workstation = workstationsData[index];
                if (!workstation) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'card virtual-scroll-item';
                    placeholder.textContent = 'Invalid item';
                    return placeholder;
                }
                
                const card = document.createElement('div');
                card.className = 'card virtual-scroll-item';
                
                // Get current owned count from gameState - use the actual gameState reference
                const currentGameState = typeof gameStateData === 'object' && gameStateData !== null ? gameStateData : window.gameState || gameStateData;
                const owned = (currentGameState.workstations && currentGameState.workstations[workstation.id]) || 0;
                const recipe = VirtualWorkstationList.getScaledRecipeStatic(workstation.recipe, owned, workstation.growth);
                
                // Check affordability
                let canAfford1 = true;
                if (currentGameState && currentGameState.canAfford && typeof currentGameState.canAfford === 'function') {
                    canAfford1 = currentGameState.canAfford(recipe);
                } else {
                    // Fallback check
                    for (const ingId in recipe) {
                        const needed = recipe[ingId];
                        const have = (currentGameState.inventory && currentGameState.inventory[ingId]) || 0;
                        if (have < needed) {
                            canAfford1 = false;
                            break;
                        }
                    }
                }
                const canAfford10 = canAfford1; // Simplified
                const canAffordMax = canAfford1;
            
            card.innerHTML = `
                <div class="card-title">${workstation.displayName}</div>
                <div class="card-description">⚙️ Owned: ${owned}</div>
                <div class="card-content-left">
                    <div class="card-section">
                        <div class="card-label">Produces:</div>
                        ${Object.entries(workstation.outputs).map(([id, rate]) => 
                            `<div class="card-value">${rate.toFixed(2)}/s ${id}</div>`
                        ).join('')}
                    </div>
                </div>
                <div class="card-content-right">
                    <div class="card-section">
                        <div class="card-label">Recipe for next:</div>
                        ${Object.entries(recipe).map(([ingId, amount]) => {
                            const currentGameState = typeof gameStateData === 'object' && gameStateData !== null ? gameStateData : window.gameState || gameStateData;
                            const have = (currentGameState.inventory && currentGameState.inventory[ingId]) || 0;
                            const canAfford = have >= amount;
                            return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                                <span class="recipe-label">${ingId}:</span>
                                <span class="recipe-numbers">${formatShortFn(have)} / ${formatShortFn(amount)}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="button-row">
                    <button class="btn-primary ${canAfford1 ? '' : 'btn-disabled'}" data-action="craft" data-ws-id="${workstation.id}" data-amount="1" ${canAfford1 ? '' : 'disabled'}>Craft x1</button>
                    <button class="btn-primary ${canAfford10 ? '' : 'btn-disabled'}" data-action="craft" data-ws-id="${workstation.id}" data-amount="10" ${canAfford10 ? '' : 'disabled'}>Craft x10</button>
                    <button class="btn-primary ${canAffordMax ? '' : 'btn-disabled'}" data-action="craft-max" data-ws-id="${workstation.id}" ${canAffordMax ? '' : 'disabled'}>Max</button>
                </div>
            `;
            
                // Attach event listeners directly instead of using onclick
                const buttons = card.querySelectorAll('button[data-action]');
                buttons.forEach(btn => {
                    // Remove any existing listeners to prevent duplicates
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    newBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Mark button as handled to prevent fallback handler from firing
                        newBtn.dataset.handled = 'true';
                        setTimeout(() => {
                            delete newBtn.dataset.handled;
                        }, 100);
                        
                        const action = newBtn.dataset.action;
                        const wsId = newBtn.dataset.wsId;
                        
                        console.log('Button clicked:', { action, wsId, amount: newBtn.dataset.amount });
                        
                        if (action === 'craft' && typeof window.craftWorkstation === 'function') {
                            const amount = parseInt(newBtn.dataset.amount, 10) || 1;
                            console.log('Calling craftWorkstation with:', { wsId, amount });
                            window.craftWorkstation(wsId, amount, newBtn);
                        } else if (action === 'craft-max' && typeof window.craftWorkstationMax === 'function') {
                            console.log('Calling craftWorkstationMax with:', { wsId });
                            window.craftWorkstationMax(wsId);
                        }
                    });
                });
                
                return card;
            } catch (error) {
                console.error('Error rendering workstation item:', error);
                const placeholder = document.createElement('div');
                placeholder.className = 'card virtual-scroll-item';
                placeholder.textContent = 'Error loading item';
                return placeholder;
            }
        };
        
        // Mark constructor as complete and enable renderItem
        this._constructorComplete = true;
        renderItemReady = true;
        
        // Update container height and render initial items
        this.updateContainerHeight();
        this.renderVisibleItems();
        
        // Now set up scroll event listener after constructor completes
        if (!this._scrollHandler) {
            let scrollTimeout = null;
            this._scrollHandler = () => {
                if (!this._constructorComplete) {
                    return;
                }
                if (scrollTimeout) {
                    cancelAnimationFrame(scrollTimeout);
                }
                scrollTimeout = requestAnimationFrame(() => {
                    this.handleScroll();
                });
            };
            this.container.addEventListener('scroll', this._scrollHandler);
        }
        
        // Defer initial render until after constructor completes
        if (this._initialized && this.viewport && !this._deferredRenderScheduled) {
            this._deferredRenderScheduled = true;
            requestAnimationFrame(() => {
                if (this.viewport && this.options && this.options.renderItem && this._constructorComplete && renderItemReady) {
                    this.updateContainerHeight();
                    this.renderVisibleItems();
                }
            });
        }
    }
    
    /**
     * Render a workstation item
     * @param {Object} workstation - Workstation data
     * @param {Object} gameState - Game state
     * @returns {HTMLElement} - Workstation element
     */
    renderWorkstation(workstation, gameState) {
        const card = document.createElement('div');
        card.className = 'card virtual-scroll-item';
        
        const owned = gameState.workstations[workstation.id] || 0;
        // Use static method instead of instance method to avoid 'this' issues
        const recipe = VirtualWorkstationList.getScaledRecipeStatic(workstation.recipe, owned, workstation.growth);
        
        // Get inscription bonuses (only inscriptions, not buffs/prestige)
        let inscriptionMult = 1.0;
        const inscriptions = [];
        
        // Global upgrades
        for (const upgId in gameState.upgradesOwned) {
            const upgData = window.UPGRADES?.find(u => u.id === upgId);
            if (upgData && upgData.affects === "global" && upgData.type === "multiplier") {
                inscriptionMult *= upgData.value;
                inscriptions.push({
                    name: upgData.displayName,
                    type: 'global',
                    multiplier: upgData.value
                });
            }
        }
        
        // Producer-specific upgrades
        const targetAffects = "producer:" + workstation.id;
        for (const upgId in gameState.upgradesOwned) {
            const upgData = window.UPGRADES?.find(u => u.id === upgId);
            if (upgData && upgData.affects === targetAffects && upgData.type === "multiplier") {
                inscriptionMult *= upgData.value;
                inscriptions.push({
                    name: upgData.displayName,
                    type: 'workstation',
                    multiplier: upgData.value
                });
            }
        }
        
        // Calculate inscription bonus rates
        const inscriptionBonusRates = {};
        if (owned > 0 && inscriptionMult > 1.0) {
            for (const [outputId, baseRate] of Object.entries(workstation.outputs)) {
                const baseTotal = baseRate * owned;
                const actualTotal = baseTotal * inscriptionMult;
                const bonus = actualTotal - baseTotal;
                if (bonus > 0) {
                    inscriptionBonusRates[outputId] = bonus;
                }
            }
        }
        
        // Build inscription bonus display (compact 2-column layout)
        let inscriptionBonusHTML = '';
        if (Object.keys(inscriptionBonusRates).length > 0) {
            const formatShortFn = window.formatShort || ((n) => n.toFixed(2));
            const INGREDIENTS = window.INGREDIENTS || [];
            const bonusEntries = Object.entries(inscriptionBonusRates);
            inscriptionBonusHTML = `
                <div class="card-label" style="color: var(--success); font-size: 12px; margin-bottom: 6px;"><span class="css-icon-scroll"></span> Inscription Bonuses:</div>
                <div class="inscription-bonuses">
                    ${bonusEntries.map(([outputId, bonusRate]) => {
                        const ingredient = INGREDIENTS.find(ing => ing.id === outputId);
                        const displayName = ingredient?.displayName || outputId;
                        return `<div class="inscription-bonus-item">
                            +${formatShortFn(bonusRate)}/s ${displayName}
                        </div>`;
                    }).join('')}
                </div>
                ${inscriptions.length > 0 ? `
                    <div class="inscription-list">
                        ${inscriptions.map(ins => `• ${ins.name} (×${ins.multiplier.toFixed(2)})`).join('<br>')}
                    </div>
                ` : ''}
            `;
        }
        
        const formatPreciseFn = window.formatPrecise || ((n, p) => n.toFixed(p));
        const formatShortFn = window.formatShort || ((n) => n.toFixed(2));
        const INGREDIENTS_REF = window.INGREDIENTS || [];
        
        card.innerHTML = `
            <div class="card-title">${workstation.displayName}</div>
            <div class="card-description">⚙️ Owned: ${owned}</div>
            <div class="card-content-left">
                <div class="card-section">
                    <div class="card-label">Produces:</div>
                    ${Object.entries(workstation.outputs).map(([id, rate]) => {
                        const baseTotal = rate * owned;
                        const actualRate = owned > 0 ? baseTotal : rate;
                        const ingredient = INGREDIENTS_REF.find(ing => ing.id === id);
                        const displayName = ingredient?.displayName || id;
                        return `<div class="card-value">${formatPreciseFn(actualRate, 2)}/s ${displayName}</div>`;
                    }).join('')}
                </div>
            </div>
            <div class="card-content-right">
                <div class="card-section">
                    <div class="card-label">Recipe for next:</div>
                    ${Object.entries(recipe).map(([ingId, amount]) => {
                        const have = gameState.inventory[ingId] || 0;
                        const canAfford = have >= amount;
                        const ingredient = INGREDIENTS_REF.find(ing => ing.id === ingId);
                        const displayName = ingredient?.displayName || ingId;
                        return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                            <span class="recipe-label">${displayName}:</span>
                            <span class="recipe-numbers">${formatShortFn(have)} / ${formatShortFn(amount)}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            ${inscriptionBonusHTML ? `<div class="card-section full-width" style="border-left: 3px solid var(--success); background: rgba(60, 227, 197, 0.1);">${inscriptionBonusHTML}</div>` : ''}
            <div class="button-row">
                <button class="btn-primary" data-action="craft" data-ws-id="${workstation.id}" data-amount="1">Craft x1</button>
                <button class="btn-primary" data-action="craft" data-ws-id="${workstation.id}" data-amount="10">Craft x10</button>
                <button class="btn-primary" data-action="craft-max" data-ws-id="${workstation.id}">Max</button>
            </div>
        `;
        
        // Attach event listeners directly instead of using onclick
        const buttons = card.querySelectorAll('button[data-action]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = btn.dataset.action;
                const wsId = btn.dataset.wsId;
                
                if (action === 'craft' && typeof window.craftWorkstation === 'function') {
                    const amount = parseInt(btn.dataset.amount) || 1;
                    window.craftWorkstation(wsId, amount, btn);
                } else if (action === 'craft-max' && typeof window.craftWorkstationMax === 'function') {
                    window.craftWorkstationMax(wsId);
                }
            });
        });
        
        return card;
    }
    
    /**
     * Get scaled recipe (static method to avoid 'this' issues)
     * @param {Object} baseRecipe - Base recipe
     * @param {number} owned - Number owned
     * @param {number} growth - Growth factor
     * @returns {Object} - Scaled recipe
     */
    static getScaledRecipeStatic(baseRecipe, owned, growth) {
        const scaled = {};
        for (const ingId in baseRecipe) {
            const baseCost = baseRecipe[ingId];
            scaled[ingId] = Math.ceil(baseCost * Math.pow(growth, owned));
        }
        return scaled;
    }
    
    /**
     * Get scaled recipe (instance method for backward compatibility)
     * @param {Object} baseRecipe - Base recipe
     * @param {number} owned - Number owned
     * @param {number} growth - Growth factor
     * @returns {Object} - Scaled recipe
     */
    getScaledRecipe(baseRecipe, owned, growth) {
        return VirtualWorkstationList.getScaledRecipeStatic(baseRecipe, owned, growth);
    }
}

/**
 * Virtual List for Upgrades
 */
export class VirtualUpgradeList extends VirtualScrollManager {
    /**
     * @param {HTMLElement} container - Container element
     * @param {Array} upgrades - Upgrade data
     * @param {Object} gameState - Game state
     */
    constructor(container, upgrades, gameState) {
        // Store data in closure variables to avoid accessing 'this' before super()
        const upgradesData = upgrades;
        const gameStateData = gameState;
        
        // Call super first - cannot access 'this' before super()
        super(container, {
            itemHeight: 180,
            bufferSize: 3,
            getItemCount: () => upgradesData.length
        });
        
        // Now we can safely set properties and methods
        this.upgrades = upgradesData;
        this.gameState = gameStateData;
        
        // Set renderItem after super() is called - use standalone function to avoid 'this' issues
        let renderItemReady = false;
        const formatShortFn = formatShort;
        
        this.options.renderItem = function(index) {
            // Safety check - don't render if constructor isn't complete
            if (!renderItemReady) {
                const placeholder = document.createElement('div');
                placeholder.className = 'card virtual-scroll-item';
                placeholder.textContent = 'Loading...';
                return placeholder;
            }
            
            try {
                const upgrade = upgradesData[index];
                if (!upgrade) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'card virtual-scroll-item';
                    placeholder.textContent = 'Invalid item';
                    return placeholder;
                }
                
                const card = document.createElement('div');
                card.className = 'card virtual-scroll-item';
            
            const owned = gameStateData.upgradesOwned[upgrade.id] || false;
            
            let effectText = '';
            if (upgrade.affects === 'global') {
                effectText = `Global ${upgrade.type} ×${upgrade.value}`;
            } else if (upgrade.affects.startsWith('producer:')) {
                const wsId = upgrade.affects.split(':')[1];
                effectText = `${wsId} ${upgrade.type} ×${upgrade.value}`;
            } else if (upgrade.affects === 'click') {
                effectText = `Click ${upgrade.type} +${upgrade.value}`;
            }
            
            // Check if can afford all materials
            let canAffordAll = true;
            if (!owned && upgrade.recipe) {
                for (const [ingId, amount] of Object.entries(upgrade.recipe)) {
                    const have = gameStateData.inventory[ingId] || 0;
                    if (have < amount) {
                        canAffordAll = false;
                        break;
                    }
                }
            }
            
            card.innerHTML = `
                <div class="card-title">${upgrade.displayName} ${owned ? '✓' : ''}</div>
                <div class="card-description">${upgrade.description}</div>
                <div class="card-section">
                    <div class="card-label">Effect: ${effectText}</div>
                </div>
                <div class="card-section">
                    <div class="card-label">Recipe:</div>
                    ${Object.entries(upgrade.recipe).map(([ingId, amount]) => {
                        const have = gameStateData.inventory[ingId] || 0;
                        const canAfford = have >= amount;
                        return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                            <span class="recipe-label">${ingId}:</span>
                            <span class="recipe-numbers">${formatShortFn(have)} / ${formatShortFn(amount)}</span>
                        </div>`;
                    }).join('')}
                </div>
                <button class="btn-primary" data-action="inscribe" data-upgrade-id="${upgrade.id}" ${owned || !canAffordAll ? 'disabled' : ''}>
                    ${owned ? 'Owned' : 'Inscribe'}
                </button>
            `;
            
                // Attach event listener directly instead of using onclick
                const button = card.querySelector('button[data-action="inscribe"]');
                if (button && !owned && canAffordAll && typeof window.inscribeUpgrade === 'function') {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.inscribeUpgrade(upgrade.id, button);
                    });
                }
                
                return card;
            } catch (error) {
                console.error('Error rendering upgrade item:', error);
                const placeholder = document.createElement('div');
                placeholder.className = 'card virtual-scroll-item';
                placeholder.textContent = 'Error loading item';
                return placeholder;
            }
        };
        
        // Mark constructor as complete and enable renderItem
        this._constructorComplete = true;
        renderItemReady = true;
        
        // Update container height and render initial items
        this.updateContainerHeight();
        this.renderVisibleItems();
        
        // Now set up scroll event listener after constructor completes
        if (!this._scrollHandler) {
            let scrollTimeout = null;
            this._scrollHandler = () => {
                if (!this._constructorComplete) {
                    return;
                }
                if (scrollTimeout) {
                    cancelAnimationFrame(scrollTimeout);
                }
                scrollTimeout = requestAnimationFrame(() => {
                    this.handleScroll();
                });
            };
            this.container.addEventListener('scroll', this._scrollHandler);
        }
        
        // Defer initial render until after constructor completes
        if (this._initialized && this.viewport && !this._deferredRenderScheduled) {
            this._deferredRenderScheduled = true;
            requestAnimationFrame(() => {
                if (this.viewport && this.options && this.options.renderItem && this._constructorComplete && renderItemReady) {
                    this.updateContainerHeight();
                    this.renderVisibleItems();
                }
            });
        }
    }
    
    /**
     * Render an upgrade item
     * @param {Object} upgrade - Upgrade data
     * @param {Object} gameState - Game state
     * @returns {HTMLElement} - Upgrade element
     */
    renderUpgrade(upgrade, gameState) {
        const card = document.createElement('div');
        card.className = 'card virtual-scroll-item';
        
        const owned = gameState.upgradesOwned[upgrade.id] || false;
        
        let effectText = '';
        if (upgrade.affects === 'global') {
            effectText = `Global ${upgrade.type} ×${upgrade.value}`;
        } else if (upgrade.affects.startsWith('producer:')) {
            const wsId = upgrade.affects.split(':')[1];
            effectText = `${wsId} ${upgrade.type} ×${upgrade.value}`;
        } else if (upgrade.affects === 'click') {
            effectText = `Click ${upgrade.type} +${upgrade.value}`;
        }
        
        card.innerHTML = `
            <div class="card-title">${upgrade.displayName} ${owned ? '✓' : ''}</div>
            <div class="card-description">${upgrade.description}</div>
            <div class="card-section">
                <div class="card-label">Effect: ${effectText}</div>
            </div>
            <div class="card-section">
                <div class="card-label">Recipe:</div>
                ${Object.entries(upgrade.recipe).map(([ingId, amount]) => {
                    const have = gameState.inventory[ingId] || 0;
                    const canAfford = have >= amount;
                    return `<div class="recipe-item ${canAfford ? 'can-afford' : 'cannot-afford'}">
                        <span class="recipe-label">${ingId}:</span>
                        <span class="recipe-numbers">${formatShort(have)} / ${formatShort(amount)}</span>
                    </div>`;
                }).join('')}
            </div>
            <button class="primary-button" data-action="inscribe" data-upgrade-id="${upgrade.id}" ${owned ? 'disabled' : ''}>
                ${owned ? 'Owned' : 'Inscribe'}
            </button>
        `;
        
        // Attach event listener directly instead of using onclick
        const button = card.querySelector('button[data-action="inscribe"]');
        if (button && !owned && typeof window.inscribeUpgrade === 'function') {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.inscribeUpgrade(upgrade.id, button);
            });
        }
        
        return card;
    }
}

/**
 * Virtual List for Achievements
 */
export class VirtualAchievementList extends VirtualScrollManager {
    /**
     * @param {HTMLElement} container - Container element
     * @param {Array} achievements - Achievement data
     * @param {Object} achievementSystem - Achievement system
     */
    constructor(container, achievements, achievementSystem) {
        // Store data in closure variables to avoid accessing 'this' before super()
        const achievementsData = achievements;
        const achievementSystemData = achievementSystem;
        
        // Call super first - cannot access 'this' before super()
        super(container, {
            itemHeight: 100,
            bufferSize: 5,
            getItemCount: () => achievementsData.length
        });
        
        // Now we can safely set properties and methods
        this.achievements = achievementsData;
        this.achievementSystem = achievementSystemData;
        
        // Set renderItem after super() is called - use standalone function to avoid 'this' issues
        let renderItemReady = false;
        
        this.options.renderItem = function(index) {
            // Safety check - don't render if constructor isn't complete
            if (!renderItemReady) {
                const placeholder = document.createElement('div');
                placeholder.className = 'achievement-card virtual-scroll-item';
                placeholder.textContent = 'Loading...';
                return placeholder;
            }
            
            try {
                const achievement = achievementsData[index];
                if (!achievement) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'achievement-card virtual-scroll-item';
                    placeholder.textContent = 'Invalid item';
                    return placeholder;
                }
                
                const card = document.createElement('div');
                const unlocked = achievementSystemData.unlockedAchievements.has(achievement.id);
                card.className = `achievement-card virtual-scroll-item ${unlocked ? 'unlocked' : 'locked'}`;
            
            card.innerHTML = `
                <div style="font-weight: bold; color: ${unlocked ? 'var(--success)' : 'var(--text-dim)'};">
                    ${unlocked ? '✓' : '○'} ${achievement.name}
                </div>
                <div style="font-size: 14px; margin-top: 5px; color: var(--text-dim);">
                    ${achievement.description}
                </div>
            `;
            
                return card;
            } catch (error) {
                console.error('Error rendering achievement item:', error);
                const placeholder = document.createElement('div');
                placeholder.className = 'achievement-card virtual-scroll-item';
                placeholder.textContent = 'Error loading item';
                return placeholder;
            }
        };
        
        // Mark constructor as complete and enable renderItem
        this._constructorComplete = true;
        renderItemReady = true;
        
        // Update container height and render initial items
        this.updateContainerHeight();
        this.renderVisibleItems();
        
        // Now set up scroll event listener after constructor completes
        if (!this._scrollHandler) {
            let scrollTimeout = null;
            this._scrollHandler = () => {
                if (!this._constructorComplete) {
                    return;
                }
                if (scrollTimeout) {
                    cancelAnimationFrame(scrollTimeout);
                }
                scrollTimeout = requestAnimationFrame(() => {
                    this.handleScroll();
                });
            };
            this.container.addEventListener('scroll', this._scrollHandler);
        }
        
        // Defer initial render until after constructor completes
        if (this._initialized && this.viewport && !this._deferredRenderScheduled) {
            this._deferredRenderScheduled = true;
            requestAnimationFrame(() => {
                if (this.viewport && this.options && this.options.renderItem && this._constructorComplete && renderItemReady) {
                    this.updateContainerHeight();
                    this.renderVisibleItems();
                }
            });
        }
    }
    
    /**
     * Render an achievement item
     * @param {Object} achievement - Achievement data
     * @param {Object} achievementSystem - Achievement system
     * @returns {HTMLElement} - Achievement element
     */
    renderAchievement(achievement, achievementSystem) {
        const card = document.createElement('div');
        const unlocked = achievementSystem.unlockedAchievements.has(achievement.id);
        card.className = `achievement-card virtual-scroll-item ${unlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <div style="font-weight: bold; color: ${unlocked ? 'var(--success)' : 'var(--text-dim)'};">
                ${unlocked ? '✓' : '○'} ${achievement.name}
            </div>
            <div style="font-size: 14px; margin-top: 5px; color: var(--text-dim);">
                ${achievement.description}
            </div>
        `;
        
        return card;
    }
}
