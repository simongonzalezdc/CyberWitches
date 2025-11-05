extends Node

# ========================================
# STATE VARIABLES
# ========================================

# Currency
var ab: float = 0.0
var ab_total_earned: float = 0.0

# Inventory (ingredient_id: amount)
var inventory: Dictionary = {}

# Workstations (producer_id: owned_count)
var workstations: Dictionary = {}

# Upgrades (upgrade_id: true)
var upgrades_owned: Dictionary = {}

# Prestige
var prestige_points: int = 0
var prestige_lifetime_earned: float = 0.0
var prestige_bonuses: Dictionary = {}  # bonus_id: level

# Buffs (active temporary effects)
var active_buffs: Array = []

# Experiments (discovered recipes)
var discovered_recipes: Array = []

# Hidden recipes for discovery
var hidden_recipes: Array = []

# Stats
var total_taps: int = 0
var total_workstations_crafted: int = 0

# Timestamps
var last_save_time: float = 0.0

# ========================================
# SIGNALS
# ========================================

signal ab_changed(new_value: float)
signal ingredient_changed(ingredient_id: String, new_value: float)
signal workstation_crafted(workstation_id: String, new_count: int)
signal upgrade_purchased(upgrade_id: String)
signal prestige_completed(ek_earned: int)
signal recipe_discovered(recipe_id: String)
signal welcome_back(elapsed: float, ab_gained: float)

# ========================================
# INITIALIZATION
# ========================================

func _ready():
	load_hidden_recipes()
	load_game_state()
	
	# Connect daily tracking
	workstation_crafted.connect(_on_workstation_for_dailies)
	
	# Start tick loop
	var timer = Timer.new()
	timer.wait_time = 0.1  # 10 ticks per second
	timer.timeout.connect(_on_tick)
	add_child(timer)
	timer.start()

func _notification(what):
	if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_WM_GO_BACK_REQUEST:
		save_game_state()
		get_tree().quit()

# ========================================
# GAME TICK
# ========================================

func _on_tick():
	var delta = 0.1  # 100ms tick
	
	# Update buffs
	update_buffs(delta)
	
	# Calculate production
	var production = calculate_total_production(delta)
	
	# Apply production
	for output_id in production:
		if output_id == "ab":
			add_ab(production[output_id])
		else:
			add_ingredient(output_id, production[output_id])
	
	# Auto-save every 30 seconds
	if Time.get_unix_time_from_system() - last_save_time > 30.0:
		save_game_state()

# ========================================
# PRODUCTION CALCULATIONS
# ========================================

func calculate_total_production(delta: float) -> Dictionary:
	var total_output = {}
	
	for ws_id in workstations:
		var owned = workstations[ws_id]
		var prod_data = Crafting.get_producer(ws_id)
		if not prod_data:
			continue
		
		# Get base outputs
		for output_id in prod_data.outputs:
			var base_rate = prod_data.outputs[output_id]
			
			# Apply multipliers
			var prestige_data_res = load("res://data/prestige_bonuses.tres")
			var prestige_data_list = []
			if prestige_data_res and prestige_data_res.has("data"):
				prestige_data_list = prestige_data_res.data
			
			var mult = Balance.get_production_multiplier(
				ws_id,
				upgrades_owned,
				prestige_bonuses,
				active_buffs,
				Crafting.upgrades,
				prestige_data_list
			)
			
			var final_rate = base_rate * mult * owned
			
			if not total_output.has(output_id):
				total_output[output_id] = 0.0
			total_output[output_id] += final_rate * delta
	
	return total_output

func get_ab_per_second() -> float:
	var production = calculate_total_production(1.0)
	return production.get("ab", 0.0)

# ========================================
# BUFFS
# ========================================

func update_buffs(delta: float):
	var i = active_buffs.size() - 1
	while i >= 0:
		active_buffs[i].remaining -= delta
		if active_buffs[i].remaining <= 0:
			active_buffs.remove_at(i)
		i -= 1

func add_buff(multiplier: float, duration: float):
	active_buffs.append({
		"multiplier": multiplier,
		"remaining": duration
	})

# ========================================
# CURRENCY & INVENTORY
# ========================================

func add_ab(amount: float):
	ab += amount
	ab_total_earned += amount
	prestige_lifetime_earned += amount
	ab_changed.emit(ab)

func spend_ab(amount: float) -> bool:
	if ab < amount:
		return false
	ab -= amount
	ab_changed.emit(ab)
	return true

func add_ingredient(ing_id: String, amount: float):
	if not inventory.has(ing_id):
		inventory[ing_id] = 0.0
	inventory[ing_id] += amount
	ingredient_changed.emit(ing_id, inventory[ing_id])

func spend_ingredient(ing_id: String, amount: float) -> bool:
	if inventory.get(ing_id, 0.0) < amount:
		return false
	inventory[ing_id] -= amount
	ingredient_changed.emit(ing_id, inventory[ing_id])
	return true

