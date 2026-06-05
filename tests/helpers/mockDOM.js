/**
 * DOM Mocking Utilities
 * Helper functions for mocking DOM elements and browser APIs in tests
 */

/**
 * Create a mock DOM element with common properties and methods
 */
export function createMockElement(tagName = 'div', options = {}) {
    const element = {
        tagName: tagName.toUpperCase(),
        id: options.id || '',
        className: options.className || '',
        classList: createMockClassList(options.className),
        style: options.style || {},
        innerHTML: options.innerHTML || '',
        textContent: options.textContent || '',
        children: options.children || [],
        parentNode: options.parentNode || null,
        dataset: options.dataset || {},
        attributes: new Map(),

        // Methods
        appendChild: jest.fn(function(child) {
            this.children.push(child);
            child.parentNode = this;
            return child;
        }),

        removeChild: jest.fn(function(child) {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
                child.parentNode = null;
            }
            return child;
        }),

        querySelector: jest.fn(function(selector) {
            // Simple mock - returns first child or null
            return this.children[0] || null;
        }),

        querySelectorAll: jest.fn(function(selector) {
            // Simple mock - returns all children
            return this.children;
        }),

        getElementById: jest.fn(function(id) {
            return this.children.find(child => child.id === id) || null;
        }),

        getElementsByClassName: jest.fn(function(className) {
            return this.children.filter(child => child.className.includes(className));
        }),

        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),

        setAttribute: jest.fn(function(name, value) {
            this.attributes.set(name, value);
        }),

        getAttribute: jest.fn(function(name) {
            return this.attributes.get(name) || null;
        }),

        removeAttribute: jest.fn(function(name) {
            this.attributes.delete(name);
        }),

        hasAttribute: jest.fn(function(name) {
            return this.attributes.has(name);
        }),

        focus: jest.fn(),
        blur: jest.fn(),
        click: jest.fn(),
        scrollIntoView: jest.fn()
    };

    return element;
}

/**
 * Create a mock classList object
 */
export function createMockClassList(initialClasses = '') {
    const classes = initialClasses ? initialClasses.split(' ').filter(Boolean) : [];

    return {
        add: jest.fn(function(...classNames) {
            classNames.forEach(name => {
                if (!classes.includes(name)) {
                    classes.push(name);
                }
            });
        }),

        remove: jest.fn(function(...classNames) {
            classNames.forEach(name => {
                const index = classes.indexOf(name);
                if (index > -1) {
                    classes.splice(index, 1);
                }
            });
        }),

        toggle: jest.fn(function(className, force) {
            if (force === true) {
                if (!classes.includes(className)) {
                    classes.push(className);
                }
                return true;
            } else if (force === false) {
                const index = classes.indexOf(className);
                if (index > -1) {
                    classes.splice(index, 1);
                }
                return false;
            } else {
                const index = classes.indexOf(className);
                if (index > -1) {
                    classes.splice(index, 1);
                    return false;
                } else {
                    classes.push(className);
                    return true;
                }
            }
        }),

        contains: jest.fn(function(className) {
            return classes.includes(className);
        }),

        replace: jest.fn(function(oldClass, newClass) {
            const index = classes.indexOf(oldClass);
            if (index > -1) {
                classes[index] = newClass;
                return true;
            }
            return false;
        }),

        toString: function() {
            return classes.join(' ');
        },

        get length() {
            return classes.length;
        },

        item: function(index) {
            return classes[index] || null;
        }
    };
}

/**
 * Create a mock localStorage
 */
export function createMockLocalStorage() {
    let store = {};

    return {
        getItem: jest.fn((key) => store[key] || null),

        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),

        removeItem: jest.fn((key) => {
            delete store[key];
        }),

        clear: jest.fn(() => {
            store = {};
        }),

        get length() {
            return Object.keys(store).length;
        },

        key: jest.fn((index) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }),

        // Test helper to get raw store
        __getStore: () => store,
        __setStore: (newStore) => { store = newStore; }
    };
}

/**
 * Create a mock document
 */
