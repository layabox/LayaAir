import { BaseTexture } from "../../../resource/BaseTexture";
import PBRPS from "../../shader/files/PBR.fs";
import PBRVS from "../../shader/files/PBR.vs";
import PBRShadowCasterPS from "../../shader/files/PBRShadowCaster.fs";
import PBRShadowCasterVS from "../../shader/files/PBRShadowCaster.vs";
import DepthNormalsTextureVS from "../../shader/files/DepthNormalsTextureVS.vs";
import DepthNormalsTextureFS from "../../shader/files/DepthNormalsTextureFS.fs";
import { SubShader } from "../../shader/SubShader";
import { PBRMaterial } from "./PBRMaterial";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";

/**
 * 金属度PBR材质光滑度数据源。
 */
export enum PBRMetallicSmoothnessSource {
	/**金属度贴图的Alpha通道。*/
	MetallicGlossTextureAlpha,
	/**反射率贴图的Alpha通道。*/
	AlbedoTextureAlpha
}

/**
 * <code>PBRStandardMaterial</code> 类用于实现PBR材质。
 */
export class PBRStandardMaterial extends PBRMaterial {
	/** @internal */
	static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_METALLICGLOSSTEXTURE: ShaderDefine;
	/** @internal */
	static METALLICGLOSSTEXTURE: number;
	/** @internal */
	static METALLIC: number;
	/** 默认材质，禁止修改*/
	static defaultMaterial: PBRStandardMaterial;

	/**
	 * @internal
	 */
	static __init__(): void {
		PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE = Shader3D.getDefineByName("METALLICGLOSSTEXTURE");
		PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = Shader3D.getDefineByName("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
		PBRStandardMaterial.METALLICGLOSSTEXTURE = Shader3D.propertyNameToID("u_MetallicGlossTexture");
		PBRStandardMaterial.METALLIC = Shader3D.propertyNameToID("u_Metallic");
		// var shader: Shader3D = Shader3D.add("PBR", true, true);
		// var subShader: SubShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(PBRVS, PBRPS, "Forward");
		// subShader.addShaderPass(PBRShadowCasterVS, PBRShadowCasterPS, "ShadowCaster");
		// subShader.addShaderPass(DepthNormalsTextureVS, DepthNormalsTextureFS, "DepthNormal");
	}

	/** @internal */
	private _smoothnessSource: PBRMetallicSmoothnessSource = 0;

	/**
	 * 金属光滑度贴图。
	 */
	get metallicGlossTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE);
	}

	set metallicGlossTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
		else
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);

		this._shaderValues.setTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE, value);
	}

	/**
	 * 获取金属度,范围为0到1。
	 */
	get metallic(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.METALLIC);
	}

	set metallic(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * 光滑度数据源,0或1。
	 */
	get smoothnessSource(): PBRMetallicSmoothnessSource {
		return this._smoothnessSource;
	}

	set smoothnessSource(value: PBRMetallicSmoothnessSource) {
		if (value)
			this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
		else
			this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
		this._smoothnessSource = value;
	}

	/**
	 * 创建一个 <code>PBRStandardMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("PBR");
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: PBRStandardMaterial = new PBRStandardMaterial();
		this.cloneTo(dest);
		return dest;
	}
}


