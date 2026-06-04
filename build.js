#!/usr/bin/env node

/**
 * Build script for Cyber Witches
 * Bundles and minifies JavaScript files for production
 */

import * as esbuild from 'esbuild';
import { readdir, stat, copyFile, mkdir } from 'fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.argv.includes('--production');
const distDir = join(__dirname, 'dist');

// Files to copy as-is
const staticFiles = [
  'index.html',
  'manifest.json',
  'sw.js',
  'start-server.sh',
  'start-server.bat'
];

// Directories to copy recursively.
// 'styles' holds theme.css, which index.html loads (<link href="styles/theme.css">);
// omitting it 404s the design-token stylesheet in the production build.
const staticDirs = ['icons', 'docs', 'images', 'css', 'styles'];

async function copyStaticFiles() {
  console.log('📁 Copying static files...');
  
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
      console.log(`  ✓ Copied ${file}`);
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
      console.log(`  ✓ Copied directory ${dir}`);
    }
  }
}

async function buildTailwindCSS() {
  console.log('🎨 Building Tailwind CSS...');
  
  const tailwindInput = join(__dirname, 'css', 'tailwind.css');
  const tailwindOutput = join(distDir, 'css', 'tailwind.css');
  const distCssDir = join(distDir, 'css');
  
  if (!existsSync(distCssDir)) {
    await mkdir(distCssDir, { recursive: true });
  }
  
  // Check if Tailwind is installed
  try {
    execSync('npx @tailwindcss/cli --version', { stdio: 'ignore' });
  } catch (_error) {
    console.log('  ⚠️  Tailwind CSS not installed. Skipping Tailwind build.');
    console.log('  💡 Run: npm install -D tailwindcss@latest @tailwindcss/cli@latest');
    return;
  }
  
  if (!existsSync(tailwindInput)) {
    console.log('  ⚠️  tailwind.css not found. Skipping Tailwind build.');
    return;
  }
  
  try {
    execSync(
      `npx @tailwindcss/cli -i "${tailwindInput}" -o "${tailwindOutput}" ${isProduction ? '--minify' : ''}`,
      {
        cwd: __dirname,
        stdio: 'inherit'
      }
    );
    
    if (existsSync(tailwindOutput)) {
      const stats = await stat(tailwindOutput);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ✓ Tailwind CSS built (${sizeKB} KB)`);
    }
  } catch (error) {
    console.error('  ✗ Error building Tailwind CSS:', error.message);
    // Don't fail the build if Tailwind fails
    console.log('  ⚠️  Continuing build without Tailwind CSS...');
  }
}

async function buildJavaScript() {
  console.log('🔨 Building JavaScript bundles...');
  
  const jsDir = join(__dirname, 'js');
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
    drop: isProduction ? ['console'] : [], // Remove console.log in production
    legalComments: 'none', // Remove comments in production
    external: ['https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.js'], // Keep Tone.js external
  };
  
  try {
    // Build main game bundle - bundles everything into one file
    console.log('  📦 Building main game bundle...');
    const result = await esbuild.build({
      ...buildOptions,
      bundle: true,
      entryPoints: ['js/game.js'],
      outfile: join(distJsDir, 'game.bundle.js'),
      splitting: false,
    });
    
    console.log('    ✓ Main game bundle built');
    
    // Get bundle size
    const bundlePath = join(distJsDir, 'game.bundle.js');
    if (existsSync(bundlePath)) {
      const stats = await stat(bundlePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`    📊 Bundle size: ${sizeKB} KB (${sizeMB} MB)`);
    }
    
    // Special handling for debug.js in production
    if (isProduction) {
      let content = readFileSync(bundlePath, 'utf8');
      content = content.replace(/const DEBUG = true;/g, 'const DEBUG = false;');
      writeFileSync(bundlePath, content, 'utf8');
      console.log('    ✓ DEBUG disabled in production');
    }
    
    // Update index.html to use bundled file
    if (isProduction) {
      await updateIndexHtml();
    }
    
  } catch (error) {
    console.error('  ✗ Error building bundle:', error.message);
    console.error('  Stack:', error.stack);
    throw error;
  }
}

async function updateIndexHtml() {
  console.log('📝 Updating index.html for production bundles...');
  const indexPath = join(distDir, 'index.html');
  
  if (!existsSync(indexPath)) {
    console.log('  ⚠ index.html not found in dist, skipping update');
    return;
  }
  
  let html = readFileSync(indexPath, 'utf8');
  
  // Remove all individual script tags (keep Tone.js CDN and any other external scripts)
  // Match script tags with type="module" and src starting with "js/"
  const scriptTagPattern = /<script\s+type="module"\s+src="js\/[^"]+\.js"><\/script>\s*/gi;
  html = html.replace(scriptTagPattern, '');
  
  // Add bundled script
  const bundledScript = `
    <!-- Bundled JavaScript - All modules combined for better performance -->
    <script type="module" src="js/game.bundle.js"></script>
`;
  
  // Insert before closing body tag
  html = html.replace('</body>', bundledScript + '\n</body>');
  
  writeFileSync(indexPath, html, 'utf8');
  console.log('  ✓ Updated index.html with bundled script');
}

async function build() {
  console.log(isProduction ? '🚀 Building for production...' : '🔧 Building for development...');
  console.log('');
  
  try {
    await copyStaticFiles();
    console.log('');
    await buildTailwindCSS();
    console.log('');
    await buildJavaScript();
    console.log('');
    console.log('✅ Build complete!');
    console.log(`📦 Output directory: ${distDir}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();

