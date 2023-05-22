import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "./Material";
import { PBRRenderQuality } from "./PBRRenderQuality";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { Texture2D } from "../../../resource/Texture2D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";

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

export enum PBRMaterialType {
    Standard,
    Anisotropy
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

    /**@internal */
    static SHADERDEFINE_ANISOTROPY: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_DETAILALBEDO: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_DETAILNORMAL: ShaderDefine;

    /** @internal */
    static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_TANGENTTEXTURE: ShaderDefine;

    /** @internal */
    static SHADERDEFINE_TRANSPARENTBLEND: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_LAYA_PBR_BRDF_HIGH: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_LAYA_PBR_BRDF_LOW: ShaderDefine;

    /** @internal */
    static ALBEDOTEXTURE: number;
    /** @internal */
    static ALBEDOCOLOR: number;
    /** @internal */
    static TILINGOFFSET: number;
    /** @internal */
    static NORMALTEXTURE: number;
    /** @internal */
    static NORMALSCALE: number;
    /** @internal */
    static SMOOTHNESS: number;
    /** @internal */
    static SMOOTHNESSSCALE: number;
    /** @internal */
    static OCCLUSIONTEXTURE: number;
    /** @internal */
    static OCCLUSIONSTRENGTH: number;
    /** @internal */
    static PARALLAXTEXTURE: number;
    /** @internal */
    static PARALLAXSCALE: number;
    /** @internal */
    static EMISSIONTEXTURE: number;
    /** @internal */
    static EMISSIONCOLOR: number;
    /**@internal */
    static EMISSIONIntensity: number
    /** @internal */
    static ANISOTROPY: number;
    /** @internal */
    static TANGENTTEXTURE: number;
    //Detail
    /** @internal */
    static DETAILALBEDOTEXTURE: number;
    /**@internal */
    static DETAILNORMALTEXTURE: number;
    /**@internal */
    static DETAILTILLINGOFFSET: number;
    /**@internal */
    static DETAILNORMALSCALE: number;

    // clear coat
    /**@internal */
    static SHADERDEFINE_CLEARCOAT: ShaderDefine;
    /**@internal */
    static CLEARCOAT: number;
    /**@internal */
    static SHADERDEFINE_CLEARCOATTEXTURE: ShaderDefine;
    /**@internal */
    static CLEARCOATTEXTURE: number;
    /**@internal */
    static CLEARCOATROUGHNESS: number;
    /**@internal */
    static SHADERDEFINE_CLEARCOATROUGHNESSTEXTURE: ShaderDefine;
    /**@internal */
    static CLEARCOATROUGHNESSTEXTURE: number;
    /**@internal */
    static SHADERDEFINE_CLEARCOATNORMAL: ShaderDefine;
    /** @internal */
    static CLEARCOATNORMALTEXTURE: number;


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
        PBRMaterial.SHADERDEFINE_ANISOTROPY = Shader3D.getDefineByName("ANISOTROPIC");
        PBRMaterial.SHADERDEFINE_TANGENTTEXTURE = Shader3D.getDefineByName("TANGENTTEXTURE");
        PBRMaterial.SHADERDEFINE_TRANSPARENTBLEND = Shader3D.getDefineByName("TRANSPARENTBLEND");
        PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_HIGH = Shader3D.getDefineByName("LAYA_PBR_BRDF_HIGH");
        PBRMaterial.SHADERDEFINE_LAYA_PBR_BRDF_LOW = Shader3D.getDefineByName("LAYA_PBR_BRDF_LOW");
        //Detail
        PBRMaterial.SHADERDEFINE_DETAILALBEDO = Shader3D.getDefineByName("DETAILTEXTURE");
        PBRMaterial.SHADERDEFINE_DETAILNORMAL = Shader3D.getDefineByName("DETAILNORMAL");

        PBRMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");



        PBRMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
        PBRMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
        PBRMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
        PBRMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
        PBRMaterial.NORMALSCALE = Shader3D.propertyNameToID("u_NormalScale");
        PBRMaterial.SMOOTHNESS = Shader3D.propertyNameToID("u_Smoothness");
        PBRMaterial.OCCLUSIONTEXTURE = Shader3D.propertyNameToID("u_OcclusionTexture");
        PBRMaterial.OCCLUSIONSTRENGTH = Shader3D.propertyNameToID("u_OcclusionStrength");
        PBRMaterial.PARALLAXTEXTURE = Shader3D.propertyNameToID("u_ParallaxTexture");
        PBRMaterial.PARALLAXSCALE = Shader3D.propertyNameToID("u_ParallaxScale");
        PBRMaterial.EMISSIONTEXTURE = Shader3D.propertyNameToID("u_EmissionTexture");
        PBRMaterial.EMISSIONCOLOR = Shader3D.propertyNameToID("u_EmissionColor");
        PBRMaterial.EMISSIONIntensity = Shader3D.propertyNameToID("u_EmissionIntensity");
        PBRMaterial.ANISOTROPY = Shader3D.propertyNameToID("u_Anisotropy");
        PBRMaterial.TANGENTTEXTURE = Shader3D.propertyNameToID("u_TangentTexture");
        //Detail
        PBRMaterial.DETAILALBEDOTEXTURE = Shader3D.propertyNameToID("u_DetailAlbedoTexture");
        PBRMaterial.DETAILNORMALTEXTURE = Shader3D.propertyNameToID("u_DetailNormalTexture");
        PBRMaterial.DETAILTILLINGOFFSET = Shader3D.propertyNameToID("u_DetailTillingOffset");
        PBRMaterial.DETAILNORMALSCALE = Shader3D.propertyNameToID("u_DetailNormalScale");

        // clear coat
        PBRMaterial.SHADERDEFINE_CLEARCOAT = Shader3D.getDefineByName("CLEARCOAT");

        PBRMaterial.CLEARCOAT = Shader3D.propertyNameToID("u_ClearCoat");
        PBRMaterial.SHADERDEFINE_CLEARCOATTEXTURE = Shader3D.getDefineByName("CLEARCOATTEXTURE");
        PBRMaterial.CLEARCOATTEXTURE = Shader3D.propertyNameToID("u_ClearCoatTexture");

        PBRMaterial.CLEARCOATROUGHNESS = Shader3D.propertyNameToID("u_ClearCoatRoughness");
        PBRMaterial.SHADERDEFINE_CLEARCOATROUGHNESSTEXTURE = Shader3D.getDefineByName("CLEARCOAT_ROUGHNESS");
        PBRMaterial.CLEARCOATROUGHNESSTEXTURE = Shader3D.propertyNameToID("u_ClearCoatRoughnessTexture");

