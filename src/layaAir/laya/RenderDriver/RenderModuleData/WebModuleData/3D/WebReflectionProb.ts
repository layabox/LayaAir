import { RenderableSprite3D } from "../../../../d3/core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../../d3/core/render/Sprite3DRenderDeclaration";
import { AmbientMode } from "../../../../d3/core/scene/AmbientMode";
import { Bounds } from "../../../../d3/math/Bounds";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IReflectionProbeData } from "../../Design/3D/I3DRenderModuleData";



export class WebReflectionProbe implements IReflectionProbeData {
    /**@internal */
    boxProjection: boolean;
    /**@internal */
    bound: Bounds;
    /**@internal */
    ambientMode: AmbientMode;

    /**@internal */
    ambientIntensity: number;
    /**@internal */
    reflectionIntensity: number;
    /**@internal */
    reflectionTexture: InternalTexture;
    /**@internal */
    iblTex: InternalTexture;
    /**@internal */
    updateMark: number;
    /**@internal */
    iblTexRGBD: boolean;
    /**@internal */
    private _reflectionHDRParams: Vector4
    /**@internal */
    private _shCoefficients: Vector4[];
    /**@internal */
    private _probePosition: Vector3;
    /**@internal */
    private _ambientColor: Color;
    /**@internal */
    private _ambientSH: Float32Array;
    /**@internal */
    constructor() {
        this._shCoefficients = [];
        this._probePosition = new Vector3();
        this._ambientColor = new Color();
    }

    /**
     * @internal
     */
    destroy(): void {
        this.bound = null;
        delete this._shCoefficients;
        delete this._ambientSH;

    }
    /**@internal */
    setAmbientSH(value: Float32Array): void {
        this._ambientSH = value;
    }
    /**@internal */
    setShCoefficients(value: Vector4[]): void {
        this._shCoefficients.length = 0;
        value.forEach(element => {
            var v4 = new Vector4();
            element.cloneTo(v4);
            this._shCoefficients.push(v4);
        });
    }
    /**@internal */
    setProbePosition(value: Vector3): void {
        value && value.cloneTo(this._probePosition);
    }
    /**@internal */
    setreflectionHDRParams(value: Vector4): void {
        value && value.cloneTo(this._reflectionHDRParams);
    }
    /**@internal */
    setAmbientColor(value: Color): void {
        value && value.cloneTo(this._ambientColor);
    }
    /**@internal */
    applyRenderData(data: ShaderData): void {
        //boxProjection
        if (!this.boxProjection) {
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
        } else {
            data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
            data.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION, this._probePosition);
            data.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX, this.bound.getMax());
            data.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN, this.bound.getMin());
        }
        if (this.ambientMode == AmbientMode.SolidColor) {
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
            data.setColor(RenderableSprite3D.AMBIENTCOLOR, this._ambientColor);
        } else if (this.iblTex && this._ambientSH) {
            data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            if (this.iblTex) {
                data._setInternalTexture(RenderableSprite3D.IBLTEX, this.iblTex);
                data.setNumber(RenderableSprite3D.IBLROUGHNESSLEVEL, this.iblTex.maxMipmapLevel);
            };
            this.iblTexRGBD ? data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD) : data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD);
            this._ambientSH && data.setBuffer(RenderableSprite3D.AMBIENTSH,  this._ambientSH);
        }
        data.setNumber(RenderableSprite3D.AMBIENTINTENSITY, this.ambientIntensity);
        data.setNumber(RenderableSprite3D.REFLECTIONINTENSITY, this.reflectionIntensity);
    }

}