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
        customExportConditions: ['node', 'node-addons']
    },

    // Coverage configuration
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/tests/**',
        '!js/**/*.test.js',
        '!js/**/*.spec.js'
    ],

    // Coverage thresholds are a regression ratchet, set just below the CURRENT
    // enforced floor. NOTE: jest evaluates thresholds over the full
    // collectCoverageFrom universe (every js/**/*.js, including never-imported
    // modules at 0%), which is LOWER than the "All files" reporter table that
    // only counts modules loaded during the run (~12%). The numbers below track
    // the threshold evaluation (~9% stmts / 7% branch / 14% funcs / 9% lines).
    // Raise them as UI/PWA modules gain tests; re-measure with
    // `npm run test:coverage`.
    coverageThreshold: {
        global: {
            statements: 8,
            branches: 7,
            functions: 14,
            lines: 8
        },
        './js/gameState.js': {
            // Recalibrated after the save integrity/migration cluster moved to
            // js/save/saveCodec.js (those well-covered functions now count there).
            statements: 64,
            branches: 54,
            functions: 65,
            lines: 65
        },
        './js/save/saveCodec.js': {
            // The extracted save codec is now its own test surface; hold the line.
            statements: 75,
            branches: 75,
            functions: 88,
            lines: 78
        }
    },

    // Module file extensions
    moduleFileExtensions: ['js', 'json', 'node'],

    // Test match patterns
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],

    // Ignore patterns.
    // IMPORTANT: anchor project-relative ignores to <rootDir>. Bare '/archive/'
    // or '/dist/' are matched against the file's ABSOLUTE path, so if the repo is
    // checked out under a directory that itself contains "archive" or "dist"
    // (e.g. .../workspaces/archive/personal/CyberWitches), the pattern silently
    // excludes the ENTIRE repo and jest reports "No tests found". node_modules is
    // safe unanchored because it only ever appears inside the dependency tree.
    testPathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/archive/'
    ],

    // Coverage report formats
    coverageReporters: ['text', 'html', 'lcov'],

    // Verbose output
    verbose: true
};
