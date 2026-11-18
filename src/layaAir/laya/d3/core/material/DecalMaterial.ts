import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";
import { PBRMetallicSmoothnessSource } from "./PBRStandardMaterial";

/**
 * @en Projected surface material supporting base color, normal, metallic/AO/smoothness and emission.
 * @zh 投射表面材质，支持底色、法线、金属度/AO/光滑度和自发光。
 */
export class DecalMaterial extends Material {
    /** @internal */
    static CHANNEL_WEIGHTS: number;
    /** @internal */
    static MIP_BIAS: number;
    /**
     * @internal
     * @en Initialize after the render engine exists, matching other built-in materials.
     * @zh 与其他内置材质一致，在渲染引擎创建后初始化。
     */
    static __init__(): void {
        this.CHANNEL_WEIGHTS = Shader3D.propertyNameToID("u_DecalChannelWeights");
        this.MIP_BIAS = Shader3D.propertyNameToID("u_DecalMipBias");
    }

    constructor() {
        super();
        this.setShaderName("Decal");
    }

    /** @en Base color and opacity. @zh 底色与透明度。 */
    get albedoColor(): Color { return this.getColor("u_AlbedoColor"); }
    set albedoColor(value: Color) { this.setColor("u_AlbedoColor", value); }

    /** @en Base-color texture; alpha provides projector coverage. @zh 底色贴图，Alpha 提供投射覆盖率。 */
    get albedoTexture(): BaseTexture { return this.getTexture("u_AlbedoTexture"); }
    set albedoTexture(value: BaseTexture) { this._setSurfaceTexture("u_AlbedoTexture", "ALBEDOTEXTURE", value); }

    /** @en Tangent-space normal texture. @zh 切线空间法线贴图。 */
    get normalTexture(): BaseTexture { return this.getTexture("u_NormalTexture"); }
    set normalTexture(value: BaseTexture) { this._setSurfaceTexture("u_NormalTexture", "NORMALTEXTURE", value); }

    /** @en Normal texture scale, matching PBRMaterial. @zh 法线贴图强度，与 PBRMaterial 命名一致。 */
    get normalTextureScale(): number { return this.getFloat("u_NormalScale"); }
    set normalTextureScale(value: number) { this._setSurfaceFloat("u_NormalScale", value); }

    /** @en Metallic texture: R metallic, A smoothness. @zh 金属光滑度贴图：R 为金属度，A 为光滑度。 */
    get metallicGlossTexture(): BaseTexture { return this.getTexture("u_MetallicGlossTexture"); }
    set metallicGlossTexture(value: BaseTexture) { this._setSurfaceTexture("u_MetallicGlossTexture", "METALLICGLOSSTEXTURE", value); }

    /** @en Metallic value in [0,1], used without a metallic texture. @zh 无金属贴图时使用的金属度，范围 [0,1]。 */
    get metallic(): number { return this.getFloat("u_Metallic"); }
    set metallic(value: number) { this._setSurfaceFloat("u_Metallic", value, true); }

    /** @en Smoothness or texture smoothness multiplier, in [0,1]. @zh 光滑度或贴图光滑度缩放，范围 [0,1]。 */
    get smoothness(): number { return this.getFloat("u_Smoothness"); }
    set smoothness(value: number) { this._setSurfaceFloat("u_Smoothness", value, true); }

    /** @en Smoothness texture alpha source, matching PBRStandardMaterial. @zh 光滑度贴图 Alpha 来源，与 PBRStandardMaterial 一致。 */
    get smoothnessSource(): PBRMetallicSmoothnessSource {
        return this.hasDefine(Shader3D.getDefineByName("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA"))
            ? PBRMetallicSmoothnessSource.AlbedoTextureAlpha : PBRMetallicSmoothnessSource.MetallicGlossTextureAlpha;
    }
    set smoothnessSource(value: PBRMetallicSmoothnessSource) {
        if (value !== PBRMetallicSmoothnessSource.MetallicGlossTextureAlpha && value !== PBRMetallicSmoothnessSource.AlbedoTextureAlpha)
            throw new RangeError("Unknown decal smoothness texture source.");
        this.setDefine(Shader3D.getDefineByName("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA"), value === PBRMetallicSmoothnessSource.AlbedoTextureAlpha);
    }

    /** @en Occlusion texture, sampled from G. @zh AO 贴图，采样 G 通道。 */
    get occlusionTexture(): BaseTexture { return this.getTexture("u_OcclusionTexture"); }
    set occlusionTexture(value: BaseTexture) { this._setSurfaceTexture("u_OcclusionTexture", "OCCLUSIONTEXTURE", value); }

    /** @en Occlusion strength in [0,1]. @zh AO 贴图强度，范围 [0,1]。 */
    get occlusionTextureStrength(): number { return this.getFloat("u_OcclusionStrength"); }
    set occlusionTextureStrength(value: number) { this._setSurfaceFloat("u_OcclusionStrength", value, true); }

    /** @en Whether emission contributes. @zh 是否启用自发光。 */
    get enableEmission(): boolean { return this.hasDefine(Shader3D.getDefineByName("EMISSION")); }
    set enableEmission(value: boolean) { this.setDefine(Shader3D.getDefineByName("EMISSION"), value); }

