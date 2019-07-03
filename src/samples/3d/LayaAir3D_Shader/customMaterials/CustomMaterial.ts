import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { BaseTexture } from "laya/resource/BaseTexture";

/**
 * ...
 * @author ...
 */
export class CustomMaterial extends BaseMaterial {
	static DIFFUSETEXTURE: number = Shader3D.propertyNameToID("u_texture");
	static MARGINALCOLOR: number = Shader3D.propertyNameToID("u_marginalColor");

	/**
	 * 获取漫反射贴图。
	 * @return 漫反射贴图。
	 */
	get diffuseTexture(): BaseTexture {
		return this._shaderValues.getTexture(CustomMaterial.DIFFUSETEXTURE);
	}

	/**
	 * 设置漫反射贴图。
	 * @param value 漫反射贴图。
	 */
	set diffuseTexture(value: BaseTexture) {
		this._shaderValues.setTexture(CustomMaterial.DIFFUSETEXTURE, value);
	}

	/**
	 * 设置边缘光照颜色。
	 * @param value 边缘光照颜色。
	 */
	set marginalColor(value: Vector3) {
		this._shaderValues.setVector3(CustomMaterial.MARGINALCOLOR, value);
	}




	constructor() {
		super();
		this.setShaderName("CustomShader");
	}
}


