import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../maths/Vector3";
import { ISpotLightData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * LayaX SpotLight bridge.
 *
 * Delegates spot light data to the native `conchLayaXSpotLight` object.
 */
export class LayaXSpotLight implements ISpotLightData {

    /** @internal */
    _nativeObj: any;

    private _transform: LayaXTransform3D;
    public get transform(): LayaXTransform3D { return this._transform; }
    public set transform(value: LayaXTransform3D) {
        this._nativeObj.setTransform(value ? value._nativeObj : null);
        this._transform = value;
    }

    public get shadowResolution(): number { return this._nativeObj._shadowResolution; }
    public set shadowResolution(value: number) { this._nativeObj._shadowResolution = value; }

    public get shadowDistance(): number { return this._nativeObj._shadowDistance; }
    public set shadowDistance(value: number) { this._nativeObj._shadowDistance = value; }

    public get shadowMode(): ShadowMode { return this._nativeObj._shadowMode; }
    public set shadowMode(value: ShadowMode) { this._nativeObj._shadowMode = value; }

    public get shadowStrength(): number { return this._nativeObj._shadowStrength; }
    public set shadowStrength(value: number) { this._nativeObj._shadowStrength = value; }

    public get shadowDepthBias(): number { return this._nativeObj._shadowDepthBias; }
    public set shadowDepthBias(value: number) { this._nativeObj._shadowDepthBias = value; }

    public get shadowNormalBias(): number { return this._nativeObj._shadowNormalBias; }
    public set shadowNormalBias(value: number) { this._nativeObj._shadowNormalBias = value; }

    public get shadowNearPlane(): number { return this._nativeObj._shadowNearPlane; }
    public set shadowNearPlane(value: number) { this._nativeObj._shadowNearPlane = value; }

    public get spotRange(): number { return this._nativeObj._spotRange; }
    public set spotRange(value: number) { this._nativeObj._spotRange = value; }

    public get spotAngle(): number { return this._nativeObj._spotAngle; }
    public set spotAngle(value: number) { this._nativeObj._spotAngle = value; }

    setDirection(value: Vector3): void {
        this._nativeObj.setDirection(value);
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXSpotLight();
    }
}
