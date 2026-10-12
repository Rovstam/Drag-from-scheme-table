# Drag from Scheme Table — Agent Context

## User request and hard scope

This Mindustry mod extends Salivion's Extended UI schematic table. The user confirmed the existing table-to-table feature works. The user now wants to investigate adding a Java implementation for dragging schematics from the vanilla library into the EUI table.

Hard constraints:
- Edit only files inside this mod folder.
- Mindustry source may be read as a reference, but never modify it.
- Do not edit Extended UI or any other mod.
- Do not replace, rewrite, or patch the base-game schematic dialog.
- Preserve existing table-to-table behavior.
- Never change the version from `1.0.1` without explicit user permission.
- When planning, distinguish source-confirmed facts from unverified runtime behavior. Do not claim the new Java/library feature works until built and tested.

## Project paths and packaging

- Editable folder: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\saves\mods\Drag from scheme table`
- Existing table script: `scripts\main.js`
- Manifest: `mod.hjson`
- Strings: `bundles\bundle.properties`
- Existing manifest version and script version: `1.0.1`.
- Local Mindustry source reference: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\Mindustry-160.5`
- Suggested local mod: `C:\Program Files (x86)\Steam\steamapps\common\Mindustry\saves\mods\zipextract\SchematicParse-4.6.0`

## Existing feature behavior to preserve

- A separate **MOVE** toggle enables table move mode.
- In move mode, clicking a populated slot selects/highlights it; clicking another slot moves the schematic.
- Cross-category moves are supported; category buttons remain clickable.
- Occupied destinations use confirmation. Cancellation must not change either slot.
- A move transfers the source slot's custom image setting, clears the source, and requests an EUI table rebuild.
- Outside move mode, existing EUI behavior remains unchanged.
- **Enable visual schematic dragging** enables drag/drop between table slots, with an outlined preview; off disables drag gestures while click-to-select/click-to-move remains available.
- `Styles.selecti` preview outline is acceptable but provisional.

## Current manifest problem — resolve before Java feature implementation

The current `mod.hjson` declares:
- `java: true`
- `script: false`
- `main: "scripts/main"`

The project currently has no Java source tree or Gradle build configuration, and the only entry-point code is `scripts/main.js`. Mindustry's Java mod loader interprets `main` as a fully qualified Java class name when Java loading is enabled. `scripts/main` is not such a class. A manifest toggle does not convert JavaScript into Java, so this configuration cannot load a Java entry point as intended.

Before implementing Java UI work:
1. Add Java sources, build configuration, and a `mindustry.mod.Mod` subclass.
2. Point `main` at that class's fully qualified name.
3. Retain and package `scripts/main.js`; verify the engine loads the script alongside the Java mod.
4. Keep version `1.0.1`.

## Mindustry and SchematicParse source findings

Inspected local Mindustry 160.5 source:
- `core/src/mindustry/ui/dialogs/SchematicsDialog.java`
- `core/src/mindustry/ui/dialogs/BaseDialog.java`
- `core/src/mindustry/game/Schematic.java`
- `core/src/mindustry/mod/Mods.java`
- `core/src/mindustry/mod/Mod.java`

Findings:
- The vanilla schematic library is `ui.schematics`, a `SchematicsDialog` extending `BaseDialog`.
- `SchematicsDialog.setup()` constructs library cards dynamically; filter/search changes rebuild the card actors.
- Each card contains a `SchematicsDialog.SchematicImage`. The image's `schematic` field is private in the inspected version.
- The dialog is modal, but its widgets are normal scene actors. A Java mod can investigate/extend the existing dialog; replacing it is not established as necessary and is out of scope.
- Existing library behavior includes card click to use schematic (during game), info in menu, and child controls for info/export/edit/delete or workshop. Any new listener must preserve these.
- `Schematic.labels` is a `Seq<String>`. Do not expect typed/non-string tags.

Suggested local SchematicParse 4.6.0:
- Its manifest uses `main: "sp.SchematicParse"` and `java: true`.
- Its Java class extends `Mod`, adds buttons to `ui.schematics`, and reflects private fields including the dialog's info field.
- It modifies the existing vanilla dialog rather than replacing it.
- It adds no library-card drag behavior. Its build targets Mindustry 154.2, so it is a pattern, not a version-matched dependency or guaranteed compatible implementation.

