import { Transform3D } from "../../../d3/core/Transform3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../../interface/ICollider";
import { btColliderShape } from "../Shape/btColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { Sprite3D } from "../../../d3/core/Sprite3D";

export enum btColliderType {
    RigidbodyCollider,
    CharactorCollider,
    StaticCollider
}

export class btCollider implements ICollider {
    static _colliderID: number = 0;
    static _addUpdateList: boolean = true;

    /*
     * 刚体类型_静态。
     * 设定为永远不会移动刚体,引擎也不会自动更新。
     * 如果你打算移动物理,建议使用TYPE_KINEMATIC。
     */
    static TYPE_STATIC = 0;
    /*
     * 刚体类型_动态。
     * 可以通过forces和impulsesy移动刚体,并且不需要修改移动转换。
     */
    static TYPE_DYNAMIC = 1;
    /*
     * 刚体类型_运动。
     * 可以移动刚体,物理引擎会自动处理动态交互。
     * 注意：和静态或其他类型刚体不会产生动态交互。
     */
    static TYPE_KINEMATIC = 2;

    /** @internal */
    static _physicObjectsMap: { [key: number]: btCollider } = {};

    protected static _btVector30: number;
    /** @internal */
    protected static _btQuaternion0: number;
    /** @internal */
    protected static _tempVector30: Vector3;
    /** @internal */
    protected static _tempQuaternion0: Quaternion;
    /** @internal */
    protected static _tempQuaternion1: Quaternion;
    /** @internal */
    protected static _tempMatrix4x40: Matrix4x4;

    _btCollider: any;

    _btColliderShape: btColliderShape;

    _collisionGroup: number;

    _canCollideWith: number;

    _physicsManager: btPhysicsManager;

    _isSimulate: boolean = false;//是否已经生效

    _type: btColliderType;

    //update list index
    inPhysicUpdateListIndex: number = -1;

    _id: number;

    /**触发器 */
    _isTrigger: boolean;

    _enableProcessCollisions: boolean;

    _destroyed: boolean = false;

    owner: Sprite3D;

    _transform: Transform3D;

    /**@internal */
    componentEnable: boolean;
    /** @internal */
    protected _restitution = 0.0;
    /** @internal */
    protected _friction = 0.5;
    /** @internal */
    protected _rollingFriction = 0.0;
    /** @internal */
    protected _ccdThreshold = 0.0;
    /** @internal */
    protected _ccdSwapSphereRadius = 0.0;


    /** @internal */
    protected _transformFlag = 2147483647 /*int.MAX_VALUE*/;

    /**
    * @internal
    */
    static __init__(): void {
        let bt = btPhysicsCreateUtil._bt;
        btCollider._btVector30 = bt.btVector3_create(0, 0, 0);
        btCollider._btQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
        btCollider._tempVector30 = new Vector3();
        btCollider._tempQuaternion0 = new Quaternion();
        btCollider._tempQuaternion1 = new Quaternion();
        btCollider._tempMatrix4x40 = new Matrix4x4();
    }

    constructor(physicsManager: btPhysicsManager) {
        this._collisionGroup = btPhysicsManager.COLLISIONFILTERGROUP_DEFAULTFILTER;
        this._canCollideWith = btPhysicsManager.COLLISIONFILTERGROUP_ALLFILTER;
        this._physicsManager = physicsManager;
        this._id = btCollider._colliderID++;
        this._isTrigger = false;
        this._enableProcessCollisions = false;
        btCollider._physicObjectsMap[this._id] = this;
        this._type = this.getColliderType();
    }

    getCapable(value: number): boolean {
        return null;
    }

    setOwner(node: Sprite3D): void {
        this.owner = node;
        this._transform = node.transform;
        this._initCollider();
    }

    setCollisionGroup(value: number) {
        if (value != this._collisionGroup && this._btColliderShape) {
            this._collisionGroup = value;
            this._physicsManager.removeCollider(this);
            this._physicsManager.addCollider(this);
        }
    }

    setCanCollideWith(value: number) {
        if (value != this._canCollideWith && this._btColliderShape) {
            this._canCollideWith = value;
            this._physicsManager.removeCollider(this);
            this._physicsManager.addCollider(this);
        }
    }

