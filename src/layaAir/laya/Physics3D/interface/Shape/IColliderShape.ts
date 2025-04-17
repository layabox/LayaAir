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
   * @en Gets the local offset of the shape.
   * @returns The local offset of the shape.
   * @zh 获取形状的局部偏移。
   * @returns 局部偏移量。
   */
  getOffset(): Vector3;

  /**
   * @en Decrements the reference count of a shape and releases it if the new reference count is zero.
   * @zh 减少形状的引用计数，如果新的引用计数为零则释放它。
   */
  destroy(): void;

  /**
   * @en Gets the physics shape.
   * @returns The physics shape.
   * @zh 获取物理形状。
   * @returns 物理形状。
   */
  getPhysicsShape(): any;
}