#!/bin/bash

# CyberWitches Tester Setup Script
# This script helps testers install and launch the game locally

set -e  # Exit on error

echo "=========================================="
echo "CyberWitches - Tester Setup Script"
echo "=========================================="
echo ""

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js found: $NODE_VERSION"
    HAS_NODE=true
else
    echo "✗ Node.js not found"
    HAS_NODE=false
fi

# Check for Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✓ Python3 found: $PYTHON_VERSION"
    HAS_PYTHON=true
else
    echo "✗ Python3 not found"
    HAS_PYTHON=false
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm found: $NPM_VERSION"
    HAS_NPM=true
else
    echo "✗ npm not found"
    HAS_NPM=false
fi

echo ""
echo "Checking dependencies..."

# Install npm dependencies if Node.js is available
if [ "$HAS_NODE" = true ] && [ "$HAS_NPM" = true ]; then
    if [ -f "package.json" ]; then
        echo "Installing npm dependencies..."
        npm install
        echo "✓ Dependencies installed"
    else
        echo "⚠ package.json not found, skipping npm install"
    fi
else
    echo "⚠ Node.js/npm not available, skipping dependency installation"
fi

echo ""
echo "Starting local server..."

# Try to start server with npm first, then fallback to Python
if [ "$HAS_NODE" = true ] && [ "$HAS_NPM" = true ] && [ -f "package.json" ]; then
    echo "Starting server with npm..."
    echo "Server will be available at: http://localhost:8080"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm start
elif [ "$HAS_PYTHON" = true ]; then
    echo "Starting server with Python..."
    echo "Server will be available at: http://localhost:8080"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server 8080
else
    echo "❌ Error: Neither Node.js nor Python3 is available!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Node.js: https://nodejs.org/"
    echo "  - Python3: https://www.python.org/downloads/"
    echo ""
    echo "Alternatively, you can open index.html directly in your browser"
    exit 1
fi

