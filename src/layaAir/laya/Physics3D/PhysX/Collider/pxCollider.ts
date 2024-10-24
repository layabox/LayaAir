import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { PhysicsColliderComponent, PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Physics3DUtils } from "../../../d3/utils/Physics3DUtils";
import { Event } from "../../../events/Event";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NotImplementedError } from "../../../utils/Error";
import { ICollider } from "../../interface/ICollider";
import { pxColliderShape } from "../Shape/pxColliderShape";
import { partFlag, pxPhysicsManager } from "../pxPhysicsManager";
/**
 * @en Enumeration of collider types.
 * @zh 碰撞器类型枚举。
 */
export enum pxColliderType {
    RigidbodyCollider,
    CharactorCollider,
    StaticCollider
}

/**
 * @en PhysX actor flags.
 * @zh PhysX 执行器标志。
 */
export enum pxActorFlag {
    /**
     * @en Enable debug renderer for this actor.
     * @zh 为此执行器启用调试渲染器。
     */
    eVISUALIZATION = (1 << 0),
    /**
     * @en Disables scene gravity for this actor.
     * @zh 禁用此执行器的场景重力。
     */
    eDISABLE_GRAVITY = (1 << 1),
    /**
     * @en Enables the sending of PxSimulationEventCallback::onWake() and PxSimulationEventCallback::onSleep() notify events.
     * @zh 启用 PxSimulationEventCallback::onWake() 和 PxSimulationEventCallback::onSleep() 通知事件的发送。
     */
    eSEND_SLEEP_NOTIFIES = (1 << 2),
    /**
     * @en Disables simulation for the actor.
     * @zh 禁用执行器的模拟。
     */
    eDISABLE_SIMULATION = (1 << 3),
}
/**
 * @en The `pxCollider` class is used to handle physics colliders.
 * @zh `pxCollider` 类用于处理物理碰撞器。
 */
export class pxCollider implements ICollider {

    /**@internal pool of Actor */
    static _ActorPool: Map<number, pxCollider> = new Map();

    /**@internal UUid of pxActor */
    static _pxActorID: number = 0;

    /**temp tranform object */
    private static _tempTransform: {
        translation: Vector3;
        rotation: Quaternion;
    } = { translation: new Vector3(), rotation: new Quaternion() };

    /**@internal */
    owner: Sprite3D;

    /**@internal */
    componentEnable: boolean;

    /**@internal */
    component: PhysicsColliderComponent;

    /**actor */
    _pxActor: any;

    /**owner transform */
    _transform: Transform3D;

    /**type data */
    _type: pxColliderType = pxColliderType.StaticCollider;

    /**触发器 */
    _isTrigger: boolean;

    /**@internal */
    _isSimulate: boolean = false;//是否已经生效

    /**can collision Group*/
    _canCollisionWith: number;

    /**collision group */
    _collisionGroup: number;

    /**pxshape */
    _shape: pxColliderShape;

    /**manager */
    _physicsManager: pxPhysicsManager;

    /**check destroy */
    _destroyed: boolean = false;

    /**
     * @en The index of this collider in the physics update list. 
     * @zh 此碰撞器在物理更新列表中的索引。
     */
    inPhysicUpdateListIndex: number = -1;

    /**@internal */
    _enableProcessCollisions = false;

    /**id */
    _id: number;

    /** @internal */
    protected _transformFlag = 2147483647 /*int.MAX_VALUE*/;

    //material 这里material本身是shape行为，为了统一，暂时架构为colllider行为
    private _bounciness: number = 0.1;
    /** @internal */
    private _dynamicFriction: number = 0.1;
    /** @internal */
    private _staticFriction: number = 0.1;
    /** @internal */
    private _bounceCombine: PhysicsCombineMode = PhysicsCombineMode.Average;
    /** @internal */
    private _frictionCombine: PhysicsCombineMode = PhysicsCombineMode.Average;

