
import { GButton } from "./GButton";
import { RelationType, PopupDirection } from "./Const";
import { GList } from "./GList";
import { GWidget } from "./GWidget";
import { GTextField } from "./GTextField";
import { UIConfig2 } from "./UIConfig";
import { EventDispatcher } from "../events/EventDispatcher";
import { GRoot } from "./GRoot";
import { UIEvent } from "./UIEvent";
import { Loader } from "../net/Loader";

const internalEvent = "click_menu_item";

/**
 * @blueprintable
 */
export class PopupMenu extends EventDispatcher {

    visibleItemCount: number = 0;
    hideOnClickItem: boolean = true;
    autoSize: boolean = false;

    protected _content: GWidget;
    protected _list: GList;
    protected _initWidth: number;
    protected _seperatorRes: string;

    /**
     * @en Create a popup menu.
     * @param res The resource URL of the popup menu. If not defined, the default internal resource will be used. 
     * @param seperatorRes The resource URL of the seperator. If not defined, the default internal resource will be used.
     * @zh 创建一个弹出菜单。
     * @param res 弹出菜单的资源地址，如果未定义，则使用默认的内部资源。
     * @param seperatorRes 分隔符的资源地址，如果未定义，则使用默认的内部资源。 
     */
    constructor(res?: string, seperatorRes?: string) {
        super();

        if (!res)
            res = UIConfig2.popupMenu;

        let prefab = res ? Loader.getRes(res) : null;
        if (!res)
            throw new Error("UIConfig.popupMenu not defined");

        this._seperatorRes = seperatorRes || UIConfig2.popupMenuSeperator;

        this._content = <GWidget>prefab.create();
        this._initWidth = this._content.width;
        this._list = this._content.getChild("list");
        this._list.removeChildrenToPool();
        this._list.addRelation(this._content, RelationType.Width);
        this._list.removeRelation(this._content, RelationType.Height);
        this._content.addRelation(this._list, RelationType.Height);
        this._list.on(UIEvent.ClickItem, this, this._clickItem);
    }

    /**
     * @en Destroy the popup menu.
     * @zh 销毁弹出菜单。
     */
    destroy(): void {
        this._content.destroy();
    }

    /**
     * @en Add an item to the popup menu.
     * @param caption The caption of the item. 
     * @param callback The callback function when the item is clicked.
     * @param target The callback function's this object.
     * @returns The created item.
     * @zh 向弹出菜单中添加一个菜单项。
     * @param caption 菜单项的标题。
     * @param callback 菜单项被点击时的回调函数。
     * @param target 回调函数的 this 对象。 
     * @returns 创建的菜单项。
     */
    addItem(caption: string, callback?: Function, target?: any): GWidget {
        let item = this.createItem(caption, callback, target);
        this._list.addChild(item);

        return item;
    }

    /**
     * @en Add an item to the popup menu at a specified index.
     * @param caption The caption of the item. 
     * @param index The index to add the item.
     * @param callback The callback function when the item is clicked.
     * @param target The callback function's this object.
     * @returns The created item.
     * @zh 在指定索引处向弹出菜单中添加一个菜单项。
     * @param caption 菜单项的标题。 
     * @param index 要添加菜单项的索引。 
     * @param callback 菜单项被点击时的回调函数。 
     * @param target 回调函数的 this 对象。 
     * @returns 创建的菜单项。 
     */
    addItemAt(caption: string, index: number, callback?: Function, target?: any): GWidget {
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
            item.on(internalEvent, target, callback, [item]);
        return item;
    }

    /**
     * @en Add a seperator to the popup menu.
     * @param index The index to add the seperator.
     * @zh 向弹出菜单中添加一个分隔符。
     * @param index 要添加分隔符的索引。 
     */
    addSeperator(index?: number): void {
        if (index == undefined || index == -1)
            this._list.addItemFromPool(this._seperatorRes);
        else {
            let item = this._list.getFromPool(this._seperatorRes);
            this._list.addChildAt(item, index);
        }
    }

    /**
     * @en Get the name of the item at a specified index.
     * @param index The index of the item.
     * @returns The name of the item.
     * @zh 获取指定索引处菜单项的名称。
     * @param index 菜单项的索引。 
     * @returns 菜单项的名称。 
     */
    getItemName(index: number): string {
        let item = this._list.getChildAt(index);
        return item.name;
    }

