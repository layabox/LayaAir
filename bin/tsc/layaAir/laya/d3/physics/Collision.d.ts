import { ContactPoint } from "./ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent";
/**
 * <code>Collision</code> 类用于创建物理碰撞信息。
 */
export declare class Collision {
    /**@readonly*/
    contacts: ContactPoint[];
    /**@readonly*/
    other: PhysicsComponent;
    /**
     * 创建一个 <code>Collision</code> 实例。
     */
    constructor();
}