    /**
     * @en Creates a instance of pxCollider.
     * @param manager The physics manager responsible for this collider.
     * @zh 创建一个 pxCollider 实例。
     * @param manager 负责管理此碰撞器的物理管理器。
     */
    constructor(manager: pxPhysicsManager) {
        this._collisionGroup = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
        this._canCollisionWith = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
        this._physicsManager = manager;
        this._id = pxCollider._pxActorID++;
    }
    /**
     * @en Indicates whether the collider is active.
     * @zh 表示碰撞器是否处于激活状态。
     */
    active: boolean;
    /**
     * @en Sets the friction value for the collider.
     * @param value The friction value to set.
     * @zh 设置碰撞器的摩擦力值。
     * @param value 要设置的摩擦力值。
     */
    setfriction?(value: number): void {
        throw new NotImplementedError();
    }
    /**
     * @en Sets the rolling friction value for the collider.
     * @param value The rolling friction value to set.
     * @zh 设置碰撞器的滚动摩擦力值。
     * @param value 要设置的滚动摩擦力值。
     */
    setRollingFriction?(value: number): void {
        throw new NotImplementedError();
    }

    protected setActorFlag(flag: pxActorFlag, value: boolean) {
        this._pxActor.setCustomFlag(flag, value);
    }

    /**
     * @en Gets the capability of the collider.
     * @param value The capability to check.
     * @zh 获取碰撞器的能力。
     * @param value 要检查的能力。
     */
    getCapable(value: number): boolean {
        return null;
    }

    /**
     * @en Sets the collider shape for this collider.
     * @param shape The collider shape to set.
     * @zh 为此碰撞器设置碰撞形状。
     * @param shape 要设置的碰撞形状。
     */
    setColliderShape(shape: pxColliderShape): void {
        if (shape == this._shape)
            return;
        var lastColliderShape: pxColliderShape = this._shape;
        this._shape = shape;
        //shape._pxCollider = this;
        if (shape) {
            if (this._pxActor) {
                if (lastColliderShape)
                    lastColliderShape.removeFromActor(this);
                this._shape.addToActor(this);
                this._initColliderShapeByCollider();
                if (!lastColliderShape && this.componentEnable) {
                    this._physicsManager.addCollider(this);
                }
            }
        } else {
            if (this._isSimulate) {
                this._physicsManager.removeCollider(this);
            }
        }
        lastColliderShape && lastColliderShape.destroy();
    }

    protected _initColliderShapeByCollider() {
        this.setBounceCombine(this._bounceCombine);
        this.setFrictionCombine(this._frictionCombine);
        this.setStaticFriction(this._staticFriction);
        this.setBounciness(this._bounciness);
        this.setDynamicFriction(this._dynamicFriction);
        this.setCollisionGroup(this._collisionGroup);
        this.setCanCollideWith(this._canCollisionWith);
    }

    /**
     * @en Destroys the collider and releases its resources.
     * @zh 销毁碰撞器并释放其资源。
     */
    destroy(): void {
        this._pxActor.release();
        this._destroyed = true;
    }
    /**
     * @en Sets the collision group for this collider.
     * @param value The collision group value.
     * @zh 设置此碰撞器的碰撞组。
     * @param value 碰撞组值。
     */
    setCollisionGroup(value: number): void {
        this._collisionGroup = value;
        this._shape.setSimulationFilterData(this._collisionGroup, this._canCollisionWith);
    }
    /**
     * @en Sets which groups this collider can collide with.
     * @param value The collision mask value.
     * @zh 设置此碰撞器可以与哪些组碰撞。
     * @param value 碰撞掩码值。
     */
    setCanCollideWith(value: number): void {
        this._canCollisionWith = value;
        this._shape.setSimulationFilterData(this._collisionGroup, this._canCollisionWith);
    }
    /**
     * @en Sets the event filter for the collider.
     * @param events An array of events to filter.
     * @zh 设置碰撞器的事件过滤器。
     * @param events 要过滤的事件数组。
     */
    setEventFilter(events: []): void {
        if (!this._shape) return;
        let flag = partFlag.eCONTACT_DEFAULT | partFlag.eTRIGGER_DEFAULT;
        for (let i = 0, j = events.length; i < j; i++) {
            let value = events[i];
            if (value == Event.TRIGGER_ENTER) {
                flag = flag | partFlag.eTRIGGER_DEFAULT | partFlag.eNOTIFY_TOUCH_FOUND;
            }
            if (value == Event.TRIGGER_STAY) {
                // flag = partFlag.eNOTIFY_TOUCH_PERSISTS;
            }
            if (value == Event.TRIGGER_EXIT) {
                flag = flag | partFlag.eTRIGGER_DEFAULT | partFlag.eNOTIFY_TOUCH_LOST;
            }
            if (value == Event.COLLISION_ENTER) {
                flag = flag | partFlag.eNOTIFY_TOUCH_PERSISTS | partFlag.eNOTIFY_CONTACT_POINTS;
            }
            if (value == Event.COLLISION_STAY) {
                flag = flag | partFlag.eNOTIFY_TOUCH_PERSISTS;
            }
            if (value == Event.COLLISION_EXIT) {
                flag = flag | partFlag.eNOTIFY_TOUCH_PERSISTS | partFlag.eNOTIFY_TOUCH_LOST;
            }
        }

        this._shape && this._shape.setEventFilterData(flag);
    }
    /**
     * @en Sets the owner node for this collider.
     * @param node The Sprite3D node that owns this collider.
     * @zh 设置此碰撞器的所有者节点。
     * @param node 拥有此碰撞器的 Sprite3D 节点。
     */
    setOwner(node: Sprite3D): void {
        this.owner = node;
        this._transform = node.transform;
        this._initCollider();
        pxCollider._ActorPool.set(this._id, this);
        this._pxActor.setUUID(this._id);
        this.setActorFlag(pxActorFlag.eSEND_SLEEP_NOTIFIES, true);
    }

