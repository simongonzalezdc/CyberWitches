/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('element counters DOM contract', () => {
    beforeEach(() => {
        document.body.innerHTML = `
          <div id="element-counters">
            <div id="element-counter-fire"><span class="element-amount">0</span></div>
            <div id="element-counter-water"><span class="element-amount">0</span></div>
            <div id="element-counter-air"><span class="element-amount">0</span></div>
            <div id="element-counter-crystal"><span class="element-amount">0</span></div>
            <div id="element-counter-aether"><span class="element-amount">0</span></div>
            <div id="element-counter-focus"><span class="element-amount">0</span></div>
          </div>
        `;
    });

    test('all resource monitor counter nodes exist', () => {
        for (const id of [
            'element-counter-fire',
            'element-counter-water',
            'element-counter-air',
            'element-counter-crystal',
            'element-counter-aether',
            'element-counter-focus'
        ]) {
            expect(document.getElementById(id)).not.toBeNull();
        }
    });
});

describe('play.html resource monitor markup', () => {
    const html = fs.readFileSync(path.join(__dirname, '../../play.html'), 'utf8');

    test('play.html mounts all element counters', () => {
        for (const id of [
            'element-counter-fire',
            'element-counter-water',
            'element-counter-air',
            'element-counter-crystal',
            'element-counter-aether',
            'element-counter-focus'
        ]) {
            expect(html).toContain(`id="${id}"`);
        }
    });

    test('play.html design-system version and tier-0 shell present', () => {
        expect(html).toContain('data-design-system-version="kyanite-1"');
        expect(html).toMatch(/class="[^"]*\btier-0\b/);
    });
});
