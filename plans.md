# Schematic table QoL — Current Work Plan

## Active goal: remove the library-open performance hit

The vanilla schematic-library-to-Extended-UI-table drag feature now works in-game. The suspected performance hit occurs immediately after opening the vanilla schematic library. Investigate and optimize that open-time path first, retaining working library drag and leaving all table MOVE, swap, preview, and click behavior unchanged.

## Current behavior and diagnosis

- Previous working implementation discovered library cards with a full recursive scan after the dialog opened and after pane rebuilds, then attached a capture listener to each card.
- The current optimization removes that open/rebuild scan and per-card listener setup. A single capture listener on the dialog uses Arc's `InputEvent.targetActor` ancestry to locate the pressed card and searches only that card for its schematic image. The schematic field is reflected lazily and cached.
- The matching local Arc source confirms `targetActor` is the original event target during ancestor capture. The new runtime path has not yet been confirmed in-game.
- The old scan/listener setup is a plausible cause of the previously observed opening hitch, but its cost was not measured or isolated from vanilla dialog/card construction.
- A per-press candidate is polled only while the user is holding a card. After the hold threshold, the preview follows the pointer and the vanilla library closes.
- The previous direct-card implementation's drag behavior was confirmed by the user. Test the new event-target implementation before considering the feature preserved. Do not assume the open-time scan explains a slowdown that continues after opening without input; measure open, idle, rebuild, and active-drag behavior separately.

## Performance-fix requirements

1. Compare opening performance with and without the mod; distinguish the open transition from idle browsing, card press/hold, active preview movement, and later pane rebuilds.
2. Runtime-test the current on-demand target-actor path. If detection fails, inspect runtime event targets before choosing a fallback.
3. Measure/profile the old full scan against the new open path where practical; distinguish mod work from vanilla library construction.
4. If on-demand identification is unreliable, consider bounded/incremental binding that avoids a synchronous full scan on the opening frame. Keep direct per-card binding as the known-working behavior reference until an alternative passes runtime tests.
5. Do not reintroduce recurring or open-time full-tree scans. Avoid redundant hit-tests, reflection, allocations, and logging in hot paths where not required.
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
