# Drag from Scheme Table — Agent Context

## User request and hard scope

This Mindustry Rhino JavaScript script mod extends Salivion's Extended UI schematic table. The user has confirmed the mod **functionally works**.

Requested behavior:
- A visible **MOVE** toggle above the EUI schematic table enables move mode.
- In move mode, clicking a populated slot selects it and highlights it; clicking another slot moves the schematic there.
- If the destination is occupied, ask for confirmation before changing either slot. Cancel must leave both unchanged.
- Transfer the source slot's custom image setting with the schematic and clear the source slot.
- Category tabs stay clickable while a source is selected; cross-category moves are supported.
- Outside move mode, existing schematic-table behavior is unchanged.

The user explicitly says: **edit only files inside this mod folder**. Mindustry source may be read as reference, but do not modify it. Do not edit Extended UI or any other mod.

## Project paths and packaging

- Editable folder: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\saves\mods\Drag from scheme table`
- Main script: `scripts\main.js`
- Manifest: `mod.hjson`
- Strings: `bundles\bundle.properties`
- The user's firm version preference: keep `version` at **1.0.1**. Do not bump version numbers for future fixes unless the user specifically asks.
- Local Mindustry source reference: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\Mindustry-160.5`
- Old `last_log.txt` inspected during earlier work was dated 2026-07-06, reported Mindustry 158.1, and did not list this mod. It is not evidence about a later launch. Do not ask for logs as the default response to a user who already says the mod loads/works; investigate code directly first.

## Current manifest

- Internal name: `drag-scheme-table`
- Display name: `Drag from Scheme Table`
- Script mod, main `scripts/main`
- Required dependency: `extended-ui`
- `minGameVersion`: `158.1`
- `version`: `1.0.1` (keep fixed)

## Verified Extended UI integration

Reference is the user's `saves\mods\salivionextended-ui.zip`, internal mod name `extended-ui`, particularly `scripts/ui/other/schematics-table-ui.js`.

- Global update integration: `global.eui.registerUpdate(fn)`.
- Rebuild API: `global.eui.schematicsTableUI.rebuildTable()`.
- HUD table name: `eui-schematics-table`.
- EUI destroys/recreates the table on rebuild; slot-button objects are replaced. The add-on compares object identities and binds each new set.
- Table structure: outer table -> wrapped child table -> category-button table at child index 0, category label at index 1, schematic-button table at index 2.
- Category count equals configured `eui-SchematicsTableColumns`; slot count is `eui-SchematicsTableRows * eui-SchematicsTableColumns`. Default grid: 4 rows by 5 columns.
- EUI puts its table at the back of the HUD group; keep the separate MOVE control brought to front while the table is visible.
- Slot key format: `schematic<category>.<column>.<row>`. Custom image key is the slot key plus `image`.
- Normal slot action calls `Vars.control.input.useSchematic(schematic)`.
- Desktop right-click opens EUI slot editing; mobile uses its existing double-tap behavior.

## Working implementation in `scripts/main.js`

- `ClientLoadEvent` checks for `global.eui.registerUpdate`, creates a separate text button labeled **MOVE** (`Styles.defaultt`), and registers the update callback.
- The pencil icon seen on empty EUI slots is not a reliable move-mode indicator; keep the clear text label unless user requests otherwise.
- The update callback finds `eui-schematics-table`, reads the actual EUI layout, verifies category/slot counts, and attaches a capture `InputListener` directly to each schematic slot button.
- Category buttons receive no listener from this mod. In move mode, left-button touch-down on a slot is consumed and touch-up selects/moves that slot. With move mode disabled, the listener returns false, allowing EUI's ordinary click behavior to run.
- A selected source is represented by `{key, name}` and the selected slot is highlighted. Category selection is resolved from the live category buttons when the next slot is clicked, supporting cross-category moves.
- Replacing an occupied destination is done only in the confirm callback. The operation checks that source and destination settings have not changed, transfers custom image settings, clears the source, and calls EUI's exported rebuild function.
- EUI update callbacks can swallow errors in its central loop; retain the add-on's prefixed `Log.err` handling and DEBUG stage logs while the user is still validating behavior.
- The working direct-slot-listener approach replaced an earlier table-level coordinate hit-test. Do not revert to table-parent coordinate hit testing without a specific reason.

## Debugging notes

Useful current script log messages are prefixed `[Drag from Scheme Table]`, including:
- `Script evaluated. Version 1.0.1.`
- `ClientLoadEvent received.`
- `Loaded v1.0.1.`
- `Bound N schematic slots.`
- `Move mode ON` / `Move mode OFF`
- `touchDown captured on slot N`
- `Slot click: schematic...`
- `Moved schematic... -> schematic...`
- `UI update failed: ...` or `Client load setup failed: ...`

The user has confirmed functional success, so treat runtime functionality as working. If a future regression is reported, fix the current code directly and use logs/source as helpful evidence; do not imply the user has not tested it.

## Validation and future edits

- Prior development checks: `node --check scripts\main.js`; mock interaction coverage for direct slot capture, category pass-through, selection, cross-category replacement confirmation, custom-image transfer, source clearing, rebuild/rebinding, and normal-mode pass-through.
- Mock tests are useful but not a replacement for in-game verification.
- Only modify files in this project folder. Keep package ZIP synchronized with source after changes. Do not create zip files of this mod.
- Do not change the version from 1.0.1.
