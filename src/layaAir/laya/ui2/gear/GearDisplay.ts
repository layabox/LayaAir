import type { GWidget } from "../GWidget";
import { Gear } from "./Gear";
import { GearTweenConfig } from "./GearTweenConfig";

export class GearDisplay extends Gear<boolean> {
    private _pages: Array<number>;
    private _flag: boolean = true;
    private _condition: number = 0;

    constructor() {
        super();

        this._pages = [];
        this._propPath = "internalVisible";
    }

    public get pages() {
        return this._pages;
    }

    public set pages(value: Array<number>) {
        this._pages = value;
        this.onChanged(true);
    }

    public get condition() {
        return this._condition;
    }

    public set condition(value: number) {
        this._condition = value;
        this.onChanged(true);
    }

    public get delay() {
        return this._tweenCfg ? this._tweenCfg.duration : 0;
    }

    public set delay(value: number) {
        if (value > 0) {
            if (!this._tweenCfg)
                this._tweenCfg = new GearTweenConfig();
            this._tweenCfg.duration = value;
        }
        else
            this._tweenCfg = null;
    }

    protected doTween(obj: any, key: string, oldValue: boolean, newValue: boolean): void {
        if (!newValue)
            super.doTween(obj, key, oldValue, newValue);
        else
            obj[key] = newValue;
    }

    protected getValue(page: number): boolean {
        this._flag = page == -1 || this._pages.length == 0 || this._pages.indexOf(page) != -1;
        return GearDisplay.check(this._owner);
    }

    public static check(owner: GWidget) {
        let r: boolean;
        for (let g of owner.gears) {
            if (g instanceof GearDisplay) {
                if (r == null)
                    r = g._flag;
                else if (g._condition == 0)
                    r = r && g._flag;
                else
                    r = r || g._flag;
            }
        }
        return r != null ? r : true;
    }
}
