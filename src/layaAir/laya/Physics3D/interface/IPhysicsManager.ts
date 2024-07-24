import { Ray } from "../../d3/math/Ray";
import { HitResult } from "../../d3/physics/HitResult";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";
import { IColliderShape } from "./Shape/IColliderShape";

export interface IPhysicsManager {
  /**
  * Set gravity.
  * @param gravity - Physics gravity
  */
  setGravity(gravity: Vector3): void;

  /**
   * Add ICollider into the manager.
   * @param collider - StaticCollider or DynamicCollider.
   */
  addCollider(collider: ICollider): void;

  /**
   * 是否启用
   * @param value 
   */
  setActiveCollider(collider: ICollider, value: boolean): void;

  /**
   * Remove ICollider.
   * @param collider - StaticCollider or DynamicCollider.
   */
  removeCollider(collider: ICollider): void;

  /**
   * Call on every frame to update pose of objects.
   * @param elapsedTime - Step time of update.
   */
  update(elapsedTime: number): void;

  /**
   * ray cast first one collision
   * @param ray 
   * @param outHitResult 
   * @param distance 
   * @param collisonGroup 
   * @param collisionMask 
   */
  rayCast?(ray: Ray, outHitResult: HitResult, distance?: number, collisonGroup?: number, collisionMask?: number): boolean;

  /**
   * ray cast all collision
   * @param ray 
   * @param out 
   * @param distance 
   * @param collisonGroup 
   * @param collisionMask 
   */
  rayCastAll?(ray: Ray, out: HitResult[], distance?: number, collisonGroup?: number, collisionMask?: number): boolean;

  /**
   * debugger
   * @param value 
   */
  enableDebugDrawer?(value: boolean): void;

  /**
   * destroy
   */
  destroy(): void;

  /**
   * ray cast by shape
   * @param shape 
   * @param fromPosition 
   * @param toPosition 
   * @param out 
   * @param fromRotation 
   * @param toRotation 
   * @param collisonGroup 
   * @param collisionMask 
   * @param allowedCcdPenetration 
   */
  shapeCast(shape: IColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult, fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;

  /**
   * ray cast all by shape
   * @param shape 
   * @param fromPosition 
   * @param toPosition 
   * @param out 
   * @param fromRotation 
   * @param toRotation 
   * @param collisonGroup 
   * @param collisionMask 
   * @param allowedCcdPenetration 
   */
  shapeCastAll(shape: IColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation?: Quaternion, toRotation?: Quaternion, collisonGroup?: number, collisionMask?: number, allowedCcdPenetration?: number): boolean;

}