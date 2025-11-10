# Testing Strategy - CyberWitches/Hex Compiler

## Executive Summary

**Target Coverage:** 60% (Industry Standard Minimum)
**Current Coverage:** ~1.75%
**Implementation Timeline:** 2-3 weeks
**Priority:** High (Critical for production stability)

## Coverage Goals

### Overall Targets
- **Statement Coverage:** 60%
- **Branch Coverage:** 55%
- **Function Coverage:** 60%
- **Line Coverage:** 60%

### Module Priority Breakdown

#### Priority 1 - Critical Core (80%+ coverage)
These modules are essential for game functionality:

1. **gameState.js** - Game state management
   - Currency operations (AB add/spend)
   - Inventory management
   - Production calculations
   - Save/load functionality
   - Prestige system
   - Buff management
   - Target: 80% coverage

2. **utils.js** - Balance and utility functions
   - Number formatting
   - Balance calculations
   - Prestige formulas
   - Offline production
   - Target: 85% coverage

3. **data.js** - Game data validation
   - Data structure validation
   - Recipe validation
   - Unlock progression
   - Growth calculations
   - Target: 70% coverage

#### Priority 2 - User-Facing Features (60%+ coverage)
Important for user experience:

4. **analytics.js** - Event tracking
   - Event capture
   - Privacy compliance
   - Local storage
   - Target: 65% coverage

5. **retentionTracking.js** - Retention metrics
   - D1/D7/D30 tracking
   - UTM parameters
   - Cohort analysis
   - Target: 70% coverage

6. **onboarding.js** - Tutorial system
   - Step progression
   - Action handling
   - Completion tracking
   - Target: 65% coverage

7. **achievements.js** - Achievement system
   - Unlock conditions
   - Progress tracking
   - Notifications
   - Target: 60% coverage

8. **elementSpecialization.js** - Element bonuses
   - Specialization logic
   - Bonus calculations
   - Element selection
   - Target: 60% coverage

#### Priority 3 - Supporting Systems (40-50% coverage)
Nice to have, lower impact:

9. **errorHandler.js** - Error management (50%)
10. **animations.js** - Visual effects (40%)
11. **audioSystem.js** - Sound system (40%)
12. **questSystem.js** - Quest mechanics (50%)

## Test Architecture

### Test Structure
```
tests/
├── unit/              # Unit tests for individual modules
│   ├── gameState.test.js
│   ├── utils.test.js
│   ├── data.test.js
│   ├── analytics.test.js
│   ├── retentionTracking.test.js
│   ├── onboarding.test.js
│   ├── achievements.test.js
│   └── elementSpecialization.test.js
├── integration/       # Integration tests
│   ├── saveLoad.test.js
│   ├── progression.test.js
│   └── analytics.test.js
├── setup.js          # Test environment setup
└── helpers/          # Test utilities
    ├── mockData.js
    ├── mockDOM.js
    └── testUtils.js
```

### Testing Framework

**Jest Configuration:**
- Environment: jsdom (for DOM testing)
- ES Modules: Enabled via package.json "type": "module"
- Coverage: Istanbul
- Reporters: Default + coverage

**Mocking Strategy:**
- Mock localStorage for save/load tests
- Mock DOM elements for UI tests
- Mock analytics endpoints
- Mock external dependencies

## Test Types

### 1. Unit Tests (70% of tests)
Test individual functions and classes in isolation.

**Example:**
```javascript
describe('GameState - Currency Management', () => {
  test('should add AB correctly', () => {
    gameState.addAb(100);
    expect(gameState.ab).toBe(100);
  });
});
```

### 2. Integration Tests (20% of tests)
Test interactions between modules.

**Example:**
```javascript
describe('Save/Load Integration', () => {
  test('should save and restore complete game state', () => {
    // Set up complex state
    // Save
    // Load
    // Verify all data restored
  });
});
```

### 3. Edge Case Tests (10% of tests)
Test error conditions and boundary cases.

**Example:**
```javascript
test('should handle corrupted save data', () => {
  localStorage.setItem('save', 'invalid json');
  expect(() => gameState.load()).not.toThrow();
});
```

## Coverage Calculation

### Target Modules (for 60% coverage)

Based on ~31,830 lines of code, we need to cover ~19,098 lines.

**Module Breakdown:**
| Module | Lines | Target % | Lines to Cover |
|--------|-------|----------|----------------|
| gameState.js | ~800 | 80% | 640 |
| utils.js | ~600 | 85% | 510 |
| data.js | ~1,200 | 70% | 840 |
| game.js | ~1,500 | 40% | 600 |
| analytics.js | ~300 | 65% | 195 |
| retentionTracking.js | ~250 | 70% | 175 |
| onboarding.js | ~400 | 65% | 260 |
| achievements.js | ~500 | 60% | 300 |
| elementSpecialization.js | ~400 | 60% | 240 |
| Others | ~25,880 | 45% | 11,646 |
| **Total** | **31,830** | **60%** | **~19,098** |

## Implementation Plan

