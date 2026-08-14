
import { Bounds } from "../../../../d3/math/Bounds";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IVolumetricGIData } from "../../Design/3D/I3DRenderModuleData";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTVolumetricGI 共享块槽位（与 C++ RTVolumetricGI::Props 一致）。 */
const enum RTVolumetricGISlot {
    intensity = 0,
    updateMark = 1,
    probeCountsX = 2,
    probeCountsY = 3,
    probeCountsZ = 4,
    probeStepX = 5,
    probeStepY = 6,
    probeStepZ = 7,
    paramsX = 8,
    paramsY = 9,
    paramsZ = 10,
    paramsW = 11,
    Count = 12,
}

export class RTVolumetricGI implements IVolumetricGIData {

    private static _idCounter: number = 0;

    _id: number = ++RTVolumetricGI._idCounter;

    private _irradiance: InternalTexture;
    public get irradiance(): InternalTexture {
        return this._irradiance;
    }
    public set irradiance(value: InternalTexture) {
        this._irradiance = value;
        this._nativeObj.setIrradiance(value ? (value as any)._nativeObj : null);
    }
    private _distance: InternalTexture;
    public get distance(): InternalTexture {
        return this._distance;
    }
    public set distance(value: InternalTexture) {
        this._distance = value;
        this._nativeObj.setDistance(value ? (value as any)._nativeObj : null);
    }
    private _bound: Bounds;
    public get bound(): Bounds {
        return this._bound;
    }
    public set bound(value: Bounds) {
        this._bound = value;
        this._nativeObj.setBounds(value ? value._imp._nativeObj : null);
    }
    public get intensity(): number {
        return this._f32[RTVolumetricGISlot.intensity];
    }
    public set intensity(value: number) {
        this._f32[RTVolumetricGISlot.intensity] = value;
    }

    public get updateMark(): number {
        return this._u32[RTVolumetricGISlot.updateMark];
    }
    public set updateMark(value: number) {
        this._u32[RTVolumetricGISlot.updateMark] = value;
    }

    /**@internal */
    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _u32: Uint32Array;

    /**@internal */
    _defaultBounds: Bounds;

    _shaderData: ShaderData;

    public set shaderData(value: ShaderData) {
        this._shaderData = value;
        this._nativeObj.setShaderData((this._shaderData as any)._nativeObj);
    }

    get shaderData(): ShaderData {
        return this._shaderData;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTVolumetricGI();
        this._mem = new NativeMemory(RTVolumetricGISlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._u32 = this._mem.Uint32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._defaultBounds = new Bounds();
        this.bound = this._defaultBounds;
    }

    setParams(value: Vector4): void {
        this._f32[RTVolumetricGISlot.paramsX] = value.x;
        this._f32[RTVolumetricGISlot.paramsY] = value.y;
        this._f32[RTVolumetricGISlot.paramsZ] = value.z;
        this._f32[RTVolumetricGISlot.paramsW] = value.w;
    }
    setProbeCounts(value: Vector3): void {
        this._f32[RTVolumetricGISlot.probeCountsX] = value.x;
        this._f32[RTVolumetricGISlot.probeCountsY] = value.y;
        this._f32[RTVolumetricGISlot.probeCountsZ] = value.z;
    }

    setProbeStep(value: Vector3): void {
        this._f32[RTVolumetricGISlot.probeStepX] = value.x;
        this._f32[RTVolumetricGISlot.probeStepY] = value.y;
        this._f32[RTVolumetricGISlot.probeStepZ] = value.z;
    }

    destroy(): void {
        this._nativeObj.destroy();
        this.distance = null;
        this.irradiance = null;
        this._shaderData.destroy();
        this._shaderData = null;
    }
}