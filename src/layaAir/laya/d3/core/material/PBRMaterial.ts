import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";
import { Material } from "./Material";
import { RenderState } from "./RenderState";
import { PBRRenderQuality } from "./PBRRenderQuality";

/**
 * 渲染模式。
 */
export enum PBRRenderMode {
    /**不透明。*/
    Opaque,
    /**透明裁剪。*/
    Cutout,
    /**透明混合_游戏中经常使用的透明。*/
    Fade,
    /**透明混合_物理上看似合理的透明。*/
    Transparent
}

/**
 * PBR材质的父类,该类为抽象类。
 */
export class PBRMaterial extends Material {
    /** @internal */
    static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
    /** @internal */
    static SHADERDEFINE_NORMALTEXTURE: ShaderDefine;
    /** @internal */
    static SHADERDEFINE_OCCLUSIONTEXTURE: ShaderDefine;
    /** @internal */
    static SHADERDEFINE_PARALLAXTEXTURE: ShaderDefine;
    /** @internal */
    static SHADERDEFINE_EMISSION: ShaderDefine;
    /** @internal */
    static SHADERDEFINE_EMISSIONTEXTURE: ShaderDefine;
    /** @internal */
    static SHADERDEFINE_TRANSPARENTBLEND: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_LAYA_PBR_BRDF_HIGH: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_LAYA_PBR_BRDF_LOW: ShaderDefine;

    /** @internal */
    static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
    /** @internal */
    static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
    /** @internal */
    static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
    /** @internal */
    static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
    /** @internal */
    static NORMALSCALE: number = Shader3D.propertyNameToID("u_NormalScale");
    /** @internal */
    static SMOOTHNESS: number = Shader3D.propertyNameToID("u_Smoothness");
    /** @internal */
    static SMOOTHNESSSCALE: number = Shader3D.propertyNameToID("u_SmoothnessScale");
    /** @internal */
    static OCCLUSIONTEXTURE: number = Shader3D.propertyNameToID("u_OcclusionTexture");
    /** @internal */
    static OCCLUSIONSTRENGTH: number = Shader3D.propertyNameToID("u_occlusionStrength");
    /** @internal */
    static PARALLAXTEXTURE: number = Shader3D.propertyNameToID("u_ParallaxTexture");
    /** @internal */
    static PARALLAXSCALE: number = Shader3D.propertyNameToID("u_ParallaxScale");
    /** @internal */
    static EMISSIONTEXTURE: number = Shader3D.propertyNameToID("u_EmissionTexture");
    /** @internal */
    static EMISSIONCOLOR: number = Shader3D.propertyNameToID("u_EmissionColor");

    /** 渲染质量。*/
    static renderQuality: PBRRenderQuality = PBRRenderQuality.High;

    /**
	 * @private
	 */
    static __init__(): void {
        PBRMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
        PBRMaterial.SHADERDEFINE_NORMALTEXTURE = Shader3D.getDefineByName("NORMALTEXTURE");
        PBRMaterial.SHADERDEFINE_PARALLAXTEXTURE = Shader3D.getDefineByName("PARALLAXTEXTURE");
        PBRMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = Shader3D.getDefineByName("OCCLUSIONTEXTURE");
        PBRMaterial.SHADERDEFINE_EMISSION = Shader3D.getDefineByName("EMISSION");
        PBRMaterial.SHADERDEFINE_EMISSIONTEXTURE = Shader3D.getDefineByName("EMISSIONTEXTURE");
        PBRMaterial.SHADERDEFINE_TRANSPARENTBLEND = Shader3D.getDefineByName("TRANSPARENTBLEND");
        PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_HIGH = Shader3D.getDefineByName("LAYA_PBR_BRDF_HIGH");
        PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_LOW = Shader3D.getDefineByName("LAYA_PBR_BRDF_LOW");
    }


    /**
	 * 漫反射颜色。
	 */
    get albedoColor(): Vector4 {
        return <Vector4>this._shaderValues.getVector(PBRMaterial.ALBEDOCOLOR);
    }

    set albedoColor(value: Vector4) {
        this._shaderValues.setVector(PBRMaterial.ALBEDOCOLOR, value);
    }