    protected _initCollider() {
        this.setBounciness(this._restitution);
        this.setfriction(this._friction);
        this.setRollingFriction(this._friction);
        this.setCcdMotionThreshold(this._physicsManager.ccdThreshold);
        this.setCcdSweptSphereRadius(this._physicsManager.ccdSphereRadius);
    }

    protected getColliderType(): btColliderType {
        return null;
    }

    /**
     * @internal
     */
    protected _onScaleChange(scale: Vector3): void {
        this._btColliderShape.setWorldScale(scale);
    }

    protected _onShapeChange() {
        var btColObj: any = this._btCollider;
        let bt = btPhysicsCreateUtil._bt;
        var flags: number = bt.btCollisionObject_getCollisionFlags(btColObj);

        if ((flags & btPhysicsManager.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) > 0)
            bt.btCollisionObject_setCollisionFlags(btColObj, flags ^ btPhysicsManager.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
    }

    setColliderShape(shape: btColliderShape) {
        shape._btCollider = this;
        if (shape == this._btColliderShape || shape._btShape == null)
            return;
        var lastColliderShape: btColliderShape = this._btColliderShape;
        this._btColliderShape = shape;
        let bt = btPhysicsCreateUtil._bt;
        if (shape) {
            if (this._btCollider) {
                bt.btCollisionObject_setCollisionShape(this._btCollider, shape._btShape);
                let simulate = this._isSimulate;
                simulate && this._physicsManager.removeCollider(this);//修改shape必须把Collison从物理世界中移除再重新添加
                this._onShapeChange();//修改shape会计算惯性
                if ((simulate || !lastColliderShape) && this.componentEnable) {
                    this._derivePhysicsTransformation(true);
                    this._physicsManager.addCollider(this);
                }
            }
        } else {
            if (this._isSimulate) {
                this._physicsManager.removeCollider(this);
                this._isSimulate = false;
            }
        }
        lastColliderShape && lastColliderShape.destroy();
    }

    destroy(): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btCollisionObject_destroy(this._btCollider);
        delete btCollider._physicObjectsMap[this._id];
        this._destroyed = true;
    }


