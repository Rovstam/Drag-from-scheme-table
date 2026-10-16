# Schematic table QoL — Agent Context

## Scope and constraints

- This is a script-only Mindustry mod extending Salivion's Extended UI schematic table. Keep the install workflow to one mod package; do not add a Java build or separate JAR requirement.
- Preserve the existing table-to-table move behavior, settings keys, and `[Drag from Scheme Table]` log prefix.
- Do not modify Mindustry, Extended UI, or any other mod. Mindustry and Arc source may be read as references.
- Distinguish source-confirmed behavior from runtime behavior that has not been tested.

## Project structure

- Entry point: `scripts/main.js`
- Manifest: `mod.hjson`, currently version `1.0.3`, `java: false`, `script: true`, dependency `extended-ui`.
- `JavaAdapter` in `main.js` is Rhino interop for Arc listeners and does not imply a Java build.

## Existing functionality to preserve

- MOVE mode selects/highlights a populated table slot, then moves it to another slot; cross-category moves are supported.
- Occupied destinations use confirmation; cancellation leaves the slots unchanged.
- Moves transfer the source slot's custom image setting, clear the source as appropriate, and rebuild the EUI table.
- Visual table-to-table dragging can be disabled while click-to-select/click-to-move remains available.
- The vanilla-library-to-table feature uses a stationary hold of about 0.4 seconds, then shows a pointer-following preview. Empty destinations insert; occupied destinations ask for confirmation; drops outside the table do nothing.
- Preserve normal vanilla schematic-card clicks and nested info/export/edit/delete controls.

## Current library-drag implementation and performance goal

- The old working implementation recursively scanned the vanilla schematic dialog every 200 ms while it was open and attached a capture listener to every discovered schematic card. The repeated idle scans were removed.
- Current runtime behavior has been confirmed by the user: library-card drag works, but opening/using the vanilla schematic library causes a severe performance hit.
- The current script scans the dialog content after it opens and after pane rebuild/resize events. It recursively visits the actor tree, reflects each `SchematicImage`'s private `schematic` field, and attaches a direct capture listener to each card. The open-time full-tree scan and listener setup are a plausible cause of a hitch immediately after opening; their cost has not yet been measured.
- After binding, the card listeners do not themselves poll every frame. A per-frame updater is created only after a card press becomes a drag candidate, then removed when the candidate ends or is cancelled.
- Focus the next performance investigation on work immediately after dialog open, distinguishing the open-time scan from vanilla dialog construction and later rebuilds. Do not assume the opening scan explains performance degradation that continues while idle; measure/profile before changing behavior.
- Preferred optimization direction: remove the open-time full-tree scan by identifying the pressed schematic card on demand through a single dialog-level capture listener and the actual input event target/actor ancestry. This route is not yet proven reliable in-game; previous attempts to replace direct card listeners regressed drag detection. Verify target semantics against the matching Arc source and in-game before adopting it.
- If on-demand target identification proves unreliable, consider a bounded/incremental binding strategy that avoids a synchronous full scan on the opening frame. Preserve the working direct-card detection as the behavior reference until an alternative passes runtime tests.
- Do not reintroduce recurring full-dialog scans. Preserve normal card clicks, nested info/export/edit/delete actions, hold/movement thresholds, preview, drops, confirmation, cancellation, and the existing EUI table MOVE/swap behavior.

## Future library feature: multi-select/batch insertion

- Multi-select from the vanilla library and placing multiple schematics into the EUI table is a separate future feature, not part of the immediate performance fix.
- Keep schematic data (`Schematic` objects) distinct from card icons/previews. The current drag resolves the actual schematic from `SchematicsDialog.SchematicImage`; preserve this separation if a collection of selected schematics is introduced later.
- A future batch-placement feature needs explicit rules for destination order, occupied slots and confirmation, preserving or replacing existing schematics, and what happens when the selected count exceeds available slots. Do not overwrite current slots implicitly.
- Design the current single-schematic insertion so future collection/batch handling can be added without replacing the existing one-at-a-time drag interaction or table MOVE behavior.

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
