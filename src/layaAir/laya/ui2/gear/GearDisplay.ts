import { Tween } from "../../tween/Tween";
import { Controller } from "../Controller";
import type { GWidget } from "../GWidget";
import { Gear } from "./Gear";

export class GearDisplay extends Gear {
    private _pages: Array<number>;
    private _flag: boolean = true;
    private _condition: number = 0;

    constructor() {
        super();

        this._pages = [];
        this.propPath = "internalVisible";
    }

    /**
     * @en Sets an array of page indices where the object is visible. If the array is empty, the object is visible on all pages.
     * @zh 设定一个页面索引数组，对象只在这些页面中可见。如果数组为空，则表示在所有页面中都可见。
     */
    get pages() {
        return this._pages;
    }

    set pages(value: Array<number>) {
        this._pages = value;
        this.onChanged(null);
    }

    /**
     * @en The interaction of this gear with other GearDisplays of the object. 0 means AND condition, 1 means OR condition.
     * @zh 本齿轮与物体的其他GearDisplay的相互作用。0表示与条件，1表示或条件。
     */
    get condition() {
        return this._condition;
    }

    set condition(value: number) {
        this._condition = value;
        this.onChanged(null);
    }

    protected runGear(initiator: Controller): void {
        if (this._tween) {
            this._tween.kill();
            this._tween.recover();
            this._tween = null;
        }

        let page = this._controller.selectedIndex;
        this._flag = page == -1 || this._pages.length == 0 || this._pages.indexOf(page) != -1;
        if (initiator == null || !initiator.changing || this._owner.gears.length === 1)
            GearDisplay.check(this._owner, null, false);
        else
            pendings.add(this._owner);
    }

    static check(owner: GWidget, cc?: Controller, allowDelay?: boolean) {
        let r: boolean;
        let delay: number = 0;
        let gd: GearDisplay;
        for (let g of owner.gears) {
            if (g instanceof GearDisplay) {
                if (r == null)
                    r = g._flag;
                else if (g._condition == 0)
                    r = r && g._flag;
                else
                    r = r || g._flag;
                gd = g;
            }
            else if (allowDelay && g._tween != null && g.controller?.inst == cc) {
                delay = Math.max(delay, g._tween.findTweener(null)?.remainTime);
            }
        }
        r = r ?? true;
        if (delay !== 0 && !r && owner.internalVisible != r) {
            gd._tween = Tween.create(owner).duration(delay).then(() => {
                owner.internalVisible = false;
                gd._tween.recover();
                gd._tween = null;
            });
        }
        else
            owner.internalVisible = r;
    }

    static checkAll(cc: Controller) {
        if (pendings.size == 0)
            return;

        for (let obj of pendings) {
            GearDisplay.check(obj, cc, true);
        }
        pendings.clear();
    }
}

const pendings: Set<GWidget> = new Set();
