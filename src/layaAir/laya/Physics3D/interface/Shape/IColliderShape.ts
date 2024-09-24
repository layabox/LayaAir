import { Vector3 } from "../../../maths/Vector3";

/**
 * @en Interface for collider shape.
 * @zh 碰撞器形状的接口。
 */
export interface IColliderShape {
  /**
   * @en Set local position of the collider shape.
   * @param position The local position to set
   * @zh 设置碰撞器形状的局部位置。
   * @param position 要设置的局部位置
   */
  setOffset(position: Vector3): void;

  /**
   * @en Decrements the reference count of a shape and releases it if the new reference count is zero.
   * @zh 减少形状的引用计数，如果新的引用计数为零则释放它。
   */
  destroy(): void;
}