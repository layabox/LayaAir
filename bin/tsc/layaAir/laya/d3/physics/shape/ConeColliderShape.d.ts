import { ColliderShape } from "././ColliderShape";
/**
 * <code>ConeColliderShape</code> 类用于创建圆柱碰撞器。
 */
export declare class ConeColliderShape extends ColliderShape {
    /**@private */
    private _orientation;
    /**@private */
    private _radius;
    /**@private */
    private _height;
    /**
     * 获取半径。
     */
    readonly radius: number;
    /**
     * 获取高度。
     */
    readonly height: number;
    /**
     * 获取方向。
     */
    readonly orientation: number;
    /**
     * 创建一个新的 <code>ConeColliderShape</code> 实例。
     * @param height 高。
     * @param radius 半径。
     */
    constructor(radius?: number, height?: number, orientation?: number);
    /**
     * @inheritDoc
     */
    clone(): any;
}
