/**
 * Asset Optimization Script - Convert PNG to WebP
 * Reduces image sizes by 60-80% while maintaining quality
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    quality: 85, // WebP quality (0-100, 85 is good balance)
    imageDirs: ['images'], // Directories to process
    extensions: ['.png', '.jpg', '.jpeg'], // File extensions to convert
    skipExisting: false, // Skip if WebP already exists
    createBackup: true, // Backup originals to /images-backup
};

// Stats tracking
const stats = {
    totalFiles: 0,
    converted: 0,
    skipped: 0,
    failed: 0,
    originalSize: 0,
    newSize: 0,
};

/**
 * Get all image files recursively
 */
function getImageFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getImageFiles(filePath, fileList);
        } else {
            const ext = path.extname(file).toLowerCase();
            if (CONFIG.extensions.includes(ext)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

/**
 * Convert image to WebP
 */
async function convertToWebP(inputPath) {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, '.webp');

    // Check if WebP already exists
    if (CONFIG.skipExisting && fs.existsSync(outputPath)) {
        console.log(`⏭️  Skipping ${inputPath} (WebP exists)`);
        stats.skipped++;
        return;
    }

    try {
        // Get original file size
        const originalStat = fs.statSync(inputPath);
        stats.originalSize += originalStat.size;

        // Convert to WebP
        await sharp(inputPath)
            .webp({ quality: CONFIG.quality })
            .toFile(outputPath);

        // Get new file size
        const newStat = fs.statSync(outputPath);
        stats.newSize += newStat.size;

        // Calculate savings
        const savings = ((1 - newStat.size / originalStat.size) * 100).toFixed(1);
        const originalMB = (originalStat.size / 1024 / 1024).toFixed(2);
        const newMB = (newStat.size / 1024 / 1024).toFixed(2);

        console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
        console.log(`   ${originalMB}MB → ${newMB}MB (${savings}% reduction)`);

        stats.converted++;
    } catch (error) {
        console.error(`❌ Failed to convert ${inputPath}:`, error.message);
        stats.failed++;
    }
}

/**
 * Create backup of original images
 */
function createBackup() {
    if (!CONFIG.createBackup) return;

    const backupDir = 'images-backup';

    if (!fs.existsSync(backupDir)) {
        console.log('📦 Creating backup directory...');

        // Copy entire images directory
        fs.cpSync('images', backupDir, { recursive: true });

        console.log(`✅ Backup created at /${backupDir}`);
    } else {
        console.log('⏭️  Backup already exists, skipping');
    }
}

/**
 * Generate picture element reference guide
 */
function generatePictureGuide() {
    const guide = `# Image Usage Guide - WebP with PNG Fallback

## How to Use WebP Images in HTML

Replace old \`<img>\` tags with \`<picture>\` elements for WebP with PNG fallback:

### Before:
\`\`\`html
<img src="images/backgrounds/main-game-bg.png" alt="Main game background">
\`\`\`

### After:
\`\`\`html
<picture>
    <source srcset="images/backgrounds/main-game-bg.webp" type="image/webp">
    <img src="images/backgrounds/main-game-bg.png" alt="Main game background">
</picture>
\`\`\`

## In CSS (Background Images)

\`\`\`css
/* Use WebP with fallback */
.element {
    background-image: url('images/backgrounds/main-game-bg.png'); /* Fallback */
    background-image: url('images/backgrounds/main-game-bg.webp'); /* Modern browsers */
}

/* Or use @supports */
.element {
    background-image: url('images/backgrounds/main-game-bg.png');
}

@supports (background-image: url('test.webp')) {
    .element {
        background-image: url('images/backgrounds/main-game-bg.webp');
    }
}
\`\`\`

## In JavaScript

\`\`\`javascript
// Feature detection
function supportsWebP() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
}

const ext = supportsWebP() ? '.webp' : '.png';
const imagePath = \`images/backgrounds/main-game-bg\${ext}\`;
\`\`\`

## Converted Images:

${stats.totalFiles} images processed
${stats.converted} successfully converted
${stats.skipped} skipped
${stats.failed} failed

Total size reduction: ${((1 - stats.newSize / stats.originalSize) * 100).toFixed(1)}%
Original size: ${(stats.originalSize / 1024 / 1024).toFixed(2)}MB
New size: ${(stats.newSize / 1024 / 1024).toFixed(2)}MB
Savings: ${((stats.originalSize - stats.newSize) / 1024 / 1024).toFixed(2)}MB

## Browser Support

WebP is supported by:
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Edge 18+
- ✅ Safari 14+ (iOS 14+)
- ✅ Opera 12.1+

Fallback PNG ensures 100% compatibility.
`;

    fs.writeFileSync('WEBP_USAGE_GUIDE.md', guide);
    console.log('\n📄 Created WEBP_USAGE_GUIDE.md');
}

/**
 * Main execution
 */
async function main() {
    console.log('🎨 Asset Optimization Script - PNG to WebP Conversion\n');

    // Create backup
    createBackup();

    // Get all image files
    console.log('\n🔍 Scanning for images...');
    const imageFiles = [];
    CONFIG.imageDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            const files = getImageFiles(dir);
            imageFiles.push(...files);
        }
    });

    stats.totalFiles = imageFiles.length;
    console.log(`Found ${stats.totalFiles} images\n`);

    if (stats.totalFiles === 0) {
        console.log('❌ No images found to process');
        return;
    }

    // Convert images
    console.log('🔄 Converting to WebP...\n');
    for (const file of imageFiles) {
        await convertToWebP(file);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONVERSION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total files processed: ${stats.totalFiles}`);
    console.log(`Successfully converted: ${stats.converted}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Failed: ${stats.failed}`);
    console.log('');
    console.log(`Original total size: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`New total size: ${(stats.newSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total savings: ${((stats.originalSize - stats.newSize) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Reduction: ${((1 - stats.newSize / stats.originalSize) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    // Generate usage guide
    generatePictureGuide();

    console.log('\n✅ Asset optimization complete!');
    console.log('📝 Next steps:');
    console.log('   1. Review converted images');
    console.log('   2. Update HTML/CSS to use WebP with fallbacks (see WEBP_USAGE_GUIDE.md)');
    console.log('   3. Test in multiple browsers');
    console.log('   4. Delete original PNGs once verified (backup in /images-backup)');
}

// Run
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
