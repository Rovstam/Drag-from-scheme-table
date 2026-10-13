# Drag from Scheme Table — Project Status

## Current scope

- Keep this mod as a Mindustry script mod; users should not need to build or install a JAR.
- Preserve the working table-to-table schematic move behavior, including the MOVE toggle, selection, highlighting, cross-category support, swap confirmation, custom-image transfer, and Extended UI rebuild integration.
- Keep the user workflow to installing one mod package and using it. Prefer script-only; if Java ever becomes necessary, package it inside the same mod archive rather than requiring a separate JAR install.
- Never modify or replace the base-game schematic dialog or any other mod. Attach to its live UI actors and preserve ordinary behavior.
- The current mod identity is **Schematic table QoL**, version `1.0.2`.
- Keep existing `drag-scheme-table.*` preference keys and `[Drag from Scheme Table]` log labels unchanged.
- Keep all project edits inside this mod folder. Do not modify Mindustry, Extended UI, or any other mod.

## Implemented features

### Swap confirmation preference

The confirmation popup offers a persistent "Don't show this again" preference, also configurable in Extended UI settings.

### Dragging while moving

With **Enable visual schematic dragging** enabled, dragging a schematic onto an empty slot moves it; dropping on an occupied slot uses the existing confirmation flow. Releasing outside a slot does nothing. With the setting disabled, drag gestures do nothing and click-to-select/click-to-move remains available.

### Dragging from the schematic library

Implemented in `scripts/main.js`: the script scans the live schematic dialog for card images, attaches a capture listener to each card without replacing base-game UI, and starts a drag after a stationary 0.4-second hold. It hides the library, follows the pointer with a schematic preview, resolves a live EUI slot, and inserts or confirms replacement. The table's stored custom image remains attached to its slot. The user confirmed this feature works in game.

## Packaging

The active manifest is script-only: `main: "scripts/main"`, `java: false`, and `script: true`. `scripts/main.js` is the entry point. Do not add a Java build or JAR installation step.

The JavaScript's use of Rhino `JavaAdapter` to implement Arc input listeners is normal script-mod interop and does not make the project a Java/JAR mod.

## Validation

- Run script syntax checks, such as `node --check scripts\main.js`, and focused tests when available.
- In-game verification is still necessary for UI behavior. Report clearly which checks were run and do not claim runtime success without testing in Mindustry.
