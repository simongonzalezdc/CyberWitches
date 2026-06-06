import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'images');

// Aggressive optimization configuration
const config = {
    backgrounds: {
        maxWidth: 1920,
        maxHeight: 1080,
        pngQuality: 80,
        webpQuality: 75
    },
    modals: {
        maxWidth: 1200,
        maxHeight: 800,
        pngQuality: 80,
        webpQuality: 75
    },
    ui: {
        maxWidth: 800,
        maxHeight: 600,
        pngQuality: 85,
        webpQuality: 80
    },
    achievements: {
        maxWidth: 600,
        maxHeight: 600,
        pngQuality: 85,
        webpQuality: 80
    },
    meditation: {
        maxWidth: 1600,
        maxHeight: 1200,
        pngQuality: 80,
        webpQuality: 75
    }
};

async function optimizeImage(inputPath, category) {
    const dir = path.dirname(inputPath);
    const ext = path.extname(inputPath);
    const basename = path.basename(inputPath, ext);

    // Skip if not PNG or already a backup
    if (ext !== '.png' || basename.includes('.backup')) {
        return null;
    }

    const categoryConfig = config[category] || config.ui;

    try {
        // Get original file size
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        // Get image metadata
        const metadata = await sharp(inputPath).metadata();

        // Calculate new dimensions (maintain aspect ratio)
        let newWidth = metadata.width;
        let newHeight = metadata.height;

        if (metadata.width > categoryConfig.maxWidth || metadata.height > categoryConfig.maxHeight) {
            const ratio = Math.min(categoryConfig.maxWidth / metadata.width, categoryConfig.maxHeight / metadata.height);
            newWidth = Math.round(metadata.width * ratio);
            newHeight = Math.round(metadata.height * ratio);
        }

        // Create optimized PNG
        const pngPath = inputPath + '.tmp';
        await sharp(inputPath)
            .resize(newWidth, newHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .png({
                quality: categoryConfig.pngQuality,
                compressionLevel: 9,
                adaptiveFiltering: true
            })
            .toFile(pngPath);

        // Create WebP version (usually 70-80% smaller)
        const webpPath = path.join(dir, basename + '.webp');
        await sharp(inputPath)
            .resize(newWidth, newHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({
                quality: categoryConfig.webpQuality,
                effort: 6 // Max compression effort
            })
            .toFile(webpPath);

        // Replace original PNG
        fs.renameSync(pngPath, inputPath);

        // Get new file sizes
        const pngStats = fs.statSync(inputPath);
        const webpStats = fs.statSync(webpPath);
        const pngSize = pngStats.size;
        const webpSize = webpStats.size;
        const pngSavings = ((originalSize - pngSize) / originalSize * 100).toFixed(1);
        const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

        return {
            file: path.basename(inputPath),
            original: originalSize,
            png: pngSize,
            webp: webpSize,
            pngSavings,
            webpSavings,
            dimensions: `${newWidth}x${newHeight}`
        };

    } catch (error) {
        console.error(`❌ Error optimizing ${path.basename(inputPath)}:`, error.message);
        return null;
    }
}

async function optimizeDirectory(dirPath, category) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const files = fs.readdirSync(dirPath);
    const results = [];

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isFile() && path.extname(file) === '.png') {
            const result = await optimizeImage(filePath, category);
            if (result) {
                results.push(result);
            }
        }
    }

    return results;
}

async function optimizeAll() {
    console.info('🚀 Starting aggressive image optimization...\n');
    console.info('This will:');
    console.info('  • Resize large images to optimal dimensions');
    console.info('  • Compress PNG files');
    console.info('  • Create WebP versions (70-80% smaller)\n');

    const categories = [
        { name: 'backgrounds', path: path.join(imagesDir, 'backgrounds') },
        { name: 'modals', path: path.join(imagesDir, 'modals') },
        { name: 'ui', path: path.join(imagesDir, 'ui') },
        { name: 'achievements', path: path.join(imagesDir, 'achievements') },
        { name: 'meditation', path: path.join(imagesDir, 'meditation') }
    ];

    let totalOriginal = 0;
    let totalPng = 0;
    let totalWebp = 0;
    let fileCount = 0;

    for (const category of categories) {
        console.info(`\n📁 Processing ${category.name}...`);
        const results = await optimizeDirectory(category.path, category.name);

        for (const result of results) {
            totalOriginal += result.original;
            totalPng += result.png;
            totalWebp += result.webp;
            fileCount++;

            console.info(`  ✅ ${result.file}:`);
            console.info(`     ${result.dimensions} | PNG: -${result.pngSavings}% | WebP: -${result.webpSavings}%`);
        }
    }

    console.info('\n' + '='.repeat(60));
    console.info('📊 OPTIMIZATION SUMMARY\n');
    console.info(`Files processed: ${fileCount}`);
    console.info(`Original total:  ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.info(`PNG total:       ${(totalPng / 1024 / 1024).toFixed(2)} MB (-${((totalOriginal - totalPng) / totalOriginal * 100).toFixed(1)}%)`);
    console.info(`WebP total:      ${(totalWebp / 1024 / 1024).toFixed(2)} MB (-${((totalOriginal - totalWebp) / totalOriginal * 100).toFixed(1)}%)`);
    console.info(`\nTotal savings (PNG):  ${((totalOriginal - totalPng) / 1024 / 1024).toFixed(2)} MB`);
    console.info(`Total savings (WebP): ${((totalOriginal - totalWebp) / 1024 / 1024).toFixed(2)} MB`);
    console.info('=' + '='.repeat(59));

    console.info('\n💡 NEXT STEPS:');
    console.info('  1. Update HTML/CSS to use <picture> element with WebP:');
    console.info('     <picture>');
    console.info('       <source srcset="image.webp" type="image/webp">');
    console.info('       <img src="image.png" alt="">');
    console.info('     </picture>');
    console.info('  2. Test all images load correctly');
    console.info('  3. Delete .backup.png files if happy with results\n');
}

optimizeAll().catch(console.error);
