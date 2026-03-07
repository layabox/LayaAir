import { ShadowCascadesMode } from "../../../d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../maths/Vector3";
import { IDirectLightData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";

/**
 * LayaX DirectLight bridge.
 *
 * Delegates directional light shadow and direction data to the native
 * `conchLayaXDirectLight` object.
 */
export class LayaXDirectLight implements IDirectLightData {

    /** @internal */
    _nativeObj: any;

    private _transform: LayaXTransform3D;
    public get transform(): LayaXTransform3D { return this._transform; }
    public set transform(value: LayaXTransform3D) {
        this._transform = value;
        this._nativeObj.setTransform(value ? value._nativeObj : null);
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

    public get shadowCascadesMode(): ShadowCascadesMode { return this._nativeObj._shadowCascadesMode; }
    public set shadowCascadesMode(value: ShadowCascadesMode) { this._nativeObj._shadowCascadesMode = value; }

    public get shadowTwoCascadeSplits(): number { return this._nativeObj._shadowTwoCascadeSplits; }
    public set shadowTwoCascadeSplits(value: number) { this._nativeObj._shadowTwoCascadeSplits = value; }

    setShadowFourCascadeSplits(value: Vector3): void {
        value && this._nativeObj.setShadowFourCascadeSplits(value);
    }

    setDirection(value: Vector3): void {
        value && this._nativeObj.setDirection(value);
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXDirectLight();
    }
}
