
import { Bounds } from "../../../../d3/math/Bounds";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { IVolumetricGIData } from "../../Design/3D/I3DRenderModuleData";

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
        return this._nativeObj._intensity;
    }
    public set intensity(value: number) {
        this._nativeObj._intensity = value;
    }

    public get updateMark(): number {
        return this._nativeObj._updateMark;
    }
    public set updateMark(value: number) {
        this._nativeObj._updateMark = value;
    }

    /**@internal */
    _nativeObj: any;

    /**@internal */
    _defaultBounds: Bounds;

    constructor() {
        this._nativeObj = new (window as any).conchRTVolumetricGI();
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
}