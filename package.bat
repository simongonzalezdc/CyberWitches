@echo off
REM Package CyberWitches game for sharing
REM Run this script from the project root directory

echo Packaging CyberWitches game...

REM Get current date/time for filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set datetime=%datetime:~0,8%-%datetime:~8,6%
set ZIP_NAME=CyberWitches-%datetime%.zip

echo Creating zip file: %ZIP_NAME%

REM Check if PowerShell is available (Windows 10+)
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using PowerShell to create zip...
    powershell -Command "Compress-Archive -Path * -DestinationPath '%ZIP_NAME%' -Force -Exclude 'node_modules','.git','.DS_Store','*.log','.vscode','.idea','dist','*.zip','*.tar.gz'"
    echo.
    echo ✓ Zip file created: %ZIP_NAME%
    echo.
    echo Share this file with your friend!
    pause
    exit /b 0
)

REM Fallback: Check if 7-Zip is available
where 7z >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using 7-Zip to create archive...
    7z a -tzip "%ZIP_NAME%" * -xr!node_modules -xr!.git -xr!.DS_Store -xr!*.log -xr!.vscode -xr!.idea -xr!dist -xr!*.zip -xr!*.tar.gz
    echo.
    echo ✓ Zip file created: %ZIP_NAME%
    echo.
    echo Share this file with your friend!
    pause
    exit /b 0
)

REM Fallback: Check if WinRAR is available
where winrar >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using WinRAR to create archive...
    winrar a -afzip -r "%ZIP_NAME%" * -xnode_modules -x.git -x.DS_Store -x*.log -x.vscode -x.idea -xdist -x*.zip -x*.tar.gz
    echo.
    echo ✓ Zip file created: %ZIP_NAME%
    echo.
    echo Share this file with your friend!
    pause
    exit /b 0
)

echo.
echo Error: No zip utility found!
echo.
echo Please install one of the following:
echo   1. PowerShell (usually pre-installed on Windows 10+)
echo   2. 7-Zip (download from https://www.7-zip.org/)
echo   3. WinRAR (download from https://www.winrar.com/)
echo.
echo Or manually create a zip file:
echo   1. Select all files in the project folder
echo   2. Right-click -^> Send to -^> Compressed (zipped) folder
echo.
pause

