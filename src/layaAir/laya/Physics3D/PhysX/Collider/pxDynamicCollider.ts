import { PhysicsForceMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IDynamicCollider } from "../../interface/IDynamicCollider";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider, pxColliderType } from "./pxCollider";

/**
 * The collision detection mode constants.
 */
export enum CollisionDetectionMode {
    /** Continuous collision detection is off for this dynamic collider. */
    Discrete,
    /** Continuous collision detection is on for colliding with static mesh geometry. */
    Continuous,
    /** Continuous collision detection is on for colliding with static and dynamic geometry. */
    ContinuousDynamic,
    /** Speculative continuous collision detection is on for static and dynamic geometries */
    ContinuousSpeculative
}


/**
 * Use these flags to constrain motion of dynamic collider.
 */
export enum DynamicColliderConstraints {
    /** Not Freeze. */
    None = 0,
    /** Freeze motion along the X-axis. */
    FreezePositionX = 1,
    /** Freeze motion along the Y-axis. */
    FreezePositionY = 2,
    /** Freeze motion along the Z-axis. */
    FreezePositionZ = 4,
    /** Freeze rotation along the X-axis. */
    FreezeRotationX = 8,
    /** Freeze rotation along the Y-axis. */
    FreezeRotationY = 16,
    /** Freeze rotation along the Z-axis. */
    FreezeRotationZ = 32
}



export class pxDynamicCollider extends pxCollider implements IDynamicCollider {

    private static _tempTranslation = new Vector3();

    private static _tempRotation = new Quaternion();

    constructor(manager: pxPhysicsManager) {
        super(manager);
        this._enableProcessCollisions = true;
        this._type = pxColliderType.RigidbodyCollider;
    }


    protected _initCollider() {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(this._transformTo(new Vector3(), new Quaternion()));
        this.setWorldTransform(true);
    }

    protected _initColliderShapeByCollider() {
        super._initColliderShapeByCollider();
        this.setTrigger(this._isTrigger);
    }

    setWorldPosition(value: Vector3): void {
        const transform = this._pxActor.getGlobalPose();
        pxDynamicCollider._tempRotation.setValue(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
        this._pxActor.setGlobalPose(this._transformTo(value, pxDynamicCollider._tempRotation), true);
    }

    setWorldRotation(value: Quaternion): void {
        const transform = this._pxActor.getGlobalPose();
        pxDynamicCollider._tempTranslation.setValue(transform.translation.x, transform.translation.y, transform.translation.z);
        this._pxActor.setGlobalPose(this._transformTo(pxDynamicCollider._tempTranslation, value), true);
    }

    getWorldTransform() {
        const transform = this._pxActor.getGlobalPose();
        pxDynamicCollider._tempTranslation.set(transform.translation.x, transform.translation.y, transform.translation.z);
        pxDynamicCollider._tempRotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
        this.owner.transform.position = pxDynamicCollider._tempTranslation;
        this.owner.transform.rotation = pxDynamicCollider._tempRotation;
    }

    setTrigger(value: boolean): void {
        this._isTrigger = value;
        this._shape && this._shape.setIsTrigger(value);
    }

    setLinearDamping(value: number): void {
        this._pxActor.setLinearDamping(value);
    }

    setAngularDamping(value: number): void {
        this._pxActor.setAngularDamping(value);
    }

    setLinearVelocity(value: Vector3): void {
        this._pxActor.setLinearVelocity(value, true);
    }

    setAngularVelocity(value: Vector3): void {
        this._pxActor.setAngularVelocity(value, true);
    }

    setMass(value: number): void {
        this._pxActor.setMass(value);
    }

    setCenterOfMass(value: Vector3): void {
        this._pxActor.setCMassLocalPose(value);
    }

    setInertiaTensor(value: Vector3): void {
        this._pxActor.setMassSpaceInertiaTensor(value);
    }

    setSleepThreshold(value: number): void {
        this._pxActor.setSleepThreshold(value);
    }

    setCollisionDetectionMode(value: number): void {
        switch (value) {
            case CollisionDetectionMode.Continuous:
                this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eENABLE_CCD, true);
                break;
            case CollisionDetectionMode.ContinuousDynamic:
                this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eENABLE_CCD_FRICTION, true);
                break;
            case CollisionDetectionMode.ContinuousSpeculative:
                this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eENABLE_SPECULATIVE_CCD, true);
                break;
            case CollisionDetectionMode.Discrete:
                const physX = pxPhysicsCreateUtil._physX;
                this._pxActor.setRigidBodyFlag(physX.PxRigidBodyFlag.eENABLE_CCD, false);
                this._pxActor.setRigidBodyFlag(physX.PxRigidBodyFlag.eENABLE_CCD_FRICTION, false);
                this._pxActor.setRigidBodyFlag(physX.PxRigidBodyFlag.eENABLE_SPECULATIVE_CCD, false);
                break;
        }
    }

    setSolverIterations(value: number): void {
        this._pxActor.setSolverIterationCounts(value, 1);
    }

    setIsKinematic(value: boolean): void {
        if (value) {
            this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, true);
        } else {
            this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, false);
        }
    }

    setConstraints(linearFactor: Vector3, angularFactor: Vector3): void {
        let constrainFlag: number = DynamicColliderConstraints.None;
        linearFactor.x > 0 && (constrainFlag |= DynamicColliderConstraints.FreezePositionX);
        linearFactor.y > 0 && (constrainFlag |= DynamicColliderConstraints.FreezePositionY);
        linearFactor.z > 0 && (constrainFlag |= DynamicColliderConstraints.FreezePositionZ);
        angularFactor.x > 0 && (constrainFlag |= DynamicColliderConstraints.FreezeRotationX);
        angularFactor.y > 0 && (constrainFlag |= DynamicColliderConstraints.FreezeRotationY);
        angularFactor.z > 0 && (constrainFlag |= DynamicColliderConstraints.FreezeRotationZ);
        this._pxActor.setRigidDynamicLockFlags(constrainFlag);
    }


    addForce(force: Vector3, mode: PhysicsForceMode, localOffset: Vector3): void {
        //TODO
        this._pxActor.addForce({ x: force.x, y: force.y, z: force.z });
    }

    addTorque(torque: Vector3, mode: PhysicsForceMode): void {
        //TODO
        this._pxActor.addTorque({ x: torque.x, y: torque.y, z: torque.z });
    }



    sleep(): void {
        return this._pxActor.putToSleep();
    }
    wakeUp(): void {
        return this._pxActor.wakeUp();
    }


    /**
 * {@inheritDoc IDynamicCollider.move }
 */
    move(positionOrRotation: Vector3 | Quaternion, rotation?: Quaternion): void {
        //TODO
        // if (rotation) {
        //   this._pxActor.setKinematicTarget(positionOrRotation, rotation);
        //   return;
        // }

        // const tempTranslation = PhysXDynamicCollider._tempTranslation;
        // const tempRotation = PhysXDynamicCollider._tempRotation;
        // this.getWorldTransform(tempTranslation, tempRotation);
        // if (positionOrRotation instanceof Vector3) {
        //   this._pxActor.setKinematicTarget(positionOrRotation, tempRotation);
        // } else {
        //   this._pxActor.setKinematicTarget(tempTranslation, positionOrRotation);
        // }
    }


}