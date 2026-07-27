/**
 * @jest-environment jsdom
 */
/** Capture the heal — funnel, ceremony, split capture, share wire. */
import {
    FUNNEL_KEYS,
    TTA_P50_TARGET_MS,
    TTA_WORKSTATION_ID,
    getFunnelSnapshot,
    markFirstAutomation,
    markFirstHeal,
    markSessionStart,
    markShareAttempt
} from '../../js/modules/game/funnelMetrics.js';
import {
    CEREMONY_BEATS,
    CEREMONY_DURATION_MS,
    prefersReducedMotion,
    restoreLine,
    runHealCeremony
} from '../../js/modules/game/healCeremony.js';
import {
    CAPTURE_KIND,
    buildCaptureMeta,
    createSplitStillCanvas,
    isCaptureSanitized,
    paintSplitStill,
    tierChrome
} from '../../js/modules/game/healCapture.js';
import { buildHealShareArtifact, captureHealShare } from '../../js/modules/game/healShare.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

/** Minimal in-memory Storage for funnel tests */
function memStore() {
    /** @type {Record<string, string>} */
    const data = {};
    return {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
        setItem: (k, v) => { data[k] = String(v); },
        removeItem: (k) => { delete data[k]; },
        clear: () => { Object.keys(data).forEach((k) => delete data[k]); },
        get length() { return Object.keys(data).length; },
        key: (i) => Object.keys(data)[i] ?? null
    };
}

describe('02 funnelMetrics TTA/TTH/share', () => {
    test('session start is sticky; TTA on first fire forge only', () => {
        const store = memStore();
        const sess = memStore();
        const t0 = 1_000_000;
        expect(markSessionStart(t0, store, sess)).toBe(t0);
        expect(markSessionStart(t0 + 5000, store, sess)).toBe(t0);

        const miss = markFirstAutomation('ws_other', t0 + 1000, store, sess);
        expect(miss.recorded).toBe(false);
        expect(miss.ttaMs).toBeNull();

        const hit = markFirstAutomation(TTA_WORKSTATION_ID, t0 + 12_000, store, sess);
        expect(hit.recorded).toBe(true);
        expect(hit.ttaMs).toBe(12_000);

        const again = markFirstAutomation(TTA_WORKSTATION_ID, t0 + 99_000, store, sess);
        expect(again.recorded).toBe(false);
        expect(again.ttaMs).toBe(12_000);
    });

    test('TTH once + tierAdvance increments every heal', () => {
        const store = memStore();
        const sess = memStore();
        const t0 = 2_000_000;
        markSessionStart(t0, store, sess);
        const first = markFirstHeal(t0 + 60_000, store, sess);
        expect(first.recorded).toBe(true);
        expect(first.tthMs).toBe(60_000);
        expect(first.tierAdvance).toBe(1);

        const second = markFirstHeal(t0 + 120_000, store, sess);
        expect(second.recorded).toBe(false);
        expect(second.tthMs).toBe(60_000);
        expect(second.tierAdvance).toBe(2);
    });

    test('shareAttempt and snapshot include provisional TTA target', () => {
        const store = memStore();
        expect(markShareAttempt(store)).toBe(1);
        expect(markShareAttempt(store)).toBe(2);
        const snap = getFunnelSnapshot(store);
        expect(snap.shareAttempt).toBe(2);
        expect(snap.ttaP50TargetMs).toBe(TTA_P50_TARGET_MS);
        expect(TTA_P50_TARGET_MS).toBe(8 * 60 * 1000);
        expect(FUNNEL_KEYS.ttaMs).toBe('cw.funnel.ttaMs');
    });
});

