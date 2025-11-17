/**
 * Tests for Lifecycle Manager
 */

import { LifecycleManager } from '../../js/lifecycleManager.js';

describe('LifecycleManager', () => {
    let manager;

    beforeEach(() => {
        manager = new LifecycleManager();
        // Reset DOM
        document.body.innerHTML = '';
    });

    afterEach(() => {
        manager.destroy();
    });

    describe('Event Listeners', () => {
        test('should track addEventListener calls', () => {
            const button = document.createElement('button');
            const handler = jest.fn();

            manager.addEventListener(button, 'click', handler);

            expect(manager.eventListeners.length).toBe(1);
            expect(manager.eventListeners[0]).toMatchObject({
                target: button,
                event: 'click',
                handler
            });
        });

        test('should actually add event listener', () => {
            const button = document.createElement('button');
            const handler = jest.fn();

            manager.addEventListener(button, 'click', handler);
            button.click();

            expect(handler).toHaveBeenCalledTimes(1);
        });

        test('should remove event listener', () => {
            const button = document.createElement('button');
            const handler = jest.fn();

            manager.addEventListener(button, 'click', handler);
            manager.removeEventListener(button, 'click', handler);

            button.click();

            expect(handler).not.toHaveBeenCalled();
            expect(manager.eventListeners.length).toBe(0);
        });

        test('should clean up all listeners on destroy', () => {
            const button1 = document.createElement('button');
            const button2 = document.createElement('button');
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            manager.addEventListener(button1, 'click', handler1);
            manager.addEventListener(button2, 'click', handler2);

            manager.destroy();

            button1.click();
            button2.click();

            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
            expect(manager.eventListeners.length).toBe(0);
        });
    });

    describe('Timers', () => {
        jest.useFakeTimers();

        test('should track setInterval', () => {
            const callback = jest.fn();
            const id = manager.setInterval(callback, 1000);

            expect(manager.timers.intervals.has(id)).toBe(true);
        });

        test('should execute interval callback', () => {
            const callback = jest.fn();
            manager.setInterval(callback, 1000);

            jest.advanceTimersByTime(3000);

            expect(callback).toHaveBeenCalledTimes(3);
        });

        test('should clear interval', () => {
            const callback = jest.fn();
            const id = manager.setInterval(callback, 1000);

            manager.clearInterval(id);
            jest.advanceTimersByTime(2000);

            expect(callback).not.toHaveBeenCalled();
            expect(manager.timers.intervals.has(id)).toBe(false);
        });

        test('should track setTimeout', () => {
            const callback = jest.fn();
            const id = manager.setTimeout(callback, 1000);

            expect(manager.timers.timeouts.has(id)).toBe(true);
        });

        test('should execute timeout callback', () => {
            const callback = jest.fn();
            manager.setTimeout(callback, 1000);

            jest.advanceTimersByTime(1000);

            expect(callback).toHaveBeenCalledTimes(1);
        });

        test('should auto-remove timeout after execution', () => {
            const callback = jest.fn();
            const id = manager.setTimeout(callback, 1000);

            jest.advanceTimersByTime(1000);

            expect(manager.timers.timeouts.has(id)).toBe(false);
        });

        test('should clean up all timers on destroy', () => {
            const intervalCallback = jest.fn();
            const timeoutCallback = jest.fn();

            manager.setInterval(intervalCallback, 1000);
            manager.setTimeout(timeoutCallback, 1000);

            manager.destroy();
            jest.advanceTimersByTime(2000);

            expect(intervalCallback).not.toHaveBeenCalled();
            expect(timeoutCallback).not.toHaveBeenCalled();
            expect(manager.timers.intervals.size).toBe(0);
            expect(manager.timers.timeouts.size).toBe(0);
        });
    });

    describe('Animation Frames', () => {
        test('should track requestAnimationFrame', () => {
            const callback = jest.fn();
            const id = manager.requestAnimationFrame(callback);

            expect(manager.timers.animationFrames.has(id)).toBe(true);
        });

        test('should cancel animation frame', () => {
            const callback = jest.fn();
            const id = manager.requestAnimationFrame(callback);

            manager.cancelAnimationFrame(id);

            expect(manager.timers.animationFrames.has(id)).toBe(false);
        });
    });

    describe('Stats', () => {
        test('should return accurate stats', () => {
            const button = document.createElement('button');
            const handler = jest.fn();

            manager.addEventListener(button, 'click', handler);
            manager.setInterval(jest.fn(), 1000);
            manager.setTimeout(jest.fn(), 1000);

            const stats = manager.getStats();

            expect(stats).toMatchObject({
                eventListeners: 1,
                intervals: 1,
                timeouts: 1,
                isDestroyed: false
            });
        });

        test('should show destroyed state', () => {
            manager.destroy();
            const stats = manager.getStats();

            expect(stats.isDestroyed).toBe(true);
        });
    });

    describe('Destroyed State', () => {
        test('should warn when adding listener after destroy', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            manager.destroy();

            const button = document.createElement('button');
            manager.addEventListener(button, 'click', jest.fn());

            expect(consoleSpy).toHaveBeenCalledWith(
                'LifecycleManager: Attempted to add listener after destruction'
            );

            consoleSpy.mockRestore();
        });

        test('should not set interval after destroy', () => {
            manager.destroy();

            const id = manager.setInterval(jest.fn(), 1000);

            expect(id).toBeNull();
        });

        test('should not set timeout after destroy', () => {
            manager.destroy();

            const id = manager.setTimeout(jest.fn(), 1000);

            expect(id).toBeNull();
        });
    });
});
