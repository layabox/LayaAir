import { Pool } from "../../utils/Pool";
/**
 * @internal
 * Graphic bounds数据类
 */
export class BoundsStyle {
    /**
     * 重置
     */
    reset() {
        if (this.bounds)
            this.bounds.recover();
        if (this.userBounds)
            this.userBounds.recover();
        this.bounds = null;
        this.userBounds = null;
        this.temBM = null;
        return this;
    }
    /**
     * 回收
     */
    recover() {
        Pool.recover("BoundsStyle", this.reset());
    }
    /**
     * 创建
     */
    static create() {
        return Pool.getItemByClass("BoundsStyle", BoundsStyle);
    }
}
