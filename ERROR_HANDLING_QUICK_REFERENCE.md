# 🔧 Error Handling Quick Reference

**Last Updated:** November 24, 2025  
**Status:** All systems operational ✅

---

## ✅ Current State

```bash
✓ ESLint: 0 errors, 0 warnings
✓ Tests: 817 passing (24/25 suites, 1 skipped)
✓ Unhandled Promises: 0
✓ Empty Catch Blocks: 0
✓ Error Handling Rules: 6 active
```

---

## 📋 Quick Commands

```bash
# Check everything
npm run ci                    # Runs linter + tests

# Individual checks
npm run lint                  # ESLint only
npm test                      # Jest tests
npm run test:coverage        # With coverage report

# Development
npm run lint:fix             # Auto-fix linting issues
npm run test:watch          # Watch mode for tests
```

---

## 🎯 Error Handling Patterns

### Pattern 1: Promise Chain (Use for dynamic imports, API calls)

```javascript
import('./module.js')
    .then(module => module.initialize())
    .then(result => {
        console.log('Success:', result);
    })
    .catch(err => {
        console.error('Failed to load module:', err);
        handleError(err, 'ModuleLoader', showToUser, category, severity);
        // Optional: Return fallback
        return fallbackModule;
    });
```

### Pattern 2: Async/Await (Preferred for most code)

```javascript
async function initializeSystem() {
    try {
        const system = await loadSystem();
        await system.start();
        console.log('System started successfully');
        return system;
    } catch (err) {
        console.error('System initialization failed:', err);
        handleError(err, 'initializeSystem', true, ErrorCategory.SYSTEM, ErrorSeverity.HIGH);
        // Optional: Return fallback
        return fallbackSystem;
    }
}
```

### Pattern 3: Error Boundary Wrapper (For critical modules)

```javascript
import { createErrorBoundary } from './core/ErrorBoundary.js';

const audioSystemBoundary = createErrorBoundary('AudioSystem', () => ({
    playSound: () => {},  // Fallback: silent audio system
    setVolume: () => {}
}));

const audioSystem = audioSystemBoundary.wrap(() => new AudioSystem())();
```

---

## 🚫 Anti-Patterns (What NOT to Do)

### ❌ Empty Catch Block
```javascript
// BAD: Silent failure
try {
    doSomething();
} catch (err) {
    // Empty - error is swallowed
}
```

### ❌ Unhandled Promise
```javascript
// BAD: No error handling
someAsyncOperation().then(result => {
    console.log(result);
});  // Missing .catch()
```

### ❌ Useless Catch
```javascript
// BAD: Just rethrowing without context
try {
    doSomething();
} catch (err) {
    throw err;  // Adds no value
}
```

### ❌ Console.log for Errors
```javascript
// BAD: Use console.error for errors
try {
    doSomething();
} catch (err) {
    console.log(err);  // Should be console.error
}
```

---

## 🎨 Error Categories & Severity

### Categories (from `errorHandler.js`)
```javascript
ErrorCategory = {
    GAME_STATE: 'game_state',      // GameState operations
    SAVE_LOAD: 'save_load',        // Save/load operations
    UI: 'ui',                       // UI updates/rendering
    AUDIO: 'audio',                 // Audio system
    NETWORK: 'network',             // Network requests
    VALIDATION: 'validation',       // Data validation
    PERFORMANCE: 'performance'      // Performance issues
}
```

### Severity Levels
```javascript
ErrorSeverity = {
    LOW: 'low',          // Recoverable, non-critical
    MEDIUM: 'medium',    // Important but not blocking
    HIGH: 'high',        // Degraded functionality
    CRITICAL: 'critical' // Game-breaking, data loss risk
}
```

### Usage Example
```javascript
handleError(
    err,                          // Error object
    'AudioSystem.playSound',      // Context
    false,                        // showToUser (false = don't show notification)
    ErrorCategory.AUDIO,          // Category
    ErrorSeverity.MEDIUM          // Severity
);
```

---

## 📊 ESLint Rules (Active)

