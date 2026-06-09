#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Color debt linter with baseline ratchet for the CyberWitches design-system migration.
 *
 * Scans CSS, JS and HTML files for raw color literals and compares the per-file
 * counts against a checked-in baseline. Fails when debt increases or appears in a
 * newly-scanned file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const BASELINE_PATH = 'scripts/lint-color-debt.baseline.json';

export const WHITELIST = [
    'styles/theme.css',
    'js/config/colorConstants.js',
    'js/config/meditationColors.js',
    'js/config/tierColors.js',
    'styles/landing.css'
];

const SCAN_EXTENSIONS = new Set(['.css', '.js', '.html']);
const SCAN_PATHS = ['css', 'js', 'styles', 'index.html', 'play.html'];

// Color literal detectors. 3- and 6-digit hex only (with alpha variants ignored
// to match the task specification).
const HEX_PATTERN = /(?<!&)#[0-9A-Fa-f]{3}(?![0-9A-Fa-f])\b|(?<!&)#[0-9A-Fa-f]{6}(?![0-9A-Fa-f])\b/g;
const RGB_PATTERN = /\brgba?\s*\(/gi;
const HSL_PATTERN = /\bhsla?\s*\(/gi;

function findStringEnd(source, start, quote) {
    let i = start;
    while (i < source.length) {
        if (source[i] === '\\') {
            i += 2;
            continue;
        }
        if (source[i] === quote) return i;
        i++;
    }
    return -1;
}

function findTemplateEnd(source, start) {
    let depth = 0;
    let i = start;
    while (i < source.length) {
        if (source[i] === '\\') {
            i += 2;
            continue;
        }
        if (source[i] === '$' && source[i + 1] === '{') {
            depth++;
            i += 2;
            continue;
        }
        if (source[i] === '}' && depth > 0) {
            depth--;
            i++;
            continue;
        }
        if (source[i] === '`' && depth === 0) return i;
        i++;
    }
    return -1;
}

function findMatchingParen(source, start) {
    let depth = 1;
    let i = start;
    while (i < source.length) {
        if (source[i] === '(') {
            depth++;
        } else if (source[i] === ')') {
            depth--;
            if (depth === 0) return i;
        }
        i++;
    }
    return -1;
}

/**
 * Remove ignored regions from a source string:
 * - JSON-LD <script> blocks (HTML only)
 * - /* block comments * /
 * - // line comments
 * - Single, double and backtick quoted strings (including nested ${} in templates)
 * - url(...)
 */
export function stripExclusions(source) {
    let result = '';
    let i = 0;
    while (i < source.length) {
        const ch = source[i];
        const next2 = source.slice(i, i + 2);
        const lower4 = source.slice(i, i + 4).toLowerCase();

        // JSON-LD blocks must be stripped before string stripping so that the
        // quoted type attribute stays intact for detection.
        if (ch === '<') {
            const slice = source.slice(i);
            const scriptMatch = slice.match(/^<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i);
            if (scriptMatch) {
                const end = source.indexOf('</script>', i + scriptMatch[0].length);
                if (end !== -1) {
                    i = end + '</script>'.length;
                    continue;
                }
            }
        }

        if (next2 === '/*') {
            const end = source.indexOf('*/', i + 2);
            if (end !== -1) {
                i = end + 2;
                continue;
            }
        }

        if (next2 === '//') {
            const end = source.indexOf('\n', i + 2);
            if (end !== -1) {
                i = end + 1;
                continue;
            }
            break;
        }

        if (ch === '"') {
            const end = findStringEnd(source, i + 1, '"');
            if (end !== -1) {
                i = end + 1;
                continue;
            }
        }

        if (ch === "'") {
            const end = findStringEnd(source, i + 1, "'");
            if (end !== -1) {
                i = end + 1;
                continue;
            }
        }

        if (ch === '`') {
            const end = findTemplateEnd(source, i + 1);
            if (end !== -1) {
                i = end + 1;
                continue;
            }
        }

        if (lower4 === 'url(') {
            const end = findMatchingParen(source, i + 4);
            if (end !== -1) {
                i = end + 1;
                continue;
            }
        }

        result += ch;
        i++;
    }
    return result;
}

/**
 * For HTML sources, pull out the CSS-relevant fragments:
 * - Contents of <style> tags
 * - Values of style="..." attributes
 *
 * JSON-LD blocks and HTML comments are removed and therefore not scanned.
 */
export function extractHtmlCss(html) {
    let cleaned = html.replace(/<!--[\s\S]*?-->/g, '');
    cleaned = cleaned.replace(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

    const parts = [];

    const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let m;
    while ((m = styleTagRegex.exec(cleaned)) !== null) {
        parts.push(m[1]);
    }

    const styleAttrRegex = /\bstyle\s*=\s*(["'])([\s\S]*?)\1/gi;
    while ((m = styleAttrRegex.exec(cleaned)) !== null) {
        parts.push(m[2]);
    }

    return parts;
}

/**
 * Count raw color literals in a source string.
 */
export function extractViolations(source, filePath) {
    const ext = path.extname(filePath || '').toLowerCase();
    let textToScan;

    if (ext === '.html') {
        const cssParts = extractHtmlCss(source);
        textToScan = cssParts.join('\n');
    } else {
        textToScan = source;
    }

    const sanitized = stripExclusions(textToScan);
    const hex = sanitized.match(HEX_PATTERN) || [];
    const rgb = sanitized.match(RGB_PATTERN) || [];
    const hsl = sanitized.match(HSL_PATTERN) || [];
    return hex.length + rgb.length + hsl.length;
}

/**
 * Recursively discover files that should be scanned.
 */
export function findColorDebtFiles(rootDir) {
    const files = [];
    const seen = new Set();
    const resolvedRoot = path.resolve(rootDir);

    function addIfScan(p) {
        const rel = path.relative(resolvedRoot, p).replace(/\\/g, '/');
        if (WHITELIST.includes(rel)) return;
        const ext = path.extname(p).toLowerCase();
        if (!SCAN_EXTENSIONS.has(ext)) return;
        const canonical = path.resolve(p);
        if (seen.has(canonical)) return;
        seen.add(canonical);
        files.push(canonical);
    }

    for (const scanPath of SCAN_PATHS) {
        const fullPath = path.join(resolvedRoot, scanPath);
        if (!fs.existsSync(fullPath)) continue;

        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
            addIfScan(fullPath);
        } else if (stat.isDirectory()) {
            const walk = (dir) => {
                for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                    const entryPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        walk(entryPath);
                    } else {
                        addIfScan(entryPath);
                    }
                }
            };
            walk(fullPath);
        }
    }

    return files.sort();
}

export function loadBaseline(baselinePath) {
    try {
        const raw = fs.readFileSync(baselinePath, 'utf8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

/**
 * Run the linter and return a structured result.
 */
export function run(rootDir, options = {}) {
    const files = findColorDebtFiles(rootDir);
    const baselinePath = path.join(rootDir, BASELINE_PATH);
    const baseline = loadBaseline(baselinePath);
    const counts = {};
    let total = 0;

    for (const file of files) {
        const rel = path.relative(rootDir, file).replace(/\\/g, '/');
        const source = fs.readFileSync(file, 'utf8');
        const count = extractViolations(source, rel);
        counts[rel] = count;
        total += count;
    }

    if (options.updateBaseline) {
        fs.writeFileSync(baselinePath, JSON.stringify(counts, null, 2) + '\n');
        return { success: true, counts, total, baseline, updated: true };
    }

    let success = true;
    const failures = [];

    for (const [rel, count] of Object.entries(counts)) {
        const baselineCount = baseline[rel] ?? 0;
        if (count > baselineCount) {
            success = false;
            failures.push({ file: rel, count, baseline: baselineCount });
        }
    }

    return { success, counts, total, baseline, failures };
}

export function printSummary(result) {
    console.log('Color Debt Linter');
    console.log('=================');

    const entries = Object.entries(result.counts).sort(([a], [b]) => a.localeCompare(b));
    const withViolations = entries.filter(([, c]) => c > 0);

    if (entries.length === 0) {
        console.log('No files scanned.');
    } else {
        console.log(`Scanned ${entries.length} file(s).`);
        if (withViolations.length) {
            console.log('Files with color debt:');
            for (const [file, count] of withViolations) {
                const baselineCount = result.baseline[file] ?? 0;
                const marker = count > baselineCount ? 'FAIL' : 'ok  ';
                console.log(`  [${marker}] ${file}: ${count} (baseline: ${baselineCount})`);
            }
        } else {
            console.log('No raw color literals found.');
        }
    }

    console.log(`Total violations: ${result.total}`);

    if (result.updated) {
        console.log(`Baseline updated at ${BASELINE_PATH}`);
        return;
    }

    if (result.success) {
        console.log('PASS: color debt is within baseline.');
    } else {
        console.log('FAIL: color debt increased in the following file(s):');
        for (const f of result.failures) {
            console.log(`  - ${f.file}: ${f.count} > ${f.baseline}`);
        }
    }
}

function main() {
    const updateBaseline = process.argv.includes('--update-baseline');
    const result = run(process.cwd(), { updateBaseline });
    printSummary(result);
    if (!result.success) {
        process.exit(1);
    }
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    main();
}
