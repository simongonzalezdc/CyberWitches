# Instructions for Creating Zip File

## Quick Methods

### Method 1: Use the Scripts (Easiest)

**On Mac/Linux:**
```bash
chmod +x package.sh
./package.sh
```

**On Windows:**
- Double-click `package.bat`
- OR right-click `package.ps1` → "Run with PowerShell"

### Method 2: Manual Method (Works Everywhere)

1. **Navigate to your project folder** (the one containing `index.html`)

2. **Select all files and folders** (Ctrl+A or Cmd+A)

3. **Create zip:**
   - **Windows:** Right-click → "Send to" → "Compressed (zipped) folder"
   - **Mac:** Right-click → "Compress [folder name]"
   - **Linux:** Right-click → "Compress" or use Archive Manager

4. **Rename the zip file** to something like `CyberWitches-v1.0.zip`

### Method 3: Command Line

**Mac/Linux:**
```bash
cd /path/to/CyberWitches
zip -r CyberWitches.zip . -x "node_modules/*" ".git/*" "*.DS_Store" "*.log" ".vscode/*" ".idea/*" "dist/*" "*.zip"
```

**Windows (PowerShell):**
```powershell
cd C:\path\to\CyberWitches
Compress-Archive -Path * -DestinationPath CyberWitches.zip -Force
```

**Windows (Command Prompt with 7-Zip):**
```cmd
cd C:\path\to\CyberWitches
7z a -tzip CyberWitches.zip * -xr!node_modules -xr!.git -xr!*.log
```

## What to Include

✅ **Include:**
- `index.html`
- `styles.css`
- `sw.js`
- `js/` folder (all JavaScript files)
- `images/` folder (all game images)
- `PACKAGING_GUIDE.md`
- `CHANGELOG.md`
- Any other game assets

❌ **Exclude:**
- `node_modules/` (if present)
- `.git/` folder
- `.DS_Store` files
- `*.log` files
- `.vscode/` or `.idea/` folders
- `dist/` folder (if present)
- Other zip files

## After Creating the Zip

1. **Test it:** Extract it to a temporary folder and verify `index.html` opens correctly
2. **Check size:** Should be reasonable (likely under 50MB unless you have many large images)
3. **Share it:** Send via email, cloud storage, or file sharing service

## File Size Tips

If the zip is very large:
- Check `images/` folder for large files
- Consider compressing images before including
- Make sure `node_modules/` is excluded
- Remove any unnecessary files

---

**Ready to share!** Once you have the zip file, send it to your friend along with `PACKAGING_GUIDE.md`.

