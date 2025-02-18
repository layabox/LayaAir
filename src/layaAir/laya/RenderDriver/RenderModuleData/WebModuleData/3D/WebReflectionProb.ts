import { Config } from "../../../../../Config";
import { Config3D } from "../../../../../Config3D";
import { ReflectionProbe } from "../../../../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { RenderableSprite3D } from "../../../../d3/core/RenderableSprite3D";
import { Sprite3DRenderDeclaration } from "../../../../d3/core/render/Sprite3DRenderDeclaration";
import { AmbientMode } from "../../../../d3/core/scene/AmbientMode";
import { Bounds } from "../../../../d3/math/Bounds";
import { LayaGL } from "../../../../layagl/LayaGL";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IReflectionProbeData } from "../../Design/3D/I3DRenderModuleData";



export class WebReflectionProbe implements IReflectionProbeData {

    private static _idCounter: number = 0;

    /** @internal */
    _id: number = ++WebReflectionProbe._idCounter;

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
    shaderData: ShaderData;
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
    private _updateMaskFlag = -1;
    /**@internal */
    constructor() {
        this._shCoefficients = [];
        this._probePosition = new Vector3();
        this._ambientColor = new Color();
        this.shaderData = LayaGL.renderDeviceFactory.createShaderData();
        if (Config._uniformBlock) {
            this.shaderData.createUniformBuffer("ReflectionProbe", ReflectionProbe.CommandMap);
        }
    }

    /**
     * @internal
     */
    destroy(): void {
        this.bound = null;
        delete this._shCoefficients;
        delete this._ambientSH;
        this.shaderData.destroy();
        this.shaderData = null;
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
    applyRenderData(): void {
        if (this.updateMark == this._updateMaskFlag) return;
        this._updateMaskFlag = this.updateMark;
        let data = this.shaderData;
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
            data.removeDefine(ReflectionProbe.SHADERDEFINE_GI_IBL);
            data.setColor(ReflectionProbe.AMBIENTCOLOR, this._ambientColor);
        } else if (this.iblTex && this._ambientSH) {
            data.addDefine(ReflectionProbe.SHADERDEFINE_GI_IBL);
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            if (this.iblTex) {
                data._setInternalTexture(ReflectionProbe.IBLTEX, this.iblTex);
                data.setNumber(ReflectionProbe.IBLROUGHNESSLEVEL, this.iblTex.maxMipmapLevel);
            };
            this.iblTexRGBD ? data.addDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD) : data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_IBL_RGBD);
            this._ambientSH && data.setBuffer(ReflectionProbe.AMBIENTSH, this._ambientSH);
        } else {
            data.removeDefine(Sprite3DRenderDeclaration.SHADERDEFINE_GI_LEGACYIBL);
            data.removeDefine(ReflectionProbe.SHADERDEFINE_GI_IBL);
        }
        data.setNumber(ReflectionProbe.AMBIENTINTENSITY, this.ambientIntensity);
        data.setNumber(ReflectionProbe.REFLECTIONINTENSITY, this.reflectionIntensity);
        if (Config._uniformBlock) this.shaderData.updateUBOBuffer(ReflectionProbe.BlockName);
    }

}