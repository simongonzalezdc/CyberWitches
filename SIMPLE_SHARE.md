# 🎮 Simple Way to Share with a Friend

## Super Easy Method (3 Steps)

### Step 1: Build the Game
```bash
npm run build:prod
```

### Step 2: Create ZIP File
**Mac/Linux:**
```bash
bash package-for-friend.sh
```

**Windows:**
```bash
package-for-friend.bat
```

Or double-click: `package-for-friend.sh` (Mac) or `package-for-friend.bat` (Windows)

### Step 3: Send the ZIP File
Send `cyber-witches-game.zip` to your friend via email, Dropbox, Google Drive, etc.

---

## What Your Friend Needs to Do

1. **Extract the ZIP file** (just double-click it)

2. **Open the extracted folder**

3. **Start the server:**
   - **Windows**: Double-click `start-server.bat`
   - **Mac/Linux**: Double-click `start-server.sh` (or right-click → Open)

4. **Open browser** and go to: `http://localhost:8000`

That's it! The game should load.

---

## If Your Friend Doesn't Have Python/Node.js/PHP

The helper scripts will try to find any of these automatically.

If none are found, they'll see instructions to install:
- **Python** (easiest): https://www.python.org/downloads/
- **Node.js**: https://nodejs.org/
- **PHP**: https://www.php.net/downloads

---

## Alternative: Manual Method

If the helper scripts don't work, your friend can:

1. Open Terminal/Command Prompt in the extracted folder
2. Run one of these commands:

**Python:**
```bash
python3 -m http.server 8000
```

**Node.js:**
```bash
npx http-server . -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

3. Open browser to `http://localhost:8000`

---

## What's Included in the ZIP

- ✅ The entire game (ready to play)
- ✅ Helper scripts to start the server
- ✅ README.txt with instructions
- ✅ Everything needed to run the game

---

## Troubleshooting

**"Port 8000 already in use"**
- Change the port number in the script to 8080 or 3000

**"No server found"**
- Install Python from https://www.python.org/downloads/
- Or Node.js from https://nodejs.org/

**Game doesn't load**
- Make sure they're using `http://localhost:8000` (not `file://`)
- Try a different browser
- Check browser console (F12) for errors

---

## That's It!

Your friend can now test the game locally on their computer! 🎉

