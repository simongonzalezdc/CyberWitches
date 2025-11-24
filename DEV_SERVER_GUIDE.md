# 🚀 Development Server Guide

## Quick Commands

### Start Server (New Way - Recommended)
```bash
./restart-server.sh
```
This script automatically:
- Kills any existing process on port 3000
- Starts a fresh dev server
- Opens your browser to http://localhost:3000

### Start Server (Standard)
```bash
npm run dev
```

### If Port 3000 is Busy
```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it (replace PID with actual number from above)
kill -9 PID

# Then start normally
npm run dev
```

---

## Cache Issues?

### Option 1: Use Special Cache Clear Page
1. Go to: **http://localhost:3000/force-cache-clear.html**
2. Click "Clear All Caches Now"
3. Click "Launch Game"
4. ✅ Done!

### Option 2: Manual Hard Refresh
- **Mac:** `Cmd+Shift+R`
- **Windows/Linux:** `Ctrl+Shift+R`

### Option 3: DevTools Clear
1. Open DevTools (`F12` or `Cmd+Option+I`)
2. Go to **Application** tab
3. Click **Clear site data** button
4. Refresh page

---

## Current Status

✅ **Server:** Running on port 3000 (PID: see terminal)  
✅ **Cache Version:** v18 (latest)  
✅ **Tests:** 817 passing  
✅ **Linter:** 0 errors, 0 warnings  

---

## Common Issues

### "Address already in use" Error
**Cause:** Another process is using port 3000  
**Fix:** Run `./restart-server.sh` or manually kill the process

### "checkUnlocks is not a function" Error
**Cause:** Browser cache serving old code  
**Fix:** Visit http://localhost:3000/force-cache-clear.html

### Can't Commit to Git
**Cause:** Usually permissions or git state issue  
**Check:**
```bash
git status                    # See what's up
git diff                      # See changes
git add .                     # Stage changes
git commit -m "Your message"  # Commit
```

---

## Git Quick Reference

```bash
# See status
git status

# See changes
git diff

# Stage all changes
git add .

# Commit
git commit -m "Description of changes"

# Push to remote
git push

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes (CAREFUL!)
git reset --hard HEAD
```

---

## Useful Ports

- **3000** - Development server (http-server)
- **3001** - Alternative port (if 3000 is busy)

To use alternative port:
```bash
npx http-server . -p 3001 -o
```

---

## Files Changed Today

✅ Fixed:
- `tests/unit/game.test.js` - Import path
- `eslint.config.js` - Enhanced rules
- `js/audioSystem.js` - Added .catch()
- `js/modules/ui/uiManager.js` - Added .catch()
- `js/gameInit.js` - Added .catch()
- `sw.js` - Cache v18

✅ Created:
- `force-cache-clear.html` - Cache clearing page
- `restart-server.sh` - Server restart script
- `DEV_SERVER_GUIDE.md` - This file

---

## Testing Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run both
npm run ci

# Test with coverage
npm run test:coverage
```

---

## Browser Testing

1. Start server: `./restart-server.sh`
2. Clear cache: Visit http://localhost:3000/force-cache-clear.html
3. Test game: http://localhost:3000
4. Open DevTools: `F12` or `Cmd+Option+I`
5. Check Console for errors
6. Check Network tab for failed requests
7. Check Application > Service Workers

---

## Need Help?

- **Port conflict:** Use `./restart-server.sh`
- **Cache issues:** Visit `force-cache-clear.html`
- **Git issues:** Run `git status` and share output
- **Error messages:** Check browser Console (F12)

---

**Last Updated:** November 24, 2025  
**Cache Version:** v18  
**Server Status:** ✅ Running (port 3000)

