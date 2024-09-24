import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

/**
 * @en Interface for character controllers.
 * @zh 角色控制器的接口。
 */
export interface ICharacterController extends ICollider {

  /**
   * @en Moves the character using a "collide-and-slide" algorithm.
   * @param disp Displacement vector
   * @zh 使用"碰撞并滑动"算法移动角色。
   * @param disp 位移向量
   */
  move(disp: Vector3): void;

  /**
   * @en Make the character jump.
   * @param velocity Jump velocity
   * @zh 使角色跳跃。
   * @param velocity 跳跃速度
   */
  jump?(velocity: Vector3): void;

  /**
   * @en Set position of CharacterController.
   * @param value New position
   * @zh 设置角色控制器的位置。
   * @param value 位置
   */
  setPosition(value: Vector3): void;

  /**
   * @en Get current position of characterController.
   * @returns Current position
   * @zh 获取角色控制器的当前位置。
   * @returns 当前位置
   */
  getPosition?(): Vector3;

  /**
   * @en Set the step height for the characterController.
   * @param offset The new step offset
   * @zh 设置角色控制器的步高。
   * @param offset 步高偏移量
   */
  setStepOffset?(offset: number): void;

  /**
   * @en Set skin width for the characterController.
   * @param width The new skin width
   * @zh 设置角色控制器的皮肤宽度。
   * @param width 皮肤宽度
   */
  setSkinWidth?(width: number): void;

  /**
   * @en Set the 'up' direction for the characterController.
   * @param up The up direction
   * @zh 设置角色控制器的"向上"方向。
   * @param up 向上方向
   */
  setUpDirection?(up: Vector3): void;

  /**
   * @en Get the vertical velocity of the characterController.
   * @returns Vertical velocity
   * @zh 获取角色控制器的垂直速度。
   * @returns 垂直速度
   */
  getVerticalVel?(): number;

  /**
   * @en Set the slope limit for the characterController.
   * @param slopeLimit The new slope limit
   * @zh 设置角色控制器的斜坡限制。
   * @param slopeLimit 斜坡限制
   */
  setSlopeLimit?(slopeLimit: number): void;

  /**
   * @en Set the gravity for the characterController.
   * @param value Gravity vector
   * @zh 设置角色控制器的重力。
   * @param value 重力
   */
  setGravity?(value: Vector3): void;

  /**
   * @en Set the radius of the characterController.
   * @param value The new radius
   * @zh 设置角色的半径。
   * @param value 半径
   */
  setRadius?(value: number): void;

  /**
   * @en Set the height of the characterController.
   * @param value The height
   * @zh 设置角色的高度。
   * @param value 高度
   */
  setHeight?(value: number): void;

  /**
   * @en Set the minimum distance for the characterController.
   * @param value The minimum distance
   * @zh 设置角色控制器的最小距离。
   * @param value 最小距离
   */
  setminDistance(value: number): void;

  /**
   * @en Set the local offset of the characterController's shape.
   * @param value The local offset
   * @zh 设置角色控制器形状的局部偏移。
   * @param value 局部偏移
   */
  setShapelocalOffset(value: Vector3): void;

  /**
   * @en Set the push force for the characterController.
   * @param value The push force
   * @zh 设置角色控制器的推力。
   * @param value 推力
   */
  setPushForce?(value: number): void;

  /**
   * @en Set the jump speed for the characterController.
   * @param value The jump speed
   * @zh 设置角色控制器的跳跃速度。
   * @param value 跳跃速度
   */
  setJumpSpeed?(value: number): void;
}
