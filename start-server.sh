#!/bin/bash
# Simple server script for Cyber Witches
# Double-click this file or run: bash start-server.sh

echo "🎮 Starting Cyber Witches Game Server..."
echo ""
echo "The game will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Try different server methods
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8000
elif command -v php &> /dev/null; then
    echo "Using PHP..."
    php -S localhost:8000
elif command -v node &> /dev/null; then
    echo "Using Node.js..."
    npx http-server . -p 8000
else
    echo "❌ No server found!"
    echo ""
    echo "Please install one of:"
    echo "  - Python 3: https://www.python.org/downloads/"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - PHP: https://www.php.net/downloads"
    echo ""
    echo "Or install http-server globally:"
    echo "  npm install -g http-server"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

