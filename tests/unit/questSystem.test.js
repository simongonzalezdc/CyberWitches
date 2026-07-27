/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('Quest System (archived)', () => {
    test('live path no longer has questSystem.js; archive retains source', () => {
        expect(fs.existsSync(path.join(root, 'js/questSystem.js'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'js/archive/questSystem.js'))).toBe(true);
        const gi = fs.readFileSync(path.join(root, 'js/gameInit.js'), 'utf8');
        expect(gi).not.toMatch(/from ['"].*questSystem/);
    });
});
