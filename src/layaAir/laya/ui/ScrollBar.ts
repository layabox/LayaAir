import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { UIConfig } from "./../../UIConfig";
import { Styles } from "./Styles";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Ease } from "../utils/Ease"
import { Handler } from "../utils/Handler"
import { Tween } from "../utils/Tween"
import { ILaya } from "../../ILaya";
import { HideFlags } from "../Const";
import { URL } from "../net/URL";
import { Utils } from "../utils/Utils";
import { AssetDb } from "../resource/AssetDb";

/**
 * @en Schedule when the position of the scroll bar slider changes.
 * @zh 滚动条滑块位置发生变化后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * @en Start sliding.
 * @zh 开始滑动。
 * @eventType laya.events.Event
 */
/*[Event(name = "start", type = "laya.events.Event")]*/
/**
 * @en End sliding.
 * @zh 结束滑动。
 * @eventType laya.events.Event
 */
/*[Event(name = "end", type = "laya.events.Event")]*/

/**
 * @en The `ScrollBar` component is a scrollbar component.
 * When there is too much data to fit in the display area, the end user can use the `ScrollBar` component to control the portion of data being displayed.
 * A scrollbar consists of four parts: two arrow buttons, a track, and a thumb (slider).
 * @zh ScrollBar 组件是一个滚动条组件。
 * 当数据太多以至于显示区域无法容纳时，最终用户可以使用 ScrollBar 组件控制所显示的数据部分。
 * 滚动条由四部分组成：两个箭头按钮、一个轨道和一个滑块。
 *
 * @see laya.ui.VScrollBar
 * @see laya.ui.HScrollBar
 */
export class ScrollBar extends UIComponent {
    /** 
     * @en Sets the global easing function for scrolling speed changes.
     * @zh 设置全局的滚动速度变化曲线函数
     */
    public static easeFunction = Ease.sineOut;
    /**
     * @en The ratio of scroll decay.
     * @zh 滚动衰减系数
     */
    rollRatio: number = 0.97;
    /**
     * @en Callback when scrolling changes, return value parameter.
     * @zh 滚动变化时回调，回传value参数。
     */
    changeHandler: Handler;
    /**
     * @en Indicates whether to scale the size of the scrollbar, default is true.
     * @zh 是否缩放滑动条的大小，默认值为true。
     */
    scaleBar: boolean = true;
    /**
     * @en A boolean value that specifies whether to automatically hide the scrollbar when it is not in use, default is false.
     * @zh 一个布尔值，指定是否在无需滚动时自动隐藏滚动条，默认值为false。
     */
    autoHide: boolean = false;
    /**
     * @en The limit distance for the rubber band effect, 0 means no rubber band effect.
     * @zh 橡皮筋效果极限距离，0表示没有橡皮筋效果。
     */
    elasticDistance: number = 0;
    /**
     * @en The time in milliseconds for the rubber band effect to rebound.
     * @zh 橡皮筋回弹时间，单位为毫秒。
     */
    elasticBackTime: number = 500;
    /**
     * @en The up button.
     * @zh 上按钮。
     */
    upButton: Button;
    /**
     * @en The down button.
     * @zh 下按钮。
     */
    downButton: Button;
    /**
     * @en slider.
     * @zh 滑动条。
     */
    slider: Slider;
    /**
     * @en The top movement limit for the scrollbar. When this limit is reached, the 'dragTopLimit' event is dispatched.
     * This can be used in conjunction with the `stopMoveLimit()` method to allow developers to perform dynamic data updates and other operations.
     * @zh 顶部移动限制。当达到此限制时，会触发 'dragTopLimit' 事件。
     * 它可以与 `stopMoveLimit()` 方法结合使用，以便开发者执行动态数据更新和其他操作。
     */
    topMoveLimit: number = 0;
    /**
     * @en The bottom movement limit for the scrollbar. When this limit is reached, the 'dragBottomLimit' event is dispatched.
     * This can be used in conjunction with the `stopMoveLimit()` method to allow developers to perform dynamic data updates and other operations.
     * @zh 底部移动限制。当达到此限制时，会触发 'dragBottomLimit' 事件。
     * 它可以与 `stopMoveLimit()` 方法结合使用，以便开发者执行动态数据更新和其他操作。
     */
    bottomMoveLimit: number = 0;
    /**
     * @en Determines whether dragging of the content is disabled when the 'stopMoveLimit' method is called.
     * @zh 确定在调用 'stopMoveLimit' 方法时是否禁止内容的拖拽。
     */
    disableDrag: boolean = false;

