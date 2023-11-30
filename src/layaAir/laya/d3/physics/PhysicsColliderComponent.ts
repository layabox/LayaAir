import { ICollider } from "../../Physics3D/interface/ICollider";
import { Component } from "../../components/Component";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { BoxColliderShape } from "./shape/BoxColliderShape";
import { Event } from "../../events/Event";
import { Scene3D } from "../core/scene/Scene3D";
import { IPhysicsManager } from "../../Physics3D/interface/IPhysicsManager";
import { Physics3DColliderShape } from "./shape/Physics3DColliderShape";
import { SphereColliderShape } from "./shape/SphereColliderShape";
import { CapsuleColliderShape } from "./shape/CapsuleColliderShape";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { Node } from "../../display/Node";
import { MeshColliderShape } from "./shape/MeshColliderShape";
import { ConeColliderShape } from "./shape/ConeColliderShape";
import { CylinderColliderShape } from "./shape/CylinderColliderShape";

/**
 * Describes how physics materials of the colliding objects are combined.
 */
export enum PhysicsCombineMode {
    /** Averages the friction/bounce of the two colliding materials. */
    Average,
    /** Uses the smaller friction/bounce of the two colliding materials. */
    Minimum,
    /** Multiplies the friction/bounce of the two colliding materials. */
    Multiply,
    /** Uses the larger friction/bounce of the two colliding materials. */
    Maximum
}

