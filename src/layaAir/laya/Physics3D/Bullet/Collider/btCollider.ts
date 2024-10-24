import { Transform3D } from "../../../d3/core/Transform3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICollider } from "../../interface/ICollider";
import { btColliderShape } from "../Shape/btColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { PhysicsColliderComponent, PhysicsCombineMode } from "../../../d3/physics/PhysicsColliderComponent";
import { NotImplementedError } from "../../../utils/Error";

export enum btColliderType {
    RigidbodyCollider,
    CharactorCollider,
    StaticCollider
}

/**
 * @en btCollider class is used to handle 3D physics collisions.
 * @zh btCollider 类用于处理3D物理碰撞。
 */
export class btCollider implements ICollider {
    component: PhysicsColliderComponent;
    static _colliderID: number = 0;
    static _addUpdateList: boolean = true;

    /**
     * @en Static rigid body type.
     * Set to a rigid body that will never move, and the engine will not automatically update it.
     * If you intend to move physics objects, it is recommended to use TYPE_KINEMATIC.
     * @zh 刚体类型_静态。
     * 设定为永远不会移动刚体,引擎也不会自动更新。
     * 如果你打算移动物理,建议使用TYPE_KINEMATIC。
     */
    static TYPE_STATIC = 0;
    /**
     * @en Dynamic rigid body type.
     * The rigid body can be moved through forces and impulses, and there's no need to modify the movement transformation.
     * @zh 刚体类型_动态。
     * 可以通过力和冲量移动刚体，并且不需要修改移动变换。
     */
    static TYPE_DYNAMIC = 1;
    /**
     * @en Kinematic rigid body type.
     * The rigid body can be moved, and the physics engine will automatically handle dynamic interactions.
     * Note: It will not produce dynamic interactions with static or other types of rigid bodies.
     * @zh 刚体类型_运动。
     * 可以移动刚体，物理引擎会自动处理动态交互。
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

    /**
     * @en The underlying Bullet physics collider object.
     * @zh 物理碰撞器对象。
     */
    _btCollider: any;

    /**
     * @en The shape of the Bullet physics collider.
     * @zh 物理碰撞器的形状。
     */
    _btColliderShape: btColliderShape;

    /**
     * @en The collision group that this collider belongs to.
     * @zh 此碰撞器所属的碰撞组。
     */
    _collisionGroup: number;

    /**
     * @en The collision mask determining which groups this collider can collide with.
     * @zh 决定此碰撞器可以与哪些组碰撞的碰撞掩码。
     */
    _canCollideWith: number;

    /**
     * @en The physics manager handling this collider.
     * @zh 处理此碰撞器的物理管理器。
     */
    _physicsManager: btPhysicsManager;

    /**
     * @en Indicates whether the collider is currently simulated in the physics world.
     * @zh 表示碰撞器是否已在物理世界中生效。
     */
    _isSimulate: boolean = false;

    /**
     * @en The type of the collider (static, dynamic, or kinematic).
     * @zh 碰撞器的类型（静态、动态或运动学）。
     */
    _type: btColliderType;

    /**
     * @en update list index.
     * @zh 更新列表中的索引。
     */
    inPhysicUpdateListIndex: number = -1;

    /**
     * @en Unique identifier for the collider.
     * @zh 碰撞器的唯一标识符。
     */
    _id: number;

    /**
     * @en Whether the collider is a trigger.
     * @zh 是否为触发器。
     */
    _isTrigger: boolean;

    /**
     * @en Determines if collision processing is enabled for this collider.
     * @zh 决定是否为此碰撞器启用碰撞处理。
     */
    _enableProcessCollisions: boolean;

    /**
     * @en Indicates whether the collider has been destroyed.
     * @zh 表示碰撞器是否已被销毁。
     */
    _destroyed: boolean = false;

    /**
     * @en The Sprite3D object that owns this collider.
     * @zh 拥有此碰撞器的Sprite3D对象。
     */
    owner: Sprite3D;

    /**
     * @en The Transform3D component associated with this collider.
     * @zh 与此碰撞器关联的Transform3D组件。
     */
    _transform: Transform3D;

