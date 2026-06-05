/**
 * Unit tests for playerAnalytics.js
 * Tests player analytics tracking and privacy controls
 */

import playerAnalyticsManager from '../../js/playerAnalytics.js';

describe('Player Analytics', () => {
    let originalDateNow;
    let originalCanUseAnalytics;

    beforeEach(() => {
        localStorage.clear();
        originalDateNow = Date.now;
        originalCanUseAnalytics = window.canUseAnalytics;

        // Reset manager state
        playerAnalyticsManager.enabled = false;
        playerAnalyticsManager.events = [];
    });

    afterEach(() => {
        Date.now = originalDateNow;
        window.canUseAnalytics = originalCanUseAnalytics;
    });

    describe('Initialization', () => {
        test('should have player analytics manager', () => {
            expect(playerAnalyticsManager).toBeDefined();
        });

        test('should initialize with disabled state by default', () => {
            expect(playerAnalyticsManager.enabled).toBe(false);
        });

        test('should initialize with empty events', () => {
            expect(playerAnalyticsManager.events).toEqual([]);
        });

        test('should have maxEvents limit', () => {
            expect(playerAnalyticsManager.maxEvents).toBe(1000);
        });

        test('should load saved preference from localStorage', () => {
            localStorage.setItem('analyticsEnabled', 'true');
            playerAnalyticsManager.init();

            expect(playerAnalyticsManager.enabled).toBe(true);
        });

        test('should respect disabled preference from localStorage', () => {
            localStorage.setItem('analyticsEnabled', 'false');
            playerAnalyticsManager.init();

            expect(playerAnalyticsManager.enabled).toBe(false);
        });
    });

    describe('Enable/Disable', () => {
        test('should enable analytics', () => {
            playerAnalyticsManager.enable();

            expect(playerAnalyticsManager.enabled).toBe(true);
        });

        test('should save enabled preference to localStorage', () => {
            playerAnalyticsManager.enable();

            const saved = localStorage.getItem('analyticsEnabled');
            expect(saved).toBe('true');
        });

        test('should disable analytics', () => {
            playerAnalyticsManager.enabled = true;
            playerAnalyticsManager.disable();

            expect(playerAnalyticsManager.enabled).toBe(false);
        });

        test('should save disabled preference to localStorage', () => {
            playerAnalyticsManager.disable();

            const saved = localStorage.getItem('analyticsEnabled');
            expect(saved).toBe('false');
        });

        test('should clear events when disabling', () => {
            playerAnalyticsManager.enabled = true;
            playerAnalyticsManager.events = [
                { name: 'test', properties: {}, timestamp: Date.now() }
            ];

            playerAnalyticsManager.disable();

            expect(playerAnalyticsManager.events).toEqual([]);
        });
    });

    describe('Event Tracking', () => {
        beforeEach(() => {
            playerAnalyticsManager.enable();
        });

        test('should track event when enabled', () => {
            playerAnalyticsManager.track('test_event', { value: 1 });

            expect(playerAnalyticsManager.events.length).toBe(1);
        });

        test('should not track event when disabled', () => {
            playerAnalyticsManager.disable();
            playerAnalyticsManager.track('test_event', { value: 1 });

            expect(playerAnalyticsManager.events.length).toBe(0);
        });

        test('should include event name in tracked event', () => {
            playerAnalyticsManager.track('test_event', {});

            expect(playerAnalyticsManager.events[0].name).toBe('test_event');
        });

        test('should include timestamp in tracked event', () => {
            const mockTime = 1234567890;
            Date.now = () => mockTime;

            playerAnalyticsManager.track('test_event', {});

            expect(playerAnalyticsManager.events[0].timestamp).toBe(mockTime);
        });

        test('should anonymize properties', () => {
            playerAnalyticsManager.track('test_event', {
                userId: 'user123',
                score: 100
            });

            const event = playerAnalyticsManager.events[0];
            expect(event.properties.userId).toBeUndefined();
            expect(event.properties.score).toBe(100);
        });

        test('should limit events to maxEvents', () => {
            playerAnalyticsManager.maxEvents = 5;

            for (let i = 0; i < 10; i++) {
                playerAnalyticsManager.track('event', { index: i });
            }

            expect(playerAnalyticsManager.events.length).toBe(5);
        });

        test('should keep most recent events when at limit', () => {
            playerAnalyticsManager.maxEvents = 3;

            for (let i = 0; i < 5; i++) {
                playerAnalyticsManager.track('event', { index: i });
            }

            expect(playerAnalyticsManager.events[0].properties.index).toBe(2);
            expect(playerAnalyticsManager.events[2].properties.index).toBe(4);
        });

        test('should not track when canUseAnalytics returns false', () => {
            window.canUseAnalytics = () => false;

            playerAnalyticsManager.track('test_event', {});

            expect(playerAnalyticsManager.events.length).toBe(0);
        });

        test('should track when canUseAnalytics returns true', () => {
            window.canUseAnalytics = () => true;

            playerAnalyticsManager.track('test_event', {});

            expect(playerAnalyticsManager.events.length).toBe(1);
        });
    });

    describe('Property Anonymization', () => {
        test('should remove userId from properties', () => {
            const properties = { userId: 'user123', value: 10 };
            const anonymized = playerAnalyticsManager.anonymizeProperties(properties);

            expect(anonymized.userId).toBeUndefined();
        });

        test('should remove email from properties', () => {
            const properties = { email: 'user@example.com', value: 10 };
            const anonymized = playerAnalyticsManager.anonymizeProperties(properties);

            expect(anonymized.email).toBeUndefined();
        });

        test('should remove name from properties', () => {
            const properties = { name: 'John', value: 10 };
            const anonymized = playerAnalyticsManager.anonymizeProperties(properties);

            expect(anonymized.name).toBeUndefined();
        });

        test('should preserve other properties', () => {
            const properties = { score: 100, level: 5 };
            const anonymized = playerAnalyticsManager.anonymizeProperties(properties);

            expect(anonymized.score).toBe(100);
            expect(anonymized.level).toBe(5);
        });

        test('should not modify original properties object', () => {
            const properties = { userId: 'user123', value: 10 };
            playerAnalyticsManager.anonymizeProperties(properties);

            expect(properties.userId).toBe('user123');
        });
    });

    describe('Action Tracking', () => {
        beforeEach(() => {
            playerAnalyticsManager.enable();
        });

        test('should track action', () => {
            playerAnalyticsManager.trackAction('click_button', { button: 'start' });

            expect(playerAnalyticsManager.events.length).toBe(1);
        });

        test('should track action with player_action event name', () => {
            playerAnalyticsManager.trackAction('click_button', {});

            expect(playerAnalyticsManager.events[0].name).toBe('player_action');
        });

        test('should include action in properties', () => {
            playerAnalyticsManager.trackAction('click_button', { button: 'start' });

            expect(playerAnalyticsManager.events[0].properties.action).toBe('click_button');
        });

        test('should merge action data with properties', () => {
            playerAnalyticsManager.trackAction('click_button', { button: 'start', value: 1 });

            const props = playerAnalyticsManager.events[0].properties;
            expect(props.action).toBe('click_button');
            expect(props.button).toBe('start');
            expect(props.value).toBe(1);
        });
    });

    describe('Progression Tracking', () => {
        beforeEach(() => {
            playerAnalyticsManager.enable();
        });

        test('should track progression', () => {
            playerAnalyticsManager.trackProgression('level_5', { exp: 1000 });

            expect(playerAnalyticsManager.events.length).toBe(1);
        });

        test('should track progression with progression event name', () => {
            playerAnalyticsManager.trackProgression('level_5', {});

            expect(playerAnalyticsManager.events[0].name).toBe('progression');
        });

        test('should include milestone in properties', () => {
            playerAnalyticsManager.trackProgression('level_5', {});

            expect(playerAnalyticsManager.events[0].properties.milestone).toBe('level_5');
        });

        test('should merge milestone data with properties', () => {
            playerAnalyticsManager.trackProgression('level_5', { exp: 1000, time: 120 });

            const props = playerAnalyticsManager.events[0].properties;
            expect(props.milestone).toBe('level_5');
            expect(props.exp).toBe(1000);
            expect(props.time).toBe(120);
        });
    });

    describe('Get Analytics Data', () => {
        test('should get analytics data', () => {
            const data = playerAnalyticsManager.getAnalyticsData();

            expect(data).toBeDefined();
            expect(data.events).toBeDefined();
            expect(data.totalEvents).toBeDefined();
        });

        test('should return correct event count', () => {
            playerAnalyticsManager.enable();
            playerAnalyticsManager.track('event1', {});
            playerAnalyticsManager.track('event2', {});

            const data = playerAnalyticsManager.getAnalyticsData();

            expect(data.totalEvents).toBe(2);
        });

        test('should return events array', () => {
            playerAnalyticsManager.enable();
            playerAnalyticsManager.track('event1', { value: 1 });

            const data = playerAnalyticsManager.getAnalyticsData();

            expect(Array.isArray(data.events)).toBe(true);
            expect(data.events.length).toBe(1);
        });
    });

    describe('Global Functions', () => {
        test('should have trackEvent global function', () => {
            expect(typeof window.trackEvent).toBe('function');
        });

        test('should have trackAction global function', () => {
            expect(typeof window.trackAction).toBe('function');
        });

        test('trackEvent should track event', () => {
            playerAnalyticsManager.enable();
            window.trackEvent('test', { value: 1 });

            expect(playerAnalyticsManager.events.length).toBeGreaterThanOrEqual(1);
        });

        test('trackAction should track action', () => {
            playerAnalyticsManager.enable();
            window.trackAction('test_action', { button: 'start' });

            expect(playerAnalyticsManager.events.length).toBeGreaterThanOrEqual(1);
        });
    });
});
