# Drag from Scheme Table — Agent Context

## Current decision and scope

This Mindustry script mod extends Salivion's Extended UI schematic table. The user wants users to install one mod and use it, with no separate JAR installation or code/build steps. Prefer a script-only implementation; never modify the base game or another mod.

- Keep delivery to one installable mod package. If a future technical blocker genuinely requires Java, package the compiled class inside the same mod archive; never ask users to install a separate JAR or inspect code.
- Library-to-table dragging is being implemented in the existing script, without patching/replacing the base-game dialog. Preserve its ordinary actions and child controls.
- Preserve the existing table-to-table behavior and keep version `1.0.1` unless the user explicitly authorizes a version change.
- Edit only this mod folder. Mindustry source may be read as reference, but do not modify Mindustry, Extended UI, or another mod.
- Distinguish source-confirmed facts from unverified runtime behavior.

## Project structure

- Runtime entry point: `scripts/main.js`
- Manifest: `mod.hjson`
- Strings: `bundles/bundle.properties`
- The manifest is script-only: `main: "scripts/main"`, `java: false`, and `script: true`.
- There is no Java source tree or Gradle build setup in the active project.
- `JavaAdapter` in the JavaScript source is Rhino interop for implementing Arc listener interfaces. It does not require a project JAR.
- Preserve the mod version `1.0.1` and the `extended-ui` dependency.

## Existing feature behavior to preserve

- A separate **MOVE** toggle enables table move mode.
- In move mode, clicking a populated slot selects/highlights it; clicking another slot moves the schematic.
- Cross-category moves are supported; category buttons remain clickable.
- Occupied destinations use confirmation. Cancellation must not change either slot.
- A move transfers the source slot's custom image setting, clears the source, and requests an EUI table rebuild.
- Outside move mode, existing EUI behavior remains unchanged.
- **Enable visual schematic dragging** enables drag/drop between table slots, with an outlined preview; off disables drag gestures while click-to-select/click-to-move remains available.
- Long-pressing a schematic library card for about 0.4 seconds starts a preview drag into the EUI table. Ordinary clicks and nested info/export/edit/delete buttons must continue to work.
- Keep prefixed error reporting and avoid silent callback failures.

## Extended UI integration notes

Prior local reference was the user's `saves\mods\salivionextended-ui.zip`, internal mod name `extended-ui`, particularly `scripts/ui/other/schematics-table-ui.js`:

- Update integration: `global.eui.registerUpdate(fn)`.
- Rebuild: `global.eui.schematicsTableUI.rebuildTable()`.
- HUD table name: `eui-schematics-table`.
- EUI rebuild destroys/recreates the table and slot buttons.
- Structure: outer table -> wrapped child table -> categories at child index 0, category label at index 1, schematic slots at child index 2.
- Slot key: `schematic<category>.<column>.<row>`; custom image key is slot key plus `image`.
- Normal slot use calls `Vars.control.input.useSchematic(schematic)`.
- Desktop right-click editing and mobile double-tap behavior belong to EUI and must remain intact.

Verify current dependency APIs against the installed Extended UI source before changing its settings or rebuild behavior.

## Script implementation notes

- `scripts/main.js` uses direct capture `InputListener`s on live table slot buttons; do not revert to table-parent coordinate hit testing without a specific reason.
- It rebinds when EUI replaces slot buttons by comparing object identities.
- It uses live category state to support cross-category moves.
- Stale source/destination settings are checked before writing.
- The script is the complete mod entry point; keep packaging and user instructions script-only.
- Library-card integration must bind only to live actors, tolerate the dialog rebuilding its cards, and log reflection or update failures explicitly.
- Library insertion writes the schematic name into the destination EUI setting, preserves the slot's custom image setting, confirms replacement when occupied, and refreshes the table after insertion.

## Validation

- Use available script syntax checks such as `node --check scripts\main.js` and focused interaction tests.
- Runtime behavior, especially pointer tracking after hiding the modal library dialog, requires in-game testing. Do not claim runtime success based only on syntax checks.
