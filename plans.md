# Schematic table QoL — Current Work Plan

## Active goal: eliminate library-drag performance regression

The vanilla schematic-library-to-Extended-UI-table drag feature now works in-game, but causes a severe performance hit while using the library. The next task is a focused performance investigation and fix that retains the working drag behavior and leaves all table MOVE, swap, preview, and click behavior unchanged.

## Current behavior and diagnosis

- Library cards are discovered recursively and receive a capture listener directly on their card button.
- The schematic pane is rescanned after it opens and after vanilla pane rebuilds (including search/tag and resize rebuild paths), not by a fixed-interval idle scanner.
- A per-press candidate is polled only while the user is holding a card. After the hold threshold, the preview follows the pointer and the vanilla library closes.
- Runtime behavior has been confirmed by the user. The remaining problem is a severe performance hit; its source has not yet been measured or isolated.

## Performance-fix requirements

1. Reproduce and measure the performance hit with the vanilla library open, distinguishing idle browsing, card press/hold, active preview movement, and library rebuilds.
2. Profile or instrument only the library-drag code paths to identify the actual expensive recurring work before changing them.
3. Optimize the measured bottleneck without replacing the proven direct-card press detection with speculative event targeting.
4. Avoid repeated full-tree scans, redundant hit-tests, reflection, allocations, and logging in frame/update paths where they are not required.
5. Preserve card click behavior and nested info/export/edit/delete controls.
6. Preserve drag hold and movement thresholds, preview lifecycle, pointer release/drop behavior, occupied-slot confirmation, cancellation, and table refresh.
7. Keep the existing Extended UI table-to-table MOVE, swap, and custom-image behavior untouched.
8. Verify normal clicks, nested controls, hold-to-drag, empty and occupied drops, cancellation, search/tag/resize rebuilds, and table MOVE regressions in-game.
9. Remove temporary diagnostics or gate them behind the existing debug switch after profiling.

## In-game verification checklist

1. Open the vanilla schematic library with the Extended UI table enabled and record performance with no input.
2. Click a schematic normally; it must still be used as vanilla behavior dictates.
3. Use nested info, export, edit, and delete/workshop controls; none should start a drag.
4. Hold a card still for about 0.4 seconds; confirm the preview appears and the library hides only when dragging starts.
5. Drop onto an empty slot and verify insertion and table refresh.
6. Drop onto an occupied slot and test both confirming and cancelling replacement.
7. Move beyond the movement threshold before the hold completes or release outside the table; confirm no insertion.
8. Search/filter the library and repeat the drag after pane rebuilds.
9. Re-test table-to-table click moves, visual drag, cross-category moves, swap cancellation, and custom-image preservation.
10. Compare performance after the fix across idle browsing, holding, active drag, and rebuild scenarios.

## Constraints

- Keep `mod.hjson` and the script mod packaging model unchanged unless the user explicitly asks otherwise.
- Do not modify Mindustry, Arc, Extended UI, or any other mod.
- Do not restore periodic full-dialog scanning as a workaround.
- Do not claim a performance fix until the user confirms the regression is resolved in-game.
- Report syntax checks separately from measured and in-game/runtime verification.
