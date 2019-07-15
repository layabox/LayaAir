import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";

/**
 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
 */
export class PBRSpecularMaterial extends BaseMaterial {

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

	static SHADERDEFINE_ALBEDOTEXTURE: number;
	static SHADERDEFINE_NORMALTEXTURE: number;
	static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: number;
	static SHADERDEFINE_SPECULARTEXTURE: number;
	static SHADERDEFINE_OCCLUSIONTEXTURE: number;
	static SHADERDEFINE_PARALLAXTEXTURE: number;
	static SHADERDEFINE_EMISSION: number;
	static SHADERDEFINE_EMISSIONTEXTURE: number;
	static SHADERDEFINE_TILINGOFFSET: number;
	static SHADERDEFINE_ALPHAPREMULTIPLY: number;

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
	static SMOOTHNESSSOURCE: number = -1;//TODO:
	static OCCLUSIONSTRENGTH: number = Shader3D.propertyNameToID("u_occlusionStrength");
	static NORMALSCALE: number = Shader3D.propertyNameToID("u_normalScale");
	static PARALLAXSCALE: number = Shader3D.propertyNameToID("u_parallaxScale");
	static ENABLEEMISSION: number = -1;//TODO:
	static ENABLEREFLECT: number = -1;//TODO:
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");

	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: PBRSpecularMaterial;
	/**@internal */
	static shaderDefines: ShaderDefines = null;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		PBRSpecularMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
		PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("SPECULARTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = PBRSpecularMaterial.shaderDefines.registerDefine("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
		PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("NORMALTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("PARALLAXTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("OCCLUSIONTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_EMISSION = PBRSpecularMaterial.shaderDefines.registerDefine("EMISSION");
		PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("EMISSIONTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET = PBRSpecularMaterial.shaderDefines.registerDefine("TILINGOFFSET");
		PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = PBRSpecularMaterial.shaderDefines.registerDefine("ALPHAPREMULTIPLY");
	}

	private _albedoColor: Vector4;
	private _specularColor: Vector4;
	private _emissionColor: Vector4;

	/**
	 * @internal
	 */
	get _ColorR(): number {
		return this._albedoColor.x;
	}

	/**
	 * @internal
	 */
	set _ColorR(value: number) {
		this._albedoColor.x = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorG(): number {
		return this._albedoColor.y;
	}

	/**
	 * @internal
	 */
	set _ColorG(value: number) {
		this._albedoColor.y = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorB(): number {
		return this._albedoColor.z;
	}

	/**
	 * @internal
	 */
	set _ColorB(value: number) {
		this._albedoColor.z = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorA(): number {
		return this._albedoColor.w;
	}

	/**
	 * @internal
	 */
	set _ColorA(value: number) {
		this._albedoColor.w = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _SpecColorR(): number {
		return this._specularColor.x;
	}

	/**
	 * @internal
	 */
	set _SpecColorR(value: number) {
		this._specularColor.x = value;
		this.specularColor = this._specularColor;
	}

	/**
	 * @internal
	 */
	get _SpecColorG(): number {
		return this._specularColor.y;
	}

	/**
	 * @internal
	 */
	set _SpecColorG(value: number) {
		this._specularColor.y = value;
		this.specularColor = this._specularColor;
	}

	/**
	 * @internal
	 */
	get _SpecColorB(): number {
		return this._specularColor.z;
	}

	/**
	 * @internal
	 */
	set _SpecColorB(value: number) {
		this._specularColor.z = value;
		this.specularColor = this._specularColor;
	}

	/**
	 * @internal
	 */
	get _SpecColorA(): number {
		return this._specularColor.w;
	}

	/**
	 * @internal
	 */
	set _SpecColorA(value: number) {
		this._specularColor.w = value;
		this.specularColor = this._specularColor;
	}

	/**
	 * @internal
	 */
	get _Glossiness(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESS);
	}

	/**
	 * @internal
	 */
	set _Glossiness(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, value);
	}

	/**
	 * @internal
	 */
	get _GlossMapScale(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESSSCALE);
	}

	/**
	 * @internal
	 */
	set _GlossMapScale(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, value);
	}

	/**
	 * @internal
	 */
	get _BumpScale(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.NORMALSCALE);
	}

	/**
	 * @internal
	 */
	set _BumpScale(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, value);
	}

	/**@internal */
	get _Parallax(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.PARALLAXSCALE);
	}

