import { UIComponent } from "./UIComponent";
import { Styles } from "./Styles";
import { Const } from "../Const";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";
import { AutoBitmap } from "./AutoBitmap";
import { UIUtils } from "./UIUtils";
import { Handler } from "../utils/Handler";
import { Utils } from "../utils/Utils";
import { WeakObject } from "../utils/WeakObject";
import { ILaya } from "../../ILaya";
/**
 * 当按钮的选中状态（ <code>selected</code> 属性）发生改变时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * <code>Button</code> 组件用来表示常用的多态按钮。 <code>Button</code> 组件可显示文本标签、图标或同时显示两者。	 *
 * <p>可以是单态，两态和三态，默认三态(up,over,down)。</p>
 *
 * @example <caption>以下示例代码，创建了一个 <code>Button</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.Button;
 *		import laya.utils.Handler;
 *		public class Button_Example
 *		{
 *			public function Button_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				trace("资源加载完成！");
 *				var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
 *				button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *				button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *				button.clickHandler = new Handler(this, onClickButton,[button]);//设置 button 的点击事件处理器。
 *				Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
 *			}
 *			private function onClickButton(button:Button):void
 *			{
 *				trace("按钮button被点击了！");
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源
 * function loadComplete()
 * {
 *     console.log("资源加载完成！");
 *     var button = new laya.ui.Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。
 *     button.x =100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *     button.y =100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *     button.clickHandler = laya.utils.Handler.create(this,onClickButton,[button],false);//设置 button 的点击事件处理函数。
 *     Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
 * }
 * function onClickButton(button)
 * {
 *     console.log("按钮被点击了。",button);
 * }
 * @example
 * import Button=laya.ui.Button;
 * import Handler=laya.utils.Handler;
 * class Button_Example{
 *     constructor()
 *     {
 *         Laya.init(640, 800);
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load("resource/ui/button.png", laya.utils.Handler.create(this,this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete()
 *     {
 *         var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
 *         button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *         button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *         button.clickHandler = new Handler(this, this.onClickButton,[button]);//设置 button 的点击事件处理器。
 *         Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
 *     }
 *     private onClickButton(button:Button):void
 *     {
 *         console.log("按钮button被点击了！")
 *     }
 * }
 */
