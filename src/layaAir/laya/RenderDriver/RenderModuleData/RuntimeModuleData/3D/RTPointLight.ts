import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { IPointLightData } from "../../Design/3D/I3DRenderModuleData";
import { RTTransform3D } from "./RTTransform3D";

export class RTPointLight implements IPointLightData {

    _nativeObj: any;

    private _transform: RTTransform3D;
    public get transform(): RTTransform3D {
        return this._transform;
    }
    public set transform(value: RTTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value._nativeObj);
    }

    public get range(): number {
        return this._nativeObj.range;
    }
    public set range(value: number) {
        this._nativeObj.range = value;
    }

    public get shadowResolution(): number {
        return this._nativeObj.shadowResolution;
    }
    public set shadowResolution(value: number) {
        this._nativeObj.shadowResolution = value;
    }

    public get shadowDistance(): number {
        return this._nativeObj.shadowDistance;
    }
    public set shadowDistance(value: number) {
        this._nativeObj.shadowDistance = value;
    };

    public get shadowMode(): ShadowMode {
        return this._nativeObj.shadowMode;
    }
    public set shadowMode(value: ShadowMode) {
        this._nativeObj.shadowMode = value;
    };

    public get shadowStrength(): number {
        return this._nativeObj.shadowStrength;
    }
    public set shadowStrength(value: number) {
        this._nativeObj.shadowStrength = value;
    }

    public get shadowDepthBias(): number {
        return this._nativeObj.shadowDepthBias;
    }
    public set shadowDepthBias(value: number) {
        this._nativeObj.shadowDepthBias = value;
    }

    public get shadowNormalBias(): number {
        return this._nativeObj.shadowNormalBias;
    }
    public set shadowNormalBias(value: number) {
        this._nativeObj.shadowNormalBias = value;
    }

    public get shadowNearPlane(): number {
        return this._nativeObj.shadowNearPlane;
    }
    public set shadowNearPlane(value: number) {
        this._nativeObj.shadowNearPlane = value;
    }

    constructor() {
        this._nativeObj = new (window as any).conchRTPointLight();
    }
}