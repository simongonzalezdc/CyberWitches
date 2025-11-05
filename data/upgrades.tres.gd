# Upgrades (Inscriptions) data array
var upgrades_data = [
	UpgradeData.new(
		"u_global_1", "Hex Compiler v1", "global", "multiplier", 1.5,
		{"wax_block": 2, "braided_wick": 2, "shaped_crys": 1}, 0.0
	),
	UpgradeData.new(
		"u_candle_1", "Wax Algorithm", "producer:ws_candle", "multiplier", 2.0,
		{"wax_block": 3, "dist_aether": 1}, 100.0
	),
	UpgradeData.new(
		"u_crystal_1", "Quantum Faceting", "producer:ws_crystal", "multiplier", 2.0,
		{"shaped_crys": 2, "dist_aether": 1}, 250.0
	),
	UpgradeData.new(
		"u_click_1", "Sigil Stroke", "click", "additive", 1.0,
		{"wick_fiber": 10}, 0.0
	),
	UpgradeData.new(
		"u_cauldron_1", "Brew Daemon", "producer:ws_cauldron", "multiplier", 1.8,
		{"shaped_crys": 2, "dist_aether": 2, "dig_candle": 1}, 1500.0
	),
	UpgradeData.new(
		"u_global_2", "Sigil Cache", "global", "multiplier", 1.8,
		{"wax_block": 3, "shaped_crys": 2, "dist_aether": 2}, 500.0
	)
]

