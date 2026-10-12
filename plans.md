# Drag from Scheme Table — Plans

## Current scope and constraints

- Preserve the working table-to-table move behavior and its existing MOVE toggle, selection, highlighting, cross-category support, swap confirmation, custom-image transfer, and EUI rebuild integration.
- The user has confirmed the existing table feature works.
- Keep all project edits inside this mod folder. Mindustry source may be read as reference, but do not modify Mindustry, Extended UI, or any other mod.
- Keep `mod.hjson` and the existing script version at `1.0.1` unless the user explicitly asks to change the version.
- Do not replace, rewrite, or modify the base-game schematic dialog.
- The current preview outline using `Styles.selecti` is acceptable but provisional.

## Feature 1 — Swap confirmation preference (Done)

The confirmation popup offers a persistent "Don't show this again" preference, also configurable in Extended UI settings.

## Feature 2 — Dragging while moving (Done)

With **Enable visual schematic dragging** enabled, dragging a schematic onto an empty slot moves it; dropping on an occupied slot uses the existing confirmation flow. Releasing outside a slot does nothing. With the setting disabled, drag gestures do nothing and click-to-select/click-to-move remains available.

## Feature 3 — Drag a schematic from the library into the EUI table (Planning)

### Feasibility and source findings

- The mod's manifest currently declares `java: true`, `script: false`, and `main: "scripts/main"`, but the project has no Java source tree or Gradle build configuration. The existing `scripts/main.js` is not a Java entry point. As currently configured, the Java loader will try to load `scripts/main` as a Java class; the manifest change alone does not create a working Java mod.
- Mindustry 160.5 creates schematic library cards dynamically inside `SchematicsDialog.setup()` and recreates them when search/tag filters change. Each card contains a `SchematicsDialog.SchematicImage`; the image's schematic field is private in the inspected source.
- The dialog is modal, but cards and images are actors in the scene graph. A Java extension can investigate those actors and attach listeners without replacing the vanilla dialog. The difficult unverified behavior is whether pointer/touch tracking can reliably continue after hiding the modal dialog during a held drag.
- Local SchematicParse 4.6.0 demonstrates extending the existing dialog: it adds buttons to `ui.schematics` and reflects private dialog fields. It does not implement dragging and targets Mindustry 154.2, so use it only as a pattern, not as version-matched code.
- `Schematic.labels` in Mindustry 160.5 is `Seq<String>`. There are no labels distinguishable by Java type as "non-string." Icon labels need to be recognized from their encoded string values (such as icon-code strings or content emoji strings).
- The inspected local engine source is Mindustry 160.5, while this mod declares `minGameVersion: 158.1`. Confirm the actual runtime target and APIs before implementation.

### Staged implementation plan

1. **Repair the mod entry point and build setup before feature work.**
   - Add a Java source tree, build configuration, and a Java class extending `mindustry.mod.Mod`.
   - Point manifest `main` to the Java class's fully qualified class name; do not point it to `scripts/main`.
   - Retain `scripts/main.js` and the existing EUI table behavior. Verify Mindustry loads both the Java entry point and scripts from the packaged mod.
   - Keep the existing version at `1.0.1`.

2. **Prototype discovery and rebinding of library cards.**
   - Extend/use `ui.schematics`; do not replace the dialog.
   - Traverse the live dialog actor tree to locate `SchematicsDialog.SchematicImage` and its containing card button, and associate each card with its `Schematic`.
   - If reflection is needed to read the image's private schematic field, isolate it and report reflective failures clearly.
   - Rebind whenever cards are rebuilt after search/tag changes; do not retain stale actor references.
   - Confirm that the listener does not break ordinary click, info, edit, export, delete, or filter behavior.

3. **Prove long-press drag tracking as a go/no-go prototype.**
   - Distinguish ordinary clicks from a long-press/drag with an explicit hold/movement threshold.
   - On drag start, hide the library dialog and display a temporary preview following the pointer.
   - Verify that release and pointer coordinates remain available after hiding the modal dialog/card; check the matching Arc behavior before relying on touch focus.
   - Test desktop mouse and mobile touch separately. If tracking is lost, stop and choose a supported alternative rather than replacing the vanilla dialog.

4. **Bridge the library drag into the EUI table.**
   - Pass the selected `Schematic` and drag state from Java to the table integration through a deliberate bridge, such as a Java event or shared Java state.
   - Keep the direct slot-button listeners and existing EUI rebuild API in `scripts/main.js`.
   - Implement a separate library-insert operation: the existing move operation requires a populated source table slot and must not be reused unchanged.
   - On release, resolve the actual live destination slot. Insert into an empty slot; for an occupied slot, confirm replacement. Cancel must leave destination settings unchanged.
   - Restore or preserve the library UI appropriately when the drag ends or is canceled.
   - Verify the destination key/category and persistence behavior against the installed Extended UI source before writing settings.

5. **Resolve icon-tag behavior.**
   - Read schematic labels as strings and recognize supported encoded icon labels; do not search for non-string labels.
   - If exactly one recognized icon label exists, use it for the temporary preview and, only if supported by EUI, the table slot image.
   - If there are multiple recognized icon labels, prompt the user to choose. Decide and document a fallback when there are none.
   - Confirm EUI's custom-image/icon setting format and valid values from the actual installed dependency before changing it.
   - Emoji support can be deferred; do not assume the table can render emoji tags.

6. **Handle the requested rename deliberately.**
   - Confirm whether "Schematic table QoL" is only the display name or also the internal mod name.
   - If changing the internal name, account for the settings namespace and preserve/migrate existing `drag-scheme-table.*` preferences.
   - Do not alter the `extended-ui` dependency name.

7. **Build, validate, then test in game.**
   - Build the Java artifact and inspect the package to confirm the entry-point class, manifest, and scripts are all present.
   - Confirm startup logs show Java and script initialization without loader or reflection errors.
   - Test normal library clicks, long-press drag, card rebuild after filtering, empty and occupied destinations, confirm/cancel, category selection, icon-label cases, and existing table-to-table behavior.
   - In-game behavior is not verified until tested in the game.

### Known verification gaps

- The local Mindustry 160.5 source and local SchematicParse 4.6.0 source were inspected; SchematicParse targets Mindustry 154.2.
- Mindustry 158.1 source was not inspected, so compatibility with the declared minimum is not established.
- Matching Arc source for the installed engine was not available locally; touch-focus continuity after hiding the dialog is not verified.
- The actual installed Extended UI source was not inspected during this planning review. Verify its slot image/settings format and current rebuild API before implementing table writes.
- No build or in-game test was run as part of the planning review.

## Current blocker

The Java manifest configuration is not a valid Java entry point until a Java class/build is added and `main` points to that class. Repair and verify this first. Afterward, the feature is viable to prototype without modifying the base game; the primary go/no-go risk is pointer tracking after the modal dialog is hidden.
