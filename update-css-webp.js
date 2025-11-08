/**
 * Update CSS files to use WebP with PNG fallbacks
 */

import fs from 'fs';
import path from 'path';

// Files to process
const cssFiles = ['styles.css', 'dist/styles.css'];

// Process each file
cssFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`⏭️ Skipping ${file} (not found)`);
        return;
    }

    console.log(`🔄 Processing ${file}...`);

    let content = fs.readFileSync(file, 'utf8');
    let replacements = 0;

    // Replace PNG references with WebP fallback pattern
    // Pattern: background-image: url('path/to/image.png');
    // Replace with: background-image: url('path/to/image.png'); background-image: url('path/to/image.webp');

    const pngRegex = /(background-image:\s*url\(['"]?)([^'"]+\.png)(['"]?\);)/g;

    content = content.replace(pngRegex, (match, prefix, imagePath, suffix) => {
        const webpPath = imagePath.replace('.png', '.webp');
        replacements++;
        // PNG first (fallback), then WebP (modern browsers)
        return `${prefix}${imagePath}${suffix} /* Fallback */\n    background-image: url('${webpPath}'); /* WebP */`;
    });

    // Write updated content
    fs.writeFileSync(file, content, 'utf8');

    console.log(`✅ ${file}: ${replacements} replacements made`);
});

console.log('\n✅ CSS files updated with WebP references!');
