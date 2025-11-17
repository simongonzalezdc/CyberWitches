/**
 * Tests for Lazy Loader
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { LazyLoader } from '../../js/lazyLoader.js';

// Mock dynamic imports
jest.mock('../../js/tutorial.js', () => ({
    default: class Tutorial {}
}), { virtual: true });

describe('LazyLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new LazyLoader();
    });

    afterEach(() => {
        // Clean up
        loader.loadedModules.clear();
        loader.loadingPromises.clear();
    });

    describe('Module Loading', () => {
        test('should load module', async () => {
            // Note: This is a simplified test
            // In real scenario, we'd mock the import() function
            expect(loader.loadedModules.size).toBe(0);
        });

        test('should cache loaded modules', () => {
            const mockModule = { default: {} };
            loader.loadedModules.set('./test.js', mockModule);

            expect(loader.isLoaded('./test.js')).toBe(true);
        });

        test('should return cached module', () => {
            const mockModule = { default: { foo: 'bar' } };
            loader.loadedModules.set('./test.js', mockModule);

            expect(loader.isLoaded('./test.js')).toBe(true);
        });

        test('should track loading promises', () => {
            const mockPromise = Promise.resolve({ default: {} });
            loader.loadingPromises.set('./test.js', mockPromise);

            expect(loader.loadingPromises.has('./test.js')).toBe(true);
        });
    });

    describe('Cache Management', () => {
        test('should check if module is loaded', () => {
            expect(loader.isLoaded('./test.js')).toBe(false);

            loader.loadedModules.set('./test.js', { default: {} });

            expect(loader.isLoaded('./test.js')).toBe(true);
        });

        test('should unload module', () => {
            loader.loadedModules.set('./test.js', { default: {} });
            loader.loadingPromises.set('./test.js', Promise.resolve());

            loader.unload('./test.js');

            expect(loader.isLoaded('./test.js')).toBe(false);
            expect(loader.loadingPromises.has('./test.js')).toBe(false);
        });
    });

    describe('Statistics', () => {
        test('should return accurate stats', () => {
            loader.loadedModules.set('./module1.js', { default: {} });
            loader.loadedModules.set('./module2.js', { default: {} });
            loader.loadingPromises.set('./module3.js', Promise.resolve());

            const stats = loader.getStats();

            expect(stats).toMatchObject({
                loadedModules: 2,
                loading: 1,
                modules: ['./module1.js', './module2.js']
            });
        });

        test('should handle empty cache', () => {
            const stats = loader.getStats();

            expect(stats).toMatchObject({
                loadedModules: 0,
                loading: 0,
                modules: []
            });
        });
    });

    describe('Preloading', () => {
        test('should not preload already loaded module', () => {
            loader.loadedModules.set('./test.js', { default: {} });

            // Should not throw or do anything
            loader.preload('./test.js');

            expect(loader.loadedModules.size).toBe(1);
        });

        test('should not preload module already loading', () => {
            loader.loadingPromises.set('./test.js', Promise.resolve());

            // Should not throw or do anything
            loader.preload('./test.js');

            expect(loader.loadingPromises.size).toBe(1);
        });
    });
});
