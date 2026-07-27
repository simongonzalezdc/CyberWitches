/**
 * SYSTEM_LOG / craft-notifications rail.
 * Cap growth so the sidebar never becomes a memory leak.
 */

const MAX_LINES = 40;
let _el = null;

function getEl() {
    if (!_el) {
        _el = document.getElementById('craft-notifications');
    }
    return _el;
}

/**
 * Append a diegetic system log line.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warn'} [level]
 */
export function appendSystemLog(message, level = 'info') {
    const el = getEl();
    if (!el) return;

    // Clear empty-state placeholder
    const placeholder = el.querySelector('[data-system-log-empty]');
    if (placeholder) placeholder.remove();

    const line = document.createElement('div');
    line.className = `system-log-line system-log-${level}`;
    const ts = new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.textContent = `[${ts}] ${String(message ?? '')}`;
    el.appendChild(line);

    while (el.children.length > MAX_LINES) {
        el.removeChild(el.firstChild);
    }
    el.scrollTop = el.scrollHeight;
}

export function ensureSystemLogEmptyState() {
    const el = getEl();
    if (!el) return;
    if (el.children.length > 0) return;
    const p = document.createElement('div');
    p.dataset.systemLogEmpty = '1';
    p.className = 'system-log-empty';
    p.textContent = '> LOG_IDLE — awaiting compile events…';
    el.appendChild(p);
}
