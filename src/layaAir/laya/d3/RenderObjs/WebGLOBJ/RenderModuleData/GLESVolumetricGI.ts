import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { Texture2D } from "../../../../resource/Texture2D";
import { IVolumetricGIData } from "../../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { RenderableSprite3D } from "../../../core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { Bounds } from "../../../math/Bounds";

export class GLESVolumetricGI implements IVolumetricGIData {
    private _probeCounts: Vector3 = new Vector3();
    private _probeStep: Vector3 = new Vector3();
    irradiance: Texture2D;
    distance: Texture2D;
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
        data.setTexture(RenderableSprite3D.VOLUMETRICGI_IRRADIANCE, this.irradiance);
        data.setTexture(RenderableSprite3D.VOLUMETRICGI_DISTANCE, this.distance);
        data.setNumber(RenderableSprite3D.AMBIENTINTENSITY, this.intensity);
    }
}