# 🎮 CYBER WITCHES: IDLE COVEN
## Complete Implementation Guide

**Version:** 2.0 - Experiment Edition  
**Engine:** Godot 4.5+  
**Platform:** Web (HTML5), Portrait-First  
**Timeline:** Full scope, no constraints

---

## 📚 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Project Setup](#project-setup)
3. [Folder Structure](#folder-structure)
4. [Data Models](#data-models)
5. [Core Systems](#core-systems)
6. [Experiment System](#experiment-system)
7. [UI Implementation](#ui-implementation)
8. [Game Content](#game-content)
9. [Balance Formulas](#balance-formulas)
10. [Daily Rituals](#daily-rituals)
11. [Testing Checklist](#testing-checklist)
12. [Web Export](#web-export)
13. [Implementation Timeline](#implementation-timeline)

---

## 🚀 QUICK START

### What You're Building

**Cyber Witches** is an idle game where players:
- ✨ **Cast spells** to gather ingredients
- 🏭 **Craft workstations** that auto-produce resources
- 🔬 **Experiment** to discover hidden recipes
- ⚡ **Ascend** to earn permanent upgrades
- 📅 **Complete dailies** for bonus rewards

### Core Philosophy

**Everything is earned through gameplay.**  
No shops. No purchases. Just gathering, crafting, and discovery.

---

## 🔧 PROJECT SETUP

### Initial Configuration

**Step 1: Create New Project**

```
Project Name: CyberWitchesIdleCoven
Renderer: Forward+ (Mobile fallback)
Target: Web
Resolution: 1080x1920 (portrait)
```

**Step 2: Display Settings**

```gdscript
# Project Settings → Display → Window
viewport_width = 1080
viewport_height = 1920
mode = 2  # fullscreen
stretch_mode = "canvas_items"
stretch_aspect = "keep"
```

**Step 3: Rendering Settings**

```gdscript
# Project Settings → Rendering
renderer/rendering_method = "forward_plus"
renderer/rendering_method.mobile = "mobile"
2d/snap/snap_2d_transforms_to_pixel = true
textures/vram_compression/import_etc2_astc = true
```

---

### Autoload Scripts

**Add these in order** (Project Settings → Autoload):

| Order | Name | Path | Purpose |
|-------|------|------|---------|
| 1 | `GameState` | `res://scripts/GameState.gd` | Main game state |
| 2 | `Balance` | `res://scripts/Balance.gd` | Formulas & math |
| 3 | `Crafting` | `res://scripts/Crafting.gd` | Recipe management |
| 4 | `Format` | `res://scripts/Format.gd` | Number formatting |
| 5 | `Persistence` | `res://scripts/Persistence.gd` | Save/Load |
| 6 | `DailyRituals` | `res://scripts/DailyRituals.gd` | Daily tasks |

---

## 📁 FOLDER STRUCTURE

```
CyberWitchesIdleCoven/
│
├── 📂 assets/
│   ├── pixel/          # Sprites (32x32)
│   ├── icons/          # UI icons
│   ├── sfx/            # Sound effects
│   └── fonts/          # Custom fonts
│
├── 📂 data/            # .tres files
│   ├── ingredients.tres
│   ├── producers.tres
│   ├── upgrades.tres
│   ├── prestige_bonuses.tres
│   └── daily_tasks_pool.tres
│
├── 📂 resources/       # Resource scripts
│   ├── IngredientData.gd
│   ├── ProducerData.gd
│   ├── UpgradeData.gd
│   ├── PrestigeBonusData.gd
│   └── DailyTaskData.gd
│
├── 📂 scenes/
│   ├── Main.tscn
│   ├── UI_HUD.tscn
│   ├── UI_WelcomeBack.tscn
│   ├── UI_Prestige.tscn
│   ├── UI_DailyRituals.tscn
│   ├── UI_Experiment.tscn
│   ├── UI_Inventory.tscn
│   └── UI_Settings.tscn
│
├── 📂 scripts/         # Core systems
│   ├── GameState.gd
│   ├── Balance.gd
│   ├── Crafting.gd
│   ├── Format.gd
│   ├── Persistence.gd
│   └── DailyRituals.gd
│
└── 📂 theme/
    ├── colors.tres
    └── ui_theme.tres
```

---

## 📊 DATA MODELS

### Resource Classes Overview

Each data type has its own Resource class.  
These define the **structure** of game content.

---

### 1️⃣ IngredientData.gd

**What it stores:** Basic materials and items

```gdscript
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
```

**Example:**
```gdscript
IngredientData.new("wax_bits", "Wax Bits", 0)
```

---

### 2️⃣ ProducerData.gd

**What it stores:** Workstations that auto-produce

```gdscript
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
```

**Example:**
```gdscript
ProducerData.new(
    "ws_melter",
    "Wax Melter",
    0.0,
    {"wax_bits": 10},
    1.10,
    {"wax_block": 0.30}
)
```

---

### 3️⃣ UpgradeData.gd

**What it stores:** One-time permanent boosts

```gdscript
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
```

**Example:**
```gdscript
UpgradeData.new(
    "u_global_1",
    "Hex Compiler v1",
    "global",
    "multiplier",
    1.5,
    {"wax_block": 2, "braided_wick": 2}
)
```

---

### 4️⃣ PrestigeBonusData.gd

**What it stores:** Permanent upgrades from prestige currency

```gdscript
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
```

**Example:**
```gdscript
PrestigeBonusData.new(
    "pp_global_1",
    "Coven's Oath",
    "global_mult",
    0.10,
    10.0
)
```

---

### 5️⃣ DailyTaskData.gd

**What it stores:** Daily challenge definitions

```gdscript
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
```

**Example:**
```gdscript
DailyTaskData.new(
    "d_kindle",
    "Kindle the Grid",
    "craft:workstation:ws_melter:3",
    "ab",
    5000.0
)
```

---

### 💾 Save File Format

```json
{
  "version": 2,
  "timestamp": 1730640000,
  "ab": 123456.0,
  "ab_total": 456789.0,
  "inventory": {
    "wax_bits": 120,
    "wick_fiber": 60
  },
  "workstations": {
    "ws_melter": 2,
    "ws_spinner": 1
  },
  "upgrades": {
    "u_global_1": true
  },
  "prestige": {
    "points": 15,
    "lifetime_earned": 1200000.0,
    "bonuses": {
      "pp_global_1": 2
    }
  },
  "dailies": {
    "day_key": "2025-11-03",
    "active_ids": ["d_kindle", "d_song", "d_flow"],
    "progress": {"d_flow": 73},
    "claimed": {"d_kindle": true}
  },
  "experiments": {
    "discovered": ["wax_block_bulk", "braid_wick"]
  }
}
```

---

## ⚙️ CORE SYSTEMS

### System 1: Format.gd

**Purpose:** Format big numbers for display

```gdscript
extends Node

# Format with K, M, B suffixes
func short(value: float) -> String:
    if value < 1000.0:
        return str(int(value))
    
    var suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"]
    var tier = 0
    
    while value >= 1000.0 and tier < suffixes.size() - 1:
        value /= 1000.0
        tier += 1
    
    return "%.2f%s" % [value, suffixes[tier]]

# Format with decimals
func precise(value: float, decimals: int = 2) -> String:
    return ("%." + str(decimals) + "f") % value

# Format time duration
func time_duration(seconds: float) -> String:
    var hrs = int(seconds / 3600)
    var mins = int((seconds - hrs * 3600) / 60)
    var secs = int(seconds - hrs * 3600 - mins * 60)
    
    if hrs > 0:
        return "%dh %dm" % [hrs, mins]
    elif mins > 0:
        return "%dm %ds" % [mins, secs]
    else:
        return "%ds" % secs
```

**Usage:**
```gdscript
Format.short(1234567)  # "1.23M"
Format.precise(3.14159, 2)  # "3.14"
Format.time_duration(3665)  # "1h 1m"
```

---

### System 2: Balance.gd

**Purpose:** All formulas and calculations

```gdscript
extends Node

# ========================================
# PRESTIGE FORMULAS
# ========================================

static var prestige_scale: float = 1_200_000.0

# Calculate EK earned from lifetime AB
static func prestige_points_for(lifetime_earned: float) -> int:
    return int(floor(sqrt(max(lifetime_earned, 0.0) / prestige_scale)))

# Calculate next EK threshold
static func next_prestige_threshold(current_ek: int) -> float:
    return pow(current_ek + 1, 2) * prestige_scale

# ========================================
# RECIPE SCALING
# ========================================

# Scale recipe cost based on owned count
static func scaled_recipe(
    base_recipe: Dictionary, 
    owned: int, 
    growth: float
) -> Dictionary:
    var scaled = {}
    for ing_id in base_recipe:
        var base_cost = base_recipe[ing_id]
        scaled[ing_id] = ceil(base_cost * pow(growth, owned))
    return scaled

# ========================================
# PRODUCTION MULTIPLIERS
# ========================================

static func get_production_multiplier(
    workstation_id: String,
    upgrades: Dictionary,
    prestige_bonuses: Dictionary,
    buffs: Array,
    upgrade_data_list: Array,
    prestige_data_list: Array
) -> float:
    var mult = 1.0
    
    # Global upgrades
    for upgrade_id in upgrades:
        for upg_data in upgrade_data_list:
            if upg_data.id == upgrade_id:
                if upg_data.affects == "global" and upg_data.type == "multiplier":
                    mult *= upg_data.value
    
    # Producer-specific upgrades
    var target_affects = "producer:" + workstation_id
    for upgrade_id in upgrades:
        for upg_data in upgrade_data_list:
            if upg_data.id == upgrade_id:
                if upg_data.affects == target_affects and upg_data.type == "multiplier":
                    mult *= upg_data.value
    
    # Prestige bonuses (global)
    for bonus_id in prestige_bonuses:
        for bonus_data in prestige_data_list:
            if bonus_data.id == bonus_id:
                if bonus_data.type == "global_mult":
                    var levels = prestige_bonuses[bonus_id]
                    mult *= (1.0 + bonus_data.value * levels)
    
    # Prestige bonuses (producer-specific)
    for bonus_id in prestige_bonuses:
        for bonus_data in prestige_data_list:
            if bonus_data.id == bonus_id:
                if bonus_data.type == "producer_mult" and bonus_data.param == workstation_id:
                    var levels = prestige_bonuses[bonus_id]
                    mult *= (1.0 + bonus_data.value * levels)
    
    # Active buffs
    for buff in buffs:
        if buff.has("multiplier"):
            mult *= (1.0 + buff.multiplier)
    
    return mult

# ========================================
# OFFLINE PROGRESS
# ========================================

static var offline_cap_seconds: float = 43200.0  # 12 hours

static func calculate_offline_production(
    elapsed_seconds: float,
    production_per_second: float
) -> float:
    var capped_time = min(elapsed_seconds, offline_cap_seconds)
    return production_per_second * capped_time
```

---

### System 3: Crafting.gd

**Purpose:** Recipe management and validation

```gdscript
extends Node

# Loaded data
var ingredients: Array = []
var producers: Array = []
var upgrades: Array = []

func _ready():
    load_all_data()

func load_all_data():
    # Load from .tres files
    var ing_res = load("res://data/ingredients.tres")
    if ing_res and ing_res.has("data"):
        ingredients = ing_res.data
    
    var prod_res = load("res://data/producers.tres")
    if prod_res and prod_res.has("data"):
        producers = prod_res.data
    
    var upg_res = load("res://data/upgrades.tres")
    if upg_res and upg_res.has("data"):
        upgrades = upg_res.data

# ========================================
# LOOKUPS
# ========================================

func get_ingredient(id: String):
    for ing in ingredients:
        if ing.id == id:
            return ing
    return null

func get_producer(id: String):
    for prod in producers:
        if prod.id == id:
            return prod
    return null

func get_upgrade(id: String):
    for upg in upgrades:
        if upg.id == id:
            return upg
    return null

# ========================================
# RECIPE HELPERS
# ========================================

# Get scaled recipe for producer
func get_producer_recipe(producer_id: String, owned: int) -> Dictionary:
    var prod = get_producer(producer_id)
    if not prod:
        return {}
    
    return Balance.scaled_recipe(prod.recipe, owned, prod.growth)

# Check if player can afford recipe
func can_afford(recipe: Dictionary, inventory: Dictionary) -> bool:
    for ing_id in recipe:
        var needed = recipe[ing_id]
        var have = inventory.get(ing_id, 0.0)
        if have < needed:
            return false
    return true

# Consume recipe from inventory
func consume_recipe(recipe: Dictionary, inventory: Dictionary) -> bool:
    if not can_afford(recipe, inventory):
        return false
    
    for ing_id in recipe:
        inventory[ing_id] -= recipe[ing_id]
    
    return true

# Get what's missing
func get_deficit(recipe: Dictionary, inventory: Dictionary) -> Dictionary:
    var deficit = {}
    for ing_id in recipe:
        var needed = recipe[ing_id]
        var have = inventory.get(ing_id, 0.0)
        if have < needed:
            deficit[ing_id] = needed - have
    return deficit
```

---

### System 4: Persistence.gd

**Purpose:** Save/Load to JSON

```gdscript
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
```

---

### System 5: GameState.gd

**Purpose:** Central game state manager

**⚠️ This is the largest file - contains all game logic**

```gdscript
extends Node

# ========================================
# STATE VARIABLES
# ========================================

# Currency
var ab: float = 0.0
var ab_total_earned: float = 0.0

# Inventory (ingredient_id: amount)
var inventory: Dictionary = {}

# Workstations (producer_id: owned_count)
var workstations: Dictionary = {}

# Upgrades (upgrade_id: true)
var upgrades_owned: Dictionary = {}

# Prestige
var prestige_points: int = 0
var prestige_lifetime_earned: float = 0.0
var prestige_bonuses: Dictionary = {}  # bonus_id: level

# Buffs (active temporary effects)
var active_buffs: Array = []

# Experiments (discovered recipes)
var discovered_recipes: Array = []

# Hidden recipes for discovery
var hidden_recipes: Array = []

# Stats
var total_taps: int = 0
var total_workstations_crafted: int = 0

# Timestamps
var last_save_time: float = 0.0

# ========================================
# SIGNALS
# ========================================

signal ab_changed(new_value: float)
signal ingredient_changed(ingredient_id: String, new_value: float)
signal workstation_crafted(workstation_id: String, new_count: int)
signal upgrade_purchased(upgrade_id: String)
signal prestige_completed(ek_earned: int)
signal recipe_discovered(recipe_id: String)

# ========================================
# INITIALIZATION
# ========================================

func _ready():
    load_hidden_recipes()
    load_game_state()
    
    # Start tick loop
    var timer = Timer.new()
    timer.wait_time = 0.1  # 10 ticks per second
    timer.timeout.connect(_on_tick)
    add_child(timer)
    timer.start()

func _notification(what):
    if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_WM_GO_BACK_REQUEST:
        save_game_state()
        get_tree().quit()

# ========================================
# GAME TICK
# ========================================

func _on_tick():
    var delta = 0.1  # 100ms tick
    
    # Update buffs
    update_buffs(delta)
    
    # Calculate production
    var production = calculate_total_production(delta)
    
    # Apply production
    for output_id in production:
        if output_id == "ab":
            add_ab(production[output_id])
        else:
            add_ingredient(output_id, production[output_id])
    
    # Auto-save every 30 seconds
    if Time.get_unix_time_from_system() - last_save_time > 30.0:
        save_game_state()

# ========================================
# PRODUCTION CALCULATIONS
# ========================================

func calculate_total_production(delta: float) -> Dictionary:
    var total_output = {}
    
    for ws_id in workstations:
        var owned = workstations[ws_id]
        var prod_data = Crafting.get_producer(ws_id)
        if not prod_data:
            continue
        
        # Get base outputs
        for output_id in prod_data.outputs:
            var base_rate = prod_data.outputs[output_id]
            
            # Apply multipliers
            var mult = Balance.get_production_multiplier(
                ws_id,
                upgrades_owned,
                prestige_bonuses,
                active_buffs,
                Crafting.upgrades,
                load("res://data/prestige_bonuses.tres").data if load("res://data/prestige_bonuses.tres") else []
            )
            
            var final_rate = base_rate * mult * owned
            
            if not total_output.has(output_id):
                total_output[output_id] = 0.0
            total_output[output_id] += final_rate * delta
    
    return total_output

func get_ab_per_second() -> float:
    var production = calculate_total_production(1.0)
    return production.get("ab", 0.0)

# ========================================
# BUFFS
# ========================================

func update_buffs(delta: float):
    var i = active_buffs.size() - 1
    while i >= 0:
        active_buffs[i].remaining -= delta
        if active_buffs[i].remaining <= 0:
            active_buffs.remove_at(i)
        i -= 1

func add_buff(multiplier: float, duration: float):
    active_buffs.append({
        "multiplier": multiplier,
        "remaining": duration
    })

# ========================================
# CURRENCY & INVENTORY
# ========================================

func add_ab(amount: float):
    ab += amount
    ab_total_earned += amount
    prestige_lifetime_earned += amount
    ab_changed.emit(ab)

func spend_ab(amount: float) -> bool:
    if ab < amount:
        return false
    ab -= amount
    ab_changed.emit(ab)
    return true

func add_ingredient(ing_id: String, amount: float):
    if not inventory.has(ing_id):
        inventory[ing_id] = 0.0
    inventory[ing_id] += amount
    ingredient_changed.emit(ing_id, inventory[ing_id])

func spend_ingredient(ing_id: String, amount: float) -> bool:
    if inventory.get(ing_id, 0.0) < amount:
        return false
    inventory[ing_id] -= amount
    ingredient_changed.emit(ing_id, inventory[ing_id])
    return true

# ========================================
# CAST (Manual Gathering)
# ========================================

func cast():
    total_taps += 1
    
    # Base tier-0 ingredients
    var base_amounts = {
        "wax_bits": 1.0,
        "wick_fiber": 1.0,
        "crystal_dust": 0.5,
        "aether_ess": 0.5
    }
    
    # Apply click upgrades
    var click_mult = 1.0
    for upg_id in upgrades_owned:
        var upg_data = Crafting.get_upgrade(upg_id)
        if upg_data and upg_data.affects == "click":
            if upg_data.type == "multiplier":
                click_mult *= upg_data.value
            elif upg_data.type == "additive":
                click_mult += upg_data.value
    
    # Grant ingredients
    for ing_id in base_amounts:
        add_ingredient(ing_id, base_amounts[ing_id] * click_mult)

# ========================================
# CRAFTING
# ========================================

func craft_workstation(ws_id: String, amount: int = 1) -> bool:
    var prod_data = Crafting.get_producer(ws_id)
    if not prod_data:
        return false
    
    # Check unlock
    if ab < prod_data.unlock_at_ab:
        return false
    
    var success_count = 0
    for i in range(amount):
        var current_owned = workstations.get(ws_id, 0)
        var recipe = Crafting.get_producer_recipe(ws_id, current_owned)
        
        if not Crafting.consume_recipe(recipe, inventory):
            break
        
        workstations[ws_id] = current_owned + 1
        success_count += 1
        total_workstations_crafted += 1
    
    if success_count > 0:
        workstation_crafted.emit(ws_id, workstations[ws_id])
        return true
    
    return false

func inscribe_upgrade(upg_id: String) -> bool:
    if upgrades_owned.has(upg_id):
        return false  # Already owned
    
    var upg_data = Crafting.get_upgrade(upg_id)
    if not upg_data:
        return false
    
    # Check unlock
    if ab < upg_data.unlock_at_ab:
        return false
    
    # Check recipe
    if not Crafting.consume_recipe(upg_data.recipe, inventory):
        return false
    
    upgrades_owned[upg_id] = true
    upgrade_purchased.emit(upg_id)
    return true

# ========================================
# PRESTIGE
# ========================================

func calculate_prestige_gain() -> int:
    var current_ek = Balance.prestige_points_for(prestige_lifetime_earned)
    return max(0, current_ek - prestige_points)

func ascend():
    var ek_gain = calculate_prestige_gain()
    if ek_gain <= 0:
        return
    
    prestige_points += ek_gain
    
    # Reset run
    ab = 0.0
    ab_total_earned = 0.0
    inventory.clear()
    workstations.clear()
    upgrades_owned.clear()
    active_buffs.clear()
    total_taps = 0
    total_workstations_crafted = 0
    
    # Apply prestige start bonuses
    apply_prestige_start_bonuses()
    
    prestige_completed.emit(ek_gain)
    save_game_state()

func apply_prestige_start_bonuses():
    var prestige_data_res = load("res://data/prestige_bonuses.tres")
    if not prestige_data_res:
        return
    
    var prestige_data_list = prestige_data_res.data if prestige_data_res.has("data") else []
    
    # Starting AB
    for bonus_id in prestige_bonuses:
        for bonus_data in prestige_data_list:
            if bonus_data.id == bonus_id and bonus_data.type == "starting_currency":
                var levels = prestige_bonuses[bonus_id]
                add_ab(bonus_data.value * levels)
    
    # Starting ingredients
    for bonus_id in prestige_bonuses:
        for bonus_data in prestige_data_list:
            if bonus_data.id == bonus_id and bonus_data.type == "start_ingredient":
                var levels = prestige_bonuses[bonus_id]
                add_ingredient(bonus_data.param, bonus_data.value * levels)

func purchase_prestige_bonus(bonus_id: String) -> bool:
    var prestige_data_res = load("res://data/prestige_bonuses.tres")
    if not prestige_data_res:
        return false
    
    var prestige_data_list = prestige_data_res.data if prestige_data_res.has("data") else []
    
    var bonus_data = null
    for data in prestige_data_list:
        if data.id == bonus_id:
            bonus_data = data
            break
    
    if not bonus_data:
        return false
    
    var current_level = prestige_bonuses.get(bonus_id, 0)
    var cost = bonus_data.base_cost_pp * pow(bonus_data.cost_growth, current_level)
    
    if prestige_points < cost:
        return false
    
    prestige_points -= int(cost)
    prestige_bonuses[bonus_id] = current_level + 1
    
    return true

# ========================================
# EXPERIMENT SYSTEM (Discovery)
# ========================================

func load_hidden_recipes():
    hidden_recipes = [
        {
            "id": "wax_block_bulk",
            "inputs": {"wax_bits": 50},
            "outputs": {"wax_block": 5},
            "name": "Wax Block Bulk",
            "description": "Convert raw wax into refined blocks"
        },
        {
            "id": "braid_wick",
            "inputs": {"wick_fiber": 30},
            "outputs": {"braided_wick": 3},
            "name": "Braided Wick",
            "description": "Weave fibers into sturdy wicks"
        },
        {
            "id": "distill_aether",
            "inputs": {"aether_ess": 40},
            "outputs": {"dist_aether": 4},
            "name": "Distilled Aether",
            "description": "Purify essence into stable aether"
        },
        {
            "id": "candle_compile",
            "inputs": {"wax_block": 5, "braided_wick": 1, "dist_aether": 2},
            "outputs": {"dig_candle": 1},
            "name": "Digital Candle",
            "description": "Assemble a mystical candle artifact"
        },
        {
            "id": "crystal_boost",
            "inputs": {"shaped_crys": 10, "dist_aether": 5},
            "outputs": {"ab": 50},
            "name": "Crystal Boost",
            "description": "Convert crystals directly to AB"
        }
    ]

func try_experiment() -> Dictionary:
    for recipe in hidden_recipes:
        if recipe.id in discovered_recipes:
            continue
        
        # Check if player has ingredients
        var has_all = true
        for ing_id in recipe.inputs:
            if inventory.get(ing_id, 0.0) < recipe.inputs[ing_id]:
                has_all = false
                break
        
        if has_all:
            discovered_recipes.append(recipe.id)
            recipe_discovered.emit(recipe.id)
            return {
                "success": true,
                "recipe": recipe
            }
    
    return {
        "success": false,
        "message": "No new recipes discovered. Try gathering more materials!"
    }

func craft_discovered_recipe(recipe_id: String) -> bool:
    if not recipe_id in discovered_recipes:
        return false
    
    # Find recipe
    var recipe = null
    for r in hidden_recipes:
        if r.id == recipe_id:
            recipe = r
            break
    
    if not recipe:
        return false
    
    # Check and consume inputs
    if not Crafting.consume_recipe(recipe.inputs, inventory):
        return false
    
    # Grant outputs
    for output_id in recipe.outputs:
        if output_id == "ab":
            add_ab(recipe.outputs[output_id])
        else:
            add_ingredient(output_id, recipe.outputs[output_id])
    
    return true

# ========================================
# SAVE / LOAD
# ========================================

func save_game_state():
    var save_data = {
        "ab": ab,
        "ab_total": ab_total_earned,
        "inventory": inventory.duplicate(),
        "workstations": workstations.duplicate(),
        "upgrades": upgrades_owned.duplicate(),
        "prestige": {
            "points": prestige_points,
            "lifetime_earned": prestige_lifetime_earned,
            "bonuses": prestige_bonuses.duplicate()
        },
        "dailies": DailyRituals.save_state(),
        "experiments": {
            "discovered": discovered_recipes.duplicate()
        },
        "stats": {
            "total_taps": total_taps,
            "total_workstations_crafted": total_workstations_crafted
        }
    }
    
    Persistence.save_game(save_data)
    last_save_time = Time.get_unix_time_from_system()

func load_game_state():
    var data = Persistence.load_game()
    if data.is_empty():
        return
    
    # Calculate offline progress BEFORE loading state
    var elapsed = Time.get_unix_time_from_system() - data.get("timestamp", Time.get_unix_time_from_system())
    
    # Load state
    ab = data.get("ab", 0.0)
    ab_total_earned = data.get("ab_total", 0.0)
    inventory = data.get("inventory", {})
    workstations = data.get("workstations", {})
    upgrades_owned = data.get("upgrades", {})
    
    var prestige_data = data.get("prestige", {})
    prestige_points = prestige_data.get("points", 0)
    prestige_lifetime_earned = prestige_data.get("lifetime_earned", 0.0)
    prestige_bonuses = prestige_data.get("bonuses", {})
    
    var dailies_data = data.get("dailies", {})
    DailyRituals.load_state(dailies_data)
    
    var experiments_data = data.get("experiments", {})
    discovered_recipes = experiments_data.get("discovered", [])
    
    var stats = data.get("stats", {})
    total_taps = stats.get("total_taps", 0)
    total_workstations_crafted = stats.get("total_workstations_crafted", 0)
    
    # Apply offline progress
    if elapsed > 0:
        apply_offline_progress(elapsed)
    
    last_save_time = Time.get_unix_time_from_system()

func apply_offline_progress(elapsed_seconds: float):
    var abps = get_ab_per_second()
    var offline_ab = Balance.calculate_offline_production(elapsed_seconds, abps)
    
    if offline_ab > 0:
        add_ab(offline_ab)
        
        # Show welcome back modal
        call_deferred("show_welcome_back_modal", elapsed_seconds, offline_ab)

func show_welcome_back_modal(elapsed: float, ab_gained: float):
    # Signal to UI
    print("Welcome back! Offline for %s, earned %s AB" % [
        Format.time_duration(elapsed), 
        Format.short(ab_gained)
    ])
```

---

## 🔬 EXPERIMENT SYSTEM

### How It Works

**Players discover recipes by having the right ingredients.**

### Flow

1. Player gathers materials
2. Clicks **"Experiment"** button
3. System checks for valid combos
4. If match found → **Discovery!**
5. Recipe unlocked permanently
6. Can now craft that recipe anytime

### Visual Example

```
╔════════════════════════════════╗
║      EXPERIMENT LAB            ║
╠════════════════════════════════╣
║                                ║
║  You have:                     ║
║  • Wax Bits: 150               ║
║  • Wick Fiber: 75              ║
║  • Crystal Dust: 20            ║
║                                ║
║  ┌─────────────────────────┐   ║
║  │   [EXPERIMENT]          │   ║
║  └─────────────────────────┘   ║
║                                ║
║  ✨ Discovery!                 ║
║  You've learned:               ║
║  "Wax Block Bulk"              ║
║                                ║
╚════════════════════════════════╝
```

### Implementation

Already included in **GameState.gd** above:

- `load_hidden_recipes()` - Defines all recipes
- `try_experiment()` - Checks for discoveries
- `craft_discovered_recipe()` - Uses discovered recipes

### UI Integration

```gdscript
# In ExperimentTab.gd

@onready var experiment_button = $ExperimentButton
@onready var result_label = $ResultLabel
@onready var recipe_list = $RecipeList

func _ready():
    experiment_button.pressed.connect(_on_experiment_pressed)
    GameState.recipe_discovered.connect(_on_recipe_discovered)
    update_recipe_list()

func _on_experiment_pressed():
    var result = GameState.try_experiment()
    
    if result.success:
        result_label.text = "✨ Discovered: " + result.recipe.name
        result_label.modulate = Color.GREEN
    else:
        result_label.text = result.message
        result_label.modulate = Color.YELLOW
    
    update_recipe_list()

func _on_recipe_discovered(recipe_id: String):
    # Play celebration effect
    pass

func update_recipe_list():
    # Clear existing
    for child in recipe_list.get_children():
        child.queue_free()
    
    # Show discovered recipes
    for recipe_id in GameState.discovered_recipes:
        var recipe = null
        for r in GameState.hidden_recipes:
            if r.id == recipe_id:
                recipe = r
                break
        
        if not recipe:
            continue
        
        var card = create_recipe_card(recipe)
        recipe_list.add_child(card)

func create_recipe_card(recipe: Dictionary) -> Control:
    var card = VBoxContainer.new()
    
    # Title
    var title = Label.new()
    title.text = recipe.name
    card.add_child(title)
    
    # Inputs
    var inputs_label = Label.new()
    inputs_label.text = "Costs:"
    card.add_child(inputs_label)
    
    for ing_id in recipe.inputs:
        var amount = recipe.inputs[ing_id]
        var have = GameState.inventory.get(ing_id, 0.0)
        
        var ing_label = Label.new()
        ing_label.text = "  %s: %s / %s" % [
            ing_id,
            Format.short(have),
            Format.short(amount)
        ]
        
        if have >= amount:
            ing_label.modulate = Color.GREEN
        else:
            ing_label.modulate = Color.RED
        
        card.add_child(ing_label)
    
    # Craft button
    var craft_btn = Button.new()
    craft_btn.text = "Craft"
    craft_btn.pressed.connect(func(): craft_recipe(recipe.id))
    card.add_child(craft_btn)
    
    return card

func craft_recipe(recipe_id: String):
    if GameState.craft_discovered_recipe(recipe_id):
        update_recipe_list()
```

---

## 🎨 UI IMPLEMENTATION

### Main Scene Structure

```
Main (Node2D)
├── CanvasLayer
│   ├── Background (ColorRect)
│   │   └── #0E0E12 (dark)
│   │
│   ├── TopBar (HBoxContainer)
│   │   ├── ABLabel
│   │   ├── ABPerSecLabel
│   │   └── CastButton
│   │
│   ├── TabContainer
│   │   ├── Workstations
│   │   ├── Inscriptions
│   │   ├── Inventory
│   │   ├── Experiment
│   │   ├── Dailies
│   │   └── Boons
│   │
│   └── Modals
│       ├── WelcomeBack
│       ├── Prestige
│       └── Settings
```

---

### UI Controller (UI_HUD.gd)

```gdscript
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
```

---

### Workstations Tab

```gdscript
# WorkstationsTab.gd
extends VBoxContainer

@onready var workstation_list = $ScrollContainer/WorkstationList

func _ready():
    GameState.workstation_crafted.connect(_on_workstation_crafted)
    populate_workstations()

func populate_workstations():
    # Clear existing
    for child in workstation_list.get_children():
        child.queue_free()
    
    # Add workstation cards
    for prod_data in Crafting.producers:
        if GameState.ab < prod_data.unlock_at_ab:
            continue
        
        var card = create_workstation_card(prod_data)
        workstation_list.add_child(card)

func create_workstation_card(prod_data) -> Control:
    var card = VBoxContainer.new()
    card.add_theme_constant_override("separation", 8)
    
    # === Title ===
    var title = Label.new()
    title.text = prod_data.display_name
    title.add_theme_font_size_override("font_size", 20)
    title.add_theme_color_override("font_color", Color("#22E3FF"))
    card.add_child(title)
    
    # === Owned Count ===
    var owned = GameState.workstations.get(prod_data.id, 0)
    var owned_label = Label.new()
    owned_label.text = "⚙️ Owned: %d" % owned
    card.add_child(owned_label)
    
    # === Output Display ===
    var output_label = Label.new()
    var output_text = "Produces: "
    for output_id in prod_data.outputs:
        var rate = prod_data.outputs[output_id]
        output_text += "%s/s %s  " % [Format.precise(rate, 2), output_id]
    output_label.text = output_text
    card.add_child(output_label)
    
    # === Recipe (Have/Need) ===
    var recipe = Crafting.get_producer_recipe(prod_data.id, owned)
    
    var recipe_title = Label.new()
    recipe_title.text = "Recipe for next:"
    recipe_title.add_theme_font_size_override("font_size", 14)
    card.add_child(recipe_title)
    
    for ing_id in recipe:
        var amount_needed = recipe[ing_id]
        var amount_have = GameState.inventory.get(ing_id, 0.0)
        
        var ing_label = Label.new()
        ing_label.text = "  %s: %s / %s" % [
            ing_id,
            Format.short(amount_have),
            Format.short(amount_needed)
        ]
        
        if amount_have >= amount_needed:
            ing_label.add_theme_color_override("font_color", Color("#3CE3C5"))
        else:
            ing_label.add_theme_color_override("font_color", Color("#FF2DAA"))
        
        card.add_child(ing_label)
    
    # === Craft Buttons ===
    var button_row = HBoxContainer.new()
    button_row.add_theme_constant_override("separation", 10)
    
    var craft_1 = Button.new()
    craft_1.text = "Craft x1"
    craft_1.pressed.connect(func(): craft_workstation(prod_data.id, 1))
    button_row.add_child(craft_1)
    
    var craft_10 = Button.new()
    craft_10.text = "Craft x10"
    craft_10.pressed.connect(func(): craft_workstation(prod_data.id, 10))
    button_row.add_child(craft_10)
    
    var craft_max = Button.new()
    craft_max.text = "Max"
    craft_max.pressed.connect(func(): craft_workstation_max(prod_data.id))
    button_row.add_child(craft_max)
    
    card.add_child(button_row)
    
    # === Separator ===
    var sep = HSeparator.new()
    sep.add_theme_constant_override("separation", 20)
    card.add_child(sep)
    
    return card

func craft_workstation(ws_id: String, amount: int):
    GameState.craft_workstation(ws_id, amount)
    populate_workstations()

func craft_workstation_max(ws_id: String):
    # Calculate max affordable
    var max_count = 0
    for i in range(1000):  # Safety limit
        var owned = GameState.workstations.get(ws_id, 0) + max_count
        var recipe = Crafting.get_producer_recipe(ws_id, owned)
        
        if Crafting.can_afford(recipe, GameState.inventory):
            max_count += 1
        else:
            break
    
    if max_count > 0:
        craft_workstation(ws_id, max_count)

func _on_workstation_crafted(_ws_id, _count):
    populate_workstations()
```

---

### Welcome Back Modal

```gdscript
# UI_WelcomeBack.gd
extends Panel

@onready var time_label = $VBoxContainer/TimeLabel
@onready var ab_label = $VBoxContainer/ABLabel
@onready var close_button = $VBoxContainer/CloseButton

signal closed

func _ready():
    close_button.pressed.connect(_on_close_pressed)
    hide()

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
```

---

### Theme & Colors

**Create:** `theme/colors.tres`

```gdscript
# Cozy Neon Pixel Palette
const BG_DARK = Color("#0E0E12")
const PRIMARY = Color("#FF2DAA")      # Pink
const SECONDARY = Color("#22E3FF")    # Cyan
const ACCENT = Color("#FFDB6E")       # Gold
const SUCCESS = Color("#3CE3C5")      # Teal
const MYSTICAL = Color("#C9A0FF")     # Purple
```

**Apply to UI:**

```gdscript
# In Main.tscn or theme setup
var theme = Theme.new()

# Background
var bg_style = StyleBoxFlat.new()
bg_style.bg_color = Color("#0E0E12")
theme.set_stylebox("panel", "Panel", bg_style)

# Buttons
var btn_style = StyleBoxFlat.new()
btn_style.bg_color = Color("#FF2DAA")
btn_style.corner_radius_top_left = 4
btn_style.corner_radius_top_right = 4
btn_style.corner_radius_bottom_left = 4
btn_style.corner_radius_bottom_right = 4
theme.set_stylebox("normal", "Button", btn_style)
```

---

## 📦 GAME CONTENT

### Ingredients

**Create:** `data/ingredients.tres`

```gdscript
# Use Godot's Resource system
# Create an Array Resource with these items:

[
    IngredientData.new("wax_bits", "Wax Bits", 0),
    IngredientData.new("wick_fiber", "Wick Fiber", 0),
    IngredientData.new("crystal_dust", "Crystal Dust", 0),
    IngredientData.new("aether_ess", "Aether Essence", 0),
    IngredientData.new("wax_block", "Wax Block", 1),
    IngredientData.new("braided_wick", "Braided Wick", 1),
    IngredientData.new("shaped_crys", "Shaped Crystal", 1),
    IngredientData.new("dist_aether", "Distilled Aether", 1),
    IngredientData.new("dig_candle", "Digital Candle", 2)
]
```

---

### Workstations (Producers)

**Create:** `data/producers.tres`

| ID | Name | Unlock AB | Recipe | Growth | Output |
|----|------|-----------|--------|--------|--------|
| `ws_melter` | Wax Melter | 0 | 10× wax_bits | 1.10 | 0.30/s wax_block |
| `ws_spinner` | Wick Spinner | 0 | 10× wick_fiber | 1.10 | 0.30/s braided_wick |
| `ws_shaper` | Crystal Shaper | 25 | 10× crystal_dust | 1.12 | 0.20/s shaped_crys |
| `ws_still` | Aether Still | 50 | 10× aether_ess | 1.12 | 0.20/s dist_aether |
| `ws_candle` | Digital Candle Farm | 100 | 5× wax_block + 1× braided_wick + 2× dist_aether | 1.14 | 1.0/s AB |
| `ws_crystal` | Crystal Rig | 250 | 2× shaped_crys + 2× dist_aether | 1.14 | 0.15/s AB + 0.05/s crystal_dust |
| `ws_cauldron` | Quantum Cauldron | 1500 | 3× shaped_crys + 3× dist_aether + 1× dig_candle | 1.16 | 2.5/s AB |

```gdscript
# In producers.tres
[
    ProducerData.new(
        "ws_melter", "Wax Melter", 0.0,
        {"wax_bits": 10}, 1.10,
        {"wax_block": 0.30}
    ),
    ProducerData.new(
        "ws_spinner", "Wick Spinner", 0.0,
        {"wick_fiber": 10}, 1.10,
        {"braided_wick": 0.30}
    ),
    # ... add all 7 workstations
]
```

---

### Inscriptions (Upgrades)

**Create:** `data/upgrades.tres`

| ID | Name | Affects | Type | Value | Recipe |
|----|------|---------|------|-------|--------|
| `u_global_1` | Hex Compiler v1 | global | multiplier | 1.5 | 2× wax_block + 2× braided_wick + 1× shaped_crys |
| `u_candle_1` | Wax Algorithm | producer:ws_candle | multiplier | 2.0 | 3× wax_block + 1× dist_aether |
| `u_crystal_1` | Quantum Faceting | producer:ws_crystal | multiplier | 2.0 | 2× shaped_crys + 1× dist_aether |
| `u_click_1` | Sigil Stroke | click | additive | 1.0 | 10× wick_fiber |
| `u_cauldron_1` | Brew Daemon | producer:ws_cauldron | multiplier | 1.8 | 2× shaped_crys + 2× dist_aether + 1× dig_candle |
| `u_global_2` | Sigil Cache | global | multiplier | 1.8 | 3× wax_block + 2× shaped_crys + 2× dist_aether |

---

### Prestige Boons

**Create:** `data/prestige_bonuses.tres`

| ID | Name | Type | Param | Value | Base Cost | Growth |
|----|------|------|-------|-------|-----------|--------|
| `pp_global_1` | Coven's Oath | global_mult | - | 0.10 | 10 | 1.5 |
| `pp_start_bits` | Seeded Spellbook | starting_currency | - | 1000 | 5 | 1.5 |
| `pp_candle_mult` | Wax Moon | producer_mult | ws_candle | 0.05 | 8 | 1.5 |
| `pp_crystal_mult` | Facet Star | producer_mult | ws_crystal | 0.05 | 10 | 1.5 |
| `pp_cauldron_mult` | Crucible Pact | producer_mult | ws_cauldron | 0.05 | 12 | 1.5 |
| `pp_start_ingred` | Pocket Satchel | start_ingredient | wax_bits | 100 | 6 | 1.5 |

---

### Daily Tasks

**Create:** `data/daily_tasks_pool.tres`

| ID | Name | Condition | Reward Type | Reward Value |
|----|------|-----------|-------------|--------------|
| `d_kindle` | Kindle the Grid | craft:workstation:ws_melter:3 | ab | 5000 |
| `d_song` | Crystal Song | own:workstation:ws_crystal:3 | buff | 900s @ +10% |
| `d_flow` | Rite of Flow | tap:150 | ek_frag | 1 |
| `d_threads` | Threads of Fate | craft_item:braided_wick:20 | ab | 8000 |
| `d_alchemy` | Aether Alchemy | craft_item:dist_aether:10 | buff | 600s @ +15% |

---

## 📐 BALANCE FORMULAS

### Key Constants

```gdscript
# First prestige target
TARGET_MINUTES = 35
TARGET_AB = 1_200_000  # ~35 min with base rates

# Offline cap
OFFLINE_CAP_HOURS = 12

# Cast base amounts
CAST_WAX_BITS = 1.0
CAST_WICK_FIBER = 1.0
CAST_CRYSTAL = 0.5
CAST_AETHER = 0.5
```

---

### Prestige Formula

```
EK = floor(sqrt(lifetime_AB / 1,200,000))

Example:
- 1.2M lifetime → 1 EK
- 4.8M lifetime → 2 EK
- 10.8M lifetime → 3 EK
```

**Next threshold:**
```
Next = (current_EK + 1)² × 1,200,000

Example:
- Currently 1 EK → need 4.8M (+3.6M more)
- Currently 2 EK → need 10.8M (+6M more)
```

---

### Recipe Scaling

```
cost = base_cost × (growth ^ owned)

Example:
- Wax Melter (growth 1.10)
- 1st: 10 wax_bits
- 2nd: 11 wax_bits
- 10th: 26 wax_bits
- 100th: 137,795 wax_bits
```

---

### Production Multipliers

```
final_output = base_rate × global_mult × producer_mult × buff_mult × owned

Where:
- global_mult = product of all global upgrades
- producer_mult = product of producer-specific upgrades
- buff_mult = product of active buffs
```

---

## 📅 DAILY RITUALS

### DailyRituals.gd

```gdscript
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
```

---

### Wire Into GameState

**Add to GameState.gd:**

```gdscript
func _ready():
    # ... existing code ...
    
    # Connect daily tracking
    workstation_crafted.connect(_on_workstation_for_dailies)

func _on_workstation_for_dailies(ws_id: String, new_count: int):
    DailyRituals.update_task_progress("craft", ws_id, total_workstations_crafted)
    DailyRituals.update_task_progress("own", ws_id, new_count)

func cast():
    # ... existing code ...
    DailyRituals.update_task_progress("tap", "", total_taps)
```

---

## ✅ TESTING CHECKLIST

### Core Systems

- [ ] Cast button grants ingredients
- [ ] Ingredients accumulate correctly
- [ ] Workstation crafting works
- [ ] Workstations produce every tick
- [ ] AB accumulates from production
- [ ] Upgrades apply multipliers
- [ ] Click upgrades boost Cast

### Recipes & Scaling

- [ ] Recipe costs increase with owned count
- [ ] Growth formula works (1.10^owned)
- [ ] Have/Need display updates
- [ ] Craft x1, x10, Max work
- [ ] Can't craft without ingredients

### Prestige

- [ ] EK calculation correct
- [ ] Ascend preview shows gain
- [ ] Ascend resets run properly
- [ ] Bonuses persist after reset
- [ ] Starting bonuses apply
- [ ] Boon costs increase correctly

### Offline Progress

- [ ] Save file creates in user://
- [ ] Offline time calculates correctly
- [ ] Production caps at 12h
- [ ] Welcome Back shows correct values
- [ ] No production without workstations

### Experiment System

- [ ] Discovery checks ingredients
- [ ] Can't discover without materials
- [ ] Discovery persists after save/load
- [ ] Discovered recipes can craft
- [ ] Crafting consumes correctly

### Daily Rituals

- [ ] 3 tasks selected daily
- [ ] Progress tracks correctly
- [ ] Rewards grant on claim
- [ ] Refresh at midnight
- [ ] EK fragments combine (5→1)

### UI/UX

- [ ] Portrait layout works
- [ ] All tabs accessible
- [ ] Numbers format (K, M, B)
- [ ] Buttons disable when broke
- [ ] Modals show/hide properly

### Web Export

- [ ] 60 FPS on desktop browser
- [ ] 30+ FPS on mobile browser
- [ ] Save persists (IndexedDB)
- [ ] No console errors
- [ ] Touch input works
- [ ] Portrait orientation locks

---

## 🌐 WEB EXPORT

### Export Preset Settings

```
Preset: Web
Runnable: Yes
Export Path: build/web/index.html

Options:
  Custom HTML Shell: (default)
  
  Head Include:
    <meta name="viewport" content="width=device-width, 
          initial-scale=1, maximum-scale=1, user-scalable=no">
  
  VRAM Compression:
    For Desktop: ✓
    For Mobile: ✓
  
  Progressive Web App:
    Enabled: ✓
    Cross Origin Isolation: ✓
    
    Icons:
      144×144: res://icon_144.png
      180×180: res://icon_180.png
      512×512: res://icon_512.png
    
    Orientation: portrait
    Display: standalone
    Background Color: #0E0E12
```

---

### Local Testing

```bash
# Navigate to export folder
cd build/web

# Start local server
python3 -m http.server 8000

# Open browser
http://localhost:8000
```

---

### Performance Tips

```gdscript
# In project settings or Main.gd

# Limit FPS for web
if OS.has_feature("web"):
    Engine.max_fps = 60

# Reduce physics if not using
Physics2DServer.set_active(false)

# Optimize particles
const MAX_PARTICLES = 50

# Enable sprite batching
ProjectSettings.set_setting(
    "rendering/batching/options/use_batching", 
    true
)
```

---

## 📅 IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Week 1)

**Days 1-2: Project Setup**
- [ ] Create Godot project
- [ ] Configure display/rendering
- [ ] Set up autoloads
- [ ] Create folder structure

**Days 3-5: Resource Classes**
- [ ] Create all data model scripts
- [ ] Test each class with dummy data
- [ ] Create .tres templates

**Days 6-7: Core Utils**
- [ ] Implement Format.gd
- [ ] Implement Balance.gd
- [ ] Test formulas

---

### Phase 2: Core Systems (Week 2)

**Days 8-10: Crafting & Persistence**
- [ ] Implement Crafting.gd
- [ ] Implement Persistence.gd
- [ ] Test save/load cycle

**Days 11-14: GameState**
- [ ] Implement inventory system
- [ ] Implement Cast() function
- [ ] Implement tick loop
- [ ] Implement workstation crafting
- [ ] Test full production chain

---

### Phase 3: Progression (Week 3)

**Days 15-17: Upgrades & Production**
- [ ] Implement upgrade system
- [ ] Implement multiplier calculations
- [ ] Test all upgrade types

**Days 18-21: Prestige**
- [ ] Implement prestige formulas
- [ ] Implement reset logic
- [ ] Implement boon purchasing
- [ ] Test full prestige cycle

---

### Phase 4: Discovery (Week 4)

**Days 22-24: Experiment System**
- [ ] Add hidden recipes
- [ ] Implement try_experiment()
- [ ] Implement recipe crafting
- [ ] Test discovery flow

**Days 25-28: Daily Rituals**
- [ ] Implement DailyRituals.gd
- [ ] Wire task tracking
- [ ] Test daily refresh
- [ ] Test EK fragments

---

### Phase 5: UI (Weeks 5-6)

**Days 29-35: Basic UI**
- [ ] Create Main.tscn structure
- [ ] Implement TopBar + Cast
- [ ] Create tab system
- [ ] Implement Workstations tab
- [ ] Implement Inscriptions tab

**Days 36-42: Advanced UI**
- [ ] Implement Inventory tab
- [ ] Implement Experiment tab
- [ ] Implement Dailies tab
- [ ] Implement Boons tab
- [ ] Create all modals

---

### Phase 6: Content (Week 7)

**Days 43-49: Data Entry**
- [ ] Create all .tres files
- [ ] Populate ingredients
- [ ] Populate workstations
- [ ] Populate upgrades
- [ ] Populate boons
- [ ] Populate daily tasks
- [ ] Test all content loads

---

### Phase 7: Balance (Week 8)

**Days 50-56: Tuning**
- [ ] Playtest first prestige
- [ ] Adjust prestige_scale
- [ ] Tune production rates
- [ ] Test offline progression
- [ ] Verify unlock curve

---

### Phase 8: Polish (Week 9)

**Days 57-63: Quality of Life**
- [ ] Add sound effects
- [ ] Add particle effects
- [ ] Implement settings panel
- [ ] Add accessibility options
- [ ] Fix visual bugs
- [ ] Optimize performance

---

### Phase 9: Web Export (Week 10)

**Days 64-70: Deployment**
- [ ] Configure HTML5 export
- [ ] Test on Chrome/Firefox/Safari
- [ ] Test on mobile devices
- [ ] Verify IndexedDB
- [ ] Optimize loading times
- [ ] Deploy to hosting

---

## 🎯 SUCCESS CRITERIA

### Minimum Viable Product

✅ **Core loop works:**
- Cast → Gather → Craft → Produce → Prestige

✅ **Systems functional:**
- Save/Load persists
- Offline progress calculates
- All tabs accessible

✅ **Performance:**
- 60 FPS on desktop
- 30+ FPS on mobile

---

### Full v1.0 Release

✅ **All features:**
- Experiment system complete
- Daily rituals working
- All content unlockable

✅ **Polish:**
- No critical bugs
- UI is responsive
- Numbers format correctly

✅ **Balance:**
- First prestige ~30-40 min
- Progression feels smooth
- Offline rewards fair

---

## 📝 FINAL NOTES

### Implementation Tips

**Start small, test often.**
Build one system at a time and verify it works before moving on.

**Use debug commands.**
Add functions to skip ahead and test late-game content.

**Save frequently.**
Auto-save every 30 seconds prevents data loss.

**Test on real devices.**
Desktop simulation doesn't catch mobile issues.

---

### Common Pitfalls

⚠️ **Forgetting to save**
Call `save_game_state()` after major changes

⚠️ **UI not updating**
Connect signals properly to refresh displays

⚠️ **Recipe scaling bugs**
Always test with 0, 1, 10, 100 owned units

⚠️ **Offline calculation errors**
Verify production rates before calculating offline

⚠️ **Prestige bonuses not applying**
Check `apply_prestige_start_bonuses()` calls on new run

---

### Getting Help

**Godot Documentation:**
https://docs.godotengine.org/en/stable/

**GDScript Reference:**
https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/

**Idle Game Design:**
https://www.reddit.com/r/incremental_games/

---

## 🎮 YOU'RE READY TO BUILD

This document contains everything needed to implement **Cyber Witches: Idle Coven v1.0** with the **Experiment discovery system**.

Follow the phases sequentially, test frequently, and you'll have a polished web game in **10-12 weeks**.

**Good luck, and may your code compile on the first try!** ✨

---

*End of Implementation Guide*
