import { Vector3 } from "../../maths/Vector3";
import { PhysicsColliderComponent, PhysicsForceMode } from "./PhysicsColliderComponent";
import { Laya3D } from "../../../Laya3D";
import { IDynamicCollider } from "../../Physics3D/interface/IDynamicCollider";
import { Scene3D } from "../core/scene/Scene3D";
import { Quaternion } from "../../maths/Quaternion";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { Event } from "../../events/Event";

/**
 * @en Rigidbody3D is a component that creates a rigidbody collider.
 * @zh Rigidbody3D 类用于创建刚体碰撞器。
 */
export class Rigidbody3D extends PhysicsColliderComponent {
    /**@internal */
    protected _collider: IDynamicCollider;
    /** @internal */
    private _isKinematic = false;
    /** @internal */
    private _mass = 1.0;
    /** @internal */
    private _gravity = new Vector3(0, -9.8, 0);
    /** @internal */
    private _angularDamping = 0.0;
    /** @internal */
    private _linearDamping = 0.0;
    /** @internal */
    private _linearVelocity = new Vector3();
    /** @internal */
    private _angularVelocity = new Vector3();
    /** @internal */
    private _linearFactor = new Vector3(1, 1, 1);
    /** @internal */
    private _angularFactor = new Vector3(1, 1, 1);
    /**@internal */
    private _sleepThreshold: number;
    /**@internal */
    private _trigger: boolean = false;
    /**@internal */
    private _collisionDetectionMode: number = 0;
    /**@internal */
    private _allowSleep: boolean = true;

