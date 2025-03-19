
import { VolumetricGI } from "../../../../d3/component/Volume/VolumetricGI/VolumetricGI";
import { ReflectionProbe } from "../../../../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { RenderableSprite3D } from "../../../../d3/core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../../d3/core/render/Sprite3DRenderDeclaration";
import { Bounds } from "../../../../d3/math/Bounds";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IVolumetricGIData } from "../../Design/3D/I3DRenderModuleData";


export class WebVolumetricGI implements IVolumetricGIData {

    private static _idCounter: number = 0;

    _id: number = ++WebVolumetricGI._idCounter;

    private _probeCounts: Vector3 = new Vector3();
    private _probeStep: Vector3 = new Vector3();
    irradiance: InternalTexture;
    distance: InternalTexture;
    bound: Bounds;
    intensity: number;
    updateMark: number;

    shaderData: ShaderData;

    /**
     * @internal
     * x: irradiance probe texel size
     * y: distance probe texel size
     * z: normalBias
     * w: viewBias
     */
    private _params: Vector4 = new Vector4();

    constructor() {
        this._params = new Vector4();
        this.bound = new Bounds();
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
    }
    setParams(value: Vector4): void {
        value.cloneTo(this._params)
    }
    setProbeCounts(value: Vector3): void {
        value.cloneTo(this._probeCounts);
    }

    setProbeStep(value: Vector3): void {
        value.cloneTo(this._probeStep);
    }

    applyRenderData(): void {
        let data = this.shaderData;
        data.addDefine(VolumetricGI.SHADERDEFINE_VOLUMETRICGI);
        data.setVector3(VolumetricGI.VOLUMETRICGI_PROBECOUNTS, this._probeCounts);
        data.setVector3(VolumetricGI.VOLUMETRICGI_PROBESTEPS, this._probeStep);
        data.setVector3(VolumetricGI.VOLUMETRICGI_PROBESTARTPOS, this.bound.getMin());
        data.setVector(VolumetricGI.VOLUMETRICGI_PROBEPARAMS, this._params);
        data._setInternalTexture(VolumetricGI.VOLUMETRICGI_IRRADIANCE, this.irradiance);
        data._setInternalTexture(VolumetricGI.VOLUMETRICGI_DISTANCE, this.distance);
        data.setNumber(ReflectionProbe.AMBIENTINTENSITY, this.intensity);
    }

    destroy(): void {
        this.shaderData.destroy();
        this.shaderData = null;
        this.irradiance = null;
        this.distance = null;
        this.bound = null;
    }
}