import { ShadowCascadesMode } from "../../../../d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../../maths/Vector3";
import { IDirectLightData } from "../../Design/3D/I3DRenderModuleData";
import { RTTransform3D } from "./RTTransform3D";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTDirectLight 共享块槽位（与 C++ RTDirectLight::Props 一致）。 */
const enum RTDirectLightSlot {
    shadowNearPlane = 0,
    shadowCascadesMode = 1,
    shadowResolution = 2,
    shadowDistance = 3,
    shadowMode = 4,
    shadowStrength = 5,
    shadowDepthBias = 6,
    shadowNormalBias = 7,
    shadowTwoCascadeSplits = 8,
    shadowFourCascadeSplitsX = 9,
    shadowFourCascadeSplitsY = 10,
    shadowFourCascadeSplitsZ = 11,
    Count = 12,
}

export class RTDirectLight implements IDirectLightData {

    _nativeObj: any;
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _i32: Int32Array;

    public get shadowNearPlane(): number {
        return this._f32[RTDirectLightSlot.shadowNearPlane];
    }
    public set shadowNearPlane(value: number) {
        this._f32[RTDirectLightSlot.shadowNearPlane] = value;
    }

    public get shadowCascadesMode(): ShadowCascadesMode {
        return this._i32[RTDirectLightSlot.shadowCascadesMode];
    }
    public set shadowCascadesMode(value: ShadowCascadesMode) {
        this._i32[RTDirectLightSlot.shadowCascadesMode] = value;
    }
    private _transform: RTTransform3D;
    public get transform(): RTTransform3D {
        return this._transform;
    }
    public set transform(value: RTTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
    }

    public get shadowResolution(): number {
        return this._i32[RTDirectLightSlot.shadowResolution];
    }
    public set shadowResolution(value: number) {
        this._i32[RTDirectLightSlot.shadowResolution] = value;
    }

    public get shadowDistance(): number {
        return this._f32[RTDirectLightSlot.shadowDistance];
    }
    public set shadowDistance(value: number) {
        this._f32[RTDirectLightSlot.shadowDistance] = value;
    }

    public get shadowMode(): ShadowMode {
        return this._i32[RTDirectLightSlot.shadowMode];
    }
    public set shadowMode(value: ShadowMode) {
        this._i32[RTDirectLightSlot.shadowMode] = value;
    }

    public get shadowStrength(): number {
        return this._f32[RTDirectLightSlot.shadowStrength];
    }
    public set shadowStrength(value: number) {
        this._f32[RTDirectLightSlot.shadowStrength] = value;
    }
    public get shadowDepthBias(): number {
        return this._f32[RTDirectLightSlot.shadowDepthBias];
    }
    public set shadowDepthBias(value: number) {
        this._f32[RTDirectLightSlot.shadowDepthBias] = value;
    }

    public get shadowNormalBias(): number {
        return this._f32[RTDirectLightSlot.shadowNormalBias];
    }
    public set shadowNormalBias(value: number) {
        this._f32[RTDirectLightSlot.shadowNormalBias] = value;
    }

    public get shadowTwoCascadeSplits(): number {
        return this._f32[RTDirectLightSlot.shadowTwoCascadeSplits];
    }
    public set shadowTwoCascadeSplits(value: number) {
        this._f32[RTDirectLightSlot.shadowTwoCascadeSplits] = value;
    }

    setShadowFourCascadeSplits(value: Vector3): void {
        if (!value) return;
        this._f32[RTDirectLightSlot.shadowFourCascadeSplitsX] = value.x;
        this._f32[RTDirectLightSlot.shadowFourCascadeSplitsY] = value.y;
        this._f32[RTDirectLightSlot.shadowFourCascadeSplitsZ] = value.z;
    }

    setDirection(value: Vector3): void {
        value && this._nativeObj.setDirection(value);
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTDirectLight();
        this._mem = new NativeMemory(RTDirectLightSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._i32 = this._mem.int32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
    }

}
