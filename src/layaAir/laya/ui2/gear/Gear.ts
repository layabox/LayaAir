import { LayaEnv } from "../../../LayaEnv";
import { Tween } from "../../tween/Tween";
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
        if (this._controller) {
            if (value) {
                this._controller.validate();
                this.onChanged(true);
            }
            else
                this._controller.release();
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
            if (value != null && typeof (value) === "object" && typeof ((<any>value).clone) === "function")
                value = (<any>value).clone();
        }

        return value;
    }

    protected doTween(obj: any, key: string, oldValue: T, newValue: T) {
        let tc = this._tweenCfg;
        if (this._tween) {
            this._tween.kill(true);
            this._tween = null;
        }

        this._tween = Tween.create(this)
            .duration(tc.duration).delay(tc.delay)
            .then(() => {
                this._tween = null;
                obj[key] = newValue;
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
        if (newValue !== undefined) {
            if (disableTween
                || !this._tweenCfg || !this._tweenCfg.enabled
                || Gear.disableAllTweenEffect
                || !LayaEnv.isPlaying)
                obj[key] = newValue;
            else {
                let oldValue = obj[key];
                if (oldValue == null)
                    obj[key] = newValue;
                else
                    this.doTween(obj, key, oldValue, newValue);
            }
        }
    }
}

export class GearString extends Gear<string> { }
export class GearBool extends Gear<boolean> { }