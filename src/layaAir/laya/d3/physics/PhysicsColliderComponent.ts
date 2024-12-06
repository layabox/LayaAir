import { ICollider } from "../../Physics3D/interface/ICollider";
import { Component } from "../../components/Component";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { Event } from "../../events/Event";
import { Scene3D } from "../core/scene/Scene3D";
import { IPhysicsManager } from "../../Physics3D/interface/IPhysicsManager";
import { Physics3DColliderShape } from "./shape/Physics3DColliderShape";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { Node } from "../../display/Node";

/**
 * @en Describes how the physics materials of colliding objects are combined.
 * @zh 描述碰撞对象的物理材料是如何组合的。
 */
export enum PhysicsCombineMode {
    /**
     * @en Averages the friction/bounce of the two colliding materials.
     * @zh 平均值，对两个碰撞材料的摩擦力/反弹力取平均值。
     */
    Average,
    /**
     * @en Uses the smaller friction/bounce of the two colliding materials.
     * @zh 最小值，使用两个碰撞材料中较小的摩擦力/反弹力。
     */
    Minimum,
    /**
     * @en Multiplies the friction/bounce of the two colliding materials.
     * @zh 乘积，将两个碰撞材料的摩擦力/反弹力相乘，得到最终的摩擦系数。
     */
    Multiply,
    /**
     * @en Uses the larger friction/bounce of the two colliding materials.
     * @zh 最大值，使用两个碰撞材料中较大的摩擦力/反弹力。
     */
    Maximum
}
/**
 * @en Describes the mode of applying physics forces.
 * @zh 描述应用物理力的模式。
 */
export enum PhysicsForceMode {
    /**
     * @en Applies a continuous force to the object.
     * @zh 对物体施加持续的力。
     */
    Force,
    /**
     * @en Applies an instantaneous velocity change to the object, equivalent to an impulse.
     * @zh 对物体施加瞬时速度变化，相当于冲量。
     */
    Impulse
}
/**
 * @en PhysicsColliderComponent is the base class for creating physics components.
 * @zh PhysicsColliderComponent 类用于创建物理组件的父类。
 */
export class PhysicsColliderComponent extends Component {

    /** @internal */
    protected _restitution = 0.0;
    /** @internal */
    protected _friction = 0.5;
    /** @internal */
    protected _rollingFriction = 0.0;
    /**@internal */
    protected _dynamicFriction = 0.0;
    /**@internal */
    protected _staticFriction = 0.0;
    /**@internal */
    protected _frictionCombine = 0.0;
    /**@internal */
    protected _restitutionCombine = 0.0;
    /** @internal */
    protected _collisionGroup: number = 0x1;
    /** @internal */
    protected _canCollideWith: number = -1;
    /** @internal */
    protected _colliderShape: Physics3DColliderShape = null;
    /** @internal */
    protected _transformFlag = 2147483647 /*int.MAX_VALUE*/;
    /** @internal 是否只接受物理引擎的模拟变化 Rigidbody为true*/
    protected _controlBySimulation: boolean = false;
    /**@internal */
    protected _physicsManager: IPhysicsManager;
    /**@internal */
    protected _collider: ICollider;
    /**@internal */
    protected _eventsArray: string[];

    /**
     * @en The collider object.
     * @zh 碰撞器对象。
     */
    get collider(): ICollider {
        return this._collider;
    }

    /**
     * @en The restitution of the collider (also known as bounciness).
     * @zh 碰撞器的弹力（也叫Bounciness）。
     */
    get restitution(): number {
        return this._restitution;
    }

