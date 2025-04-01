import { NodeFlags } from "../../Const";
import { Color } from "../../maths/Color";
import { Ease } from "../../tween/Ease";
import { Tween } from "../../tween/Tween";
import { IClone } from "../../utils/IClone";
import { ControllerRef } from "../ControllerRef";
import type { GWidget } from "../GWidget";
import { GearTweenConfig } from "./GearTweenConfig";

export class Gear<T> {
    protected _owner: GWidget;
    protected _controller: ControllerRef;
    protected _propPath: string;
    protected _tweenCfg: GearTweenConfig;
    protected _tween: Tween;

    /** @internal */
    _propPathArr: string[];

    values: Record<number, T>;

    public static disableAllTweenEffect = false;

    constructor() {
        this.values = {};
    }

    get owner() {
        return this._owner;
    }

    set owner(value: GWidget) {
        this._owner = value;
        if (value) {
            this._controller?.validate();
            this.onChanged(true);
        }
        else {
            this._controller?.release();
            this._tween?.kill();
        }
    }

    get controller() {
        return this._controller;
    }

    set controller(value: ControllerRef) {
        if (this._controller)
            this._controller.release();
        this._controller = value;
        if (value) {
            value.onChanged = () => this.onChanged();
            if (this._owner)
                value.validate();
        }
    }

    public get propPath(): string {
        return this._propPath;
    }

    public set propPath(value: string) {
        this._propPath = value;
        this._propPathArr = value ? value.split(".") : null;
        this.onChanged(true);
    }

    public get tween(): GearTweenConfig {
        return this._tweenCfg;
    }

    public set tween(value: GearTweenConfig) {
        this._tweenCfg = value;
    }

    protected onChanged(disableTween?: boolean) {
        if (this._owner && this._controller)
            this.runGear(disableTween);
    }

    protected getValue(page: number) {
        let value = this.values[page];
        if (value === undefined && page != 0) {
            value = this.values[0];
            if (value != null && typeof (value) === "object" && typeof (<IClone><any>value).clone === "function")
                value = (<IClone><any>value).clone();
        }

        return value;
    }

    protected doTween(obj: any, key: string, oldValue: T, newValue: T) {
        if (this._tween) {
            let tweener = this._tween.findTweener(null);
            if (tweener) {
                if (typeof (newValue) === "object" && typeof (<any>newValue).equal === "function") {
                    if ((<any>newValue).equal(tweener.endValue.getAt(0)))
                        return;
                }
                else if (newValue == tweener.endValue.getAt(0))
                    return;
            }

            this._tween.kill();
            this._tween.recover();
        }

        let tc = this._tweenCfg;
        this._tween = Tween.create(obj)
            .duration(tc.duration)
            .delay(tc.delay)
            .ease(Ease[tc.easeType])
            .go(key, oldValue, newValue)
            .then(() => {
                this._tween.recover();
                this._tween = null;
            });
    }

    private runGear(disableTween: boolean) {
        let arr = this._propPathArr;
        if (!arr)
            return;

        let obj: any = this._owner;
        let cnt = arr.length;
        for (let i = 0; i < cnt - 1; i++) {
            obj = obj[arr[i]];
            if (obj == null)
                return;
        }
        let key = arr[cnt - 1];

        if (this.values[0] === undefined)
            this.values[0] = obj[key];

        let newValue = this.getValue(this._controller.selectedIndex);
        if (newValue === undefined)
            return;

        let oldValue = obj[key];

        if (oldValue == null
            || disableTween
            || !this._tweenCfg || !this._tweenCfg.enabled
            || Gear.disableAllTweenEffect
            || this._owner._getBit(NodeFlags.EDITING_NODE)) {
            obj[key] = newValue;
            return;
        }

        this.doTween(obj, key, oldValue, newValue);
    }
}

export class GearNumber extends Gear<Number> { }
export class GearString extends Gear<string> { }
export class GearBool extends Gear<boolean> { }
export class GearColor extends Gear<Color> { }

export class GearStrColor extends Gear<string> {
    protected doTween(obj: any, key: string, oldValue: string, newValue: string): void {
        super.doTween(obj, key, oldValue, newValue);
        this._tween.interp(Tween.seperateChannel);
    }
}

export class GearHexColor extends Gear<Number> {
    protected doTween(obj: any, key: string, oldValue: number, newValue: number): void {
        super.doTween(obj, key, oldValue, newValue);
        this._tween.interp(Tween.seperateChannel, 4);
    }
}