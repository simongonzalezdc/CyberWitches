import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backgroundsDir = path.join(__dirname, 'images', 'backgrounds');

// Configuration for each background
const backgrounds = [
    {
        name: 'main-game-bg.png',
        // Main game background - keep large for full screen
        maxWidth: 2560,
        maxHeight: 1440,
        quality: 85
    },
    {
        name: 'tab-workstations-bg.png',
        // Tab backgrounds - good size for panels
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 85
    },
    {
        name: 'tab-inscriptions-bg.png',
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 85
    },
    {
        name: 'tab-experiment-bg.png',
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 85
    },
    {
        name: 'tab-coven-bg.png',
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 85
    },
    {
        name: 'tab-boons-bg.png',
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 85
    },
    {
        name: 'meditation-canvas-bg.png',
        // Meditation canvas - smaller since it's for a specific area
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 85
    }
];

async function optimizeImage(config) {
    const inputPath = path.join(backgroundsDir, config.name);
    const backupPath = path.join(backgroundsDir, config.name.replace('.png', '.backup.png'));
    
    // Check if file exists
    if (!fs.existsSync(inputPath)) {
        console.warn(`⚠️  File not found: ${config.name}`);
        return;
    }
    
    // Get original file size
    const originalStats = fs.statSync(inputPath);
    const originalSize = originalStats.size;
    
    try {
        // Create backup
        console.log(`📦 Backing up ${config.name}...`);
        fs.copyFileSync(inputPath, backupPath);
        
        // Get image metadata
        const metadata = await sharp(inputPath).metadata();
        console.log(`📐 Original size: ${metadata.width}x${metadata.height} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
        
        // Calculate new dimensions (maintain aspect ratio)
        let newWidth = metadata.width;
        let newHeight = metadata.height;
        
        if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
            const ratio = Math.min(config.maxWidth / metadata.width, config.maxHeight / metadata.height);
            newWidth = Math.round(metadata.width * ratio);
            newHeight = Math.round(metadata.height * ratio);
        }
        
        // Optimize image
        console.log(`🔧 Optimizing ${config.name} to ${newWidth}x${newHeight}...`);
        
        await sharp(inputPath)
            .resize(newWidth, newHeight, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .png({
                quality: config.quality,
                compressionLevel: 9,
                adaptiveFiltering: true,
                palette: false // Keep full color
            })
            .toFile(inputPath + '.tmp');
        
        // Replace original with optimized version
        fs.renameSync(inputPath + '.tmp', inputPath);
        
        // Get new file size
        const newStats = fs.statSync(inputPath);
        const newSize = newStats.size;
        const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ Optimized ${config.name}: ${(newSize / 1024 / 1024).toFixed(2)} MB (${savings}% reduction)`);
        console.log(`   Backup saved as: ${path.basename(backupPath)}\n`);
        
    } catch (error) {
        console.error(`❌ Error optimizing ${config.name}:`, error.message);
        // Restore from backup if optimization failed
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, inputPath);
            console.log(`   Restored from backup\n`);
        }
    }
}

async function optimizeAll() {
    console.log('🚀 Starting image optimization...\n');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backgroundsDir)) {
        console.error(`❌ Backgrounds directory not found: ${backgroundsDir}`);
        process.exit(1);
    }
    
    // Optimize each image
    for (const config of backgrounds) {
        await optimizeImage(config);
    }
    
    console.log('✨ Optimization complete!');
    console.log('\n📝 Note: Original files are backed up with .backup.png extension');
    console.log('   You can delete backups once you verify the optimized images look good.\n');
}

optimizeAll().catch(console.error);