    /**@private */
    protected _showButtons: boolean;
    /**@private */
    protected _scrollSize: number = 1;
    /**@private */
    protected _skin: string;
    /**@private */
    protected _thumbPercent: number = 1;
    /**@private */
    protected _target: Sprite;
    /**@private */
    protected _lastPoint: Point;
    /**@private */
    protected _lastOffset: number = 0;
    /**@private */
    protected _checkElastic: boolean = false;
    /**@private */
    protected _isElastic: boolean = false;
    /**@private */
    protected _value: number;
    /**@private */
    protected _hide: boolean = false;
    /**@private */
    protected _clickOnly: boolean = true;
    /**@private */
    protected _offsets: any[];
    /**@private */
    protected _touchScrollEnable: boolean;
    /**@private */
    protected _mouseWheelEnable: boolean;

    /**
     * @en constructor method.
     * @param skin The address of the skin resource.
     * @zh 构造方法
     * @param skin 皮肤资源地址。
     */
    constructor(skin: string = null) {
        super();

        this._showButtons = UIConfig.showButtons;
        this._touchScrollEnable = UIConfig.touchScrollEnable;
        this._mouseWheelEnable = UIConfig.mouseWheelEnable;

        this.skin = skin;
        this.max = 1;
    }

    /**
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        this.stopScroll();
        this.target = null;
        super.destroy(destroyChild);
        this.upButton && this.upButton.destroy(destroyChild);
        this.downButton && this.downButton.destroy(destroyChild);
        this.slider && this.slider.destroy(destroyChild);
        this.upButton = this.downButton = null;
        this.slider = null;
        this.changeHandler = null;
        this._offsets = null;
    }

    /**
     * @override
     * @en Creates the child elements of the ScrollBar, such as the slider and buttons.
     * @zh 创建 ScrollBar 的子元素，例如滑块和按钮。
     */
    protected createChildren(): void {
        this.slider = new Slider();
        this.slider.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this.slider);