export enum PhysicsForceMode {
    Force,
    Impulse
}
/**
 * <code>PhysicsColliderComponent</code> 类用于创建物理组件的父类。
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
    protected _ccdMotionThreshold = 0.0;
    /** @internal */
    protected _ccdSweptSphereRadius = 0.0;
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

    get collider(): ICollider {
        return this._collider;
    }

    /**
     * 弹力。也叫Bounciness
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
     * 摩擦力。
     */
    get friction(): number {
        return this._friction;
    }

    set friction(value: number) {
        this._friction = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_Friction)) {
            this._collider.setfriction(value);
        }
        //this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setFriction(this._btColliderObject, value);
    }

    /**
     * 滚动摩擦力。
     */
    get rollingFriction(): number {
        return this._rollingFriction;
    }

    set rollingFriction(value: number) {
        this._rollingFriction = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_RollingFriction)) {
            this._collider.setRollingFriction(value);
        }
    }

    /**
     * 动态摩擦力
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
     * 静态摩擦力
     */
    get staticFriction(): number {
        return this._staticFriction;
    }

    set staticFriction(value: number) {
        this._staticFriction = value
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_StaticFriction)) {
            this._collider.setStaticFriction(value);
        }
    }

    /**
     * 摩擦力模式
     */
    set frictionCombine(value: PhysicsCombineMode) {
        this._frictionCombine = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_FrictionCombine)) {
            this._collider.setFrictionCombine(value);
        }
    }

    get frictionCombine() {
        return this._frictionCombine;
    }

    /**
     * 弹力模式
     */
    set restitutionCombine(value: PhysicsCombineMode) {
        this._restitutionCombine = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_BounceCombine)) {
            this._collider.setBounceCombine(value);
        }
    }

    get restitutionCombine() {
        return this._restitutionCombine;
    }



    /**
     * 用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
     */
    get ccdMotionThreshold(): number {
        return this._ccdMotionThreshold;
    }

    set ccdMotionThreshold(value: number) {
        //TODO:
        // this._ccdMotionThreshold = value;
        // this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setCcdMotionThreshold(this._btColliderObject, value);
    }

    /**
     * 获取用于进入连续碰撞检测(CCD)范围的球半径。
     */
    get ccdSweptSphereRadius(): number {
        return this._ccdSweptSphereRadius;
    }

    set ccdSweptSphereRadius(value: number) {
        //TODO:
        // this._ccdSweptSphereRadius = value;
        // this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setCcdSweptSphereRadius(this._btColliderObject, value);
    }

    /**
     * 碰撞形状。
     */
    get colliderShape(): Physics3DColliderShape {
        return this._colliderShape;
    }

    set colliderShape(value: Physics3DColliderShape) {
        if (!value || value == this._colliderShape) {
            return;
        }
        this._colliderShape && this._colliderShape.destroy();
        this._colliderShape = value;
        if (this._collider) {
            this._collider.setColliderShape(value._shape);
        }
    }

    /**
     * 所属碰撞组。
     */
    get collisionGroup(): number {
        return this._collisionGroup;
    }

    set collisionGroup(value: number) {
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_CollisionGroup)) {
            if (this._collisionGroup !== value) {
                this._collisionGroup = value;
                if (this._colliderShape && this._enabled) {
                    this._collider.setCollisionGroup(value);
                }
            }
        }
    }

    /**
     * 可碰撞的碰撞组,基于位运算。
     */
    get canCollideWith(): number {
        return this._canCollideWith;
    }

    set canCollideWith(value: number) {
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_CollisionGroup)) {
            if (this._canCollideWith !== value) {
                this._canCollideWith = value;
                if (this._colliderShape && this._enabled) {
                    this._collider.setCanCollideWith(value);
                }
            }
        }
    }

    constructor() {
        super();

    }

    /**
     * @internal
     */
    protected _parseShape(shapesData: any[]): void {
        var shapeCount = shapesData.length;
        if (shapeCount === 1) {
            var shape: Physics3DColliderShape = PhysicsColliderComponent._creatShape(shapesData[0]);
            this.colliderShape = shape;
        } else {
            // var compoundShape: CompoundColliderShape = new CompoundColliderShape();
            // for (var i = 0; i < shapeCount; i++) {
            //     shape = PhysicsColliderComponent._creatShape(shapesData[i]);
            //     compoundShape.addChildShape(shape);
            // }
            // this.colliderShape = compoundShape;
        }
    }

    initCollider() {
        this._initCollider();
        this._collider.setOwner(this.owner);
        if (this._colliderShape) this._collider.setColliderShape(this._colliderShape._shape);
        // this.restitution = this._restitution;
        // this.friction = this._friction;
        // this.rollingFriction = this._rollingFriction;
        this.ccdMotionThreshold = this._ccdMotionThreshold;
        this.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
        this.collisionGroup = this._collisionGroup;
        this.canCollideWith = this._canCollideWith;
    }

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

    protected _onAdded(): void {
        if (!this.owner.scene) {
            this.owner.on(Node.EVENT_SET_ACTIVESCENE, this, this._onAdded);
        } else {
            this.initCollider();
            this.owner.off(Node.EVENT_SET_ACTIVESCENE, this, this._onAdded);
        }
        this.owner.off(Event._Add_Script, this, this._setEventFilter);
        this.owner.on(Event._Add_Script, this, this._setEventFilter);
    }

    protected _onEnable(): void {
        (<Sprite3D>this.owner).transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        //ILaya3D.Physics3D._bullet.btCollisionObject_setContactProcessingThreshold(this._btColliderObject, 0);
        this._collider && (this._collider.componentEnable = true);
        if (this._colliderShape) {
            this._physicsManager.addCollider(this._collider);
        }
    }

    protected _onDisable(): void {
        (<Sprite3D>this.owner).transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        this._collider && (this._collider.componentEnable = false);
        if (this._colliderShape) {
            this._physicsManager.removeCollider(this._collider);
        }
        this._physicsManager = null;
    }

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
    _cloneTo(dest: Component): void {
        var destPhysicsComponent: PhysicsColliderComponent = <PhysicsColliderComponent>dest;
        destPhysicsComponent.restitution = this._restitution;
        destPhysicsComponent.friction = this._friction;
        destPhysicsComponent.rollingFriction = this._rollingFriction;
        destPhysicsComponent.ccdMotionThreshold = this._ccdMotionThreshold;
        destPhysicsComponent.ccdSweptSphereRadius = this._ccdSweptSphereRadius;

        destPhysicsComponent.dynamicFriction = this.dynamicFriction;
        destPhysicsComponent.staticFriction = this.staticFriction;
        destPhysicsComponent.frictionCombine = this.frictionCombine;
        destPhysicsComponent.restitutionCombine = this.restitutionCombine;

        destPhysicsComponent.collisionGroup = this._collisionGroup;
        destPhysicsComponent.canCollideWith = this._canCollideWith;
        (this._colliderShape) && (destPhysicsComponent.colliderShape = this._colliderShape.clone());
    }

    //-------------------deprecated-------------------
    /**
     * @deprecated
     * @internal
     */
    static _creatShape(shapeData: any): Physics3DColliderShape {
        var colliderShape: Physics3DColliderShape;
        switch (shapeData.type) {
            case "BoxColliderShape":
                var sizeData: any[] = shapeData.size;
                colliderShape = sizeData ? new BoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new BoxColliderShape();
                break;
            case "SphereColliderShape":
                colliderShape = new SphereColliderShape(shapeData.radius);
                break;
            case "CapsuleColliderShape":
                colliderShape = new CapsuleColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
                break;
            case "MeshColliderShape":
                colliderShape = new MeshColliderShape();
                break;
            case "ConeColliderShape":
                colliderShape = new ConeColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
                break;
            case "CylinderColliderShape":
                colliderShape = new CylinderColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
                break;
            default:
                console.error("unknown shape type.");
        }
        return null;//TODO
    }


    /**
     * @deprecated
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any): void {
        (data.collisionGroup != null) && (this._collider.setCollisionGroup(data.collisionGroup));
        (data.canCollideWith != null) && (this._collider.setCanCollideWith(data.canCollideWith));
        (data.ccdMotionThreshold != null) && (this.ccdMotionThreshold = data.ccdMotionThreshold);
        (data.ccdSweptSphereRadius != null) && (this.ccdSweptSphereRadius = data.ccdSweptSphereRadius);
    }

}

