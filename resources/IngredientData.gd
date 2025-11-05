extends Resource
class_name IngredientData

@export var id: String = ""
@export var display_name: String = ""
@export var tier: int = 0
@export var stack_limit: int = 0  # 0 = unlimited
@export var icon: Texture2D = null
@export var description: String = ""

func _init(
	p_id: String = "",
	p_display_name: String = "",
	p_tier: int = 0
):
	id = p_id
	display_name = p_display_name
	tier = p_tier

