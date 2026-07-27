/**
 * Potion catalog — display names + effect definitions for lab outputs.
 * Source of truth for inventory labels and consume effects.
 */

/** @type {Record<string, { displayName: string, type: string, value: number, duration: number }>} */
export const POTION_CATALOG = {
    production_elixir: { displayName: 'Production Elixir', type: 'production', value: 0.5, duration: 30 * 60 },
    haste_potion: { displayName: 'Haste Potion', type: 'cast_speed', value: 1.0, duration: 15 * 60 },
    ab_amplifier: { displayName: 'Arcane Bits Amplifier', type: 'ab_production', value: 2.0, duration: 20 * 60 },
    mega_production_elixir: { displayName: 'Mega Production Elixir', type: 'production', value: 1.0, duration: 60 * 60 },
    speed_essence: { displayName: 'Speed Essence', type: 'cast_speed', value: 2.0, duration: 30 * 60 },
    ab_turbo_charge: { displayName: 'AB Turbo Charge', type: 'ab_production', value: 5.0, duration: 45 * 60 },
    rare_catalyst: { displayName: 'Rare Catalyst', type: 'ingredient_production', value: 1.0, duration: 60 * 60 },
    ultimate_production_elixir: { displayName: 'Ultimate Production Elixir', type: 'production', value: 2.0, duration: 2 * 60 * 60 },
    quantum_speed_boost: { displayName: 'Quantum Speed Boost', type: 'cast_speed', value: 3.0, duration: 60 * 60 },
    ab_overdrive: { displayName: 'AB Overdrive', type: 'ab_production', value: 10.0, duration: 1.5 * 60 * 60 },
    master_catalyst: { displayName: 'Master Catalyst', type: 'ingredient_production', value: 2.0, duration: 2 * 60 * 60 },
    prestige_boost: { displayName: 'Prestige Boost', type: 'prestige_gain', value: 0.5, duration: 3 * 60 * 60 },
    infinity_production_elixir: { displayName: 'Infinity Production Elixir', type: 'production', value: 5.0, duration: 4 * 60 * 60 },
    void_speed_surge: { displayName: 'Void Speed Surge', type: 'cast_speed', value: 5.0, duration: 2 * 60 * 60 },
    ab_infinity_boost: { displayName: 'AB Infinity Boost', type: 'ab_production', value: 20.0, duration: 3 * 60 * 60 },
    ab_eternal_boost: { displayName: 'AB Eternal Boost', type: 'ab_production', value: 10.0, duration: 2 * 60 * 60 },
    infinity_catalyst: { displayName: 'Infinity Catalyst', type: 'ingredient_production', value: 4.0, duration: 4 * 60 * 60 },
    prestige_mastery: { displayName: 'Prestige Mastery', type: 'prestige_gain', value: 1.0, duration: 6 * 60 * 60 },
    focus_elixir: { displayName: 'Focus Elixir', type: 'focus_gain', value: 1.0, duration: 30 * 60 },
    focus_boost_potion: { displayName: 'Focus Boost Potion', type: 'focus_gain', value: 2.0, duration: 45 * 60 },
    quantum_focus_elixir: { displayName: 'Quantum Focus Elixir', type: 'focus_gain', value: 3.0, duration: 60 * 60 },
    void_focus_essence: { displayName: 'Void Focus Essence', type: 'focus_gain', value: 4.0, duration: 90 * 60 },
    eternal_focus_essence: { displayName: 'Eternal Focus Essence', type: 'focus_gain', value: 5.0, duration: 2 * 60 * 60 },
    eternal_production_elixir: { displayName: 'Eternal Production Elixir', type: 'production', value: 8.0, duration: 5 * 60 * 60 },
    eternal_speed_surge: { displayName: 'Eternal Speed Surge', type: 'cast_speed', value: 6.0, duration: 3 * 60 * 60 },
    eternal_catalyst: { displayName: 'Eternal Catalyst', type: 'ingredient_production', value: 6.0, duration: 5 * 60 * 60 }
};

/**
 * @param {string} potionId
 * @returns {{ type: string, value: number, duration: number } | null}
 */
export function getPotionEffectDef(potionId) {
    const row = POTION_CATALOG[potionId];
    if (!row) return null;
    return { type: row.type, value: row.value, duration: row.duration };
}

/**
 * @param {string} id
 * @returns {string}
 */
export function getItemDisplayName(id) {
    if (POTION_CATALOG[id]) return POTION_CATALOG[id].displayName;
    return id;
}
