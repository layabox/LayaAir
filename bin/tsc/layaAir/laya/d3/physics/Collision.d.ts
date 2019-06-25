import { ContactPoint } from "././ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent";
/**
 * <code>Collision</code> 类用于创建物理碰撞信息。
 */
export declare class Collision {
    /**@private */
    _lastUpdateFrame: number;
    /**@private */
    _updateFrame: number;
    /**@private */
    _isTrigger: boolean;
    /**@private */
    _colliderA: PhysicsComponent;
    /**@private */
    _colliderB: PhysicsComponent;
    /**@private [只读]*/
    contacts: ContactPoint[];
    /**@private [只读]*/
    other: PhysicsComponent;
    /**
     * 创建一个 <code>Collision</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    _setUpdateFrame(farme: number): void;
}
