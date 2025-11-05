extends VBoxContainer

@onready var ek_label = $Header/EKLabel
@onready var boon_list = $ScrollContainer/BoonList

func _ready():
	update_ek_display()
	populate_boons()

func update_ek_display():
	ek_label.text = "Eldritch Keys: %d" % GameState.prestige_points

func populate_boons():
	# Clear existing
	for child in boon_list.get_children():
		child.queue_free()
	
	var prestige_data_res = load("res://data/prestige_bonuses.tres")
	if not prestige_data_res or not prestige_data_res.has("data"):
		return
	
	# Add boon cards
	for boon_data in prestige_data_res.data:
		var card = create_boon_card(boon_data)
		boon_list.add_child(card)

func create_boon_card(boon_data: PrestigeBonusData) -> Control:
	var card = VBoxContainer.new()
	card.add_theme_constant_override("separation", 8)
	
	# Title
	var title = Label.new()
	var current_level = GameState.prestige_bonuses.get(boon_data.id, 0)
	title.text = boon_data.display_name + " (Lv. %d)" % current_level
	title.add_theme_font_size_override("font_size", 18)
	title.add_theme_color_override("font_color", Color("#C9A0FF"))
	card.add_child(title)
	
	# Description
	var desc = Label.new()
	desc.text = boon_data.description
	card.add_child(desc)
	
	# Effect
	var effect_text = "Effect: "
	match boon_data.type:
		"global_mult":
			effect_text += "+%.0f%% Global Production per level" % (boon_data.value * 100)
		"producer_mult":
			effect_text += "+%.0f%% %s Production per level" % [boon_data.value * 100, boon_data.param]
		"starting_currency":
			effect_text += "+%.0f AB at start per level" % boon_data.value
		"start_ingredient":
			effect_text += "+%.0f %s at start per level" % [boon_data.value, boon_data.param]
	
	var effect_label = Label.new()
	effect_label.text = effect_text
	effect_label.add_theme_color_override("font_color", Color("#FFDB6E"))
	card.add_child(effect_label)
	
	# Cost
	var cost = boon_data.base_cost_pp * pow(boon_data.cost_growth, current_level)
	var cost_label = Label.new()
	cost_label.text = "Cost: %d EK" % int(cost)
	if GameState.prestige_points < cost:
		cost_label.add_theme_color_override("font_color", Color.RED)
	else:
		cost_label.add_theme_color_override("font_color", Color.GREEN)
	card.add_child(cost_label)
	
	# Purchase button
	var purchase_btn = Button.new()
	purchase_btn.text = "Purchase"
	purchase_btn.disabled = GameState.prestige_points < cost
	purchase_btn.pressed.connect(func(): purchase_boon(boon_data.id))
	card.add_child(purchase_btn)
	
	# Separator
	var sep = HSeparator.new()
	card.add_child(sep)
	
	return card

func purchase_boon(boon_id: String):
	if GameState.purchase_prestige_bonus(boon_id):
		update_ek_display()
		populate_boons()

