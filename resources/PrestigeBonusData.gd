extends Resource
class_name PrestigeBonusData

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""

# Cost in Eldritch Keys (EK)
@export var base_cost_pp: float = 10.0
@export var cost_growth: float = 1.5

# Type of bonus
# Options: "global_mult" | "producer_mult" | 
#          "starting_currency" | "start_ingredient"
@export var type: String = "global_mult"

# If producer_mult or start_ingredient, which one?
@export var param: String = ""

# Value granted per level
@export var value: float = 0.10

@export var icon: Texture2D = null

