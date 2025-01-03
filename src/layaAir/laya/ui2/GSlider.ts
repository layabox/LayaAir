
import { ILaya } from "../../ILaya";
import { NodeFlags } from "../Const";
import { Event } from "../events/Event";
import { MathUtil } from "../maths/MathUtil";
import { Point } from "../maths/Point";
import { ProgressTitleType } from "./Const";
import { GWidget } from "./GWidget";
import { UIEvent } from "./UIEvent";

export class GSlider extends GWidget {
    public changeOnClick: boolean = true;
    public canDrag: boolean = true;

    private _hBar: GWidget;
    private _vBar: GWidget;
    private _gripButton: GWidget;
    private _titleGWidget: GWidget;

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

    public get titleType(): ProgressTitleType {
        return this._titleType;
    }

    public set titleType(value: ProgressTitleType) {
        this._titleType = value;
    }

    public get reverse(): boolean {
        return this._reverse;
    }

    public set reverse(value: boolean) {
        this._reverse = value;
    }

    public get wholeNumbers(): boolean {
        return this._wholeNumbers;
    }

    public set wholeNumbers(value: boolean) {
        if (this._wholeNumbers != value) {
            this._wholeNumbers = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    public get min(): number {
        return this._min;
    }

    public set min(value: number) {
        if (this._min != value) {
            this._min = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    public get max(): number {
        return this._max;
    }

    public set max(value: number) {
        if (this._max != value) {
            this._max = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        if (this._value != value) {
            this._value = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    public update(): void {
        if (this._getBit(NodeFlags.EDITING_ROOT_NODE))
            return;

        this.updateWithPercent((this._value - this._min) / (this._max - this._min), false);
    }

    private updateWithPercent(percent: number, manual?: boolean): void {
        percent = MathUtil.clamp01(percent);
        if (manual) {
            let newValue = MathUtil.clamp(this._min + (this._max - this._min) * percent, this._min, this._max);
            if (this._wholeNumbers) {
                newValue = Math.round(newValue);
                percent = MathUtil.clamp01((newValue - this._min) / (this._max - this._min));
            }

            if (newValue != this._value) {
                this._value = newValue;
                this.event(Event.CHANGED);
            }
        }

        let obj = this._titleGWidget;
        if (obj) {
            switch (this._titleType) {
                case ProgressTitleType.Percent:
                    obj.text = Math.floor(percent * 100) + "%";
                    break;

                case ProgressTitleType.ValueAndMax:
                    obj.text = this._value + "/" + this._max;
                    break;

                case ProgressTitleType.Value:
                    obj.text = "" + this._value;
                    break;

                case ProgressTitleType.Max:
                    obj.text = "" + this._max;
                    break;
            }
        }

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
}

const s_vec2 = new Point();