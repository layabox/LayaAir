import { Rectangle } from "../../maths/Rectangle";
/**
 * @private
 * Graphic bounds数据类
 */
export declare class BoundsStyle {
    /**@private */
    bounds: Rectangle;
    /**用户设的bounds*/
    userBounds: Rectangle;
    /**缓存的bounds顶点,sprite计算bounds用*/
    temBM: any[];
    /**
     * 重置
     */
    reset(): BoundsStyle;
    /**
     * 回收
     */
    recover(): void;
    /**
     * 创建
     */
    static create(): BoundsStyle;
}
