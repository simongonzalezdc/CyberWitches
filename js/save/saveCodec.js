/**
 * Save Codec
 *
 * The integrity + migration core of the save system, extracted from GameState so
 * it can be exercised directly instead of only through a fully-constructed
 * GameState + localStorage. These functions are pure over their arguments: they
 * read and write the plain save-snapshot object and never touch game instance
 * state or storage.
 *
 * The seam GameState depends on is just two functions:
 *   - encode(snapshot)  -> string        (compress + checksum + stringify)
 *   - decode(rawString) -> DecodeResult  (parse + checksum + migrate + validate)
 *
 * The granular functions below are the implementation, exported so they remain
 * the test surface for the rules they encode.
 */

export const SAVE_VERSION = '2.1';

/**
 * Recursively sort object keys for deterministic JSON stringification.
 * @param {*} obj
 * @returns {*} value with sorted keys (arrays preserved in order)
 */
export function sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sortObjectKeys(item));
    }

    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = sortObjectKeys(obj[key]);
    }
    return sorted;
}

/**
 * Simple, non-cryptographic checksum for corruption detection.
 * Computed over the snapshot with the `checksum` field removed and keys sorted
 * so the result is stable regardless of property order.
 * @param {Object} data
 * @returns {string}
 */
export function calculateChecksum(data) {
    const cleanData = { ...data };
    delete cleanData.checksum;

    const sortedData = sortObjectKeys(cleanData);

    const str = JSON.stringify(sortedData);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

/**
 * Verify a snapshot's checksum.
 * A missing checksum is treated as valid (legacy save).
 * @param {Object} data
 * @returns {boolean}
 */
export function verifyChecksum(data) {
    if (!data.checksum) {
        return true;
    }
    return data.checksum === calculateChecksum(data);
}

/**
 * Migrate a snapshot from an older version in place to the current SAVE_VERSION.
 * @param {Object} data
 * @returns {boolean} whether migration succeeded
 */
export function migrateSaveData(data) {
    try {
        if (!data.version) {
            data.version = '2.0';
        }

        // Migrate from version 1.0 to 2.0
        if (data.version === '1.0' || parseFloat(data.version) < 2.0) {
            if (!data.inventory) data.inventory = {};
            if (!data.workstations) data.workstations = {};
            if (!data.upgrades) data.upgrades = {};
            if (!data.prestige) data.prestige = { points: 0, lifetimeEarned: 0.0, bonuses: {}, count: 0 };
            if (!data.experiments) data.experiments = { discovered: [] };
            if (!data.stats) data.stats = { totalTaps: 0, totalWorkstationsCrafted: 0, totalPotionsCrafted: 0 };
            if (!data.milestones) data.milestones = { unlocked: [] };

            data.version = '2.0';
        }

        // Migrate to version 2.1 (ensure prestige.count exists)
        if (data.version === '2.0' || parseFloat(data.version) < 2.1) {
            if (data.prestige) {
                if (data.prestige.count === undefined || data.prestige.count === null) {
                    if ((data.prestige.points > 0) || (data.prestige.bonuses && Object.keys(data.prestige.bonuses).length > 0)) {
                        data.prestige.count = 1;
                        console.info('Migrating save: Added missing prestige.count (inferred from prestige points/bonuses)');
                    } else {
                        data.prestige.count = 0;
                    }
                }
            }

            data.version = '2.1';
        }

        // Save written by a NEWER build than this one (e.g. the player opened an
        // older deploy, or a downgrade). We can't downgrade a schema we don't
        // know, so load best-effort and warn — validateSaveData is the safety net
        // for anything actually malformed. Previously this passed silently.
        if (parseFloat(data.version) > parseFloat(SAVE_VERSION)) {
            console.warn(`Save version ${data.version} is newer than supported ${SAVE_VERSION}; loading best-effort.`);
        }

        return true;
    } catch (error) {
        console.error('Save data migration failed:', error);
        return false;
    }
}

/**
 * Validate a snapshot's structure and value ranges.
 * @param {Object} data
 * @returns {boolean}
 */
export function validateSaveData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        console.error('Save validation failed: Invalid data structure');
        return false;
    }

    // Check version exists and is valid
    if (!data.version || typeof data.version !== 'string') {
        console.warn('Save data missing version, attempting migration');
        return migrateSaveData(data);
    }

    // Validate numeric values
    const numericFields = ['ab', 'abTotal', 'timestamp'];
    for (const field of numericFields) {
        if (data[field] !== undefined) {
            if (typeof data[field] !== 'number' || isNaN(data[field])) {
                console.error(`Save validation failed: Invalid ${field} value`);
                return false;
            }

            if (field === 'ab' || field === 'abTotal') {
                if (data[field] < 0) {
                    console.error(`Save validation failed: Negative ${field} value`);
                    return false;
                }
                if (data[field] > Number.MAX_SAFE_INTEGER) {
                    console.error(`Save validation failed: ${field} overflow`);
                    return false;
                }
            }

            if (field === 'timestamp') {
                const currentTime = Date.now() / 1000;
                const year2020 = 1577836800; // Jan 1, 2020
                const futureLimit = currentTime + (365 * 24 * 60 * 60); // 1 year in future

                if (data[field] < year2020 || data[field] > futureLimit) {
                    console.error(`Save validation failed: Invalid timestamp (${data[field]})`);
                    return false;
                }
            }
        }
    }

    // Validate nested objects
    const objectFields = ['inventory', 'workstations', 'upgrades', 'prestige', 'experiments', 'stats'];
    for (const field of objectFields) {
        if (data[field] !== undefined) {
            if (typeof data[field] !== 'object' || data[field] === null) {
                console.error(`Save validation failed: Invalid ${field} object`);
                return false;
            }

            if (field === 'inventory' || field === 'workstations') {
                for (const key in data[field]) {
                    const value = data[field][key];
                    if (typeof value !== 'number' || isNaN(value) || value < 0) {
                        console.error(`Save validation failed: Invalid ${field}.${key} value`);
                        return false;
                    }
                    if (value > Number.MAX_SAFE_INTEGER) {
                        console.error(`Save validation failed: ${field}.${key} overflow`);
                        return false;
                    }
                }
            }

            if (field === 'prestige' && data.prestige) {
                const prestigeFields = ['points', 'lifetimeEarned', 'count'];
                for (const pField of prestigeFields) {
                    if (data.prestige[pField] !== undefined) {
                        if (typeof data.prestige[pField] !== 'number' || isNaN(data.prestige[pField]) || data.prestige[pField] < 0) {
                            console.error(`Save validation failed: Invalid prestige.${pField} value`);
                            return false;
                        }
                    }
                }

                if (data.prestige.bonuses && typeof data.prestige.bonuses === 'object') {
                    for (const bonusId in data.prestige.bonuses) {
                        const level = data.prestige.bonuses[bonusId];
                        if (typeof level !== 'number' || isNaN(level) || level < 0 || level > 1000) {
                            console.error(`Save validation failed: Invalid prestige bonus level for ${bonusId}`);
                            return false;
                        }
                    }
                }
            }
        }
    }

    // Validate arrays
    const arrayFields = ['discoveredRecipes'];
    for (const field of arrayFields) {
        if (data[field] !== undefined && !Array.isArray(data[field])) {
            console.error(`Save validation failed: ${field} is not an array`);
            return false;
        }
    }

    if (data.experiments?.discovered !== undefined) {
        if (!Array.isArray(data.experiments.discovered)) {
            console.error('Save validation failed: experiments.discovered is not an array');
            return false;
        }
        if (data.experiments.discovered.length > 1000) {
            console.error('Save validation failed: experiments.discovered array too large');
            return false;
        }
    }

    if (data.milestones?.unlocked !== undefined) {
        if (!Array.isArray(data.milestones.unlocked)) {
            console.error('Save validation failed: milestones.unlocked is not an array');
            return false;
        }
        if (data.milestones.unlocked.length > 10000) {
            console.error('Save validation failed: milestones.unlocked array too large');
            return false;
        }
    }

    // Check data size to prevent localStorage overflow
    const dataStr = JSON.stringify(data);
    const dataSizeKB = dataStr.length / 1024;
    if (dataSizeKB > 4096) { // 4MB limit (localStorage usually has 5-10MB limit)
        console.error(`Save validation failed: Save data too large (${dataSizeKB.toFixed(2)} KB)`);
        return false;
    }

    return true;
}

