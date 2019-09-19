import { BaseTexture } from "../../../resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { Material } from "./Material";
import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * <code>WaterPrimaryMaterial</code> 类用于实现水材质。
 */
export class WaterPrimaryMaterial extends Material {

	static HORIZONCOLOR: number = Shader3D.propertyNameToID("u_HorizonColor");
	static MAINTEXTURE: number = Shader3D.propertyNameToID("u_MainTexture");
	static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
	static WAVESCALE: number = Shader3D.propertyNameToID("u_WaveScale");
	static WAVESPEED: number = Shader3D.propertyNameToID("u_WaveSpeed");

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
	}

	/**
	 * 获取地平线颜色。
	 * @return 地平线颜色。
	 */
	get horizonColor(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(WaterPrimaryMaterial.HORIZONCOLOR));
	}

	/**
	 * 设置地平线颜色。
	 * @param value 地平线颜色。
	 */
	set horizonColor(value: Vector4) {
		this._shaderValues.setVector(WaterPrimaryMaterial.HORIZONCOLOR, value);
	}

	/**
	 * 获取主贴图。
	 * @return 主贴图。
	 */
	get mainTexture(): BaseTexture {
		return this._shaderValues.getTexture(WaterPrimaryMaterial.MAINTEXTURE);
	}

	/**
	 * 设置主贴图。
	 * @param value 主贴图。
	 */
	set mainTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE);
		else
			this._shaderValues.removeDefine(WaterPrimaryMaterial.SHADERDEFINE_MAINTEXTURE);
		this._shaderValues.setTexture(WaterPrimaryMaterial.MAINTEXTURE, value);
	}

	/**
	 * 获取法线贴图。
	 * @return 法线贴图。
	 */
	get normalTexture(): BaseTexture {
		return this._shaderValues.getTexture(WaterPrimaryMaterial.NORMALTEXTURE);
	}

	/**
	 * 设置法线贴图。
	 * @param value 法线贴图。
	 */
	set normalTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE);
		else
			this._shaderValues.removeDefine(WaterPrimaryMaterial.SHADERDEFINE_NORMALTEXTURE);
		this._shaderValues.setTexture(WaterPrimaryMaterial.NORMALTEXTURE, value);
	}

	/**
	 * 获取波动缩放系数。
	 * @return 波动缩放系数。
	 */
	get waveScale(): number {
		return this._shaderValues.getNumber(WaterPrimaryMaterial.WAVESCALE);
	}

	/**
	 * 设置波动缩放系数。
	 * @param value 波动缩放系数。
	 */
	set waveScale(value: number) {
		this._shaderValues.setNumber(WaterPrimaryMaterial.WAVESCALE, value);
	}

	/**
	 * 获取波动速率。
	 * @return 波动速率。
	 */
	get waveSpeed(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(WaterPrimaryMaterial.WAVESPEED));
	}

	/**
	 * 设置波动速率。
	 * @param value 波动速率。
	 */
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


