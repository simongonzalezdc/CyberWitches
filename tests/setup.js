/**
 * Jest setup file for CyberWitches testing
 * Configures global test environment and mocks
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock DOM APIs that might not be available in jsdom
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn((cb) => setTimeout(cb, 0)),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn((id) => clearTimeout(id)),
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up global test utilities
global.createMockElement = (tagName, attributes = {}) => {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

global.createMockEvent = (type, properties = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.entries(properties).forEach(([key, value]) => {
    event[key] = value;
  });
  return event;
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
};

// Mock Math.random for deterministic tests
const originalMathRandom = Math.random;
global.mockMathRandom = (value) => {
  Math.random = jest.fn(() => value);
};
global.restoreMathRandom = () => {
  Math.random = originalMathRandom;
};