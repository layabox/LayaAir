import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "./IColliderShape";

export interface IBoxColliderShape extends IColliderShape {
    /**
      * Set size of Box Shape.
      * @param size - The size
      */
    setSize(size: Vector3): void;
}