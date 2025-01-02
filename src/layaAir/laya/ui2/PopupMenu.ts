
import { GButton } from "./GButton";
import { RelationType, PopupDirection } from "./Const";
import { GList } from "./GList";
import { GWidget } from "./GWidget";
import { GTextField } from "./GTextField";
import { UIConfig2 } from "./UIConfig";
import { EventDispatcher } from "../events/EventDispatcher";
import { Prefab } from "../resource/HierarchyResource";
import { GRoot } from "./GRoot";
import { UIEventType } from "./UIEvent";

const internalEvent = "click_menu_item";

export class PopupMenu extends EventDispatcher {

    public visibleItemCount: number = 0;
    public hideOnClickItem: boolean = true;
    public autoSize: boolean = false;

    protected _content: GWidget;
    protected _list: GList;
    protected _initWidth: number;

    constructor(res?: Prefab) {
        super();

        if (!res) {
            res = UIConfig2.popupMenu;
            if (!res)
                throw "UIConfig.popupMenu not defined";
        }
        this._content = <GWidget>res.create();
        this._initWidth = this._content.width;
        this._list = this._content.getChild("list");
        this._list.removeChildrenToPool();
        this._list.addRelation(this._content, RelationType.Width);
        this._list.removeRelation(this._content, RelationType.Height);
        this._content.addRelation(this._list, RelationType.Height);
        this._list.on(UIEventType.click_item, this, this._clickItem);
    }

    public destroy(): void {
        this._content.destroy();
    }

    public addItem(caption: string, callback?: Function, target?: any): GWidget {
        let item = this.createItem(caption, callback, target);
        this._list.addChild(item);

        return item;
    }

    public addItemAt(caption: string, index: number, callback?: Function, target?: any): GWidget {
        let item = this.createItem(caption, callback, target);
        this._list.addChildAt(item, index);

        return item;
    }

    private createItem(caption: string, callback?: Function, target?: any): GWidget {
        let item = this._list.getFromPool();
        item.text = caption;
        item.grayed = false;
        let c = item.getController("checked");
        if (c)
            c.selectedIndex = 0;
        item.offAll(internalEvent);
        if (callback)
            item.on(internalEvent, callback, target);
        return item;
    }

    public addSeperator(index?: number): void {
        if (index == undefined || index == -1)
            this._list.addItemFromPool("seperator");
        else {
            let item = this._list.getFromPool("seperator");
            this._list.addChildAt(item, index);
        }
    }

    public getItemName(index: number): string {
        let item = this._list.getChildAt(index);
        return item.name;
    }

    public setItemText(name: string, caption: string): void {
        let item = <GWidget>this._list.getChild(name);
        item.text = caption;
    }

    public setItemVisible(name: string, visible: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        item.visible = visible;
    }

    public setItemGrayed(name: string, grayed: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        item.grayed = grayed;
    }

    public setItemCheckable(name: string, checkable: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        let c = item.getController("checked");
        if (c) {
            if (checkable) {
                if (c.selectedIndex == 0)
                    c.selectedIndex = 1;
            }
            else
                c.selectedIndex = 0;
        }
    }

    public setItemChecked(name: string, checked: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        let c = item.getController("checked");
        if (c)
            c.selectedIndex = checked ? 2 : 1;
    }

    public isItemChecked(name: string): boolean {
        let item = <GWidget>this._list.getChild(name);
        let c = item.getController("checked");
        if (c)
            return c.selectedIndex == 2;
        else
            return false;
    }

    public removeItem(name: string): boolean {
        let item = this._list.getChild(name);
        if (item) {
            let index = this._list.getChildIndex(item);
            this._list.removeChildToPoolAt(index);
            return true;
        }
        else
            return false;
    }

    public clearItems(): void {
        this._list.removeChildrenToPool();
    }

    public get itemCount(): number {
        return this._list.numChildren;
    }

    public get contentPane() {
        return this._content;
    }

    public get list() {
        return this._list;
    }

    public show(target?: GWidget, dir?: PopupDirection, parentMenu?: PopupMenu): void {
        if (GRoot.inst.popupMgr.isPopupJustClosed(this._content))
            return;

        this.event(UIEventType.popup);

        if (this.autoSize) {
            this._list.layout.refresh();
            let cnt = this._list.numChildren;
            let maxDelta = -1000;
            for (let i = 0; i < cnt; i++) {
                let obj = this._list.getChildAt(i);
                if (!(obj instanceof GButton))
                    continue;

                let tf = obj.findTextWidget();
                if (tf instanceof GTextField) {
                    let v = tf.textWidth - tf.width;
                    if (v > maxDelta)
                        maxDelta = v;
                }
            }

            if (this._content.width + maxDelta > this._initWidth)
                this._content.width += maxDelta;
            else
                this._content.width = this._initWidth;
        }

        this._list.selection.index = -1;
        this._list.resizeToFit(this.visibleItemCount > 0 ? this.visibleItemCount : Number.POSITIVE_INFINITY, 10);

        GRoot.inst.popupMgr.togglePopup(this._content, target, dir);
    }

    public hide() {
        if (this._content.parent)
            GRoot.inst.popupMgr.hidePopup(this._content);
    }

    private _clickItem(evt: Event, item: GWidget): void {
        if (!(item instanceof GButton))
            return;

        if (item.grayed) {
            this._list.selection.index = -1;
            return;
        }

        let c = item.getController("checked");
        if (c && c.selectedIndex != 0) {
            if (c.selectedIndex == 1)
                c.selectedIndex = 2;
            else
                c.selectedIndex = 1;
        }

        if (this.hideOnClickItem)
            this.hide();

        item.event(internalEvent, item);
    }
}
