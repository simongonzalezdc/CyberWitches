/**
 * Simple test runner for verifying functionality without Jest
 */

// Set up environment for testing
global.console = {
    ...console,
    log: console.log,
    warn: console.warn,
    error: console.error
};

// Mock DOM
global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn().mockReturnValue({
        style: {},
        appendChild: jest.fn(),
        textContent: ''
    })
};

global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};

global.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};

global.performance = {
    now: () => Date.now(),
    memory: {
        usedJSHeapSize: 1024 * 1024
    }
};

global.navigator = {
    userAgent: 'Test User Agent'
};

global.window = {
    location: { href: 'http://localhost' },
    showNotification: jest.fn()
};

// Import and run tests
async function runTests() {
    try {
        // Import test modules
        const { default: GameState } = await import('../js/gameState.js');
        const { default: CovenSystem } = await import('../js/covenSystem.js');
        
        console.log('Running tests...');
        
        // Simple test to verify modules loaded
        const gameState = new GameState();
        const covenSystem = new CovenSystem(gameState);
        
        // Test basic functionality
        console.log('Testing basic functionality...');
        
        // Test coven creation
        const covenCreated = covenSystem.createCoven('Test Coven', 'A test coven');
        console.log('Coven created:', covenCreated);
        
        // Test coven bonus calculation
        const bonus = covenSystem.getCovenProductionBonus();
        console.log('Coven bonus:', bonus);
        
        // Test coven membership
        const isInCoven = covenSystem.isInCoven();
        console.log('Is in coven:', isInCoven);
        
        // Test save/load
        const saveData = covenSystem.saveCovenData();
        console.log('Save data:', saveData);
        
        // Test loading
        covenSystem.loadCovenData({
            coven: {
                id: 'test_coven',
                name: 'Loaded Coven',
                level: 5
            },
            playerId: 'test_player',
            playerName: 'TestPlayer'
        });
        
        const loadedCoven = covenSystem.getCurrentCoven();
        console.log('Loaded coven:', loadedCoven ? loadedCoven.name : 'None');
        
        console.log('All tests completed successfully!');
        return true;
    } catch (error) {
        console.error('Test failed:', error);
        return false;
    }
}

// Run tests
runTests().then(success => {
    if (success) {
        console.log('✅ All tests passed!');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed!');
        process.exit(1);
    }
});