import { Controller } from "./Controller";
import { GList } from "./GList";
import { ButtonStatus, PopupDirection, RelationType } from "./Const";
import { ButtonPageAlternatives } from "./GButton";
import { GLabel } from "./GLabel";
import { GWidget } from "./GWidget";
import { UIConfig2 } from "./UIConfig";
import { ControllerRef } from "./ControllerRef";
import { Prefab } from "../resource/HierarchyResource";
import { Input } from "../display/Input";
import { GRoot } from "./GRoot";
import { UIEvent } from "./UIEvent";
import { Event } from "../events/Event";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { NodeFlags } from "../Const";

/**
 * @en GComboBox is a dropdown list that allows users to select an item from a list of options.
 * @zh GComboBox 是一个下拉列表，允许用户从选项列表中选择一个项目。
 * @blueprintInheritable
 */
export class GComboBox extends GLabel {
    /**
     * @en The direction in which the popup dropdown will appear.
     * @zh 弹出下拉列表将出现的方向。
     */
    popupDirection: PopupDirection = 0;
    /**
     * @en The number of items visible in the dropdown list.
     * @zh 下拉列表中可见的项目数量。
     */
    visibleItemCount: number = 0;

    private _items: string[];
    private _icons: string[];
    private _values: string[];

    private _dropdownRes: Prefab;

    private _itemsUpdated: boolean;
    private _selectedIndex: number;
    private _buttonController: Controller;
    private _selectedController: ControllerRef;
    private _dropdown: GWidget;
    private _list: GList;

    private _down: boolean;
    private _over: boolean;

    constructor() {
        super();

        this._itemsUpdated = true;
        this._selectedIndex = -1;
        this._items = [];
        this._icons = [];
        this._values = [];

        this.on(Event.ROLL_OVER, this, this._rollover);
        this.on(Event.ROLL_OUT, this, this._rollout);
        this.on(Event.MOUSE_DOWN, this, this._mousedown);
        this.on(Event.MOUSE_UP, this, this._mouseup);
    }

    /**
     * @en The list of items in the dropdown.
     * @zh 下拉列表中的项目列表。
     */
    get items(): string[] {
        return this._items;
    }

    set items(value: string[]) {
        let arr = this._items;
        arr.length = 0;
        if (value)
            arr.push(...value);

        this._itemsUpdated = true;
        if (SerializeUtil.isDeserializing) {
            if (arr.length > 0)
                this._selectedIndex = 0;
            return;
        }

        if (arr.length > 0) {
            if (this._selectedIndex >= arr.length)
                this._selectedIndex = arr.length - 1;
            else if (this._selectedIndex == -1)
                this._selectedIndex = 0;

            this.title = arr[this._selectedIndex];
            if (this._selectedIndex < this._icons.length)
                this.icon = this._icons[this._selectedIndex];
        }
        else {
            this.title = "";
            if (this._icons)
                this.icon = null;
            this._selectedIndex = -1;
        }
    }

    /**
     * @en The list of icons corresponding to the items in the dropdown.
     * @zh 下拉列表中项目对应的图标列表。
     */
    get icons(): string[] {
        return this._icons;
    }

    set icons(value: string[]) {
        let arr = this._icons;
        arr.length = 0;
        if (value)
            arr.push(...value);

        this._itemsUpdated = true;
        if (SerializeUtil.isDeserializing)
            return;

        if (this._selectedIndex != -1 && this._selectedIndex < arr.length)
            this.icon = arr[this._selectedIndex];
    }

    /**
     * @en The list of values corresponding to the items in the dropdown.
     * @zh 下拉列表中项目对应的值列表。
     */
    get values(): string[] {
        return this._values;
    }

    set values(value: string[]) {
        this._values.length = 0;
        if (value)
            this._values.push(...value);
        this._itemsUpdated = true;
    }

    /**
     * @en The index of the currently selected item in the dropdown.
     * @zh 当前选中下拉列表项目的索引。
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    set selectedIndex(val: number) {
        if (this._selectedIndex === val && !this._itemsUpdated)
            return;

        this._selectedIndex = val;
        if (val >= 0 && val < this._items.length) {
            this.title = this._items[val];
            if (val < this._icons.length)
                this.icon = this._icons[val];
        }
        else {
            this.title = "";
            if (this._icons)
                this.icon = "";
        }

        let cc = this._selectedController?.inst;
        if (cc != null && val >= 0 && val < cc.numPages && !cc.changing)
            this._selectedController.selectedIndex = val;
    }

    /**
     * @en The value of the currently selected item in the dropdown.
     * @zh 当前选中下拉列表项目的值。
     */
    get value(): string {
        return this._values[this._selectedIndex];
    }

    set value(val: string) {
        let index = this._values.indexOf(val);
        if (index == -1 && val == null)
            index = this._values.indexOf("");
        this.selectedIndex = index;
    }

    /**
     * @en The prefab resource used for the dropdown.
     * @zh 用于下拉列表的预制资源。
     */
    get dropdownRes(): Prefab {
        return this._dropdownRes;
    }

    set dropdownRes(value: Prefab) {
        this._dropdownRes = value;
        if (!this._getBit(NodeFlags.EDITING_NODE))
            this.createDropdown();
    }

    /**
     * @en The dropdown widget that displays the list of items.
     * @zh 显示项目列表的下拉精灵。
     */
    get dropdown(): GWidget {
        return this._dropdown;
    }

