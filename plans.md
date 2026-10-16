# Schematic table QoL — Current Work Plan

## Active goal: remove the library-open performance hit

The vanilla schematic-library-to-Extended-UI-table drag feature now works in-game. The suspected performance hit occurs immediately after opening the vanilla schematic library. Investigate and optimize that open-time path first, retaining working library drag and leaving all table MOVE, swap, preview, and click behavior unchanged.

## Current behavior and diagnosis

- Library cards are discovered recursively and receive a capture listener directly on their card button.
- The schematic pane is scanned after it opens and after vanilla pane rebuilds (including search/tag and resize rebuild paths); there is no fixed-interval idle scanner.
- Opening triggers a full-tree walk, schematic-field reflection, and per-card listener setup. This is a plausible source of an opening hitch, but its cost has not been measured or isolated from vanilla dialog/card construction.
- A per-press candidate is polled only while the user is holding a card. After the hold threshold, the preview follows the pointer and the vanilla library closes.
- Library drag behavior has been confirmed by the user. Do not assume the open-time scan explains a slowdown that continues after opening without input; measure the open transition separately from idle browsing, rebuilds, and active dragging.

## Performance-fix requirements

1. Compare the opening hitch with and without the mod, and distinguish dialog-open work from idle browsing, card press/hold, active preview movement, and later pane rebuilds.
2. Measure/profile the library-drag open-time path before changing it; distinguish mod work from vanilla library construction.
3. Prefer eliminating the open-time full-tree scan by identifying a pressed schematic card on demand through a dialog-level capture listener and the actual event target/actor ancestry. This route is not yet proven reliable; previous dialog-level attempts lost drag detection, so validate the target semantics and runtime behavior before relying on it.
4. If on-demand identification is unreliable, consider bounded/incremental binding that avoids a synchronous full scan on the opening frame. Keep direct per-card binding as the known-working behavior reference until an alternative passes runtime tests.
5. Do not reintroduce recurring full-tree scans. Avoid redundant hit-tests, reflection, allocations, and logging in hot paths where not required.
6. Preserve card click behavior and nested info/export/edit/delete controls.
7. Preserve drag hold and movement thresholds, preview lifecycle, pointer release/drop behavior, occupied-slot confirmation, cancellation, and table refresh.
8. Keep the existing Extended UI table-to-table MOVE, swap, and custom-image behavior untouched.
9. Verify normal clicks, nested controls, hold-to-drag, empty and occupied drops, cancellation, search/tag/resize rebuilds, and table MOVE regressions in-game.
10. Remove temporary diagnostics or gate them behind the existing debug switch after profiling.

## In-game verification checklist

1. Measure the transition immediately after opening the vanilla schematic library with the Extended UI table enabled.
2. Click a schematic normally; it must still be used as vanilla behavior dictates.
3. Use nested info, export, edit, and delete/workshop controls; none should start a drag.
4. Hold a card still for about 0.4 seconds; confirm the preview appears and the library hides only when dragging starts.
5. Drop onto an empty slot and verify insertion and table refresh.
6. Drop onto an occupied slot and test both confirming and cancelling replacement.
7. Move beyond the movement threshold before the hold completes or release outside the table; confirm no insertion.
8. Search/filter the library and repeat the drag after pane rebuilds.
9. Re-test table-to-table click moves, visual drag, cross-category moves, swap cancellation, and custom-image preservation.
10. Compare performance after the fix at open, during idle browsing, holding, active drag, and rebuild scenarios.

## Later feature ideas

- Multi-selecting library schematics and placing a batch into the table is separate from the performance fix. Keep schematic data (`Schematic` objects) separate from card icons so a future collection of selected schematics can reuse the insertion logic.
- Before batch placement is implemented, define slot order, occupied-slot confirmation/replacement behavior, and what happens when there are more selected schematics than available slots. Never implicitly overwrite existing schematics.
- The user has also mentioned a possible remove button and final visual polish as later work. Keep those outside the current performance-fix scope.

## Constraints

- Keep `mod.hjson` and the script mod packaging model unchanged unless the user explicitly asks otherwise.
- Do not modify Mindustry, Arc, Extended UI, or any other mod.
- Do not restore periodic full-dialog scanning as a workaround.
- Do not claim a performance fix until the user confirms the regression is resolved in-game.
- Report syntax checks separately from measured and in-game/runtime verification.