# ========================================
# CAST (Manual Gathering)
# ========================================

func cast():
	total_taps += 1
	
	# Base tier-0 ingredients
	var base_amounts = {
		"wax_bits": 1.0,
		"wick_fiber": 1.0,
		"crystal_dust": 0.5,
		"aether_ess": 0.5
	}
	
	# Apply click upgrades
	var click_mult = 1.0
	for upg_id in upgrades_owned:
		var upg_data = Crafting.get_upgrade(upg_id)
		if upg_data and upg_data.affects == "click":
			if upg_data.type == "multiplier":
				click_mult *= upg_data.value
			elif upg_data.type == "additive":
				click_mult += upg_data.value
	
	# Grant ingredients
	for ing_id in base_amounts:
		add_ingredient(ing_id, base_amounts[ing_id] * click_mult)
	
	# Track daily progress
	DailyRituals.update_task_progress("tap", "", total_taps)

# ========================================
# CRAFTING
# ========================================

func craft_workstation(ws_id: String, amount: int = 1) -> bool:
	var prod_data = Crafting.get_producer(ws_id)
	if not prod_data:
		return false
	
	# Check unlock
	if ab < prod_data.unlock_at_ab:
		return false
	
	var success_count = 0
	for i in range(amount):
		var current_owned = workstations.get(ws_id, 0)
		var recipe = Crafting.get_producer_recipe(ws_id, current_owned)
		
		if not Crafting.consume_recipe(recipe, inventory):
			break
		
		workstations[ws_id] = current_owned + 1
		success_count += 1
		total_workstations_crafted += 1
	
	if success_count > 0:
		workstation_crafted.emit(ws_id, workstations[ws_id])
		return true
	
	return false

func inscribe_upgrade(upg_id: String) -> bool:
	if upgrades_owned.has(upg_id):
		return false  # Already owned
	
	var upg_data = Crafting.get_upgrade(upg_id)
	if not upg_data:
		return false
	
	# Check unlock
	if ab < upg_data.unlock_at_ab:
		return false
	
	# Check recipe
	if not Crafting.consume_recipe(upg_data.recipe, inventory):
		return false
	
	upgrades_owned[upg_id] = true
	upgrade_purchased.emit(upg_id)
	return true

# ========================================
# PRESTIGE
# ========================================

func calculate_prestige_gain() -> int:
	var current_ek = Balance.prestige_points_for(prestige_lifetime_earned)
	return max(0, current_ek - prestige_points)

func ascend():
	var ek_gain = calculate_prestige_gain()
	if ek_gain <= 0:
		return
	
	prestige_points += ek_gain
	
	# Reset run
	ab = 0.0
	ab_total_earned = 0.0
	inventory.clear()
	workstations.clear()
	upgrades_owned.clear()
	active_buffs.clear()
	total_taps = 0
	total_workstations_crafted = 0
	
	# Apply prestige start bonuses
	apply_prestige_start_bonuses()
	
	prestige_completed.emit(ek_gain)
	save_game_state()

func apply_prestige_start_bonuses():
	var prestige_data_res = load("res://data/prestige_bonuses.tres")
	if not prestige_data_res:
		return
	
	var prestige_data_list = prestige_data_res.data if prestige_data_res.has("data") else []
	
	# Starting AB
	for bonus_id in prestige_bonuses:
		for bonus_data in prestige_data_list:
			if bonus_data.id == bonus_id and bonus_data.type == "starting_currency":
				var levels = prestige_bonuses[bonus_id]
				add_ab(bonus_data.value * levels)
	
	# Starting ingredients
	for bonus_id in prestige_bonuses:
		for bonus_data in prestige_data_list:
			if bonus_data.id == bonus_id and bonus_data.type == "start_ingredient":
				var levels = prestige_bonuses[bonus_id]
				add_ingredient(bonus_data.param, bonus_data.value * levels)

func purchase_prestige_bonus(bonus_id: String) -> bool:
	var prestige_data_res = load("res://data/prestige_bonuses.tres")
	if not prestige_data_res:
		return false
	
	var prestige_data_list = prestige_data_res.data if prestige_data_res.has("data") else []
	
	var bonus_data = null
	for data in prestige_data_list:
		if data.id == bonus_id:
			bonus_data = data
			break
	
	if not bonus_data:
		return false
	
	var current_level = prestige_bonuses.get(bonus_id, 0)
	var cost = bonus_data.base_cost_pp * pow(bonus_data.cost_growth, current_level)
	
	if prestige_points < cost:
		return false
	
	prestige_points -= int(cost)
	prestige_bonuses[bonus_id] = current_level + 1
	
	return true

# ========================================
# EXPERIMENT SYSTEM (Discovery)
# ========================================

