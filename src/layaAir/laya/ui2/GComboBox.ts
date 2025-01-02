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
import { UIEventType } from "./UIEvent";
import { Event } from "../events/Event";

export class GComboBox extends GLabel {
    public popupDirection: PopupDirection = 0;
    public visibleItemCount: number = 0;

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
        this._values = [];

        this.on(Event.ROLL_OVER, this, this._rollover);
        this.on(Event.ROLL_OUT, this, this._rollout);
        this.on(Event.MOUSE_DOWN, this, this._mousedown);
        this.on(Event.MOUSE_UP, this, this._mouseup);
    }

    public get items(): string[] {
        return this._items;
    }

    public set items(value: string[]) {
        if (!value)
            this._items.length = 0;
        else
            this._items = value.concat();

        if (this._items.length > 0) {
            if (this._selectedIndex >= this._items.length)
                this._selectedIndex = this._items.length - 1;
            else if (this._selectedIndex == -1)
                this._selectedIndex = 0;

            this.title = this._items[this._selectedIndex];
            if (this._icons && this._selectedIndex < this._icons.length)
                this.icon = this._icons[this._selectedIndex];
        }
        else {
            this.title = "";
            if (this._icons)
                this.icon = null;
            this._selectedIndex = -1;
        }
        this._itemsUpdated = true;
    }

    public get icons(): string[] {
        return this._icons;
    }

    public set icons(value: string[]) {
        this._icons = value;
        if (this._icons && this._selectedIndex != -1 && this._selectedIndex < this._icons.length)
            this.icon = this._icons[this._selectedIndex];
        this._itemsUpdated = true;
    }

    public get values(): string[] {
        return this._values;
    }

    public set values(value: string[]) {
        if (!value)
            this._values.length = 0;
        else
            this._values = value.concat();
        this._itemsUpdated = true;
    }

    public get selectedIndex(): number {
        return this._selectedIndex;
    }

    public set selectedIndex(val: number) {
        if (this._selectedIndex == val)
            return;

        this._selectedIndex = val;
        if (val >= 0 && val < this._items.length) {
            this.title = this._items[val];
            if (this._icons && val < this._icons.length)
                this.icon = this._icons[val];
        }
        else {
            this.title = "";
            if (this._icons)
                this.icon = null;
        }

        let cc = this._selectedController?.inst;
        if (cc != null && val >= 0 && val < cc.numPages && !cc.changing)
            this._selectedController.selectedIndex = val;
    }

    public get value(): string {
        return this._values[this._selectedIndex];
    }

    public set value(val: string) {
        let index = this._values.indexOf(val);
        if (index == -1 && val == null)
            index = this._values.indexOf("");
        this.selectedIndex = index;
    }

    public get dropdownRes(): Prefab {
        return this._dropdownRes;
    }

    public set dropdownRes(value: Prefab) {
        this._dropdownRes = value;
        this.createDropdown();
    }

    public get dropdown(): GWidget {
        return this._dropdown;
    }

    public get selectedController(): ControllerRef {
        return this._selectedController;
    }

    public set selectedController(value: ControllerRef) {
        if (this._selectedController)
            this._selectedController.release();
        this._selectedController = value;
        if (value) {
            value.validate();
            value.onChanged = this._selectChanged.bind(this);
            this._selectChanged();
        }
    }

    public destroy(): void {
        if (this._dropdown) {
            this._dropdown.destroy();
            this._dropdown = null;
        }

        if (this._selectedController)
            this._selectedController.release();

        super.destroy();
    }

    public updateList() {
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
                console.warn(this._dropdownRes + ": should container a list component named list.");
                return;
            }
            this._list.on(UIEventType.click_item, this, this._clickItem);

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

    private _selectChanged() {
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
        let p = (this._dropdown && this._dropdown.parent) ? ButtonStatus.Down : (this._over ? ButtonStatus.Over : ButtonStatus.Up);
        this.setState(this.grayed ? ButtonStatus.Disabled : p);
    }

    protected showDropdown(): void {
        if (!this._dropdown) {
            this.setState(ButtonStatus.Down);
            return;
        }

        if (GRoot.inst.popupMgr.isPopupJustClosed(this._dropdown))
            return;

        this.event(UIEventType.popup);

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
            item.icon = (this._icons && i < this._icons.length) ? this._icons[i] : null;
        }
        this._list.resizeToFit(this.visibleItemCount > 0 ? this.visibleItemCount : UIConfig2.defaultComboBoxVisibleItemCount);
    }

    private _popupWinClosed(): void {
        this.setCurrentState();
    }

    private _clickItem(evt: Event, item: GWidget): void {
        GRoot.inst.popupMgr.hidePopup(this._dropdown);

        this._selectedIndex = -1;
        this.selectedIndex = this._list.getChildIndex(item);
        this.event(UIEventType.changed);
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
}