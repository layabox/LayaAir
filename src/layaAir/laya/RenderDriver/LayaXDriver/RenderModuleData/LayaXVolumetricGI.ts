import { Bounds } from "../../../d3/math/Bounds";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { IVolumetricGIData } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * LayaX VolumetricGI bridge.
 *
 * Wraps volumetric global illumination probe data for the Rust rendering
 * pipeline via `conchLayaXVolumetricGI`.
 */
export class LayaXVolumetricGI implements IVolumetricGIData {

    private static _idCounter: number = 0;

    _id: number = ++LayaXVolumetricGI._idCounter;

    /** @internal */
    _nativeObj: any;

    /** @internal */
    _defaultBounds: Bounds;

    private _irradiance: InternalTexture;
    public get irradiance(): InternalTexture { return this._irradiance; }
    public set irradiance(value: InternalTexture) {
        this._irradiance = value;
        this._nativeObj.setIrradiance(value ? (value as any)._nativeObj : null);
    }

    private _distance: InternalTexture;
    public get distance(): InternalTexture { return this._distance; }
    public set distance(value: InternalTexture) {
        this._distance = value;
        this._nativeObj.setDistance(value ? (value as any)._nativeObj : null);
    }

    private _bound: Bounds;
    public get bound(): Bounds { return this._bound; }
    public set bound(value: Bounds) {
        this._bound = value;
        // TODO(Q13): Confirm Bounds._imp._nativeObj path for LayaX Bounds wrapper
        this._nativeObj.setBounds(value ? (value._imp as any)._nativeObj : null);
    }

    public get intensity(): number { return this._nativeObj._intensity; }
    public set intensity(value: number) { this._nativeObj._intensity = value; }

    public get updateMark(): number { return this._nativeObj._updateMark; }
    public set updateMark(value: number) { this._nativeObj._updateMark = value; }

    _shaderData: ShaderData;
    public get shaderData(): ShaderData { return this._shaderData; }
    public set shaderData(value: ShaderData) {
        this._shaderData = value;
        this._nativeObj.shaderData = value ? (this._shaderData as any)._nativeObj : null;
    }

    constructor() {
        this._nativeObj = new (window as any).conchLayaXVolumetricGI();
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        this._defaultBounds = new Bounds();
        this.bound = this._defaultBounds;
    }

    setParams(value: Vector4): void {
        this._nativeObj.setParams(value);
    }

    setProbeCounts(value: Vector3): void {
        this._nativeObj.setProbeCounts(value);
    }

    setProbeStep(value: Vector3): void {
        this._nativeObj.setProbeStep(value);
    }

    destroy(): void {
        this._nativeObj.destroy();
        this.distance = null;
        this.irradiance = null;
        this._shaderData.destroy();
        this._shaderData = null;
    }
}
