/**
 * Onboarding orphans were archived under js/archive/.
 * Live first-run owner is TutorialSystem — covered by sessionShipMust + closeOpenLoops.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

describe('Onboarding System (archived)', () => {
    test('live path no longer has onboarding.js; archive retains sources', () => {
        expect(fs.existsSync(path.join(root, 'js/onboarding.js'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'js/tutorial.js'))).toBe(false);
        expect(fs.existsSync(path.join(root, 'js/archive/onboarding.js'))).toBe(true);
        expect(fs.existsSync(path.join(root, 'js/archive/tutorial.js'))).toBe(true);
    });
});
