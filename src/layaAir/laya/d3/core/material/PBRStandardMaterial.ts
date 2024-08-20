import { BaseTexture } from "../../../resource/BaseTexture";
import { PBRMaterial } from "./PBRMaterial";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";

/**
 * @en Metallic PBR material smoothness data source.
 * @zh 金属度PBR材质光滑度数据源。
 */
export enum PBRMetallicSmoothnessSource {
	/**
	 * @en Alpha channel for metallicity mapping.
	 * @zh 金属度贴图的Alpha通道。
	 */
	MetallicGlossTextureAlpha,
	/**
	 * @en Alpha channel of albedo texture.
	 * @zh 漫反射贴图的Alpha通道。
	 */
	AlbedoTextureAlpha
}

/**
 * @en The PBRStandardMaterial class is used to implement PBR materials.
 * @zh PBRStandardMaterial 类用于实现PBR材质。
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
	/** 
	 * @en Default material, no modification allowed
	 * @zh 默认材质，禁止修改
	 */
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
	 * @en Metallic gloss texture.
	 * @zh 金属光滑度贴图。
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
	 * @en The metallic value, ranging from 0 to 1.
	 * @zh 金属度，范围为0到1。
	 */
	get metallic(): number {
		return this._shaderValues.getNumber(PBRStandardMaterial.METALLIC);
	}

	set metallic(value: number) {
		this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, Math.max(0.0, Math.min(1.0, value)));
	}

	/**
	 * @en The smoothness data source, 0 or 1.
	 * @zh 光滑度数据源，0或1。
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
	 * @ignore
	 * @en Creates an instance of PBRStandardMaterial.
	 * @zh 创建一个 PBRStandardMaterial 的实例。
	 */
	constructor() {
		super();
		this.setShaderName("PBR");
	}

	/**
	 * @override
	 * @en Clone.
	 * @returns Clone copy.
	 * @zh 克隆。
	 * @returns 克隆副本。
	 */
	clone(): any {
		var dest: PBRStandardMaterial = new PBRStandardMaterial();
		this.cloneTo(dest);
		return dest;
	}
}
