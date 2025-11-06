# How to Share the Game with a Friend

## Option 1: Send as ZIP File (Easiest)

### Step 1: Build the Game
```bash
npm run build:prod
```

### Step 2: Create ZIP File
**On Mac:**
```bash
cd dist
zip -r ../cyber-witches-game.zip .
cd ..
```

**On Windows:**
Right-click the `dist` folder → Send to → Compressed (zipped) folder

**On Linux:**
```bash
cd dist
zip -r ../cyber-witches-game.zip .
cd ..
```

### Step 3: Send the ZIP File
Send `cyber-witches-game.zip` to your friend via:
- Email
- File sharing service (Dropbox, Google Drive, etc.)
- Messaging app

### Step 4: Your Friend Unzips and Opens
1. Extract the ZIP file
2. Open `index.html` in their web browser
   - **Important**: They need to open it via a local web server (see below)

## Option 2: Simple Local Server (Recommended)

### For Your Friend (Easiest Setup)

**Option A: Using Python (if installed)**
```bash
# Navigate to the extracted folder
cd cyber-witches-game

# Python 3 (most common)
python3 -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```
Then open: `http://localhost:8000`

**Option B: Using Node.js (if installed)**
```bash
# Navigate to the extracted folder
cd cyber-witches-game

# Using npx (no installation needed)
npx http-server . -p 8000
```
Then open: `http://localhost:8000`

**Option C: Using PHP (if installed)**
```bash
# Navigate to the extracted folder
cd cyber-witches-game

# PHP 7+
php -S localhost:8000
```
Then open: `http://localhost:8000`

### Create a Simple Helper Script

I'll create helper scripts they can double-click to run the game!