```javascript
// Error Handling
'no-empty': ['error', { allowEmptyCatch: false }]          // No empty catch blocks
'no-useless-catch': 'error'                                // No catch that just rethrows
'prefer-promise-reject-errors': ['error']                  // Reject with Error objects
'no-unused-vars': { caughtErrors: 'all' }                  // Check all catch blocks

// Best Practices
'no-undef': 'error'                                        // Catch undefined variables
'no-const-assign': 'error'                                 // Catch const reassignment
'no-unreachable': 'error'                                  // Catch dead code
```

---

## 🧪 Test Coverage Standards

### Current Thresholds (jest.config.js)
```javascript
global: {
    statements: 60%
    branches: 55%
    functions: 60%
    lines: 60%
}
```

### How to Check Coverage
```bash
npm run test:coverage
# Open coverage/index.html in browser for detailed report
```

---

## 🔍 Debugging Tips

### Finding Unhandled Promises
```bash
# Search for promises without .catch()
grep -r "\.then(" js/ | grep -v "\.catch(" | grep -v "test"
```

### Finding Empty Catch Blocks
```bash
# ESLint will catch these automatically
npm run lint
```

### Check for Silent console.log
```bash
# Find console.log that should be console.error
grep -r "console\.log.*error" js/
```

---

## 📚 Documentation

- **Full Audit:** `SILENT_ERRORS_AUDIT.md` (600+ lines, comprehensive)
- **Fix Summary:** `SILENT_ERRORS_FIX_SUMMARY.md` (executive summary)
- **Cache Issues:** `CACHE_CLEAR_INSTRUCTIONS.md` (troubleshooting)
- **This File:** `ERROR_HANDLING_QUICK_REFERENCE.md` (quick reference)

---

## 🆘 Common Issues & Solutions

### Issue: "checkUnlocks is not a function"
**Cause:** Browser serving cached old code  
**Solution:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)  
**Details:** See `CACHE_CLEAR_INSTRUCTIONS.md`

### Issue: Test importing from wrong module
**Cause:** Function moved to different file  
**Solution:** Update import path, check with grep  
```bash
grep -r "functionName" js/ --files-with-matches
```

### Issue: ESLint complaining about unused catch variable
**Solution:** Prefix with underscore if intentionally unused  
```javascript
catch (_err) {  // Underscore indicates "intentionally unused"
    // Still handle the error
}
```

---

## 🎯 Checklist for New Code

Before committing:
- [ ] All promises have `.catch()` handlers
- [ ] All `try/catch` blocks log errors
- [ ] Use `handleError()` for consistent error tracking
- [ ] Add tests for new functionality
- [ ] Run `npm run ci` (linter + tests)
- [ ] Check error categories and severities are appropriate
- [ ] Verify error messages are user-friendly

---

## 🔗 Related Files

### Error Handling Infrastructure
- `js/errorHandler.js` - Centralized error handling
- `js/core/ErrorBoundary.js` - Module error boundaries
- `js/errorRecovery.js` - Automatic error recovery
- `js/errorReporting.js` - Error reporting/analytics

### Configuration
- `eslint.config.js` - Linting rules
- `jest.config.js` - Test configuration
- `package.json` - Scripts and commands

---

## 💡 Pro Tips

1. **Always provide context in errors**
   ```javascript
   catch (err) {
       console.error('Failed to load user data:', err);  // ✅ Has context
       // Not just: console.error(err);  // ❌ No context
   }
   ```

2. **Use appropriate severity levels**
   - LOW: UI glitch, recoverable
   - MEDIUM: Feature degraded but usable
   - HIGH: Feature broken
   - CRITICAL: Data loss or game crash

3. **Provide fallbacks for critical systems**
   ```javascript
   catch (err) {
       handleError(err, 'critical-system');
       return fallbackSystem;  // Graceful degradation
   }
   ```

4. **Test error paths**
   ```javascript
   test('should handle network errors gracefully', async () => {
       mockFetch.mockRejectedValue(new Error('Network error'));
       await expect(loadData()).rejects.toThrow('Network error');
   });
   ```

---

## 📞 Need Help?

1. **Check docs first:** `SILENT_ERRORS_AUDIT.md` has detailed examples
2. **Run diagnostics:** `npm run ci`
3. **Check console:** Error messages include context
4. **Review patterns:** See "Error Handling Patterns" section above

---

**Last Audit:** November 24, 2025 ✅  
**Next Review:** As needed  
**Status:** Production Ready 🚀

