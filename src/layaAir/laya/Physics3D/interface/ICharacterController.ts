import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

/**
 * Base class for character controllers.
 */
export interface ICharacterController extends ICollider {

  /**
   * Moves the character using a "collide-and-slide" algorithm.
   * @param disp Displacement vector
   */
  move(disp: Vector3): void;

  /**
   * jump
   * @param velocity 
   */
  jump(velocity: Vector3): void;

  /**
   * The step height.
   * @param offset The new step offset for the controller.
   */
  setStepOffset(offset: number): void;

  /**
   * Sets the 'up' direction.
   * @param up The up direction for the controller.
   */
  setUpDirection(up: Vector3): void;

  /**
   * get VerticalVel
   */
  getVerticalVel(): number;

  /**
   * Sets the slope limit.
   * @param slopeLimit The slope limit for the controller.
   */
  setSlopeLimit(slopeLimit: number): void;

  /**
   * set fall speed
   * @param value 
   */
  setfallSpeed?(value: number): void;

  /**
   * 设置碰撞收到的push力
   * @param value 
   */
  setpushForce?(value: number): void;

  /**
   * 设置重力
   * @param value 
   */
  setGravity(value: Vector3): void;

  /**
   * 设置角色控制器位置
   * @param value 
   */
  setWorldPosition(value: Vector3): void;
}
