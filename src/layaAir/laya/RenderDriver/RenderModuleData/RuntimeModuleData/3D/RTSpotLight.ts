import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../../maths/Vector3";
import { ISpotLightData } from "../../Design/3D/I3DRenderModuleData";
import { RTTransform3D } from "./RTTransform3D";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTSpotLight 共享块槽位（与 C++ RTSpotLight::Props 一致）。 */
const enum RTSpotLightSlot {
    shadowResolution = 0,
    shadowDistance = 1,
    shadowMode = 2,
    shadowStrength = 3,
    shadowDepthBias = 4,
    shadowNormalBias = 5,
    shadowNearPlane = 6,
    spotRange = 7,
    spotAngle = 8,
    Count = 9,
}

export class RTSpotLight implements ISpotLightData {
    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _i32: Int32Array;

    private _transform: RTTransform3D;
    public get transform(): RTTransform3D {
        return this._transform;
    }
    public set transform(value: RTTransform3D) {
        this._nativeObj.setTransform(value._nativeObj);
        this._transform = value;
    }

    public get shadowResolution(): number {
        return this._f32[RTSpotLightSlot.shadowResolution];
    }
    public set shadowResolution(value: number) {
        this._f32[RTSpotLightSlot.shadowResolution] = value;
    }

    public get shadowDistance(): number {
        return this._f32[RTSpotLightSlot.shadowDistance];
    }
    public set shadowDistance(value: number) {
        this._f32[RTSpotLightSlot.shadowDistance] = value;
    }

    public get shadowMode(): ShadowMode {
        return this._i32[RTSpotLightSlot.shadowMode];
    }
    public set shadowMode(value: ShadowMode) {
        this._i32[RTSpotLightSlot.shadowMode] = value;
    }

    public get shadowStrength(): number {
        return this._f32[RTSpotLightSlot.shadowStrength];
    }
    public set shadowStrength(value: number) {
        this._f32[RTSpotLightSlot.shadowStrength] = value;
    }

    public get shadowDepthBias(): number {
        return this._f32[RTSpotLightSlot.shadowDepthBias];
    }
    public set shadowDepthBias(value: number) {
        this._f32[RTSpotLightSlot.shadowDepthBias] = value;
    }

    public get shadowNormalBias(): number {
        return this._f32[RTSpotLightSlot.shadowNormalBias];
    }
    public set shadowNormalBias(value: number) {
        this._f32[RTSpotLightSlot.shadowNormalBias] = value;
    }
    public get shadowNearPlane(): number {
        return this._f32[RTSpotLightSlot.shadowNearPlane];
    }
    public set shadowNearPlane(value: number) {
        this._f32[RTSpotLightSlot.shadowNearPlane] = value;
    }

    public get spotRange(): number {
        return this._f32[RTSpotLightSlot.spotRange];
    }
    public set spotRange(value: number) {
        this._f32[RTSpotLightSlot.spotRange] = value;
    }
    public get spotAngle(): number {
        return this._f32[RTSpotLightSlot.spotAngle];
    }
    public set spotAngle(value: number) {
        this._f32[RTSpotLightSlot.spotAngle] = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTSpotLight();
        this._mem = new NativeMemory(RTSpotLightSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
    }

    setDirection(value: Vector3): void {
        this._nativeObj.setDirection(value);
    }

}
