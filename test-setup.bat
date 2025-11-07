@echo off
REM Spellwright Tester Setup Script (Windows)
REM This script helps testers install and launch the game locally

echo ==========================================
echo Spellwright - Tester Setup Script
echo ==========================================
echo.

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Node.js found
    set HAS_NODE=true
) else (
    echo [X] Node.js not found
    set HAS_NODE=false
)

REM Check for Python
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] Python found
    set HAS_PYTHON=true
) else (
    echo [X] Python not found
    set HAS_PYTHON=false
)

REM Check for npm
where npm >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OK] npm found
    set HAS_NPM=true
) else (
    echo [X] npm not found
    set HAS_NPM=false
)

echo.
echo Checking dependencies...

REM Install npm dependencies if Node.js is available
if "%HAS_NODE%"=="true" if "%HAS_NPM%"=="true" (
    if exist package.json (
        echo Installing npm dependencies...
        call npm install
        echo [OK] Dependencies installed
    ) else (
        echo [WARNING] package.json not found, skipping npm install
    )
) else (
    echo [WARNING] Node.js/npm not available, skipping dependency installation
)

echo.
echo Starting local server...

REM Try to start server with npm first, then fallback to Python
if "%HAS_NODE%"=="true" if "%HAS_NPM%"=="true" if exist package.json (
    echo Starting server with npm...
    echo Server will be available at: http://localhost:8080
    echo Press Ctrl+C to stop the server
    echo.
    call npm start
) else if "%HAS_PYTHON%"=="true" (
    echo Starting server with Python...
    echo Server will be available at: http://localhost:8080
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8080
) else (
    echo [ERROR] Neither Node.js nor Python is available!
    echo.
    echo Please install one of the following:
    echo   - Node.js: https://nodejs.org/
    echo   - Python: https://www.python.org/downloads/
    echo.
    echo Alternatively, you can open index.html directly in your browser
    pause
    exit /b 1
)

