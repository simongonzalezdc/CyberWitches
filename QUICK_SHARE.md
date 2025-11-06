# 🎮 Quick Share Guide - Send to Friend

## The Easiest Way

### Option 1: Use the Packaging Script (Automatic)

**Mac/Linux:**
```bash
bash package-for-friend.sh
```

**Windows:**
Double-click `package-for-friend.bat`

This will:
1. Build the game for production
2. Create a ZIP file called `cyber-witches-game.zip`
3. Include everything your friend needs

Then just send `cyber-witches-game.zip` to your friend!

---

### Option 2: Manual ZIP (If Script Doesn't Work)

1. Build the game:
   ```bash
   npm run build:prod
   ```

2. Create ZIP from `dist/` folder:
   - **Mac**: Right-click `dist` folder → Compress
   - **Windows**: Right-click `dist` folder → Send to → Compressed folder
   - **Linux**: `zip -r cyber-witches-game.zip dist/`

3. Send the ZIP file to your friend

---

## What Your Friend Does

1. **Extract the ZIP** (double-click it)

2. **Open the extracted folder**

3. **Start the server:**
   - **Windows**: Double-click `start-server.bat`
   - **Mac/Linux**: Double-click `start-server.sh`

4. **Open browser** to: `http://localhost:8000`

5. **Play the game!** 🎮

---

## What's in the Package

- ✅ Complete game (all files)
- ✅ Helper scripts (auto-start server)
- ✅ Instructions (README.txt)
- ✅ Everything needed to run

---

## Notes

- The game needs a local web server (can't just double-click index.html)
- The helper scripts handle this automatically
- If helper scripts don't work, see README.txt for manual instructions
- Works on Windows, Mac, and Linux

---

## File Size

The ZIP file should be around 5-10 MB (depending on images).

---

## That's It!

Just send the ZIP file and your friend can test the game! 🚀

