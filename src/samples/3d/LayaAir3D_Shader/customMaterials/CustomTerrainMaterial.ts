import { Material } from "laya/d3/core/material/Material";
import { Vector2 } from "laya/d3/math/Vector2";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { BaseTexture } from "laya/resource/BaseTexture";
import { ShaderDefine } from "../../../../../bin/tsc/layaAir/laya/d3/shader/ShaderDefine";

/**
 * ...
 * @author
 */
export class CustomTerrainMaterial extends Material {
	static SPLATALPHATEXTURE: number = Shader3D.propertyNameToID("u_SplatAlphaTexture");
	static DIFFUSETEXTURE1: number = Shader3D.propertyNameToID("u_DiffuseTexture1");
	static DIFFUSETEXTURE2: number = Shader3D.propertyNameToID("u_DiffuseTexture2");
	static DIFFUSETEXTURE3: number = Shader3D.propertyNameToID("u_DiffuseTexture3");
	static DIFFUSETEXTURE4: number = Shader3D.propertyNameToID("u_DiffuseTexture4");
	static DIFFUSETEXTURE5: number = Shader3D.propertyNameToID("u_DiffuseTexture5");
	static DIFFUSESCALE1: number = Shader3D.propertyNameToID("u_DiffuseScale1");
	static DIFFUSESCALE2: number = Shader3D.propertyNameToID("u_DiffuseScale2");
	static DIFFUSESCALE3: number = Shader3D.propertyNameToID("u_DiffuseScale3");
	static DIFFUSESCALE4: number = Shader3D.propertyNameToID("u_DiffuseScale4");
	static DIFFUSESCALE5: number = Shader3D.propertyNameToID("u_DiffuseScale5");

	/**自定义地形材质细节宏定义。*/
	static SHADERDEFINE_DETAIL_NUM1: ShaderDefine;
	static SHADERDEFINE_DETAIL_NUM2: ShaderDefine;
	static SHADERDEFINE_DETAIL_NUM3: ShaderDefine;
	static SHADERDEFINE_DETAIL_NUM4: ShaderDefine;
	static SHADERDEFINE_DETAIL_NUM5: ShaderDefine;

	/**
	 * @private
	 */
	static __init__(): void {
		CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM1");
		CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM2");
		CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM3");
		CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM4");
		CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5 = Shader3D.getDefineByName("CUSTOM_DETAIL_NUM5");
	}

	/**
	 * 获取splatAlpha贴图。
	 * @return splatAlpha贴图。
	 */
	get splatAlphaTexture(): BaseTexture {
		return this._shaderValues.getTexture(CustomTerrainMaterial.SPLATALPHATEXTURE);
	}

	/**
	 * 设置splatAlpha贴图。
	 * @param value splatAlpha贴图。
	 */
	set splatAlphaTexture(value: BaseTexture) {
		this._shaderValues.setTexture(CustomTerrainMaterial.SPLATALPHATEXTURE, value);
	}

	/**
	 * 获取第一层贴图。
	 * @return 第一层贴图。
	 */
	get diffuseTexture1(): BaseTexture {
		return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE1);
	}

	/**
	 * 设置第一层贴图。
	 * @param value 第一层贴图。
	 */
	set diffuseTexture1(value: BaseTexture) {
		this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE1, value);
		this._setDetailNum(1);
	}

	/**
	 * 获取第二层贴图。
	 * @return 第二层贴图。
	 */
	get diffuseTexture2(): BaseTexture {
		return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE2);
	}

	/**
	 * 设置第二层贴图。
	 * @param value 第二层贴图。
	 */
	set diffuseTexture2(value: BaseTexture) {
		this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE2, value);
		this._setDetailNum(2);
	}

	/**
	 * 获取第三层贴图。
	 * @return 第三层贴图。
	 */
	get diffuseTexture3(): BaseTexture {
		return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE3);
	}

	/**
	 * 设置第三层贴图。
	 * @param value 第三层贴图。
	 */
	set diffuseTexture3(value: BaseTexture) {
		this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE3, value);
		this._setDetailNum(3);
	}

	/**
	 * 获取第四层贴图。
	 * @return 第四层贴图。
	 */
	get diffuseTexture4(): BaseTexture {
		return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE4);
	}

	/**
	 * 设置第四层贴图。
	 * @param value 第四层贴图。
	 */
	set diffuseTexture4(value: BaseTexture) {
		this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE4, value);
		this._setDetailNum(4);
	}

	/**
	 * 获取第五层贴图。
	 * @return 第五层贴图。
	 */
	get diffuseTexture5(): BaseTexture {
		return this._shaderValues.getTexture(CustomTerrainMaterial.DIFFUSETEXTURE5);
	}

	/**
	 * 设置第五层贴图。
	 * @param value 第五层贴图。
	 */
	set diffuseTexture5(value: BaseTexture) {
		this._shaderValues.setTexture(CustomTerrainMaterial.DIFFUSETEXTURE5, value);
		this._setDetailNum(5);
	}

	setDiffuseScale1(scale1: Vector2): void {
		this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE1, scale1);
	}

	setDiffuseScale2(scale2: Vector2): void {
		this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE2, scale2);
	}

	setDiffuseScale3(scale3: Vector2): void {
		this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE3, scale3);
	}

	setDiffuseScale4(scale4: Vector2): void {
		this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE4, scale4);
	}

	setDiffuseScale5(scale5: Vector2): void {
		this._shaderValues.setVector2(CustomTerrainMaterial.DIFFUSESCALE5, scale5);
	}

	private _setDetailNum(value: number): void {
		switch (value) {
			case 1:
				this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 2:
				this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 3:
				this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 4:
				this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 5:
				this._shaderValues.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this._shaderValues.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				break;
		}
	}

	constructor() {
		super();
		this.setShaderName("CustomTerrainShader");
	}

}


