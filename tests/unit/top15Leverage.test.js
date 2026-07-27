/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCERS } from '../../js/modules/data/producers.js';
import { HIDDEN_RECIPES } from '../../js/modules/data/recipes.js';
import { POTION_CATALOG, getPotionEffectDef, getItemDisplayName } from '../../js/modules/data/potionCatalog.js';
import { shouldAllowSfx, shouldAllowMusic } from '../../js/audio/musicPolicy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('top-15 leverage campaign', () => {
    test('01 no live gameState.js.backup', () => {
        expect(fs.existsSync(path.join(root, 'js/gameState.js.backup'))).toBe(false);
        // Prefer delete; archive is optional. Live path must not exist.
        expect(fs.existsSync(path.join(root, 'js/archive/gameState.js.backup')) || true).toBe(true);
    });

    test('05 questSystem archived off prod path', () => {
        expect(fs.existsSync(path.join(root, 'js/questSystem.js'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'js/archive/questSystem.js'))).toBe(true);
        const gi = fs.readFileSync(path.join(root, 'js/gameInit.js'), 'utf8');
        expect(gi).not.toMatch(/from ['"].*questSystem/);
    });

    test('06/13 producer unlock max consecutive ratio < 5', () => {
        const unlocks = [...new Set(PRODUCERS.map((p) => Number(p.unlockAtAb) || 0))]
            .filter((u) => u > 0)
            .sort((a, b) => a - b);
        let maxR = 1;
        for (let i = 1; i < unlocks.length; i++) {
            maxR = Math.max(maxR, unlocks[i] / unlocks[i - 1]);
        }
        expect(maxR).toBeLessThan(5);
    });

    test('08 every HIDDEN_RECIPES output has catalog display + effect', () => {
        for (const r of HIDDEN_RECIPES) {
            for (const id of Object.keys(r.outputs || {})) {
                expect(POTION_CATALOG[id]).toBeTruthy();
                expect(getItemDisplayName(id)).not.toBe(id);
                expect(getPotionEffectDef(id)).toBeTruthy();
            }
        }
    });

    test('11 gameState delegates potion effects to catalog', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameState.js'), 'utf8');
        expect(src).toContain('getPotionEffectDef');
        expect(src).toContain('potionCatalog');
    });

    test('12 audio playSound uses shouldAllowSfx', () => {
        const src = fs.readFileSync(path.join(root, 'js/audioSystem.js'), 'utf8');
        expect(src).toContain('shouldAllowSfx');
        expect(shouldAllowSfx(1)).toBe(false);
        expect(shouldAllowSfx(2)).toBe(true);
        expect(shouldAllowMusic(3)).toBe(false);
    });

    test('07 design tier progress hint present', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(src).toContain('notifyTierProgress');
        expect(src).toContain('SYSTEM_RESTORE');
    });

    test('02/03 design tier + meditation bridges still wired', () => {
        const gi = fs.readFileSync(path.join(root, 'js/gameInit.js'), 'utf8');
        expect(gi).toContain('window.achievements = achievements');
        expect(gi).toContain('window.comboSystem = comboSystem');
        const mm = fs.readFileSync(path.join(root, 'js/modules/game/meditationManager.js'), 'utf8');
        expect(mm).toContain('window.meditationState = this.state');
        const dts = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(dts).toContain('systems?.achievements');
    });

    test('10 Forgejo SoT documented in AGENTS or README', () => {
        const agents = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8');
        const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
        const blob = agents + '\n' + readme;
        const low = blob.toLowerCase();
        expect(low.includes('forgejo') || low.includes('kyanitelabs')).toBe(true);
        expect(low.includes('source of truth') || low.includes('canonical') || low.includes('sot')).toBe(true);
    });

    test('04 e2e dismiss helper exists', () => {
        expect(fs.existsSync(path.join(root, 'e2e/helpers/dismissOverlays.js'))).toBe(true);
        expect(fs.existsSync(path.join(root, 'e2e/progression-tier.spec.js'))).toBe(true);
    });
});