Version caution:
- This mod declares `minGameVersion: 158.1`, but the local source inspected is Mindustry 160.5. Confirm target/runtime version and APIs before coding compatibility-sensitive behavior.

## Proposed Feature 3: library-to-table drag

Treat this as a staged prototype, not a confirmed working feature:

1. Repair Java entry point/build setup.
2. Locate live schematic card buttons/images from `ui.schematics`; associate each with its `Schematic`. Rebind whenever the dialog rebuilds cards. Isolate and log any reflection failure needed to access the private schematic field.
3. Prototype distinguishing ordinary click from long-press/drag while preserving ordinary click and child buttons.
4. On drag start, hide the modal library dialog and show a pointer-following preview.
5. Confirm pointer/touch movement and release still arrive after hiding the dialog. Matching Arc touch-focus behavior was not locally verified; test desktop and mobile. If input tracking fails, stop and choose another supported design; do not replace the vanilla dialog.
6. Bridge the library schematic from Java to existing table logic using a clear event/shared-state boundary.
7. Keep the existing direct slot-button listener pattern in `scripts/main.js`. Implement a separate library insertion operation; existing table move logic requires a populated source slot and is not reusable unchanged.
8. Resolve a live destination slot. Empty slot inserts; occupied slot asks confirmation, with cancel leaving it untouched. Handle dialog restoration/cancel cleanly.
9. Verify EUI destination storage, custom image semantics, and rebuild API against the actual installed Extended UI source before changing settings.

### Icon-tag plan

- Labels are strings. Recognize supported icon labels from encoded string forms, not runtime types.
- SchematicParse's local source uses icon-code strings and content emoji strings for icon tags; verify exact supported encoding against target game before use.
- One recognized icon tag: use for temporary preview and table icon only if the EUI slot format supports it.
- Multiple recognized icons: ask the user to choose.
- Define fallback when no recognized icon tag exists. Emoji rendering may be deferred.
- Do not write arbitrary labels into EUI image settings without confirming the expected format.

### Rename

The earlier requested display name is "Schematic table QoL". Confirm whether this means display name only or internal mod identity too. If internal name changes, preserve/migrate `drag-scheme-table.*` settings. Keep the EUI dependency ID `extended-ui`.

## Verified Extended UI integration

Prior local reference was the user's `saves\mods\salivionextended-ui.zip`, internal mod name `extended-ui`, particularly `scripts/ui/other/schematics-table-ui.js`:
- Update integration: `global.eui.registerUpdate(fn)`.
- Rebuild: `global.eui.schematicsTableUI.rebuildTable()`.
- HUD table name: `eui-schematics-table`.
- EUI rebuild destroys/recreates the table and slot buttons.
- Structure: outer table -> wrapped child table -> categories at child index 0, category label at index 1, schematic slots at child index 2.
- Slot key: `schematic<category>.<column>.<row>`; custom image key is slot key plus `image`.
- Normal slot use calls `Vars.control.input.useSchematic(schematic)`.
- Desktop right-click editing and mobile double-tap behavior belong to EUI and must remain intact.

The installed Extended UI source was not inspected in the most recent Feature 3 planning review. Re-verify APIs, settings format, and dependency version before adding library insertion/icon writes.

## Existing script implementation notes

- `scripts/main.js` uses direct capture `InputListener`s on live table slot buttons; do not revert to table-parent coordinate hit testing without a specific reason.
- It rebinds when EUI replaces slot buttons by comparing object identities.
- It uses live category state to support cross-category moves.
- Stale source/destination settings are checked before writing.
- The current script is already in the folder and should remain part of a Java-enabled package unless an explicit migration decision says otherwise.
- Keep prefixed error reporting and avoid silent callback failures.

## Validation requirements

Prior checks for the existing script included `node --check scripts\main.js` and mock interaction coverage for slot capture, selection, category pass-through, cross-category confirmation, image transfer, source clearing, rebuild/rebinding, and normal-mode pass-through. Preserve these existing checks where available.

For the Java/library feature:
- No build or in-game test has been performed as part of the source review.
- Matching Arc source/touch-focus behavior is not locally verified.
- Mindustry 158.1 compatibility is not established by the 160.5 source review.
- Verify Java and script load from the final package.
- Test normal clicks, long press, dialog/filter rebuilds, release after hide, empty/occupied destinations, cancel, categories, icon cases, desktop/mobile, and regression of existing table moves.
- Never claim runtime success before in-game verification.
