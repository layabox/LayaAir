import { ColliderShape } from "././ColliderShape";
/**
 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export declare class BoxColliderShape extends ColliderShape {
    /** @private */
    private static _nativeSize;
    /**
    * @private
    */
    static __init__(): void;
    /**@private */
    private _sizeX;
    /**@private */
    private _sizeY;
    /**@private */
    private _sizeZ;
    /**
     * 获取X轴尺寸。
     */
    readonly sizeX: number;
    /**
     * 获取Y轴尺寸。
     */
    readonly sizeY: number;
    /**
     * 获取Z轴尺寸。
     */
    readonly sizeZ: number;
    /**
     * 创建一个新的 <code>BoxColliderShape</code> 实例。
     * @param sizeX 盒子X轴尺寸。
     * @param sizeY 盒子Y轴尺寸。
     * @param sizeZ 盒子Z轴尺寸。
     */
    constructor(sizeX?: number, sizeY?: number, sizeZ?: number);
    /**
     * @inheritDoc
     */
    clone(): any;
}
