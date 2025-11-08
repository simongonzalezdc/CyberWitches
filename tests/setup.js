/**
 * Jest setup file for CyberWitches testing
 * Configures global test environment and mocks
 */

// Mock localStorage with full Storage API implementation
const createStorageMock = () => {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index) {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    // Test helper to reset store
    __reset() {
      store = {};
    }
  };
};

global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();

// Mock DOM APIs that might not be available in jsdom
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: (cb) => setTimeout(cb, 0),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: (id) => clearTimeout(id),
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

// Helper to restore console for debugging
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock performance API
if (!global.performance) {
  global.performance = {};
}

Object.defineProperty(global.performance, 'now', {
  writable: true,
  value: () => Date.now(),
});

// Mock navigator
if (!global.navigator) {
  global.navigator = {};
}

Object.defineProperty(global.navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Test Environment)',
});

Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock Math.random for deterministic tests
const originalMathRandom = Math.random;
global.mockMathRandom = (value) => {
  Math.random = () => value;
};
global.restoreMathRandom = () => {
  Math.random = originalMathRandom;
};

// Mock Date.now for time-based tests
const originalDateNow = Date.now;
global.mockDateNow = (timestamp) => {
  Date.now = () => timestamp;
};
global.restoreDateNow = () => {
  Date.now = originalDateNow;
};

// Reset all mocks before each test
beforeEach(() => {
  if (global.localStorage && global.localStorage.__reset) {
    global.localStorage.__reset();
  }
  if (global.sessionStorage && global.sessionStorage.__reset) {
    global.sessionStorage.__reset();
  }
  global.restoreMathRandom();
  global.restoreDateNow();
});

// Clean up after all tests
afterAll(() => {
  global.restoreConsole();
});