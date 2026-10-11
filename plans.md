Follow-up — Preview outline: The current `Styles.selecti` outline is acceptable for now, but is provisional. Refine its appearance toward the user's intended outline only when they provide or request the next visual adjustment.

Versioning: Keep `mod.hjson` and `scripts/main.js` at version 1.0.1. Never change either version unless the user explicitly asks.

------------------

Feature 1 (Done) — Swap confirmation preference: Implemented. The confirmation popup has a persistent "Don't show this again" option, also configurable in Extended UI settings.

Feature 2 (Done)— Dragging while moving: Implemented. With **Enable visual schematic dragging** on, dragging a schematic onto an empty slot moves it; dropping on an occupied slot uses the existing confirmation flow. Releasing outside a slot does nothing. With the setting off, drag gestures do nothing and click-to-select/click-to-move remains available.