    protected _initCollider() {
        //override it
    }
    /**
     * @en Notifies that the transform has changed.
     * @param flag The transform change flag.
     * @zh 通知变换已更改。
     * @param flag 变换更改标志。
     */
    transformChanged(flag: number): void {
        this._transformFlag = flag;
        if (this.inPhysicUpdateListIndex == -1 && !this._enableProcessCollisions) {
            this._physicsManager._physicsUpdateList.add(this);
        }
    }

    /**
     * {@inheritDoc ICollider.setWorldTransform }
     * @en Sets the world transform of the collider.
     * @param focus Whether to force update even if no change is detected.
     * @zh 设置碰撞器的世界变换。
     * @param focus 是否强制更新，即使未检测到变化。
     */
    setWorldTransform(focus: boolean): void {
        if (this.owner) {
            if (focus || this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
                this._pxActor.setGlobalPose(this._transformTo(this.owner.transform.position, this.owner.transform.rotation), true);
                this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
                this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
            }
            if (focus || this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE) && this._shape) {
                this._shape && this._shape.setOffset(this._shape._offset);
                this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
            }
        }
    }

    /**
     * @en Sets the bounciness (restitution) of the collider.
     * @param value The bounciness value.
     * @zh 设置碰撞器的弹性（恢复）。
     * @param value 弹性值。
     */
    setBounciness(value: number): void {
        this._bounciness = value;
        this._shape && this._shape._pxMaterials[0].setBounciness(value);
    }

    /**
     * @en Sets the dynamic friction of the collider.
     * @param value The dynamic friction value.
     * @zh 设置碰撞器的动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction(value: number): void {
        this._dynamicFriction = value;
        this._shape && this._shape._pxMaterials[0].setDynamicFriction(value);
    }

    /**
     * @en Sets the static friction of the collider.
     * @param value The static friction value.
     * @zh 设置碰撞器的静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction(value: number): void {
        this._staticFriction = value;
        this._shape && this._shape._pxMaterials[0].setStaticFriction(value);
    }

    /**
     * @en Sets the friction combine mode of the collider.
     * @param value The friction combine mode.
     * @zh 设置碰撞器的摩擦力合并模式。
     * @param value 摩擦力合并模式。
     */
    setFrictionCombine(value: PhysicsCombineMode): void {
        this._frictionCombine = value;
        this._shape && this._shape._pxMaterials[0].setFrictionCombine(value);
    }

    /**
     * @en Sets the bounce combine mode of the collider.
     * @param value The bounce combine mode.
     * @zh 设置碰撞器的弹性合并模式。
     * @param value 弹性合并模式。
     */
    setBounceCombine(value: PhysicsCombineMode): void {
        this._bounceCombine = value;
        this._shape && this._shape._pxMaterials[0].setBounceCombine(value);
    }


    /**
   * @internal
   */
    _getTransformFlag(type: number): boolean {
        return (this._transformFlag & type) != 0;
    }

    /**
     * @internal
     */
    _setTransformFlag(type: number, value: boolean): void {
        if (value)
            this._transformFlag |= type;
        else
            this._transformFlag &= ~type;
    }

    /**
     * @internal
     */
    _transformTo(pos: Vector3, rot: Quaternion): { translation: Vector3; rotation: Quaternion } {
        const transform = pxCollider._tempTransform;
        pos.cloneTo(transform.translation);
        rot.normalize(transform.rotation);
        return transform;
    }

}