    /**
     * @internal
     * @en Indicates whether the component is enabled.
     * @zh 表示组件是否启用。
     */
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

    /**
     * @ignore
     * @en Creates an instance of btCollider.
     * @param physicsManager The physics manager.
     * @zh 创建一个 btCollider 的实例。
     * @param physicsManager 物理管理器。
     */
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
    active: boolean = false;

    /**
     * @en Sets the dynamic friction of the collider.
     * @param value The dynamic friction value.
     * @zh 设置碰撞器的动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction?(value: number): void {
        throw new NotImplementedError;
    }

    /**
     * @en Sets the static friction of the collider.
     * @param value The static friction value.
     * @zh 设置碰撞器的静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction?(value: number): void {
        throw new NotImplementedError;
    }

    /**
     * @en Sets the friction combine mode.
     * @param value The friction combine mode.
     * @zh 设置摩擦力组合模式。
     * @param value 摩擦力组合模式。
     */
    setFrictionCombine?(value: PhysicsCombineMode): void {
        throw new NotImplementedError;
    }

    /**
     * @en Sets the bounce combine mode.
     * @param value The bounce combine mode.
     * @zh 设置弹力组合模式。
     * @param value 弹力组合模式。
     */
    setBounceCombine?(value: PhysicsCombineMode): void {
        throw new NotImplementedError;
    }

    /**
     * @en Sets the event filter for the collider.
     * @param events Array of event names to filter.
     * @zh 设置碰撞器的事件过滤器。
     * @param events 要过滤的事件名称。
     */
    setEventFilter?(events: string[]): void {
        throw new NotImplementedError;
    }

    /**
     * @en Checks if the collider is capable of a certain feature.
     * @param value The capability to check.
     * @returns Whether the collider has the capability.
     * @zh 检查碰撞器是否具有某种能力。
     * @param value 要检查的能力。
     * @returns 碰撞器是否具有该能力。
     */
    getCapable(value: number): boolean {
        return null;
    }

    /**
     * @en Sets the owner of the collider.
     * @param node The Sprite3D node to set as owner.
     * @zh 设置碰撞器的所有者。
     * @param node 所有者节点。
     */
    setOwner(node: Sprite3D): void {
        this.owner = node;
        this._transform = node.transform;
        this._initCollider();
    }

    /**
     * @en Sets the collision group of the collider.
     * @param value The collision group value.
     * @zh 设置碰撞器的碰撞组。
     * @param value 碰撞组的值。
     */
    setCollisionGroup(value: number) {
        if (value != this._collisionGroup && this._btColliderShape) {
            this._collisionGroup = value;
            this._physicsManager.removeCollider(this);
            this._physicsManager.addCollider(this);
        }
    }

    /**
     * @en Sets which groups this collider can collide with.
     * @param value The collision mask value.
     * @zh 设置此碰撞器可以与哪些组碰撞。
     * @param value 碰撞掩码的值。
     */
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
        this.setRollingFriction(this._rollingFriction);
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

    /**
     * @en Sets the collider shape.
     * @param shape The new collider shape.
     * @zh 设置碰撞器形状。
     * @param shape 新的碰撞器形状。
     */
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

    /**
     * @en Destroys the collider.
     * @zh 销毁碰撞器。
     */
    destroy(): void {
        let bt = btPhysicsCreateUtil._bt;
        bt.btCollisionObject_destroy(this._btCollider);
        delete btCollider._physicObjectsMap[this._id];
        this._destroyed = true;
    }

    /**
     * @internal
     * @en Updates the physics transformation based on the rendering matrix.
     * @param force Whether to force update.
     * @zh 通过渲染矩阵更新物理矩阵。
     * @param force 是否强制更新。
     */
    _derivePhysicsTransformation(force: boolean): void {
        let bt = btPhysicsCreateUtil._bt;
        var btColliderObject: number = this._btCollider;
        var btTransform: number = bt.btCollisionObject_getWorldTransform(btColliderObject);
        this._innerDerivePhysicsTransformation(btTransform, force);
        bt.btCollisionObject_setWorldTransform(btColliderObject, btTransform);
    }

