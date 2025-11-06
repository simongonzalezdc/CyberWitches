@echo off
REM Simple server script for Cyber Witches (Windows)
REM Double-click this file to run

echo 🎮 Starting Cyber Witches Game Server...
echo.
echo The game will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python...
    python -m http.server 8000
    goto :end
)

REM Try PHP
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using PHP...
    php -S localhost:8000
    goto :end
)

REM Try Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Node.js...
    npx http-server . -p 8000
    goto :end
)

echo ❌ No server found!
echo.
echo Please install one of:
echo   - Python: https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo   - PHP: https://www.php.net/downloads
echo.
pause
exit /b 1

:end

