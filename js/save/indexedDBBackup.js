/**
 * IndexedDB durable backup for saves.
 *
 * localStorage stays the SYNCHRONOUS source of truth for all save / load /
 * recovery / merge / export logic — none of that delicate code changes. This
 * module adds IndexedDB as a durable mirror:
 *
 *  - IndexedDB has a far larger quota than localStorage and is much less likely
 *    to be evicted under storage pressure.
 *  - On every save we mirror the blob into IndexedDB (fire-and-forget).
 *  - At boot, any key present in IndexedDB but MISSING from localStorage is
 *    copied back into localStorage, so the existing synchronous load path finds
 *    it. That is what lets progress survive a localStorage eviction.
 *
 * Everything here is defensive: if IndexedDB is unavailable (older browser,
 * private mode, jsdom) or any operation errors, the functions resolve/no-op so a
 * save or a cold boot is NEVER blocked or broken by the backup layer.
 */

const DB_NAME = 'cyberWitchesBackup';
const STORE = 'saves';
const DB_VERSION = 1;

function idbAvailable() {
    try {
        return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
        return false;
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        if (!idbAvailable()) {
            reject(new Error('IndexedDB unavailable'));
            return;
        }
        let req;
        try {
            req = indexedDB.open(DB_NAME, DB_VERSION);
        } catch (e) {
            reject(e);
            return;
        }
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    });
}

/**
 * Write a value under a key. Resolves true on success, false on any failure.
 * @param {string} key
 * @param {string} value
 * @returns {Promise<boolean>}
 */
export async function idbSet(key, value) {
    if (!idbAvailable()) return false;
    let db;
    try {
        db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(value, key);
            tx.oncomplete = () => resolve(undefined);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
        return true;
    } catch {
        return false;
    } finally {
        try { db && db.close(); } catch { /* ignore */ }
    }
}

/**
 * Read a value by key. Resolves the value, or null if absent / on any failure.
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function idbGet(key) {
    if (!idbAvailable()) return null;
    let db;
    try {
        db = await openDB();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get(key);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => reject(req.error);
        });
    } catch {
        return null;
    } finally {
        try { db && db.close(); } catch { /* ignore */ }
    }
}

/**
 * Delete a key. Resolves true on success, false on any failure.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function idbDelete(key) {
    if (!idbAvailable()) return false;
    let db;
    try {
        db = await openDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).delete(key);
            tx.oncomplete = () => resolve(undefined);
            tx.onerror = () => reject(tx.error);
        });
        return true;
    } catch {
        return false;
    } finally {
        try { db && db.close(); } catch { /* ignore */ }
    }
}

/**
 * Mirror a value into IndexedDB WITHOUT blocking the caller. The synchronous
 * localStorage write already succeeded; this just keeps the durable copy fresh.
 * @param {string} key
 * @param {string} value
 */
export function mirrorToIndexedDB(key, value) {
    // Deliberately not awaited — a save must never wait on IndexedDB.
    void idbSet(key, value);
}

/**
 * At boot: for each key, if localStorage is MISSING it but IndexedDB HAS it,
 * copy IndexedDB -> localStorage so the synchronous load path finds it. When
 * localStorage already has the key it stays authoritative and we just refresh
 * the IndexedDB mirror. Never throws.
 * @param {string[]} keys
 * @returns {Promise<void>}
 */
export async function restoreMissingFromIndexedDB(keys) {
    if (!idbAvailable()) return;
    for (const key of keys) {
        try {
            let local = null;
            try { local = localStorage.getItem(key); } catch { local = null; }

            if (local !== null) {
                // localStorage wins when present; refresh the durable mirror.
                mirrorToIndexedDB(key, local);
                continue;
            }

            const backup = await idbGet(key);
            if (backup != null) {
                try { localStorage.setItem(key, backup); } catch { /* quota / unavailable */ }
            }
        } catch {
            // Never let one key's failure block the others or boot.
        }
    }
}