    /**
     * @zh 控制器可以与下拉框联动，当下拉框选择发生改变时，控制器也同时跳转到相同索引的页面。反之亦然，如果控制器跳转到某个页面，那么下拉框也同时选定相同索引的项目。
     * @en The controller that can be linked with the dropdown. When the selection in the dropdown changes, the controller will also jump to the same index page, and vice versa. If the controller jumps to a certain page, the dropdown will also select the item at the same index.
     */
    get selectedController(): ControllerRef {
        return this._selectedController;
    }

    set selectedController(value: ControllerRef) {
        if (this._selectedController)
            this._selectedController.release();
        this._selectedController = value;
        if (value) {
            value.validate();
            value.onChanged = this.selectChanged.bind(this);
            this.selectChanged();
        }
    }

    /** @ignore */
    destroy(): void {
        if (this._dropdown) {
            this._dropdown.destroy();
            this._dropdown = null;
        }

        if (this._selectedController)
            this._selectedController.release();

        super.destroy();
    }

    /**
     * @en This method is automatically called to update the dropdown list when it is popped up.
     * @zh 下拉列表弹出时，会自动调用这个方法更新下拉列表。
     */
    updateList(): void {
        if (!this._dropdown.stage)
            return;

        this._updateDropDown();
        this._list.layout.refresh();

        GRoot.inst.popupMgr.validatePopupPosition(this._dropdown, this, this.popupDirection);
    }

    private createDropdown() {
        if (this._dropdown) {
            this._dropdown.destroy();
            this._dropdown = null;
            this._list = null;
        }

        if (this._dropdownRes) {
            this._dropdown = <GWidget>this._dropdownRes.create();
            this._list = <GList>this._dropdown.getChild("list");
            if (this._list == null) {
                console.warn(this._dropdownRes.url + ": should container a list component named list.");
                return;
            }
            this._list.on(UIEvent.ClickItem, this, this._clickItem);

            this._list.addRelation(this._dropdown, RelationType.Width);
            this._list.removeRelation(this._dropdown, RelationType.Height);

            this._dropdown.addRelation(this._list, RelationType.Height);
            this._dropdown.removeRelation(this._list, RelationType.Width);

            this._dropdown.on(Event.UNDISPLAY, this, this._popupWinClosed);
        }
    }

    protected _controllersChanged(): void {
        super._controllersChanged();

        let c = this.getController("button");
        if (this._buttonController != c) {
            this._buttonController = c;
            if (this._buttonController.numPages > 0)
                this.setCurrentState();
        }
    }

    private selectChanged() {
        this.selectedIndex = this._selectedController.selectedIndex;
    }

    protected setState(page: number): void {
        if (this._buttonController) {
            if (page >= this._buttonController.numPages) {
                page = ButtonPageAlternatives[page];
                if (page == null)
                    return;
            }
            this._buttonController.selectedIndex = page;
        }
    }

    protected setCurrentState() {
        let p = (this._dropdown && this._dropdown.displayedInStage) ? ButtonStatus.Down : (this._over ? ButtonStatus.Over : ButtonStatus.Up);
        this.setState(this.grayed ? ButtonStatus.Disabled : p);
    }

    protected showDropdown(): void {
        if (!this._dropdown) {
            this.setState(ButtonStatus.Down);
            return;
        }

        if (GRoot.inst.popupMgr.isPopupJustClosed(this._dropdown))
            return;

        this.event(UIEvent.Popup);

        if (this._itemsUpdated)
            this._updateDropDown();

        this._list.selection.index = -1;
        this._dropdown.width = this.width;
        this._list.layout.refresh();

        GRoot.inst.popupMgr.showPopup(this._dropdown, this, this.popupDirection);
        this.setState(ButtonStatus.Down);
    }

    private _updateDropDown() {
        this._itemsUpdated = false;

        this._list.removeChildrenToPool();
        let cnt = this._items.length;
        for (let i = 0; i < cnt; i++) {
            let item = this._list.addItemFromPool();
            item.name = i < this._values.length ? this._values[i] : "";
            item.text = this._items[i];
            item.icon = i < this._icons.length ? this._icons[i] : "";
        }
        this._list.resizeToFit(this.visibleItemCount > 0 ? this.visibleItemCount : UIConfig2.defaultComboBoxVisibleItemCount);
    }

    private _popupWinClosed(): void {
        this.setCurrentState();
    }

    private _clickItem(item: GWidget): void {
        GRoot.inst.popupMgr.hidePopup(this._dropdown);

        this._selectedIndex = -1;
        this.selectedIndex = this._list.getChildIndex(item);
        this.event(Event.CHANGED);
    }

    private _rollover(): void {
        this._over = true;
        if (this._down || this._dropdown && this._dropdown.parent)
            return;

        this.setCurrentState();
    }

    private _rollout(): void {
        this._over = false;
        if (this._down || this._dropdown && this._dropdown.parent)
            return;

        this.setCurrentState();
    }

    private _mousedown(evt: Event): void {
        if (evt.target instanceof Input)
            return;

        this._down = true;
        this.showDropdown();
    }

    private _mouseup(): void {
        if (this._down) {
            this._down = false;
            this.setCurrentState();
        }
    }

    /** @internal @blueprintEvent */
    GComboBox_bpEvent: {
        [Event.CHANGED]: () => void;
        [UIEvent.Popup]: () => void;
    };
}