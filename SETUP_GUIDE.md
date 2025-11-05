# 🛠️ Setup Guide for Cyber Witches

## ✅ What's Been Implemented

All core game systems have been implemented:

### ✅ Core Systems
- **Format.gd** - Number formatting (K, M, B suffixes)
- **Balance.gd** - All formulas (prestige, scaling, multipliers)
- **Crafting.gd** - Recipe management and validation
- **Persistence.gd** - Save/Load system
- **GameState.gd** - Main game logic (tick loop, production, crafting, prestige, experiments)
- **DailyRituals.gd** - Daily task system
- **DataInitializer.gd** - Fallback data initialization

### ✅ Resource Classes
- **IngredientData.gd** - Ingredient definitions
- **ProducerData.gd** - Workstation definitions
- **UpgradeData.gd** - Upgrade definitions
- **PrestigeBonusData.gd** - Prestige bonus definitions
- **DailyTaskData.gd** - Daily task definitions

### ✅ UI Scripts
- **UI_HUD.gd** - Top bar with AB display and Cast button
- **WorkstationsTab.gd** - Workstation crafting interface
- **InscriptionsTab.gd** - Upgrade purchasing interface
- **InventoryTab.gd** - Inventory display
- **ExperimentTab.gd** - Experiment/discovery interface
- **UI_DailyRituals.gd** - Daily tasks interface
- **BoonsTab.gd** - Prestige bonuses interface
- **UI_WelcomeBack.gd** - Offline progress modal
- **UI_Prestige.gd** - Prestige/ascend modal

### ✅ Project Configuration
- **project.godot** - Project settings with autoloads configured

## 🎯 Next Steps (In Godot Editor)

### 1. Create Main Scene (Main.tscn)

Create a new scene with this structure:

```
Main (Node2D)
└── CanvasLayer
    ├── Background (ColorRect)
    │   └── Color: #0E0E12
    │
    ├── TopBar (HBoxContainer)
    │   ├── ABLabel (Label)
    │   ├── ABPerSecLabel (Label)
    │   └── CastButton (Button)
    │
    ├── TabContainer
    │   ├── Workstations (Control) - attach WorkstationsTab.gd
    │   │   └── ScrollContainer
    │   │       └── WorkstationList (VBoxContainer)
    │   │
    │   ├── Inscriptions (Control) - attach InscriptionsTab.gd
    │   │   └── ScrollContainer
    │   │       └── UpgradeList (VBoxContainer)
    │   │
    │   ├── Inventory (Control) - attach InventoryTab.gd
    │   │   └── ScrollContainer
    │   │       └── InventoryList (VBoxContainer)
    │   │
    │   ├── Experiment (Control) - attach ExperimentTab.gd
    │   │   ├── ExperimentButton (Button)
    │   │   ├── ResultLabel (Label)
    │   │   └── ScrollContainer
    │   │       └── RecipeList (VBoxContainer)
    │   │
    │   ├── Dailies (Control) - attach UI_DailyRituals.gd
    │   │   └── ScrollContainer
    │   │       └── TaskList (VBoxContainer)
    │   │
    │   └── Boons (Control) - attach BoonsTab.gd
    │       ├── Header (HBoxContainer)
    │       │   └── EKLabel (Label)
    │       └── ScrollContainer
    │           └── BoonList (VBoxContainer)
    │
    └── Modals
        ├── WelcomeBack (Panel) - attach UI_WelcomeBack.gd
        │   └── VBoxContainer
        │       ├── TimeLabel (Label)
        │       ├── ABLabel (Label)
        │       └── CloseButton (Button)
        │
        └── Prestige (Panel) - attach UI_Prestige.gd
            └── VBoxContainer
                ├── EKLabel (Label)
                ├── GainLabel (Label)
                ├── AscendButton (Button)
                └── CloseButton (Button)
```

### 2. Attach Scripts

1. Select the CanvasLayer node
2. Attach `scripts/UI_HUD.gd` as its script
3. For each tab, attach the corresponding script:
   - Workstations → `scripts/WorkstationsTab.gd`
   - Inscriptions → `scripts/InscriptionsTab.gd`
   - Inventory → `scripts/InventoryTab.gd`
   - Experiment → `scripts/ExperimentTab.gd`
   - Dailies → `scripts/UI_DailyRituals.gd`
   - Boons → `scripts/BoonsTab.gd`

### 3. Set Up Node Paths

Make sure all `@onready` variables in the scripts match the node names in your scene.

### 4. (Optional) Create .tres Resource Files

The game will work with fallback initialization, but you can create proper .tres files:

1. Create a new Resource
2. Add a property called `data` of type Array
3. Populate with data from `DataInitializer.gd`
4. Save in `data/` folder

### 5. Test the Game

1. Press F5 to run
2. Click the Cast button to gather ingredients
3. Craft workstations to produce resources
4. Experiment to discover recipes
5. Ascend when you have enough lifetime AB

## 🎨 Theme Styling (Optional)

Create a theme resource with:
- Background: `#0E0E12` (dark)
- Primary: `#FF2DAA` (pink)
- Secondary: `#22E3FF` (cyan)
- Accent: `#FFDB6E` (gold)
- Success: `#3CE3C5` (teal)
- Mystical: `#C9A0FF` (purple)

## 🐛 Troubleshooting

### Error: "DataInitializer not found"
- Make sure `scripts/DataInitializer.gd` is in the project
- The class_name should be registered

### Error: "Node path not found"
- Check that all `@onready` node paths match your scene structure
- Node names are case-sensitive

### Error: "Resource class not found"
- Make sure all Resource classes are in `resources/` folder
- They should be registered as class_name

### Game not saving
- Check that `user://` directory is writable
- On web, saves use IndexedDB

## 📝 Notes

- All game systems are fully implemented and ready to use
- UI scenes need to be created in the Godot editor
- The game will work even without .tres files (uses fallback)
- Portrait orientation is enforced (1080x1920)
- Auto-save happens every 30 seconds

Good luck! 🎮✨

