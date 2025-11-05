extends Node

class_name DataInitializer

# This script initializes game data if .tres files don't exist yet
# In production, you would create proper .tres files in Godot editor

static func initialize_ingredients() -> Array:
	return [
		IngredientData.new("wax_bits", "Wax Bits", 0),
		IngredientData.new("wick_fiber", "Wick Fiber", 0),
		IngredientData.new("crystal_dust", "Crystal Dust", 0),
		IngredientData.new("aether_ess", "Aether Essence", 0),
		IngredientData.new("wax_block", "Wax Block", 1),
		IngredientData.new("braided_wick", "Braided Wick", 1),
		IngredientData.new("shaped_crys", "Shaped Crystal", 1),
		IngredientData.new("dist_aether", "Distilled Aether", 1),
		IngredientData.new("dig_candle", "Digital Candle", 2)
	]

static func initialize_producers() -> Array:
	var p1 = ProducerData.new()
	p1.id = "ws_melter"
	p1.display_name = "Wax Melter"
	p1.unlock_at_ab = 0.0
	p1.recipe = {"wax_bits": 10}
	p1.growth = 1.10
	p1.outputs = {"wax_block": 0.30}
	
	var p2 = ProducerData.new()
	p2.id = "ws_spinner"
	p2.display_name = "Wick Spinner"
	p2.unlock_at_ab = 0.0
	p2.recipe = {"wick_fiber": 10}
	p2.growth = 1.10
	p2.outputs = {"braided_wick": 0.30}
	
	var p3 = ProducerData.new()
	p3.id = "ws_shaper"
	p3.display_name = "Crystal Shaper"
	p3.unlock_at_ab = 25.0
	p3.recipe = {"crystal_dust": 10}
	p3.growth = 1.12
	p3.outputs = {"shaped_crys": 0.20}
	
	var p4 = ProducerData.new()
	p4.id = "ws_still"
	p4.display_name = "Aether Still"
	p4.unlock_at_ab = 50.0
	p4.recipe = {"aether_ess": 10}
	p4.growth = 1.12
	p4.outputs = {"dist_aether": 0.20}
	
	var p5 = ProducerData.new()
	p5.id = "ws_candle"
	p5.display_name = "Digital Candle Farm"
	p5.unlock_at_ab = 100.0
	p5.recipe = {"wax_block": 5, "braided_wick": 1, "dist_aether": 2}
	p5.growth = 1.14
	p5.outputs = {"ab": 1.0}
	
	var p6 = ProducerData.new()
	p6.id = "ws_crystal"
	p6.display_name = "Crystal Rig"
	p6.unlock_at_ab = 250.0
	p6.recipe = {"shaped_crys": 2, "dist_aether": 2}
	p6.growth = 1.14
	p6.outputs = {"ab": 0.15, "crystal_dust": 0.05}
	
	var p7 = ProducerData.new()
	p7.id = "ws_cauldron"
	p7.display_name = "Quantum Cauldron"
	p7.unlock_at_ab = 1500.0
	p7.recipe = {"shaped_crys": 3, "dist_aether": 3, "dig_candle": 1}
	p7.growth = 1.16
	p7.outputs = {"ab": 2.5}
	
	return [p1, p2, p3, p4, p5, p6, p7]

static func initialize_upgrades() -> Array:
	var u1 = UpgradeData.new()
	u1.id = "u_global_1"
	u1.display_name = "Hex Compiler v1"
	u1.description = "Increases all production by 50%"
	u1.affects = "global"
	u1.type = "multiplier"
	u1.value = 1.5
	u1.recipe = {"wax_block": 2, "braided_wick": 2, "shaped_crys": 1}
	u1.unlock_at_ab = 0.0
	
	var u2 = UpgradeData.new()
	u2.id = "u_candle_1"
	u2.display_name = "Wax Algorithm"
	u2.description = "Doubles Digital Candle Farm production"
	u2.affects = "producer:ws_candle"
	u2.type = "multiplier"
	u2.value = 2.0
	u2.recipe = {"wax_block": 3, "dist_aether": 1}
	u2.unlock_at_ab = 100.0
	
	var u3 = UpgradeData.new()
	u3.id = "u_crystal_1"
	u3.display_name = "Quantum Faceting"
	u3.description = "Doubles Crystal Rig production"
	u3.affects = "producer:ws_crystal"
	u3.type = "multiplier"
	u3.value = 2.0
	u3.recipe = {"shaped_crys": 2, "dist_aether": 1}
	u3.unlock_at_ab = 250.0
	
	var u4 = UpgradeData.new()
	u4.id = "u_click_1"
	u4.display_name = "Sigil Stroke"
	u4.description = "Adds +1 to all cast rewards"
	u4.affects = "click"
	u4.type = "additive"
	u4.value = 1.0
	u4.recipe = {"wick_fiber": 10}
	u4.unlock_at_ab = 0.0
	
	var u5 = UpgradeData.new()
	u5.id = "u_cauldron_1"
	u5.display_name = "Brew Daemon"
	u5.description = "Increases Quantum Cauldron production by 80%"
	u5.affects = "producer:ws_cauldron"
	u5.type = "multiplier"
	u5.value = 1.8
	u5.recipe = {"shaped_crys": 2, "dist_aether": 2, "dig_candle": 1}
	u5.unlock_at_ab = 1500.0
	
	var u6 = UpgradeData.new()
	u6.id = "u_global_2"
	u6.display_name = "Sigil Cache"
	u6.description = "Increases all production by 80%"
	u6.affects = "global"
	u6.type = "multiplier"
	u6.value = 1.8
	u6.recipe = {"wax_block": 3, "shaped_crys": 2, "dist_aether": 2}
	u6.unlock_at_ab = 500.0
	
	return [u1, u2, u3, u4, u5, u6]