    /**
     * @en Set the text of the item with the specified name.
     * @param name The name of the item. 
     * @param caption The caption to set.
     * @zh 设置指定名称菜单项的文本。
     * @param name 菜单项的名称。 
     * @param caption 要设置的标题。
     */
    setItemText(name: string, caption: string): void {
        let item = <GWidget>this._list.getChild(name);
        item.text = caption;
    }

    /**
     * @en Set the visibility of the item with the specified name.
     * @param name The name of the item. 
     * @param visible The visibility to set.
     * @zh 设置指定名称菜单项的可见性。
     * @param name 菜单项的名称。 
     * @param visible 要设置的可见性。 
     */
    setItemVisible(name: string, visible: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        item.visible = visible;
    }

    /**
     * @en Set the grayed state of the item with the specified name.
     * @param name The name of the item. 
     * @param grayed The grayed state to set.
     * @zh 设置指定名称菜单项的灰显状态。
     * @param name 菜单项的名称。 
     * @param grayed 要设置的灰显状态。 
     */
    setItemGrayed(name: string, grayed: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        item.grayed = grayed;
    }

    /**
     * @en Set the checkable state of the item with the specified name.
     * @param name The name of the item.
     * @param checkable The checkable state to set.
     * @zh 设置指定名称菜单项的可选中状态。
     * @param name 菜单项的名称。
     * @param checkable 要设置的可选中状态。 
     */
    setItemCheckable(name: string, checkable: boolean): void {
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

    /**
     * @en Set the checked state of the item with the specified name.
     * @param name The name of the item. 
     * @param checked The checked state to set.
     * @zh 设置指定名称菜单项的选中状态。
     * @param name 菜单项的名称。 
     * @param checked 要设置的选中状态。 
     */
    setItemChecked(name: string, checked: boolean): void {
        let item = <GWidget>this._list.getChild(name);
        let c = item.getController("checked");
        if (c)
            c.selectedIndex = checked ? 2 : 1;
    }

    /**
     * @en Get the checked state of the item with the specified name.
     * @param name The name of the item.
     * @returns The checked state of the item.
     * @zh 获取指定名称菜单项的选中状态。
     * @param name 菜单项的名称。
     * @returns 菜单项的选中状态。
     */
    isItemChecked(name: string): boolean {
        let item = <GWidget>this._list.getChild(name);
        let c = item.getController("checked");
        if (c)
            return c.selectedIndex == 2;
        else
            return false;
    }

    /**
     * @en Remove the item with the specified name.
     * @param name The name of the item.
     * @returns Whether the item is removed successfully.
     * @zh 移除指定名称的菜单项。
     * @param name 菜单项的名称。
     * @returns 菜单项是否移除成功。 
     */
    removeItem(name: string): boolean {
        let item = this._list.getChild(name);
        if (item) {
            let index = this._list.getChildIndex(item);
            this._list.removeChildToPoolAt(index);
            return true;
        }
        else
            return false;
    }

    /**
     * @en Clear all items in the popup menu.
     * @zh 清除弹出菜单中的所有菜单项。
     */
    clearItems(): void {
        this._list.removeChildrenToPool();
    }

    /**
     * @en Get the number of items in the popup menu.
     * @zh 获取弹出菜单中的菜单项数量。
     */
    get itemCount(): number {
        return this._list.numChildren;
    }

    /**
     * @en Get the content pane of the popup menu.
     * @zh 获取弹出菜单的内容面板。
     */
    get contentPane() {
        return this._content;
    }

    /**
     * @en Get the list component of the popup menu.
     * @zh 获取弹出菜单的列表组件。
     */
    get list() {
        return this._list;
    }

    /**
     * @en Show the popup menu.
     * @param target The target widget where the popup menu is displayed.
     * @param dir The direction where the popup menu is displayed.
     * @zh 显示弹出菜单。
     * @param target 弹出菜单显示的目标组件。
     * @param dir 弹出菜单显示的方向。
     */
    show(target?: GWidget, dir?: PopupDirection): void {
        if (GRoot.inst.popupMgr.isPopupJustClosed(this._content))
            return;

        this.event(UIEvent.Popup);

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

    /**
     * @en Hide the popup menu.
     * @zh 隐藏菜单。
     */
    hide() {
        if (this._content.parent)
            GRoot.inst.popupMgr.hidePopup(this._content);
    }

    private _clickItem(item: GWidget): void {
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

    /** @internal @blueprintEvent */
    PopupMenu_bpEvent: {
        [UIEvent.Popup]: () => void;
    };
}
