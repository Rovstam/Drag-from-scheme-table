# Schematic table QoL — Current Work Plan

## Active goal

Reduce lag in the vanilla schematic library while retaining the library-to-Extended-UI-table drag feature. Preserve all existing table-to-table MOVE functionality.

## Changes currently in `scripts/main.js`

- Removed the recurring 200 ms recursive scan of the vanilla schematic dialog and per-card listener registration.
- Replaced discovery with one non-consuming capture listener on the vanilla schematic dialog. On press, it hit-tests the current pointer once and resolves the containing schematic-card button/image.
- Keep pointer polling only while a press is being considered as a drag; remove the updater on release or cancellation.
- The card hit-test correction is syntax-checked but not yet confirmed in-game.

## In-game verification checklist

1. Open the vanilla schematic library while the EUI schematic table is enabled. Confirm browsing no longer causes the prior lag.
2. Click a schematic normally; it must still be used as vanilla behavior dictates.
3. Use nested info, export, edit, and delete/workshop controls; none should start a drag.
4. Hold the card without moving for about 0.4 seconds; confirm the preview appears and the library hides only once drag begins.
5. Drop onto an empty slot; confirm insertion and table refresh.
6. Drop onto an occupied slot; confirm the replacement prompt, then test accept and cancel.
7. Cancel by moving beyond the movement threshold before the hold completes, or release outside the table; confirm no insertion.
8. Search/filter the library and repeat the drag to ensure current card actors are recognized after the vanilla UI rebuilds.
9. Re-test table-to-table click moves, visual drag, cross-category moves, swap cancellation, and custom-image preservation.

## Constraints

- Keep `mod.hjson` and the script mod packaging model unchanged unless the user explicitly asks otherwise.
- Do not modify Mindustry, Arc, Extended UI, or any other mod.
- Do not restore periodic full-dialog scanning as a workaround; diagnose press-time actor/card discovery if needed.
- Report syntax checks separately from in-game/runtime verification.
