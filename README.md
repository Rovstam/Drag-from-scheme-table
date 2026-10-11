# Drag from Scheme Table

This script mod adds schematic rearranging to Salivion's Extended UI schematic table.

## Use

1. Click the **MOVE** button.
<img width="428" height="443" alt="image" src="https://github.com/user-attachments/assets/1e44d543-91a8-4875-bbaf-6d93f63e6adb" />

2. Click a populated slot, then click the destination slot.


https://github.com/user-attachments/assets/3ab606bc-a216-4b56-b3a4-97b2b77aa0e8



3. If the destination is occupied, confirm the swap in the popup.
4. Click **MOVE** again to return to normal schematic-use behavior.

Moves preserve a slot's custom image. Empty destinations receive a move and leave the source empty; occupied destinations are swapped after confirmation. Clicking the selected source again cancels the move. Ordinary table clicks are unchanged while move mode is off.

The selected slot is highlighted. You can switch category tabs while a slot is selected to move a schematic across categories. Debug logging is on; check the Mindustry log for `[Drag from Scheme Table]` messages if a stage fails.
