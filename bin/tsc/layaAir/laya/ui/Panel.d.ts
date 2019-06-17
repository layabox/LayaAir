import { Box } from "./Box";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { ScrollBar } from "./ScrollBar";
import { Node } from "../display/Node";
import { Sprite } from "../display/Sprite";
/**
 * <code>Panel</code> 是一个面板容器类。
 */
export declare class Panel extends Box {
    /**@private */
    protected _content: Box;
    /**@private */
    protected _vScrollBar: VScrollBar;
    /**@private */
    protected _hScrollBar: HScrollBar;
    /**@private */
    protected _scrollChanged: boolean;
    /**@private */
    protected _usedCache: string;
    /**@private */
    protected _elasticEnabled: boolean;
    /**
     * 创建一个新的 <code>Panel</code> 类实例。
     * <p>在 <code>Panel</code> 构造函数中设置属性width、height的值都为100。</p>
     */
    constructor();
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    destroyChildren(): void;
    /**@inheritDoc */
    protected createChildren(): void;
    /**@inheritDoc */
    addChild(child: Node): Node;
    /**
     * @private
     * 子对象的 <code>Event.RESIZE</code> 事件侦听处理函数。
     */
    private onResize;
    /**@inheritDoc */
    addChildAt(child: Node, index: number): Node;
    /**@inheritDoc */
    removeChild(child: Node): Node;
    /**@inheritDoc */
    removeChildAt(index: number): Node;
    /**@inheritDoc */
    removeChildren(beginIndex?: number, endIndex?: number): Node;
    /**@inheritDoc */
    getChildAt(index: number): Node;
    /**@inheritDoc */
    getChildByName(name: string): Node;
    /**@inheritDoc */
    getChildIndex(child: Node): number;
    /**@inheritDoc */
    readonly numChildren: number;
    /**@private */
    private changeScroll;
    /**@inheritDoc */
    protected _sizeChanged(): void;
    /**
     * @private
     * 获取内容宽度（以像素为单位）。
     */
    readonly contentWidth: number;
    /**
     * @private
     * 获取内容高度（以像素为单位）。
     */
    readonly contentHeight: number;
    /**
     * @private
     * 设置内容的宽度、高度（以像素为单位）。
     * @param width 宽度。
     * @param height 高度。
     */
    private setContentSize;
    /**
     * @inheritDoc
     */
    width: number;
    /**@inheritDoc */
    height: number;
    /**
     * 垂直方向滚动条皮肤。
     */
    vScrollBarSkin: string;
    /**
     * 水平方向滚动条皮肤。
     */
    hScrollBarSkin: string;
    /**
     * 垂直方向滚动条对象。
     */
    readonly vScrollBar: ScrollBar;
    /**
     * 水平方向滚动条对象。
     */
    readonly hScrollBar: ScrollBar;
    /**
     * 获取内容容器对象。
     */
    readonly content: Sprite;
    /**
     * @private
     * 滚动条的<code><code>Event.MOUSE_DOWN</code>事件侦听处理函数。</code>事件侦听处理函数。
     * @param scrollBar 滚动条对象。
     * @param e Event 对象。
     */
    protected onScrollBarChange(scrollBar: ScrollBar): void;
    /**
     * <p>滚动内容容器至设定的垂直、水平方向滚动条位置。</p>
     * @param x 水平方向滚动条属性value值。滚动条位置数字。
     * @param y 垂直方向滚动条属性value值。滚动条位置数字。
     */
    scrollTo(x?: number, y?: number): void;
    /**
     * 刷新滚动内容。
     */
    refresh(): void;
    /**@inheritDoc */
    cacheAs: string;
    /**是否开启橡皮筋效果*/
    elasticEnabled: boolean;
    private onScrollStart;
    private onScrollEnd;
    /**@private */
    protected _setScrollChanged(): void;
}
