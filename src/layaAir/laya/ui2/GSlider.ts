
import { ILaya } from "../../ILaya";
import { NodeFlags } from "../Const";
import { Event } from "../events/Event";
import { MathUtil } from "../maths/MathUtil";
import { Point } from "../maths/Point";
import { ProgressTitleType } from "./Const";
import { GWidget } from "./GWidget";

/**
 * @en GSlider is a widget that provides a slider interface for selecting a value within a range.
 * @zh GSlider 是一个提供滑块界面的小部件，用于在范围内选择值。
 * @blueprintInheritable
 */
export class GSlider extends GWidget {
    /**
     * @en Whether the slider changes value when clicked on the bar.
     * @zh 是否在点击滑块条时更改值。
     */
    changeOnClick: boolean = true;
    /**
     * @en Whether the slider can be dragged to change its value.
     * @zh 是否可以拖动滑块以更改其值。
     */
    canDrag: boolean = true;

    private _hBar: GWidget;
    private _vBar: GWidget;
    private _gripButton: GWidget;
    private _titleWidget: GWidget;

    private _min: number = 0;
    private _max: number = 0;
    private _value: number = 0;
    private _titleType: ProgressTitleType = 0;
    private _reverse: boolean = false;
    private _wholeNumbers: boolean = false;

    private _barMaxWidth: number = 0;
    private _barMaxHeight: number = 0;
    private _barMaxWidthDelta: number = 0;
    private _barMaxHeightDelta: number = 0;
    private _clickPos: Point;
    private _clickPercent: number = 0;
    private _barStartX: number = 0;
    private _barStartY: number = 0;

    constructor() {
        super();

        this._value = 50;
        this._max = 100;
        this._clickPos = new Point();

        this.on(Event.MOUSE_DOWN, this, this._barTouchBegin);
    }

    /**
     * @en The type of title displayed on the slider.
     * @zh 滑块上显示的标题类型。
     */
    get titleType(): ProgressTitleType {
        return this._titleType;
    }

