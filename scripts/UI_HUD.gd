extends CanvasLayer

@onready var ab_label = $TopBar/ABLabel
@onready var abps_label = $TopBar/ABPerSecLabel
@onready var cast_button = $TopBar/CastButton

func _ready():
	# Connect signals
	GameState.ab_changed.connect(_on_ab_changed)
	cast_button.pressed.connect(_on_cast_pressed)
	
	# Initial update
	update_display()
	
	# Update loop for ABPS
	var timer = Timer.new()
	timer.wait_time = 0.5
	timer.timeout.connect(update_display)
	add_child(timer)
	timer.start()

func update_display():
	ab_label.text = "AB: " + Format.short(GameState.ab)
	abps_label.text = Format.short(GameState.get_ab_per_second()) + " AB/s"

func _on_ab_changed(new_value):
	ab_label.text = "AB: " + Format.short(new_value)

func _on_cast_pressed():
	GameState.cast()
	
	# Visual feedback
	var tween = create_tween()
	tween.tween_property(cast_button, "scale", Vector2(1.2, 1.2), 0.1)
	tween.tween_property(cast_button, "scale", Vector2(1.0, 1.0), 0.1)

