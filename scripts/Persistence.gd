extends Node

const SAVE_PATH = "user://save.json"
const SAVE_VERSION = 2

# ========================================
# SAVE
# ========================================

func save_game(data: Dictionary) -> bool:
	data["version"] = SAVE_VERSION
	data["timestamp"] = Time.get_unix_time_from_system()
	
	var json_string = JSON.stringify(data, "\t")
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	
	if not file:
		push_error("Failed to open save file for writing")
		return false
	
	file.store_string(json_string)
	file.close()
	return true

# ========================================
# LOAD
# ========================================

func load_game() -> Dictionary:
	if not FileAccess.file_exists(SAVE_PATH):
		return {}
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if not file:
		push_error("Failed to open save file for reading")
		return {}
	
	var json_string = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	
	if parse_result != OK:
		push_error("Failed to parse save file JSON")
		return {}
	
	var data = json.data
	
	# Handle version migrations
	if data.get("version", 1) < SAVE_VERSION:
		data = migrate_save(data)
	
	return data

# ========================================
# MIGRATION
# ========================================

func migrate_save(old_data: Dictionary) -> Dictionary:
	var version = old_data.get("version", 1)
	
	if version < 2:
		# Add new fields for v2
		if not old_data.has("experiments"):
			old_data["experiments"] = {
				"discovered": []
			}
	
	old_data["version"] = SAVE_VERSION
	return old_data

# ========================================
# UTILITIES
# ========================================

func delete_save() -> bool:
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(SAVE_PATH)
		return true
	return false

func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)