    set titleType(value: ProgressTitleType) {
        if (this._titleType != value) {
            this._titleType = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    /**
     * @en If true, the slider will only stop at integer positions when dragged by the user, meaning the slider's value will always be an integer.
     * @zh 如果为true，则当滑动条被用户滑动时，最后只会停止在整数位置上，也就是滑动条的值始终是整数。
     */
    get wholeNumbers(): boolean {
        return this._wholeNumbers;
    }

    set wholeNumbers(value: boolean) {
        if (this._wholeNumbers != value) {
            this._wholeNumbers = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    /**
     * @en Minimum value of the slider.
     * @zh 滑块的最小值。
     */
    get min(): number {
        return this._min;
    }

    set min(value: number) {
        if (this._min != value) {
            this._min = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    /**
     * @en Maximum value of the slider.
     * @zh 滑块的最大值。
     */
    get max(): number {
        return this._max;
    }

    set max(value: number) {
        if (this._max != value) {
            this._max = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    /**
     * @en Current value of the slider.
     * @zh 滑块的当前值。
     */
    get value(): number {
        return this._value;
    }

    set value(value: number) {
        if (this._value != value) {
            this._value = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    protected update(): void {
        this.updateWithPercent((this._value - this._min) / (this._max - this._min), false);
    }

    private updateWithPercent(percent: number, manual?: boolean): void {
        if (this._getBit(NodeFlags.EDITING_ROOT_NODE)) {
            this.updateTitle(this._max, this._max, 1);
            return;
        }

        percent = MathUtil.clamp01(percent);
        if (manual) {
            let newValue = MathUtil.clamp(this._min + (this._max - this._min) * percent, this._min, this._max);
            if (this._wholeNumbers) {
                newValue = Math.round(newValue);
                percent = MathUtil.clamp01((newValue - this._min) / (this._max - this._min));
            }

            if (newValue != this._value) {
                this._value = newValue;
                this.event(Event.CHANGED, Event.EMPTY);
                if (!this.canDrag)
                    return;
            }
        }

        this.updateTitle(this._value, this._max, percent);

        let fullWidth = this.width - this._barMaxWidthDelta;
        let fullHeight = this.height - this._barMaxHeightDelta;
        if (!this._reverse) {
            if (this._hBar)
                this._hBar.width = Math.round(fullWidth * percent);
            if (this._vBar)
                this._vBar.height = Math.round(fullHeight * percent);
        }
        else {
            if (this._hBar) {
                this._hBar.width = Math.round(fullWidth * percent);
                this._hBar.x = this._barStartX + (fullWidth - this._hBar.width);
            }
            if (this._vBar) {
                this._vBar.height = Math.round(fullHeight * percent);
                this._vBar.y = this._barStartY + (fullHeight - this._vBar.height);
            }
        }
    }

    private updateTitle(value: number, max: number, percent: number) {
        let obj = this._titleWidget;
        if (!obj)
            return;

        switch (this._titleType) {
            case ProgressTitleType.Percent:
                obj.text = Math.floor(percent * 100) + "%";
                break;

            case ProgressTitleType.ValueAndMax:
                obj.text = Math.floor(value) + "/" + Math.floor(max);
                break;

            case ProgressTitleType.Value:
                obj.text = "" + Math.floor(value);
                break;

            case ProgressTitleType.Max:
                obj.text = "" + Math.floor(max);
                break;
        }
    }

    /** @internal */
    _onConstruct(inPrefab?: boolean): void {
        if (this._hBar) {
            this._barMaxWidth = this._hBar.width;
            this._barMaxWidthDelta = this.width - this._barMaxWidth;
            this._barStartX = this._hBar.x;
        }
        if (this._vBar) {
            this._barMaxHeight = this._vBar.height;
            this._barMaxHeightDelta = this.height - this._barMaxHeight;
            this._barStartY = this._vBar.y;
        }
        if (this._gripButton) {
            this._gripButton.on(Event.MOUSE_DOWN, this, this._gripTouchBegin);
            this._gripButton.on(Event.MOUSE_DRAG, this, this._gripTouchMove);
        }
        this.update();

        super._onConstruct(inPrefab);
    }

    /** @ignore */
    _setup(hBar: GWidget, vBar: GWidget, grip: GWidget, title: GWidget, reverse: boolean): void {
        this._hBar = hBar;
        this._vBar = vBar;
        this._gripButton = grip;
        this._titleWidget = title;
        this._reverse = reverse;
        this._value = this._max;

        this._onConstruct();
    }

    protected _sizeChanged(): void {
        super._sizeChanged();

        if (this._hBar)
            this._barMaxWidth = this.width - this._barMaxWidthDelta;
        if (this._vBar)
            this._barMaxHeight = this.height - this._barMaxHeightDelta;
        ILaya.timer.callLater(this, this.update);
    }

    private _gripTouchBegin(evt: Event): void {
        if (evt.button != 0)
            return;

        this.canDrag = true;
        evt.stopPropagation();

        this.globalToLocal(this._clickPos.copy(evt.touchPos));
        this._clickPercent = MathUtil.clamp01((this._value - this._min) / (this._max - this._min));
    }

    private _gripTouchMove(evt: Event): void {
        if (!this.canDrag)
            return;

        let pt = this.globalToLocal(s_vec2.copy(evt.touchPos));
        let deltaX = pt.x - this._clickPos.x;
        let deltaY = pt.y - this._clickPos.y;
        if (this._reverse) {
            deltaX = -deltaX;
            deltaY = -deltaY;
        }
        let percent: number;
        if (this._hBar)
            percent = this._clickPercent + deltaX / this._barMaxWidth;
        else
            percent = this._clickPercent + deltaY / this._barMaxHeight;
        this.updateWithPercent(percent, true);
    }

    private _barTouchBegin(evt: Event): void {
        if (!this.changeOnClick)
            return;

        let pt = this._gripButton.globalToLocal(s_vec2.copy(evt.touchPos));
        let percent = MathUtil.clamp01((this._value - this._min) / (this._max - this._min));
        let delta = 0;
        if (this._hBar)
            delta = (pt.x - this._gripButton.width / 2) / this._barMaxWidth;
        if (this._vBar)
            delta = (pt.y - this._gripButton.height / 2) / this._barMaxHeight;
        if (this._reverse)
            percent -= delta;
        else
            percent += delta;
        this.updateWithPercent(percent, true);
    }

    /** @internal @blueprintEvent */
    GSlider_bpEvent: {
        [Event.CHANGED]: (e: Event) => void;
    };
}

const s_vec2 = new Point();