/**
 * Compress a snapshot to reduce size (returns object). Drops zero-valued
 * inventory/workstation entries. NOTE: the returned object reuses the caller's
 * nested inventory/workstations references, matching the original behavior —
 * callers pass a copy when they must not mutate the live state.
 * @param {Object} data
 * @returns {Object}
 */
export function compressSaveDataObject(data) {
    const compressed = {
        ab: data.ab,
        abTotal: data.abTotal,
        inventory: data.inventory,
        workstations: data.workstations,
        upgrades: data.upgrades,
        prestige: data.prestige,
        experiments: data.experiments,
        stats: data.stats,
        milestones: data.milestones,
        elementSpecialization: data.elementSpecialization,
        specializationBonuses: data.specializationBonuses,
        timestamp: data.timestamp,
        version: data.version
    };

    Object.keys(compressed.inventory).forEach(key => {
        if (compressed.inventory[key] === 0) {
            delete compressed.inventory[key];
        }
    });

    Object.keys(compressed.workstations).forEach(key => {
        if (compressed.workstations[key] === 0) {
            delete compressed.workstations[key];
        }
    });

    return compressed;
}

/**
 * Compress a snapshot to reduce size (returns string). Preserves an existing
 * checksum field.
 * @param {Object} data
 * @returns {string}
 */
