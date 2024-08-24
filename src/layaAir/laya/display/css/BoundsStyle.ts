import { Rectangle } from "../../maths/Rectangle"
import { Pool } from "../../utils/Pool"

/**
 * @internal
 * @en Graphic bounds data class
 * @zh 图形边界数据类
 */
export class BoundsStyle {
    /**@private */
    bounds: Rectangle|null;
    /**
     * @en Bounds set by the user
     * @zh 用户设置的边界
     */
    userBounds: Rectangle|null;
    /**
     * @en Cached bounds vertices, used for sprite bounds calculation
     * @zh 缓存的边界顶点，用于精灵计算边界
     */
    temBM: any[]|null;

    /**
     * @en Reset the BoundsStyle
     * @returns The current BoundsStyle instance
     * @zh 重置BoundsStyle
     * @returns 当前BoundsStyle实例
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
     * @en Recycle the BoundsStyle to the object pool
     * @zh 回收BoundsStyle到对象池
     */
    recover(): void {
        Pool.recover("BoundsStyle", this.reset());
    }

    /**
     * @en Create a new BoundsStyle object pool instance
     * @zh 创建一个新的BoundsStyle对象池实例
     */
    static create(): BoundsStyle {
        return Pool.getItemByClass("BoundsStyle", BoundsStyle);
    }
}

