import { Rectangle } from "../../maths/Rectangle"

import { Pool } from "../../utils/Pool"
import { ClassUtils } from "../../utils/ClassUtils";
/**
 * @private
 */
export class HTMLHitRect {

    rec: Rectangle;
    href: string;

    //TODO:coverage
    constructor() {
        this.rec = new Rectangle();
        this.reset();
    }

    reset(): HTMLHitRect {
        this.rec.reset();
        this.href = null;
        return this;
    }

    recover(): void {
        Pool.recover("HTMLHitRect", this.reset());
    }

    static create(): HTMLHitRect {
        return Pool.getItemByClass("HTMLHitRect", HTMLHitRect);
    }
}

ClassUtils.regClass("laya.html.dom.HTMLHitRect", HTMLHitRect);
ClassUtils.regClass("Laya.HTMLHitRect", HTMLHitRect);