#!/bin/bash

# Image Processing Script for Cyber Witches
# This script crops and optimizes all images to their final display sizes

cd "$(dirname "$0")"

# Image processing function
process_image() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"
    local crop_ratio="$5"  # center, top, bottom, etc.
    
    if [ ! -f "$input" ]; then
        echo "Warning: Input file not found: $input"
        return 1
    fi
    
    echo "Processing: $input -> $output ($width x $height)"
    
    # Get source dimensions
    local src_width=$(sips -g pixelWidth "$input" 2>/dev/null | grep pixelWidth | awk '{print $2}')
    local src_height=$(sips -g pixelHeight "$input" 2>/dev/null | grep pixelHeight | awk '{print $2}')
    
    if [ -z "$src_width" ] || [ -z "$src_height" ]; then
        echo "Error: Could not get dimensions for $input"
        return 1
    fi
    
    # Calculate crop dimensions (center crop)
    local crop_width=$width
    local crop_height=$height
    
    # If source is larger than target, crop from center
    if [ "$src_width" -gt "$width" ] || [ "$src_height" -gt "$height" ]; then
        # Calculate scale to fit (maintain aspect ratio, then crop)
        local scale_w=$(( width * 100 / src_width ))
        local scale_h=$(( height * 100 / src_height ))
        local scale=$(( scale_w > scale_h ? scale_w : scale_h ))
        
        # Resize to cover the target size (might be slightly larger)
        local temp_file="${output}.temp"
        sips -z "$height" "$width" "$input" --out "$temp_file" 2>/dev/null || {
            # If resize fails, try setting exact dimensions
            sips --setProperty format png --setProperty pixelWidth "$width" --setProperty pixelHeight "$height" "$input" --out "$temp_file" 2>/dev/null
        }
        
        # Move temp file to output
        if [ -f "$temp_file" ]; then
            mv "$temp_file" "$output"
        else
            # Fallback: just resize
            sips -z "$height" "$width" "$input" --out "$output" 2>/dev/null
        fi
    else
        # If source is smaller, resize to fit
        sips -z "$height" "$width" "$input" --out "$output" 2>/dev/null
    fi
    
    # Optimize
    if command -v pngquant &> /dev/null; then
        pngquant --quality=85-95 --ext .png --force "$output" 2>/dev/null
    fi
    
    echo "✓ Completed: $output"
}

# Clean up duplicates first (prefer files without " 2")
echo "Cleaning up duplicates..."
cd backgrounds
for file in *" 2.png"; do
    if [ -f "$file" ]; then
        base="${file% 2.png}"
        if [ -f "${base}.png" ]; then
            echo "Removing duplicate: $file (keeping ${base}.png)"
            rm -f "$file"
        else
            echo "Renaming: $file -> ${base}.png"
            mv "$file" "${base}.png"
        fi
    fi
done 2>/dev/null
cd ..

# Process images according to final display sizes

echo ""
echo "=== Processing Background Images ==="
process_image "backgrounds/main-game-bg.png" "backgrounds/main-game-bg.png" "1920" "1080" "center"
process_image "backgrounds/tab-workstations-bg.png" "backgrounds/tab-workstations-bg.png" "1600" "1200" "center"
process_image "backgrounds/tab-inscriptions-bg.png" "backgrounds/tab-inscriptions-bg.png" "1600" "1200" "center"
process_image "backgrounds/tab-boons-bg.png" "backgrounds/tab-boons-bg.png" "1600" "1200" "center"
process_image "backgrounds/tab-coven-bg.png" "backgrounds/tab-coven-bg.png" "1600" "1200" "center"
process_image "backgrounds/tab-experiment-bg.png" "backgrounds/tab-experiment-bg.png" "1600" "1200" "center"
process_image "backgrounds/hud-bg-pattern.png" "backgrounds/hud-bg-pattern.png" "512" "512" "center"

echo ""
echo "=== Processing Meditation Images ==="
# Check if meditation folder has the image, if not try backgrounds
if [ -f "meditation/meditation-canvas-bg.png" ]; then
    process_image "meditation/meditation-canvas-bg.png" "meditation/meditation-canvas-bg.png" "1200" "800" "center"
elif [ -f "backgrounds/meditation-canvas-bg.png" ]; then
    mkdir -p meditation
    process_image "backgrounds/meditation-canvas-bg.png" "meditation/meditation-canvas-bg.png" "1200" "800" "center"
    rm -f "backgrounds/meditation-canvas-bg.png"
fi

echo ""
echo "=== Processing Modal Images ==="
process_image "modals/prestige-scene.png" "modals/prestige-scene.png" "800" "600" "center"
process_image "modals/welcome-back-scene.png" "modals/welcome-back-scene.png" "800" "600" "center"

echo ""
echo "=== Processing Achievement Images ==="
process_image "achievements/achievement-unlock-scene.png" "achievements/achievement-unlock-scene.png" "512" "512" "center"

echo ""
echo "=== Processing UI Images ==="
process_image "ui/empty-state.png" "ui/empty-state.png" "600" "400" "center"
process_image "ui/experiment-result.png" "ui/experiment-result.png" "512" "512" "center"
process_image "ui/cast-button-icon.png" "ui/cast-button-icon.png" "64" "64" "center"
process_image "ui/workstation-card-icon.png" "ui/workstation-card-icon.png" "80" "80" "center"

echo ""
echo "=== Image Processing Complete ==="

