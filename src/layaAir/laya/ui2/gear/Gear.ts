import { NodeFlags } from "../../Const";
import { IGraphicsCmd } from "../../display/IGraphics";
import { Ease } from "../../tween/Ease";
import { Tween } from "../../tween/Tween";
import { IClone } from "../../utils/IClone";
import { Controller } from "../Controller";
import { ControllerRef } from "../ControllerRef";
import type { GWidget } from "../GWidget";
import { GearTweenConfig } from "./GearTweenConfig";

/**
 * @en Base class for gears that manage property changes based on controller pages.
 * @zh 管理基于控制器页面的属性更改的齿轮基类。
 */
export class Gear {
    protected _owner: GWidget;
    protected _controller: ControllerRef;
    protected _propPath: string;
    protected _tweenCfg: GearTweenConfig;
    /** @internal */
    _tween: Tween;
    /** @internal */
    _propPathArr: string[];

    /**
     * @en The values associated with different pages.
     * @zh 与不同页面关联的值。
     */
    values: Record<number, any>;

    static disableAllTweenEffect = false;

    constructor() {
        this.values = {};
    }

    /**
     * @en The owner widget of this gear.
     * @zh 此齿轮的拥有者小部件。
     */
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

    /**
     * @en The controller associated with this gear.
     * @zh 与此齿轮关联的控制器。
     */
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

    /**
     * @en The property path controlled by this gear. Each dot in the path represents a level of hierarchy.
     * @zh 此齿轮控制的属性路径。路径中的每个点表示一个层级关系。
     */
    get propPath(): string {
        return this._propPath;
    }

    set propPath(value: string) {
        this._propPath = value;
        this._propPathArr = value ? value.split(".") : null;
        this.onChanged(null);
    }

    /**
     * @en The tween configuration for this gear.
     * @zh 此齿轮的缓动配置。
     */
    get tween(): GearTweenConfig {
        return this._tweenCfg;
    }

    set tween(value: GearTweenConfig) {
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
            this._tween = null;
        }

        if (this.compareValue(oldValue, newValue))
            return;

        let tc = this._tweenCfg;
        this._tween = Tween.create(obj, this._owner)
            .duration(tc.duration)
            .delay(tc.delay)
            .ease(Ease[tc.easeType])
            .go(key, oldValue, newValue)
            .then(() => {
                this._tween.recover();
                this._tween = null;
            });
        if ((obj as IGraphicsCmd).cmdID)
            this._tween.onUpdate(() => this._owner._graphics?.repaint());
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
            if ((obj as IGraphicsCmd).cmdID)
                this._owner._graphics?.repaint();
            return;
        }

        this.doTween(obj, key, oldValue, newValue);
    }
}

/**
 * @en Gear class for managing number properties.
 * @zh 管理数字属性的齿轮类。
 */
export class GearNumber extends Gear { }

/**
 * @en Gear class for managing string properties.
 * @zh 管理字符串属性的齿轮类。
 */
export class GearString extends Gear { }

/**
 * @en Gear class for managing boolean properties.
 * @zh 管理布尔属性的齿轮类。
 */
export class GearBool extends Gear { }

/**
 * @en Gear class for managing color properties. The data type is Color object.
 * @zh 管理颜色属性的齿轮类。数据类型是Color对象。
 */
export class GearColor extends Gear { }

/**
 * @en Gear class for managing string color properties. 
 * @zh 管理字符串颜色属性的齿轮类。
 */
export class GearStrColor extends Gear {
    protected doTween(obj: any, key: string, oldValue: string, newValue: string): void {
        super.doTween(obj, key, oldValue, newValue);
        this._tween && this._tween.interp(Tween.seperateChannel);
    }
}

/**
 * @en Gear class for managing hexadecimal color properties. The data type is number.
 * @zh 管理十六进制颜色属性的齿轮类。数据类型是数字。
 */
export class GearHexColor extends Gear {
    protected doTween(obj: any, key: string, oldValue: number, newValue: number): void {
        super.doTween(obj, key, oldValue, newValue);
        this._tween && this._tween.interp(Tween.seperateChannel, 4);
    }
}