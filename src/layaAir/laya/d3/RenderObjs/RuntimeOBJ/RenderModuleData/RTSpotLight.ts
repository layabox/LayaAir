import { Vector3 } from "../../../../maths/Vector3";
import { ISpotLightData } from "../../../RenderDriverLayer/RenderModuleData/ISpotLightData"
import { ShadowMode } from "../../../core/light/ShadowMode";
import { NativeTransform3D } from "../../NativeOBJ/NativeTransform3D";
export class RTSpotLight implements ISpotLightData {
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._nativeObj.set_transform(value._nativeObj);
        this._transform = value;
    }
    private _shadowResolution: number;
    public get shadowResolution(): number {
        return this._shadowResolution;
    }
    public set shadowResolution(value: number) {
        this._shadowResolution = value;
    }
    private _shadowDistance: number;
    public get shadowDistance(): number {
        return this._shadowDistance;
    }
    public set shadowDistance(value: number) {
        this._shadowDistance = value;
    }
    private _shadowMode: ShadowMode;
    public get shadowMode(): ShadowMode {
        return this._shadowMode;
    }
    public set shadowMode(value: ShadowMode) {
        this._shadowMode = value;
    }
    private _shadowStrength: number;
    public get shadowStrength(): number {
        return this._shadowStrength;
    }
    public set shadowStrength(value: number) {
        this._shadowStrength = value;
    }
    private _shadowDepthBias: number;
    public get shadowDepthBias(): number {
        return this._shadowDepthBias;
    }
    public set shadowDepthBias(value: number) {
        this._shadowDepthBias = value;
    }
    private _shadowNormalBias: number;
    public get shadowNormalBias(): number {
        return this._shadowNormalBias;
    }
    public set shadowNormalBias(value: number) {
        this._shadowNormalBias = value;
    }
    private _shadowNearPlane: number;
    public get shadowNearPlane(): number {
        return this._shadowNearPlane;
    }
    public set shadowNearPlane(value: number) {
        this._shadowNearPlane = value;
    }
    private _spotRange: number;
    public get spotRange(): number {
        return this._spotRange;
    }
    public set spotRange(value: number) {
        this._spotRange = value;
    }
    private _spotAngle: number;
    public get spotAngle(): number {
        return this._spotAngle;
    }
    public set spotAngle(value: number) {
        this._spotAngle = value;
    }
    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTSpotLight();
    }

    setDirection(value: Vector3): void {
 
    }

}