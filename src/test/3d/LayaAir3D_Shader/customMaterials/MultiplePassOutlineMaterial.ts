import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderDefines } from "laya/d3/shader/ShaderDefines";
import { ShaderPass } from "laya/d3/shader/ShaderPass";
import { SubShader } from "laya/d3/shader/SubShader";
import { BaseTexture } from "laya/resource/BaseTexture";
import OutlineFS from "../customShader/outline.fs";
import OutlineVS from "../customShader/outline.vs";
import Outline02VS from "../customShader/outline02.fs";
import Outline02FS from "../customShader/outline02.vs";

/**
 * ...
 * @author ...
 */
export class MultiplePassOutlineMaterial extends BaseMaterial {
	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static OUTLINECOLOR: number = Shader3D.propertyNameToID("u_OutlineColor");
	static OUTLINEWIDTH: number = Shader3D.propertyNameToID("u_OutlineWidth");
	static OUTLINELIGHTNESS: number = Shader3D.propertyNameToID("u_OutlineLightness");

	static SHADERDEFINE_ALBEDOTEXTURE: number;
	/**@private */
	static shaderDefines: ShaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);

	/**
	 * @private
	 */
	static __init__(): void {
		MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE = MultiplePassOutlineMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
	}
	/**
	 * 获取漫反射贴图。
	 * @return 漫反射贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE);
	}

	/**
	 * 设置漫反射贴图。
	 * @param value 漫反射贴图。
	 */
	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE, value);
	}
	/**
	 * 获取线条颜色
	 * @return 线条颜色
	 */
	get outlineColor(): Vector4 {
		return this._shaderValues.getVector(MultiplePassOutlineMaterial.OUTLINECOLOR);
	}

	set outlineColor(value: Vector4) {
		this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, value);
	}
	/**
	 * 获取轮廓宽度。
	 * @return 轮廓宽度,范围为0到0.05。
	 */
	get outlineWidth(): number {
		return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH);
	}

	/**
	 * 设置轮廓宽度。
	 * @param value 轮廓宽度,范围为0到0.05。
	 */
	set outlineWidth(value: number) {
		value = Math.max(0.0, Math.min(0.05, value));
		this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, value);
	}

	/**
	 * 获取轮廓亮度。
	 * @return 轮廓亮度,范围为0到1。
	 */
	get outlineLightness(): number {
		return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS);
	}

	/**
	 * 设置轮廓亮度。
	 * @param value 轮廓亮度,范围为0到1。
	 */
	set outlineLightness(value: number) {
		value = Math.max(0.0, Math.min(1.0, value));
		this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, value);
	}


	static initShader(): void {
		MultiplePassOutlineMaterial.__init__();
		var attributeMap: any = {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Normal': VertexMesh.MESH_NORMAL0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
		};
		var uniformMap: any = {
			'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
			'u_WorldMat': Shader3D.PERIOD_SPRITE,
			'u_OutlineWidth': Shader3D.PERIOD_MATERIAL,
			'u_OutlineLightness': Shader3D.PERIOD_MATERIAL,
			'u_OutlineColor': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL
		};

		var customShader: Shader3D = Shader3D.add("MultiplePassOutlineShader");
		var subShader: SubShader = new SubShader(attributeMap, uniformMap, MultiplePassOutlineMaterial.shaderDefines);
		customShader.addSubShader(subShader);
		var pass1: ShaderPass = subShader.addShaderPass(OutlineVS, OutlineFS);
		pass1.renderState.cull = RenderState.CULL_FRONT;
		subShader.addShaderPass(Outline02VS, Outline02FS);
	}



	constructor() {
		super();
		this.setShaderName("MultiplePassOutlineShader");
		this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, 0.01581197);
		this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, 1);
		this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, new Vector4(1.0, 1.0, 1.0, 0.0));
	}
}


