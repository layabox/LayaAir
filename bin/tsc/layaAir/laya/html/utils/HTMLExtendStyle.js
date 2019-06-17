import { Pool } from "../../utils/Pool";
/**
 * @private
 */
export class HTMLExtendStyle {
    constructor() {
        this.reset();
    }
    reset() {
        this.stroke = 0;
        this.strokeColor = "#000000";
        this.leading = 0;
        this.lineHeight = 0;
        this.letterSpacing = 0;
        this.href = null;
        return this;
    }
    recover() {
        if (this == HTMLExtendStyle.EMPTY)
            return;
        Pool.recover("HTMLExtendStyle", this.reset());
    }
    /**
     * 从对象池中创建
     */
    //TODO:coverage
    static create() {
        return Pool.getItemByClass("HTMLExtendStyle", HTMLExtendStyle);
    }
}
HTMLExtendStyle.EMPTY = new HTMLExtendStyle();
