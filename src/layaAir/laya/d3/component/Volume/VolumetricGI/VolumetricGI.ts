import { ILaya } from "../../../../../ILaya";
import { ShaderData, ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IVolumetricGIData } from "../../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderDefine } from "../../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Texture2D } from "../../../../resource/Texture2D";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { Volume } from "../Volume";
import { VolumeManager } from "../VolumeManager";

/**
 * @en The VolumetricGI class represents volumetric global illumination in the scene.
 * @zh VolumetricGI 类表示场景中的体积全局光照。
 */
export class VolumetricGI extends Volume {

    /** @internal */
    static BlockName: string = "VolumetricGIProbe";

    /** @internal */
    static SHADERDEFINE_VOLUMETRICGI: ShaderDefine;

    /** @internal */
    static VOLUMETRICGI_PROBECOUNTS: number;
    /** @internal */
    static VOLUMETRICGI_PROBESTEPS: number;
    /** @internal */
    static VOLUMETRICGI_PROBESTARTPOS: number;
    /** @internal */
    static VOLUMETRICGI_PROBEPARAMS: number;
    /** @internal */
    static VOLUMETRICGI_IRRADIANCE: number;
    /** @internal */
    static VOLUMETRICGI_DISTANCE: number;

    static init() {

        VolumetricGI.SHADERDEFINE_VOLUMETRICGI = Shader3D.getDefineByName("VOLUMETRICGI");

        VolumetricGI.VOLUMETRICGI_PROBECOUNTS = Shader3D.propertyNameToID("u_VolGIProbeCounts");
        VolumetricGI.VOLUMETRICGI_PROBESTEPS = Shader3D.propertyNameToID("u_VolGIProbeStep");
        VolumetricGI.VOLUMETRICGI_PROBESTARTPOS = Shader3D.propertyNameToID("u_VolGIProbeStartPosition");
        VolumetricGI.VOLUMETRICGI_PROBEPARAMS = Shader3D.propertyNameToID("u_VolGIProbeParams");
        VolumetricGI.VOLUMETRICGI_IRRADIANCE = Shader3D.propertyNameToID("u_ProbeIrradiance");
        VolumetricGI.VOLUMETRICGI_DISTANCE = Shader3D.propertyNameToID("u_ProbeDistance");

        let uniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap(VolumetricGI.BlockName);

        uniformMap.addShaderUniform(VolumetricGI.VOLUMETRICGI_PROBECOUNTS, "u_VolGIProbeCounts", ShaderDataType.Vector3);
        uniformMap.addShaderUniform(VolumetricGI.VOLUMETRICGI_PROBESTEPS, "u_VolGIProbeStep", ShaderDataType.Vector3);
        uniformMap.addShaderUniform(VolumetricGI.VOLUMETRICGI_PROBESTARTPOS, "u_VolGIProbeStartPosition", ShaderDataType.Vector3);
        uniformMap.addShaderUniform(VolumetricGI.VOLUMETRICGI_PROBEPARAMS, "u_VolGIProbeParams", ShaderDataType.Vector4);
        uniformMap.addShaderUniform(VolumetricGI.VOLUMETRICGI_IRRADIANCE, "u_ProbeIrradiance", ShaderDataType.Texture2D);
        uniformMap.addShaderUniform(VolumetricGI.VOLUMETRICGI_DISTANCE, "u_ProbeDistance", ShaderDataType.Texture2D);
    }

    /**
     * @en The count of volumetric global illumination probes.
     * @zh 体积全局光照探针的数量。
     */
    static volumetricCount: number = 0;
    /**
     * @en Get a globally unique ID.
     * @zh 获取一个全局唯一的ID。
     */
    static getID(): number {
        return VolumetricGI.volumetricCount++;
    }
    /** @internal IDE*/
    probeLocations: Float32Array;
    private _probeCounts: Vector3;
    private _probeStep: Vector3;
    /**
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

    get shaderData(): ShaderData {
        return this._dataModule.shaderData;
    }

    /**
     * @en construct method, initialize VolumetricGI object.
     * @zh 构造方法，初始化VolumetricGI对象。
     */
    constructor() {
        super();
        this._type = VolumeManager.VolumetricGIType;
        this._probeCounts = new Vector3();
        this._probeStep = new Vector3();
        this._params = new Vector4(8, 16, 0, 0);
        this._dataModule = Laya3DRender.Render3DModuleDataFactory.createVolumetricGI();
        this._dataModule.setParams(this._params);
        this._volumetricProbeID = VolumetricGI.getID();
        this._dataModule.intensity = 1;
    }

