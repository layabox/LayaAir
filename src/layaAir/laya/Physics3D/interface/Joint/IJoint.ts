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
   * The connected collider.
   */
  setConnectedCollider(owner: ICollider, other: ICollider): void;

  /**
   * The connected anchor position.
   * @remarks If connectedCollider is set, this anchor is relative offset, or the anchor is world position.
   */
  setConnectedAnchor(ownerValue: Vector3, otherValue: Vector3): void;

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
}