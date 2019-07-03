import { IClone } from "../../core/IClone";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
 */
export declare class ColliderShape implements IClone {
    needsCustomCollisionCallback: boolean;
    /**
     * 获取碰撞类型。
     * @return 碰撞类型。
     */
    readonly type: number;
    /**
     * 获取Shape的本地偏移。
     * @return Shape的本地偏移。
     */
    /**
    * 设置Shape的本地偏移。
    * @param Shape的本地偏移。
    */
    localOffset: Vector3;
    /**
     * 获取Shape的本地旋转。
     * @return Shape的本地旋转。
     */
    /**
    * 设置Shape的本地旋转。
    * @param Shape的本地旋转。
    */
    localRotation: Quaternion;
    /**
     * 创建一个新的 <code>ColliderShape</code> 实例。
     */
    constructor();
    /**
     * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
     */
    updateLocalTransformations(): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
