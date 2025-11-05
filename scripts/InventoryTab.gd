extends VBoxContainer

@onready var inventory_list = $ScrollContainer/InventoryList

func _ready():
	GameState.ingredient_changed.connect(_on_ingredient_changed)
	update_inventory()

func _on_ingredient_changed(_ingredient_id, _new_value):
	update_inventory()

func update_inventory():
	# Clear existing
	for child in inventory_list.get_children():
		child.queue_free()
	
	# Add inventory items
	for ing_id in GameState.inventory:
		var amount = GameState.inventory[ing_id]
		if amount <= 0:
			continue
		
		var item = Label.new()
		item.text = "%s: %s" % [ing_id, Format.short(amount)]
		item.add_theme_font_size_override("font_size", 14)
		inventory_list.add_child(item)

