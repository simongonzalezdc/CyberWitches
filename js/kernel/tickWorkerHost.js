/**
 * Ticket 19 — optional worker path for large offline catch-up ticks.
 * Main thread always works; worker used when dtSec >= threshold and Worker available.
 * Profiling disposition: main-thread tick is fine for ≤60s; worker for long offline.
 */

import { gameStateToKernel, applyKernelResourcesToGameState, offlineTick } from './adapter.js';

/** Offline dt above this uses worker when available (seconds). */
export const WORKER_DT_THRESHOLD_SEC = 60;

/**
 * Run offline kernel tick on main or worker.
 * @param {any} gs
 * @param {number} dtSec
 * @returns {Promise<{ mode: 'main'|'worker'|'main_fallback', state: any, events: any[] }>}
 */
export async function offlineTickOnGameState(gs, dtSec) {
    const dt = Math.max(0, Number(dtSec) || 0);
    const snap = gameStateToKernel(gs);

    const WorkerCtor = typeof globalThis !== 'undefined' ? globalThis.Worker : undefined;
    const URLCtor = typeof globalThis !== 'undefined' ? globalThis.URL : undefined;
    const BlobCtor = typeof globalThis !== 'undefined' ? globalThis.Blob : undefined;
    if (
        dt >= WORKER_DT_THRESHOLD_SEC &&
        typeof WorkerCtor === 'function' &&
        typeof URLCtor === 'function' &&
        typeof BlobCtor === 'function'
    ) {
        try {
            const result = await runInWorker(snap, dt);
            applyKernelResourcesToGameState(gs, result.state, result.events);
            // Also apply fade-only path already in tick
            return { mode: 'worker', state: result.state, events: result.events };
        } catch {
            /* fall through */
        }
    }

    const result = offlineTick(snap, dt, true);
    applyKernelResourcesToGameState(gs, result.state, result.events);
    return {
        mode: dt >= WORKER_DT_THRESHOLD_SEC ? 'main_fallback' : 'main',
        state: result.state,
        events: result.events
    };
}

/**
 * Inline worker: pure JSON in/out (no DOM).
 * @param {import('./types.js').KernelState} state
 * @param {number} dtSec
 */
function runInWorker(state, dtSec) {
    const source = `
      self.onmessage = (e) => {
        const { state, dtSec } = e.data;
        try {
          // Minimal tick: production-less offline fade bound (worker cannot import modules)
          // Host already has full reduce; worker re-implements bound offline tick for fade safety.
          const dt = Math.min(Math.max(0, Number(dtSec) || 0), 8 * 3600);
          const next = JSON.parse(JSON.stringify(state));
          next.tick = (next.tick || 0) + 1;
          // Soft-fade proportional when over cap (mirrors fade.js BASE)
          const FADEABLE = ['fire_essence','water_essence','air_essence','crystal_dust','dist_aether'];
          const cap = Number(next.storageCap) || 50;
          let total = 0;
          for (const k of FADEABLE) total += next.inventory[k] || 0;
          const faded = {};
          if (total > cap && dt > 0) {
            const over = total - cap;
            const lose = over * 0.002 * 0.25 * dt; // offline soft
            for (const k of FADEABLE) {
              const have = next.inventory[k] || 0;
              if (have <= 0) continue;
              const take = Math.min(have, lose * (have / total));
              if (take > 0) {
                next.inventory[k] = have - take;
                faded[k] = take;
              }
            }
          }
          self.postMessage({ ok: true, state: next, events: [{ type: 'tick', dtSec: dt, offline: true, faded, worker: true }] });
        } catch (err) {
          self.postMessage({ ok: false, error: String(err && err.message ? err.message : err) });
        }
      };
    `;
    return new Promise((resolve, reject) => {
        const WorkerC = /** @type {typeof Worker} */ (globalThis.Worker);
        const URLC = /** @type {typeof URL} */ (globalThis.URL);
        const BlobC = /** @type {typeof Blob} */ (globalThis.Blob);
        const blob = new BlobC([source], { type: 'application/javascript' });
        const url = URLC.createObjectURL(blob);
        const w = new WorkerC(url);
        const timer = setTimeout(() => {
            w.terminate();
            URLC.revokeObjectURL(url);
            reject(new Error('worker_timeout'));
        }, 5000);
        w.onmessage = (/** @type {MessageEvent} */ ev) => {
            clearTimeout(timer);
            w.terminate();
            URLC.revokeObjectURL(url);
            if (ev.data && ev.data.ok) resolve(ev.data);
            else reject(new Error(ev.data?.error || 'worker_failed'));
        };
        w.onerror = (/** @type {ErrorEvent} */ err) => {
            clearTimeout(timer);
            w.terminate();
            URLC.revokeObjectURL(url);
            reject(err);
        };
        w.postMessage({ state, dtSec });
    });
}
