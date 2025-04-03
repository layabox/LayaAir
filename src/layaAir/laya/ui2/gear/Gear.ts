import { NodeFlags } from "../../Const";
import { Ease } from "../../tween/Ease";
import { Tween } from "../../tween/Tween";
import { IClone } from "../../utils/IClone";
import { Controller } from "../Controller";
import { ControllerRef } from "../ControllerRef";
import type { GWidget } from "../GWidget";
import { GearTweenConfig } from "./GearTweenConfig";

export class Gear {
    protected _owner: GWidget;
    protected _controller: ControllerRef;
    protected _propPath: string;
    protected _tweenCfg: GearTweenConfig;
    /** @internal */
    _tween: Tween;
    /** @internal */
    _propPathArr: string[];

    values: Record<number, any>;

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
            this.onChanged(null);
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
            value.onChanged = sender => this.onChanged(sender);
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
        this.onChanged(null);
    }

    public get tween(): GearTweenConfig {
        return this._tweenCfg;
    }

    public set tween(value: GearTweenConfig) {
        this._tweenCfg = value;
    }

    protected onChanged(initiator: Controller) {
        if (this._owner && this._controller)
            this.runGear(initiator);
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

    protected compareValue(value: any, value2: any): boolean {
        if (value != null && typeof (value) === "object" && typeof (<any>value).equal === "function") {
            if ((<any>value).equal(value2))
                return true;
        }
        else if (value == value2)
            return true;

        return false;
    }

    protected doTween(obj: any, key: string, oldValue: any, newValue: any) {
        if (this._tween) {
            let tweener = this._tween.findTweener(null);
            if (tweener && this.compareValue(newValue, tweener.endValue.getAt(0)))
                return;

            this._tween.kill();
            this._tween.recover();
        }

        if (this.compareValue(oldValue, newValue))
            return;

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

    protected runGear(initiator: Controller) {
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
            || !this._tweenCfg || !this._tweenCfg.enabled
            || !initiator || !initiator.changing
            || Gear.disableAllTweenEffect
            || this._owner._getBit(NodeFlags.EDITING_NODE)) {
            obj[key] = newValue;
            return;
        }

        this.doTween(obj, key, oldValue, newValue);
    }
}

export class GearNumber extends Gear { }
export class GearString extends Gear { }
export class GearBool extends Gear { }
export class GearColor extends Gear { }

export class GearStrColor extends Gear {
    protected doTween(obj: any, key: string, oldValue: string, newValue: string): void {
        super.doTween(obj, key, oldValue, newValue);
        this._tween.interp(Tween.seperateChannel);
    }
}

export class GearHexColor extends Gear {
    protected doTween(obj: any, key: string, oldValue: number, newValue: number): void {
        super.doTween(obj, key, oldValue, newValue);
        this._tween.interp(Tween.seperateChannel, 4);
    }
}