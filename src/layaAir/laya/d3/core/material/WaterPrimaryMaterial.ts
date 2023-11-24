import { Vector4 } from "../../../maths/Vector4";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Material } from "../../../resource/Material";

/**
 * <code>WaterPrimaryMaterial</code> 类用于实现水材质。
 */
export class WaterPrimaryMaterial extends Material {

	static HORIZONCOLOR: number;
	static MAINTEXTURE: number;
	static NORMALTEXTURE: number;
	static WAVESCALE: number;
	static WAVESPEED: number;

	static SHADERDEFINE_MAINTEXTURE: ShaderDefine;
	static SHADERDEFINE_NORMALTEXTURE: ShaderDefine;

	/** 默认材质，禁止修改*/
	static defaultMaterial: WaterPrimaryMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE = Shader3D.getDefineByName("MAINTEXTURE");
		WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE = Shader3D.getDefineByName("NORMALTEXTURE");
		WaterPrimaryMaterial.HORIZONCOLOR = Shader3D.propertyNameToID("u_HorizonColor");
		WaterPrimaryMaterial.MAINTEXTURE = Shader3D.propertyNameToID("u_MainTexture");
		WaterPrimaryMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
		WaterPrimaryMaterial.WAVESCALE = Shader3D.propertyNameToID("u_WaveScale");
		WaterPrimaryMaterial.WAVESPEED = Shader3D.propertyNameToID("u_WaveSpeed");
	}

	/**
	 * 地平线颜色。
	 */
	get horizonColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(WaterPrimaryMaterial.HORIZONCOLOR));
	}

	set horizonColor(value: Vector4) {
		this._shaderValues.setVector(WaterPrimaryMaterial.HORIZONCOLOR, value);
	}

	/**
	 * 主贴图。
	 */
	get mainTexture(): BaseTexture {
		return this._shaderValues.getTexture(WaterPrimaryMaterial.MAINTEXTURE);
	}

	set mainTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(WaterPrimaryMaterial.MAINTEXTURE, value);
	}

	/**
	 * 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(WaterPrimaryMaterial.NORMALTEXTURE);
	}

	set normalTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE);
		else
			this._shaderValues.removeDefine(WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE);
		this._shaderValues.setTexture(WaterPrimaryMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 波动缩放系数。
	 */
	get waveScale(): number {
		return this._shaderValues.getNumber(WaterPrimaryMaterial.WAVESCALE);
	}

	set waveScale(value: number) {
		this._shaderValues.setNumber(WaterPrimaryMaterial.WAVESCALE, value);
	}

	/**
	 * 波动速率。
	 */
	get waveSpeed(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(WaterPrimaryMaterial.WAVESPEED));
	}

	set waveSpeed(value: Vector4) {
		this._shaderValues.setVector(WaterPrimaryMaterial.WAVESPEED, value);
	}


	constructor() {
		super();
		this.setShaderName("WaterPrimary");
		this._shaderValues.setVector(WaterPrimaryMaterial.HORIZONCOLOR, new Vector4(0.172, 0.463, 0.435, 0));
		this._shaderValues.setNumber(WaterPrimaryMaterial.WAVESCALE, 0.15);
		this._shaderValues.setVector(WaterPrimaryMaterial.WAVESPEED, new Vector4(19, 9, -16, -7));
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: WaterPrimaryMaterial = new WaterPrimaryMaterial();
		this.cloneTo(dest);
		return dest;
	}
}


