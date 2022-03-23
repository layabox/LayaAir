import { EventDispatcher } from "../../../events/EventDispatcher"
import { Event } from "../../../events/Event";
import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Matrix4x4 } from "../../../d3/math/Matrix4x4";
import { Quaternion } from "../../../d3/math/Quaternion";
import { Vector3 } from "../../../d3/math/Vector3";
import { NataiveMemory } from "./CommonMemory/NativeMemory";
import { Matrix3x3 } from "../../../d3/math/Matrix3x3";
import { MathUtils3D } from "../../../d3/math/MathUtils3D";

/**
 * 共享BufferTransform3D
 */
export class Transform3DNative extends EventDispatcher {

    /**temp data */
    /** @internal */
    private static _tempVector30: Vector3 = new Vector3();
    /** @internal */
    private static _tempVector31: Vector3 = new Vector3();
    /** @internal */
    private static _tempQuaternion0: Quaternion = new Quaternion();
    /** @internal */
    private static _tempQuaternion1: Quaternion = new Quaternion();
    /** @internal */
    private static _tempMatrix0: Matrix4x4 = new Matrix4x4();
    /** @internal */
    private static _tempMatrix3x30: Matrix3x3 = new Matrix3x3();
    /** @internal */
    private static _tempMatrix3x31: Matrix3x3 = new Matrix3x3();
    /** @internal */
    private static _tempMatrix3x32: Matrix3x3 = new Matrix3x3();
    /** @internal */
    private static _tempMatrix3x33: Matrix3x3 = new Matrix3x3();

    /**@internal */
    private static _angleToRandin: number = 180 / Math.PI;
    /**TransForm Update Flag */
    /**@internal */
    static TRANSFORM_LOCALQUATERNION: number = 0x01;
    /**@internal */
    static TRANSFORM_LOCALEULER: number = 0x02;
    /**@internal */
    static TRANSFORM_LOCALMATRIX: number = 0x04;
    /**@internal */
    static TRANSFORM_WORLDPOSITION: number = 0x08;
    /**@internal */
    static TRANSFORM_WORLDQUATERNION: number = 0x10;
    /**@internal */
    static TRANSFORM_WORLDSCALE: number = 0x20;
    /**@internal */
    static TRANSFORM_WORLDMATRIX: number = 0x40;
    /**@internal */
    static TRANSFORM_WORLDEULER: number = 0x80;
    /**@internal */
    static TRANSFORM_LOCAL_MATRIX_NATIVE_CHANGE = 0x100;
    /**@internal */
    static TRANSFORM_WORLD_MATRIX_NATIVE_CHANGE = 0x100;

    /**TransForm Data Stride */
    static Transform_Stride_UpdateFlag: number = 0;
    static Transform_Stride_localPos: number = 1;
    static Transform_Stride_localQuaternion: number = 4;
    static Transform_Stride_localScale: number = 8;
    static Transform_Stride_worldPos: number = 11;
    static Transform_Stride_worldQuaternion: number = 14;
    static Transform_Stride_worldScale: number = 18;
    static Transform_Stride_localMatrix: number = 21;
    static Transform_Stride_WorldMatrix: number = 37;
    static Transform_Stride_Parent: number = 53;

    static Transform_MemoryBlock_size: number = 54;

    /**native Share Memory */

    private nativeMemory: NataiveMemory;
    private transFormArray: Float32Array;

    /** @internal */
    private _localPosition: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    private _localRotation: Quaternion = new Quaternion(0, 0, 0, 1);
    /** @internal */
    private _localScale: Vector3 = new Vector3(1, 1, 1);
    /**@internal */
    private _localRotationEuler: Vector3 = new Vector3(0, 0, 0);
    /** @internal Native*/
    private _localMatrix: Matrix4x4 = new Matrix4x4();

