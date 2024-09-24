import { PhysicsForceMode } from "../../../d3/physics/PhysicsColliderComponent";
import { MeshColliderShape } from "../../../d3/physics/shape/MeshColliderShape";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IDynamicCollider } from "../../interface/IDynamicCollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import { btColliderShape } from "../Shape/btColliderShape";
import { btMeshColliderShape } from "../Shape/btMeshColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btCollider, btColliderType } from "./btCollider";
/**
 * @en The `btRigidBodyCollider` class is used to implement 3D physics rigid body colliders.
 * @zh `btRigidBodyCollider` 类用于实现3D物理刚体碰撞器。
 */
export class btRigidBodyCollider extends btCollider implements IDynamicCollider {
    /** @internal */
    static _BT_DISABLE_WORLD_GRAVITY = 1;
    /** @internal */
    static _BT_ENABLE_GYROPSCOPIC_FORCE = 2;
    /** @internal */
    private static _btTempVector30: number;
    /** @internal */
    private static _btTempVector31: number;
    /** @internal */
    private static _RBtempVector30: Vector3;
    /** @internal */
    private static _btVector3Zero: number;
    /**@internal */
    private static _btTransform0: number;
    /** @internal */
    private static _btInertia: number;
    /** @internal */
    private static _btImpulse: number;
    /** @internal */
    private static _btImpulseOffset: number;
    /** @internal */
    private static _btGravity: number;

    /**@internal */
    static _rigidBodyCapableMap: Map<any, any>;
    /**
    * @internal
    */
    static __init__(): void {
        let bt = btPhysicsCreateUtil._bt;
        btRigidBodyCollider._btTempVector30 = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._btTempVector31 = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._RBtempVector30 = new Vector3(0, 0, 0);
        btRigidBodyCollider._btVector3Zero = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._btInertia = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._btImpulse = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._btImpulseOffset = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._btGravity = bt.btVector3_create(0, 0, 0);
        btRigidBodyCollider._btTransform0 = bt.btTransform_create();
        btRigidBodyCollider.initCapable();
    }
    /**@internal */
    componentEnable: boolean;
    /** @internal */
    private _btLayaMotionState: number;
    /** @internal */
    private _isKinematic = false;
    /** @internal */
    private _mass = 1.0;
    /** @internal */
    private _gravity = new Vector3(0, -10, 0);
    /** @internal */
    private _angularDamping = 0.0;
    /** @internal */
    private _linearDamping = 0.0;
    /** @internal */
    private _overrideGravity = false;
    /** @internal */
    private _totalTorque = new Vector3(0, 0, 0);
    /** @internal */
    private _totalForce = new Vector3(0, 0, 0);
    /** @internal */
    private _linearVelocity = new Vector3();
    /** @internal */
    private _angularVelocity = new Vector3();
    /** @internal */
    private _linearFactor = new Vector3(1, 1, 1);
    /** @internal */
    private _angularFactor = new Vector3(1, 1, 1);
    /** @internal */
    private _detectCollisions = true;
    /**@internal TODO*/
    private _allowSleep: boolean = false;


    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    /**
     * @en Get the capability of the rigid body collider.
     * @param value The capability value to check.
     * @returns Whether the rigid body collider has the specified capability.
     * @zh 获取刚体碰撞器的能力。
     * @param value 要检查的能力值。
     * @returns 刚体碰撞器是否具有指定的能力。
     */
    getCapable(value: number): boolean {
        return btRigidBodyCollider.getRigidBodyCapable(value);
    }

    /**
     * @en Get the capability of the rigid body.
     * @param value The capability to check.
     * @returns Whether the rigid body has the specified capability.
     * @zh 获取刚体的能力。
     * @param value 要检查的能力。
     * @returns 刚体是否具有指定的能力。
     */
    static getRigidBodyCapable(value: EColliderCapable): boolean {
        return this._rigidBodyCapableMap.get(value);
    }

