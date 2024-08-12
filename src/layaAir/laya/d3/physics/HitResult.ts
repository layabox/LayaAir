import { ICollider } from "../../Physics3D/interface/ICollider";
import { Vector3 } from "../../maths/Vector3";

/**
 * @en The HitResult class is used to store the result of raycasting or shape scanning.
 * @zh HitResult 类用于实现射线检测或形状扫描的结果。
 */
export class HitResult {
    /** 
     * @en Whether the raycast or shape scan is successful.
     * @zh 射线检测或形状扫描是否成功。 
     */
    succeeded: boolean = false;
    /** 
     * @en The collider that was hit.
     * @zh 发生碰撞的碰撞组件。
     */
    collider: ICollider = null;
    /** 
     * @en The Collision point.
     * @zh 碰撞点。
     */
    point: Vector3 = new Vector3();
    /** 
     * @en Collision normals.
     * @zh 碰撞法线。
     */
    normal: Vector3 = new Vector3();
    /** 
     * @en Hit Fraction
     * @zh 碰撞分数。 
     */
    hitFraction: number = 0;

    /**@internal */
    _inPool: boolean = false;
    /** @ignore */
    constructor() {
    }
}


