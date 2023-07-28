import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

export interface IStaticCollider extends ICollider {
    /**
     * Set global transform of collider.
     * @param position - The global position
     * @param rotation - The global rotation
     */
    setWorldTransform(position: Vector3, rotation: Quaternion): void;

    /**
     * Get global transform of collider.
     * @param outPosition - The global position
     * @param outRotation - The global rotation
     */
    getWorldTransform(outPosition: Vector3, outRotation: Quaternion): void;

}