    /**
     * @en Initialize the capabilities of the rigid body collider.
     * @zh 初始化刚体碰撞器的能力。
     */
    static initCapable(): void {
        this._rigidBodyCapableMap = new Map();
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_AllowTrigger, true);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_CollisionGroup, true);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_Friction, true);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_Restitution, true);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_RollingFriction, true);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_DynamicFriction, false);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_StaticFriction, false);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_BounceCombine, false);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_FrictionCombine, false);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_EventFilter, false);
        this._rigidBodyCapableMap.set(EColliderCapable.Collider_CollisionDetectionMode, false);

        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_AllowSleep, false);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_Gravity, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_LinearDamp, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_AngularDamp, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_LinearVelocity, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_AngularVelocity, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_Mass, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_InertiaTensor, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_MassCenter, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_MaxAngularVelocity, false);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_MaxDepenetrationVelocity, false);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_SleepThreshold, false);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_SleepAngularVelocity, false);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_SolverIterations, false);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_AllowDetectionMode, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_AllowKinematic, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_LinearFactor, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_AngularFactor, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_ApplyForce, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_ClearForce, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_ApplyForceWithOffset, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_ApplyTorque, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_ApplyImpulse, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_ApplyTorqueImpulse, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_WorldPosition, true);
        this._rigidBodyCapableMap.set(EColliderCapable.RigidBody_WorldOrientation, true);
    }

    /**
     * @en Set the world position of the rigid body.
     * @param value The new world position.
     * @zh 设置刚体的世界坐标位置。
     * @param value 坐标位置。
     */
    setWorldPosition(value: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject = this._btCollider;
        bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
    }

    /**
     * @en Set the world rotation of the rigid body.
     * @param value The new world rotation.
     * @zh 设置刚体在世界坐标系下的旋转。
     * @param value 旋转四元数。
     */
    setWorldRotation(value: Quaternion): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject = this._btCollider;
        bt.btRigidBody_setCenterOfMassOrientation(btColliderObject, value.x, value.y, value.z, value.w);
    }

    /**
     * @en Set the rigid body to sleep state.
     * @zh 设置刚体进入睡眠状态。
     */
    sleep(): void {
        this._allowSleep = true;
    }

    protected getColliderType() {
        return this._type = btColliderType.RigidbodyCollider;

    }

    /**
     * @en Whether to override gravity.
     * @zh 是否重载重力。
     */
    private _setoverrideGravity(value: boolean) {
        this._overrideGravity = value;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider) {
            var flag: number = bt.btRigidBody_getFlags(this._btCollider);
            if (value) {
                if ((flag & btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY) === 0)
                    bt.btRigidBody_setFlags(this._btCollider, flag | btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY);
            } else {
                if ((flag & btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY) > 0)
                    bt.btRigidBody_setFlags(this._btCollider, flag ^ btRigidBodyCollider._BT_DISABLE_WORLD_GRAVITY);
            }
        }
    }


    /**
    * @internal
    */
    private _updateMass(mass: number): void {
        if (this._btCollider && this._btColliderShape && this._btColliderShape._btShape) {
            let bt = btPhysicsCreateUtil._bt;
            bt.btCollisionShape_calculateLocalInertia(this._btColliderShape._btShape, mass, btRigidBodyCollider._btInertia);
            bt.btRigidBody_setMassProps(this._btCollider, mass, btRigidBodyCollider._btInertia);
            bt.btRigidBody_updateInertiaTensor(this._btCollider); //this was the major headache when I had to debug Slider and Hinge constraint
        }
    }

    /**
     * @en Whether it is sleeping.
     * @zh 是否处于睡眠状态。
     */
    private isSleeping(): boolean {
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider)
            return bt.btCollisionObject_getActivationState(this._btCollider) === btPhysicsManager.ACTIVATIONSTATE_ISLAND_SLEEPING;
        return false;
    }

    protected _initCollider() {
        let bt = btPhysicsCreateUtil._bt;
        var motionState: number = bt.layaMotionState_create();
        bt.layaMotionState_set_rigidBodyID(motionState, this._id);
        this._btLayaMotionState = motionState;
        var constructInfo: number = bt.btRigidBodyConstructionInfo_create(0.0, motionState, null, btRigidBodyCollider._btVector3Zero);
        var btRigid: number = bt.btRigidBody_create(constructInfo);
        bt.btCollisionObject_setUserIndex(btRigid, this._id);
        this._btCollider = btRigid;
        bt.btRigidBodyConstructionInfo_destroy(constructInfo);
        super._initCollider();

        this.setMass(this._mass);
        this.setConstraints(this._linearFactor, this._angularFactor);
        this.setLinearDamping(this._linearDamping);
        this.setLinearVelocity(this._linearVelocity);
        this.setAngularDamping(this._angularDamping);
        this.setIsKinematic(this._isKinematic);
        this.setInertiaTensor(this._gravity);
    }

    protected _onShapeChange() {
        super._onShapeChange();
        if (this._mass <= 0) return;
        if (this._btColliderShape instanceof btMeshColliderShape && !this._btColliderShape.convex) {
            console.error("btRigidBodyCollider: TriangleMeshShap performance is poor, please use convex.")
        }
        if (this._isKinematic) {
            this._updateMass(0);
        } else {
            let bt = btPhysicsCreateUtil._bt;
            bt.btRigidBody_setCenterOfMassTransform(this._btCollider, bt.btCollisionObject_getWorldTransform(this._btCollider));//修改Shape会影响坐标,需要更新插值坐标,否则物理引擎motionState.setWorldTrans数据为旧数据
            this._updateMass(this._mass);
        }
    }

    /**
     * @en Set the linear damping of the rigid body.
     * @param value The linear damping value.
     * @zh 设置刚体的线性阻尼。
     * @param value 线性阻尼值。
     */
    setLinearDamping(value: number): void {
        this._linearDamping = value;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider)
            bt.btRigidBody_setDamping(this._btCollider, value, this._angularDamping);
    }

    /**
     * @en Set the angular damping of the rigid body.
     * @param value The angular damping value.
     * @zh 设置刚体的角速度阻尼。
     * @param value 角速度阻尼值。
     */
    setAngularDamping(value: number): void {
        this._angularDamping = value;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider)
            bt.btRigidBody_setDamping(this._btCollider, this._linearDamping, value);
    }

    /**
     * @en Set the linear velocity of the rigid body.
     * @param value The linear velocity vector.
     * @zh 设置刚体的线速度。
     * @param value 线速度向量。
     */
    setLinearVelocity(value: Vector3): void {
        this._linearVelocity = value;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider) {
            var btValue: number = btRigidBodyCollider._btTempVector30;
            btPhysicsManager._convertToBulletVec3(value, btValue);
            (this.isSleeping()) && (this.wakeUp());//可能会因睡眠导致设置线速度无效
            bt.btRigidBody_setLinearVelocity(this._btCollider, btValue);
        }
    }

    /**
     * @en Get the linear velocity of the rigid body.
     * @returns The current linear velocity vector.
     * @zh 获取刚体的线速度。
     * @returns 当前的线速度。
     */
    getLinearVelocity(): Vector3 {
        let bt = btPhysicsCreateUtil._bt;
        let velocity = bt.btRigidBody_getLinearVelocity(this._btCollider);
        btRigidBodyCollider._RBtempVector30.setValue(bt.btVector3_x(velocity), bt.btVector3_y(velocity), bt.btVector3_z(velocity));
        return btRigidBodyCollider._RBtempVector30;
    }

    /**
     * @en Set the linear velocity threshold for the rigid body.
     * @param value The linear velocity threshold vector.
     * @zh 设置刚体线速度阈值。
     * @param value 线速度阈值。
     */
    setSleepLinearVelocity(value: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btRigidBody_setSleepingThresholds(this._btCollider, value, bt.btRigidBody_getAngularSleepingThreshold(this._btCollider));
    }

    /**
     * @en Set the angular velocity of the rigid body.
     * @param value The angular velocity vector.
     * @zh 设置刚体的角速度。
     * @param value 角速度。
     */
    setAngularVelocity(value: Vector3): void {
        this._angularVelocity = value;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider) {
            var btValue: number = btRigidBodyCollider._btTempVector30;
            btPhysicsManager._convertToBulletVec3(value, btValue);
            (this.isSleeping()) && (this.wakeUp());//可能会因睡眠导致设置角速度无效
            bt.btRigidBody_setAngularVelocity(this._btCollider, btValue);
        }
    }

    /**
     * @en Get the angular velocity of the rigid body.
     * @returns The current angular velocity vector.
     * @zh 获取刚体的角速度。
     * @returns 当前的角速度。
     */
    getAngularVelocity(): Vector3 {
        let bt = btPhysicsCreateUtil._bt;
        let angVelocity = bt.btRigidBody_getAngularVelocity(this._btCollider);
        btRigidBodyCollider._RBtempVector30.setValue(bt.btVector3_x(angVelocity), bt.btVector3_y(angVelocity), bt.btVector3_z(angVelocity));
        return btRigidBodyCollider._RBtempVector30;
    }

    /**
     * @en Set the mass of the rigid body.
     * @param value The mass value.
     * @zh 设置刚体的质量。
     * @param value 质量值。
     */
    setMass(value: number): void {
        value = Math.max(value, 1e-07);//质量最小为1e-07
        this._mass = value;
        (this._isKinematic) || (this._updateMass(value));
    }

    /**
     * @en Set the inertia tensor of the rigid body.
     * @param value The inertia tensor vector.
     * @zh 设置刚体的惯性张量。
     * @param value 惯性张量。
     */
    setInertiaTensor(value: Vector3): void {
        this._gravity = value;
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(btRigidBodyCollider._btGravity, value.x, value.y, value.z);
        bt.btRigidBody_setGravity(this._btCollider, btRigidBodyCollider._btGravity);
        if (value.equal(this._physicsManager._gravity)) {
            this._setoverrideGravity(false);
        } else {
            this._setoverrideGravity(true);
        }

    }

    /**
     * @en Set the center of mass of the rigid body.
     * @param value The center of mass vector.
     * @zh 设置刚体的质心。
     * @param value 质心。
     */
    setCenterOfMass(value: Vector3) {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject = this._btCollider;
        bt.btRigidBody_setCenterOfMassPos(btColliderObject, value.x, value.y, value.z);
    }

    /**
     * @en Set the maximum angular velocity of the rigid body.
     * @param value The maximum angular velocity.
     * @zh 设置刚体的最大角速度。
     * @param value 角速度。
     */
    setMaxAngularVelocity(value: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * @en Set the maximum depenetration velocity of the rigid body.
     * @param value The maximum depenetration velocity.
     * @zh 设置刚体的最大去穿透速度。
     * @param value 速度。
     */
    setMaxDepenetrationVelocity(value: number): void {
        throw new Error("Method not implemented.");
    }

    //这里是bug把  类都不对
    setSleepThreshold(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        //btRigidBody_getLinearSleepingThreshold
        this._btCollider && bt.btRigidBody_setSleepingThresholds(this._btCollider, value, bt.btRigidBody_getAngularSleepingThreshold(this._btCollider));
    }

    /**
     * @en Set the angular velocity threshold for the rigid body to sleep.
     * @param value The angular velocity threshold.
     * @zh 设置刚体进入睡眠状态的角速度阈值。
     * @param value 角速度阈值。
     */
    setSleepAngularVelocity(value: number) {
        let bt = btPhysicsCreateUtil._bt;
        bt.btRigidBody_setSleepingThresholds(this._btCollider, bt.btRigidBody_getLinearSleepingThreshold(this._btCollider), value);
    }

    /**
     * @en Set the solver iterations for the rigid body.
     * @param value The number of solver iterations.
     * @zh 设置刚体的求解器迭代次数。
     * @param value 求解器迭代次数。
     */
    setSolverIterations(value: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * @en Set the collision detection mode for the rigid body.
     * @param value The collision detection mode.
     * @zh 设置刚体的碰撞检测模式。
     * @param value 碰撞检测模式。
     */
    setCollisionDetectionMode(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        var canInSimulation = this._isSimulate;
        //如果动态改变只能重新添加。否则world不能正确记录动态物体
        canInSimulation && this._physicsManager.removeCollider(this);
        if (value & 3) {
            this._isKinematic = true;
            canInSimulation && this._updateMass(0)
        } else {
            canInSimulation && this._updateMass(this._mass);
        }
        bt.btCollisionObject_setCollisionFlags(this._btCollider, value);
        canInSimulation && this._physicsManager.addCollider(this);
    }

    /**
     * @en Set whether the rigid body is kinematic.
     * @param value True if the body should be kinematic, false otherwise.
     * @zh 设置刚体是否为运动学刚体。
     * @param value 如果为true，则设置为运动学刚体；否则为false。
     */
    setIsKinematic(value: boolean): void {
        this._isKinematic = value;
        //this._controlBySimulation = !value;//isKinematic not controll by Simulation
        let bt = btPhysicsCreateUtil._bt;
        let oldSimulate = this._isSimulate;
        oldSimulate && this._physicsManager.removeCollider(this);
        var natColObj: any = this._btCollider;
        var flags: number = bt.btCollisionObject_getCollisionFlags(natColObj);
        if (value) {
            flags = flags | btPhysicsManager.COLLISIONFLAGS_KINEMATIC_OBJECT;
            bt.btCollisionObject_setCollisionFlags(natColObj, flags);//加入场景前必须配置flag,加入后无效
            // TODO kinematic直接禁止睡眠有问题，例如如果实际不动的话，会导致与他接触的物体都无法进入睡眠状态
            bt.btCollisionObject_forceActivationState(this._btCollider, btPhysicsManager.ACTIVATIONSTATE_DISABLE_DEACTIVATION);//触发器开启主动检测,并防止睡眠
            this._enableProcessCollisions = false;
            this._updateMass(0);//必须设置Mass为0来保证InverMass为0
        } else {
            if ((flags & btPhysicsManager.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
                flags = flags ^ btPhysicsManager.COLLISIONFLAGS_KINEMATIC_OBJECT;
            bt.btCollisionObject_setCollisionFlags(natColObj, flags);//加入场景前必须配置flag,加入后无效
            bt.btCollisionObject_setActivationState(this._btCollider, btPhysicsManager.ACTIVATIONSTATE_ACTIVE_TAG);
            this._enableProcessCollisions = true;
            this._updateMass(this._mass);
        }

        var btZero: number = btRigidBodyCollider._btVector3Zero;
        bt.btCollisionObject_setInterpolationLinearVelocity(natColObj, btZero);
        bt.btRigidBody_setLinearVelocity(natColObj, btZero);
        bt.btCollisionObject_setInterpolationAngularVelocity(natColObj, btZero);
        bt.btRigidBody_setAngularVelocity(natColObj, btZero);

        oldSimulate && this._physicsManager.addCollider(this);
    }

    /**
     * @en Set the linear and angular factor constraints for the rigid body.
     * @param linearFactor The linear factor constraint.
     * @param angularFactor The angular factor constraint.
     * @zh 设置刚体的线性和角度因子约束。
     * @param linearFactor 线性因子约束。
     * @param angularFactor 角度因子约束。
     */
    setConstraints(linearFactor: Vector3, angularFactor: Vector3): void {
        let bt = btPhysicsCreateUtil._bt;
        //if (!linearFactor.equal(this._linearFactor)) {
        linearFactor.cloneTo(linearFactor);
        var btValue: number = btRigidBodyCollider._btTempVector30;
        btPhysicsManager._convertToBulletVec3(linearFactor, btValue);
        bt.btRigidBody_setLinearFactor(this._btCollider, btValue);
        //}

        //if (!angularFactor.equal(this._angularFactor)) {
        angularFactor.cloneTo(this._angularFactor);
        var btValue: number = btRigidBodyCollider._btTempVector30;
        btPhysicsManager._convertToBulletVec3(angularFactor, btValue);
        bt.btRigidBody_setAngularFactor(this._btCollider, btValue);
        //}
    }

    /**
     * @en Set whether the rigid body is a trigger.
     * @param value True if the body should be a trigger, false otherwise.
     * @zh 设置刚体是否为触发器。
     * @param value 如果为true，则设置为触发器；否则为false。
     */
    setTrigger(value: boolean): void {
        this._isTrigger = value;
        let bt = btPhysicsCreateUtil._bt;
        if (this._btCollider) {
            var flags: number = bt.btCollisionObject_getCollisionFlags(this._btCollider);
            if (value) {
                if ((flags & btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
                    bt.btCollisionObject_setCollisionFlags(this._btCollider, flags | btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
            } else {
                if ((flags & btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
                    bt.btCollisionObject_setCollisionFlags(this._btCollider, flags ^ btPhysicsManager.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
            }
        }
    }

    /**
     * @en Apply a force to the rigid body.
     * @param force The force to be applied.
     * @param localOffset The offset. If null, force is applied at the center.
     * @zh 应用作用力。
     * @param force 要施加的作用力。
     * @param localOffset 偏移量，如果为null则为中心点。
     */
    private _applyForce(force: Vector3, localOffset: Vector3 = null): void {
        if (this._btCollider == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        let bt = btPhysicsCreateUtil._bt;
        var btForce = btRigidBodyCollider._btTempVector30;
        bt.btVector3_setValue(btForce, force.x, force.y, force.z);
        this.wakeUp();
        if (localOffset) {
            var btOffset: number = btRigidBodyCollider._btTempVector31;
            bt.btVector3_setValue(btOffset, localOffset.x, localOffset.y, localOffset.z);
            bt.btRigidBody_applyForce(this._btCollider, btForce, btOffset);
        } else {
            bt.btRigidBody_applyCentralForce(this._btCollider, btForce);
        }
    }

    /**
     * @en Apply a torque to the rigid body.
     * @param torque The torque to be applied.
     * @zh 应用扭转力。
     * @param torque 要施加的扭转力。
     */
    private _applyTorque(torque: Vector3): void {
        if (this._btCollider == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        let bt = btPhysicsCreateUtil._bt;
        var btTorque: number = btRigidBodyCollider._btTempVector30;
        this.wakeUp();
        bt.btVector3_setValue(btTorque, torque.x, torque.y, torque.z);
        bt.btRigidBody_applyTorque(this._btCollider, btTorque);
    }

    /**
     * @en Apply an impulse to the rigid body.
     * @param impulse The impulse to be applied.
     * @param localOffset The offset. If null, force is applied at the center.
     * @zh 应用冲量。
     * @param impulse 要施加的冲量。
     * @param localOffset 偏移量，如果为null则为中心点。
     */
    private _applyImpulse(impulse: Vector3, localOffset: Vector3 = null): void {
        if (this._btCollider == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(btRigidBodyCollider._btImpulse, impulse.x, impulse.y, impulse.z);
        this.wakeUp();
        if (localOffset) {
            bt.btVector3_setValue(btRigidBodyCollider._btImpulseOffset, localOffset.x, localOffset.y, localOffset.z);
            bt.btRigidBody_applyImpulse(this._btCollider, btRigidBodyCollider._btImpulse, btRigidBodyCollider._btImpulseOffset);
        } else {
            bt.btRigidBody_applyCentralImpulse(this._btCollider, btRigidBodyCollider._btImpulse);
        }
    }

    /**
     * @en Apply a torque impulse to the rigid body.
     * @param torqueImpulse The torque impulse to be applied.
     * @zh 应用扭转冲量。
     * @param torqueImpulse 要施加的扭转冲量。
     */
    private _applyTorqueImpulse(torqueImpulse: Vector3): void {
        if (this._btCollider == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        let bt = btPhysicsCreateUtil._bt;
        var btTorqueImpulse: number = btRigidBodyCollider._btTempVector30;
        this.wakeUp();
        bt.btVector3_setValue(btTorqueImpulse, torqueImpulse.x, torqueImpulse.y, torqueImpulse.z);
        bt.btRigidBody_applyTorqueImpulse(this._btCollider, btTorqueImpulse);
    }

    /**
     * @en Add a force to the rigid body.
     * @param force The force to be added.
     * @param mode The force mode.
     * @param localOffset The offset from the center of mass.
     * @zh 向刚体添加力。
     * @param force 要添加的力。
     * @param mode 力的模式。
     * @param localOffset 相对于质心的偏移量。
     */
    addForce(force: Vector3, mode: PhysicsForceMode, localOffset: Vector3): void {
        switch (mode) {
            case PhysicsForceMode.Force:
                this._applyForce(force, localOffset);
                break;
            case PhysicsForceMode.Impulse:
                this._applyImpulse(force, localOffset);
                break;
            default:
                break;
        }
    }

    /**
     * @en Add a torque to the rigid body.
     * @param torque The torque to be added.
     * @param mode The force mode.
     * @zh 向刚体添加扭矩。
     * @param torque 要添加的扭矩。
     * @param mode 力的模式。
     */
    addTorque(torque: Vector3, mode: PhysicsForceMode): void {
        switch (mode) {
            case PhysicsForceMode.Force:
                this._applyTorque(torque);
                break;
            case PhysicsForceMode.Impulse:
                this._applyTorqueImpulse(torque);
                break;
        }
    }

    /**
     * @en Clear all forces applied to the rigid body.
     * @zh 清除应用到刚体上的所有力。
     */
    private clearForces(): void {
        var rigidBody: number = this._btCollider;
        if (rigidBody == null)
            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
        let bt = btPhysicsCreateUtil._bt;
        bt.btRigidBody_clearForces(rigidBody);
        var btZero: number = btRigidBodyCollider._btVector3Zero;
        bt.btCollisionObject_setInterpolationLinearVelocity(rigidBody, btZero);
        bt.btRigidBody_setLinearVelocity(rigidBody, btZero);
        bt.btCollisionObject_setInterpolationAngularVelocity(rigidBody, btZero);
        bt.btRigidBody_setAngularVelocity(rigidBody, btZero);
    }

    /**
     * @en Wake up the rigid body.
     * @zh 唤醒刚体。
     */
    wakeUp(): void {
        let bt = btPhysicsCreateUtil._bt;
        this._btCollider && (bt.btCollisionObject_activate(this._btCollider, false));
    }

    /**
     * @internal
     * @en Update the physics transformation based on the render matrix.
     * @param force Whether to force update.
     * @zh 通过渲染矩阵更新物理矩阵。
     * @param force 是否强制更新。
     */
    _derivePhysicsTransformation(force: boolean): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject = this._btCollider;
        //btColliderObject 当前的trasform
        var oriTransform: number = bt.btCollisionObject_getWorldTransform(btColliderObject);

        // 临时transform
        var transform = btRigidBodyCollider._btTransform0;//must use another transform

        // transform = origTransform。 由于transform是公用的，下面的设置可能只是设置一部分，所以先完整拷贝一下当前的物理位置
        bt.btTransform_equal(transform, oriTransform);
        this._innerDerivePhysicsTransformation(transform, force);
        bt.btRigidBody_setCenterOfMassTransform(btColliderObject, transform);//RigidBody use 'setCenterOfMassTransform' instead(influence interpolationWorldTransform and so on) ,or stepSimulation may return old transform because interpolation.
    }

    /**
     * @en Set the collider shape for the rigid body.
     * @param shape The collider shape to be set.
     * @zh 设置刚体的碰撞器形状。
     * @param shape 要设置的碰撞器形状。
     */
    setColliderShape(shape: btColliderShape) {
        if (shape instanceof MeshColliderShape) {
            console.error("RigidBody3D is not support MeshColliderShape");
            shape = null;
        }
        super.setColliderShape(shape);
    }

    /**
     * @en Destroy the rigid body.
     * @zh 销毁刚体。
     */
    destroy(): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btMotionState_destroy(this._btLayaMotionState);
        super.destroy();
    }

}