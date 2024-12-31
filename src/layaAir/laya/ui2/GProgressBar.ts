import { GWidget } from "./GWidget";
import { Tween } from "../tween/Tween";
import { ProgressTitleType } from "./Const";
import { ILaya } from "../../ILaya";
import { MathUtil } from "../maths/MathUtil";

export class GProgressBar extends GWidget {
    private _hBar: GWidget;
    private _vBar: GWidget;
    private _titleWidget: GWidget;

    private _min: number = 0;
    private _max: number = 0;
    private _value: number = 0;
    private _titleType: ProgressTitleType = 0;
    private _reverse: boolean = false;

    private _barMaxWidth: number = 0;
    private _barMaxHeight: number = 0;
    private _barMaxWidthDelta: number = 0;
    private _barMaxHeightDelta: number = 0;
    private _barStartX: number = 0;
    private _barStartY: number = 0;

    private _tween: Tween;

    constructor() {
        super();

        this._value = 50;
        this._max = 100;
    }

    public get titleType(): ProgressTitleType {
        return this._titleType;
    }

    public set titleType(value: ProgressTitleType) {
        if (this._titleType != value) {
            this._titleType = value;
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
            if (this._tween) {
                this._tween.kill();
                this._tween = null;
            }

            this._value = value;
            ILaya.timer.callLater(this, this.update);
        }
    }

    public tweenValue(value: number, duration: number): Tween {
        let oldValule: number;

        if (this._tween) {
            let tweener = this._tween.findTweener("progress");
            if (tweener)
                oldValule = tweener.value.get(null);
            else
                oldValule = this._value;
            tweener.kill();
        }
        else
            oldValule = this._value;

        this._value = value;
        return Tween.create(this).name("progress").go(null, oldValule, this._value).duration(duration).ease("linear")
            .onUpdate(tweener => this.update(tweener.value.get(null)));
    }

    public update(newValue: number): void {
        if (newValue == null)
            newValue = this._value;
        let percent = MathUtil.clamp01((newValue - this._min) / (this._max - this._min));
        let obj = this._titleWidget;
        if (obj) {
            switch (this._titleType) {
                case ProgressTitleType.Percent:
                    obj.text = Math.floor(percent * 100) + "%";
                    break;

                case ProgressTitleType.ValueAndMax:
                    obj.text = Math.floor(newValue) + "/" + Math.floor(this._max);
                    break;

                case ProgressTitleType.Value:
                    obj.text = "" + Math.floor(newValue);
                    break;

                case ProgressTitleType.Max:
                    obj.text = "" + Math.floor(this._max);
                    break;
            }
        }

        let fullWidth = this.width - this._barMaxWidthDelta;
        let fullHeight = this.height - this._barMaxHeightDelta;
        if (!this._reverse) {
            if (this._hBar) {
                if (!this.setFillAmount(this._hBar, percent))
                    this._hBar.width = Math.round(fullWidth * percent);
            }
            if (this._vBar) {
                if (!this.setFillAmount(this._vBar, percent))
                    this._vBar.height = Math.round(fullHeight * percent);
            }
        }
        else {
            if (this._hBar) {
                if (!this.setFillAmount(this._hBar, 1 - percent)) {
                    this._hBar.width = Math.round(fullWidth * percent);
                    this._hBar.x = this._barStartX + (fullWidth - this._hBar.width);
                }

            }
            if (this._vBar) {
                if (!this.setFillAmount(this._vBar, 1 - percent)) {
                    this._vBar.height = Math.round(fullHeight * percent);
                    this._vBar.y = this._barStartY + (fullHeight - this._vBar.height);
                }
            }
        }
    }

    private setFillAmount(bar: GWidget, amount: number): boolean {
        return false;
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
        ILaya.timer.runCallLater(this, this.update);

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
}
