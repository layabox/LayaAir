import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { ICameraNodeData, ISceneNodeData } from "../../Design/3D/I3DRenderModuleData";
import { RTTransform3D } from "./RTTransform3D";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTCameraNodeData 共享块槽位（与 C++ RTCameraNodeData::Props 一致）。 */
const enum RTCameraNodeDataSlot {
    projectViewMatrix = 0, // [0..15]
    farplane = 16,
    nearplane = 17,
    fieldOfView = 18,
    aspectRatio = 19,
    Count = 20,
}

/** @internal conchRTSceneNodeData 共享块槽位（与 C++ RTSceneNodeData::Props 一致）。 */
const enum RTSceneNodeDataSlot {
    lightmapDirtyFlag = 0,
    Count = 1,
}

export class RTCameraNodeData implements ICameraNodeData {
    private _transform: RTTransform3D;
    public get transform(): RTTransform3D {
        return this._transform;
    }
    public set transform(value: RTTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
    }
    public get farplane(): number {
        return this._f32[RTCameraNodeDataSlot.farplane];
    }
    public set farplane(value: number) {
        this._f32[RTCameraNodeDataSlot.farplane] = value;
    }

    public get nearplane(): number {
        return this._f32[RTCameraNodeDataSlot.nearplane];
    }
    public set nearplane(value: number) {
        this._f32[RTCameraNodeDataSlot.nearplane] = value;
    }

    public get fieldOfView(): number {
        return this._f32[RTCameraNodeDataSlot.fieldOfView];
    }
    public set fieldOfView(value: number) {
        this._f32[RTCameraNodeDataSlot.fieldOfView] = value;
    }

    public get aspectRatio(): number {
        return this._f32[RTCameraNodeDataSlot.aspectRatio];
    }
    public set aspectRatio(value: number) {
        this._f32[RTCameraNodeDataSlot.aspectRatio] = value;
    }

    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    constructor() {
        this._nativeObj = new (window as any).conchRTCameraNodeData();
        this._mem = new NativeMemory(RTCameraNodeDataSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
    }

    setProjectionViewMatrix(value: Matrix4x4): void {
        // Write the 16 matrix slots directly (zero FFI); shadow/cluster passes read m_props.
        if (value) this._f32.set(value.elements, RTCameraNodeDataSlot.projectViewMatrix);
    }
}

export class RTSceneNodeData implements ISceneNodeData {
    public get lightmapDirtyFlag(): number {
        return this._i32[RTSceneNodeDataSlot.lightmapDirtyFlag];
    }
    public set lightmapDirtyFlag(value: number) {
        this._i32[RTSceneNodeDataSlot.lightmapDirtyFlag] = value;
    }

    _nativeObj: any;
    private _mem: NativeMemory;
    private _i32: Int32Array;
    constructor() {
        this._nativeObj = new (window as any).conchRTSceneNodeData();
        this._mem = new NativeMemory(RTSceneNodeDataSlot.Count * 4, false);
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        this._i32[RTSceneNodeDataSlot.lightmapDirtyFlag] = -1; // construction default
    }
}
