import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NativeMemory } from "../../RenderModuleData/RuntimeModuleData/NativeMemory";

/**
 * LayaX Transform3D — clones RTTransform3D architecture.
 *
 * Uses SharedArrayBuffer for zero-copy TS <-> C++ synchronisation.
 * C++ Transform3D base class handles all math (lazy eval, dirty flags, hierarchy).
 * _onWorldXxx propagation is done in TS (C++ overrides are empty).
 *
 * Additionally, every local data change (pos/rot/scale) is pushed to Rust FFI
 * by the C++ layer automatically (see LayaXTransform.cpp).
 *
 * Native class: `conchLayaXTransform`.
 */
export class LayaXTransform3D extends Transform3D {

    // ---- Shared-memory layout (same as RTTransform3D / JSRTTransform) ----
    static TRANSFORM_LOCALQUATERNION_DATAOFFSET: number = 0;
    static TRANSFORM_LOCALEULER_DATAOFFSET: number = 4;
    static TRANSFORM_LOCALPOS_DATAOFFSET: number = 7;
    static TRANSFORM_LOCALSCALE_DATAOFFSET: number = 10;
    static TRANSFORM_LOCALMATRIX_DATAOFFSET: number = 13;
    static TRANSFORM_WORLDQUATERNION_DATAOFFSET: number = 29;
    static TRANSFORM_WORLDEULER_DATAOFFSET: number = 33;
    static TRANSFORM_WORLDPOS_DATAOFFSET: number = 36;
    static TRANSFORM_WORLDSCALE_DATAOFFSET: number = 39;
    static TRANSFORM_WORLDMATRIX_DATAOFFSET: number = 42;
    static TRANSFORM_CHANGEFLAG_DATAOFFSET: number = 58;
    static TRANSFORM_RT_SYNC_FLAG_DATAOFFSET: number = 59;
    static TRANSFORM_SHARE_MEMORY_SIZE: number = 60;

    /** @internal */
    protected _owner: Sprite3D;

    /** @internal */
    protected _localPosition: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _localRotation: Quaternion = new Quaternion(0, 0, 0, 1);
    /** @internal */
    protected _localScale: Vector3 = new Vector3(1, 1, 1);
    /** @internal */
    protected _localRotationEuler: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _localMatrix: Matrix4x4 = new Matrix4x4();

    /** @internal */
    protected _position: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _rotation: Quaternion = new Quaternion(0, 0, 0, 1);
    /** @internal */
    protected _scale: Vector3 = new Vector3(1, 1, 1);
    /** @internal */
    protected _rotationEuler: Vector3 = new Vector3(0, 0, 0);
    /** @internal */
    protected _worldMatrix: Matrix4x4 = new Matrix4x4();

    /** @internal */
    protected _isDefaultMatrix: boolean = false;

    /** @internal native shared memory */
    private _nativeMemory: NativeMemory;
    private _nativeFloat32Buffer: Float32Array;
    private _nativeUInt32Buffer: Uint32Array;

    /** @internal */
    _nativeObj: any;

    /**@internal RTAnimatorFactory._notifyJsTransformChanged 的帧去重标记，整数比对替代 Set 去重 */
    _notifyFrame: number = 0;

    /**@internal 是否挂了 TRANSFORM_CHANGED 监听者，由 onStartListeningToType 维护；无监听者时 _dispatchTransformEvent 跳过 event 调用 */
    _hasTransformChangedListener: boolean = false;

    constructor(owner: Sprite3D) {
        super(owner);
    }

    protected _initProperty(): void {
        this._nativeMemory = new NativeMemory(LayaXTransform3D.TRANSFORM_SHARE_MEMORY_SIZE * 4, false);
        this._nativeFloat32Buffer = this._nativeMemory.float32Array;
        this._nativeUInt32Buffer = this._nativeMemory.Uint32Array;
        this._nativeObj = new (window as any).conchLayaXTransform(this._nativeMemory._buffer);
        this._setTransformFlag(
            Transform3D.TRANSFORM_WORLDPOSITION |
            Transform3D.TRANSFORM_WORLDQUATERNION |
            Transform3D.TRANSFORM_WORLDEULER |
            Transform3D.TRANSFORM_WORLDSCALE |
            Transform3D.TRANSFORM_WORLDMATRIX,
            true
        );
        this.rotation = this._rotation;
        this.localScale = this._localScale;
        this.setWorldLossyScale(this._scale);
        this.localRotation = this._localRotation;
    }

