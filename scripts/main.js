"use strict";

const rowsSetting = "eui-SchematicsTableRows";
const columnsSetting = "eui-SchematicsTableColumns";
const tableName = "eui-schematics-table";
const scriptVersion = "1.0.1";

let moveMode = false;
let selectedSlot = null;
let moveControl;
let moveButton;
let boundTable;
let attachedTable;
let boundSlotButtons = [];
let lastUpdateError;
let boundCategoryButtons = [];
let boundColumns = 5;
let waitingLogged = false;
let lastMoveAnnouncement;

const DEBUG = true;
function dbg(message) {
    if (DEBUG) Log.info("[Drag from Scheme Table] " + message);
}

function announceMoveMessage(message) {
    if (lastMoveAnnouncement != null) lastMoveAnnouncement.remove();

    const announcement = new Table(Styles.black3);
    announcement.touchable = Packages.arc.scene.event.Touchable.disabled;
    announcement.margin(8).add(message).style(Styles.outlineLabel).labelAlign(Align.center);
    announcement.update(() => {
        announcement.setPosition(Core.graphics.getWidth() / 2, Core.graphics.getHeight() / 2, Align.center);
        announcement.toFront();
        if (Vars.state.isMenu() || !Vars.ui.hudfrag.shown) announcement.remove();
    });
    announcement.actions(Actions.fadeOut(3, Interp.pow4In), Actions.remove());
    announcement.pack();
    announcement.act(0.1);
    Core.scene.add(announcement);
    lastMoveAnnouncement = announcement;
}

dbg("Script evaluated. Version " + scriptVersion + ".");

function findTable() {
    const children = Vars.ui.hudGroup.getChildren();
    for (let i = 0; i < children.size; i++) {
        const child = children.get(i);
        if (String(child.name) === tableName) return child;
    }
    return null;
}

function slotKey(category, index, columns) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return "schematic" + category + "." + column + "." + row;
}

function getSelectedCategory(categoryButtons) {
    for (let i = 0; i < categoryButtons.length; i++) {
        if (categoryButtons[i].isChecked()) return i;
    }
    return 0;
}

function moveSchematic(source, destination, expectedDestination) {
    const currentSource = Core.settings.getString(source.key, "");
    const currentDestination = Core.settings.getString(destination, "");

    if (currentSource !== source.name || currentDestination !== expectedDestination) {
        selectedSlot = null;
        announceMoveMessage(Core.bundle.get("drag-scheme-table.move-stale"));
        return;
    }

    const sourceImageKey = source.key + "image";
    const destinationImageKey = destination + "image";
    const sourceImage = Core.settings.getString(sourceImageKey, "");

    Core.settings.put(destination, currentSource);
    Core.settings.remove(source.key);
    Core.settings.remove(destinationImageKey);
    Core.settings.remove(sourceImageKey);
    if (sourceImage) {
        Core.settings.put(destinationImageKey, sourceImage);
    }

    selectedSlot = null;
    announceMoveMessage(Core.bundle.get("drag-scheme-table.move-complete"));
    dbg("Moved " + source.key + " -> " + destination);
    if (global.eui.schematicsTableUI && global.eui.schematicsTableUI.rebuildTable) {
        global.eui.schematicsTableUI.rebuildTable();
    } else {
        Log.err("[Drag from Scheme Table] schematicsTableUI.rebuildTable missing; table not refreshed.");
    }
}

function selectOrMove(category, index, columns) {
    const key = slotKey(category, index, columns);
    const value = Core.settings.getString(key, "");
    dbg("Slot click: " + key + " value=\"" + value + "\" selected=" + (selectedSlot ? selectedSlot.key : "none"));

    if (selectedSlot == null) {
        if (!value) {
            announceMoveMessage(Core.bundle.get("drag-scheme-table.no-source"));
            return;
        }
        selectedSlot = { key: key, name: value };
        announceMoveMessage(Core.bundle.format("drag-scheme-table.source-selected", value));
        return;
    }

    if (selectedSlot.key === key) {
        selectedSlot = null;
        announceMoveMessage(Core.bundle.get("drag-scheme-table.move-cancelled"));
        return;
    }

    const source = selectedSlot;
    if (value) {
        Vars.ui.showConfirm(
            Core.bundle.get("drag-scheme-table.replace-title"),
            Core.bundle.get("drag-scheme-table.replace-message"),
            () => moveSchematic(source, key, value)
        );
    } else {
        moveSchematic(source, key, "");
    }
}

function sameButtons(first, second) {
    if (first.length !== second.length) return false;
    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) return false;
    }
    return true;
}

function seqToArray(seq) {
    const result = [];
    for (let i = 0; i < seq.size; i++) {
        result.push(seq.get(i));
    }
    return result;
}

