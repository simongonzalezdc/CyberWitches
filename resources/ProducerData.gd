extends Resource
class_name ProducerData

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""
@export var unlock_at_ab: float = 0.0

# Recipe to craft ONE unit
@export var recipe: Dictionary = {}

# Cost scaling per unit owned
@export var growth: float = 1.10

# What it produces per second
# Format: {"ingredient_id": rate, "ab": rate}
@export var outputs: Dictionary = {}

@export var icon: Texture2D = null

