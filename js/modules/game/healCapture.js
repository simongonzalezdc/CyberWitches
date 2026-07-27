/**
 * Sanitized split before/after heal still (Tier 0 left / restored right).
 * Privacy: tier chrome labels only — never AB, inventory, prestige, or save keys.
 */

/** @typedef {{ fromTier: number, toTier: number, width?: number, height?: number }} SplitCaptureInput */

export const CAPTURE_KIND = 'hex-compiler-heal-still';
export const DEFAULT_WIDTH = 960;
export const DEFAULT_HEIGHT = 540;

/** Tier palette chrome (CSS-aligned tokens, not live DOM secrets). */
const TIER_CHROME = Object.freeze({
    0: { name: 'T0 DOS', bg: '#0a0c0f', fg: '#7a8a8a', accent: '#5a6a6a', label: 'MONOCHROME' },
    1: { name: 'T1 COLOR', bg: '#0c1018', fg: '#c0c8d0', accent: '#7ec8e3', label: '16-BIT' },
    2: { name: 'T2 ENHANCED', bg: '#0a1220', fg: '#e8f0ff', accent: '#5eead4', label: 'SFX+COLOR' },
    3: { name: 'T3 FULL', bg: '#081018', fg: '#f0f4ff', accent: '#c084fc', label: 'PARTICLES' },
    4: { name: 'T4 PEAK', bg: '#060a12', fg: '#ffffff', accent: '#f472b6', label: 'PEAK CHROME' }
});

/**
 * @param {number} tier
 * @returns {typeof TIER_CHROME[0]}
 */
export function tierChrome(tier) {
    const t = Math.max(0, Math.min(4, Number(tier) || 0));
    return TIER_CHROME[/** @type {0|1|2|3|4} */ (t)] || TIER_CHROME[0];
}

/**
 * Build export metadata — must stay free of save secrets.
 * @param {SplitCaptureInput} input
 * @returns {{ kind: string, v: number, fromTier: number, toTier: number, w: number, h: number }}
 */
export function buildCaptureMeta(input) {
    const fromTier = Number(input.fromTier) || 0;
    const toTier = Number(input.toTier) || fromTier;
    return {
        kind: CAPTURE_KIND,
        v: 1,
        fromTier,
        toTier,
        w: input.width || DEFAULT_WIDTH,
        h: input.height || DEFAULT_HEIGHT
    };
}

/**
 * Assert payload has no save-adjacent keys (unit/e2e gate).
 * @param {object} meta
 * @returns {boolean}
 */
export function isCaptureSanitized(meta) {
    const banned = [
        'ab', 'inventory', 'save', 'prestigePoints', 'eldritch',
        'cyberWitchesSave', 'workstations', 'password', 'token'
    ];
    const json = JSON.stringify(meta);
    if (banned.some((k) => Object.prototype.hasOwnProperty.call(meta, k))) return false;
    if (banned.some((k) => new RegExp(k, 'i').test(json))) return false;
    return meta.kind === CAPTURE_KIND;
}

/**
 * Paint a split still onto a canvas (offscreen-friendly).
 * Left = fromTier chrome, right = toTier chrome + SYSTEM_RESTORE.
 * @param {CanvasRenderingContext2D} ctx
 * @param {SplitCaptureInput} input
 */
