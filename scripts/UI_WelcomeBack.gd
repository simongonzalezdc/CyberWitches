extends Panel

@onready var time_label = $VBoxContainer/TimeLabel
@onready var ab_label = $VBoxContainer/ABLabel
@onready var close_button = $VBoxContainer/CloseButton

signal closed

func _ready():
	close_button.pressed.connect(_on_close_pressed)
	GameState.welcome_back.connect(_on_welcome_back)
	hide()

func _on_welcome_back(elapsed_seconds: float, ab_gained: float):
	show_welcome(elapsed_seconds, ab_gained)

func show_welcome(elapsed_seconds: float, ab_gained: float):
	time_label.text = "⏰ Away for: " + Format.time_duration(elapsed_seconds)
	ab_label.text = "✨ Earned: " + Format.short(ab_gained) + " AB"
	show()
	
	# Auto-hide after 5 seconds
	await get_tree().create_timer(5.0).timeout
	if visible:
		hide()

func _on_close_pressed():
	hide()
	closed.emit()