        PBRMaterial.SHADERDEFINE_CLEARCOATNORMAL = Shader3D.getDefineByName("CLEARCOAT_NORMAL");
        PBRMaterial.CLEARCOATNORMALTEXTURE = Shader3D.propertyNameToID("u_ClearCoatNormalTexture");

    }


    /**
     * 漫反射颜色。
     */
    get albedoColor(): Color {
        return this._shaderValues.getColor(PBRMaterial.ALBEDOCOLOR);
    }

    set albedoColor(value: Color) {
        this._shaderValues.setColor(PBRMaterial.ALBEDOCOLOR, value);
    }

    /**
     * 漫反射贴图。
     */
    get albedoTexture(): BaseTexture {
        if (this.hasDefine(PBRMaterial.SHADERDEFINE_ALBEDOTEXTURE)) {
            return this._shaderValues.getTexture(PBRMaterial.ALBEDOTEXTURE);
        }
        else {
            return null;
        }
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
        if (this.hasDefine(PBRMaterial.SHADERDEFINE_NORMALTEXTURE)) {
            return this._shaderValues.getTexture(PBRMaterial.NORMALTEXTURE);
        }
        else {
            return null;
        }
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
      * 是否支持顶点色。
      */
    get enableVertexColor(): boolean {
        return this.hasDefine(PBRMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }

    set enableVertexColor(value: boolean) {
        if (value)
            this.addDefine(PBRMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this.removeDefine(PBRMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
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
    get emissionColor(): Color {
        return this._shaderValues.getColor(PBRMaterial.EMISSIONCOLOR);
    }

    set emissionColor(value: Color) {
        this._shaderValues.setColor(PBRMaterial.EMISSIONCOLOR, value);
    }

    set emissionIntensity(value: number) {
        //u_EmissionIntensity
        this._shaderValues.setNumber(PBRMaterial.EMISSIONIntensity, value);
    }

    get emissionIntensity() {
        return this._shaderValues.getNumber(PBRMaterial.EMISSIONIntensity);
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
     * 细节贴图。
     */
    get detailAlbedoTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.DETAILALBEDOTEXTURE);
    }

    set detailAlbedoTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_DETAILALBEDO);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_DETAILALBEDO);

        this._shaderValues.setTexture(PBRMaterial.DETAILALBEDOTEXTURE, value);
    }


    /**
     * 细节法线贴图。
     */
    get detailNormalTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.DETAILNORMALTEXTURE);
    }

    set detailNormalTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_DETAILNORMAL);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_DETAILNORMAL);
        this._shaderValues.setTexture(PBRMaterial.DETAILNORMALTEXTURE, value);
    }

    /**
    * 细节图纹理平铺和偏移。
    */
    get detailTilingOffset(): Vector4 {
        return (<Vector4>this._shaderValues.getVector(PBRMaterial.DETAILTILLINGOFFSET));
    }

    set detailTilingOffset(value: Vector4) {
        if (value) {
            this._shaderValues.setVector(PBRMaterial.DETAILTILLINGOFFSET, value);
        }
        else {
            this._shaderValues.getVector(PBRMaterial.DETAILTILLINGOFFSET).setValue(1.0, 1.0, 0.0, 0.0);
        }
    }

    /**
    * 细节法线贴图缩放系数。
    */
    get detailNormalScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.DETAILNORMALSCALE);
    }

    set detailNormalScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.DETAILNORMALSCALE, value);
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

    public get anisotropy(): number {
        return this.getFloatByIndex(PBRMaterial.ANISOTROPY);
    }

    public set anisotropy(value: number) {
        this.setFloatByIndex(PBRMaterial.ANISOTROPY, Math.min(1, Math.max(-1, value)));
    }

    public get tangentTexture(): Texture2D {
        return <Texture2D>this.getTextureByIndex(PBRMaterial.TANGENTTEXTURE);
    }
    public set tangentTexture(value: Texture2D) {
        this.setTextureByIndex(PBRMaterial.TANGENTTEXTURE, value);
        if (value) {
            this.addDefine(PBRMaterial.SHADERDEFINE_TANGENTTEXTURE);
        }
        else {
            this.removeDefine(PBRMaterial.SHADERDEFINE_TANGENTTEXTURE);
        }
    }

    // todo remove
    private _materialType: PBRMaterialType;
    public get materialType(): PBRMaterialType {
        return this._materialType;
    }
    public set materialType(value: PBRMaterialType) {
        switch (value) {
            case PBRMaterialType.Standard:
                this.removeDefine(PBRMaterial.SHADERDEFINE_ANISOTROPY);

                break;
            case PBRMaterialType.Anisotropy:
                this.addDefine(PBRMaterial.SHADERDEFINE_ANISOTROPY);

                break;
            default:
                break;
        }
        this._materialType = value;
    }

    /**
     * 是否开启 clear coat
     */
    public get clearCoatEnable(): boolean {
        return this.shaderData.hasDefine(PBRMaterial.SHADERDEFINE_CLEARCOAT);
    }
    public set clearCoatEnable(value: boolean) {
        if (value) {
            this.shaderData.addDefine(PBRMaterial.SHADERDEFINE_CLEARCOAT);
        }
        else {
            this.shaderData.removeDefine(PBRMaterial.SHADERDEFINE_CLEARCOAT);
        }
    }

    /**
     * clear coat 层 强度
     */
    public get clearCoat(): number {
        return this.shaderData.getNumber(PBRMaterial.CLEARCOAT);
    }
    public set clearCoat(value: number) {
        this.shaderData.setNumber(PBRMaterial.CLEARCOAT, value);
    }

    /**
     * clear coat 强度贴图
     */
    public get clearCoatTexture(): BaseTexture {
        return this.shaderData.getTexture(PBRMaterial.CLEARCOATTEXTURE);
    }
    public set clearCoatTexture(value: BaseTexture) {
        if (value) {
            this.shaderData.addDefine(PBRMaterial.SHADERDEFINE_CLEARCOATTEXTURE);
        }
        else {
            this.shaderData.removeDefine(PBRMaterial.SHADERDEFINE_CLEARCOATTEXTURE);
        }
        this.shaderData.setTexture(PBRMaterial.CLEARCOATTEXTURE, value);
    }

    /**
     * clear coat 层 粗糙度
     */
    public get clearCoatRoughness(): number {
        return this.shaderData.getNumber(PBRMaterial.CLEARCOATROUGHNESS);
    }
    public set clearCoatRoughness(value: number) {
        this.shaderData.setNumber(PBRMaterial.CLEARCOATROUGHNESS, value);
    }

    /**
     * clear coat 层 粗糙度贴图
     */
    public get clearCoatRoughnessTexture(): BaseTexture {
        return this.shaderData.getTexture(PBRMaterial.CLEARCOATROUGHNESSTEXTURE);
    }
    public set clearCoatRoughnessTexture(value: BaseTexture) {
        if (value) {
            this.shaderData.addDefine(PBRMaterial.SHADERDEFINE_CLEARCOATROUGHNESSTEXTURE);
        }
        else {
            this.shaderData.removeDefine(PBRMaterial.SHADERDEFINE_CLEARCOATROUGHNESSTEXTURE);
        }
        this.shaderData.setTexture(PBRMaterial.CLEARCOATROUGHNESSTEXTURE, value);
    }

    /**
     * clear coat 法线贴图
     */
    public get clearCoatNormalTexture(): BaseTexture {
        return this.shaderData.getTexture(PBRMaterial.CLEARCOATNORMALTEXTURE);
    }
    public set clearCoatNormalTexture(value: BaseTexture) {
        if (value) {
            this.shaderData.addDefine(PBRMaterial.SHADERDEFINE_CLEARCOATNORMAL);
        }
        else {
            this.shaderData.removeDefine(PBRMaterial.SHADERDEFINE_CLEARCOATNORMAL);
        }
        this.shaderData.setTexture(PBRMaterial.CLEARCOATNORMALTEXTURE, value);
    }

    constructor() {
        super();
        this._shaderValues.setColor(PBRMaterial.ALBEDOCOLOR, new Color(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setColor(PBRMaterial.EMISSIONCOLOR, new Color(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setVector(PBRMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESS, 0.5);
        this._shaderValues.setNumber(PBRMaterial.OCCLUSIONSTRENGTH, 1.0);
        this._shaderValues.setNumber(PBRMaterial.NORMALSCALE, 1.0);
        this._shaderValues.setNumber(PBRMaterial.PARALLAXSCALE, 0.001);
        this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);
        this.renderMode = PBRRenderMode.Opaque;
        this.materialType = PBRMaterialType.Standard;
    }


    //deprecated
    /**
     * @deprecated
     * 光滑度缩放系数,范围为0到1。
     */
    get smoothnessTextureScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.SMOOTHNESS);
    }

    set smoothnessTextureScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESS, Math.max(0.0, Math.min(1.0, value)));
    }
}