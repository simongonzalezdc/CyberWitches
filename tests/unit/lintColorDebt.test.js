/**
 * Unit tests for the color-debt linter.
 *
 * Verifies that ignored regions (comments, strings, JSON-LD, url()) are skipped,
 * that real color literals are counted, and that the baseline ratchet behaves
 * correctly.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
    stripExclusions,
    extractViolations,
    findColorDebtFiles,
    run,
    BASELINE_PATH
} from '../../scripts/lint-color-debt.js';

const scriptPath = fileURLToPath(new URL('../../scripts/lint-color-debt.js', import.meta.url));

function makeTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'lint-color-debt-'));
}

describe('lint-color-debt', () => {
    describe('stripExclusions', () => {
        test('strips CSS block comments', () => {
            const source = '/* #fff */ body {}';
            expect(stripExclusions(source)).toBe(' body {}');
        });

        test('strips JS line comments', () => {
            const source = '// #fff\nbody {}';
            expect(stripExclusions(source)).toBe('body {}');
        });

        test('strips double-quoted strings', () => {
            const source = 'color: "#fff";';
            expect(stripExclusions(source)).toBe('color: ;');
        });

        test('strips single-quoted strings', () => {
            const source = "color: '#fff';";
            expect(stripExclusions(source)).toBe('color: ;');
        });

        test('strips backtick template literals', () => {
            const source = 'color = `#fff`';
            expect(stripExclusions(source)).toBe('color = ');
        });

        test('strips template literals with nested ${}', () => {
            const source = 'color = `${foo("#fff")}`';
            expect(stripExclusions(source)).toBe('color = ');
        });

        test('strips url(...)', () => {
            const source = 'background: url(#fff.png)';
            expect(stripExclusions(source)).toBe('background: ');
        });

        test('strips JSON-LD blocks', () => {
            const source =
        '<script type="application/ld+json">{"color":"#fff"}</script><style>body{color:#000}</style>';
            expect(stripExclusions(source)).toBe('<style>body{color:#000}</style>');
        });

        test('strips single-quoted JSON-LD type', () => {
            const source =
        "<script type='application/ld+json'>{\"color\":\"#fff\"}</script><div></div>";
            expect(stripExclusions(source)).toBe('<div></div>');
        });
    });

    describe('extractViolations', () => {
        test('catches 3-digit hex', () => {
            expect(extractViolations('color: #fff;', 'test.css')).toBe(1);
        });

        test('catches 6-digit hex', () => {
            expect(extractViolations('color: #ffffff;', 'test.css')).toBe(1);
        });

        test('catches uppercase hex', () => {
            expect(extractViolations('color: #FFF;', 'test.css')).toBe(1);
        });

        test('catches rgb/rgba', () => {
            expect(
                extractViolations(
                    'color: rgb(0,0,0); background: rgba(0,0,0,0.5);',
                    'test.css'
                )
            ).toBe(2);
        });

        test('catches hsl/hsla', () => {
            expect(
                extractViolations(
                    'color: hsl(0,0%,0%); background: hsla(0,0%,0%,0.5);',
                    'test.css'
                )
            ).toBe(2);
        });

        test('ignores colors in CSS block comments', () => {
            expect(extractViolations('/* #fff */ body {}', 'test.css')).toBe(0);
        });

        test('ignores colors in JS line comments', () => {
            expect(extractViolations('// #fff\nbody {}', 'test.js')).toBe(0);
        });

        test('ignores colors in double-quoted strings', () => {
            expect(extractViolations('const c = "#fff";', 'test.js')).toBe(0);
        });

        test('ignores colors in single-quoted strings', () => {
            expect(extractViolations("const c = '#fff';", 'test.js')).toBe(0);
        });

        test('ignores colors in backtick strings', () => {
            expect(extractViolations('const c = `#fff`;', 'test.js')).toBe(0);
        });

        test('ignores colors in url(...)', () => {
            expect(extractViolations('background: url(#fff.png)', 'test.css')).toBe(0);
        });

        test('ignores colors in JSON-LD', () => {
            expect(
                extractViolations(
                    '<script type="application/ld+json">{"color":"#fff"}</script>',
                    'test.html'
                )
            ).toBe(0);
        });

        test('ignores 4-digit and 8-digit hex', () => {
            expect(extractViolations('color: #ffff; background: #ffffffff;', 'test.css')).toBe(0);
        });

        test('ignores HTML entities', () => {
            expect(extractViolations('&#123; and &#123456;', 'test.html')).toBe(0);
        });

        test('catches colors in HTML style tags', () => {
            expect(extractViolations('<style>body{color:#fff}</style>', 'test.html')).toBe(1);
        });

        test('catches colors in HTML style attributes', () => {
            expect(extractViolations('<div style="color: #fff"></div>', 'test.html')).toBe(1);
        });

        test('ignores colors in HTML comments', () => {
            expect(extractViolations('<!-- color: #fff -->', 'test.html')).toBe(0);
        });

        test('counts multiple violations in one file', () => {
            expect(extractViolations('color: #fff; background: #000; border: rgb(0,0,0);', 'test.css')).toBe(3);
        });
    });

    describe('findColorDebtFiles', () => {
        test('discovers css, js, html files and respects whitelist', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'js', 'config'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'styles'), { recursive: true });
            fs.writeFileSync(path.join(tmp, 'css', 'a.css'), '');
            fs.writeFileSync(path.join(tmp, 'js', 'app.js'), '');
            fs.writeFileSync(path.join(tmp, 'js', 'config', 'colorConstants.js'), '');
            fs.writeFileSync(path.join(tmp, 'styles', 'theme.css'), '');
            fs.writeFileSync(path.join(tmp, 'index.html'), '');
            fs.writeFileSync(path.join(tmp, 'play.html'), '');

            const files = findColorDebtFiles(tmp).map((f) =>
                path.relative(tmp, f).replace(/\\/g, '/')
            );

            expect(files).toContain('css/a.css');
            expect(files).toContain('js/app.js');
            expect(files).toContain('index.html');
            expect(files).toContain('play.html');
            expect(files).not.toContain('js/config/colorConstants.js');
            expect(files).not.toContain('styles/theme.css');
        });

        test('skips non-scan extensions', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.writeFileSync(path.join(tmp, 'css', 'a.txt'), 'color: #fff;');
            fs.writeFileSync(path.join(tmp, 'css', 'b.css'), 'color: #fff;');

            const files = findColorDebtFiles(tmp).map((f) =>
                path.relative(tmp, f).replace(/\\/g, '/')
            );

            expect(files).not.toContain('css/a.txt');
            expect(files).toContain('css/b.css');
        });
    });

    describe('baseline comparison', () => {
        test('passes when counts are within baseline', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(path.join(tmp, 'css', 'test.css'), '/* no colors */');
            fs.writeFileSync(
                path.join(tmp, BASELINE_PATH),
                JSON.stringify({ 'css/test.css': 0 })
            );

            const result = run(tmp);
            expect(result.success).toBe(true);
        });

        test('fails when a scanned file exceeds baseline', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'test.css'),
                'body { color: #fff; }'
            );
            fs.writeFileSync(
                path.join(tmp, BASELINE_PATH),
                JSON.stringify({ 'css/test.css': 0 })
            );

            const result = run(tmp);
            expect(result.success).toBe(false);
            expect(result.failures).toEqual([
                { file: 'css/test.css', count: 1, baseline: 0 }
            ]);
        });

        test('passes when a file improves relative to baseline', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'test.css'),
                'body { color: #fff; }'
            );
            fs.writeFileSync(
                path.join(tmp, BASELINE_PATH),
                JSON.stringify({ 'css/test.css': 5 })
            );

            const result = run(tmp);
            expect(result.success).toBe(true);
        });

        test('passes when new file has zero violations', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(path.join(tmp, 'css', 'new.css'), '/* clean */');
            fs.writeFileSync(path.join(tmp, BASELINE_PATH), JSON.stringify({}));

            const result = run(tmp);
            expect(result.success).toBe(true);
        });

        test('fails when new file has violations', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'new.css'),
                'body { color: #fff; }'
            );
            fs.writeFileSync(path.join(tmp, BASELINE_PATH), JSON.stringify({}));

            const result = run(tmp);
            expect(result.success).toBe(false);
            expect(result.failures).toEqual([
                { file: 'css/new.css', count: 1, baseline: 0 }
            ]);
        });

        test('update-baseline writes current counts', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'test.css'),
                'body { color: #fff; background: #000; }'
            );

            const result = run(tmp, { updateBaseline: true });
            expect(result.updated).toBe(true);

            const baseline = JSON.parse(
                fs.readFileSync(path.join(tmp, BASELINE_PATH), 'utf8')
            );
            expect(baseline['css/test.css']).toBe(2);
        });
    });

    describe('CLI', () => {
        test('exits 0 when debt is within baseline', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'test.css'),
                'body { color: #fff; }'
            );
            fs.writeFileSync(
                path.join(tmp, BASELINE_PATH),
                JSON.stringify({ 'css/test.css': 1 })
            );

            const res = spawnSync(process.execPath, [scriptPath], {
                cwd: tmp,
                encoding: 'utf8'
            });
            expect(res.status).toBe(0);
            expect(res.stdout).toContain('PASS');
        });

        test('exits 1 when debt exceeds baseline', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'test.css'),
                'body { color: #fff; background: #000; }'
            );
            fs.writeFileSync(
                path.join(tmp, BASELINE_PATH),
                JSON.stringify({ 'css/test.css': 1 })
            );

            const res = spawnSync(process.execPath, [scriptPath], {
                cwd: tmp,
                encoding: 'utf8'
            });
            expect(res.status).toBe(1);
            expect(res.stdout).toContain('FAIL');
        });

        test('--update-baseline writes baseline and exits 0', () => {
            const tmp = makeTempDir();
            fs.mkdirSync(path.join(tmp, 'css'), { recursive: true });
            fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
            fs.writeFileSync(
                path.join(tmp, 'css', 'test.css'),
                'body { color: #fff; }'
            );

            const res = spawnSync(process.execPath, [scriptPath, '--update-baseline'], {
                cwd: tmp,
                encoding: 'utf8'
            });
            expect(res.status).toBe(0);
            expect(res.stdout).toContain('Baseline updated');

            const baseline = JSON.parse(
                fs.readFileSync(path.join(tmp, BASELINE_PATH), 'utf8')
            );
            expect(baseline['css/test.css']).toBe(1);
        });
    });
});
