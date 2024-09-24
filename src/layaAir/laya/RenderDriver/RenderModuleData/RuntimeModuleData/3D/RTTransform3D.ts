import { Sprite3D } from "../../../../d3/core/Sprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Quaternion } from "../../../../maths/Quaternion";
import { Vector3 } from "../../../../maths/Vector3";
import { NativeMemory } from "../NativeMemory";
import { Event } from "../../../../events/Event";

export class RTTransform3D extends Transform3D {

    /**@internal */
    static TRANSFORM_LOCALQUATERNION_DATAOFFSET: number = 0;
    /**@internal */
    static TRANSFORM_LOCALEULER_DATAOFFSET: number = 4;
    /**@internal */
    static TRANSFORM_LOCALPOS_DATAOFFSET: number = 7;
    /**@internal */
    static TRANSFORM_LOCALSCALE_DATAOFFSET: number = 10;
    /**@internal */
    static TRANSFORM_LOCALMATRIX_DATAOFFSET: number = 13;
    /**@internal */
    static TRANSFORM_WORLDQUATERNION_DATAOFFSET: number = 29;
    /**@internal */
    static TRANSFORM_WORLDEULER_DATAOFFSET: number = 33;
    /**@internal */
    static TRANSFORM_WORLDPOS_DATAOFFSET: number = 36;
    /**@internal */
    static TRANSFORM_WORLDSCALE_DATAOFFSET: number = 39;
    /**@internal */
    static TRANSFORM_WORLDMATRIX_DATAOFFSET: number = 42;
    /**@internal */
    static TRANSFORM_CHANGEFLAG_DATAOFFSET: number = 58;
    /**@internal */
    static TRANSFORM_RT_SYNC_FLAG_DATAOFFSET: number = 59;
    /**@internal */
    static TRANSFORM_SHARE_MEMORY_SIZE: number = 60;

    /** @internal */
    protected _owner: Sprite3D;

    /** @internal */
    protected _localPosition: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _localRotation: Quaternion = new Quaternion(0, 0, 0, 1);
    /** @internal */
    protected _localScale: Vector3 = new Vector3(1, 1, 1);
    /**@internal */
    protected _localRotationEuler: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _localMatrix: Matrix4x4 = new Matrix4x4();

    /** @internal */
    protected _position: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _rotation: Quaternion = new Quaternion(0, 0, 0, 1);
    /** @internal */
    protected _scale: Vector3 = new Vector3(1, 1, 1);
    /**@internal */
    protected _rotationEuler: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _worldMatrix: Matrix4x4 = new Matrix4x4();

    /**@internal runtime同步标记*/
    _rtSyncFlag: number = 0;

    /**@internal 如果为true 表示自身相对于父节点并无任何改变，将通过这个参数忽略计算*/
    protected _isDefaultMatrix: boolean = false;
    /**@internal @protected */
    protected _faceInvert: boolean = false;
    /**@internal @protected */
    protected _frontFaceValue: number = 1;

    /**native Share Memory */
    private _nativeMemory: NativeMemory;
    private _nativeFloat32Buffer: Float32Array;
    private _nativeUInt32Buffer: Uint32Array;

    _nativeObj: any;

    constructor(owner: Sprite3D) {

        super(owner);
    }

