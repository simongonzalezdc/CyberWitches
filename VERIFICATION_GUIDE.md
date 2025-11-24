# 🧪 Verification Guide: Void Witch Protocol
**Testing the Phase 1-2 Optimizations**

---

## 📋 Pre-Flight Checklist

### 1. Visual Verification (Browser Required)
Open the game in Chrome/Firefox and check for:

#### ✅ Theme Application
- [ ] Background is deep "Void-950" (very dark, almost black with slight purple tint)
- [ ] HUD panels have frosted glass effect (backdrop-blur visible)
- [ ] Accent colors are vibrant neon (Magenta for primary, Cyan for secondary)
- [ ] Fonts are Space Grotesk (headers) and JetBrains Mono (data)

#### ✅ UI Components
- [ ] HUD top bar: Glass panel with glow effect
- [ ] Sidebar: Translucent with visible blur
- [ ] Cast button: Glowing orb with pulsing animation
- [ ] Tab navigation: Underline animates on hover

#### ✅ 3D Effects
- [ ] Main game board has subtle perspective tilt
- [ ] No performance issues from 3D transforms (check FPS)

---

## 🔧 Performance Verification

### 2. Check Game Loop Metrics
Open browser console and run:
```javascript
// Check game loop stats
window.gameLoop?.getMetrics()
// Expected: { isRunning: true, visualTimestep: 33.33 (30 FPS), logicTimestep: 100 (10 TPS) }

// Check particle pool
window.uiManager?.systems?.particleSystem?.particlePool?.getStats()
// Expected: { poolSize: X, activeCount: Y, utilization: < 1.0 }
```

### 3. Memory Monitoring
```javascript
// Check memory leak detection
if (performance.memory) {
    console.log(`Memory Usage: ${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
}
```

### 4. FPS Counter
Open Chrome DevTools:
1. Press `Shift + Cmd + P` (Mac) or `Shift + Ctrl + P` (Windows)
2. Type "Show frame rendering stats"
3. Enable "FPS meter"
4. **Target:** Stable 30 FPS for game logic, 60 FPS for animations

---

## 🎨 CSS Containment Verification

### 5. Check GPU Layers
In Chrome DevTools:
1. Go to "Rendering" tab
2. Enable "Layer borders"
3. **Expected:** HUD, Sidebar, and Main Content should have distinct layer borders (colored outlines)

---

## 🚨 Common Issues

### Issue: Fonts Not Loading
**Symptom:** Text looks like system font (Arial/Helvetica)
**Fix:** Check network tab for 403 errors on Google Fonts. Ensure CSP allows fonts.googleapis.com.

### Issue: Blur Effect Not Working
**Symptom:** Glass panels are solid, no blur
**Fix:** Check browser support for `backdrop-filter`. Safari < 14 requires `-webkit-backdrop-filter`.

### Issue: Performance Worse Than Before
**Symptom:** FPS drops below 30
**Fix:** 
1. Check if too many particles are active (should be max 25 on desktop)
2. Disable 3D transforms temporarily: Remove `game-board-3d` class
3. Check console for errors (may be blocking render)

---

## 📊 Success Metrics

After verification, you should see:
- **FPS:** 30 FPS stable (logic), 60 FPS animations
- **Memory:** < 100MB after 5 minutes of gameplay
- **Load Time:** < 2 seconds (cold start)
- **Visual Polish:** Glows, blurs, and animations all working

---

## 🛠️ Dev Server Commands

### Start Dev Server
```bash
# Using Python 3 (recommended)
python3 -m http.server 8000

# Or using Node.js (if you have http-server installed)
npx http-server -p 8000 -c-1
```

### Access Game
Open browser to: `http://localhost:8000`

---

## 🐛 Debugging Tools

### Enable Debug Mode
Add to browser console:
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check service worker status
navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('SW Registrations:', regs);
});

// Force service worker update
navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.update());
});
```

---

## ✅ Final Checklist

- [ ] Game loads without errors
- [ ] New theme is visible
- [ ] Glass effects are working
- [ ] FPS is stable at 30
- [ ] Memory usage is reasonable
- [ ] No console errors
- [ ] Cast button glows
- [ ] Particles are smooth

---

**If all checks pass, you're ready for Phase 3!**

