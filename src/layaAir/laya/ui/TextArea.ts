import { TextInput } from "./TextInput";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { ScrollType, Styles } from "./Styles";
import { Event } from "../events/Event"
import { HideFlags } from "../Const";

/**
 * <code>TextArea</code> 类用于创建显示对象以显示和输入文本。
 * @example <caption>以下示例代码，创建了一个 <code>TextArea</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.TextArea;
 *		import laya.utils.Handler;
 *		public class TextArea_Example
 *		{
 *			public function TextArea_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load(["resource/ui/input.png"], Handler.create(this, onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				var textArea:TextArea = new TextArea("这个一个TextArea实例。");//创建一个 TextArea 类的实例对象 textArea 。
 *				textArea.skin = "resource/ui/input.png";//设置 textArea 的皮肤。
 *				textArea.sizeGrid = "4,4,4,4";//设置 textArea 的网格信息。
 *				textArea.color = "#008fff";//设置 textArea 的文本颜色。
 *				textArea.font = "Arial";//设置 textArea 的字体。
 *				textArea.bold = true;//设置 textArea 的文本显示为粗体。
 *				textArea.fontSize = 20;//设置 textArea 的文本字体大小。
 *				textArea.wordWrap = true;//设置 textArea 的文本自动换行。
 *				textArea.x = 100;//设置 textArea 对象的属性 x 的值，用于控制 textArea 对象的显示位置。
 *				textArea.y = 100;//设置 textArea 对象的属性 y 的值，用于控制 textArea 对象的显示位置。
 *				textArea.width = 300;//设置 textArea 的宽度。
 *				textArea.height = 200;//设置 textArea 的高度。
 *				Laya.stage.addChild(textArea);//将 textArea 添加到显示列表。
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * Laya.loader.load(["resource/ui/input.png"], laya.utils.Handler.create(this, onLoadComplete));//加载资源。
 * function onLoadComplete() {
 *     var textArea = new laya.ui.TextArea("这个一个TextArea实例。");//创建一个 TextArea 类的实例对象 textArea 。
 *     textArea.skin = "resource/ui/input.png";//设置 textArea 的皮肤。
 *     textArea.sizeGrid = "4,4,4,4";//设置 textArea 的网格信息。
 *     textArea.color = "#008fff";//设置 textArea 的文本颜色。
 *     textArea.font = "Arial";//设置 textArea 的字体。
 *     textArea.bold = true;//设置 textArea 的文本显示为粗体。
 *     textArea.fontSize = 20;//设置 textArea 的文本字体大小。
 *     textArea.wordWrap = true;//设置 textArea 的文本自动换行。
 *     textArea.x = 100;//设置 textArea 对象的属性 x 的值，用于控制 textArea 对象的显示位置。
 *     textArea.y = 100;//设置 textArea 对象的属性 y 的值，用于控制 textArea 对象的显示位置。
 *     textArea.width = 300;//设置 textArea 的宽度。
 *     textArea.height = 200;//设置 textArea 的高度。
 *     Laya.stage.addChild(textArea);//将 textArea 添加到显示列表。
 * }
 * @example
 * import TextArea = laya.ui.TextArea;
 * import Handler = laya.utils.Handler;
 * class TextArea_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load(["resource/ui/input.png"], Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
	
 *     private onLoadComplete(): void {
 *         var textArea: TextArea = new TextArea("这个一个TextArea实例。");//创建一个 TextArea 类的实例对象 textArea 。
 *         textArea.skin = "resource/ui/input.png";//设置 textArea 的皮肤。
 *         textArea.sizeGrid = "4,4,4,4";//设置 textArea 的网格信息。
 *         textArea.color = "#008fff";//设置 textArea 的文本颜色。
 *         textArea.font = "Arial";//设置 textArea 的字体。
 *         textArea.bold = true;//设置 textArea 的文本显示为粗体。
 *         textArea.fontSize = 20;//设置 textArea 的文本字体大小。
 *         textArea.wordWrap = true;//设置 textArea 的文本自动换行。
 *         textArea.x = 100;//设置 textArea 对象的属性 x 的值，用于控制 textArea 对象的显示位置。
 *         textArea.y = 100;//设置 textArea 对象的属性 y 的值，用于控制 textArea 对象的显示位置。
 *         textArea.width = 300;//设置 textArea 的宽度。
 *         textArea.height = 200;//设置 textArea 的高度。
 *         Laya.stage.addChild(textArea);//将 textArea 添加到显示列表。
 *     }
 * }
 */
export class TextArea extends TextInput {
    protected _scrollType: ScrollType = 0;
    protected _vScrollBarSkin: string;
    protected _hScrollBarSkin: string;
    /**@private */
    protected _vScrollBar: VScrollBar;
    /**@private */
    protected _hScrollBar: HScrollBar;

    /**
     * <p>创建一个新的 <code>TextArea</code> 示例。</p>
     * @param text 文本内容字符串。
     */
    constructor(text: string = "") {
        super(text);
    }

    protected _onPostLayout(): void {
        super._onPostLayout();
        this.callLater(this.changeScroll);
    }
    /**
     * 
     * @param destroyChild 
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        this._vScrollBar && this._vScrollBar.destroy();
        this._hScrollBar && this._hScrollBar.destroy();
        this._vScrollBar = null;
        this._hScrollBar = null;
        super.destroy(destroyChild);
    }
    /**
     * @override
     */
    protected initialize(): void {
        this.width = 180;
        this.height = 150;
        this._tf.wordWrap = true;
        this.multiline = true;
    }
    /**
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this.callLater(this.changeScroll);
    }
    /**

    /**
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this.callLater(this.changeScroll);
    }

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
        this._hScrollBar = new HScrollBar();
        this._hScrollBar.hideFlags = HideFlags.HideAndDontSave;
        this._hScrollBar._skinBaseUrl = this._skinBaseUrl;
        this._hScrollBar.skin = this._hScrollBarSkin;
        this.addChild(this._hScrollBar);
        this._hScrollBar.on(Event.CHANGE, this, this.onHBarChanged);
        this._hScrollBar.on(Event.LOADED, this, this.changeScroll);
        this._hScrollBar.mouseWheelEnable = false;
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
        this._vScrollBar.target = this._tf;
        this.callLater(this.changeScroll);
    }

    /**
     * 垂直方向滚动条皮肤。
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
     * 水平方向滚动条皮肤。
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

    /**垂直滚动条实体*/
    get vScrollBar(): VScrollBar {
        return this._vScrollBar;
    }

    /**水平滚动条实体*/
    get hScrollBar(): HScrollBar {
        return this._hScrollBar;
    }

    /**垂直滚动最大值*/
    get maxScrollY(): number {
        return this._tf.maxScrollY;
    }

    /**垂直滚动值*/
    get scrollY(): number {
        return this._tf.scrollY;
    }

    /**水平滚动最大值*/
    get maxScrollX(): number {
        return this._tf.maxScrollX;
    }

    /**水平滚动值*/
    get scrollX(): number {
        return this._tf.scrollX;
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

    /**滚动到某个位置*/
    scrollTo(y: number): void {
        this.commitMeasure();
        this._tf.scrollY = y;
    }
}