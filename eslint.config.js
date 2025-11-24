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
                caughtErrorsIgnorePattern: '^_'
            }], 
            'no-const-assign': 'error',       // Catch reassigning const
            'no-dupe-keys': 'error',          // Catch duplicate keys in objects
            'no-unreachable': 'error',        // Catch code after return
            'valid-typeof': 'error',          // Catch invalid typeof checks

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
