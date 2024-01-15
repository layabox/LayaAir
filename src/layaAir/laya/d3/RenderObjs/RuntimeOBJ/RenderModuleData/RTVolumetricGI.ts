import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Texture2D } from "../../../../resource/Texture2D";
import { IVolumetricGIData } from "../../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { Bounds } from "../../../math/Bounds";

export class RTVolumetricGI implements IVolumetricGIData {
    private _irradiance: Texture2D;
    public get irradiance(): Texture2D {
        return this._irradiance;
    }
    public set irradiance(value: Texture2D) {
        this._irradiance = value;
    }
    private _distance: Texture2D;
    public get distance(): Texture2D {
        return this._distance;
    }
    public set distance(value: Texture2D) {
        this._distance = value;
    }
    private _bound: Bounds;
    public get bound(): Bounds {
        return this._bound;
    }
    public set bound(value: Bounds) {
        this._bound = value;
    }
    private _intensity: number;
    public get intensity(): number {
        return this._intensity;
    }
    public set intensity(value: number) {
        this._intensity = value;
    }
    private _updateMark: number;
    public get updateMark(): number {
        return this._updateMark;
    }
    public set updateMark(value: number) {
        this._updateMark = value;
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTVolumetricGI();
    }

    setParams(value: Vector4): void {
        //TODO
    }
    setProbeCounts(value: Vector3): void {
        //TODO:
    }

    setProbeStep(value: Vector3): void {
        //TODO:
    }
}