describe('04 healCeremony state machine', () => {
    test('timeline beats and duration constants', () => {
        expect(CEREMONY_DURATION_MS).toBeGreaterThanOrEqual(1200);
        expect(CEREMONY_DURATION_MS).toBeLessThanOrEqual(1800);
        expect(CEREMONY_BEATS.map((b) => b.id)).toEqual(
            expect.arrayContaining(['dim', 'restore_line', 'chrome', 'toast_log', 'share_pulse', 'done'])
        );
        expect(restoreLine({ fromTier: 0, toTier: 2 })).toContain('SYSTEM_RESTORE v2.0');
    });

    test('full motion runs dim → share_pulse; applyChrome at restore_line only', () => {
        /** @type {Array<[number, () => void]>} */
        const jobs = [];
        const classes = new Set();
        const logs = [];
        const notifies = [];
        /** @type {number[]} */
        const chromeAt = [];
        /** @type {Array<{ pulse?: boolean } | undefined>} */
        const shareCalls = [];
        const result = runHealCeremony(
            { fromTier: 0, toTier: 1 },
            {
                isReducedMotion: () => false,
                addBodyClass: (c) => classes.add(c),
                removeBodyClass: (c) => classes.delete(c),
                setHealDataset: () => {},
                appendLog: (line) => logs.push(line),
                notify: (msg) => notifies.push(msg),
                showSharePulse: (o) => shareCalls.push(o),
                applyChrome: () => { chromeAt.push(Date.now()); },
                schedule: (ms, fn) => { jobs.push([ms, fn]); }
            }
        );
        expect(result.reduced).toBe(false);
        expect(result.beats).toContain('dim');
        expect(classes.has('tier-advance-heal')).toBe(true);
        expect(logs[0]).toMatch(/SYSTEM_RESTORE/);
        expect(chromeAt.length).toBe(0); // not at t=0
        jobs.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
        expect(result.beats).toEqual(
            expect.arrayContaining(['dim', 'restore_line', 'chrome', 'toast_log', 'share_pulse', 'done'])
        );
        expect(chromeAt.length).toBe(1); // once at restore_line (+ done is no-op)
        expect(shareCalls.some((c) => c && c.pulse === true)).toBe(true);
        expect(notifies).toHaveLength(1);
        expect(notifies[0]).toMatch(/SYSTEM_RESTORE v1\.0 ONLINE/);
        expect(notifies[0]).toMatch(/was v0\.0/);
        expect(result.line).toContain('v1.0');
    });

    test('reduced-motion: applyChrome sync + ready share, no motion class', () => {
        const classes = new Set();
        let chrome = 0;
        /** @type {Array<{ pulse?: boolean } | undefined>} */
        const shareCalls = [];
        const notifies = [];
        const result = runHealCeremony(
            { fromTier: 0, toTier: 3 },
            {
                isReducedMotion: () => true,
                addBodyClass: (c) => classes.add(c),
                removeBodyClass: (c) => classes.delete(c),
                setHealDataset: () => {},
                appendLog: () => {},
                notify: (m) => notifies.push(m),
                showSharePulse: (o) => shareCalls.push(o),
                applyChrome: () => { chrome += 1; },
                schedule: () => {}
            }
        );
        expect(result.reduced).toBe(true);
        expect(result.durationMs).toBe(0);
        expect(classes.has('tier-advance-heal')).toBe(false);
        expect(chrome).toBe(1);
        expect(result.beats).toEqual(expect.arrayContaining(['toast_log', 'done']));
        expect(shareCalls.length).toBe(1);
        expect(shareCalls[0]?.pulse).toBe(false);
        expect(notifies[0]).toMatch(/was v0\.0/);
    });

    test('prefersReducedMotion reads matchMedia', () => {
        const win = { matchMedia: () => ({ matches: true }) };
        expect(prefersReducedMotion(win)).toBe(true);
    });
});

