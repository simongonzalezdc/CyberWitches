extends VBoxContainer

@onready var experiment_button = $ExperimentButton
@onready var result_label = $ResultLabel
@onready var recipe_list = $ScrollContainer/RecipeList

func _ready():
	experiment_button.pressed.connect(_on_experiment_pressed)
	GameState.recipe_discovered.connect(_on_recipe_discovered)
	update_recipe_list()

func _on_experiment_pressed():
	var result = GameState.try_experiment()
	
	if result.success:
		result_label.text = "✨ Discovered: " + result.recipe.name
		result_label.modulate = Color.GREEN
	else:
		result_label.text = result.message
		result_label.modulate = Color.YELLOW
	
	update_recipe_list()

func _on_recipe_discovered(recipe_id: String):
	# Play celebration effect
	update_recipe_list()

func update_recipe_list():
	# Clear existing
	for child in recipe_list.get_children():
		child.queue_free()
	
	# Show discovered recipes
	for recipe_id in GameState.discovered_recipes:
		var recipe = null
		for r in GameState.hidden_recipes:
			if r.id == recipe_id:
				recipe = r
				break
		
		if not recipe:
			continue
		
		var card = create_recipe_card(recipe)
		recipe_list.add_child(card)

func create_recipe_card(recipe: Dictionary) -> Control:
	var card = VBoxContainer.new()
	card.add_theme_constant_override("separation", 8)
	
	# Title
	var title = Label.new()
	title.text = recipe.name
	title.add_theme_font_size_override("font_size", 18)
	title.add_theme_color_override("font_color", Color("#C9A0FF"))
	card.add_child(title)
	
	# Description
	var desc = Label.new()
	desc.text = recipe.description
	desc.add_theme_font_size_override("font_size", 12)
	card.add_child(desc)
	
	# Inputs
	var inputs_label = Label.new()
	inputs_label.text = "Costs:"
	inputs_label.add_theme_font_size_override("font_size", 14)
	card.add_child(inputs_label)
	
	for ing_id in recipe.inputs:
		var amount = recipe.inputs[ing_id]
		var have = GameState.inventory.get(ing_id, 0.0)
		
		var ing_label = Label.new()
		ing_label.text = "  %s: %s / %s" % [
			ing_id,
			Format.short(have),
			Format.short(amount)
		]
		
		if have >= amount:
			ing_label.add_theme_color_override("font_color", Color.GREEN)
		else:
			ing_label.add_theme_color_override("font_color", Color.RED)
		
		card.add_child(ing_label)
	
	# Outputs
	var outputs_label = Label.new()
	outputs_label.text = "Produces:"
	outputs_label.add_theme_font_size_override("font_size", 14)
	card.add_child(outputs_label)
	
	for output_id in recipe.outputs:
		var amount = recipe.outputs[output_id]
		var output_text = "  %s: %s" % [output_id, Format.short(amount)]
		var out_label = Label.new()
		out_label.text = output_text
		out_label.add_theme_color_override("font_color", Color("#FFDB6E"))
		card.add_child(out_label)
	
	# Craft button
	var craft_btn = Button.new()
	craft_btn.text = "Craft"
	craft_btn.pressed.connect(func(): craft_recipe(recipe.id))
	card.add_child(craft_btn)
	
	# Separator
	var sep = HSeparator.new()
	card.add_child(sep)
	
	return card

func craft_recipe(recipe_id: String):
	if GameState.craft_discovered_recipe(recipe_id):
		update_recipe_list()

