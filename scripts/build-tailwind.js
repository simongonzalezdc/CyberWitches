#!/usr/bin/env node
/**
 * Tailwind CSS Build Script
 * Processes tailwind.css and outputs compiled CSS
 * 
 * Week 5: Build Process
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const inputFile = join(projectRoot, 'css', 'tailwind.css');
const outputFile = join(projectRoot, 'dist', 'css', 'tailwind.css');

console.log('🎨 Building Tailwind CSS...');
console.log(`   Input: ${inputFile}`);
console.log(`   Output: ${outputFile}`);

// Check if input file exists
if (!existsSync(inputFile)) {
    console.error(`❌ Error: Input file not found: ${inputFile}`);
    process.exit(1);
}

try {
    // Build Tailwind CSS
    execSync(
        `npx @tailwindcss/cli -i "${inputFile}" -o "${outputFile}" --minify`,
        {
            cwd: projectRoot,
            stdio: 'inherit'
        }
    );
    
    console.log('✅ Tailwind CSS built successfully!');
    
    // Check output file size
    if (existsSync(outputFile)) {
        const fs = await import('fs');
        const stats = fs.statSync(outputFile);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`   Output size: ${sizeKB} KB`);
    }
    
} catch (error) {
    console.error('❌ Error building Tailwind CSS:', error.message);
    process.exit(1);
}