        this.upButton = new Button();
        this.upButton.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this.upButton);

        this.downButton = new Button();
        this.downButton.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this.downButton);
    }

    /**
     * @override
     * @en Initializes the ScrollBar, setting up the slider and buttons with appropriate event listeners.
     * @zh 初始化 ScrollBar，为滑块和按钮设置适当的事件监听器。
     */
    protected initialize(): void {
        this.slider.showLabel = false;
        this.slider.tick = 0;
        this.slider.on(Event.CHANGE, this, this.onSliderChange);
        this.slider.setSlider(0, 0, 0);

        this.upButton.on(Event.MOUSE_DOWN, this, this.onButtonMouseDown);
        this.downButton.on(Event.MOUSE_DOWN, this, this.onButtonMouseDown);
    }

    /**
     * @private
     * @en The change event handler for the slider when its value changes.
     * @zh 滑块值改变时的事件处理函数。
     */
    protected onSliderChange(): void {
        if (this._value != this.slider.value) this.value = this.slider.value;
    }

    /**
     * @private
     * @en The mouse down event handler for the up and down buttons.
     * @zh 向上和向下按钮的 Event.MOUSE_DOWN 事件侦听处理函数。
     */
    protected onButtonMouseDown(e: Event): void {
        var isUp: boolean = e.currentTarget === this.upButton;
        this.slide(isUp);
        ILaya.timer.once(Styles.scrollBarDelayTime, this, this.startLoop, [isUp]);
        ILaya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp);
    }

    /**@private */
    protected startLoop(isUp: boolean): void {
        ILaya.timer.frameLoop(1, this, this.slide, [isUp]);
    }

    /**@private */
    protected slide(isUp: boolean): void {
        if (isUp) this.value -= this._scrollSize;
        else this.value += this._scrollSize;
    }

    /**
     * @private
     * @en The mouse up event handler for the stage.
     * @param e The event object.
     * @zh 舞台的 Event.MOUSE_DOWN 事件侦听处理函数。
     * @param e 事件对象。
     */
    protected onStageMouseUp(e: Event): void {
        ILaya.timer.clear(this, this.startLoop);
        ILaya.timer.clear(this, this.slide);
    }

    /**
     * @en the skin of the scrollbar.
     * @zh 滚动条的皮肤纹理路径。
     * @copy laya.ui.Image#skin
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
     * @en Asynchronously sets the skin for the scrollbar and its components.
     * @param url The URL of the skin to be set.
     * @zh 异步设置滚动条及其组件的皮肤。
     * @param url 要设置的皮肤的 URL。
     */
    _setSkin(url: string): Promise<void> {
        this._skin = url;

        if (url) {
            return AssetDb.inst.resolveURL(url).then(url => {
                if (this._destroyed)
                    return null;

                if (this._skinBaseUrl)
                    url = URL.formatURL(url, this._skinBaseUrl);
                return Promise.all([
                    this.slider._setSkin(url),
                    this.upButton._setSkin(Utils.replaceFileExtension(url, "$up.png", true)),
                    this.downButton._setSkin(Utils.replaceFileExtension(url, "$down.png", true))
                ]).then(() => this._skinLoaded());
            });
        }
        else {
            this.slider.skin = null;
            this.upButton.skin = null;
            this.downButton.skin = null;
            this._skinLoaded();
            return Promise.resolve();
        }
    }

    /**
     * @en Called when the skin is loaded.
     * @zh 皮肤加载完成时调用。
     */
    protected _skinLoaded(): void {
        if (this._destroyed)
            return;

        this.callLater(this.changeScrollBar);
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**
     * @private
     * @en Adjust the scroll bar's display state, including the visibility of the buttons and the position of the slider
     * @zh 更改滚动条的显示状态，包括按钮的可见性和滑动条的位置
     */
    protected changeScrollBar(): void {
        this.upButton.visible = this._showButtons;
        this.downButton.visible = this._showButtons;
        if (this.slider.isVertical)
            this.slider.y = this._showButtons ? this.upButton.height : 0;
        else
            this.slider.x = this._showButtons ? this.upButton.width : 0;
        this.resetPositions();
        this.repaint();
    }

    /**
     * @inheritDoc 
     * @override
     */
    protected _sizeChanged(): void {
        super._sizeChanged();
        this.repaint();
        this.resetPositions();
        this.event(Event.CHANGE);
        this.changeHandler && this.changeHandler.runWith(this.value);
    }

    /**@private */
    private resetPositions(): void {
        if (this.slider.isVertical) this.slider.height = this.height - (this._showButtons ? (this.upButton.height + this.downButton.height) : 0);
        else this.slider.width = this.width - (this._showButtons ? (this.upButton.width + this.downButton.width) : 0);
        this.resetButtonPosition();

    }

    /**@private */
    protected resetButtonPosition(): void {
        if (this.slider.isVertical) this.downButton.y = this.slider._y + this.slider.height;
        else this.downButton.x = this.slider._x + this.slider.width;
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected measureWidth(): number {
        if (this.slider.isVertical) return this.slider.width;
        return 100;
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected measureHeight(): number {
        if (this.slider.isVertical) return 100;
        return this.slider.height;
    }

    /**
     * @en Sets the information for the scrollbar.
     * @param min The minimum position value of the scrollbar.
     * @param max The maximum position value of the scrollbar.
     * @param value The current position value of the scrollbar.
     * @zh 设置滚动条信息。
     * @param min 滚动条最小位置值。
     * @param max 滚动条最大位置值。
     * @param value 滚动条当前位置值。
     */
    setScroll(min: number, max: number, value?: number): void {
        this.runCallLater(this._sizeChanged);
        this.slider.setSlider(min, max, value);
        //_upButton.disabled = max <= 0;
        //_downButton.disabled = max <= 0;
        this.slider.bar.visible = max > 0;
        if (!this._hide && this.autoHide) this.visible = false;
    }

    /**
     * @en the numeric value representing the maximum scroll position.
     * @zh 最高滚动位置的数字。
     */
    get max(): number {
        return this.slider.max;
    }

    set max(value: number) {
        this.slider.max = value;
    }

    /**
     * @en the numeric value representing the minimum scroll position.
     * @zh 最低滚动位置的数字。
     */
    get min(): number {
        return this.slider.min;
    }

    set min(value: number) {
        this.slider.min = value;
    }

    /**
     * @en the numeric value representing the current scroll position.
     * @zh 当前滚动位置的数字。
     */
    get value(): number {
        return this._value;
    }

    set value(v: number) {
        if (v !== this._value) {
            this._value = v;
            if (!this._isElastic) {
                if (this.slider["_value"] != v) {
                    this.slider["_value"] = v;
                    this.slider.changeValue();
                }
                this._value = this.slider["_value"];
            }
            this.event(Event.CHANGE);
            this.changeHandler && this.changeHandler.runWith(this._value);
        }
    }

    /**
     * @en Indicates whether the scrollbar is vertical. If true, the scrollbar is vertical; otherwise, it is horizontal.
     * Default value: true.
     * @zh 滚动条是否为垂直滚动。如果值为true，则为垂直滚动，否则为水平滚动。
     * 默认值为：true。
     */
    get isVertical(): boolean {
        return this.slider.isVertical;
    }

    set isVertical(value: boolean) {
        this.slider.isVertical = value;
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
        return this.slider.sizeGrid;
    }

    set sizeGrid(value: string) {
        this.slider.sizeGrid = value;
    }

    /**
     * @en The minimum unit for page scrolling when the scrollbar track is pressed.
     * @zh 按下滚动条轨道时页面滚动的最小单位
     */
    get scrollSize(): number {
        return this._scrollSize;
    }

    set scrollSize(value: number) {
        this._scrollSize = value;
    }

    /**
     * @inheritDoc
     * @override
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.value = Number(value);
        else
            super.set_dataSource(value);
    }

    /**
     * @en Slider length ratio, with a value between 0 and 1.
     * @zh 滑条长度比例，值为：（0-1）。
     */
    get thumbPercent(): number {
        return this._thumbPercent;
    }

    set thumbPercent(value: number) {
        this.runCallLater(this.changeScrollBar);
        this.runCallLater(this._sizeChanged);
        value = value >= 1 ? 0.99 : value;
        this._thumbPercent = value;
        if (this.scaleBar) {
            if (this.slider.isVertical) this.slider.bar.height = Math.max(this.slider.height * value, Styles.scrollBarMinNum);
            else this.slider.bar.width = Math.max(this.slider.width * value, Styles.scrollBarMinNum);
        }
    }

    /**
     * @en the target object of the scrollbar.
     * @zh 滚动的对象。
     * @see laya.ui.TouchScroll#target
     */
    get target(): Sprite {
        return this._target;
    }

    set target(value: Sprite) {
        if (this._target) {
            this._target.off(Event.MOUSE_WHEEL, this, this.onTargetMouseWheel);
            this._target.off(Event.MOUSE_DOWN, this, this.onTargetMouseDown);
        }
        this._target = value;
        if (value) {
            this._mouseWheelEnable && this._target.on(Event.MOUSE_WHEEL, this, this.onTargetMouseWheel);
            this._touchScrollEnable && this._target.on(Event.MOUSE_DOWN, this, this.onTargetMouseDown);
        }
    }

    /**
     * @en Determines whether the scrollbar is hidden. If true, the scrollbar is not displayed, but scrolling functions remain active. Default is false.
     * @zh 是否隐藏滚动条，设置为 true 时，不显示滚动条，但可以正常滚动，默认为 false。
     */
    get hide(): boolean {
        return this._hide;
    }

    set hide(value: boolean) {
        this._hide = value;
        this.visible = !value;
    }

    /**
     * @en Specifies whether the up and down buttons are displayed. Default is true.
     * @zh 是否显示向上和向下的按钮，默认值为 true，表示显示。
     */
    get showButtons(): boolean {
        return this._showButtons;
    }

    set showButtons(value: boolean) {
        this._showButtons = value;
        this.callLater(this.changeScrollBar);
    }

    /**
     * @en Specifies whether touch scrolling is enabled. Default is true.
     * @zh 是否启用触摸滚动，默认值为 true，表示启用。
     */
    get touchScrollEnable(): boolean {
        return this._touchScrollEnable;
    }

    set touchScrollEnable(value: boolean) {
        this._touchScrollEnable = value;
        this.target = this._target;
    }

    /**
     * @en Specifies whether mouse wheel scrolling is enabled. Default is true.
     * @zh 是否启用鼠标滚轮滚动，默认值为 true，表示启用。
     */
    get mouseWheelEnable(): boolean {
        return this._mouseWheelEnable;
    }

    set mouseWheelEnable(value: boolean) {
        this._mouseWheelEnable = value;
        this.target = this._target;
    }

    /**@private */
    protected onTargetMouseWheel(e: Event): void {
        this.value += e.delta * this._scrollSize;
        this.target = this._target;
    }

    isLockedFun: Function;

    /**@private */
    protected onTargetMouseDown(e: Event): void {
        if ((this.isLockedFun) && !this.isLockedFun(e)) return;
        this.event(Event.END);
        this._clickOnly = true;
        this._lastOffset = 0;
        this._checkElastic = false;
        this._lastPoint || (this._lastPoint = new Point());
        this._lastPoint.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY);
        ILaya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
        ILaya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp2);
        ILaya.stage.once(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        ILaya.timer.frameLoop(1, this, this.loop);
    }

    /**
     * @en Forces a drag action on the scrollbar.
     * Normally, dragging can only be done by holding the scrollbar itself. If you need to force drag outside the scrollbar object, you can achieve this by calling this method.
     * For example, if the mouse is continuously held on a button object outside the scrollbar and this method is called, then sliding the mouse will have the same effect as dragging the scrollbar. 
     * @zh 强制拖拽滚动条；
     * 常规情况下只能是按住滚动条本身才可以拖拽，如果需要在滚动条对象之外进行强制拖拽，则可以通过调用此方法来实现。
     * 例如，当鼠标持续按住滚动条之外的某个按钮对象时，调用了该方法，然后进行滑动，也可以实现按住滚动条对象滑动的效果。
     */
    startDragForce(): void {
        this._clickOnly = true;
        this._lastOffset = 0;
        this._checkElastic = false;
        this._lastPoint || (this._lastPoint = new Point());
        this._lastPoint.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY);
        ILaya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
        ILaya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp2);
        ILaya.stage.once(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        ILaya.timer.frameLoop(1, this, this.loop);
    }

    private cancelDragOp(): void {
        ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp2);
        ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        ILaya.timer.clear(this, this.tweenMove);
        ILaya.timer.clear(this, this.loop);
        this._target.mouseEnabled = true;
    }

    /**
     * @en Function to be called when the scrollbar is dragged down past its limit.
     * @zh 当滚动条向下拖拽超过其限制时调用的函数。
     */
    triggerDownDragLimit: Function;
    /**
     * @en Function to be called when the scrollbar is dragged up past its limit.
     * @zh 当滚动条向上拖拽超过其限制时调用的函数。
     */
    triggerUpDragLimit: Function;
    /** 
     * @en Overloading method for pausing scrolling
     * @zh 暂停滚动的重载方法
     */
    stopMoveLimit: Function;
    private checkTriggers(isTweenMove: boolean = false): boolean {
        if (this.value >= 0 && this.value - this._lastOffset <= 0) {
            if ((this.triggerDownDragLimit) && this.triggerDownDragLimit(isTweenMove)) {
                this.cancelDragOp();
                this.value = 0;
                return true;
            }
        }
        if (this.value <= this.max && (this.value - this._lastOffset >= this.max)) {
            if ((this.triggerUpDragLimit) && this.triggerUpDragLimit(isTweenMove)) {
                this.cancelDragOp();
                this.value = this.max;
                return true;
            }
        }
        return false;
    }

    /**
     * @en Gets the last offset value used during the scrollbar's movement.
     * @zh 获取滚动条在移动过程中使用的最后偏移量。
     */
    get lastOffset(): number {
        return this._lastOffset;
    }

    /**
     * @en Starts a forced tweening (animated) movement for the scrollbar.
     * @param lastOffset The offset to start the tweening movement from.
     * @zh 滚动条的强制缓动移动。
     * @param lastOffset 从该偏移量位置开始缓动移动。
     */
    startTweenMoveForce(lastOffset: number): void {
        this._lastOffset = lastOffset;
        ILaya.timer.frameLoop(1, this, this.tweenMove, [200]);
    }

    /**@private */
    protected loop(): void {
        if (this.disableDrag) return;
        var mouseY: number = ILaya.stage.mouseY;
        var mouseX: number = ILaya.stage.mouseX;
        this._lastOffset = this.isVertical ? (mouseY - this._lastPoint.y) : (mouseX - this._lastPoint.x);

        if (this._clickOnly) {
            if (Math.abs(this._lastOffset * (this.isVertical ? ILaya.stage._canvasTransform.getScaleY() : ILaya.stage._canvasTransform.getScaleX())) > 1) {
                this._clickOnly = false;
                if (this.checkTriggers()) return;
                this._offsets || (this._offsets = []);
                this._offsets.length = 0;
                this._target.mouseEnabled = false;
                if (!this.hide && this.autoHide) {
                    this.alpha = 1;
                    this.visible = true;
                }
                this.event(Event.START);
            } else return;
        } else {
            if (this.checkTriggers()) return;
        }
        this._offsets.push(this._lastOffset);

        this._lastPoint.x = mouseX;
        this._lastPoint.y = mouseY;

        if (this._lastOffset === 0) return;

        if (!this._checkElastic) {
            if (this.elasticDistance > 0) {
                if (!this._checkElastic && this._lastOffset != 0) {
                    if ((this._lastOffset > 0 && this._value <= this.min) || (this._lastOffset < 0 && this._value >= this.max)) {
                        this._isElastic = true;
                        this._checkElastic = true;
                    } else {
                        this._isElastic = false;
                    }
                }
            } else {
                this._checkElastic = true;
            }
        }

        if (this._isElastic) {
            if (this._value <= this.min) {
                if (this._lastOffset > 0) {
                    this.value -= this._lastOffset * Math.max(0, (1 - ((this.min - this._value) / this.elasticDistance)));
                } else {
                    this.value -= this._lastOffset * 0.5;
                    if (this._value >= this.min)
                        this._checkElastic = false;
                }
            } else if (this._value >= this.max) {
                if (this._lastOffset < 0) {
                    this.value -= this._lastOffset * Math.max(0, (1 - ((this._value - this.max) / this.elasticDistance)));
                } else {
                    this.value -= this._lastOffset * 0.5;
                    if (this._value <= this.max)
                        this._checkElastic = false;
                }

            }
        } else {
            this.value -= this._lastOffset;
        }
    }

    /**@private */
    protected onStageMouseUp2(e: Event): void {
        ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp2);
        ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        ILaya.timer.clear(this, this.loop);

        if (this._clickOnly) {
            if (this._value >= this.min && this._value <= this.max)
                return;
        }
        this._target.mouseEnabled = true;

        if (this._isElastic) {
            if (this._value < this.min) {
                if (this.min - this._value >= this.topMoveLimit) {
                    this.event("dragTopLimit");
                }
                var moveValue: number = (this.stopMoveLimit && this.stopMoveLimit()) ? (this.min - this.topMoveLimit) : this.min;
                Tween.to(this, { value: moveValue }, this.elasticBackTime, ScrollBar.easeFunction, Handler.create(this, this.elasticOver));
            } else if (this._value > this.max) {
                if (this._value - this.max >= this.bottomMoveLimit) {
                    this.event("dragBottomLimit");
                }
                var moveValue: number = (this.stopMoveLimit && this.stopMoveLimit()) ? (this.max + this.bottomMoveLimit) : this.max;
                Tween.to(this, { value: moveValue }, this.elasticBackTime, ScrollBar.easeFunction, Handler.create(this, this.elasticOver));
            }
        } else {
            if (!this._offsets) return;
            //计算平均值
            if (this._offsets.length < 1) {
                this._offsets[0] = this.isVertical ? ILaya.stage.mouseY - this._lastPoint.y : ILaya.stage.mouseX - this._lastPoint.x;
            }
            var offset: number = 0;
            var n: number = Math.min(this._offsets.length, 3);
            for (var i: number = 0; i < n; i++) {
                offset += this._offsets[this._offsets.length - 1 - i];
            }
            this._lastOffset = offset / n;

            offset = Math.abs(this._lastOffset);
            if (offset < 2) {
                this.event(Event.END);
                return;
            }
            if (offset > 250) this._lastOffset = this._lastOffset > 0 ? 250 : -250;
            var dis: number = Math.round(Math.abs(this.elasticDistance * (this._lastOffset / 150)));
            ILaya.timer.frameLoop(1, this, this.tweenMove, [dis]);
        }
    }

    /**@private */
    private elasticOver(): void {
        this._isElastic = false;
        if (!this.hide && this.autoHide) {
            Tween.to(this, { alpha: 0 }, 500);
        }
        this.event(Event.END);
    }

    /**@private */
    protected tweenMove(maxDistance: number): void {
        this._lastOffset *= this.rollRatio;
        if (this.checkTriggers(true)) {
            return;
        }
        var tarSpeed: number;
        if (maxDistance > 0) {
            if (this._lastOffset > 0 && this.value <= this.min) {
                this._isElastic = true;
                tarSpeed = -(this.min - maxDistance - this.value) * 0.5;
                if (this._lastOffset > tarSpeed) this._lastOffset = tarSpeed;
            } else if (this._lastOffset < 0 && this.value >= this.max) {
                this._isElastic = true;
                tarSpeed = -(this.max + maxDistance - this.value) * 0.5;
                if (this._lastOffset < tarSpeed) this._lastOffset = tarSpeed;
            }
        }

        this.value -= this._lastOffset;
        //if (Math.abs(_lastOffset) < 1 || value == max || value == min) 
        if (Math.abs(this._lastOffset) < 0.1) {
            ILaya.timer.clear(this, this.tweenMove);
            if (this._isElastic) {
                if (this._value < this.min) {
                    Tween.to(this, { value: this.min }, this.elasticBackTime, ScrollBar.easeFunction, Handler.create(this, this.elasticOver));
                } else if (this._value > this.max) {
                    Tween.to(this, { value: this.max }, this.elasticBackTime, ScrollBar.easeFunction, Handler.create(this, this.elasticOver));
                } else {
                    this.elasticOver();
                }
                return;
            }
            this.event(Event.END);
            if (!this.hide && this.autoHide) {
                Tween.to(this, { alpha: 0 }, 500);
            }
        }
    }

    /**
     * @en Stops the scrolling action.
     * @zh 停止滑动。
     */
    stopScroll(): void {
        this.onStageMouseUp2(null);
        ILaya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
    }

    /**
     * @en The minimum increment unit for the slider tick value, with a default value of 1.
     * @zh 滑动条刻度值的最小变动单位，默认值为1。
     */
    get tick(): number {
        return this.slider.tick;
    }

    set tick(value: number) {
        this.slider.tick = value;
    }

    /**
     * @en Restores the scrollbar to its normal elastic bounce-back motion.
     * @zh 恢复到正常的弹性缓动效果。
     */
    backToNormal(): void {
        if (this._value < this.min) {
            this._backToNormal(this.min);
        } else if (this._value > this.max) {
            this._backToNormal(this.max);
        }
    }

    private _backToNormal(value: number) {
        Tween.to(this, { value: value }, this.elasticBackTime, ScrollBar.easeFunction, Handler.create(this, this.elasticOver));
    }
}
