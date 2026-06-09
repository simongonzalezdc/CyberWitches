/**
 * Lightweight Error Reporter
 * Catches unhandled errors, buffers them, and provides query access.
 * No external dependencies — zero-cost in production until endpoint is configured.
 */

const MAX_BUFFER_SIZE = 20;
const errorBuffer = [];
let reportEndpoint = null;

class ErrorReporter {
    constructor() {
        this._installed = false;
    }

    install(options = {}) {
        if (this._installed) return;
        this._installed = true;

        if (options.endpoint) {
            reportEndpoint = options.endpoint;
        }

        window.addEventListener('error', (event) => {
            this.report(event.error || new Error(event.message), {
                type: 'unhandled',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
            this.report(error, { type: 'unhandledrejection' });
        });
    }

    report(error, context = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack || null,
            context,
            url: window.location.href
        };

        errorBuffer.push(entry);
        if (errorBuffer.length > MAX_BUFFER_SIZE) {
            errorBuffer.shift();
        }

        if (reportEndpoint) {
            this._send(entry);
        }

        if (context.type === 'unhandled' || context.type === 'unhandledrejection') {
            console.error('[ErrorReporter]', entry.message, context);
        }
    }

    getRecent(count = 10) {
        return errorBuffer.slice(-count);
    }

    getErrorCount() {
        return errorBuffer.length;
    }

    clear() {
        errorBuffer.length = 0;
    }

    async _send(entry) {
        try {
            await fetch(reportEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
                keepalive: true
            });
        } catch (_e) {
            // Silently fail — don't create error loops
        }
    }
}

export const errorReporter = new ErrorReporter();
export default errorReporter;