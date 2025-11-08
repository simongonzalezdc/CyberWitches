/**
 * Retention Tracking Module
 * Tracks D1, D7, D30 retention and cohort analysis
 */

import { analytics } from './analytics.js';

/**
 * Retention tracking system
 */
class RetentionTracker {
    constructor() {
        this.init();
    }

    /**
     * Initialize retention tracking
     */
    init() {
        // Track first visit
        this.trackFirstVisit();

        // Check and track return visits
        this.trackReturnVisits();

        // Track session
        this.trackSession();
    }

    /**
     * Track first visit
     */
    trackFirstVisit() {
        const firstVisit = localStorage.getItem('first_visit_timestamp');

        if (!firstVisit) {
            const now = Date.now();
            localStorage.setItem('first_visit_timestamp', now.toString());
            localStorage.setItem('install_date', new Date(now).toISOString());

            analytics.trackEvent('acquisition', 'first_visit', {
                timestamp: now,
                referrer: document.referrer || 'direct',
                utm_source: this.getUTMParameter('utm_source'),
                utm_medium: this.getUTMParameter('utm_medium'),
                utm_campaign: this.getUTMParameter('utm_campaign'),
            });
        }
    }

    /**
     * Get UTM parameter from URL
     */
    getUTMParameter(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param) || null;
    }

    /**
     * Track return visits (D1, D7, D30)
     */
    trackReturnVisits() {
        const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
        if (!firstVisit) return;

        const now = Date.now();
        const daysSinceFirst = Math.floor((now - firstVisit) / (1000 * 60 * 60 * 24));

        // D1 Retention (Day 1 return)
        if (daysSinceFirst >= 1 && daysSinceFirst < 2) {
            this.trackDayNReturn(1);
        }

        // D7 Retention (Day 7 return)
        if (daysSinceFirst >= 7 && daysSinceFirst < 8) {
            this.trackDayNReturn(7);
        }

        // D30 Retention (Day 30 return)
        if (daysSinceFirst >= 30 && daysSinceFirst < 31) {
            this.trackDayNReturn(30);
        }
    }

    /**
     * Track day N return
     */
    trackDayNReturn(day) {
        const key = `tracked_day_${day}_return`;
        const tracked = localStorage.getItem(key);

        if (!tracked) {
            localStorage.setItem(key, Date.now().toString());

            analytics.trackEvent('retention', `day_${day}_return`, {
                day: day,
                timestamp: Date.now(),
            });

            console.log(`[Retention] Day ${day} return tracked`);
        }
    }

    /**
     * Track session
     */
    trackSession() {
        // Track sessions per day
        const today = new Date().toISOString().split('T')[0];
        const sessionKey = `sessions_${today}`;
        const sessions = parseInt(localStorage.getItem(sessionKey) || '0');

        localStorage.setItem(sessionKey, (sessions + 1).toString());

        analytics.trackEvent('engagement', 'session', {
            session_number: sessions + 1,
            date: today,
        });
    }

    /**
     * Get retention metrics
     */
    getRetentionMetrics() {
        const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
        if (!firstVisit) {
            return {
                isNew: true,
                daysSinceInstall: 0,
                d1: false,
                d7: false,
                d30: false,
            };
        }

        const now = Date.now();
        const daysSinceFirst = Math.floor((now - firstVisit) / (1000 * 60 * 60 * 24));

        return {
            isNew: false,
            daysSinceInstall: daysSinceFirst,
            installDate: new Date(firstVisit),
            d1: !!localStorage.getItem('tracked_day_1_return'),
            d7: !!localStorage.getItem('tracked_day_7_return'),
            d30: !!localStorage.getItem('tracked_day_30_return'),
        };
    }

    /**
     * Get cohort information
     */
    getCohortInfo() {
        const firstVisit = parseInt(localStorage.getItem('first_visit_timestamp'));
        if (!firstVisit) return null;

        const installDate = new Date(firstVisit);
        const cohort = installDate.toISOString().split('T')[0]; // YYYY-MM-DD

        return {
            cohort: cohort,
            installDate: installDate,
            daysSinceInstall: Math.floor((Date.now() - firstVisit) / (1000 * 60 * 60 * 24)),
        };
    }
}

// Create singleton instance
export const retentionTracker = new RetentionTracker();

// Export helper functions
export function getRetentionMetrics() {
    return retentionTracker.getRetentionMetrics();
}

export function getCohortInfo() {
    return retentionTracker.getCohortInfo();
}

export default retentionTracker;
