/**
description
 自定义材质类，继承材质基类，设置自定义着色器和渲染模式
 */
import { Material, MaterialRenderMode } from "laya/resource/Material";

/**
 * ...
 * @author ...
 */
export class CustomMaterial extends Material {
	constructor() {
		super();
		this.setShaderName("CustomShader");
		this.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
	}
}