    /**
     * @internal
     * EventDispatcher hook：首次注册某 type 监听时触发。记下是否挂了 TRANSFORM_CHANGED，
     * 让 RTAnimatorFactory._dispatchTransformEvent 跳过无监听者的 transform（不调 event）。
     */
    protected onStartListeningToType(type: string): void {
        super.onStartListeningToType(type);
        if (type === Event.TRANSFORM_CHANGED) this._hasTransformChangedListener = true;
    }

    /**
     * Create Rust ECS entity for self, sync local data to Rust,
     * set parent if exists, then recursively create for all children.
     * Called by external logic (e.g. when node is added to scene).
     */
    createEntity(): void {
        this._nativeObj.createEntity();
    }

    /**
     * Recursively destroy all children entities first, then destroy self.
     * Called by external logic (e.g. when node is removed from scene).
     */
    destroyEntity(): void {
        this._nativeObj.destroyEntity();
    }

    /** @internal */
    activeInScene(): void {
        this.createEntity();
    }

    /** @internal */
    inActiveInScene(): void {
        this.destroyEntity();
    }

    /**
     * Whether the Rust ECS entity has been created and is still alive.
     */
    get isEntityValid(): boolean {
        return this._nativeObj.isEntityValid();
    }

    // ------------------------------------------------------------------
    // Flag operations (read/write shared memory directly)
    // ------------------------------------------------------------------

