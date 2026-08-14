import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { IPointLightData } from "../../Design/3D/I3DRenderModuleData";
import { RTTransform3D } from "./RTTransform3D";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTPointLight 共享块槽位（与 C++ RTPointLight::Props 一致）。 */
const enum RTPointLightSlot {
    range = 0,
    shadowResolution = 1,
    shadowDistance = 2,
    shadowMode = 3,
    shadowStrength = 4,
    shadowDepthBias = 5,
    shadowNormalBias = 6,
    shadowNearPlane = 7,
    Count = 8,
}

export class RTPointLight implements IPointLightData {

    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _i32: Int32Array;

    private _transform: RTTransform3D;
    public get transform(): RTTransform3D {
        return this._transform;
    }
    public set transform(value: RTTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
    }

    public get range(): number {
        return this._f32[RTPointLightSlot.range];
    }
    public set range(value: number) {
        this._f32[RTPointLightSlot.range] = value;
    }

    public get shadowResolution(): number {
        return this._f32[RTPointLightSlot.shadowResolution];
    }
    public set shadowResolution(value: number) {
        this._f32[RTPointLightSlot.shadowResolution] = value;
    }

    public get shadowDistance(): number {
        return this._f32[RTPointLightSlot.shadowDistance];
    }
    public set shadowDistance(value: number) {
        this._f32[RTPointLightSlot.shadowDistance] = value;
    };

    public get shadowMode(): ShadowMode {
        return this._i32[RTPointLightSlot.shadowMode];
    }
    public set shadowMode(value: ShadowMode) {
        this._i32[RTPointLightSlot.shadowMode] = value;
    };

    public get shadowStrength(): number {
        return this._f32[RTPointLightSlot.shadowStrength];
    }
    public set shadowStrength(value: number) {
        this._f32[RTPointLightSlot.shadowStrength] = value;
    }

    public get shadowDepthBias(): number {
        return this._f32[RTPointLightSlot.shadowDepthBias];
    }
    public set shadowDepthBias(value: number) {
        this._f32[RTPointLightSlot.shadowDepthBias] = value;
    }

    public get shadowNormalBias(): number {
        return this._f32[RTPointLightSlot.shadowNormalBias];
    }
    public set shadowNormalBias(value: number) {
        this._f32[RTPointLightSlot.shadowNormalBias] = value;
    }

    public get shadowNearPlane(): number {
        return this._f32[RTPointLightSlot.shadowNearPlane];
    }
    public set shadowNearPlane(value: number) {
        this._f32[RTPointLightSlot.shadowNearPlane] = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTPointLight();
        this._mem = new NativeMemory(RTPointLightSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
    }
}
