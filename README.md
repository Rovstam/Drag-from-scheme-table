# Drag from Scheme Table

This script mod adds schematic rearranging to Salivion's Extended UI schematic table.

## Use

1. Click the **MOVE** button.
<img width="1363" height="768" alt="image" src="https://github.com/user-attachments/assets/4d1773eb-cb2a-410e-9793-c6699fec0490" />
3. Click a populated slot, then click the destination slot.
https://github.com/user-attachments/assets/3d725d9b-3f1e-4fe6-b934-eb0cbfce090d
5. Confirm before replacing a populated destination.
6. Click **MOVE** again to return to normal schematic-use behavior.

Moves preserve a slot's custom image. The source slot is cleared after a successful move. Clicking the selected source again cancels the move. Ordinary table clicks are unchanged while move mode is off.

The selected slot is highlighted. You can switch category tabs while a slot is selected to move a schematic across categories. Debug logging is on; check the Mindustry log for `[Drag from Scheme Table]` messages if a stage fails.
