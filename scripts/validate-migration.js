#!/usr/bin/env node
/**
 * Migration Validation Script
 * Validates Tailwind CSS migration progress
 * 
 * Week 7: Final Validation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const cssDir = join(projectRoot, 'css');
const distDir = join(projectRoot, 'dist', 'css');

// Components to check
const componentsToMigrate = [
    'btn-cast',
    'card',
    'card-title',
    'card-header',
    'tab-btn',
    'btn-primary',
    'main-game',
    'sidebar',
    'hud',
    'tabs-content',
    'control-deck',
    'tabs-nav'
];

console.log('🔍 Validating Tailwind CSS Migration...\n');

// Check if Tailwind CSS is built
const tailwindOutput = join(distDir, 'tailwind.css');
if (!existsSync(tailwindOutput)) {
    console.warn('⚠️  Tailwind CSS not built. Run: npm run build:tailwind');
    process.exit(1);
}

// Read Tailwind output
const tailwindCSS = readFileSync(tailwindOutput, 'utf-8');

// Check for migrated components
const migrated = [];
const notMigrated = [];

componentsToMigrate.forEach(component => {
    // Check if component exists in Tailwind output
    const pattern = new RegExp(`\\.${component.replace(/-/g, '\\-')}[\\s\\{:,]`, 'g');
    if (pattern.test(tailwindCSS)) {
        migrated.push(component);
    } else {
        notMigrated.push(component);
    }
});

// Report results
console.log('📊 Migration Status:\n');
console.log(`✅ Migrated: ${migrated.length}/${componentsToMigrate.length}`);
migrated.forEach(comp => console.log(`   ✓ ${comp}`));

if (notMigrated.length > 0) {
    console.log(`\n❌ Not Migrated: ${notMigrated.length}`);
    notMigrated.forEach(comp => console.log(`   ✗ ${comp}`));
}

// Check for Tailwind 4.1 features
console.log('\n✨ Tailwind 4.1 Features:\n');

const features = {
    'text-shadow': /text-shadow/,
    'mask': /mask-/,
    'pointer-coarse': /pointer-coarse:/,
    'safe-alignment': /safe/,
    'colored-drop-shadow': /drop-shadow-cyan/
};

Object.entries(features).forEach(([feature, pattern]) => {
    if (pattern.test(tailwindCSS)) {
        console.log(`   ✅ ${feature}`);
    } else {
        console.log(`   ⚠️  ${feature} (not used)`);
    }
});

// Calculate migration percentage
const migrationPercent = Math.round((migrated.length / componentsToMigrate.length) * 100);
console.log(`\n📈 Migration Progress: ${migrationPercent}%`);

if (migrationPercent === 100) {
    console.log('\n🎉 Migration Complete!');
    process.exit(0);
} else {
    console.log('\n⚠️  Migration In Progress');
    process.exit(1);
}