    /**
     * @override
     * @internal
     */
    protected _initCollider() {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && this._physicsManager && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_DynamicCollider)) {
            this._collider = Laya3D.PhysicsCreateUtil.createDynamicCollider(this._physicsManager);
            this._collider.component = this;
        } else {
            console.error("Rigidbody3D: cant enable Rigidbody3D");
        }
    }

    /**
     * @en The mass of the rigidbody. It affects the size of acceleration and momentum transfer during force application in collisions.
     * @zh 刚体的质量。影响其受力时的加速度大小和在碰撞中的动量传递。
     */
    get mass(): number {
        return this._mass;
    }

    set mass(value: number) {
        this._mass = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_Mass)) {
            this._collider.setMass(value);
        }
    }

    /**
     * @en Determines if the rigidbody is kinematic. If true, the rigidbody can only be moved by transform property, not by other force-related properties.
     * @zh 设置刚体是否为运动学控制模式。如果为true仅可通过transform属性移动物体,而非其他力相关属性。
     */
    get isKinematic(): boolean {
        return this._isKinematic;
    }

    set isKinematic(value: boolean) {
        this._isKinematic = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AllowKinematic)) {
            this._collider.setIsKinematic(value);
        }
    }

    /**
     * @en The linear damping of the rigidbody. It simulates air resistance and other environmental factors to make the object slow down gradually.
     * @zh 控制刚体线性运动的阻尼系数，模拟空气阻力等环境因素，使物体逐渐减速。
     */
    get linearDamping(): number {
        return this._linearDamping;
    }

    set linearDamping(value: number) {
        this._linearDamping = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_LinearDamp)) {
            this._collider.setLinearDamping(value);
        }
    }

    /**
     * @en The angular damping of the rigidbody. It simulates angular resistance and other environmental factors to make the object's rotation slow down gradually. 
     * @zh 刚体的角速度阻尼。控制刚体旋转运动的阻尼系数，使旋转逐渐减速，防止永久旋转。
     */
    get angularDamping(): number {
        return this._angularDamping;
    }

    set angularDamping(value: number) {
        this._angularDamping = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AngularDamp)) {
            this._collider.setAngularDamping(value);
        }
    }

    /**
     * @en Sets the gravity vector applied to the rigidbody, allowing customization of direction and magnitude. 
     * @zh 设置作用于刚体的重力向量，可自定义方向和大小。
     */
    get gravity(): Vector3 {
        return this._gravity;
    }

    set gravity(value: Vector3) {
        this._gravity = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_Gravity)) {
            this._collider.setInertiaTensor(value);
        }
    }

    /**
     * @en The linear motion scaling factor for each axis of the rigidbody. 
     * If the value of any axis is 0, it means that the linear motion is frozen on that axis.
     * If the value is 1, it means that linear motion on that axis is not restricted.
     * @zh 限制刚体在特定轴向的线性运动, 如果某一轴的值为0表示冻结在该轴的线性运动。为1表示在该轴的线性运动不受限制。
     */
    get linearFactor(): Vector3 {
        return this._linearFactor;
    }

    set linearFactor(value: Vector3) {
        this._linearFactor = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_LinearFactor)) {
            this._collider.setConstraints(this._linearFactor, this.angularFactor);
        }
    }

    /**
     * @en The linear velocity of the rigidbody. 
     * It is represented by a three-dimensional vector (x, y, z) that corresponds to the linear velocity components of the rigidbody on the X, Y, and Z axes. 
     * This value not only represents the magnitude but also includes direction.
     * @zh 刚体的线速度。由一个三维向量（x, y, z）表示，分别对应刚体在X、Y、Z 轴上的速度分量，该分量值既有大小又有方向。
     */
    get linearVelocity(): Vector3 {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_LinearVelocity)) {
            return this._collider.getLinearVelocity();
        } else {
            return this._linearVelocity;
        }
    }

    set linearVelocity(value: Vector3) {
        this._linearVelocity = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_LinearVelocity)) {
            this._collider.setLinearVelocity(value);
        }
    }

    /**
     * @en The angular motion scaling factor for each axis of the rigidbody. If the value of any axis is 0, it means that the angular motion is frozen on that axis.
     * @zh 限制刚体在特定轴向的旋转运动，如果某一轴的值为0表示冻结在该轴的角度运动。
     */
    get angularFactor(): Vector3 {
        return this._angularFactor;
    }

    set angularFactor(value: Vector3) {
        this._angularFactor = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AngularFactor)) {
            this._collider.setConstraints(this._linearFactor, this.angularFactor);
        }
    }

    /**
     * @en The angular velocity of the rigidbody.
     * It is represented by a three-dimensional vector (x, y, z) that corresponds to the angular velocity components of the rigidbody around X, Y, and Z axes. 
     * This value not only represents the magnitude but also includes direction. The unit is **radians per second**.
     * @zh 刚体的角速度。由一个三维向量（Vector3）表示，分别对应刚体围绕X、Y、Z 轴的旋转速率分量，该分量值既有大小又有方向。单位是**弧度/秒**。
     */
    get angularVelocity(): Vector3 {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AngularVelocity)) {
            return this._collider.getAngularVelocity();
        } else {
            return this._angularVelocity;
        }
    }

    set angularVelocity(value: Vector3) {
        this._angularVelocity = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AngularVelocity)) {
            this._collider.setAngularVelocity(value);
        }
    }

    /**
     * @en Set whether the rigidbody allows sleep.
     * @zh 设置刚体是否允许睡眠。
     */
    set allowSleep(value: boolean) {
        this._allowSleep = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AllowSleep)) {
            this._collider.allowSleep(value);
        }
    }

    get allowSleep(): boolean {
        return this._allowSleep;
    }

    /**
    * @en Whether it is sleeping.
    * @zh 是否处于睡眠状态。
    */
    get isSleeping(): boolean {
        return this._collider.isSleeping();
    }

    /**
     * @en The linear velocity threshold below which the rigidbody will go to sleep.
     * @zh 刚体进入睡眠状态的线速度阈值。
     */
    get sleepThreshold(): number {
        return this._sleepThreshold;
    }
    set sleepThreshold(value: number) {
        this._sleepThreshold = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_SleepThreshold)) {
            this._collider.setSleepThreshold(value);
        }
    }

    /**
     * @en Directly sets the physical position of the rigidbody.
     * @zh 直接设置刚体的物理位置。
     */
    set position(pos: Vector3) {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_WorldPosition)) {
            this._collider.setWorldPosition(pos)
        }
    }

    /**
     * @en Directly sets the physical rotation of the rigidbody.
     * @zh 直接设置刚体的物理旋转。
     */
    set orientation(q: Quaternion) {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_WorldOrientation)) {
            this._collider.setWorldRotation(q);
        }
    }

    /**
     * @en Sets whether the rigidbody is a trigger. Triggers can detect collisions but do not produce physical reactions.
     * @zh 设置刚体是否作为触发器使用。触发器可以检测碰撞但不产生物理反应。
     */
    public get trigger(): boolean {
        return this._trigger;
    }
    public set trigger(value: boolean) {
        this._trigger = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.Collider_AllowTrigger)) {
            this._collider.setTrigger(value);
        }
    }

    /**
     * @en The collision detection mode of the rigidbody.
     * @zh 刚体的碰撞检测模式。
     */
    public get collisionDetectionMode(): number {
        return this._collisionDetectionMode;
    }
    public set collisionDetectionMode(value: number) {
        this._collisionDetectionMode = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_CollisionDetectionMode)) {
            this._collider.setCollisionDetectionMode(value);
        }
    }

    /** @ignore */
    constructor() {
        super();
    }

    /**
     * @internal
     * @protected
     */
    protected _onAdded(): void {
        super._onAdded();
        this.restitution = this._restitution;
        this.friction = this._friction;
        this.rollingFriction = this._rollingFriction;
        this.gravity = this._gravity;
        this.trigger = this._trigger;
        this.isKinematic = this._isKinematic;
        this.mass = this._mass;
        this.linearFactor = this._linearFactor;
        this.angularFactor = this._angularFactor;
        this.linearDamping = this._linearDamping;
        this.linearVelocity = this._linearVelocity;
        this.angularDamping = this._angularDamping;
        this.allowSleep = this._allowSleep;
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        super._onDestroy();
        this._gravity = null;
        this._linearVelocity = null;
        this._angularVelocity = null;
        this._linearFactor = null;
        this._angularFactor = null;
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: Rigidbody3D): void {
        super._cloneTo(dest);
        dest.isKinematic = this._isKinematic;
        dest.mass = this._mass;
        dest.gravity = this._gravity;
        dest.angularDamping = this._angularDamping;
        dest.linearDamping = this._linearDamping;
        dest.linearVelocity = this._linearVelocity;
        dest.angularVelocity = this._angularVelocity;
        dest.linearFactor = this._linearFactor;
        dest.angularFactor = this._angularFactor;
    }

    /**
     * @en Applies a force to the rigidbody.
     * @param force The force to apply.
     * @param localOffset The offset, if it is null, it is the center point.
     * @zh 应用作用力。
     * @param force 作用力。
     * @param localOffset 偏移,如果为null则为中心点
     */
    applyForce(force: Vector3, localOffset: Vector3 = null): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyForce)) {
            this._collider.addForce(force, PhysicsForceMode.Force, localOffset);
        }
    }

    /**
     * @en Applies a torque to the rigidbody.
     * @param torque The torque vector to apply.
     * @zh 对刚体应用扭转力。
     * @param torque 扭转力
     */
    applyTorque(torque: Vector3): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyTorque)) {
            this._collider.addTorque(torque, PhysicsForceMode.Force);
        }
    }

    /**
     * @en Applies an impulse to the rigidbody.
     * @param impulse The impulse vector to apply.
     * @param localOffset The offset at which the impulse is applied, relative to the rigidbody's center of mass. If null, the impulse is applied at the center.
     * @zh 对刚体应用冲量。
     * @param impulse 冲量。
     * @param localOffset 冲量相对于质心的偏移。如果为null，则冲量应用在质心处。
     */
    applyImpulse(impulse: Vector3, localOffset: Vector3 = null): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyImpulse)) {
            this._collider.addForce(impulse, PhysicsForceMode.Impulse, localOffset);
        }
    }

    /**
     * @en Applies a torque impulse (rotational impulse) to the rigidbody.
     * @param torqueImpulse The torque impulse vector to apply.
     * @zh 对刚体应用扭转冲量（旋转冲量）。
     * @param torqueImpulse 扭转冲量
     */
    applyTorqueImpulse(torqueImpulse: Vector3): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyTorqueImpulse)) {
            this._collider.addTorque(torqueImpulse, PhysicsForceMode.Impulse);
        }
    }

    /**
     * @en Wakes up the rigidbody.
     * @zh 唤醒刚体。
     */
    wakeUp(): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AllowSleep)) {
            this._collider.wakeUp();
        }
    }


    //-------------------deprecated-------------------

    /**
     * @deprecated
     * 刚体睡眠的线速度阈值。
     */
    get sleepLinearVelocity(): number {
        return this.sleepThreshold;
    }

    set sleepLinearVelocity(value: number) {
        this.sleepThreshold = value;
    }

    /**
     * @deprecated
     * 刚体睡眠的角速度阈值。
     */
    get sleepAngularVelocity(): number {
        return this.sleepThreshold;
    }

    set sleepAngularVelocity(value: number) {
        this.sleepThreshold = value;
    }

    /**
     * @deprecated
     * 应用作用力
     * @param fx x轴方向的力
     * @param fy y轴方向的力
     * @param fz z轴方向的力
     * @param localOffset 受力点距离质点的偏移
     */
    applyForceXYZ(fx: number, fy: number, fz: number, localOffset: Vector3 = null): void {
        _tempV0.set(fx, fy, fz);
        this.applyForce(_tempV0, localOffset);
    }

    /**
     * @internal
     */
    protected _setEventFilter() {
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_EventFilter)) {
            this._eventsArray = [];
            // event 
            if (this.trigger && this.owner.hasListener(Event.TRIGGER_ENTER)) {
                this._eventsArray.push(Event.TRIGGER_ENTER);
            }
            if (this.trigger && this.owner.hasListener(Event.TRIGGER_EXIT)) {
                this._eventsArray.push(Event.TRIGGER_EXIT);
            }
            if (this.trigger && this.owner.hasListener(Event.TRIGGER_STAY)) {
                this._eventsArray.push(Event.TRIGGER_STAY);
            }
            if (this.owner.hasListener(Event.COLLISION_ENTER)) {
                this._eventsArray.push(Event.COLLISION_ENTER);
            }
            if (this.owner.hasListener(Event.COLLISION_STAY)) {
                this._eventsArray.push(Event.COLLISION_STAY);
            }
            if (this.owner.hasListener(Event.COLLISION_EXIT)) {
                this._eventsArray.push(Event.COLLISION_EXIT);
            }
            this._collider.setEventFilter(this._eventsArray);
        }
    }

}

const _tempV0: Vector3 = new Vector3();