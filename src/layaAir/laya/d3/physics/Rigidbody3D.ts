import { Component } from "../../components/Component";
import { Vector3 } from "../../maths/Vector3";
import { PhysicsColliderComponent, PhysicsForceMode } from "./PhysicsColliderComponent";
import { Laya3D } from "../../../Laya3D";
import { IDynamicCollider } from "../../Physics3D/interface/IDynamicCollider";
import { Scene3D } from "../core/scene/Scene3D";
import { Utils3D } from "../utils/Utils3D";
import { Quaternion } from "../../maths/Quaternion";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { Event } from "../../events/Event";
import { Stat } from "../../utils/Stat";

/**
 * <code>Rigidbody3D</code> 类用于创建刚体碰撞器。
 */
export class Rigidbody3D extends PhysicsColliderComponent {
    /**@internal */
    protected _collider: IDynamicCollider;
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

    /**
     * @override
     * @internal
     */
    protected _initCollider() {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && this._physicsManager && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_DynamicCollider)) {
            this._collider = Laya3D.PhysicsCreateUtil.createDynamicCollider(this._physicsManager);
        } else {
            console.error("Rigidbody3D: cant enable Rigidbody3D");
        }
    }

    /**
     * 质量。
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
     * 是否为运动物体，如果为true仅可通过transform属性移动物体,而非其他力相关属性。
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
     * 刚体的线阻力。
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
     * 刚体的角阻力。
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
     * 重力。
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
     * 每个轴的线性运动缩放因子,如果某一轴的值为0表示冻结在该轴的线性运动。
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
     * 线速度
     */
    get linearVelocity(): Vector3 {
        return this._linearVelocity;
    }

    set linearVelocity(value: Vector3) {
        this._linearVelocity = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_LinearVelocity)) {
            this._collider.setLinearVelocity(value);
        }
    }

    /**
     * 每个轴的角度运动缩放因子,如果某一轴的值为0表示冻结在该轴的角度运动。
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
     * 角速度。
     */
    get angularVelocity(): Vector3 {
        return this._angularVelocity;
    }

    set angularVelocity(value: Vector3) {
        this._angularVelocity = value;
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_AngularVelocity)) {
            this._collider.setAngularVelocity(value);
        }
    }

    /**
     * 刚体睡眠的线速度阈值。
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
     * 直接设置物理位置
     */
    set position(pos: Vector3) {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_WorldPosition)) {
            this._collider.setWorldPosition(pos)
        }
    }

    /**
     * 直接设置物理旋转
     */
    set orientation(q: Quaternion) {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_WorldOrientation)) {
            this._collider.setWorldRotation(q);
        }
    }

    /**
     * 是否触发器
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
     * 碰撞检测模式
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

    constructor() {
        super();
    }

    /**
     * @internal
     * @protected
     */
    protected _onAdded(): void {
        super._onAdded();
        this.mass = this._mass;
        this.linearFactor = this._linearFactor;
        this.angularFactor = this._angularFactor;
        this.linearDamping = this._linearDamping;
        this.angularDamping = this._angularDamping;
        this.gravity = this._gravity;
        this.isKinematic = this._isKinematic;
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        super._onDestroy();
        this._btLayaMotionState = null;
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
    _cloneTo(dest: Component): void {
        super._cloneTo(dest);
        var destRigidbody3D: Rigidbody3D = (<Rigidbody3D>dest);
        destRigidbody3D.isKinematic = this._isKinematic;
        destRigidbody3D.mass = this._mass;
        destRigidbody3D.gravity = this._gravity;
        destRigidbody3D.angularDamping = this._angularDamping;
        destRigidbody3D.linearDamping = this._linearDamping;
        destRigidbody3D.linearVelocity = this._linearVelocity;
        destRigidbody3D.angularVelocity = this._angularVelocity;
        destRigidbody3D.linearFactor = this._linearFactor;
        destRigidbody3D.angularFactor = this._angularFactor;
    }

    /**
     * 应用作用力。
     * @param	force 作用力。
     * @param	localOffset 偏移,如果为null则为中心点
     */
    applyForce(force: Vector3, localOffset: Vector3 = null): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyForce)) {
            this._collider.addForce(force, PhysicsForceMode.Force, localOffset);
        }
    }

    /**
     * 应用扭转力。
     * @param	torque 扭转力。
     */
    applyTorque(torque: Vector3): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyTorque)) {
            this._collider.addTorque(torque, PhysicsForceMode.Force);
        }
    }

    /**
     * 应用冲量。
     * @param	impulse 冲量。
     * @param   localOffset 偏移,如果为null则为中心点。
     */
    applyImpulse(impulse: Vector3, localOffset: Vector3 = null): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyImpulse)) {
            this._collider.addForce(impulse, PhysicsForceMode.Impulse, localOffset);
        }
    }

    /**
     * 应用扭转冲量。
     * @param	torqueImpulse
     */
    applyTorqueImpulse(torqueImpulse: Vector3): void {
        if (this._collider && this.collider.getCapable(EColliderCapable.RigidBody_ApplyTorqueImpulse)) {
            this._collider.addTorque(torqueImpulse, PhysicsForceMode.Impulse);
        }
    }

    /**
     * 唤醒刚体。
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
     * @param fx 
     * @param fy 
     * @param fz 
     * @param localOffset 
     */
    applyForceXYZ(fx: number, fy: number, fz: number, localOffset: Vector3 = null): void {
        Utils3D._tempV0.set(fx, fy, fz);
        this.applyForce(Utils3D._tempV0, localOffset);
    }


    /**
     * @deprecated
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any): void {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.mass != null) && (this.mass = data.mass);
        (data.linearDamping != null) && (this.linearDamping = data.linearDamping);
        (data.angularDamping != null) && (this.angularDamping = data.angularDamping);

        if (data.linearFactor != null) {
            var linFac = this.linearFactor;
            linFac.fromArray(data.linearFactor);
            this.linearFactor = linFac;
        }
        if (data.angularFactor != null) {
            var angFac = this.angularFactor;
            angFac.fromArray(data.angularFactor);
            this.angularFactor = angFac;
        }

        if (data.gravity) {
            this.gravity.fromArray(data.gravity);
            this.gravity = this.gravity;
        }
        super._parse(data);
        this._parseShape(data.shapes);
        (data.isKinematic != null) && (this.isKinematic = data.isKinematic);
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


