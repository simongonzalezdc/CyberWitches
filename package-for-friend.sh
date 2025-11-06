#!/bin/bash
# Package the game for sharing with a friend
# This creates a ZIP file ready to send

echo "🎮 Packaging Cyber Witches for sharing..."
echo ""

# Build for production
echo "📦 Building for production..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create ZIP file
echo ""
echo "📦 Creating ZIP file..."
cd dist

# Create the ZIP (excluding .DS_Store and other system files)
zip -r ../cyber-witches-game.zip . -x "*.DS_Store" "*.git*" "*.md"

cd ..

echo ""
echo "✅ Done!"
echo ""
echo "📁 File created: cyber-witches-game.zip"
echo ""
echo "📧 Ready to share! Send this file to your friend."
echo ""
echo "Your friend should:"
echo "  1. Extract the ZIP file"
echo "  2. Open the extracted folder"
echo "  3. Double-click 'start-server.bat' (Windows) or 'start-server.sh' (Mac/Linux)"
echo "  4. Open browser to http://localhost:8000"
echo ""