export class Button extends UIComponent {
    /**
     * 创建一个新的 <code>Button</code> 类实例。
     * @param skin 皮肤资源地址。
     * @param label 按钮的文本内容。
     */
    constructor(skin = null, label = "") {
        super();
        /**
         * @private
         * 按钮文本标签的颜色值。
         */
        this._labelColors = Styles.buttonLabelColors;
        /**
         * @private
         * 按钮的状态值。
         */
        this._state = 0;
        /**
         * @private
         * 指定此显示对象是否自动计算并改变大小等属性。
         */
        this._autoSize = true; // 注意 由于构造函数执行顺序的区别，这里设置为true真的会导致ts的值为true，as的为false （as的 后调用super）
        /**
         * @private
         * 按钮的状态数。
         */
        this._stateNum = Styles.buttonStateNum;
        /**
         * @private
         */
        this._stateChanged = false;
        this.skin = skin;
        this.label = label;
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._bitmap && this._bitmap.destroy();
        this._text && this._text.destroy(destroyChild);
        this._bitmap = null;
        this._text = null;
        this._clickHandler = null;
        this._labelColors = this._sources = this._strokeColors = null;
    }
    /**@inheritDoc */
    /*override*/ createChildren() {
        this.graphics = this._bitmap = new AutoBitmap();
    }
    /**@private */
    createText() {
        if (!this._text) {
            this._text = new Text();
            this._text.overflow = Text.HIDDEN;
            this._text.align = "center";
            this._text.valign = "middle";
            this._text.width = this._width;
            this._text.height = this._height;
        }
    }
    /**@inheritDoc */
    /*override*/ initialize() {
        if (this._mouseState !== 1) {
            this.mouseEnabled = true;
            this._setBit(Const.HAS_MOUSE, true);
        }
        this._createListener(Event.MOUSE_OVER, this, this.onMouse, null, false, false);
        this._createListener(Event.MOUSE_OUT, this, this.onMouse, null, false, false);
        this._createListener(Event.MOUSE_DOWN, this, this.onMouse, null, false, false);
        this._createListener(Event.MOUSE_UP, this, this.onMouse, null, false, false);
        this._createListener(Event.CLICK, this, this.onMouse, null, false, false);
    }
    /**
     * 对象的 <code>Event.MOUSE_OVER、Event.MOUSE_OUT、Event.MOUSE_DOWN、Event.MOUSE_UP、Event.CLICK</code> 事件侦听处理函数。
     * @param e Event 对象。
     */
    onMouse(e) {
        if (this.toggle === false && this._selected)
            return;
        if (e.type === Event.CLICK) {
            this.toggle && (this.selected = !this._selected);
            this._clickHandler && this._clickHandler.run();
            return;
        }
        !this._selected && (this.state = Button.stateMap[e.type]);
    }
    /**
     * <p>对象的皮肤资源地址。</p>
     * 支持单态，两态和三态，用 <code>stateNum</code> 属性设置
     * <p>对象的皮肤地址，以字符串表示。</p>
     * @see #stateNum
     */
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (value) {
                if (!Loader.getRes(value)) {
                    window.Laya.loader.load(this._skin, Handler.create(this, this._skinLoaded), null, Loader.IMAGE, 1); //TODO 
                }
                else {
                    this._skinLoaded();
                }
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this.callLater(this.changeClips);
        this._setStateChanged();
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    /**
     * <p>指定对象的状态值，以数字表示。</p>
     * <p>默认值为3。此值决定皮肤资源图片的切割方式。</p>
     * <p><b>取值：</b>
     * <li>1：单态。图片不做切割，按钮的皮肤状态只有一种。</li>
     * <li>2：两态。图片将以竖直方向被等比切割为2部分，从上向下，依次为
     * 弹起状态皮肤、
     * 按下和经过及选中状态皮肤。</li>
     * <li>3：三态。图片将以竖直方向被等比切割为3部分，从上向下，依次为
     * 弹起状态皮肤、
     * 经过状态皮肤、
     * 按下和选中状态皮肤</li>
     * </p>
     */
    get stateNum() {
        return this._stateNum;
    }
    set stateNum(value) {
        if (typeof value == 'string') {
            value = parseInt(value);
        }
        if (this._stateNum != value) {
            this._stateNum = value < 1 ? 1 : value > 3 ? 3 : value;
            this.callLater(this.changeClips);
        }
    }
    /**
     * @private
     * 对象的资源切片发生改变。
     */
    changeClips() {
        var img = Loader.getRes(this._skin);
        if (!img) {
            console.log("lose skin", this._skin);
            return;
        }
        var width = img.sourceWidth;
        var height = img.sourceHeight / this._stateNum;
        img.$_GID || (img.$_GID = Utils.getGID());
        var key = img.$_GID + "-" + this._stateNum;
        var clips = WeakObject.I.get(key);
        if (!Utils.isOkTextureList(clips)) {
            clips = null;
        }
        if (clips)
            this._sources = clips;
        else {
            this._sources = [];
            if (this._stateNum === 1) {
                this._sources.push(img);
            }
            else {
                for (var i = 0; i < this._stateNum; i++) {
                    this._sources.push(Texture.createFromTexture(img, 0, height * i, width, height));
                }
            }
            WeakObject.I.set(key, this._sources);
        }
        if (this._autoSize) {
            this._bitmap.width = this._width || width;
            this._bitmap.height = this._height || height;
            if (this._text) {
                this._text.width = this._bitmap.width;
                this._text.height = this._bitmap.height;
            }
        }
        else {
            this._text && (this._text.x = width);
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ measureWidth() {
        this.runCallLater(this.changeClips);
        if (this._autoSize)
            return this._bitmap.width;
        this.runCallLater(this.changeState);
        return this._bitmap.width + (this._text ? this._text.width : 0);
    }
    /**
     * @inheritDoc
     */
    /*override*/ measureHeight() {
        this.runCallLater(this.changeClips);
        return this._text ? Math.max(this._bitmap.height, this._text.height) : this._bitmap.height;
    }
    /**
     * 按钮的文本内容。
     */
    get label() {
        return this._text ? this._text.text : null;
    }
    set label(value) {
        if (!this._text && !value)
            return;
        this.createText();
        if (this._text.text != value) {
            value && !this._text.parent && this.addChild(this._text);
            this._text.text = (value + "").replace(/\\n/g, "\n");
            this._setStateChanged();
        }
    }
    /**
     * 表示按钮的选中状态。
     * <p>如果值为true，表示该对象处于选中状态。否则该对象处于未选中状态。</p>
     */
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (this._selected != value) {
            this._selected = value;
            this.state = this._selected ? 2 : 0;
            this.event(Event.CHANGE);
        }
    }
    /**
     * 对象的状态值。
     * @see #stateMap
     */
    get state() {
        return this._state;
    }
    set state(value) {
        if (this._state != value) {
            this._state = value;
            this._setStateChanged();
        }
    }
    /**
     * @private
     * 改变对象的状态。
     */
    changeState() {
        this._stateChanged = false;
        this.runCallLater(this.changeClips);
        var index = this._state < this._stateNum ? this._state : this._stateNum - 1;
        this._sources && (this._bitmap.source = this._sources[index]);
        if (this.label) {
            this._text.color = this._labelColors[index];
            if (this._strokeColors)
                this._text.strokeColor = this._strokeColors[index];
        }
    }
    /**
     * 表示按钮各个状态下的文本颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
     */
    get labelColors() {
        return this._labelColors.join(",");
    }
    set labelColors(value) {
        this._labelColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
        this._setStateChanged();
    }
    /**
     * 表示按钮各个状态下的描边颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
     */
    get strokeColors() {
        return this._strokeColors ? this._strokeColors.join(",") : "";
    }
    set strokeColors(value) {
        this._strokeColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
        this._setStateChanged();
    }
    /**
     * 表示按钮文本标签的边距。
     * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
     */
    get labelPadding() {
        this.createText();
        return this._text.padding.join(",");
    }
    set labelPadding(value) {
        this.createText();
        this._text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }
    /**
     * 表示按钮文本标签的字体大小。
     * @see laya.display.Text.fontSize()
     */
    get labelSize() {
        this.createText();
        return this._text.fontSize;
    }
    set labelSize(value) {
        this.createText();
        this._text.fontSize = value;
    }
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @see laya.display.Text.stroke()
     */
    get labelStroke() {
        this.createText();
        return this._text.stroke;
    }
    set labelStroke(value) {
        this.createText();
        this._text.stroke = value;
    }
    /**
     * <p>描边颜色，以字符串表示。</p>
     * 默认值为 "#000000"（黑色）;
     * @see laya.display.Text.strokeColor()
     */
    get labelStrokeColor() {
        this.createText();
        return this._text.strokeColor;
    }
    set labelStrokeColor(value) {
        this.createText();
        this._text.strokeColor = value;
    }
    /**
     * 表示按钮文本标签是否为粗体字。
     * @see laya.display.Text.bold()
     */
    get labelBold() {
        this.createText();
        return this._text.bold;
    }
    set labelBold(value) {
        this.createText();
        this._text.bold = value;
    }
    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text.font()
     */
    get labelFont() {
        this.createText();
        return this._text.font;
    }
    set labelFont(value) {
        this.createText();
        this._text.font = value;
    }
    /**标签对齐模式，默认为居中对齐。*/
    get labelAlign() {
        this.createText();
        return this._text.align;
    }
    set labelAlign(value) {
        this.createText();
        this._text.align = value;
    }
    /**
     * 对象的点击事件处理器函数（无默认参数）。
     */
    get clickHandler() {
        return this._clickHandler;
    }
    set clickHandler(value) {
        this._clickHandler = value;
    }
    /**
     * 按钮文本标签 <code>Text</code> 控件。
     */
    get text() {
        this.createText();
        return this._text;
    }
    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid() {
        if (this._bitmap.sizeGrid)
            return this._bitmap.sizeGrid.join(",");
        return null;
    }
    set sizeGrid(value) {
        this._bitmap.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }
    /**@inheritDoc */
    /*override*/ set width(value) {
        super.set_width(value);
        if (this._autoSize) {
            this._bitmap.width = value;
            this._text && (this._text.width = value);
        }
    }
    get width() {
        return super.get_width();
    }
    /**@inheritDoc */
    /*override*/ set height(value) {
        super.set_height(value);
        if (this._autoSize) {
            this._bitmap.height = value;
            this._text && (this._text.height = value);
        }
    }
    get height() {
        return super.get_height();
    }
    /**@inheritDoc */
    /*override*/ set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.label = value + "";
        else
            super.set_dataSource(value);
    }
    get dataSource() {
        return super.get_dataSource();
    }
    /**图标x,y偏移，格式：100,100*/
    get iconOffset() {
        return this._bitmap._offset ? this._bitmap._offset.join(",") : null;
    }
    set iconOffset(value) {
        if (value)
            this._bitmap._offset = UIUtils.fillArray([1, 1], value, Number);
        else
            this._bitmap._offset = [];
    }
    /**@private */
    _setStateChanged() {
        if (!this._stateChanged) {
            this._stateChanged = true;
            this.callLater(this.changeState);
        }
    }
}
/**
 * 按钮状态集。
 */
Button.stateMap = { "mouseup": 0, "mouseover": 1, "mousedown": 2, "mouseout": 0 };
ILaya.regClass(Button);
