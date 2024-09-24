import { UIComponent } from "./UIComponent";
import { Label } from "./Label";
import { Image } from "./Image";
import { Button } from "./Button";
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { HideFlags } from "../Const";
import { URL } from "../net/URL";
import { Utils } from "../utils/Utils";
import { AssetDb } from "../resource/AssetDb";
import { SerializeUtil } from "../loaders/SerializeUtil";

/**
 * @en The Slider control allows users to select a value by moving a slider between the end points of the track.
 * The current value of the slider is determined by the relative position of the slider between the end points of the slider (corresponding to the minimum and maximum values of the slider).
 * The slider allows values at specific intervals between the minimum and maximum values. The slider can also display its current value using a data tip.
 * - `changed` event is dispatched when the movement of the slider is completed (when the user releases the mouse).
 * - `change` event is dispatched when the movement of the slider.
 * @zh 使用 Slider 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
 * 滑块的当前值由滑块端点（对应于滑块的最小值和最大值）之间滑块的相对位置确定。
 * 滑块允许最小值和最大值之间特定间隔内的值。滑块还可以使用数据提示显示其当前值。
 * - `changed`事件用于移动滑块位置完成（用户鼠标抬起）后调度。
 * - `change`事件用于移动滑块位置时调度。
 */
export class Slider extends UIComponent {

    /** 
     * @en Get a reference to the Label component contained within the Slider component.
     * @zh 获取 Slider 组件所包含的 Label 组件的引用。
     */
    static label: Label = null;// new Label(); 静态的可能还没有初始化

    /**
     * @en Data change handler.
     * The default callback parameter is the slider position property value: Number.
     * @zh 数据变化处理器。
     * 默认回调参数为滑块位置属性 value 的属性值：Number。
     */
    changeHandler: Handler;

    /**
     * @en Whether it is vertical sliding. The default value is true, indicating vertical direction; false indicates horizontal direction.
     * @zh 是否为垂直滑动。默认值为true，表示垂直方向，false为水平方向。
     */
    isVertical: boolean = true;

    /**
     * @en A Boolean value that indicates whether to display labels.defalut value is true.
     * @zh 是否显示标签。默认值为true。
     */
    showLabel: boolean = true;

    /**
     * @en A Boolean value that indicates whether to display the progress bar.
     * @zh 是否显示进度条。
     */
    protected _showProgress: boolean = false;

    protected _allowClickBack: boolean;
    protected _max: number = 100;
    protected _min: number = 0;
    protected _tick: number = 1;
    protected _value: number = 0;
    protected _skin: string;
    protected _bg: Image;
    protected _progress: Image;
    protected _bar: Button;
    protected _tx: number;
    protected _ty: number;
    protected _maxMove: number;
    protected _globalSacle: Point;

