/**
 * Heal ceremony state machine on hex:tierAdvance.
 * Mute-first timeline ~1.2–1.8s. Reduced-motion: final state + log only.
 *
 * Beats (full motion):
 *   dim → restore_line → chrome → toast_log → share_pulse → done
 */

/** @typedef {'idle' | 'dim' | 'restore_line' | 'chrome' | 'toast_log' | 'share_pulse' | 'done'} CeremonyBeat */

export const CEREMONY_DURATION_MS = 1600;

/** Beat offsets within the full ceremony (ms from start). */
export const CEREMONY_BEATS = Object.freeze([
    { id: /** @type {CeremonyBeat} */ ('dim'), at: 0 },
    { id: /** @type {CeremonyBeat} */ ('restore_line'), at: 200 },
    { id: /** @type {CeremonyBeat} */ ('chrome'), at: 450 },
    { id: /** @type {CeremonyBeat} */ ('toast_log'), at: 700 },
    { id: /** @type {CeremonyBeat} */ ('share_pulse'), at: 1000 },
    { id: /** @type {CeremonyBeat} */ ('done'), at: CEREMONY_DURATION_MS }
]);

/**
 * @param {{ matchMedia?: (q: string) => { matches: boolean } } | null | undefined} win
 * @returns {boolean}
 */
export function prefersReducedMotion(win = typeof window !== 'undefined' ? window : null) {
    try {
        return !!(win?.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch {
        return false;
    }
}

/**
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @returns {string}
 */
export function restoreLine(detail = {}) {
    const fromTier = Number(detail.fromTier) || 0;
    const toTier = Number(detail.toTier) || fromTier;
    return `SYSTEM_RESTORE v${toTier}.0 ONLINE (was v${fromTier}.0)`;
}

/**
 * @typedef {object} CeremonyHooks
 * @property {(cls: string) => void} [addBodyClass]
 * @property {(cls: string) => void} [removeBodyClass]
 * @property {(from: number, to: number) => void} [setHealDataset]
 * @property {(line: string) => void} [appendLog]
 * @property {(msg: string, type?: string, ms?: number) => void} [notify]
 * @property {(opts?: { pulse?: boolean }) => void} [showSharePulse]
 * @property {(ms: number, fn: () => void) => number | void} [schedule]
 * @property {() => boolean} [isReducedMotion]
 */

/**
 * Run the heal ceremony. Side effects go through hooks for testability.
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @param {CeremonyHooks} [hooks]
 * @returns {{ reduced: boolean, beats: CeremonyBeat[], line: string, durationMs: number }}
 */
export function runHealCeremony(detail = {}, hooks = {}) {
    const reduced = hooks.isReducedMotion
        ? !!hooks.isReducedMotion()
        : prefersReducedMotion();
    const line = restoreLine(detail);
    const fromTier = Number(detail.fromTier) || 0;
    const toTier = Number(detail.toTier) || fromTier;
    const schedule = hooks.schedule || ((ms, fn) => {
        if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
            return window.setTimeout(fn, ms);
        }
        fn();
        return 0;
    });

    /** @type {CeremonyBeat[]} */
    const beats = [];

    const mark = (/** @type {CeremonyBeat} */ id) => {
        beats.push(id);
    };

    // Always: final chrome dataset + restore log (mute-readable).
    if (hooks.setHealDataset) hooks.setHealDataset(fromTier, toTier);
    if (hooks.appendLog) hooks.appendLog(line);

    if (reduced) {
        // Final state + log + toast; no motion classes / pulse animation.
        mark('toast_log');
        mark('done');
        if (hooks.notify) {
            hooks.notify(`SYSTEM_RESTORE v${toTier}.0 — chrome recovering`, 'success', 4500);
        }
        // Share affordance still appears without pulse animation.
        if (hooks.showSharePulse) hooks.showSharePulse({ pulse: false });
        return { reduced: true, beats, line, durationMs: 0 };
    }

    mark('dim');
    if (hooks.addBodyClass) hooks.addBodyClass('tier-advance-heal');
    if (hooks.addBodyClass) hooks.addBodyClass('heal-ceremony-dim');

    schedule(200, () => {
        mark('restore_line');
        if (hooks.removeBodyClass) hooks.removeBodyClass('heal-ceremony-dim');
        if (hooks.addBodyClass) hooks.addBodyClass('heal-ceremony-restore');
    });

    schedule(450, () => {
        mark('chrome');
        if (hooks.removeBodyClass) hooks.removeBodyClass('heal-ceremony-restore');
        if (hooks.addBodyClass) hooks.addBodyClass('heal-ceremony-chrome');
    });

    schedule(700, () => {
        mark('toast_log');
        if (hooks.notify) {
            hooks.notify(`SYSTEM_RESTORE v${toTier}.0 — chrome recovering`, 'success', 4500);
        }
    });

    schedule(1000, () => {
        mark('share_pulse');
        if (hooks.showSharePulse) hooks.showSharePulse({ pulse: true });
    });

    schedule(CEREMONY_DURATION_MS, () => {
        mark('done');
        if (hooks.removeBodyClass) {
            hooks.removeBodyClass('tier-advance-heal');
            hooks.removeBodyClass('heal-ceremony-dim');
            hooks.removeBodyClass('heal-ceremony-restore');
            hooks.removeBodyClass('heal-ceremony-chrome');
        }
    });

    return { reduced: false, beats, line, durationMs: CEREMONY_DURATION_MS };
}

/**
 * Default browser hooks for production wiring from designTierSystem.
 * @param {{ fromTier: number, toTier: number, at?: number }} detail
 * @param {{ audioSystem?: { playSound?: (name: string) => void } | null }} [_opts]
 * @returns {ReturnType<typeof runHealCeremony>}
 */
export function playHealCeremonyInBrowser(detail, _opts = {}) {
    const doc = typeof document !== 'undefined' ? document : null;
    const body = doc?.body || null;

    return runHealCeremony(detail, {
        addBodyClass: (cls) => body?.classList.add(cls),
        removeBodyClass: (cls) => body?.classList.remove(cls),
        setHealDataset: (from, to) => {
            if (!body) return;
            body.dataset.healFrom = String(from);
            body.dataset.healTo = String(to);
        },
        appendLog: (line) => {
            if (typeof window !== 'undefined' && typeof window.__appendSystemLog === 'function') {
                window.__appendSystemLog(line, 'success');
            }
        },
        notify: (msg, type, ms) => {
            if (typeof window !== 'undefined' && typeof window.showNotification === 'function') {
                window.showNotification(msg, type || 'success', ms || 4500);
            }
        },
        showSharePulse: (opts = {}) => {
            const shareBtn = doc?.getElementById('heal-share-button');
            if (!shareBtn) return;
            shareBtn.hidden = false;
            shareBtn.dataset.fromTier = String(detail.fromTier);
            shareBtn.dataset.toTier = String(detail.toTier);
            const wantPulse = opts.pulse !== false;
            if (!wantPulse) return;
            shareBtn.classList.add('heal-share-btn--pulse');
            if (typeof window !== 'undefined') {
                window.setTimeout(() => {
                    shareBtn.classList.remove('heal-share-btn--pulse');
                }, 2600);
            }
        },
        schedule: (ms, fn) => {
            if (typeof window !== 'undefined') return window.setTimeout(fn, ms);
            fn();
            return 0;
        }
    });
}
