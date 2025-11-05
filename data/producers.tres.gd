# Producers (Workstations) data array
var producers_data = [
	ProducerData.new(
		"ws_melter", "Wax Melter", 0.0,
		{"wax_bits": 10}, 1.10,
		{"wax_block": 0.30}
	),
	ProducerData.new(
		"ws_spinner", "Wick Spinner", 0.0,
		{"wick_fiber": 10}, 1.10,
		{"braided_wick": 0.30}
	),
	ProducerData.new(
		"ws_shaper", "Crystal Shaper", 25.0,
		{"crystal_dust": 10}, 1.12,
		{"shaped_crys": 0.20}
	),
	ProducerData.new(
		"ws_still", "Aether Still", 50.0,
		{"aether_ess": 10}, 1.12,
		{"dist_aether": 0.20}
	),
	ProducerData.new(
		"ws_candle", "Digital Candle Farm", 100.0,
		{"wax_block": 5, "braided_wick": 1, "dist_aether": 2}, 1.14,
		{"ab": 1.0}
	),
	ProducerData.new(
		"ws_crystal", "Crystal Rig", 250.0,
		{"shaped_crys": 2, "dist_aether": 2}, 1.14,
		{"ab": 0.15, "crystal_dust": 0.05}
	),
	ProducerData.new(
		"ws_cauldron", "Quantum Cauldron", 1500.0,
		{"shaped_crys": 3, "dist_aether": 3, "dig_candle": 1}, 1.16,
		{"ab": 2.5}
	)
]

