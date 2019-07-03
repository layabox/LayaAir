import { Matrix4x4 } from "../../math/Matrix4x4";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { Physics3D } from "../Physics3D";
/**
 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
 */
export class ColliderShape {
    /**
     * 创建一个新的 <code>ColliderShape</code> 实例。
     */
    constructor() {
        /**@internal */
        this._scale = new Vector3(1, 1, 1);
        /**@internal */
        this._centerMatrix = new Matrix4x4();
        /**@internal */
        this._attatched = false;
        /**@internal */
        this._indexInCompound = -1;
        /**@internal */
        this._compoundParent = null;
        /**@internal */
        this._attatchedCollisionObject = null;
        /**@internal */
        this._referenceCount = 0;
        /**@internal */
        this._localOffset = new Vector3(0, 0, 0);
        /**@internal */
        this._localRotation = new Quaternion(0, 0, 0, 1);
        this.needsCustomCollisionCallback = false; //TODO:默认值,TODO:::::::::::::::::::::::::::::::
    }
    /**
     * @internal
     */
    static __init__() {
        ColliderShape._nativeScale = new Physics3D._physics3D.btVector3(1, 1, 1);
        ColliderShape._nativeVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
        ColliderShape._nativQuaternion0 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
        ColliderShape._nativeTransform0 = new Physics3D._physics3D.btTransform();
    }
    /**
     * @internal
     */
    static _createAffineTransformation(trans, rot, outE) {
        var x = rot.x, y = rot.y, z = rot.z, w = rot.w, x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;
        outE[0] = (1 - (yy + zz));
        outE[1] = (xy + wz);
        outE[2] = (xz - wy);
        outE[3] = 0;
        outE[4] = (xy - wz);
        outE[5] = (1 - (xx + zz));
        outE[6] = (yz + wx);
        outE[7] = 0;
        outE[8] = (xz + wy);
        outE[9] = (yz - wx);
        outE[10] = (1 - (xx + yy));
        outE[11] = 0;
        outE[12] = trans.x;
        outE[13] = trans.y;
        outE[14] = trans.z;
        outE[15] = 1;
    }
    /**
     * 获取碰撞类型。
     * @return 碰撞类型。
     */
    get type() {
        return this._type;
    }
    /**
     * 获取Shape的本地偏移。
     * @return Shape的本地偏移。
     */
    get localOffset() {
        return this._localOffset;
    }
    /**
     * 设置Shape的本地偏移。
     * @param Shape的本地偏移。
     */
    set localOffset(value) {
        this._localOffset = value;
        if (this._compoundParent)
            this._compoundParent._updateChildTransform(this);
    }
    /**
     * 获取Shape的本地旋转。
     * @return Shape的本地旋转。
     */
    get localRotation() {
        return this._localRotation;
    }
    /**
     * 设置Shape的本地旋转。
     * @param Shape的本地旋转。
     */
    set localRotation(value) {
        this._localRotation = value;
        if (this._compoundParent)
            this._compoundParent._updateChildTransform(this);
    }
    /**
     * @internal
     */
    _setScale(value) {
        if (this._compoundParent) { //TODO:待查,这里有问题
            this.updateLocalTransformations();
        }
        else {
            ColliderShape._nativeScale.setValue(value.x, value.y, value.z);
            this._nativeShape.setLocalScaling(ColliderShape._nativeScale);
        }
    }
    /**
     * @internal
     */
    _addReference() {
        this._referenceCount++;
    }
    /**
     * @internal
     */
    _removeReference() {
        this._referenceCount--;
    }
    /**
     * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
     */
    updateLocalTransformations() {
        if (this._compoundParent) {
            var offset = ColliderShape._tempVector30;
            Vector3.multiply(this.localOffset, this._scale, offset);
            ColliderShape._createAffineTransformation(offset, this.localRotation, this._centerMatrix.elements);
        }
        else {
            ColliderShape._createAffineTransformation(this.localOffset, this.localRotation, this._centerMatrix.elements);
        }
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destColliderShape = destObject;
        this._localOffset.cloneTo(destColliderShape.localOffset);
        this._localRotation.cloneTo(destColliderShape.localRotation);
        destColliderShape.localOffset = destColliderShape.localOffset;
        destColliderShape.localRotation = destColliderShape.localRotation;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        return null;
    }
    /**
     * @internal
     */
    destroy() {
        if (this._nativeShape) {
            Physics3D._physics3D.destroy(this._nativeShape);
            this._nativeShape = null;
        }
    }
}
/** @internal */
ColliderShape.SHAPEORIENTATION_UPX = 0;
/** @internal */
ColliderShape.SHAPEORIENTATION_UPY = 1;
/** @internal */
ColliderShape.SHAPEORIENTATION_UPZ = 2;
/** @internal */
ColliderShape.SHAPETYPES_BOX = 0;
/** @internal */
ColliderShape.SHAPETYPES_SPHERE = 1;
/** @internal */
ColliderShape.SHAPETYPES_CYLINDER = 2;
/** @internal */
ColliderShape.SHAPETYPES_CAPSULE = 3;
/** @internal */
ColliderShape.SHAPETYPES_CONVEXHULL = 4;
/** @internal */
ColliderShape.SHAPETYPES_COMPOUND = 5;
/** @internal */
ColliderShape.SHAPETYPES_STATICPLANE = 6;
/** @internal */
ColliderShape.SHAPETYPES_CONE = 7;
/** @internal */
ColliderShape._tempVector30 = new Vector3();
