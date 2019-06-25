import { Box } from "././Box";
import { Node } from "../display/Node";
/**
 * <code>LayoutBox</code> 是一个布局容器类。
 */
export declare class LayoutBox extends Box {
    /**@private */
    protected _space: number;
    /**@private */
    protected _align: string;
    /**@private */
    protected _itemChanged: boolean;
    /** @inheritDoc	*/
    addChild(child: Node): Node;
    private onResize;
    /** @inheritDoc	*/
    addChildAt(child: Node, index: number): Node;
    /** @inheritDoc	*/
    removeChildAt(index: number): Node;
    /** 刷新。*/
    refresh(): void;
    /**
     * 改变子对象的布局。
     */
    protected changeItems(): void;
    /** 子对象的间隔。*/
    space: number;
    /** 子对象对齐方式。*/
    align: string;
    /**
     * 排序项目列表。可通过重写改变默认排序规则。
     * @param items  项目列表。
     */
    protected sortItem(items: any[]): void;
    protected _setItemChanged(): void;
}