export function compressSaveData(data) {
    const compressed = compressSaveDataObject(data);
    if (data.checksum) {
        compressed.checksum = data.checksum;
    }
    return JSON.stringify(compressed);
}

/**
 * Encode a save snapshot for storage: compress, attach a checksum over the
 * compressed form, and stringify.
 * @param {Object} snapshot
 * @returns {string}
 */
export function encode(snapshot) {
    const compressed = compressSaveDataObject(snapshot);
    compressed.checksum = calculateChecksum(compressed);
    return JSON.stringify(compressed);
}

/**
 * @typedef {Object} DecodeResult
 * @property {'loaded'|'checksum_recalculated'|'parse_error'|'migration_failed'|'invalid'} outcome
 * @property {Object} [snapshot]  the usable snapshot (only for loaded / checksum_recalculated)
 * @property {Error}  [error]     the parse error (only for parse_error)
 */

/**
 * Decode a stored save string back into a usable snapshot, applying the same
 * integrity pipeline the game uses on load: parse -> checksum -> migrate ->
 * validate. The caller decides what to do with each outcome (back up, notify,
 * apply).
 * @param {string} rawString
 * @returns {DecodeResult}
 */
export function decode(rawString) {
    let data;
    try {
        data = JSON.parse(rawString);
    } catch (error) {
        return { outcome: 'parse_error', error };
    }

    let checksumRecalculated = false;
    if (!verifyChecksum(data)) {
        // Mismatch may just be property-order drift; recalculate and carry on.
        data.checksum = calculateChecksum(data);
        checksumRecalculated = true;
    }

    if (data.version && !migrateSaveData(data)) {
        return { outcome: 'migration_failed' };
    }

    if (!validateSaveData(data)) {
        return { outcome: 'invalid' };
    }

    return { outcome: checksumRecalculated ? 'checksum_recalculated' : 'loaded', snapshot: data };
}
