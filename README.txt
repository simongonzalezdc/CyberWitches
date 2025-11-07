═══════════════════════════════════════════════════════════════
  Spellwright - How to Play
═══════════════════════════════════════════════════════════════

🎮 QUICK START
═══════════════════════════════════════════════════════════════

IMPORTANT: You cannot just double-click index.html!
You need to run this through a local web server.

═══════════════════════════════════════════════════════════════

METHOD 1: Use the Helper Script (Easiest!)
═══════════════════════════════════════════════════════════════

Windows: Double-click "start-server.bat"
Mac/Linux: Double-click "start-server.sh" or run:
           bash start-server.sh

Then open your browser and go to:
   http://localhost:8000

═══════════════════════════════════════════════════════════════

METHOD 2: Manual Server
═══════════════════════════════════════════════════════════════

Option A - Python (if you have it installed):
  Open Terminal/Command Prompt in this folder, then:
  
  python3 -m http.server 8000
  (or: python -m SimpleHTTPServer 8000)
  
  Then open: http://localhost:8000

Option B - Node.js (if you have it installed):
  Open Terminal/Command Prompt in this folder, then:
  
  npx http-server . -p 8000
  
  Then open: http://localhost:8000

Option C - PHP (if you have it installed):
  Open Terminal/Command Prompt in this folder, then:
  
  php -S localhost:8000
  
  Then open: http://localhost:8000

═══════════════════════════════════════════════════════════════

WHY A SERVER?
═══════════════════════════════════════════════════════════════

Modern browsers require a web server for:
- Service Worker (offline mode)
- Module imports (ES modules)
- Security features

Opening index.html directly won't work properly!

═══════════════════════════════════════════════════════════════

TROUBLESHOOTING
═══════════════════════════════════════════════════════════════

If you don't have Python/Node.js/PHP:
  - Install Python from: https://www.python.org/downloads/
  - Or Node.js from: https://nodejs.org/
  - Or PHP from: https://www.php.net/downloads

If the server doesn't start:
  - Make sure you're in this folder
  - Try a different port: change 8000 to 8080 or 3000
  - Check if port 8000 is already in use

If the game doesn't load:
  - Make sure you're using http://localhost:8000 (not file://)
  - Check browser console for errors (F12)
  - Try a different browser (Chrome, Firefox, Edge)

═══════════════════════════════════════════════════════════════

NEED HELP?
═══════════════════════════════════════════════════════════════

Contact the person who sent you this game!

═══════════════════════════════════════════════════════════════

