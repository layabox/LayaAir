import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { ICameraNodeData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * TS-owned per-camera buffer layout. Contract shared with C++ `LayaXCameraNodeData_JS`
 * and Rust `CameraData` / `layax_camera_bind_buffer` — changing it requires updating all three.
 */
const enum CamSlot {
    ViewProj = 0,   // [0..16) column-major 4x4
    Fov = 16,
    Near = 17,
    Far = 18,
    Aspect = 19,
    ForwardX = 20,
    ForwardY = 21,
    ForwardZ = 22,
    Count = 23,
}

/**
 * LayaX CameraNodeData bridge.
 *
 * Projection / view-proj / forward travel through a TS-owned ArrayBuffer that Rust reads
 * directly (absorbed in `camera_cull_prepare_system`) — no per-field FFI. Only the
 * transform-entity reference still goes through a native call.
 */
export class LayaXCameraNodeData implements ICameraNodeData {

    /** @internal */
    _nativeObj: any;

    private _transform: LayaXTransform3D;

    // TS owns this buffer; Rust caches its raw pointer via bindBuffer and reads it each
    // frame. Held as an instance field so it stays alive (GC) for the camera's lifetime.
    private _buf: ArrayBuffer;
    private _f32: Float32Array;

    public get transform(): LayaXTransform3D {
        return this._transform;
    }
    public set transform(value: LayaXTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value ? value._nativeObj : null);
    }

    public get farplane(): number {
        return this._f32[CamSlot.Far];
    }
    public set farplane(value: number) {
        this._f32[CamSlot.Far] = value;
    }

    public get nearplane(): number {
        return this._f32[CamSlot.Near];
    }
    public set nearplane(value: number) {
        this._f32[CamSlot.Near] = value;
    }

    public get fieldOfView(): number {
        return this._f32[CamSlot.Fov];
    }
    public set fieldOfView(value: number) {
        this._f32[CamSlot.Fov] = value;
    }

    public get aspectRatio(): number {
        return this._f32[CamSlot.Aspect];
    }
    public set aspectRatio(value: number) {
        this._f32[CamSlot.Aspect] = value;
    }

    public get handle(): number {
        return this._nativeObj ? this._nativeObj.getHandle() : 0;
    }

    constructor() {
        // Rust 侧 layax_create_camera 负责分配 cull_bit + 4 个 cascade shadow entity
        this._nativeObj = new (window as any).conchLayaXCameraNodeData();
        // Attribute-offset block. view_proj stays all-zero (= "VP not yet pushed" filter
        // sentinel, matching Rust CameraData::default); projection params seed sane defaults
        // so a frame before the engine sets them won't absorb fov=0 (degenerate).
        this._buf = new ArrayBuffer(CamSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._f32[CamSlot.Fov] = 60.0;
        this._f32[CamSlot.Near] = 0.3;
        this._f32[CamSlot.Far] = 1000.0;
        this._f32[CamSlot.Aspect] = 1.0;
        this._f32[CamSlot.ForwardZ] = -1.0;
        this._nativeObj.bindBuffer(this._buf);
    }

    setProjectionViewMatrix(value: Matrix4x4): void {
        value && this._f32.set(value.elements, CamSlot.ViewProj);
    }

    setForward(x: number, y: number, z: number): void {
        this._f32[CamSlot.ForwardX] = x;
        this._f32[CamSlot.ForwardY] = y;
        this._f32[CamSlot.ForwardZ] = z;
    }

    syncProjection(): void {
        // Projection params already live in the bound buffer (Rust reads them on absorb);
        // the native call now only re-tries the lazy transform-entity binding.
        this._nativeObj.syncProjection();
    }

    /** 释放 native camera entity（含 cascade shadow entities + cull bit slot）。 */
    destroy(): void {
        if (this._nativeObj) {
            this._nativeObj.destroy();
            this._nativeObj = null;
        }
    }
}
