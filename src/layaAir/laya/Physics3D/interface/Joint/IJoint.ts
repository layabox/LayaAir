import { Node } from "../../../display/Node";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../ICollider";
/**
 * @en Interface for a joint in a physics system. 
 * @zh 物理系统中关节的接口。
 */
export interface IJoint {
  /**
   * @en Sets the owner node of the joint.
   * @param value The node to set as the owner.
   * @zh 设置关节的所有者节点。
   * @param value 要设置为所有者的节点。
   */
  setOwner(value: Node): void;

  /**
   * @en Sets the collider for this joint.
   * @param owner The collider to set.
   * @zh 设置此关节的碰撞体。
   * @param owner 要设置的碰撞体。
   */
  setCollider(owner: ICollider): void

  /**
   * @en Sets the connected collider for this joint.
   * @param owner The collider to connect to.
   * @zh 设置此关节连接的碰撞体。
   * @param owner 要连接的碰撞体。
   */
  setConnectedCollider(owner: ICollider): void;

  /**
   * @en The scale to apply to the inverse mass of collider 0 for resolving this constraint.
   * @param value The scale value to set.
   * @zh 设置应用于连接碰撞体逆质量的缩放比例，用于解析此约束。
   * @param value 要设置的缩放值。
   */
  setConnectedMassScale(value: number): void;

  /**
   * @en The scale to apply to the inverse inertia of collider0 for resolving this constraint.
   * @param value The scale value to set.
   * @zh 设置应用于连接碰撞体逆惯性的缩放比例，用于解析此约束。
   * @param value 要设置的缩放值。
   */
  setConnectedInertiaScale(value: number): void;

  /**
   * @en The scale to apply to the inverse mass of collider 1 for resolving this constraint.
   * @param value The scale value to set.
   * @zh 设置应用于主碰撞体逆质量的缩放比例，用于解析此约束。
   * @param value 要设置的缩放值。
   */
  setMassScale(value: number): void;

  /**
   * @en The scale to apply to the inverse inertia of collider1 for resolving this constraint.
   * @param value The scale value to set.
   * @zh 设置应用于主碰撞体逆惯性的缩放比例，用于解析此约束。
   * @param value 要设置的缩放值。
   */
  setInertiaScale(value: number): void;

  /**
   * @en The maximum force the joint can apply before breaking.
   * @param value The maximum force value.
   * @zh 设置关节在断裂前可施加的最大力。
   * @param value 最大力值。
   */
  setBreakForce(value: number): void;

  /**
   * @en The maximum torque the joint can apply before breaking.
   * @param value The maximum torque value.
   * @zh 设置关节在断裂前可施加的最大扭矩。
   * @param value 最大扭矩值。
   */
  setBreakTorque(value: number): void;

  /**
   * @en Sets the local anchor/frame position for the main actor.
   * @param pos The local position to set.
   * @zh 设置主执行体的本地锚点/框架位置。
   * @param pos 要设置的本地位置。
   */
  setLocalPos(pos: Vector3): void;

  /**
   * @en Sets the local anchor/frame position for the connected actor.
   * @param pos The local position to set.
   * @zh 设置连接执行体的本地锚点/框架位置。
   * @param pos 要设置的本地位置。
   */
  setConnectLocalPos(pos: Vector3): void;

  /**
   * @en Gets the linear force applied by the joint.
   * @zh 获取关节施加的线性力。
   */
  getlinearForce(): Vector3;

  /**
   * @en Gets the angular force applied by the joint.
   * @zh 获取关节施加的角力。
   */
  getAngularForce(): Vector3;

  /**
   * @en Checks if the joint is still valid (not broken).
   * @zh 检查关节是否仍然有效（未断裂）。
   */
  isValid(): boolean;

  /**
   * @en Enables or disables the joint.
   * @param value True to enable, false to disable.
   * @zh 启用或禁用关节。
   * @param value 为true时启用，为false时禁用。
   */
  isEnable(value: boolean): void;

  /**
   * @en Sets whether collision is enabled between the connected bodies.
   * @param value True to enable collision, false to disable.
   * @zh 设置是否启用连接体之间的碰撞。
   * @param value 为true时启用碰撞，为false时禁用。
   */
  isCollision(value: boolean): void;

  /**
   * @en Destroy the joint.
   * @zh 销毁关节。
   */
  destroy(): void;
}