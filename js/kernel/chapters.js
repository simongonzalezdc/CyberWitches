/**
 * Chapter spine + primary contracts (tickets 07, 08).
 */

import { cloneState } from './state.js';

/**
 * @typedef {{ id: string, title: string, body: string, quality?: string }} Storylet
 * @typedef {{ id: string, title: string, message: string, check: (s: import('./types.js').KernelState) => boolean }} Contract
 */

/** @type {{ id: string, title: string, storylet: Storylet, gate: (s: import('./types.js').KernelState) => boolean }[]} */
export const CHAPTERS = [
    {
        id: 'ch0_boot',
        title: 'Boot sector',
        gate: () => true,
        storylet: {
            id: 'st_boot',
            title: 'HEX GRID DEGRADED',
            body: 'Address space 0xFADI NG loses cells by the hour. You are the compiler who already lost Sector-7. This plane still has a pulse. EXEC while it lasts.'
        }
    },
    {
        id: 'ch1_capture',
        title: 'First capture',
        gate: (s) => Object.entries(s.workstations || {}).some(([id, n]) => n > 0 && id.includes('capture')),
        storylet: {
            id: 'st_capture',
            title: 'SECTOR TAP ONLINE',
            body: 'One tap holds. Ambient fire-noise becomes countable essence. Not saved yet — only caught.',
            quality: 'caught_once'
        }
    },
    {
        id: 'ch2_storage',
        title: 'Storage against fade',
        gate: (s) => (s.workstations?.mod_essence_buffer || 0) >= 1 || (s.workstations?.mod_deep_cache || 0) >= 1,
        storylet: {
            id: 'st_store',
            title: 'BUFFER ALLOCATED',
            body: 'Unstored essence bleeds into the void. The buffer is not wealth — it is a refusal to forget.',
            quality: 'has_buffer'
        }
    },
    {
        id: 'ch3_bind',
        title: 'Binding',
        gate: (s) => (s.workstations?.mod_aether_bind || 0) >= 1,
        storylet: {
            id: 'st_bind',
            title: 'FOUR STREAMS LOCK',
            body: 'Aether is the compromise the elements make when they refuse to fade alone.',
            quality: 'bound_aether'
        }
    },
    {
        id: 'ch4_compile',
        title: 'Self-hosting compile',
        gate: (s) =>
            (s.workstations?.mod_bit_reactor || 0) >= 1 || (s.workstations?.mod_sector_compiler || 0) >= 1,
        storylet: {
            id: 'st_compile',
            title: 'REACTOR HEARTBEAT',
            body: 'The plane pays you back in Arcane Bits. Preservation has an interest rate — if you keep the pipes full.',
            quality: 'self_hosting'
        }
    },
    {
        id: 'ch5_exhaustion',
        title: 'Exhaustion',
        gate: (s) => (s.ab || 0) >= 200 || (s.prestigeLifetimeEarned || 0) >= 400,
        storylet: {
            id: 'st_exhaust',
            title: 'PLANE THINNING',
            body: 'Gains flatten. The hex grid is tired. Ascend when the Keys outweigh another hour of grinding this sky.',
            quality: 'near_prestige'
        }
    },
    {
        id: 'ch6_prestige',
        title: 'Kernel fragments',
        gate: (s) => (s.prestigeCount || 0) >= 1,
        storylet: {
            id: 'st_prestige',
            title: 'PLANE ABANDONED',
            body: 'You leave a spent address space and carry Kernel fragments. Affinity is the scar that remains.',
            quality: 'prestiger'
        }
    }
];

/** @type {Contract[]} */
export const CONTRACTS = [
    {
        id: 'c_fire_tap',
        title: 'COMPILE_CONTRACT',
        message: 'Fire sector failing — bring a Fire Sector Tap online (≥1).',
        check: (s) => (s.workstations?.mod_fire_capture || 0) >= 1
    },
    {
        id: 'c_buffer',
        title: 'COMPILE_CONTRACT',
        message: 'Essence bleeds — craft an Essence Buffer so stock survives soft fade.',
        check: (s) => (s.workstations?.mod_essence_buffer || 0) >= 1
    },
    {
        id: 'c_water_tap',
        title: 'COMPILE_CONTRACT',
        message: 'Stabilize Water sector — own ≥1 Water Sector Tap.',
        check: (s) => (s.workstations?.mod_water_capture || 0) >= 1
    },
    {
        id: 'c_bind',
        title: 'COMPILE_CONTRACT',
        message: 'Bind the four streams — craft Aether Binder.',
        check: (s) => (s.workstations?.mod_aether_bind || 0) >= 1
    },
    {
        id: 'c_compile',
        title: 'COMPILE_CONTRACT',
        message: 'Self-host progress — own Sector Compiler or Arcane Bit Reactor.',
        check: (s) =>
            (s.workstations?.mod_bit_reactor || 0) >= 1 || (s.workstations?.mod_sector_compiler || 0) >= 1
    },
    {
        id: 'c_prestige',
        title: 'ASCEND_CONTRACT',
        message: 'Plane thinning — complete Prestige 1 when Keys outweigh more grinding.',
        check: (s) => (s.prestigeCount || 0) >= 1
    }
];

/**
 * @param {import('./types.js').KernelState} state
 */
export function getPrimaryContract(state) {
    const done = new Set(state.contractsCompleted || []);
    for (const c of CONTRACTS) {
        if (done.has(c.id)) continue;
        if (c.check(state)) {
            done.add(c.id);
            continue;
        }
        return c;
    }
    return {
        id: 'c_maintain',
        title: 'COMPILE_IDLE',
        message: 'Primary contracts complete. Optimize pipeline, shields, and prestige timing.',
        check: () => false
    };
}

/**
 * Sync completed contracts + newly reached chapters.
 * @param {import('./types.js').KernelState} state
 * @returns {import('./types.js').DispatchResult}
 */
export function applyChapterCheck(state) {
    const next = cloneState(state);
    /** @type {import('./types.js').DomainEvent[]} */
    const events = [];

    // Contracts completed
    const completed = new Set(next.contractsCompleted || []);
    for (const c of CONTRACTS) {
        if (c.check(next) && !completed.has(c.id)) {
            completed.add(c.id);
            events.push({ type: 'contract_completed', contractId: c.id });
        }
    }
    next.contractsCompleted = [...completed];

    // Chapters
    const reached = new Set(next.chapters?.reached || []);
    for (const ch of CHAPTERS) {
        if (reached.has(ch.id)) continue;
        if (!ch.gate(next)) continue;
        reached.add(ch.id);
        if (ch.storylet.quality) {
            next.chapters.qualities[ch.storylet.quality] = true;
        }
        events.push({
            type: 'chapterReached',
            chapterId: ch.id,
            storylet: ch.storylet
        });
    }
    next.chapters.reached = [...reached];

    if (!events.length) {
        events.push({ type: 'chapter_check', noop: true });
    }
    return { state: next, events };
}
