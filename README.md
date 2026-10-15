# Schematic table QoL

This script mod adds schematic rearranging to Salivion's Extended UI schematic table.

## Version 1.0.3

- Fixed library-card press detection so the library-to-table drag feature works.
- Known issue: using the vanilla schematic library can cause a severe performance hit. A focused optimization is still needed; existing table MOVE and swap behavior is unaffected.

## Use

1. Click the **MOVE** button.
<img width="428" height="443" alt="image" src="https://github.com/user-attachments/assets/1e44d543-91a8-4875-bbaf-6d93f63e6adb" />

2. Click a populated slot, then click the destination slot.


https://github.com/user-attachments/assets/3ab606bc-a216-4b56-b3a4-97b2b77aa0e8



3. If the destination is occupied, confirm the swap in the popup.
4. Click **MOVE** again to return to normal schematic-use behavior.

Moves preserve a slot's custom image. Empty destinations receive a move and leave the source empty; occupied destinations are swapped after confirmation. Use **Settings > Extended UI > Skip schematic swap confirmations** to persistently control the confirmation popup. Dismissing the swap popup without confirming clears the selected schematic. Clicking the selected source again cancels the move. Ordinary table clicks are unchanged while move mode is off.

In MOVE mode, hold and drag a schematic to see an outlined floating preview. Drop it on an empty slot to move it, or on an occupied slot to open the swap confirmation. Dropping outside the schematic slots leaves everything unchanged.

The selected slot is highlighted. You can switch category tabs while a slot is selected to move a schematic across categories. Debug logging is on; check the Mindustry log for `[Drag from Scheme Table]` messages if a stage fails.

## Insert from the schematic library

While in a game with the Extended UI schematic table enabled, press and hold a schematic card in the library without moving for about 0.4 seconds. When the library closes and its preview follows the pointer, drag it onto a table slot. Empty slots receive the schematic; occupied slots ask for confirmation. Releasing outside a table slot leaves the table unchanged. The library's ordinary click, info, export, edit, and delete actions are left available.

**Performance note:** The library-drag feature currently causes a severe performance hit in the vanilla schematic library. This is a known issue and is the next optimization goal. The table MOVE and swap features continue to work normally.

**Enable visual schematic dragging** in **Settings > Extended UI** controls both table-to-table dragging and library insertion. When disabled, table click-to-select/click-to-move continues to work.

The mod remains a script mod; install the mod once and no separate JAR or build step is required.
