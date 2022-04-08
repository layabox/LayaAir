import { Material } from "laya/d3/core/material/Material";
import { RenderState } from "laya/d3/core/material/RenderState";
import { Vector4 } from "laya/d3/math/Vector4";
import { SubShader } from "laya/d3/shader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import BOLLBOARDVS from "../EditorShader/BillboardVS.vs";
import BOLLBOARDFS from "../EditorShader/BillboardFS.fs"
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDefine } from "laya/RenderEngine/RenderShader/ShaderDefine";

export class BillboardMaterial extends Material {
	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 3;

	static ALBEDOTEXTURE: number;
	static ALBEDOCOLOR: number;
	static TILINGOFFSET: number;


	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	/**
	 * 初始化Mateiral
	 */
	static init(): void {
		BillboardMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
		BillboardMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
		BillboardMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
		BillboardMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		BillboardMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
		let shader = Shader3D.add("BILLBOARDMAT", false, false);
		let subShader = new SubShader();
		shader.addSubShader(subShader);
		subShader.addShaderPass(BOLLBOARDVS, BOLLBOARDFS);
	}


	get albedoColor(): Vector4 {
		return this._shaderValues.getVector(BillboardMaterial.ALBEDOCOLOR);
	}

	set albedoColor(value: Vector4) {
		this._shaderValues.setVector(BillboardMaterial.ALBEDOCOLOR, value);
	}

	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(BillboardMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(BillboardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(BillboardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(BillboardMaterial.ALBEDOTEXTURE, value);
	}

	get tilingOffset(): Vector4 {
		return this._shaderValues.getVector(BillboardMaterial.TILINGOFFSET);
	}

	set tilingOffset(value: Vector4) {
		this._shaderValues.setVector(BillboardMaterial.TILINGOFFSET, value);
	}

	/**
 * 渲染模式。
 */
	set renderMode(value: number) {
		switch (value) {
			case BillboardMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BillboardMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case BillboardMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("BillboardMaterial : renderMode value error.");
		}
	}

	constructor() {
		super();
		this.setShaderName("BILLBOARDMAT");
		this._shaderValues.setVector(BillboardMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(BillboardMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this.renderMode = BillboardMaterial.RENDERMODE_OPAQUE;
	}




}