/**
 * Simple test runner without Jest dependencies
 */

// Mock DOM APIs
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

// Test function
async function runTests() {
    try {
        console.log('Running simple tests...');
        
        // Test 1: Import modules
        console.log('Testing module imports...');
        const { default: GameState } = await import('../js/gameState.js');
        // Coven system archived - see ARCHIVED_COVEN_FEATURES.md
        // const { default: CovenSystem } = await import('../js/covenSystem.js'); // Archived
        console.log('✅ Modules imported successfully');
        
        // Test 2: Create game state
        console.log('Testing game state creation...');
        const gameState = new GameState();
        console.log('✅ Game state created successfully');
        
        // Test 3: Create coven system
        console.log('Testing coven system creation...');
        const covenSystem = new CovenSystem(gameState);
        console.log('✅ Coven system created successfully');
        
        // Test 4: Create coven
        console.log('Testing coven creation...');
        const covenCreated = covenSystem.createCoven('Test Coven', 'A test coven');
        console.log('✅ Coven created:', covenCreated);
        
        // Test 5: Check coven membership
        console.log('Testing coven membership...');
        const isInCoven = covenSystem.isInCoven();
        console.log('✅ Is in coven:', isInCoven);
        
        // Test 6: Check production bonus
        console.log('Testing production bonus...');
        const bonus = covenSystem.getCovenProductionBonus();
        console.log('✅ Production bonus:', bonus);
        
        // Test 7: Save coven data
        console.log('Testing coven save...');
        const saveData = covenSystem.saveCovenData();
        console.log('✅ Coven data saved:', saveData ? 'has data' : 'no data');
        
        // Test 8: Load coven data
        console.log('Testing coven load...');
        covenSystem.loadCovenData({
            coven: {
                id: 'test_coven',
                name: 'Loaded Coven',
                level: 3
            },
            playerId: 'test_player',
            playerName: 'TestPlayer'
        });
        const loadedCoven = covenSystem.getCurrentCoven();
        console.log('✅ Coven loaded:', loadedCoven ? loadedCoven.name : 'None');
        
        console.log('✅ All tests completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Run tests
runTests().then(success => {
    if (success) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('💥 Some tests failed!');
        process.exit(1);
    }
});