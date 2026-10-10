# Drag from Scheme Table — Project Context

## User request and scope

Make a Mindustry mod that extends Salivion's Extended UI schematic table. Clicking a move/unlock icon enables rearranging: select a schematic slot, then select its destination. If that destination already contains a schematic, ask before replacing it. Keep the source unchanged if the user cancels confirmation. The user explicitly requires edits to stay inside this mod folder; Mindustry source may be inspected for reference but not modified, and other mods must not be edited.

## Workspace and installation

- Editable project folder: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\saves\mods\Drag from scheme table`
- Main script: `scripts\main.js`
- Manifest: `mod.hjson`
- Localized strings: `bundles\bundle.properties`
- User-data mod folder observed: `C:\Users\PERSONAL\AppData\Roaming\Mindustry\mods`
- Mindustry does not auto-load from the Steam installation's `saves\mods` directory. To test local changes, package/import the mod from this folder or otherwise ensure the active installed copy is updated. Remove/replace older imported copies to avoid testing stale code.
- A package ZIP is generated in this folder as `Drag-from-scheme-table.zip`; keep it synchronized with source files whenever those change.
- Mindustry source reference available at `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\Mindustry-160.5`. A previous user-data log (dated July 6, 2026) reported version 158.1; treat that log as historical, not proof of the current running game version.

## Target mod details

The mod is a Mindustry JavaScript script mod with internal name `drag-scheme-table`, depending on `extended-ui`. Current manifest version: 1.0.5; minimum game version: 158.1. The script registers on `ClientLoadEvent`, creates a lock toggle above the table, and uses Extended UI's `global.eui.registerUpdate`.

The source Extended UI archive was inspected at `saves\mods\salivionextended-ui.zip`. Relevant behavior from its `scripts\ui\other\schematics-table-ui.js`:

- HUD table name is `eui-schematics-table`.
- Table visibility is gated by `eui-ShowSchematicsTable` and whether the HUD is shown.
- Defaults are 4 rows and 5 columns (`eui-SchematicsTableRows`, `eui-SchematicsTableColumns`).
- The schematic grid is rebuilt by clearing/rebuilding its child table; slot buttons are newly created on rebuild.
- Normal click invokes `Vars.control.input.useSchematic(schematic)`.
- Desktop right-click edits a slot; mobile double-tap edits it.
- Schematic setting keys are `schematic<category>.<column>.<row>`; custom image is the key plus `image`.
- Category buttons occupy the first button group; schematic slots follow them.
- Extended UI creates its table in HUD and calls `toBack()`, so any separate move control must be brought forward while visible.

## Current intended behavior / implementation

- Move mode off: slot clicks should continue to use schematics as before.
- Move mode on: clicking a populated slot selects it; clicking another slot moves the entry there. Clicking the selected source again cancels selection.
- Occupied destination: confirmation is required before any settings change. Confirm overwrites destination and clears source; cancel changes neither.
- Move the source slot's custom image setting to the destination and remove the old source image setting.
- Rebuild Extended UI's table after the move.
- Current script resolves the known EUI table structure directly: outer table -> wrapped table -> category button table at child 0, label at child 1, schematic button table at child 2. It attaches a capture `InputListener` to the table itself, not individual slots. On left touch-down it uses `table.hit(x, y, true)` to identify a schematic slot, stops that event, and completes the move on matching touch-up. Category-button hits are not consumed. It identifies/rebinds the listener when EUI rebuilds the outer table and preserves cross-category selection.
- Debug log stages include `Script evaluated. Version 1.0.5.`, `ClientLoadEvent received.`, `Loaded v1.0.5.`, `Bound N schematic slots.`, `Move mode ON/OFF`, `touchDown captured on slot N`, `Slot click: schematic...`, and `Moved ...`. Update/setup failures are logged with a `[Drag from Scheme Table]` prefix.

## Known concerns / next debugging work

- The implementation has **not been runtime-verified in Mindustry**. Node mock tests exercise startup callback, table binding, capture/touch-up, selection, cross-category occupied replacement, image transfer, source clearing, table rebuild/rebinding, and category/normal-mode pass-through. They do not prove actual Arc/Rhino behavior.
- The available user-data `last_log.txt` was last modified 2026-07-06 and does not mention this mod; it is stale. Request/read a fresh log from the same launch before concluding which mod copy loaded. Confirm startup/version/bind/toggle/capture/slot-click/move lines above.
- Current import package is `Drag-from-scheme-table.zip` in this folder. Rebuild it after source changes and ensure the user replaces any older imported copy with this package before runtime testing.
- Validate parent-table capture coordinates, stage touch focus and hit testing on the actual Arc runtime. Category tabs must remain clickable while a source slot is selected, and move mode off must pass the original EUI slot click through.
- When modifying the mod, edit files only under the project folder above. Update the import ZIP after source changes; do not edit Extended UI or the Mindustry source.

## Verification history

- `node --check scripts\main.js` passed for v1.0.5.
- Mock UI interaction tests passed for startup, binding, toggle, source selection, cross-category occupied replacement confirmation, image transfer, source clearing, table rebuild/rebinding, category click pass-through, and normal-mode pass-through.
- Package layout was checked for root `mod.hjson`, `scripts/main.js`, and `bundles/bundle.properties`; packaged script was compared byte-for-byte to the workspace source.
- No in-game/runtime test has yet confirmed the UI works.

## 2026-10-10 update (v1.0.4)

Verified against the real Extended UI source (Salivion-Extended-UI-54ad91f, mod name `extended-ui`): `global.eui.registerUpdate`, `global.eui.schematicsTableUI.rebuildTable` (exported), table name `eui-schematics-table`, and button layout (`columns` category buttons, then `rows*columns` slot buttons; the category label is not a button) all match. Notes: EUI's `rebuildTable` destroys the table and recreates it on the next update tick (new Table object); EUI's central handler swallows its own handler errors, ours logs. The slot default icon in EUI is Icon.pencil, so the move control now uses lock/lockOpen. Added: selection highlight, empty-source hint, EUI-missing guard, DEBUG logging. Still not runtime-verified in-game.
