# 🚀 Quick Fix Instructions

## Your Immediate Action

### Step 1: Clear Browser Cache (Most Important!)
**This fixes the `checkUnlocks is not a function` error**

#### On Chrome/Brave/Edge:
1. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

#### On Safari:
1. Press `Cmd+Shift+R` OR
2. Go to Develop menu → Empty Web Inspector Caches

#### On Firefox:
1. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

#### Manual Cache Clear (All Browsers):
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click "Clear site data"
4. Reload the page

---

### Step 2: Test the Fixes

**Test 1 - Cast Button:**
- Click the cast/spell button
- ✅ Should work without errors
- Check console (F12) - should NOT see `checkUnlocks is not a function`

**Test 2 - Exec Button:**
- Go to Experiment tab
- Click "Run_Protocol" button
- ✅ Should NOT show NaN
- Should show proper recipe requirements

---

## What We Fixed

### Issue 1: `TypeError: this.gameState.checkUnlocks is not a function`
- **Root:** Old files cached by browser's service worker
- **Fix:** Bumped cache version from v16 to v17
- **Files:** Updated `sw.js` in root and dist/
- **Result:** Browser will fetch fresh files on next reload

### Issue 2: `NaN` when clicking exec button
- **Root:** Unvalidated recipe data being passed to formatter
- **Fixes Applied:**
  - `formatShort()` now has defensive null/undefined checks
  - Recipe renderer validates all inputs/outputs before displaying
  - Any invalid values logged to console for debugging

---

## Verification

After hard refresh, you should see:

```javascript
// In Console - Should see this:
console.log('Service Worker cache: v17') // New version loaded

// Should NOT see:
// TypeError: this.gameState.checkUnlocks is not a function

// Recipe display should show:
// Crystal Dust: 5.00 / 10.00  ✅ (not "NaN / NaN")
```

---

## If Issues Persist

1. **Check console for warnings** - Look for "Invalid recipe" warnings
2. **Report any console errors** - Include the error text
3. **Try incognito/private mode** - Rules out cached browser extensions
4. **Check Service Worker status:**
   - DevTools → Application → Service Workers
   - Verify cache shows "v17"

---

## Pro Tips

- 🟢 **Green = Good:** Exp button shows proper numbers
- 🔴 **Red = Problem:** NaN or errors in console
- 🔄 **Cache Strategy:** Service worker caches files for offline play, but needs version bump to deploy updates

This fix pattern will be reused whenever major changes are deployed to ensure all browsers get updates!

