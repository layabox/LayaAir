import { Vector3 } from "../../../maths/Vector3";

export interface IColliderShape {
  /**
   * Set local position.
   * @param position - The local position
   */
  setOffset(position: Vector3): void;

  /**
   * Decrements the reference count of a shape and releases it if the new reference count is zero.
   */
  destroy(): void;
}