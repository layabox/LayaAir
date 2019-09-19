import { Material } from "laya/d3/core/material/Material";

/**
 * ...
 * @author ...
 */
export class CustomMaterial extends Material {
	constructor() {
		super();
		this.setShaderName("CustomShader");
	}
}