    /** @en Emission color. @zh 自发光颜色。 */
    get emissionColor(): Color { return this.getColor("u_EmissionColor"); }
    set emissionColor(value: Color) { this.setColor("u_EmissionColor", value); }

    /** @en Emission intensity. @zh 自发光强度。 */
    get emissionIntensity(): number { return this.getFloat("u_EmissionIntensity"); }
    set emissionIntensity(value: number) { this._setSurfaceFloat("u_EmissionIntensity", value); }

    /** @en Emission texture. @zh 自发光贴图。 */
    get emissionTexture(): BaseTexture { return this.getTexture("u_EmissionTexture"); }
    set emissionTexture(value: BaseTexture) { this._setSurfaceTexture("u_EmissionTexture", "EMISSIONTEXTURE", value); }

    /** @en Texture tiling (xy) and offset (zw). @zh 纹理平铺（xy）与偏移（zw）。 */
    get tilingOffset(): Vector4 { return this.getVector4("u_TilingOffset"); }
    set tilingOffset(value: Vector4) { this.setVector4("u_TilingOffset", value || new Vector4(1, 1, 0, 0)); }

    private _setSurfaceTexture(name: string, define: string, value: BaseTexture): void {
        this.setDefine(Shader3D.getDefineByName(define), !!value);
        this.setTexture(name, value);
    }

    private _setSurfaceFloat(name: string, value: number, unitRange = false): void {
        if (!isFinite(value)) throw new RangeError(`DecalMaterial.${name} must be finite.`);
        this.setFloat(name, unitRange ? Math.max(0, Math.min(1, value)) : value);
    }

    /** @en Base-color contribution, in [0,1]. Also controls the alpha blend of the screen-space result. @zh 颜色影响权重，范围为 [0,1]，同时控制屏幕空间结果的混合权重。 */
    get albedoOpacity(): number { return this._weights.x; }
    set albedoOpacity(value: number) { this._setWeight(0, value); }

    /** @en Normal contribution, in [0,1]. Default zero preserves the receiver's normal. @zh 法线影响权重，范围为 [0,1]，默认为零以保留接收表面法线。 */
    get normalOpacity(): number { return this._weights.y; }
    set normalOpacity(value: number) { this._setWeight(1, value); }

    /** @en Shared metallic/AO/smoothness contribution in DBuffer mode. @zh DBuffer 模式下金属度、AO、光滑度共用的影响权重。 */
    get maosOpacity(): number { return this._weights.z; }
    set maosOpacity(value: number) { this._setWeight(2, value); }

    /**
     * @en Texture mip bias in [-1,2], default 0. Positive values increase minification filtering; negative values sharpen and can increase aliasing.
     * @zh 纹理 mip 偏移，范围 [-1,2]，默认为 0。正值加强缩小过滤，负值更锐利但可能增加混叠。
     */
    get mipBias(): number { return this.shaderData.getNumber(DecalMaterial.MIP_BIAS); }
    set mipBias(value: number) {
        if (!isFinite(value)) throw new RangeError("DecalMaterial.mipBias must be finite.");
        this.shaderData.setNumber(DecalMaterial.MIP_BIAS, Math.max(-1, Math.min(2, value)));
    }

    /** @en Whether base color contributes. @zh 是否影响颜色。 */
    get affectAlbedo(): boolean { return this.albedoOpacity > 0; }
    set affectAlbedo(value: boolean) { this.albedoOpacity = value ? 1 : 0; }

    /** @en Whether the normal contributes. @zh 是否影响法线。 */
    get affectNormal(): boolean { return this.normalOpacity > 0; }
    set affectNormal(value: boolean) { this.normalOpacity = value ? 1 : 0; }

    /** @en Whether metallic, AO and smoothness contribute in DBuffer mode. @zh DBuffer 模式下是否影响金属度、AO 和光滑度。 */
    get affectMAOS(): boolean { return this.maosOpacity > 0; }
    set affectMAOS(value: boolean) { this.maosOpacity = value ? 1 : 0; }

    private get _weights(): Vector4 { return this.shaderData.getVector(DecalMaterial.CHANNEL_WEIGHTS); }

    private _setWeight(channel: number, value: number): void {
        if (!isFinite(value)) throw new RangeError("DecalMaterial opacity must be finite.");
        // ShaderData owns its vector. Mutating the returned instance first
        // would make WebGPU's equality check skip the uniform-buffer upload.
        // 向量由 ShaderData 持有；先原地修改返回值会使 WebGPU 的相等判断跳过 UBO 上传。
        const weights = this._weights.clone();
        value = Math.max(0, Math.min(1, value));
        if (channel === 0) weights.x = value;
        else if (channel === 1) weights.y = value;
        else weights.z = value;
        this.shaderData.setVector(DecalMaterial.CHANNEL_WEIGHTS, weights);
    }

    /** @en Clones this material. @zh 克隆该材质。 */
    clone(): DecalMaterial {
        const dest = new DecalMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
