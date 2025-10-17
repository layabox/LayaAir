import { Point } from "../../maths/Point";
import { Rectangle } from "../../maths/Rectangle";
import { ILayout } from "./ILayout";

export interface IListLayout extends ILayout {
    /** 
     * @en Set the list item count. 
     * If the list is not virtual, specified number of items will be created.
     * If the list is virtual, only items in view will be created.
     * @zh 设置列表项数量。
     * 如果列表不是虚拟的，将创建指定数量的项。
     * 如果列表是虚拟的，则只会创建视图中的项。
    */
    get numItems(): number;
    set numItems(value: number);

    /**
     * @en The virtual list automatically measures the size of child items for layout, but you can also manually set the size of child items.
     * @zh 虚拟列表会自动测量子项的大小用于排版。但也可以手动设置子项的大小。
     */
    get itemSize(): Point;
    set itemSize(value: Point);

    /**
     * @en Maps the index of the display object in the virtual list to the index of the data item.
     * @zh 虚拟列表中将显示对象的索引映射到数据项的索引。
     */
    childIndexToItemIndex(index: number): number;

    /**
     * @en Maps the index of the data item to the index of the display object.
     * @zh 数据项的索引映射到显示对象的索引。
     */
    itemIndexToChildIndex(index: number): number;

    /**
     * @en Gets the rectangle area of the data item at the specified index.
     * @zh 获取指定索引的数据项的矩形区域。
     */
    getRectByItemIndex(index: number): Rectangle;

    /**
     * @en Refresh the virtual list. Generally, there is no need to call this manually.
     * @zh 刷新虚拟列表。一般不需要手动调用。
     */
    refreshVirtualList(): void;

    /** @internal */
    _setVirtual(loop: boolean): void;
    /** @internal */
    readonly _virtual: boolean;
}