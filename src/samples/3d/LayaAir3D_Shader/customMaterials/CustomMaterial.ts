import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { BaseTexture } from "laya/resource/BaseTexture";

/**
 * ...
 * @author ...
 */
export class CustomMaterial extends BaseMaterial {
	constructor() {
		super();
		this.setShaderName("CustomShader");
	}
}


