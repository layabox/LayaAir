import { InternalTexture } from "../../../../RenderEngine/RenderInterface/InternalTexture";
import { WebShaderData } from "../../../../RenderEngine/RenderShader/WebShaderData";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { TextureCube } from "../../../../resource/TextureCube";
import { IReflectionProbeData } from "../../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { RenderableSprite3D } from "../../../core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../core/render/Sprite3DRenderDeclaration";
import { AmbientMode } from "../../../core/scene/AmbientMode";
import { Bounds } from "../../../math/Bounds";

export class GLESReflectionProbe implements IReflectionProbeData {
    /**@internal */
    boxProjection: boolean;
    /**@internal */
    bound: Bounds;
    /**@internal */
    ambientMode: AmbientMode;
    /**@internal */
    ambientSH: Float32Array;
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
        delete this.ambientSH;

    }
    /**@internal */
    setAmbientSH(value: Float32Array): void {
        throw new Error("Method not implemented.");
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
    applyRenderData(data: WebShaderData): void {
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
        } else if (this.iblTex && this.ambientSH) {
            data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_IBL);
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            if (this.iblTex) {
                data._setInternalTexture(RenderableSprite3D.IBLTEX, this.iblTex);
                data.setNumber(RenderableSprite3D.IBLROUGHNESSLEVEL, this.iblTex.maxMipmapLevel);
            };
            this.iblTexRGBD ? data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD) : data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD);
            this.ambientSH && data.setBuffer(RenderableSprite3D.AMBIENTSH, this.ambientSH);
        }
        data.setNumber(RenderableSprite3D.AMBIENTINTENSITY, this.ambientIntensity);
        data.setNumber(RenderableSprite3D.REFLECTIONINTENSITY, this.reflectionIntensity);
    }

}