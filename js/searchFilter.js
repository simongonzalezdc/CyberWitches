/**
 * Search and Filter System
 * Provides search and filter functionality for lists (workstations, upgrades, etc.)
 */

class SearchFilterManager {
    constructor() {
        this.activeFilters = new Map();
        this.searchTerms = new Map();
        this.filterFunctions = new Map(); // Store filter functions for each container
        this.init();
    }
    
    init() {
        // Set up search/filter UI for workstations and upgrades tabs
        this.setupWorkstationsSearch();
        this.setupUpgradesSearch();
        this.setupInventorySearch();
    }
    
    /**
     * Create search/filter UI for a list
     * @param {string} containerId - Container ID for the list
     * @param {string} listId - List element ID
     * @param {Function} filterFn - Function to filter items
     * @returns {HTMLElement} - Search container element
     */
    createSearchUI(containerId, listId, filterFn) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        // Store filter function for this container
        this.filterFunctions.set(containerId, filterFn);
        
        // Check if search UI already exists
        let searchContainer = container.querySelector('.search-filter-container');
        if (searchContainer) {
            return searchContainer;
        }
        
        // Create search container
        searchContainer = document.createElement('div');
        searchContainer.className = 'search-filter-container';
        searchContainer.style.cssText = `
            margin-bottom: 16px;
            display: flex !important;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
            visibility: visible !important;
            opacity: 1 !important;
            position: relative;
            z-index: 10;
        `;
        
        // Search input
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'search-input';
        searchInput.placeholder = 'Search...';
        searchInput.style.cssText = `
            flex: 1;
            min-width: 200px;
            padding: 10px 16px;
            background: var(--bg-dark, #0a0a1a);
            border: 2px solid var(--border, #333);
            border-radius: 8px;
            color: var(--text, #FFFFFF);
            font-size: 14px;
            visibility: visible !important;
            display: block !important;
        `;
        searchInput.setAttribute('aria-label', 'Search');
        
        // Filter buttons container
        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-buttons';
        filterContainer.style.cssText = `
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        `;
        
        // Affordable filter
        const affordableBtn = this.createFilterButton('Affordable', 'affordable', filterContainer);
        // Owned filter
        const ownedBtn = this.createFilterButton('Owned', 'owned', filterContainer);
        // Unowned filter
        const unownedBtn = this.createFilterButton('Unowned', 'unowned', filterContainer);
        
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(filterContainer);
        
        // Insert before list
        const list = document.getElementById(listId);
        if (list && list.parentNode) {
            list.parentNode.insertBefore(searchContainer, list);
        } else {
            container.insertBefore(searchContainer, container.firstChild);
        }
        
