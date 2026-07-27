/**
 * Local-only funnel counters for Capture the heal (TTA / TTH / share).
 * Privacy: session timestamps only — no save payloads, no remote analytics.
 *
 * Keys (localStorage):
 *   cw.funnel.sessionStartMs  — first boot this browser profile
 *   cw.funnel.ttaMs           — ms from session start to first ws_fire_forge craft
 *   cw.funnel.tthMs           — ms from session start to first real hex:tierAdvance
 *   cw.funnel.shareAttempt    — SHARE_RESTORE clicks
 *   cw.funnel.tierAdvance     — cumulative tier advances (legacy + heal)
 *
 * Provisional targets (instrument-first):
 *   TTA p50 ≤ 8 minutes (480_000 ms)
 *   TTH instrumented first; target after field mute-clip
 */

export const FUNNEL_KEYS = Object.freeze({
    sessionStartMs: 'cw.funnel.sessionStartMs',
    ttaMs: 'cw.funnel.ttaMs',
    tthMs: 'cw.funnel.tthMs',
    shareAttempt: 'cw.funnel.shareAttempt',
    tierAdvance: 'cw.funnel.tierAdvance'
});

/** First automation workstation id for TTA. */
export const TTA_WORKSTATION_ID = 'ws_fire_forge';

/** Provisional TTA p50 target (ms). */
export const TTA_P50_TARGET_MS = 8 * 60 * 1000;

/**
 * @param {Storage | null | undefined} store
 * @param {string} key
 * @returns {string | null}
 */
function safeGet(store, key) {
    try {
        return store?.getItem?.(key) ?? null;
    } catch {
        return null;
    }
}

/**
 * @param {Storage | null | undefined} store
 * @param {string} key
 * @param {string} value
 */
function safeSet(store, key, value) {
    try {
        store?.setItem?.(key, value);
    } catch { /* private mode */ }
}

/**
 * Session start is per browser tab session (sessionStorage) so TTA/TTH
 * measure from this visit, not a multi-day sticky profile clock.
 * @param {number} [now]
 * @param {Storage | null} [store] durable store for TTA/TTH snapshots (localStorage)
 * @param {Storage | null} [sessionStore] session boundary store (sessionStorage)
 * @returns {number} session start ms
 */
export function markSessionStart(
    now = Date.now(),
    store = typeof localStorage !== 'undefined' ? localStorage : null,
    sessionStore = typeof sessionStorage !== 'undefined' ? sessionStorage : store
) {
    const existing = safeGet(sessionStore, FUNNEL_KEYS.sessionStartMs)
        ?? safeGet(store, FUNNEL_KEYS.sessionStartMs);
    if (existing) {
        const n = Number(existing);
        if (Number.isFinite(n) && n > 0) {
            // Keep a durable copy for getFunnelSnapshot without inventing a new clock.
            safeSet(store, FUNNEL_KEYS.sessionStartMs, String(n));
            safeSet(sessionStore, FUNNEL_KEYS.sessionStartMs, String(n));
            return n;
        }
    }
    safeSet(sessionStore, FUNNEL_KEYS.sessionStartMs, String(now));
    safeSet(store, FUNNEL_KEYS.sessionStartMs, String(now));
    return now;
}

/**
 * Record TTA on first successful craft of ws_fire_forge (once).
 * @param {string} wsId
 * @param {number} [now]
 * @param {Storage | null} [store]
 * @returns {{ recorded: boolean, ttaMs: number | null }}
 */
export function markFirstAutomation(
    wsId,
    now = Date.now(),
    store = typeof localStorage !== 'undefined' ? localStorage : null,
    sessionStore = typeof sessionStorage !== 'undefined' ? sessionStorage : store
) {
    if (wsId !== TTA_WORKSTATION_ID) {
        return { recorded: false, ttaMs: readMs(store, FUNNEL_KEYS.ttaMs) };
    }
    const existing = readMs(store, FUNNEL_KEYS.ttaMs);
    if (existing != null) {
        return { recorded: false, ttaMs: existing };
    }
    const start = markSessionStart(now, store, sessionStore);
    const ttaMs = Math.max(0, now - start);
    safeSet(store, FUNNEL_KEYS.ttaMs, String(ttaMs));
    return { recorded: true, ttaMs };
}

/**
 * Record TTH on first real hex:tierAdvance (once) and bump cumulative tierAdvance.
 * @param {number} [now]
 * @param {Storage | null} [store]
 * @param {Storage | null} [sessionStore]
 * @returns {{ recorded: boolean, tthMs: number | null, tierAdvance: number }}
 */
export function markFirstHeal(
    now = Date.now(),
    store = typeof localStorage !== 'undefined' ? localStorage : null,
    sessionStore = typeof sessionStorage !== 'undefined' ? sessionStorage : store
) {
    // Always count every real advance
    const tierAdvance = Number(safeGet(store, FUNNEL_KEYS.tierAdvance) || '0') + 1;
    safeSet(store, FUNNEL_KEYS.tierAdvance, String(tierAdvance));

    const existing = readMs(store, FUNNEL_KEYS.tthMs);
    if (existing != null) {
        return { recorded: false, tthMs: existing, tierAdvance };
    }
    const start = markSessionStart(now, store, sessionStore);
    const tthMs = Math.max(0, now - start);
    safeSet(store, FUNNEL_KEYS.tthMs, String(tthMs));
    return { recorded: true, tthMs, tierAdvance };
}

/**
 * Increment share attempt counter (every SHARE_RESTORE click).
 * @param {Storage | null} [store]
 * @returns {number}
 */
export function markShareAttempt(store = typeof localStorage !== 'undefined' ? localStorage : null) {
    const n = Number(safeGet(store, FUNNEL_KEYS.shareAttempt) || '0') + 1;
    safeSet(store, FUNNEL_KEYS.shareAttempt, String(n));
    return n;
}

/**
 * @param {Storage | null} [store]
 * @returns {{
 *   sessionStartMs: number | null,
 *   ttaMs: number | null,
 *   tthMs: number | null,
 *   shareAttempt: number,
 *   tierAdvance: number,
 *   ttaP50TargetMs: number
 * }}
 */
export function getFunnelSnapshot(store = typeof localStorage !== 'undefined' ? localStorage : null) {
    return {
        sessionStartMs: readMs(store, FUNNEL_KEYS.sessionStartMs),
        ttaMs: readMs(store, FUNNEL_KEYS.ttaMs),
        tthMs: readMs(store, FUNNEL_KEYS.tthMs),
        shareAttempt: Number(safeGet(store, FUNNEL_KEYS.shareAttempt) || '0') || 0,
        tierAdvance: Number(safeGet(store, FUNNEL_KEYS.tierAdvance) || '0') || 0,
        ttaP50TargetMs: TTA_P50_TARGET_MS
    };
}

/**
 * @param {Storage | null | undefined} store
 * @param {string} key
 * @returns {number | null}
 */
function readMs(store, key) {
    const raw = safeGet(store, key);
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}
