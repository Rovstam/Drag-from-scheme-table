Follow-up — Preview outline: The current `Styles.selecti` outline is acceptable for now, but is provisional. Refine its appearance toward the user's intended outline only when they provide or request the next visual adjustment.

Versioning: Keep `mod.hjson` and `scripts/main.js` at version 1.0.1. Never change either version unless the user explicitly asks.

Feature 3: `Allow dragging from schematic library to insert into Schematic table
Click, Hold for a certain ammount of time, close the Schematic library Ui, make the selected schematic Display it's content and when it approaches schematic table, reduce it's icon to a temporary tag (the first non string tag it has, such as "Silicon")

With these changes, rename the mod entirely to "Schematic table QoL". If the base game can't be manouvered so dependencies of Shematic library Ui don't break, stop and say why. Base game CANNOT BE CHANGED, REWRITTEN OR MODIFIED UNDER ANY CIRCUMSTANCE, since Schem tabe from Extended Ui probably (correct me if wrong), needs it. This feature has to work above the source code, adding on top of Vanilla, NEVER changing it.

Input handling such as Icon is still unknown, translation from Tags into Icons must be handled. Attempt to override Schem table icon if the schematic has 1 single tag from Mindustry's tag system that is not a string (example, the schematic has a lot of string names, and only one is an icon, then, use that icon for the Table's icon. If it's an emoji... We'll deal with that later, because Table doesn't use emojis. I guess just treat it as a string, so it gets "ignored"), if more, prompt the user "Which tag do you want to use as the Schematic icon?"

User suggestion: "you just need to get all the buttons and add listener to them". This suggestion is confusing, so don't take it as an important one`

------------------

Feature 1 (Done) — Swap confirmation preference: Implemented. The confirmation popup has a persistent "Don't show this again" option, also configurable in Extended UI settings.

Feature 2 (Done)— Dragging while moving: Implemented. With **Enable visual schematic dragging** on, dragging a schematic onto an empty slot moves it; dropping on an occupied slot uses the existing confirmation flow. Releasing outside a slot does nothing. With the setting off, drag gestures do nothing and click-to-select/click-to-move remains available.