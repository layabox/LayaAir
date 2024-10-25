import { PhysicsForceMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IDynamicCollider } from "../../interface/IDynamicCollider";
import { Physics3DStatInfo } from "../../interface/Physics3DStatInfo";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import { EPhysicsStatisticsInfo } from "../../physicsEnum/EPhysicsStatisticsInfo";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxPhysicsManager } from "../pxPhysicsManager";
import { pxCollider, pxColliderType } from "./pxCollider";

/**
 * @en The collision detection mode constants.
 * @zh 碰撞检测模式常量。
 */
export enum CollisionDetectionMode {
    /**
     * @en Continuous collision detection is off for this dynamic collider.
     * @zh 对于这个动态碰撞体，连续碰撞检测是关闭的。
     */
    Discrete,
    /**
     * @en Continuous collision detection is on for colliding with static mesh geometry.
     * @zh 对于与静态网格几何体的碰撞，连续碰撞检测是开启的。
     */
    Continuous,
    /**
     * @en Continuous collision detection is on for colliding with static and dynamic geometry.
     * @zh 对于与静态和动态几何体的碰撞，连续碰撞检测是开启的。
     */
    ContinuousDynamic,
    /**
     * @en Speculative continuous collision detection is on for static and dynamic geometries.
     * @zh 对于静态和动态几何体，推测性连续碰撞检测是开启的。
     */
    ContinuousSpeculative
}


/**
 * @en Use these flags to constrain motion of dynamic collider.
 * @zh 使用这些标志来限制动态碰撞体的运动。
 */
export enum DynamicColliderConstraints {
    /**
     * @en Not Freeze.
     * @zh 不冻结任何运动。
     */
    None = 0,
    /**
     * @en Freeze motion along the X-axis.
     * @zh 冻结沿 X 轴的运动。
     */
    FreezePositionX = 1,
    /**
     * @en Freeze motion along the Y-axis.
     * @zh 冻结沿 Y 轴的运动。
     */
    FreezePositionY = 2,
    /**
     * @en Freeze motion along the Z-axis.
     * @zh 冻结沿 Z 轴的运动。
     */
    FreezePositionZ = 4,
    /**
     * @en Freeze rotation along the X-axis.
     * @zh 冻结绕 X 轴的旋转。
     */
    FreezeRotationX = 8,
    /**
     * @en Freeze rotation along the Y-axis.
     * @zh 冻结绕 Y 轴的旋转。
     */
    FreezeRotationY = 16,
    /**
     * @en Freeze rotation along the Z-axis.
     * @zh 冻结绕 Z 轴的旋转。
     */
    FreezeRotationZ = 32
}


/**
 * @en The `pxDynamicCollider` class is used to manage dynamic colliders in the physics engine.
 * @zh `pxDynamicCollider` 类用于在物理引擎中管理动态碰撞体。
 */
export class pxDynamicCollider extends pxCollider implements IDynamicCollider {

    /**@internal */
    static _dynamicCapableMap: Map<any, any>;

    /**
     * @en Get the static collider capability for a given value.
     * @param value The collider capability to check.
     * @returns Whether the static collider has the specified capability.
     * @zh 获取指定值的静态碰撞体能力。
     * @param value 要检查的碰撞体能力。
     * @returns 静态碰撞体是否具有指定的能力。
     */
    static getStaticColliderCapable(value: EColliderCapable): boolean {
        return pxDynamicCollider._dynamicCapableMap.get(value);
    }

