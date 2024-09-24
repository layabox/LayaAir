import { Box } from "./Box";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { ScrollBar } from "./ScrollBar";
import { Node } from "../display/Node"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Rectangle } from "../maths/Rectangle"
import { HideFlags } from "../Const";
import { ScrollType } from "./Styles";

/**
 * @en Panel is a panel container class.
 * @zh Panel 是一个面板容器类。
 */
export class Panel extends Box {
    protected _content: Box;
    protected _vScrollBar: VScrollBar;
    protected _hScrollBar: HScrollBar;
    protected _scrollChanged: boolean;
    protected _usedCache: string = null;
    protected _elasticEnabled: boolean = false;
    protected _scrollType: ScrollType = 0;
    protected _vScrollBarSkin: string;
    protected _hScrollBarSkin: string;

    /**
     * @en Creates an instance of Panel, and sets the width and height of it.
     * @zh 创建一个`Panel`实例，属性 `width` 和 `height` 的默认值均为 100。
     */
    constructor() {
        super();
        this.width = this.height = 100;
        //子对象缩放的情况下，优化会有问题，先屏蔽掉
        //_content.optimizeScrollRect = true;
    }

    /**
     * @en Destroy this object.
     * @param destroyChild Whether to destroy the child objects as well.
     * @zh 销毁此对象。
     * @param destroyChild 是否同时销毁子对象。
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._content && this._content.destroy(destroyChild);
        this._vScrollBar && this._vScrollBar.destroy(destroyChild);
        this._hScrollBar && this._hScrollBar.destroy(destroyChild);
        this._vScrollBar = null;
        this._hScrollBar = null;
        this._content = null;
    }

    /**
     * @en Destroy all child objects.
     * @zh 销毁所有的子对象。
     */
    destroyChildren(): void {
        this._content.destroyChildren();
    }

    protected createChildren(): void {
        this._content = new Box();
        this._content.hideFlags = HideFlags.HideAndDontSave;
        super.addChild(this._content);
    }

