import { Vector3 } from "../../math/Vector3";
import { ColliderShape } from "././ColliderShape";
/**
 * <code>CapsuleColliderShape</code> 类用于创建胶囊形状碰撞器。
 */
export declare class CapsuleColliderShape extends ColliderShape {
    /** @private */
    static _tempVector30: Vector3;
    /**@private */
    private _radius;
    /**@private */
    private _length;
    /**@private */
    private _orientation;
    /**
     * 获取半径。
     */
    readonly radius: number;
    /**
     * 获取长度。
     */
    readonly length: number;
    /**
     * 获取方向。
     */
    readonly orientation: number;
    /**
     * 创建一个新的 <code>CapsuleColliderShape</code> 实例。
     * @param 半径。
     * @param 高(包含半径)。
     * @param orientation 胶囊体方向。
     */
    constructor(radius?: number, length?: number, orientation?: number);
    /**
     * @inheritDoc
     */
    _setScale(value: Vector3): void;
    /**
     * @inheritDoc
     */
    clone(): any;
}
