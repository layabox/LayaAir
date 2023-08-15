import { PhysicsForceMode } from "../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { ICollider } from "./ICollider";

/**
 * Interface of physics dynamic collider.
 */
export interface IDynamicCollider extends ICollider {
    /**
     * Sets the linear damping coefficient.
     * @param value - Linear damping coefficient.
     */
    setLinearDamping(value: number): void;

    /**
     * Sets the angular damping coefficient.
     * @param value - Angular damping coefficient.
     */
    setAngularDamping(value: number): void;

    /**
     * Sets the linear velocity of the actor.
     * @param value - New linear velocity of actor.
     */
    setLinearVelocity(value: Vector3): void;

    /**
     * Sets the angular velocity of the actor.
     * @param value - New angular velocity of actor.
     */
    setAngularVelocity(value: Vector3): void;

    /**
     *  Sets the mass of a dynamic actor.
     * @param value - New mass value for the actor.
     */
    setMass(value: number): void;

    /**
     * Sets the pose of the center of mass relative to the actor.
     * @param value - Mass frame offset transform relative to the actor frame.
     */
    setCenterOfMass(value: Vector3): void;

    /**
     * Sets the inertia tensor, using a parameter specified in mass space coordinates.
     * @param value - New mass space inertia tensor for the actor.
     */
    setInertiaTensor(value: Vector3): void;

    /**
     * Sets the mass-normalized kinetic energy threshold below which an actor may go to sleep.
     * @param value - Energy below which an actor may go to sleep.
     */
    setSleepThreshold(value: number): void;

    /**
     * Sets the colliders' collision detection mode.
     * @param value - rigid body flag
     */
    setCollisionDetectionMode(value: number): void;

    /**
     * Controls whether physics affects the dynamic collider.
     * @param value - is or not
     */
    setIsKinematic(value: boolean): void;

    /**
     * Raises or clears a particular rigid dynamic lock flag.
     * @param flags - the flag to raise(set) or clear.
     */
    setConstraints(linearFactor: Vector3, angularFactor: Vector3): void;

    /**
     * Apply a force to the dynamic collider.
     * @param force - The force make the collider move
     */
    addForce(force: Vector3, mode: PhysicsForceMode, localOffset: Vector3): void;

    /**
     * Apply a torque to the dynamic collider.
     * @param torque - The force make the collider rotate
     */
    addTorque(torque: Vector3, mode: PhysicsForceMode): void;

    /**
     * Forces a collider to sleep at least one frame.
     */
    sleep?(): void;

    /**
     * Forces a collider to wake up.
     */
    wakeUp(): void;

    /**
     * set world position
     * @param value 
     */
    setWorldPosition(value: Vector3): void

    /**
     * set world rotation
     * @param value 
     */
    setWorldRotation(value: Quaternion): void

    /**
     * set trigger
     * @param value 
     */
    setTrigger(value: boolean): void
}
