import { Rectangle } from "../../maths/Rectangle"
import { Pool } from "../../utils/Pool"

/**
 * @internal
 * Graphic bounds数据类
 */
export class BoundsStyle {
    /**@private */
    bounds: Rectangle|null;
    /**用户设的bounds*/
    userBounds: Rectangle|null;
    /**缓存的bounds顶点,sprite计算bounds用*/
    temBM: any[]|null;

    /**
     * 重置
     */
    reset(): BoundsStyle {
        if (this.bounds) this.bounds.recover();
        if (this.userBounds) this.userBounds.recover();
        this.bounds = null;
        this.userBounds = null;
        this.temBM = null;
        return this;
    }

    /**
     * 回收
     */
    recover(): void {
        Pool.recover("BoundsStyle", this.reset());
    }

    /**
     * 创建
     */
    static create(): BoundsStyle {
        return Pool.getItemByClass("BoundsStyle", BoundsStyle);
    }
}