func load_hidden_recipes():
	hidden_recipes = [
		{
			"id": "wax_block_bulk",
			"inputs": {"wax_bits": 50},
			"outputs": {"wax_block": 5},
			"name": "Wax Block Bulk",
			"description": "Convert raw wax into refined blocks"
		},
		{
			"id": "braid_wick",
			"inputs": {"wick_fiber": 30},
			"outputs": {"braided_wick": 3},
			"name": "Braided Wick",
			"description": "Weave fibers into sturdy wicks"
		},
		{
			"id": "distill_aether",
			"inputs": {"aether_ess": 40},
			"outputs": {"dist_aether": 4},
			"name": "Distilled Aether",
			"description": "Purify essence into stable aether"
		},
		{
			"id": "candle_compile",
			"inputs": {"wax_block": 5, "braided_wick": 1, "dist_aether": 2},
			"outputs": {"dig_candle": 1},
			"name": "Digital Candle",
			"description": "Assemble a mystical candle artifact"
		},
		{
			"id": "crystal_boost",
			"inputs": {"shaped_crys": 10, "dist_aether": 5},
			"outputs": {"ab": 50},
			"name": "Crystal Boost",
			"description": "Convert crystals directly to AB"
		}
	]

func try_experiment() -> Dictionary:
	for recipe in hidden_recipes:
		if recipe.id in discovered_recipes:
			continue
		
		# Check if player has ingredients
		var has_all = true
		for ing_id in recipe.inputs:
			if inventory.get(ing_id, 0.0) < recipe.inputs[ing_id]:
				has_all = false
				break
		
		if has_all:
			discovered_recipes.append(recipe.id)
			recipe_discovered.emit(recipe.id)
			return {
				"success": true,
				"recipe": recipe
			}
	
	return {
		"success": false,
		"message": "No new recipes discovered. Try gathering more materials!"
	}

func craft_discovered_recipe(recipe_id: String) -> bool:
	if not recipe_id in discovered_recipes:
		return false
	
	# Find recipe
	var recipe = null
	for r in hidden_recipes:
		if r.id == recipe_id:
			recipe = r
			break
	
	if not recipe:
		return false
	
	# Check and consume inputs
	if not Crafting.consume_recipe(recipe.inputs, inventory):
		return false
	
	# Grant outputs
	for output_id in recipe.outputs:
		if output_id == "ab":
			add_ab(recipe.outputs[output_id])
		else:
			add_ingredient(output_id, recipe.outputs[output_id])
	
	return true

# ========================================
# SAVE / LOAD
# ========================================

func save_game_state():
	var save_data = {
		"ab": ab,
		"ab_total": ab_total_earned,
		"inventory": inventory.duplicate(),
		"workstations": workstations.duplicate(),
		"upgrades": upgrades_owned.duplicate(),
		"prestige": {
			"points": prestige_points,
			"lifetime_earned": prestige_lifetime_earned,
			"bonuses": prestige_bonuses.duplicate()
		},
		"dailies": DailyRituals.save_state(),
		"experiments": {
			"discovered": discovered_recipes.duplicate()
		},
		"stats": {
			"total_taps": total_taps,
			"total_workstations_crafted": total_workstations_crafted
		}
	}
	
	Persistence.save_game(save_data)
	last_save_time = Time.get_unix_time_from_system()

func load_game_state():
	var data = Persistence.load_game()
	if data.is_empty():
		return
	
	# Calculate offline progress BEFORE loading state
	var elapsed = Time.get_unix_time_from_system() - data.get("timestamp", Time.get_unix_time_from_system())
	
	# Load state
	ab = data.get("ab", 0.0)
	ab_total_earned = data.get("ab_total", 0.0)
	inventory = data.get("inventory", {})
	workstations = data.get("workstations", {})
	upgrades_owned = data.get("upgrades", {})
	
	var prestige_data = data.get("prestige", {})
	prestige_points = prestige_data.get("points", 0)
	prestige_lifetime_earned = prestige_data.get("lifetime_earned", 0.0)
	prestige_bonuses = prestige_data.get("bonuses", {})
	
	var dailies_data = data.get("dailies", {})
	DailyRituals.load_state(dailies_data)
	
	var experiments_data = data.get("experiments", {})
	discovered_recipes = experiments_data.get("discovered", [])
	
	var stats = data.get("stats", {})
	total_taps = stats.get("total_taps", 0)
	total_workstations_crafted = stats.get("total_workstations_crafted", 0)
	
	# Apply offline progress
	if elapsed > 0:
		apply_offline_progress(elapsed)
	
	last_save_time = Time.get_unix_time_from_system()

func apply_offline_progress(elapsed_seconds: float):
	var abps = get_ab_per_second()
	var offline_ab = Balance.calculate_offline_production(elapsed_seconds, abps)
	
	if offline_ab > 0:
		add_ab(offline_ab)
		
		# Show welcome back modal
		welcome_back.emit(elapsed_seconds, offline_ab)

func _on_workstation_for_dailies(ws_id: String, new_count: int):
	DailyRituals.update_task_progress("craft", ws_id, total_workstations_crafted)
	DailyRituals.update_task_progress("own", ws_id, new_count)