    /**
     * @en Creates an instance of Slider.
     * @param skin The skin.
     * @zh 创建一个Silder实例。
     * @param skin 皮肤纹理。
     */
    constructor(skin: string = null) {
        super();
        if (!Slider.label) {
            Slider.label = new Label();
            Slider.label.hideFlags = HideFlags.HideAndDontSave;
        }
        this.skin = skin;
    }

    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy(destroyChild);
        this._bar && this._bar.destroy(destroyChild);
        this._progress && this._progress.destroy(destroyChild);
        this._bg = null;
        this._bar = null;
        this._progress = null;
        this.changeHandler = null;
    }

    protected createChildren(): void {
        this._bg = new Image();
        this._bg.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this._bg);

        this._progress = new Image();
        this._progress.hideFlags = HideFlags.HideAndDontSave;
        this.addChildAt(this._progress, 1);

        this._bar = new Button();
        this._bar.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this._bar);
    }

    protected initialize(): void {
        this._bar.on(Event.MOUSE_DOWN, this, this.onBarMouseDown);
        this.allowClickBack = true;
    }

    protected onBarMouseDown(e: Event): void {
        let stage = ILaya.stage;
        this._globalSacle || (this._globalSacle = new Point());
        this._globalSacle.setTo(this.globalScaleX || 0.01, this.globalScaleY || 0.01);

        this._maxMove = this.isVertical ? (this.height - this._bar.height) : (this.width - this._bar.width);
        this._tx = stage.mouseX;
        this._ty = stage.mouseY;
        stage.on(Event.MOUSE_MOVE, this, this.mouseMove);
        stage.once(Event.MOUSE_UP, this, this.mouseUp);
        stage.once(Event.MOUSE_OUT, this, this.mouseUp);
        //显示提示
        this.showValueText();
    }

    protected showValueText(): void {
        if (this.showLabel) {
            var label: Label = Slider.label;
            this.addChild(label);
            label.textField.text = this._value + "";
            if (this.isVertical) {
                label.x = this._bar._x + 20;
                label.y = (this._bar.height - label.height) * 0.5 + this._bar._y;
            } else {
                label.y = this._bar._y - 20;
                label.x = (this._bar.width - label.width) * 0.5 + this._bar._x;
            }
        }
    }

    protected hideValueText(): void {
        Slider.label && Slider.label.removeSelf();
    }


    private mouseUp(e: Event): void {
        let stage = ILaya.stage;
        stage.off(Event.MOUSE_MOVE, this, this.mouseMove);
        stage.off(Event.MOUSE_UP, this, this.mouseUp);
        stage.off(Event.MOUSE_OUT, this, this.mouseUp);
        this.sendChangeEvent(Event.CHANGED);
        this.hideValueText();
    }

    private mouseMove(e: Event): void {
        let stage = ILaya.stage;
        var oldValue: number = this._value;
        if (this.isVertical) {
            this._bar.y += (stage.mouseY - this._ty) / this._globalSacle.y;
            if (this._bar._y > this._maxMove) this._bar.y = this._maxMove;
            else if (this._bar._y < 0) this._bar.y = 0;
            this._value = this._bar._y / this._maxMove * (this._max - this._min) + this._min;
            this._progress.height = this._bar._y + 0.5 * this._bar.height;
        } else {
            this._bar.x += (stage.mouseX - this._tx) / this._globalSacle.x;
            if (this._bar._x > this._maxMove) this._bar.x = this._maxMove;
            else if (this._bar._x < 0) this._bar.x = 0;
            this._value = this._bar._x / this._maxMove * (this._max - this._min) + this._min;
            this._progress.width = this._bar._x + 0.5 * this._bar.width;
        }

        this._tx = stage.mouseX;
        this._ty = stage.mouseY;

        if (this._tick != 0) {
            var pow: number = Math.pow(10, (this._tick + "").length - 1);
            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
        }

        if (this._value != oldValue) {
            this.sendChangeEvent();
        }
        this.showValueText();
    }

    protected sendChangeEvent(type: string = Event.CHANGE): void {
        this.event(type);
        this.changeHandler && this.changeHandler.runWith(this._value);
    }

    /**
     * @en The skin of the slider.
     * @zh 滑块的皮肤纹理。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (value == "")
            value = null;
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    /**
     * @en A Boolean value that indicates whether to display the progress bar.
     * @zh 是否显示进度条。
     */
    get showProgress(): boolean {
        return this._showProgress;
    }

    set showProgress(value: boolean) {
        this._showProgress = value;
        if (value) {
            if (this._skin && !SerializeUtil.isDeserializing)
                this._setSkin(this._skin);
        }
        else
            this._progress.skin = null;
    }
    /** @ignore */
    _setSkin(url: string): Promise<void> {
        this._skin = url;

        if (url) {
            return AssetDb.inst.resolveURL(url).then(url => {
                if (this._destroyed)
                    return null;

                if (this._skinBaseUrl)
                    url = URL.formatURL(url, this._skinBaseUrl);
                let tasks = [
                    this._bg._setSkin(url),
                    this._bar._setSkin(Utils.replaceFileExtension(url, "$bar.png", true))
                ];
                if (this._showProgress)
                    tasks.push(this._progress._setSkin(Utils.replaceFileExtension(url, "$progress.png", true)));
                else
                    this._progress.skin = null;

                return Promise.all(tasks).then(() => this._skinLoaded());
            });
        }
        else {
            this._bg.skin = null;
            this._bar.skin = null;
            this._progress.skin = null;
            this._skinLoaded();
            return Promise.resolve();
        }
    }

    protected _skinLoaded(): void {
        if (this._destroyed)
            return;

        this.setBarPoint();
        this.callLater(this.changeValue);
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**
     * @en Set the position information of the slider.
     * @zh 设置滑块的位置信息。
     */
    protected setBarPoint(): void {
        if (this.isVertical) this._bar.x = Math.round((this._bg.width - this._bar.width) * 0.5);
        else this._bar.y = Math.round((this._bg.height - this._bar.height) * 0.5);
    }

    protected measureWidth(): number {
        return Math.max(this._bg.width, this._bar.width);
    }

    protected measureHeight(): number {
        return Math.max(this._bg.height, this._bar.height);
    }

    protected _sizeChanged(): void {
        super._sizeChanged();
        if (this.isVertical) this._bg.height = this.height;
        else this._bg.width = this.width;
        this.setBarPoint();
        this.changeValue();
    }

    /**
      * @en The size grid of the texture.
      * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
      * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
      * The values are separated by commas. For example: "6,6,6,6,1".
      * @zh 纹理的九宫格数据。
      * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
      * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
      * 值以逗号分隔。例如："6,6,6,6,1"。
      */
    get sizeGrid(): string {
        return this._bg.sizeGrid;
    }

    set sizeGrid(value: string) {
        this._bg.sizeGrid = value;
        this._bar.sizeGrid = value;
        this._progress.sizeGrid = this._bar.sizeGrid;
    }

    /**
     * @en Set the information of the slider.
     * @param min The minimum value of the slider.
     * @param max The maximum value of the slider.
     * @param value The current value of the slider.
     * @zh 设置滑动条的信息。
     * @param min 滑块的最小值。
     * @param max 滑块的最大值。
     * @param value 滑块的当前值。
     */
    setSlider(min: number, max: number, value?: number): void {
        let scaleValue: number;
        if (null == value) {
            if (min >= max) {
                value = this.value;
            } else {
                if (this._max == this._min) {
                    scaleValue = 0;
                } else {
                    scaleValue = this._value / (this._max - this._min);
                }
            }
        }
        this._value = -1;
        this._min = min;
        this._max = max > min ? max : min;
        if (null == scaleValue) {
            this.value = value < min ? min : value > max ? max : value;
        } else {
            this.value = (this._max - this._min) * scaleValue;
        }
    }

    /**
     * @en The minimum increment unit for each change in the slider tick value. The default value is 1.
     * @zh 滑滑动条刻度值每次最小变动的单位。默认值为1
     */
    get tick(): number {
        return this._tick;
    }

    set tick(value: number) {
        if (this._tick != value) {
            this._tick = value;
            this.callLater(this.changeValue);
        }
    }

    /**
     * @en Change the position value of the slider.
     * @zh 改变滑块的位置值。
     */
    changeValue(): void {
        if (this.tick != 0) {
            var pow: number = Math.pow(10, (this._tick + "").length - 1);
            this._value = Math.round(Math.round(this._value / this._tick) * this._tick * pow) / pow;
        }

        if (this._max >= this._min) {
            this._value = this._value > this._max ? this._max : this._value < this._min ? this._min : this._value;
        } else {
            //当设置的最小值大于最大值的时候，滑动条会反向处理，滑动条限制也应反向处理。
            this._value = this._value > this._min ? this._min : this._value < this._max ? this._max : this._value;
        }

        var num: number = this._max - this._min;
        if (num === 0) num = 1;
        if (this.isVertical) {
            this._bar.y = (this._value - this._min) / num * (this.height - this._bar.height);
            this._progress.height = this._bar._y + 0.5 * this._bar.height;
        }
        else {
            this._bar.x = (this._value - this._min) / num * (this.width - this._bar.width);
            this._progress.width = this._bar._x + 0.5 * this._bar.width;
        }

    }

    /**
     * @en The number indicating the highest position of slider. The default value is 100.
     * @zh 滑动条最高位置的数字。默认值为 100。
     */
    get max(): number {
        return this._max;
    }

    set max(value: number) {
        if (this._max != value) {
            this._max = value;
            this.callLater(this.changeValue);
        }
    }

    /**
     * @en The number indicating the lowest position of slider. The default value is 0.
     * @zh 滑动条最低位置的数字。默认值为 0。
     */
    get min(): number {
        return this._min;
    }

    set min(value: number) {
        if (this._min != value) {
            this._min = value;
            this.callLater(this.changeValue);
        }
    }

    /**
     * @en The number indicating the current slider position.
     * @zh 滑动条当前滑块位置的数字。
     */
    get value(): number {
        return this._value;
    }

    set value(num: number) {
        if (this._value != num) {
            var oldValue: number = this._value;
            this._value = num;
            this.changeValue();
            if (this._value != oldValue) {
                this.sendChangeEvent();
            }
        }
    }

    /**
     * @en A Boolean value that specifies whether to allow changing the value property of the Slider by clicking the slider.
     * @zh 是否允许通过点击滑动条改变 Slider 的 value 属性值。
     */
    get allowClickBack(): boolean {
        return this._allowClickBack;
    }

    set allowClickBack(value: boolean) {
        if (this._allowClickBack != value) {
            this._allowClickBack = value;
            if (value) this._bg.on(Event.MOUSE_DOWN, this, this.onBgMouseDown);
            else this._bg.off(Event.MOUSE_DOWN, this, this.onBgMouseDown);
        }
    }

    /**
     * @en The Event.MOUSE_DOWN event handler of the slider.
     * @zh 滑动条的 Event.MOUSE_DOWN 事件侦听处理函数。
     */
    protected onBgMouseDown(e: Event): void {
        var point: Point = this._bg.getMousePoint();
        if (this.isVertical) this.value = point.y / (this.height - this._bar.height) * (this._max - this._min) + this._min;
        else this.value = point.x / (this.width - this._bar.width) * (this._max - this._min) + this._min;
    }

    set_dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.value = Number(value);
        else
            super.set_dataSource(value);
    }

    /**
     * @en The reference of the slider button.
     * @zh 滑块按钮的引用。
     */
    get bar(): Button {
        return this._bar;
    }
}