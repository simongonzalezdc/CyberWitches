# PowerShell script to package CyberWitches game
# Run this script from the project root directory

Write-Host "Packaging CyberWitches game..." -ForegroundColor Green

# Get current date/time for filename
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "CyberWitches-$timestamp.zip"

Write-Host "Creating zip file: $zipName" -ForegroundColor Yellow

# Files/directories to exclude
$excludeItems = @(
    "node_modules",
    ".git",
    ".DS_Store",
    "*.log",
    ".vscode",
    ".idea",
    "dist",
    "*.zip",
    "*.tar.gz"
)

# Get all items in current directory
$items = Get-ChildItem -Path . -Exclude $excludeItems

# Create zip file
try {
    Compress-Archive -Path $items -DestinationPath $zipName -Force
    $fileSize = (Get-Item $zipName).Length / 1MB
    Write-Host "✓ Zip file created: $zipName" -ForegroundColor Green
    Write-Host "File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
    Write-Host "Share this file with your friend!" -ForegroundColor Cyan
} catch {
    Write-Host "Error creating zip file: $_" -ForegroundColor Red
    exit 1
}

