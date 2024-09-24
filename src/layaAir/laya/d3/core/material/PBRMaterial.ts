import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { PBRRenderQuality } from "./PBRRenderQuality";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Texture2D } from "../../../resource/Texture2D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { PBRShaderLib } from "../../shader/pbr/PBRShaderLib";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";

/**
 * @en Enum representing the different render modes used in PBR (Physically Based Rendering) materials.
 * @zh 表示 PBR（基于物理的渲染）材质中使用的不同渲染模式的枚举。
 */
export enum PBRRenderMode {
    /**
     * @en Opaque render mode.
     * @zh 不透明渲染模式。
     */
    Opaque,
    /**
     * @en Cutout render mode.
     * @zh 裁剪透明渲染模式。
     */
    Cutout,
    /**
     * @en Transparent Mixing: Transparent commonly used in games
     * @zh 透明混合_游戏中经常使用的透明。
     */
    Fade,
    /**
     * @en Transparent Mixing: Physically Seemingly Reasonable Transparency
     * @zh 透明混合_物理上看似合理的透明。
     */
    Transparent
}

/**
 * @en The parent class of PBR material, which is an abstract class.
 * @zh PBR材质的父类,该类为抽象类。
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
    static SHADERDEFINE_EMISSIONTEXTURE: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_DETAILALBEDO: ShaderDefine;
    /**@internal */
    static SHADERDEFINE_DETAILNORMAL: ShaderDefine;

    /** @internal */
    static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

    /**@internal */
    static SHADERDEFINE_ANISOTROPYTEXTURE: ShaderDefine;

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
    /** @internal */
    static CLEARCOATNORMALTEXTURE: number;

    // anisotropy
    /** @internal */
    static ANISOTROPY: number;
    /** @internal */
    static ANISOTROPYTEXTURE: number;
    /** @internal */
    static ANISOTROPYROTATION: number;

    /** 
     * @en render quality
     * @zh 渲染质量。
     * */
    static renderQuality: PBRRenderQuality = PBRRenderQuality.High;

    /**
     * @private
     */
    static __init__(): void {
        PBRMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
        PBRMaterial.SHADERDEFINE_NORMALTEXTURE = Shader3D.getDefineByName("NORMALTEXTURE");
        PBRMaterial.SHADERDEFINE_PARALLAXTEXTURE = Shader3D.getDefineByName("PARALLAXTEXTURE");
        PBRMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = Shader3D.getDefineByName("OCCLUSIONTEXTURE");
        PBRMaterial.SHADERDEFINE_EMISSIONTEXTURE = Shader3D.getDefineByName("EMISSIONTEXTURE");
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

        //Detail
        PBRMaterial.DETAILALBEDOTEXTURE = Shader3D.propertyNameToID("u_DetailAlbedoTexture");
        PBRMaterial.DETAILNORMALTEXTURE = Shader3D.propertyNameToID("u_DetailNormalTexture");
        PBRMaterial.DETAILTILLINGOFFSET = Shader3D.propertyNameToID("u_DetailTillingOffset");
        PBRMaterial.DETAILNORMALSCALE = Shader3D.propertyNameToID("u_DetailNormalScale");

        // clear coat
        PBRMaterial.CLEARCOAT = Shader3D.propertyNameToID("u_ClearCoatFactor");
        PBRMaterial.SHADERDEFINE_CLEARCOATTEXTURE = Shader3D.getDefineByName("CLEARCOATMAP");
        PBRMaterial.CLEARCOATTEXTURE = Shader3D.propertyNameToID("u_ClearCoatTexture");

        PBRMaterial.CLEARCOATROUGHNESS = Shader3D.propertyNameToID("u_ClearCoatRoughness");
        PBRMaterial.SHADERDEFINE_CLEARCOATROUGHNESSTEXTURE = Shader3D.getDefineByName("CLEARCOAT_ROUGHNESSMAP");
        PBRMaterial.CLEARCOATROUGHNESSTEXTURE = Shader3D.propertyNameToID("u_ClearCoatRoughnessTexture");
        PBRMaterial.CLEARCOATNORMALTEXTURE = Shader3D.propertyNameToID("u_ClearCoatNormalTexture");

        // anisotropy
        PBRMaterial.ANISOTROPY = Shader3D.propertyNameToID("u_AnisotropyStrength");
        PBRMaterial.SHADERDEFINE_ANISOTROPYTEXTURE = Shader3D.getDefineByName("ANISOTROPYMAP");
        PBRMaterial.ANISOTROPYTEXTURE = Shader3D.propertyNameToID("u_AnisotropyTexture");
        PBRMaterial.ANISOTROPYROTATION = Shader3D.propertyNameToID("u_AnisotropyRotation");
    }


    /**
     * @en Albedo color
     * @zh 漫反射颜色。
     */
    get albedoColor(): Color {
        return this._shaderValues.getColor(PBRMaterial.ALBEDOCOLOR);
    }

    set albedoColor(value: Color) {
        this._shaderValues.setColor(PBRMaterial.ALBEDOCOLOR, value);
    }

    /**
     * @en Albedo texture
     * @zh 漫反射贴图。
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

        this.setTextureByIndex(PBRMaterial.ALBEDOTEXTURE, value);
    }

    /**
     * @en Normal texture
     * @zh 法线贴图。
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
        this.setTextureByIndex(PBRMaterial.NORMALTEXTURE, value);
    }

    /**
     * @en Normal texture scaling factor.
     * @zh 法线贴图缩放系数。
     */
    get normalTextureScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.NORMALSCALE);
    }

    set normalTextureScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.NORMALSCALE, value);
    }

    /**
     * @en Parallax texture
     * @zh 视差贴图。
     */
    get parallaxTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.PARALLAXTEXTURE);
    }

    set parallaxTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        this.setTextureByIndex(PBRMaterial.PARALLAXTEXTURE, value);
    }

    /**
     * @en Parallax texture scaling factor.
     * @zh 视差贴图缩放系数。
     */
    get parallaxTextureScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.PARALLAXSCALE);
    }

    set parallaxTextureScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.PARALLAXSCALE, Math.max(0.005, Math.min(0.08, value)));
    }

    /**
     * @en Occlusion texture
     * @zh 遮挡贴图。
     */
    get occlusionTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.OCCLUSIONTEXTURE);
    }

    set occlusionTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);

        this.setTextureByIndex(PBRMaterial.OCCLUSIONTEXTURE, value);
    }

    /**
     * @en Occlusion texture strength, the range is from 0 to 1.
     * @zh 遮挡贴图强度，范围为0到1。
     */
    get occlusionTextureStrength(): number {
        return this._shaderValues.getNumber(PBRMaterial.OCCLUSIONSTRENGTH);
    }

    set occlusionTextureStrength(value: number) {
        this._shaderValues.setNumber(PBRMaterial.OCCLUSIONSTRENGTH, Math.max(0.0, Math.min(1.0, value)));
    }

    /**
     * @en The smoothness of the material, the range is from 0 to 1.
     * @zh 材质的光滑度，范围为0到1。
     */
    get smoothness(): number {
        return this._shaderValues.getNumber(PBRMaterial.SMOOTHNESS);
    }

    set smoothness(value: number) {
        this._shaderValues.setNumber(PBRMaterial.SMOOTHNESS, Math.max(0.0, Math.min(1.0, value)));
    }

    /**
     * @en Whether to support vertex color.
     * @zh 是否支持顶点色。
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
     * @en Whether to enable emission.
     * @zh 是否开启自发光。
     */
    get enableEmission(): boolean {
        return this._shaderValues.hasDefine(PBRShaderLib.DEFINE_EMISSION);
    }

    set enableEmission(value: boolean) {
        if (value)
            this._shaderValues.addDefine(PBRShaderLib.DEFINE_EMISSION);
        else
            this._shaderValues.removeDefine(PBRShaderLib.DEFINE_EMISSION);
    }

    /**
     * @en Emission color.
     * @zh 自发光颜色。
     */
    get emissionColor(): Color {
        return this._shaderValues.getColor(PBRMaterial.EMISSIONCOLOR);
    }

    set emissionColor(value: Color) {
        this._shaderValues.setColor(PBRMaterial.EMISSIONCOLOR, value);
    }

    /**
     * @en Emission intensity
     * @zh 自发光强度
     */
    get emissionIntensity() {
        return this._shaderValues.getNumber(PBRMaterial.EMISSIONIntensity);
    }

    set emissionIntensity(value: number) {
        //u_EmissionIntensity
        this._shaderValues.setNumber(PBRMaterial.EMISSIONIntensity, value);
    }

    /**
     * @en Emission texture.
     * @zh 自发光贴图。
     */
    get emissionTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.EMISSIONTEXTURE);
    }

    set emissionTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_EMISSIONTEXTURE);

        this.setTextureByIndex(PBRMaterial.EMISSIONTEXTURE, value);
    }

    /**
     * @en Texture tiling and offsetting.
     * @zh 纹理平铺和偏移。
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
     * @en Detail texture.
     * @zh 细节贴图。
     */
    get detailAlbedoTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.DETAILALBEDOTEXTURE);
    }

    set detailAlbedoTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_DETAILALBEDO);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_DETAILALBEDO);

        this.setTextureByIndex(PBRMaterial.DETAILALBEDOTEXTURE, value);
    }


    /**
     * @en Detail normal texture.
     * @zh 细节法线贴图。
     */
    get detailNormalTexture(): BaseTexture {
        return this._shaderValues.getTexture(PBRMaterial.DETAILNORMALTEXTURE);
    }

    set detailNormalTexture(value: BaseTexture) {
        if (value)
            this._shaderValues.addDefine(PBRMaterial.SHADERDEFINE_DETAILNORMAL);
        else
            this._shaderValues.removeDefine(PBRMaterial.SHADERDEFINE_DETAILNORMAL);
        this.setTextureByIndex(PBRMaterial.DETAILNORMALTEXTURE, value);
    }

    /**
     * @en The tiling and offset values for the detail textures. 
     * @zh 细节图纹理平铺和偏移。
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
     * @en The scale factor for the detail normal textures.
     * @zh 细节法线贴图缩放系数。
     */
    get detailNormalScale(): number {
        return this._shaderValues.getNumber(PBRMaterial.DETAILNORMALSCALE);
    }

    set detailNormalScale(value: number) {
        this._shaderValues.setNumber(PBRMaterial.DETAILNORMALSCALE, value);
    }




    /**
     * @en Render mode.
     * @zh 渲染模式。
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

    /**
     * @en Whether to enable anisotropy
     * @zh 是否开启各向异性
     */
    public get anisotropyEnable(): boolean {
        return this.shaderData.hasDefine(PBRShaderLib.DEFINE_ANISOTROPY);
    }
    public set anisotropyEnable(value: boolean) {
        if (value) {
            this.shaderData.addDefine(PBRShaderLib.DEFINE_ANISOTROPY);
        }
        else {
            this.shaderData.removeDefine(PBRShaderLib.DEFINE_ANISOTROPY);
        }
    }

    /**
     * @en The strength of the anisotropy effect.
     * @zh 各向异性强度
     */
    public get anisotropy(): number {
        return this.getFloatByIndex(PBRMaterial.ANISOTROPY);
    }
    public set anisotropy(value: number) {
        this.setFloatByIndex(PBRMaterial.ANISOTROPY, Math.min(1, Math.max(-1, value)));
    }

    /**
     * @en Anisotropy strength texture.
     * @zh 各向异性强度贴图。
     */
    public get anisotropyTexture(): Texture2D {
        return <Texture2D>this.getTextureByIndex(PBRMaterial.ANISOTROPYTEXTURE);
    }

    public set anisotropyTexture(value: Texture2D) {
        this.setTextureByIndex(PBRMaterial.ANISOTROPYTEXTURE, value);
        if (value) {
            this.addDefine(PBRMaterial.SHADERDEFINE_ANISOTROPYTEXTURE);
        }
        else {
            this.removeDefine(PBRMaterial.SHADERDEFINE_ANISOTROPYTEXTURE);
        }
    }

    /**
     * @en Anisotropy rotation in tangent space.
     * @zh 各向异性在切线空间中的旋转。
     */
    public get anisotropyRotation(): number {
        return this.getFloatByIndex(PBRMaterial.ANISOTROPYROTATION);
    }
    public set anisotropyRotation(value: number) {
        value = Math.max(Math.min(value, 1.0), 0.0);
        this.setFloatByIndex(PBRMaterial.ANISOTROPYROTATION, value);
    }

    /**
     * @en Whether to enable clear coat
     * @zh 是否开启透明涂层
     */
    public get clearCoatEnable(): boolean {
        return this.shaderData.hasDefine(PBRShaderLib.DEFINE_CLEARCOAT);
    }
    public set clearCoatEnable(value: boolean) {
        if (value) {
            this.shaderData.addDefine(PBRShaderLib.DEFINE_CLEARCOAT);
        }
        else {
            this.shaderData.removeDefine(PBRShaderLib.DEFINE_CLEARCOAT);
        }
    }

    /**
     * @en The strength of the clear coat effect.
     * @zh 透明涂层强度
     */
    public get clearCoat(): number {
        return this.shaderData.getNumber(PBRMaterial.CLEARCOAT);
    }
    public set clearCoat(value: number) {
        this.shaderData.setNumber(PBRMaterial.CLEARCOAT, value);
    }

    /**
     * @en Clear coat strength texture.
     * @zh 透明涂层强度贴图
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
        this.setTextureByIndex(PBRMaterial.CLEARCOATTEXTURE, value);
    }

    /**
     * @en Clear coat roughness.
     * @zh 透明涂层粗糙度。
     */
    public get clearCoatRoughness(): number {
        return this.shaderData.getNumber(PBRMaterial.CLEARCOATROUGHNESS);
    }
    public set clearCoatRoughness(value: number) {
        this.shaderData.setNumber(PBRMaterial.CLEARCOATROUGHNESS, value);
    }

    /**
     * @en Clear coat roughness texture.
     * @zh 透明涂层粗糙度贴图。
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
        this.setTextureByIndex(PBRMaterial.CLEARCOATROUGHNESSTEXTURE, value);
    }

    /**
     * @en Clear coat normal texture.
     * @zh 透明涂层法线贴图。
     */
    public get clearCoatNormalTexture(): BaseTexture {
        return this.shaderData.getTexture(PBRMaterial.CLEARCOATNORMALTEXTURE);
    }
    public set clearCoatNormalTexture(value: BaseTexture) {
        if (value) {
            this.shaderData.addDefine(PBRShaderLib.DEFINE_CLEARCOAT_NORMAL);
        }
        else {
            this.shaderData.removeDefine(PBRShaderLib.DEFINE_CLEARCOAT_NORMAL);
        }
        this.setTextureByIndex(PBRMaterial.CLEARCOATNORMALTEXTURE, value);
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
    }
    
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