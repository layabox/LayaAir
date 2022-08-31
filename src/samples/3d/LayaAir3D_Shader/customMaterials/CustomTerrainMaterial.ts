import { Material } from "laya/d3/core/material/Material";
import { Vector2 } from "laya/d3/math/Vector2";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "laya/RenderEngine/RenderShader/ShaderDefine";
import { BaseTexture } from "laya/resource/BaseTexture";

/**
 * ...
 * @author
 */
export class CustomTerrainMaterial extends Material {
	static SPLATALPHATEXTURE: number;
	static DIFFUSETEXTURE1: number;
	static DIFFUSETEXTURE2: number;
	static DIFFUSETEXTURE3: number;
	static DIFFUSETEXTURE4: number;
	static DIFFUSETEXTURE5: number;
	static DIFFUSESCALE1: number;
	static DIFFUSESCALE2: number;
	static DIFFUSESCALE3: number;
	static DIFFUSESCALE4: number;
	static DIFFUSESCALE5: number;

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
		CustomTerrainMaterial.SPLATALPHATEXTURE = Shader3D.propertyNameToID("u_SplatAlphaTexture");
		CustomTerrainMaterial.DIFFUSETEXTURE1 = Shader3D.propertyNameToID("u_DiffuseTexture1");
		CustomTerrainMaterial.DIFFUSETEXTURE2 = Shader3D.propertyNameToID("u_DiffuseTexture2");
		CustomTerrainMaterial.DIFFUSETEXTURE3 = Shader3D.propertyNameToID("u_DiffuseTexture3");
		CustomTerrainMaterial.DIFFUSETEXTURE4 = Shader3D.propertyNameToID("u_DiffuseTexture4");
		CustomTerrainMaterial.DIFFUSETEXTURE5 = Shader3D.propertyNameToID("u_DiffuseTexture5");
		CustomTerrainMaterial.DIFFUSESCALE1 = Shader3D.propertyNameToID("u_DiffuseScale1");
		CustomTerrainMaterial.DIFFUSESCALE2 = Shader3D.propertyNameToID("u_DiffuseScale2");
		CustomTerrainMaterial.DIFFUSESCALE3 = Shader3D.propertyNameToID("u_DiffuseScale3");
		CustomTerrainMaterial.DIFFUSESCALE4 = Shader3D.propertyNameToID("u_DiffuseScale4");
		CustomTerrainMaterial.DIFFUSESCALE5 = Shader3D.propertyNameToID("u_DiffuseScale5");
	}

	/**
	 * 获取splatAlpha贴图。
	 * @return splatAlpha贴图。
	 */
	get splatAlphaTexture(): BaseTexture {
		return this.getTextureByIndex(CustomTerrainMaterial.SPLATALPHATEXTURE);
	}

	/**
	 * 设置splatAlpha贴图。
	 * @param value splatAlpha贴图。
	 */
	set splatAlphaTexture(value: BaseTexture) {
		this.setTextureByIndex(CustomTerrainMaterial.SPLATALPHATEXTURE, value);
	}

	/**
	 * 获取第一层贴图。
	 * @return 第一层贴图。
	 */
	get diffuseTexture1(): BaseTexture {
		return this.getTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE1);
	}

	/**
	 * 设置第一层贴图。
	 * @param value 第一层贴图。
	 */
	set diffuseTexture1(value: BaseTexture) {
		this.setTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE1, value);
		this._setDetailNum(1);
	}

	/**
	 * 获取第二层贴图。
	 * @return 第二层贴图。
	 */
	get diffuseTexture2(): BaseTexture {
		return this.getTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE2);
	}

	/**
	 * 设置第二层贴图。
	 * @param value 第二层贴图。
	 */
	set diffuseTexture2(value: BaseTexture) {
		this.setTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE2, value);
		this._setDetailNum(2);
	}

	/**
	 * 获取第三层贴图。
	 * @return 第三层贴图。
	 */
	get diffuseTexture3(): BaseTexture {
		return this.getTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE3);
	}

	/**
	 * 设置第三层贴图。
	 * @param value 第三层贴图。
	 */
	set diffuseTexture3(value: BaseTexture) {
		this.setTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE3, value);
		this._setDetailNum(3);
	}

	/**
	 * 获取第四层贴图。
	 * @return 第四层贴图。
	 */
	get diffuseTexture4(): BaseTexture {
		return this.getTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE4);
	}

	/**
	 * 设置第四层贴图。
	 * @param value 第四层贴图。
	 */
	set diffuseTexture4(value: BaseTexture) {
		this.setTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE4, value);
		this._setDetailNum(4);
	}

	/**
	 * 获取第五层贴图。
	 * @return 第五层贴图。
	 */
	get diffuseTexture5(): BaseTexture {
		return this.getTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE5);
	}

	/**
	 * 设置第五层贴图。
	 * @param value 第五层贴图。
	 */
	set diffuseTexture5(value: BaseTexture) {
		this.setTextureByIndex(CustomTerrainMaterial.DIFFUSETEXTURE5, value);
		this._setDetailNum(5);
	}

	setDiffuseScale1(scale1: Vector2): void {
		this.setVector2ByIndex(CustomTerrainMaterial.DIFFUSESCALE1, scale1);
	}

	setDiffuseScale2(scale2: Vector2): void {
		this.setVector2ByIndex(CustomTerrainMaterial.DIFFUSESCALE2, scale2);
	}

	setDiffuseScale3(scale3: Vector2): void {
		this.setVector2ByIndex(CustomTerrainMaterial.DIFFUSESCALE3, scale3);
	}

	setDiffuseScale4(scale4: Vector2): void {
		this.setVector2ByIndex(CustomTerrainMaterial.DIFFUSESCALE4, scale4);
	}

	setDiffuseScale5(scale5: Vector2): void {
		this.setVector2ByIndex(CustomTerrainMaterial.DIFFUSESCALE5, scale5);
	}

	private _setDetailNum(value: number): void {
		switch (value) {
			case 1:
				this.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 2:
				this.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 3:
				this.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 4:
				this.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				break;
			case 5:
				this.addDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
				this.removeDefine(CustomTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
				break;
		}
	}

	constructor() {
		super();
		this.setShaderName("CustomTerrainShader");
	}

}


