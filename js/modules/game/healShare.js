/**
 * Sanitized heal-moment share artifact (no full save payload).
 * Still-first visual default (Capture the heal ticket 03/05/06) + text fallback.
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
    // Privacy: tier chrome only — never AB, inventory, prestige keys, or raw save.
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
 * Copy text to clipboard; falls back to prompt.
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

    try {
        if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
            window.prompt('Copy heal share:', text);
            return true;
        }
    } catch { /* ignore */ }

    return false;
}

/**
 * SHARE_RESTORE: visual split still (download) + text clipboard, ≤2 player actions.
 * Text fallback always attempted if canvas fails.
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @returns {Promise<{
 *   ok: boolean,
 *   text: string,
 *   payload: object,
 *   visual: { ok: boolean, dataUrl: string | null, meta: object, sanitized: boolean } | null,
 *   mode: 'visual+text' | 'text' | 'fail'
 * }>}
 */
export async function captureHealShare(detail) {
    const { text, payload } = buildHealShareArtifact(detail);
    markShareAttempt();

    /** @type {{ ok: boolean, dataUrl: string | null, meta: object, sanitized: boolean }} */
    let visual;
    try {
        const still = await captureSplitStill(detail);
        const sanitized = still.sanitized && isCaptureSanitized(still.meta);
        if (still.ok && still.dataUrl && sanitized) {
            const downloaded = downloadDataUrl(
                still.dataUrl,
                `hex-compiler-heal-t${Number(detail.toTier) || 0}.png`
            );
            // Only claim visual success when download trigger ran; dataUrl alone is not delivery.
            visual = {
                ok: !!downloaded,
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

    if (visual.ok && textOk) {
        return { ok: true, text, payload, visual, mode: 'visual+text' };
    }
    if (visual.ok) {
        return { ok: true, text, payload, visual, mode: 'visual+text' };
    }
    if (textOk) {
        return { ok: true, text, payload, visual, mode: 'text' };
    }
    return { ok: false, text, payload, visual, mode: 'fail' };
}