static func initialize_prestige_bonuses() -> Array:
	var b1 = PrestigeBonusData.new()
	b1.id = "pp_global_1"
	b1.display_name = "Coven's Oath"
	b1.description = "+10% global production per level"
	b1.type = "global_mult"
	b1.value = 0.10
	b1.base_cost_pp = 10.0
	b1.cost_growth = 1.5
	
	var b2 = PrestigeBonusData.new()
	b2.id = "pp_start_bits"
	b2.display_name = "Seeded Spellbook"
	b2.description = "+1000 AB at start per level"
	b2.type = "starting_currency"
	b2.value = 1000.0
	b2.base_cost_pp = 5.0
	b2.cost_growth = 1.5
	
	var b3 = PrestigeBonusData.new()
	b3.id = "pp_candle_mult"
	b3.display_name = "Wax Moon"
	b3.description = "+5% Digital Candle Farm production per level"
	b3.type = "producer_mult"
	b3.param = "ws_candle"
	b3.value = 0.05
	b3.base_cost_pp = 8.0
	b3.cost_growth = 1.5
	
	var b4 = PrestigeBonusData.new()
	b4.id = "pp_crystal_mult"
	b4.display_name = "Facet Star"
	b4.description = "+5% Crystal Rig production per level"
	b4.type = "producer_mult"
	b4.param = "ws_crystal"
	b4.value = 0.05
	b4.base_cost_pp = 10.0
	b4.cost_growth = 1.5
	
	var b5 = PrestigeBonusData.new()
	b5.id = "pp_cauldron_mult"
	b5.display_name = "Crucible Pact"
	b5.description = "+5% Quantum Cauldron production per level"
	b5.type = "producer_mult"
	b5.param = "ws_cauldron"
	b5.value = 0.05
	b5.base_cost_pp = 12.0
	b5.cost_growth = 1.5
	
	var b6 = PrestigeBonusData.new()
	b6.id = "pp_start_ingred"
	b6.display_name = "Pocket Satchel"
	b6.description = "+100 Wax Bits at start per level"
	b6.type = "start_ingredient"
	b6.param = "wax_bits"
	b6.value = 100.0
	b6.base_cost_pp = 6.0
	b6.cost_growth = 1.5
	
	return [b1, b2, b3, b4, b5, b6]

static func initialize_daily_tasks() -> Array:
	var t1 = DailyTaskData.new()
	t1.id = "d_kindle"
	t1.display_name = "Kindle the Grid"
	t1.description = "Craft 3 Wax Melters"
	t1.condition = "craft:workstation:ws_melter:3"
	t1.reward_type = "ab"
	t1.reward_value = 5000.0
	
	var t2 = DailyTaskData.new()
	t2.id = "d_song"
	t2.display_name = "Crystal Song"
	t2.description = "Own 3 Crystal Rigs"
	t2.condition = "own:workstation:ws_crystal:3"
	t2.reward_type = "buff"
	t2.reward_value = 900.0
	t2.buff_multiplier = 0.10
	
	var t3 = DailyTaskData.new()
	t3.id = "d_flow"
	t3.display_name = "Rite of Flow"
	t3.description = "Cast 150 times"
	t3.condition = "tap:150"
	t3.reward_type = "ek_frag"
	t3.reward_value = 1.0
	
	var t4 = DailyTaskData.new()
	t4.id = "d_threads"
	t4.display_name = "Threads of Fate"
	t4.description = "Craft 20 Braided Wicks (via experiment)"
	t4.condition = "craft_item:braided_wick:20"
	t4.reward_type = "ab"
	t4.reward_value = 8000.0
	
	var t5 = DailyTaskData.new()
	t5.id = "d_alchemy"
	t5.display_name = "Aether Alchemy"
	t5.description = "Craft 10 Distilled Aether (via experiment)"
	t5.condition = "craft_item:dist_aether:10"
	t5.reward_type = "buff"
	t5.reward_value = 600.0
	t5.buff_multiplier = 0.15
	
	return [t1, t2, t3, t4, t5]

