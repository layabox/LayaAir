import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefine } from "../../shader/ShaderDefine";
import { Material } from "./Material";
import { SmoothnessSource } from "./PBRStandardMaterial";
import { RenderState } from "./RenderState";

/**
 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
 */
export class PBRSpecularMaterial extends Material {

	/**光滑度数据源_高光贴图的Alpha通道。*/
	static SmoothnessSource_SpecularTexture_Alpha: number = 0;
	/**光滑度数据源_反射率贴图的Alpha通道。*/
	static SmoothnessSource_AlbedoTexture_Alpha: number = 1;

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_透明测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态_透明混合_游戏中经常使用的透明。*/
	static RENDERMODE_FADE: number = 2;
	/**渲染状态_透明混合_物理上看似合理的透明。*/
	static RENDERMODE_TRANSPARENT: number = 3;

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	static SHADERDEFINE_NORMALTEXTURE: ShaderDefine;
	static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: ShaderDefine;
	static SHADERDEFINE_SPECULARTEXTURE: ShaderDefine;
	static SHADERDEFINE_OCCLUSIONTEXTURE: ShaderDefine;
	static SHADERDEFINE_PARALLAXTEXTURE: ShaderDefine;
	static SHADERDEFINE_EMISSION: ShaderDefine;
	static SHADERDEFINE_EMISSIONTEXTURE: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ALPHAPREMULTIPLY: ShaderDefine;
	static SHADERDEFINE_REFLECTIONS_OFF: ShaderDefine;

	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static SPECULARTEXTURE: number = Shader3D.propertyNameToID("u_SpecularTexture");
	static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
	static PARALLAXTEXTURE: number = Shader3D.propertyNameToID("u_ParallaxTexture");
	static OCCLUSIONTEXTURE: number = Shader3D.propertyNameToID("u_OcclusionTexture");
	static EMISSIONTEXTURE: number = Shader3D.propertyNameToID("u_EmissionTexture");

	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static SPECULARCOLOR: number = Shader3D.propertyNameToID("u_SpecularColor");
	static EMISSIONCOLOR: number = Shader3D.propertyNameToID("u_EmissionColor");

