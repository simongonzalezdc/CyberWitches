/**
 * @jest-environment jsdom
 *
 * Demonstrates the notifier seam: TutorialSystem emits player-facing
 * notifications through an injected `notify` port instead of holding the whole
 * UIManager. The injected fake is the "second adapter" that makes the seam real
 * and the emission directly testable.
 */
import { TutorialSystem } from '../../js/modules/game/tutorialSystem.js';

describe('TutorialSystem notifier seam', () => {
    beforeEach(() => {
        localStorage.clear();
        // Skip the boot sequence so construction stays lightweight for the test.
        localStorage.setItem('tutorialCompleted', 'true');
    });

    test('completeTutorial emits through the injected notifier, with no UIManager', () => {
        const calls = [];
        const fakeNotify = (message, type) => calls.push({ message, type });

        const tutorial = new TutorialSystem({}, fakeNotify);
        tutorial.completeTutorial();

        expect(calls).toEqual([
            { message: 'SYSTEM_READY. BEGIN_OPERATIONS.', type: 'success' }
        ]);
    });

    test('falls back to the default notifier when none is injected', () => {
    // No notify argument: the default port is used and construction does not throw.
        expect(() => new TutorialSystem({})).not.toThrow();
    });
});
