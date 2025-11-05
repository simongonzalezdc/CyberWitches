#!/usr/bin/env node

/**
 * Build script for Cyber Witches
 * Bundles and minifies JavaScript files for production
 */

import * as esbuild from 'esbuild';
import { readdir, stat, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.argv.includes('--production');
const distDir = join(__dirname, 'dist');

// Files to copy as-is
const staticFiles = [
  'index.html',
  'styles.css',
  'manifest.json',
  'sw.js'
];

// Directories to copy recursively
const staticDirs = ['icons', 'docs'];

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

async function buildJavaScript() {
  console.log('🔨 Building JavaScript...');
  
  const jsDir = join(__dirname, 'js');
  const distJsDir = join(distDir, 'js');
  
  if (!existsSync(distJsDir)) {
    await mkdir(distJsDir, { recursive: true });
  }
  
  // Get all JS files
  const files = await readdir(jsDir);
  const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.backup'));
  
  // Build options - Updated for esbuild 0.25 and ES2023 (latest stable as of Nov 2025)
  const buildOptions = {
    bundle: false, // Don't bundle - keep as ES modules
    minify: isProduction,
    format: 'esm',
    target: 'es2023', // Latest stable ECMAScript standard
    sourcemap: !isProduction ? 'inline' : false,
    logLevel: 'info',
    treeShaking: true,
    platform: 'browser',
    charset: 'utf8',
  };
  
  // Build each JS file
  for (const file of jsFiles) {
    const entryPoint = join(jsDir, file);
    const outfile = join(distJsDir, file);
    
    try {
      await esbuild.build({
        ...buildOptions,
        entryPoints: [entryPoint],
        outfile: outfile,
      });
      console.log(`  ✓ Built ${file}`);
    } catch (error) {
      console.error(`  ✗ Error building ${file}:`, error.message);
    }
  }
  
  // Update index.html to use minified files if in production
  if (isProduction) {
    console.log('📝 Updating index.html for production...');
    const indexPath = join(distDir, 'index.html');
    // Note: In a real scenario, you might want to bundle everything
    // For now, we'll keep the module structure but minified
  }
}

async function build() {
  console.log(isProduction ? '🚀 Building for production...' : '🔧 Building for development...');
  console.log('');
  
  try {
    await copyStaticFiles();
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

