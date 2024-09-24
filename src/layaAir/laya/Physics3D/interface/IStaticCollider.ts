import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

/**
 * @en Interface for static physics collider.
 * @zh 静态物理碰撞器的接口。
 */
export interface IStaticCollider extends ICollider {
    /**
     * @en Sets whether the collider is a trigger.
     * @param value Whether the collider is a trigger.
     * @zh 设置碰撞器是否为触发器。
     * @param value 碰撞器是否为触发器。
     */      
    setTrigger(value:boolean):void;

}