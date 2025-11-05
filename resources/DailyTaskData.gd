extends Resource
class_name DailyTaskData

@export var id: String = ""
@export var display_name: String = ""
@export var description: String = ""

# Condition format examples:
# "craft:workstation:ws_melter:3"
# "own:workstation:ws_crystal:5"
# "tap:150"
# "craft_item:braided_wick:20"
@export var condition: String = ""

# Reward types: "ab" | "buff" | "ek_frag"
@export var reward_type: String = "ab"

# Amount (for AB/EK) or duration seconds (for buff)
@export var reward_value: float = 5000.0

# If buff, the multiplier
@export var buff_multiplier: float = 0.10

@export var icon: String = ""