    /**
     * 	@internal
     * 通过渲染矩阵更新物理矩阵。
     */
    _derivePhysicsTransformation(force: boolean): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject: number = this._btCollider;
        var btTransform: number = bt.btCollisionObject_getWorldTransform(btColliderObject);
        this._innerDerivePhysicsTransformation(btTransform, force);
        bt.btCollisionObject_setWorldTransform(btColliderObject, btTransform);
    }

    /**
     * 	@internal
     *	通过渲染矩阵更新物理矩阵。
     */
    _innerDerivePhysicsTransformation(physicTransformPtr: number, force: boolean): void {
        let bt = btPhysicsCreateUtil._bt;
        var transform = this._transform;
        let pxoff = 0;
        let pyoff = 0;
        let pzoff = 0;
        if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            var shapeOffset = this._btColliderShape._localOffset;
            var position = transform.position;
            //position.x-=pxoff; position.y-=pyoff; position.z-=pzoff; 这里错了，-=会修改模型位置，
            var btPosition = btCollider._btVector30;
            if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
                var physicPosition = btCollider._tempVector30;
                var worldMat = transform.worldMatrix;
                Vector3.transformCoordinate(shapeOffset, worldMat, physicPosition);
                bt.btVector3_setValue(btPosition, physicPosition.x, physicPosition.y, physicPosition.z);
            } else {
                bt.btVector3_setValue(btPosition, position.x - pxoff, position.y - pyoff, position.z - pzoff);
            }
            bt.btTransform_setOrigin(physicTransformPtr, btPosition);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
        }

        if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            //var shapeRotation = this._btColliderShape._localRotation;
            var btRotation = btCollider._btQuaternion0;
            var rotation = transform.rotation;
            // if (shapeRotation.x !== 0 || shapeRotation.y !== 0 || shapeRotation.z !== 0 || shapeRotation.w !== 1) {
            //     var physicRotation = btCollider._tempQuaternion0;
            //     btCollider.physicQuaternionMultiply(rotation.x, rotation.y, rotation.z, rotation.w, shapeRotation, physicRotation);
            //     bt.btQuaternion_setValue(btRotation, physicRotation.x, physicRotation.y, physicRotation.z, physicRotation.w);
            // } else {
            bt.btQuaternion_setValue(btRotation, rotation.x, rotation.y, rotation.z, rotation.w);
            //}
            bt.btTransform_setRotation(physicTransformPtr, btRotation);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
        }

        if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._onScaleChange(transform.getWorldLossyScale());
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
        }
    }

    /**
     * @internal
     * 通过物理矩阵更新渲染矩阵。
     */
    _updateTransformComponent(physicsTransform: number, syncRot = true, addmargin = 0): void {
        //TODO:Need Test!!! because _innerDerivePhysicsTransformation update position use worldMatrix,not(position rotation WorldLossyScale),maybe the center is no different.
        let bt = btPhysicsCreateUtil._bt;
        var colliderShape = this._btColliderShape;
        var localOffset = colliderShape._localOffset;
        //var localRotation = colliderShape._localRotation;

        var transform = this._transform;
        if (!transform) return;
        var position = transform.position;
        var rotation = transform.rotation;

        var btPosition: number = bt.btTransform_getOrigin(physicsTransform);

        if (syncRot) {
            var btRotation: number = bt.btTransform_getRotation(physicsTransform);

            var btRotX: number = bt.btQuaternion_x(btRotation);
            var btRotY: number = bt.btQuaternion_y(btRotation);
            var btRotZ: number = bt.btQuaternion_z(btRotation);
            var btRotW: number = bt.btQuaternion_w(btRotation);

            // if (localRotation.x !== 0 || localRotation.y !== 0 || localRotation.z !== 0 || localRotation.w !== 1) {
            //     var invertShapeRotaion = btCollider._tempQuaternion0;
            //     localRotation.invert(invertShapeRotaion);
            //     btCollider.physicQuaternionMultiply(btRotX, btRotY, btRotZ, btRotW, invertShapeRotaion, rotation);
            // } else {
            rotation.x = btRotX;
            rotation.y = btRotY;
            rotation.z = btRotZ;
            rotation.w = btRotW;
            //}
            transform.rotation = rotation;
        }

        if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
            var btScale: number = bt.btCollisionShape_getLocalScaling(colliderShape._btShape);
            var rotShapePosition = btCollider._tempVector30;
            rotShapePosition.x = localOffset.x * bt.btVector3_x(btScale);
            rotShapePosition.y = localOffset.y * bt.btVector3_y(btScale);
            rotShapePosition.z = localOffset.z * bt.btVector3_z(btScale);
            Vector3.transformQuat(rotShapePosition, rotation, rotShapePosition);
            position.x = bt.btVector3_x(btPosition) - rotShapePosition.x;
            //TODO 临时加一个0.04，对一个人来说0.04的margin太大了，足以把脚陷入地下，所以先加回来
            position.y = bt.btVector3_y(btPosition) - rotShapePosition.y + addmargin;
            position.z = bt.btVector3_z(btPosition) - rotShapePosition.z;
        } else {
            position.x = bt.btVector3_x(btPosition);
            position.y = bt.btVector3_y(btPosition);
            position.z = bt.btVector3_z(btPosition);
        }

        transform.position = position;
        //transform.worldMatrix;  TODO
        //this.owner.callaterChange && this.owner.callaterChange();
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

    transformChanged(flag: number): void {
        this._transformFlag = flag;
        if (this.inPhysicUpdateListIndex == -1 && !this._enableProcessCollisions) {
            this._physicsManager._physicsUpdateList.add(this);
        }
    }

    setBounciness(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        this._restitution = value;
        this._btCollider && bt.btCollisionObject_setRestitution(this._btCollider, value);
    }

    setfriction(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        this._friction = value;
        this._btCollider && bt.btCollisionObject_setFriction(this._btCollider, value);
    }

    setRollingFriction(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        this._rollingFriction = value;
        this._btCollider && bt.btCollisionObject_setRollingFriction(this._btCollider, value);
    }

    setCcdMotionThreshold(value: number): void {
        if (this._physicsManager.enableCCD) {
            let bt = btPhysicsCreateUtil._bt;
            this._ccdThreshold = value;
            this._btCollider && bt.btCollisionObject_setCcdMotionThreshold(this._btCollider, value);
        }
    }

    setCcdSweptSphereRadius(value: number): void {
        if (this._physicsManager.enableCCD) {
            let bt = btPhysicsCreateUtil._bt;
            this._ccdSwapSphereRadius = value;
            this._btCollider && bt.btCollisionObject_setCcdSweptSphereRadius(this._btCollider, value);
        }
    }
}