    protected _onEnable(): void {
        super._onEnable();
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    private _irradiance: Texture2D;
    /**
     * @en Light probe irradiance texture.
     * @zh 光照探针辐照度纹理。
     */
    get irradiance(): Texture2D {
        return this._irradiance;
    }

    set irradiance(value: Texture2D) {
        if (this._irradiance == value)
            return;
        this._irradiance && (this._irradiance._removeReference());
        if (value) {
            value._addReference();
            this._dataModule.irradiance = value._texture;
        }
        else {
            this._dataModule.irradiance = null;
        }
        this._irradiance = value;
        this._irradiance = value;
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    private _distance: Texture2D;
    /**
     * @en Distance texture for light probe.
     * @zh 光照探针的距离纹理。
     */
    get distance(): Texture2D {
        return this._distance;
    }

    set distance(value: Texture2D) {
        if (this._distance == value)
            return;
        this._distance && (this._distance._removeReference());
        if (value) {
            value._addReference();
            this._dataModule.distance = value._texture;
        }
        else {
            this._dataModule.distance = null;
        }
        this._distance = value;
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    /**
     * @en Normal bias for volumetric global illumination.
     * @zh 体积全局光照的法线偏移。
     */
    get normalBias(): number {
        return this._params.z;
    }

    set normalBias(value: number) {
        this._params.z = value;
        this._dataModule.setParams(this._params);
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    /**
     * @en View bias for volumetric global illumination.
     * @zh 体积全局光照的视图偏移。
     */
    get viewBias(): number {
        return this._params.w;
    }

    set viewBias(value: number) {
        this._params.w = value;
        this._dataModule.setParams(this._params);
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    /**
     * @en Number of texels per probe in the irradiance texture.
     * @zh 辐照度纹理中每个探针的纹素数量。
     */
    get irradianceTexel(): number {
        return this._params.x;
    }

    /**
     * @en Number of texels per probe in the distance texture.
     * @zh 距离纹理中每个探针的纹素数量。
     */
    get distanceTexel(): number {
        return this._params.y;
    }

    /**
     * @en The intensity of the reflection probe.
     * @zh 反射探针的强度。
     */
    get intensity(): number {
        return this._dataModule.intensity;
    }

    set intensity(value: number) {
        if (value == this._dataModule.intensity) return;
        value = Math.max(value, 0.0);
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    /**
     * @en The number of probes for volumetric global illumination.
     * @zh 体积全局光照的探针数量。
     */
    get probeCounts(): Vector3 {
        return this._probeCounts;
    }

    set probeCounts(value: Vector3) {
        if (value.equal(this._probeCounts)) return;
        value.cloneTo(this._probeCounts);
        this._dataModule.setProbeCounts(value);
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }
    /**
     * @en The step size between probes for volumetric global illumination.
     * @zh 体积全局光照探针之间的间隔。
     */
    get probeStep(): Vector3 {
        return this._probeStep;
    }

    set probeStep(value: Vector3) {
        if (value.equal(this._probeStep)) return;
        value.cloneTo(this._probeStep);
        this._dataModule.setProbeStep(value);
        this._dataModule.updateMark = ILaya.Scene3D._updateMark;
    }

    _reCaculateBoundBox(): void {
        super._reCaculateBoundBox();
        this.bounds.cloneTo(this._dataModule.bound);
    }

    /**
     * @internal
     */
    _onDestroy() {
        this.irradiance = null;
        this.distance = null;
        this._dataModule.destroy();
        this._dataModule = null;
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