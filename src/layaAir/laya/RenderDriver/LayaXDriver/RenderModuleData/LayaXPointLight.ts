import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { IPointLightData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * TS-owned per-point-light buffer layout. Contract shared with C++ `LayaXPointLight_JS`
 * (and future Rust direct-read) — changing it requires updating both sides.
 */
const enum PLSlot {
    Range = 0,             // f32
    ShadowResolution = 1,  // u32
    ShadowDistance = 2,    // f32
    ShadowMode = 3,        // u32
    ShadowStrength = 4,    // f32
    ShadowDepthBias = 5,   // f32
    ShadowNormalBias = 6,  // f32
    ShadowNearPlane = 7,   // f32
    Count = 8,
}

/**
 * LayaX PointLight bridge.
 *
 * Point light range / shadow params live in a TS-owned ArrayBuffer that C++ holds (and Rust
 * will read directly once a point-light system lands) — no per-property FFI. The transform
 * reference still goes through a native setter. (Replaces the previous JS-expando properties,
 * whose data never reached native.)
 */
export class LayaXPointLight implements IPointLightData {

    /** @internal */
    _nativeObj: any;

    // TS owns this buffer; C++ caches its pointer via bindBuffer. Held as an instance
    // field so it stays alive (GC) for the light's lifetime.
    private _buf: ArrayBuffer;
    private _f32: Float32Array;
    private _u32: Uint32Array;

    private _transform: LayaXTransform3D;
    public get transform(): LayaXTransform3D { return this._transform; }
    public set transform(value: LayaXTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value ? value._nativeObj : null);
    }

    public get range(): number { return this._f32[PLSlot.Range]; }
    public set range(value: number) { this._f32[PLSlot.Range] = value; }

    public get shadowResolution(): number { return this._u32[PLSlot.ShadowResolution]; }
    public set shadowResolution(value: number) { this._u32[PLSlot.ShadowResolution] = value; }

    public get shadowDistance(): number { return this._f32[PLSlot.ShadowDistance]; }
    public set shadowDistance(value: number) { this._f32[PLSlot.ShadowDistance] = value; }

    public get shadowMode(): ShadowMode { return this._u32[PLSlot.ShadowMode]; }
    public set shadowMode(value: ShadowMode) { this._u32[PLSlot.ShadowMode] = value; }

    public get shadowStrength(): number { return this._f32[PLSlot.ShadowStrength]; }
    public set shadowStrength(value: number) { this._f32[PLSlot.ShadowStrength] = value; }

    public get shadowDepthBias(): number { return this._f32[PLSlot.ShadowDepthBias]; }
    public set shadowDepthBias(value: number) { this._f32[PLSlot.ShadowDepthBias] = value; }

    public get shadowNormalBias(): number { return this._f32[PLSlot.ShadowNormalBias]; }
    public set shadowNormalBias(value: number) { this._f32[PLSlot.ShadowNormalBias] = value; }

    public get shadowNearPlane(): number { return this._f32[PLSlot.ShadowNearPlane]; }
    public set shadowNearPlane(value: number) { this._f32[PLSlot.ShadowNearPlane] = value; }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXPointLight();
        this._buf = new ArrayBuffer(PLSlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._u32 = new Uint32Array(this._buf);
        this._nativeObj.bindBuffer(this._buf);
    }
}
