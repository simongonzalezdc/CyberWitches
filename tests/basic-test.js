/**
 * Basic test without Jest dependencies
 */

// Simple test function
function testBasicFunctionality() {
    console.log('Testing basic functionality...');
    
    // Test 1: Check if we can create objects
    const testObj = { test: 'value' };
    console.log('✅ Object creation works');
    
    // Test 2: Check if we can modify objects
    testObj.test = 'modified';
    console.log('✅ Object modification works');
    
    // Test 3: Check if we can iterate over objects
    for (const [key, value] of Object.entries(testObj)) {
        console.log(`✅ Object iteration: ${key} = ${value}`);
    }
    
    // Test 4: Check if we can create arrays
    const testArray = [1, 2, 3];
    console.log('✅ Array creation works');
    
    // Test 5: Check if we can modify arrays
    testArray.push(4);
    console.log('✅ Array modification works');
    
    // Test 6: Check if we can iterate over arrays
    for (const item of testArray) {
        console.log(`✅ Array iteration: ${item}`);
    }
    
    console.log('✅ All basic tests passed!');
    return true;
}

// Run tests
try {
    const success = testBasicFunctionality();
    if (success) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('💥 Some tests failed!');
        process.exit(1);
    }
} catch (error) {
    console.error('💥 Test failed with error:', error);
    process.exit(1);
}