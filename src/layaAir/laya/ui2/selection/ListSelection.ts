import { GButton } from "../GButton";
import { ButtonMode, LayoutType, SelectionMode } from "../Const";
import type { GList } from "../GList";
import type { ListLayout } from "../layout/ListLayout";
import { Selection } from "./Selection";
import { GWidget } from "../GWidget";
import { GTextInput } from "../GTextInput";
import { Event } from "../../events/Event";
import { Input } from "../../display/Input";
import { UIEvent } from "../UIEvent";

export class ListSelection extends Selection {
    declare _owner: GList;
    _layout: ListLayout;

    constructor(owner: GList) {
        super(owner);

        this._layout = <ListLayout>owner.layout;
    }

    public get index(): number {
        if (this._layout._virtual) {
            for (let i = 0; i < this._layout._realNumItems; i++) {
                let ii = this._layout._items[i];
                if ((ii.obj instanceof GButton) && ii.obj.selected || ii.obj == null && ii.selected) {
                    if (this._layout._loop)
                        return i % this._layout.numItems;
                    else
                        return i;
                }
            }


            return -1;
        }
        else
            return super.index;
    }

    public set index(value: number) {
        if (this._layout._virtual) {
            if (value >= 0 && value < this._layout.numItems) {
                if (this._mode != SelectionMode.Single)
                    this.clear();
                this.add(value);
            }
            else
                this.clear();
        }
        else
            super.index = value;
    }

    public get(out?: number[]): number[] {
        if (this._layout._virtual) {
            if (!out)
                out = [];

            for (let i = 0; i < this._layout._realNumItems; i++) {
                let ii = this._layout._items[i];
                if ((ii.obj instanceof GButton) && ii.obj.selected
                    || ii.obj == null && ii.selected) {
                    let j = i;
                    if (this._layout._loop) {
                        j = i % this._layout.numItems;
                        if (out.indexOf(j) != -1)
                            continue;
                    }
                    out.push(j);
                }
            }

            return out;
        }
        else
            return super.get(out);
    }

    public add(index: number, scrollItToView?: boolean): void {
        if (this._layout._virtual) {
            if (this._mode == SelectionMode.Disabled)
                return;

            this._layout._checkVirtualList();

            if (this._mode == SelectionMode.Single)
                this.clear();

            if (scrollItToView)
                this._owner.scroller.scrollTo(index);

            this._lastIndex = index;
            let obj: GWidget;
            let ii = this._layout._items[index];
            if (ii.obj)
                obj = ii.obj;
            ii.selected = true;

            if ((obj instanceof GButton) && !obj.selected)
                obj.selected = true;
        }
        else
            super.add(index, scrollItToView);
    }

    public remove(index: number): void {
        if (this._layout._virtual) {
            if (this._mode == SelectionMode.Disabled)
                return;

            let obj: GWidget;
            let ii = this._layout._items[index];
            if (ii.obj)
                obj = ii.obj;
            ii.selected = false;

            if (obj instanceof GButton)
                obj.selected = false;
        }
        else
            super.remove(index);
    }

    public clear(): void {
        if (this._layout._virtual) {
            for (let i = 0; i < this._layout._realNumItems; i++) {
                let ii = this._layout._items[i];
                if (ii.obj instanceof GButton)
                    ii.obj.selected = false;
                ii.selected = false;
            }
        }
        else
            super.clear();
    }

    protected clearExcept(g: GWidget): void {
        if (this._layout._virtual) {
            for (let i = 0; i < this._layout._realNumItems; i++) {
                let ii = this._layout._items[i];
                if (ii.obj != g) {
                    if ((ii.obj instanceof GButton))
                        ii.obj.selected = false;
                    ii.selected = false;
                }
            }
        }
        else
            super.clearExcept(g);
    }

    public selectAll(): void {
        if (this._layout._virtual) {
            this._layout._checkVirtualList();

            for (let i = 0; i < this._layout._realNumItems; i++) {
                let ii = this._layout._items[i];
                if ((ii.obj instanceof GButton) && !ii.obj.selected) {
                    ii.obj.selected = true;
                }
                ii.selected = true;
            }
        }
        else
            super.selectAll();
    }

    public selectReverse(): void {
        if (this._layout._virtual) {
            this._layout._checkVirtualList();

            for (let i = 0; i < this._layout._realNumItems; i++) {
                let ii = this._layout._items[i];
                if (ii.obj instanceof GButton) {
                    ii.obj.selected = !ii.obj.selected;
                }
                ii.selected = !ii.selected;
            }
        }
        else
            super.selectReverse();
    }

    public handleClick(item: GButton, evt: Event): void {
        if (this._layout._virtual) {
            let scroller = this._owner.scroller;
            if (scroller?.isDragged)
                return;

            if (evt.button === 2 && !this.allowSelectByRightClick)
                return;

            if (item.mode == ButtonMode.Common) {
                this._owner.event(UIEvent.click_item, item);
                return;
            }

            let dontChangeLastIndex = false;
            let index = this._layout.childIndexToItemIndex(this._owner.getChildIndex(item));

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
                            max = Math.min(max, this._layout.numItems - 1);

                            for (let i = min; i <= max; i++) {
                                let ii = this._layout._items[i];
                                if (ii.obj instanceof GButton) {
                                    ii.obj.selected = true;
                                    if (ii.obj == item)
                                        item.event(Event.CHANGED);
                                }
                                ii.selected = true;
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

            if (evt.isDblClick && (evt.target instanceof Input))
                return;

            this._owner.event(UIEvent.click_item, item);
        }
        else
            super.handleClick(item, evt);
    }

    public handleArrowKey(dir: number): number {
        if (this._layout._virtual) {
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
            let layout = this._layout.type;
            switch (dir) {
                case 1://up
                    if (layout == LayoutType.SingleColumn || layout == LayoutType.FlowY) {
                        index--;
                    }
                    else if (layout == LayoutType.FlowX) {
                        index -= this._layout._lineItemCnt;
                    }
                    break;

                case 3://right
                    if (layout == LayoutType.SingleRow || layout == LayoutType.FlowX) {
                        index++;
                    }
                    else if (layout == LayoutType.FlowY) {
                        index += this._layout._lineItemCnt;
                    }
                    break;

                case 5://down
                    if (layout == LayoutType.SingleColumn || layout == LayoutType.FlowY) {
                        index++;
                    }
                    else if (layout == LayoutType.FlowX) {
                        index += this._layout._lineItemCnt;
                    }
                    break;

                case 7://left
                    if (layout == LayoutType.SingleRow || layout == LayoutType.FlowX) {
                        index--;
                    }
                    else if (layout == LayoutType.FlowY) {
                        index -= this._layout._lineItemCnt;
                    }
                    break;
            }

            if (index != curIndex && index >= 0 && index < this._layout.numItems) {
                this.clear();
                this.add(index, true);
                if (this._keyEvent) {
                    let childIndex = this._layout.itemIndexToChildIndex(index);
                    if (childIndex != -1)
                        this._owner.event(this._keyEvent, this._owner.getChildAt(childIndex));
                }
                return index;
            }
            else
                return -1;
        }
        else
            return super.handleArrowKey(dir);
    }
}