extends VBoxContainer

@onready var workstation_list = $ScrollContainer/WorkstationList

func _ready():
	GameState.workstation_crafted.connect(_on_workstation_crafted)
	populate_workstations()

func populate_workstations():
	# Clear existing
	for child in workstation_list.get_children():
		child.queue_free()
	
	# Add workstation cards
	for prod_data in Crafting.producers:
		if GameState.ab < prod_data.unlock_at_ab:
			continue
		
		var card = create_workstation_card(prod_data)
		workstation_list.add_child(card)

func create_workstation_card(prod_data) -> Control:
	var card = VBoxContainer.new()
	card.add_theme_constant_override("separation", 8)
	
	# === Title ===
	var title = Label.new()
	title.text = prod_data.display_name
	title.add_theme_font_size_override("font_size", 20)
	title.add_theme_color_override("font_color", Color("#22E3FF"))
	card.add_child(title)
	
	# === Owned Count ===
	var owned = GameState.workstations.get(prod_data.id, 0)
	var owned_label = Label.new()
	owned_label.text = "⚙️ Owned: %d" % owned
	card.add_child(owned_label)
	
	# === Output Display ===
	var output_label = Label.new()
	var output_text = "Produces: "
	for output_id in prod_data.outputs:
		var rate = prod_data.outputs[output_id]
		output_text += "%s/s %s  " % [Format.precise(rate, 2), output_id]
	output_label.text = output_text
	card.add_child(output_label)
	
	# === Recipe (Have/Need) ===
	var recipe = Crafting.get_producer_recipe(prod_data.id, owned)
	
	var recipe_title = Label.new()
	recipe_title.text = "Recipe for next:"
	recipe_title.add_theme_font_size_override("font_size", 14)
	card.add_child(recipe_title)
	
	for ing_id in recipe:
		var amount_needed = recipe[ing_id]
		var amount_have = GameState.inventory.get(ing_id, 0.0)
		
		var ing_label = Label.new()
		ing_label.text = "  %s: %s / %s" % [
			ing_id,
			Format.short(amount_have),
			Format.short(amount_needed)
		]
		
		if amount_have >= amount_needed:
			ing_label.add_theme_color_override("font_color", Color("#3CE3C5"))
		else:
			ing_label.add_theme_color_override("font_color", Color("#FF2DAA"))
		
		card.add_child(ing_label)
	
	# === Craft Buttons ===
	var button_row = HBoxContainer.new()
	button_row.add_theme_constant_override("separation", 10)
	
	var craft_1 = Button.new()
	craft_1.text = "Craft x1"
	craft_1.pressed.connect(func(): craft_workstation(prod_data.id, 1))
	button_row.add_child(craft_1)
	
	var craft_10 = Button.new()
	craft_10.text = "Craft x10"
	craft_10.pressed.connect(func(): craft_workstation(prod_data.id, 10))
	button_row.add_child(craft_10)
	
	var craft_max = Button.new()
	craft_max.text = "Max"
	craft_max.pressed.connect(func(): craft_workstation_max(prod_data.id))
	button_row.add_child(craft_max)
	
	card.add_child(button_row)
	
	# === Separator ===
	var sep = HSeparator.new()
	sep.add_theme_constant_override("separation", 20)
	card.add_child(sep)
	
	return card

func craft_workstation(ws_id: String, amount: int):
	GameState.craft_workstation(ws_id, amount)
	populate_workstations()

func craft_workstation_max(ws_id: String):
	# Calculate max affordable
	var max_count = 0
	for i in range(1000):  # Safety limit
		var owned = GameState.workstations.get(ws_id, 0) + max_count
		var recipe = Crafting.get_producer_recipe(ws_id, owned)
		
		if Crafting.can_afford(recipe, GameState.inventory):
			max_count += 1
		else:
			break
	
	if max_count > 0:
		craft_workstation(ws_id, max_count)

func _on_workstation_crafted(_ws_id, _count):
	populate_workstations()

