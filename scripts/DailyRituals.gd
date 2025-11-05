extends Node

var task_pool: Array = []
var active_tasks: Array = []
var task_progress: Dictionary = {}
var claimed_tasks: Array = []
var current_day_key: String = ""
var ek_fragments: int = 0

signal task_progress_updated(task_id: String, progress: float, target: float)
signal task_completed(task_id: String)
signal tasks_refreshed

func _ready():
	load_task_pool()
	check_daily_refresh()

func load_task_pool():
	var tasks_res = load("res://data/daily_tasks_pool.tres")
	if tasks_res and tasks_res.has("data"):
		task_pool = tasks_res.data
	else:
		# Fallback: initialize from code
		task_pool = DataInitializer.initialize_daily_tasks()

func check_daily_refresh():
	var today = get_day_key()
	
	if today != current_day_key:
		current_day_key = today
		select_daily_tasks()
		task_progress.clear()
		claimed_tasks.clear()
		tasks_refreshed.emit()

func get_day_key() -> String:
	var time = Time.get_datetime_dict_from_system()
	return "%04d-%02d-%02d" % [time.year, time.month, time.day]

func select_daily_tasks():
	# Randomly select 3 tasks
	active_tasks.clear()
	
	var available = task_pool.duplicate()
	available.shuffle()
	
	for i in range(min(3, available.size())):
		active_tasks.append(available[i])

func update_task_progress(condition_type: String, param: String, value: int):
	for task in active_tasks:
		if task.id in claimed_tasks:
			continue
		
		var parts = task.condition.split(":")
		if parts.size() < 2:
			continue
		
		var task_type = parts[0]
		
		# Match condition type
		if task_type == condition_type:
			# For workstation tasks
			if condition_type in ["craft", "own"] and parts.size() > 2:
				if parts[2] == param:
					var target = int(parts[3]) if parts.size() > 3 else 1
					task_progress[task.id] = value
					task_progress_updated.emit(task.id, value, target)
					
					if value >= target:
						task_completed.emit(task.id)
			
			# For tap tasks
			elif condition_type == "tap":
				var target = int(parts[1])
				task_progress[task.id] = value
				task_progress_updated.emit(task.id, value, target)
				
				if value >= target:
					task_completed.emit(task.id)
			
			# For craft_item tasks
			elif condition_type == "craft_item":
				if parts.size() > 1 and parts[1] == param:
					var target = int(parts[2]) if parts.size() > 2 else 1
					task_progress[task.id] = value
					task_progress_updated.emit(task.id, value, target)
					
					if value >= target:
						task_completed.emit(task.id)

func claim_task(task_id: String) -> bool:
	if task_id in claimed_tasks:
		return false
	
	# Find task
	var task = null
	for t in active_tasks:
		if t.id == task_id:
			task = t
			break
	
	if not task:
		return false
	
	# Check completion
	var parts = task.condition.split(":")
	var target = int(parts[-1]) if parts.size() > 0 else 1
	var progress = task_progress.get(task_id, 0)
	
	if progress < target:
		return false
	
	# Grant reward
	match task.reward_type:
		"ab":
			GameState.add_ab(task.reward_value)
		"buff":
			GameState.add_buff(task.buff_multiplier, task.reward_value)
		"ek_frag":
			grant_ek_fragments(int(task.reward_value))
	
	claimed_tasks.append(task_id)
	return true

func grant_ek_fragments(amount: int):
	ek_fragments += amount
	
	# Convert 5 fragments → 1 EK
	while ek_fragments >= 5:
		ek_fragments -= 5
		GameState.prestige_points += 1

func save_state() -> Dictionary:
	return {
		"day_key": current_day_key,
		"active_ids": active_tasks.map(func(t): return t.id),
		"progress": task_progress.duplicate(),
		"claimed": claimed_tasks.duplicate(),
		"ek_fragments": ek_fragments
	}

func load_state(data: Dictionary):
	current_day_key = data.get("day_key", "")
	task_progress = data.get("progress", {})
	claimed_tasks = data.get("claimed", [])
	ek_fragments = data.get("ek_fragments", 0)
	
	# Reconstruct active tasks
	var active_ids = data.get("active_ids", [])
	active_tasks.clear()
	for task_id in active_ids:
		for task in task_pool:
			if task.id == task_id:
				active_tasks.append(task)
				break
	
	check_daily_refresh()

