import { Input } from "../../display/Input";
import { Event } from "../../events/Event";
import { GButton } from "../GButton";
import { ButtonMode, LayoutType, SelectionMode } from "../Const";
import type { GPanel } from "../GPanel";
import { GTextInput } from "../GTextInput";
import type { GWidget } from "../GWidget";
import { ISelection } from "./ISelection";
import { UIEvent } from "../UIEvent";

export class Selection implements ISelection {
    public scrollItemToViewOnClick: boolean = false;
    public allowSelectByRightClick: boolean = true;

    protected _owner: GPanel;
    protected _mode: SelectionMode = 0;
    protected _lastIndex: number = 0;
    protected _triggerFocusEvents: boolean;
    protected _keyEvent: string;

    constructor(owner: GPanel) {
        this._owner = owner;
        this._lastIndex = -1;
    }

    public get mode(): SelectionMode {
        return this._mode;
    }
    public set mode(value: SelectionMode) {
        this._mode = value;
    }

    public get index(): number {
        for (let i = 0, cnt = this._owner.children.length; i < cnt; i++) {
            let obj = this._owner.children[i];
            if ((obj instanceof GButton) && obj.selected)
                return i;
        }

        return -1;
    }

    public set index(value: number) {
        if (value >= 0 && value < this._owner.numChildren) {
            if (this._mode != SelectionMode.Single)
                this.clear();
            this.add(value);
        }
        else
            this.clear();
    }

    public get(out?: number[]): number[] {
        if (!out)
            out = [];

        for (let i = 0, cnt = this._owner.children.length; i < cnt; i++) {
            let obj = this._owner.children[i];
            if ((obj instanceof GButton) && obj.selected)
                out.push(i);
        }

        return out;
    }

    public add(index: number, scrollItToView?: boolean): void {
        if (this._mode == SelectionMode.Disabled)
            return;

        if (this._mode == SelectionMode.Single)
            this.clear();

        if (scrollItToView)
            this._owner.scroller?.scrollTo(index);

        this._lastIndex = index;
        let obj = this._owner.getChildAt(index);

        if ((obj instanceof GButton) && !obj.selected)
            obj.selected = true;
    }

    public remove(index: number): void {
        if (this._mode == SelectionMode.Disabled)
            return;

        let obj = this._owner.getChildAt(index);

        if (obj instanceof GButton)
            obj.selected = false;
    }

    public clear(): void {
        for (let obj of this._owner.children) {
            if (obj instanceof GButton)
                obj.selected = false;
        }
    }

    protected clearExcept(g: GWidget): void {
        for (let obj of this._owner.children) {
            if ((obj instanceof GButton) && obj != g)
                obj.selected = false;
        }

    }

    public selectAll(): void {
        for (let obj of this._owner.children) {
            if ((obj instanceof GButton) && !obj.selected) {
                obj.selected = true;
            }
        }
    }

    public selectReverse(): void {
        for (let obj of this._owner.children) {
            if (obj instanceof GButton) {
                obj.selected = !obj.selected;
            }
        }
    }

    public enableFocusEvents(enabled: boolean) {
        if (this._triggerFocusEvents == enabled)
            return;

        this._triggerFocusEvents = enabled;

        // if (enabled) {
        //     //this._owner.tabStopChildren = true;
        //     this._owner.on("focus_in", this, this.handleFocus);
        //     this._owner.on("focus_out", this, this.handleFocus);
        // }
        // else {
        //     this._owner.off("focus_in", this, this.handleFocus);
        //     this._owner.off("focus_out", this, this.handleFocus);
        // }
    }

    private handleFocus(evt: Event) {
        let eventType = evt.type == "focus_in" ? "list_focus_in" : "list_focus_out";
        for (let obj of this._owner.children) {
            if ((obj instanceof GButton) && obj.selected)
                obj.event(eventType);
        }
    }

    public handleClick(item: GButton, evt: Event): void {
        let scroller = this._owner.scroller;
        if (scroller?.isDragged)
            return;

        if (evt.button == 2 && !this.allowSelectByRightClick)
            return;

        if (item.mode == ButtonMode.Common) {
            this._owner.event(UIEvent.click_item, item);
            return;
        }

        let dontChangeLastIndex = false;
        let index = this._owner.getChildIndex(item);

        if (this._mode == SelectionMode.Disabled) {
            //nothing
        }
        else if (this._mode == SelectionMode.Single) {
            if (!item.selected) {
                this.clearExcept(item);
                item.selected = true;
                item.event(Event.CHANGED);
            }
        }
        else {
            if (evt.shiftKey) {
                if (!item.selected) {
                    if (this._lastIndex != -1) {
                        let min = Math.min(this._lastIndex, index);
                        let max = Math.max(this._lastIndex, index);
                        max = Math.min(max, this._owner.numChildren - 1);

                        for (let i = min; i <= max; i++) {
                            let obj = this._owner.getChildAt(i);
                            if (obj instanceof GButton) {
                                obj.selected = true;
                                if (obj == item)
                                    item.event(Event.CHANGED);
                            }
                        }

                        dontChangeLastIndex = true;
                    }
                    else {
                        item.selected = true;
                        item.event(Event.CHANGED);
                    }
                }
            }
            else if ((evt.ctrlKey || evt.metaKey) || this._mode == SelectionMode.MultipleBySingleClick) {
                item.selected = !item.selected;
                item.event(Event.CHANGED);
            }
            else {
                if (!item.selected) {
                    this.clearExcept(item);
                    item.selected = true;
                    item.event(Event.CHANGED);
                }
                else if (evt.button == 0)
                    this.clearExcept(item);
            }
        }

        if (!dontChangeLastIndex)
            this._lastIndex = index;

        if (scroller && this.scrollItemToViewOnClick)
            scroller.scrollTo(item, true);

        if (evt.isDblClick && (evt.target instanceof Input))
            return;

        this._owner.event(UIEvent.click_item, item);
    }

