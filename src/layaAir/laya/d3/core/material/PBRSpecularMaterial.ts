import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import PBRPS from "../../shader/files/PBRSpecular.fs";
import PBRVS from "../../shader/files/PBRSpecular.vs";
import PBRShadowCasterPS from "../../shader/files/PBRSpecularShadowCaster.fs";
import PBRShadowCasterVS from "../../shader/files/PBRSpecularShadowCaster.vs";
import DepthNormalsTextureVS from "../../shader/files/DepthNormalsTextureVS.vs";
import DepthNormalsTextureFS from "../../shader/files/DepthNormalsTextureFS.fs";
import { SubShader } from "../../shader/SubShader";
import { PBRMaterial } from "./PBRMaterial";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { Color } from "../../math/Color";

/**
 * 光滑度数据源。
 */
export enum PBRSpecularSmoothnessSource {
	/**金属度贴图的Alpha通道。*/
	SpecularTextureAlpha,
	/**反射率贴图的Alpha通道。*/
	AlbedoTextureAlpha
}

/**
 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
 */
export class PBRSpecularMaterial extends PBRMaterial {
	/** @internal */
	static SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA: ShaderDefine;
	/** @internal */
	static SHADERDEFINE_SPECULARGLOSSTEXTURE: ShaderDefine;
	/** @internal */
	static SPECULARTEXTURE: number;
	/** @internal */
	static SPECULARCOLOR: number;
	/** 默认材质，禁止修改*/
	static defaultMaterial: PBRSpecularMaterial;

	/**
	 * @internal
	 */
	static __init__(): void {
		PBRSpecularMaterial.SHADERDEFINE_SPECULARGLOSSTEXTURE = Shader3D.getDefineByName("SPECULARGLOSSTEXTURE");
		PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = Shader3D.getDefineByName("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
		PBRSpecularMaterial.SPECULARTEXTURE = Shader3D.propertyNameToID("u_SpecGlossTexture");
		PBRSpecularMaterial.SPECULARCOLOR = Shader3D.propertyNameToID("u_SpecularColor");

		var shader: Shader3D = Shader3D.add("PBRSpecular", true, true);
		var subShader: SubShader = new SubShader(null, null);
		shader.addSubShader(subShader);
		subShader.addShaderPass(PBRVS, PBRPS, "Forward");
		subShader.addShaderPass(PBRShadowCasterVS, PBRShadowCasterPS, "ShadowCaster");
		subShader.addShaderPass(DepthNormalsTextureVS, DepthNormalsTextureFS, "DepthNormal");
	}

	/**
	 * 高光贴图。
	 */
	get specularTexture(): BaseTexture {
		return this._shaderValues.getTexture(PBRSpecularMaterial.SPECULARTEXTURE);
	}

	set specularTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARGLOSSTEXTURE);
		else
			this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARGLOSSTEXTURE);
		this._shaderValues.setTexture(PBRSpecularMaterial.SPECULARTEXTURE, value);
	}

	/**
	 * 高光颜色。
	 */
	get specularColor(): Color {
		return this._shaderValues.getColor(PBRSpecularMaterial.SPECULARCOLOR);
	}

	set specularColor(value: Color) {
		this._shaderValues.setColor(PBRSpecularMaterial.SPECULARCOLOR, value);
	}

	/**
	 * 创建一个 <code>PBRSpecularMaterial</code> 实例。
	 */
	constructor() {
		super();
		this.setShaderName("PBRSpecular");
		this._shaderValues.setColor(PBRSpecularMaterial.SPECULARCOLOR, new Color(0.2, 0.2, 0.2, 1.0));
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


