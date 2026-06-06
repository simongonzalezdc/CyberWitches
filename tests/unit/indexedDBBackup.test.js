/**
 * Tests for the IndexedDB durable-backup layer.
 *
 * jsdom has no IndexedDB, so we polyfill it with fake-indexeddb. These tests pin
 * the contract the save system relies on: round-trip set/get/delete, the
 * fire-and-forget mirror, and — most importantly — the boot-time restore that
 * makes progress survive a localStorage eviction without touching the
 * synchronous load path.
 */
import { IDBFactory } from 'fake-indexeddb';
import { describe, test, expect, beforeEach } from '@jest/globals';
import {
    idbSet,
    idbGet,
    idbDelete,
    mirrorToIndexedDB,
    restoreMissingFromIndexedDB
} from '../../js/save/indexedDBBackup.js';

// jsdom defines its own `indexedDB` (a getter that throws "Not implemented"),
// which shadows `fake-indexeddb/auto`. Force-install a FRESH fake factory before
// each test — that both polyfills IndexedDB and resets all data between tests.
beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(globalThis, 'indexedDB', {
        value: new IDBFactory(),
        writable: true,
        configurable: true
    });
});

describe('indexedDBBackup — primitives', () => {
    test('set then get round-trips the value', async () => {
        expect(await idbSet('cyberWitchesSave', 'blob-123')).toBe(true);
        expect(await idbGet('cyberWitchesSave')).toBe('blob-123');
    });

    test('get returns null for an absent key', async () => {
        expect(await idbGet('nope')).toBeNull();
    });

    test('delete removes the value', async () => {
        await idbSet('k', 'v');
        expect(await idbDelete('k')).toBe(true);
        expect(await idbGet('k')).toBeNull();
    });

    test('mirrorToIndexedDB persists without being awaited', async () => {
        mirrorToIndexedDB('cyberWitchesSave', 'mirrored');
        // Poll briefly for the fire-and-forget write to land.
        let val = null;
        for (let i = 0; i < 20 && val === null; i++) {
            val = await idbGet('cyberWitchesSave');
        }
        expect(val).toBe('mirrored');
    });
});

describe('indexedDBBackup — restoreMissingFromIndexedDB (eviction recovery)', () => {
    test('restores a key into localStorage when it is missing there but present in IDB', async () => {
        await idbSet('cyberWitchesSave', 'durable-save');
        expect(localStorage.getItem('cyberWitchesSave')).toBeNull();

        await restoreMissingFromIndexedDB(['cyberWitchesSave']);

        // Simulates: localStorage was evicted, IndexedDB survived, boot restores it.
        expect(localStorage.getItem('cyberWitchesSave')).toBe('durable-save');
    });

    test('does NOT overwrite localStorage when it already has the key', async () => {
        localStorage.setItem('cyberWitchesSave', 'fresh-local');
        await idbSet('cyberWitchesSave', 'stale-idb');

        await restoreMissingFromIndexedDB(['cyberWitchesSave']);

        // localStorage stays authoritative...
        expect(localStorage.getItem('cyberWitchesSave')).toBe('fresh-local');
        // ...and the IDB mirror is refreshed to match it.
        let mirror = null;
        for (let i = 0; i < 20 && mirror !== 'fresh-local'; i++) {
            mirror = await idbGet('cyberWitchesSave');
        }
        expect(mirror).toBe('fresh-local');
    });

    test('is a no-op when neither store has the key', async () => {
        await restoreMissingFromIndexedDB(['cyberWitchesSave', 'meditationState']);
        expect(localStorage.getItem('cyberWitchesSave')).toBeNull();
        expect(localStorage.getItem('meditationState')).toBeNull();
    });

    test('handles multiple keys independently', async () => {
        await idbSet('cyberWitchesSave', 'save-A');
        localStorage.setItem('meditationState', 'med-local');

        await restoreMissingFromIndexedDB(['cyberWitchesSave', 'meditationState']);

        expect(localStorage.getItem('cyberWitchesSave')).toBe('save-A'); // restored
        expect(localStorage.getItem('meditationState')).toBe('med-local'); // untouched
    });
});
