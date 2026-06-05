/**
 * Tests for the reactive UI store, focused on the reset() regression.
 *
 * Background: ReactiveStore never stored its seed state, so `reset()` read an
 * undefined `this.initialState` and collapsed the store to `{}` (spreading
 * undefined) — silently dropping every default instead of restoring them. The
 * constructor now snapshots the seed; these tests lock that in.
 */
import { describe, test, expect } from '@jest/globals';
import { createReactiveStore } from '../../js/state/uiStore.js';

describe('ReactiveStore — reset()', () => {
    test('reset() restores the original seed state, not an empty object', () => {
        const store = createReactiveStore({ currentTab: 'workstations', volume: 0.5, menuOpen: false });

        // Mutate away from the defaults.
        store.set('currentTab', 'meditation');
        store.set('volume', 0.0);
        store.set('menuOpen', true);
        expect(store.get('currentTab')).toBe('meditation');

        store.reset();

        // Every default must come back (previously these were all undefined).
        expect(store.get('currentTab')).toBe('workstations');
        expect(store.get('volume')).toBe(0.5);
        expect(store.get('menuOpen')).toBe(false);
    });

    test('reset() notifies listeners of restored values', () => {
        const store = createReactiveStore({ currentTab: 'workstations' });
        store.set('currentTab', 'boons');

        const seen = [];
        store.subscribe('currentTab', (newVal) => seen.push(newVal));
        store.reset();

        expect(seen).toContain('workstations');
    });

    test('the seed snapshot is immutable to later mutations (no shared reference)', () => {
        const seed = { currentTab: 'workstations' };
        const store = createReactiveStore(seed);

        // Mutating the original seed object must not change what reset() restores.
        seed.currentTab = 'tampered';
        store.set('currentTab', 'meditation');
        store.reset();

        expect(store.get('currentTab')).toBe('workstations');
    });
});
