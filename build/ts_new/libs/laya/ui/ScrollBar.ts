import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { UIConfig } from "./../../UIConfig";
import { Styles } from "./Styles";
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Loader } from "../net/Loader"
import { Ease } from "../utils/Ease"
import { Handler } from "../utils/Handler"
import { Tween } from "../utils/Tween"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 滚动条滑块位置发生变化后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * 开始滑动。
 * @eventType laya.events.Event
 */
/*[Event(name = "start", type = "laya.events.Event")]*/
/**
 * 结束滑动。
 * @eventType laya.events.Event
 */
/*[Event(name = "end", type = "laya.events.Event")]*/

/**
 * <code>ScrollBar</code> 组件是一个滚动条组件。
 * <p>当数据太多以至于显示区域无法容纳时，最终用户可以使用 <code>ScrollBar</code> 组件控制所显示的数据部分。</p>
 * <p> 滚动条由四部分组成：两个箭头按钮、一个轨道和一个滑块。 </p>	 *
 *
 * @see laya.ui.VScrollBar
 * @see laya.ui.HScrollBar
 */
export class ScrollBar extends UIComponent {
    /**滚动衰减系数*/
    rollRatio: number = 0.97;
    /**滚动变化时回调，回传value参数。*/
    changeHandler: Handler;
    /**是否缩放滑动条，默认值为true。 */
    scaleBar: boolean = true;
    /**一个布尔值，指定是否自动隐藏滚动条(无需滚动时)，默认值为false。*/
    autoHide: boolean = false;
    /**橡皮筋效果极限距离，0为没有橡皮筋效果。*/
    elasticDistance: number = 0;
    /**橡皮筋回弹时间，单位为毫秒。*/
    elasticBackTime: number = 500;
    /**上按钮 */
    upButton: Button;
    /**下按钮 */
    downButton: Button;
    /**滑条 */
    slider: Slider;

    /**@private */
    protected _showButtons: boolean = UIConfig.showButtons;
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
    protected _touchScrollEnable: boolean = UIConfig.touchScrollEnable;
    /**@private */
    protected _mouseWheelEnable: boolean = UIConfig.mouseWheelEnable;

