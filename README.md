# Drag from Scheme Table

This script mod adds schematic rearranging to Salivion's Extended UI schematic table.

## Use

1. Click the **MOVE** button.
<img width="428" height="443" alt="image" src="https://github.com/user-attachments/assets/1e44d543-91a8-4875-bbaf-6d93f63e6adb" />

2. Click a populated slot, then click the destination slot.
https://github.com/user-attachments/assets/3d725d9b-3f1e-4fe6-b934-eb0cbfce090d

3. If the destination is occupied, confirm the swap in the popup.
4. Click **MOVE** again to return to normal schematic-use behavior.

Moves preserve a slot's custom image. Empty destinations receive a move and leave the source empty; occupied destinations are swapped after confirmation. Use **Settings > Extended UI > Skip schematic swap confirmations** to persistently control the confirmation popup. Dismissing the swap popup without confirming clears the selected schematic. Clicking the selected source again cancels the move. Ordinary table clicks are unchanged while move mode is off.

In MOVE mode, hold and drag a schematic to see an outlined floating preview. Drop it on an empty slot to move it, or on an occupied slot to open the swap confirmation. Dropping outside the schematic slots leaves everything unchanged. Disable **Enable visual schematic dragging** in **Settings > Extended UI** to turn off drag-and-drop; click-to-select and click-to-move remain available.

The selected slot is highlighted. You can switch category tabs while a slot is selected to move a schematic across categories. Debug logging is on; check the Mindustry log for `[Drag from Scheme Table]` messages if a stage fails.
