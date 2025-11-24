#!/bin/bash
# Quick script to restart the development server
# Kills any process on port 3000 and starts a fresh server

echo "🔍 Checking for processes on port 3000..."

# Find and kill process on port 3000
PID=$(lsof -ti:3000)

if [ ! -z "$PID" ]; then
    echo "🛑 Killing process $PID on port 3000..."
    kill -9 $PID
    sleep 1
    echo "✅ Process killed"
else
    echo "ℹ️  No process found on port 3000"
fi

echo "🚀 Starting development server on http://localhost:3000..."
echo "   (Server will open in your browser automatically)"
echo ""

# Start server (will open browser automatically with -o flag)
npx http-server . -p 3000 -o

# Note: This runs in foreground. Press Ctrl+C to stop.