    /**
     * 创建一个新的 <code>ScrollBar</code> 实例。
     * @param skin 皮肤资源地址。
     */
    constructor(skin: string = null) {
        super();
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
     */
    protected createChildren(): void {
        this.addChild(this.slider = new Slider());
        //TODO:
        this.addChild(this.upButton = new Button());
        this.addChild(this.downButton = new Button());
    }
    /**
     * @override
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
     * 滑块位置发生改变的处理函数。
     */
    protected onSliderChange(): void {
        if (this._value != this.slider.value) this.value = this.slider.value;
    }

    /**
     * @private
     * 向上和向下按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
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
     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    protected onStageMouseUp(e: Event): void {
        ILaya.timer.clear(this, this.startLoop);
        ILaya.timer.clear(this, this.slide);
    }

    /**
     * @copy laya.ui.Image#skin
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (value == " ") return;
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                ILaya.loader.load([this._skin, this._skin.replace(".png", "$up.png"), this._skin.replace(".png", "$down.png"), this._skin.replace(".png", "$bar.png")], Handler.create(this, this._skinLoaded));
            } else {
                this._skinLoaded();
            }
        }
    }

    protected _skinLoaded(): void {
        if (this.destroyed) {
            return
        }
        this.slider.skin = this._skin;
        this.callLater(this.changeScrollBar);
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**
     * @private
     * 更改对象的皮肤及位置。
     */
    protected changeScrollBar(): void {
        this.upButton.visible = this._showButtons;
        this.downButton.visible = this._showButtons;
        if (this._showButtons) {
            this.upButton.skin = this._skin.replace(".png", "$up.png");
            this.downButton.skin = this._skin.replace(".png", "$down.png");
        }
        if (this.slider.isVertical) this.slider.y = this._showButtons ? this.upButton.height : 0;
        else this.slider.x = this._showButtons ? this.upButton.width : 0;
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
     * 设置滚动条信息。
     * @param min 滚动条最小位置值。
     * @param max 滚动条最大位置值。
     * @param value 滚动条当前位置值。
     */
    setScroll(min: number, max: number, value: number): void {
        this.runCallLater(this._sizeChanged);
        this.slider.setSlider(min, max, value);
        //_upButton.disabled = max <= 0;
        //_downButton.disabled = max <= 0;
        this.slider.bar.visible = max > 0;
        if (!this._hide && this.autoHide) this.visible = false;
    }

    /**
     * 获取或设置表示最高滚动位置的数字。
     */
    get max(): number {
        return this.slider.max;
    }

    set max(value: number) {
        this.slider.max = value;
    }

    /**
     * 获取或设置表示最低滚动位置的数字。
     */
    get min(): number {
        return this.slider.min;
    }

    set min(value: number) {
        this.slider.min = value;
    }

    /**
     * 获取或设置表示当前滚动位置的数字。
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
     * 一个布尔值，指示滚动条是否为垂直滚动。如果值为true，则为垂直滚动，否则为水平滚动。
     * <p>默认值为：true。</p>
     */
    get isVertical(): boolean {
        return this.slider.isVertical;
    }

    set isVertical(value: boolean) {
        this.slider.isVertical = value;
    }

    /**
     * <p>当前实例的 <code>Slider</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid(): string {
        return this.slider.sizeGrid;
    }

    set sizeGrid(value: string) {
        this.slider.sizeGrid = value;
    }

    /**获取或设置一个值，该值表示按下滚动条轨道时页面滚动的增量。 */
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
    set dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string') this.value = Number(value);
        else super.dataSource = value;
    }
    /**
     * @inheritDoc
     * @override
     */
    get dataSource() {
        return super.dataSource;
    }

    /**获取或设置一个值，该值表示滑条长度比例，值为：（0-1）。 */
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
     * 设置滚动对象。
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

    /**是否隐藏滚动条，不显示滚动条，但是可以正常滚动，默认为false。*/
    get hide(): boolean {
        return this._hide;
    }

    set hide(value: boolean) {
        this._hide = value;
        this.visible = !value;
    }

    /**一个布尔值，指定是否显示向上、向下按钮，默认值为true。*/
    get showButtons(): boolean {
        return this._showButtons;
    }

    set showButtons(value: boolean) {
        this._showButtons = value;
        this.callLater(this.changeScrollBar);
    }

    /**一个布尔值，指定是否开启触摸，默认值为true。*/
    get touchScrollEnable(): boolean {
        return this._touchScrollEnable;
    }

    set touchScrollEnable(value: boolean) {
        this._touchScrollEnable = value;
        this.target = this._target;
    }

    /** 一个布尔值，指定是否滑轮滚动，默认值为true。*/
    get mouseWheelEnable(): boolean {
        return this._mouseWheelEnable;
    }

    set mouseWheelEnable(value: boolean) {
        this._mouseWheelEnable = value;
        this.target = this._target;
    }

    /**@private */
    protected onTargetMouseWheel(e: Event): void {
        this.value -= e.delta * this._scrollSize;
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


    triggerDownDragLimit: Function;
    triggerUpDragLimit: Function;

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

    get lastOffset(): number {
        return this._lastOffset;
    }

    startTweenMoveForce(lastOffset: number): void {
        this._lastOffset = lastOffset;
        ILaya.timer.frameLoop(1, this, this.tweenMove, [200]);
    }
    /**@private */
    protected loop(): void {
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
                Tween.to(this, { value: this.min }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
            } else if (this._value > this.max) {
                Tween.to(this, { value: this.max }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
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
                    Tween.to(this, { value: this.min }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
                } else if (this._value > this.max) {
                    Tween.to(this, { value: this.max }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
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
     * 停止滑动。
     */
    stopScroll(): void {
        this.onStageMouseUp2(null);
        ILaya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
    }

    /**
     * 滚动的刻度值，滑动数值为tick的整数倍。默认值为1。
     */
    get tick(): number {
        return this.slider.tick;
    }

    set tick(value: number) {
        this.slider.tick = value;
    }
}

ILaya.regClass(ScrollBar);
ClassUtils.regClass("laya.ui.ScrollBar", ScrollBar);
ClassUtils.regClass("Laya.ScrollBar", ScrollBar);