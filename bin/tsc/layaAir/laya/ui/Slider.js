import { UIComponent } from "./UIComponent";
import { Label } from "./Label";
import { Image } from "./Image";
import { Button } from "./Button";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Loader } from "../net/Loader";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
/**
 * 移动滑块位置时调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * 移动滑块位置完成（用户鼠标抬起）后调度。
 * @eventType @eventType laya.events.EventD
 *
 */
/*[Event(name = "changed", type = "laya.events.Event")]*/
/**
 * 使用 <code>Slider</code> 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
 * <p>滑块的当前值由滑块端点（对应于滑块的最小值和最大值）之间滑块的相对位置确定。</p>
 * <p>滑块允许最小值和最大值之间特定间隔内的值。滑块还可以使用数据提示显示其当前值。</p>
 *
 * @see laya.ui.HSlider
 * @see laya.ui.VSlider
 */
export class Slider extends UIComponent {
    /**
     * 创建一个新的 <code>Slider</code> 类示例。
     * @param skin 皮肤。
     */
    constructor(skin = null) {
        super();
        /**
         * 一个布尔值，指示是否为垂直滚动。如果值为true，则为垂直方向，否则为水平方向。
         * <p>默认值为：true。</p>
         * @default true
         */
        this.isVertical = true;
        /**
         * 一个布尔值，指示是否显示标签。
         * @default true
         */
        this.showLabel = true;
        /**@private */
        this._max = 100;
        /**@private */
        this._min = 0;
        /**@private */
        this._tick = 1;
        /**@private */
        this._value = 0;
        if (!Slider.label) {
            Slider.label = new Label();
        }
        this.skin = skin;
    }
    /**
     *@inheritDoc
     */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy(destroyChild);
        this._bar && this._bar.destroy(destroyChild);
        this._progress && this._progress.destroy(destroyChild);
        this._bg = null;
        this._bar = null;
        this._progress = null;
        this.changeHandler = null;
    }
    /**@inheritDoc */
    /*override*/ createChildren() {
        this.addChild(this._bg = new Image());
        this.addChild(this._bar = new Button());
    }
    /**@inheritDoc */
    /*override*/ initialize() {
        this._bar.on(Event.MOUSE_DOWN, this, this.onBarMouseDown);
        this._bg.sizeGrid = this._bar.sizeGrid = "4,4,4,4,0";
        if (this._progress)
            this._progress.sizeGrid = this._bar.sizeGrid;
        this.allowClickBack = true;
    }
    /**
     * @private
     * 滑块的的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    onBarMouseDown(e) {
        var Laya = window.Laya;
        this._globalSacle || (this._globalSacle = new Point());
        this._globalSacle.setTo(this.globalScaleX || 0.01, this.globalScaleY || 0.01);
        this._maxMove = this.isVertical ? (this.height - this._bar.height) : (this.width - this._bar.width);
        this._tx = Laya.stage.mouseX;
        this._ty = Laya.stage.mouseY;
        Laya.stage.on(Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.once(Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.once(Event.MOUSE_OUT, this, this.mouseUp);
        //显示提示
        this.showValueText();
    }
    /**
     * @private
     * 显示标签。
     */
    showValueText() {
        if (this.showLabel) {
            var label = Slider.label;
            this.addChild(label);
            label.textField.changeText(this._value + "");
            if (this.isVertical) {
                label.x = this._bar._x + 20;
                label.y = (this._bar.height - label.height) * 0.5 + this._bar._y;
            }
            else {
                label.y = this._bar._y - 20;
                label.x = (this._bar.width - label.width) * 0.5 + this._bar._x;
            }
        }
    }
    /**
     * @private
     * 隐藏标签。
     */
    hideValueText() {
        Slider.label && Slider.label.removeSelf();
    }
    /**
     * @private
     */
    mouseUp(e) {
        var Laya = window.Laya;
        Laya.stage.off(Event.MOUSE_MOVE, this, this.mouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.mouseUp);
        this.sendChangeEvent(Event.CHANGED);
        this.hideValueText();
    }
    /**
     * @private
     */
    mouseMove(e) {
        var Laya = window.Laya;
        var oldValue = this._value;
        if (this.isVertical) {
            this._bar.y += (Laya.stage.mouseY - this._ty) / this._globalSacle.y;
            if (this._bar._y > this._maxMove)
                this._bar.y = this._maxMove;
            else if (this._bar._y < 0)
                this._bar.y = 0;
            this._value = this._bar._y / this._maxMove * (this._max - this._min) + this._min;
            if (this._progress)
                this._progress.height = this._bar._y + 0.5 * this._bar.height;
        }
        else {
            this._bar.x += (Laya.stage.mouseX - this._tx) / this._globalSacle.x;
            if (this._bar._x > this._maxMove)
                this._bar.x = this._maxMove;
            else if (this._bar._x < 0)
                this._bar.x = 0;
            this._value = this._bar._x / this._maxMove * (this._max - this._min) + this._min;
            if (this._progress)
                this._progress.width = this._bar._x + 0.5 * this._bar.width;
        }
        this._tx = Laya.stage.mouseX;
        this._ty = Laya.stage.mouseY;
        if (this._tick != 0) {
            var pow = Math.pow(10, (this._tick + "").length - 1);
            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
        }
        if (this._value != oldValue) {
            this.sendChangeEvent();
        }
        this.showValueText();
    }
    /**
     * @private
     */
    sendChangeEvent(type = Event.CHANGE) {
        this.event(type);
        this.changeHandler && this.changeHandler.runWith(this._value);
    }
    /**
     * @copy laya.ui.Image#skin
     */
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                window.Laya.loader.load([this._skin, this._skin.replace(".png", "$bar.png")], Handler.create(this, this._skinLoaded));
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this._bg.skin = this._skin;
        this._bar.skin = this._skin.replace(".png", "$bar.png");
        var progressSkin = this._skin.replace(".png", "$progress.png");
        if (Loader.getRes(progressSkin)) {
            if (!this._progress) {
                this.addChild(this._progress = new Image());
                this._progress.sizeGrid = this._bar.sizeGrid;
                this.setChildIndex(this._progress, 1);
            }
            this._progress.skin = progressSkin;
        }
        this.setBarPoint();
        this.callLater(this.changeValue);
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    /**
     * @private
     * 设置滑块的位置信息。
     */
    setBarPoint() {
        if (this.isVertical)
            this._bar.x = Math.round((this._bg.width - this._bar.width) * 0.5);
        else
            this._bar.y = Math.round((this._bg.height - this._bar.height) * 0.5);
    }
    /**@inheritDoc */
    /*override*/ measureWidth() {
        return Math.max(this._bg.width, this._bar.width);
    }
    /**@inheritDoc */
    /*override*/ measureHeight() {
        return Math.max(this._bg.height, this._bar.height);
    }
    /**@inheritDoc */
    /*override*/ _sizeChanged() {
        super._sizeChanged();
        if (this.isVertical)
            this._bg.height = this.height;
        else
            this._bg.width = this.width;
        this.setBarPoint();
        this.changeValue();
    }
    /**
     * <p>当前实例的背景图（ <code>Image</code> ）和滑块按钮（ <code>Button</code> ）实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid() {
        return this._bg.sizeGrid;
    }
    set sizeGrid(value) {
        this._bg.sizeGrid = value;
        this._bar.sizeGrid = value;
        if (this._progress)
            this._progress.sizeGrid = this._bar.sizeGrid;
    }
    /**
     * 设置滑动条的信息。
     * @param min 滑块的最小值。
     * @param max 滑块的最小值。
     * @param value 滑块的当前值。
     */
    setSlider(min, max, value) {
        this._value = -1;
        this._min = min;
        this._max = max > min ? max : min;
        this.value = value < min ? min : value > max ? max : value;
    }
    /**
     * 滑动的刻度值，滑动数值为tick的整数倍。默认值为1。
     */
    get tick() {
        return this._tick;
    }
    set tick(value) {
        if (this._tick != value) {
            this._tick = value;
            this.callLater(this.changeValue);
        }
    }
    /**
     * @private
     * 改变滑块的位置值。
     */
    changeValue() {
        if (this.tick != 0) {
            var pow = Math.pow(10, (this._tick + "").length - 1);
            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
        }
        this._value = this._value > this._max ? this._max : this._value < this._min ? this._min : this._value;
        var num = this._max - this._min;
        if (num === 0)
            num = 1;
        if (this.isVertical) {
            this._bar.y = (this._value - this._min) / num * (this.height - this._bar.height);
            if (this._progress)
                this._progress.height = this._bar._y + 0.5 * this._bar.height;
        }
        else {
            this._bar.x = (this._value - this._min) / num * (this.width - this._bar.width);
            if (this._progress)
                this._progress.width = this._bar._x + 0.5 * this._bar.width;
        }
    }
    /**
     * 获取或设置表示最高位置的数字。 默认值为100。
     */
    get max() {
        return this._max;
    }
    set max(value) {
        if (this._max != value) {
            this._max = value;
            this.callLater(this.changeValue);
        }
    }
    /**
     * 获取或设置表示最低位置的数字。 默认值为0。
     */
    get min() {
        return this._min;
    }
    set min(value) {
        if (this._min != value) {
            this._min = value;
            this.callLater(this.changeValue);
        }
    }
    /**
     * 获取或设置表示当前滑块位置的数字。
     */
    get value() {
        return this._value;
    }
    set value(num) {
        if (this._value != num) {
            var oldValue = this._value;
            this._value = num;
            this.changeValue();
            if (this._value != oldValue) {
                this.sendChangeEvent();
            }
        }
    }
    /**
     * 一个布尔值，指定是否允许通过点击滑动条改变 <code>Slider</code> 的 <code>value</code> 属性值。
     */
    get allowClickBack() {
        return this._allowClickBack;
    }
    set allowClickBack(value) {
        if (this._allowClickBack != value) {
            this._allowClickBack = value;
            if (value)
                this._bg.on(Event.MOUSE_DOWN, this, this.onBgMouseDown);
            else
                this._bg.off(Event.MOUSE_DOWN, this, this.onBgMouseDown);
        }
    }
    /**
     * @private
     * 滑动条的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    onBgMouseDown(e) {
        var point = this._bg.getMousePoint();
        if (this.isVertical)
            this.value = point.y / (this.height - this._bar.height) * (this._max - this._min) + this._min;
        else
            this.value = point.x / (this.width - this._bar.width) * (this._max - this._min) + this._min;
    }
    /**@inheritDoc */
    /*override*/ set dataSource(value) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.value = Number(value);
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
    /**
     * 表示滑块按钮的引用。
     */
    get bar() {
        return this._bar;
    }
}
/** @private 获取对 <code>Slider</code> 组件所包含的 <code>Label</code> 组件的引用。*/
Slider.label = null; // new Label(); 静态的可能还没有初始化
ILaya.regClass(Slider);
