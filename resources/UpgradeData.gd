extends Resource
class_name UpgradeData

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""

# What does it affect?
# Options: "global" | "producer:<ws_id>" | "click"
@export var affects: String = "global"

# How does it boost?
# Options: "multiplier" | "additive"
@export var type: String = "multiplier"

@export var value: float = 1.5

# One-time crafting cost
@export var recipe: Dictionary = {}

@export var unlock_at_ab: float = 0.0
@export var icon: Texture2D = null

