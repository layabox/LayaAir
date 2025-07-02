import { GButton } from "./GButton";
import { LayoutType, ScrollBounceBackEffect, SelectionMode } from "./Const";
import { GWidget } from "./GWidget";
import { WidgetPool } from "./WidgetPool";
import { ListLayout } from "./layout/ListLayout";
import { ListSelection } from "./selection/ListSelection";
import { IListLayout } from "./layout/IListLayout";
import { GPanel } from "./GPanel";
import { Prefab } from "../resource/HierarchyResource";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayaEnv } from "../../LayaEnv";
import { HideFlags } from "../Const";

/**
 * @en GList is a widget that displays a list of items, allowing for item rendering and selection.
 * @zh GList 是一个显示项目列表的小部件，允许进行项目渲染和选择。
 * @blueprintInheritable
 */
export class GList extends GPanel {
    /**
     * @en The function used to render each item in the list.
     * @zh 用于渲染列表中每个项目的函数。
     */
    itemRenderer: (index: number, item: any) => void;
    /**
     * @en The function used to provide the template resource for each item in the list.
     * @zh 用于提供列表中每个项目的模板资源的函数。
     */
    itemProvider: (index: number) => string;

    declare protected _layout: IListLayout;

    private _pool: WidgetPool;
    private _initItemNum: number;
    private _itemData: Array<IListItemData>;
    private _isDemo: boolean;

    /** @internal */
    _templateNode: GWidget;

    constructor() {
        super(ListLayout, ListSelection);

        this._layout.type = LayoutType.SingleColumn;
        this._selection.mode = SelectionMode.Single;

        this._pool = new WidgetPool();
    }

    /** @ignore */
    destroy(): void {
        this._pool.clear();

        super.destroy();
    }

    /** @ignore */
    get layout(): IListLayout {
        return <IListLayout>this._layout;
    }

    /**
     * @en The template resource used for items in the list.
     * @zh 列表中项目使用的模板资源。
     */
    get itemTemplate(): Prefab {
        return this._pool.defaultRes;
    }

    set itemTemplate(value: Prefab) {
        this._pool.defaultRes = value;
    }

    /**
     * @en Built-in object pool functionality for GList.
     * @zh GList内建对象池功能。
     */
    get itemPool(): WidgetPool {
        return this._pool;
    }

    /**
     * @zh 从对象池中取出一个子项对象。
     * @param url 资源地址，如果不传则使用默认的对象池资源。
     * @return 返回一个 GWidget 对象。
     * @en Get a child object from the pool.
     * @param url The resource URL, if not provided, the default pool resource will be used.
     * @returns A GWidget object. 
     */
    getFromPool(url?: string): GWidget {
        let obj = this._pool.take(url);
        if (obj)
            obj.visible = true;
        return obj;
    }

    /**
     * @en Return an object to the pool.
     * @param obj The GWidget object to return.
     * @zh 将一个对象返回到对象池中。
     * @param obj 要返回的 GWidget 对象。
     */
    returnToPool(obj: GWidget): void {
        this._pool.recover(obj);
    }

    /**
     * @en Add an item from the pool to the list.
     * @param url The resource URL of the item to add. If not provided, the default pool resource will be used. 
     * @returns A GWidget object that has been added to the list.
     * @zh 从对象池中添加一个项目到列表中。
     * @param url 项目的资源地址，如果不传则使用默认的对象池资源。
     * @returns 返回一个已添加到列表中的 GWidget 对象。 
     */
    addItemFromPool(url?: string): GWidget {
        let child = this.getFromPool(url);
        if (child instanceof GButton)
            child.selected = false;
        return this.addChild(child);
    }

    /**
     * @en Remove a child at the specified index and return it to the pool.
     * @param index The index of the child to remove.
     * @zh 移除指定索引处的子项并将其返回到对象池。
     * @param index 要移除的子项的索引。 
     */
    removeChildToPoolAt(index: number): void {
        let child = <GWidget>this.removeChildAt(index);
        this.returnToPool(child);
    }

    /**
     * @en Remove a specific child from the list and return it to the pool.
     * @param child The child widget to remove.
     * @zh 从列表中移除特定的子项并将其返回到对象池。
     * @param child 要移除的子项小部件。
     */
    removeChildToPool(child: GWidget): void {
        this.removeChild(child);
        this.returnToPool(child);
    }

    /**
     * @en Remove a range of children from the list and return them to the pool.
     * @param beginIndex The starting index of the range to remove. Defaults to 0. 
     * @param endIndex The ending index of the range to remove. If not provided, it will remove all children from the beginning index to the end of the list.
     * @zh 从列表中移除一系列子项并将它们返回到对象池。
     * @param beginIndex 要移除的范围的起始索引。
     * @param endIndex 要移除的范围的结束索引。如果未提供，将从起始索引移除到列表末尾的所有子项。 
     */
    removeChildrenToPool(beginIndex?: number, endIndex?: number): void {
        beginIndex = beginIndex || 0;
        if (endIndex == null) endIndex = -1;
        if (endIndex < 0 || endIndex >= this.children.length)
            endIndex = this.children.length - 1;

        for (let i = beginIndex; i <= endIndex; ++i)
            this.removeChildToPoolAt(beginIndex);
    }