function bindTableButtons(table) {
    const rows = Core.settings.getInt(rowsSetting, 4);
    const columns = Core.settings.getInt(columnsSetting, 5);
    const slotCount = rows * columns;
    if (table.getChildren().size === 0) return;

    const wrapped = table.getChildren().get(0);
    const wrappedChildren = wrapped.getChildren();
    if (wrappedChildren.size < 3) return;

    const categories = wrappedChildren.get(0).getChildren();
    const slots = wrappedChildren.get(2).getChildren();
    if (categories.size !== columns || slots.size !== slotCount) {
        throw new Error("Unexpected table layout: " + categories.size + " category buttons, " +
            slots.size + " schematic buttons.");
    }

    const categoryButtons = seqToArray(categories);
    const slotButtons = seqToArray(slots);
    if (boundTable === table && sameButtons(boundSlotButtons, slotButtons)) return;

    boundCategoryButtons = categoryButtons;
    boundColumns = columns;
    boundSlotButtons = slotButtons;

    for (let i = 0; i < slotButtons.length; i++) {
        const index = i;
        slotButtons[i].addCaptureListener(new JavaAdapter(Packages.arc.scene.event.InputListener, {
            touchDown: function(event, x, y, pointer, button) {
                if (!moveMode || button != Packages.arc.input.KeyCode.mouseLeft) return false;
                dbg("touchDown captured on slot " + index);
                event.stop();
                return true;
            },
            touchUp: function(event, x, y, pointer, button) {
                if (!moveMode || button != Packages.arc.input.KeyCode.mouseLeft) return;
                event.stop();
                selectOrMove(getSelectedCategory(boundCategoryButtons), index, boundColumns);
            }
        }));
    }

    boundTable = table;
    Log.info("[Drag from Scheme Table] Bound " + slotButtons.length + " schematic slots.");
}

function updateHighlight() {
    const category = getSelectedCategory(boundCategoryButtons);
    for (let i = 0; i < boundSlotButtons.length; i++) {
        const selected = moveMode && selectedSlot != null &&
            selectedSlot.key === slotKey(category, i, boundColumns);
        boundSlotButtons[i].color.set(selected ? Pal.accent : Color.white);
    }
}

function createMoveControl() {
    if (moveControl) return;

    moveControl = new Table(Styles.black3);
    moveControl.name = "drag-scheme-table-control";
    moveButton = moveControl.button("MOVE", Styles.defaultt, () => {
        moveMode = !moveMode;
        selectedSlot = null;
        dbg("Move mode " + (moveMode ? "ON" : "OFF"));
        announceMoveMessage(Core.bundle.get(moveMode
            ? "drag-scheme-table.mode-enabled"
            : "drag-scheme-table.mode-disabled"));
    }).size(72, 36).tooltip(Core.bundle.get("drag-scheme-table.mode-tooltip")).get();

    moveControl.pack();
    moveControl.visibility = () => {
        const table = findTable();
        return table != null && table.visible;
    };
}

function attachMoveControl(table) {
    if (attachedTable !== table) {
        if (attachedTable != null) attachedTable.removeChild(moveControl);
        table.addChild(moveControl);
        attachedTable = table;
        dbg("Attached MOVE control to schematic table.");
    }

    moveControl.setPosition(0, table.getHeight(), Align.bottomLeft);
    moveControl.toFront();
}

Events.on(ClientLoadEvent, () => {
    dbg("ClientLoadEvent received.");
    try {
        if (!global.eui || !global.eui.registerUpdate) {
            Log.err("[Drag from Scheme Table] Extended UI not found (global.eui missing). Mod disabled.");
            return;
        }
        createMoveControl();
        Log.info("[Drag from Scheme Table] Loaded v" + scriptVersion + ".");

        global.eui.registerUpdate(() => {
            try {
                const table = findTable();
                if (!Core.settings.getBool("eui-ShowSchematicsTable", true)) {
                    selectedSlot = null;
                    moveMode = false;
                    return;
                }
                if (!table) {
                    if (!waitingLogged) {
                        dbg("Waiting for table named " + tableName + ".");
                        waitingLogged = true;
                    }
                    return;
                }
                waitingLogged = false;

                bindTableButtons(table);
                moveButton.setChecked(moveMode);
                updateHighlight();
                attachMoveControl(table);
                lastUpdateError = null;
            } catch (error) {
                const message = String(error);
                if (message !== lastUpdateError) {
                    Log.err("[Drag from Scheme Table] UI update failed: " + message);
                    lastUpdateError = message;
                }
            }
        });
    } catch (error) {
        Log.err("[Drag from Scheme Table] Client load setup failed: " + error);
    }
});
