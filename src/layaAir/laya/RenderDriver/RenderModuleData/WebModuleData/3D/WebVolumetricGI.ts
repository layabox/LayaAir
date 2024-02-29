
import { RenderableSprite3D } from "../../../../d3/core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../../d3/core/render/Sprite3DRenderDeclaration";
import { Bounds } from "../../../../d3/math/Bounds";
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

    applyRenderData(data: ShaderData): void {
        data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_VOLUMETRICGI);
        data.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBECOUNTS, this._probeCounts);
        data.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBESTEPS, this._probeStep);
        data.setVector3(RenderableSprite3D.VOLUMETRICGI_PROBESTARTPOS, this.bound.getMin());
        data.setVector(RenderableSprite3D.VOLUMETRICGI_PROBEPARAMS, this._params);
        data._setInternalTexture(RenderableSprite3D.VOLUMETRICGI_IRRADIANCE, this.irradiance);
        data._setInternalTexture(RenderableSprite3D.VOLUMETRICGI_DISTANCE, this.distance);
        data.setNumber(RenderableSprite3D.AMBIENTINTENSITY, this.intensity);
    }
}