    set restitution(value: number) {
        this._restitution = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_Restitution)) {
            this._collider.setBounciness(value);
        }
    }

    /**
     * @en The friction of the collider.
     * @zh 碰撞器的摩擦力。
     */
    get friction(): number {
        return this._friction;
    }

    set friction(value: number) {
        this._friction = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_Friction)) {
            this._collider.setfriction(value);
        }
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_StaticFriction)) {
            this._collider.setStaticFriction(value);
        }
    }

    /**
     * @en The rolling friction of the collider.
     * @zh 碰撞器的滚动摩擦力。
     */
    get rollingFriction(): number {
        return this._rollingFriction;
    }

    set rollingFriction(value: number) {
        this._rollingFriction = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_RollingFriction)) {
            this._collider.setRollingFriction(value);
        }
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_DynamicFriction)) {
            this._collider.setDynamicFriction(value);
        }
    }

    /**
     * @en The dynamic friction of the collider.
     * @zh 碰撞器的动态摩擦力。
     */
    get dynamicFriction(): number {
        return this._dynamicFriction;
    }

    set dynamicFriction(value: number) {
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_DynamicFriction)) {
            this._collider.setDynamicFriction(value);
        }
    }

    /**
     * @en The static friction of the collider.
     * @zh 碰撞器的静态摩擦力。
     */
    get staticFriction(): number {
        return this._staticFriction;
    }

    set staticFriction(value: number) {
        this._staticFriction = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_StaticFriction)) {
            this._collider.setStaticFriction(value);
        }
    }

    /**
     * @en Friction combination mode, used to define how the friction coefficients of two objects are combined during a collision to determine the final friction force.
     * The values include:
     * - Average: The friction coefficients of the two objects are averaged.
     * - Minimum: The minimum friction coefficient of the two objects is used.
     * - Maximum: The maximum friction coefficient of the two objects is used.
     * - Multiply: The friction coefficients of the two objects are multiplied to get the final friction coefficient.
     * @zh 摩擦力组合模式，用于定义在两个物体发生碰撞时，如何组合它们的摩擦系数，以确定最终的摩擦力。
     * 值包括：
     * - Average（平均值）：两个物体的摩擦系数取平均值。
     * - Minimum（最小值）：使用两个物体摩擦系数中的最小值。
     * - Maximum（最大值）：使用两个物体摩擦系数中的最大值。
     * - Multiply（乘积）：将两个物体的摩擦系数相乘，得到最终的摩擦系数。
     */
    get frictionCombine() {
        return this._frictionCombine;
    }

    set frictionCombine(value: PhysicsCombineMode) {
        this._frictionCombine = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_FrictionCombine)) {
            this._collider.setFrictionCombine(value);
        }
    }

    /**
     * @en The restitution mode of the collider.
     * The values include:
     * - Average: The friction coefficients of the two objects are averaged.
     * - Minimum: The minimum friction coefficient of the two objects is used.
     * - Maximum: The maximum friction coefficient of the two objects is used.
     * - Multiply: The friction coefficients of the two objects are multiplied to get the final friction coefficient.
     * @zh 弹力组合模式，用于定义在两个物体发生碰撞时，如何组合它们的弹力系数，以确定最终的弹力。
     * 值为：
     * - Average（平均值）：两个物体的摩擦系数取平均值。
     * - Minimum（最小值）：使用两个物体摩擦系数中的最小值。
     * - Maximum（最大值）：使用两个物体摩擦系数中的最大值。
     * - Multiply（乘积）：将两个物体的摩擦系数相乘，得到最终的摩擦系数。
     */
    get restitutionCombine() {
        return this._restitutionCombine;
    }

    set restitutionCombine(value: PhysicsCombineMode) {
        this._restitutionCombine = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_BounceCombine)) {
            this._collider.setBounceCombine(value);
        }
    }

    /**
     * @en The collider shape of the physics collider.
     * @zh 物理碰撞器的碰撞形状。
     */
    get colliderShape(): Physics3DColliderShape {
        return this._colliderShape;
    }

    set colliderShape(value: Physics3DColliderShape) {
        if (value == this._colliderShape) {
            return;
        }
        this._colliderShape && this._colliderShape.destroy();
        this._colliderShape = value;
        if (this._collider && value) {
            this._collider.setColliderShape(value._shape);
        }
    }

    /**
     * @en The collision group this collider belongs to.
     * @zh 此碰撞器所属的碰撞组。
     */
    get collisionGroup(): number {
        return this._collisionGroup;
    }

    set collisionGroup(value: number) {
        if (this._collisionGroup !== value) {
            this._collisionGroup = value;
        }

        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_CollisionGroup)) {
            if (this._colliderShape && this._enabled) {
                this._collider.setCollisionGroup(value);
            }
        }
    }

    /**
     * @en The collision groups this collider can collide with, based on bitwise operations.
     * @zh 此碰撞器可以与之碰撞的碰撞组，基于位运算。
     */
    get canCollideWith(): number {
        return this._canCollideWith;
    }

    set canCollideWith(value: number) {
        if (this._canCollideWith !== value) {
            this._canCollideWith = value;
        }

        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_CollisionGroup)) {
            if (this._colliderShape && this._enabled) {
                this._collider.setCanCollideWith(value);
            }
        }
    }
    /** @ignore */
    constructor() {
        super();

    }

    /**
     * @internal
     * @en Initializes the collider and configures its properties.
     * @zh 初始化碰撞器并配置其属性。
     */
    initCollider() {
        this._initCollider();
        this._collider.setOwner(this.owner);
        this._physicsManager.setActiveCollider(this.collider, this.enabled);
        if (this._colliderShape) this._collider.setColliderShape(this._colliderShape._shape);
        this.collisionGroup = this._collisionGroup;
        this.canCollideWith = this._canCollideWith;
    }

    /**
     * @internal
     * @protected
     */
    protected _initCollider() {
        //createCollider
        //Override it
    }

    /**
     * @internal
     */
    protected _setEventFilter() {
        // override it
    }

    /**
     * @internal
     * @protected
     */
    protected _onAdded(): void {
        if (!this.owner.scene) {
            this.owner.on(Node.EVENT_SET_ACTIVESCENE, this, this._onAdded);
        } else {
            this.initCollider();
            this.owner.off(Node.EVENT_SET_ACTIVESCENE, this, this._onAdded);
        }
        this.owner.off(Event._Add_Script, this, this._setEventFilter);
        this.owner.on(Event._Add_Script, this, this._setEventFilter);
        this.restitution = this._restitution;
        this.friction = this._friction;
        this.rollingFriction = this._rollingFriction;
    }

    /**
     * @internal
     * @protected
     */
    protected _onEnable(): void {
        (<Sprite3D>this.owner).transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        //ILaya3D.Physics3D._bullet.btCollisionObject_setContactProcessingThreshold(this._btColliderObject, 0);
        this._collider && (this._collider.componentEnable = true);
        if (this._colliderShape) {
            this._physicsManager.setActiveCollider(this.collider, true);
            this._physicsManager.addCollider(this._collider);
        }
    }

    /**
     * @internal
     * @protected
     */
    protected _onDisable(): void {
        (<Sprite3D>this.owner).transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        this._collider && (this._collider.componentEnable = false);
        if (this._colliderShape) {
            this._physicsManager.removeCollider(this._collider);
            this._physicsManager.setActiveCollider(this.collider, false);
        }
        this._physicsManager = null;
    }

    /**
     * @internal
     * @protected
     */
    protected _onDestroy() {
        this._collider.destroy();
        this._colliderShape && this._colliderShape.destroy();
        this._collider = null;
        this._colliderShape = null;
        this._physicsManager = null;
    }
    /**
     * @internal
     */
    _onTransformChanged(flag: number): void {
        if (!this._controlBySimulation) {//不受物理引擎控制的碰撞体
            flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;//过滤有用TRANSFORM标记
            if (flag && this._colliderShape && this._enabled) {
                this._transformFlag |= flag;
                //         if (this._isValid() && this._inPhysicUpdateListIndex === -1)//_isValid()表示可使用
                //this._simulation._physicsUpdateList.add(this);
                this._collider.transformChanged(flag);
            }
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: PhysicsColliderComponent): void {
        dest.restitution = this._restitution;
        dest.friction = this._friction;
        dest.rollingFriction = this._rollingFriction;

        dest.dynamicFriction = this.dynamicFriction;
        dest.staticFriction = this.staticFriction;
        dest.frictionCombine = this.frictionCombine;
        dest.restitutionCombine = this.restitutionCombine;

        dest.collisionGroup = this._collisionGroup;
        dest.canCollideWith = this._canCollideWith;
        (this._colliderShape) && (dest.colliderShape = this._colliderShape.clone());
    }
}

