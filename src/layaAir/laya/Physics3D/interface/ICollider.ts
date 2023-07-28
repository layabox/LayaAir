import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { IColliderShape } from "./Shape/IColliderShape";

export interface ICollider {
    /**
     * Add collider shape on collider.
     * @param shape - The collider shape attached
     */
    addShape(shape: IColliderShape): void;

    /**
     * Remove collider shape on collider.
     * @param shape - The collider shape attached
     */
    removeShape(shape: IColliderShape): void;

    /**
     * Deletes the collider.
     */
    destroy(): void;   
}