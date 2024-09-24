import { TextInput } from "./TextInput";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { ScrollType, Styles } from "./Styles";
import { Event } from "../events/Event"
import { HideFlags } from "../Const";

/**
 * @en The TextArea class is used to create a multi-line text area display object for displaying and inputting text.
 * @zh TextArea 类用于创建多行的文本域显示对象，以显示和输入文本。
 */
export class TextArea extends TextInput {
    protected _scrollType: ScrollType = 0;
    protected _vScrollBarSkin: string;
    protected _hScrollBarSkin: string;
    protected _vScrollBar: VScrollBar;
    protected _hScrollBar: HScrollBar;

    /**
     * @en Scroll bar type. The range of values is 0-3.
     * - ScrollType.None(0): Does not display any scrollbars
     * - ScrollType.Horizontal(1):Displays only the horizontal scrollbar
     * - ScrollType.Vertical(2): Displays only the vertical scrollbar
     * - ScrollType.Both(3):  Displays both horizontal and vertical scrollbars
     * @zh 滚动条类型。取值范围0-3。
     * - ScrollType.None(0): 不显示任何滚动条
     * - ScrollType.Horizontal(1): 仅显示水平滚动条
     * - ScrollType.Vertical(2): 仅显示垂直滚动条
     * - ScrollType.Both(3): 同时显示水平和垂直滚动条
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

    /**
     * @en The vertical scrollbar instance.
     * @zh 垂直滚动条实例。
     */
    get vScrollBar(): VScrollBar {
        return this._vScrollBar;
    }

    /**
     * @en The horizontal scrollbar instance.
     * @zh 水平滚动条实例。
     */
    get hScrollBar(): HScrollBar {
        return this._hScrollBar;
    }

    /**
     * @en The maximum vertical scroll value.
     * @zh 最大垂直滚动值。
     */
    get maxScrollY(): number {
        return this._tf.maxScrollY;
    }

    /**
     * @en The vertical scroll position.
     * @zh 垂直滚动位置。
     */
    get scrollY(): number {
        return this._tf.scrollY;
    }

    /**
     * @en The maximum horizontal scroll value.
     * @zh 最大水平滚动值。
     */
    get maxScrollX(): number {
        return this._tf.maxScrollX;
    }

    /**
     * @en The horizontal scroll position.
     * @zh 当前的水平滚动位置。
     */
    get scrollX(): number {
        return this._tf.scrollX;
    }

    /**
     * @en The skin for the vertical scrollbar.
     * @zh 垂直方向滚动条的皮肤 。
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
     * @en The skin for the horizontal scrollbar.
     * @zh 水平方向滚动条的皮肤。
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
     * @en Creates an instance of TextArea.
     * @param text Text content string.
     * @zh 创建一个TextArea实例。
     * @param text 文本内容字符串。
     */
    constructor(text?: string) {
        super(text);
    }

    protected _onPostLayout(): void {
        super._onPostLayout();
        this.callLater(this.changeScroll);
    }

    /**
     * @internal
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this.callLater(this.changeScroll);
    }

    /**
     * @internal
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this.callLater(this.changeScroll);
    }

    protected initialize(): void {
        this.width = 180;
        this.height = 150;
        this._tf.wordWrap = true;
        this.multiline = true;
    }

    private createHScrollBar() {
        this._hScrollBar = new HScrollBar();
        this._hScrollBar.hideFlags = HideFlags.HideAndDontSave;
        this._hScrollBar._skinBaseUrl = this._skinBaseUrl;
        this._hScrollBar.skin = this._hScrollBarSkin;
        this.addChild(this._hScrollBar);
        this._hScrollBar.on(Event.CHANGE, this, this.onHBarChanged);
        this._hScrollBar.on(Event.LOADED, this, this.changeScroll);
        this._hScrollBar.mouseWheelEnable = false;
        this._hScrollBar.touchScrollEnable = false;
        this._hScrollBar.target = this._tf;
        this.callLater(this.changeScroll);
    }

    private createVScrollBar() {
        this._vScrollBar = new VScrollBar();
        this._vScrollBar.hideFlags = HideFlags.HideAndDontSave;
        this._vScrollBar._skinBaseUrl = this._skinBaseUrl;
        this._vScrollBar.skin = this._vScrollBarSkin;
        this.addChild(this._vScrollBar);
        this._vScrollBar.on(Event.CHANGE, this, this.onVBarChanged);
        this._vScrollBar.on(Event.LOADED, this, this.changeScroll);
        this._vScrollBar.touchScrollEnable = false;
        this._vScrollBar.target = this._tf;
        this.callLater(this.changeScroll);
    }

    protected onVBarChanged(e: Event): void {
        if (this._tf.scrollY != this._vScrollBar.value) {
            this._tf.scrollY = this._vScrollBar.value;
        }
    }

    protected onHBarChanged(e: Event): void {
        if (this._tf.scrollX != this._hScrollBar.value) {
            this._tf.scrollX = this._hScrollBar.value;
        }
    }

    private changeScroll(): void {
        let vShow = this._vScrollBar && this._tf.maxScrollY > 0;
        let hShow = this._hScrollBar && this._tf.maxScrollX > 0;
        let padding = this._tf.padding;
        let showWidth = vShow ? this._width - this._vScrollBar.width - padding[2] : this._width;
        let showHeight = hShow ? this._height - this._hScrollBar.height - padding[3] : this._height;

        this._tf.size(showWidth, showHeight);

        if (this._vScrollBar) {
            this._vScrollBar.x = this._width - this._vScrollBar.width - padding[2];
            this._vScrollBar.y = padding[1];
            this._vScrollBar.height = this._height - (hShow ? this._hScrollBar.height : 0) - padding[1] - padding[3];
            this._vScrollBar.scrollSize = 1;
            this._vScrollBar.thumbPercent = showHeight / Math.max(this._tf.textHeight, showHeight);
            this._vScrollBar.setScroll(1, this._tf.maxScrollY, this._tf.scrollY);
            this._vScrollBar.visible = vShow;
        }
        if (this._hScrollBar) {
            this._hScrollBar.x = padding[0];
            this._hScrollBar.y = this._height - this._hScrollBar.height - padding[3];
            this._hScrollBar.width = this._width - (vShow ? this._vScrollBar.width : 0) - padding[0] - padding[2];
            this._hScrollBar.scrollSize = Math.max(showWidth * 0.033, 1);
            this._hScrollBar.thumbPercent = showWidth / Math.max(this._tf.textWidth, showWidth);
            this._hScrollBar.setScroll(0, this.maxScrollX, this.scrollX);
            this._hScrollBar.visible = hShow;
        }
    }

    /**
     * @en Scroll to a certain position
     * @zh 滚动到某个位置。
     */
    scrollTo(y: number): void {
        this.commitMeasure();
        this._tf.scrollY = y;
    }

    /**
     * @en Destroys the instance.
     * @param destroyChild Whether to destroy child elements as well. Defaults to true.
     * @zh 销毁实例。
     * @param destroyChild 是否同时销毁子元素，默认为 true。
     */
    destroy(destroyChild: boolean = true): void {
        this._vScrollBar && this._vScrollBar.destroy();
        this._hScrollBar && this._hScrollBar.destroy();
        this._vScrollBar = null;
        this._hScrollBar = null;
        super.destroy(destroyChild);
    }
}