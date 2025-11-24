# 🚀 Quick Start: Dev Server + Verification

## Server Status
✅ **Dev server started on:** `http://localhost:3000`

---

## 📝 Immediate Actions

### 1. Open Game
```bash
open http://localhost:3000
# Or manually navigate to: http://localhost:3000
```

### 2. Open Browser Console
- **Chrome/Edge:** `Cmd+Option+J` (Mac) or `Ctrl+Shift+J` (Windows)
- **Firefox:** `Cmd+Option+K` (Mac) or `Ctrl+Shift+K` (Windows)

### 3. Quick Health Check
Paste this into console:
```javascript
// Verify Phase 1 & 2 Implementation
console.log('🎮 Game Loop:', window.gameLoop?.getMetrics());
console.log('🎨 Theme Applied:', getComputedStyle(document.body).backgroundColor);
console.log('💾 Memory:', performance.memory ? 
    `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB` : 
    'Not supported');
console.log('⚡ FPS Target:', window.gameLoop?.visualTimestep ? 
    `${(1000 / window.gameLoop.visualTimestep).toFixed(0)} FPS` : 
    'N/A');
```

---

## 🔍 What to Look For

### Visual Checks (30 seconds)
1. **Background:** Should be very dark (almost black with purple tint)
2. **HUD Top Bar:** Should have frosted glass effect (blurred background visible)
3. **Cast Button:** Should have glowing purple aura
4. **Fonts:** Headers should be geometric (Space Grotesk), data should be mono (JetBrains Mono)

### Performance Checks (Console)
1. **Game Loop Running:** `window.gameLoop.isRunning` should be `true`
2. **FPS:** Should see 30 FPS in metrics (not 60)
3. **No Errors:** Console should be clean (warnings OK)

---

## ⚠️ Troubleshooting

### "Can't connect to localhost:3000"
**Solution:** Check terminal for errors. Server should say "Starting up http-server..."

### "Theme not loading"
**Solution:** Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### "Fonts look wrong"
**Solution:** Check Network tab for font loading errors. May take a few seconds on first load.

---

## 📊 Performance Baseline
After 60 seconds of gameplay, run:
```javascript
// Performance Report
{
    fps: window.gameLoop?.getMetrics(),
    memory: performance.memory ? 
        (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 
        'N/A',
    particlePool: window.uiManager?.systems?.particleSystem?.particlePool?.getStats()
}
```

**Expected Results:**
- FPS: 30 (visual), 10 TPS (logic)
- Memory: < 100 MB
- Particle Pool Utilization: < 80%

---

## ✅ Success Criteria
- [ ] Game loads without errors
- [ ] New "Void Witch" theme visible
- [ ] Cast button glows
- [ ] FPS stable at 30
- [ ] Memory < 100 MB

---

**All green? You're ready for Phase 3!**
**Issues? See `VERIFICATION_GUIDE.md` for detailed debugging.**