export function createMockDocument() {
    const mockDoc = {
        body: createMockElement('body'),
        documentElement: createMockElement('html'),
        head: createMockElement('head'),

        createElement: jest.fn((tagName) => createMockElement(tagName)),

        getElementById: jest.fn((id) => {
            // Return a basic mock element
            return createMockElement('div', { id });
        }),

        querySelector: jest.fn((selector) => {
            return createMockElement('div');
        }),

        querySelectorAll: jest.fn((selector) => {
            return [createMockElement('div')];
        }),

        getElementsByClassName: jest.fn((className) => {
            return [createMockElement('div', { className })];
        }),

        getElementsByTagName: jest.fn((tagName) => {
            return [createMockElement(tagName)];
        }),

        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),

        createTextNode: jest.fn((text) => ({ nodeValue: text, textContent: text })),

        referrer: '',
        location: {
            href: 'http://localhost/',
            hostname: 'localhost',
            pathname: '/',
            search: '',
            hash: ''
        }
    };

    return mockDoc;
}

/**
 * Create a mock window object
 */
export function createMockWindow() {
    return {
        localStorage: createMockLocalStorage(),
        sessionStorage: createMockLocalStorage(),

        location: {
            href: 'http://localhost/',
            hostname: 'localhost',
            pathname: '/',
            search: '',
            hash: '',
            reload: jest.fn(),
            assign: jest.fn(),
            replace: jest.fn()
        },

        navigator: {
            userAgent: 'Mozilla/5.0 (Test)',
            platform: 'Test',
            language: 'en-US',
            onLine: true
        },

        performance: {
            now: jest.fn(() => Date.now()),
            mark: jest.fn(),
            measure: jest.fn(),
            getEntriesByType: jest.fn(() => []),
            getEntriesByName: jest.fn(() => [])
        },

        requestAnimationFrame: jest.fn((callback) => {
            return setTimeout(callback, 16); // ~60fps
        }),

        cancelAnimationFrame: jest.fn((id) => {
            clearTimeout(id);
        }),

        setTimeout: jest.fn((callback, delay) => setTimeout(callback, delay)),
        clearTimeout: jest.fn((id) => clearTimeout(id)),
        setInterval: jest.fn((callback, delay) => setInterval(callback, delay)),
        clearInterval: jest.fn((id) => clearInterval(id)),

        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),

        innerWidth: 1920,
        innerHeight: 1080,
        devicePixelRatio: 1,

        matchMedia: jest.fn((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        })),

        console: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        }
    };
}

/**
 * Setup global DOM mocks for tests
 */
export function setupGlobalMocks() {
    const mockWindow = createMockWindow();
    const mockDocument = createMockDocument();

    global.window = mockWindow;
    global.document = mockDocument;
    global.localStorage = mockWindow.localStorage;
    global.sessionStorage = mockWindow.sessionStorage;
    global.navigator = mockWindow.navigator;
    global.performance = mockWindow.performance;
    global.requestAnimationFrame = mockWindow.requestAnimationFrame;
    global.cancelAnimationFrame = mockWindow.cancelAnimationFrame;

    return {
        window: mockWindow,
        document: mockDocument
    };
}

/**
 * Clean up global mocks after tests
 */
export function cleanupGlobalMocks() {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.sessionStorage;
    delete global.navigator;
    delete global.performance;
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
}

/**
 * Create a mock event object
 */
export function createMockEvent(type, options = {}) {
    return {
        type,
        target: options.target || createMockElement(),
        currentTarget: options.currentTarget || null,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        bubbles: options.bubbles !== undefined ? options.bubbles : true,
        cancelable: options.cancelable !== undefined ? options.cancelable : true,
        defaultPrevented: false,
        timeStamp: Date.now(),
        ...options
    };
}

/**
 * Simulate a click event on an element
 */
export function simulateClick(element, options = {}) {
    const event = createMockEvent('click', {
        target: element,
        ...options
    });

    if (element.onclick) {
        element.onclick(event);
    }

    if (element.addEventListener.mock) {
        const listeners = element.addEventListener.mock.calls
            .filter(call => call[0] === 'click')
            .map(call => call[1]);

        listeners.forEach(listener => listener(event));
    }

    return event;
}

/**
 * Wait for async operations in tests
 */
export function waitFor(callback, timeout = 1000, interval = 50) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const check = () => {
            try {
                const result = callback();
                if (result) {
                    resolve(result);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(check, interval);
                }
            } catch (error) {
                if (Date.now() - startTime > timeout) {
                    reject(error);
                } else {
                    setTimeout(check, interval);
                }
            }
        };

        check();
    });
}

/**
 * Flush all pending promises
 */
export function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}
