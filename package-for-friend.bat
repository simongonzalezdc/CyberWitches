@echo off
REM Package the game for sharing with a friend (Windows)
REM Double-click this file to create a ZIP ready to send

echo 🎮 Packaging Cyber Witches for sharing...
echo.

REM Build for production
echo 📦 Building for production...
call npm run build:prod

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo 📦 Creating ZIP file...

REM Create ZIP using PowerShell (available on Windows 7+)
powershell -Command "Compress-Archive -Path dist\* -DestinationPath cyber-witches-game.zip -Force"

if %errorlevel% neq 0 (
    echo ❌ Failed to create ZIP file!
    echo.
    echo Try using 7-Zip or WinRAR to compress the 'dist' folder manually.
    pause
    exit /b 1
)

echo.
echo ✅ Done!
echo.
echo 📁 File created: cyber-witches-game.zip
echo.
echo 📧 Ready to share! Send this file to your friend.
echo.
echo Your friend should:
echo   1. Extract the ZIP file
echo   2. Open the extracted folder
echo   3. Double-click 'start-server.bat'
echo   4. Open browser to http://localhost:8000
echo.
pause

