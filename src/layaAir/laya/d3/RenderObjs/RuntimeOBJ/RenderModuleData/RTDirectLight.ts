import { Vector3 } from "../../../../maths/Vector3";
import { IDirectLightData } from "../../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { ShadowCascadesMode } from "../../../core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../core/light/ShadowMode";
import { NativeTransform3D } from "../../NativeOBJ/NativeTransform3D";

export class RTDirectLight implements IDirectLightData {

    public get shadowNearPlane(): number {
        return this._nativeObj._shadowNearPlane;
    }
    public set shadowNearPlane(value: number) {
        this._nativeObj._shadowNearPlane = value;
    }

    public get shadowCascadesMode(): ShadowCascadesMode {
        return this._nativeObj._shadowCascadesMode;
    }
    public set shadowCascadesMode(value: ShadowCascadesMode) {
        this._nativeObj._shadowCascadesMode = value;
    }
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
    }

    public get shadowResolution(): number {
        return this._nativeObj._shadowResolution;
    }
    public set shadowResolution(value: number) {
        this._nativeObj._shadowResolution = value;
    }

    public get shadowDistance(): number {
        return this._nativeObj._shadowDistance;
    }
    public set shadowDistance(value: number) {
        this._nativeObj._shadowDistance = value;
    }

    public get shadowMode(): ShadowMode {
        return this._nativeObj._shadowMode;
    }
    public set shadowMode(value: ShadowMode) {
        this._nativeObj._shadowMode = value;
    }

    public get shadowStrength(): number {
        return this._nativeObj._shadowStrength;
    }
    public set shadowStrength(value: number) {
        this._nativeObj._shadowStrength = value;
    }
    public get shadowDepthBias(): number {
        return this._nativeObj._shadowDepthBias;
    }
    public set shadowDepthBias(value: number) {
        this._nativeObj._shadowDepthBias = value;
    }

    public get shadowNormalBias(): number {
        return this._nativeObj._shadowNormalBias;
    }
    public set shadowNormalBias(value: number) {
        this._nativeObj._shadowNormalBias = value;
    }

    public get shadowTwoCascadeSplits(): number {
        return this._nativeObj._shadowTwoCascadeSplits;
    }
    public set shadowTwoCascadeSplits(value: number) {
        this._nativeObj._shadowTwoCascadeSplits = value;
    }

    setShadowFourCascadeSplits(value: Vector3): void {
        value && this._nativeObj.setShadowFourCascadeSplits(value);
    }

    setDirection(value: Vector3): void {
        value && this._nativeObj.setDirection(value);
    }

    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTDirectLight();
    }

}