# 🔧 How to Clear Browser Cache and Fix the checkUnlocks Error

## The Problem
You're seeing this error:
```
TypeError: this.gameState.checkUnlocks is not a function
```

**This is a caching issue.** The code has been fixed, but your browser is serving the old cached version.

---

## ✅ Solution: Clear Cache and Reload

### Option 1: Hard Refresh (Quickest)
**Chrome/Edge/Firefox:**
1. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. This forces a reload bypassing cache

**Safari:**
1. Press `Cmd+Option+R`
2. Or hold Shift while clicking the reload button

---

### Option 2: Clear Service Worker Cache (Recommended)

**Chrome DevTools:**
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. Click **Unregister** next to your service worker
5. Click **Clear site data** button at top
6. Refresh the page (`F5` or `Cmd+R`)

**Firefox DevTools:**
1. Open DevTools (`F12`)
2. Go to **Application** → **Service Workers**
3. Click **Unregister**
4. Go to **Storage** → **Cache Storage**
5. Right-click and delete all caches
6. Refresh the page

---

### Option 3: Clear All Browser Data (Nuclear Option)

**Chrome/Edge:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select **Cached images and files**
3. Select **Time range: All time**
4. Click **Clear data**
5. Reload your game

**Firefox:**
1. Press `Ctrl+Shift+Delete`
2. Select **Cache**
3. Time range: **Everything**
4. Click **Clear Now**

**Safari:**
1. Safari menu → **Preferences**
2. **Advanced** tab → Enable "Show Develop menu"
3. Develop menu → **Empty Caches**
4. Or: Safari → **Clear History** → All History

---

## ✅ Verify the Fix

After clearing cache, check the browser console:
1. Open DevTools Console (`F12`)
2. Type: `castManager.handleCast.toString()`
3. Look for the line that says `checkMilestones` (correct) NOT `checkUnlocks` (old)

You should see:
```javascript
if (typeof this.gameState.checkMilestones === 'function') {
    this.gameState.checkMilestones();
}
```

---

## 🔄 For Development: Disable Caching

To prevent this during development:

**Chrome DevTools:**
1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Check **Disable cache** (only works while DevTools is open)
4. Keep DevTools open while developing

**Service Worker:**
1. In DevTools → **Application** → **Service Workers**
2. Check **Update on reload**
3. Keep DevTools open

---

## 📝 What Was Fixed

The code in `castManager.js` was updated from:
```javascript
// OLD (broken)
this.gameState.checkUnlocks();
```

To:
```javascript
// NEW (fixed)
if (typeof this.gameState.checkMilestones === 'function') {
    this.gameState.checkMilestones();
}
```

The fix is already in your code, you just need to clear the cache to load it!

---

## 🚨 Still Not Working?

If the error persists after clearing cache:

1. **Check the file timestamp:**
   ```bash
   ls -la js/modules/game/castManager.js
   ```
   Should show recent modification date

2. **Verify the fix is in the file:**
   ```bash
   grep -n "checkMilestones" js/modules/game/castManager.js
   ```
   Should show line 71 with `checkMilestones`

3. **Check for multiple copies:**
   ```bash
   find . -name "castManager.js" -type f
   ```
   Should only show one file

4. **Restart your local server:**
   - Stop the server (Ctrl+C)
   - Clear the dist folder: `rm -rf dist/*`
   - Rebuild: `npm run build`
   - Restart: `npm start`

---

## 💡 Prevention for Future

To avoid caching issues during development:

1. **Add cache busting to your build:**
   ```javascript
   // In build.js or index.html
   <script src="js/castManager.js?v=${Date.now()}"></script>
   ```

2. **Update service worker cache version:**
   ```javascript
   // In sw.js
   const CACHE_VERSION = 'v2'; // Increment this when you make changes
   ```

3. **Use "Disable cache" during development**
   (Chrome DevTools → Network → Disable cache)

---

**TL;DR: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to hard refresh and clear the cache!**

