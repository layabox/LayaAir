import { Event } from "../../events/Event";
import { EventDispatcher } from "../../events/EventDispatcher";
import { MathUtils3D } from "../math/MathUtils3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
/**
 * <code>Transform3D</code> 类用于实现3D变换。
 */
export class Transform3D extends EventDispatcher {
    /**
     * 创建一个 <code>Transform3D</code> 实例。
     * @param owner 所属精灵。
     */
    constructor(owner) {
        super();
        /** @private */
        this._localPosition = new Vector3(0, 0, 0);
        /** @private */
        this._localRotation = new Quaternion(0, 0, 0, 1);
        /** @private */
        this._localScale = new Vector3(1, 1, 1);
        /**@private */
        this._localRotationEuler = new Vector3(0, 0, 0);
        /** @private */
        this._localMatrix = new Matrix4x4();
        /** @private */
        this._position = new Vector3(0, 0, 0);
        /** @private */
        this._rotation = new Quaternion(0, 0, 0, 1);
        /** @private */
        this._scale = new Vector3(1, 1, 1);
        /**@private */
        this._rotationEuler = new Vector3(0, 0, 0);
        /** @private */
        this._worldMatrix = new Matrix4x4();
        /** @private */
        this._children = null;
        /** @private */
        this._parent = null;
        /**@private */
        this._dummy = null;
        /**@private */
        this._transformFlag = 0;
        this._owner = owner;
        this._children = [];
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, false);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE | Transform3D.TRANSFORM_WORLDMATRIX, true);
    }
    /**
     * @private
     */
    get _isFrontFaceInvert() {
        var scale = this.scale;
        var isInvert = scale.x < 0;
        (scale.y < 0) && (isInvert = !isInvert);
        (scale.z < 0) && (isInvert = !isInvert);
        return isInvert;
    }
    /**
     * 获取所属精灵。
     */
    get owner() {
        return this._owner;
    }
    /**
     * 获取世界矩阵是否需要更新。
     * @return	世界矩阵是否需要更新。
     */
    get worldNeedUpdate() {
        return this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX);
    }
    /**
     * 获取局部位置X轴分量。
     * @return	局部位置X轴分量。
     */
    get localPositionX() {
        return this._localPosition.x;
    }
    /**
     * 设置局部位置X轴分量。
     * @param x	局部位置X轴分量。
     */
    set localPositionX(x) {
        this._localPosition.x = x;
        this.localPosition = this._localPosition;
    }
    /**
     * 获取局部位置Y轴分量。
     * @return	局部位置Y轴分量。
     */
    get localPositionY() {
        return this._localPosition.y;
    }
    /**
     * 设置局部位置Y轴分量。
     * @param y	局部位置Y轴分量。
     */
    set localPositionY(y) {
        this._localPosition.y = y;
        this.localPosition = this._localPosition;
    }
    /**
     * 获取局部位置Z轴分量。
     * @return	局部位置Z轴分量。
     */
    get localPositionZ() {
        return this._localPosition.z;
    }
    /**
     * 设置局部位置Z轴分量。
     * @param z	局部位置Z轴分量。
     */
    set localPositionZ(z) {
        this._localPosition.z = z;
        this.localPosition = this._localPosition;
    }
    /**
     * 获取局部位置。
     * @return	局部位置。
     */
    get localPosition() {
        return this._localPosition;
    }
    /**
     * 设置局部位置。
     * @param value	局部位置。
     */
    set localPosition(value) {
        if (this._localPosition !== value)
            value.cloneTo(this._localPosition);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldPositionTransform();
    }
    /**
     * 获取局部旋转四元数X分量。
     * @return	局部旋转四元数X分量。
     */
    get localRotationX() {
        return this.localRotation.x;
    }
    /**
     * 设置局部旋转四元数X分量。
     * @param x	局部旋转四元数X分量。
     */
    set localRotationX(x) {
        this._localRotation.x = x;
        this.localRotation = this._localRotation;
    }
    /**
     * 获取局部旋转四元数Y分量。
     * @return	局部旋转四元数Y分量。
     */
    get localRotationY() {
        return this.localRotation.y;
    }
    /**
     * 设置局部旋转四元数Y分量。
     * @param y	局部旋转四元数Y分量。
     */
    set localRotationY(y) {
        this._localRotation.y = y;
        this.localRotation = this._localRotation;
    }
    /**
     * 获取局部旋转四元数Z分量。
     * @return	局部旋转四元数Z分量。
     */
    get localRotationZ() {
        return this.localRotation.z;
    }
    /**
     * 设置局部旋转四元数Z分量。
     * @param z	局部旋转四元数Z分量。
     */
    set localRotationZ(z) {
        this._localRotation.z = z;
        this.localRotation = this._localRotation;
    }
    /**
     * 获取局部旋转四元数W分量。
     * @return	局部旋转四元数W分量。
     */
    get localRotationW() {
        return this.localRotation.w;
    }
    /**
     * 设置局部旋转四元数W分量。
     * @param w	局部旋转四元数W分量。
     */
    set localRotationW(w) {
        this._localRotation.w = w;
        this.localRotation = this._localRotation;
    }
    /**
     * 获取局部旋转。
     * @return	局部旋转。
     */
    get localRotation() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
            var eulerE = this._localRotationEuler;
            Quaternion.createFromYawPitchRoll(eulerE.y / Transform3D._angleToRandin, eulerE.x / Transform3D._angleToRandin, eulerE.z / Transform3D._angleToRandin, this._localRotation);
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        }
        return this._localRotation;
    }
    /**
     * 设置局部旋转。
     * @param value	局部旋转。
     */
    set localRotation(value) {
        if (this._localRotation !== value)
            value.cloneTo(this._localRotation);
        this._localRotation.normalize(this._localRotation);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        this._onWorldRotationTransform();
    }
    /**
     * 获取局部缩放X。
     * @return	局部缩放X。
     */
    get localScaleX() {
        return this._localScale.x;
    }
    /**
     * 设置局部缩放X。
     * @param	value 局部缩放X。
     */
    set localScaleX(value) {
        this._localScale.x = value;
        this.localScale = this._localScale;
    }
    /**
     * 获取局部缩放Y。
     * @return	局部缩放Y。
     */
    get localScaleY() {
        return this._localScale.y;
    }
    /**
     * 设置局部缩放Y。
     * @param	value 局部缩放Y。
     */
    set localScaleY(value) {
        this._localScale.y = value;
        this.localScale = this._localScale;
    }
    /**
     * 获取局部缩放Z。
     * @return	局部缩放Z。
     */
    get localScaleZ() {
        return this._localScale.z;
    }
    /**
     * 设置局部缩放Z。
     * @param	value 局部缩放Z。
     */
    set localScaleZ(value) {
        this._localScale.z = value;
        this.localScale = this._localScale;
    }
    /**
     * 获取局部缩放。
     * @return	局部缩放。
     */
    get localScale() {
        return this._localScale;
    }
    /**
     * 设置局部缩放。
     * @param	value 局部缩放。
     */
    set localScale(value) {
        if (this._localScale !== value)
            value.cloneTo(this._localScale);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldScaleTransform();
    }
    /**
     * 获取局部空间的X轴欧拉角。
     * @return	局部空间的X轴欧拉角。
     */
    get localRotationEulerX() {
        return this.localRotationEuler.x;
    }
    /**
     * 设置局部空间的X轴欧拉角。
     * @param	value 局部空间的X轴欧拉角。
     */
    set localRotationEulerX(value) {
        this._localRotationEuler.x = value;
        this.localRotationEuler = this._localRotationEuler;
    }
    /**
     * 获取局部空间的Y轴欧拉角。
     * @return	局部空间的Y轴欧拉角。
     */
    get localRotationEulerY() {
        return this.localRotationEuler.y;
    }
    /**
     * 设置局部空间的Y轴欧拉角。
     * @param	value 局部空间的Y轴欧拉角。
     */
    set localRotationEulerY(value) {
        this._localRotationEuler.y = value;
        this.localRotationEuler = this._localRotationEuler;
    }
    /**
     * 获取局部空间的Z轴欧拉角。
     * @return	局部空间的Z轴欧拉角。
     */
    get localRotationEulerZ() {
        return this.localRotationEuler.z;
    }
    /**
     * 设置局部空间的Z轴欧拉角。
     * @param	value 局部空间的Z轴欧拉角。
     */
    set localRotationEulerZ(value) {
        this._localRotationEuler.z = value;
        this.localRotationEuler = this._localRotationEuler;
    }
    /**
     * 获取局部空间欧拉角。
     * @return	欧拉角的旋转值。
     */
    get localRotationEuler() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            this._localRotation.getYawPitchRoll(Transform3D._tempVector30);
            var euler = Transform3D._tempVector30;
            var localRotationEuler = this._localRotationEuler;
            localRotationEuler.x = euler.y * Transform3D._angleToRandin;
            localRotationEuler.y = euler.x * Transform3D._angleToRandin;
            localRotationEuler.z = euler.z * Transform3D._angleToRandin;
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        }
        return this._localRotationEuler;
    }
    /**
     * 设置局部空间的欧拉角。
     * @param	value 欧拉角的旋转值。
     */
    set localRotationEuler(value) {
        if (this._localRotationEuler !== value)
            value.cloneTo(this._localRotationEuler);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldRotationTransform();
    }
    /**
     * 获取局部矩阵。
     * @return	局部矩阵。
     */
    get localMatrix() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
            this._updateLocalMatrix();
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, false);
        }
        return this._localMatrix;
    }
    /**
     * 设置局部矩阵。
     * @param value	局部矩阵。
     */
    set localMatrix(value) {
        if (this._localMatrix !== value)
            value.cloneTo(this._localMatrix);
        this._localMatrix.decomposeTransRotScale(this._localPosition, this._localRotation, this._localScale);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, false);
        this._onWorldTransform();
    }
    /**
     * 获取世界位置。
     * @return	世界位置。
     */
    get position() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            if (this._parent != null) {
                var parentPosition = this._parent.position; //放到下面会影响_tempVector30计算，造成混乱
                Vector3.multiply(this._localPosition, this._parent.scale, Transform3D._tempVector30);
                Vector3.transformQuat(Transform3D._tempVector30, this._parent.rotation, Transform3D._tempVector30);
                Vector3.add(parentPosition, Transform3D._tempVector30, this._position);
            }
            else {
                this._localPosition.cloneTo(this._position);
            }
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
        }
        return this._position;
    }
    /**
     * 设置世界位置。
     * @param	value 世界位置。
     */
    set position(value) {
        if (this._parent != null) {
            Vector3.subtract(value, this._parent.position, this._localPosition);
            var parentScale = this._parent.scale;
            var psX = parentScale.x, psY = parentScale.y, psZ = parentScale.z;
            if (psX !== 1.0 || psY !== 1.0 || psZ !== 1.0) {
                var invertScale = Transform3D._tempVector30;
                invertScale.x = 1.0 / psX;
                invertScale.y = 1.0 / psY;
                invertScale.z = 1.0 / psZ;
                Vector3.multiply(this._localPosition, invertScale, this._localPosition);
            }
            var parentRotation = this._parent.rotation;
            parentRotation.invert(Transform3D._tempQuaternion0);
            Vector3.transformQuat(this._localPosition, Transform3D._tempQuaternion0, this._localPosition);
        }
        else {
            value.cloneTo(this._localPosition);
        }
        this.localPosition = this._localPosition;
        if (this._position !== value)
            value.cloneTo(this._position);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
    }
    /**
     * 获取世界旋转。
     * @return	世界旋转。
     */
    get rotation() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            if (this._parent != null)
                Quaternion.multiply(this._parent.rotation, this.localRotation, this._rotation); //使用localRotation不使用_localRotation,内部需要计算
            else
                this.localRotation.cloneTo(this._rotation);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
        }
        return this._rotation;
    }
    /**
     * 设置世界旋转。
     * @param value	世界旋转。
     */
    set rotation(value) {
        if (this._parent != null) {
            this._parent.rotation.invert(Transform3D._tempQuaternion0);
            Quaternion.multiply(Transform3D._tempQuaternion0, value, this._localRotation);
        }
        else {
            value.cloneTo(this._localRotation);
        }
        this.localRotation = this._localRotation;
        if (value !== this._rotation)
            value.cloneTo(this._rotation);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
    }
    /**
     * 获取世界缩放。
     * @return	世界缩放。
     */
    get scale() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE))
            return this._scale;
        if (this._parent !== null)
            Vector3.multiply(this._parent.scale, this._localScale, this._scale);
        else
            this._localScale.cloneTo(this._scale);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
        return this._scale;
    }
    /**
     * 设置世界缩放。
     * @param value	世界缩放。
     */
    set scale(value) {
        if (this._parent !== null) {
            var parScale = this._parent.scale;
            var invParScale = Transform3D._tempVector30;
            invParScale.x = 1.0 / parScale.x;
            invParScale.y = 1.0 / parScale.y;
            invParScale.z = 1.0 / parScale.z;
            Vector3.multiply(value, Transform3D._tempVector30, this._localScale);
        }
        else {
            value.cloneTo(this._localScale);
        }
        this.localScale = this._localScale;
        if (this._scale !== value)
            value.cloneTo(this._scale);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
    }
    /**
     * 获取世界空间的旋转角度。
     * @return	欧拉角的旋转值，顺序为x、y、z。
     */
    get rotationEuler() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this.rotation.getYawPitchRoll(Transform3D._tempVector30); //使用rotation属性,可能需要更新
            var eulerE = Transform3D._tempVector30;
            var rotationEulerE = this._rotationEuler;
            rotationEulerE.x = eulerE.y * Transform3D._angleToRandin;
            rotationEulerE.y = eulerE.x * Transform3D._angleToRandin;
            rotationEulerE.z = eulerE.z * Transform3D._angleToRandin;
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
        }
        return this._rotationEuler;
    }
    /**
     * 设置世界空间的旋转角度。
     * @param	欧拉角的旋转值，顺序为x、y、z。
     */
    set rotationEuler(value) {
        Quaternion.createFromYawPitchRoll(value.y / Transform3D._angleToRandin, value.x / Transform3D._angleToRandin, value.z / Transform3D._angleToRandin, this._rotation);
        this.rotation = this._rotation;
        if (this._rotationEuler !== value)
            value.cloneTo(this._rotationEuler);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
    }
    /**
     * 获取世界矩阵。
     * @return	世界矩阵。
     */
    get worldMatrix() {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
            if (this._parent != null)
                Matrix4x4.multiply(this._parent.worldMatrix, this.localMatrix, this._worldMatrix);
            else
                this.localMatrix.cloneTo(this._worldMatrix);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
        }
        return this._worldMatrix;
    }
    /**
     * 设置世界矩阵。
     * @param	value 世界矩阵。
     */
    set worldMatrix(value) {
        if (this._parent === null) {
            value.cloneTo(this._localMatrix);
        }
        else {
            this._parent.worldMatrix.invert(this._localMatrix);
            Matrix4x4.multiply(this._localMatrix, value, this._localMatrix);
        }
        this.localMatrix = this._localMatrix;
        if (this._worldMatrix !== value)
            value.cloneTo(this._worldMatrix);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
    }
    /**
     * @private
     */
    _setTransformFlag(type, value) {
        if (value)
            this._transformFlag |= type;
        else
            this._transformFlag &= ~type;
    }
    /**
     * @private
     */
    _getTransformFlag(type) {
        return (this._transformFlag & type) != 0;
    }
    /**
     * @private
     */
    _setParent(value) {
        if (this._parent !== value) {
            if (this._parent) {
                var parentChilds = this._parent._children;
                var index = parentChilds.indexOf(this);
                parentChilds.splice(index, 1);
            }
            if (value) {
                value._children.push(this);
                (value) && (this._onWorldTransform());
            }
            this._parent = value;
        }
    }
    /**
     * @private
     */
    _updateLocalMatrix() {
        Matrix4x4.createAffineTransformation(this._localPosition, this.localRotation, this._localScale, this._localMatrix);
    }
    /**
     * @private
     */
    _onWorldPositionRotationTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionRotationTransform();
        }
    }
    /**
     * @private
     */
    _onWorldPositionScaleTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionScaleTransform();
        }
    }
    /**
     * @private
     */
    _onWorldPositionTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionTransform();
        }
    }
    /**
     * @private
     */
    _onWorldRotationTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionRotationTransform(); //父节点旋转发生变化，子节点的世界位置和旋转都需要更新
        }
    }
    /**
     * @private
     */
    _onWorldScaleTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldPositionScaleTransform(); //父节点缩放发生变化，子节点的世界位置和缩放都需要更新
        }
    }
    /**
     * @private
     */
    _onWorldTransform() {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
            for (var i = 0, n = this._children.length; i < n; i++)
                this._children[i]._onWorldTransform();
        }
    }
    /**
     * 平移变换。
     * @param 	translation 移动距离。
     * @param 	isLocal 是否局部空间。
     */
    translate(translation, isLocal = true) {
        if (isLocal) {
            Matrix4x4.createFromQuaternion(this.localRotation, Transform3D._tempMatrix0);
            Vector3.transformCoordinate(translation, Transform3D._tempMatrix0, Transform3D._tempVector30);
            Vector3.add(this.localPosition, Transform3D._tempVector30, this._localPosition);
            this.localPosition = this._localPosition;
        }
        else {
            Vector3.add(this.position, translation, this._position);
            this.position = this._position;
        }
    }
    /**
     * 旋转变换。
     * @param 	rotations 旋转幅度。
     * @param 	isLocal 是否局部空间。
     * @param 	isRadian 是否弧度制。
     */
    rotate(rotation, isLocal = true, isRadian = true) {
        var rot;
        if (isRadian) {
            rot = rotation;
        }
        else {
            Vector3.scale(rotation, Math.PI / 180.0, Transform3D._tempVector30);
            rot = Transform3D._tempVector30;
        }
        Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, Transform3D._tempQuaternion0);
        if (isLocal) {
            Quaternion.multiply(this._localRotation, Transform3D._tempQuaternion0, this._localRotation);
            this.localRotation = this._localRotation;
        }
        else {
            Quaternion.multiply(Transform3D._tempQuaternion0, this.rotation, this._rotation);
            this.rotation = this._rotation;
        }
    }
    /**
     * 获取向前方向。
     * @param 前方向。
     */
    getForward(forward) {
        var worldMatElem = this.worldMatrix.elements;
        forward.x = -worldMatElem[8];
        forward.y = -worldMatElem[9];
        forward.z = -worldMatElem[10];
    }
    /**
     * 获取向上方向。
     * @param 上方向。
     */
    getUp(up) {
        var worldMatElem = this.worldMatrix.elements;
        up.x = worldMatElem[4];
        up.y = worldMatElem[5];
        up.z = worldMatElem[6];
    }
    /**
     * 获取向右方向。
     * @param 右方向。
     */
    getRight(right) {
        var worldMatElem = this.worldMatrix.elements;
        right.x = worldMatElem[0];
        right.y = worldMatElem[1];
        right.z = worldMatElem[2];
    }
    /**
     * 观察目标位置。
     * @param	target 观察目标。
     * @param	up 向上向量。
     * @param	isLocal 是否局部空间。
     */
    lookAt(target, up, isLocal = false) {
        var eye;
        if (isLocal) {
            eye = this._localPosition;
            if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
                return;
            Quaternion.lookAt(this._localPosition, target, up, this._localRotation);
            this._localRotation.invert(this._localRotation);
            this.localRotation = this._localRotation;
        }
        else {
            var worldPosition = this.position;
            eye = worldPosition;
            if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
                return;
            Quaternion.lookAt(worldPosition, target, up, this._rotation);
            this._rotation.invert(this._rotation);
            this.rotation = this._rotation;
        }
    }
}
/** @private */
Transform3D._tempVector30 = new Vector3();
/** @private */
Transform3D._tempVector31 = new Vector3();
/** @private */
Transform3D._tempVector32 = new Vector3();
/** @private */
Transform3D._tempVector33 = new Vector3();
/** @private */
Transform3D._tempQuaternion0 = new Quaternion();
/** @private */
Transform3D._tempMatrix0 = new Matrix4x4();
/**@private */
Transform3D.TRANSFORM_LOCALQUATERNION = 0x01;
/**@private */
Transform3D.TRANSFORM_LOCALEULER = 0x02;
/**@private */
Transform3D.TRANSFORM_LOCALMATRIX = 0x04;
/**@private */
Transform3D.TRANSFORM_WORLDPOSITION = 0x08;
/**@private */
Transform3D.TRANSFORM_WORLDQUATERNION = 0x10;
/**@private */
Transform3D.TRANSFORM_WORLDSCALE = 0x20;
/**@private */
Transform3D.TRANSFORM_WORLDMATRIX = 0x40;
/**@private */
Transform3D.TRANSFORM_WORLDEULER = 0x80;
/**@private */
Transform3D._angleToRandin = 180 / Math.PI;
