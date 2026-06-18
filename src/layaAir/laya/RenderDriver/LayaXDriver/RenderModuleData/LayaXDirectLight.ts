import { ShadowCascadesMode } from "../../../d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../maths/Vector3";
import { IDirectLightData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * TS-owned per-directional-light buffer layout (mixed u32/f32). Contract shared with
 * C++ `LayaXDirectLight_JS` and Rust `LightData` / `layax_light_bind_buffer` — changing
 * it requires updating all three. u32 slots use the Uint32Array view, the rest Float32Array.
 */
const enum LSlot {
    ShadowResolution = 0,   // u32
    ShadowDistance = 1,
    ShadowStrength = 2,
    ShadowMode = 3,         // u32
    ShadowDepthBias = 4,
    ShadowNormalBias = 5,
    ShadowNearPlane = 6,
    ShadowCascadesMode = 7, // u32
    ShadowTwoSplit = 8,
    ShadowFourSplit = 9,    // [9..12) f32x3
    LightUp = 12,           // [12..15) f32x3
    LightSide = 15,         // [15..18) f32x3
    LightForward = 18,      // [18..21) f32x3
    Count = 21,
}

/**
 * LayaX DirectLight bridge.
 *
 * Shadow params + light orientation travel through a TS-owned ArrayBuffer that Rust
 * absorbs each frame (`camera_cull_prepare_system`) — no per-field FFI. Only the
 * transform reference still goes through a native call. direction / color are consumed
 * via Scene3D ShaderData on the LayaX path, not this light's Rust component.
 */
export class LayaXDirectLight implements IDirectLightData {

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
        this._transform = value;
        this._nativeObj.setTransform(value ? value._nativeObj : null);
    }

    public get shadowResolution(): number { return this._u32[LSlot.ShadowResolution]; }
    public set shadowResolution(value: number) { this._u32[LSlot.ShadowResolution] = value; }

    public get shadowDistance(): number { return this._f32[LSlot.ShadowDistance]; }
    public set shadowDistance(value: number) { this._f32[LSlot.ShadowDistance] = value; }

    public get shadowMode(): ShadowMode { return this._u32[LSlot.ShadowMode]; }
    public set shadowMode(value: ShadowMode) { this._u32[LSlot.ShadowMode] = value; }

    public get shadowStrength(): number { return this._f32[LSlot.ShadowStrength]; }
    public set shadowStrength(value: number) { this._f32[LSlot.ShadowStrength] = value; }

    public get shadowDepthBias(): number { return this._f32[LSlot.ShadowDepthBias]; }
    public set shadowDepthBias(value: number) { this._f32[LSlot.ShadowDepthBias] = value; }

    public get shadowNormalBias(): number { return this._f32[LSlot.ShadowNormalBias]; }
    public set shadowNormalBias(value: number) { this._f32[LSlot.ShadowNormalBias] = value; }

    public get shadowNearPlane(): number { return this._f32[LSlot.ShadowNearPlane]; }
    public set shadowNearPlane(value: number) { this._f32[LSlot.ShadowNearPlane] = value; }

    public get shadowCascadesMode(): ShadowCascadesMode { return this._u32[LSlot.ShadowCascadesMode]; }
    public set shadowCascadesMode(value: ShadowCascadesMode) { this._u32[LSlot.ShadowCascadesMode] = value; }

    public get shadowTwoCascadeSplits(): number { return this._f32[LSlot.ShadowTwoSplit]; }
    public set shadowTwoCascadeSplits(value: number) { this._f32[LSlot.ShadowTwoSplit] = value; }

    setShadowFourCascadeSplits(value: Vector3): void {
        if (value) {
            this._f32[LSlot.ShadowFourSplit] = value.x;
            this._f32[LSlot.ShadowFourSplit + 1] = value.y;
            this._f32[LSlot.ShadowFourSplit + 2] = value.z;
        }
    }

    /** Per-frame: light orientation basis (up/side/forward) written by LayaXDirCascadeShadowRP. */
    setOrientation(ux: number, uy: number, uz: number,
                   sx: number, sy: number, sz: number,
                   fx: number, fy: number, fz: number): void {
        this._f32[LSlot.LightUp] = ux;
        this._f32[LSlot.LightUp + 1] = uy;
        this._f32[LSlot.LightUp + 2] = uz;
        this._f32[LSlot.LightSide] = sx;
        this._f32[LSlot.LightSide + 1] = sy;
        this._f32[LSlot.LightSide + 2] = sz;
        this._f32[LSlot.LightForward] = fx;
        this._f32[LSlot.LightForward + 1] = fy;
        this._f32[LSlot.LightForward + 2] = fz;
    }

    setDirection(value: Vector3): void {
        // No-op on the LayaX path: directional light direction is consumed via Scene3D
        // ShaderData, not this light's Rust component. Kept for IDirectLightData conformance.
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXDirectLight();
        // Attribute-offset block (mixed u32/f32). Seed defaults matching the previous native
        // ctor so a frame before the engine sets them absorbs sane shadow params.
        this._buf = new ArrayBuffer(LSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._u32 = new Uint32Array(this._buf);
        this._u32[LSlot.ShadowResolution] = 1024;
        this._f32[LSlot.ShadowDistance] = 50.0;
        this._f32[LSlot.ShadowStrength] = 1.0;
        this._u32[LSlot.ShadowMode] = 0;
        this._f32[LSlot.ShadowDepthBias] = 1.0;
        this._f32[LSlot.ShadowNormalBias] = 1.0;
        this._f32[LSlot.ShadowNearPlane] = 0.1;
        this._u32[LSlot.ShadowCascadesMode] = 0;
        this._f32[LSlot.ShadowTwoSplit] = 1.0 / 3.0;
        this._f32[LSlot.ShadowFourSplit] = 0.067;
        this._f32[LSlot.ShadowFourSplit + 1] = 0.2;
        this._f32[LSlot.ShadowFourSplit + 2] = 0.467;
        // orientation defaults (up=+Y, side=+X, forward=-Z); overwritten each frame.
        this._f32[LSlot.LightUp + 1] = 1.0;
        this._f32[LSlot.LightSide] = 1.0;
        this._f32[LSlot.LightForward + 2] = -1.0;
        this._nativeObj.bindBuffer(this._buf);
    }

    syncShadow(): void {
        // Shadow params already live in the bound buffer (Rust absorbs them each frame);
        // nothing to push. Kept for the per-frame call site in LayaXRender3DProcess.
    }
}
