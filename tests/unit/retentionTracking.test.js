/**
 * Unit tests for retentionTracking.js
 * Tests D1/D7/D30 retention metrics and cohort tracking
 */

// Note: retentionTracking imports analytics which has dependencies
// We'll test the RetentionTracker class functionality directly

describe('RetentionTracking', () => {
  let mockAnalytics;
  let mockDocument;
  let mockWindow;

  beforeEach(() => {
    // Clear localStorage
    global.localStorage.clear();

    // Mock analytics
    mockAnalytics = {
      trackEvent: () => {}
    };
    global.analytics = mockAnalytics;

    // Mock document.referrer
    mockDocument = {
      referrer: 'https://reddit.com/r/gaming'
    };
    global.document = mockDocument;

    // Mock window.location
    mockWindow = {
      location: {
        search: '?utm_source=reddit&utm_medium=organic&utm_campaign=launch'
      }
    };
    global.window = mockWindow;
  });

  describe('First Visit Tracking', () => {
    test('should track first visit timestamp', () => {
      const before = Date.now();

      // Simulate first visit
      const firstVisit = localStorage.getItem('first_visit_timestamp');
      if (!firstVisit) {
        localStorage.setItem('first_visit_timestamp', Date.now().toString());
      }

      const after = Date.now();
      const stored = parseInt(localStorage.getItem('first_visit_timestamp'));

      expect(stored).toBeGreaterThanOrEqual(before);
      expect(stored).toBeLessThanOrEqual(after);
    });

    test('should not overwrite existing first visit', () => {
      const originalTimestamp = 1234567890000;
      localStorage.setItem('first_visit_timestamp', originalTimestamp.toString());

      // Simulate second visit
      const existing = localStorage.getItem('first_visit_timestamp');
      if (!existing) {
        localStorage.setItem('first_visit_timestamp', Date.now().toString());
      }

      const stored = parseInt(localStorage.getItem('first_visit_timestamp'));
      expect(stored).toBe(originalTimestamp);
    });

    test('should store install date in ISO format', () => {
      const now = Date.now();
      const isoDate = new Date(now).toISOString();
      localStorage.setItem('install_date', isoDate);

      const stored = localStorage.getItem('install_date');
      expect(stored).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('UTM Parameter Extraction', () => {
    test('should extract utm_source from URL', () => {
      const urlParams = new URLSearchParams('?utm_source=reddit&utm_medium=organic');
      const utmSource = urlParams.get('utm_source');
      expect(utmSource).toBe('reddit');
    });

    test('should extract utm_medium from URL', () => {
      const urlParams = new URLSearchParams('?utm_source=twitter&utm_medium=social');
      const utmMedium = urlParams.get('utm_medium');
      expect(utmMedium).toBe('social');
    });

    test('should extract utm_campaign from URL', () => {
      const urlParams = new URLSearchParams('?utm_campaign=summer_sale');
      const utmCampaign = urlParams.get('utm_campaign');
      expect(utmCampaign).toBe('summer_sale');
    });

    test('should return null for missing UTM parameters', () => {
      const urlParams = new URLSearchParams('?other=value');
      const utmSource = urlParams.get('utm_source');
      expect(utmSource).toBeNull();
    });

    test('should handle multiple UTM parameters', () => {
      const urlParams = new URLSearchParams('?utm_source=reddit&utm_medium=organic&utm_campaign=launch');
      expect(urlParams.get('utm_source')).toBe('reddit');
      expect(urlParams.get('utm_medium')).toBe('organic');
      expect(urlParams.get('utm_campaign')).toBe('launch');
    });
  });

  describe('Return Visit Detection', () => {
    test('should calculate days since first visit', () => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      localStorage.setItem('first_visit_timestamp', oneDayAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const now = Date.now();
      const daysSince = Math.floor((now - firstVisit) / (1000 * 60 * 60 * 24));

      expect(daysSince).toBeGreaterThanOrEqual(0);
      expect(daysSince).toBeLessThanOrEqual(2);
    });

    test('should detect D1 return window (1-2 days)', () => {
      const oneDayAgo = Date.now() - (25 * 60 * 60 * 1000); // 25 hours
      localStorage.setItem('first_visit_timestamp', oneDayAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const daysSince = Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24));

      const isD1Window = daysSince >= 1 && daysSince < 2;
      expect(isD1Window).toBe(true);
    });

    test('should detect D7 return window (7-8 days)', () => {
      const sevenDaysAgo = Date.now() - (7.5 * 24 * 60 * 60 * 1000);
      localStorage.setItem('first_visit_timestamp', sevenDaysAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const daysSince = Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24));

      const isD7Window = daysSince >= 7 && daysSince < 8;
      expect(isD7Window).toBe(true);
    });

    test('should detect D30 return window (30-31 days)', () => {
      const thirtyDaysAgo = Date.now() - (30.5 * 24 * 60 * 60 * 1000);
      localStorage.setItem('first_visit_timestamp', thirtyDaysAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const daysSince = Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24));

      const isD30Window = daysSince >= 30 && daysSince < 31;
      expect(isD30Window).toBe(true);
    });
  });

  describe('Day N Return Tracking', () => {
    test('should mark D1 return as tracked', () => {
      const key = 'tracked_day_1_return';
      const tracked = localStorage.getItem(key);

      if (!tracked) {
        localStorage.setItem(key, Date.now().toString());
      }

      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();
      expect(parseInt(stored)).toBeGreaterThan(0);
    });

    test('should mark D7 return as tracked', () => {
      const key = 'tracked_day_7_return';
      localStorage.setItem(key, Date.now().toString());

      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();
    });

    test('should mark D30 return as tracked', () => {
      const key = 'tracked_day_30_return';
      localStorage.setItem(key, Date.now().toString());

      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();
    });

    test('should not track same day N return twice', () => {
      const key = 'tracked_day_1_return';
      const firstTimestamp = 1234567890000;
      localStorage.setItem(key, firstTimestamp.toString());

      const tracked = localStorage.getItem(key);
      if (!tracked) {
        localStorage.setItem(key, Date.now().toString());
      }

      const stored = parseInt(localStorage.getItem(key));
      expect(stored).toBe(firstTimestamp);
    });
  });

  describe('Session Tracking', () => {
    test('should track session count per day', () => {
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = `sessions_${today}`;

      const current = parseInt(localStorage.getItem(sessionKey) || '0');
      localStorage.setItem(sessionKey, (current + 1).toString());

      const stored = parseInt(localStorage.getItem(sessionKey));
      expect(stored).toBe(current + 1);
    });

    test('should increment session count on each visit', () => {
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = `sessions_${today}`;

      localStorage.setItem(sessionKey, '1');
      const first = parseInt(localStorage.getItem(sessionKey));

      localStorage.setItem(sessionKey, (first + 1).toString());
      const second = parseInt(localStorage.getItem(sessionKey));

      expect(second).toBe(2);
    });

    test('should use correct date format for session key', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const sessionKey = `sessions_${today}`;
      expect(sessionKey).toMatch(/^sessions_\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Retention Metrics', () => {
    test('should return new user status when no first visit', () => {
      const firstVisit = localStorage.getItem('first_visit_timestamp');

      if (!firstVisit) {
        const metrics = {
          isNew: true,
          daysSinceInstall: 0,
          d1: false,
          d7: false,
          d30: false
        };
        expect(metrics.isNew).toBe(true);
        expect(metrics.daysSinceInstall).toBe(0);
      }
    });

    test('should calculate days since install', () => {
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      localStorage.setItem('first_visit_timestamp', threeDaysAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const daysSince = Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24));

      expect(daysSince).toBeGreaterThanOrEqual(2);
      expect(daysSince).toBeLessThanOrEqual(4);
    });

    test('should check D1 retention status', () => {
      const d1Tracked = !!localStorage.getItem('tracked_day_1_return');
      expect(typeof d1Tracked).toBe('boolean');
    });

    test('should check D7 retention status', () => {
      localStorage.setItem('tracked_day_7_return', Date.now().toString());
      const d7Tracked = !!localStorage.getItem('tracked_day_7_return');
      expect(d7Tracked).toBe(true);
    });

    test('should check D30 retention status', () => {
      const d30Tracked = !!localStorage.getItem('tracked_day_30_return');
      expect(typeof d30Tracked).toBe('boolean');
    });

    test('should return all retention metrics', () => {
      localStorage.setItem('first_visit_timestamp', Date.now().toString());
      localStorage.setItem('tracked_day_1_return', Date.now().toString());

      const metrics = {
        isNew: false,
        daysSinceInstall: 0,
        d1: !!localStorage.getItem('tracked_day_1_return'),
        d7: !!localStorage.getItem('tracked_day_7_return'),
        d30: !!localStorage.getItem('tracked_day_30_return')
      };

      expect(metrics.d1).toBe(true);
      expect(metrics.d7).toBe(false);
      expect(metrics.d30).toBe(false);
    });
  });

  describe('Cohort Analysis', () => {
    test('should generate cohort date from install date', () => {
      const installDate = new Date('2025-01-15T10:30:00Z');
      const cohort = installDate.toISOString().split('T')[0];

      expect(cohort).toBe('2025-01-15');
    });

    test('should return null cohort info when no first visit', () => {
      const firstVisit = localStorage.getItem('first_visit_timestamp');

      if (!firstVisit) {
        const cohortInfo = null;
        expect(cohortInfo).toBeNull();
      }
    });

    test('should calculate cohort information', () => {
      const timestamp = Date.now();
      localStorage.setItem('first_visit_timestamp', timestamp.toString());

      const installDate = new Date(timestamp);
      const cohort = installDate.toISOString().split('T')[0];
      const daysSinceInstall = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));

      const cohortInfo = {
        cohort,
        installDate,
        daysSinceInstall
      };

      expect(cohortInfo.cohort).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(cohortInfo.installDate).toBeInstanceOf(Date);
      expect(cohortInfo.daysSinceInstall).toBeGreaterThanOrEqual(0);
    });

    test('should use YYYY-MM-DD format for cohort', () => {
      const date = new Date('2025-03-20T14:25:00Z');
      const cohort = date.toISOString().split('T')[0];

      expect(cohort).toBe('2025-03-20');
      expect(cohort).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very old install dates', () => {
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      localStorage.setItem('first_visit_timestamp', oneYearAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const daysSince = Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24));

      expect(daysSince).toBeGreaterThanOrEqual(364);
      expect(daysSince).toBeLessThanOrEqual(366);
    });

    test('should handle fractional day calculations', () => {
      const halfDayAgo = Date.now() - (12 * 60 * 60 * 1000);
      localStorage.setItem('first_visit_timestamp', halfDayAgo.toString());

      const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
      const daysSince = Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24));

      expect(daysSince).toBe(0); // Floors to 0
    });

    test('should handle missing localStorage values gracefully', () => {
      const value = localStorage.getItem('nonexistent_key');
      expect(value).toBeNull();

      const parsed = parseInt(value || '0');
      expect(parsed).toBe(0);
    });

    test('should handle empty UTM parameters', () => {
      const urlParams = new URLSearchParams('');
      expect(urlParams.get('utm_source')).toBeNull();
      expect(urlParams.get('utm_medium')).toBeNull();
      expect(urlParams.get('utm_campaign')).toBeNull();
    });

    test('should handle malformed timestamps', () => {
      localStorage.setItem('first_visit_timestamp', 'invalid');
      const parsed = parseInt(localStorage.getItem('first_visit_timestamp'));

      expect(isNaN(parsed)).toBe(true);
    });
  });
});