    protected _initProperty() {
        this._nativeMemory = new NativeMemory(RTTransform3D.TRANSFORM_SHARE_MEMORY_SIZE * 4, false);
        this._nativeFloat32Buffer = this._nativeMemory.float32Array;
        this._nativeUInt32Buffer = this._nativeMemory.Uint32Array;
        this._nativeObj = new (window as any).conchRTTransform(this._nativeMemory._buffer);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE | Transform3D.TRANSFORM_WORLDMATRIX, true);
        this.rotation = this._rotation;
        this.localScale = this._localScale;
        this.setWorldLossyScale(this._scale);
        this.localRotation = this._localRotation;
    }

    /**
     * 是否未DefaultMatrix
     */
    get isDefaultMatrix(): boolean {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
            let localMat = this.localMatrix;
        }
        return this._isDefaultMatrix;
    }

    /**
     * @internal
     */
    protected _setTransformFlag(type: number, value: boolean): void {

        this._nativeObj.setTransformFlag(type, value);
    }
    /**
     * @internal
     */
    protected _getTransformFlag(type: number): boolean {
        return (this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET] & type) != 0;
    }

    /**
     * @internal
     */
    protected _getRTSyncFlag(type: number): boolean {
        return (this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET] & type) != 0;
    }

    protected _setRTSyncFlag(type: number, value: boolean): void {
        let flag = this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET];
        if (value)
            flag |= type;
        else
            flag &= ~type;
        this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET] = flag;
    }

    get _RTtransformFlag() {
        return this._nativeUInt32Buffer[RTTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET];
    }

    /**
     * 局部位置X轴分量。
     */
    get localPositionX(): number {
        return this.localPosition.x;
    }

    set localPositionX(x: number) {
        let localPos = this.localPosition;
        localPos.x = x;
        this.localPosition = localPos;
    }

    /**
     * 局部位置Y轴分量。
     */
    get localPositionY(): number {
        return this.localPosition.y;
    }

    set localPositionY(y: number) {
        let localPos = this.localPosition;
        localPos.y = y;
        this.localPosition = localPos;
    }

    /**
     * 局部位置Z轴分量。
     */
    get localPositionZ(): number {
        return this.localPosition.z;
    }

    set localPositionZ(z: number) {
        let localPos = this.localPosition;
        localPos.z = z;
        this.localPosition = localPos;
    }

    /**
     * 局部位置。
     */
    get localPosition(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALPOS)) {//parent==null
            this._nativeObj.getLocalPosition();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALPOS)) {
            let index = RTTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
            this._localPosition.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALPOS, false);
        }
        return this._localPosition;
    }

    set localPosition(value: Vector3) {
        let index = RTTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeObj.setLocalPosition();
        this._onWorldPositionTransform();
    }

    /**
     * 局部旋转。
     */
    get localRotation(): Quaternion {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
            this._nativeObj.getLocalRotation();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
            let index = RTTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
            this._localRotation.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2], this._nativeFloat32Buffer[index + 3]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        }
        return this._localRotation;
    }

    set localRotation(value: Quaternion) {
        value.normalize(this._localRotation);
        let index = RTTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeFloat32Buffer[index + 3] = value.w;
        this._nativeObj.setLocalRotation();
        this._onWorldRotationTransform();
    }

    /**
     * 局部缩放X。
     */
    get localScaleX(): number {
        return this.localScale.x;
    }

    set localScaleX(value: number) {
        let scale = this.localScale;
        scale.x = value;
        this.localScale = scale;
    }

    /**
     * 局部缩放Y。
     */
    get localScaleY(): number {
        return this.localScale.y;
    }

    set localScaleY(value: number) {
        let scale = this.localScale;
        scale.y = value;
        this.localScale = scale;
    }

    /**
     * 局部缩放Z。
     */
    get localScaleZ(): number {
        return this.localScale.z;
    }

    set localScaleZ(value: number) {
        let scale = this.localScale;
        scale.z = value;
        this.localScale = scale;
    }


    /**
     * 局部缩放。
     */
    get localScale(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALPOS)) {//parent==null
            this._nativeObj.getLocalScale();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALSCALE)) {
            let index = RTTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
            this._localScale.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALSCALE, false);
        }
        return this._localScale;
    }

    set localScale(value: Vector3) {
        let index = RTTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeObj.setLocalScale();
        this._onWorldScaleTransform();
    }

    /**
     * 局部空间欧拉角。
     */
    get localRotationEuler(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            this._nativeObj.getLocalRotationEuler();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            let index = RTTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET;
            this._localRotationEuler.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        }
        return this._localRotationEuler;
    }

    set localRotationEuler(value: Vector3) {
        let index = RTTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeObj.setLocalRotationEuler();
        this._onWorldRotationTransform();
    }

    /**
     * 局部矩阵。
     */
    get localMatrix(): Matrix4x4 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
            this._nativeObj.getLocalMatrix()
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            let index = RTTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET;
            for (var i = 0; i < 16; ++i) {
                this._localMatrix.elements[i] = this._nativeFloat32Buffer[i + index];
            }
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        }
        return this._localMatrix;
    }

    set localMatrix(value: Matrix4x4) {
        let index = RTTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET;
        this._nativeFloat32Buffer.set(value.elements, index);
        this._nativeObj.setLocalMatrix();
        this._isDefaultMatrix = value.isIdentity();
        this._onWorldTransform();
    }


    /**
     * 世界位置。
     */
    get position(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._nativeObj.getPosition();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            let index = RTTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET;
            this._position.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
        }
        return this._position;
    }

    set position(value: Vector3) {
        let index = RTTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeObj.setPosition();
        this._onWorldPositionTransform();
    }

    /**
     * 世界旋转。
     */
    get rotation(): Quaternion {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            this._nativeObj.getRotation()
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            let index = RTTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET;
            this._rotation.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2], this._nativeFloat32Buffer[index + 3]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
        }
        return this._rotation;
    }

    set rotation(value: Quaternion) {
        let index = RTTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeFloat32Buffer[index + 3] = value.w;
        this._nativeObj.setRotation();
        this._onWorldRotationTransform();
    }


    /**
     * 世界空间的旋转角度，顺序为x、y、z。
     */
    get rotationEuler(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._nativeObj.getRotationEuler()
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            let index = RTTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET;
            this._rotationEuler.setValue(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDEULER, false);
        }
        return this._rotationEuler;
    }

    set rotationEuler(value: Vector3) {
        let index = RTTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeObj.setRotationEuler();
        this._onWorldRotationTransform();

    }


    /**
     * 世界矩阵。
     */
    get worldMatrix(): Matrix4x4 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
            this._nativeObj.getWorldMatrix();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
            let index = RTTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET;
            for (var i = 0; i < 16; ++i) {
                this._worldMatrix.elements[i] = this._nativeFloat32Buffer[i + index];
            }
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
        }
        return this._worldMatrix;
    }

    set worldMatrix(value: Matrix4x4) {
        let index = RTTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET;
        this._nativeFloat32Buffer.set(value.elements, index);
        this._nativeObj.setWorldMatrix();
        this._onWorldTransform();
    }



    /**
     * @internal
     */
    _setParent(value: Transform3D): void {
        super._setParent(value);
        this._nativeObj.setParent(value ? (value as any)._nativeObj : null);
    }

    //override
    //_getScaleMatrix(): Matrix3x3 {

    /**
     * @internal
     */
    protected _onWorldPositionRotationTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this._RTtransformFlag);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            (this._children[i] as RTTransform3D)._onWorldPositionRotationTransform();
    }

    /**
     * @internal
     */
    protected _onWorldPositionScaleTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._RTtransformFlag);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            (this._children[i] as RTTransform3D)._onWorldPositionScaleTransform();
    }

    /**
     * @internal
     */
    protected _onWorldPositionTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION, true);
            this.event(Event.TRANSFORM_CHANGED, this._RTtransformFlag);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            (this._children[i] as RTTransform3D)._onWorldPositionTransform();
    }

    /**
     * @internal
     */
    protected _onWorldRotationTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this._RTtransformFlag);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            (this._children[i] as RTTransform3D)._onWorldPositionRotationTransform();//父节点旋转发生变化，子节点的世界位置和旋转都需要更新
    }

    /**
     * @internal
     */
    protected _onWorldScaleTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._RTtransformFlag);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            (this._children[i] as RTTransform3D)._onWorldPositionScaleTransform();//父节点缩放发生变化，子节点的世界位置和缩放都需要更新
    }

    /**
     * @internal
     */
    _onWorldTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this._RTtransformFlag);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            this._children![i]._onWorldTransform();
    }

    /**
     * 平移变换。
     * @param 	translation 移动距离。
     * @param 	isLocal 是否局部空间。
     */
    translate(translation: Vector3, isLocal: boolean = true): void {
        if (isLocal) {
            Matrix4x4.createFromQuaternion(this.localRotation, Transform3D._tempMatrix0);
            Vector3.transformCoordinate(translation, Transform3D._tempMatrix0, Transform3D._tempVector30);
            Vector3.add(this.localPosition, Transform3D._tempVector30, this._localPosition);
            this.localPosition = this._localPosition;
        } else {
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
    rotate(rotation: Vector3, isLocal: boolean = true, isRadian: boolean = true): void {
        var rot: Vector3;
        if (isRadian) {
            rot = rotation;
        } else {
            Vector3.scale(rotation, Math.PI / 180.0, Transform3D._tempVector30);
            rot = Transform3D._tempVector30;
        }

        Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, Transform3D._tempQuaternion0);
        if (isLocal) {
            Quaternion.multiply(this.localRotation, Transform3D._tempQuaternion0, this._localRotation);
            this.localRotation = this._localRotation;
        } else {
            Quaternion.multiply(Transform3D._tempQuaternion0, this.rotation, this._rotation);
            this.rotation = this._rotation;
        }
    }

    getWorldLossyScale(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._nativeObj.getWorldLossyScale();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            let index = RTTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET;
            this._scale.set(this._nativeFloat32Buffer[index], this._nativeFloat32Buffer[index + 1], this._nativeFloat32Buffer[index + 2]);
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
        }
        return this._scale;
    }

    setWorldLossyScale(value: Vector3): void {
        let index = RTTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET;
        this._nativeFloat32Buffer[index] = value.x;
        this._nativeFloat32Buffer[index + 1] = value.y;
        this._nativeFloat32Buffer[index + 2] = value.z;
        this._nativeObj.setWorldLossyScale();
    }
}