	static SMOOTHNESS: number = Shader3D.propertyNameToID("u_smoothness");
	static SMOOTHNESSSCALE: number = Shader3D.propertyNameToID("u_smoothnessScale");
	static OCCLUSIONSTRENGTH: number = Shader3D.propertyNameToID("u_occlusionStrength");
	static NORMALSCALE: number = Shader3D.propertyNameToID("u_normalScale");
	static PARALLAXSCALE: number = Shader3D.propertyNameToID("u_parallaxScale");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");

	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: PBRSpecularMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE = Shader3D.getDefineByName("SPECULARTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = Shader3D.getDefineByName("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
		PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE = Shader3D.getDefineByName("NORMALTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE = Shader3D.getDefineByName("PARALLAXTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = Shader3D.getDefineByName("OCCLUSIONTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_EMISSION = Shader3D.getDefineByName("EMISSION");
		PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE = Shader3D.getDefineByName("EMISSIONTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = Shader3D.getDefineByName("ALPHAPREMULTIPLY");
		PBRSpecularMaterial.SHADERDEFINE_REFLECTIONS_OFF = Shader3D.getDefineByName("REFLECTIONS_OFF");
	}

	/** @internal */
	private _smoothnessSource: number = 0;
	/** @internal */
	private _enableEmission: boolean = false;
	/** @internal */
	private _enableReflection: boolean = true;

	/**
	 * 漫反射颜色。
	 */
	get albedoColor(): Vector4 {
		return <Vector4>this._shaderValues.getVector(PBRSpecularMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Vector4) {
		this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, value);
	}

	/**
	 * 漫反射贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 法线贴图缩放系数。
	 */
	get normalTextureScale(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.NORMALSCALE);
	}

	set normalTextureScale(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, value);
	}

	/**
	 * 视差贴图。
	 */
	get parallaxTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.PARALLAXTEXTURE);
	}

	set parallaxTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.PARALLAXTEXTURE, value);
	}

	/**
	 * 视差贴图缩放系数。
	 */
	get parallaxTextureScale(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.PARALLAXSCALE);
	}

	set parallaxTextureScale(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, Math.max(0.005, Math.min(0.08, value)));
	}

	/**
	 * 遮挡贴图。
	 */
	get occlusionTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE);
	}

	set occlusionTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE, value);
	}

	/**
	 * 遮挡贴图强度,范围为0到1。
	 */
	get occlusionTextureStrength(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH);
	}

	set occlusionTextureStrength(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.SPECULARTEXTURE);
	}

	set specularTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
		else
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
		this._shaderValues.setTexture(PBRSpecularMaterial.SPECULARTEXTURE, value);
	}

	/**
	 * 高光颜色。
	 */
	get specularColor(): Vector4 {
		return <Vector4>this._shaderValues.getVector(PBRSpecularMaterial.SPECULARCOLOR);
	}

	set specularColor(value: Vector4) {
		this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, value);
	}

	/**
	 * 光滑度,范围为0到1。
	 */
	get smoothness(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESS);
	}

	set smoothness(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 光滑度缩放系数,范围为0到1。
	 */
	get smoothnessTextureScale(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESSSCALE);
	}

	set smoothnessTextureScale(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 光滑度数据源,0或1
	 */
	get smoothnessSource(): SmoothnessSource {
		return this._smoothnessSource;
	}

	set smoothnessSource(value: SmoothnessSource) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
		else
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
		this._smoothnessSource = value;
	}

	/**
	 * 是否开启自发光。
	 */
	get enableEmission(): boolean {
		return this._enableEmission;
	}

	set enableEmission(value: boolean) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
		else
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
		this._enableEmission = value;
	}

	/**
	 * 放射颜色。
	 */
	get emissionColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.EMISSIONCOLOR));
	}

	set emissionColor(value: Vector4) {
		this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, value);
	}

	/**
	 * 获取放射贴图。
	 */
	get emissionTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.EMISSIONTEXTURE);
	}

	set emissionTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
		else
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
		this._shaderValues.setTexture(PBRSpecularMaterial.EMISSIONTEXTURE, value);
	}

	/**
	 * 是否开启反射。
	 */
	get enableReflection(): boolean {
		return this._enableReflection;
	}

	set enableReflection(value: boolean) {
		this._enableReflection = value;
		if (value)
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_REFLECTIONS_OFF);
		else
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_REFLECTIONS_OFF);
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
				this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
			else
				this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
		}
		this._shaderValues.setVector(PBRSpecularMaterial.TILINGOFFSET, value);
	}

	/**
	 * 设置渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case PBRSpecularMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRSpecularMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRSpecularMaterial.RENDERMODE_FADE:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRSpecularMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_ONE;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			default:
				throw new Error("PBRSpecularMaterial : renderMode value error.");
		}
	}

	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(PBRSpecularMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(PBRSpecularMaterial.DEPTH_WRITE, value);
	}


	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.CULL, value);
	}


	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.BLEND, value);
	}

	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.BLEND_SRC, value);
	}

	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.BLEND_DST, value);
	}

	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.DEPTH_TEST, value);
	}

	/**
	 * 创建一个 <code>PBRSpecularMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("PBRSpecular");
		this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
		this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, new Vector4(0.2, 0.2, 0.2, 0.2));
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, 0.5);
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, 1.0);
		this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, 1.0);
		this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, 1.0);
		this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, 0.001);
		this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);
		this.renderMode = PBRSpecularMaterial.RENDERMODE_OPAQUE;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: PBRSpecularMaterial = new PBRSpecularMaterial();
		this.cloneTo(dest);
		return dest;
	}
}


