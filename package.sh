#!/bin/bash
# Package CyberWitches game for sharing
# Run this script from the project root directory

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Packaging CyberWitches game...${NC}"

# Get the project directory name
PROJECT_NAME="CyberWitches"
ZIP_NAME="CyberWitches-$(date +%Y%m%d-%H%M%S).zip"

# Files/directories to exclude
EXCLUDE_LIST=(
    "node_modules"
    ".git"
    ".DS_Store"
    "*.log"
    ".vscode"
    ".idea"
    "dist"
    "*.zip"
    "*.tar.gz"
)

# Build exclude string for zip command
EXCLUDE_ARGS=""
for item in "${EXCLUDE_LIST[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS -x $item"
done

# Create zip file
echo -e "${YELLOW}Creating zip file: $ZIP_NAME${NC}"

if command -v zip &> /dev/null; then
    zip -r "$ZIP_NAME" . $EXCLUDE_ARGS -x "*.git*" "*.DS_Store" "node_modules/*" ".vscode/*" ".idea/*" "dist/*" "*.log"
    echo -e "${GREEN}✓ Zip file created: $ZIP_NAME${NC}"
    echo -e "${GREEN}File size: $(du -h "$ZIP_NAME" | cut -f1)${NC}"
else
    echo -e "${YELLOW}Error: 'zip' command not found.${NC}"
    echo -e "${YELLOW}Please install zip utility or use manual method.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Packaging complete!${NC}"
echo -e "${GREEN}Share the file: $ZIP_NAME${NC}"

