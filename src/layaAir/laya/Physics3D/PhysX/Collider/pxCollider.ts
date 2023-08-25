import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../../interface/ICollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import { pxColliderShape } from "../Shape/pxColliderShape";
import { pxPhysicsManager } from "../pxPhysicsManager";
export enum pxColliderType {
    RigidbodyCollider,
    CharactorCollider,
    StaticCollider
}

export class pxCollider implements ICollider {


    private static _tempTransform: {
        translation: Vector3;
        rotation: Quaternion;
    } = { translation: new Vector3(), rotation: new Quaternion() };

    /**@internal */
    owner: Sprite3D;
    /**@internal */
    componentEnable: boolean;

    _pxActor: any;

    _transform: Transform3D;

    _type: pxColliderType = pxColliderType.StaticCollider;

    /**触发器 */
    _isTrigger: boolean;

    _isSimulate: boolean = false;//是否已经生效

    _shape: pxColliderShape;

    _physicsManager: pxPhysicsManager;

    _destroyed: boolean = false;

    //update list index
    inPhysicUpdateListIndex: number = -1;

    _enableProcessCollisions = false;

    /** @internal */
    protected _transformFlag = 2147483647 /*int.MAX_VALUE*/;

    //material 这里material本身是shape行为，为了统一，暂时架构为colllider行为
    private _bounciness: number = 0.1;
    private _dynamicFriction: number = 0.1;
    private _staticFriction: number = 0.1;
    private _bounceCombine: PhysicsCombineMode = PhysicsCombineMode.Average;
    private _frictionCombine: PhysicsCombineMode = PhysicsCombineMode.Average;

    constructor(manager: pxPhysicsManager) {
        this._physicsManager = manager;
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
    }

    destroy(): void {
        this._pxActor.release();
        this._destroyed = true;
    }
    setCollisionGroup(value: number): void {
        //TODO
    }
    setCanCollideWith(value: number): void {
        //TODO
    }

    setOwner(node: Sprite3D): void {
        this.owner = node;
        this._transform = node.transform;
        this._initCollider();
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