        // Set up event listeners
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerms.set(containerId, e.target.value.toLowerCase());
                this.applyFilters(containerId, listId); // Use stored filter function
            }, 300); // Debounce search
        });
        
        // Filter button handlers
        affordableBtn.addEventListener('click', () => {
            this.toggleFilter(containerId, 'affordable');
            this.applyFilters(containerId, listId); // Use stored filter function
        });
        
        ownedBtn.addEventListener('click', () => {
            this.toggleFilter(containerId, 'owned');
            this.applyFilters(containerId, listId); // Use stored filter function
        });
        
        unownedBtn.addEventListener('click', () => {
            this.toggleFilter(containerId, 'unowned');
            this.applyFilters(containerId, listId); // Use stored filter function
        });
        
        return searchContainer;
    }
    
    /**
     * Create filter button
     * @param {string} label - Button label
     * @param {string} filterId - Filter ID
     * @param {HTMLElement} container - Container element
     * @returns {HTMLElement} - Button element
     */
    createFilterButton(label, filterId, container) {
        const button = document.createElement('button');
        button.className = `filter-btn filter-btn-${filterId}`;
        button.textContent = label;
        button.setAttribute('data-filter', filterId);
        button.style.cssText = `
            padding: 8px 16px;
            background: var(--bg-light, #1a1a2e);
            border: 2px solid var(--border, #333);
            border-radius: 6px;
            color: var(--text, #FFFFFF);
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            visibility: visible !important;
            display: inline-block !important;
        `;
        
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('active')) {
                button.style.borderColor = 'var(--primary, #FF2DAA)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                button.style.borderColor = 'var(--border, #333)';
            }
        });
        
        container.appendChild(button);
        return button;
    }
    
    /**
     * Toggle filter
     * @param {string} containerId - Container ID
     * @param {string} filterId - Filter ID
     */
    toggleFilter(containerId, filterId) {
        const key = `${containerId}_${filterId}`;
        const isActive = this.activeFilters.get(key) || false;
        this.activeFilters.set(key, !isActive);
        
        // Update button appearance
        const button = document.querySelector(`[data-filter="${filterId}"]`);
        if (button) {
            if (!isActive) {
                button.classList.add('active');
                button.style.background = 'var(--primary, #FF2DAA)';
                button.style.borderColor = 'var(--primary, #FF2DAA)';
            } else {
                button.classList.remove('active');
                button.style.background = 'var(--bg-light, #1a1a2e)';
                button.style.borderColor = 'var(--border, #333)';
            }
        }
    }
    
    /**
     * Apply filters to list
     * @param {string} containerId - Container ID
     * @param {string} listId - List ID
     * @param {Function} filterFn - Filter function (optional, will use stored one if not provided)
     */
    applyFilters(containerId, listId, filterFn) {
        const list = document.getElementById(listId);
        if (!list) return;
        
        // Use provided filter function or get stored one
        const storedFilterFn = filterFn || this.filterFunctions.get(containerId);
        
        const searchTerm = this.searchTerms.get(containerId) || '';
        const filters = {
            affordable: this.activeFilters.get(`${containerId}_affordable`) || false,
            owned: this.activeFilters.get(`${containerId}_owned`) || false,
            unowned: this.activeFilters.get(`${containerId}_unowned`) || false
        };
        
        // Get all items (including tier headers)
        const items = Array.from(list.children);
        
        // First pass: filter items (skip tier headers for now)
        items.forEach(item => {
            // Skip tier headers in first pass
            if (item.classList.contains('tier-header')) {
                return;
            }
            
            let show = true;
            
            // Apply search filter
            if (searchTerm) {
                const text = item.textContent.toLowerCase();
                if (!text.includes(searchTerm)) {
                    show = false;
                }
            }
            
            // Apply other filters
            if (show && storedFilterFn) {
                show = storedFilterFn(item, filters, searchTerm);
            } else if (show) {
                // Default filter logic
                if (filters.owned) {
                    if (!item.classList.contains('owned')) {
                        show = false;
                    }
                }
                if (filters.unowned) {
                    if (item.classList.contains('owned')) {
                        show = false;
                    }
                }
            }
            
            // Show/hide item
            item.style.display = show ? '' : 'none';
        });
        
        // Second pass: show/hide tier headers based on visible items
        items.forEach((item, index) => {
            if (item.classList.contains('tier-header')) {
                // Check if any items after this header (until next header) are visible
                let hasVisibleItems = false;
                for (let i = index + 1; i < items.length; i++) {
                    const nextItem = items[i];
                    if (nextItem.classList.contains('tier-header')) {
                        break; // Reached next tier header
                    }
                    if (nextItem.style.display !== 'none') {
                        hasVisibleItems = true;
                        break;
                    }
                }
                item.style.display = hasVisibleItems ? '' : 'none';
            }
        });
    }
    
    /**
     * Setup search for workstations tab
     */
    setupWorkstationsSearch() {
        // This will be called when workstations tab is opened
        // Implementation in game.js
    }
    
    /**
     * Setup search for upgrades tab
     */
    setupUpgradesSearch() {
        // This will be called when upgrades tab is opened
        // Implementation in game.js
    }
    
    /**
     * Setup search for inventory tab
     */
    setupInventorySearch() {
        // This will be called when inventory tab is opened
        // Implementation in game.js
    }
}

// Create global instance
const searchFilterManager = new SearchFilterManager();

// Global functions for compatibility
window.createSearchUI = (containerId, listId, filterFn) => {
    return searchFilterManager.createSearchUI(containerId, listId, filterFn);
};

export default searchFilterManager;

