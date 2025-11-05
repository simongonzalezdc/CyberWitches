extends Panel

@onready var ek_label = $VBoxContainer/EKLabel
@onready var gain_label = $VBoxContainer/GainLabel
@onready var ascend_button = $VBoxContainer/AscendButton
@onready var close_button = $VBoxContainer/CloseButton

signal closed

func _ready():
	close_button.pressed.connect(_on_close_pressed)
	ascend_button.pressed.connect(_on_ascend_pressed)
	GameState.prestige_completed.connect(_on_prestige_completed)
	hide()

func show_prestige():
	ek_label.text = "Eldritch Keys: %d" % GameState.prestige_points
	var gain = GameState.calculate_prestige_gain()
	gain_label.text = "Next Ascend: +%d EK" % gain
	ascend_button.disabled = (gain <= 0)
	show()

func _on_ascend_pressed():
	GameState.ascend()
	hide()
	closed.emit()

func _on_prestige_completed(_ek_earned):
	hide()

func _on_close_pressed():
	hide()
	closed.emit()

