import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Physics3DUtils } from "../../../d3/utils/Physics3DUtils";
import { Event } from "../../../events/Event";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../../interface/ICollider";
import { pxColliderShape } from "../Shape/pxColliderShape";
import { partFlag, pxPhysicsManager } from "../pxPhysicsManager";
/**
 * collider type
 */
export enum pxColliderType {
    RigidbodyCollider,
    CharactorCollider,
    StaticCollider
}

/**
 *physX actor flag
 */
export enum pxActorFlag {
    eVISUALIZATION = (1 << 0),//Enable debug renderer for this actor
    eDISABLE_GRAVITY = (1 << 1),//Disables scene gravity for this actor
    eSEND_SLEEP_NOTIFIES = (1 << 2),//Enables the sending of PxSimulationEventCallback::onWake() and PxSimulationEventCallback::onSleep() notify events
    eDISABLE_SIMULATION = (1 << 3),//Disables simulation for the actor
}
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

    //update list index
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

    constructor(manager: pxPhysicsManager) {
        this._collisionGroup = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
        this._canCollisionWith = Physics3DUtils.PHYSXDEFAULTMASKVALUE;
        this._physicsManager = manager;
        this._id = pxCollider._pxActorID++;
    }

    protected setActorFlag(flag: pxActorFlag, value: boolean) {
        this._pxActor.setCustomFlag(flag, value);
    }

    getCapable(value: number): boolean {
        return null;
    }

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

    destroy(): void {
        this._pxActor.release();
        this._destroyed = true;
    }
    setCollisionGroup(value: number): void {
        this._collisionGroup = value;
        this._shape.setSimulationFilterData(this._collisionGroup, this._canCollisionWith);
    }
    setCanCollideWith(value: number): void {
        this._canCollisionWith = value;
        this._shape.setSimulationFilterData(this._collisionGroup, this._canCollisionWith);
    }

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

    transformChanged(flag: number): void {
        this._transformFlag = flag;
        if (this.inPhysicUpdateListIndex == -1 && !this._enableProcessCollisions) {
            this._physicsManager._physicsUpdateList.add(this);
        }
    }

    /**
     * {@inheritDoc ICollider.setWorldTransform }
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

    setBounciness(value: number): void {
        this._bounciness = value;
        this._shape && this._shape._pxMaterials[0].setBounciness(value);
    }

    setDynamicFriction(value: number): void {
        this._dynamicFriction = value;
        this._shape && this._shape._pxMaterials[0].setDynamicFriction(value);
    }

    setStaticFriction(value: number): void {
        this._staticFriction = value;
        this._shape && this._shape._pxMaterials[0].setStaticFriction(value);
    }

    setFrictionCombine(value: PhysicsCombineMode): void {
        this._frictionCombine = value;
        this._shape && this._shape._pxMaterials[0].setFrictionCombine(value);
    }

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