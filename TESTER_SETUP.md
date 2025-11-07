# CyberWitches - Tester Setup Guide

This guide helps testers quickly set up and launch the game locally.

## Quick Start

### Option 1: Using the Setup Script (Recommended)

**For Mac/Linux:**
```bash
./test-setup.sh
```

**For Windows:**
```batch
test-setup.bat
```

The script will:
1. Check for Node.js and Python
2. Install dependencies (if needed)
3. Start a local server
4. Open the game in your browser

### Option 2: Manual Setup

#### Using Node.js (Recommended)

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Install the LTS version

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   - Navigate to: http://localhost:8080

#### Using Python

1. **Install Python 3** (if not already installed)
   - Download from: https://www.python.org/downloads/
   - Python 3.6 or higher required

2. **Start the server:**
   ```bash
   python3 -m http.server 8080
   ```

3. **Open in browser:**
   - Navigate to: http://localhost:8080

#### Direct File Opening

If you don't have Node.js or Python, you can open `index.html` directly in your browser:
- Double-click `index.html`
- Or right-click → "Open with" → Choose your browser

**Note:** Some features may not work when opening directly (like service workers).

## Troubleshooting

### Server won't start

**Error: "Port 8080 already in use"**
- Another application is using port 8080
- Solution: Close the other application or use a different port
- For Python: `python3 -m http.server 8081`
- For Node.js: Edit `package.json` to change the port

### Game not loading

1. **Check browser console** (F12)
   - Look for error messages
   - Common issues: JavaScript errors, missing files

2. **Try a different browser**
   - Recommended: Chrome, Firefox, or Edge
   - Some browsers may have compatibility issues

3. **Clear browser cache**
   - Old cached files may cause issues
   - Clear cache and reload

### Dependencies won't install

**Error: "npm not found"**
- Node.js is not installed or not in PATH
- Solution: Install Node.js from https://nodejs.org/

**Error: "Permission denied"**
- On Mac/Linux, you may need sudo (not recommended)
- Solution: Fix npm permissions or use a Node version manager

## System Requirements

- **Browser:** Chrome, Firefox, Edge, or Safari (latest versions)
- **JavaScript:** Must be enabled
- **LocalStorage:** Must be enabled (for saving game progress)
- **Memory:** 2GB+ RAM recommended
- **Storage:** ~50MB for game files

## Testing Checklist

After setup, verify:
- [ ] Game loads without errors
- [ ] Can click the Cast button
- [ ] Can navigate between tabs
- [ ] Game saves progress (check localStorage)
- [ ] No console errors (F12 → Console tab)

## Getting Help

If you encounter issues:
1. Check the browser console (F12) for errors
2. Try a different browser
3. Clear browser cache and reload
4. Check that all files are present in the directory

## Notes

- The game runs entirely in the browser (no backend server required)
- Game progress is saved in browser localStorage
- Some features require a local server (service workers, etc.)
- Opening `index.html` directly may have limited functionality