	/**
	 * @internal
	 */
	set _Parallax(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, value);
	}

	/**@internal */
	get _OcclusionStrength(): number {
		return this._shaderValues.getNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH);
	}

	/**
	 * @internal
	 */
	set _OcclusionStrength(value: number) {
		this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, value);
	}

	/**
	 * @internal
	 */
	get _EmissionColorR(): number {
		return this._emissionColor.x;
	}

	/**
	 * @internal
	 */
	set _EmissionColorR(value: number) {
		this._emissionColor.x = value;
		this.emissionColor = this._emissionColor;
	}

	/**
	 * @internal
	 */
	get _EmissionColorG(): number {
		return this._emissionColor.y;
	}

	/**
	 * @internal
	 */
	set _EmissionColorG(value: number) {
		this._emissionColor.y = value;
		this.emissionColor = this._emissionColor;
	}

	/**
	 * @internal
	 */
	get _EmissionColorB(): number {
		return this._emissionColor.z;
	}

	/**
	 * @internal
	 */
	set _EmissionColorB(value: number) {
		this._emissionColor.z = value;
		this.emissionColor = this._emissionColor;
	}

	/**
	 * @internal
	 */
	get _EmissionColorA(): number {
		return this._emissionColor.w;
	}

	/**
	 * @internal
	 */
	set _EmissionColorA(value: number) {
		this._emissionColor.w = value;
		this.emissionColor = this._emissionColor;
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).x;
	}

	/**
	 * @internal
	 */
	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).y;
	}

	/**
	 * @internal
	 */
	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).z;
	}

	/**
	 * @internal
	 */
	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).w;
	}

	/**
	 * @internal
	 */
	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _Cutoff(): number {
		return this.alphaTestValue;
	}

	/**
	 * @internal
	 */
	set _Cutoff(value: number) {
		this.alphaTestValue = value;
	}

	/**
	 * 获取反射率颜色R分量。
	 * @return 反射率颜色R分量。
	 */
	get albedoColorR(): number {
		return this._ColorR;
	}

	/**
	 * 设置反射率颜色R分量。
	 * @param value 反射率颜色R分量。
	 */
	set albedoColorR(value: number) {
		this._ColorR = value;
	}

	/**
	 * 获取反射率颜色G分量。
	 * @return 反射率颜色G分量。
	 */
	get albedoColorG(): number {
		return this._ColorG;
	}

	/**
	 * 设置反射率颜色G分量。
	 * @param value 反射率颜色G分量。
	 */
	set albedoColorG(value: number) {
		this._ColorG = value;
	}

	/**
	 * 获取反射率颜色B分量。
	 * @return 反射率颜色B分量。
	 */
	get albedoColorB(): number {
		return this._ColorB;
	}

	/**
	 * 设置反射率颜色B分量。
	 * @param value 反射率颜色B分量。
	 */
	set albedoColorB(value: number) {
		this._ColorB = value;
	}

	/**
	 * 获取反射率颜色A分量。
	 * @return 反射率颜色A分量。
	 */
	get albedoColorA(): number {
		return this._ColorA;
	}

	/**
	 * 设置反射率颜色A分量。
	 * @param value 反射率颜色A分量。
	 */
	set albedoColorA(value: number) {
		this._ColorA = value;
	}

	/**
	 * 获取反射率颜色。
	 * @return 反射率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	/**
	 * 设置反射率颜色。
	 * @param value 反射率颜色。
	 */
	set albedoColor(value: Vector4) {
		this._albedoColor = value;
		this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, value);
	}

	/**
	 * 获取漫反射贴图。
	 * @return 漫反射贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.ALBEDOTEXTURE);
	}

	/**
	 * 设置漫反射贴图。
	 * @param value 漫反射贴图。
	 */
	set albedoTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.ALBEDOTEXTURE, value);
	}

	/**
	 * 获取法线贴图。
	 * @return 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.NORMALTEXTURE);
	}

	/**
	 * 设置法线贴图。
	 * @param value 法线贴图。
	 */
	set normalTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 获取法线贴图缩放系数。
	 * @return 法线贴图缩放系数。
	 */
	get normalTextureScale(): number {
		return this._BumpScale;
	}

	/**
	 * 设置法线贴图缩放系数。
	 * @param value 法线贴图缩放系数。
	 */
	set normalTextureScale(value: number) {
		this._BumpScale = value;
	}

	/**
	 * 获取视差贴图。
	 * @return 视察贴图。
	 */
	get parallaxTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.PARALLAXTEXTURE);
	}

	/**
	 * 设置视差贴图。
	 * @param value 视察贴图。
	 */
	set parallaxTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.PARALLAXTEXTURE, value);
	}

	/**
	 * 获取视差贴图缩放系数。
	 * @return 视差缩放系数。
	 */
	get parallaxTextureScale(): number {
		return this._Parallax;
	}

	/**
	 * 设置视差贴图缩放系数。
	 * @param value 视差缩放系数。
	 */
	set parallaxTextureScale(value: number) {
		this._Parallax = Math.max(0.005, Math.min(0.08, value));
	}

	/**
	 * 获取遮挡贴图。
	 * @return 遮挡贴图。
	 */
	get occlusionTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE);
	}

	/**
	 * 设置遮挡贴图。
	 * @param value 遮挡贴图。
	 */
	set occlusionTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE, value);
	}

	/**
	 * 获取遮挡贴图强度。
	 * @return 遮挡贴图强度,范围为0到1。
	 */
	get occlusionTextureStrength(): number {
		return this._OcclusionStrength;
	}

	/**
	 * 设置遮挡贴图强度。
	 * @param value 遮挡贴图强度,范围为0到1。
	 */
	set occlusionTextureStrength(value: number) {
		this._OcclusionStrength = Math.max(0.0, Math.min(1.0, value));
	}

	/**
	 * 获取高光贴图。
	 * @return 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.SPECULARTEXTURE);
	}

	/**
	 * 设置高光贴图。
	 * @param value 高光贴图。
	 */
	set specularTexture(value: BaseTexture) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
		}
		this._shaderValues.setTexture(PBRSpecularMaterial.SPECULARTEXTURE, value);
	}

	/**
	 * 获取高光颜色R分量。
	 * @return 高光颜色R分量。
	 */
	get specularColorR(): number {
		return this._SpecColorR;
	}

	/**
	 * 设置高光颜色R分量。
	 * @param value 高光颜色R分量。
	 */
	set specularColorR(value: number) {
		this._SpecColorR = value;
	}

	/**
	 * 获取高光颜色G分量。
	 * @return 高光颜色G分量。
	 */
	get specularColorG(): number {
		return this._SpecColorG;
	}

	/**
	 * 设置高光颜色G分量。
	 * @param value 高光颜色G分量。
	 */
	set specularColorG(value: number) {
		this._SpecColorG = value;
	}

	/**
	 * 获取高光颜色B分量。
	 * @return 高光颜色B分量。
	 */
	get specularColorB(): number {
		return this._SpecColorB;
	}

	/**
	 * 设置高光颜色B分量。
	 * @param value 高光颜色B分量。
	 */
	set specularColorB(value: number) {
		this._SpecColorB = value;
	}

	/**
	 * 获取高光颜色A分量。
	 * @return 高光颜色A分量。
	 */
	get specularColorA(): number {
		return this._SpecColorA;
	}

	/**
	 * 设置高光颜色A分量。
	 * @param value 高光颜色A分量。
	 */
	set specularColorA(value: number) {
		this._SpecColorA = value;
	}

	/**
	 * 获取高光颜色。
	 * @return 高光颜色。
	 */
	get specularColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.SPECULARCOLOR));
	}

	/**
	 * 设置高光颜色。
	 * @param value 高光颜色。
	 */
	set specularColor(value: Vector4) {
		this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, value);
	}

	/**
	 * 获取光滑度。
	 * @return 光滑度,范围为0到1。
	 */
	get smoothness(): number {
		return this._Glossiness;
	}

	/**
	 * 设置光滑度。
	 * @param value 光滑度,范围为0到1。
	 */
	set smoothness(value: number) {
		this._Glossiness = Math.max(0.0, Math.min(1.0, value));
	}

	/**
	 * 获取光滑度缩放系数。
	 * @return 光滑度缩放系数,范围为0到1。
	 */
	get smoothnessTextureScale(): number {
		return this._GlossMapScale;
	}

	/**
	 * 设置光滑度缩放系数。
	 * @param value 光滑度缩放系数,范围为0到1。
	 */
	set smoothnessTextureScale(value: number) {
		this._GlossMapScale = Math.max(0.0, Math.min(1.0, value));
	}

	/**
	 * 获取光滑度数据源
	 * @return 光滑滑度数据源,0或1。
	 */
	get smoothnessSource(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.SMOOTHNESSSOURCE);
	}

	/**
	 * 设置光滑度数据源。
	 * @param value 光滑滑度数据源,0或1。
	 */
	set smoothnessSource(value: number) {
		if (value) {
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
			this._shaderValues.setInt(PBRSpecularMaterial.SMOOTHNESSSOURCE, 1);
		} else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
			this._shaderValues.setInt(PBRSpecularMaterial.SMOOTHNESSSOURCE, 0);
		}
	}

	/**
	 * 获取是否激活放射属性。
	 * @return 是否激活放射属性。
	 */
	get enableEmission(): boolean {
		return this._shaderValues.getBool(PBRSpecularMaterial.ENABLEEMISSION);
	}

	/**
	 * 设置是否激活放射属性。
	 * @param value 是否激活放射属性
	 */
	set enableEmission(value: boolean) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
		else {
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
		}
		this._shaderValues.setBool(PBRSpecularMaterial.ENABLEEMISSION, value);
	}

	/**
	 * 获取放射颜色。
	 * @return 放射颜色。
	 */
	get emissionColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.EMISSIONCOLOR));
	}

	/**
	 * 设置放射颜色。
	 * @param value 放射颜色。
	 */
	set emissionColor(value: Vector4) {
		this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, value);
	}

	/**
	 * 获取放射贴图。
	 * @return 放射贴图。
	 */
	get emissionTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.EMISSIONTEXTURE);
	}

	/**
	 * 设置放射贴图。
	 * @param value 放射贴图。
	 */
	set emissionTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
		else
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
		this._shaderValues.setTexture(PBRSpecularMaterial.EMISSIONTEXTURE, value);
	}

	/**
	 * 获取是否开启反射。
	 * @return 是否开启反射。
	 */
	get enableReflection(): boolean {
		return this._shaderValues.getBool(PBRSpecularMaterial.ENABLEREFLECT);
	}

	/**
	 * 设置是否开启反射。
	 * @param value 是否开启反射。
	 */
	set enableReflection(value: boolean) {
		this._shaderValues.setBool(PBRSpecularMaterial.ENABLEREFLECT, true);
		if (value)
			this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
		else
			this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
	}

	/**
	 * 获取纹理平铺和偏移X分量。
	 * @return 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	/**
	 * 获取纹理平铺和偏移X分量。
	 * @param x 纹理平铺和偏移X分量。
	 */
	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * 获取纹理平铺和偏移Y分量。
	 * @return 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	/**
	 * 获取纹理平铺和偏移Y分量。
	 * @param y 纹理平铺和偏移Y分量。
	 */
	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * 获取纹理平铺和偏移Z分量。
	 * @return 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	/**
	 * 获取纹理平铺和偏移Z分量。
	 * @param z 纹理平铺和偏移Z分量。
	 */
	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * 获取纹理平铺和偏移W分量。
	 * @return 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	/**
	 * 获取纹理平铺和偏移W分量。
	 * @param w 纹理平铺和偏移W分量。
	 */
	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * 获取纹理平铺和偏移。
	 * @return 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET));
	}

	/**
	 * 获取纹理平铺和偏移。
	 * @param value 纹理平铺和偏移。
	 */
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
	 * @return 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case PBRSpecularMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRSpecularMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
				break;
			case PBRSpecularMaterial.RENDERMODE_FADE:
				this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
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
				this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
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
	 * 设置是否写入深度。
	 * @param value 是否写入深度。
	 */
	set depthWrite(value: boolean) {
		this._shaderValues.setBool(PBRSpecularMaterial.DEPTH_WRITE, value);
	}

	/**
	 * 获取是否写入深度。
	 * @return 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(PBRSpecularMaterial.DEPTH_WRITE);
	}

	/**
	 * 设置剔除方式。
	 * @param value 剔除方式。
	 */
	set cull(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.CULL, value);
	}

	/**
	 * 获取剔除方式。
	 * @return 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.CULL);
	}

	/**
	 * 设置混合方式。
	 * @param value 混合方式。
	 */
	set blend(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.BLEND, value);
	}

	/**
	 * 获取混合方式。
	 * @return 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.BLEND);
	}

	/**
	 * 设置混合源。
	 * @param value 混合源
	 */
	set blendSrc(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.BLEND_SRC, value);
	}

	/**
	 * 获取混合源。
	 * @return 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_SRC);
	}

	/**
	 * 设置混合目标。
	 * @param value 混合目标
	 */
	set blendDst(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.BLEND_DST, value);
	}

	/**
	 * 获取混合目标。
	 * @return 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_DST);
	}

	/**
	 * 设置深度测试方式。
	 * @param value 深度测试方式
	 */
	set depthTest(value: number) {
		this._shaderValues.setInt(PBRSpecularMaterial.DEPTH_TEST, value);
	}

	/**
	 * 获取深度测试方式。
	 * @return 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(PBRSpecularMaterial.DEPTH_TEST);
	}

	/**
	 * 创建一个 <code>PBRSpecularMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("PBRSpecular");
		this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
		this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._emissionColor = new Vector4(0.0, 0.0, 0.0, 0.0);
		this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
		this._specularColor = new Vector4(0.2, 0.2, 0.2, 0.2);
		this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, new Vector4(0.2, 0.2, 0.2, 0.2));
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, 0.5);
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, 1.0);
		this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSOURCE, 0);
		this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, 1.0);
		this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, 1.0);
		this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, 0.001);
		this._shaderValues.setBool(PBRSpecularMaterial.ENABLEEMISSION, false);
		this._shaderValues.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
		this.renderMode = PBRSpecularMaterial.RENDERMODE_OPAQUE;
	}

	/**
 * 克隆。
 * @return	 克隆副本。
 */
	clone(): any {
		var dest: PBRSpecularMaterial = new PBRSpecularMaterial();
		this.cloneTo(dest);
		return dest;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: PBRSpecularMaterial = (<PBRSpecularMaterial>destObject);
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		this._specularColor.cloneTo(destMaterial._specularColor);
		this._emissionColor.cloneTo(destMaterial._emissionColor);
	}
}


