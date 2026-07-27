/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCERS } from '../../js/modules/data/producers.js';
import { INGREDIENTS } from '../../js/modules/data/ingredients.js';
import { HIDDEN_RECIPES } from '../../js/modules/data/recipes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('progression wiring integrity', () => {
    test('design tiers read systems.achievements (not dead achievementSystem-only path)', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(src).toContain('systems?.achievements');
        expect(src).toMatch(/getUnlockedCount/);
    });

    test('gameInit exposes achievements and comboSystem on window for StatsUI', () => {
        const src = fs.readFileSync(path.join(root, 'js/gameInit.js'), 'utf8');
        expect(src).toContain('window.achievements = achievements');
        expect(src).toContain('window.comboSystem = comboSystem');
    });

    test('meditationManager restores window.meditationState for production bonus', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/meditationManager.js'), 'utf8');
        expect(src).toContain('window.meditationState = this.state');
    });

    test('every producer recipe/output key exists in ingredients or is ab', () => {
        const known = new Set(INGREDIENTS.map(i => i.id));
        known.add('ab');
        for (const p of PRODUCERS) {
            for (const key of Object.keys(p.recipe || {})) {
                expect(known.has(key)).toBe(true);
            }
            for (const key of Object.keys(p.outputs || {})) {
                expect(known.has(key)).toBe(true);
            }
            expect(String(p.description || '').trim().length).toBeGreaterThan(10);
        }
    });

    test('every HIDDEN_RECIPES output has potion catalog effect + display', () => {
        const cat = fs.readFileSync(path.join(root, 'js/modules/data/potionCatalog.js'), 'utf8');
        const gs = fs.readFileSync(path.join(root, 'js/gameState.js'), 'utf8');
        expect(gs).toContain('getPotionEffectDef');
        for (const recipe of HIDDEN_RECIPES) {
            for (const outId of Object.keys(recipe.outputs || {})) {
                expect(cat).toContain(outId);
            }
            for (const inId of Object.keys(recipe.inputs || {})) {
                const known = new Set(INGREDIENTS.map(i => i.id));
                const isIngredient = known.has(inId);
                const isPotionOutput = HIDDEN_RECIPES.some(r => r.outputs && r.outputs[inId] != null);
                expect(isIngredient || isPotionOutput).toBe(true);
            }
        }
    });

    test('play.html tab buttons have matching tab panels', () => {
        const html = fs.readFileSync(path.join(root, 'play.html'), 'utf8');
        const tabs = [...html.matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);
        expect(tabs.length).toBeGreaterThanOrEqual(8);
        for (const tab of tabs) {
            expect(html).toContain(`id="${tab}-tab"`);
        }
    });

    test('tutorial mid-arc goals present', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/tutorialSystem.js'), 'utf8');
        expect(src).toContain('compile_goal_fire');
        expect(src).toContain('compile_goal_water');
        expect(src).toContain('run_protocol');
    });
});
