/**
 * Sanitized heal-moment share artifact (no full save payload).
 * Still-first visual default + honest mode reporting (Opus 5 Rank 5).
 */

import { captureSplitStill, downloadDataUrl, isCaptureSanitized } from './healCapture.js';
import { markShareAttempt } from './funnelMetrics.js';

/**
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @returns {{ text: string, payload: object }}
 */
export function buildHealShareArtifact(detail = {}) {
    const fromTier = Number(detail.fromTier) || 0;
    const toTier = Number(detail.toTier) || fromTier;
    const at = detail.at || Date.now();
    const payload = {
        kind: 'hex-compiler-heal',
        v: 2,
        fromTier,
        toTier,
        at,
        visual: 'split-still'
    };
    const text = [
        `Hex Compiler — SYSTEM_RESTORE v${toTier}.0 ONLINE`,
        `(was v${fromTier}.0)`,
        'Broken terminal chrome heals as you preserve magic.',
        'Play free: https://simongonzalezdc.github.io/CyberWitches/play.html'
    ].join('\n');
    return { text, payload };
}

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyText(text) {
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch { /* fall through */ }
    return false;
}

/**
 * dataURL → Blob for Web Share / ClipboardItem.
 * @param {string} dataUrl
 * @returns {Blob | null}
 */
function dataUrlToBlob(dataUrl) {
    try {
        const [header, b64] = dataUrl.split(',');
        if (!header || !b64) return null;
        const mime = header.match(/data:([^;]+)/)?.[1] || 'image/png';
        const decode = typeof globalThis.atob === 'function' ? globalThis.atob : null;
        if (!decode) return null;
        const bin = decode(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new Blob([bytes], { type: mime });
    } catch {
        return null;
    }
}

/**
 * @param {Blob} blob
 * @param {string} text
 * @param {string} filename
 * @returns {Promise<'native' | null>}
 */
async function tryNativeShare(blob, text, filename) {
    try {
        if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return null;
        const FileCtor = typeof globalThis.File === 'function' ? globalThis.File : null;
        if (!FileCtor) return null;
        const file = new FileCtor([blob], filename, { type: blob.type || 'image/png' });
        const payload = { files: [file], text, title: 'Hex Compiler SYSTEM_RESTORE' };
        if (typeof navigator.canShare === 'function' && !navigator.canShare(payload)) return null;
        await navigator.share(payload);
        return 'native';
    } catch {
        return null;
    }
}

/**
 * SHARE_RESTORE: visual still + text, honest mode labels.
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @returns {Promise<{
 *   ok: boolean,
 *   text: string,
 *   payload: object,
 *   visual: { ok: boolean, dataUrl: string | null, meta: object, sanitized: boolean },
 *   mode: 'native' | 'visual+text' | 'download' | 'text' | 'fail'
 * }>}
 */
export async function captureHealShare(detail) {
    const { text, payload } = buildHealShareArtifact(detail);
    markShareAttempt();

    /** @type {{ ok: boolean, dataUrl: string | null, meta: object, sanitized: boolean }} */
    let visual;
    let downloaded = false;
    let native = false;

    try {
        const still = await captureSplitStill(detail);
        const sanitized = still.sanitized && isCaptureSanitized(still.meta);
        if (still.ok && still.dataUrl && sanitized) {
            const filename = `hex-compiler-heal-t${Number(detail.toTier) || 0}.png`;
            const blob = dataUrlToBlob(still.dataUrl);
            if (blob) {
                const nativeMode = await tryNativeShare(blob, text, filename);
                if (nativeMode === 'native') {
                    native = true;
                    downloaded = true;
                }
            }
            if (!native) {
                downloaded = downloadDataUrl(still.dataUrl, filename);
            }
            visual = {
                ok: !!(downloaded || native),
                dataUrl: still.dataUrl,
                meta: still.meta,
                sanitized: true
            };
        } else {
            visual = {
                ok: false,
                dataUrl: null,
                meta: still.meta || {},
                sanitized: !!sanitized
            };
        }
    } catch {
        visual = { ok: false, dataUrl: null, meta: {}, sanitized: true };
    }

    const textOk = await copyText(text);

    if (native) {
        return { ok: true, text, payload, visual, mode: 'native' };
    }
    if (visual.ok && textOk) {
        return { ok: true, text, payload, visual, mode: 'visual+text' };
    }
    if (visual.ok) {
        return { ok: true, text, payload, visual, mode: 'download' };
    }
    if (textOk) {
        return { ok: true, text, payload, visual, mode: 'text' };
    }
    return { ok: false, text, payload, visual, mode: 'fail' };
}