export function paintSplitStill(ctx, input) {
    const w = input.width || DEFAULT_WIDTH;
    const h = input.height || DEFAULT_HEIGHT;
    const mid = Math.floor(w / 2);
    const from = tierChrome(input.fromTier);
    const to = tierChrome(input.toTier);

    // Left panel — broken / prior tier
    ctx.fillStyle = from.bg;
    ctx.fillRect(0, 0, mid, h);
    ctx.strokeStyle = from.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, mid - 24, h - 24);

    ctx.fillStyle = from.fg;
    ctx.font = 'bold 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(from.name, 28, 48);
    ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = from.accent;
    ctx.fillText(from.label, 28, 74);
    ctx.fillStyle = from.fg;
    ctx.fillText('> shell degraded', 28, 120);
    ctx.fillText('> chrome: offline', 28, 144);
    ctx.fillText('> SYSTEM_RESTORE pending', 28, 168);

    // Dim scanlines (mute-readable "broken")
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, mid, 1);
    }

    // Right panel — restored tier
    ctx.fillStyle = to.bg;
    ctx.fillRect(mid, 0, w - mid, h);
    ctx.strokeStyle = to.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(mid + 12, 12, w - mid - 24, h - 24);

    // Glow bar top
    const grad = ctx.createLinearGradient(mid, 0, w, 0);
    grad.addColorStop(0, to.accent);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(mid + 12, 12, w - mid - 24, 6);

    ctx.fillStyle = to.fg;
    ctx.font = 'bold 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(to.name, mid + 28, 48);
    ctx.font = '14px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = to.accent;
    ctx.fillText(to.label, mid + 28, 74);
    ctx.fillStyle = to.fg;
    ctx.fillText('> SYSTEM_RESTORE ONLINE', mid + 28, 120);
    ctx.fillText(`> v${Number(input.toTier) || 0}.0 chrome recovered`, mid + 28, 144);
    ctx.fillText('> SHARE_RESTORE ready', mid + 28, 168);

    // Divider
    ctx.fillStyle = to.accent;
    ctx.fillRect(mid - 1, 0, 2, h);

    // Footer brand (no secrets)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('Hex Compiler — mute-readable heal', 28, h - 24);
    ctx.fillText('Broken → restored', mid + 28, h - 24);
}

/**
 * Create canvas + paint split still. Safe when document/canvas missing (returns null canvas).
 * @param {SplitCaptureInput} input
 * @param {{ document?: Document | null, getContext?: (c: HTMLCanvasElement) => CanvasRenderingContext2D | null }} [env]
 * @returns {{ canvas: HTMLCanvasElement | null, meta: ReturnType<typeof buildCaptureMeta>, sanitized: boolean }}
 */
export function createSplitStillCanvas(input, env = {}) {
    const meta = buildCaptureMeta(input);
    const sanitized = isCaptureSanitized(meta);
    const doc = env.document !== undefined
        ? env.document
        : (typeof document !== 'undefined' ? document : null);

    if (!doc || typeof doc.createElement !== 'function') {
        return { canvas: null, meta, sanitized };
    }

    const canvas = doc.createElement('canvas');
    canvas.width = meta.w;
    canvas.height = meta.h;
    /** @type {CanvasRenderingContext2D | null} */
    let ctx = null;
    try {
        ctx = typeof env.getContext === 'function'
            ? env.getContext(canvas)
            : canvas.getContext('2d');
    } catch {
        ctx = null;
    }
    if (!ctx) {
        return { canvas: null, meta, sanitized };
    }
    paintSplitStill(ctx, {
        fromTier: meta.fromTier,
        toTier: meta.toTier,
        width: meta.w,
        height: meta.h
    });
    return { canvas, meta, sanitized };
}

/**
 * Capture PNG data URL (or null if canvas unavailable).
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @returns {Promise<{ ok: boolean, dataUrl: string | null, meta: object, sanitized: boolean, mime: string }>}
 */
export async function captureSplitStill(detail = {}) {
    const input = {
        fromTier: Number(detail.fromTier) || 0,
        toTier: Number(detail.toTier) || 0
    };
    const { canvas, meta, sanitized } = createSplitStillCanvas(input);
    if (!canvas || typeof canvas.toDataURL !== 'function') {
        return { ok: false, dataUrl: null, meta, sanitized, mime: 'image/png' };
    }
    try {
        const dataUrl = canvas.toDataURL('image/png');
        // Guard: data URL must not contain game secrets as embedded text
        if (/cyberWitchesSave|prestigePoints|localStorage/i.test(dataUrl.slice(0, 200))) {
            return { ok: false, dataUrl: null, meta, sanitized: false, mime: 'image/png' };
        }
        return { ok: true, dataUrl, meta, sanitized, mime: 'image/png' };
    } catch {
        return { ok: false, dataUrl: null, meta, sanitized, mime: 'image/png' };
    }
}

/**
 * Trigger browser download of a data URL (no-op when document missing).
 * @param {string} dataUrl
 * @param {string} [filename]
 * @param {Document | null} [doc]
 * @returns {boolean}
 */
export function downloadDataUrl(dataUrl, filename = 'hex-compiler-heal.png', doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || !dataUrl) return false;
    try {
        const a = doc.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.rel = 'noopener';
        a.style.display = 'none';
        doc.body?.appendChild(a);
        a.click();
        a.remove();
        return true;
    } catch {
        return false;
    }
}
