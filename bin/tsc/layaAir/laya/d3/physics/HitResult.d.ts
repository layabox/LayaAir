import { PhysicsComponent } from "./PhysicsComponent";
import { Vector3 } from "../math/Vector3";
/**
 * <code>HitResult</code> 类用于实现射线检测或形状扫描的结果。
 */
export declare class HitResult {
    /** 是否成功。 */
    succeeded: boolean;
    /** 发生碰撞的碰撞组件。*/
    collider: PhysicsComponent;
    /** 碰撞点。*/
    point: Vector3;
    /** 碰撞法线。*/
    normal: Vector3;
    /** 碰撞分数。 */
    hitFraction: number;
    /**
     * 创建一个 <code>HitResult</code> 实例。
     */
    constructor();
}
