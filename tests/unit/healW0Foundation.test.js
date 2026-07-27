/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCERS } from '../../js/modules/data/producers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('heal W0 foundation', () => {
    test('04 unlock ratio bound < 5', () => {
        const unlocks = [...new Set(PRODUCERS.map((p) => Number(p.unlockAtAb) || 0))]
            .filter((u) => u > 0)
            .sort((a, b) => a - b);
        let maxR = 1;
        for (let i = 1; i < unlocks.length; i++) {
            maxR = Math.max(maxR, unlocks[i] / unlocks[i - 1]);
        }
        expect(maxR).toBeLessThan(5);
    });

    test('02 getProductionMultiplier applies meditation after cache', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameState.js'), 'utf8');
        expect(src).toContain('_applyVolatileProductionMult');
        expect(src).toContain('getProductionMultiplierBreakdown');
        // meditation applied in volatile helper, not only inside pre-cache block
        const vol = src.indexOf('_applyVolatileProductionMult');
        const med = src.indexOf('getMeditationProductionBonus', vol);
        expect(med).toBeGreaterThan(vol);
    });

    test('01 forgejo CI runs tests without swallowing failures', () => {
        const yml = fs.readFileSync(path.join(root, '.forgejo/workflows/ci.yml'), 'utf8');
        expect(yml).toMatch(/npm test/);
        expect(yml).not.toMatch(/npm test \|\| true/);
    });

    test('03 smoke-dist script exists', () => {
        expect(fs.existsSync(path.join(root, 'scripts/smoke-dist.sh'))).toBe(true);
        const pkg = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
        expect(pkg).toContain('smoke:dist');
    });
});