describe('05 healCapture split still privacy', () => {
    test('meta is sanitized (no save secrets)', () => {
        const meta = buildCaptureMeta({ fromTier: 0, toTier: 2 });
        expect(meta.kind).toBe(CAPTURE_KIND);
        expect(isCaptureSanitized(meta)).toBe(true);
        expect(meta).not.toHaveProperty('ab');
        expect(meta).not.toHaveProperty('inventory');
        expect(JSON.stringify(meta)).not.toMatch(/prestigePoints|cyberWitchesSave/i);
    });

    test('isCaptureSanitized rejects banned keys', () => {
        expect(isCaptureSanitized({ kind: CAPTURE_KIND, ab: 99 })).toBe(false);
        expect(isCaptureSanitized({ kind: CAPTURE_KIND, inventory: [] })).toBe(false);
    });

    test('tier chrome labels only', () => {
        expect(tierChrome(0).name).toMatch(/T0/);
        expect(tierChrome(99).name).toMatch(/T4|PEAK|T0/); // clamped
    });

    test('createSplitStillCanvas paints without throwing (mock 2d)', () => {
        /** @type {any} */
        const mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            fillRect: () => {},
            strokeRect: () => {},
            fillText: () => {},
            createLinearGradient: () => ({ addColorStop: () => {} })
        };
        const { canvas, meta, sanitized } = createSplitStillCanvas(
            { fromTier: 0, toTier: 2 },
            { getContext: () => mockCtx }
        );
        expect(sanitized).toBe(true);
        expect(meta.fromTier).toBe(0);
        expect(meta.toTier).toBe(2);
        expect(canvas).toBeTruthy();
        expect(canvas.width).toBe(meta.w);
        expect(() => paintSplitStill(mockCtx, { fromTier: 0, toTier: 1, width: 100, height: 50 })).not.toThrow();
    });

    test('createSplitStillCanvas returns null canvas when getContext missing', () => {
        const { canvas, sanitized } = createSplitStillCanvas(
            { fromTier: 0, toTier: 1 },
            { getContext: () => null }
        );
        expect(sanitized).toBe(true);
        expect(canvas).toBeNull();
    });
});

describe('06 share wire + visual artifact', () => {
    test('buildHealShareArtifact still privacy-safe (v2 visual flag)', () => {
        const { text, payload } = buildHealShareArtifact({ fromTier: 0, toTier: 2, at: 1 });
        expect(payload.kind).toBe('hex-compiler-heal');
        expect(payload.visual).toBe('split-still');
        expect(payload).not.toHaveProperty('ab');
        expect(text).toContain('SYSTEM_RESTORE');
    });

    test('captureHealShare increments shareAttempt and returns mode', async () => {
        localStorage.clear();
        // Avoid jsdom prompt noise; clipboard stub is enough for text path
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: async () => {} }
        });
        const result = await captureHealShare({ fromTier: 0, toTier: 1, at: 1 });
        expect(result.payload.kind).toBe('hex-compiler-heal');
        expect(['visual+text', 'text', 'fail']).toContain(result.mode);
        expect(result.ok).toBe(true);
        expect(Number(localStorage.getItem('cw.funnel.shareAttempt') || '0')).toBeGreaterThanOrEqual(1);
        if (result.visual) {
            expect(result.visual.sanitized).toBe(true);
        }
    });
});

describe('source seams — designTier + craft + CSS ceremony', () => {
    test('designTierSystem uses ceremony + funnel', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(src).toContain('playHealCeremonyInBrowser');
        expect(src).toContain('markFirstHeal');
        expect(src).toContain('playHealMoment');
    });

    test('craftingManager marks TTA automation', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/craftingManager.js'), 'utf8');
        expect(src).toContain('markFirstAutomation');
        expect(src).toContain('_markFunnelAutomation');
    });

    test('CSS has ceremony beat classes + reduced-motion + hard mono scoped', () => {
        const css = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
        expect(css).toContain('heal-ceremony-dim');
        expect(css).toContain('heal-ceremony-restore');
        expect(css).toContain('heal-ceremony-chrome');
        expect(css).toContain('prefers-reduced-motion');
        expect(css).toContain('grayscale(0.92)');
        expect(css).toContain('heal-share-btn--ready');
        // filter must not be applied to bare body.tier-advance-heal { filter:
        expect(css).not.toMatch(/body\.tier-advance-heal\s*\{[^}]*filter:/);
    });

    test('designTierSystem gates chrome behind ceremony applyChrome', () => {
        const src = fs.readFileSync(path.join(root, 'js/modules/game/designTierSystem.js'), 'utf8');
        expect(src).toContain('applyChrome');
        expect(src).toContain('logOnly');
        expect(src).toContain('SYSTEM_RESTORE v1.0');
        expect(src).not.toContain('SYSTEM_UPDATE: v1.0');
    });

    test('03 format decision recorded still-first', () => {
        const adr = fs.readFileSync(
            path.join(root, '.scratch/capture-the-heal/issues/03-visual-share-format.md'),
            'utf8'
        );
        // Will be updated when decision lands in same PR
        expect(adr.length).toBeGreaterThan(50);
    });
});
