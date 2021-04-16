import { Box } from "./Box";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { ScrollBar } from "./ScrollBar";
import { Node } from "../display/Node"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Rectangle } from "../maths/Rectangle"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * <code>Panel</code> 是一个面板容器类。
 */
export class Panel extends Box {
    /**@private */
    protected _content: Box;
    /**@private */
    protected _vScrollBar: VScrollBar;
    /**@private */
    protected _hScrollBar: HScrollBar;
    /**@private */
    protected _scrollChanged: boolean;
    /**@private */
    protected _usedCache: string = null;
    /**@private */
    protected _elasticEnabled: boolean = false;

    /**
     * 创建一个新的 <code>Panel</code> 类实例。
     * <p>在 <code>Panel</code> 构造函数中设置属性width、height的值都为100。</p>
     */
    constructor() {
        super();
        this.width = this.height = 100;
        //子对象缩放的情况下，优化会有问题，先屏蔽掉
        //_content.optimizeScrollRect = true;
    }

    /**@inheritDoc @override*/
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._content && this._content.destroy(destroyChild);
        this._vScrollBar && this._vScrollBar.destroy(destroyChild);
        this._hScrollBar && this._hScrollBar.destroy(destroyChild);
        this._vScrollBar = null;
        this._hScrollBar = null;
        this._content = null;
    }

    /**@inheritDoc @override*/
    destroyChildren(): void {
        this._content.destroyChildren();
    }

    /**@inheritDoc @override*/
    protected createChildren(): void {
        super.addChild(this._content = new Box());
    }

    /**@inheritDoc @override*/
    addChild(child: Node): Node {
        child.on(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.addChild(child);
    }

    /**
     * @private
     * 子对象的 <code>Event.RESIZE</code> 事件侦听处理函数。
     */
    private onResize(): void {
        this._setScrollChanged();
    }

    /**@inheritDoc @override*/
    addChildAt(child: Node, index: number): Node {
        child.on(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.addChildAt(child, index);
    }

    /**@inheritDoc @override*/
    removeChild(child: Node): Node {
        child.off(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.removeChild(child);
    }

    /**@inheritDoc @override*/
    removeChildAt(index: number): Node {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.removeChildAt(index);
    }

    /**@inheritDoc @override*/
    removeChildren(beginIndex: number = 0, endIndex: number = 0x7fffffff): Node {
        this._content.removeChildren(beginIndex, endIndex);
        this._setScrollChanged();
        return this;
    }

    /**@inheritDoc @override*/
    getChildAt(index: number): Node {
        return this._content.getChildAt(index);
    }

    /**@inheritDoc @override*/
    getChildByName(name: string): Node {
        return this._content.getChildByName(name);
    }

    /**@inheritDoc @override*/
    getChildIndex(child: Node): number {
        return this._content.getChildIndex(child);
    }

    /**@inheritDoc @override*/
    get numChildren(): number {
        return this._content.numChildren;
    }

    /**@private */
    private changeScroll(): void {
        this._scrollChanged = false;
        var contentW = this.contentWidth || 1;
        var contentH = this.contentHeight || 1;

        var vscroll = this._vScrollBar;
        var hscroll = this._hScrollBar;

        var vShow = vscroll && contentH > this._height;
		var hShow = hscroll && contentW > this._width;
        var showWidth = vShow ? this._width - vscroll.width : this._width;
        var showHeight = hShow ? this._height - hscroll.height : this._height;

        if (vscroll) {
            vscroll.x = this._width - vscroll.width;
            vscroll.y = 0;
            vscroll.height = this._height - (hShow ? hscroll.height : 0);
            vscroll.scrollSize = Math.max(this._height * 0.033, 1);
            vscroll.thumbPercent = showHeight / contentH;
            vscroll.setScroll(0, contentH - showHeight, vscroll.value);
        }
        if (hscroll) {
            hscroll.x = 0;
            hscroll.y = this._height - hscroll.height;
            hscroll.width = this._width - (vShow ? vscroll.width : 0);
            hscroll.scrollSize = Math.max(this._width * 0.033, 1);
            hscroll.thumbPercent = showWidth / contentW;
            hscroll.setScroll(0, contentW - showWidth, hscroll.value);
        }
    }

    /**@inheritDoc @override*/
    protected _sizeChanged(): void {
        super._sizeChanged();
        this.setContentSize(this._width, this._height);
    }

    /**
     * @private
     * 获取内容宽度（以像素为单位）。
     */
    get contentWidth(): number {
        var max = 0;
        for (var i = this._content.numChildren - 1; i > -1; i--) {
            var comp = <Sprite>this._content.getChildAt(i);
            max = Math.max(comp._x + comp.width * comp.scaleX - comp.pivotX, max);
        }
        return max;
    }

    /**
     * @private
     * 获取内容高度（以像素为单位）。
     */
    get contentHeight(): number {
        var max = 0;
        for (var i = this._content.numChildren - 1; i > -1; i--) {
            var comp = <Sprite>this._content.getChildAt(i);
            max = Math.max(comp._y + comp.height * comp.scaleY - comp.pivotY, max);
        }
        return max;
    }

    /**
     * @private
     * 设置内容的宽度、高度（以像素为单位）。
     * @param width 宽度。
     * @param height 高度。
     */
    private setContentSize(width: number, height: number): void {
        var content = this._content;
        content.width = width;
        content.height = height;
        content._style.scrollRect || (content.scrollRect = Rectangle.create());
        content._style.scrollRect.setTo(0, 0, width, height);
        content.scrollRect = content.scrollRect;
    }

    /**
     * @inheritDoc
     * @override
     */
    set width(value: number) {
        super.width = value;
        this._setScrollChanged();
    }
    /**
     * @inheritDoc
     * @override
     */
    get width() {
        return super.width;
    }

    /**@inheritDoc @override*/
    set height(value: number) {
        super.height = value;
        this._setScrollChanged();
    }
    /**@inheritDoc @override*/
    get height() {
        return super.height;
    }

    /**
     * 垂直方向滚动条皮肤。
     */
    get vScrollBarSkin(): string {
        return this._vScrollBar ? this._vScrollBar.skin : null;
    }

    set vScrollBarSkin(value: string) {
        if (this._vScrollBar == null) {
            super.addChild(this._vScrollBar = new VScrollBar());
            this._vScrollBar.on(Event.CHANGE, this, this.onScrollBarChange, [this._vScrollBar]);
            this._vScrollBar.target = this._content;
            this._vScrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
            this._setScrollChanged();
        }
        this._vScrollBar.skin = value;
    }

    /**
     * 水平方向滚动条皮肤。
     */
    get hScrollBarSkin(): string {
        return this._hScrollBar ? this._hScrollBar.skin : null;
    }

    set hScrollBarSkin(value: string) {
        if (this._hScrollBar == null) {
            super.addChild(this._hScrollBar = new HScrollBar());
            this._hScrollBar.on(Event.CHANGE, this, this.onScrollBarChange, [this._hScrollBar]);
            this._hScrollBar.target = this._content;
            this._hScrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
            this._setScrollChanged();
        }
        this._hScrollBar.skin = value;
    }

    /**
     * 垂直方向滚动条对象。
     */
    get vScrollBar(): ScrollBar {
        return this._vScrollBar;
    }

    /**
     * 水平方向滚动条对象。
     */
    get hScrollBar(): ScrollBar {
        return this._hScrollBar;
    }

    /**
     * 获取内容容器对象。
     */
    get content(): Sprite {
        return this._content;
    }

    /**
     * @private
     * 滚动条的<code><code>Event.MOUSE_DOWN</code>事件侦听处理函数。</code>事件侦听处理函数。
     * @param scrollBar 滚动条对象。
     * @param e Event 对象。
     */
    protected onScrollBarChange(scrollBar: ScrollBar): void {
        var rect = this._content._style.scrollRect;
        if (rect) {
            var start = Math.round(scrollBar.value);
            scrollBar.isVertical ? rect.y = start : rect.x = start;
            this._content.scrollRect = rect;
        }
    }

    /**
     * <p>滚动内容容器至设定的垂直、水平方向滚动条位置。</p>
     * @param x 水平方向滚动条属性value值。滚动条位置数字。
     * @param y 垂直方向滚动条属性value值。滚动条位置数字。
     */
    scrollTo(x: number = 0, y: number = 0): void {
        if (this.vScrollBar) this.vScrollBar.value = y;
        if (this.hScrollBar) this.hScrollBar.value = x;
    }

    /**
     * 刷新滚动内容。
     */
    refresh(): void {
        this.changeScroll();
    }

    /**@inheritDoc @override*/
    set cacheAs(value: string) {
        super.cacheAs = value;
        this._usedCache = null;
        if (value !== "none") {
            this._hScrollBar && this._hScrollBar.on(Event.START, this, this.onScrollStart);
            this._vScrollBar && this._vScrollBar.on(Event.START, this, this.onScrollStart);
        } else {
            this._hScrollBar && this._hScrollBar.off(Event.START, this, this.onScrollStart);
            this._vScrollBar && this._vScrollBar.off(Event.START, this, this.onScrollStart);
        }
    }
    /**
     * @inheritDoc
     * @override
     */
    get cacheAs() {
        return super.cacheAs;
    }

    /**是否开启橡皮筋效果*/
    get elasticEnabled(): boolean {
        return this._elasticEnabled;
    }

    set elasticEnabled(value: boolean) {
        this._elasticEnabled = value;
        if (this._vScrollBar) {
            this._vScrollBar.elasticDistance = value ? 200 : 0;
        }
        if (this._hScrollBar) {
            this._hScrollBar.elasticDistance = value ? 200 : 0;
        }
    }

    private onScrollStart(): void {
        this._usedCache || (this._usedCache = super.cacheAs);
        super.cacheAs = "none";
        this._hScrollBar && this._hScrollBar.once(Event.END, this, this.onScrollEnd);
        this._vScrollBar && this._vScrollBar.once(Event.END, this, this.onScrollEnd);
    }

    private onScrollEnd(): void {
        super.cacheAs = this._usedCache;
    }

    /**@private */
    protected _setScrollChanged(): void {
        if (!this._scrollChanged) {
            this._scrollChanged = true;
            this.callLater(this.changeScroll);
        }
    }
}

ILaya.regClass(Panel);
ClassUtils.regClass("laya.ui.Panel", Panel);
ClassUtils.regClass("Laya.Panel", Panel);