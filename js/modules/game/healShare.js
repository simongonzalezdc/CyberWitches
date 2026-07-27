/**
 * Sanitized heal-moment share artifact (no full save payload).
 */

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
        v: 1,
        fromTier,
        toTier,
        at
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
 * Copy share text to clipboard; falls back to prompt.
 * @param {{ fromTier?: number, toTier?: number, at?: number }} detail
 * @returns {Promise<{ ok: boolean, text: string, payload: object }>}
 */
export async function captureHealShare(detail) {
    const { text, payload } = buildHealShareArtifact(detail);
    try {
        const key = 'cw.funnel.shareAttempt';
        const n = Number(localStorage.getItem(key) || '0') + 1;
        localStorage.setItem(key, String(n));
    } catch { /* private */ }

    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return { ok: true, text, payload };
        }
    } catch { /* fall through */ }

    try {
        if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
            window.prompt('Copy heal share:', text);
            return { ok: true, text, payload };
        }
    } catch { /* ignore */ }

    return { ok: false, text, payload };
}