    /**
     * @en Add a child object.
     * @param child The child object to add.
     * @returns The added child object.
     * @zh 添加一个节点子对象。
     * @param child 要添加的子节点对象。
     * @returns 添加的子节点对象。
     */
    addChild<T extends Node>(child: T): T {
        child.on(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.addChild(child);
    }

    /**
    * @en Event handler for the child object's Event.RESIZE event.
    * @zh 子对象的 Event.RESIZE 事件侦听处理函数。
    */

    private onResize(): void {
        this._setScrollChanged();
    }

    /**
     * @en Add a child object at a specific index position.
     * @param child The child object to add.
     * @param index The index position to place the child at.
     * @returns The child object that was added.
     * @zh 在指定的索引位置添加一个子节点对象。
     * @param child 要添加的子节点对象。
     * @param index 子节点对象的索引位置。
     * @returns 添加的子节点对象。
     */
    addChildAt(child: Node, index: number): Node {
        child.on(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.addChildAt(child, index);
    }

    /**
     * @en Remove a child object.
     * @param child The child object to remove.
     * @returns The removed child object.
     * @zh 移除一个子节点对象。
     * @param child 要移除的子节点对象。
     * @returns 移除的子节点对象。
     */
    removeChild(child: Node): Node {
        child.off(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        if (child._parent == this && this._children) {
            let index = this._children.indexOf(child);
            if (index != -1) {
                this._children.splice(index, 1);
                (<any>child)._setParent(null);
            }
            return child;
        }
        else
            return this._content.removeChild(child);
    }

    /**
     * @en Remove a child object at a specific index position.
     * @param index The index position of the child object.
     * @returns The removed child object.
     * @zh 移除指定索引位置的子节点对象。
     * @param index 子节点对象的索引位置。
     * @returns 移除的子节点对象。
     */
    removeChildAt(index: number): Node {
        this.getChildAt(index).off(Event.RESIZE, this, this.onResize);
        this._setScrollChanged();
        return this._content.removeChildAt(index);
    }

    /**
     * @en Remove a range of children from the object.
     * @param beginIndex The beginning position.
     * @param endIndex The ending position. The default value is 0x7fffffff.
     * @returns The Panel object itself.
     * @zh 移除指定范围的子节点对象。
     * @param beginIndex 开始位置。
     * @param endIndex 结束位置。默认值为 0x7fffffff。
     * @returns 返回对象本身。
     */
    removeChildren(beginIndex: number = 0, endIndex: number = 0x7fffffff): Node {
        this._content.removeChildren(beginIndex, endIndex);
        this._setScrollChanged();
        return this;
    }

    /**
     * @en Returns the child object at a specific index position.
     * @param index The index position of the child object.
     * @returns The child object at the specified index position.
     * @zh 返回指定索引位置的子节点对象。
     * @param index 子节点对象的索引位置。
     * @returns 指定索引位置处的子节点对象。
     */
    getChildAt(index: number): Node {
        return this._content.getChildAt(index);
    }

    /**
     * @en Returns a child object with a specific name.
     * @param name The name of the child object.
     * @returns The child object with the specified name.
     * @zh 返回具有指定名称的子节点对象。
     * @param name 子节点对象的名称。
     * @returns 具有指定名称的子节点对象。
     */
    getChildByName(name: string): Node {
        return this._content.getChildByName(name);
    }

    /**
     * @en Returns the index position of a specific child object.
     * @param child The child object.
     * @returns The index position of the child object.
     * @zh 返回指定子节点对象的索引位置。
     * @param child 子节点对象。
     * @returns 子节点对象的索引位置。
     */
    getChildIndex(child: Node): number {
        return this._content.getChildIndex(child);
    }

    /**
     * @en The number of child objects.
     * @zh 子节点对象数量。
     */
    get numChildren(): number {
        return this._content.numChildren;
    }

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
            vscroll.height = this._height - (hShow ? hscroll.height : 0);
            vscroll.scrollSize = Math.max(this._height * 0.033, 1);
            vscroll.thumbPercent = showHeight / contentH;
            vscroll.setScroll(0, contentH - showHeight);
        }
        if (hscroll) {
            hscroll.width = this._width - (vShow ? vscroll.width : 0);
            hscroll.scrollSize = Math.max(this._width * 0.033, 1);
            hscroll.thumbPercent = showWidth / contentW;
            hscroll.setScroll(0, contentW - showWidth);
        }
    }

    protected _sizeChanged(): void {
        super._sizeChanged();
        this.setContentSize(this._width, this._height);
    }

    /**
     * @en Get the width of the content area in pixels.
     * @zh 获取内容区域宽度（以像素为单位）。
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
     * @en Get the height of the content area in pixels.
     * @zh 获取内容区域高度（以像素为单位）。
     */
    get contentHeight(): number {
        let max = 0;
        for (let i = this._content.numChildren - 1; i > -1; i--) {
            let comp = <Sprite>this._content.getChildAt(i);
            max = Math.max(comp._y + comp.height * comp.scaleY - comp.pivotY, max);
        }
        return max;
    }

    /**
     * @en Sets the width and height of the content (in pixels).
     * @param width The width.
     * @param height The height.
     * @zh 设置内容的宽度、高度（以像素为单位）。
     * @param width 宽度。
     * @param height 高度。
     */
    private setContentSize(width: number, height: number): void {
        let content = this._content;
        content.width = width;
        content.height = height;
        content._style.scrollRect || (content.scrollRect = Rectangle.create());
        content._style.scrollRect.setTo(0, 0, width, height);
        content.scrollRect = content.scrollRect;
    }

    /**@ignore */
    _setWidth(value: number) {
        super._setWidth(value);
        this._setScrollChanged();
    }

    /**@ignore */
    _setHeight(value: number) {
        super._setHeight(value);
        this._setScrollChanged();
    }

    /**
     * @en Scroll bar type. The range of values is 0-3.
     * ScrollType.None(0): Does not display any scrollbars
     * ScrollType.Horizontal(1):Displays only the horizontal scrollbar
     * ScrollType.Vertical(2): Displays only the vertical scrollbar
     * ScrollType.Both(3):  Displays both horizontal and vertical scrollbars
     * @zh 滚动条类型。取值范围0-3。
     * ScrollType.None(0): 不显示任何滚动条
     * ScrollType.Horizontal(1): 仅显示水平滚动条
     * ScrollType.Vertical(2): 仅显示垂直滚动条
     * ScrollType.Both(3): 同时显示水平和垂直滚动条
     */
    get scrollType() {
        return this._scrollType;
    }

    set scrollType(value: ScrollType) {
        this._scrollType = value;

        if (this._scrollType == ScrollType.None) {
            if (this._hScrollBar) {
                this._hScrollBar.destroy();
                this._hScrollBar = null;
            }
            if (this._vScrollBar) {
                this._vScrollBar.destroy();
                this._vScrollBar = null;
            }
        }
        else if (this._scrollType == ScrollType.Horizontal) {
            if (this._vScrollBar) {
                this._vScrollBar.destroy();
                this._vScrollBar = null;
            }

            if (this._hScrollBar)
                this._hScrollBar.skin = this._hScrollBarSkin;
            else
                this.createHScrollBar();
        }
        else if (this._scrollType == ScrollType.Vertical) {
            if (this._hScrollBar) {
                this._hScrollBar.destroy();
                this._hScrollBar = null;
            }

            if (this._vScrollBar)
                this._vScrollBar.skin = this._vScrollBarSkin;
            else
                this.createVScrollBar();
        }
        else { //both
            if (this._hScrollBar)
                this._hScrollBar.skin = this._hScrollBarSkin;
            else
                this.createHScrollBar();
            if (this._vScrollBar)
                this._vScrollBar.skin = this._vScrollBarSkin;
            else
                this.createVScrollBar();
        }
    }

    private createHScrollBar() {
        let scrollBar = this._hScrollBar = new HScrollBar();
        scrollBar.hideFlags = HideFlags.HideAndDontSave;
        scrollBar.on(Event.CHANGE, this, this.onScrollBarChange, [scrollBar]);
        scrollBar.target = this._content;
        scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
        scrollBar.bottom = 0;
        scrollBar._skinBaseUrl = this._skinBaseUrl;
        scrollBar.skin = this._hScrollBarSkin;
        scrollBar.on(Event.LOADED, this, this._setScrollChanged);
        super.addChild(scrollBar);
        this._setScrollChanged();
    }

    private createVScrollBar() {
        let scrollBar = this._vScrollBar = new VScrollBar();
        scrollBar.hideFlags = HideFlags.HideAndDontSave;
        scrollBar.on(Event.CHANGE, this, this.onScrollBarChange, [scrollBar]);
        scrollBar.target = this._content;
        scrollBar.elasticDistance = this._elasticEnabled ? 200 : 0;
        scrollBar.right = 0;
        scrollBar._skinBaseUrl = this._skinBaseUrl;
        scrollBar.skin = this._vScrollBarSkin;
        scrollBar.on(Event.LOADED, this, this._setScrollChanged);
        super.addChild(scrollBar);
        this._setScrollChanged();
    }

    /**
     * @en The skin of the vertical scrollbar.
     * @zh 垂直方向滚动条皮肤。
     */
    get vScrollBarSkin(): string {
        return this._vScrollBarSkin;
    }

    set vScrollBarSkin(value: string) {
        if (value == "") value = null;
        if (this._vScrollBarSkin != value) {
            this._vScrollBarSkin = value;
            if (this._scrollType == 0)
                this.scrollType = ScrollType.Vertical;
            else if (this._scrollType == ScrollType.Horizontal)
                this.scrollType = ScrollType.Both;
            else
                this.scrollType = this._scrollType;
        }

    }

    /**
     * @en The skin of the horizontal scrollbar.
     * @zh 水平方向滚动条皮肤。
     */
    get hScrollBarSkin(): string {
        return this._hScrollBarSkin;
    }

    set hScrollBarSkin(value: string) {
        if (value == "") value = null;
        if (this._hScrollBarSkin != value) {
            this._hScrollBarSkin = value;
            if (this._scrollType == 0)
                this.scrollType = ScrollType.Horizontal;
            else if (this._scrollType == ScrollType.Vertical)
                this.scrollType = ScrollType.Both;
            this.scrollType = this._scrollType;
        }
    }

    /**
     * @en The vertical scrollbar object.
     * @zh 垂直方向滚动条对象。
     */
    get vScrollBar(): ScrollBar {
        return this._vScrollBar;
    }

    /**
     * @en The horizontal scrollbar object.
     * @zh 水平方向滚动条对象。
     */
    get hScrollBar(): ScrollBar {
        return this._hScrollBar;
    }

    /**
     * @en Get the content container object.
     * @zh 获取内容容器对象。
     */
    get content(): Sprite {
        return this._content;
    }

    /**
     * @en Event.MOUSE_DOWN event handler for the scrollbar.
     * @param scrollBar The scrollbar object.
     * @zh 滚动条的 Event.MOUSE_DOWN 事件侦听处理函数。
     * @param scrollBar 滚动条对象。
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
     * @en Scroll the content container to the specified position of the vertical and horizontal scrollbars.
     * @param x The value of the `value` property of the horizontal scrollbar.
     * @param y The value of the `value` property of the vertical scrollbar.
     * @zh 滚动内容容器至设定的垂直、水平方向滚动条位置。
     * @param x 水平方向滚动条属性value值。滚动条位置数字。
     * @param y 垂直方向滚动条属性value值。滚动条位置数字。
     */
    scrollTo(x: number = 0, y: number = 0): void {
        if (this.vScrollBar) this.vScrollBar.value = y;
        if (this.hScrollBar) this.hScrollBar.value = x;
    }

    /**
     * @en Refresh the scroll content.
     * @zh 刷新滚动内容。
     */
    refresh(): void {
        this.changeScroll();
    }

    get cacheAs() {
        return super.cacheAs;
    }
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
     * @en Whether to enable the elastic effect.
     * @zh 是否开启橡皮筋效果。
     */
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
    
    protected _setScrollChanged(): void {
        if (!this._scrollChanged) {
            this._scrollChanged = true;
            this.callLater(this.changeScroll);
        }
    }
}