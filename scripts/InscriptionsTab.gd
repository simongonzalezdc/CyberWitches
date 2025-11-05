extends VBoxContainer

@onready var upgrade_list = $ScrollContainer/UpgradeList

func _ready():
	GameState.upgrade_purchased.connect(_on_upgrade_purchased)
	populate_upgrades()

func populate_upgrades():
	# Clear existing
	for child in upgrade_list.get_children():
		child.queue_free()
	
	# Add upgrade cards
	for upg_data in Crafting.upgrades:
		if GameState.ab < upg_data.unlock_at_ab:
			continue
		
		var card = create_upgrade_card(upg_data)
		upgrade_list.add_child(card)

func create_upgrade_card(upg_data: UpgradeData) -> Control:
	var card = VBoxContainer.new()
	card.add_theme_constant_override("separation", 8)
	
	# Title
	var title = Label.new()
	title.text = upg_data.display_name
	if GameState.upgrades_owned.has(upg_data.id):
		title.text += " ✓"
	title.add_theme_font_size_override("font_size", 18)
	title.add_theme_color_override("font_color", Color("#22E3FF"))
	card.add_child(title)
	
	# Description
	var desc = Label.new()
	desc.text = upg_data.description
	card.add_child(desc)
	
	# Effect
	var effect_text = "Effect: "
	if upg_data.affects == "global":
		effect_text += "Global %s ×%.1f" % [upg_data.type, upg_data.value]
	elif upg_data.affects.begins_with("producer:"):
		var ws_id = upg_data.affects.substr(9)
		effect_text += "%s %s ×%.1f" % [ws_id, upg_data.type, upg_data.value]
	elif upg_data.affects == "click":
		effect_text += "Click %s +%.1f" % [upg_data.type, upg_data.value]
	
	var effect_label = Label.new()
	effect_label.text = effect_text
	effect_label.add_theme_color_override("font_color", Color("#FFDB6E"))
	card.add_child(effect_label)
	
	# Recipe
	var recipe_label = Label.new()
	recipe_label.text = "Recipe:"
	card.add_child(recipe_label)
	
	for ing_id in upg_data.recipe:
		var amount_needed = upg_data.recipe[ing_id]
		var amount_have = GameState.inventory.get(ing_id, 0.0)
		
		var ing_label = Label.new()
		ing_label.text = "  %s: %s / %s" % [
			ing_id,
			Format.short(amount_have),
			Format.short(amount_needed)
		]
		
		if amount_have >= amount_needed:
			ing_label.add_theme_color_override("font_color", Color.GREEN)
		else:
			ing_label.add_theme_color_override("font_color", Color.RED)
		
		card.add_child(ing_label)
	
	# Inscribe button
	var inscribe_btn = Button.new()
	inscribe_btn.text = "Inscribe" if not GameState.upgrades_owned.has(upg_data.id) else "Owned"
	inscribe_btn.disabled = GameState.upgrades_owned.has(upg_data.id)
	inscribe_btn.pressed.connect(func(): inscribe_upgrade(upg_data.id))
	card.add_child(inscribe_btn)
	
	# Separator
	var sep = HSeparator.new()
	card.add_child(sep)
	
	return card

func inscribe_upgrade(upg_id: String):
	GameState.inscribe_upgrade(upg_id)
	populate_upgrades()

func _on_upgrade_purchased(_upg_id):
	populate_upgrades()

