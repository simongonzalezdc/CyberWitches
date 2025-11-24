# 🧪 Week 1 Testing Guide
## How to Verify Performance Improvements

**Date:** 2025-01-27  
**Purpose:** Validate Week 1 optimizations are working correctly

---

## 🎯 Quick Test (5 minutes)

### Step 1: Start the Game
```bash
npm start
```

### Step 2: Check Console
Open browser console (F12) and look for:
```
📊 Measuring performance baseline...
✅ Baseline saved: { fps: X, memory: X, loadTime: X }
🎮 Unified game loop active (10 TPS logic, 60 FPS visuals)
```

### Step 3: Verify Game Loop
In console, type:
```javascript
window.gameLoop.getMetrics()
```

Should show:
```javascript
{
    isRunning: true,
    tickCounter: [increasing number],
    logicCallbacks: 1,
    visualCallbacks: 0,
    renderCallbacks: 0
}
```

### Step 4: Verify Object Pooling
In console, type:
```javascript
window.uiManager.systems.particleSystem.particlePool.getStats()
```

Should show:
```javascript
{
    poolSize: [number],
    activeCount: [number],
    maxSize: [number],
    utilization: [0-1]
}
```

---

## 📊 Performance Testing (15 minutes)

### 1. FPS Measurement

**Method 1: Console (Automatic)**
- Game automatically measures FPS on startup
- Check console for baseline and comparison
- Look for: `📈 Performance comparison:`

**Method 2: Chrome DevTools**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record (⚫)
4. Play game for 10 seconds
5. Stop recording
6. Check FPS graph (should be stable ~60 FPS)

**Expected Result:** FPS should be stable at 60 FPS (no drops)

---

### 2. Memory Usage

**Method 1: Console**
```javascript
// Check current memory
if (performance.memory) {
    console.log('Memory:', (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB');
}
```

**Method 2: Chrome DevTools**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Filter by "Particle" or "sparkle"
4. Count should be stable (not growing)

**Expected Result:** Memory should be stable or decreasing (not growing)

---

### 3. CPU Usage

**Chrome DevTools:**
1. Open DevTools → Performance tab
2. Record for 10 seconds
3. Check CPU usage graph
4. Should see lower CPU usage than before

**Expected Result:** CPU usage reduced by 20-30%

---

### 4. Load Time

**Method 1: Console (Automatic)**
- Check console for baseline load time
- Compare with Network tab timing

**Method 2: Chrome DevTools**
1. Open DevTools → Network tab
2. Reload page
3. Check "Load" time
4. Should be faster than baseline

**Expected Result:** Load time reduced by 15-25%

---

## 🔍 Functional Testing

### Game Logic (10 TPS)
- [ ] Currency (AB) increases over time
- [ ] Production rates are correct
- [ ] Workstations produce resources
- [ ] Upgrades apply correctly

### Visual Updates (60 FPS)
- [ ] UI updates smoothly
- [ ] Animations are smooth
- [ ] No stuttering or lag
- [ ] Particles animate smoothly

### Periodic Checks
- [ ] Tier unlocks check every 10 seconds
- [ ] Achievements check every 2 seconds
- [ ] Events check every 1 second
- [ ] HUD updates every 0.5 seconds

### Service Worker
- [ ] Service worker registers correctly
- [ ] Assets cached on first load
- [ ] Offline page shows when offline
- [ ] Cache size stays under 50MB

---

## 🐛 Troubleshooting

### Issue: Game doesn't start
**Check:**
- Console for errors
- Verify all imports are correct
- Check if UnifiedGameLoop is initialized

**Fix:**
```javascript
// Check if game loop exists
console.log(window.gameLoop);
// Should show UnifiedGameLoop instance
```

### Issue: Performance not improved
**Check:**
- Verify unified game loop is running
- Check if object pooling is active
- Verify service worker is caching

**Debug:**
```javascript
// Check game loop metrics
window.gameLoop.getMetrics();

// Check particle pool stats
window.uiManager.systems.particleSystem.particlePool.getStats();

// Check service worker
navigator.serviceWorker.getRegistration().then(reg => console.log(reg));
```

### Issue: Particles not rendering
**Check:**
- Verify particle pool is initialized
- Check if particles are active
- Verify canvas exists

**Debug:**
```javascript
const ps = window.uiManager.systems.particleSystem;
console.log('Initialized:', ps.initialized);
console.log('Sparkles:', ps.sparkles.length);
console.log('Pool stats:', ps.particlePool.getStats());
```

---

## ✅ Success Criteria

**Week 1 is successful if:**

1. ✅ **Game starts without errors**
2. ✅ **Unified game loop running** (check metrics)
3. ✅ **Object pooling active** (check pool stats)
4. ✅ **Service worker caching** (check Application tab)
5. ✅ **Performance improved** (FPS, memory, or load time)
6. ✅ **No regressions** (all features work)

---

## 📈 Expected Results

### Before Optimizations
- FPS: ~60 (with drops)
- Memory: ~150MB (growing)
- CPU: ~70%
- Load Time: ~2.5s

### After Optimizations
- FPS: 75-85 (stable)
- Memory: ~100MB (stable)
- CPU: ~50%
- Load Time: ~1.9-2.1s

### Improvement
- FPS: +25-40%
- Memory: -33%
- CPU: -28%
- Load Time: -16-24%

---

## 📝 Test Report Template

```markdown
## Week 1 Testing Report

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Browser + Version]

### Functionality Tests
- [ ] Game starts correctly
- [ ] Currency production works
- [ ] Visual updates smooth
- [ ] Particles render correctly
- [ ] Service worker works
- [ ] Offline page works

### Performance Tests
- Baseline FPS: [X]
- Current FPS: [X]
- Improvement: [X%]

- Baseline Memory: [X]MB
- Current Memory: [X]MB
- Improvement: [X%]

- Baseline Load Time: [X]ms
- Current Load Time: [X]ms
- Improvement: [X%]

### Issues Found
- [Issue 1]
- [Issue 2]

### Notes
[Any additional observations]
```

---

**Ready to test!** Follow this guide to validate Week 1 optimizations.

