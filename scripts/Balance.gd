extends Node

# ========================================
# PRESTIGE FORMULAS
# ========================================

static var prestige_scale: float = 1_200_000.0

# Calculate EK earned from lifetime AB
static func prestige_points_for(lifetime_earned: float) -> int:
	return int(floor(sqrt(max(lifetime_earned, 0.0) / prestige_scale)))

# Calculate next EK threshold
static func next_prestige_threshold(current_ek: int) -> float:
	return pow(current_ek + 1, 2) * prestige_scale

# ========================================
# RECIPE SCALING
# ========================================

# Scale recipe cost based on owned count
static func scaled_recipe(
	base_recipe: Dictionary, 
	owned: int, 
	growth: float
) -> Dictionary:
	var scaled = {}
	for ing_id in base_recipe:
		var base_cost = base_recipe[ing_id]
		scaled[ing_id] = ceil(base_cost * pow(growth, owned))
	return scaled

# ========================================
# PRODUCTION MULTIPLIERS
# ========================================

static func get_production_multiplier(
	workstation_id: String,
	upgrades: Dictionary,
	prestige_bonuses: Dictionary,
	buffs: Array,
	upgrade_data_list: Array,
	prestige_data_list: Array
) -> float:
	var mult = 1.0
	
	# Global upgrades
	for upgrade_id in upgrades:
		for upg_data in upgrade_data_list:
			if upg_data.id == upgrade_id:
				if upg_data.affects == "global" and upg_data.type == "multiplier":
					mult *= upg_data.value
	
	# Producer-specific upgrades
	var target_affects = "producer:" + workstation_id
	for upgrade_id in upgrades:
		for upg_data in upgrade_data_list:
			if upg_data.id == upgrade_id:
				if upg_data.affects == target_affects and upg_data.type == "multiplier":
					mult *= upg_data.value
	
	# Prestige bonuses (global)
	for bonus_id in prestige_bonuses:
		for bonus_data in prestige_data_list:
			if bonus_data.id == bonus_id:
				if bonus_data.type == "global_mult":
					var levels = prestige_bonuses[bonus_id]
					mult *= (1.0 + bonus_data.value * levels)
	
	# Prestige bonuses (producer-specific)
	for bonus_id in prestige_bonuses:
		for bonus_data in prestige_data_list:
			if bonus_data.id == bonus_id:
				if bonus_data.type == "producer_mult" and bonus_data.param == workstation_id:
					var levels = prestige_bonuses[bonus_id]
					mult *= (1.0 + bonus_data.value * levels)
	
	# Active buffs
	for buff in buffs:
		if buff.has("multiplier"):
			mult *= (1.0 + buff.multiplier)
	
	return mult

# ========================================
# OFFLINE PROGRESS
# ========================================

static var offline_cap_seconds: float = 43200.0  # 12 hours

static func calculate_offline_production(
	elapsed_seconds: float,
	production_per_second: float
) -> float:
	var capped_time = min(elapsed_seconds, offline_cap_seconds)
	return production_per_second * capped_time

