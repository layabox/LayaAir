import { Node } from "../../../display/Node";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../ICollider";

export interface IJoint {
  /**
   * set owner
   * @param value 
   */
  setOwner(value: Node): void;

  /**
   * the Collider
   * @param owner 
   */
  setCollider(owner: ICollider): void

  /**
   * The connected collider.
   */
  setConnectedCollider(owner: ICollider): void;

  /**
   *  The scale to apply to the inverse mass of collider 0 for resolving this constraint.
   */
  setConnectedMassScale(value: number): void;

  /**
   * The scale to apply to the inverse inertia of collider0 for resolving this constraint.
   */
  setConnectedInertiaScale(value: number): void;

  /**
   * The scale to apply to the inverse mass of collider 1 for resolving this constraint.
   */
  setMassScale(value: number): void;

  /**
   * The scale to apply to the inverse inertia of collider1 for resolving this constraint.
   */
  setInertiaScale(value: number): void;

  /**
   * The maximum force the joint can apply before breaking.
   */
  setBreakForce(value: number): void;

  /**
   * The maximum torque the joint can apply before breaking.
   */
  setBreakTorque(value: number): void;

  /**
   * set Actor0 local anchor/Frame Pos
   * @param pos 
   */
  setLocalPos(pos: Vector3): void;

  /**
   * set Actor1 local anchor/Frame Pos
   * @param pos 
   */
  setConnectLocalPos(pos: Vector3): void;

  /**
   * get linear force
   */
  getlinearForce(): Vector3;

  /**
   * get angular force
   */
  getAngularForce(): Vector3;

  /**
   * is breaked
   */
  isValid(): boolean;

  isEnable(value: boolean): void;

  isCollision(value: boolean): void;
}