    public enableArrowKeyNavigation(enabled: boolean, keySelectEvent?: string) {
        if (enabled) {
            //this._owner.tabStopChildren = true;
            this._keyEvent = keySelectEvent != null ? keySelectEvent : UIEvent.click_item;
            this._owner.on(Event.KEY_DOWN, this, this._keydown);
        }
        else {
            //this._owner.tabStopChildren = false;
            this._owner.off(Event.KEY_DOWN, this, this._keydown);
        }
    }

    private _keydown(evt: Event) {
        if ((evt.target instanceof Input) || evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey)
            return;

        let index = -1;
        switch (evt.key) {
            case "ArrowLeft":
                index = this.handleArrowKey(7);
                break;

            case "ArrowRight":
                index = this.handleArrowKey(3);
                break;

            case "ArrowUp":
                index = this.handleArrowKey(1);
                break;

            case "ArrowDown":
                index = this.handleArrowKey(5);
                break;
        }

        if (index != -1)
            evt.stopPropagation();
    }

    public handleArrowKey(dir: number): number {
        let curIndex = this.index;
        if (curIndex == -1) {
            if (this._owner.numChildren > 0) {
                this.clear();
                this.add(0, true);
                if (this._keyEvent)
                    this._owner.event(this._keyEvent, this._owner.getChildAt(0));
                return 0;
            }
            else
                return -1;
        }

        let index = curIndex;
        let layout = this._owner.layout?.type;
        if (layout == null)
            layout = LayoutType.FlowX;

        switch (dir) {
            case 1://up
                if (layout == LayoutType.SingleColumn || layout == LayoutType.FlowY) {
                    index--;
                }
                else if (layout == LayoutType.FlowX) {
                    let current = <GWidget>this._owner.getChildAt(index);
                    let k = 0;
                    let i;
                    for (i = index - 1; i >= 0; i--) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.y != current.y) {
                            current = obj;
                            break;
                        }
                        k++;
                    }
                    for (; i >= 0; i--) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.y != current.y) {
                            index = i + k + 1;
                            break;
                        }
                    }

                }
                break;

            case 3://right
                if (layout == LayoutType.SingleRow || layout == LayoutType.FlowX) {
                    index++;
                }
                else if (layout == LayoutType.FlowY) {
                    let current = <GWidget>this._owner.getChildAt(index);
                    let k = 0;
                    let i;
                    let cnt = this._owner.numChildren;
                    for (i = index + 1; i < cnt; i++) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.x != current.x) {
                            current = obj;
                            break;
                        }
                        k++;
                    }
                    for (; i < cnt; i++) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.x != current.x) {
                            index = i - k - 1;
                            break;
                        }

                    }
                }
                break;

            case 5://down
                if (layout == LayoutType.SingleColumn || layout == LayoutType.FlowY) {
                    index++;
                }
                else if (layout == LayoutType.FlowX) {
                    let current = <GWidget>this._owner.getChildAt(index);
                    let k = 0;
                    let i;
                    let cnt = this._owner.numChildren;
                    for (i = index + 1; i < cnt; i++) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.y != current.y) {
                            current = obj;
                            break;
                        }
                        k++;
                    }
                    for (; i < cnt; i++) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.y != current.y) {
                            index = i - k - 1;
                            break;
                        }
                    }
                }
                break;

            case 7://left
                if (layout == LayoutType.SingleRow || layout == LayoutType.FlowX) {
                    index--;
                }
                else if (layout == LayoutType.FlowY) {
                    let current = <GWidget>this._owner.getChildAt(index);
                    let k = 0;
                    let i;
                    for (i = index - 1; i >= 0; i--) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.x != current.x) {
                            current = obj;
                            break;
                        }
                        k++;
                    }
                    for (; i >= 0; i--) {
                        let obj = <GWidget>this._owner.getChildAt(i);
                        if (obj.x != current.x) {
                            index = i + k + 1;
                            break;
                        }
                    }
                }
                break;
        }

        if (index != curIndex && index >= 0 && index < this._owner.numChildren) {
            this.clear();
            this.add(index, true);
            if (this._keyEvent) {
                this._owner.event(this._keyEvent, this._owner.getChildAt(index));
            }
            return index;
        }
        else
            return -1;
    }

}