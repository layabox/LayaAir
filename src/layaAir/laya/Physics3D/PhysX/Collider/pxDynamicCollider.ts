import { PhysicsForceMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IDynamicCollider } from "../../interface/IDynamicCollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
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

    /**@internal */
    static _dynamicCapableMap: Map<any, any>;

    static getStaticColliderCapable(value: EColliderCapable): boolean {
        return pxDynamicCollider._dynamicCapableMap.get(value);
    }

    static initCapable(): void {
        this._dynamicCapableMap = new Map();
        this._dynamicCapableMap.set(EColliderCapable.Collider_AllowTrigger, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_CollisionGroup, false);
        this._dynamicCapableMap.set(EColliderCapable.Collider_Restitution, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_DynamicFriction, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_StaticFriction, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_BounceCombine, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_FrictionCombine, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AllowSleep, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_LinearDamp, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AngularDamp, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_LinearVelocity, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AngularVelocity, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_Mass, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_InertiaTensor, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_MassCenter, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_SolverIterations, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AllowDetectionMode, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AllowKinematic, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_LinearFactor, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AngularFactor, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_ApplyForce, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_ApplyTorque, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_WorldPosition, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_WorldOrientation, true);
    }

    private static _tempTranslation = new Vector3();

    private static _tempRotation = new Quaternion();

    IsKinematic: boolean = false;

    constructor(manager: pxPhysicsManager) {
        super(manager);
        this._enableProcessCollisions = true;
        this._type = pxColliderType.RigidbodyCollider;
    }

    getCapable(value: number): boolean {
        return pxDynamicCollider.getStaticColliderCapable(value);
    }

    protected _initCollider() {
        this._pxActor = pxPhysicsCreateUtil._pxPhysics.createRigidDynamic(this._transformTo(new Vector3(), new Quaternion()));
        
    }

    protected _initColliderShapeByCollider() {
        super._initColliderShapeByCollider();
        this.setWorldTransform(true);
        this.setTrigger(this._isTrigger);
        this.setCenterOfMass(new Vector3());
        this.setInertiaTensor(new Vector3(1, 1, 1));
        this.setSolverIterations(4);
        this.setIsKinematic(false);
        this.setCollisionDetectionMode(CollisionDetectionMode.Discrete);
        this.setSleepThreshold(5e-3);
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
        this._pxActor.setMassAndUpdateInertia(value);
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
        this.IsKinematic = value;
        if (value) {
            this._enableProcessCollisions = false;
            if (this._isSimulate)
                this._physicsManager._dynamicUpdateList.remove(this);
            this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, true);
        } else {
            this._enableProcessCollisions = true;
            if (this._isSimulate && this.inPhysicUpdateListIndex == -1)
                this._physicsManager._dynamicUpdateList.add(this);
            this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, false);
        }
    }

    setConstraints(linearFactor: Vector3, angularFactor: Vector3): void {
        let constrainFlag: number = DynamicColliderConstraints.None;
        linearFactor.x == 0 && (constrainFlag |= DynamicColliderConstraints.FreezePositionX);
        linearFactor.y == 0 && (constrainFlag |= DynamicColliderConstraints.FreezePositionY);
        linearFactor.z == 0 && (constrainFlag |= DynamicColliderConstraints.FreezePositionZ);
        angularFactor.x == 0 && (constrainFlag |= DynamicColliderConstraints.FreezeRotationX);
        angularFactor.y == 0 && (constrainFlag |= DynamicColliderConstraints.FreezeRotationY);
        angularFactor.z == 0 && (constrainFlag |= DynamicColliderConstraints.FreezeRotationZ);
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
        if (rotation) {
            this._pxActor.setKinematicTarget(positionOrRotation, rotation);
            return;
        }

        const tempTranslation = pxDynamicCollider._tempTranslation;
        const tempRotation = pxDynamicCollider._tempRotation;
        this.getWorldTransform();
        if (positionOrRotation instanceof Vector3) {
            this._pxActor.setKinematicTarget(positionOrRotation, tempRotation);
        } else {
            this._pxActor.setKinematicTarget(tempTranslation, positionOrRotation);
        }
    }


}
