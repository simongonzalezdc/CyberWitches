extends VBoxContainer

@onready var task_list = $ScrollContainer/TaskList

func _ready():
	DailyRituals.tasks_refreshed.connect(update_tasks)
	DailyRituals.task_progress_updated.connect(_on_task_progress_updated)
	DailyRituals.task_completed.connect(_on_task_completed)
	update_tasks()

func update_tasks():
	# Clear existing
	for child in task_list.get_children():
		child.queue_free()
	
	# Add task cards
	for task in DailyRituals.active_tasks:
		var card = create_task_card(task)
		task_list.add_child(card)

func create_task_card(task: DailyTaskData) -> Control:
	var card = VBoxContainer.new()
	card.add_theme_constant_override("separation", 8)
	
	# Title
	var title = Label.new()
	title.text = task.display_name
	title.add_theme_font_size_override("font_size", 16)
	title.add_theme_color_override("font_color", Color("#FFDB6E"))
	card.add_child(title)
	
	# Description
	var desc = Label.new()
	desc.text = task.description
	card.add_child(desc)
	
	# Progress
	var parts = task.condition.split(":")
	var target = int(parts[-1]) if parts.size() > 0 else 1
	var progress = DailyRituals.task_progress.get(task.id, 0)
	
	var progress_label = Label.new()
	progress_label.text = "Progress: %d / %d" % [progress, target]
	if progress >= target:
		progress_label.add_theme_color_override("font_color", Color.GREEN)
	else:
		progress_label.add_theme_color_override("font_color", Color.WHITE)
	card.add_child(progress_label)
	
	# Reward
	var reward_text = "Reward: "
	match task.reward_type:
		"ab":
			reward_text += Format.short(task.reward_value) + " AB"
		"buff":
			reward_text += "+%d%% for %s" % [int(task.buff_multiplier * 100), Format.time_duration(task.reward_value)]
		"ek_frag":
			reward_text += "%d EK Fragment(s)" % int(task.reward_value)
	
	var reward_label = Label.new()
	reward_label.text = reward_text
	reward_label.add_theme_color_override("font_color", Color("#3CE3C5"))
	card.add_child(reward_label)
	
	# Claim button
	var claim_btn = Button.new()
	claim_btn.text = "Claim" if progress >= target and task.id not in DailyRituals.claimed_tasks else "Claimed" if task.id in DailyRituals.claimed_tasks else "Incomplete"
	claim_btn.disabled = (progress < target) or (task.id in DailyRituals.claimed_tasks)
	claim_btn.pressed.connect(func(): claim_task(task.id))
	card.add_child(claim_btn)
	
	# Separator
	var sep = HSeparator.new()
	card.add_child(sep)
	
	return card

func claim_task(task_id: String):
	if DailyRituals.claim_task(task_id):
		update_tasks()

func _on_task_progress_updated(_task_id, _progress, _target):
	update_tasks()

func _on_task_completed(_task_id):
	update_tasks()