### Week 1: Foundation
- ✅ Day 1: Fix broken test configuration
- ✅ Day 2: Set up test helpers and mocks
- ✅ Day 3-4: gameState.js tests (expand to 80%)
- ✅ Day 5: utils.js tests (85% coverage)

### Week 2: Core Features
- ✅ Day 6-7: data.js tests (70% coverage)
- ✅ Day 8: analytics.js tests (65% coverage)
- ✅ Day 9: retentionTracking.js tests (70% coverage)
- ✅ Day 10: onboarding.js tests (65% coverage)

### Week 3: Polish & Integration
- ✅ Day 11: achievements.js tests (60% coverage)
- ✅ Day 12: elementSpecialization.js tests (60% coverage)
- ✅ Day 13: Integration tests
- ✅ Day 14: Coverage verification and gap filling

## Test Patterns

### Pattern 1: State Management Tests
```javascript
describe('Module Initialization', () => {
  test('should initialize with default values', () => {});
  test('should validate input parameters', () => {});
});

describe('Module Operations', () => {
  test('should perform operation correctly', () => {});
  test('should handle errors gracefully', () => {});
  test('should maintain state consistency', () => {});
});

describe('Module Persistence', () => {
  test('should save state correctly', () => {});
  test('should restore state correctly', () => {});
});
```

### Pattern 2: Calculation Tests
```javascript
describe('Balance Calculations', () => {
  test('should calculate with correct formula', () => {});
  test('should handle edge cases (0, negative, infinity)', () => {});
  test('should match expected values', () => {});
});
```

### Pattern 3: Event/Analytics Tests
```javascript
describe('Event Tracking', () => {
  test('should track event with correct data', () => {});
  test('should respect privacy settings', () => {});
  test('should handle offline scenarios', () => {});
});
```

## Quality Gates

### Pre-Commit Checks
- All tests must pass
- Coverage must not decrease
- No console errors in tests

### CI/CD Pipeline
```bash
npm run lint          # ESLint check
npm run test          # Run all tests
npm run test:coverage # Verify coverage >= 60%
```

### Coverage Thresholds (Jest Config)
```json
{
  "coverageThreshold": {
    "global": {
      "statements": 60,
      "branches": 55,
      "functions": 60,
      "lines": 60
    },
    "./js/gameState.js": {
      "statements": 80,
      "branches": 75,
      "functions": 85,
      "lines": 80
    },
    "./js/utils.js": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    }
  }
}
```

## Testing Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"
- Group related tests with describe blocks

### 2. Test Independence
- Each test should be independent
- Use beforeEach/afterEach for setup/cleanup
- Don't rely on test execution order

### 3. Mocking
- Mock external dependencies
- Mock time-dependent operations
- Mock randomness for deterministic tests

### 4. Assertions
- One logical assertion per test
- Use appropriate matchers (toBe, toEqual, toBeCloseTo)
- Test both positive and negative cases

### 5. Coverage vs Quality
- Don't chase 100% coverage
- Focus on critical paths
- Test business logic thoroughly
- UI code can have lower coverage

## Risk Mitigation

### Current Risks
1. **Low baseline coverage** - Starting from ~1.75%
2. **ES module complexity** - Jest + ES modules can be tricky
3. **Legacy code** - Some modules may be hard to test
4. **Time constraints** - 2-3 weeks is ambitious

### Mitigation Strategies
1. **Incremental approach** - Add tests module by module
2. **Mock heavy** - Mock complex dependencies
3. **Refactor as needed** - Make code testable
4. **Continuous verification** - Run coverage after each module

## Success Metrics

### Quantitative
- ✅ Overall coverage >= 60%
- ✅ Priority 1 modules >= 75%
- ✅ Priority 2 modules >= 60%
- ✅ All tests passing
- ✅ CI/CD pipeline green

### Qualitative
- ✅ Tests are maintainable
- ✅ Tests catch real bugs
- ✅ Tests document behavior
- ✅ Team confidence in refactoring
- ✅ Reduced regression bugs

## Maintenance Plan

### Ongoing
- Add tests for all new features
- Maintain coverage above 60%
- Review and update tests quarterly
- Remove obsolete tests

### Monitoring
- Track coverage trends over time
- Monitor test execution time
- Identify flaky tests
- Update mocks as APIs change

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [ES Modules in Jest](https://jestjs.io/docs/ecmascript-modules)

### Tools
- Jest (test runner)
- Istanbul (coverage)
- jsdom (DOM simulation)
- ESLint (linting)

## Appendix

### Test Data Examples
See `tests/helpers/mockData.js` for reusable test data.

### Common Mock Patterns
See `tests/helpers/mockDOM.js` for DOM mocking utilities.

### Troubleshooting
- **ES module errors**: Ensure package.json has "type": "module"
- **Mock not working**: Check mock path and hoisting
- **Flaky tests**: Look for timing issues or shared state
- **Slow tests**: Profile and optimize or split into unit tests

---

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Owner:** Development Team
**Next Review:** 2025-12-08
