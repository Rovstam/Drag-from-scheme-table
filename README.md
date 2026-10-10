# Drag from Scheme Table

This script mod adds schematic rearranging to Salivion's Extended UI schematic table.

## Install

Mindustry loads mods from the user data `mods` folder, not from the Steam installation's `saves\mods` folder. Import `Drag-from-scheme-table.zip` from this folder using **Settings > Mods > Import > File**, then enable **Drag from Scheme Table** and **Extended UI** and restart.

## Use

1. Click the **MOVE** button attached to the schematic table's upper-left edge, above its other buttons, to enable move mode.
2. Click a populated slot, then click the destination slot.
3. Confirm before replacing a populated destination.
4. Click **MOVE** again to return to normal schematic-use behavior.

Moves preserve a slot's custom image. The source slot is cleared after a successful move. Clicking the selected source again cancels the move. Ordinary table clicks are unchanged while move mode is off.

The selected slot is highlighted. You can switch category tabs while a slot is selected to move a schematic across categories. Debug logging is on; check the Mindustry log for `[Drag from Scheme Table]` messages if a stage fails.
