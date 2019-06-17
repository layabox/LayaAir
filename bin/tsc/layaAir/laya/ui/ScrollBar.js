import { UIComponent } from "././UIComponent";
import { Button } from "././Button";
import { Slider } from "././Slider";
import { UIConfig } from "./../../UIConfig";
import { Styles } from "././Styles";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Loader } from "../net/Loader";
import { Ease } from "../utils/Ease";
import { Handler } from "../utils/Handler";
import { Tween } from "../utils/Tween";
import { ILaya } from "ILaya";
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
    /**
     * 创建一个新的 <code>ScrollBar</code> 实例。
     * @param skin 皮肤资源地址。
     */
    constructor(skin = null) {
        super();
        /**滚动衰减系数*/
        this.rollRatio = 0.97;
        /**是否缩放滑动条，默认值为true。 */
        this.scaleBar = true;
        /**一个布尔值，指定是否自动隐藏滚动条(无需滚动时)，默认值为false。*/
        this.autoHide = false;
        /**橡皮筋效果极限距离，0为没有橡皮筋效果。*/
        this.elasticDistance = 0;
        /**橡皮筋回弹时间，单位为毫秒。*/
        this.elasticBackTime = 500;
        /**@private */
        this._showButtons = UIConfig.showButtons;
        /**@private */
        this._scrollSize = 1;
        /**@private */
        this._thumbPercent = 1;
        /**@private */
        this._lastOffset = 0;
        /**@private */
        this._checkElastic = false;
        /**@private */
        this._isElastic = false;
        /**@private */
        this._hide = false;
        /**@private */
        this._clickOnly = true;
        /**@private */
        this._touchScrollEnable = UIConfig.touchScrollEnable;
        /**@private */
        this._mouseWheelEnable = UIConfig.mouseWheelEnable;
        this.skin = skin;
        this.max = 1;
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
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
    /**@inheritDoc */
    /*override*/ createChildren() {
        this.addChild(this.slider = new Slider());
        //TODO:
        this.addChild(this.upButton = new Button());
        this.addChild(this.downButton = new Button());
    }
    /**@inheritDoc */
    /*override*/ initialize() {
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
    onSliderChange() {
        if (this._value != this.slider.value)
            this.value = this.slider.value;
    }
    /**
     * @private
     * 向上和向下按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    onButtonMouseDown(e) {
        var Laya = window.Laya;
        var isUp = e.currentTarget === this.upButton;
        this.slide(isUp);
        Laya.timer.once(Styles.scrollBarDelayTime, this, this.startLoop, [isUp]);
        Laya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp);
    }
    /**@private */
    startLoop(isUp) {
        window.Laya.timer.frameLoop(1, this, this.slide, [isUp]);
    }
    /**@private */
    slide(isUp) {
        if (isUp)
            this.value -= this._scrollSize;
        else
            this.value += this._scrollSize;
    }
    /**
     * @private
     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    onStageMouseUp(e) {
        var Laya = window.Laya;
        Laya.timer.clear(this, this.startLoop);
        Laya.timer.clear(this, this.slide);
    }
    /**
     * @copy laya.ui.Image#skin
     */
    get skin() {
        return this._skin;
    }
    set skin(value) {
        if (value == " ")
            return;
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                window.Laya.loader.load([this._skin, this._skin.replace(".png", "$up.png"), this._skin.replace(".png", "$down.png"), this._skin.replace(".png", "$bar.png")], Handler.create(this, this._skinLoaded));
            }
            else {
                this._skinLoaded();
            }
        }
    }
    _skinLoaded() {
        this.slider.skin = this._skin;
        this.callLater(this.changeScrollBar);
        this._sizeChanged();
        this.event(Event.LOADED);
    }
    /**
     * @private
     * 更改对象的皮肤及位置。
     */
    changeScrollBar() {
        this.upButton.visible = this._showButtons;
        this.downButton.visible = this._showButtons;
        if (this._showButtons) {
            this.upButton.skin = this._skin.replace(".png", "$up.png");
            this.downButton.skin = this._skin.replace(".png", "$down.png");
        }
        if (this.slider.isVertical)
            this.slider.y = this._showButtons ? this.upButton.height : 0;
        else
            this.slider.x = this._showButtons ? this.upButton.width : 0;
        this.resetPositions();
        this.repaint();
    }
    /**@inheritDoc */
    /*override*/ _sizeChanged() {
        super._sizeChanged();
        this.repaint();
        this.resetPositions();
        this.event(Event.CHANGE);
        this.changeHandler && this.changeHandler.runWith(this.value);
    }
    /**@private */
    resetPositions() {
        if (this.slider.isVertical)
            this.slider.height = this.height - (this._showButtons ? (this.upButton.height + this.downButton.height) : 0);
        else
            this.slider.width = this.width - (this._showButtons ? (this.upButton.width + this.downButton.width) : 0);
        this.resetButtonPosition();
    }
    /**@private */
    resetButtonPosition() {
        if (this.slider.isVertical)
            this.downButton.y = this.slider._y + this.slider.height;
        else
            this.downButton.x = this.slider._x + this.slider.width;
    }
    /**@inheritDoc */
    /*override*/ measureWidth() {
        if (this.slider.isVertical)
            return this.slider.width;
        return 100;
    }
    /**@inheritDoc */
    /*override*/ measureHeight() {
        if (this.slider.isVertical)
            return 100;
        return this.slider.height;
    }
    /**
     * 设置滚动条信息。
     * @param min 滚动条最小位置值。
     * @param max 滚动条最大位置值。
     * @param value 滚动条当前位置值。
     */
    setScroll(min, max, value) {
        this.runCallLater(this._sizeChanged);
        this.slider.setSlider(min, max, value);
        //_upButton.disabled = max <= 0;
        //_downButton.disabled = max <= 0;
        this.slider.bar.visible = max > 0;
        if (!this._hide && this.autoHide)
            this.visible = false;
    }
    /**
     * 获取或设置表示最高滚动位置的数字。
     */
    get max() {
        return this.slider.max;
    }
    set max(value) {
        this.slider.max = value;
    }
    /**
     * 获取或设置表示最低滚动位置的数字。
     */
    get min() {
        return this.slider.min;
    }
    set min(value) {
        this.slider.min = value;
    }
    /**
     * 获取或设置表示当前滚动位置的数字。
     */
    get value() {
        return this._value;
    }
    set value(v) {
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
    get isVertical() {
        return this.slider.isVertical;
    }
    set isVertical(value) {
        this.slider.isVertical = value;
    }
    /**
     * <p>当前实例的 <code>Slider</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid() {
        return this.slider.sizeGrid;
    }
    set sizeGrid(value) {
        this.slider.sizeGrid = value;
    }
    /**获取或设置一个值，该值表示按下滚动条轨道时页面滚动的增量。 */
    get scrollSize() {
        return this._scrollSize;
    }
    set scrollSize(value) {
        this._scrollSize = value;
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
    /**获取或设置一个值，该值表示滑条长度比例，值为：（0-1）。 */
    get thumbPercent() {
        return this._thumbPercent;
    }
    set thumbPercent(value) {
        this.runCallLater(this.changeScrollBar);
        this.runCallLater(this._sizeChanged);
        value = value >= 1 ? 0.99 : value;
        this._thumbPercent = value;
        if (this.scaleBar) {
            if (this.slider.isVertical)
                this.slider.bar.height = Math.max(this.slider.height * value, Styles.scrollBarMinNum);
            else
                this.slider.bar.width = Math.max(this.slider.width * value, Styles.scrollBarMinNum);
        }
    }
    /**
     * 设置滚动对象。
     * @see laya.ui.TouchScroll#target
     */
    get target() {
        return this._target;
    }
    set target(value) {
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
    get hide() {
        return this._hide;
    }
    set hide(value) {
        this._hide = value;
        this.visible = !value;
    }
    /**一个布尔值，指定是否显示向上、向下按钮，默认值为true。*/
    get showButtons() {
        return this._showButtons;
    }
    set showButtons(value) {
        this._showButtons = value;
        this.callLater(this.changeScrollBar);
    }
    /**一个布尔值，指定是否开启触摸，默认值为true。*/
    get touchScrollEnable() {
        return this._touchScrollEnable;
    }
    set touchScrollEnable(value) {
        this._touchScrollEnable = value;
        this.target = this._target;
    }
    /** 一个布尔值，指定是否滑轮滚动，默认值为true。*/
    get mouseWheelEnable() {
        return this._mouseWheelEnable;
    }
    set mouseWheelEnable(value) {
        this._mouseWheelEnable = value;
        this.target = this._target;
    }
    /**@private */
    onTargetMouseWheel(e) {
        this.value -= e.delta * this._scrollSize;
        this.target = this._target;
    }
    /**@private */
    onTargetMouseDown(e) {
        var Laya = window.Laya;
        if ((this.isLockedFun) && !this.isLockedFun(e))
            return;
        this.event(Event.END);
        this._clickOnly = true;
        this._lastOffset = 0;
        this._checkElastic = false;
        this._lastPoint || (this._lastPoint = new Point());
        this._lastPoint.setTo(Laya.stage.mouseX, Laya.stage.mouseY);
        Laya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
        Laya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp2);
        Laya.stage.once(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        Laya.timer.frameLoop(1, this, this.loop);
    }
    startDragForce() {
        var Laya = window.Laya;
        this._clickOnly = true;
        this._lastOffset = 0;
        this._checkElastic = false;
        this._lastPoint || (this._lastPoint = new Point());
        this._lastPoint.setTo(Laya.stage.mouseX, Laya.stage.mouseY);
        Laya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
        Laya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp2);
        Laya.stage.once(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        Laya.timer.frameLoop(1, this, this.loop);
    }
    cancelDragOp() {
        var Laya = window.Laya;
        Laya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp2);
        Laya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        Laya.timer.clear(this, this.tweenMove);
        Laya.timer.clear(this, this.loop);
        this._target.mouseEnabled = true;
    }
    checkTriggers(isTweenMove = false) {
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
    get lastOffset() {
        return this._lastOffset;
    }
    startTweenMoveForce(lastOffset) {
        this._lastOffset = lastOffset;
        window.Laya.timer.frameLoop(1, this, this.tweenMove, [200]);
    }
    /**@private */
    loop() {
        var Laya = window.Laya;
        var mouseY = Laya.stage.mouseY;
        var mouseX = Laya.stage.mouseX;
        this._lastOffset = this.isVertical ? (mouseY - this._lastPoint.y) : (mouseX - this._lastPoint.x);
        if (this._clickOnly) {
            if (Math.abs(this._lastOffset * (this.isVertical ? Laya.stage._canvasTransform.getScaleY() : Laya.stage._canvasTransform.getScaleX())) > 1) {
                this._clickOnly = false;
                if (this.checkTriggers())
                    return;
                this._offsets || (this._offsets = []);
                this._offsets.length = 0;
                this._target.mouseEnabled = false;
                if (!this.hide && this.autoHide) {
                    this.alpha = 1;
                    this.visible = true;
                }
                this.event(Event.START);
            }
            else
                return;
        }
        else {
            if (this.checkTriggers())
                return;
        }
        this._offsets.push(this._lastOffset);
        this._lastPoint.x = mouseX;
        this._lastPoint.y = mouseY;
        if (this._lastOffset === 0)
            return;
        if (!this._checkElastic) {
            if (this.elasticDistance > 0) {
                if (!this._checkElastic && this._lastOffset != 0) {
                    if ((this._lastOffset > 0 && this._value <= this.min) || (this._lastOffset < 0 && this._value >= this.max)) {
                        this._isElastic = true;
                        this._checkElastic = true;
                    }
                    else {
                        this._isElastic = false;
                    }
                }
            }
            else {
                this._checkElastic = true;
            }
        }
        if (this._isElastic) {
            if (this._value <= this.min) {
                if (this._lastOffset > 0) {
                    this.value -= this._lastOffset * Math.max(0, (1 - ((this.min - this._value) / this.elasticDistance)));
                }
                else {
                    this.value -= this._lastOffset * 0.5;
                    if (this._value >= this.min)
                        this._checkElastic = false;
                }
            }
            else if (this._value >= this.max) {
                if (this._lastOffset < 0) {
                    this.value -= this._lastOffset * Math.max(0, (1 - ((this._value - this.max) / this.elasticDistance)));
                }
                else {
                    this.value -= this._lastOffset * 0.5;
                    if (this._value <= this.max)
                        this._checkElastic = false;
                }
            }
        }
        else {
            this.value -= this._lastOffset;
        }
    }
    /**@private */
    onStageMouseUp2(e) {
        var Laya = window.Laya;
        Laya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp2);
        Laya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp2);
        Laya.timer.clear(this, this.loop);
        if (this._clickOnly) {
            if (this._value >= this.min && this._value <= this.max)
                return;
        }
        this._target.mouseEnabled = true;
        if (this._isElastic) {
            if (this._value < this.min) {
                Tween.to(this, { value: this.min }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
            }
            else if (this._value > this.max) {
                Tween.to(this, { value: this.max }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
            }
        }
        else {
            if (!this._offsets)
                return;
            //计算平均值
            if (this._offsets.length < 1) {
                this._offsets[0] = this.isVertical ? Laya.stage.mouseY - this._lastPoint.y : Laya.stage.mouseX - this._lastPoint.x;
            }
            var offset = 0;
            var n = Math.min(this._offsets.length, 3);
            for (var i = 0; i < n; i++) {
                offset += this._offsets[this._offsets.length - 1 - i];
            }
            this._lastOffset = offset / n;
            offset = Math.abs(this._lastOffset);
            if (offset < 2) {
                this.event(Event.END);
                return;
            }
            if (offset > 250)
                this._lastOffset = this._lastOffset > 0 ? 250 : -250;
            var dis = Math.round(Math.abs(this.elasticDistance * (this._lastOffset / 150)));
            Laya.timer.frameLoop(1, this, this.tweenMove, [dis]);
        }
    }
    /**@private */
    elasticOver() {
        this._isElastic = false;
        if (!this.hide && this.autoHide) {
            Tween.to(this, { alpha: 0 }, 500);
        }
        this.event(Event.END);
    }
    /**@private */
    tweenMove(maxDistance) {
        this._lastOffset *= this.rollRatio;
        if (this.checkTriggers(true)) {
            return;
        }
        var tarSpeed;
        if (maxDistance > 0) {
            if (this._lastOffset > 0 && this.value <= this.min) {
                this._isElastic = true;
                tarSpeed = -(this.min - maxDistance - this.value) * 0.5;
                if (this._lastOffset > tarSpeed)
                    this._lastOffset = tarSpeed;
            }
            else if (this._lastOffset < 0 && this.value >= this.max) {
                this._isElastic = true;
                tarSpeed = -(this.max + maxDistance - this.value) * 0.5;
                if (this._lastOffset < tarSpeed)
                    this._lastOffset = tarSpeed;
            }
        }
        this.value -= this._lastOffset;
        //if (Math.abs(_lastOffset) < 1 || value == max || value == min) 
        if (Math.abs(this._lastOffset) < 0.1) {
            window.Laya.timer.clear(this, this.tweenMove);
            if (this._isElastic) {
                if (this._value < this.min) {
                    Tween.to(this, { value: this.min }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
                }
                else if (this._value > this.max) {
                    Tween.to(this, { value: this.max }, this.elasticBackTime, Ease.sineOut, Handler.create(this, this.elasticOver));
                }
                else {
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
    stopScroll() {
        this.onStageMouseUp2(null);
        window.Laya.timer.clear(this, this.tweenMove);
        Tween.clearTween(this);
    }
    /**
     * 滚动的刻度值，滑动数值为tick的整数倍。默认值为1。
     */
    get tick() {
        return this.slider.tick;
    }
    set tick(value) {
        this.slider.tick = value;
    }
}
ILaya.regClass(ScrollBar);
