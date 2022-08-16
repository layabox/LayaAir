import { Material, MaterialRenderMode } from "laya/d3/core/material/Material";

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


