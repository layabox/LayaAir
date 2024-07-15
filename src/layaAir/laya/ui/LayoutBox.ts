import { Box } from "./Box";
import { Node } from "../display/Node"
import { Event } from "../events/Event"

/**
 * @en LayoutBox is a layout container class.
 * @zh LayoutBox 是一个布局容器类。
 */
export class LayoutBox extends Box {
    /**@internal */
    protected _space: number = 0;
    /**@internal */
    protected _align: string = "none";
    /**@internal */
    protected _itemChanged: boolean = false;

    /**
     * @en The space between child objects.
     * @zh 子对象的间隔。
     */
    get space(): number {
        return this._space;
    }

    set space(value: number) {
        this._space = value;
        this._setItemChanged();
    }

    /**
     * @en The alignment of child objects.
     * @zh 子对象对齐方式。
     */
    get align(): string {
        return this._align;
    }

    set align(value: string) {
        this._align = value;
        this._setItemChanged();
    }

    /**
     * @internal
     */
    protected _setItemChanged(): void {
        if (!this._itemChanged) {
            this._itemChanged = true;
            this.callLater(this.changeItems);
        }
    }

    /**
     * @internal
     * @en Change the layout of child objects.
     * @zh 改变子对象的布局。
     */
    protected changeItems(): void {
        this._itemChanged = false;
    }


    /**
     * @internal
     * @en Sort the item list. Default sorting rules can be changed by overriding.
     * @param items The item list.
     * @zh 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     */
    protected sortItem(items: any[]): void {
        if (items) items.sort(function (a: any, b: any): number { return a.y - b.y; });
    }

    /**@internal */
    private onResize(e: Event): void {
        this._setItemChanged();
    }

    /** 
     * @override
     * @en Adds a child object.
     * @param child The child object to add.
     * @returns The added child object.
     * @zh 添加子节点对象。
     * @param child 要添加的子节点对象。
     * @returns 添加的子节点对象。
    */
    addChild<T extends Node>(child: T): T {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChild(child);
    }

    /** 
     * @override
     * @en Adds a child object at a specified index position.
     * @param child The child object to add.
     * @param index The index position to add the child object.
     * @returns The added child object.
     * @zh 在指定的索引位置添加子节点对象。
     * @param child 要添加的子节点对象。
     * @param index 用于添加子节点对象的索引位置。
     * @returns 添加的子节点对象。
    */
    addChildAt(child: Node, index: number): Node {
        child.on(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.addChildAt(child, index);
    }

    /**
     * @override
     * @en Removes a child object at a specified index position.
     * @param index The index position of the child object.
     * @returns The removed child object.
     * @zh 删除指定索引位置的子节点对象。
     * @param index 子节点对象的索引位置。
     * @returns 删除的子节点对象。
    */
    removeChildAt(index: number): Node {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setItemChanged();
        return super.removeChildAt(index);
    }

    /**
     * @en Refresh
     * @zh 刷新
     */
    refresh(): void {
        this._setItemChanged();
    }
}