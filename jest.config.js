/**
 * Jest Configuration
 * ES Modules support for testing
 */

export default {
  // Use jsdom for DOM testing
  testEnvironment: 'jsdom',

  // Inject Jest globals
  injectGlobals: true,

  // Don't transform anything (use native ES modules)
  transform: {},

  // Setup file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test environment options
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // Coverage configuration
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/tests/**',
    '!js/**/*.test.js',
    '!js/**/*.spec.js',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 8,
      branches: 7,
      functions: 14,
      lines: 8,
    },
    './js/gameState.js': {
      statements: 65,
      branches: 55,
      functions: 67,
      lines: 66,
    },
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'node'],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/archive/',
  ],

  // Coverage report formats
  coverageReporters: ['text', 'html', 'lcov'],

  // Verbose output
  verbose: true,
};
