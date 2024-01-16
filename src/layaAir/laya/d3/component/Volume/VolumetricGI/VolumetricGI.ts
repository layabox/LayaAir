import { ILaya3D } from "../../../../../ILaya3D";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Texture2D } from "../../../../resource/Texture2D";
import { IVolumetricGIData } from "../../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { Volume } from "../Volume";
import { VolumeManager } from "../VolumeManager";

export class VolumetricGI extends Volume {
    static volumetricCount: number = 0;
    /**获取一个全局唯一ID。*/
    static getID(): number {
        return VolumetricGI.volumetricCount++;
    }
    /** @internal IDE*/
    probeLocations: Float32Array;
    /**@internal */
    private _probeCounts: Vector3;
    /**@internal */
    private _probeStep: Vector3;
    /**
     * @internal
     * x: irradiance probe texel size
     * y: distance probe texel size
     * z: normalBias
     * w: viewBias
     */
    private _params: Vector4;
    /**@internal */
    _volumetricProbeID: number
    /**@internal */
    _dataModule: IVolumetricGIData;

    /**
     * <code>实例化一个体积光照探针<code>
     */
    constructor() {
        super();
        this._type = VolumeManager.VolumetricGIType;
        this._probeCounts = new Vector3();
        this._probeStep = new Vector3();
        this._params = new Vector4(8, 16, 0, 0);
        this._dataModule = Laya3DRender.renderOBJCreate.createVolumetricGI();
        this._dataModule.setParams(this._params);
        this._volumetricProbeID = VolumetricGI.getID();
        this._dataModule.intensity = 1;
    }

    /**
    * @inheritDoc
    * @override
    */
    protected _onEnable(): void {
        super._onEnable();
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    private _irradiance: Texture2D;
    /**
     * light probe texture
     */
    get irradiance(): Texture2D {
        return this._irradiance;
    }

    set irradiance(value: Texture2D) {
        if (this._irradiance == value)
            return;
        this._irradiance && (this._irradiance._removeReference());
        value && (value._addReference());
        this._dataModule.irradiance = value._texture;
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    private _distance: Texture2D;
    /**
     * distance texture
     */
    get distance(): Texture2D {
        return this._distance;
    }

    set distance(value: Texture2D) {
        if (this._distance == value)
            return;
        this._distance && (this._distance._removeReference());
        value && (value._addReference());
        this._dataModule.distance = value._texture;
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * normal bias
     */
    get normalBias(): number {
        return this._params.z;
    }

    set normalBias(value: number) {
        this._params.z = value;
        this._dataModule.setParams(this._params);
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * view bias
     */
    get viewBias(): number {
        return this._params.w;
    }

    set viewBias(value: number) {
        this._params.w = value;
        this._dataModule.setParams(this._params);
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * irradiance Texture one probe texel number
     */
    get irradianceTexel(): number {
        return this._params.x;
    }

    /**
     * distance Texture one probe texel number
     */
    get distanceTexel(): number {
        return this._params.y;
    }

    /**
     * 设置反射探针强度
     */
    get intensity(): number {
        return this._dataModule.intensity;
    }

    set intensity(value: number) {
        if (value == this._dataModule.intensity) return;
        value = Math.max(value, 0.0);
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * 设置反射数量
     */
    get probeCounts(): Vector3 {
        return this._probeCounts;
    }

    set probeCounts(value: Vector3) {
        if (value.equal(this._probeCounts)) return;
        value.cloneTo(this._probeCounts);
        this._dataModule.setProbeCounts(value);
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }
    /**
     * 设置反射探针间隔
     */
    get probeStep(): Vector3 {
        return this._probeStep;
    }

    set probeStep(value: Vector3) {
        if (value.equal(this._probeStep)) return;
        value.cloneTo(this._probeStep);
        this._dataModule.setProbeStep(value);
        this._dataModule.updateMark = ILaya3D.Scene3D._updateMark;
    }

    /**
     * @interanl
     */
    _onDestroy() {
        // todo
        this.irradiance = null;
        this.distance = null;
    }

    /**@internal */
    _cloneTo(dest: VolumetricGI): void {
        dest.irradiance = this.irradiance;
        dest.distance = this.distance;
        this._probeCounts.cloneTo(dest._probeCounts);
        this.probeStep.cloneTo(dest.probeStep);
        dest.normalBias = this.normalBias;
        dest.viewBias = this.viewBias;
        dest.intensity = this.intensity;
    }

}