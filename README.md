# Drag from Scheme Table

This script mod adds schematic rearranging to Salivion's Extended UI schematic table.

## Use

1. Click the **MOVE** button above the schematic table to enable move mode.
2. Click a populated slot, then click the destination slot.
3. Confirm before replacing a populated destination.
4. Click **MOVE** again to return to normal schematic-use behavior.

Moves preserve a slot's custom image. The source slot is cleared after a successful move. Clicking the selected source again cancels the move. Ordinary table clicks are unchanged while move mode is off.

The selected slot is highlighted. You can switch category tabs while a slot is selected to move a schematic across categories. Debug logging is on; check the Mindustry log for `[Drag from Scheme Table]` messages if a stage fails.
