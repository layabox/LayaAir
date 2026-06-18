import { VolumetricGI } from "../../../d3/component/Volume/VolumetricGI/VolumetricGI";
import { ReflectionProbe } from "../../../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { Bounds } from "../../../d3/math/Bounds";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { IVolumetricGIData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * TS-owned per-GI buffer layout. Contract shared with C++ `LayaXVolumetricGI_JS`
 * (and future Rust direct-read) — changing it requires updating both sides.
 */
const enum GISlot {
    Intensity = 0,    // f32
    UpdateMark = 1,   // u32
    ParamsX = 2,      // f32 xyzw
    ProbeCountsX = 6, // f32 xyz
    ProbeStepX = 9,   // f32 xyz
    Count = 12,
}

/**
 * LayaX VolumetricGI bridge.
 *
 * Numeric GI properties live in a TS-owned ArrayBuffer that C++ holds (and Rust will read
 * directly once a GI system lands) — no per-property FFI. Object refs (bounds / textures)
 * still go through native setters. Today `applyRenderData()` pushes everything into the
 * ShaderData; the buffer is the forward path for native consumption.
 */
export class LayaXVolumetricGI implements IVolumetricGIData {

    private static _idCounter: number = 0;

    _id: number = ++LayaXVolumetricGI._idCounter;

    /** @internal */
    _nativeObj: any;

    /** @internal */
    _defaultBounds: Bounds;

    // TS owns this buffer; C++ caches its pointer via bindBuffer. Held as an instance
    // field so it stays alive (GC) for the GI probe's lifetime.
    private _buf: ArrayBuffer;
    private _f32: Float32Array;
    private _u32: Uint32Array;

    private _irradiance: InternalTexture;
    public get irradiance(): InternalTexture { return this._irradiance; }
    public set irradiance(value: InternalTexture) {
        if (this._irradiance === value) return;
        this._irradiance = value;
        this._nativeObj.setIrradiance(value ? (value as any)._nativeObj : null);
        LayaXVolumetricGI._dirtySet.add(this);
    }

    private _distance: InternalTexture;
    public get distance(): InternalTexture { return this._distance; }
    public set distance(value: InternalTexture) {
        if (this._distance === value) return;
        this._distance = value;
        this._nativeObj.setDistance(value ? (value as any)._nativeObj : null);
        LayaXVolumetricGI._dirtySet.add(this);
    }

    private _bound: Bounds;
    public get bound(): Bounds { return this._bound; }
    public set bound(value: Bounds) {
        this._bound = value;
        // TODO(Q13): Confirm Bounds._imp._nativeObj path for LayaX Bounds wrapper
        this._nativeObj.setBounds(value ? (value._imp as any)._nativeObj : null);
    }

    public get intensity(): number { return this._f32[GISlot.Intensity]; }
    public set intensity(value: number) {
        if (this._f32[GISlot.Intensity] === value) return;
        this._f32[GISlot.Intensity] = value;
        LayaXVolumetricGI._dirtySet.add(this);
    }

    /** @internal 全局脏集合：updateMark 变化时自动收集 */
    static _dirtySet: Set<LayaXVolumetricGI> = new Set();

    public get updateMark(): number { return this._u32[GISlot.UpdateMark]; }
    public set updateMark(value: number) {
        if (this._u32[GISlot.UpdateMark] === value) return;
        this._u32[GISlot.UpdateMark] = value;
        LayaXVolumetricGI._dirtySet.add(this);
    }

    _shaderData: ShaderData;
    public get shaderData(): ShaderData { return this._shaderData; }
    public set shaderData(value: ShaderData) {
        // shaderData is consumed via the TS field below (applyRenderData); native holds no copy.
        this._shaderData = value;
    }

    private _probeCounts: Vector3 = new Vector3();
    private _probeStep: Vector3 = new Vector3();
    private _params: Vector4 = new Vector4();

    constructor() {
        this._nativeObj = new (window as any).conchLayaXVolumetricGI();
        this._buf = new ArrayBuffer(GISlot.Count * 4);
        this._f32 = new Float32Array(this._buf);
        this._u32 = new Uint32Array(this._buf);
        // Seed C++ default (_intensity = 1).
        this._f32[GISlot.Intensity] = 1.0;
        this._nativeObj.bindBuffer(this._buf);
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._defaultBounds = new Bounds();
        this.bound = this._defaultBounds;
    }

    setParams(value: Vector4): void {
        value.cloneTo(this._params);
        this._f32[GISlot.ParamsX] = value.x;
        this._f32[GISlot.ParamsX + 1] = value.y;
        this._f32[GISlot.ParamsX + 2] = value.z;
        this._f32[GISlot.ParamsX + 3] = value.w;
    }

    setProbeCounts(value: Vector3): void {
        value.cloneTo(this._probeCounts);
        this._f32[GISlot.ProbeCountsX] = value.x;
        this._f32[GISlot.ProbeCountsX + 1] = value.y;
        this._f32[GISlot.ProbeCountsX + 2] = value.z;
    }

    setProbeStep(value: Vector3): void {
        value.cloneTo(this._probeStep);
        this._f32[GISlot.ProbeStepX] = value.x;
        this._f32[GISlot.ProbeStepX + 1] = value.y;
        this._f32[GISlot.ProbeStepX + 2] = value.z;
    }

    applyRenderData(): void {
        let data = this._shaderData;
        data.addDefine(VolumetricGI.SHADERDEFINE_VOLUMETRICGI);
        data.setVector3(VolumetricGI.VOLUMETRICGI_PROBECOUNTS, this._probeCounts);
        data.setVector3(VolumetricGI.VOLUMETRICGI_PROBESTEPS, this._probeStep);
        data.setVector3(VolumetricGI.VOLUMETRICGI_PROBESTARTPOS, this._bound.getMin());
        data.setVector(VolumetricGI.VOLUMETRICGI_PROBEPARAMS, this._params);
        data._setInternalTexture(VolumetricGI.VOLUMETRICGI_IRRADIANCE, this._irradiance ? (this._irradiance as any)._nativeObj : null);
        data._setInternalTexture(VolumetricGI.VOLUMETRICGI_DISTANCE, this._distance ? (this._distance as any)._nativeObj : null);
        data.setNumber(ReflectionProbe.AMBIENTINTENSITY, this.intensity);
    }

    destroy(): void {
        LayaXVolumetricGI._dirtySet.delete(this);
        this._nativeObj.destroy();
        this.distance = null;
        this.irradiance = null;
        this._shaderData.destroy();
        this._shaderData = null;
    }
}