    /**
     * @internal
     * @en Updates the physics transformation based on the rendering matrix.
     * @param physicTransformPtr Pointer to the physics transform.
     * @param force Whether to force update.
     * @zh 通过渲染矩阵更新物理矩阵。
     * @param physicTransformPtr 物理变换的指针。
     * @param force 是否强制更新。
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
     * @en Updates the rendering transformation based on the physics matrix.
     * @param physicsTransform The physics transform.
     * @param syncRot Whether to synchronize rotation.
     * @param addmargin Additional margin to add.
     * @zh 通过物理矩阵更新渲染矩阵。
     * @param physicsTransform 物理变换。
     * @param syncRot 是否同步旋转。
     * @param addmargin 要添加的额外边距。
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
     * @en Checks if a specific transform flag is set.
     * @param type The type of transform flag to check.
     * @returns Whether the flag is set.
     * @zh 检查是否设置了特定的变换标志。
     * @param type 要检查的变换标志类型。
     * @returns 标志是否被设置。
     */
    _getTransformFlag(type: number): boolean {
        return (this._transformFlag & type) != 0;
    }

    /**
     * @internal
     * @en Sets a specific transform flag.
     * @param type The type of transform flag to set.
     * @param value Whether to set or unset the flag.
     * @zh 设置特定的变换标志。
     * @param type 要设置的变换标志类型。
     * @param value 是否设置或取消设置标志。
     */
    _setTransformFlag(type: number, value: boolean): void {
        if (value)
            this._transformFlag |= type;
        else
            this._transformFlag &= ~type;
    }

    /**
     * @en Handles transform changes.
     * @param flag The transform flag.
     * @zh 处理变换改变。
     * @param flag 变换标志。
     */
    transformChanged(flag: number): void {
        this._transformFlag = flag;
        if (this.inPhysicUpdateListIndex == -1 && !this._enableProcessCollisions) {
            this._physicsManager._physicsUpdateList.add(this);
        }
    }

    /**
     * @en Sets the bounciness (restitution) of the collider.
     * @param value The bounciness value.
     * @zh 设置碰撞器的弹性（恢复系数）。
     * @param value 弹性值。
     */
    setBounciness(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        this._restitution = value;
        this._btCollider && bt.btCollisionObject_setRestitution(this._btCollider, value);
    }

    /**
     * @en Sets the friction of the collider.
     * @param value The friction value.
     * @zh 设置碰撞器的摩擦力。
     * @param value 摩擦力值。
     */
    setfriction(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        this._friction = value;
        this._btCollider && bt.btCollisionObject_setFriction(this._btCollider, value);
    }

    /**
     * @en Sets the rolling friction of the collider.
     * @param value The rolling friction value.
     * @zh 设置碰撞器的滚动摩擦力。
     * @param value 滚动摩擦力值。
     */
    setRollingFriction(value: number): void {
        let bt = btPhysicsCreateUtil._bt;
        this._rollingFriction = value;
        this._btCollider && bt.btCollisionObject_setRollingFriction(this._btCollider, value);
    }

    /**
     * @en Sets the CCD (Continuous Collision Detection) motion threshold.
     * @param value The CCD motion threshold value.
     * @zh 设置 CCD（连续碰撞检测）运动阈值。
     * @param value CCD 运动阈值。
     */
    setCcdMotionThreshold(value: number): void {
        if (this._physicsManager.enableCCD) {
            let bt = btPhysicsCreateUtil._bt;
            this._ccdThreshold = value;
            this._btCollider && bt.btCollisionObject_setCcdMotionThreshold(this._btCollider, value);
        }
    }

    /**
     * @en Sets the CCD (Continuous Collision Detection) swept sphere radius.
     * @param value The CCD swept sphere radius value.
     * @zh 设置 CCD（连续碰撞检测）扫描球半径。
     * @param value CCD 扫描球半径。
     */
    setCcdSweptSphereRadius(value: number): void {
        if (this._physicsManager.enableCCD) {
            let bt = btPhysicsCreateUtil._bt;
            this._ccdSwapSphereRadius = value;
            this._btCollider && bt.btCollisionObject_setCcdSweptSphereRadius(this._btCollider, value);
        }
    }
}