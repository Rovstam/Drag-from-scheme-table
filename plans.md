Current scope and implementation route:

- This mod is a Rhino JavaScript script mod that extends Salivion's Extended UI schematic table.
- It is not a Java mod, and it must not edit the base game, Extended UI, or any other mod.
- The valid approach is to work only inside this project folder and use the existing EUI integration hooks already present in the current script.
- The working implementation path is: bind a direct `InputListener` to each live schematic slot button, keep a separate MOVE toggle above the table, and use the slot buttons as the authoritative interaction surface.
- The direct-slot-listener approach is the intended route for this project and is the correct scope to preserve.
- The broader "drag schematic from library to table" idea in the earlier plan is not the current implementation target for this repo, because the schematic library dialog is a static overlay and not a draggable panel exposed to a script mod.
- The project explicitly says: do not replace or modify the base game, and do not try to rewrite or patch EUI itself. If a future feature requires access to the actual schematic-library widgets, that must come from a dependency hook or an exposed UI API; otherwise it is blocked by the mod architecture.
- Versioning remains fixed: keep `mod.hjson` and `scripts/main.js` at version `1.0.1` unless the user explicitly asks to change it.
- The current `Styles.selecti` outline remains acceptable as a provisional preview; any future visual refinement would be a separate follow-up, not the current feature target.

Feature 1 (Done) — Swap confirmation preference: Implemented. The confirmation popup has a persistent "Don't show this again" option, also configurable in Extended UI settings.

Feature 2 (Done) — Dragging while moving: Implemented. With **Enable visual schematic dragging** on, dragging a schematic onto an empty slot moves it; dropping on an occupied slot uses the existing confirmation flow. Releasing outside a slot does nothing. With the setting off, drag gestures do nothing and click-to-select/click-to-move remains available.

Blocked/archival note:
- Feature 3 (dragging from the schematic library into the schematic table) is not a valid direct task for this script-only mod unless Extended UI exposes the necessary library widgets or an API for them.
- The earlier plan’s idea of replacing the vanilla schematic dialog or patching the base game is explicitly out of scope and must not be pursued in this project.