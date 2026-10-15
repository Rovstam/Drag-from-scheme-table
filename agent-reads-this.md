# Schematic table QoL — Agent Context

## Scope and constraints

- This is a script-only Mindustry mod extending Salivion's Extended UI schematic table. Keep the install workflow to one mod package; do not add a Java build or separate JAR requirement.
- Preserve the existing table-to-table move behavior, settings keys, and `[Drag from Scheme Table]` log prefix.
- Do not modify Mindustry, Extended UI, or any other mod. Mindustry and Arc source may be read as references.
- Distinguish source-confirmed behavior from runtime behavior that has not been tested.

## Project structure

- Entry point: `scripts/main.js`
- Manifest: `mod.hjson`, currently version `1.0.2`, `java: false`, `script: true`, dependency `extended-ui`.
- `JavaAdapter` in `main.js` is Rhino interop for Arc listeners and does not imply a Java build.

## Existing functionality to preserve

- MOVE mode selects/highlights a populated table slot, then moves it to another slot; cross-category moves are supported.
- Occupied destinations use confirmation; cancellation leaves the slots unchanged.
- Moves transfer the source slot's custom image setting, clear the source as appropriate, and rebuild the EUI table.
- Visual table-to-table dragging can be disabled while click-to-select/click-to-move remains available.
- The vanilla-library-to-table feature uses a stationary hold of about 0.4 seconds, then shows a pointer-following preview. Empty destinations insert; occupied destinations ask for confirmation; drops outside the table do nothing.
- Preserve normal vanilla schematic-card clicks and nested info/export/edit/delete controls.

## Current library-drag implementation and performance change

- The previous implementation recursively scanned the vanilla schematic dialog every 200 ms while it was open and bound listeners to discovered schematic cards.
- That recurring full-dialog scan and its array/map bookkeeping have been removed.
- The current script installs one non-consuming capture listener on `Vars.ui.schematics`. At press time it hit-tests once, walks up the actor hierarchy to find a card button containing a `SchematicsDialog.SchematicImage`, and reads that image's private `schematic` field.
- A per-frame updater is created only while a card press is a drag candidate, then removed when the candidate ends or is cancelled.
- The latest hit-test correction has passed script syntax and diff checks, but library dragging and normal card interactions still require in-game verification. Do not claim the regression is runtime-fixed until confirmed.
- Avoid reintroducing recurring dialog scans. If card identification fails, inspect the actual hit actor/card hierarchy and logs first.

## Extended UI integration

The inspected Extended UI copy is the user's `saves\mods\zipextract\Salivion-Extended-UI-54ad91f` (internal mod name `extended-ui`):

- The table is named `eui-schematics-table`; its direct settings keys use `schematic<category>.<column>.<row>` and append `image` for custom images.
- EUI exposes `global.eui.registerUpdate(fn)` and `global.eui.schematicsTableUI.rebuildTable()`.
- The live structure is outer table -> wrapped table -> categories at child 0, label at child 1, slots at child 2.
- EUI rebuilds the table and slot actors. The mod binds direct capture listeners to live slot buttons and rebinds when their identities change.
- Normal slot use calls `Vars.control.input.useSchematic(schematic)`. Preserve EUI's right-click edit and mobile double-tap behavior.

## Reference sources

- Local Mindustry source: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\Mindustry source code and Libraries\Mindustry-160.7`
- Matching Arc source: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\Mindustry source code and Libraries\Arc-7445105cd2683daf5b9ac7033ebb07265d3e814d`
- The user's installed game build may differ; check the game log header when exact runtime compatibility matters.

## Verification

- Run `node --check scripts\main.js` and `git diff --check` for script changes.
- UI behavior requires in-game testing. For library drag, test normal card use; nested controls; search/filter rebuilds; hold threshold; empty and occupied table destinations; cancellation; and release outside the table. Also re-test table-to-table move behavior.
- Never claim runtime success from syntax checks alone.