	/**
	 * 漫反射贴图。
	 */
    get albedoTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.ALBEDOTEXTURE);
    }

    set albedoTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_ALBEDOTEXTURE);

        this._shaderValues.setTexture(PBRMaterial.ALBEDOTEXTURE, value);
    }

	/**
	 * 法线贴图。
	 */
    get normalTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.NORMALTEXTURE);
    }

    set normalTexture(value: BaseTexture) {
        if (value) {
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_NORMALTEXTURE);
        } else {
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        this._shaderValues.setTexture(PBRMaterial.NORMALTEXTURE, value);
    }

	/**
	 * 法线贴图缩放系数。
	 */
    get normalTextureScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.NORMALSCALE);
    }

    set normalTextureScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.NORMALSCALE, value);
    }

	/**
	 * 视差贴图。
	 */
    get parallaxTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.PARALLAXTEXTURE);
    }

    set parallaxTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        this._shaderValues.setTexture(PBRMaterial.PARALLAXTEXTURE, value);
    }

	/**
	 * 视差贴图缩放系数。
	 */
    get parallaxTextureScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.PARALLAXSCALE);
    }

    set parallaxTextureScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.PARALLAXSCALE, Math.max(0.005, Math.min(0.08, value)));
    }

	/**
	 * 遮挡贴图。
	 */
    get occlusionTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.OCCLUSIONTEXTURE);
    }

    set occlusionTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);

        this._shaderValues.setTexture(PBRMaterial.OCCLUSIONTEXTURE, value);
    }

	/**
	 * 遮挡贴图强度,范围为0到1。
	 */
    get occlusionTextureStrength(): number {
        return this._shaderValues.getNumber(PBRMaterial.OCCLUSIONSTRENGTH);
    }

    set occlusionTextureStrength(value: number) {
        this._shaderValues.setNumber(PBRMaterial.OCCLUSIONSTRENGTH, Math.max(0.0, Math.min(1.0, value)));
    }

    /**
	 * 光滑度,范围为0到1。
	 */
    get smoothness(): number {
        return this._shaderValues.getNumber(PBRMaterial.SMOOTHNESS);
    }

    set smoothness(value: number) {
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESS, Math.max(0.0, Math.min(1.0, value)));
    }

	/**
	 * 光滑度缩放系数,范围为0到1。
	 */
    get smoothnessTextureScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.SMOOTHNESSSCALE);
    }

    set smoothnessTextureScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESSSCALE, Math.max(0.0, Math.min(1.0, value)));
    }

    /**
	 * 是否开启自发光。
	 */
    get enableEmission(): boolean {
        return this._shaderValues.hasDefine(PBRMaterial.SHADERDEFINE_EMISSION);
    }

    set enableEmission(value: boolean) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_EMISSION);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_EMISSION);
    }

	/**
	 * 自发光颜色。
	 */
    get emissionColor(): Vector4 {
        return <Vector4>this._shaderValues.getVector(PBRMaterial.EMISSIONCOLOR);
    }

    set emissionColor(value: Vector4) {
        this._shaderValues.setVector(PBRMaterial.EMISSIONCOLOR, value);
    }

	/**
	 * 自发光贴图。
	 */
    get emissionTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.EMISSIONTEXTURE);
    }

    set emissionTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_EMISSIONTEXTURE);

        this._shaderValues.setTexture(PBRMaterial.EMISSIONTEXTURE, value);
    }

	/**
	 * 纹理平铺和偏移。
	 */
    get tilingOffset(): Vector4 {
        return (<Vector4>this._shaderValues.getVector(PBRMaterial.TILINGOFFSET));
    }

    set tilingOffset(value: Vector4) {
        if (value) {
			this._shaderValues.setVector(PBRMaterial.TILINGOFFSET, value);
		}
		else {
			this._shaderValues.getVector(PBRMaterial.TILINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
		}
    }



    /**
	 * 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case PBRRenderMode.Opaque:
                this.alphaTest = false;
                this.renderQueue = Material.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_TRANSPARENTBLEND);
                break;
            case PBRRenderMode.Cutout:
                this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_TRANSPARENTBLEND);
                break;
            case PBRRenderMode.Fade:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_TRANSPARENTBLEND);
                break;
            case PBRRenderMode.Transparent:
                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_TRANSPARENTBLEND);
                break;
            default:
                throw new Error("PBRMaterial:unknown renderMode value.");
        }
    }

    constructor() {
        super();
        this._shaderValues.setVector(PBRMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setVector(PBRMaterial.EMISSIONCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setVector(PBRMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESS, 0.5);
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESSSCALE, 1.0);
        this._shaderValues.setNumber(PBRMaterial.OCCLUSIONSTRENGTH, 1.0);
        this._shaderValues.setNumber(PBRMaterial.NORMALSCALE, 1.0);
        this._shaderValues.setNumber(PBRMaterial.PARALLAXSCALE, 0.001);
        this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);
        this.renderMode = PBRRenderMode.Opaque;
    }
}