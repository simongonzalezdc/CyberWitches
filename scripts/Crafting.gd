extends Node

# Loaded data
var ingredients: Array = []
var producers: Array = []
var upgrades: Array = []

func _ready():
	load_all_data()

func load_all_data():
	# Try to load from .tres files, fallback to initialization
	var ing_res = load("res://data/ingredients.tres")
	if ing_res and ing_res.has("data"):
		ingredients = ing_res.data
	else:
		# Fallback: initialize from code
		ingredients = DataInitializer.initialize_ingredients()
	
	var prod_res = load("res://data/producers.tres")
	if prod_res and prod_res.has("data"):
		producers = prod_res.data
	else:
		producers = DataInitializer.initialize_producers()
	
	var upg_res = load("res://data/upgrades.tres")
	if upg_res and upg_res.has("data"):
		upgrades = upg_res.data
	else:
		upgrades = DataInitializer.initialize_upgrades()

# ========================================
# LOOKUPS
# ========================================

func get_ingredient(id: String):
	for ing in ingredients:
		if ing.id == id:
			return ing
	return null

func get_producer(id: String):
	for prod in producers:
		if prod.id == id:
			return prod
	return null

func get_upgrade(id: String):
	for upg in upgrades:
		if upg.id == id:
			return upg
	return null

# ========================================
# RECIPE HELPERS
# ========================================

# Get scaled recipe for producer
func get_producer_recipe(producer_id: String, owned: int) -> Dictionary:
	var prod = get_producer(producer_id)
	if not prod:
		return {}
	
	return Balance.scaled_recipe(prod.recipe, owned, prod.growth)

# Check if player can afford recipe
func can_afford(recipe: Dictionary, inventory: Dictionary) -> bool:
	for ing_id in recipe:
		var needed = recipe[ing_id]
		var have = inventory.get(ing_id, 0.0)
		if have < needed:
			return false
	return true

# Consume recipe from inventory
func consume_recipe(recipe: Dictionary, inventory: Dictionary) -> bool:
	if not can_afford(recipe, inventory):
		return false
	
	for ing_id in recipe:
		inventory[ing_id] -= recipe[ing_id]
	
	return true

# Get what's missing
func get_deficit(recipe: Dictionary, inventory: Dictionary) -> Dictionary:
	var deficit = {}
	for ing_id in recipe:
		var needed = recipe[ing_id]
		var have = inventory.get(ing_id, 0.0)
		if have < needed:
			deficit[ing_id] = needed - have
	return deficit

