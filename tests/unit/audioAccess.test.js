/**
 * @jest-environment jsdom
 *
 * The audio access seam: managers ask getAudioSystem() instead of reaching
 * through uiManager.systems. gameInit registers the live instance; tests can
 * register a fake.
 */
import { getAudioSystem, setAudioSystem } from '../../js/audio/audioAccess.js';

describe('audio access seam', () => {
    afterEach(() => setAudioSystem(null));

    test('returns whatever was registered', () => {
        const fake = { playSound: () => {} };
        setAudioSystem(fake);
        expect(getAudioSystem()).toBe(fake);
    });

    test('returns null before an AudioSystem is wired', () => {
        setAudioSystem(null);
        expect(getAudioSystem()).toBeNull();
    });
});
