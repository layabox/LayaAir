import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../maths/Vector3";
import { ISpotLightData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * TS-owned per-spot-light buffer layout (mixed u32/f32). Contract shared with C++
 * `LayaXSpotLight_JS` and Rust `LightData` / `layax_light_bind_buffer` — changing it
 * requires updating all three. u32 slots use the Uint32Array view, the rest Float32Array.
 */
const enum SSlot {
    WorldMatrix = 0,        // [0..16) column-major 4x4
    SpotAngle = 16,
    SpotRange = 17,
    ShadowNearPlane = 18,
    ShadowResolution = 19,  // u32
    ShadowDepthBias = 20,
    ShadowNormalBias = 21,
    ShadowStrength = 22,
    ShadowMode = 23,        // u32
    ShadowDistance = 24,    // TS-only (Rust spot path does not consume it)
    Count = 25,
}

/**
 * LayaX SpotLight bridge.
 *
 * worldMatrix + angle/range + shadow params travel through a TS-owned ArrayBuffer that
 * Rust absorbs each frame (`camera_cull_prepare_system`) — no per-field FFI. Only the
 * transform reference still goes through a native call.
 */
export class LayaXSpotLight implements ISpotLightData {

    /** @internal */
    _nativeObj: any;

    private _transform: LayaXTransform3D;

    // TS owns this buffer; Rust caches its raw pointer via bindBuffer and absorbs it each
    // frame. Instance field → stays alive (GC) for the light's lifetime.
    private _buf: ArrayBuffer;
    private _f32: Float32Array;
    private _u32: Uint32Array;

    public get transform(): LayaXTransform3D { return this._transform; }
    public set transform(value: LayaXTransform3D) {
        this._nativeObj.setTransform(value ? value._nativeObj : null);
        this._transform = value;
    }

    public get shadowResolution(): number { return this._u32[SSlot.ShadowResolution]; }
    public set shadowResolution(value: number) { this._u32[SSlot.ShadowResolution] = value; }

    public get shadowDistance(): number { return this._f32[SSlot.ShadowDistance]; }
    public set shadowDistance(value: number) { this._f32[SSlot.ShadowDistance] = value; }

    public get shadowMode(): ShadowMode { return this._u32[SSlot.ShadowMode]; }
    public set shadowMode(value: ShadowMode) { this._u32[SSlot.ShadowMode] = value; }

    public get shadowStrength(): number { return this._f32[SSlot.ShadowStrength]; }
    public set shadowStrength(value: number) { this._f32[SSlot.ShadowStrength] = value; }

    public get shadowDepthBias(): number { return this._f32[SSlot.ShadowDepthBias]; }
    public set shadowDepthBias(value: number) { this._f32[SSlot.ShadowDepthBias] = value; }

    public get shadowNormalBias(): number { return this._f32[SSlot.ShadowNormalBias]; }
    public set shadowNormalBias(value: number) { this._f32[SSlot.ShadowNormalBias] = value; }

    public get shadowNearPlane(): number { return this._f32[SSlot.ShadowNearPlane]; }
    public set shadowNearPlane(value: number) { this._f32[SSlot.ShadowNearPlane] = value; }

    public get spotRange(): number { return this._f32[SSlot.SpotRange]; }
    public set spotRange(value: number) { this._f32[SSlot.SpotRange] = value; }

    public get spotAngle(): number { return this._f32[SSlot.SpotAngle]; }
    public set spotAngle(value: number) { this._f32[SSlot.SpotAngle] = value; }

    setDirection(value: Vector3): void {
        // No-op on the LayaX path: spot direction is derived from worldMatrix by Rust, not
        // stored separately. (Also fixes a prior bug calling a non-existent native binding.)
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXSpotLight();
        // Attribute-offset block (mixed u32/f32). Seed defaults matching the previous native
        // ctor so a frame before the engine sets them absorbs sane params.
        this._buf = new ArrayBuffer(SSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._u32 = new Uint32Array(this._buf);
        // worldMatrix defaults to identity (overwritten by syncShadow each shadow frame).
        this._f32[SSlot.WorldMatrix] = 1.0;
        this._f32[SSlot.WorldMatrix + 5] = 1.0;
        this._f32[SSlot.WorldMatrix + 10] = 1.0;
        this._f32[SSlot.WorldMatrix + 15] = 1.0;
        this._f32[SSlot.SpotAngle] = 45.0;
        this._f32[SSlot.SpotRange] = 30.0;
        this._f32[SSlot.ShadowNearPlane] = 0.1;
        this._u32[SSlot.ShadowResolution] = 1024;
        this._f32[SSlot.ShadowDepthBias] = 1.0;
        this._f32[SSlot.ShadowNormalBias] = 1.0;
        this._f32[SSlot.ShadowStrength] = 1.0;
        this._u32[SSlot.ShadowMode] = 0;
        this._f32[SSlot.ShadowDistance] = 50.0;
        this._nativeObj.bindBuffer(this._buf);
    }

    /// 每帧在 needSpotShadow 分支调：把最新 world matrix 写进 buffer（angle/range/shadow
    /// 参数已由各 property setter 写入），Rust 下帧 absorb。
    syncShadow(): void {
        if (this._transform) {
            this._f32.set(this._transform.worldMatrix.elements, SSlot.WorldMatrix);
        }
    }
}
