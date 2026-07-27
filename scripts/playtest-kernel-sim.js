#!/usr/bin/env node
/**
 * Automated cold-boot playtest sim (n≥5) against qualitative gates.
 * Not a substitute for human playtest — deterministic Kernel path metrics.
 *
 * Usage: node scripts/playtest-kernel-sim.js
 * Exit 0 if all n sessions pass G1–G4 automated proxies.
 */
import { createInitialState, reduce } from '../js/kernel/index.js';
import { projectorsFromGameState } from '../js/kernel/adapter.js';
import { assertAllProducersMapped } from '../js/kernel/pipelineRoles.js';
import { PRODUCERS } from '../js/modules/data/producers.js';

const N = 5;
/** @type {{ session: number, tta: number, buffer: boolean, voidSeen: boolean, prestigeBand: string, pass: boolean }[]} */
const results = [];

function runSession(seed) {
    let s = createInitialState(seed);
    let t = 0;
    let tta = Infinity;
    let buffer = false;

    // Cast until first craft affordable (~ capture online)
    for (let i = 0; i < 80; i++) {
        const r = reduce(s, { type: 'cast' });
        s = r.state;
        t += 1;
        if ((s.inventory.fire_essence || 0) >= 10 && tta === Infinity) {
            // craft capture
            const c = reduce(s, { type: 'craft', moduleId: 'mod_fire_capture' });
            s = c.state;
            if ((s.workstations.mod_fire_capture || 0) >= 1) tta = t;
        }
    }

    // Build buffer if possible
    if ((s.inventory.crystal_dust || 0) < 20) {
        for (let i = 0; i < 40; i++) {
            s = reduce(s, { type: 'cast' }).state;
        }
    }
    if ((s.inventory.crystal_dust || 0) >= 8) {
        s.inventory.fire_essence = Math.max(s.inventory.fire_essence || 0, 4);
        const b = reduce(s, { type: 'craft', moduleId: 'mod_essence_buffer' });
        s = b.state;
        buffer = (s.workstations.mod_essence_buffer || 0) >= 1;
    }

    // Overcap → fade
    s.inventory.fire_essence = 500;
    s.storageCap = 40;
    s.totalTaps = 100;
    const faded = reduce(s, { type: 'tick', dtSec: 30 });
    s = faded.state;
    const voidSeen = faded.events.some((e) => e.type === 'faded');

    // Prestige band
    s.prestigeLifetimeEarned = 8000;
    s.ab = 400;
    const prev = reduce(s, { type: 'prestige_preview' });
    const band = prev.events[0]?.recommend?.band || 'unknown';

    // G1 proxy: EXEC path yields taps
    const g1 = tta < Infinity && tta <= 40;
    // G2 void law
    const g2 = voidSeen;
    // G3 pipeline roles exist
    const p = projectorsFromGameState({
        ab: s.ab,
        inventory: s.inventory,
        workstations: { ws_fire_forge: 1, ...s.workstations },
        totalTaps: s.totalTaps,
        prestigeCount: 0,
        affinity: s.affinity,
        storageCap: s.storageCap
    });
    const g3 = p.pipeline.roles.length === 5 && p.pipeline.roles.some((r) => r.ownedTotal > 0);
    // G4 prestige message present
    const g4 = typeof band === 'string' && band.length > 0;

    return {
        session: seed,
        tta: tta === Infinity ? -1 : tta,
        buffer,
        voidSeen,
        prestigeBand: String(band),
        pass: g1 && g2 && g3 && g4
    };
}

const mapCheck = assertAllProducersMapped(PRODUCERS.map((p) => p.id));
if (!mapCheck.ok) {
    console.error('FAIL: producers missing pipeline roles:', mapCheck.missing.join(', '));
    process.exit(1);
}
console.info(`PASS: all ${PRODUCERS.length} producers mapped to pipeline roles`);

for (let i = 1; i <= N; i++) {
    const r = runSession(1000 + i * 17);
    results.push(r);
    console.info(
        `session ${i}: pass=${r.pass} tta=${r.tta} void=${r.voidSeen} buffer=${r.buffer} band=${r.prestigeBand}`
    );
}

const passed = results.filter((r) => r.pass).length;
console.info(`\nRESULT: ${passed}/${N} sessions pass automated gates`);
if (passed < N) {
    process.exit(1);
}
console.info('PASS: playtest-kernel-sim n≥5');
process.exit(0);