    /** @internal */
    private _position: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    private _rotation: Quaternion = new Quaternion(0, 0, 0, 1);
    /** @internal */
    private _scale: Vector3 = new Vector3(1, 1, 1);
    /**@internal */
    private _rotationEuler: Vector3 = new Vector3(0, 0, 0);
    /** @internal Native*/
    private _worldMatrix: Matrix4x4 = new Matrix4x4();
    /**@internal */
    private _owner: Sprite3D;
    /** @internal */
    private _children: Transform3DNative[] | null = null;
    /**@internal 如果为true 表示自身相对于父节点并无任何改变，将通过这个参数忽略计算*/
    private _isDefaultMatrix: boolean = false;
    /**@internal Native*/
    nativeTransformID:number = 0;
    /** @internal Native*/
    _parent: Transform3DNative | null = null;

    /**
     * @internal
     * native
     * 是否是单位矩阵，用来优化无效矩阵运算
     */
    get isDefaultMatrix(): boolean {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_LOCALMATRIX)) {
            let localMat = this.localMatrix;
        }
        return this._isDefaultMatrix;
    }

    /**
     * @internal
     * native
     */
    get _isFrontFaceInvert(): boolean {
        var scale: Vector3 = this.getWorldLossyScale();
        var isInvert: boolean = scale.x < 0;
        (scale.y < 0) && (isInvert = !isInvert);
        (scale.z < 0) && (isInvert = !isInvert);
        return isInvert;
    }

    /**
     * 所属精灵。
     */
    get owner(): Sprite3D {
        return this._owner;
    }

    /**
     * 世界矩阵是否需要更新。
     */
    get worldNeedUpdate(): boolean {
        return this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX);
    }

    /**
     * 局部位置。
     * native
     */
    get localPosition(): Vector3 {
        return this._localPosition;
    }

    set localPosition(value: Vector3) {
        if (this._localPosition !== value) {
            value.cloneTo(this._localPosition);
            const offset = Transform3DNative.Transform_Stride_localPos;
            this.transFormArray[offset] = value.x;
            this.transFormArray[offset + 1] = value.y;
            this.transFormArray[offset + 2] = value.z;
        }
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALMATRIX, true);
        this._onWorldPositionTransform();
    }

    /**
     * 局部旋转。
     * native
     */
    get localRotation(): Quaternion {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_LOCALQUATERNION)) {
            var eulerE: Vector3 = this._localRotationEuler;
            Quaternion.createFromYawPitchRoll(eulerE.y / Transform3DNative._angleToRandin, eulerE.x / Transform3DNative._angleToRandin, eulerE.z / Transform3DNative._angleToRandin, this._localRotation);
            const offset = Transform3DNative.Transform_Stride_localQuaternion;
            this.transFormArray[offset] = this._localRotation.x;
            this.transFormArray[offset + 1] = this._localRotation.y;
            this.transFormArray[offset + 2] = this._localRotation.z;
            this.transFormArray[offset + 3] = this._localRotation.w;
            this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALQUATERNION, false);
        }
        return this._localRotation;
    }

    set localRotation(value: Quaternion) {
        if (this._localRotation !== value) {
            value.cloneTo(this._localRotation);
            this._localRotation.normalize(this._localRotation);
            const offset = Transform3DNative.Transform_Stride_localQuaternion;
            this.transFormArray[offset] = this._localRotation.x;
            this.transFormArray[offset + 1] = this._localRotation.y;
            this.transFormArray[offset + 2] = this._localRotation.z;
            this.transFormArray[offset + 3] = this._localRotation.w;
        }
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALEULER | Transform3DNative.TRANSFORM_LOCALMATRIX, true);
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALQUATERNION, false);
        this._onWorldRotationTransform();
    }

    /**
     * 局部缩放。
     * native
     */
    get localScale(): Vector3 {
        return this._localScale;
    }

    set localScale(value: Vector3) {
        if (this._localScale !== value) {
            value.cloneTo(this._localScale);
            const offset = Transform3DNative.Transform_Stride_localScale;
            this.transFormArray[offset] = value.x;
            this.transFormArray[offset + 1] = value.y;
            this.transFormArray[offset + 2] = value.z;
        }
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALMATRIX, true);
        this._onWorldScaleTransform();
    }

    /**
     * 局部空间欧拉角。
     * native
     */
    get localRotationEuler(): Vector3 {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_LOCALEULER)) {
            this._localRotation.getYawPitchRoll(Transform3DNative._tempVector30);
            var euler: Vector3 = Transform3DNative._tempVector30;
            var localRotationEuler: Vector3 = this._localRotationEuler;
            localRotationEuler.x = euler.y * Transform3DNative._angleToRandin;
            localRotationEuler.y = euler.x * Transform3DNative._angleToRandin;
            localRotationEuler.z = euler.z * Transform3DNative._angleToRandin;
            this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALEULER, false);
        }
        return this._localRotationEuler;
    }

    set localRotationEuler(value: Vector3) {
        if (this._localRotationEuler !== value) {
            value.cloneTo(this._localRotationEuler);
        }

        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALEULER, false);
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALQUATERNION | Transform3DNative.TRANSFORM_LOCALMATRIX, true);
        this._onWorldRotationTransform();
    }


    /**
     * 局部矩阵。
     * native
     */
    get localMatrix(): Matrix4x4 {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_LOCALMATRIX)) {
            Matrix4x4.createAffineTransformation(this._localPosition, this._localRotation, this._localScale, Transform3DNative._tempMatrix0);
            this.localMatrix = Transform3DNative._tempMatrix0;
            this._isDefaultMatrix = this._localMatrix.isIdentity();
            this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALMATRIX, false);
            this._setTransformFlag(Transform3DNative.TRANSFORM_LOCAL_MATRIX_NATIVE_CHANGE, false)
            //native todo  this._setTransformFlag(Transform3DNative.TRANSFORM_LOCAL_MATRIX_NATIVE_CHANGE, true)
        } else if (this._getTransformFlag(Transform3DNative.TRANSFORM_LOCAL_MATRIX_NATIVE_CHANGE)) {
            //update native Data
            let elements: Float32Array = this._localMatrix.elements;//更新native数据到js
            let array = this.transFormArray;
            let offset = Transform3DNative.Transform_Stride_localMatrix;
            for (let i = 0; i < 16; i++, offset++) {
                elements[i] = array[offset];
            }
            this._setTransformFlag(Transform3DNative.TRANSFORM_LOCAL_MATRIX_NATIVE_CHANGE, false);
        }
        return this._localMatrix;
    }

    set localMatrix(value: Matrix4x4) {
        if (this._localMatrix !== value) {
            value.cloneTo(this._localMatrix);
            //update native data
            let array = this.transFormArray;
            let offset = Transform3DNative.Transform_Stride_localMatrix;
            array.set(value.elements, offset);
        }

        this._isDefaultMatrix = this._localMatrix.isIdentity();
        this._localMatrix.decomposeTransRotScale(this._localPosition, this._localRotation, this._localScale);
        //更新native数据
        this.updateNativeV3(Transform3DNative.Transform_Stride_localPos,this._localPosition);
        this.updateNativeV3(Transform3DNative.Transform_Stride_localScale,this._localScale);
        this.updateNativeQ4(Transform3DNative.Transform_Stride_localQuaternion,this._localRotation);
        
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALEULER, true);
        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALMATRIX, false);
        this._onWorldTransform();
    }

    /**
     * 世界位置。
     * native
     */
    get position(): Vector3 {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION)) {
            if (this._parent != null) {
                var worldMatE = this.worldMatrix.elements;
                let pos = Transform3DNative._tempVector30;
                pos.x = worldMatE[12];
                pos.y = worldMatE[13];
                pos.z = worldMatE[14];
                this.position = pos;
            } else {
                this._localPosition.cloneTo(this._position);
                this.updateNativeV3(Transform3DNative.Transform_Stride_worldPos,this._position);
            }
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION, false);
        }
        return this._position;
    }

    set position(value: Vector3) {
        if (this._parent != null) {
            var parentInvMat: Matrix4x4 = Transform3DNative._tempMatrix0;
            this._parent.worldMatrix.invert(parentInvMat);
            Vector3.transformCoordinate(value, parentInvMat, this._localPosition);
            this.updateNativeV3(Transform3DNative.Transform_Stride_localPos,this._localPosition);
        }
        else {
            value.cloneTo(this._localPosition);
            this.updateNativeV3(Transform3DNative.Transform_Stride_localPos,value);
        }
        this.localPosition = this._localPosition;
        if (this._position !== value) {
            value.cloneTo(this._position);
            let offset = Transform3DNative.Transform_Stride_worldPos;
            this.transFormArray[offset] = value.x;
            this.transFormArray[offset + 1] = value.y;
            this.transFormArray[offset + 2] = value.z;
        }
        this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION, false);
    }



    /**
     * 世界旋转。
     * native
     */
    get rotation(): Quaternion {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDQUATERNION)) {
            if (this._parent != null) {
                Quaternion.multiply(this._parent.rotation, this.localRotation, Transform3DNative._tempQuaternion0);//使用localRotation不使用_localRotation,内部需要计算
                this.rotation = Transform3DNative._tempQuaternion0;
            }
            else
                this.rotation = this.localRotation;
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDQUATERNION, false);
        }
        return this._rotation;
    }

    set rotation(value: Quaternion) {
        if (this._parent != null) {
            this._parent.rotation.invert(Transform3DNative._tempQuaternion0);
            Quaternion.multiply(Transform3DNative._tempQuaternion0, value, Transform3DNative._tempQuaternion1);
            this.localRotation = Transform3DNative._tempQuaternion1;
        } else {
            this.localRotation = value;
        }

        if (value !== this._rotation) {
            value.cloneTo(this._rotation);
            let offset = Transform3DNative.Transform_Stride_worldQuaternion;
            let array = this.transFormArray;
            array[offset] = value.x;
            array[offset + 1] = value.y;
            array[offset + 2] = value.z;
            array[offset + 3] = value.w;
        }


        this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDQUATERNION, false);
    }


    /**
     * 世界空间的旋转角度，顺序为x、y、z。
     */
    get rotationEuler(): Vector3 {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDEULER)) {
            this.rotation.getYawPitchRoll(Transform3DNative._tempVector30);//使用rotation属性,可能需要更新
            var eulerE: Vector3 = Transform3DNative._tempVector30;
            var rotationEulerE: Vector3 = this._rotationEuler;
            rotationEulerE.x = eulerE.y * Transform3DNative._angleToRandin;
            rotationEulerE.y = eulerE.x * Transform3DNative._angleToRandin;
            rotationEulerE.z = eulerE.z * Transform3DNative._angleToRandin;
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDEULER, false);
        }
        return this._rotationEuler;
    }

    set rotationEuler(value: Vector3) {
        Quaternion.createFromYawPitchRoll(value.y / Transform3DNative._angleToRandin, value.x / Transform3DNative._angleToRandin, value.z / Transform3DNative._angleToRandin, Transform3DNative._tempQuaternion0);
        this.rotation = Transform3DNative._tempQuaternion0;
        if (this._rotationEuler !== value)
            value.cloneTo(this._rotationEuler);

        this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDEULER, false);
    }

    /**
     * 世界矩阵。
     * native
     */
    get worldMatrix(): Matrix4x4 {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX)) {
            if (this._parent != null) {
                //这里将剔除单位矩阵的计算
                let effectiveTrans = this._parent;

                while (effectiveTrans._parent && effectiveTrans.isDefaultMatrix) {
                    effectiveTrans = effectiveTrans._parent;
                }
                Matrix4x4.multiply(effectiveTrans.worldMatrix, this.localMatrix, Transform3DNative._tempMatrix0);
                this.worldMatrix = Transform3DNative._tempMatrix0;
            }
            else
                this.worldMatrix = this.localMatrix;
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX, false);
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLD_MATRIX_NATIVE_CHANGE, false);
            //native TODO this._setTransformFlag(Transform3DNative.TRANSFORM_WORLD_MATRIX_NATIVE_CHANGE, true);
        }else if(this._getTransformFlag(Transform3DNative.TRANSFORM_WORLD_MATRIX_NATIVE_CHANGE)){
             //update native Data
             let elements: Float32Array = this._worldMatrix.elements;//更新native数据到js
             let array = this.transFormArray;
             let offset = Transform3DNative.Transform_Stride_WorldMatrix;
             for (let i = 0; i < 16; i++, offset++) {
                 elements[i] = array[offset];
             }
             this._setTransformFlag(Transform3DNative.TRANSFORM_WORLD_MATRIX_NATIVE_CHANGE, false);
        }
        return this._worldMatrix;
    }

    set worldMatrix(value: Matrix4x4) {
        if (this._parent === null) {
            this.localMatrix = value;
        } else {
            this._parent.worldMatrix.invert(Transform3DNative._tempMatrix0);
            Matrix4x4.multiply(Transform3DNative._tempMatrix0, value, Transform3DNative._tempMatrix0);
            this.localMatrix = Transform3DNative._tempMatrix0;
        }

        if (this._worldMatrix !== value){
            value.cloneTo(this._worldMatrix);
            //update native Data
            let elements: Float32Array = this._worldMatrix.elements;//更新native数据到js
            let array = this.transFormArray;
            let offset = Transform3DNative.Transform_Stride_WorldMatrix;
            array.set(elements,offset);
        }
            

        this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX, false);
    }

    /**
     * 创建一个 <code>Transform3D</code> 实例。
     * native
     * @param owner 所属精灵。
     */
    constructor(owner: Sprite3D) {
        super();
        this._owner = owner;
        this._children = [];
        //native memory
        this.nativeMemory = new NataiveMemory(Transform3DNative.Transform_MemoryBlock_size * 4);
        this.transFormArray = this.nativeMemory.float32Array;
        //native object TODO
        this.nativeTransformID = 0;

        this._setTransformFlag(Transform3DNative.TRANSFORM_LOCALQUATERNION | Transform3DNative.TRANSFORM_LOCALEULER | Transform3DNative.TRANSFORM_LOCALMATRIX, false);
        this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION | Transform3DNative.TRANSFORM_WORLDQUATERNION | Transform3DNative.TRANSFORM_WORLDEULER | Transform3DNative.TRANSFORM_WORLDSCALE | Transform3DNative.TRANSFORM_WORLDMATRIX, true);
    }

    private updateNativeV3(offset: number, data: Vector3) {
        let array = this.transFormArray;
        array[offset] = data.x;
        array[offset + 1] = data.y;
        array[offset + 2] = data.z;
    }

    private updateNativeQ4(offset: number, data: Quaternion) {
        let array = this.transFormArray;
        array[offset] = data.x;
        array[offset + 1] = data.y;
        array[offset + 2] = data.z;
        array[offset + 3] = data.w;
    }

    /**
     * @internal
     * native
     */
    private _getScaleMatrix(): Matrix3x3 {
        var invRotation: Quaternion = Transform3DNative._tempQuaternion0;
        var invRotationMat: Matrix3x3 = Transform3DNative._tempMatrix3x30;
        var worldRotScaMat: Matrix3x3 = Transform3DNative._tempMatrix3x31;
        var scaMat: Matrix3x3 = Transform3DNative._tempMatrix3x32;
        Matrix3x3.createFromMatrix4x4(this.worldMatrix, worldRotScaMat)
        this.rotation.invert(invRotation);
        Matrix3x3.createRotationQuaternion(invRotation, invRotationMat);
        Matrix3x3.multiply(invRotationMat, worldRotScaMat, scaMat);
        return scaMat;
    }

    /**
     * @internal
     * native
     */
    _getTransformFlag(type: number): boolean {
        return (this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag] & type) != 0;
    }

    /**
     * @internal
     * native
     */
    _setTransformFlag(type: number, value: boolean): void {
        if (value)
            this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag] |= type;
        else
            this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag] &= ~type;
    }

    /**
     * @internal
     * native
     */
    _setParent(value: Transform3DNative): void {
        if (this._parent !== value) {
            if (this._parent) {
                var parentChilds: Transform3DNative[] = this._parent._children!;
                var index: number = parentChilds.indexOf(this);
                parentChilds.splice(index, 1);
            }
            if (value) {
                value._children!.push(this);
                (value) && (this._onWorldTransform());
            }
            this._parent = value;
            //update native Data
            this.transFormArray[Transform3DNative.Transform_Stride_Parent] = value.nativeTransformID;
        }
    }

    /**
     * @internal
     * native
     */
    private _onWorldPositionRotationTransform(): void {
        if (!this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX | Transform3DNative.TRANSFORM_WORLDPOSITION | Transform3DNative.TRANSFORM_WORLDQUATERNION | Transform3DNative.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag]);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            this._children![i]._onWorldPositionRotationTransform();
    }

    /**
     * @internal
     * native
     */
    private _onWorldPositionScaleTransform(): void {
        if (!this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX | Transform3DNative.TRANSFORM_WORLDPOSITION | Transform3DNative.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag]);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            this._children![i]._onWorldPositionScaleTransform();
    }

    /**
     * @internal
     * native
     */
    private _onWorldPositionTransform(): void {
        if (!this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION)) {
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX | Transform3DNative.TRANSFORM_WORLDPOSITION, true);
            this.event(Event.TRANSFORM_CHANGED, this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag]);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            this._children![i]._onWorldPositionTransform();
    }

    /**
     * @internal
     * native
     */
    private _onWorldRotationTransform(): void {
        if (!this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX | Transform3DNative.TRANSFORM_WORLDQUATERNION | Transform3DNative.TRANSFORM_WORLDEULER, true);
            this.event(Event.TRANSFORM_CHANGED, this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag]);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            this._children![i]._onWorldPositionRotationTransform();//父节点旋转发生变化，子节点的世界位置和旋转都需要更新
    }

    /**
     * @internal
     * native
     */
    private _onWorldScaleTransform(): void {
        if (!this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX | Transform3DNative.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag]);
        }
        for (var i: number = 0, n: number = this._children!.length; i < n; i++)
            this._children![i]._onWorldPositionScaleTransform();//父节点缩放发生变化，子节点的世界位置和缩放都需要更新
    }

    /**
     * @internal
     * native
     */
    _onWorldTransform(): void {
        if (!this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDMATRIX | Transform3DNative.TRANSFORM_WORLDPOSITION | Transform3DNative.TRANSFORM_WORLDQUATERNION | Transform3DNative.TRANSFORM_WORLDEULER | Transform3DNative.TRANSFORM_WORLDSCALE, true);
            this.event(Event.TRANSFORM_CHANGED, this.transFormArray[Transform3DNative.Transform_Stride_UpdateFlag]);
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
            Matrix4x4.createFromQuaternion(this.localRotation, Transform3DNative._tempMatrix0);
            Vector3.transformCoordinate(translation, Transform3DNative._tempMatrix0, Transform3DNative._tempVector30);
            Vector3.add(this.localPosition, Transform3DNative._tempVector30, Transform3DNative._tempVector30);
            this.localPosition = Transform3DNative._tempVector30;
        } else {
            Vector3.add(this.position, translation, Transform3DNative._tempVector30);
            this.position = Transform3DNative._tempVector30;
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
            Vector3.scale(rotation, Math.PI / 180.0, Transform3DNative._tempVector30);
            rot = Transform3DNative._tempVector30;
        }

        Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, Transform3DNative._tempQuaternion0);
        if (isLocal) {
            Quaternion.multiply(this._localRotation, Transform3DNative._tempQuaternion0, Transform3DNative._tempQuaternion0);
            this.localRotation = Transform3DNative._tempQuaternion0;
        } else {
            Quaternion.multiply(Transform3DNative._tempQuaternion0, this.rotation, Transform3DNative._tempQuaternion1);
            this.rotation = Transform3DNative._tempQuaternion1;
        }
    }

    /**
     * 获取向前方向。
     * @param forward 前方向。
     */
    getForward(forward: Vector3): void {
        var worldMatElem: Float32Array = this.worldMatrix.elements;
        forward.x = -worldMatElem[8];
        forward.y = -worldMatElem[9];
        forward.z = -worldMatElem[10];
    }

    /**
     * 获取向上方向。
     * @param up 上方向。
     */
    getUp(up: Vector3): void {
        var worldMatElem: Float32Array = this.worldMatrix.elements;
        up.x = worldMatElem[4];
        up.y = worldMatElem[5];
        up.z = worldMatElem[6];
    }

    /**
     * 获取向右方向。
     * @param 右方向。
     */
    getRight(right: Vector3): void {
        var worldMatElem: Float32Array = this.worldMatrix.elements;
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
    lookAt(target: Vector3, up: Vector3, isLocal: boolean = false, isCamera: boolean = true): void {
        var eye: Vector3;
        if (isLocal) {
            eye = this._localPosition;
            if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
                return;
            if (isCamera) {
                Quaternion.lookAt(this._localPosition, target, up, Transform3DNative._tempQuaternion0);
                Transform3DNative._tempQuaternion0.invert(Transform3DNative._tempQuaternion0);
                this.localRotation = Transform3DNative._tempQuaternion0;
            } else {
                Vector3.subtract(this.localPosition, target, Transform3DNative._tempVector30);
                Quaternion.rotationLookAt(Transform3DNative._tempVector30, up, Transform3DNative._tempQuaternion0);
            }
            this.localRotation = Transform3DNative._tempQuaternion0;
        } else {
            var worldPosition: Vector3 = this.position;
            eye = worldPosition;
            if (Math.abs(eye.x - target.x) < MathUtils3D.zeroTolerance && Math.abs(eye.y - target.y) < MathUtils3D.zeroTolerance && Math.abs(eye.z - target.z) < MathUtils3D.zeroTolerance)
                return;
            if (isCamera) {
                Quaternion.lookAt(worldPosition, target, up, Transform3DNative._tempQuaternion0);
                Transform3DNative._tempQuaternion0.invert(Transform3DNative._tempQuaternion0);
                this.rotation = Transform3DNative._tempQuaternion0;
            } else {
                Vector3.subtract(this.position, target, Transform3DNative._tempVector30);
                Quaternion.rotationLookAt(Transform3DNative._tempVector30, up, Transform3DNative._tempQuaternion0);
                this.rotation = Transform3DNative._tempQuaternion0;
            }
        }
    }

    /**
     * Native
     * 世界缩放。
     * 某种条件下获取该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
     * @return	世界缩放。
     */
    getWorldLossyScale(): Vector3 {
        if (this._getTransformFlag(Transform3DNative.TRANSFORM_WORLDSCALE)) {
            if (this._parent !== null) {
                var scaMatE = this._getScaleMatrix().elements;
                this._scale.x = scaMatE[0];
                this._scale.y = scaMatE[4];
                this._scale.z = scaMatE[8];
            }
            else {
                this._localScale.cloneTo(this._scale);
            }
            //update Native data
            {
                const offset = Transform3DNative.Transform_Stride_worldScale;
                const array = this.transFormArray;
                array[offset] = this._scale.x;
                array[offset+1] = this._scale.y;
                array[offset+2] = this._scale.z;
            }
            this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDSCALE, false);
        }
        return this._scale;
    }

    /**
     * 设置世界缩放。
     * 某种条件下设置该值可能不正确（例如：父节点有缩放，子节点有旋转），缩放会倾斜，无法使用Vector3正确表示,必须使用Matrix3x3矩阵才能正确表示。
     * @return	世界缩放。
     */
    setWorldLossyScale(value: Vector3) {
        if (this._parent !== null) {
            var scaleMat: Matrix3x3 = Transform3DNative._tempMatrix3x33;
            var localScaleMat: Matrix3x3 = Transform3DNative._tempMatrix3x33;
            var localScaleMatE: Float32Array = localScaleMat.elements;
            var parInvScaleMat: Matrix3x3 = this._parent._getScaleMatrix();
            parInvScaleMat.invert(parInvScaleMat);
            Matrix3x3.createFromScaling(value, scaleMat);
            Matrix3x3.multiply(parInvScaleMat, scaleMat, localScaleMat);
            let temv3 = Transform3DNative._tempVector30;
            temv3.x = localScaleMatE[0];
            temv3.y = localScaleMatE[4];
            temv3.z = localScaleMatE[8];
            this.localScale = temv3;

        } else {
            this.localScale = value;
        }
        if (this._scale !== value){
            value.cloneTo(this._scale);
            {
                const offset = Transform3DNative.Transform_Stride_worldScale;
                const array = this.transFormArray;
                array[offset] = this._scale.x;
                array[offset+1] = this._scale.y;
                array[offset+2] = this._scale.z;
            }
        }
            
        this._setTransformFlag(Transform3DNative.TRANSFORM_WORLDSCALE, false);
    }
}