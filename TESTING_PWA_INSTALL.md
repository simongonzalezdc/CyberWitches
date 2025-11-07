# Testing PWA Installation Features

This guide explains how to test the PWA installation improvements.

## Quick Start

1. **Start the local server:**
   ```bash
   ./test-setup.sh
   # or
   npm start
   # or
   python3 -m http.server 8080
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:8080` (or the port shown)
   - Use Chrome, Edge, or Safari for best PWA support

## Testing Checklist

### 1. Install Button Visibility

**Test:** The install button should appear in the HUD when installation is available.

**Steps:**
1. Open the game in Chrome/Edge
2. Look for the "📱 Install" button in the top HUD (next to Cast button)
3. The button should be visible and pulsing

**Expected Result:**
- Install button appears in HUD when `beforeinstallprompt` event fires
- Button has pulsing animation
- Button is hidden if app is already installed

### 2. Welcome/Install Modal

**Test:** First-time users should see a welcome modal with install option.

**Steps:**
1. Clear browser data or use incognito/private mode
2. Open the game for the first time
3. Wait for the `beforeinstallprompt` event

**Expected Result:**
- Welcome modal appears automatically
- Shows benefits: offline play, auto-save, faster startup, full screen
- "Install Now" button is prominent
- "Maybe Later" button dismisses modal
- Modal can be closed with X button

**To reset and test again:**
```javascript
// In browser console:
localStorage.removeItem('installPromptShown');
// Then refresh the page
```

### 3. Install Prompt (Chrome/Edge)

**Test:** Clicking install button should show native install prompt.

**Steps:**
1. Click the "📱 Install" button in HUD
2. Or click "Install Now" in the welcome modal

**Expected Result:**
- Native browser install prompt appears
- User can accept or dismiss
- Success notification appears if accepted
- Install button hides after installation

### 4. Platform-Specific Instructions

**Test:** Manual instructions should appear for unsupported browsers or when prompt fails.

**Steps:**
1. Use a browser that doesn't support `beforeinstallprompt` (Firefox, older browsers)
2. Or click install button when no prompt is available
3. Or click "Install Now" in welcome modal when prompt isn't available

**Expected Result:**
- Instructions modal appears
- Shows platform-specific steps:
  - **iOS Safari:** Share button → Add to Home Screen
  - **Android:** Menu → Add to Home screen
  - **Desktop Chrome/Edge:** Install icon in address bar
  - **Other:** Generic instructions

### 5. Already Installed Detection

**Test:** Install button should be hidden when app is already installed.

**Steps:**
1. Install the app (if possible)
2. Launch the installed app
3. Check the HUD

**Expected Result:**
- Install button is hidden
- No install prompts appear
- App works normally

**To test in browser (simulate installed state):**
```javascript
// In browser console, check if detection works:
window.matchMedia('(display-mode: standalone)').matches
// Should be false in browser, true in installed app
```

### 6. Service Worker Registration

**Test:** Service worker should register and enable offline functionality.

**Steps:**
1. Open browser DevTools (F12)
2. Go to Application tab → Service Workers
3. Check if service worker is registered

**Expected Result:**
- Service worker shows as "activated and running"
- Cache is populated
- App works offline (after first load)

**To test offline:**
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh the page
4. App should still load from cache

### 7. Manifest.json

**Test:** Manifest should be valid and loaded.

**Steps:**
1. Open DevTools → Application tab → Manifest
2. Check manifest details

**Expected Result:**
- Manifest shows all icons
- Name: "Cyber Witches: Idle Coven"
- Short name: "Cyber Witches"
- Display: "standalone"
- Theme color: "#FF2DAA"
- All icons are valid

### 8. Apple/iOS Meta Tags

**Test:** iOS-specific meta tags should be present.

**Steps:**
1. View page source (Ctrl+U / Cmd+U)
2. Check `<head>` section

**Expected Result:**
- `apple-mobile-web-app-capable` = "yes"
- `apple-mobile-web-app-status-bar-style` = "black-translucent"
- `apple-mobile-web-app-title` = "Cyber Witches"
- `apple-touch-icon` link present

**To test on iOS:**
1. Open in Safari on iPhone/iPad
2. Tap Share button
3. Scroll down to "Add to Home Screen"
4. App should install with proper icon and name

### 9. Install Success Flow

**Test:** After installation, user should see success notification.

**Steps:**
1. Click install button
2. Accept the install prompt
3. Wait for installation

**Expected Result:**
- Success notification: "Cyber Witches is now installed! Play offline anytime!"
- Welcome modal closes (if open)
- Install button hides
- App can be launched from desktop/home screen

### 10. Error Handling

**Test:** Errors should be handled gracefully with fallback instructions.

**Steps:**
1. Simulate an error (disable service worker, block install prompt, etc.)
2. Try to install

**Expected Result:**
- Error is caught and logged
- Fallback instructions modal appears
- User can still install manually

## Browser-Specific Testing

### Chrome/Edge (Desktop)
- **Best support:** Full PWA features
- **Install prompt:** Native browser prompt
- **Test:** Click install button → Should show native prompt

### Chrome (Android)
- **Install prompt:** Native Android prompt
- **Test:** Menu → "Install app" or "Add to Home screen"
- **Alternative:** Install button in HUD

### Safari (iOS)
- **No `beforeinstallprompt`:** Uses manual instructions
- **Test:** Share button → "Add to Home Screen"
- **Check:** Welcome modal should show iOS instructions

### Firefox
- **Limited PWA support:** May not show install prompt
- **Test:** Should show manual instructions
- **Check:** Install button may not appear, but instructions modal should work

## Debugging Tips

### Check if install prompt is available:
```javascript
// In browser console:
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt available!', e);
});
```

### Force show welcome modal:
```javascript
// In browser console:
localStorage.removeItem('installPromptShown');
// Then trigger the install prompt event manually (if possible)
```

### Check service worker status:
```javascript
// In browser console:
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('Service Worker:', reg);
});
```

### Check if app is installed:
```javascript
// In browser console:
const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                   window.navigator.standalone || 
                   document.referrer.includes('android-app://');
console.log('Is installed:', isInstalled);
```

## Common Issues

### Install button not appearing:
- **Cause:** `beforeinstallprompt` event not firing
- **Fix:** Check browser support, ensure HTTPS (or localhost), check service worker

### Welcome modal not showing:
- **Cause:** Already shown before (`installPromptShown` in localStorage)
- **Fix:** Clear localStorage: `localStorage.removeItem('installPromptShown')`

### Service worker not registering:
- **Cause:** Not served over HTTPS (or localhost), or file not found
- **Fix:** Ensure `sw.js` exists and is accessible

### Icons not showing:
- **Cause:** Icon files missing or incorrect paths
- **Fix:** Check `icons/` directory and manifest.json paths

## Testing on Different Devices

### Desktop (Windows/Mac/Linux)
- Use Chrome or Edge for best experience
- Install button should appear in HUD
- Native install prompt should work

### Mobile (Android)
- Use Chrome for best experience
- Install button in HUD or browser menu
- Should install as standalone app

### Mobile (iOS)
- Use Safari (required for PWA)
- Manual installation via Share menu
- Should show iOS-specific instructions

## Next Steps

After testing:
1. Verify all features work as expected
2. Test on multiple browsers/devices
3. Check offline functionality
4. Verify install success flow
5. Test error handling

Happy testing! 🎮📱