    get isDefaultMatrix(): boolean {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
            let _ = this.localMatrix;
        }
        return this._isDefaultMatrix;
    }

    /** @internal */
    protected _setTransformFlag(type: number, value: boolean): void {
        super._setTransformFlag(type, value);
        // Write to shared memory, then tell C++ to sync
        let flag = this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET];
        if (value)
            flag |= type;
        else
            flag &= ~type;
        this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET] = flag;
        this._nativeObj.setTransformFlag();
    }

    /** @internal */
    protected _getTransformFlag(type: number): boolean {
        return (this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET] & type) != 0;
    }

    /** @internal */
    protected _getRTSyncFlag(type: number): boolean {
        return (this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET] & type) != 0;
    }

    /** @internal */
    protected _setRTSyncFlag(type: number, value: boolean): void {
        let flag = this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET];
        if (value)
            flag |= type;
        else
            flag &= ~type;
        this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_RT_SYNC_FLAG_DATAOFFSET] = flag;
    }

    get _RTtransformFlag() {
        return this._nativeUInt32Buffer[LayaXTransform3D.TRANSFORM_CHANGEFLAG_DATAOFFSET];
    }

    // ------------------------------------------------------------------
    // Local properties
    // ------------------------------------------------------------------

    get localPositionX(): number { return this.localPosition.x; }
    set localPositionX(x: number) { let v = this.localPosition; v.x = x; this.localPosition = v; }

    get localPositionY(): number { return this.localPosition.y; }
    set localPositionY(y: number) { let v = this.localPosition; v.y = y; this.localPosition = v; }

    get localPositionZ(): number { return this.localPosition.z; }
    set localPositionZ(z: number) { let v = this.localPosition; v.z = z; this.localPosition = v; }

    get localPosition(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALPOS)) {
            this._nativeObj.getLocalPosition();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALPOS)) {
            let idx = LayaXTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
            this._localPosition.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALPOS, false);
        }
        return this._localPosition;
    }

    set localPosition(value: Vector3) {
        let idx = LayaXTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeObj.setLocalPosition();
        this._onWorldPositionTransform();
    }

    get localRotation(): Quaternion {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
            this._nativeObj.getLocalRotation();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALQUATERNION)) {
            let idx = LayaXTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
            this._localRotation.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2],
                this._nativeFloat32Buffer[idx + 3]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        }
        return this._localRotation;
    }

    set localRotation(value: Quaternion) {
        value.normalize(this._localRotation);
        let idx = LayaXTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeFloat32Buffer[idx + 3] = value.w;
        this._nativeObj.setLocalRotation();
        this._onWorldRotationTransform();
    }

    get localScaleX(): number { return this.localScale.x; }
    set localScaleX(v: number) { let s = this.localScale; s.x = v; this.localScale = s; }

    get localScaleY(): number { return this.localScale.y; }
    set localScaleY(v: number) { let s = this.localScale; s.y = v; this.localScale = s; }

    get localScaleZ(): number { return this.localScale.z; }
    set localScaleZ(v: number) { let s = this.localScale; s.z = v; this.localScale = s; }

    get localScale(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALPOS)) {
            this._nativeObj.getLocalScale();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALSCALE)) {
            let idx = LayaXTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
            this._localScale.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALSCALE, false);
        }
        return this._localScale;
    }

    set localScale(value: Vector3) {
        let idx = LayaXTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeObj.setLocalScale();
        this._onWorldScaleTransform();
    }

    get localRotationEuler(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            this._nativeObj.getLocalRotationEuler();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            let idx = LayaXTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET;
            this._localRotationEuler.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        }
        return this._localRotationEuler;
    }

    set localRotationEuler(value: Vector3) {
        let idx = LayaXTransform3D.TRANSFORM_LOCALEULER_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeObj.setLocalRotationEuler();
        this._onWorldRotationTransform();
    }

    get localMatrix(): Matrix4x4 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX)) {
            this._nativeObj.getLocalMatrix();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER)) {
            let idx = LayaXTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET;
            for (let i = 0; i < 16; ++i) {
                this._localMatrix.elements[i] = this._nativeFloat32Buffer[i + idx];
            }
            this._setRTSyncFlag(Transform3D.TRANSFORM_LOCALEULER, false);
        }
        return this._localMatrix;
    }

    set localMatrix(value: Matrix4x4) {
        let idx = LayaXTransform3D.TRANSFORM_LOCALMATRIX_DATAOFFSET;
        this._nativeFloat32Buffer.set(value.elements, idx);
        this._nativeObj.setLocalMatrix();
        this._isDefaultMatrix = value.isIdentity();
        this._onWorldTransform();
    }

    // ------------------------------------------------------------------
    // World properties
    // ------------------------------------------------------------------

    get position(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._nativeObj.getPosition();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            let idx = LayaXTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET;
            this._position.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
        }
        return this._position;
    }

    set position(value: Vector3) {
        let idx = LayaXTransform3D.TRANSFORM_WORLDPOS_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeObj.setPosition();
        this._onWorldPositionTransform();
    }

    get rotation(): Quaternion {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            this._nativeObj.getRotation();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
            let idx = LayaXTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET;
            this._rotation.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2],
                this._nativeFloat32Buffer[idx + 3]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
        }
        return this._rotation;
    }

    set rotation(value: Quaternion) {
        let idx = LayaXTransform3D.TRANSFORM_WORLDQUATERNION_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeFloat32Buffer[idx + 3] = value.w;
        this._nativeObj.setRotation();
        this._onWorldRotationTransform();
    }

    get rotationEuler(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._nativeObj.getRotationEuler();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            let idx = LayaXTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET;
            this._rotationEuler.setValue(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDEULER, false);
        }
        return this._rotationEuler;
    }

    set rotationEuler(value: Vector3) {
        let idx = LayaXTransform3D.TRANSFORM_WORLDEULER_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeObj.setRotationEuler();
        this._onWorldRotationTransform();
    }

    get worldMatrix(): Matrix4x4 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
            this._nativeObj.getWorldMatrix();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDMATRIX)) {
            let idx = LayaXTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET;
            for (let i = 0; i < 16; ++i) {
                this._worldMatrix.elements[i] = this._nativeFloat32Buffer[i + idx];
            }
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
        }
        return this._worldMatrix;
    }

    set worldMatrix(value: Matrix4x4) {
        let idx = LayaXTransform3D.TRANSFORM_WORLDMATRIX_DATAOFFSET;
        this._nativeFloat32Buffer.set(value.elements, idx);
        this._nativeObj.setWorldMatrix();
        this._onWorldTransform();
    }

    // ------------------------------------------------------------------
    // Hierarchy
    // ------------------------------------------------------------------

    /** @internal */
    _setParent(value: Transform3D): void {
        super._setParent(value);
        this._nativeObj.setParent(value ? (value as any)._nativeObj : null);
    }

    // ------------------------------------------------------------------
    // Dirty propagation (TS handles children, C++ overrides are empty)
    // ------------------------------------------------------------------

    protected _onWorldPositionRotationTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
        }
        for (let i = 0, n = this._children!.length; i < n; i++)
            (this._children[i] as LayaXTransform3D)._onWorldPositionRotationTransform();
    }

    protected _onWorldPositionScaleTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDSCALE, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
        }
        for (let i = 0, n = this._children!.length; i < n; i++)
            (this._children[i] as LayaXTransform3D)._onWorldPositionScaleTransform();
    }

    protected _onWorldPositionTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
        }
        for (let i = 0, n = this._children!.length; i < n; i++)
            (this._children[i] as LayaXTransform3D)._onWorldPositionTransform();
    }

    protected _onWorldRotationTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
        }
        for (let i = 0, n = this._children!.length; i < n; i++)
            (this._children[i] as LayaXTransform3D)._onWorldPositionRotationTransform();
    }

    protected _onWorldScaleTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDSCALE, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
        }
        for (let i = 0, n = this._children!.length; i < n; i++)
            (this._children[i] as LayaXTransform3D)._onWorldPositionScaleTransform();
    }

    _onWorldTransform(): void {
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._transformFlag);
        }
        for (let i = 0, n = this._children!.length; i < n; i++)
            this._children![i]._onWorldTransform();
    }

    // ------------------------------------------------------------------
    // Movement helpers
    // ------------------------------------------------------------------

    translate(translation: Vector3, isLocal: boolean = true): void {
        if (isLocal) {
            Matrix4x4.createFromQuaternion(this.localRotation, _tempMatrix0);
            Vector3.transformCoordinate(translation, _tempMatrix0, _tempVector30);
            Vector3.add(this.localPosition, _tempVector30, this._localPosition);
            this.localPosition = this._localPosition;
        } else {
            Vector3.add(this.position, translation, this._position);
            this.position = this._position;
        }
    }

    rotate(rotation: Vector3, isLocal: boolean = true, isRadian: boolean = true): void {
        let rot: Vector3;
        if (isRadian) {
            rot = rotation;
        } else {
            Vector3.scale(rotation, Math.PI / 180.0, _tempVector30);
            rot = _tempVector30;
        }
        Quaternion.createFromYawPitchRoll(rot.y, rot.x, rot.z, _tempQuaternion0);
        if (isLocal) {
            Quaternion.multiply(this.localRotation, _tempQuaternion0, this._localRotation);
            this.localRotation = this._localRotation;
        } else {
            Quaternion.multiply(_tempQuaternion0, this.rotation, this._rotation);
            this.rotation = this._rotation;
        }
    }

    getWorldLossyScale(): Vector3 {
        if (this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._nativeObj.getWorldLossyScale();
        }
        if (this._getRTSyncFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            let idx = LayaXTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET;
            this._scale.set(
                this._nativeFloat32Buffer[idx],
                this._nativeFloat32Buffer[idx + 1],
                this._nativeFloat32Buffer[idx + 2]
            );
            this._setRTSyncFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
        }
        return this._scale;
    }

    setWorldLossyScale(value: Vector3): void {
        let idx = LayaXTransform3D.TRANSFORM_WORLDSCALE_DATAOFFSET;
        this._nativeFloat32Buffer[idx] = value.x;
        this._nativeFloat32Buffer[idx + 1] = value.y;
        this._nativeFloat32Buffer[idx + 2] = value.z;
        this._nativeObj.setWorldLossyScale();
        this._onWorldScaleTransform();
    }
}

const _tempVector30: Vector3 = new Vector3();
const _tempQuaternion0: Quaternion = new Quaternion();
const _tempMatrix0: Matrix4x4 = new Matrix4x4();
