import { Vector3 } from "../math/Vector3";
import { PhysicsComponent } from "../physics/PhysicsComponent";
/**
 * <code>Physics</code> 类用于简单物理检测。
 */
export declare class Physics3DUtils {
    static COLLISIONFILTERGROUP_DEFAULTFILTER: number;
    static COLLISIONFILTERGROUP_STATICFILTER: number;
    static COLLISIONFILTERGROUP_KINEMATICFILTER: number;
    static COLLISIONFILTERGROUP_DEBRISFILTER: number;
    static COLLISIONFILTERGROUP_SENSORTRIGGER: number;
    static COLLISIONFILTERGROUP_CHARACTERFILTER: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER1: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER2: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER3: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER4: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER5: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER6: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER7: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER8: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER9: number;
    static COLLISIONFILTERGROUP_CUSTOMFILTER10: number;
    static COLLISIONFILTERGROUP_ALLFILTER: number;
    /**重力值。*/
    static gravity: Vector3;
    /**
     * 创建一个 <code>Physics</code> 实例。
     */
    constructor();
    /**
     * 是否忽略两个碰撞器的碰撞检测。
     * @param	collider1 碰撞器一。
     * @param	collider2 碰撞器二。
     * @param	ignore 是否忽略。
     */
    static setColliderCollision(collider1: PhysicsComponent, collider2: PhysicsComponent, collsion: boolean): void;
    /**
     * 获取是否忽略两个碰撞器的碰撞检测。
     * @param	collider1 碰撞器一。
     * @param	collider2 碰撞器二。
     * @return	是否忽略。
     */
    static getIColliderCollision(collider1: PhysicsComponent, collider2: PhysicsComponent): boolean;
}
