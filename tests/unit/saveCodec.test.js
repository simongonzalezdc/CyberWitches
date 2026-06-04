/**
 * @jest-environment jsdom
 *
 * Direct tests for the save codec's encode/decode seam. Before this module was
 * extracted, these behaviours (round-trip, corruption recovery, version
 * migration) could only be reached through a full GameState + localStorage.
 * Now the interface IS the test surface.
 */

import {
  encode,
  decode,
  migrateSaveData,
  compressSaveDataObject,
  SAVE_VERSION,
} from '../../js/save/saveCodec.js';

function validSnapshot(overrides = {}) {
  return {
    ab: 1000,
    abTotal: 5000,
    inventory: { fire_essence: 50, water_essence: 0 },
    workstations: { candle: 3, dead_station: 0 },
    upgrades: { u1: 1 },
    prestige: { points: 2, lifetimeEarned: 10, bonuses: { b1: 4 }, count: 1 },
    experiments: { discovered: ['r1'] },
    stats: { totalTaps: 7, totalWorkstationsCrafted: 2, totalPotionsCrafted: 1 },
    milestones: { unlocked: ['m1'] },
    elementSpecialization: null,
    specializationBonuses: {},
    timestamp: Date.now() / 1000,
    version: SAVE_VERSION,
    ...overrides,
  };
}

describe('saveCodec encode/decode round-trip', () => {
  test('a valid snapshot encodes and decodes back to a loaded snapshot', () => {
    const raw = encode(validSnapshot());
    const result = decode(raw);

    expect(result.outcome).toBe('loaded');
    expect(result.snapshot.ab).toBe(1000);
    expect(result.snapshot.abTotal).toBe(5000);
    expect(result.snapshot.version).toBe(SAVE_VERSION);
    // checksum is attached during encode and verifies on decode
    expect(typeof JSON.parse(raw).checksum).toBe('string');
  });

  test('encode drops zero-valued inventory and workstation entries', () => {
    const raw = encode(validSnapshot());
    const stored = JSON.parse(raw);
    expect(stored.inventory).not.toHaveProperty('water_essence'); // was 0
    expect(stored.workstations).not.toHaveProperty('dead_station'); // was 0
    expect(stored.inventory.fire_essence).toBe(50);
  });
});

describe('saveCodec decode outcomes', () => {
  test('unparseable input yields parse_error and no snapshot', () => {
    const result = decode('{ not valid json ');
    expect(result.outcome).toBe('parse_error');
    expect(result.snapshot).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
  });

  test('a tampered field (stale checksum) is recovered as checksum_recalculated', () => {
    const stored = JSON.parse(encode(validSnapshot()));
    stored.ab = 99999; // mutate without updating the checksum
    const result = decode(JSON.stringify(stored));

    expect(result.outcome).toBe('checksum_recalculated');
    expect(result.snapshot.ab).toBe(99999); // still loaded, recovered
  });

  test('a structurally invalid snapshot yields invalid', () => {
    // encode does not validate, so a negative-currency snapshot encodes with a
    // self-consistent checksum; decode passes the checksum stage and fails at
    // validation -> invalid.
    const result = decode(encode(validSnapshot({ ab: -1 })));

    expect(result.outcome).toBe('invalid');
    expect(result.snapshot).toBeUndefined();
  });
});

describe('saveCodec migration', () => {
  test('a v1.0 save is migrated up with required fields initialised', () => {
    const legacy = { version: '1.0', ab: 100, abTotal: 100, timestamp: Date.now() / 1000 };
    const ok = migrateSaveData(legacy);
    expect(ok).toBe(true);
    expect(legacy.version).toBe(SAVE_VERSION);
    expect(legacy.inventory).toEqual({});
    expect(legacy.prestige).toBeDefined();
  });

  test('a versionless save is stamped to the current version', () => {
    // A versionless save is stamped 2.0 first, which skips the <2.0 field-init
    // block (preserved legacy behaviour), so it only gets a version bump.
    const legacy = { ab: 100, abTotal: 100, timestamp: Date.now() / 1000 };
    expect(migrateSaveData(legacy)).toBe(true);
    expect(legacy.version).toBe(SAVE_VERSION);
  });

  test('migration infers prestige.count from prestige points', () => {
    const v20 = {
      version: '2.0',
      ab: 0,
      abTotal: 0,
      timestamp: Date.now() / 1000,
      prestige: { points: 5, lifetimeEarned: 10, bonuses: {} },
    };
    migrateSaveData(v20);
    expect(v20.version).toBe('2.1');
    expect(v20.prestige.count).toBe(1);
  });

  test('decode applies migration end-to-end for an old save', () => {
    const legacy = {
      version: '2.0',
      ab: 42,
      abTotal: 42,
      timestamp: Date.now() / 1000,
      prestige: { points: 0, lifetimeEarned: 0, bonuses: {} },
    };
    const result = decode(JSON.stringify(legacy));
    expect(result.outcome).toBe('loaded');
    expect(result.snapshot.version).toBe(SAVE_VERSION);
    expect(result.snapshot.prestige.count).toBe(0);
  });
});

describe('saveCodec compressSaveDataObject', () => {
  test('reuses nested references (callers must pass a copy)', () => {
    const snap = validSnapshot();
    const compressed = compressSaveDataObject(snap);
    expect(compressed.inventory).toBe(snap.inventory); // same reference, by design
  });
});