    /**
     * @en Initialize the capabilities map for dynamic colliders.
     * @zh 初始化动态碰撞体的能力映射。
     */
    static initCapable(): void {
        this._dynamicCapableMap = new Map();
        this._dynamicCapableMap.set(EColliderCapable.Collider_AllowTrigger, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_CollisionGroup, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_Restitution, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_DynamicFriction, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_StaticFriction, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_BounceCombine, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_FrictionCombine, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_EventFilter, true);
        this._dynamicCapableMap.set(EColliderCapable.Collider_CollisionDetectionMode, true);

        this._dynamicCapableMap.set(EColliderCapable.RigidBody_AllowSleep, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_Gravity, true);
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
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_ApplyImpulse, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_ApplyTorqueImpulse, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_WorldPosition, true);
        this._dynamicCapableMap.set(EColliderCapable.RigidBody_WorldOrientation, true);
    }

    /**
     * @en Indicates whether the collider is kinematic.
     * @zh 表示碰撞体是否是运动学的。
     */
    IsKinematic: boolean = false;

    /**
     * @en Create a pxDynamicCollider instance.
     * @param manager The physics manager instance.
     * @zh 创建 pxDynamicCollider 类的实例。
     * @param manager 物理管理器实例。
     */
    constructor(manager: pxPhysicsManager) {
        super(manager);
        this._enableProcessCollisions = true;
        this._type = pxColliderType.RigidbodyCollider;
        Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, 1);
    }

    /**
     * @en Get the capability of the collider for a given value.
     * @param value The capability value to check.
     * @returns Whether the collider has the specified capability.
     * @zh 获取碰撞体对于给定值的能力。
     * @param value 要检查的能力值。
     * @returns 碰撞体是否具有指定的能力。
     */
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

    /**
     * @en Set the world position of the dynamic collider.
     * @param value The new world position.
     * @zh 设置动态碰撞体的世界位置。
     * @param value 新的世界位置。
     */
    setWorldPosition(value: Vector3): void {
        const transform = this._pxActor.getGlobalPose();
        _tempRotation.setValue(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
        this._pxActor.setGlobalPose(this._transformTo(value, _tempRotation), true);
    }

    /**
     * @en Set the world rotation of the dynamic collider.
     * @param value The new world rotation.
     * @zh 设置动态碰撞体的世界旋转。
     * @param value 新的世界旋转。
     */
    setWorldRotation(value: Quaternion): void {
        const transform = this._pxActor.getGlobalPose();
        _tempTranslation.setValue(transform.translation.x, transform.translation.y, transform.translation.z);
        this._pxActor.setGlobalPose(this._transformTo(_tempTranslation, value), true);
    }

    /**
     * @en Get the world transform of the dynamic collider.
     * @zh 获取动态碰撞体的世界变换。
     */
    getWorldTransform() {
        const transform = this._pxActor.getGlobalPose();
        _tempTranslation.set(transform.translation.x, transform.translation.y, transform.translation.z);
        _tempRotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w);
        this.owner.transform.position = _tempTranslation;
        this.owner.transform.rotation = _tempRotation;
    }

    /**
     * @en Set the trigger state of the collider.
     * @param value True to set as trigger, false otherwise.
     * @zh 设置碰撞体的触发器状态。
     * @param value 为 true 时设置为触发器，否则为 false。
     */
    setTrigger(value: boolean): void {
        this._isTrigger = value;
        this._shape && this._shape.setIsTrigger(value);
    }

    /**
     * @en Set the linear damping of the dynamic collider.
     * @param value The linear damping value.
     * @zh 设置动态碰撞体的线性阻尼。
     * @param value 线性阻尼值。
     */
    setLinearDamping(value: number): void {
        this._pxActor.setLinearDamping(value);
    }

    /**
     * @en Set the angular damping of the dynamic collider.
     * @param value The angular damping value.
     * @zh 设置动态碰撞体的角度阻尼。
     * @param value 角度阻尼值。
     */
    setAngularDamping(value: number): void {
        this._pxActor.setAngularDamping(value);
    }

    /**
     * @en Set the linear velocity of the dynamic collider.
     * @param value The linear velocity vector.
     * @zh 设置动态碰撞体的线性速度。
     * @param value 线性速度向量。
     */
    setLinearVelocity(value: Vector3): void {
        this._pxActor.setLinearVelocity(value, true);
    }

    /**
     * @en Get the linear velocity of the dynamic collider.
     * @returns The current linear velocity.
     * @zh 获取动态碰撞体的线性速度。
     * @returns 当前的线性速度。
     */
    getLinearVelocity(): Vector3 {
        let velocity = this._pxActor.getLinearVelocity();
        _tempTranslation.set(velocity.x, velocity.y, velocity.z);
        return _tempTranslation;
    }

    /**
     * @en Set the angular velocity of the dynamic collider.
     * @param value The angular velocity vector.
     * @zh 设置动态碰撞体的角速度。
     * @param value 角速度向量。
     */
    setAngularVelocity(value: Vector3): void {
        this._pxActor.setAngularVelocity(value, true);
    }

    /**
     * @en Get the angular velocity of the dynamic collider.
     * @returns The current angular velocity.
     * @zh 获取动态碰撞体的角速度。
     * @returns 当前的角速度。
     */
    getAngularVelocity(): Vector3 {
        let angVelocity = this._pxActor.getAngularVelocity();
        _tempTranslation.set(angVelocity.x, angVelocity.y, angVelocity.z);
        return _tempTranslation;
    }

    /**
     * @en Set the mass of the dynamic collider.
     * @param value The mass value.
     * @zh 设置动态碰撞体的质量。
     * @param value 质量值。
     */
    setMass(value: number): void {
        this._pxActor.setMassAndUpdateInertia(value);
    }

    /**
     * @en Set the center of mass of the dynamic collider.
     * @param value The center of mass vector.
     * @zh 设置动态碰撞体的质心。
     * @param value 质心向量。
     */
    setCenterOfMass(value: Vector3): void {
        this._pxActor.setCMassLocalPose(value);
    }

    /**
     * @en Set the inertia tensor of the dynamic collider.
     * @param value The inertia tensor vector.
     * @zh 设置动态碰撞体的惯性张量。
     * @param value 惯性张量向量。
     */
    setInertiaTensor(value: Vector3): void {
        this._pxActor.setMassSpaceInertiaTensor(value);
    }

    /**
     * @en Set the sleep threshold of the dynamic collider.
     * @param value The sleep threshold value.
     * @zh 设置动态碰撞体的睡眠阈值。
     * @param value 睡眠阈值。
     */
    setSleepThreshold(value: number): void {
        this._pxActor.setSleepThreshold(value);
    }

    /**
     * @en Set the collision detection mode of the dynamic collider.
     * @param value The collision detection mode.
     * @zh 设置动态碰撞体的碰撞检测模式。
     * @param value 碰撞检测模式。
     */
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

    /**
     * @en Set the solver iterations of the dynamic collider.
     * @param value The number of solver iterations.
     * @zh 设置动态碰撞体的求解器迭代次数。
     * @param value 求解器迭代次数。
     */
    setSolverIterations(value: number): void {
        this._pxActor.setSolverIterationCounts(value, 1);
    }

    /**
     * @en Set whether the dynamic collider is kinematic.
     * @param value True if kinematic, false otherwise.
     * @zh 设置动态碰撞体是否为运动学的。
     * @param value 为 true 时设置为运动学，否则为 false。
     */
    setIsKinematic(value: boolean): void {
        this.IsKinematic = value;
        if (value) {
            this._enableProcessCollisions = false;
            if (this._isSimulate)
                this._physicsManager._dynamicUpdateList.remove(this);
            this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, true);
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaKinematicRigidBody, 1);
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, -1);
        } else {
            this._enableProcessCollisions = true;
            if (this._isSimulate && this.inPhysicUpdateListIndex == -1)
                this._physicsManager._dynamicUpdateList.add(this);
            this._pxActor.setRigidBodyFlag(pxPhysicsCreateUtil._physX.PxRigidBodyFlag.eKINEMATIC, false);
        }
    }

    /**
     * @en Set the constraints of the dynamic collider.
     * @param linearFactor The linear factor vector.
     * @param angularFactor The angular factor vector.
     * @zh 设置动态碰撞体的约束。
     * @param linearFactor 线性因子向量。
     * @param angularFactor 角度因子向量。
     */
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

    /**
     * @en Add force to the dynamic collider.
     * @param force The force vector to add.
     * @param mode The physics force mode.
     * @param localOffset The local offset vector.
     * @zh 为动态碰撞体添加力。
     * @param force 要添加的力向量。
     * @param mode 物理力模式。
     * @param localOffset 局部偏移向量。
     */
    addForce(force: Vector3, mode: PhysicsForceMode, localOffset: Vector3): void {
        //TODO
        this._pxActor.addForce({ x: force.x, y: force.y, z: force.z });
    }

    /**
     * @en Add torque to the dynamic collider.
     * @param torque The torque vector to add.
     * @param mode The physics force mode.
     * @zh 为动态碰撞体添加扭矩。
     * @param torque 要添加的扭矩向量。
     * @param mode 物理力模式。
     */
    addTorque(torque: Vector3, mode: PhysicsForceMode): void {
        //TODO
        this._pxActor.addTorque({ x: torque.x, y: torque.y, z: torque.z });
    }

    /**
     * @en Put the dynamic collider to sleep.
     * @zh 使动态碰撞体进入睡眠状态。
     */
    sleep(): void {
        return this._pxActor.putToSleep();
    }
    /**
     * @en Wake up the dynamic collider.
     * @zh 唤醒动态碰撞体。
     */
    wakeUp(): void {
        return this._pxActor.wakeUp();
    }


    /**
     * {@inheritDoc IDynamicCollider.move }
     * @en Move the kinematic actor to a new pose.
     * @param positionOrRotation The new position or rotation.
     * @param rotation The new rotation (optional).
     * @zh 将运动学角色移动到新的姿态。
     * @param positionOrRotation 新的位置或旋转。
     * @param rotation 新的旋转（可选）。
     */
    move(positionOrRotation: Vector3 | Quaternion, rotation?: Quaternion): void {
        if (rotation) {
            this._pxActor.setKinematicTarget(positionOrRotation, rotation);
            return;
        }

        this.getWorldTransform();
        if (positionOrRotation instanceof Vector3) {
            this._pxActor.setKinematicTarget(positionOrRotation, _tempRotation);
        } else {
            this._pxActor.setKinematicTarget(_tempTranslation, positionOrRotation);
        }
    }

    /**
     * @en Destroy Rigidbody
     * @zh 销毁刚体
     */
    destroy(): void {
        if (this.IsKinematic) {
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaKinematicRigidBody, -1);
        } else {
            Physics3DStatInfo.addStatisticsInfo(EPhysicsStatisticsInfo.C_PhysicaDynamicRigidBody, -1);
        }
        super.destroy();
    }
}

const _tempRotation = new Quaternion();
const _tempTranslation = new Vector3();