#!/usr/bin/env node

/**
 * Build script for Cyber Witches
 * Bundles and minifies JavaScript files for production
 */

import * as esbuild from 'esbuild';
import { readdir, copyFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.argv.includes('--production');
const distDir = join(__dirname, 'dist');

// Files to copy as-is
const staticFiles = [
    'index.html',
    'play.html',
    'manifest.json',
    'offline.html',
    'sw.js',
    'robots.txt',
    'sitemap.xml',
    'start-server.sh',
    'start-server.bat'
];

// Directories to copy recursively.
// 'styles' holds theme.css, which index.html loads (<link href="styles/theme.css">);
// omitting it 404s the design-token stylesheet in the production build.
// 'vendor' holds the self-hosted Tone.js, loaded via <script src="vendor/...">;
// without copying it the production audio engine 404s.
// 'screenshots' is referenced by the web manifest for install surfaces.
const staticDirs = ['icons', 'docs', 'images', 'css', 'styles', 'vendor', 'screenshots'];

async function copyStaticFiles() {
    console.info('📁 Copying static files...');
  
    // Create dist directory
    if (!existsSync(distDir)) {
        await mkdir(distDir, { recursive: true });
    }
  
    // Copy individual files
    for (const file of staticFiles) {
        const src = join(__dirname, file);
        const dst = join(distDir, file);
        if (existsSync(src)) {
            await copyFile(src, dst);
            console.info(`  ✓ Copied ${file}`);
        }
    }
  
    // Copy directories recursively
    async function copyDir(src, dst) {
        if (!existsSync(src)) return;
    
        await mkdir(dst, { recursive: true });
        const entries = await readdir(src, { withFileTypes: true });
    
        for (const entry of entries) {
            const srcPath = join(src, entry.name);
            const dstPath = join(dst, entry.name);
      
            if (entry.isDirectory()) {
                await copyDir(srcPath, dstPath);
            } else {
                await copyFile(srcPath, dstPath);
            }
        }
    }
  
    for (const dir of staticDirs) {
        const src = join(__dirname, dir);
        const dst = join(distDir, dir);
        if (existsSync(src)) {
            await copyDir(src, dst);
            console.info(`  ✓ Copied directory ${dir}`);
        }
    }
}

async function buildJavaScript() {
    console.info('🔨 Building JavaScript bundles...');

    const distJsDir = join(distDir, 'js');

    if (!existsSync(distJsDir)) {
        await mkdir(distJsDir, { recursive: true });
    }

    // Common build options
    const buildOptions = {
        minify: isProduction,
        format: 'esm',
        target: 'es2022', // Slightly older for better browser support
        sourcemap: !isProduction ? 'inline' : false,
        logLevel: 'info',
        treeShaking: true,
        platform: 'browser',
        charset: 'utf8',
        drop: isProduction ? ['console'] : [], // Remove console.info in production
        legalComments: 'none', // Remove comments in production
        external: ['https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js'] // Keep Tone.js external
    };

    try {
        // Build with code splitting: dynamic import() calls produce separate
        // chunk files that load on demand, keeping the critical bundle small.
        console.info('  📦 Building game bundles with code splitting...');
        const result = await esbuild.build({
            ...buildOptions,
            bundle: true,
            entryPoints: ['js/game.js'],
            outdir: distJsDir,
            splitting: true,
            metafile: true,
            entryNames: '[name].bundle'
        });

        // Report chunk sizes
        console.info('    ✓ Game bundles built');
        const outputs = Object.entries(result.metafile.outputs);
        let totalSize = 0;
        for (const [file, info] of outputs) {
            if (!file.endsWith('.map')) {
                const sizeKB = (info.bytes / 1024).toFixed(1);
                const label = file.includes('game.bundle') ? 'critical' :
                    file.includes('chunk') ? 'lazy' : 'other';
                console.info(`    📊 ${label}: ${sizeKB} KB — ${file.split('/').pop()}`);
                totalSize += info.bytes;
            }
        }
        console.info(`    📊 Total: ${(totalSize / 1024).toFixed(1)} KB`);

        // Special handling for debug.js in production
        const bundlePath = join(distJsDir, 'game.bundle.js');
        if (isProduction) {
            let content = readFileSync(bundlePath, 'utf8');
            content = content.replace(/const DEBUG = true;/g, 'const DEBUG = false;');
            writeFileSync(bundlePath, content, 'utf8');
            console.info('    ✓ DEBUG disabled in production');
        }

        // Update play.html to use bundled file (the game page, not the landing page)
        if (isProduction) {
            await updatePlayHtml();
            await optimizePlayHtmlForLCP();
        }

    } catch (error) {
        console.error('  ✗ Error building bundle:', error.message);
        console.error('  Stack:', error.stack);
        throw error;
    }
}

async function bundleCssImports() {
    console.info('📦 Bundling CSS imports into main.css...');
    const cssDir = join(distDir, 'css');
    const mainCssPath = join(cssDir, 'main.css');

    if (!existsSync(mainCssPath)) {
        console.info('  ⚠ main.css not found in dist, skipping CSS bundling');
        return;
    }

    let mainCss = readFileSync(mainCssPath, 'utf8');
    // Match @import blocks with both url('...') and '...' syntaxes, allowing arbitrary whitespace
    const importRegex = /@import\s+(?:url\s*\(\s*['"](.+?)['"]\s*\)|['"](.+?)['"])\s*;?/g;
    const importedFiles = [];
    let match;

    while ((match = importRegex.exec(mainCss)) !== null) {
        importedFiles.push(match[1] || match[2]);
    }

    if (importedFiles.length === 0) {
        console.info('  ✓ No @imports to bundle');
        return;
    }

    for (const file of importedFiles) {
        const filePath = join(cssDir, file);
        if (!existsSync(filePath)) {
            throw new Error(`Imported CSS file not found: ${file}`);
        }
        const content = readFileSync(filePath, 'utf8');
        // Replace the matched @import block in-place with the file content
        const fileImportRegex = new RegExp(
            `@import\\s+(?:url\\s*\\(\\s*['"]${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*\\)|['"]${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"])\\s*;?`,
            'g'
        );
        mainCss = mainCss.replace(fileImportRegex, `/* START ${file} */\n${content}\n/* END ${file} */`);
        // Remove the now-redundant standalone file from dist to keep it clean
        try {
            const { unlink } = await import('fs/promises');
            await unlink(filePath);
        } catch {
            // ignore unlink errors
        }
    }

    writeFileSync(mainCssPath, mainCss, 'utf8');
    console.info(`  ✓ Bundled ${importedFiles.length} CSS files into main.css`);
}

async function updatePlayHtml() {
    console.info('📝 Updating play.html for production bundles...');
    const playPath = join(distDir, 'play.html');
  
    if (!existsSync(playPath)) {
        console.info('  ⚠ play.html not found in dist, skipping update');
        return;
    }
  
    let html = readFileSync(playPath, 'utf8');
  
    // Remove all individual script tags (keep Tone.js CDN and any other external scripts)
    // Match script tags with type="module" and src starting with "js/" — may include
    // additional attributes like fetchpriority="high" between src and >.
    const scriptTagPattern = /<script\s+type="module"\s+src="js\/[^"]+\.js"[^>]*><\/script>\s*\n?/gi;
    html = html.replace(scriptTagPattern, '');
  
    // Add bundled script with fetchpriority="high" for critical path.
    // Lazy chunks are loaded via dynamic import() and need no script tag.
    const bundledScript = `
    <!-- Critical JS bundle — loads first, fetchpriority=high -->
    <script type="module" src="js/game.bundle.js" fetchpriority="high"></script>
    <!-- Lazy chunks load on demand via dynamic import() after game shell renders -->
`;
  
    // Insert before closing body tag
    html = html.replace('</body>', bundledScript + '\n</body>');
  
    writeFileSync(playPath, html, 'utf8');
    console.info('  ✓ Updated play.html with bundled script');
}

async function optimizePlayHtmlForLCP() {
    console.info('⚡ Optimizing play.html for LCP...');
    const playPath = join(distDir, 'play.html');
    if (!existsSync(playPath)) {
        console.info('  ⚠ play.html not found in dist, skipping LCP optimization');
        return;
    }

    let html = readFileSync(playPath, 'utf8');

    // Inline theme.css so variables are available instantly
    const themeCssPath = join(distDir, 'styles', 'theme.css');
    let themeCss = '';
    if (existsSync(themeCssPath)) {
        themeCss = readFileSync(themeCssPath, 'utf8');
    }

    // Inline critical.css for above-the-fold layout and components
    const criticalCssPath = join(distDir, 'css', 'critical.css');
    let criticalCss = '';
    if (existsSync(criticalCssPath)) {
        criticalCss = readFileSync(criticalCssPath, 'utf8');
    }

    // Minify the inlined CSS (remove comments and extra whitespace)
    const minifyCss = (css) => css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();

    themeCss = minifyCss(themeCss);
    criticalCss = minifyCss(criticalCss);

    // Replace the two render-blocking CSS links with:
    //   1. Inlined theme variables + critical layout/components
    //   2. Async main.css for everything else
    const inlineCss = criticalCss
        ? `${themeCss}\n${criticalCss}`
        : themeCss;

    const replacement = `
    <!-- Critical CSS inlined for instant first paint (theme + above-the-fold layout) -->
    <style>${inlineCss}</style>
    <!-- Load main.css without blocking first paint -->
    <link rel="stylesheet" href="css/main.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="css/main.css"></noscript>`;

    html = html.replace(
        /<link rel="stylesheet" href="styles\/theme\.css">\s*<link rel="stylesheet" href="css\/main\.css">/,
        replacement
    );

    writeFileSync(playPath, html, 'utf8');
    console.info('  ✓ play.html optimized for LCP (theme.css + critical.css inlined, main.css async)');
}

/**
 * Remove unreferenced images from dist to save bandwidth.
 * Scans dist HTML, CSS, JS, manifest for actual image references
 * and deletes everything else in dist/images/.
 */
async function pruneUnusedImages() {
    console.info('🗑️  Pruning unreferenced images from dist...');
    const { readdir: readdirAsync, unlink, readFile, stat: statAsync } = await import('fs/promises');

    const imagesDir = join(distDir, 'images');
    if (!existsSync(imagesDir)) return;

    // Collect all image references from dist files
    const referencedPaths = new Set();
    const textFileExts = ['.html', '.css', '.js', '.json'];
    const distFiles = await readdirAsync(distDir, { recursive: true });

    for (const file of distFiles) {
        const filePath = join(distDir, file);
        const fstat = await statAsync(filePath).catch(() => null);
        if (!fstat || fstat.isDirectory()) continue;
        if (!textFileExts.some(ext => file.endsWith(ext))) continue;

        const content = await readFile(filePath, 'utf8');
        const imageRefs = content.match(/images\/[^\s"')\]]+/g) || [];
        for (const ref of imageRefs) {
            referencedPaths.add(ref);
        }
    }

    // Walk images dir and delete unreferenced files
    let pruned = 0;
    let savedBytes = 0;
    const imageFiles = await readdirAsync(imagesDir, { recursive: true });

    for (const file of imageFiles) {
        const filePath = join(imagesDir, file);
        const fstat = await statAsync(filePath).catch(() => null);
        if (!fstat || fstat.isDirectory()) continue;

        const relPath = `images/${file}`;
        if (!referencedPaths.has(relPath)) {
            savedBytes += fstat.size;
            await unlink(filePath);
            pruned++;
        }
    }

    if (pruned > 0) {
        const savedKB = (savedBytes / 1024).toFixed(0);
        console.info(`  ✓ Pruned ${pruned} unreferenced images (${savedKB} KB freed)`);
    } else {
        console.info('  ✓ No unreferenced images found');
    }
}

async function build() {
    console.info(isProduction ? '🚀 Building for production...' : '🔧 Building for development...');
    console.info('');

    try {
        await copyStaticFiles();
        console.info('');
        if (isProduction) {
            await bundleCssImports();
            console.info('');
        }
        await buildJavaScript();
        console.info('');
        if (isProduction) {
            await pruneUnusedImages();
            console.info('');
        }
        console.info('✅ Build complete!');
        console.info(`📦 Output directory: ${distDir}`);
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
