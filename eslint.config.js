import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                navigator: 'readonly',
                performance: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                AudioContext: 'readonly',
                requestIdleCallback: 'readonly',
                cancelIdleCallback: 'readonly',
                Image: 'readonly',
                URL: 'readonly',
                Response: 'readonly',
                Request: 'readonly',
                Audio: 'readonly',
                Blob: 'readonly',
                screen: 'readonly',
                location: 'readonly',
                confirm: 'readonly',
                Notification: 'readonly',
                MutationObserver: 'readonly',
                structuredClone: 'readonly',

                // Service worker globals (sw.js)
                self: 'readonly',
                caches: 'readonly',
                clients: 'readonly',

                // Node globals
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                global: 'readonly',

                // Game specific globals
                Tone: 'readonly',
                gameLoop: 'readonly',
                showNotification: 'readonly',
                gameState: 'writable',
                audioSystem: 'readonly',
                
                // Test globals (Jest)
                describe: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly'
            }
        },
        rules: {
            // Error Prevention (Overrides/Additions to recommended)
            'no-undef': 'error',              // Catch typos (variable not defined)
            'no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
                caughtErrors: 'all'           // Check all catch blocks (not just used vars)
            }], 
            'no-const-assign': 'error',       // Catch reassigning const
            'no-dupe-keys': 'error',          // Catch duplicate keys in objects
            'no-unreachable': 'error',        // Catch code after return
            'valid-typeof': 'error',          // Catch invalid typeof checks

            // Error Handling (Critical for observability)
            'no-empty': ['error', { 
                allowEmptyCatch: false         // NEVER allow empty catch blocks (silent failures)
            }],
            'no-useless-catch': 'error',       // Prevent catch blocks that just rethrow
            'prefer-promise-reject-errors': ['error', { 
                allowEmptyReject: false        // Always reject with Error objects
            }],

            // Best Practices
            'eqeqeq': ['warn', 'smart'],      // Encourage === over ==
            'no-var': 'error',                // Ban 'var', use let/const
            'prefer-const': 'warn',           // Suggest const if not reassigned
            'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }], // Allow logs for now
            'no-debugger': 'warn',

            // Style
            'indent': ['warn', 4, { "SwitchCase": 1 }],
            'quotes': ['warn', 'single', { "avoidEscape": true }],
            'semi': ['warn', 'always'],
            'comma-dangle': ['warn', 'never']
        }
    }
];
