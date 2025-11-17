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
      statements: 60,
      branches: 55,
      functions: 60,
      lines: 60,
    },
    './js/utils.js': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    './js/gameState.js': {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
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
