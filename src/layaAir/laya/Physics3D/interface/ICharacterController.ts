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
  jump?(velocity: Vector3): void;

  /**
   * set position of characterController
   * @param v 
   */
  setPosition(value: Vector3): void;

  /**
   * get current position of characterController
   */
  getPosition?(): Vector3;

  /**
   * The step height.
   * @param offset The new step offset for the controller.
   */
  setStepOffset?(offset: number): void;

  /**
   * set skin offset
   * @param width 
   */
  setSkinWidth?(width: number): void;

  /**
   * Sets the 'up' direction.
   * @param up The up direction for the controller.
   */
  setUpDirection?(up: Vector3): void;

  /**
   * get VerticalVel
   */
  getVerticalVel?(): number;

  /**
   * Sets the slope limit.
   * @param slopeLimit The slope limit for the controller.
   */
  setSlopeLimit?(slopeLimit: number): void;

  /**
   * 设置重力
   * @param value 
   */
  setGravity?(value: Vector3): void;

  /**
   * 设置角色的半径
   * @param value 
   */
  setRadius?(value: number): void;

  /**
   * 设置角色的高度
   * @param value 
   */
  setHeight?(value: number): void;

  setminDistance(value: number): void;

  setShapelocalOffset(value: Vector3): void;

  /**
   * 设置推开的力
   */
  setPushForce?(value: number): void;

  /**
   * 设置起跳速度
   * @param value 
   */
  setJumpSpeed?(value: number): void;
}