    /**
     * @en The number of items in the list. If the list not virtual, this is the number of children, else it is the number of items in the data source.
     * @zh 列表中的项目数量。如果列表不是虚拟的，则为子项的数量，否则为数据源中的项目数量。
     */
    get numItems(): number {
        return this._layout.numItems;
    }

    set numItems(value: number) {
        this._layout.numItems = value;
    }

    /**
     * @en Resize the list to fit the number of items and minimum size.
     * @param itemCount The number of items to fit in the list. If not provided, it will use the current number of items.
     * @param minSize The minimum size of the list. If not provided, it will use the current size of the list.
     * @zh 调整列表大小以适应项目数量和最小大小。
     * @param itemCount 要适应列表中的项目数量。如果未提供，将使用当前的项目数量。
     * @param minSize 列表的最小大小。如果未提供，将使用列表的当前大小。 
     */
    resizeToFit(itemCount?: number, minSize?: number): void {
        this._layout.resizeToFit(itemCount, minSize);
    }

    /**
     * @en If the list is a virtual list, this function can convert the child index to the index in the data list.
     * @param index The index of the child in the list.
     * @returns The index of the item in the data list. 
     * @zh 如果列表是虚拟列表，这个函数可以将孩子索引转换到数据列表中的索引。
     * @param index 列表中子项的索引。
     * @returns 数据列表中项目的索引。
     */
    childIndexToItemIndex(index: number): number {
        return this._layout.childIndexToItemIndex(index);
    }

    /**
     * @en If the list is a virtual list, this function can convert the item index in the data list to the child index.
     * @param index The index of the item in the data list. 
     * @returns The index of the child in the list.
     * @zh 如果列表是虚拟列表，这个函数可以将数据列表中的项目索引转换为子项索引。
     * @param index 数据列表中项目的索引。
     * @returns 列表中子项的索引。 
     */
    itemIndexToChildIndex(index: number): number {
        return this._layout.itemIndexToChildIndex(index);
    }

    /**
     * @en Refresh the virtual list.
     * @zh 刷新虚拟列表。
     */
    refreshVirtualList(): void {
        this._layout.refreshVirtualList();
    }

    /**
     * @en Set the list to be a virtual list.
     * @zh 设置列表为虚拟列表。
     */
    setVirtual(): void {
        this._setVirtual(false);
    }

    /**
     * @en Set the list to be virtual list, and has loop behavior.
     * @zh 设置列表为虚拟列表，并具有循环行为。
     */
    setVirtualAndLoop(): void {
        this._setVirtual(true);
    }

    private _setVirtual(loop: boolean): void {
        if (!this._layout._virtual) {
            if (this.scroller == null)
                throw new Error("Virtual list must be scrollable!");

            if (loop) {
                if (this._layout.type == LayoutType.FlowX || this._layout.type == LayoutType.FlowY)
                    throw new Error("Loop list does not support flowX or flowY layout!");

                this.scroller.bouncebackEffect = ScrollBounceBackEffect.Off;
            }
        }

        this._layout._setVirtual(loop);
    }

    /** @ignore */
    onAfterDeserialize(): void {
        super.onAfterDeserialize();

        if (SerializeUtil.hasProp("_initItemNum", "_itemData") && (LayaEnv.isPreview || !this._isDemo))
            this._buildInitItems();
    }

    /** @internal */
    _buildInitItems() {
        for (let i = this.children.length - 1; i >= 0; i--) {
            let child = this.getChildAt(i);
            if (child.hasHideFlag(HideFlags.HideAndDontSave))
                child.destroy();
        }

        if (this.itemTemplate == null)
            return;

        let itemData = this._itemData;
        for (let i = 0; i < this._initItemNum; i++) {
            let m: IListItemData = (itemData && i < itemData.length) ? itemData[i] : null;
            if (m != null) {
                let child = <GWidget>(m.res ? m.res.create() : this.getFromPool());
                child.hideFlags |= HideFlags.HideAndDontSave;
                child.text = m.title;
                child.icon = m.icon;
                if (child instanceof GButton) {
                    if (m.selectedTitle)
                        child.selectedTitle = m.selectedTitle;
                    if (m.selectedIcon)
                        child.selectedIcon = m.selectedIcon;
                    child.selected = false;
                }
                if (m.name != null)
                    child.name = m.name;
                this.addChild(child);
            }
            else
                this.addItemFromPool();
        }

        this.selection._refresh();
    }
}

interface IListItemData {
    res: Prefab;
    name: string;
    title: string;
    selectedTitle: string;
    icon: string;
    selectedIcon: string;
}