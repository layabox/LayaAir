import { Ray } from "../../d3/math/Ray";
import { HitResult } from "../../d3/physics/HitResult";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

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
  rayCastAll?(ray: Ray, out: HitResult[], distance: number, collisonGroup?: number, collisionMask?: number): boolean;

  /**
   * debugger
   * @param value 
   */
  enableDebugDrawer?(value: boolean): void;

  /**
   * Query
   * @param pos 
   * @param radius 
   * @param result 
   * @param collisionmask 
   */
  sphereQuery?(pos: Vector3, radius: number, result: ICollider[], collisionmask: number): void;

  /**
   * destroy
   */
  destroy(): void;

  //shapeCast(shape: IColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult, fromRotation: Quaternion = null, toRotation: Quaternion = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration: number = 0.0): boolean

  //shapeCastAll(shape: ColliderShape, fromPosition: Vector3, toPosition: Vector3, out: HitResult[], fromRotation: Quaternion = null, toRotation: Quaternion = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration: number = 0.0): boolean 

}